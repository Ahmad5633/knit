import { cn } from "@/lib/cn";

interface BadgeProps {
  value: number;
  tone?: "violet" | "rose" | "amber";
  className?: string;
}

const TONES = {
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
};

export function Badge({ value, tone = "violet", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-sm ring-2 ring-white",
        TONES[tone],
        className,
      )}
    >
      {value}
    </span>
  );
}
