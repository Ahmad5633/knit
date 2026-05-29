"use client";

import { create } from "zustand";
import type { Item, Zone, ZoneId, ZoneRects } from "./types";
import { seedItems, seedZones } from "./seed";

interface BoardState {
  items: Record<string, Item>;
  zones: Record<ZoneId, Zone>;
  rects: ZoneRects;
  reorder: (zoneId: ZoneId, nextOrder: string[]) => void;
  moveItem: (itemId: string, from: ZoneId, to: ZoneId, index?: number) => void;
  registerRect: (zoneId: ZoneId, rect: DOMRect) => void;
}

export const useBoard = create<BoardState>((set) => ({
  items: seedItems,
  zones: seedZones,
  rects: {},
  reorder: (zoneId, nextOrder) =>
    set((s) => ({
      zones: {
        ...s.zones,
        [zoneId]: { ...s.zones[zoneId], itemIds: nextOrder },
      },
    })),
  moveItem: (itemId, from, to, index) =>
    set((s) => {
      if (from === to) return s;
      const fromZone = s.zones[from];
      const toZone = s.zones[to];
      const item = s.items[itemId];
      if (!fromZone || !toZone || !item) return s;
      if (!toZone.accepts.includes(item.kind)) return s;

      const fromIds = fromZone.itemIds.filter((id) => id !== itemId);
      const insertAt = index ?? toZone.itemIds.length;
      const toIds = [
        ...toZone.itemIds.slice(0, insertAt),
        itemId,
        ...toZone.itemIds.slice(insertAt),
      ];
      return {
        zones: {
          ...s.zones,
          [from]: { ...fromZone, itemIds: fromIds },
          [to]: { ...toZone, itemIds: toIds },
        },
      };
    }),
  registerRect: (zoneId, rect) =>
    set((s) => ({ rects: { ...s.rects, [zoneId]: rect } })),
}));
