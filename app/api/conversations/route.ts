import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
      },
      orderBy: { lastMessageAt: "desc" },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            primaryDomain: true,
          },
        },
        userB: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            primaryDomain: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const formatted = await Promise.all(
      conversations.map(async (c) => {
        const otherUser = c.userAId === currentUserId ? c.userB : c.userA;
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: currentUserId },
            isRead: false,
          },
        });

        return {
          id: c.id,
          lastMessageAt: c.lastMessageAt,
          otherUser,
          lastMessage: c.messages[0] || null,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ conversations: formatted });
  } catch (error: any) {
    console.error("GET Conversations Error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId || targetUserId === session.user.id) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
    }

    // Check if connected
    const connection = await prisma.connection.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: session.user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: session.user.id },
        ],
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "You can only message users you are connected with." },
        { status: 403 }
      );
    }

    // Find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { userAId: session.user.id, userBId: targetUserId },
          { userAId: targetUserId, userBId: session.user.id },
        ],
      },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            primaryDomain: true,
          },
        },
        userB: {
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
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userAId: session.user.id,
          userBId: targetUserId,
        },
        include: {
          userA: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              headline: true,
              primaryDomain: true,
            },
          },
          userB: {
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
      });
    }

    const otherUser = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        otherUser,
        lastMessageAt: conversation.lastMessageAt,
      },
    });
  } catch (error: any) {
    console.error("Create Conversation Error:", error);
    return NextResponse.json({ error: "Failed to initiate conversation" }, { status: 500 });
  }
}
