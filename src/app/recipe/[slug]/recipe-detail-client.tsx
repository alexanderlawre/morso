"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { logInteraction } from "@/lib/log-interaction";
import {
  attributeLabel,
  dietEmblemClass,
  visibleDietEmblems,
  COMPLETE_THE_MEAL_COMPONENT,
} from "@/lib/recipe-tags";
import { scaleQuantity } from "@/lib/quantity";
import { MotionButton } from "@/components/motion-button";
import { PageTransition } from "@/components/page-transition";
import { SheetModal } from "@/components/sheet-modal";

type Ingredient = {
  id: string;
  component: string | null;
  order: number;
  quantity: string;
  unit: string | null;
  item: string;
  prepNote: string | null;
  optional: boolean;
};

type Step = {
  id: string;
  order: number;
  text: string;
  durationMinutes: number | null;
};

type SubRecipe = {
  id: string;
  order: number;
  title: string;
  ingredients: { quantity: string; unit: string | null; item: string }[];
  steps: string[];
};

export type RecipeDetail = {
  id: string;
  title: string;
  shortDescription: string;
  note: string;
  introCopy: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: string;
  cuisine: string;
  effortTier: string;
  ingredients: Ingredient[];
  steps: Step[];
  subRecipes: SubRecipe[];
  imageUrl: string | null;
  imageCredit: string | null;
  caloriesPerServing: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
  fiberGrams: number | null;
  cholesterolMg: number | null;
  pairingSuggestion: string | null;
  attributes: string[];
  dietTags: string[];
  allergenTags: string[];
  allergenReviewStatus: string;
};

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z" />
    </svg>
  );
}

