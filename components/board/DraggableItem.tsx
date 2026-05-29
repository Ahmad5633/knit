"use client";

import { motion, type PanInfo } from "framer-motion";
import { useRef } from "react";
import { useBoard } from "@/lib/store";
import { findZoneAtPoint } from "@/lib/hit-test";
import { ItemIcon } from "./ItemIcon";
import type { Item, ZoneId } from "@/lib/types";

interface DraggableItemProps {
  item: Item;
  zoneId: ZoneId;
  size?: number;
  showLabel?: boolean;
}

const CLICK_THRESHOLD_PX = 4;

export function DraggableItem({
  item,
  zoneId,
  size = 56,
  showLabel,
}: DraggableItemProps) {
  const moveItem = useBoard((s) => s.moveItem);
  const openPreview = useBoard((s) => s.openPreview);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = (
    _e: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo,
  ) => {
    startPoint.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (
    _e: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo,
  ) => {
    const start = startPoint.current;
    startPoint.current = null;
    const dx = start ? info.point.x - start.x : 0;
    const dy = start ? info.point.y - start.y : 0;
    const moved = Math.hypot(dx, dy);

    if (moved < CLICK_THRESHOLD_PX) {
      if (item.kind === "file") openPreview(item.id);
      return;
    }

    try {
      const { rects } = useBoard.getState();
      const viewportPoint = {
        x: info.point.x - window.scrollX,
        y: info.point.y - window.scrollY,
      };
      const target = findZoneAtPoint(viewportPoint, rects, zoneId);
      if (target) moveItem(item.id, zoneId, target);
    } catch (err) {
      console.error("[knit] drag end failed", err);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragSnapToOrigin
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.1, zIndex: 100, cursor: "grabbing" }}
      whileHover={{ scale: 1.04 }}
      className="cursor-grab touch-none select-none"
      style={{ touchAction: "none" }}
      title={item.label}
    >
      <ItemIcon item={item} size={size} showLabel={showLabel} />
    </motion.div>
  );
}
