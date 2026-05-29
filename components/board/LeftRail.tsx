"use client";

import { motion } from "framer-motion";
import { useBoard } from "@/lib/store";
import { Zone } from "./Zone";
import { Tooltip } from "./Tooltip";
import type { ItemKind, ZoneId } from "@/lib/types";

interface AddButtonProps {
  onClick: () => void;
  label: string;
  tooltip: string;
  tooltipHint?: string;
}

function AddButton({ onClick, label, tooltip, tooltipHint }: AddButtonProps) {
  return (
    <Tooltip label={tooltip} hint={tooltipHint} side="right">
      <motion.button
        type="button"
        aria-label={label}
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-400 shadow-[0_3px_10px_rgba(60,50,70,0.18)] transition-colors hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 lg:h-10 lg:w-10"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </motion.button>
    </Tooltip>
  );
}

interface ColumnProps {
  zoneId: ZoneId;
  kind: ItemKind;
  label: string;
  topOffset?: string;
}

interface ColumnExtraProps {
  tooltip: string;
  tooltipHint?: string;
}

function Column({
  zoneId,
  kind,
  label,
  topOffset,
  tooltip,
  tooltipHint,
}: ColumnProps & ColumnExtraProps) {
  const spawn = useBoard((s) => s.spawnItem);
  const openDocumentEditor = useBoard((s) => s.openDocumentEditor);
  return (
    <div className={`flex flex-col items-center gap-2 ${topOffset ?? ""}`}>
      <AddButton
        onClick={() => {
          const id = spawn(zoneId, kind);
          if (kind === "document" && id) openDocumentEditor(id);
        }}
        label={label}
        tooltip={tooltip}
        tooltipHint={tooltipHint}
      />
      <Zone id={zoneId} axis="y" itemSize={56} className="!gap-2" />
    </div>
  );
}

export function LeftRail() {
  return (
    <div className="flex items-start gap-4">
      <Column
        zoneId="leftRailA"
        kind="document"
        label="New document"
        tooltip="New document"
        tooltipHint="Opens the editor"
      />
      <Column
        zoneId="leftRailB"
        kind="yarn"
        label="Add yarn"
        topOffset="lg:mt-14"
        tooltip="Add yarn"
        tooltipHint="A thread of context"
      />
    </div>
  );
}
