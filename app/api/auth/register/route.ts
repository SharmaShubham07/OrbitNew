import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { name, email, username, password } = result.data;
    const lowerEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // Check if email or username is taken
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: lowerEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      if (existing.email === lowerEmail) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: lowerEmail,
        username: cleanUsername,
        passwordHash,
        isOnboarded: false,
        profile: {
          create: {
            about: `Hello! I'm ${name}. Excited to be on Orbit.`,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: { id: user.id, name: user.name, email: user.email, username: user.username },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
