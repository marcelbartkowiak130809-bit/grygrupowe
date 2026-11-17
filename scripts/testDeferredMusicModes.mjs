import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createSongSpotGame, loadMusicMode, musicModeReady, songSpotDefaults,
  stopPlaylistTournament, stopSongSpotGameTimer, stopSongSpotTimer,
} from "../js/deferredMusicModes.js";

test("music engines load only on entry and share their first request", async () => {
  assert.equal(musicModeReady("kim-jestem"), true);
  assert.equal(musicModeReady("songspot"), false);
  assert.equal(musicModeReady("playlista-cup"), false);
  stopSongSpotTimer();
  stopSongSpotGameTimer();
  stopPlaylistTournament();
  const first = loadMusicMode("songspot-solo");
  assert.equal(first, loadMusicMode("songspot"));
  await first;
  assert.equal(musicModeReady("songspot"), true);
  const game = createSongSpotGame(["a", "b"], songSpotDefaults);
  assert.equal(game.phase, "preview");
  assert.equal(game.players.length, 2);
  assert.equal(musicModeReady("playlista-cup"), false);
  await loadMusicMode("playlista-cup");
  assert.equal(musicModeReady("playlista-cup"), true);
});
