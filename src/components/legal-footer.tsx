"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function LegalFooter({ className = "" }: { className?: string }) {
  const t = useTranslations("legal.footer");

  return (
    <div className={`flex items-center justify-center gap-4 text-xs text-muted ${className}`}>
      <Link href="/privacy" className="hover:text-ink">
        {t("privacy")}
      </Link>
      <Link href="/terms" className="hover:text-ink">
        {t("terms")}
      </Link>
    </div>
  );
}
