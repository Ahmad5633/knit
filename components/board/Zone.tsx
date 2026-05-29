"use client";

import { useEffect, useRef } from "react";
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
  const registerRect = useBoard((s) => s.registerRect);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () => registerRect(id, el.getBoundingClientRect());
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("scroll", publish, true);
    window.addEventListener("resize", publish);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", publish, true);
      window.removeEventListener("resize", publish);
    };
  }, [id, registerRect]);

  return (
    <div
      ref={ref}
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
