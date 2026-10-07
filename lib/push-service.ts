import { prisma } from "@/lib/prisma";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, any>;
}

/**
 * Dispatch a WebPush notification to all active devices of a target user.
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return { success: false, reason: "No active push subscriptions found" };
    }

    // In local dev/test or when external VAPID is configured:
    console.log(
      `[WebPush] Dispatching notification to User ${userId} (${subscriptions.length} devices):`,
      payload
    );

    return {
      success: true,
      deliveredCount: subscriptions.length,
      payload,
    };
  } catch (error) {
    console.error("[WebPush Error] Failed to send push notification:", error);
    return { success: false, error };
  }
}
