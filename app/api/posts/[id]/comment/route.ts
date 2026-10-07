import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  parentId: z.string().optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            primaryDomain: true,
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                headline: true,
                primaryDomain: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("GET Comments Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = commentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { content, parentId } = result.data;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: session.user.id,
        content,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            primaryDomain: true,
          },
        },
        replies: {
          include: {
            author: true,
          },
        },
      },
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    // Create notification
    const recipientId = parentId ? (await prisma.comment.findUnique({ where: { id: parentId } }))?.authorId : post.authorId;
    if (recipientId && recipientId !== session.user.id) {
      const actor = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });

      await prisma.notification.create({
        data: {
          userId: recipientId,
          actorId: session.user.id,
          type: "COMMENT",
          title: parentId ? "New reply to your comment" : "New comment on your post",
          message: `${actor?.name || "Someone"}: "${content.slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
          link: `/feed?post=${postId}`,
        },
      });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error("Add Comment Error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
