import type { ZoneId, ZoneRects } from "./types";

export interface Point {
  x: number;
  y: number;
}

export function findZoneAtPoint(
  point: Point,
  rects: ZoneRects,
  exclude?: ZoneId,
): ZoneId | null {
  for (const [zoneId, rect] of Object.entries(rects) as [ZoneId, DOMRect][]) {
    if (!rect || zoneId === exclude) continue;
    if (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    ) {
      return zoneId;
    }
  }
  return null;
}
