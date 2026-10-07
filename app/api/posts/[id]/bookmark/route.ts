import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    });

    let isBookmarked = false;

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      isBookmarked = false;
    } else {
      await prisma.bookmark.create({
        data: {
          postId,
          userId: session.user.id,
        },
      });
      isBookmarked = true;
    }

    return NextResponse.json({ success: true, isBookmarked });
  } catch (error: any) {
    console.error("Bookmark Error:", error);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
