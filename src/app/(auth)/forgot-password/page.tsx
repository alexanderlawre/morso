"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageTransition } from "@/components/page-transition";
import { MotionButton } from "@/components/motion-button";
import { LoadingOrb } from "@/components/loading-orb";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? t("genericError"));
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <PageTransition className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t("subtitle")}
          </p>

          {submitted ? (
            <p className="mt-8 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink">
              {t("submitted")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink">
                  {t("emailLabel")}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <MotionButton
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-accent py-3 text-sm font-medium text-accent-ink shadow-brand transition-colors hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <LoadingOrb size={20} theme="dark" /> {t("sending")}
                  </span>
                ) : (
                  t("submit")
                )}
              </MotionButton>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="text-link underline">
            {t("backToLogin")}
          </Link>
        </p>
      </PageTransition>
    </main>
  );
}
