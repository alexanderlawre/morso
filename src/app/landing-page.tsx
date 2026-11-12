import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { RecipeCardShell, type SavedRecipeData } from "@/components/recipe-card-shell";
import { LegalFooter } from "@/components/legal-footer";

export function LandingPage({ picks }: { picks: SavedRecipeData[] }) {
  return (
    <>
      <AppHeader isGuest />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-ink sm:text-5xl">
            Four recipes. That's the whole surface.
          </h1>
          <p className="mt-4 text-base text-muted sm:text-lg">
            No infinite scroll, no decision fatigue — just today's best picks for your diet,
            allergies, and taste. Browse for free, right now, before you even create an account.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-ink shadow-brand sm:w-auto"
            >
              Create a free account
            </Link>
            <Link
              href="/dashboard"
              className="w-full rounded-xl border border-border bg-surface px-6 py-3 text-sm font-medium text-ink shadow-brand transition hover:bg-hover sm:w-auto"
            >
              Browse today's picks
            </Link>
          </div>
        </section>

        {picks.length > 0 && (
          <section className="mt-16">
            <h2 className="text-center text-sm font-bold uppercase tracking-wide text-muted">
              Today's picks
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {picks.map((recipe) => (
                <RecipeCardShell key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-sm font-bold text-ink">1. Tell us your diet &amp; allergies</p>
            <p className="mt-2 text-sm text-muted">
              Once, during a quick sign-up. You can update it any time.
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-ink">2. We filter out anything unsafe</p>
            <p className="mt-2 text-sm text-muted">
              Every recipe you see already matches what you told us — it's a hard filter, not a
              suggestion.
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-ink">3. Get four picks a day</p>
            <p className="mt-2 text-sm text-muted">
              Refreshed daily, with one free reroll if nothing looks good.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-xl">
          <h2 className="text-center text-lg font-bold text-ink">Questions</h2>
          <div className="mt-6 space-y-5 text-sm">
            <div>
              <p className="font-medium text-ink">Is Morso free?</p>
              <p className="mt-1 text-muted">
                Yes. Browsing, your daily picks, saving recipes, and tracking what you've cooked
                are all free. We're building optional premium features on top later.
              </p>
            </div>
            <div>
              <p className="font-medium text-ink">Do I need an account to look around?</p>
              <p className="mt-1 text-muted">
                No — you get a full, free look at today's picks and one refresh before we ask you
                to sign up.
              </p>
            </div>
            <div>
              <p className="font-medium text-ink">Do you actually handle allergies?</p>
              <p className="mt-1 text-muted">
                Any allergen you declare is filtered out of everything we show you. That said,
                always double-check ingredient labels yourself — see our{" "}
                <Link href="/terms" className="text-link underline">
                  terms
                </Link>{" "}
                for the details.
              </p>
            </div>
          </div>
        </section>

        <LegalFooter className="mt-20 mb-6" />
      </main>
    </>
  );
}
