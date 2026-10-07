import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        raised: "var(--raised)",
        "muted-text": "var(--muted-text)",
        "border-hairline": "var(--border-hairline)",
        
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        "accent-primary": "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-tertiary": "var(--accent-tertiary)",
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // Modern Luminous Palette (Chainly / Studio Palette)
        studio: {
          bg: "#F4F0EB",
          card: "#FFFFFF",
          blue: "#587CF5",
          periwinkle: "#7C9EF8",
          coral: "#FF7054",
          peach: "#FFA474",
          pink: "#EC6FA8",
          charcoal: "#18181B",
          slate: "#64748B",
          mint: "#10B981",
          amber: "#F59E0B",
          border: "#E5E0D8",
        },

        paper: {
          base: "#F4F0EB",
          surface: "#FFFFFF",
          raised: "#F8FAFC",
          ink: "#0F172A",
          muted: "#64748B",
          border: "#E5E0D8",
          terracotta: "#FF7054",
          olive: "#587CF5",
          mustard: "#FFA474",
        },
        cobalt: {
          blue: "#587CF5",
          navy: "#0B1F66",
          cream: "#F4F0EB",
          sky: "#7C9EF8",
          coral: "#FF7054",
        },
        midnight: {
          base: "#0E1118",
          surface: "#161B26",
          raised: "#1E2433",
          cream: "#F8FAFC",
          amber: "#FFA474",
          teal: "#587CF5",
          muted: "#94A3B8",
          border: "#262E40",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Fraunces", "serif"],
        headline: ["var(--font-fraunces)", "Fraunces", "serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "editorial-sm": "0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)",
        "editorial-md": "0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)",
        "editorial-lg": "0 12px 36px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
        "editorial-lift": "0 18px 45px -8px rgba(15, 23, 42, 0.12)",
      },
      animation: {
        "orbit-pulse": "orbit-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "orbit-spin": "spin 24s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "orbit-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".88", transform: "scale(1.03)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
