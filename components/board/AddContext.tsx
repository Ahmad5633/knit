"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useBoard } from "@/lib/store";
import { DraggableItem } from "./DraggableItem";
import { useFileDrop } from "@/lib/use-file-drop";
import { cn } from "@/lib/cn";

export function AddContext() {
  const itemIds = useBoard((s) => s.zones.addContext.itemIds);
  const items = useBoard((s) => s.items);
  const registerRect = useBoard((s) => s.registerRect);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const { isOver } = useFileDrop(dropRef, "addContext");

  useEffect(() => {
    const el = groupRef.current;
    if (!el) return;
    const publish = () => registerRect("addContext", el.getBoundingClientRect());
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
    <div ref={dropRef} className="flex flex-col items-end gap-3">
      <div className="font-handwritten text-[28px] italic text-stone-500/85">
        add context...
      </div>
      <div
        ref={groupRef}
        className={cn(
          "flex min-h-[80px] min-w-[140px] flex-col items-end gap-2 rounded-2xl p-2 transition-colors",
          isOver && "bg-white/40 ring-2 ring-violet-300/60",
        )}
      >
        <AnimatePresence initial={false}>
          {itemIds.map((id) => {
            const item = items[id];
            if (!item) return null;
            return (
              <DraggableItem key={id} item={item} zoneId="addContext" size={52} />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
