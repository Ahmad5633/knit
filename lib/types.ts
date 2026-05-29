export type ItemKind =
  | "feather"
  | "yarn"
  | "landscape"
  | "avatar"
  | "app"
  | "user";

export type ZoneId =
  | "setAside"
  | "leftRailA"
  | "leftRailB"
  | "canvas"
  | "addContext"
  | "bottomPeople"
  | "bottomApps"
  | "topRight";

export interface Item {
  id: string;
  kind: ItemKind;
  asset: string;
  label?: string;
  badge?: number;
  tint?: string;
}

export interface Zone {
  id: ZoneId;
  accepts: ItemKind[];
  itemIds: string[];
}

export type ZoneRects = Partial<Record<ZoneId, DOMRect>>;
