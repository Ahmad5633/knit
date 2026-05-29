"use client";

import { create } from "zustand";
import type { Item, ItemKind, Zone, ZoneId } from "./types";
import { seedItems, seedZones } from "./seed";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface BoardState {
  items: Record<string, Item>;
  zones: Record<ZoneId, Zone>;
  previewItemId: string | null;
  editingDocumentId: string | null;
  reorder: (zoneId: ZoneId, nextOrder: string[]) => void;
  moveItem: (itemId: string, from: ZoneId, to: ZoneId, index?: number) => void;
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

interface KindDefaults {
  asset: string;
  tints: readonly string[];
}

const KIND_DEFAULTS: Record<ItemKind, KindDefaults> = {
  feather: {
    asset: "/assets/feather.svg",
    tints: ["#7b6aa8", "#d8a8b8", "#c45a78", "#5a82a8", "#e89c8a", "#4a9aa8", "#a85aa0"],
  },
  yarn: {
    asset: "/assets/yarn.svg",
    tints: ["#5fb3b8", "#8fc878", "#e87898", "#f0c450", "#9a7ac8", "#e8a060"],
  },
  landscape: { asset: "/assets/landscape-pink.svg", tints: [] },
  avatar: { asset: "/assets/avatar-1.svg", tints: [] },
  app: { asset: "/assets/file-generic.svg", tints: [] },
  user: { asset: "/assets/avatar-user.svg", tints: [] },
  file: { asset: "/assets/file-generic.svg", tints: ["#7a6a8a"] },
  document: { asset: "/assets/document.svg", tints: [] },
};

/** Zones that can hold user-created documents (persisted to localStorage). */
const DOCUMENT_ZONES: readonly ZoneId[] = [
  "leftRailA",
  "setAside",
  "canvas",
  "addContext",
];

const PERSIST_KEY = "knit-board:documents:v1";

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

let spawnCounter = 0;

function pickRandom<T>(values: readonly T[]): T | undefined {
  if (values.length === 0) return undefined;
  return values[Math.floor(Math.random() * values.length)];
}

function createSpawnedItem(kind: ItemKind): Item {
  spawnCounter += 1;
  const cfg = KIND_DEFAULTS[kind];
  const base: Item = {
    id: `${kind}-new-${Date.now()}-${spawnCounter}`,
    kind,
    asset: cfg.asset,
    tint: pickRandom(cfg.tints),
  };
  if (kind === "document") {
    return { ...base, title: "", content: "", updatedAt: Date.now() };
  }
  return base;
}

/** Return a new zones map with one zone's itemIds replaced. */
function withZone(
  zones: Record<ZoneId, Zone>,
  zoneId: ZoneId,
  patch: Partial<Zone>,
): Record<ZoneId, Zone> {
  return { ...zones, [zoneId]: { ...zones[zoneId], ...patch } };
}

/** Did any of these items affect persisted (document) state? */
function touchesDocuments(items: readonly Item[]): boolean {
  return items.some((it) => it.kind === "document");
}

// ---------------------------------------------------------------------------
// Persistence (localStorage)
// ---------------------------------------------------------------------------

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
    const docIds = zones[zoneId]?.itemIds.filter(
      (id) => items[id]?.kind === "document",
    );
    if (docIds && docIds.length > 0) zoneOrder[zoneId] = docIds;
  }
  try {
    window.localStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({ docs, zoneOrder } satisfies PersistedShape),
    );
  } catch (err) {
    console.error("[knit] failed to persist documents", err);
  }
}

// ---------------------------------------------------------------------------
// Initial state assembly
// ---------------------------------------------------------------------------

