"use client";

import { create } from "zustand";
import type { Item, ItemKind, Zone, ZoneId, ZoneRects } from "./types";
import { seedItems, seedZones } from "./seed";

interface BoardState {
  items: Record<string, Item>;
  zones: Record<ZoneId, Zone>;
  rects: ZoneRects;
  previewItemId: string | null;
  editingDocumentId: string | null;
  reorder: (zoneId: ZoneId, nextOrder: string[]) => void;
  moveItem: (itemId: string, from: ZoneId, to: ZoneId, index?: number) => void;
  registerRect: (zoneId: ZoneId, rect: DOMRect) => void;
  addItems: (zoneId: ZoneId, newItems: Item[]) => void;
  spawnItem: (zoneId: ZoneId, kind: ItemKind) => string | null;
  openPreview: (itemId: string) => void;
  closePreview: () => void;
  openDocumentEditor: (itemId: string) => void;
  closeDocumentEditor: () => void;
  updateDocument: (
    itemId: string,
    patch: { title?: string; content?: string },
  ) => void;
  deleteDocument: (itemId: string) => void;
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
  document: { asset: "/assets/document.svg", tints: [] },
};

const PERSIST_KEY = "knit-board:documents:v1";

const DOCUMENT_ZONES: ZoneId[] = [
  "leftRailA",
  "setAside",
  "canvas",
  "addContext",
];

let spawnCounter = 0;

const makeSpawn = (kind: ItemKind): Item => {
  spawnCounter += 1;
  const cfg = KIND_DEFAULTS[kind];
  const tint = cfg.tints.length
    ? cfg.tints[Math.floor(Math.random() * cfg.tints.length)]
    : undefined;
  const base: Item = {
    id: `${kind}-new-${Date.now()}-${spawnCounter}`,
    kind,
    asset: cfg.asset,
    tint,
  };
  if (kind === "document") {
    return {
      ...base,
      title: "",
      content: "",
      updatedAt: Date.now(),
    };
  }
  return base;
};

interface PersistedShape {
  docs: Item[];
  zoneOrder: Partial<Record<ZoneId, string[]>>;
}

function loadPersisted(): PersistedShape | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedShape;
    if (!parsed || !Array.isArray(parsed.docs)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistDocuments(
  items: Record<string, Item>,
  zones: Record<ZoneId, Zone>,
): void {
  if (typeof window === "undefined") return;
  const docs = Object.values(items).filter((it) => it.kind === "document");
  const zoneOrder: Partial<Record<ZoneId, string[]>> = {};
  for (const zoneId of DOCUMENT_ZONES) {
    const zone = zones[zoneId];
    if (!zone) continue;
    const docIds = zone.itemIds.filter((id) => items[id]?.kind === "document");
    if (docIds.length > 0) zoneOrder[zoneId] = docIds;
  }
  try {
    window.localStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({ docs, zoneOrder }),
    );
  } catch (err) {
    console.error("[knit] failed to persist documents", err);
  }
}

function buildInitialState(): {
  items: Record<string, Item>;
  zones: Record<ZoneId, Zone>;
} {
  const widenedZones: Record<ZoneId, Zone> = {
    ...seedZones,
    leftRailA: {
      ...seedZones.leftRailA,
      accepts: ["document"],
      itemIds: seedZones.leftRailA.itemIds.filter(
        (id) => seedItems[id]?.kind === "document",
      ),
    },
    setAside: {
      ...seedZones.setAside,
      accepts: Array.from(
        new Set([...seedZones.setAside.accepts, "document"]),
      ) as ItemKind[],
    },
    canvas: {
      ...seedZones.canvas,
      accepts: Array.from(
        new Set([...seedZones.canvas.accepts, "document"]),
      ) as ItemKind[],
    },
    addContext: {
      ...seedZones.addContext,
      accepts: Array.from(
        new Set([...seedZones.addContext.accepts, "document"]),
      ) as ItemKind[],
    },
  };

  const persisted = loadPersisted();
  if (!persisted) return { items: { ...seedItems }, zones: widenedZones };

  const items: Record<string, Item> = { ...seedItems };
  for (const doc of persisted.docs) {
    if (doc && doc.id && doc.kind === "document") items[doc.id] = doc;
  }

  const zones: Record<ZoneId, Zone> = { ...widenedZones };
  for (const zoneId of DOCUMENT_ZONES) {
    const persistedIds = persisted.zoneOrder[zoneId] ?? [];
    const validIds = persistedIds.filter((id) => items[id]?.kind === "document");
    if (validIds.length === 0) continue;
    const existing = zones[zoneId].itemIds.filter(
      (id) => items[id]?.kind !== "document",
    );
    zones[zoneId] = {
      ...zones[zoneId],
      itemIds: [...existing, ...validIds],
    };
  }

  return { items, zones };
}

