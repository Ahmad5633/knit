import type { Item, Zone, ZoneId } from "./types";

const mkId = (prefix: string, i: number) => `${prefix}-${i}`;

const featherTints = ["#8b9eb7", "#d4a8c4", "#c47a8a", "#7a92a8", "#e8a89a"];
const yarnTints = ["#7fc1c4", "#a8d49e", "#e88a9e", "#f0c860"];
const landscapeTints = ["#e8a8a8", "#f5b574", "#8fa8c8"];
const avatarTints = ["#3a3a3a", "#6b4a3a", "#a86b5a", "#d8a890"];
const appTints = ["#5fb878", "#3aafd0", "#ffffff", "#7c3aed"];

const featherItems: Item[] = featherTints.map((tint, i) => ({
  id: mkId("feather", i),
  kind: "feather",
  asset: "/assets/feather.svg",
  tint,
}));

const yarnItems: Item[] = yarnTints.map((tint, i) => ({
  id: mkId("yarn", i),
  kind: "yarn",
  asset: "/assets/yarn.svg",
  tint,
}));

const landscapeItems: Item[] = landscapeTints.map((tint, i) => ({
  id: mkId("landscape", i),
  kind: "landscape",
  asset: "/assets/landscape.svg",
  tint,
  badge: i === 2 ? 2 : undefined,
}));

const setAsideItems: Item[] = [
  { id: "set-feather", kind: "feather", asset: "/assets/feather.svg", tint: "#cfd8e3" },
  { id: "set-yarn", kind: "yarn", asset: "/assets/yarn.svg", tint: "#7fc1c4" },
  { id: "set-landscape", kind: "landscape", asset: "/assets/landscape.svg", tint: "#7fb89a" },
  { id: "set-yarn-2", kind: "yarn", asset: "/assets/yarn.svg", tint: "#a06aa8" },
];

const avatarItems: Item[] = avatarTints.map((tint, i) => ({
  id: mkId("avatar", i),
  kind: "avatar",
  asset: "/assets/avatar.svg",
  tint,
  label: ["Aiden", "Ben", "Carla", "Dani"][i],
}));

const appItems: Item[] = [
  { id: "app-0", kind: "app", asset: "/assets/app-cat.svg", tint: "#9ad5b0", label: "Notes" },
  { id: "app-1", kind: "app", asset: "/assets/app-clap.svg", tint: "#5dd5d5", label: "Clips" },
  { id: "app-2", kind: "app", asset: "/assets/app-chart.svg", tint: "#ffffff", label: "Stats", badge: 5 },
  { id: "app-3", kind: "app", asset: "/assets/app-slack.svg", tint: "#7c3aed", label: "Slack" },
];

const userItem: Item = {
  id: "user-freddy",
  kind: "user",
  asset: "/assets/avatar.svg",
  tint: "#5b6b80",
  label: "Freddy Lam",
};

export const seedItems: Record<string, Item> = Object.fromEntries(
  [
    ...featherItems,
    ...yarnItems,
    ...landscapeItems,
    ...setAsideItems,
    ...avatarItems,
    ...appItems,
    userItem,
  ].map((it) => [it.id, it]),
);

export const seedZones: Record<ZoneId, Zone> = {
  setAside: {
    id: "setAside",
    accepts: ["feather", "yarn", "landscape"],
    itemIds: setAsideItems.map((i) => i.id),
  },
  leftRailA: {
    id: "leftRailA",
    accepts: ["feather"],
    itemIds: featherItems.map((i) => i.id),
  },
  leftRailB: {
    id: "leftRailB",
    accepts: ["yarn"],
    itemIds: yarnItems.map((i) => i.id),
  },
  canvas: {
    id: "canvas",
    accepts: ["feather", "yarn", "landscape", "avatar", "app"],
    itemIds: [],
  },
  addContext: {
    id: "addContext",
    accepts: ["feather", "yarn", "landscape", "avatar", "app"],
    itemIds: [],
  },
  bottomPeople: {
    id: "bottomPeople",
    accepts: ["avatar", "landscape"],
    itemIds: [...avatarItems.map((i) => i.id), ...landscapeItems.map((i) => i.id)],
  },
  bottomApps: {
    id: "bottomApps",
    accepts: ["app"],
    itemIds: appItems.map((i) => i.id),
  },
  topRight: {
    id: "topRight",
    accepts: ["user"],
    itemIds: [userItem.id],
  },
};