/** Ensure every drop-eligible zone accepts the `document` kind. */
function withDocumentsAccepted(
  zones: Record<ZoneId, Zone>,
): Record<ZoneId, Zone> {
  const result = { ...zones };
  for (const zoneId of DOCUMENT_ZONES) {
    const zone = result[zoneId];
    if (!zone || zone.accepts.includes("document")) continue;
    result[zoneId] = { ...zone, accepts: [...zone.accepts, "document"] };
  }
  // leftRailA is documents-only; strip any non-document seed items.
  result.leftRailA = {
    ...result.leftRailA,
    accepts: ["document"],
    itemIds: result.leftRailA.itemIds.filter(
      (id) => seedItems[id]?.kind === "document",
    ),
  };
  return result;
}

function applyPersisted(
  items: Record<string, Item>,
  zones: Record<ZoneId, Zone>,
  persisted: PersistedShape,
): { items: Record<string, Item>; zones: Record<ZoneId, Zone> } {
  const nextItems = { ...items };
  for (const doc of persisted.docs) {
    if (doc?.id && doc.kind === "document") nextItems[doc.id] = doc;
  }

  let nextZones = { ...zones };
  for (const zoneId of DOCUMENT_ZONES) {
    const persistedIds = (persisted.zoneOrder[zoneId] ?? []).filter(
      (id) => nextItems[id]?.kind === "document",
    );
    if (persistedIds.length === 0) continue;
    const nonDocIds = nextZones[zoneId].itemIds.filter(
      (id) => nextItems[id]?.kind !== "document",
    );
    nextZones = withZone(nextZones, zoneId, {
      itemIds: [...nonDocIds, ...persistedIds],
    });
  }
  return { items: nextItems, zones: nextZones };
}

function buildInitialState(): Pick<BoardState, "items" | "zones"> {
  const baseZones = withDocumentsAccepted(seedZones);
  const baseItems = { ...seedItems };

  const persisted = loadPersisted();
  if (!persisted) return { items: baseItems, zones: baseZones };
  return applyPersisted(baseItems, baseZones, persisted);
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialState = buildInitialState();

export const useBoard = create<BoardState>((set) => ({
  items: initialState.items,
  zones: initialState.zones,
  previewItemId: null,
  editingDocumentId: null,

  reorder: (zoneId, nextOrder) =>
    set((s) => {
      const zones = withZone(s.zones, zoneId, { itemIds: nextOrder });
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

      let zones = withZone(s.zones, from, { itemIds: fromIds });
      zones = withZone(zones, to, { itemIds: toIds });

      if (item.kind === "document") persistDocuments(s.items, zones);
      return { zones };
    }),

  addItems: (zoneId, newItems) =>
    set((s) => {
      const zone = s.zones[zoneId];
      if (!zone) return s;
      const accepted = newItems.filter((it) => zone.accepts.includes(it.kind));
      if (accepted.length === 0) return s;

      const items = { ...s.items };
      for (const it of accepted) items[it.id] = it;
      const zones = withZone(s.zones, zoneId, {
        itemIds: [...zone.itemIds, ...accepted.map((it) => it.id)],
      });

      if (touchesDocuments(accepted)) persistDocuments(items, zones);
      return { items, zones };
    }),

  spawnItem: (zoneId, kind) => {
    let createdId: string | null = null;
    set((s) => {
      const zone = s.zones[zoneId];
      if (!zone || !zone.accepts.includes(kind)) return s;
      const item = createSpawnedItem(kind);
      createdId = item.id;
      const items = { ...s.items, [item.id]: item };
      const zones = withZone(s.zones, zoneId, {
        itemIds: [...zone.itemIds, item.id],
      });
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
      const updated: Item = { ...existing, ...patch, updatedAt: Date.now() };
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
      for (const [zid, zone] of Object.entries(s.zones) as Array<
        [ZoneId, Zone]
      >) {
        if (!zone.itemIds.includes(itemId)) continue;
        zones[zid] = {
          ...zone,
          itemIds: zone.itemIds.filter((id) => id !== itemId),
        };
      }

      persistDocuments(items, zones);
      return {
        items,
        zones,
        editingDocumentId:
          s.editingDocumentId === itemId ? null : s.editingDocumentId,
      };
    }),
}));
