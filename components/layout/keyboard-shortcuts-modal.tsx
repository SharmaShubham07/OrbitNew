"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command, Keyboard, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    let lastKey = "";
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside input / textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const now = Date.now();
      const key = e.key.toLowerCase();

      // ? key -> Open shortcuts modal
      if (e.key === "?") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // / key -> focus search or jump to /discover
      if (e.key === "/") {
        e.preventDefault();
        router.push("/discover");
        return;
      }

      // 'g' key prefix sequence: 'g f' -> feed, 'g m' -> messages, 'g n' -> network
      if (lastKey === "g" && now - lastKeyTime < 800) {
        if (key === "f") {
          e.preventDefault();
          router.push("/feed");
        } else if (key === "m") {
          e.preventDefault();
          router.push("/messages");
        } else if (key === "n") {
          e.preventDefault();
          router.push("/network");
        }
        lastKey = "";
        return;
      }

      lastKey = key;
      lastKeyTime = now;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const shortcutGroups = [
    {
      title: "Global Navigation",
      shortcuts: [
        { keys: ["G", "F"], desc: "Go to Main Feed" },
        { keys: ["G", "M"], desc: "Go to Direct Messages" },
        { keys: ["G", "N"], desc: "Go to My Network" },
        { keys: ["/"], desc: "Quick Search / Discover" },
      ],
    },
    {
      title: "Actions & Tools",
      shortcuts: [
        { keys: ["Cmd / Ctrl", "K"], desc: "Open Command Palette" },
        { keys: ["N"], desc: "Create New Post" },
        { keys: ["?"], desc: "Open Keyboard Shortcuts Help" },
        { keys: ["Esc"], desc: "Close Modals / Overlays" },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Keyboard Shortcuts"
      subtitle="Master Orbit with lightning fast keyboard navigation"
      size="md"
    >
      <div className="space-y-6">
        {shortcutGroups.map((group, idx) => (
          <div key={idx} className="space-y-2.5">
            <h4 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              {group.title}
            </h4>
            <div className="grid gap-2">
              {group.shortcuts.map((s, sIdx) => (
                <div
                  key={sIdx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-surface border border-border-hairline text-xs font-sans"
                >
                  <span className="text-foreground">{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-1 rounded-lg bg-raised border border-border-hairline font-mono text-[11px] font-bold text-foreground shadow-editorial-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
