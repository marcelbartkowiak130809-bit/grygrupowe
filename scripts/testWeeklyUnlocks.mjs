import assert from "node:assert/strict";
import { test } from "node:test";
import { gamesList } from "../js/games.js";
import { isModeLocked, modeUnlockInfo } from "../js/upcomingModes.js";
import { weeklyModeRelease, weeklyUnlockSnapshot } from "../js/weeklyUnlocks.js";

const firstUnlock = Date.parse("2026-11-21T19:00:00Z");
const hour = 3_600_000;

test("an unlock opens at 20:00 and celebrates only until 21:00 Warsaw time", () => {
  const before = weeklyUnlockSnapshot(firstUnlock - 1);
  assert.equal(before.latest, null);
  assert.equal(before.next.unlockAt, firstUnlock);
  const { modeId } = before.next;
  assert.ok(isModeLocked(modeId, firstUnlock - 1));
  assert.equal(isModeLocked(modeId, firstUnlock), false);
  assert.equal(weeklyUnlockSnapshot(firstUnlock).latest.modeId, modeId);
  assert.equal(weeklyUnlockSnapshot(firstUnlock).nextChangeAt, firstUnlock + hour);
  assert.ok(modeUnlockInfo(modeId, firstUnlock + hour - 1).celebrating);
  assert.equal(modeUnlockInfo(modeId, firstUnlock + hour).celebrating, false);
  assert.equal(weeklyUnlockSnapshot(firstUnlock + hour).celebrating, false);
});

test("queue contains each eligible game once, with a consistent local time across DST", () => {
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23",
  });
  const seen = new Set();
  let state = weeklyUnlockSnapshot(firstUnlock - 1);
  assert.equal(state.remaining, 21);
  while (state.next) {
    const { modeId, unlockAt } = state.next;
    assert.ok(!seen.has(modeId));
    assert.ok(gamesList.some(game => game.id === modeId && !game.hiddenFromLibrary));
    assert.equal(date.format(unlockAt), "Sat 20:00");
    assert.equal(weeklyModeRelease(modeId), state.next);
    seen.add(modeId);
    state = weeklyUnlockSnapshot(unlockAt + hour);
  }
  assert.equal(seen.size, 21);
  assert.equal(state.remaining, 0);
  assert.equal(state.nextChangeAt, undefined);
  for (const id of ["pojedynek-hitow", "minecraft-mob", "minecraft-journey", "minecraft-backpack",
    "board-zgadnij-kto", "pokemon-auction", "songspot", "popularnosc-hitow", "popularnosc-solo", "playlista-cup"]) {
    assert.equal(weeklyModeRelease(id), undefined);
    assert.equal(isModeLocked(id, firstUnlock - 1), false);
  }
  assert.equal(isModeLocked("pokemon-dex", firstUnlock + 365 * 24 * hour), true);
});

test("Wiedza modes open in December and move later releases back two Saturdays", () => {
  for (const [id, iso] of [
    ["board-memory", "2026-11-28T19:00:00Z"],
    ["zgadnij-cene", "2026-12-05T19:00:00Z"],
    ["guess-the-country", "2026-12-12T19:00:00Z"],
    ["pokemon-last-letter", "2026-12-19T19:00:00Z"],
    ["board-domino", "2026-12-26T19:00:00Z"],
    ["pokemon-evolution", "2027-01-02T19:00:00Z"],
  ]) {
    const timestamp = Date.parse(iso);
    assert.equal(weeklyModeRelease(id)?.unlockAt, timestamp);
    assert.equal(isModeLocked(id, timestamp - 1), true);
    assert.equal(isModeLocked(id, timestamp), false);
    assert.equal(weeklyUnlockSnapshot(timestamp).latest.modeId, id);
  }
});
