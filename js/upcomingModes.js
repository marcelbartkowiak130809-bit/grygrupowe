export const upcomingModeUnlocks = {
  bomba: "2026-06-13T00:00:00+02:00",
  "najblizej-prawdy": "2026-06-14T00:00:00+02:00",
  ranking: "2026-06-16T00:00:00+02:00",
  "5-sekund": "2026-06-18T00:00:00+02:00",
  zegar: "2026-06-20T00:00:00+02:00",
};

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
  return `${mode.name} nie jest jeszcze dostepny. Odblokowanie: ${unlock.label}.`;
}
