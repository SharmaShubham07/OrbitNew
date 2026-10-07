import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    const post = await prisma.post.findUnique({
      where: { id },
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
        domain: true,
        media: true,
        poll: {
          include: {
            options: {
              include: {
                votes: currentUserId ? { where: { userId: currentUserId } } : false,
              },
            },
          },
        },
        reactions: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { type: true },
            }
          : false,
        bookmarks: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
        _count: {
          select: {
            comments: true,
            reactions: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userReaction = post.reactions && post.reactions.length > 0 ? post.reactions[0].type : null;
    const isBookmarked = post.bookmarks && post.bookmarks.length > 0;

    let userVoteOptionId: string | null = null;
    if (post.poll && currentUserId) {
      for (const opt of post.poll.options) {
        if (opt.votes && opt.votes.length > 0) {
          userVoteOptionId = opt.id;
          break;
        }
      }
    }

    const formatted = {
      ...post,
      userReaction,
      isBookmarked,
      poll: post.poll
        ? {
            id: post.poll.id,
            question: post.poll.question,
            expiresAt: post.poll.expiresAt,
            isExpired: new Date(post.poll.expiresAt) < new Date(),
            userVotedOptionId: userVoteOptionId,
            totalVotes: post.poll.options.reduce((sum, opt) => sum + opt.voteCount, 0),
            options: post.poll.options.map((opt) => ({
              id: opt.id,
              text: opt.text,
              voteCount: opt.voteCount,
            })),
          }
        : null,
    };

    return NextResponse.json({ post: formatted });
  } catch (error: any) {
    console.error("GET Single Post Error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You can only edit your own posts" }, { status: 403 });
    }

    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: { content },
    });

    return NextResponse.json({ post: updated });
  } catch (error: any) {
    console.error("Update Post Error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own posts" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Post Error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
