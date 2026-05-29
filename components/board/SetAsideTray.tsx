"use client";

import { AnimatePresence } from "framer-motion";
import { useBoard } from "@/lib/store";
import { DraggableItem } from "./DraggableItem";
import { Tooltip } from "./Tooltip";

export function SetAsideTray() {
  const itemIds = useBoard((s) => s.zones.setAside.itemIds);
  const items = useBoard((s) => s.items);

  return (
    <div className="relative w-full max-w-[320px] lg:w-[320px]">
      <div data-zone-id="setAside" className="relative w-full min-h-[240px] aspect-[320/240] lg:aspect-auto">
        <svg
          viewBox="0 0 320 240"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="trayFill" x1="0.2" x2="0.8" y1="0" y2="1">
              <stop offset="0" stopColor="#e6cea4" />
              <stop offset="1" stopColor="#cfae7a" />
            </linearGradient>
            <pattern id="trayWeave" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="url(#trayFill)" />
              <path d="M0 2 H4" stroke="rgba(140,100,55,0.22)" strokeWidth="0.5" />
              <path d="M2 0 V4" stroke="rgba(255,240,210,0.22)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <path
            d="
              M 0 0
              L 320 0
              L 320 110
              L 200 240
              L 0 240
              Z
            "
            fill="url(#trayWeave)"
            stroke="rgba(120,80,40,0.32)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
        <div className="relative z-10 grid grid-cols-3 gap-x-3 gap-y-2 px-6 pt-5">
          <AnimatePresence initial={false}>
            {itemIds.map((id) => {
              const item = items[id];
              if (!item) return null;
              return (
                <DraggableItem
                  key={id}
                  item={item}
                  zoneId="setAside"
                  size={56}
                />
              );
            })}
          </AnimatePresence>
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <div className="font-handwritten text-[22px] sm:text-[28px] leading-none text-stone-700">
            set aside
          </div>
          <Tooltip
            label="Return all items"
            hint="Sends everything back to its origin"
            side="top"
          >
            <button
              type="button"
              className="-mx-1 mt-1 inline-flex min-h-[28px] items-center rounded-md px-1 text-[11px] leading-none text-stone-700 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/60"
            >
              Return all back
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
