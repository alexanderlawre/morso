import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Morso",
  description: "The terms that govern your use of Morso.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="mb-8 rounded-xl border border-border bg-hover px-4 py-3 text-sm text-muted">
        <strong className="text-ink">Draft.</strong> These terms have not yet been reviewed by
        an attorney. Treat them as a starting point, not a finished legal document.
      </div>

      <h1 className="text-3xl font-bold text-ink">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="text-lg font-bold text-ink">The service</h2>
          <p className="mt-2 text-muted">
            Morso recommends recipes based on your diet, allergens, and taste preferences. You
            can browse a limited set of picks without an account; creating a free account
            unlocks saving recipes, tracking what you've cooked, and personalized
            recommendations that improve over time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Your account</h2>
          <p className="mt-2 text-muted">
            You're responsible for keeping your password secure and for anything that happens
            under your account. Tell us your real diet and allergen preferences — we use them
            to filter what we show you, but we can't guarantee every recipe is free of an
            ingredient you didn't tell us about, or that our filtering catches every edge case.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Not medical advice</h2>
          <p className="mt-2 text-muted">
            Recipe content, nutrition estimates, and allergen tags are provided for general
            information only and are not medical or dietary advice. Always read ingredient
            labels yourself and consult a doctor or dietitian about any serious allergy or
            medical condition. We are not liable for any reaction or harm resulting from
            relying solely on our allergen or nutrition information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Acceptable use</h2>
          <p className="mt-2 text-muted">
            Don't misuse the service: no scraping at scale, no attempting to break
            authentication or rate limits, no uploading content you don't have the rights to,
            no impersonating another person.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Premium features</h2>
          <p className="mt-2 text-muted">
            Some features may be offered as part of a paid plan in the future. Pricing, free
            trial terms, and what's included are subject to change before any paid plan
            launches, and we'll clearly describe them before you're asked to pay anything.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Termination</h2>
          <p className="mt-2 text-muted">
            You can delete your account at any time from{" "}
            <Link href="/profile" className="text-link underline">
              your profile page
            </Link>
            , which permanently removes your data. We may suspend or terminate accounts that
            violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Disclaimer &amp; liability</h2>
          <p className="mt-2 text-muted">
            The service is provided "as is," without warranties of any kind. To the extent
            permitted by law, Morso isn't liable for indirect or consequential damages arising
            from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Contact</h2>
          <p className="mt-2 text-muted">
            Questions about these terms? Reach out at{" "}
            <a href="mailto:hello@morso.app" className="text-link underline">
              hello@morso.app
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
