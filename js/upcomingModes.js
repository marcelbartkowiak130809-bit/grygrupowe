import { isCategoryModeReleased } from "./categoryVoting.js?v=20260902-4";

// Główne tryby mają własną, niezależną kolejkę. Kategorie Pokémon, planszówki,
// Minecraft i większość trybów muzycznych otwierają się przez głosowanie na stronie głównej.
export const MODE_UNLOCKS_ENABLED = true;
export const futureModeUnlocks = {
  quiz: "2026-09-04T20:00:00+02:00",
  mathematics: "2026-09-07T20:00:00+02:00",
  marker: "2026-09-10T20:00:00+02:00",
  sequence: "2026-09-13T20:00:00+02:00",
  family: "2026-09-16T20:00:00+02:00",
  "word-chain": "2026-09-19T20:00:00+02:00",
  "polacz-nas": "2026-09-22T20:00:00+02:00",
  klamca: "2026-09-25T20:00:00+02:00",
  "falszywa-wiadomosc": "2026-09-28T20:00:00+02:00",
  "tajna-zasada": "2026-10-01T20:00:00+02:00",
};
export const MANUALLY_LOCKED_MODE_IDS = new Set(["pokemon-dex"]);
export const upcomingModeUnlocks = MODE_UNLOCKS_ENABLED ? { ...futureModeUnlocks } : {};
const CATEGORY_MODE_IDS = new Set(["pokemon-dex", "pokemon-last-letter", "pokemon-evolution", "pokemon-auction", "pokemon-types", "pokemon-match-type", "board-chinczyk", "board-slowotwor", "board-statki", "board-reversi", "board-warcaby", "board-cztery", "board-memory", "board-domino", "minecraft-sprint", "minecraft-crafting", "minecraft-mob", "minecraft-biome", "minecraft-truth", "minecraft-redstone", "pojedynek-hitow", "bitwa-hitow", "popularnosc-hitow", "popularnosc-solo", "dokoncz-tekst", "songspot"]);

export function formatUnlockDate(unlockAt) {
  const date = new Date(unlockAt);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function warsawDateKey(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== "literal") result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isUnlockDay(unlockAt, now = Date.now()) {
  return Boolean(unlockAt && warsawDateKey(unlockAt) === warsawDateKey(now));
}

export function formatUnlockTime(unlockAt) {
  const date = new Date(unlockAt);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function modeUnlockInfo(modeId, now = Date.now()) {
  const unlockAt = upcomingModeUnlocks[modeId];
  const unlockTime = unlockAt ? new Date(unlockAt).getTime() : 0;
  const manuallyLocked = MANUALLY_LOCKED_MODE_IDS.has(modeId);
  const categoryMode = CATEGORY_MODE_IDS.has(modeId);
  const categoryLocked = categoryMode && !isCategoryModeReleased(modeId);
  const locked = manuallyLocked || categoryLocked || Boolean(unlockAt && Number.isFinite(unlockTime) && unlockTime > now);
  const label = manuallyLocked ? "Termin zostanie ogłoszony" : categoryLocked ? "Oczekuje na głosowanie" : unlockAt ? formatUnlockDate(unlockAt) : "";
  return { modeId, unlockAt, unlockTime, locked, manuallyLocked, categoryLocked, label };
}

export function isModeLocked(modeId, now = Date.now()) {
  return modeUnlockInfo(modeId, now).locked;
}

export function lockedModeMessage(mode) {
  const unlock = modeUnlockInfo(mode.id);
  return unlock.manuallyLocked
    ? "Ten tryb jest obecnie zablokowany. Termin ponownego odblokowania zostanie ogłoszony."
    : unlock.categoryLocked
      ? "Ten tryb czeka na głosowanie kategorii. Wróć na stronę główną, żeby sprawdzić aktualną kolejkę."
      : `Ten tryb nie jest jeszcze dostępny. Odblokowanie: ${unlock.label}.`;
}
