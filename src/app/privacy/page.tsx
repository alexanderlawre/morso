import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Morso",
  description: "How Morso collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="mb-8 rounded-xl border border-border bg-hover px-4 py-3 text-sm text-muted">
        <strong className="text-ink">Draft.</strong> This policy has not yet been reviewed by
        an attorney. Treat it as a starting point, not a finished legal document.
      </div>

      <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="text-lg font-bold text-ink">What we collect</h2>
          <p className="mt-2 text-muted">
            When you create an account, we collect your name, email address, and password
            (stored as a secure hash, never in plain text) — or, if you sign in with Google
            or Apple, the basic profile information those providers share with us. We also
            collect the diet, allergen, and taste preferences you tell us about, and the
            recipes you view, save, and cook, so we can recommend better picks over time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">How we use it</h2>
          <p className="mt-2 text-muted">
            We use your data to run the core product: picking recipes that fit your diet and
            allergens, remembering what you've saved or cooked, and improving recommendations
            based on your activity. We don't sell your data, and we don't share it with
            advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Cookies</h2>
          <p className="mt-2 text-muted">
            We use a small number of cookies: your signed-in session, and your theme/language
            preference (set before you even create an account, so it carries over once you
            do). We don't use third-party tracking or advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Third parties</h2>
          <p className="mt-2 text-muted">
            If you sign in with Google or Apple, those providers process your sign-in
            according to their own privacy policies. We use Resend to deliver transactional
            email (like password resets) — your email address is shared with them only to
            send that message.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Your rights</h2>
          <p className="mt-2 text-muted">
            You can edit your profile information at any time from your account settings. You
            can permanently delete your account and all associated data — preferences, saved
            recipes, cook history — from{" "}
            <Link href="/profile" className="text-link underline">
              your profile page
            </Link>
            . Deletion is immediate and cannot be undone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Children</h2>
          <p className="mt-2 text-muted">
            Morso is not directed at children, and we don't knowingly collect information from
            anyone under 18.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink">Contact</h2>
          <p className="mt-2 text-muted">
            Questions about this policy? Reach out at{" "}
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
