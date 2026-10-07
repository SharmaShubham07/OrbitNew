import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email },
              { username: email }
            ]
          },
          include: {
            primaryDomain: true,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
          isOnboarded: user.isOnboarded,
          primaryDomainId: user.primaryDomainId,
          domainName: user.primaryDomain?.name,
          domainColor: user.primaryDomain?.color,
          domainEmoji: user.primaryDomain?.emoji,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.isOnboarded = (user as any).isOnboarded;
        token.primaryDomainId = (user as any).primaryDomainId;
        token.domainName = (user as any).domainName;
        token.domainColor = (user as any).domainColor;
        token.domainEmoji = (user as any).domainEmoji;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).isOnboarded = token.isOnboarded;
        (session.user as any).primaryDomainId = token.primaryDomainId;
        (session.user as any).domainName = token.domainName;
        (session.user as any).domainColor = token.domainColor;
        (session.user as any).domainEmoji = token.domainEmoji;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "orbit-super-secret-jwt-key-for-development-32-chars-long",
});

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      primaryDomain: true,
      skills: {
        include: { skill: true },
      },
    },
  });

  return user;
}
