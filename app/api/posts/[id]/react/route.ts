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

    const { type } = await req.json(); // "LIKE", "INSIGHTFUL", "FIRE", "CELEBRATE"
    const validTypes = ["LIKE", "INSIGHTFUL", "FIRE", "CELEBRATE"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    });

    let currentReaction: string | null = null;

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Toggle off
        await prisma.reaction.delete({
          where: { id: existingReaction.id },
        });
        await prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        });
        currentReaction = null;
      } else {
        // Switch reaction type
        await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });
        currentReaction = type;
      }
    } else {
      // Create new reaction
      await prisma.reaction.create({
        data: {
          postId,
          userId: session.user.id,
          type,
        },
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
      currentReaction = type;

      // Trigger notification if reacting to someone else's post
      if (post.authorId !== session.user.id) {
        const actor = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true },
        });

        await prisma.notification.create({
          data: {
            userId: post.authorId,
            actorId: session.user.id,
            type: "LIKE",
            title: "New reaction on your post",
            message: `${actor?.name || "Someone"} reacted to your post.`,
            link: `/feed?post=${postId}`,
          },
        });
      }
    }

    const count = await prisma.reaction.count({
      where: { postId },
    });

    return NextResponse.json({
      success: true,
      currentReaction,
      reactionCount: count,
    });
  } catch (error: any) {
    console.error("React Error:", error);
    return NextResponse.json({ error: "Failed to process reaction" }, { status: 500 });
  }
}
