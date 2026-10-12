"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageTransition } from "@/components/page-transition";
import { MotionButton } from "@/components/motion-button";
import { LoadingOrb } from "@/components/loading-orb";

function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("mismatchError"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? t("genericError"));
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="mt-8 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-danger">
        {t("invalidLink")}{" "}
        <Link href="/forgot-password" className="underline">
          {t("forgotPasswordLink")}
        </Link>{" "}
        {t("pageSuffix")}
      </p>
    );
  }

  if (success) {
    return (
      <p className="mt-8 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink">
          {t("newPasswordLabel")}
        </label>
        <input
          type="password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink">
          {t("confirmPasswordLabel")}
        </label>
        <input
          type="password"
          required
          minLength={10}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            <LoadingOrb size={20} theme="dark" /> {t("updating")}
          </span>
        ) : (
          t("submit")
        )}
      </MotionButton>
    </form>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
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

          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </PageTransition>
    </main>
  );
}
