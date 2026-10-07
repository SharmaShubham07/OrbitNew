import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DOMAINS_DATA = [
  {
    id: "dom-swe",
    name: "Software Engineering",
    slug: "software-engineering",
    emoji: "💻",
    color: "#06b6d4",
    bgGradient: "from-cyan-500/20 via-blue-600/10 to-transparent",
    description: "Full-stack, distributed systems, web architectures, and clean code craftsmanship.",
  },
  {
    id: "dom-design",
    name: "Design & UX",
    slug: "design-ux",
    emoji: "🎨",
    color: "#a855f7",
    bgGradient: "from-purple-500/20 via-pink-600/10 to-transparent",
    description: "Product design, UI/UX research, visual storytelling, design systems, and motion.",
  },
  {
    id: "dom-ai-data",
    name: "Data & AI",
    slug: "data-ai",
    emoji: "🧠",
    color: "#f59e0b",
    bgGradient: "from-amber-500/20 via-orange-600/10 to-transparent",
    description: "Machine learning, LLMs, neural models, data engineering, and analytics intelligence.",
  },
  {
    id: "dom-product",
    name: "Product Management",
    slug: "product-management",
    emoji: "🚀",
    color: "#6366f1",
    bgGradient: "from-indigo-500/20 via-sky-600/10 to-transparent",
    description: "Roadmaps, product strategy, discovery, growth experiments, and user delight.",
  },
  {
    id: "dom-marketing",
    name: "Marketing & Growth",
    slug: "marketing-growth",
    emoji: "📈",
    color: "#ec4899",
    bgGradient: "from-pink-500/20 via-rose-600/10 to-transparent",
    description: "Brand building, demand gen, performance marketing, content engines, and community.",
  },
  {
    id: "dom-finance",
    name: "Finance & Fintech",
    slug: "finance-fintech",
    emoji: "💰",
    color: "#10b981",
    bgGradient: "from-emerald-500/20 via-teal-600/10 to-transparent",
    description: "Venture capital, DeFi, equity research, financial modeling, and CFO operations.",
  },
  {
    id: "dom-healthcare",
    name: "Healthcare & Biotech",
    slug: "healthcare-biotech",
    emoji: "🧬",
    color: "#14b8a6",
    bgGradient: "from-teal-500/20 via-cyan-600/10 to-transparent",
    description: "Clinical research, genomics, digital health therapeutics, and biotech innovations.",
  },
  {
    id: "dom-education",
    name: "Education & EdTech",
    slug: "education-edtech",
    emoji: "📚",
    color: "#eab308",
    bgGradient: "from-yellow-500/20 via-amber-600/10 to-transparent",
    description: "Pedagogy, learning platforms, academic research, mentorship, and curriculum design.",
  },
  {
    id: "dom-legal",
    name: "Legal & Compliance",
    slug: "legal-compliance",
    emoji: "⚖️",
    color: "#64748b",
    bgGradient: "from-slate-500/20 via-gray-600/10 to-transparent",
    description: "IP law, corporate governance, contract tech, regulatory affairs, and privacy.",
  },
  {
    id: "dom-sales",
    name: "Sales & Partnerships",
    slug: "sales-partnerships",
    emoji: "🤝",
    color: "#f97316",
    bgGradient: "from-orange-500/20 via-red-600/10 to-transparent",
    description: "Enterprise sales, strategic partnerships, customer success, and revenue operations.",
  },
];

