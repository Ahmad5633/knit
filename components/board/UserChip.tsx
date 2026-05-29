"use client";

import { useBoard } from "@/lib/store";
import { ItemIcon } from "./ItemIcon";

export function UserChip() {
  const itemIds = useBoard((s) => s.zones.topRight.itemIds);
  const items = useBoard((s) => s.items);
  const user = items[itemIds[0]];
  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-handwritten text-[20px] leading-none text-stone-700 sm:text-[26px]">
        Knit
      </span>
      <ItemIcon item={user} size={44} />
      <span className="text-[11px] font-medium text-stone-600">{user.label}</span>
    </div>
  );
}
