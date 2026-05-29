import { useId } from "react";
import { cn } from "@/lib/cn";

interface PebbleProps {
  className?: string;
  variant?: 0 | 1 | 2 | 3 | 4 | 5;
  children?: React.ReactNode;
}

// 0: rounded triangle (apex top, flat-ish bottom) — for feathers
// 1: rounded oval / circle — for yarn
// 2: squircle (rounded square) — for landscapes
// 3: rounded triangle (lean variant) — for feathers
// 4: rounded rectangle (squat squircle) — for landscapes
// 5: pebble (irregular oval) — for yarn
const PATHS = [
  "M50 8 C58 8 64 14 76 34 C86 52 92 68 88 80 C84 92 68 96 50 96 C32 96 16 92 12 80 C8 68 14 52 24 34 C36 14 42 8 50 8 Z",
  "M50 8 C74 8 92 26 92 50 C92 74 74 92 50 92 C26 92 8 74 8 50 C8 26 26 8 50 8 Z",
  "M26 8 C16 8 8 16 8 26 L8 74 C8 84 16 92 26 92 L74 92 C84 92 92 84 92 74 L92 26 C92 16 84 8 74 8 Z",
  "M54 8 C64 8 72 16 82 36 C90 52 94 68 86 80 C78 92 62 96 44 94 C26 92 10 84 10 70 C10 56 22 38 32 24 C40 14 46 8 54 8 Z",
  "M22 20 C14 20 8 26 8 34 L8 66 C8 74 14 80 22 80 L78 80 C86 80 92 74 92 66 L92 34 C92 26 86 20 78 20 Z",
  "M48 6 C72 4 92 22 94 48 C96 76 78 94 50 94 C22 94 6 74 8 46 C10 22 26 8 48 6 Z",
];

export function Pebble({ className, variant = 0, children }: PebbleProps) {
  // useId guarantees a unique gradient id per Pebble instance. Using a static
  // id (`pebbleShine-${variant}`) caused every same-variant pebble on the page
  // to share one global id — when one unmounted, the others' `url(#…)` refs
  // broke and their paths rendered transparent/invisible.
  const reactId = useId();
  const gradId = `pebbleShine-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        style={{
          filter:
            "drop-shadow(0 6px 12px rgba(60, 50, 70, 0.22)) drop-shadow(0 2px 3px rgba(60, 50, 70, 0.14))",
        }}
      >
        <defs>
          <radialGradient id={gradId} cx="0.3" cy="0.25" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.7" stopColor="#fbf6f0" />
            <stop offset="1" stopColor="#f0e6d4" />
          </radialGradient>
        </defs>
        <path d={PATHS[variant]} fill={`url(#${gradId})`} />
      </svg>
      <div className="relative flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
