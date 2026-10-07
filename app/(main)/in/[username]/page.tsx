import { getCurrentUser } from "@/lib/auth";
import { ProfileView } from "@/components/profile/profile-view";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const currentUser = await getCurrentUser();

  return <ProfileView username={username} currentUser={currentUser} />;
}
