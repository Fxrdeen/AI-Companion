import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { companionId: string } }
) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body;
    if (!params.companionId) {
      return new NextResponse("Missing companionId", { status: 400 });
    }
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
    const companion = await prismadb.companion.update({
      where: {
        id: params.companionId,
        userId: user.id,
      },
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
    console.log("[companion edit] error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { companionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!params.companionId) {
      return new NextResponse("Missing companionId", { status: 400 });
    }
    const companion = await prismadb.companion.delete({
      where: {
        userId,
        id: params.companionId,
      },
    });
    return NextResponse.json(companion);
  } catch (error) {
    console.log("[companion delete] error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