const SKILLS_DATA = [
  { name: "TypeScript", category: "Software Engineering" },
  { name: "React", category: "Software Engineering" },
  { name: "Next.js", category: "Software Engineering" },
  { name: "Node.js", category: "Software Engineering" },
  { name: "Rust", category: "Software Engineering" },
  { name: "Python", category: "Data & AI" },
  { name: "GraphQL", category: "Software Engineering" },
  { name: "Docker", category: "Software Engineering" },
  { name: "Figma", category: "Design & UX" },
  { name: "UI/UX Design", category: "Design & UX" },
  { name: "Design Systems", category: "Design & UX" },
  { name: "User Research", category: "Design & UX" },
  { name: "Prototyping", category: "Design & UX" },
  { name: "PyTorch", category: "Data & AI" },
  { name: "LLM Fine-tuning", category: "Data & AI" },
  { name: "Data Engineering", category: "Data & AI" },
  { name: "Product Strategy", category: "Product Management" },
  { name: "Agile Leadership", category: "Product Management" },
  { name: "Growth Hacking", category: "Marketing & Growth" },
  { name: "Content Strategy", category: "Marketing & Growth" },
  { name: "Financial Modeling", category: "Finance & Fintech" },
  { name: "Venture Capital", category: "Finance & Fintech" },
  { name: "Bioinformatics", category: "Healthcare & Biotech" },
  { name: "Clinical Data", category: "Healthcare & Biotech" },
  { name: "Curriculum Design", category: "Education & EdTech" },
  { name: "IP & Patents", category: "Legal & Compliance" },
  { name: "Enterprise B2B", category: "Sales & Partnerships" },
];

