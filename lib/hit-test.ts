import type { ZoneId, ZoneRects } from "./types";

export interface Point {
  x: number;
  y: number;
}

// When the drop point falls inside multiple zone rects (e.g. the tray
// overlaps slightly with the canvas), prefer the smallest matching zone —
// it's the more specific target.
export function findZoneAtPoint(
  point: Point,
  rects: ZoneRects,
  exclude?: ZoneId,
): ZoneId | null {
  let bestId: ZoneId | null = null;
  let bestArea = Infinity;
  for (const [zoneId, rect] of Object.entries(rects) as [ZoneId, DOMRect][]) {
    if (!rect || zoneId === exclude) continue;
    if (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    ) {
      const area = rect.width * rect.height;
      if (area < bestArea) {
        bestArea = area;
        bestId = zoneId;
      }
    }
  }
  return bestId;
}
