"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { CookedRecipeCard, type CookedRecipeData } from "@/components/recipe-card-shell";
import { compressImage } from "@/lib/image-compression";
import { PageTransition } from "@/components/page-transition";
import { MotionButton } from "@/components/motion-button";
import { LocationPicker, type LocationValue } from "@/components/location-picker";
import { BirthdayPicker } from "@/components/birthday-picker";
import { LoadingOrb } from "@/components/loading-orb";
import { CookbooksSection, type CookbookSummary } from "./cookbooks-section";
import { AccountSettingsSection } from "./account-settings-section";

export function ProfileClient({
  initialName,
  email,
  initialBirthday,
  initialCity,
  initialState,
  initialCountry,
  initialImage,
  timezone,
  hasPassword,
  cooked,
  cookbooks,
}: {
  initialName: string;
  email: string;
  initialBirthday: string;
  initialCity: string;
  initialState: string;
  initialCountry: string;
  initialImage: string | null;
  timezone: string | null;
  hasPassword: boolean;
  cooked: CookedRecipeData[];
  cookbooks: CookbookSummary[];
}) {
  const t = useTranslations("profile");
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [birthday, setBirthday] = useState(initialBirthday);
  const [location, setLocation] = useState<LocationValue>({
    country: initialCountry,
    state: initialState,
    city: initialCity,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialImage);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressed);
      setPhotoPreview(previewUrl);

      const formData = new FormData();
      formData.append("file", compressed, "photo.webp");
      const res = await fetch("/api/account/photo", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("errors.photoUploadFailed"));
        return;
      }
      setPhotoPreview(data.imageUrl ?? previewUrl);
      await update({ image: data.imageUrl ?? previewUrl });
      router.refresh();
    } catch {
      setError(t("errors.photoUploadFailed"));
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function save() {
    const trimmedName = name.trim();
    const trimmedCountry = location.country.trim();
    if (!trimmedName) {
      setError(t("errors.nameRequired"));
      return;
    }
    if (!trimmedCountry) {
      setError(t("errors.countryRequired"));
      return;
    }
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          birthday: birthday || null,
          city: location.city.trim() || null,
          state: location.state.trim() || null,
          country: trimmedCountry,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("errors.saveFailed"));
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <PageTransition>
        <h1 className="text-2xl font-bold text-ink">{t("heading")}</h1>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <MotionButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              whileHover={{ y: -2 }}
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-hover text-xs text-muted disabled:opacity-50"
              aria-label={t("photo.changeAriaLabel")}
            >
              <AnimatePresence mode="wait" initial={false}>
                {photoPreview ? (
                  <motion.img
                    key={photoPreview}
                    src={photoPreview}
                    alt=""
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <motion.span
                    key="no-photo"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {t("photo.addPhoto")}
                  </motion.span>
                )}
              </AnimatePresence>
            </MotionButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <div>
              <p className="text-sm font-medium text-ink">{t("photo.label")}</p>
              <p className="flex items-center gap-2 text-xs text-muted">
                {uploadingPhoto ? (
                  <>
                    <LoadingOrb size={20} /> {t("photo.uploading")}
                  </>
                ) : (
                  t("photo.clickToChange")
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink">{t("fields.name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setSaved(false);
                  setName(e.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">{t("fields.birthday")}</label>
              <BirthdayPicker
                value={birthday}
                onChange={(next) => {
                  setSaved(false);
                  setBirthday(next);
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <LocationPicker
              value={location}
              onChange={(next) => {
                setSaved(false);
                setLocation(next);
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <MotionButton
              type="button"
              onClick={save}
              disabled={saving}
              className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink shadow-brand transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <LoadingOrb size={20} theme="dark" /> {t("actions.saving")}
                </span>
              ) : (
                t("actions.save")
              )}
            </MotionButton>
            {saved && <span className="text-sm text-accent">{t("actions.saved")}</span>}
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>

        <CookbooksSection cookbooks={cookbooks} />

        <div className="mt-10">
          <h2 className="text-lg font-bold text-ink">{t("cookArchive.heading")}</h2>
          <p className="mt-1 text-sm text-muted">{t("cookArchive.privacyNote")}</p>

          {cooked.length === 0 ? (
            <p className="mt-4 text-sm text-muted">{t("cookArchive.empty")}</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {cooked.map((recipe) => (
                <CookedRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <AccountSettingsSection email={email} timezone={timezone} hasPassword={hasPassword} />
        </div>
      </PageTransition>
    </main>
  );
}