export function RecipeDetailClient({
  recipe,
  initialSaved = false,
  isPremium = false,
}: {
  recipe: RecipeDetail;
  initialSaved?: boolean;
  isPremium?: boolean;
}) {
  const t = useTranslations("recipe");
  const [servings, setServings] = useState(recipe.servings);
  const [starred, setStarred] = useState(initialSaved);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cookLogId, setCookLogId] = useState<string | null>(null);
  const [showCosign, setShowCosign] = useState(false);
  const [cosignNote, setCosignNote] = useState("");
  const [cooking, setCooking] = useState(false);
  const [cookError, setCookError] = useState<string | null>(null);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [justCooked, setJustCooked] = useState(false);
  const [openSubRecipeIds, setOpenSubRecipeIds] = useState<Set<string>>(new Set());

  function toggleSubRecipe(id: string) {
    setOpenSubRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    // Log OPEN once when the detail page is actually reached, not on link hover/prefetch.
    logInteraction(recipe.id, "OPEN");
  }, [recipe.id]);

  const factor = servings / recipe.servings;

  const hasMacros =
    recipe.caloriesPerServing != null ||
    recipe.proteinGrams != null ||
    recipe.carbsGrams != null ||
    recipe.fatGrams != null ||
    recipe.fiberGrams != null ||
    recipe.cholesterolMg != null;

  const dietEmblems = visibleDietEmblems(recipe.dietTags);
  const isAllergenUnverified = recipe.allergenReviewStatus !== "VERIFIED";
  // Nutrition totals scale directly with the servings stepper, same as the
  // ingredient quantities below — these are the totals for however many
  // servings you're currently making, not fixed per-serving figures.
  const scaledMacro = (perServing: number | null) =>
    perServing == null ? null : Math.round(perServing * servings);

  const grouped = recipe.ingredients.reduce<Record<string, Ingredient[]>>(
    (acc, ing) => {
      const key = ing.component ?? "__main";
      (acc[key] ??= []).push(ing);
      return acc;
    },
    {},
  );

  async function toggleStar() {
    const next = !starred;
    setStarred(next);
    setSaveError(null);
    logInteraction(recipe.id, next ? "STAR" : "UNSTAR");

    try {
      const res = next
        ? await fetch("/api/saved-recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId: recipe.id }),
          })
        : await fetch(`/api/saved-recipes/${recipe.id}`, { method: "DELETE" });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setStarred(!next);
        setSaveError(body?.error ?? t("errors.somethingWentWrong"));
      }
    } catch {
      setStarred(!next);
      setSaveError(t("errors.somethingWentWrong"));
    }
  }

  async function handleCook() {
    setCooking(true);
    setCookError(null);
    try {
      const res = await fetch("/api/cook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: recipe.id, servings }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 429) {
        const nextAvailableAt = data?.nextAvailableAt as string | undefined;
        const when = nextAvailableAt
          ? new Date(nextAvailableAt).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })
          : t("errors.timeFallback");
        setCookError(t("errors.cookRateLimited", { when }));
        return;
      }

      if (!res.ok) {
        setCookError(t("errors.cookFailed"));
        return;
      }

      setCookLogId(data?.cookLogId ?? null);
      setShowCosign(true);
      setJustCooked(true);
      setTimeout(() => setJustCooked(false), 1400);
    } catch {
      setCookError(t("errors.cookFailed"));
    } finally {
      setCooking(false);
    }
  }

  async function submitCosign(share: boolean) {
    if (!cookLogId) {
      setShowCosign(false);
      return;
    }
    await fetch("/api/cook/cosign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cookLogId,
        note: share ? cosignNote || undefined : undefined,
        isPublic: share,
      }),
    });
    setShowCosign(false);
    setCosignNote("");
  }

  return (
    <PageTransition className="pb-content-safe">
      {recipe.imageUrl ? (
        <div className="-mx-6 sm:mx-0">
          <motion.div
            className="relative h-56 w-full overflow-hidden sm:rounded-2xl"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              sizes="(min-width: 640px) 42rem, 100vw"
              className="object-cover"
              priority
            />
          </motion.div>
          {recipe.imageCredit && (
            <p className="mt-1 px-6 text-right text-[10px] text-muted sm:px-0">
              {t("imageCredit", { credit: recipe.imageCredit })}
            </p>
          )}
        </div>
      ) : null}

      <p className="mt-4 text-xs font-extralight uppercase tracking-wide text-muted">{recipe.cuisine}</p>
      <h1 className="mt-1 text-2xl font-bold text-ink">{recipe.title}</h1>
      <p className="mt-2 text-sm text-ink">{recipe.introCopy}</p>
      <p className="mt-1 text-xs italic text-muted">{recipe.note}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-muted">
        <span className="rounded-full bg-hover px-2 py-1">{recipe.effortTier}</span>
        <span className="rounded-full bg-hover px-2 py-1">
          {t("prepCookTime", { prep: recipe.prepMinutes, cook: recipe.cookMinutes })}
        </span>
      </div>

      {(dietEmblems.length > 0 || recipe.allergenTags.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {dietEmblems.map((diet) => (
            <span
              key={diet}
              className={`rounded-full px-2 py-1 font-medium ${dietEmblemClass(diet)}`}
            >
              {diet}
            </span>
          ))}
          {recipe.allergenTags.map((allergen) => (
            <span
              key={allergen}
              className="rounded-full border border-danger bg-danger-soft px-2 py-1 font-bold text-danger"
            >
              {t("allergenBadge", { allergen })}
            </span>
          ))}
        </div>
      )}
      {isAllergenUnverified && (recipe.allergenTags.length > 0 || recipe.dietTags.length > 0) && (
        <p className="mt-1 text-[11px] italic text-muted">{t("allergenUnverified")}</p>
      )}

      {recipe.attributes.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setTagsOpen((v) => !v)}
            aria-expanded={tagsOpen}
            className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-link"
          >
            {t("tagsToggle")}
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-3.5 w-3.5"
              animate={{ rotate: tagsOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </motion.svg>
          </button>
          <AnimatePresence initial={false}>
            {tagsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                  {recipe.attributes.map((a) => (
                    <span key={a} className="rounded-full bg-hover px-2 py-1 text-muted">
                      {attributeLabel(a)}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {hasMacros && (
        <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">{t("sections.nutrition")}</h2>
            <span className="text-[11px] font-extralight text-muted">
              {t("nutritionFor", { count: servings })}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-semibold text-ink">
                {scaledMacro(recipe.caloriesPerServing) ?? "—"}
              </p>
              <p className="text-[10px] font-extralight uppercase tracking-wide text-muted">{t("nutrition.calories")}</p>
            </div>
            <div>
              <p className="text-base font-semibold text-ink">
                {scaledMacro(recipe.proteinGrams) ?? "—"}g
              </p>
              <p className="text-[10px] font-extralight uppercase tracking-wide text-muted">{t("nutrition.protein")}</p>
            </div>
            <div>
              <p className="text-base font-semibold text-ink">
                {scaledMacro(recipe.carbsGrams) ?? "—"}g
              </p>
              <p className="text-[10px] font-extralight uppercase tracking-wide text-muted">{t("nutrition.carbs")}</p>
            </div>
          </div>

          {(recipe.fatGrams != null || recipe.fiberGrams != null || recipe.cholesterolMg != null) && (
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              {isPremium ? (
                <>
                  <div>
                    <p className="text-base font-semibold text-ink">
                      {scaledMacro(recipe.fatGrams) ?? "—"}g
                    </p>
                    <p className="text-[10px] font-extralight uppercase tracking-wide text-muted">{t("nutrition.fat")}</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-ink">
                      {scaledMacro(recipe.fiberGrams) ?? "—"}g
                    </p>
                    <p className="text-[10px] font-extralight uppercase tracking-wide text-muted">{t("nutrition.fiber")}</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-ink">
                      {scaledMacro(recipe.cholesterolMg) ?? "—"}mg
                    </p>
                    <p className="text-[10px] font-extralight uppercase tracking-wide text-muted">
                      {t("nutrition.cholesterol")}
                    </p>
                  </div>
                </>
              ) : (
                <div className="col-span-3 flex items-center justify-center gap-1.5 rounded-xl bg-hover px-2 py-2">
                  <LockIcon className="h-3 w-3 shrink-0 text-muted" />
                  <p className="text-[11px] text-muted">
                    {t("nutrition.premiumLock")}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{t("sections.ingredients")}</h2>
          <div className="flex items-center gap-2">
            <MotionButton
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-base"
              aria-label={t("servingsStepper.decrease")}
            >
              −
            </MotionButton>
            <motion.span
              key={servings}
              initial={{ scale: 1.25, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
              className="inline-block text-sm text-ink"
            >
              {t("servingsStepper.count", { count: servings })}
            </motion.span>
            <MotionButton
              onClick={() => setServings((s) => s + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-base"
              aria-label={t("servingsStepper.increase")}
            >
              +
            </MotionButton>
          </div>
        </div>

        {Object.entries(grouped).map(([component, items]) => (
          <div key={component} className="mt-3">
            {component !== "__main" && (
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {component}
              </p>
            )}
            {/* Keyed on servings so the whole list visibly refreshes (a brief
                opacity fade) in sync with the counter's own bounce above —
                previously only the counter animated while these scaled
                quantities changed silently underneath it. */}
            <motion.ul
              key={servings}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-1 space-y-1"
            >
              {[...items]
                .sort((a, b) => a.order - b.order)
                .map((ing) => (
                  <li key={ing.id} className="text-sm font-semibold text-ink">
                    {scaleQuantity(ing.quantity, factor)} {ing.unit ?? ""} {ing.item}
                    {ing.optional && (
                      <span className="text-muted"> ({t("ingredientOptional")})</span>
                    )}
                    {ing.prepNote && (
                      <span className="text-muted">, {ing.prepNote}</span>
                    )}
                  </li>
                ))}
            </motion.ul>
          </div>
        ))}
      </section>

      {recipe.subRecipes.length > 0 && (
        <section className="mt-4 space-y-2">
          {recipe.subRecipes.map((sub) => {
            const open = openSubRecipeIds.has(sub.id);
            return (
              <div key={sub.id}>
                <button
                  onClick={() => toggleSubRecipe(sub.id)}
                  aria-expanded={open}
                  className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-link"
                >
                  {t("subRecipe.toggle", {
                    title: sub.title.replace(/^Make (your own |)/i, ""),
                  })}
                  <motion.svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-3.5 w-3.5"
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 rounded-xl border border-border bg-surface p-3">
                        <p className="text-sm font-semibold text-ink">{sub.title}</p>
                        <ul className="mt-2 space-y-1">
                          {sub.ingredients.map((ing, i) => (
                            <li key={i} className="text-sm font-semibold text-ink">
                              {ing.quantity} {ing.unit ?? ""} {ing.item}
                            </li>
                          ))}
                        </ul>
                        <ol className="mt-3 space-y-2">
                          {sub.steps.map((text, i) => (
                            <li key={i} className="text-sm text-ink">
                              <span className="font-medium">{i + 1}.</span> {text}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-bold text-ink">{t("sections.method")}</h2>
        <ol className="mt-2 space-y-3">
          {[...recipe.steps]
            .sort((a, b) => a.order - b.order)
            .map((step, i) => (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="text-sm text-ink"
              >
                <span className="font-medium">{step.order}.</span> {step.text}
                {step.durationMinutes && (
                  <span className="ml-2 text-xs text-muted">
                    {t("stepDuration", { minutes: step.durationMinutes })}
                  </span>
                )}
              </motion.li>
            ))}
        </ol>
      </section>

      {(() => {
        const completeItems = grouped[COMPLETE_THE_MEAL_COMPONENT];
        if (!completeItems?.length && !recipe.pairingSuggestion) return null;
        return (
          <div className="mt-6 rounded-2xl bg-hover p-4">
            <h2 className="text-sm font-bold text-ink">{t("sections.completeTheMeal")}</h2>
            {completeItems?.length ? (
              <p className="mt-1 text-sm text-ink">
                {completeItems.map((i) => i.item).join(", ")}
              </p>
            ) : null}
            {recipe.pairingSuggestion && (
              <p className="mt-1 text-xs italic text-muted">{recipe.pairingSuggestion}</p>
            )}
          </div>
        );
      })()}

      {(saveError || cookError) && (
        <p className="fixed inset-x-0 bottom-20 mx-auto w-fit rounded-lg bg-[#101010] px-3 py-2 text-xs text-white shadow-sm">
          {saveError || cookError}
        </p>
      )}

      <div className="glass-surface fixed inset-x-0 bottom-0 flex items-center justify-center gap-3 border-x-0 border-b-0 px-4 pt-4 pb-safe-4">
        <MotionButton
          onClick={toggleStar}
          whileTap={{ scale: 0.94 }}
          className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-brand ${
            starred
              ? "border-accent bg-hover text-accent"
              : "border-border text-ink"
          }`}
        >
          <motion.span
            key={starred ? "on" : "off"}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="inline-block"
          >
            {starred ? "★" : "☆"}
          </motion.span>{" "}
          {t("actions.cookLater")}
        </MotionButton>
        <MotionButton
          onClick={handleCook}
          disabled={cooking}
          animate={justCooked ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-xl bg-accent px-4 py-3 text-sm font-medium text-accent-ink shadow-brand disabled:opacity-50"
        >
          {cooking
            ? t("actions.logging")
            : justCooked
              ? t("actions.logged")
              : t("actions.iCookedThis")}
        </MotionButton>
      </div>

      <SheetModal open={showCosign} onClose={() => submitCosign(false)}>
        <h3 className="text-lg font-bold text-ink">{t("cosign.title")}</h3>
        <p className="mt-1 text-sm text-muted">{t("cosign.prompt")}</p>
        <textarea
          value={cosignNote}
          onChange={(e) => setCosignNote(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-xl border border-border p-2 text-base"
          placeholder={t("cosign.placeholder")}
        />
        <div className="mt-4 flex justify-end gap-2">
          <MotionButton
            onClick={() => submitCosign(false)}
            className="rounded-xl border border-border px-4 py-3 text-sm text-ink shadow-brand"
          >
            {t("cosign.skip")}
          </MotionButton>
          <MotionButton
            onClick={() => submitCosign(true)}
            className="rounded-xl bg-accent px-4 py-3 text-sm font-medium text-accent-ink shadow-brand"
          >
            {t("cosign.share")}
          </MotionButton>
        </div>
      </SheetModal>
    </PageTransition>
  );
}
