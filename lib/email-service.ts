/**
 * Orbit Editorial Email Service
 * Renders magazine-grade HTML emails with the Chainly & Orbit studio aesthetic.
 */

export interface EmailRecipient {
  email: string;
  name: string;
}

export interface DigestPostItem {
  id: string;
  authorName: string;
  authorHeadline?: string;
  content: string;
  templateTitle?: string;
  likes: number;
  comments: number;
}

/**
 * Base Editorial HTML Email Wrapper
 */
function wrapEmailTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F4F0EB;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #18181B;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F4F0EB;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 24px;
      border: 1px solid #E5E0D8;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }
    .header {
      padding: 32px 32px 20px 32px;
      border-bottom: 1px solid #F4F0EB;
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      width: 44px;
      height: 44px;
      line-height: 44px;
      border-radius: 14px;
      background-color: #587CF5;
      color: #FFFFFF;
      font-weight: bold;
      font-size: 20px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-family: Georgia, serif;
      font-size: 24px;
      font-weight: 900;
      color: #18181B;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .issue-tag {
      font-family: monospace;
      font-size: 11px;
      color: #64748B;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 4px;
      font-weight: 600;
    }
    .content {
      padding: 32px;
    }
    .btn-pill {
      display: inline-block;
      background-color: #18181B;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 9999px;
      margin: 20px 0 8px 0;
      text-align: center;
    }
    .footer {
      background-color: #FAF8F5;
      padding: 24px 32px;
      border-top: 1px solid #E5E0D8;
      text-align: center;
      font-size: 11px;
      color: #64748B;
      font-family: monospace;
    }
    .footer a {
      color: #587CF5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">🪐</div>
        <h1 class="brand-title">Orbit</h1>
        <div class="issue-tag">EDITORIAL PROFESSIONAL NETWORK</div>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>ORBIT JOURNAL &middot; ISSUE 14 &middot; HIGH-CRAFT DOMAIN CIRCLES</p>
        <p><a href="http://localhost:3000/settings">Notification Settings</a> &middot; <a href="http://localhost:3000/privacy">Privacy Policy</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Mention Notification Email
 */
export function generateMentionEmail(
  recipientName: string,
  actorName: string,
  postSnippet: string,
  postLink: string
) {
  const content = `
    <div style="margin-bottom: 16px;">
      <span style="font-family: monospace; font-size: 11px; background: #EEF2FF; color: #4338CA; padding: 4px 10px; border-radius: 9999px; font-weight: bold; text-transform: uppercase;">Mention Alert</span>
    </div>
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #18181B; margin-top: 8px;">
      ${actorName} mentioned you in a discussion
    </h2>
    <p style="color: #64748B; font-size: 14px; line-height: 1.6;">
      Hi ${recipientName}, you were tagged in a recent domain post:
    </p>
    <div style="background-color: #F4F0EB; border-left: 3px solid #587CF5; padding: 16px 20px; border-radius: 12px; font-style: italic; color: #18181B; font-size: 14px; margin: 16px 0;">
      "${postSnippet}"
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${postLink}" class="btn-pill">Join Discussion on Orbit &rarr;</a>
    </div>
  `;
  return wrapEmailTemplate("Orbit - You were mentioned in a post", content);
}

/**
 * 2. Connection Acceptance / Request Email
 */
export function generateConnectionEmail(
  recipientName: string,
  senderName: string,
  senderHeadline: string,
  profileLink: string,
  isAccepted: boolean = false
) {
  const title = isAccepted
    ? `${senderName} accepted your connection request`
    : `${senderName} wants to connect with you`;

  const content = `
    <div style="margin-bottom: 16px;">
      <span style="font-family: monospace; font-size: 11px; background: #D1FAE5; color: #065F46; padding: 4px 10px; border-radius: 9999px; font-weight: bold; text-transform: uppercase;">Network Circle</span>
    </div>
    <h2 style="font-family: Georgia, serif; font-size: 20px; color: #18181B; margin-top: 8px;">
      ${title}
    </h2>
    <div style="display: flex; align-items: center; gap: 16px; background: #FAF8F5; border: 1px solid #E5E0D8; border-radius: 16px; padding: 16px; margin: 20px 0;">
      <div>
        <h4 style="margin: 0; font-size: 15px; color: #18181B;">${senderName}</h4>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">${senderHeadline || "Domain Member"}</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${profileLink}" class="btn-pill">View Profile on Orbit &rarr;</a>
    </div>
  `;
  return wrapEmailTemplate(title, content);
}

/**
 * 3. Weekly Domain Circle Digest
 */
export function generateCircleDigestEmail(
  recipientName: string,
  domainName: string,
  domainEmoji: string,
  topPosts: DigestPostItem[],
  newMembersCount: number = 12
) {
  const postsHtml = topPosts
    .map(
      (p, idx) => `
    <div style="padding: 16px 0; border-bottom: 1px solid #E5E0D8;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #587CF5;">0${idx + 1} &middot; ${p.authorName}</span>
        ${p.templateTitle ? `<span style="font-size: 10px; background: #FEF3C7; color: #B45309; padding: 2px 6px; border-radius: 6px; font-family: monospace;">${p.templateTitle}</span>` : ""}
      </div>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #18181B; line-height: 1.5;">
        ${p.content.slice(0, 160)}${p.content.length > 160 ? "..." : ""}
      </p>
      <div style="font-size: 11px; color: #64748B; font-family: monospace;">
        👍 ${p.likes} reactions &middot; 💬 ${p.comments} replies
      </div>
    </div>
  `
    )
    .join("");

  const content = `
    <div style="margin-bottom: 16px;">
      <span style="font-family: monospace; font-size: 11px; background: #F4F0EB; color: #18181B; border: 1px solid #E5E0D8; padding: 4px 10px; border-radius: 9999px; font-weight: bold; text-transform: uppercase;">Weekly Domain Pulse</span>
    </div>
    <h2 style="font-family: Georgia, serif; font-size: 22px; color: #18181B; margin-top: 8px;">
      ${domainEmoji} Top Insights in ${domainName}
    </h2>
    <p style="color: #64748B; font-size: 13px; line-height: 1.6;">
      Hi ${recipientName}, here is your curated weekly digest of top architectures, design reviews, and discussions in your circle.
    </p>
    
    <div style="margin: 20px 0;">
      ${postsHtml}
    </div>

    <div style="background: #F4F0EB; padding: 12px 16px; border-radius: 12px; font-size: 12px; color: #18181B; margin: 16px 0;">
      <strong>+${newMembersCount} new domain peers</strong> joined your circle this week.
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/feed?tab=domain" class="btn-pill">Open Domain Circle Feed &rarr;</a>
    </div>
  `;

  return wrapEmailTemplate(`Orbit Weekly Digest - ${domainName}`, content);
}

/**
 * Dispatch Email to User (via Resend if RESEND_API_KEY present, otherwise logs preview)
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Orbit <digest@orbit.social>",
          to,
          subject,
          html,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (err) {
      console.error("[Email Error] Failed to send via Resend:", err);
      return { success: false, error: err };
    }
  }

  // Fallback dev simulator log
  console.log(`[Email Simulator] Dispatched email to ${to}: "${subject}" (Length: ${html.length} bytes)`);
  return { success: true, simulated: true };
}
