import { Badge } from "./Badge";

const TABS = [
  { label: "what changed", count: 3, tone: "violet" as const },
  { label: "what needs attention", count: 1, tone: "rose" as const },
  { label: "what to do next", count: 0, tone: "violet" as const },
];

export function TopTabs() {
  return (
    <div className="flex items-center gap-12 font-handwritten text-2xl text-stone-700">
      {TABS.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className="flex items-center gap-2 transition hover:text-stone-900"
        >
          <span>{tab.label}</span>
          {tab.count > 0 && <Badge value={tab.count} tone={tab.tone} />}
        </button>
      ))}
    </div>
  );
}
