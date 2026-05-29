import Image from "next/image";
import { Pebble } from "./Pebble";
import { Badge } from "./Badge";
import { TintedSvg } from "./TintedSvg";
import type { Item } from "@/lib/types";

interface ItemIconProps {
  item: Item;
  size?: number;
  showLabel?: boolean;
}

const hash = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
};

// Pebble shape per item kind:
// feather → triangle (0 or 3)
// landscape/mountain → square (2 or 4)
// yarn → oval (1 or 5)
const variantFor = (item: Item): 0 | 1 | 2 | 3 | 4 | 5 => {
  const h = hash(item.id);
  switch (item.kind) {
    case "feather":
      return 0;
    case "landscape":
      return 2;
    case "yarn":
      return 1;
    default:
      return (h % 6) as 0 | 1 | 2 | 3 | 4 | 5;
  }
};

const TINTED_KINDS = new Set(["feather", "yarn"]);

export function ItemIcon({ item, size = 56, showLabel }: ItemIconProps) {
  const isApp = item.kind === "app";
  const isAvatar = item.kind === "avatar" || item.kind === "user";
  const isFile = item.kind === "file";
  const isLandscape = item.kind === "landscape";
  const tinted = TINTED_KINDS.has(item.kind);
  const inner = Math.round(size * 0.68);

  if (isLandscape) {
    return (
      <Frame size={size} label={showLabel ? item.label : undefined} badge={item.badge}>
        <div className="relative h-full w-full">
          <Image
            src={item.asset}
            alt={item.label ?? "landscape"}
            width={size}
            height={size}
            className="h-full w-full rounded-[28%] shadow-[0_4px_10px_rgba(60,50,70,0.18)]"
          />
        </div>
      </Frame>
    );
  }

  if (isFile) {
    return (
      <Frame
        size={size}
        label={item.label}
        labelTruncate
        badge={item.badge}
      >
        <div
          className="flex h-full w-full items-center justify-center rounded-2xl text-white shadow-[0_4px_10px_rgba(60,50,70,0.2)]"
          style={{ backgroundColor: item.tint ?? "#7a6a8a" }}
        >
          <svg
            viewBox="0 0 64 64"
            width={inner}
            height={inner}
            fill="currentColor"
            aria-hidden
          >
            <path
              d="M16 6 h26 l12 12 v40 a4 4 0 0 1 -4 4 h-34 a4 4 0 0 1 -4 -4 v-48 a4 4 0 0 1 4 -4 z"
              fill="rgba(255,255,255,0.95)"
            />
            <path
              d="M42 6 v10 a2 2 0 0 0 2 2 h10"
              fill="rgba(255,255,255,0.5)"
            />
            <text
              x="32"
              y="46"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
              fontSize="12"
              fill={item.tint ?? "#7a6a8a"}
            >
              {fileBadgeText(item)}
            </text>
          </svg>
        </div>
      </Frame>
    );
  }

  if (isApp) {
    return (
      <Frame size={size} label={showLabel ? item.label : undefined} badge={item.badge}>
        <div
          className="flex h-full w-full items-center justify-center rounded-[22%] shadow-[0_4px_10px_rgba(60,50,70,0.18)]"
          style={{ backgroundColor: item.tint ?? "#ffffff" }}
        >
          <Image
            src={item.asset}
            alt={item.label ?? item.kind}
            width={inner}
            height={inner}
          />
        </div>
      </Frame>
    );
  }

  return (
    <Frame size={size} label={showLabel ? item.label : undefined} badge={item.badge}>
      <Pebble variant={variantFor(item)} className="h-full w-full">
        {isAvatar ? (
          <div
            className="overflow-hidden rounded-full"
            style={{ width: inner * 1.05, height: inner * 1.05 }}
          >
            <Image
              src={item.asset}
              alt={item.label ?? "avatar"}
              width={Math.round(inner * 1.05)}
              height={Math.round(inner * 1.05)}
            />
          </div>
        ) : tinted ? (
          <TintedSvg src={item.asset} size={inner} color={item.tint} />
        ) : (
          <Image
            src={item.asset}
            alt={item.kind}
            width={inner}
            height={inner}
            className="rounded-[20%]"
          />
        )}
      </Pebble>
    </Frame>
  );
}

function fileBadgeText(item: Item): string {
  if (item.fileMime === "application/pdf" || /\.pdf$/i.test(item.label ?? "")) {
    return "PDF";
  }
  if (item.fileMime?.startsWith("image/")) return "IMG";
  const ext = item.label?.split(".").pop()?.toUpperCase();
  if (ext && ext.length <= 4) return ext;
  return "FILE";
}

interface FrameProps {
  size: number;
  label?: string;
  badge?: number;
  labelTruncate?: boolean;
  children: React.ReactNode;
}

function Frame({ size, label, badge, labelTruncate, children }: FrameProps) {
  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {children}
        {badge !== undefined && (
          <Badge value={badge} tone="violet" className="absolute -right-1 -top-1" />
        )}
      </div>
      {label && (
        <span
          className={
            labelTruncate
              ? "max-w-[80px] truncate text-[10px] font-medium text-stone-700"
              : "text-[11px] text-stone-600"
          }
          title={label}
        >
          {label}
        </span>
      )}
    </div>
  );
}
