import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body;
    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !categoryId ||
      !seed
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const companion = await prismadb.companion.create({
      data: {
        src,
        name,
        description,
        instructions,
        seed,
        userId: user.id,
        categoryId,
        userName: user.firstName,
      },
    });
    return NextResponse.json(companion);
  } catch (error) {
    console.log("[companion] error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
