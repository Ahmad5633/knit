import { Zone } from "./Zone";

export function Canvas() {
  return (
    <Zone
      id="canvas"
      axis="x"
      className="!flex-row !flex-wrap min-h-[60vh] w-full items-start justify-center gap-6 p-8"
      itemSize={64}
      emptyHint={
        <div className="pointer-events-none select-none font-handwritten text-2xl text-stone-400/60">
          drop here
        </div>
      }
    />
  );
}
