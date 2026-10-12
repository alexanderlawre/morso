"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MotionButton } from "@/components/motion-button";
import { LoadingOrb } from "@/components/loading-orb";

export type CookbookSummary = {
  id: string;
  name: string;
  coverImageUrl: string | null;
  recipeCount: number;
};

export function CookbooksSection({ cookbooks }: { cookbooks: CookbookSummary[] }) {
  const t = useTranslations("profile.cookbooks");
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCookbook() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cookbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("errors.createFailed"));
        return;
      }
      setName("");
      setCreating(false);
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-[#101010]">{t("heading")}</h2>
      <p className="mt-1 text-sm text-[#6B7370]">{t("visibilityNote")}</p>

      {cookbooks.length === 0 && !creating ? (
        <p className="mt-4 text-sm text-[#6B7370]">{t("empty")}</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cookbooks.map((cookbook) => (
            <Link
              key={cookbook.id}
              href={`/profile/cookbooks/${cookbook.id}`}
              className="flex items-center gap-4 overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white p-4 shadow-soft transition hover:shadow-lifted"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EDF3EF] text-xs text-[#6B7370]">
                {cookbook.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cookbook.coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  t("noCover")
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#101010]">{cookbook.name}</p>
                <p className="mt-1 text-xs text-[#6B7370]">
                  {t("recipeCount", { count: cookbook.recipeCount })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {creating ? (
        <div className="mt-4 flex items-center gap-3">
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="w-full max-w-xs rounded-xl border border-[#E8E6E0] bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
          />
          <MotionButton
            type="button"
            onClick={createCookbook}
            disabled={saving || !name.trim()}
            className="shrink-0 rounded-xl bg-[#1B4332] px-4 py-2.5 text-sm font-medium text-white shadow-brand transition-colors hover:bg-[#2D6A4F] disabled:opacity-50"
          >
            {saving ? <LoadingOrb size={20} theme="dark" /> : t("create")}
          </MotionButton>
          <MotionButton
            type="button"
            onClick={() => {
              setCreating(false);
              setError(null);
              setName("");
            }}
            className="shrink-0 rounded-xl border border-[#E8E6E0] px-4 py-2.5 text-sm font-medium text-[#101010] shadow-brand"
          >
            {t("cancel")}
          </MotionButton>
        </div>
      ) : (
        <MotionButton
          type="button"
          onClick={() => setCreating(true)}
          className="mt-4 rounded-xl border border-[#E8E6E0] px-4 py-2.5 text-sm font-medium text-[#101010] shadow-brand"
        >
          {t("newCookbook")}
        </MotionButton>
      )}
      {error && <p className="mt-2 text-sm text-[#B23A32]">{error}</p>}
    </div>
  );
}
