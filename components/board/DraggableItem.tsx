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

function readClientPoint(
  e: PointerEvent | MouseEvent | TouchEvent,
): { x: number; y: number } | null {
  if ("clientX" in e && typeof (e as MouseEvent).clientX === "number") {
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  }
  const touch = (e as TouchEvent).changedTouches?.[0];
  if (touch) return { x: touch.clientX, y: touch.clientY };
  return null;
}

export function DraggableItem({
  item,
  zoneId,
  size = 56,
  showLabel,
}: DraggableItemProps) {
  const moveItem = useBoard((s) => s.moveItem);
  const openPreview = useBoard((s) => s.openPreview);
  const openDocumentEditor = useBoard((s) => s.openDocumentEditor);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);

  const handlePointerDown = () => {
    didDragRef.current = false;
  };

  const handleClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (item.kind === "file") openPreview(item.id);
    else if (item.kind === "document") openDocumentEditor(item.id);
  };

  const handleDragStart = (
    _e: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo,
  ) => {
    didDragRef.current = true;
    startPoint.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (
    e: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo,
  ) => {
    const start = startPoint.current;
    startPoint.current = null;
    const dx = start ? info.point.x - start.x : 0;
    const dy = start ? info.point.y - start.y : 0;
    const moved = Math.hypot(dx, dy);

    if (moved < CLICK_THRESHOLD_PX) return;

    try {
      const viewportPoint = readClientPoint(e) ?? {
        x: info.point.x - window.scrollX,
        y: info.point.y - window.scrollY,
      };
      const target = findZoneAtPoint(viewportPoint, zoneId);
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
      onPointerDown={handlePointerDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
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
