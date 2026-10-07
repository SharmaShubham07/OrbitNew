import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      settings: {
        email: user.email,
        username: user.username,
        isPrivate: user.profile?.isPrivate ?? false,
        isOpenToWork: user.profile?.isOpenToWork ?? false,
        isHiring: user.profile?.isHiring ?? false,
        notifyOnLike: user.profile?.notifyOnLike ?? true,
        notifyOnComment: user.profile?.notifyOnComment ?? true,
        notifyOnConnect: user.profile?.notifyOnConnect ?? true,
        notifyOnMessage: user.profile?.notifyOnMessage ?? true,
      },
    });
  } catch (error: any) {
    console.error("GET Settings Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      currentPassword,
      newPassword,
      isPrivate,
      isOpenToWork,
      isHiring,
      notifyOnLike,
      notifyOnComment,
      notifyOnConnect,
      notifyOnMessage,
    } = body;

    // Handle Password Change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash },
      });
    }

    // Update Profile preferences
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        isPrivate: isPrivate ?? false,
        isOpenToWork: isOpenToWork ?? false,
        isHiring: isHiring ?? false,
        notifyOnLike: notifyOnLike ?? true,
        notifyOnComment: notifyOnComment ?? true,
        notifyOnConnect: notifyOnConnect ?? true,
        notifyOnMessage: notifyOnMessage ?? true,
      },
      update: {
        isPrivate: isPrivate !== undefined ? isPrivate : undefined,
        isOpenToWork: isOpenToWork !== undefined ? isOpenToWork : undefined,
        isHiring: isHiring !== undefined ? isHiring : undefined,
        notifyOnLike: notifyOnLike !== undefined ? notifyOnLike : undefined,
        notifyOnComment: notifyOnComment !== undefined ? notifyOnComment : undefined,
        notifyOnConnect: notifyOnConnect !== undefined ? notifyOnConnect : undefined,
        notifyOnMessage: notifyOnMessage !== undefined ? notifyOnMessage : undefined,
      },
    });

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error: any) {
    console.error("PUT Settings Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { confirmation } = await req.json();
    if (confirmation !== "DELETE") {
      return NextResponse.json({ error: "Please type DELETE to confirm account removal" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (error: any) {
    console.error("DELETE Account Error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
