import { getTranslations } from "next-intl/server";
import { RecipeCardShell, type SavedRecipeData } from "@/components/recipe-card-shell";
import { PageTransition } from "@/components/page-transition";
import { getInitials } from "@/lib/avatar";

export type PublicCookbook = {
  id: string;
  name: string;
  coverImageUrl: string | null;
  recipes: SavedRecipeData[];
};

// Purely presentational — no client-side state needed for a read-only view,
// so this stays a plain (server-renderable) component even though it
// renders client leaves like RecipeCardShell/PageTransition.
export async function PublicProfileClient({
  name,
  image,
  cookbooks,
}: {
  name: string;
  image: string | null;
  cookbooks: PublicCookbook[];
}) {
  const t = await getTranslations("profile.public");
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <PageTransition>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-lg font-semibold text-accent-ink">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(name)
            )}
          </div>
          <h1 className="text-2xl font-bold text-ink">{name}</h1>
        </div>

        {cookbooks.length === 0 ? (
          <p className="mt-10 text-sm text-muted">{t("noCookbooks")}</p>
        ) : (
          cookbooks.map((cookbook) => (
            <div key={cookbook.id} className="mt-10">
              <div className="flex items-center gap-3">
                {cookbook.coverImageUrl && (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-hover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cookbook.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <h2 className="text-lg font-bold text-ink">{cookbook.name}</h2>
              </div>

              {cookbook.recipes.length === 0 ? (
                <p className="mt-3 text-sm text-muted">{t("noRecipesInCookbook")}</p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {cookbook.recipes.map((recipe) => (
                    <RecipeCardShell key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </PageTransition>
    </main>
  );
}
