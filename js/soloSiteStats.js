export function newSoloRun(now = Date.now()) {
  const id = globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`;
  return { id, startedAt:now };
}

export function soloGameEvent(modeId, run, endedAt = Date.now()) {
  if (!run?.id || !Number.isFinite(run.startedAt) || run.startedAt <= 0 || !Number.isFinite(endedAt) || endedAt < run.startedAt) return null;
  return {
    type:"gameFinished",
    eventId:`solo:${modeId}:${run.id}`,
    modeId,
    minutes:Math.min(1440, Math.max(1, Math.ceil((endedAt - run.startedAt) / 60000))),
  };
}
