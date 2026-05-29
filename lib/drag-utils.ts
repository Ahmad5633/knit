/**
 * Shared utilities for pointer/touch drag interactions on the board.
 * Centralizes the small but easy-to-get-wrong details:
 *  - extracting a viewport-space point from heterogeneous event types
 *  - distinguishing a click from a drag via a movement threshold
 */

export interface ViewportPoint {
  x: number;
  y: number;
}

/** Movement below this threshold (in CSS pixels) is treated as a click. */
export const CLICK_THRESHOLD_PX = 4;

/**
 * Read viewport-relative coordinates from any pointer/mouse/touch event.
 * Prefer the native event's `clientX`/`clientY` — they're always viewport-
 * relative and behave consistently across framer-motion versions, unlike
 * `info.point` which can vary.
 */
export function readClientPoint(
  e: PointerEvent | MouseEvent | TouchEvent,
): ViewportPoint | null {
  if ("clientX" in e && typeof (e as MouseEvent).clientX === "number") {
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  }
  const touch = (e as TouchEvent).changedTouches?.[0];
  if (touch) return { x: touch.clientX, y: touch.clientY };
  return null;
}

/** Distance between two points. */
export function distance(a: ViewportPoint, b: ViewportPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}
