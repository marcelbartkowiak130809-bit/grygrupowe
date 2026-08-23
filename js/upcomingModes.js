// Tryby są wdrażane etapami: kolejny odblokowuje się co trzy dni o 20:00.
// Nowe tryby są przeplatane: normalny, Pokémon, normalny, Pokémon...
// Daty są zapisane z offsetem Warszawy, żeby harmonogram nie zależał od strefy
// ustawionej w przeglądarce gracza.
export const MODE_UNLOCKS_ENABLED = true;
export const futureModeUnlocks = {
  bomba: "2026-08-07T20:00:00+02:00",
  "najblizej-prawdy": "2026-08-10T20:00:00+02:00",
  ranking: "2026-08-13T20:00:00+02:00",
  "5-sekund": "2026-08-16T20:00:00+02:00",
  zegar: "2026-08-19T20:00:00+02:00",
  wavelength: "2026-08-23T20:00:00+02:00",
  "pokemon-dex": "2026-08-26T20:00:00+02:00",
  quiz: "2026-08-29T20:00:00+02:00",
  "pokemon-last-letter": "2026-09-01T20:00:00+02:00",
  mathematics: "2026-09-04T20:00:00+02:00",
  "pokemon-evolution": "2026-09-07T20:00:00+02:00",
  marker: "2026-09-10T20:00:00+02:00",
  "pokemon-auction": "2026-09-13T20:00:00+02:00",
  sequence: "2026-09-16T20:00:00+02:00",
  "pokemon-types": "2026-09-19T20:00:00+02:00",
  family: "2026-09-22T20:00:00+02:00",
  "pokemon-match-type": "2026-09-25T20:00:00+02:00",
  "word-chain": "2026-09-28T20:00:00+02:00",
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
  return `Ten tryb nie jest jeszcze dostępny. Odblokowanie: ${unlock.label}.`;
}
