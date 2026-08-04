export const MODE_UNLOCKS_ENABLED = false;
export const futureModeUnlocks = {
  bomba: "2026-08-07T00:00:00+02:00",
  "najblizej-prawdy": "2026-08-10T00:00:00+02:00",
  ranking: "2026-08-13T00:00:00+02:00",
  "5-sekund": "2026-08-16T00:00:00+02:00",
  zegar: "2026-08-19T00:00:00+02:00",
  "pokemon-dex": "2026-08-22T00:00:00+02:00",
  "pokemon-last-letter": "2026-08-25T00:00:00+02:00",
  "pokemon-evolution": "2026-08-28T00:00:00+02:00",
  "pokemon-auction": "2026-08-31T00:00:00+02:00",
  "pokemon-types": "2026-09-03T00:00:00+02:00",
  "pokemon-match-type": "2026-09-06T00:00:00+02:00",
  wavelength: "2026-09-09T00:00:00+02:00",
  quiz: "2026-09-12T00:00:00+02:00",
  mathematics: "2026-09-15T00:00:00+02:00",
  marker: "2026-09-18T00:00:00+02:00",
  sequence: "2026-09-21T00:00:00+02:00",
  family: "2026-09-24T00:00:00+02:00",
  "word-chain": "2026-09-27T00:00:00+02:00",
};
export const upcomingModeUnlocks = MODE_UNLOCKS_ENABLED ? futureModeUnlocks : {};

export function formatUnlockDate(unlockAt) {
  const date = new Date(unlockAt);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function modeUnlockInfo(modeId, now = Date.now()) {
  const unlockAt = upcomingModeUnlocks[modeId];
  const unlockTime = unlockAt ? new Date(unlockAt).getTime() : 0;
  const locked = Boolean(unlockAt && Number.isFinite(unlockTime) && unlockTime > now);
  return { modeId, unlockAt, unlockTime, locked, label: unlockAt ? formatUnlockDate(unlockAt) : "" };
}

export function isModeLocked(modeId, now = Date.now()) {
  return modeUnlockInfo(modeId, now).locked;
}

export function lockedModeMessage(mode) {
  const unlock = modeUnlockInfo(mode.id);
  return `Ten tryb nie jest jeszcze dostepny. Odblokowanie: ${unlock.label}.`;
}
