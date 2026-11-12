import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getGuestDailySelection } from "@/lib/dashboard/select-daily";
import { LandingPage } from "./landing-page";

export const metadata = {
  title: "Morso — Four recipes. That's the whole surface.",
  description:
    "Diet- and allergen-aware recipe picks, four a day. Browse today's picks before you even create an account.",
  robots: { index: true, follow: true },
};

export default async function Home() {
  const session = await auth();

  // Logged-in users have nothing to do on a marketing page — straight to
  // their own dashboard (or onboarding, if they haven't finished it yet).
  if (session?.user && !session.user.onboarded) redirect("/onboarding");
  if (session?.user) redirect("/dashboard");

  // Guests get the real landing page, with a live preview of today's picks
  // (see getGuestDailySelection in select-daily.ts) instead of being bounced
  // straight to the dashboard.
  const selection = await getGuestDailySelection();

  return <LandingPage picks={selection.served.slice(0, 4)} />;
}
