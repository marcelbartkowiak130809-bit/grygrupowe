const HOUR = 60 * 60 * 1000;
const WEEK = 7 * 24 * HOUR;
const FIRST_SATURDAY = Date.UTC(2026, 10, 21, 20);
const warsawHour = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Warsaw",
  hour: "numeric",
  hourCycle: "h23",
});

// Shuffled once at launch so every player gets the same release each week.
// Confirmed vote winners and owner-selected releases are already playable.
// Append future candidates to preserve dates already assigned to these modes.
const releaseOrder = [
  "minecraft-redstone",
  "board-memory",
  "pokemon-last-letter",
  "board-domino",
  "pokemon-evolution",
  "board-cztery",
  "bitwa-hitow",
  "board-chinczyk",
  "minecraft-sprint",
  "pokemon-match-type",
  "minecraft-truth",
  "board-reversi",
  "board-warcaby",
  "pokemon-types",
  "board-slowotwor",
  "minecraft-biome",
  "board-statki",
  "minecraft-crafting",
  "dokoncz-tekst",
];

const releases = releaseOrder.map((modeId, index) => {
  const eveningUtc = FIRST_SATURDAY + index * WEEK;
  const offset = Number(warsawHour.format(eveningUtc)) - 20;
  const unlockAt = eveningUtc - offset * HOUR;
  return Object.freeze({ modeId, unlockAt, celebrationEndsAt: unlockAt + HOUR });
});
const releaseByMode = new Map(releases.map(release => [release.modeId, release]));

export function weeklyModeRelease(modeId) {
  return releaseByMode.get(modeId);
}

export function weeklyUnlockSnapshot(now = Date.now()) {
  const nextIndex = releases.findIndex(release => release.unlockAt > now);
  const index = nextIndex === -1 ? releases.length : nextIndex;
  const latest = releases[index - 1] || null;
  const next = releases[index] || null;
  const celebrating = Boolean(latest && now < latest.celebrationEndsAt);
  return {
    latest, next, celebrating,
    remaining: releases.length - index,
    nextChangeAt: celebrating ? latest.celebrationEndsAt : next?.unlockAt,
  };
}
