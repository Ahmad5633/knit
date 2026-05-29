"use client";

import { motion, type PanInfo } from "framer-motion";
import { useRef, useState } from "react";
import { useBoard } from "@/lib/store";
import { findZoneAtPoint } from "@/lib/hit-test";
import {
  CLICK_THRESHOLD_PX,
  distance,
  readClientPoint,
  type ViewportPoint,
} from "@/lib/drag-utils";
import { ItemIcon } from "./ItemIcon";
import { Tooltip } from "./Tooltip";
import type { Item, ZoneId } from "@/lib/types";

interface DraggableItemProps {
  item: Item;
  zoneId: ZoneId;
  size?: number;
  showLabel?: boolean;
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

  // Origin of the current drag and whether it actually moved. Both reset on
  // every fresh pointer-down so a click after a drag still registers.
  const startPoint = useRef<ViewportPoint | null>(null);
  const didDrag = useRef(false);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = () => {
    didDrag.current = false;
  };

  const handleDragStart = (
    _e: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo,
  ) => {
    didDrag.current = true;
    setDragging(true);
    startPoint.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (
    e: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo,
  ) => {
    const start = startPoint.current;
    startPoint.current = null;
    setDragging(false);
    const moved = start
      ? distance(start, { x: info.point.x, y: info.point.y })
      : 0;

    // Sub-threshold movement — treat as click; onClick handles activation.
    if (moved < CLICK_THRESHOLD_PX) return;

    const dropPoint = readClientPoint(e) ?? {
      x: info.point.x - window.scrollX,
      y: info.point.y - window.scrollY,
    };
    const target = findZoneAtPoint(dropPoint, zoneId);
    if (target) moveItem(item.id, zoneId, target);
  };

  const handleClick = () => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    if (item.kind === "file") openPreview(item.id);
    else if (item.kind === "document") openDocumentEditor(item.id);
  };

  return (
    <Tooltip
      label={tooltipLabel(item)}
      hint={tooltipHint(item)}
      side="top"
      disabled={dragging}
    >
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
        aria-label={ariaLabel(item)}
      >
        <ItemIcon item={item} size={size} showLabel={showLabel} />
      </motion.div>
    </Tooltip>
  );
}

function tooltipLabel(item: Item): string {
  if (item.kind === "document") return item.title?.trim() || "Untitled document";
  return item.label || item.kind;
}

function tooltipHint(item: Item): string | undefined {
  switch (item.kind) {
    case "document":
      return "Click to edit · drag to move";
    case "file":
      return "Click to preview · drag to move";
    case "app":
      return "App · drag to move";
    case "user":
    case "avatar":
      return "Person · drag to move";
    case "feather":
    case "yarn":
    case "landscape":
      return "Drag to move";
  }
}

function ariaLabel(item: Item): string {
  const base = tooltipLabel(item);
  const hint = tooltipHint(item);
  return hint ? `${base} — ${hint}` : base;
}
