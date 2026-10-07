"use client";

import { useState } from "react";
import { SidebarRail } from "@/components/layout/sidebar-rail";
import { RightBento } from "@/components/layout/right-bento";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HeaderMobile } from "@/components/layout/header-mobile";
import { ChatSlideOver } from "@/components/chat/chat-slide-over";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { useRouter } from "next/navigation";

export function MainLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const router = useRouter();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const handlePostCreated = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row justify-center relative">
      {/* Mobile Header */}
      <HeaderMobile user={user} />

      {/* Left Slim Icon Rail */}
      <SidebarRail user={user} onOpenCreatePost={() => setIsCreatePostOpen(true)} />

      {/* Main Center Dynamic Content */}
      <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden">
        {children}
      </main>

      {/* Right Bento Column */}
      <RightBento user={user} />

      {/* Bottom Mobile Tab Bar */}
      <MobileNav user={user} onOpenCreatePost={() => setIsCreatePostOpen(true)} />

      {/* Docked Slide-Over Chat Drawer */}
      <ChatSlideOver currentUserId={user.id} />

      {/* Global Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
        currentUser={user}
      />
    </div>
  );
}
