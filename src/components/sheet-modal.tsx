"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

// Generic modal primitive: bottom sheet on mobile, centered card on
// desktop — matching the layout the app's ad-hoc modals (Cosign, recipe
// editor, submission review) already use, but with an animated
// backdrop-fade + sheet-rise/scale-in transition instead of an instant
// mount/unmount. Wrap AnimatePresence around the call site so `open`
// toggling animates out before unmounting.
//
// Rendered via a portal straight to document.body: `fixed` only positions
// relative to the viewport when every ancestor is free of a `transform`,
// but framer-motion leaves a persistent inline `transform` on an animated
// ancestor even at rest. Any caller nested inside another animated
// motion.div (e.g. the accessibility dropdown) would otherwise anchor this
// modal to that ancestor's box instead of the real viewport.
export function SheetModal({
  open,
  onClose,
  children,
  panelClassName = "",
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  panelClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={`w-full max-w-sm rounded-t-2xl bg-surface px-5 pt-5 pb-safe-5 text-ink shadow-lifted sm:rounded-2xl ${panelClassName}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Server-render/initial-render with nothing (document.body isn't
  // available yet); the portal takes over on the client right after mount.
  // Modals are never needed for the pre-hydration HTML, so this never
  // causes a visible flash.
  if (!mounted) return null;
  return createPortal(modal, document.body);
}
