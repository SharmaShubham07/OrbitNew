import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const domainId = searchParams.get("domainId");
    const skill = searchParams.get("skill");
    const location = searchParams.get("location");
    const category = searchParams.get("category") || "all"; // "all", "people", "posts", "domains", "jobs"

    let users: any[] = [];
    let posts: any[] = [];
    let domains: any[] = [];
    let jobs: any[] = [];

    // Search Domains
    if (category === "all" || category === "domains") {
      domains = await prisma.domain.findMany({
        where: q
          ? {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
                { slug: { contains: q } },
              ],
            }
          : undefined,
        orderBy: { memberCount: "desc" },
        take: 10,
      });
    }

    // Search Users / People
    if (category === "all" || category === "people") {
      const userWhere: any = {
        isOnboarded: true,
      };

      if (q) {
        userWhere.OR = [
          { name: { contains: q } },
          { username: { contains: q } },
          { headline: { contains: q } },
          { bio: { contains: q } },
        ];
      }

      if (domainId && domainId !== "all") {
        userWhere.primaryDomainId = domainId;
      }

      if (location) {
        userWhere.location = { contains: location };
      }

      if (skill) {
        userWhere.skills = {
          some: {
            skill: {
              name: { contains: skill },
            },
          },
        };
      }

      users = await prisma.user.findMany({
        where: userWhere,
        take: 20,
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          headline: true,
          location: true,
          primaryDomain: true,
          skills: {
            include: { skill: true },
          },
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });
    }

    // Search Posts
    if (category === "all" || category === "posts") {
      const postWhere: any = {};

      if (q) {
        postWhere.content = { contains: q };
      }

      if (domainId && domainId !== "all") {
        postWhere.domainId = domainId;
      }

      posts = await prisma.post.findMany({
        where: postWhere,
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              headline: true,
              primaryDomain: true,
            },
          },
          domain: true,
          media: true,
          _count: {
            select: {
              comments: true,
              reactions: true,
              bookmarks: true,
            },
          },
        },
      });
    }

    // Search Jobs
    if (category === "all" || category === "jobs") {
      const jobWhere: any = { isActive: true };

      if (q) {
        jobWhere.OR = [
          { title: { contains: q } },
          { company: { contains: q } },
          { description: { contains: q } },
        ];
      }

      if (domainId && domainId !== "all") {
        jobWhere.domainId = domainId;
      }

      if (location) {
        jobWhere.location = { contains: location };
      }

      jobs = await prisma.job.findMany({
        where: jobWhere,
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          poster: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          domain: true,
          _count: {
            select: {
              applications: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      results: {
        users,
        posts,
        domains,
        jobs,
      },
    });
  } catch (error: any) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
