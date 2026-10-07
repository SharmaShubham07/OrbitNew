import { getCurrentUser } from "@/lib/auth";
import { NetworkView } from "@/components/connections/network-view";

export default async function NetworkPage() {
  const currentUser = await getCurrentUser();

  return <NetworkView currentUser={currentUser} />;
}