async function main() {
  console.log("🧹 Cleaning existing database...");
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.media.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.post.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.profileSkill.deleteMany();
  await prisma.userDomain.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.domain.deleteMany();

  console.log("🌱 Seeding Domains...");
  for (const dom of DOMAINS_DATA) {
    await prisma.domain.create({
      data: dom,
    });
  }

  console.log("🌱 Seeding Skills...");
  const skillMap = new Map<string, string>();
  for (const sk of SKILLS_DATA) {
    const created = await prisma.skill.create({
      data: sk,
    });
    skillMap.set(sk.name, created.id);
  }

  const defaultPassword = await bcrypt.hash("Test@1234", 10);

  console.log("🌱 Creating Primary Test Accounts...");
  // User 1: Aarav Sharma (Software Engineering)
  const aarav = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "aarav@orbit.test",
      username: "aarav",
      passwordHash: defaultPassword,
      headline: "Staff Systems Engineer | Distributed Systems & Rust Enthusiast ⚡",
      bio: "Building high-throughput stream processing engines and real-time reactive architectures. Passionate about developer tooling and open source.",
      location: "San Francisco, CA",
      website: "https://aarav.dev",
      github: "https://github.com/aaravsharma",
      linkedin: "https://linkedin.com/in/aarav",
      twitter: "https://twitter.com/aarav_codes",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      isOnboarded: true,
      profileViews: 1420,
      primaryDomainId: "dom-swe",
      profile: {
        create: {
          coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
          about: "Hey! I am Aarav. Over the last 9 years, I have architected global cloud platforms serving 50M+ requests per day. Currently exploring Rust, distributed consensus algorithms, and localized edge compute.",
          isOpenToWork: false,
          isHiring: true,
        },
      },
    },
  });

  // User 2: Meera Patel (Design & UX)
  const meera = await prisma.user.create({
    data: {
      name: "Meera Patel",
      email: "meera@orbit.test",
      username: "meera",
      passwordHash: defaultPassword,
      headline: "Principal Product Designer | Crafting Spatial & AI Interfaces 🪐",
      bio: "Fusing cognitive psychology with elegant micro-interactions. Design systems architect & mentor.",
      location: "New York, NY",
      website: "https://meerapatel.design",
      github: "https://github.com/meerapatel",
      linkedin: "https://linkedin.com/in/meera",
      twitter: "https://twitter.com/meera_ux",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
      isOnboarded: true,
      profileViews: 2180,
      primaryDomainId: "dom-design",
      profile: {
        create: {
          coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80",
          about: "Designing interfaces that feel like natural extensions of human thought. Specializing in dark mode aesthetics, dynamic typography, and accessible design frameworks.",
          isOpenToWork: true,
          isHiring: false,
        },
      },
    },
  });

  console.log("🌱 Creating 8 Additional Realistic Users...");
  const dummyUsersData = [
    {
      name: "Dr. Elena Rostova",
      email: "elena@orbit.test",
      username: "elena_ai",
      headline: "Head of AI Research | LLMs & Multimodal Reasoning 🔬",
      bio: "Advancing interpretability in frontier foundational models. Former DeepMind fellow.",
      location: "London, UK",
      domainId: "dom-ai-data",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Kaelen Vance",
      email: "kaelen@orbit.test",
      username: "kaelen",
      headline: "VP of Product @ Hyperion | Building 0-to-1 Platforms 🚀",
      bio: "Product strategist obsessed with user loops and network effects.",
      location: "Austin, TX",
      domainId: "dom-product",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Sophia Chen",
      email: "sophia@orbit.test",
      username: "sophia_growth",
      headline: "Growth Lead & Angel Investor | Scaled 4 Unicorns 📈",
      bio: "Data-driven marketing architectures, viral loops, and community-led growth engines.",
      location: "Singapore",
      domainId: "dom-marketing",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Marcus Aurelius Vance",
      email: "marcus@orbit.test",
      username: "marcus_fin",
      headline: "Managing Director @ Apex Ventures | Early Stage Fintech & Web3 💰",
      bio: "Backing ambitious founders reinventing capital allocation and decentralized infrastructure.",
      location: "Zurich, Switzerland",
      domainId: "dom-finance",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Dr. Ananya Ray",
      email: "ananya@orbit.test",
      username: "ananya_bio",
      headline: "Genomics Scientist & Computational Biologist 🧬",
      bio: "Decoding cellular longevity pathways with synthetic biology and neural embeddings.",
      location: "Boston, MA",
      domainId: "dom-healthcare",
      image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "David Kim",
      email: "david@orbit.test",
      username: "david_ed",
      headline: "Founder @ NextGen Academy | Reimagining Tech Education 📚",
      bio: "Passionate about democratizing STEM education through project-based interactive learning.",
      location: "Seoul, South Korea",
      domainId: "dom-education",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Clara O'Connor",
      email: "clara@orbit.test",
      username: "clara_legal",
      headline: "General Counsel & AI Policy Advisor ⚖️",
      bio: "Navigating cross-border IP licensing, autonomous agent governance, and data privacy frameworks.",
      location: "Dublin, Ireland",
      domainId: "dom-legal",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Julian Rivera",
      email: "julian@orbit.test",
      username: "julian_sales",
      headline: "Global Head of Strategic Partnerships @ CloudMatrix 🤝",
      bio: "Building $100M+ enterprise alliance ecosystems across North America & APAC.",
      location: "Toronto, Canada",
      domainId: "dom-sales",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    },
  ];

  const createdDummies = [];
  for (const d of dummyUsersData) {
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        username: d.username,
        passwordHash: defaultPassword,
        headline: d.headline,
        bio: d.bio,
        location: d.location,
        image: d.image,
        isOnboarded: true,
        profileViews: Math.floor(Math.random() * 800) + 100,
        primaryDomainId: d.domainId,
        profile: {
          create: {
            coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
            about: d.bio,
            isOpenToWork: Math.random() > 0.6,
            isHiring: Math.random() > 0.5,
          },
        },
      },
    });
    createdDummies.push(user);
  }

  console.log("🌱 Associating Skills & Experiences...");
  // Attach skills to Aarav
  const aaravSkills = ["TypeScript", "React", "Next.js", "Rust", "Docker", "GraphQL"];
  for (const sk of aaravSkills) {
    const skillId = skillMap.get(sk);
    if (skillId) {
      await prisma.profileSkill.create({
        data: { userId: aarav.id, skillId },
      });
    }
  }

  // Attach skills to Meera
  const meeraSkills = ["Figma", "UI/UX Design", "Design Systems", "User Research", "Prototyping"];
  for (const sk of meeraSkills) {
    const skillId = skillMap.get(sk);
    if (skillId) {
      await prisma.profileSkill.create({
        data: { userId: meera.id, skillId },
      });
    }
  }

  // Add Experiences for Aarav
  await prisma.experience.createMany({
    data: [
      {
        userId: aarav.id,
        title: "Staff Systems Engineer",
        company: "Vortex Labs",
        location: "San Francisco, CA",
        startDate: new Date("2023-01-15"),
        isCurrent: true,
        description: "Leading the core distributed stream ingestion engine processing 1.2M events/sec with sub-5ms p99 latency.",
      },
      {
        userId: aarav.id,
        title: "Senior Fullstack Engineer",
        company: "OmniCloud Systems",
        location: "Seattle, WA",
        startDate: new Date("2020-03-01"),
        endDate: new Date("2022-12-31"),
        isCurrent: false,
        description: "Engineered next-gen multi-tenant cloud console using Next.js, WebSockets, and Kubernetes.",
      },
    ],
  });

  // Add Education for Aarav
  await prisma.education.create({
    data: {
      userId: aarav.id,
      institution: "Stanford University",
      degree: "Master of Science",
      fieldOfStudy: "Computer Science (Distributed Systems)",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2020-06-15"),
      grade: "3.9 GPA",
    },
  });

  // Add Experiences for Meera
  await prisma.experience.createMany({
    data: [
      {
        userId: meera.id,
        title: "Principal Product Designer",
        company: "Aura Creative Studio",
        location: "New York, NY",
        startDate: new Date("2022-04-01"),
        isCurrent: true,
        description: "Spearheading UI/UX direction for next-gen generative spatial canvases and AI assistant workflows.",
      },
      {
        userId: meera.id,
        title: "Lead Design System Architect",
        company: "Starlight Interactive",
        location: "San Francisco, CA",
        startDate: new Date("2019-06-01"),
        endDate: new Date("2022-03-15"),
        isCurrent: false,
        description: "Created and scaled 'Constellation' design system across 14 cross-functional product squads.",
      },
    ],
  });

  // Add Education for Meera
  await prisma.education.create({
    data: {
      userId: meera.id,
      institution: "Rhode Island School of Design (RISD)",
      degree: "Bachelor of Fine Arts",
      fieldOfStudy: "Graphic Design & Interactive Media",
      startDate: new Date("2015-09-01"),
      endDate: new Date("2019-05-30"),
      grade: "Magna Cum Laude",
    },
  });

  console.log("🌱 Creating Connections...");
  // Aarav & Meera are ACCEPTED connections
  await prisma.connection.create({
    data: {
      senderId: aarav.id,
      receiverId: meera.id,
      status: "ACCEPTED",
    },
  });

  // Aarav connected to Elena & Kaelen
  await prisma.connection.create({
    data: {
      senderId: createdDummies[0].id, // Elena
      receiverId: aarav.id,
      status: "ACCEPTED",
    },
  });
  await prisma.connection.create({
    data: {
      senderId: aarav.id,
      receiverId: createdDummies[1].id, // Kaelen
      status: "ACCEPTED",
    },
  });

  // Meera connected to Sophia & David
  await prisma.connection.create({
    data: {
      senderId: createdDummies[2].id, // Sophia
      receiverId: meera.id,
      status: "ACCEPTED",
    },
  });
  await prisma.connection.create({
    data: {
      senderId: meera.id,
      receiverId: createdDummies[5].id, // David
      status: "ACCEPTED",
    },
  });

  // Pending connection from Marcus to Aarav
  await prisma.connection.create({
    data: {
      senderId: createdDummies[3].id, // Marcus
      receiverId: aarav.id,
      status: "PENDING",
    },
  });

  // Pending connection from Clara to Meera
  await prisma.connection.create({
    data: {
      senderId: createdDummies[6].id, // Clara
      receiverId: meera.id,
      status: "PENDING",
    },
  });

  console.log("🌱 Creating Pre-existing Conversation between Aarav & Meera...");
  const conv = await prisma.conversation.create({
    data: {
      userAId: aarav.id,
      userBId: meera.id,
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv.id,
        senderId: meera.id,
        content: "Hey Aarav! Loved your recent post about distributed log consensus. The visual diagrams were super clear.",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        conversationId: conv.id,
        senderId: aarav.id,
        content: "Thanks Meera! Much appreciated. I took inspiration from your spatial layout guide to format the flowcharts.",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        conversationId: conv.id,
        senderId: meera.id,
        content: "Awesome! Are we still on for reviewing the new Orbit dark mode palette this Thursday?",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
    ],
  });

  console.log("🌱 Creating Rich Feed Posts, Polls, and Media...");
  // Post 1: Aarav post with image
  const post1 = await prisma.post.create({
    data: {
      authorId: aarav.id,
      domainId: "dom-swe",
      content: "Just migrated our websocket broker layer to Rust. Dropped memory usage by 74% and completely eliminated GC latency spikes! 🚀\n\nHere is a snapshot of our p99 telemetry under 100k concurrent client connections. What are your thoughts on zero-cost abstractions for network engines? #SoftwareEngineering #Rust #Architecture",
      likeCount: 42,
      commentCount: 4,
      media: {
        create: {
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",
          type: "IMAGE",
          name: "telemetry_metrics.png",
          size: 420000,
        },
      },
    },
  });

  // Post 2: Meera post with Poll
  const post2 = await prisma.post.create({
    data: {
      authorId: meera.id,
      domainId: "dom-design",
      postType: "POLL",
      content: "Designers & Devs: When building modern web apps in 2026, what is your stance on deep glassmorphism and subtle glow borders vs pure flat minimalism? Cast your vote! 👇 #DesignSystems #UIUX #WebDesign",
      likeCount: 88,
      commentCount: 12,
      poll: {
        create: {
          question: "Which UI aesthetic feels freshest for professional tools?",
          expiresAt: new Date(Date.now() + 86400000 * 5),
          options: {
            create: [
              { text: "Deep Glassmorphism & Neon Accents 🪐", voteCount: 45 },
              { text: "Refined Bento Grids & Micro-borders 🍱", voteCount: 38 },
              { text: "Pure Brutalist Minimalist ⬛", voteCount: 12 },
              { text: "Neumorphic Soft Tactile 🫧", voteCount: 7 },
            ],
          },
        },
      },
    },
  });

  // Post 3: Elena AI post
  const post3 = await prisma.post.create({
    data: {
      authorId: createdDummies[0].id, // Elena
      domainId: "dom-ai-data",
      content: "Excited to share our new pre-print on reasoning token compression! We observed that hierarchical attention heads can reduce sequence latency by 3.2x without losing chain-of-thought fidelity. 🧠✨\n\nRead the breakdown and benchmark tests in our latest open release. #DataAI #MachineLearning #DeepLearning",
      likeCount: 115,
      commentCount: 8,
      media: {
        create: {
          url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&auto=format&fit=crop&q=80",
          type: "IMAGE",
          name: "attention_weights.png",
          size: 650000,
        },
      },
    },
  });

  // Post 4: Kaelen Product post
  const post4 = await prisma.post.create({
    data: {
      authorId: createdDummies[1].id, // Kaelen
      domainId: "dom-product",
      content: "The biggest product trap is mistaking activity for progress. Shipping 20 features a quarter means nothing if retention curves flatten.\n\nFocus on the core loop. Optimize the first 3 minutes of user discovery. Everything else is secondary noise. 🎯 #ProductManagement #Leadership",
      likeCount: 63,
      commentCount: 5,
    },
  });

  // Post 5: Sophia Growth post
  const post5 = await prisma.post.create({
    data: {
      authorId: createdDummies[2].id, // Sophia
      domainId: "dom-marketing",
      content: "Domain-first community networks are replacing traditional monolithic social feeds. People don't want broad noise; they want high-signal professional circles with verified peer craft. 📈\n\nOrbit is proving this shift in real-time. #Growth #Community #Orbit",
      likeCount: 94,
      commentCount: 9,
    },
  });

  // Post 6: Marcus Finance post
  await prisma.post.create({
    data: {
      authorId: createdDummies[3].id, // Marcus
      domainId: "dom-finance",
      content: "Early stage tech valuations are finally finding equilibrium based on gross margin efficiency rather than vanity top-line GMV. Sustainable unit economics are back in fashion. 💰📊 #VentureCapital #Fintech",
      likeCount: 38,
      commentCount: 3,
    },
  });

  // Post 7: Ananya Healthcare post
  await prisma.post.create({
    data: {
      authorId: createdDummies[4].id, // Ananya
      domainId: "dom-healthcare",
      content: "Breakthrough in targeted antibody design: using generative structural modeling to predict antigen binding affinities with 91% accuracy in silico before wet lab validation! 🧬 #Biotech #Genomics",
      likeCount: 77,
      commentCount: 6,
    },
  });

  // Post 8: David Education post
  await prisma.post.create({
    data: {
      authorId: createdDummies[5].id, // David
      domainId: "dom-education",
      content: "Interactive, hands-on coding playgrounds increase student concept retention by 68% compared to passive video lectures. Building real stuff always wins. 📚💡 #EdTech #Learning",
      likeCount: 51,
      commentCount: 4,
    },
  });

  console.log("🌱 Adding Comments & Reactions...");
  // Meera reacts & comments on Aarav's post
  await prisma.reaction.create({
    data: {
      postId: post1.id,
      userId: meera.id,
      type: "FIRE",
    },
  });

  const c1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: meera.id,
      content: "Incredible reduction in latency Aarav! Did you write custom serialization protocols or use bincode/protobuf?",
    },
  });

  // Aarav replies to Meera's comment
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: aarav.id,
      parentId: c1.id,
      content: "We benchmarked protobuf vs bincode and ended up writing a zero-copy postcard layout for our WebSocket payloads. Huge win!",
    },
  });

  // Aarav reacts to Meera's post
  await prisma.reaction.create({
    data: {
      postId: post2.id,
      userId: aarav.id,
      type: "INSIGHTFUL",
    },
  });

  // Add sample notification for Aarav
  await prisma.notification.create({
    data: {
      userId: aarav.id,
      actorId: meera.id,
      type: "COMMENT",
      title: "New comment on your post",
      message: "Meera Patel commented on your post: 'Incredible reduction in latency Aarav...'",
      link: `/feed?post=${post1.id}`,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: aarav.id,
      actorId: createdDummies[3].id, // Marcus
      type: "CONNECT_REQUEST",
      title: "New connection request",
      message: "Marcus Aurelius Vance sent you a connection request.",
      link: `/network`,
      isRead: false,
    },
  });

  console.log("🌱 Creating Sample Jobs...");
  await prisma.job.createMany({
    data: [
      {
        posterId: aarav.id,
        domainId: "dom-swe",
        title: "Senior Distributed Systems Engineer (Rust)",
        company: "Vortex Labs",
        location: "San Francisco, CA",
        workplace: "REMOTE",
        jobType: "FULL_TIME",
        salaryRange: "$180,000 - $240,000 + Equity",
        description: "We are seeking a senior systems engineer to architect our high-throughput stream processing mesh. You will build zero-allocation networking engines and distributed state sync algorithms.",
        requirements: "5+ years backend systems experience. Deep knowledge of Rust or Modern C++, TCP/WebSockets, and distributed consensus.",
        isActive: true,
      },
      {
        posterId: createdDummies[1].id, // Kaelen
        domainId: "dom-product",
        title: "Principal Product Manager - Core Platform",
        company: "Hyperion Cloud",
        location: "Austin, TX",
        workplace: "HYBRID",
        jobType: "FULL_TIME",
        salaryRange: "$170,000 - $220,000",
        description: "Lead product strategy for our developer compute cloud. Drive developer onboarding metrics, self-serve monetization, and CLI tooling integration.",
        requirements: "Demonstrated experience scaling SaaS or developer platform products from Series A to C.",
        isActive: true,
      },
      {
        posterId: createdDummies[0].id, // Elena
        domainId: "dom-ai-data",
        title: "Staff Machine Learning Researcher (LLM Alignment)",
        company: "NeuralFrontier AI",
        location: "London, UK",
        workplace: "REMOTE",
        jobType: "FULL_TIME",
        salaryRange: "£140,000 - £190,000",
        description: "Conduct frontier research on mechanistic interpretability, RLHF, and automated theorem proving models.",
        requirements: "PhD or equivalent publications in NeurIPS, ICML, or ICLR. Strong PyTorch and distributed GPU training experience.",
        isActive: true,
      },
    ],
  });

  // Update domain member counts
  for (const dom of DOMAINS_DATA) {
    const count = await prisma.user.count({
      where: { primaryDomainId: dom.id },
    });
    await prisma.domain.update({
      where: { id: dom.id },
      data: { memberCount: count },
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("🚀 TEST LOGIN CREDENTIALS:");
  console.log("User 1: aarav@orbit.test | Test@1234 (Software Engineering)");
  console.log("User 2: meera@orbit.test | Test@1234 (Design & UX)");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
