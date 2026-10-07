import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MainLayoutClient } from "@/components/layout/main-layout-client";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isOnboarded) {
    redirect("/onboarding");
  }

  const serializedUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    image: user.image,
    headline: user.headline,
    bio: user.bio,
    location: user.location,
    primaryDomainId: user.primaryDomainId,
    domainName: user.primaryDomain?.name,
    domainEmoji: user.primaryDomain?.emoji,
    domainColor: user.primaryDomain?.color,
    profile: user.profile,
  };

  return <MainLayoutClient user={serializedUser}>{children}</MainLayoutClient>;
}
