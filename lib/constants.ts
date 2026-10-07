export interface DomainDefinition {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  bgGradient: string;
  description: string;
}

export const DOMAINS: DomainDefinition[] = [
  {
    id: "dom-swe",
    name: "Software Engineering",
    slug: "software-engineering",
    emoji: "💻",
    color: "#06b6d4", // Cyan
    bgGradient: "from-cyan-500/20 via-blue-600/10 to-transparent",
    description: "Full-stack, backend, distributed systems, web architectures, and clean code craftsmanship.",
  },
  {
    id: "dom-design",
    name: "Design & UX",
    slug: "design-ux",
    emoji: "🎨",
    color: "#a855f7", // Purple/Violet
    bgGradient: "from-purple-500/20 via-pink-600/10 to-transparent",
    description: "Product design, UI/UX research, visual storytelling, design systems, and motion.",
  },
  {
    id: "dom-ai-data",
    name: "Data & AI",
    slug: "data-ai",
    emoji: "🧠",
    color: "#f59e0b", // Amber
    bgGradient: "from-amber-500/20 via-orange-600/10 to-transparent",
    description: "Machine learning, LLMs, neural models, data engineering, and analytics intelligence.",
  },
  {
    id: "dom-product",
    name: "Product Management",
    slug: "product-management",
    emoji: "🚀",
    color: "#6366f1", // Indigo
    bgGradient: "from-indigo-500/20 via-sky-600/10 to-transparent",
    description: "Roadmaps, product strategy, discovery, growth experiments, and user delight.",
  },
  {
    id: "dom-marketing",
    name: "Marketing & Growth",
    slug: "marketing-growth",
    emoji: "📈",
    color: "#ec4899", // Pink
    bgGradient: "from-pink-500/20 via-rose-600/10 to-transparent",
    description: "Brand building, demand gen, performance marketing, content engines, and community.",
  },
  {
    id: "dom-finance",
    name: "Finance & Fintech",
    slug: "finance-fintech",
    emoji: "💰",
    color: "#10b981", // Emerald
    bgGradient: "from-emerald-500/20 via-teal-600/10 to-transparent",
    description: "Venture capital, DeFi, equity research, financial modeling, and CFO operations.",
  },
  {
    id: "dom-healthcare",
    name: "Healthcare & Biotech",
    slug: "healthcare-biotech",
    emoji: "🧬",
    color: "#14b8a6", // Teal
    bgGradient: "from-teal-500/20 via-cyan-600/10 to-transparent",
    description: "Clinical research, genomics, digital health therapeutics, and biotech innovations.",
  },
  {
    id: "dom-education",
    name: "Education & EdTech",
    slug: "education-edtech",
    emoji: "📚",
    color: "#eab308", // Yellow
    bgGradient: "from-yellow-500/20 via-amber-600/10 to-transparent",
    description: "Pedagogy, learning platforms, academic research, mentorship, and curriculum design.",
  },
  {
    id: "dom-legal",
    name: "Legal & Compliance",
    slug: "legal-compliance",
    emoji: "⚖️",
    color: "#64748b", // Slate
    bgGradient: "from-slate-500/20 via-gray-600/10 to-transparent",
    description: "IP law, corporate governance, contract tech, regulatory affairs, and privacy.",
  },
  {
    id: "dom-sales",
    name: "Sales & Partnerships",
    slug: "sales-partnerships",
    emoji: "🤝",
    color: "#f97316", // Orange
    bgGradient: "from-orange-500/20 via-red-600/10 to-transparent",
    description: "Enterprise sales, strategic partnerships, customer success, and revenue operations.",
  },
];

export const REACTIONS = [
  { type: "LIKE", label: "Like", emoji: "👍", color: "text-blue-400 hover:text-blue-300" },
  { type: "INSIGHTFUL", label: "Insightful", emoji: "💡", color: "text-amber-400 hover:text-amber-300" },
  { type: "FIRE", label: "Fire", emoji: "🔥", color: "text-rose-500 hover:text-rose-400" },
  { type: "CELEBRATE", label: "Celebrate", emoji: "👏", color: "text-emerald-400 hover:text-emerald-300" },
] as const;

export const SAMPLE_SKILLS = [
  "TypeScript", "React", "Next.js", "Node.js", "Python", "Rust", "Go",
  "GraphQL", "Docker", "Kubernetes", "PostgreSQL", "Tailwind CSS",
  "Figma", "UI/UX Design", "Design Systems", "User Research", "Prototyping",
  "PyTorch", "TensorFlow", "NLP", "Computer Vision", "Data Engineering",
  "Product Strategy", "Agile", "User Analytics", "Growth Hacking", "SEO",
  "Financial Modeling", "Valuation", "Risk Management", "Venture Capital",
  "Biomedical Research", "Clinical Trials", "Legal Analysis", "B2B Sales"
];
