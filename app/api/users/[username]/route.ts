import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        profile: true,
        primaryDomain: true,
        followedDomains: {
          include: { domain: true },
        },
        skills: {
          include: { skill: true },
        },
        experiences: {
          orderBy: { startDate: "desc" },
        },
        educations: {
          orderBy: { startDate: "desc" },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Increment profile views if someone else visits
    if (currentUserId && currentUserId !== user.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { profileViews: { increment: 1 } },
      });
    }

    // Count accepted connections for this user
    const connectionCount = await prisma.connection.count({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
    });

    // Determine connection status with current viewer
    let connectionStatus: "NONE" | "ACCEPTED" | "PENDING_SENT" | "PENDING_RECEIVED" = "NONE";
    let connectionId: string | null = null;
    let mutualConnections: any[] = [];

    if (currentUserId && currentUserId !== user.id) {
      const conn = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: user.id },
            { senderId: user.id, receiverId: currentUserId },
          ],
        },
      });

      if (conn) {
        connectionId = conn.id;
        if (conn.status === "ACCEPTED") connectionStatus = "ACCEPTED";
        else if (conn.senderId === currentUserId) connectionStatus = "PENDING_SENT";
        else connectionStatus = "PENDING_RECEIVED";
      }

      // Compute mutual connections
      // 1. Get current user's connections
      const myConns = await prisma.connection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
      });
      const myConnIds = new Set(
        myConns.map((c) => (c.senderId === currentUserId ? c.receiverId : c.senderId))
      );

      // 2. Get target user's connections
      const theirConns = await prisma.connection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ senderId: user.id }, { receiverId: user.id }],
        },
      });
      const theirConnIds = theirConns.map((c) =>
        c.senderId === user.id ? c.receiverId : c.senderId
      );

      // Intersection
      const mutualIds = theirConnIds.filter((id) => myConnIds.has(id));

      if (mutualIds.length > 0) {
        mutualConnections = await prisma.user.findMany({
          where: { id: { in: mutualIds } },
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
          },
          take: 5,
        });
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        passwordHash: undefined,
        totalConnections: connectionCount,
        connectionStatus,
        connectionId,
        mutualConnections,
        isOwnProfile: currentUserId === user.id,
      },
    });
  } catch (error: any) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user || user.id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      headline,
      bio,
      location,
      website,
      github,
      twitter,
      linkedin,
      avatarImage,
      coverImage,
      about,
      isOpenToWork,
      isHiring,
      primaryDomainId,
      skills,
      experiences,
      educations,
    } = body;

    // Update user base fields
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        headline: headline !== undefined ? headline : undefined,
        bio: bio !== undefined ? bio : undefined,
        location: location !== undefined ? location : undefined,
        website: website !== undefined ? website : undefined,
        github: github !== undefined ? github : undefined,
        twitter: twitter !== undefined ? twitter : undefined,
        linkedin: linkedin !== undefined ? linkedin : undefined,
        image: avatarImage !== undefined ? avatarImage : undefined,
        primaryDomainId: primaryDomainId || undefined,
      },
    });

    // Update profile
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        coverImage: coverImage || null,
        avatarImage: avatarImage || null,
        about: about || bio || null,
        isOpenToWork: isOpenToWork ?? false,
        isHiring: isHiring ?? false,
      },
      update: {
        coverImage: coverImage !== undefined ? coverImage : undefined,
        avatarImage: avatarImage !== undefined ? avatarImage : undefined,
        about: about !== undefined ? about : undefined,
        isOpenToWork: isOpenToWork !== undefined ? isOpenToWork : undefined,
        isHiring: isHiring !== undefined ? isHiring : undefined,
      },
    });

    // Update skills if provided
    if (Array.isArray(skills)) {
      await prisma.profileSkill.deleteMany({
        where: { userId: session.user.id },
      });

      for (const skillName of skills) {
        const clean = skillName.trim();
        if (!clean) continue;

        let skill = await prisma.skill.findUnique({ where: { name: clean } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: clean } });
        }

        await prisma.profileSkill.create({
          data: {
            userId: session.user.id,
            skillId: skill.id,
          },
        });
      }
    }

    // Update experiences if provided
    if (Array.isArray(experiences)) {
      await prisma.experience.deleteMany({
        where: { userId: session.user.id },
      });

      for (const exp of experiences) {
        if (!exp.title || !exp.company) continue;
        await prisma.experience.create({
          data: {
            userId: session.user.id,
            title: exp.title,
            company: exp.company,
            location: exp.location || null,
            startDate: new Date(exp.startDate || Date.now()),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            isCurrent: exp.isCurrent ?? false,
            description: exp.description || null,
          },
        });
      }
    }

    // Update educations if provided
    if (Array.isArray(educations)) {
      await prisma.education.deleteMany({
        where: { userId: session.user.id },
      });

      for (const edu of educations) {
        if (!edu.institution || !edu.degree) continue;
        await prisma.education.create({
          data: {
            userId: session.user.id,
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy || "",
            startDate: new Date(edu.startDate || Date.now()),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            grade: edu.grade || null,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
