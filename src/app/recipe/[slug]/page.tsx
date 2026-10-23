import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { savedRecipeExpiryCutoff } from "@/lib/saved-recipes";
import { resolveRecipeContent } from "@/lib/recipe-translation";
import { AppHeader } from "@/components/app-header";
import { RecipeDetailClient } from "./recipe-detail-client";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (session?.user && !session.user.onboarded) redirect("/onboarding");

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      subRecipes: { orderBy: { order: "asc" } },
      cuisine: true,
      allergenTags: true,
      attributeTags: true,
      dietTags: true,
    },
  });

  if (!recipe || !recipe.isActive) notFound();

  const userId = session?.user?.id ?? null;
  const [saved, preferences] = userId
    ? await Promise.all([
        prisma.savedRecipe.findUnique({
          where: { userId_recipeId: { userId, recipeId: recipe.id } },
        }),
        prisma.userPreferences.findUnique({
          where: { userId },
          include: { allergens: true },
        }),
      ])
    : [null, null];
  const isSavedAndFresh = !!saved && saved.savedAt >= savedRecipeExpiryCutoff();

  const declaredAllergens = preferences?.allergens.map((a) => a.name) ?? [];
  const declaredCustomAllergens = preferences?.customAllergens ?? [];
  const recipeAllergenNames = recipe.allergenTags.map((a) => a.name);
  const ingredientItemsLower = recipe.ingredients.map((i) => i.item.toLowerCase());

  const hasCatalogConflict = recipeAllergenNames.some((name) =>
    declaredAllergens.includes(name),
  );
  const hasCustomConflict = declaredCustomAllergens.some((term) => {
    const lower = term.trim().toLowerCase();
    return lower.length > 0 && ingredientItemsLower.some((item) => item.includes(lower));
  });
  const hasUnverifiedConflict =
    (declaredAllergens.length > 0 || declaredCustomAllergens.length > 0) &&
    recipe.allergenReviewStatus !== "VERIFIED";
  const allergyWarning = hasCatalogConflict || hasCustomConflict || hasUnverifiedConflict;

  const t = await getTranslations("recipe");
  const locale = await getLocale();
  const content = await resolveRecipeContent({
    recipeId: recipe.id,
    contentVersion: recipe.contentVersion,
    locale,
    english: {
      title: recipe.title,
      shortDescription: recipe.shortDescription,
      note: recipe.note,
      introCopy: recipe.introCopy,
      pairingSuggestion: recipe.pairingSuggestion,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
    },
  });

  const recipeDetail = {
    id: recipe.id,
    title: content.title,
    shortDescription: content.shortDescription,
    note: content.note,
    introCopy: content.introCopy,
    servings: recipe.servings,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine.name,
    effortTier: recipe.effortTier,
    ingredients: content.ingredients,
    steps: content.steps,
    subRecipes: recipe.subRecipes as unknown as {
      id: string;
      order: number;
      title: string;
      ingredients: { quantity: string; unit: string | null; item: string }[];
      steps: string[];
    }[],
    imageUrl: recipe.imageUrl,
    imageCredit: recipe.imageCredit,
    caloriesPerServing: recipe.caloriesPerServing,
    proteinGrams: recipe.proteinGrams,
    carbsGrams: recipe.carbsGrams,
    fatGrams: recipe.fatGrams,
    fiberGrams: recipe.fiberGrams,
    cholesterolMg: recipe.cholesterolMg,
    pairingSuggestion: content.pairingSuggestion,
    attributes: recipe.attributeTags.map((a) => a.code),
    dietTags: recipe.dietTags.map((d) => d.name),
    allergenTags: recipeAllergenNames,
    allergenReviewStatus: recipe.allergenReviewStatus,
  };

  return (
    <>
      {!session?.user && <AppHeader isGuest />}
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        {allergyWarning && (
          <div className="mb-6 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            <p className="font-bold">{t("allergenWarning.title")}</p>
            <p className="mt-1">{t("allergenWarning.body")}</p>
          </div>
        )}
        <RecipeDetailClient
          recipe={recipeDetail}
          initialSaved={isSavedAndFresh}
          isPremium={session?.user?.isPremium ?? false}
          isGuest={!session?.user}
        />
      </main>
    </>
  );
}
