import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    // Verify user is in this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.userAId !== session.user.id && conversation.userBId !== session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Mark unread messages from other user as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("GET Messages Error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { conversationId, content, fileUrl, fileName, fileType } = result.data;

    if (!content?.trim() && !fileUrl) {
      return NextResponse.json({ error: "Message must contain text or an attachment" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.userAId !== session.user.id && conversation.userBId !== session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const recipientId = conversation.userAId === session.user.id ? conversation.userBId : conversation.userAId;

    // Check connection is still accepted
    const connection = await prisma.connection.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: session.user.id, receiverId: recipientId },
          { senderId: recipientId, receiverId: session.user.id },
        ],
      },
    });

    if (!connection) {
      return NextResponse.json({ error: "You can only message active connections" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: content?.trim() || (fileName ? `Sent an attachment: ${fileName}` : "Sent an attachment"),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || null,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Create notification
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: recipientId,
        actorId: session.user.id,
        type: "MESSAGE",
        title: `Message from ${sender?.name || "a connection"}`,
        message: message.content.slice(0, 100),
        link: `/messages?conversationId=${conversationId}`,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    console.error("POST Message Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
