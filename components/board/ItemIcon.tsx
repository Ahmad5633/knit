import Image from "next/image";
import { Pebble, type PebbleVariant } from "./Pebble";
import { Badge } from "./Badge";
import { TintedSvg } from "./TintedSvg";
import type { Item, ItemKind } from "@/lib/types";

interface ItemIconProps {
  item: Item;
  size?: number;
  showLabel?: boolean;
}

const DEFAULT_SIZE = 56;
const INNER_RATIO = 0.68;
const ICON_SHADOW = "shadow-[0_4px_10px_rgba(60,50,70,0.18)]";

const PEBBLE_KINDS = new Set<ItemKind>(["feather", "yarn", "landscape"]);
const TINTED_KINDS = new Set<ItemKind>(["feather", "yarn"]);

/** Maps each pebble-style item kind to the pebble shape variant it uses. */
const PEBBLE_VARIANT: Partial<Record<ItemKind, PebbleVariant>> = {
  feather: 0,
  yarn: 1,
  landscape: 2,
};

export function ItemIcon({
  item,
  size = DEFAULT_SIZE,
  showLabel,
}: ItemIconProps) {
  const inner = Math.round(size * INNER_RATIO);
  const label = labelFor(item);

  return (
    <Frame
      size={size}
      label={showLabel ? label : undefined}
      labelTruncate={item.kind === "file"}
      badge={item.badge}
    >
      {renderBody(item, size, inner)}
    </Frame>
  );
}

/** Pick the user-facing label for an item (handles document fallback). */
function labelFor(item: Item): string | undefined {
  if (item.kind === "document") return item.title?.trim() || "Untitled";
  return item.label;
}

/** Renders the inner artwork for an item based on its kind. */
function renderBody(item: Item, size: number, inner: number): React.ReactNode {
  switch (item.kind) {
    case "document":
      return <DocumentBody inner={inner} title={labelFor(item) ?? ""} />;
    case "file":
      return <FileBody item={item} inner={inner} />;
    case "app":
      return <AppBody item={item} inner={inner} />;
    case "avatar":
    case "user":
      return <AvatarBody item={item} size={size} />;
    case "landscape":
      return <LandscapeBody item={item} size={size} />;
    case "feather":
    case "yarn":
      return <PebbleBody item={item} inner={inner} />;
  }
}

// --------------------------------------------------------------------------
// Kind-specific body renderers
// --------------------------------------------------------------------------

function PebbleBody({ item, inner }: { item: Item; inner: number }) {
  const variant = PEBBLE_VARIANT[item.kind] ?? 0;
  const tinted = TINTED_KINDS.has(item.kind);
  return (
    <Pebble variant={variant} className="h-full w-full">
      {tinted ? (
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
  );
}

function LandscapeBody({ item, size }: { item: Item; size: number }) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={item.asset}
        alt={item.label ?? "landscape"}
        width={size}
        height={size}
        className={`h-full w-full rounded-[28%] ${ICON_SHADOW}`}
      />
    </div>
  );
}

function AvatarBody({ item, size }: { item: Item; size: number }) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-full ${ICON_SHADOW}`}
    >
      <Image
        src={item.asset}
        alt={item.label ?? "avatar"}
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function AppBody({ item, inner }: { item: Item; inner: number }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-[22%] ${ICON_SHADOW}`}
      style={{ backgroundColor: item.tint ?? "#ffffff" }}
    >
      <Image
        src={item.asset}
        alt={item.label ?? item.kind}
        width={inner}
        height={inner}
      />
    </div>
  );
}

function FileBody({ item, inner }: { item: Item; inner: number }) {
  const tint = item.tint ?? "#7a6a8a";
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-2xl text-white shadow-[0_4px_10px_rgba(60,50,70,0.2)]"
      style={{ backgroundColor: tint }}
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
        <path d="M42 6 v10 a2 2 0 0 0 2 2 h10" fill="rgba(255,255,255,0.5)" />
        <text
          x="32"
          y="46"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="12"
          fill={tint}
        >
          {fileBadgeText(item)}
        </text>
      </svg>
    </div>
  );
}

function DocumentBody({ inner, title }: { inner: number; title: string }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-2xl bg-[#fbf6ec] ${ICON_SHADOW}`}
      title={title}
    >
      <svg viewBox="0 0 64 64" width={inner} height={inner} aria-hidden>
        <rect
          x="10"
          y="6"
          width="44"
          height="52"
          rx="6"
          fill="#ffffff"
          stroke="rgba(120,100,80,0.18)"
        />
        <rect x="16" y="14" width="32" height="3" rx="1.5" fill="#c8a87a" />
        <rect
          x="16"
          y="24"
          width="28"
          height="2"
          rx="1"
          fill="rgba(120,100,80,0.32)"
        />
        <rect
          x="16"
          y="30"
          width="32"
          height="2"
          rx="1"
          fill="rgba(120,100,80,0.24)"
        />
        <rect
          x="16"
          y="36"
          width="24"
          height="2"
          rx="1"
          fill="rgba(120,100,80,0.24)"
        />
        <rect
          x="16"
          y="42"
          width="30"
          height="2"
          rx="1"
          fill="rgba(120,100,80,0.24)"
        />
        <rect
          x="16"
          y="48"
          width="20"
          height="2"
          rx="1"
          fill="rgba(120,100,80,0.24)"
        />
      </svg>
    </div>
  );
}

// --------------------------------------------------------------------------
// Shared Frame wrapper
// --------------------------------------------------------------------------

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
          <Badge
            value={badge}
            tone="violet"
            className="absolute -right-1 -top-1"
          />
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

function fileBadgeText(item: Item): string {
  if (
    item.fileMime === "application/pdf" ||
    /\.pdf$/i.test(item.label ?? "")
  ) {
    return "PDF";
  }
  if (item.fileMime?.startsWith("image/")) return "IMG";
  const ext = item.label?.split(".").pop()?.toUpperCase();
  if (ext && ext.length <= 4) return ext;
  return "FILE";
}

// Re-export the bit of metadata other components may need.
export { PEBBLE_KINDS };
