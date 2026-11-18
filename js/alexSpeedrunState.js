export const ALEX_COOLDOWN = 5 * 60 * 60 * 1000;
export const alexTimeBoards = ['chapter1', 'chapter2', 'chapter3', 'total'];
export const chapterClockKey = chapter => `chapter${chapter}`;

export function alexSpeedrunUpdate(record, { type, id, chapter }, now, timestamp, nick) {
  const run = record?.run;
  if (type === 'reserve') {
    if (run?.id === id) return;
    if (run && run.reservedAt + ALEX_COOLDOWN > now) return;
    return {
      nick,
      best: record?.best || Object.fromEntries(alexTimeBoards.map(key => [key, 0])),
      run: { id, reservedAt: timestamp, step: 0,
        ...Object.fromEntries(alexTimeBoards.slice(0, 3).map(key => [key, { start: 0, end: 0 }])),
      },
    };
  }
  if (!run || run.id !== id || ![1, 2, 3].includes(chapter)) return;
  const key = chapterClockKey(chapter);
  const expected = (chapter - 1) * 3;
  if (type === 'begin' && run.step === expected) {
    return { ...record, run: { ...run, step: expected + 1, [key]: { start: timestamp, end: 0 } } };
  }
  if (type === 'finish' && run.step === expected + 1) {
    return { ...record, run: { ...run, step: expected + 2, [key]: { ...run[key], end: timestamp } } };
  }
  if (type === 'publish' && run.step === expected + 2) {
    const elapsed = clock => clock.end - clock.start;
    const best = { ...record.best };
    const duration = elapsed(run[key]);
    best[key] = Math.min(best[key] || duration, duration);
    if (chapter === 3) {
      const total = alexTimeBoards.slice(0, 3).reduce((sum, name) => sum + elapsed(run[name]), 0);
      best.total = Math.min(best.total || total, total);
    }
    return { ...record, best, run: { ...run, step: expected + 3 } };
  }
}

export function alexClock(ms) {
  const time = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(time / 60);
  const seconds = String(time % 60).padStart(2, '0');
  return `${minutes}:${seconds},${String(Math.floor(ms % 1000 / 10)).padStart(2, '0')}`;
}
