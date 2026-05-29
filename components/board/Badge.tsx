import { cn } from "@/lib/cn";

interface BadgeProps {
  value: number;
  tone?: "violet" | "rose" | "amber";
  className?: string;
}

const TONES = {
  violet: "bg-gradient-to-br from-violet-400 to-violet-600",
  rose: "bg-gradient-to-br from-rose-400 to-rose-600",
  amber: "bg-gradient-to-br from-amber-400 to-amber-600",
};

export function Badge({ value, tone = "violet", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-semibold text-white shadow-sm ring-1 ring-white/80",
        TONES[tone],
        className,
      )}
    >
      {value}
    </span>
  );
}
