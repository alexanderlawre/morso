"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Allergen, Diet, DietCommitment } from "@prisma/client";
import {
  OnboardingShell,
  ChipGrid,
  CategoryItemPicker,
  TagInput,
  DietCommitmentSlider,
} from "../onboarding-ui";
import { ONBOARDING_PREFS_KEY } from "../shared";
import { groupAllergensByCategory } from "@/lib/allergen-categories";
import { MotionButton } from "@/components/motion-button";

const TOTAL_STEPS = 3;

export function PreferencesClient({
  diets,
  allergens,
}: {
  diets: Diet[];
  allergens: Allergen[];
}) {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const [allergenIds, setAllergenIds] = useState<string[]>([]);
  const [customAllergenInput, setCustomAllergenInput] = useState("");
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);
  const [dietIds, setDietIds] = useState<string[]>([]);
  const [dietCommitments, setDietCommitments] = useState<Record<string, DietCommitment>>({});

  const allergenGroups = useMemo(
    () =>
      groupAllergensByCategory(allergens).map((group) => ({
        label: group.label,
        options: group.allergens.map((a) => ({ value: a.id, label: a.name })),
      })),
    [allergens],
  );

  function toggleAllergen(id: string) {
    setAllergenIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  function toggleDiet(id: string) {
    setDietIds((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
      return next;
    });
    setDietCommitments((prev) => {
      if (dietIds.includes(id)) {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      }
      return { ...prev, [id]: "STRICT" };
    });
  }

  function addCustomAllergen() {
    // Support comma-separated entry in one go, per the onboarding copy:
    // "they can type multiple separating by a comma".
    const parts = customAllergenInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      setCustomAllergens((prev) => [...new Set([...prev, ...parts])]);
    }
    setCustomAllergenInput("");
  }

  function handleContinue() {
    const payload = { dietIds, dietCommitments, allergenIds, customAllergens };
    sessionStorage.setItem(ONBOARDING_PREFS_KEY, JSON.stringify(payload));
    router.push("/onboarding/personalize");
  }

  return (
    <OnboardingShell
      step={2}
      totalSteps={TOTAL_STEPS}
      title={t("preferences.title")}
      subtitle={t("preferences.subtitle")}
      footer={
        <div className="mt-8 flex gap-3">
          <MotionButton
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-ink shadow-brand"
          >
            {t("common.back")}
          </MotionButton>
          <MotionButton
            type="button"
            onClick={handleContinue}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-medium text-accent-ink shadow-brand"
          >
            {t("common.continue")}
          </MotionButton>
        </div>
      }
    >
      <div>
        <h3 className="text-sm font-bold text-ink">{t("preferences.allergies.heading")}</h3>
        <p className="mt-1 text-xs text-muted">
          {t("preferences.allergies.description")}
        </p>
        <div className="mt-3">
          <CategoryItemPicker
            groups={allergenGroups}
            selected={allergenIds}
            onToggle={toggleAllergen}
          />
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-ink">
            {t("preferences.allergies.otherLabel")}
          </label>
          <p className="mt-1 text-xs text-muted">
            {t("preferences.allergies.otherDescription")}
          </p>
          <div className="mt-2">
            <TagInput
              value={customAllergens}
              onAdd={addCustomAllergen}
              onRemove={(v) => setCustomAllergens((prev) => prev.filter((c) => c !== v))}
              input={customAllergenInput}
              onInputChange={setCustomAllergenInput}
              placeholder={t("preferences.allergies.otherPlaceholder")}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-sm font-bold text-ink">{t("preferences.diets.heading")}</h3>
        <p className="mt-1 text-xs text-muted">
          {t("preferences.diets.description")}
        </p>
        <div className="mt-3">
          <ChipGrid
            options={diets.map((d) => ({ value: d.id, label: d.name }))}
            selected={dietIds}
            onToggle={toggleDiet}
          />
        </div>
        {dietIds.length > 0 && (
          <div className="mt-3 space-y-3">
            {dietIds.map((id) => {
              const diet = diets.find((d) => d.id === id);
              if (!diet) return null;
              return (
                <DietCommitmentSlider
                  key={id}
                  dietName={diet.name}
                  value={dietCommitments[id] ?? "STRICT"}
                  onChange={(level) =>
                    setDietCommitments((prev) => ({ ...prev, [id]: level }))
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
