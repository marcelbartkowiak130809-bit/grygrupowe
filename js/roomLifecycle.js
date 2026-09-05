// Identity of a playable moment. Profile/presence updates must not invalidate it.
export function gameMomentKey(game = {}) {
  game = game || {};
  return JSON.stringify([
    game.siteGameId ?? game.startedAt ?? null, game.mode ?? game.boardMode ?? null,
    game.round ?? null, game.phase ?? null, game.turnIndex ?? null,
    game.turnUid ?? game.currentUid ?? game.activeUid ?? null,
    game.questionIndex ?? null, game.phaseEndsAt ?? null,
    game.guessEndsAt ?? null, game.roundEndsAt ?? null,
    game.roundResult?.resultId ?? game.resultId ?? null,
  ]);
}

export function roundAdvanceDeadline(game, storedDeadline, delay, now = Date.now()) {
  // Preserve expired deadlines too: a repaint must not restart the countdown.
  if (Number(storedDeadline) > 0) return Number(storedDeadline);
  if (Number(game.phaseEndsAt) > 0) return Number(game.phaseEndsAt);
  return now + delay;
}
