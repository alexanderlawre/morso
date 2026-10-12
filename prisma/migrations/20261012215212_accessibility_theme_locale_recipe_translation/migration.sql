-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('LIGHT', 'GREEN', 'DARK');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "contentVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "theme" "ThemeMode" NOT NULL DEFAULT 'LIGHT';

-- CreateTable
CREATE TABLE "RecipeTranslation" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "introCopy" TEXT NOT NULL,
    "pairingSuggestion" TEXT,
    "ingredients" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "sourceContentVersion" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeTranslation_recipeId_locale_key" ON "RecipeTranslation"("recipeId", "locale");

-- AddForeignKey
ALTER TABLE "RecipeTranslation" ADD CONSTRAINT "RecipeTranslation_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
