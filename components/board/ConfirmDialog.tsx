"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export type ConfirmTone = "danger" | "default";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
      } else if (e.key === "Enter") {
        e.stopPropagation();
        onConfirm();
      }
    };
    window.addEventListener("keydown", onKey, true);
    confirmRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onCancel, onConfirm]);

  const confirmClasses =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-300"
      : "bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-300";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/55 backdrop-blur-sm px-4"
          onClick={onCancel}
          role="presentation"
        >
          <motion.div
            key="confirm-panel"
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={description ? "confirm-desc" : undefined}
            className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_rgba(40,30,55,0.32)] ring-1 ring-stone-200"
          >
            <div className="flex items-start gap-4 px-6 pt-6 pb-2">
              <div
                className={
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full " +
                  (tone === "danger"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-violet-50 text-violet-600")
                }
                aria-hidden
              >
                {icon ?? <DefaultIcon tone={tone} />}
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="confirm-title"
                  className="text-base font-semibold tracking-tight text-stone-900"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="confirm-desc"
                    className="mt-1 text-sm leading-relaxed text-stone-600"
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 pb-5 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-stone-200 bg-white px-4 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={onConfirm}
                className={
                  "rounded-md px-4 py-1.5 text-sm font-medium text-white shadow-sm transition focus:outline-none focus-visible:ring-2 " +
                  confirmClasses
                }
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DefaultIcon({ tone }: { tone: ConfirmTone }) {
  if (tone === "danger") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}
