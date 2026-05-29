"use client";

import { useRef } from "react";
import { Zone } from "./Zone";
import { useFileDrop } from "@/lib/use-file-drop";
import { cn } from "@/lib/cn";

export function Canvas() {
  const dropRef = useRef<HTMLDivElement | null>(null);
  const { isOver } = useFileDrop(dropRef, "canvas");

  return (
    <div
      ref={dropRef}
      className={cn(
        "relative h-full w-full rounded-3xl transition-all duration-200",
        isOver && "bg-white/35 ring-2 ring-violet-300/70 shadow-inner",
      )}
    >
      <Zone
        id="canvas"
        axis="x"
        className="!flex-row !flex-wrap h-full w-full items-center justify-center gap-6 p-8"
        itemSize={64}
        emptyHint={
          isOver ? (
            <div className="font-handwritten text-3xl text-stone-600 animate-pulse">
              drop files to add
            </div>
          ) : null
        }
      />
    </div>
  );
}
