import { getCurrentUser } from "@/lib/auth";
import { SavedView } from "@/components/saved/saved-view";

export default async function SavedPage() {
  const currentUser = await getCurrentUser();

  return <SavedView currentUser={currentUser} />;
}
