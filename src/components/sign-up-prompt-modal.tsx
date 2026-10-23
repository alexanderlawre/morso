"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SheetModal } from "@/components/sheet-modal";

// Shown instead of performing an account-only action (save/star a recipe,
// "Cook Later", "I cooked this") when a guest (not logged in) triggers it —
// one generic prompt reused for all three, rather than separate copy per
// action, to keep the new i18n surface small. The server independently
// enforces the same 401 on every one of these actions regardless of this
// modal (see /api/saved-recipes, /api/cook) — this is purely a UX nicety,
// not the security boundary.
export function SignUpPromptModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("guest");

  return (
    <SheetModal open={open} onClose={onClose}>
      <p className="text-lg font-bold text-ink">{t("signUpPrompt.title")}</p>
      <p className="mt-2 text-sm text-muted">{t("signUpPrompt.body")}</p>
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink shadow-brand transition hover:bg-hover"
        >
          {t("signUpPrompt.maybeLater")}
        </button>
        <Link
          href="/signup"
          onClick={onClose}
          className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-ink shadow-brand transition hover:opacity-90"
        >
          {t("signUpPrompt.createAccount")}
        </Link>
      </div>
    </SheetModal>
  );
}
