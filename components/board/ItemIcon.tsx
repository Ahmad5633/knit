import Image from "next/image";
import { Pebble } from "./Pebble";
import { Badge } from "./Badge";
import type { Item } from "@/lib/types";
import { cn } from "@/lib/cn";

interface ItemIconProps {
  item: Item;
  size?: number;
  showLabel?: boolean;
}

const variantFor = (id: string): 1 | 2 | 3 | 4 => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 4) + 1) as 1 | 2 | 3 | 4;
};

export function ItemIcon({ item, size = 56, showLabel }: ItemIconProps) {
  const isUser = item.kind === "user";
  const isApp = item.kind === "app";

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {isApp ? (
          <div
            className="flex h-full w-full items-center justify-center rounded-[22%] shadow-md"
            style={{ backgroundColor: item.tint ?? "#ffffff" }}
          >
            <Image
              src={item.asset}
              alt={item.label ?? item.kind}
              width={size * 0.62}
              height={size * 0.62}
              className="drop-shadow-sm"
            />
          </div>
        ) : (
          <Pebble variant={variantFor(item.id)} className="h-full w-full">
            <Image
              src={item.asset}
              alt={item.label ?? item.kind}
              width={Math.round(size * 0.7)}
              height={Math.round(size * 0.7)}
              className={cn(
                "object-contain",
                isUser && "rounded-full",
              )}
              style={
                item.kind === "feather" || item.kind === "yarn" || item.kind === "landscape"
                  ? { filter: tintFilter(item.tint) }
                  : undefined
              }
            />
          </Pebble>
        )}
        {item.badge !== undefined && (
          <Badge
            value={item.badge}
            tone={item.kind === "app" ? "violet" : "rose"}
            className="absolute -right-1 -top-1"
          />
        )}
      </div>
      {showLabel && item.label && (
        <span className="text-[11px] text-stone-600">{item.label}</span>
      )}
    </div>
  );
}

function tintFilter(hex?: string): string | undefined {
  if (!hex) return undefined;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `drop-shadow(0 0 0 rgb(${r} ${g} ${b}))`;
}
