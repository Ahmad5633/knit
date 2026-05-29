"use client";

import { useId, useState, type ReactElement } from "react";
import { cn } from "@/lib/cn";

type Side = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  label: string;
  side?: Side;
  /** Optional secondary text shown muted below the label. */
  hint?: string;
  /** Show after this delay (ms). Defaults to 350. */
  delay?: number;
  className?: string;
  disabled?: boolean;
  children: ReactElement;
}

const SIDE_POSITION: Record<Side, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const SIDE_ARROW: Record<Side, string> = {
  top: "top-full left-1/2 -translate-x-1/2 -mt-px border-t-stone-900 border-x-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 -mb-px border-b-stone-900 border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 -ml-px border-l-stone-900 border-y-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 -mr-px border-r-stone-900 border-y-transparent border-l-transparent",
};

/**
 * Lightweight tooltip with focus + hover triggers. Hides itself on pointer
 * down so it never lingers during a drag interaction. Pure CSS positioning
 * — no portal, no measurement — fine for short labels.
 */
export function Tooltip({
  label,
  side = "top",
  hint,
  delay = 350,
  className,
  disabled,
  children,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ReturnType<typeof setTimeout> | null>(
    null,
  );

  if (disabled) return children;

  const show = () => {
    if (pending) clearTimeout(pending);
    const t = setTimeout(() => setOpen(true), delay);
    setPending(t);
  };

  const hide = () => {
    if (pending) {
      clearTimeout(pending);
      setPending(null);
    }
    setOpen(false);
  };

  return (
    <span
      className={cn("relative inline-flex", className)}
      onPointerEnter={show}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      <span aria-describedby={open ? id : undefined} className="contents">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        aria-hidden={!open}
        className={cn(
          "pointer-events-none absolute z-[300] whitespace-nowrap rounded-md bg-stone-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-stone-900/10 transition-all duration-150",
          SIDE_POSITION[side],
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-[2px] scale-95",
        )}
      >
        {label}
        {hint && (
          <span className="mt-0.5 block text-[10px] font-normal text-stone-300">
            {hint}
          </span>
        )}
        <span
          aria-hidden
          className={cn(
            "absolute h-0 w-0 border-[5px]",
            SIDE_ARROW[side],
          )}
        />
      </span>
    </span>
  );
}
