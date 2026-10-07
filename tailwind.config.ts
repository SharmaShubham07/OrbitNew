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

        paper: {
          base: "#EDE6DA",
          surface: "#F7F2E9",
          raised: "#FFFBF3",
          ink: "#1E1B16",
          muted: "#6B6355",
          border: "#CFC5B3",
          terracotta: "#B5552F",
          olive: "#6F7B4A",
          mustard: "#D9A441",
        },
        cobalt: {
          blue: "#1F4BD8",
          navy: "#0B1F66",
          cream: "#F6EFD9",
          sky: "#9CC4F2",
          coral: "#F2674A",
        },
        midnight: {
          base: "#0E0F14",
          surface: "#171922",
          raised: "#1F232F",
          cream: "#F1EBDD",
          amber: "#E8A94A",
          teal: "#4FD1B5",
          muted: "#9B988E",
          border: "#2A2D3A",
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
        "editorial-sm": "0 1px 3px rgba(30, 27, 22, 0.06), 0 1px 2px rgba(30, 27, 22, 0.04)",
        "editorial-md": "0 4px 16px -2px rgba(30, 27, 22, 0.08), 0 2px 6px -1px rgba(30, 27, 22, 0.04)",
        "editorial-lg": "0 12px 32px -4px rgba(30, 27, 22, 0.12), 0 4px 12px -2px rgba(30, 27, 22, 0.06)",
        "editorial-lift": "0 16px 40px -8px rgba(30, 27, 22, 0.16)",
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
