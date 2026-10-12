import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LOCALES } from "@/i18n/locales";

// Theme/language, changed from the accessibility menu (globe icon on
// login/signup, or the matching row above "Personalization" once logged
// in). Mirrors src/app/api/dashboard/refresh/route.ts's
// userPreferences.upsert pattern for persisting a single preference field.
const preferencesSchema = z.object({
  theme: z.enum(["LIGHT", "GREEN", "DARK"]).optional(),
  locale: z.enum(LOCALES).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = preferencesSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { theme, locale } = parsed.data;
  if (theme === undefined && locale === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Deliberately `update`, not `upsert`: this route is only reachable once
  // onboarded (the accessibility menu's logged-in entry point lives in
  // ProfileMenu, under AppHeader, which only renders post-onboarding — see
  // src/app/layout.tsx). Creating a UserPreferences row here if one didn't
  // exist would make `!!user.preferences` — this app's "onboarded" check —
  // true for a user who never actually finished onboarding.
  try {
    await prisma.userPreferences.update({
      where: { userId: session.user.id },
      data: { theme, locale },
    });
  } catch {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
