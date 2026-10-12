"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Allergen, Diet, DietCommitment, FoodGroup } from "@prisma/client";
import { ChipGrid, TagInput, DietCommitmentSlider } from "../../onboarding/onboarding-ui";
import { FOOD_GROUP_CLUSTERS } from "@/lib/food-group-screens";
import { PageTransition } from "@/components/page-transition";
import { MotionButton } from "@/components/motion-button";
import { HowItWorksModal } from "@/components/how-it-works-modal";

const SUGGESTED_CUISINE_COUNT = 5;

const SPICE_OPTIONS: { value: number; key: "mild" | "medium" | "hot" }[] = [
  { value: 1, key: "mild" },
  { value: 2, key: "medium" },
  { value: 3, key: "hot" },
];

// Combined Preferences + Personalization form — allergies, diets, spice
// ceiling, food-group sliders, feedback, and favorite cuisines all live and
// save together in one place now, POSTing the full payload to
// /api/onboarding in a single save action.
export function PersonalizationForm({
  diets,
  allergens,
  foodGroups,
  initialDietIds,
  initialDietCommitments,
  initialAllergenIds,
  initialCustomAllergens,
  initialFavoriteCuisines,
  initialFoodGroupFeedback,
  initialClusterValues,
  initialSpiceMax,
}: {
  diets: Diet[];
  allergens: Allergen[];
  foodGroups: FoodGroup[];
  initialDietIds: string[];
  initialDietCommitments: Record<string, DietCommitment>;
  initialAllergenIds: string[];
  initialCustomAllergens: string[];
  initialFavoriteCuisines: string[];
  initialFoodGroupFeedback: string;
  initialClusterValues: number[];
  initialSpiceMax: number | null;
}) {
  const t = useTranslations("settings.personalization");
  const router = useRouter();

  const [dietIds, setDietIds] = useState<string[]>(initialDietIds);
  const [dietCommitments, setDietCommitments] =
    useState<Record<string, DietCommitment>>(initialDietCommitments);
  const [allergenIds, setAllergenIds] = useState<string[]>(initialAllergenIds);
  const [customAllergenInput, setCustomAllergenInput] = useState("");
  const [customAllergens, setCustomAllergens] = useState<string[]>(initialCustomAllergens);
  const [spiceMax, setSpiceMax] = useState<number | null>(initialSpiceMax);
  const [clusterValues, setClusterValues] = useState<number[]>(initialClusterValues);
  const [feedback, setFeedback] = useState(initialFoodGroupFeedback);
  const [cuisineInput, setCuisineInput] = useState("");
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>(initialFavoriteCuisines);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const foodGroupByName = useMemo(() => {
    const map = new Map<string, FoodGroup>();
    for (const fg of foodGroups) map.set(fg.name, fg);
    return map;
  }, [foodGroups]);

  function toggleDiet(id: string) {
    setSaved(false);
    setDietIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
    setDietCommitments((prev) => {
      if (dietIds.includes(id)) {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      }
      return { ...prev, [id]: "STRICT" };
    });
  }

  function toggleAllergen(id: string) {
    setSaved(false);
    setAllergenIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  function addCustomAllergen() {
    const parts = customAllergenInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      setSaved(false);
      setCustomAllergens((prev) => [...new Set([...prev, ...parts])]);
    }
    setCustomAllergenInput("");
  }

  function addCuisines() {
    const parts = cuisineInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      setSaved(false);
      setFavoriteCuisines((prev) => [...new Set([...prev, ...parts])]);
    }
    setCuisineInput("");
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const meters: Record<string, number> = {};
    FOOD_GROUP_CLUSTERS.forEach((cluster, i) => {
      const value = clusterValues[i];
      for (const groupName of cluster.groups) {
        const fg = foodGroupByName.get(groupName);
        if (fg) meters[fg.id] = value;
      }
    });

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diets: dietIds.map((id) => ({
            dietId: id,
            commitment: dietCommitments[id] ?? "STRICT",
          })),
          allergenIds,
          customAllergens,
          meters,
          favoriteCuisines,
          foodGroupFeedback: feedback.trim() || null,
          spiceMax,
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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 pb-content-safe">
      <PageTransition>
        <h1 className="text-xl font-bold tracking-tight text-ink">{t("heading")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subheading")}</p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <h3 className="text-sm font-bold text-ink">{t("howMorsoLearns.title")}</h3>
          <p className="mt-1 text-xs text-muted">{t("howMorsoLearns.body")}</p>
          <button
            type="button"
            onClick={() => setShowHowItWorks(true)}
            className="mt-2 text-xs font-medium text-link underline"
          >
            {t("howMorsoLearns.seeHowItWorks")}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <h3 className="text-sm font-bold text-ink">{t("allergies.title")}</h3>
          <p className="mt-1 text-xs text-muted">{t("allergies.body")}</p>
          <div className="mt-3">
            <ChipGrid
              options={allergens.map((a) => ({ value: a.id, label: a.name }))}
              selected={allergenIds}
              onToggle={toggleAllergen}
            />
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-ink">
              {t("allergies.otherLabel")}
            </label>
            <p className="mt-1 text-xs text-muted">{t("allergies.otherHelp")}</p>
            <div className="mt-2">
              <TagInput
                value={customAllergens}
                onAdd={addCustomAllergen}
                onRemove={(v) => {
                  setSaved(false);
                  setCustomAllergens((prev) => prev.filter((c) => c !== v));
                }}
                input={customAllergenInput}
                onInputChange={setCustomAllergenInput}
                placeholder={t("allergies.otherPlaceholder")}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <h3 className="text-sm font-bold text-ink">{t("diets.title")}</h3>
          <p className="mt-1 text-xs text-muted">{t("diets.body")}</p>
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
                    onChange={(level) => {
                      setSaved(false);
                      setDietCommitments((prev) => ({ ...prev, [id]: level }));
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <h3 className="text-sm font-bold text-ink">{t("spice.title")}</h3>
          <p className="mt-1 text-xs text-muted">{t("spice.body")}</p>
          <div className="mt-3">
            <ChipGrid
              options={SPICE_OPTIONS.map((o) => ({
                value: String(o.value),
                label: t(`spice.${o.key}`),
              }))}
              selected={spiceMax === null ? [] : [String(spiceMax)]}
              onToggle={(value) => {
                setSaved(false);
                const numeric = Number(value);
                setSpiceMax((prev) => (prev === numeric ? null : numeric));
              }}
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <h3 className="text-sm font-bold text-ink">{t("foodGroups.title")}</h3>
          <p className="mt-1 text-xs text-muted">{t("foodGroups.body")}</p>
          <div className="mt-4 space-y-6">
            {FOOD_GROUP_CLUSTERS.map((cluster, i) => (
              <div key={cluster.title}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{cluster.title}</span>
                  <span className="text-muted">{clusterValues[i]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={clusterValues[i]}
                  onChange={(e) => {
                    setSaved(false);
                    const next = [...clusterValues];
                    next[i] = Number(e.target.value);
                    setClusterValues(next);
                  }}
                  className="mt-2 w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>{t("foodGroups.rarely")}</span>
                  <span>{t("foodGroups.constantly")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <label className="block text-sm font-medium text-ink">
            {t("feedback.label")}
          </label>
          <p className="mt-1 text-xs text-muted">{t("feedback.help")}</p>
          <textarea
            value={feedback}
            onChange={(e) => {
              setSaved(false);
              setFeedback(e.target.value);
            }}
            rows={2}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <label className="block text-sm font-medium text-ink">
            {t("cuisines.label")}
          </label>
          <p className="mt-1 text-xs text-muted">
            {t("cuisines.help", { count: SUGGESTED_CUISINE_COUNT })}
          </p>
          <div className="mt-2">
            <TagInput
              value={favoriteCuisines}
              onAdd={addCuisines}
              onRemove={(v) => {
                setSaved(false);
                setFavoriteCuisines((prev) => prev.filter((c) => c !== v));
              }}
              input={cuisineInput}
              onInputChange={setCuisineInput}
              placeholder={t("cuisines.placeholder")}
            />
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-danger">{error}</p>}

        <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
          <MotionButton
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-ink shadow-brand transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? t("saving") : t("save")}
          </MotionButton>
          {saved && <span className="text-sm text-accent">{t("saved")}</span>}
        </div>
      </PageTransition>

      <HowItWorksModal open={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </main>
  );
}
