import { cn } from "@/lib/cn";

interface PebbleProps {
  className?: string;
  variant?: 1 | 2 | 3 | 4;
  children?: React.ReactNode;
}

const PATHS = {
  1: "M50 4 C72 4 96 16 96 44 C96 70 84 96 54 96 C28 96 6 80 6 52 C6 24 28 4 50 4 Z",
  2: "M48 6 C76 2 94 22 96 50 C98 78 74 96 50 96 C24 96 4 78 6 46 C8 22 26 10 48 6 Z",
  3: "M52 2 C78 6 98 24 94 54 C90 82 66 96 44 94 C20 92 4 70 8 44 C12 18 30 -2 52 2 Z",
  4: "M44 4 C70 0 96 18 96 46 C96 74 80 98 50 96 C22 94 6 76 6 50 C6 26 22 8 44 4 Z",
};

export function Pebble({ className, variant = 1, children }: PebbleProps) {
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full drop-shadow-[0_2px_4px_rgba(80,70,90,0.18)]"
        aria-hidden
      >
        <path d={PATHS[variant]} fill="white" />
      </svg>
      <div className="relative flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
