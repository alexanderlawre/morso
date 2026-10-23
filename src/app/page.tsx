import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  // Guests land straight on the (non-personalized) dashboard instead of a
  // forced login wall — see getGuestDailySelection in select-daily.ts.
  if (session?.user && !session.user.onboarded) redirect("/onboarding");
  redirect("/dashboard");
}
