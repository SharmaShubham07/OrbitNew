/**
 * Orbit Hybrid Resonance Algorithm
 * Multi-factor ranking engine for personalized feed discovery and circle trending.
 */

export interface UserRankContext {
  userId?: string | null;
  primaryDomainId?: string | null;
  followedDomainIds?: string[];
  userSkills?: string[];
  connectedUserIds?: string[];
}

export interface PostWithRankMeta {
  id: string;
  authorId: string;
  domainId: string;
  content: string;
  templateId?: string | null;
  createdAt: Date | string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  media?: any[];
  poll?: any;
  _count?: {
    reactions?: number;
    comments?: number;
    bookmarks?: number;
  };
  [key: string]: any;
}

/**
 * Computes a relevance resonance score for a given post relative to the active user.
 */
export function calculatePostResonanceScore(
  post: PostWithRankMeta,
  context: UserRankContext
): number {
  const now = Date.now();
  const postCreatedAt = new Date(post.createdAt).getTime();
  const ageInHours = Math.max(0, (now - postCreatedAt) / (1000 * 60 * 60));

  // 1. Recency Decay (Exponential curve with 48h half-life)
  const recencyScore = 100 * Math.exp(-ageInHours / 48);

  // 2. Domain Affinity (Primary circle vs followed circles)
  let domainScore = 0;
  if (context.primaryDomainId && post.domainId === context.primaryDomainId) {
    domainScore = 60; // Strongest alignment: user's primary craft domain
  } else if (context.followedDomainIds && context.followedDomainIds.includes(post.domainId)) {
    domainScore = 35; // Secondary followed domain
  }

  // 3. Social Graph Proximity
  let socialScore = 0;
  if (context.connectedUserIds && context.connectedUserIds.includes(post.authorId)) {
    socialScore = 50; // Direct connection post
  } else if (context.userId && post.authorId === context.userId) {
    socialScore = 15; // Own post
  }

  // 4. Skill Tag Matching
  let skillMatchScore = 0;
  if (context.userSkills && context.userSkills.length > 0) {
    const postContentLower = (post.content || "").toLowerCase();
    for (const skill of context.userSkills) {
      const skillLower = skill.toLowerCase();
      if (
        postContentLower.includes(`#${skillLower}`) ||
        postContentLower.includes(skillLower)
      ) {
        skillMatchScore += 20;
      }
    }
    skillMatchScore = Math.min(60, skillMatchScore); // cap at 60
  }

  // 5. Engagement Velocity (Reactions, comments, shares, poll votes)
  const reactions = post.likeCount || post._count?.reactions || 0;
  const comments = post.commentCount || post._count?.comments || 0;
  const shares = post.shareCount || 0;
  const rawEngagement = reactions + comments * 2 + shares * 3;
  const velocityScore = 25 * Math.log2(1 + rawEngagement);

  // 6. Visual Craft / Template Quality Bonus
  let craftBonus = 0;
  if (post.templateId) {
    craftBonus += 20; // Bespoke post template
  }
  if (post.media && post.media.length > 0) {
    craftBonus += 10;
  }

  const totalScore =
    recencyScore +
    domainScore +
    socialScore +
    skillMatchScore +
    velocityScore +
    craftBonus;

  return totalScore;
}

/**
 * Re-ranks a list of candidate posts using the Orbit Hybrid Resonance Algorithm.
 */
export function rankFeedPosts<T extends PostWithRankMeta>(
  posts: T[],
  context: UserRankContext
): T[] {
  const scoredPosts = posts.map((post) => ({
    post,
    score: calculatePostResonanceScore(post, context),
  }));

  // Sort descending by score
  scoredPosts.sort((a, b) => b.score - a.score);

  return scoredPosts.map((item) => item.post);
}
