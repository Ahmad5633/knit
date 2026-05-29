"use client";

import { create } from "zustand";
import type { Item, ItemKind, Zone, ZoneId, ZoneRects } from "./types";
import { seedItems, seedZones } from "./seed";

interface BoardState {
  items: Record<string, Item>;
  zones: Record<ZoneId, Zone>;
  rects: ZoneRects;
  previewItemId: string | null;
  reorder: (zoneId: ZoneId, nextOrder: string[]) => void;
  moveItem: (itemId: string, from: ZoneId, to: ZoneId, index?: number) => void;
  registerRect: (zoneId: ZoneId, rect: DOMRect) => void;
  addItems: (zoneId: ZoneId, newItems: Item[]) => void;
  spawnItem: (zoneId: ZoneId, kind: ItemKind) => void;
  openPreview: (itemId: string) => void;
  closePreview: () => void;
}

const KIND_DEFAULTS: Record<ItemKind, { asset: string; tints: string[] }> = {
  feather: {
    asset: "/assets/feather.svg",
    tints: ["#7b6aa8", "#d8a8b8", "#c45a78", "#5a82a8", "#e89c8a", "#4a9aa8", "#a85aa0"],
  },
  yarn: {
    asset: "/assets/yarn.svg",
    tints: ["#5fb3b8", "#8fc878", "#e87898", "#f0c450", "#9a7ac8", "#e8a060"],
  },
  landscape: {
    asset: "/assets/landscape-pink.svg",
    tints: [],
  },
  avatar: { asset: "/assets/avatar-1.svg", tints: [] },
  app: { asset: "/assets/file-generic.svg", tints: [] },
  user: { asset: "/assets/avatar-user.svg", tints: [] },
  file: { asset: "/assets/file-generic.svg", tints: ["#7a6a8a"] },
};

let spawnCounter = 0;

const makeSpawn = (kind: ItemKind): Item => {
  spawnCounter += 1;
  const cfg = KIND_DEFAULTS[kind];
  const tint = cfg.tints.length
    ? cfg.tints[Math.floor(Math.random() * cfg.tints.length)]
    : undefined;
  return {
    id: `${kind}-new-${Date.now()}-${spawnCounter}`,
    kind,
    asset: cfg.asset,
    tint,
  };
};

export const useBoard = create<BoardState>((set) => ({
  items: seedItems,
  zones: seedZones,
  rects: {},
  previewItemId: null,
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
  addItems: (zoneId, newItems) =>
    set((s) => {
      const zone = s.zones[zoneId];
      if (!zone) return s;
      const accepted = newItems.filter((it) => zone.accepts.includes(it.kind));
      if (accepted.length === 0) return s;
      const itemsPatch: Record<string, Item> = { ...s.items };
      for (const it of accepted) itemsPatch[it.id] = it;
      return {
        items: itemsPatch,
        zones: {
          ...s.zones,
          [zoneId]: {
            ...zone,
            itemIds: [...zone.itemIds, ...accepted.map((it) => it.id)],
          },
        },
      };
    }),
  spawnItem: (zoneId, kind) =>
    set((s) => {
      const zone = s.zones[zoneId];
      if (!zone || !zone.accepts.includes(kind)) return s;
      const item = makeSpawn(kind);
      return {
        items: { ...s.items, [item.id]: item },
        zones: {
          ...s.zones,
          [zoneId]: { ...zone, itemIds: [...zone.itemIds, item.id] },
        },
      };
    }),
  openPreview: (itemId) => set({ previewItemId: itemId }),
  closePreview: () => set({ previewItemId: null }),
}));
