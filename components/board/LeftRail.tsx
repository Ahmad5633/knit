import { Zone } from "./Zone";

function AddButton() {
  return (
    <button
      type="button"
      aria-label="Add"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-stone-400 shadow-sm transition hover:bg-white hover:text-stone-700"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function LeftRail() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center gap-3">
        <AddButton />
        <Zone id="leftRailA" axis="y" itemSize={52} />
      </div>
      <div className="mt-12 flex flex-col items-center gap-3">
        <AddButton />
        <Zone id="leftRailB" axis="y" itemSize={52} />
      </div>
    </div>
  );
}
