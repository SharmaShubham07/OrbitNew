import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().min(2, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  domainId: z.string().min(1, "Domain is required"),
  location: z.string().min(1, "Location is required"),
  workplace: z.enum(["REMOTE", "HYBRID", "ON_SITE"]).default("REMOTE"),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]).default("FULL_TIME"),
  salaryRange: z.string().optional(),
  description: z.string().min(10, "Job description must be at least 10 characters"),
  requirements: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get("domainId");
    const workplace = searchParams.get("workplace");
    const jobType = searchParams.get("jobType");
    const q = searchParams.get("q");

    const whereClause: any = { isActive: true };

    if (domainId && domainId !== "all") {
      whereClause.domainId = domainId;
    }
    if (workplace && workplace !== "all") {
      whereClause.workplace = workplace;
    }
    if (jobType && jobType !== "all") {
      whereClause.jobType = jobType;
    }
    if (q) {
      whereClause.OR = [
        { title: { contains: q } },
        { company: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
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
        domain: {
          select: {
            id: true,
            name: true,
            slug: true,
            emoji: true,
            color: true,
          },
        },
        applications: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true, status: true, createdAt: true },
            }
          : false,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    const formatted = jobs.map((job) => ({
      ...job,
      hasApplied: job.applications && job.applications.length > 0,
      userApplication: job.applications && job.applications.length > 0 ? job.applications[0] : null,
    }));

    return NextResponse.json({ jobs: formatted });
  } catch (error: any) {
    console.error("GET Jobs Error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createJobSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        posterId: session.user.id,
        ...result.data,
      },
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
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    console.error("Create Job Error:", error);
    return NextResponse.json({ error: "Failed to post job" }, { status: 500 });
  }
}
