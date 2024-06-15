import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeClient } from "pinecone-client";
import { PineconeStore } from "@langchain/pinecone";
import { config } from "process";

export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};
type Metadata = { size: number; tags?: string[] | null };
export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDbClient: PineconeClient<Metadata>;
  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDbClient = new PineconeClient<Metadata>({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  public async vectorSearch(
    recentChatHistory: string,
    companionFileName: string
  ) {
    const pineConeClient = <PineconeClient<Metadata>>this.vectorDbClient;
    const pineconeIndex = pineConeClient.createIndex({
      name: process.env.PINECONE_INDEX! || "",
      environment: process.env.PINECONE_ENVIRONMENT!,
      dimension: 1536,
    });
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY! }),
      { pineconeIndex }
    );
    const similarDocs = await vectorStore
      .similaritySearchWithScore(recentChatHistory, 3, {
        fileName: companionFileName,
      })
      .catch((e) => {
        console.log("Failed to get vector search results");
      });
    return similarDocs;
  }
  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }
  private generateRedisCompanionKey(companionKey: CompanionKey): string {
    return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
  }
  public async writeToHistory(text: string, companionKey: CompanionKey) {
    if (!companionKey || typeof companionKey.userId === "undefined") {
      console.log("COmpanion key set incorrectly");
      return "";
    }
    const key = this.generateRedisCompanionKey(companionKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });
    return result;
  }
  public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    if (!companionKey || typeof companionKey.userId === "undefined") {
      console.log("Companion key set incorrectly");
      return "";
    }
    const key = this.generateRedisCompanionKey(companionKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });
    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join("\n");
    return recentChats;
  }
  public async seedChatHistory(
    seedContent: string,
    delimited: string = "\n",
    companionKey: CompanionKey
  ) {
    const key = this.generateRedisCompanionKey(companionKey);
    if (await this.history.exists(key)) {
      console.log("User already has chat history");
      return;
    }
    const content = seedContent.split(delimited);
    let count = 0;
    for (const line of content) {
      await this.history.zadd(key, {
        score: count,
        member: line,
      });
      count += 1;
    }
  }
}
