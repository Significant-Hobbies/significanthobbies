import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function SetupPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect("/login");
  if (session.user.username) redirect(`/u/${session.user.username}`);
  return <OnboardingFlow />;
}
