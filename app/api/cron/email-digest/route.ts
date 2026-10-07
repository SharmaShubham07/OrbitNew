import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCircleDigestEmail, sendEmail } from "@/lib/email-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    // Fetch users (either target user or sample of onboarded users)
    const users = await prisma.user.findMany({
      where: targetUserId
        ? { id: targetUserId }
        : { isOnboarded: true },
      take: 10,
      include: {
        primaryDomain: true,
      },
    });

    const results = [];

    for (const user of users) {
      if (!user.primaryDomainId || !user.primaryDomain) continue;

      // Fetch top 3 most-engaged posts in user's domain from the last 7 days
      const topPosts = await prisma.post.findMany({
        where: {
          domainId: user.primaryDomainId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: [{ likeCount: "desc" }, { commentCount: "desc" }],
        take: 3,
        include: {
          author: { select: { name: true, headline: true } },
        },
      });

      const digestItems = topPosts.map((p) => ({
        id: p.id,
        authorName: p.author.name,
        authorHeadline: p.author.headline || undefined,
        content: p.content,
        templateTitle: p.templateId || undefined,
        likes: p.likeCount,
        comments: p.commentCount,
      }));

      const emailHtml = generateCircleDigestEmail(
        user.name,
        user.primaryDomain.name,
        user.primaryDomain.emoji,
        digestItems,
        8
      );

      const dispatchResult = await sendEmail({
        to: user.email,
        subject: `🪐 Orbit Weekly: Top ${user.primaryDomain.name} Insights`,
        html: emailHtml,
      });

      results.push({
        userId: user.id,
        email: user.email,
        domain: user.primaryDomain.name,
        postsCount: digestItems.length,
        status: dispatchResult.success ? "sent" : "failed",
      });
    }

    return NextResponse.json({
      success: true,
      processedUsersCount: results.length,
      digests: results,
    });
  } catch (error: any) {
    console.error("Digest Cron Error:", error);
    return NextResponse.json({ error: "Failed to generate digests" }, { status: 500 });
  }
}
