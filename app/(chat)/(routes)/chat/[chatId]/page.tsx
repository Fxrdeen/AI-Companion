import ChatClient from "@/components/ChatClient";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ChatIdPageProps {
  params: { chatId: string };
}
const ChatIdPage = async ({ params: { chatId } }: ChatIdPageProps) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const companion = await prismadb.companion.findUnique({
    where: {
      id: chatId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        where: {
          userId: userId,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });
  if (!companion) {
    return redirect("/");
  }
  return <ChatClient companion={companion} />;
};

export default ChatIdPage;
