import { getCurrentUser } from "@/lib/auth";
import { DiscoverView } from "@/components/discover/discover-view";

export default async function DiscoverPage() {
  const currentUser = await getCurrentUser();

  return <DiscoverView currentUser={currentUser} />;
}
