import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotificationToUser } from "@/lib/push-service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { primaryDomain: true },
    });

    const result = await sendPushNotificationToUser(session.user.id, {
      title: "🪐 Orbit Circle Alert",
      body: `Hey ${user?.name || "there"}! Your circle ${user?.primaryDomain?.name || "Community"} has 3 new trending architecture insights.`,
      url: "/feed?tab=domain",
      data: {
        type: "TRENDING_DIGEST",
        timestamp: Date.now(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test push notification dispatched successfully",
      result,
    });
  } catch (error: any) {
    console.error("Test Push Error:", error);
    return NextResponse.json({ error: "Failed to dispatch test notification" }, { status: 500 });
  }
}
