"use client";

import { Reorder, useDragControls, type PanInfo } from "framer-motion";
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

export function DraggableItem({
  item,
  zoneId,
  size = 56,
  showLabel,
}: DraggableItemProps) {
  const controls = useDragControls();
  const moveItem = useBoard((s) => s.moveItem);

  const handleDragEnd = (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const { rects } = useBoard.getState();
    const target = findZoneAtPoint(info.point, rects, zoneId);
    if (target) moveItem(item.id, zoneId, target);
  };

  return (
    <Reorder.Item
      value={item.id}
      dragListener={true}
      dragControls={controls}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.08, zIndex: 50 }}
      className="cursor-grab touch-none active:cursor-grabbing"
      style={{ touchAction: "none" }}
      layout
    >
      <ItemIcon item={item} size={size} showLabel={showLabel} />
    </Reorder.Item>
  );
}
