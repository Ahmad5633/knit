"use client";

import { motion } from "framer-motion";
import { useBoard } from "@/lib/store";
import { Zone } from "./Zone";
import type { ItemKind, ZoneId } from "@/lib/types";

interface AddButtonProps {
  onClick: () => void;
  label: string;
}

function AddButton({ onClick, label }: AddButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-400 shadow-[0_3px_10px_rgba(60,50,70,0.18)] transition-colors hover:text-stone-700"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    </motion.button>
  );
}

interface ColumnProps {
  zoneId: ZoneId;
  kind: ItemKind;
  label: string;
  topOffset?: string;
}

function Column({ zoneId, kind, label, topOffset }: ColumnProps) {
  const spawn = useBoard((s) => s.spawnItem);
  return (
    <div className={`flex flex-col items-center gap-2 ${topOffset ?? ""}`}>
      <AddButton onClick={() => spawn(zoneId, kind)} label={label} />
      <Zone id={zoneId} axis="y" itemSize={56} className="!gap-2" />
    </div>
  );
}

export function LeftRail() {
  return (
    <div className="flex items-start gap-4">
      <Column zoneId="leftRailA" kind="feather" label="Add feather" />
      <Column zoneId="leftRailB" kind="yarn" label="Add yarn" topOffset="mt-14" />
    </div>
  );
}
