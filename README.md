# 🪐 Orbit – Domain-First Professional Network

Orbit is a modern, high-signal professional social network built around dedicated **Domain Circles** (Software Engineering, Design & UX, Data & AI, Product, Marketing, Finance, Healthcare, Education, Legal, Sales).

---

## ⚡ Quick Start

### 1. Install & Database Setup
```bash
# 1. Install dependencies
npm install

# 2. Run Prisma migrations (creates local SQLite dev.db)
npx prisma migrate dev

# 3. Seed test users, posts, polls, jobs, and conversation
npx prisma db seed

# 4. Start Next.js + Socket.IO custom development server
npm run dev
```

The application will be running at `http://localhost:3000`.

---

## 🔑 Test Login Credentials

| User | Email | Password | Primary Domain | Role |
|---|---|---|---|---|
| **Aarav Sharma** | `aarav@orbit.test` | `Test@1234` | Software Engineering 💻 | Staff Systems Engineer |
| **Meera Patel** | `meera@orbit.test` | `Test@1234` | Design & UX 🎨 | Principal Product Designer |

> **Tip:** The Login page includes a **Quick Demo Login** panel with one-click buttons to instantly log into either account!

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS + Glassmorphism + Space Grotesk & Inter typography
- **ORM & Database**: Prisma ORM with SQLite (PostgreSQL portable)
- **Auth**: Auth.js / NextAuth v5 Credentials Provider + bcrypt hashing + JWT sessions
- **Real-Time Engine**: Custom `server.ts` with **Socket.IO** (live messaging, typing indicators, presence, instant notification toasts)
- **State & Data**: TanStack Query + React Hook Form + Zod
- **Media Uploads**: Local storage in `/public/uploads` with type and 10MB size validation (Images, Videos, PDFs)

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Sign in with Quick Demo one-click buttons
│   │   ├── signup/page.tsx        # Registration
│   │   └── onboarding/page.tsx    # 3-step interactive onboarding wizard
│   ├── (main)/
│   │   ├── layout.tsx             # Protected shell (Rail + Bento + Mobile Nav)
│   │   ├── feed/page.tsx          # Feed (For You / My Domain / Connections)
│   │   ├── in/[username]/page.tsx # Public & private profile views
│   │   ├── domain/[slug]/page.tsx # Domain Circle hubs & member directories
│   │   ├── network/page.tsx       # Network manager & smart suggestions
│   │   ├── messages/page.tsx      # Full-screen real-time chat
│   │   ├── notifications/page.tsx # Activity notifications
│   │   ├── discover/page.tsx      # Global search & discovery
│   │   ├── jobs/page.tsx          # Opportunities & post job
│   │   ├── saved/page.tsx         # Saved bookmarks
│   │   └── settings/page.tsx      # Password, privacy, danger zone
│   ├── api/                       # API route handlers
│   ├── layout.tsx                 # Root layout with Theme & Socket providers
│   └── page.tsx                   # Landing page for unauthenticated visitors
├── components/
│   ├── layout/                    # SidebarRail, RightBento, MobileNav, HeaderMobile
│   ├── feed/                      # PostCard, CreatePostModal, PollCard, PostComments
│   ├── chat/                      # ChatSlideOver, MessagesView
│   ├── profile/                   # ProfileView, EditProfileModal
│   ├── connections/               # NetworkView
│   ├── discover/                  # DiscoverView
│   ├── jobs/                      # JobsView
│   ├── settings/                  # SettingsView
│   ├── landing/                   # LandingView
│   └── providers/                 # SocketProvider, QueryProvider, ThemeProvider
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── prisma.ts                  # Prisma Client singleton
│   ├── socket.ts                  # Socket.IO client factory
│   ├── constants.ts               # Domain definitions & skill catalogues
│   └── utils.ts                   # Date, formatters, and class helpers
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Seed script with realistic domain data
└── server.ts                      # Custom HTTP server with Socket.IO
```

---

## 🌟 Key Features

1. **Domain-First Architecture**: Every user is anchored to a primary domain (e.g. Software Engineering, Design, AI) with custom emoji badges, tailored feed tabs, and dedicated member circles.
2. **Smart Connections Engine**: Calculates mutual connections, shared skill overlaps, and domain proximity to suggest high-value peers.
3. **Real-Time Direct Chat**: Connected users can chat in real time with typing indicators, online status dots, image attachments, and PDF previews.
4. **Docked Slide-Over Drawer**: Floating chat drawer available across all pages without losing feed context.
5. **Interactive Polls & Rich Media**: Create and vote on live polls with animated vote tallies, attach documents or videos with 10MB limits.
6. **Custom Reactions**: React with 👍 (Like), 💡 (Insightful), 🔥 (Fire), or 👏 (Celebrate) with instant counts and toasts.
7. **Complete Dark/Light Modes & Mobile Navigation**: Tailored for mobile screens (375px+) with a bottom tab bar and responsive rails.
