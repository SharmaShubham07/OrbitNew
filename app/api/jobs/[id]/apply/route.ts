import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { note, resumeUrl } = await req.json();

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { posterId: true, title: true, company: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job opportunity not found" }, { status: 404 });
    }

    // Check if already applied
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        userId: session.user.id,
        note: note || null,
        resumeUrl: resumeUrl || null,
        status: "SUBMITTED",
      },
    });

    // Notify job poster
    if (job.posterId !== session.user.id) {
      const applicant = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });

      await prisma.notification.create({
        data: {
          userId: job.posterId,
          actorId: session.user.id,
          type: "CONNECT_REQUEST",
          title: "New job application",
          message: `${applicant?.name || "Someone"} applied for your "${job.title}" role at ${job.company}.`,
          link: `/jobs`,
        },
      });
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: any) {
    console.error("Job Application Error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