const initialState = buildInitialState();

export const useBoard = create<BoardState>((set) => ({
  items: initialState.items,
  zones: initialState.zones,
  rects: {},
  previewItemId: null,
  editingDocumentId: null,
  reorder: (zoneId, nextOrder) =>
    set((s) => {
      const zones = {
        ...s.zones,
        [zoneId]: { ...s.zones[zoneId], itemIds: nextOrder },
      };
      if (DOCUMENT_ZONES.includes(zoneId)) persistDocuments(s.items, zones);
      return { zones };
    }),
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
      const zones = {
        ...s.zones,
        [from]: { ...fromZone, itemIds: fromIds },
        [to]: { ...toZone, itemIds: toIds },
      };
      if (item.kind === "document") persistDocuments(s.items, zones);
      return { zones };
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
      const zones = {
        ...s.zones,
        [zoneId]: {
          ...zone,
          itemIds: [...zone.itemIds, ...accepted.map((it) => it.id)],
        },
      };
      if (accepted.some((it) => it.kind === "document")) {
        persistDocuments(itemsPatch, zones);
      }
      return { items: itemsPatch, zones };
    }),
  spawnItem: (zoneId, kind) => {
    let createdId: string | null = null;
    set((s) => {
      const zone = s.zones[zoneId];
      if (!zone || !zone.accepts.includes(kind)) return s;
      const item = makeSpawn(kind);
      createdId = item.id;
      const items = { ...s.items, [item.id]: item };
      const zones = {
        ...s.zones,
        [zoneId]: { ...zone, itemIds: [...zone.itemIds, item.id] },
      };
      if (kind === "document") persistDocuments(items, zones);
      return { items, zones };
    });
    return createdId;
  },
  openPreview: (itemId) => set({ previewItemId: itemId }),
  closePreview: () => set({ previewItemId: null }),
  openDocumentEditor: (itemId) => set({ editingDocumentId: itemId }),
  closeDocumentEditor: () => set({ editingDocumentId: null }),
  updateDocument: (itemId, patch) =>
    set((s) => {
      const existing = s.items[itemId];
      if (!existing || existing.kind !== "document") return s;
      const updated: Item = {
        ...existing,
        ...patch,
        updatedAt: Date.now(),
      };
      const items = { ...s.items, [itemId]: updated };
      persistDocuments(items, s.zones);
      return { items };
    }),
  deleteDocument: (itemId) =>
    set((s) => {
      const existing = s.items[itemId];
      if (!existing || existing.kind !== "document") return s;
      const items = { ...s.items };
      delete items[itemId];
      const zones: Record<ZoneId, Zone> = { ...s.zones };
      for (const [zid, zone] of Object.entries(s.zones) as Array<[ZoneId, Zone]>) {
        if (!zone.itemIds.includes(itemId)) continue;
        zones[zid] = {
          ...zone,
          itemIds: zone.itemIds.filter((id) => id !== itemId),
        };
      }
      persistDocuments(items, zones);
      const editingDocumentId =
        s.editingDocumentId === itemId ? null : s.editingDocumentId;
      return { items, zones, editingDocumentId };
    }),
}));
