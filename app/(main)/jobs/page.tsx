import { getCurrentUser } from "@/lib/auth";
import { JobsView } from "@/components/jobs/jobs-view";

export default async function JobsPage() {
  const currentUser = await getCurrentUser();

  return <JobsView currentUser={currentUser} />;
}
