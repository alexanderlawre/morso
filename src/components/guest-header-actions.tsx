"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AccessibilityMenu } from "@/components/accessibility-menu";

// Guest (not logged in) header actions: the same standalone accessibility
// circle the pre-login screens use (see (auth)/layout.tsx) plus Log
// in/Sign up links, replacing the account menu. Logical properties (gap-*,
// no left/right) so RTL mirroring stays automatic, same as ProfileMenu.
export function GuestHeaderActions() {
  const t = useTranslations("guest");
  return (
    <div className="flex items-center gap-2">
      <AccessibilityMenu />
      <Link
        href="/login"
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink shadow-brand transition hover:bg-hover"
      >
        {t("header.logIn")}
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink shadow-brand transition hover:opacity-90"
      >
        {t("header.signUp")}
      </Link>
    </div>
  );
}
