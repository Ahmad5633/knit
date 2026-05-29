import type { ZoneId } from "./types";

export interface Point {
  x: number;
  y: number;
}

const VALID_ZONE_IDS = new Set<ZoneId>([
  "setAside",
  "leftRailA",
  "leftRailB",
  "canvas",
  "addContext",
  "bottomPeople",
  "bottomApps",
  "topRight",
]);

// Find the zone under a viewport-space point by querying the live DOM.
// Each zone container marks itself with data-zone-id. We use elementsFromPoint
// (returns all elements stacking at that point) and pick the deepest one whose
// data-zone-id matches a known zone, excluding the source zone.
//
// This avoids the brittle rect-caching dance: no useEffect timing races, no
// stale rects after layout shifts, no production-vs-dev divergence. The DOM
// is queried fresh at drop time, so what the user sees is what they hit.
export function findZoneAtPoint(
  point: Point,
  exclude?: ZoneId,
): ZoneId | null {
  if (typeof document === "undefined") return null;
  const stack = document.elementsFromPoint(point.x, point.y);

  // Track the smallest matching zone — when multiple zones overlap at the
  // point, the one with the smallest area is the more specific target.
  let bestId: ZoneId | null = null;
  let bestArea = Infinity;

  for (const el of stack) {
    let cur: Element | null = el;
    while (cur) {
      const zoneId = (cur as HTMLElement).dataset?.zoneId as ZoneId | undefined;
      if (zoneId && VALID_ZONE_IDS.has(zoneId) && zoneId !== exclude) {
        const rect = cur.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > 0 && area < bestArea) {
          bestArea = area;
          bestId = zoneId;
        }
        break;
      }
      cur = cur.parentElement;
    }
  }

  return bestId;
}
