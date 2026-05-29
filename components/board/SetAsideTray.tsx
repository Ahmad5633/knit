"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useBoard } from "@/lib/store";
import { DraggableItem } from "./DraggableItem";

export function SetAsideTray() {
  const itemIds = useBoard((s) => s.zones.setAside.itemIds);
  const items = useBoard((s) => s.items);
  const registerRect = useBoard((s) => s.registerRect);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () => registerRect("setAside", el.getBoundingClientRect());
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("scroll", publish, true);
    window.addEventListener("resize", publish);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", publish, true);
      window.removeEventListener("resize", publish);
    };
  }, [registerRect]);

  return (
    <div className="relative w-full max-w-[320px]">
      <div ref={ref} className="relative min-h-[180px] w-full sm:min-h-[240px]">
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
        <div
          className="relative z-10 grid grid-cols-3 gap-x-2 gap-y-2 px-4 pt-4 sm:gap-x-3 sm:px-6 sm:pt-5"
        >
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
        <div className="absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4">
          <div className="font-handwritten text-[22px] leading-none text-stone-700 sm:text-[28px]">
            set aside
          </div>
          <button
            type="button"
            className="mt-1.5 text-[10px] leading-none text-stone-700 sm:text-[11px]"
          >
            Return all back
          </button>
        </div>
      </div>
    </div>
  );
}
