import { Badge } from "./Badge";
import { Tooltip } from "./Tooltip";

const TABS = [
  {
    label: "what changed",
    count: 3,
    tone: "violet" as const,
    tip: "Recent updates",
    hint: "See what's moved or been edited since you last looked",
  },
  {
    label: "what needs attention",
    count: 1,
    tone: "rose" as const,
    tip: "Needs you",
    hint: "Items waiting on a decision or review",
  },
  {
    label: "what to do next",
    count: 0,
    tone: "violet" as const,
    tip: "Up next",
    hint: "Suggested next actions based on your board",
  },
];

export function TopTabs() {
  return (
    <div className="flex items-center gap-5 whitespace-nowrap font-handwritten text-[19px] leading-none text-stone-700 sm:gap-10 sm:text-[26px]">
      {TABS.map((tab) => (
        <Tooltip key={tab.label} label={tab.tip} hint={tab.hint} side="bottom">
          <button
            type="button"
            className="group flex min-h-[44px] items-center gap-2 px-0.5 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:text-stone-900"
          >
            <span className="transition-transform group-hover:-translate-y-0.5">
              {tab.label}
            </span>
            {tab.count > 0 && <Badge value={tab.count} tone={tab.tone} />}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
