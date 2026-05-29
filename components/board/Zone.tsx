"use client";

import { AnimatePresence } from "framer-motion";
import { useBoard } from "@/lib/store";
import { DraggableItem } from "./DraggableItem";
import type { ZoneId } from "@/lib/types";
import { cn } from "@/lib/cn";

interface ZoneProps {
  id: ZoneId;
  axis?: "x" | "y";
  className?: string;
  itemSize?: number;
  showLabels?: boolean;
  emptyHint?: React.ReactNode;
}

export function Zone({
  id,
  axis = "y",
  className,
  itemSize = 56,
  showLabels,
  emptyHint,
}: ZoneProps) {
  const itemIds = useBoard((s) => s.zones[id].itemIds);
  const items = useBoard((s) => s.items);

  return (
    <div
      data-zone-id={id}
      className={cn(
        "flex",
        axis === "x"
          ? "flex-row items-center gap-3"
          : "flex-col items-center gap-3",
        className,
      )}
    >
      {itemIds.length === 0 && emptyHint}
      <AnimatePresence initial={false}>
        {itemIds.map((itemId) => {
          const item = items[itemId];
          if (!item) return null;
          return (
            <DraggableItem
              key={itemId}
              item={item}
              zoneId={id}
              size={itemSize}
              showLabel={showLabels}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
