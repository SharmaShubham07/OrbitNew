import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingView } from "@/components/landing/landing-view";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/feed");
  }

  return <LandingView />;
}
