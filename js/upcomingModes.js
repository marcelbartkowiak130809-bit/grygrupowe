import { weeklyModeRelease } from "./weeklyUnlocks.js";

// Główne tryby mają własną, niezależną kolejkę premier.
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
  charades: "2026-10-04T20:00:00+02:00",
  hangman: "2026-10-07T20:00:00+02:00",
};
export const MANUALLY_LOCKED_MODE_IDS = new Set(["pokemon-dex"]);
export const upcomingModeUnlocks = MODE_UNLOCKS_ENABLED ? { ...futureModeUnlocks } : {};

export function formatUnlockDate(unlockAt, { weekday } = {}) {
  const date = new Date(unlockAt);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    weekday,
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
  const weekly = weeklyModeRelease(modeId);
  const unlockTime = weekly?.unlockAt || (unlockAt ? Date.parse(unlockAt) : 0);
  const manuallyLocked = MANUALLY_LOCKED_MODE_IDS.has(modeId);
  const locked = manuallyLocked || unlockTime > now;
  const celebrating = Boolean(weekly && !locked && now < weekly.celebrationEndsAt);
  const label = manuallyLocked ? "Termin zostanie ogłoszony" : weekly ? "Sobotnia kolejka" : unlockAt ? formatUnlockDate(unlockAt) : "";
  return { modeId, unlockAt, unlockTime, locked, manuallyLocked, weekly: Boolean(weekly), celebrating, label };
}

export function isModeLocked(modeId, now = Date.now()) {
  return modeUnlockInfo(modeId, now).locked;
}

export function lockedModeMessage(mode) {
  const unlock = modeUnlockInfo(mode.id);
  return unlock.manuallyLocked
    ? "Ten tryb jest obecnie zablokowany. Termin ponownego odblokowania zostanie ogłoszony."
    : unlock.weekly
      ? "Ten tryb jest w kolejce. Co sobotę o 20:00 odblokowujemy jeden losowo wybrany tryb."
      : `Ten tryb nie jest jeszcze dostępny. Odblokowanie: ${unlock.label}.`;
}
