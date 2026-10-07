import type { Metadata } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import { CommandPalette } from "@/components/layout/command-palette";
import { KeyboardShortcutsModal } from "@/components/layout/keyboard-shortcuts-modal";
import { OnboardingTour } from "@/components/layout/onboarding-tour";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Orbit – Editorial Professional Network",
  description: "A beautifully curated, domain-first professional network for high-craft creators and professionals.",
  keywords: ["professional network", "career", "creative portfolio", "domain circles", "editorial design", "orbit"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-amber-500/25 selection:text-foreground relative">
        {/* Subtle SVG paper grain overlay across all themes */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-multiply transition-opacity"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="paper"
          themes={["paper", "cobalt", "midnight"]}
          enableSystem={false}
        >
          <QueryProvider>
            <SocketProvider currentUserId={session?.user?.id}>
              {children}
              <CommandPalette />
              <KeyboardShortcutsModal />
              <OnboardingTour />
              <Toaster position="bottom-right" richColors />
            </SocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
