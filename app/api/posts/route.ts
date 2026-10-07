import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPostSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty"),
  domainId: z.string().min(1, "Domain is required"),
  postType: z.enum(["POST", "POLL", "ARTICLE"]).default("POST"),
  media: z
    .array(
      z.object({
        url: z.string(),
        type: z.string(),
        name: z.string().optional(),
        size: z.number().optional(),
      })
    )
    .optional(),
  poll: z
    .object({
      question: z.string().min(3),
      options: z.array(z.string().min(1)).min(2, "Poll must have at least 2 options"),
      durationDays: z.number().default(3),
    })
    .optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "foryou"; // "foryou", "domain", "connections", "saved"
    const domainId = searchParams.get("domainId");
    const username = searchParams.get("username");
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");

    const whereClause: any = {};

    if (username) {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return NextResponse.json({ posts: [], nextCursor: null });
      whereClause.authorId = user.id;
    } else if (domainId) {
      whereClause.domainId = domainId;
    } else if (tag) {
      whereClause.content = { contains: `#${tag}` };
    } else if (tab === "connections" && currentUserId) {
      // Find all accepted connection IDs
      const connections = await prisma.connection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
      });

      const connectedUserIds = connections.map((c) =>
        c.senderId === currentUserId ? c.receiverId : c.senderId
      );
      connectedUserIds.push(currentUserId); // include own

      whereClause.authorId = { in: connectedUserIds };
    } else if (tab === "domain" && currentUserId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { followedDomains: true },
      });

      const domainIds = [
        currentUser?.primaryDomainId,
        ...(currentUser?.followedDomains.map((d) => d.domainId) || []),
      ].filter(Boolean) as string[];

      if (domainIds.length > 0) {
        whereClause.domainId = { in: domainIds };
      }
    } else if (tab === "saved" && currentUserId) {
      whereClause.bookmarks = {
        some: { userId: currentUserId },
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            headline: true,
            primaryDomain: {
              select: {
                id: true,
                name: true,
                slug: true,
                emoji: true,
                color: true,
              },
            },
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
        media: true,
        poll: {
          include: {
            options: {
              include: {
                votes: currentUserId ? { where: { userId: currentUserId } } : false,
              },
            },
          },
        },
        reactions: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { type: true },
            }
          : false,
        bookmarks: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
        _count: {
          select: {
            comments: true,
            reactions: true,
            bookmarks: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id || null;
    }

    // Format post items for response
    const formattedPosts = posts.map((post) => {
      const userReaction = post.reactions && post.reactions.length > 0 ? post.reactions[0].type : null;
      const isBookmarked = post.bookmarks && post.bookmarks.length > 0;

      let userVoteOptionId: string | null = null;
      if (post.poll && currentUserId) {
        for (const opt of post.poll.options) {
          if (opt.votes && opt.votes.length > 0) {
            userVoteOptionId = opt.id;
            break;
          }
        }
      }

      return {
        ...post,
        userReaction,
        isBookmarked,
        poll: post.poll
          ? {
              id: post.poll.id,
              question: post.poll.question,
              expiresAt: post.poll.expiresAt,
              isExpired: new Date(post.poll.expiresAt) < new Date(),
              userVotedOptionId: userVoteOptionId,
              totalVotes: post.poll.options.reduce((sum, opt) => sum + opt.voteCount, 0),
              options: post.poll.options.map((opt) => ({
                id: opt.id,
                text: opt.text,
                voteCount: opt.voteCount,
              })),
            }
          : null,
      };
    });

    return NextResponse.json({ posts: formattedPosts, nextCursor });
  } catch (error: any) {
    console.error("GET Posts Error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createPostSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { content, domainId, postType, media, poll } = result.data;

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        domainId,
        content,
        postType,
        media:
          media && media.length > 0
            ? {
                create: media.map((m) => ({
                  url: m.url,
                  type: m.type,
                  name: m.name,
                  size: m.size,
                })),
              }
            : undefined,
        poll:
          postType === "POLL" && poll
            ? {
                create: {
                  question: poll.question,
                  expiresAt: new Date(Date.now() + (poll.durationDays || 3) * 86400000),
                  options: {
                    create: poll.options.map((optText) => ({
                      text: optText,
                      voteCount: 0,
                    })),
                  },
                },
              }
            : undefined,
      },
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
        poll: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("Create Post Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
