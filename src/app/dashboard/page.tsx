import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDailySelection, getGuestDailySelection } from "@/lib/dashboard/select-daily";
import { DashboardClient } from "./dashboard-client";

// Non-personalized, meal-slot-dependent content — not a canonical page
// worth indexing (guests do get a real, crawlable /recipe/[slug] though).
export const metadata = {
  robots: { index: false, follow: true },
};

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user && !session.user.onboarded) redirect("/onboarding");

  const selection = session?.user
    ? await getDailySelection(session.user.id)
    : await getGuestDailySelection();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <DashboardClient
        pool={selection.pool}
        served={selection.served}
        userDiets={selection.userDiets}
        cookbooks={selection.cookbooks}
        category={selection.category}
        currentSlot={selection.currentSlot}
        isGuest={!session?.user}
      />
    </main>
  );
}
