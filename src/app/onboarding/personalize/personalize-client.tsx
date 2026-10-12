"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { FoodGroup, FoodGroupCategory } from "@prisma/client";
import { OnboardingShell, CategoryAccordion, SliderRow, TagInput } from "../onboarding-ui";
import { ONBOARDING_PREFS_KEY, type OnboardingPreferences } from "../shared";
import { MotionButton } from "@/components/motion-button";

const TOTAL_STEPS = 3;
const SUGGESTED_CUISINE_COUNT = 5;

// Display order for the basic food-group categories. Each category starts
// as a single "Overall" slider; expanding it reveals one slider per
// individual food group within that category. Labels are translated (see
// categoryLabels below) rather than hardcoded here.
const CATEGORY_ORDER: FoodGroupCategory[] = [
  "PRODUCE",
  "PROTEIN",
  "GRAIN",
  "DAIRY",
  "FLAVOR",
  "OTHER",
];

export function PersonalizeClient({ foodGroups }: { foodGroups: FoodGroup[] }) {
  const router = useRouter();
  const { update } = useSession();
  const t = useTranslations("onboarding");

  const categoryLabels: Record<FoodGroupCategory, string> = useMemo(
    () => ({
      PRODUCE: t("personalize.categories.produce"),
      PROTEIN: t("personalize.categories.protein"),
      GRAIN: t("personalize.categories.grain"),
      DAIRY: t("personalize.categories.dairy"),
      FLAVOR: t("personalize.categories.flavor"),
      OTHER: t("personalize.categories.other"),
    }),
    [t],
  );

  const [prefs, setPrefs] = useState<OnboardingPreferences | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryGroups = useMemo(() => {
    const byCategory = new Map<FoodGroupCategory, FoodGroup[]>();
    for (const fg of foodGroups) {
      const list = byCategory.get(fg.category) ?? [];
      list.push(fg);
      byCategory.set(fg.category, list);
    }
    return CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => ({
      category,
      label: categoryLabels[category],
      items: byCategory.get(category)!,
    }));
  }, [foodGroups, categoryLabels]);

  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const fg of foodGroups) init[fg.id] = 50;
    return init;
  });
  const [expanded, setExpanded] = useState<Set<FoodGroupCategory>>(new Set());
  const [feedback, setFeedback] = useState("");
  const [cuisineInput, setCuisineInput] = useState("");
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);

  function categoryValue(items: FoodGroup[]) {
    if (items.length === 0) return 50;
    const sum = items.reduce((acc, fg) => acc + (values[fg.id] ?? 50), 0);
    return Math.round(sum / items.length);
  }

  function setCategoryValue(items: FoodGroup[], value: number) {
    setValues((prev) => {
      const next = { ...prev };
      for (const fg of items) next[fg.id] = value;
      return next;
    });
  }

  function toggleExpanded(category: FoodGroupCategory) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  useEffect(() => {
    const raw = sessionStorage.getItem(ONBOARDING_PREFS_KEY);
    if (!raw) {
      router.replace("/onboarding/preferences");
      return;
    }
    try {
      setPrefs(JSON.parse(raw));
      setReady(true);
    } catch {
      router.replace("/onboarding/preferences");
    }
  }, [router]);

  function addCuisines() {
    const parts = cuisineInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      setFavoriteCuisines((prev) => [...new Set([...prev, ...parts])]);
    }
    setCuisineInput("");
  }

  async function finish() {
    if (!prefs) return;
    setSubmitting(true);
    setError(null);

    const meters = values;

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diets: prefs.dietIds.map((dietId) => ({
            dietId,
            commitment: prefs.dietCommitments[dietId] ?? "STRICT",
          })),
          allergenIds: prefs.allergenIds,
          customAllergens: prefs.customAllergens,
          meters,
          favoriteCuisines,
          foodGroupFeedback: feedback.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("personalize.errors.saveFailed"));
        setSubmitting(false);
        return;
      }

      sessionStorage.removeItem(ONBOARDING_PREFS_KEY);
      await update({ onboarded: true });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("personalize.errors.generic"));
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <OnboardingShell
      step={3}
      totalSteps={TOTAL_STEPS}
      title={t("personalize.title")}
      subtitle={t("personalize.subtitle")}
      footer={
        <div className="mt-8 flex gap-3">
          <MotionButton
            type="button"
            onClick={() => router.push("/onboarding/preferences")}
            className="rounded-xl border border-[#E8E6E0] px-4 py-3 text-sm font-medium text-[#101010] shadow-brand"
          >
            {t("common.back")}
          </MotionButton>
          <MotionButton
            type="button"
            onClick={finish}
            disabled={submitting}
            className="flex-1 rounded-xl bg-[#1B4332] py-3 text-sm font-medium text-white shadow-brand disabled:opacity-50"
          >
            {submitting ? t("personalize.saving") : t("personalize.finish")}
          </MotionButton>
        </div>
      }
    >
      <div className="mb-4 rounded-2xl bg-[#EDF3EF] p-4">
        <p className="text-sm font-bold text-[#101010]">{t("personalize.signalBanner.title")}</p>
        <p className="mt-1 text-xs text-[#6B7370]">
          {t("personalize.signalBanner.description")}
        </p>
      </div>

      <div className="space-y-4">
        {categoryGroups.map(({ category, label, items }) => (
          <CategoryAccordion
            key={category}
            label={label}
            value={categoryValue(items)}
            onChange={(v) => setCategoryValue(items, v)}
            expanded={expanded.has(category)}
            onToggleExpanded={() => toggleExpanded(category)}
          >
            {items.map((fg) => (
              <SliderRow
                key={fg.id}
                label={fg.name}
                value={values[fg.id] ?? 50}
                onChange={(v) => setValues((prev) => ({ ...prev, [fg.id]: v }))}
              />
            ))}
          </CategoryAccordion>
        ))}
      </div>

      <div className="mt-8 border-t border-[#E8E6E0] pt-6">
        <label className="block text-sm font-medium text-[#101010]">
          {t("personalize.feedback.label")}
        </label>
        <p className="mt-1 text-xs text-[#6B7370]">
          {t("personalize.feedback.description")}
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-xl border border-[#E8E6E0] bg-white px-3 py-2.5 text-base transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
        />
      </div>

      <div className="mt-8 border-t border-[#E8E6E0] pt-6">
        <label className="block text-sm font-medium text-[#101010]">
          {t("personalize.cuisines.label")}
        </label>
        <p className="mt-1 text-xs text-[#6B7370]">
          {t("personalize.cuisines.description", { count: SUGGESTED_CUISINE_COUNT })}
        </p>
        <div className="mt-2">
          <TagInput
            value={favoriteCuisines}
            onAdd={addCuisines}
            onRemove={(v) => setFavoriteCuisines((prev) => prev.filter((c) => c !== v))}
            input={cuisineInput}
            onInputChange={setCuisineInput}
            placeholder={t("personalize.cuisines.placeholder")}
          />
        </div>
        {favoriteCuisines.length > 0 && favoriteCuisines.length < SUGGESTED_CUISINE_COUNT && (
          <p className="mt-2 text-xs text-[#6B7370]">
            {t("personalize.cuisines.moreSuggested", {
              count: SUGGESTED_CUISINE_COUNT - favoriteCuisines.length,
            })}
          </p>
        )}
      </div>

      {error && <p className="mt-6 text-sm text-[#B23A32]">{error}</p>}
    </OnboardingShell>
  );
}
