import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json(); // "ACCEPT", "DECLINE", "WITHDRAW"
    if (!["ACCEPT", "DECLINE", "WITHDRAW"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const connection = await prisma.connection.findUnique({
      where: { id },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection request not found" }, { status: 404 });
    }

    if (action === "ACCEPT") {
      if (connection.receiverId !== session.user.id) {
        return NextResponse.json({ error: "Only the recipient can accept a connection request" }, { status: 403 });
      }

      const updated = await prisma.connection.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });

      // Notify the sender that request was accepted
      const receiver = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, username: true },
      });

      await prisma.notification.create({
        data: {
          userId: connection.senderId,
          actorId: session.user.id,
          type: "CONNECT_ACCEPT",
          title: "Connection accepted",
          message: `${receiver?.name || "Someone"} accepted your connection request!`,
          link: `/in/${receiver?.username}`,
        },
      });

      return NextResponse.json({ connection: updated });
    }

    if (action === "DECLINE") {
      if (connection.receiverId !== session.user.id) {
        return NextResponse.json({ error: "Only the recipient can decline a connection request" }, { status: 403 });
      }

      const updated = await prisma.connection.update({
        where: { id },
        data: { status: "DECLINED" },
      });

      return NextResponse.json({ connection: updated });
    }

    if (action === "WITHDRAW") {
      if (connection.senderId !== session.user.id) {
        return NextResponse.json({ error: "Only the sender can withdraw a connection request" }, { status: 403 });
      }

      await prisma.connection.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  } catch (error: any) {
    console.error("Connection Action Error:", error);
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connection = await prisma.connection.findUnique({
      where: { id },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (connection.senderId !== session.user.id && connection.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.connection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Connection Error:", error);
    return NextResponse.json({ error: "Failed to remove connection" }, { status: 500 });
  }
}
