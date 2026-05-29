import { Badge } from "./Badge";

const TABS = [
  { label: "what changed", count: 3, tone: "violet" as const },
  { label: "what needs attention", count: 1, tone: "rose" as const },
  { label: "what to do next", count: 0, tone: "violet" as const },
];

export function TopTabs() {
  return (
    <div className="flex items-center gap-6 whitespace-nowrap font-handwritten text-[26px] leading-none text-stone-700 sm:gap-10">
      {TABS.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className="group flex items-center gap-2 transition-colors hover:text-stone-900"
        >
          <span className="transition-transform group-hover:-translate-y-0.5">
            {tab.label}
          </span>
          {tab.count > 0 && <Badge value={tab.count} tone={tab.tone} />}
        </button>
      ))}
    </div>
  );
}
