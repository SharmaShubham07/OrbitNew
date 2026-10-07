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

    const { optionId } = await req.json();
    if (!optionId) {
      return NextResponse.json({ error: "Option ID is required" }, { status: 400 });
    }

    const poll = await prisma.poll.findUnique({
      where: { postId },
      include: {
        options: true,
      },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (new Date(poll.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Poll has expired" }, { status: 400 });
    }

    // Check if user already voted in this poll
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        userId: session.user.id,
        option: {
          pollId: poll.id,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted in this poll" }, { status: 400 });
    }

    // Create vote and increment option count
    await prisma.$transaction([
      prisma.pollVote.create({
        data: {
          userId: session.user.id,
          optionId,
        },
      }),
      prisma.pollOption.update({
        where: { id: optionId },
        data: { voteCount: { increment: 1 } },
      }),
    ]);

    // Fetch updated poll
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: poll.id },
      include: {
        options: true,
      },
    });

    return NextResponse.json({
      success: true,
      poll: {
        id: updatedPoll?.id,
        question: updatedPoll?.question,
        expiresAt: updatedPoll?.expiresAt,
        isExpired: false,
        userVotedOptionId: optionId,
        totalVotes: updatedPoll?.options.reduce((sum, opt) => sum + opt.voteCount, 0),
        options: updatedPoll?.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          voteCount: opt.voteCount,
        })),
      },
    });
  } catch (error: any) {
    console.error("Poll Vote Error:", error);
    return NextResponse.json({ error: "Failed to submit poll vote" }, { status: 500 });
  }
}
