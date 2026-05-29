import { Zone } from "./Zone";

export function SetAsideTray() {
  return (
    <div className="relative">
      <div
        className="rounded-[28px] bg-[#d9c6a8]/85 px-6 py-5 shadow-[0_8px_24px_rgba(120,90,60,0.18)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 6px)",
        }}
      >
        <Zone id="setAside" axis="x" className="!flex-row !flex-wrap gap-3" itemSize={56} />
      </div>
      <div className="mt-3 pl-2">
        <div className="font-handwritten text-2xl text-stone-700">set aside</div>
        <button
          type="button"
          className="text-xs text-stone-500 hover:text-stone-700"
        >
          Return all back
        </button>
      </div>
    </div>
  );
}
