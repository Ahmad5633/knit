import { Zone } from "./Zone";

export function BottomDock() {
  return (
    <div className="flex items-center justify-center gap-10">
      <div className="rounded-3xl bg-white/40 px-4 py-2 backdrop-blur-sm">
        <Zone id="bottomPeople" axis="x" itemSize={48} />
      </div>
      <div className="rounded-3xl bg-white/40 px-4 py-2 backdrop-blur-sm">
        <Zone id="bottomApps" axis="x" itemSize={52} />
      </div>
    </div>
  );
}
