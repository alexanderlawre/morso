"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { PageTransition } from "@/components/page-transition";
import { MotionButton } from "@/components/motion-button";
import { OAuthButtons } from "@/components/oauth-buttons";
import { LoadingOrb } from "@/components/loading-orb";
import { hideKeyboard } from "@/lib/native";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(t("wrongCredentials"));
      setLoading(false);
      return;
    }

    hideKeyboard();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <PageTransition className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
          <Image
            src="/brand/svg/wordmark-black.svg"
            alt="Morso"
            width={864}
            height={286}
            className="mx-auto h-10 w-auto"
            priority
          />
          <p className="mt-1 text-center text-sm text-muted">{t("welcomeBack")}</p>

          <div className="mt-8">
            <OAuthButtons />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-ink">
                  {t("passwordLabel")}
                </label>
                <Link href="/forgot-password" className="text-xs text-link underline">
                  {t("forgotPassword")}
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {error && (
              <motion.p
                initial={{ x: 0 }}
                animate={{ x: [0, -6, 6, -4, 4, 0] }}
                transition={{ duration: 0.4 }}
                className="text-sm text-danger"
              >
                {error}
              </motion.p>
            )}

            <MotionButton
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3 text-sm font-medium text-accent-ink shadow-brand disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <LoadingOrb size={20} theme="dark" /> {t("loggingIn")}
                </span>
              ) : (
                t("submit")
              )}
            </MotionButton>
          </form>
        </div>

        {/* Below the card, not inside it — a real button matching the main
            "Log in" button's weight instead of a plain inline text link,
            with clear spacing (mt-6) separating it from the card above. */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted">{t("newHere")}</p>
          <Link
            href="/signup"
            className="mt-2 block w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-sm font-medium text-ink shadow-brand transition hover:bg-hover"
          >
            {t("createAccount")}
          </Link>
        </div>
      </PageTransition>
    </main>
  );
}
