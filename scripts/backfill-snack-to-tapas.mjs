// One-off script: migrates every Recipe still on the legacy mealSlot SNACK
// value over to TAPAS. SNACK predates the Tapas dashboard section and was
// marked "no longer assignable via the app — superseded by TAPAS" in the
// schema, but the recipes that were seeded under it were never moved, which
// left the Tapas section's `mealSlot: "TAPAS"` filter matching zero rows
// (even though plenty of tapas-appropriate content exists) while the SNACK
// value sat unused everywhere except these old rows.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.recipe.updateMany({
    where: { mealSlot: "SNACK" },
    data: { mealSlot: "TAPAS" },
  });
  console.log(`Migrated ${result.count} recipe(s) from SNACK to TAPAS.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
