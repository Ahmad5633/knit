import { Zone } from "./Zone";

export function AddContext() {
  return (
    <div className="flex h-full flex-col items-end justify-start gap-4 pr-2 pt-12">
      <div className="font-handwritten text-2xl text-stone-500">add context...</div>
      <Zone
        id="addContext"
        axis="y"
        itemSize={56}
        className="min-h-[120px] min-w-[120px] rounded-2xl border-2 border-dashed border-stone-300/60 p-3"
      />
    </div>
  );
}
