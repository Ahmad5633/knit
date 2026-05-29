import type { Item, Zone, ZoneId } from "./types";

const mkId = (prefix: string, i: number) => `${prefix}-${i}`;

const yarnTints = ["#5fb3b8", "#8fc878", "#e87898", "#f0c450"];

// Three distinct landscape scenes in the bottom dock.
const landscapeConfigs: Array<{ asset: string; tint?: string; badge?: number }> = [
  { asset: "/assets/landscape-pink.svg" },
  { asset: "/assets/landscape-sunset.svg" },
  { asset: "/assets/landscape-blue.svg", badge: 2 },
];

const yarnItems: Item[] = yarnTints.map((tint, i) => ({
  id: mkId("yarn", i),
  kind: "yarn",
  asset: "/assets/yarn.svg",
  tint,
}));

const landscapeItems: Item[] = landscapeConfigs.map((cfg, i) => ({
  id: mkId("landscape", i),
  kind: "landscape",
  asset: cfg.asset,
  tint: cfg.tint,
  badge: cfg.badge,
}));

const setAsideItems: Item[] = [
  { id: "set-feather-1", kind: "feather", asset: "/assets/feather.svg", tint: "#cfd8e3" },
  { id: "set-feather-2", kind: "feather", asset: "/assets/feather.svg", tint: "#f4f0ea" },
  { id: "set-landscape", kind: "landscape", asset: "/assets/landscape-mountain.svg" },
  { id: "set-yarn", kind: "yarn", asset: "/assets/yarn.svg", tint: "#a06aa8" },
];

const avatarItems: Item[] = [
  { id: "avatar-1", kind: "avatar", asset: "/assets/avatar-1.svg", label: "Aiden" },
  { id: "avatar-2", kind: "avatar", asset: "/assets/avatar-2.svg", label: "Ben" },
  { id: "avatar-3", kind: "avatar", asset: "/assets/avatar-3.svg", label: "Carla" },
  { id: "avatar-4", kind: "avatar", asset: "/assets/avatar-4.svg", label: "Dani" },
];

const appItems: Item[] = [
  { id: "app-0", kind: "app", asset: "/assets/app-cat.svg", tint: "#9ad5b0", label: "Notes" },
  { id: "app-1", kind: "app", asset: "/assets/app-clap.svg", tint: "#5dd5d5", label: "Clips" },
  { id: "app-2", kind: "app", asset: "/assets/app-chart.svg", tint: "#ffffff", label: "Stats", badge: 5 },
  { id: "app-3", kind: "app", asset: "/assets/app-slack.svg", tint: "#7c3aed", label: "Slack" },
];

const userItem: Item = {
  id: "user-freddy",
  kind: "user",
  asset: "/assets/avatar-user.svg",
  label: "Freddy Lam",
};

export const seedItems: Record<string, Item> = Object.fromEntries(
  [
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
    accepts: ["feather", "yarn", "landscape", "avatar", "app", "file", "document"],
    itemIds: setAsideItems.map((i) => i.id),
  },
  leftRailA: {
    id: "leftRailA",
    accepts: ["document"],
    itemIds: [],
  },
  leftRailB: {
    id: "leftRailB",
    accepts: ["yarn"],
    itemIds: yarnItems.map((i) => i.id),
  },
  canvas: {
    id: "canvas",
    accepts: ["feather", "yarn", "landscape", "avatar", "app", "file", "document"],
    itemIds: [],
  },
  addContext: {
    id: "addContext",
    accepts: ["feather", "yarn", "landscape", "avatar", "app", "file", "document"],
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
