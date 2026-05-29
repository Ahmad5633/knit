import { Zone } from "./Zone";

export function BottomDock() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-12 lg:gap-x-28">
      <div className="rounded-full px-1 py-1">
        <Zone id="bottomPeople" axis="x" itemSize={48} className="!flex-row !flex-wrap gap-3" />
      </div>
      <div className="rounded-full px-1 py-1">
        <Zone id="bottomApps" axis="x" itemSize={52} className="!flex-row !flex-wrap gap-3" />
      </div>
    </div>
  );
}
