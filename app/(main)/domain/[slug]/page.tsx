import { getCurrentUser } from "@/lib/auth";
import { DomainView } from "@/components/domain/domain-view";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  return <DomainView slug={slug} currentUser={currentUser} />;
}
