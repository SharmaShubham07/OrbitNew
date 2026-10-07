import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // "accepted", "pending", "suggestions", "all"

    // Fetch accepted connections
    const acceptedConnections = await prisma.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            location: true,
            primaryDomain: true,
            skills: { include: { skill: true } },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            location: true,
            primaryDomain: true,
            skills: { include: { skill: true } },
          },
        },
      },
    });

    const connectedUsers = acceptedConnections.map((c) => {
      const otherUser = c.senderId === currentUserId ? c.receiver : c.sender;
      return {
        connectionId: c.id,
        connectedAt: c.updatedAt,
        user: otherUser,
      };
    });

    // Fetch incoming pending requests
    const incomingPending = await prisma.connection.findMany({
      where: {
        receiverId: currentUserId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            location: true,
            primaryDomain: true,
          },
        },
      },
    });

    // Fetch outgoing pending requests
    const outgoingPending = await prisma.connection.findMany({
      where: {
        senderId: currentUserId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            location: true,
            primaryDomain: true,
          },
        },
      },
    });

    // Suggestions: Users not yet connected or pending
    const existingConnectionUserIds = new Set<string>();
    existingConnectionUserIds.add(currentUserId);

    for (const c of acceptedConnections) {
      existingConnectionUserIds.add(c.senderId);
      existingConnectionUserIds.add(c.receiverId);
    }
    for (const p of incomingPending) existingConnectionUserIds.add(p.senderId);
    for (const p of outgoingPending) existingConnectionUserIds.add(p.receiverId);

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        primaryDomain: true,
        skills: { include: { skill: true } },
      },
    });

    const userSkillIds = new Set(currentUser?.skills.map((s) => s.skillId) || []);

    // Fetch candidate users
    const candidateUsers = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(existingConnectionUserIds) },
        isOnboarded: true,
      },
      take: 20,
      include: {
        primaryDomain: true,
        skills: { include: { skill: true } },
      },
    });

    // Calculate smart suggestion scores
    const suggestions = candidateUsers.map((candidate) => {
      let mutualScore = 0;
      const sameDomain = candidate.primaryDomainId === currentUser?.primaryDomainId;
      const sharedSkillsCount = candidate.skills.filter((s) => userSkillIds.has(s.skillId)).length;

      if (sameDomain) mutualScore += 5;
      mutualScore += sharedSkillsCount * 2;

      return {
        user: {
          id: candidate.id,
          name: candidate.name,
          username: candidate.username,
          image: candidate.image,
          headline: candidate.headline,
          location: candidate.location,
          primaryDomain: candidate.primaryDomain,
          skills: candidate.skills,
        },
        sameDomain,
        sharedSkillsCount,
        score: mutualScore,
      };
    });

    // Sort by score descending
    suggestions.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      connections: connectedUsers,
      totalConnections: connectedUsers.length,
      incomingPending: incomingPending.map((p) => ({
        id: p.id,
        createdAt: p.createdAt,
        user: p.sender,
      })),
      outgoingPending: outgoingPending.map((p) => ({
        id: p.id,
        createdAt: p.createdAt,
        user: p.receiver,
      })),
      suggestions: suggestions.slice(0, 8),
      domainSuggestions: suggestions.filter((s) => s.sameDomain).slice(0, 6),
    });
  } catch (error: any) {
    console.error("GET Connections Error:", error);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
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

    // Check existing
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: session.user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return NextResponse.json({ error: "Already connected" }, { status: 400 });
      }
      if (existing.status === "PENDING") {
        return NextResponse.json({ error: "Connection request already pending" }, { status: 400 });
      }
      // If DECLINED, reset to PENDING
      const updated = await prisma.connection.update({
        where: { id: existing.id },
        data: {
          senderId: session.user.id,
          receiverId: targetUserId,
          status: "PENDING",
        },
      });
      return NextResponse.json({ connection: updated });
    }

    const connection = await prisma.connection.create({
      data: {
        senderId: session.user.id,
        receiverId: targetUserId,
        status: "PENDING",
      },
    });

    // Create notification
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        actorId: session.user.id,
        type: "CONNECT_REQUEST",
        title: "New connection request",
        message: `${sender?.name || "Someone"} sent you a connection request.`,
        link: `/network`,
      },
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error: any) {
    console.error("POST Connection Error:", error);
    return NextResponse.json({ error: "Failed to send connection request" }, { status: 500 });
  }
}
