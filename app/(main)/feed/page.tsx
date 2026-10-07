import { getCurrentUser } from "@/lib/auth";
import { FeedView } from "@/components/feed/feed-view";

export default async function FeedPage() {
  const currentUser = await getCurrentUser();

  return <FeedView currentUser={currentUser} />;
}
