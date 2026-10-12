"use client";

import { useTranslations } from "next-intl";
import { SheetModal } from "@/components/sheet-modal";

// The "Use -> Signal -> Recommendations sharpen" learning-loop explainer —
// shared by the profile menu ("How Morso works") and the Settings ->
// Personalization page ("See how it works" link), so there's exactly one
// place this copy/design lives.
const STEP_KEYS = ["use", "signal", "sharpen"] as const;

export function HowItWorksModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("howItWorks");

  return (
    <SheetModal open={open} onClose={onClose}>
      <p className="text-lg font-bold text-ink">{t("title")}</p>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>

      <div className="mt-5 space-y-5">
        {STEP_KEYS.map((key, i) => (
          <div key={key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-ink">
                {i + 1}
              </div>
              {i < STEP_KEYS.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="pb-1">
              <p className="text-sm font-bold text-ink">{t(`steps.${key}.title`)}</p>
              <p className="mt-0.5 text-xs text-muted">{t(`steps.${key}.caption`)}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs italic text-muted">{t("footer")}</p>

      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink shadow-brand transition hover:bg-hover"
      >
        {t("gotIt")}
      </button>
    </SheetModal>
  );
}
