import { prisma } from "@/lib/prisma";

type EnglishIngredient = {
  id: string;
  component: string | null;
  order: number;
  quantity: string;
  unit: string | null;
  item: string;
  prepNote: string | null;
  optional: boolean;
};

type EnglishStep = {
  id: string;
  order: number;
  text: string;
  durationMinutes: number | null;
};

type TranslatedIngredient = { item: string; prepNote: string | null; component: string | null };
type TranslatedStep = { text: string };

// Looks up a recipe's translation for the given locale, if one exists, and
// returns the fields to use for display — falling back to the English
// values wherever a translation is missing or unusable, so a partial or
// not-yet-translated recipe never shows blank/broken content (recipe
// translations roll out incrementally, locale by locale, recipe by
// recipe — see RecipeTranslation in prisma/schema.prisma).
//
// Title/shortDescription/note/introCopy/pairingSuggestion don't reference
// ingredient/step ordering, so they're used whenever a translation row
// exists at all. ingredients/steps are stored as JSON arrays aligned by
// array index to the English rows' `order` — only used when
// sourceContentVersion matches the recipe's current contentVersion;
// otherwise a prior edit may have reordered/added/removed
// ingredients/steps since the translation was generated, so this falls
// back to the English arrays rather than risk zipping translated text to
// the wrong ingredient or step.
export async function resolveRecipeContent({
  recipeId,
  contentVersion,
  locale,
  english,
}: {
  recipeId: string;
  contentVersion: number;
  locale: string;
  english: {
    title: string;
    shortDescription: string;
    note: string;
    introCopy: string;
    pairingSuggestion: string | null;
    ingredients: EnglishIngredient[];
    steps: EnglishStep[];
  };
}) {
  if (locale === "en") return english;

  const translation = await prisma.recipeTranslation.findUnique({
    where: { recipeId_locale: { recipeId, locale } },
  });

  if (!translation) return english;

  const translatedIngredients = translation.ingredients as unknown as TranslatedIngredient[];
  const translatedSteps = translation.steps as unknown as TranslatedStep[];
  const contentCurrent = translation.sourceContentVersion === contentVersion;

  const ingredients =
    contentCurrent && translatedIngredients.length === english.ingredients.length
      ? english.ingredients.map((ing, i) => ({
          ...ing,
          item: translatedIngredients[i].item,
          prepNote: translatedIngredients[i].prepNote,
          component: translatedIngredients[i].component,
        }))
      : english.ingredients;

  const steps =
    contentCurrent && translatedSteps.length === english.steps.length
      ? english.steps.map((step, i) => ({ ...step, text: translatedSteps[i].text }))
      : english.steps;

  return {
    title: translation.title,
    shortDescription: translation.shortDescription,
    note: translation.note,
    introCopy: translation.introCopy,
    pairingSuggestion: translation.pairingSuggestion,
    ingredients,
    steps,
  };
}
