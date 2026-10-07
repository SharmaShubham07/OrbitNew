import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  headline: z.string().min(2, "Headline is required"),
  bio: z.string().optional(),
  location: z.string().optional(),
  primaryDomainId: z.string().min(1, "Primary domain is required"),
  secondaryDomainIds: z.array(z.string()).optional(),
  skills: z.array(z.string()).min(1, "Please pick or enter at least one skill"),
  avatarImage: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = onboardingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const {
      headline,
      bio,
      location,
      primaryDomainId,
      secondaryDomainIds = [],
      skills,
      avatarImage,
    } = result.data;

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        headline,
        bio: bio || null,
        location: location || null,
        image: avatarImage || session.user.image,
        primaryDomainId,
        isOnboarded: true,
      },
    });

    // Update or create profile
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        avatarImage: avatarImage || null,
        about: bio || null,
      },
      update: {
        avatarImage: avatarImage || undefined,
        about: bio || undefined,
      },
    });

    // Update primary domain member count
    const domCount = await prisma.user.count({
      where: { primaryDomainId },
    });
    await prisma.domain.update({
      where: { id: primaryDomainId },
      data: { memberCount: domCount },
    });

    // Add secondary domains
    if (secondaryDomainIds.length > 0) {
      await prisma.userDomain.deleteMany({
        where: { userId: session.user.id },
      });

      for (const domId of secondaryDomainIds) {
        if (domId !== primaryDomainId) {
          await prisma.userDomain.create({
            data: {
              userId: session.user.id,
              domainId: domId,
            },
          });
        }
      }
    }

    // Attach skills
    await prisma.profileSkill.deleteMany({
      where: { userId: session.user.id },
    });

    for (const skillName of skills) {
      const cleanSkill = skillName.trim();
      if (!cleanSkill) continue;

      let skill = await prisma.skill.findUnique({
        where: { name: cleanSkill },
      });

      if (!skill) {
        skill = await prisma.skill.create({
          data: { name: cleanSkill },
        });
      }

      await prisma.profileSkill.create({
        data: {
          userId: session.user.id,
          skillId: skill.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
