"use client";

import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { compressImage } from "@/lib/image-compression";
import { PageTransition } from "@/components/page-transition";
import { MotionButton } from "@/components/motion-button";
import { OAuthButtons } from "@/components/oauth-buttons";
import { LocationPicker, type LocationValue } from "@/components/location-picker";
import { BirthdayPicker } from "@/components/birthday-picker";
import { LoadingOrb } from "@/components/loading-orb";
import { hideKeyboard } from "@/lib/native";

export default function SignupPage() {
  const t = useTranslations("auth.signup");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [location, setLocation] = useState<LocationValue>({ country: "", state: "", city: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordsDontMatchError"));
      return;
    }

    if (!location.country || !location.city) {
      setError(t("locationRequiredError"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          birthday: birthday || null,
          city: location.city,
          state: location.state || null,
          country: location.country,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("genericError"));
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError(t("partialFailureError"));
        setLoading(false);
        return;
      }

      // Photo is optional and best-effort: a failed upload shouldn't block
      // the rest of signup, since the account already exists at this point.
      if (photoFile) {
        try {
          const compressed = await compressImage(photoFile);
          const formData = new FormData();
          formData.append("file", compressed, "photo.webp");
          await fetch("/api/account/photo", { method: "POST", body: formData });
        } catch {
          // ignore
        }
      }

      hideKeyboard();
      router.push("/onboarding/preferences");
      router.refresh();
    } catch {
      setError(t("retryError"));
      setLoading(false);
    }
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
            className="h-10 w-auto"
            priority
          />
          <p className="mt-1 text-sm text-muted">
            {t("tagline")}
          </p>

          <div className="mt-4 mb-4">
            <OAuthButtons />
          </div>

          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {t("stepLabel")}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <MotionButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-hover text-xs text-muted"
                aria-label={t("addPhotoAria")}
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  t("addPhoto")
                )}
              </MotionButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <div>
                <p className="text-sm font-medium text-ink">{t("profilePhotoLabel")}</p>
                <p className="text-xs text-muted">{t("profilePhotoHint")}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">
                {t("fullNameLabel")}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
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
              <label className="block text-sm font-medium text-ink">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                required
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="mt-1 text-xs text-muted">{t("passwordHint")}</p>
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
              {/* Live feedback as the user types, instead of only surfacing
                  a mismatch after they submit. */}
              {confirmPassword.length > 0 && (
                <p
                  className={`mt-1 text-xs ${
                    password === confirmPassword ? "text-accent" : "text-danger"
                  }`}
                >
                  {password === confirmPassword ? t("passwordsMatch") : t("passwordsMismatch")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">
                {t("birthdayLabel")}
              </label>
              <BirthdayPicker value={birthday} onChange={setBirthday} />
            </div>
            <div>
              <LocationPicker value={location} onChange={setLocation} />
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
                  <LoadingOrb size={20} theme="dark" /> {t("creatingAccount")}
                </span>
              ) : (
                t("continue")
              )}
            </MotionButton>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted">{t("alreadyHaveAccount")}</p>
          <Link
            href="/login"
            className="mt-2 block w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-sm font-medium text-ink shadow-brand transition hover:bg-hover"
          >
            {t("logIn")}
          </Link>
        </div>
      </PageTransition>
    </main>
  );
}
