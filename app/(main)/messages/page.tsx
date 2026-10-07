import { getCurrentUser } from "@/lib/auth";
import { MessagesView } from "@/components/chat/messages-view";

export default async function MessagesPage() {
  const currentUser = await getCurrentUser();

  return <MessagesView currentUser={currentUser} />;
}
