import type { ZoneId } from "./types";
import type { ViewportPoint } from "./drag-utils";

/** All zones whose containers carry a `data-zone-id` attribute. */
const VALID_ZONE_IDS: ReadonlySet<ZoneId> = new Set<ZoneId>([
  "setAside",
  "leftRailA",
  "leftRailB",
  "canvas",
  "addContext",
  "bottomPeople",
  "bottomApps",
  "topRight",
]);

function getZoneId(el: Element): ZoneId | null {
  const value = (el as HTMLElement).dataset?.zoneId;
  if (!value) return null;
  return VALID_ZONE_IDS.has(value as ZoneId) ? (value as ZoneId) : null;
}

/** Walk up from an element until a `data-zone-id` carrier is found. */
function nearestZoneAncestor(start: Element): Element | null {
  let cur: Element | null = start;
  while (cur) {
    if (getZoneId(cur)) return cur;
    cur = cur.parentElement;
  }
  return null;
}

/**
 * Find the zone under a viewport-space point by querying the live DOM.
 *
 * Each zone container carries `data-zone-id="…"`. We use `elementsFromPoint`
 * to get the full stack at the point, walk up from each element to its zone
 * ancestor, and pick the smallest matching zone (smallest area = most
 * specific target). The source zone is excluded so dropping back where you
 * started is a no-op.
 *
 * Querying the live DOM avoids the brittle rect-cache approach: no
 * `useEffect` timing races, no stale rects after layout shifts, no
 * production-vs-dev divergence. What the user sees is what they hit.
 */
export function findZoneAtPoint(
  point: ViewportPoint,
  exclude?: ZoneId,
): ZoneId | null {
  if (typeof document === "undefined") return null;
  const stack = document.elementsFromPoint(point.x, point.y);

  let bestId: ZoneId | null = null;
  let bestArea = Infinity;

  for (const el of stack) {
    const zoneEl = nearestZoneAncestor(el);
    if (!zoneEl) continue;
    const zoneId = getZoneId(zoneEl);
    if (!zoneId || zoneId === exclude) continue;

    const rect = zoneEl.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area > 0 && area < bestArea) {
      bestArea = area;
      bestId = zoneId;
    }
  }

  return bestId;
}
