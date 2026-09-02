import { musicCatalogForRegion, musicRegionOptions, musicRegionPicker } from "./music.js?v=20260903-1";
import { Audio } from "./audio.js?v=20260902-2";
import { escapeHtml } from "./utils.js?v=20260901-3";

export const songSpotDifficulties = [
  { id: "easy", label: "Łatwy", seconds: 0.1, accent: "#22c55e" },
  { id: "medium", label: "Średni", seconds: 0.5, accent: "#eab308" },
  { id: "hard", label: "Trudny", seconds: 2, accent: "#f97316" },
  { id: "expert", label: "Ekspert", seconds: 8, accent: "#ef4444" },
  { id: "impossible", label: "Niemożliwy", seconds: 15, accent: "#a855f7" },
];

export const songSpotDefaults = { region: "global", rounds: 5, answerTime: 20, enabledTimes: [0.1, 0.5, 2, 8, 15] };
export const songSpotTimes = songSpotDifficulties.map(item => item.seconds);
const songSpotPoints = new Map([[0.1, 100], [0.5, 80], [2, 60], [8, 40], [15, 25]]);
const SONG_SPOT_STORAGE_KEY = "grygrupowe-songspot-solo-v1:";
const safeDifficulty = value => songSpotDifficulties.some(item => item.id === value) ? value : songSpotDifficulties[0].id;
const safeRegion = value => musicRegionOptions.some(([id]) => id === value) ? value : songSpotDefaults.region;
const difficultyFor = value => songSpotDifficulties.find(item => item.id === safeDifficulty(value)) || songSpotDifficulties[0];
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = value => Array.isArray(value) ? value : [];
const unique = value => [...new Set(Array.isArray(value) ? value.map(item => String(item || "")).filter(Boolean) : [])];
const trackPool = region => musicCatalogForRegion(safeRegion(region)).filter(track => track?.previewUrl && track.title && track.artist);
const trackById = id => {
  const wanted = String(id || "");
  return wanted ? musicCatalogForRegion("global").concat(musicCatalogForRegion("polish")).find(track => String(track.id) === wanted) || null : null;
};

const clampNumber = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
};

function normalizeSongSpotTimes(value) {
  const selected = Array.isArray(value) ? value.map(Number).filter(item => songSpotTimes.some(time => Math.abs(time - item) < 0.001)) : [];
  return [...new Set(selected.map(item => songSpotTimes.find(time => Math.abs(time - item) < 0.001)))].sort((a, b) => a - b);
}

function availableSongSpotTimes() {
  return [...songSpotTimes];
}

function stageIndexFor(state, times = availableSongSpotTimes(state?.enabledTimes)) {
  const requested = Number(state?.timeIndex);
  if (Number.isFinite(requested)) return Math.max(0, Math.min(times.length - 1, Math.floor(requested)));
  const legacySeconds = difficultyFor(state?.difficulty).seconds;
  const legacyIndex = times.findIndex(time => Math.abs(time - legacySeconds) < 0.001);
  return legacyIndex >= 0 ? legacyIndex : 0;
}

function stageTimeFor(state) {
  const times = availableSongSpotTimes(state?.enabledTimes);
  return times[stageIndexFor(state, times)] || times[0] || songSpotTimes[0];
}

export function sanitizeSongSpotSettings(settings = {}) {
  return {
    rounds: Math.round(clampNumber(settings.rounds, 1, 20, songSpotDefaults.rounds)),
    answerTime: Math.round(clampNumber(settings.answerTime, 10, 60, songSpotDefaults.answerTime)),
    region: safeRegion(settings.region),
    enabledTimes: [...songSpotTimes],
  };
}

function storageKey(playerId) {
  return `${SONG_SPOT_STORAGE_KEY}${String(playerId || "guest")}`;
}

function readStored(playerId) {
  try { return JSON.parse(localStorage.getItem(storageKey(playerId)) || "null"); } catch { return null; }
}

function saveStored(state) {
  try { localStorage.setItem(storageKey(state.playerId), JSON.stringify(state)); } catch {}
}

function normalizeState(raw, playerId) {
  const source = object(raw);
  const status = ["idle", "playing", "reveal", "over"].includes(source.status) ? source.status : "idle";
  const streak = Math.max(0, Number(source.streak) || 0);
  const enabledTimes = availableSongSpotTimes(source.enabledTimes);
  return {
    playerId: String(playerId || source.playerId || "guest"),
    status,
    difficulty: safeDifficulty(source.difficulty),
    region: safeRegion(source.region),
    enabledTimes,
    timeIndex: stageIndexFor({ ...source, enabledTimes }, enabledTimes),
    streak: status === "idle" ? 0 : streak,
    best: Math.max(0, Number(source.best) || 0, status !== "idle" ? streak : 0),
    round: Math.max(0, Number(source.round) || 0),
    trackId: String(source.trackId || ""),
    usedIds: unique(source.usedIds),
    played: Boolean(source.played),
    playbackDone: Boolean(source.playbackDone),
    playbackStartedAt: Number(source.playbackStartedAt) || 0,
    playbackPosition: Math.max(0, Number(source.playbackPosition) || 0),
    lastResult: source.lastResult && typeof source.lastResult === "object" ? source.lastResult : null,
    lastError: String(source.lastError || ""),
  };
}

let songSpotState = null;
let songSpotOwner = "";

function readState(playerId) {
  const owner = String(playerId || "guest");
  if (songSpotOwner === owner && songSpotState) return songSpotState;
  songSpotState = normalizeState(readStored(owner), owner);
  songSpotOwner = owner;
  return songSpotState;
}

function chooseTrack(usedIds, region) {
  const pool = trackPool(region);
  if (!pool.length) return null;
  const used = new Set(usedIds);
  const fresh = pool.filter(track => !used.has(String(track.id)));
  const source = fresh.length ? fresh : pool;
  return source[Math.floor(Math.random() * source.length)] || null;
}

function startRound(state) {
  const track = chooseTrack(state.usedIds, state.region);
  if (!track) {
    state.status = "idle";
    state.lastError = "Brak dostępnych previewów dla tego katalogu.";
    state.trackId = "";
    return;
  }
  state.usedIds = [...new Set([...state.usedIds, String(track.id)])].slice(-Math.max(20, trackPool(state.region).length));
  state.trackId = String(track.id);
  state.enabledTimes = availableSongSpotTimes(state.enabledTimes);
  state.timeIndex = 0;
  state.played = false;
  state.playbackDone = false;
  state.playbackStartedAt = 0;
  state.playbackPosition = 0;
  state.lastResult = null;
  state.lastError = "";
  state.status = "playing";
}

function normalizeGuess(value) {
  return String(value || "")
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function songSpotSuggestionTracks(query, region) {
  const needle = normalizeGuess(query);
  if (needle.length < 2) return [];
  return trackPool(region)
    .map(track => {
      const title = normalizeGuess(track.title), artist = normalizeGuess(track.artist);
      if (!title.includes(needle) && !artist.includes(needle)) return null;
      const score = title.startsWith(needle) ? 0 : artist.startsWith(needle) ? 1 : 2;
      return { track, score, title, artist };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title, "pl-PL"))
    .slice(0, 8)
    .map(item => item.track);
}

function songSpotSuggestionHtml(track, index) {
  const cover = track?.coverUrl
    ? `<img src="${escapeHtml(track.coverUrl)}" alt="" loading="lazy" decoding="async">`
    : "♫";
  return `<button type="button" class="songspot-suggestion" role="option" data-songspot-suggestion="${index}"><span class="songspot-suggestion-cover">${cover}</span><span class="songspot-suggestion-copy"><b>${escapeHtml(track?.title || "Nieznany utwór")}</b><small>${escapeHtml(track?.artist || "")}${track?.album ? ` · ${escapeHtml(track.album)}` : ""}</small></span><span class="songspot-suggestion-action">Wybierz</span></button>`;
}

function bindSongSpotAnswerSuggestions(root, region) {
  const input = root.querySelector("[data-songspot-answer-input]"), suggestions = root.querySelector("[data-songspot-suggestions]");
  if (!input || !suggestions) return;
  let matches = [], suppressFocusUpdate = false;
  const close = () => {
    matches = [];
    suggestions.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
  };
  const update = () => {
    if (input.disabled) return close();
    matches = songSpotSuggestionTracks(input.value, region);
    suggestions.innerHTML = matches.map(songSpotSuggestionHtml).join("");
    input.setAttribute("aria-expanded", matches.length ? "true" : "false");
    suggestions.querySelectorAll("[data-songspot-suggestion]").forEach(button => button.addEventListener("click", () => {
      const track = matches[Number(button.dataset.songspotSuggestion)];
      if (!track) return;
      input.value = track.title;
      close();
      if (document.activeElement !== input) suppressFocusUpdate = true;
      input.focus();
    }));
  };
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.addEventListener("input", update);
  input.addEventListener("focus", () => {
    if (suppressFocusUpdate) { suppressFocusUpdate = false; return; }
    update();
  });
  input.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
  input.form?.addEventListener("submit", close);
}

function isCorrectGuess(value, track) {
  const guess = normalizeGuess(value), title = normalizeGuess(track?.title);
  if (!guess || !title) return false;
  if (guess === title || guess.includes(title)) return true;
  const withoutFeature = title.replace(/\s+(feat|ft|with)\s+.+$/i, "").trim();
  return withoutFeature.length >= 4 && (guess === withoutFeature || guess.includes(withoutFeature));
}

function resultFor(state, guess, skipped = false) {
  const track = trackById(state.trackId) || {};
  const seconds = stageTimeFor(state);
  return {
    trackId: String(track.id || state.trackId || ""),
    title: String(track.title || "Nieznany utwór"),
    artist: String(track.artist || ""),
    coverUrl: String(track.coverUrl || ""),
    previewUrl: String(track.previewUrl || ""),
    externalUrl: String(track.externalUrl || track.spotifyUrl || ""),
    guess: String(guess || "").trim(),
    skipped: Boolean(skipped),
    seconds,
    correct: !skipped && isCorrectGuess(guess, track),
  };
}

export const SongSpotSoloEngine = {
  get(playerId) { return readState(playerId); },
  start(playerId, regionOrDifficulty = "global", legacyRegion = "global") {
    const owner = String(playerId || "guest");
    const previous = readState(owner);
    const region = musicRegionOptions.some(([id]) => id === regionOrDifficulty) ? regionOrDifficulty : legacyRegion;
    songSpotState = {
      playerId: owner,
      status: "playing",
      region: safeRegion(region),
      enabledTimes: [...songSpotTimes],
      timeIndex: 0,
      streak: 0,
      best: Number(previous.best) || 0,
      round: 1,
      trackId: "",
      usedIds: [],
      played: false,
      playbackDone: false,
      playbackStartedAt: 0,
      playbackPosition: 0,
      lastResult: null,
      lastError: "",
    };
    songSpotOwner = owner;
    startRound(songSpotState);
    saveStored(songSpotState);
    return songSpotState;
  },
  setDifficulty(playerId, difficulty) {
    const state = readState(playerId);
    if (state.status !== "idle") return state;
    const times = availableSongSpotTimes(state.enabledTimes);
    state.timeIndex = Math.max(0, times.findIndex(time => Math.abs(time - difficultyFor(difficulty).seconds) < 0.001));
    saveStored(state);
    return state;
  },
  setRegion(playerId, region) {
    const state = readState(playerId);
    const nextRegion = safeRegion(region);
    if (state.region === nextRegion) return state;
    // The catalog is part of the run state. Switching it mid-run starts a
    // clean series instead of mixing global and Polish tracks in one streak.
    if (state.status !== "idle") {
      state.status = "idle";
      state.streak = 0;
      state.round = 0;
      state.trackId = "";
      state.played = false;
      state.playbackDone = false;
      state.playbackStartedAt = 0;
      state.playbackPosition = 0;
      state.timeIndex = 0;
      state.lastResult = null;
    }
    state.region = nextRegion;
    saveStored(state);
    return state;
  },
  markPlayed(playerId) {
    const state = readState(playerId);
    if (state.status !== "playing" || state.played) return state;
    state.played = true;
    state.playbackDone = false;
    // The click only reserves the one allowed listen. The real clock starts
    // from the audio element's `play` event, not from the button click.
    state.playbackStartedAt = 0;
    state.playbackPosition = 0;
    saveStored(state);
    return state;
  },
  markPlaybackStarted(playerId) {
    const state = readState(playerId);
    if (state.status !== "playing" || !state.played) return state;
    if (!state.playbackStartedAt) {
      state.playbackStartedAt = Date.now();
      saveStored(state);
    }
    return state;
  },
  updatePlaybackPosition(playerId, seconds) {
    const state = readState(playerId);
    if (state.status !== "playing" || !state.played) return state;
    const value = Number(seconds);
    if (!Number.isFinite(value)) return state;
    const next = Math.max(Number(state.playbackPosition) || 0, Math.max(0, value));
    if (next - (Number(state.playbackPosition) || 0) < 0.02) return state;
    state.playbackPosition = next;
    saveStored(state);
    return state;
  },
  setPlaybackPosition(playerId, seconds) {
    const state = readState(playerId);
    if (state.status !== "playing" || !state.played) return state;
    const value = Number(seconds);
    if (!Number.isFinite(value)) return state;
    state.playbackPosition = Math.max(0, value);
    saveStored(state);
    return state;
  },
  markPlaybackDone(playerId) {
    const state = readState(playerId);
    if (state.status !== "playing" || !state.played) return state;
    state.playbackDone = true;
    saveStored(state);
    return state;
  },
  guess(playerId, value, expected = {}) {
    const state = readState(playerId);
    if (state.status !== "playing" || !state.played) return state;
    if (expected.trackId && String(expected.trackId) !== state.trackId) return state;
    const result = resultFor(state, value, false);
    state.lastResult = result;
    if (result.correct) {
      state.streak += 1;
      state.best = Math.max(state.best, state.streak);
      state.status = "reveal";
    } else {
      state.streak = 0;
      state.status = "over";
    }
    saveStored(state);
    return state;
  },
  skip(playerId, expected = {}) {
    const state = readState(playerId);
    if (state.status !== "playing") return state;
    if (expected.trackId && String(expected.trackId) !== state.trackId) return state;
    const times = availableSongSpotTimes(state.enabledTimes);
    const currentIndex = stageIndexFor(state, times);
    if (currentIndex < times.length - 1) {
      state.timeIndex = currentIndex + 1;
      state.playbackDone = false;
      // Skip changes only the target threshold. The same preview continues
      // from its current position, so this is cumulative playback.
      if (!state.played) {
        state.playbackStartedAt = 0;
        state.playbackPosition = 0;
      }
      state.lastResult = null;
      saveStored(state);
      return state;
    }
    state.lastResult = resultFor(state, "", true);
    state.streak = 0;
    state.status = "over";
    saveStored(state);
    return state;
  },
  next(playerId) {
    const state = readState(playerId);
    if (state.status !== "reveal" || !state.lastResult?.correct) return state;
    state.round += 1;
    startRound(state);
    saveStored(state);
    return state;
  },
  stop(playerId) {
    const state = readState(playerId);
    state.status = "idle";
    state.streak = 0;
    state.trackId = "";
    state.played = false;
    state.playbackDone = false;
    state.playbackStartedAt = 0;
    state.playbackPosition = 0;
    state.timeIndex = 0;
    state.lastResult = null;
    saveStored(state);
    return state;
  },
};

let songSpotTimer = 0;
let songSpotTimerKey = "";

export function stopSongSpotTimer() {
  window.clearTimeout(songSpotTimer);
  songSpotTimer = 0;
  songSpotTimerKey = "";
}

function formatSeconds(seconds) {
  return `${Number(seconds).toLocaleString("pl-PL", { minimumFractionDigits: seconds < 1 ? 1 : 0, maximumFractionDigits: 1 })} s`;
}

function regionPicker(state) {
  return `<div class="songspot-region-picker" role="radiogroup" aria-label="Katalog utworów">${musicRegionOptions.map(([id, icon, label, description]) => `<button type="button" class="music-region-option ${state.region === id ? "is-selected" : ""}" data-songspot-region="${escapeHtml(id)}" aria-pressed="${state.region === id ? "true" : "false"}"><span class="music-region-option-icon">${icon}</span><span><b>${escapeHtml(label)}</b><small>${escapeHtml(description)}</small></span></button>`).join("")}</div>`;
}

function timeline(state) {
  const times = availableSongSpotTimes(state?.enabledTimes), currentIndex = stageIndexFor(state, times), max = Math.max(...times, 0.1);
  return `<div class="songspot-timeline" aria-label="Kolejne czasy odsłuchu"><div class="songspot-timeline-track"><i data-songspot-solo-progress style="width:0%"></i>${times.map((time, index) => `<span class="${index === currentIndex ? "is-selected" : ""}" style="left:${Math.max(1, (time / max) * 100)}%"><b>${formatSeconds(time)}</b></span>`).join("")}</div><div class="songspot-timeline-caption"><span>od początku utworu · etap ${currentIndex + 1}/${times.length}</span><strong data-songspot-solo-countdown>${formatSeconds(times[currentIndex])}</strong></div></div>`;
}

function stageSequence() {
  return `<div class="songspot-stage-list" aria-label="Kolejne progi odsłuchu"><div class="songspot-stage-rail">${songSpotTimes.map((time, index) => `<span class="songspot-stage-step" style="--stage-delay:${index * 55}ms"><b>${formatSeconds(time)}</b>${index < songSpotTimes.length - 1 ? "<i>→</i>" : ""}</span>`).join("")}</div><small>Każdy Skip odsłania kolejny fragment tego samego utworu</small></div>`;
}

function coverHtml(result) {
  if (!result?.coverUrl) return `<div class="songspot-result-cover songspot-cover-placeholder">♫</div>`;
  return `<div class="songspot-result-cover"><img src="${escapeHtml(result.coverUrl)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.closest('.songspot-result-cover').classList.add('songspot-cover-placeholder');this.closest('.songspot-result-cover').innerHTML='♫'"> </div>`;
}

function resultHtml(state) {
  const result = state.lastResult || {};
  const correct = Boolean(result.correct);
  return `<section class="songspot-result ${correct ? "is-correct" : "is-wrong"} enter"><div class="songspot-result-mark">${correct ? "✓" : "×"}</div><p class="eyebrow">${correct ? "TRAFIONO" : "KONIEC SERII"}</p><h2>${correct ? `Streak: ${Number(state.streak || 0)}` : `Streak: 0`}</h2><div class="songspot-result-track">${coverHtml(result)}<div><small>POPRAWNA ODPOWIEDŹ</small><strong>${escapeHtml(result.title || "Nieznany utwór")}</strong><span>${escapeHtml(result.artist || "")}</span></div></div>${result.guess ? `<p class="songspot-result-guess">Twoja odpowiedź: <b>${escapeHtml(result.guess)}</b></p>` : `<p class="songspot-result-guess">Utwór został pominięty.</p>`}<div class="songspot-result-actions">${correct ? `<button class="primary big" id="songspot-next">Następny utwór</button><button class="ghost" id="songspot-stop">Przerwij serię</button>` : `<button class="primary big" id="songspot-restart">Zagraj jeszcze raz</button><button class="ghost" id="songspot-menu">Wróć do muzyki</button>`}</div></section>`;
}

function header(state) {
  const region = musicRegionOptions.find(([id]) => id === state.region) || musicRegionOptions[0];
  return `<p class="eyebrow">TRYB SOLO · ${region[1]} ${escapeHtml(region[2])}</p><div class="songspot-title-row"><div><h1>Zgadnij utwór</h1><p class="muted">Rozpoznaj piosenkę po krótkim fragmencie i zbuduj jak najdłuższą serię.</p></div><div class="lyrics-solo-streak"><small>STREAK</small><b>${Number(state.streak || 0)}</b></div></div>`;
}

function startHtml(state) {
  return `<section class="songspot-start"><div class="songspot-icon">🎧</div><p class="eyebrow">SZYBKI SOLO RUN</p><h2>Ile utworów rozpoznasz z rzędu?</h2><p class="muted">Każdy utwór zaczyna się od 0,1 s. Jeśli nie wiesz, kliknij „Skip”, żeby usłyszeć dłuższy fragment tego samego utworu. Czasy są liczone łącznie od początku.</p>${regionPicker(state)}${stageSequence()}<div class="songspot-best"><span>🏆</span><div><small>TWÓJ REKORD</small><b>${Number(state.best || 0)} trafień</b></div></div>${state.lastError ? `<p class="songspot-error">⚠️ ${escapeHtml(state.lastError)}</p>` : ""}<button class="primary big" id="songspot-start">Zacznij serię</button></section>`;
}

function activeHtml(state, item) {
  const times = availableSongSpotTimes(state.enabledTimes), stageIndex = stageIndexFor(state, times), duration = times[stageIndex] || times[0];
  const ready = state.played && state.playbackDone;
  // The key identifies the actual preview, not the current threshold. That
  // lets the audio manager carry the exact position across Skip renders.
  const audio = item?.previewUrl ? `<audio data-songspot-audio data-track-audio preload="auto" data-track-key="songspot:${escapeHtml(state.playerId)}:${escapeHtml(state.round)}:${escapeHtml(state.trackId)}" src="${escapeHtml(item.previewUrl)}"></audio>` : "";
  const nextLabel = stageIndex < times.length - 1 ? `Skip · ${formatSeconds(times[stageIndex + 1])}` : "Poddaj się";
  const roundClass = `songspot-round${state.played ? " is-played" : ""}${state.playbackDone ? " is-ready" : ""}`;
  return `<section class="${roundClass}"><div class="songspot-mystery-cover ${state.played && !state.playbackDone ? "is-playing" : ""}" aria-hidden="true"><span>♫</span><small>${escapeHtml(formatSeconds(duration))}</small></div><p class="eyebrow">FRAGMENT AUDIO · RUNDA ${Number(state.round || 1)}</p><h2>Jaki to utwór?</h2><p class="muted songspot-instruction">Próg to ${formatSeconds(duration)} łącznie od początku. Skip podczas odsłuchu dogrywa tylko brakujący fragment tego samego utworu.</p>${timeline(state)}<div class="songspot-play-row">${audio}<button class="songspot-play-button" type="button" data-songspot-play ${state.played ? "disabled" : ""}>▶ <span>${state.played ? "Fragment odsłuchany" : `Odtwórz ${formatSeconds(duration)}`}</span></button><span data-songspot-audio-state>${state.playbackDone ? "Odsłuch zakończony — zgaduj albo przejdź dalej." : state.played ? "Fragment jest odtwarzany…" : "Kliknij, aby rozpocząć odsłuch."}</span></div>${Audio.trackVolumeControlHtml({ compact: true })}<form class="songspot-answer-form" data-songspot-answer-form><label for="songspot-answer">Nazwa utworu</label><div><span class="songspot-answer-input-wrap"><input id="songspot-answer" name="answer" data-songspot-answer-input maxlength="140" autocomplete="off" placeholder="Wpisz tytuł piosenki…" required><span class="songspot-suggestions" data-songspot-suggestions role="listbox"></span></span><button class="primary" type="submit" ${ready ? "" : "disabled"}>Sprawdź</button></div><small>${ready ? "Możesz wpisać sam tytuł — wykonawca nie jest wymagany." : "Możesz wpisać tytuł już teraz — sprawdzenie będzie możliwe po odsłuchu."}</small></form><button class="ghost songspot-skip" type="button" data-songspot-skip>${nextLabel}</button></section>`;
}

export function renderSongSpotSolo(root, { playerId }, actions, { quiet = false } = {}) {
  stopSongSpotTimer();
  const previousAudio = root.querySelector("[data-songspot-audio]");
  const previousAudioKey = previousAudio?.dataset?.trackKey || "";
  const state = SongSpotSoloEngine.get(playerId);
  const item = trackById(state.trackId);
  const expected = { trackId: state.trackId };
  let content = header(state);
  if (state.status !== "idle") content += `${regionPicker(state)}<p class="songspot-region-note">Zmiana katalogu rozpocznie nową serię.</p>`;
  if (state.status === "idle") content += startHtml(state);
  else if (state.status === "playing" && item) content += activeHtml(state, item);
  else if (state.status === "playing") content += `<section class="songspot-round"><p class="songspot-error">Nie udało się przygotować tego preview. Przejdź do następnego czasu tego samego utworu.</p><button class="primary" id="songspot-missing-skip">Skip</button></section>`;
  else content += resultHtml(state);
  root.innerHTML = `<main class="page music-page songspot-page${quiet ? " songspot-quiet-update" : " enter"}"><section class="panel music-panel songspot-panel">${content}<p class="songspot-note">Czas jest łączny — np. 8 s oznacza osiem sekund od początku, a nie sumę wcześniejszych poziomów.</p></section><button id="songspot-home" class="ghost">Wróć do muzyki</button></main>`;
  // A threshold change is not a new playback session. Reattach the existing
  // media element so a user gesture can continue it without autoplay.
  const nextAudio = root.querySelector("[data-songspot-audio]");
  if (previousAudio && nextAudio && previousAudioKey && previousAudioKey === nextAudio.dataset.trackKey) nextAudio.replaceWith(previousAudio);
  root.querySelectorAll("[data-songspot-region]").forEach(button => button.addEventListener("click", () => actions.songSpotRegion?.(button.dataset.songspotRegion)));
  root.querySelector("#songspot-start")?.addEventListener("click", () => actions.songSpotStart(state.region));
  root.querySelector("#songspot-restart")?.addEventListener("click", () => actions.songSpotStart(state.region));
  root.querySelector("#songspot-next")?.addEventListener("click", actions.songSpotNext);
  root.querySelector("#songspot-stop")?.addEventListener("click", actions.songSpotStop);
  root.querySelector("#songspot-menu")?.addEventListener("click", actions.goMusicModes || actions.goPlatform);
  root.querySelector("#songspot-home")?.addEventListener("click", actions.goMusicModes || actions.goPlatform);
  root.querySelector("#songspot-missing-skip")?.addEventListener("click", () => actions.songSpotSkip(expected));
  root.querySelector("[data-songspot-answer-form]")?.addEventListener("submit", event => { event.preventDefault(); const input = event.currentTarget.querySelector("input"); actions.songSpotGuess(input?.value || "", expected); });
  root.querySelector("[data-songspot-skip]")?.addEventListener("click", () => actions.songSpotSkip(expected));
  Audio.bindTrackVolumeControls(root);
  bindSongSpotAnswerSuggestions(root, state.region);
  if (state.status === "playing" && item) bindSongSpotAudio(root, state, playerId, actions);
}

function bindSongSpotAudio(root, state, playerId) {
  const audio = root.querySelector("[data-songspot-audio]"), button = root.querySelector("[data-songspot-play]"), status = root.querySelector("[data-songspot-audio-state]"), input = root.querySelector("[data-songspot-answer-form] input"), submit = root.querySelector("[data-songspot-answer-form] button"), hint = root.querySelector("[data-songspot-answer-form] small");
  if (!audio || !button) return;
  const duration = stageTimeFor(state);
  const key = audio.dataset.trackKey;
  let playbackLocked = Boolean(SongSpotSoloEngine.get(playerId).played);
  let rememberedPosition = Math.max(0, Number(SongSpotSoloEngine.get(playerId).playbackPosition) || 0);
  const updatePlayedUi = () => {
    button.disabled = true;
    const label = button.querySelector("span");
    if (label) label.textContent = "Fragment już odsłuchany";
  };
  const updateFinishedUi = () => {
    updatePlayedUi();
    if (status) status.textContent = "Fragment już odsłuchany — wpisz odpowiedź.";
    if (input) input.disabled = false;
    if (submit) submit.disabled = false;
    if (hint) hint.textContent = "Możesz wpisać sam tytuł — wykonawca nie jest wymagany.";
  };
  const finish = () => {
    if (songSpotTimerKey !== key) return;
    // A timer callback can observe a few frames after the threshold. Snap
    // the media element back to the exact cumulative boundary before pausing,
    // so 0.1 s really remains 0.1 s for the next stage too.
    const position = Number(audio.currentTime);
    if (Number.isFinite(position) && position >= duration - 0.005) {
      try { audio.currentTime = duration; } catch {}
      rememberedPosition = duration;
      SongSpotSoloEngine.setPlaybackPosition(playerId, duration);
    } else {
      SongSpotSoloEngine.updatePlaybackPosition(playerId, position);
    }
    songSpotTimerKey = "";
    songSpotTimer = 0;
    try { audio.pause(); } catch {}
    SongSpotSoloEngine.markPlaybackDone(playerId);
    updateFinishedUi();
  };
  const scheduleFinish = () => {
    if (songSpotTimerKey === key) return;
    songSpotTimerKey = key;
    const progress = root.querySelector("[data-songspot-solo-progress]");
    const countdown = root.querySelector("[data-songspot-solo-countdown]");
    const tick = () => {
      if (songSpotTimerKey !== key) return;
      const live = SongSpotSoloEngine.get(playerId);
      const audioPosition = Number(audio.currentTime);
      const storedPosition = Number(live.playbackPosition) || 0;
      // HTMLMediaElement.currentTime is the source of truth. The persisted
      // value only bridges the tiny gap while a new audio element is loading.
      const position = Number.isFinite(audioPosition) ? Math.max(storedPosition, audioPosition) : storedPosition;
      rememberedPosition = Math.max(rememberedPosition, position);
      SongSpotSoloEngine.updatePlaybackPosition(playerId, rememberedPosition);
      const bounded = Math.min(duration, rememberedPosition);
      if (progress) progress.style.width = `${Math.min(100, (bounded / 15) * 100)}%`;
      if (countdown) countdown.textContent = bounded >= duration ? "0 s" : `pozostało ${formatSeconds(Math.max(0, duration - bounded))}`;
      if (bounded >= duration - 0.005) { finish(); return; }
      songSpotTimer = window.setTimeout(tick, 50);
    };
    tick();
  };
  const started = () => {
    playbackLocked = true;
    SongSpotSoloEngine.markPlaybackStarted(playerId);
    updatePlayedUi();
    if (status) status.textContent = `Słuchaj uważnie — zatrzymam po ${formatSeconds(duration)}.`;
    scheduleFinish();
  };
  audio.addEventListener("play", started);
  audio.addEventListener("ended", finish);
  audio.addEventListener("error", () => {
    if (songSpotTimerKey === key) {
      songSpotTimerKey = "";
      songSpotTimer = 0;
    }
    try { audio.pause(); } catch {}
    SongSpotSoloEngine.markPlaybackDone(playerId);
    updateFinishedUi();
    if (status) status.textContent = "Nie udało się wczytać preview — możesz wpisać tytuł albo przejść dalej.";
  });
  button.addEventListener("click", () => {
    if (playbackLocked || SongSpotSoloEngine.get(playerId).played) return;
    // play() resolves asynchronously; reserve the fragment immediately so
    // double clicks cannot queue multiple playback attempts.
    playbackLocked = true;
    SongSpotSoloEngine.markPlayed(playerId);
    updatePlayedUi();
    if (status) status.textContent = `Słuchaj uważnie — zatrzymam po ${formatSeconds(duration)}.`;
    try { audio.currentTime = 0; } catch {}
    Audio.bindTrackAudio(audio, key, { autoplay: false });
    const playing = audio.play();
    if (playing?.catch) playing.catch(() => {
      SongSpotSoloEngine.markPlaybackDone(playerId);
      updateFinishedUi();
      if (status) status.textContent = "Przeglądarka zablokowała dźwięk — możesz wpisać tytuł albo przejść dalej.";
    });
  });
  const live = SongSpotSoloEngine.get(playerId);
  const savedPlayback = Audio.getTrackPlayback(key);
  const shouldResume = Boolean(live.played && !live.playbackDone && live.playbackStartedAt && Math.max(Number(live.playbackPosition) || 0, Number(savedPlayback?.time) || 0) < duration - 0.005);
  if (!savedPlayback && Number(live.playbackPosition) > 0) {
    try { audio.currentTime = Math.min(Number(live.playbackPosition), duration); } catch {}
  }
  Audio.bindTrackAudio(audio, key, { autoplay: shouldResume });
  if (shouldResume) {
    // If the previous stage had already paused at its threshold, the audio
    // manager correctly remembers `playing: false`; the next threshold must
    // still resume the same track from that position.
    let resumed = false;
    const resume = () => {
      if (resumed || songSpotTimerKey === key) return;
      const current = SongSpotSoloEngine.get(playerId);
      if (current.status !== "playing" || current.playbackDone) return;
      resumed = true;
      const attempt = audio.play();
      if (attempt?.catch) attempt.catch(() => {});
    };
    audio.addEventListener("loadedmetadata", resume, { once: true });
    if (audio.readyState >= 1) queueMicrotask(resume);
  }
  if (live.playbackDone) updateFinishedUi();
  else if (live.played) {
    updatePlayedUi();
    if (live.playbackStartedAt) scheduleFinish();
  }
}

// Multiplayer Songspot-style game. The room owns one track and one shared
// clock; each player submits independently and earns more for recognising it
// before a longer threshold is reached.
function songSpotTrackSnapshot(track) {
  if (!track) return null;
  return {
    id: String(track.id || ""),
    title: String(track.title || ""),
    artist: String(track.artist || ""),
    album: String(track.album || ""),
    coverUrl: String(track.coverUrl || ""),
    previewUrl: String(track.previewUrl || ""),
    externalUrl: String(track.externalUrl || track.spotifyUrl || ""),
    spotifyUrl: String(track.spotifyUrl || track.externalUrl || ""),
  };
}

function pickSongSpotGroupTrack(usedIds, region) {
  const pool = trackPool(region);
  if (!pool.length) return null;
  const used = new Set(unique(usedIds));
  const fresh = pool.filter(track => !used.has(String(track.id)));
  const source = fresh.length ? fresh : pool;
  return songSpotTrackSnapshot(source[Math.floor(Math.random() * source.length)]);
}

function groupRoster(players) {
  return [...new Set(array(players).map(value => String(value || "")).filter(Boolean))].slice(0, 8);
}

function groupTimes(game, settings = {}) {
  return [...songSpotTimes];
}

function groupStageIndex(game, settings = {}) {
  const times = groupTimes(game, settings), requested = Number(game?.timeIndex);
  return Number.isFinite(requested) ? Math.max(0, Math.min(times.length - 1, Math.floor(requested))) : 0;
}

function groupCurrentSeconds(game, settings = {}) {
  const times = groupTimes(game, settings);
  return times[groupStageIndex(game, settings)] || times[0] || 0.1;
}

function groupMaxSeconds(game, settings = {}) {
  return Math.max(...groupTimes(game, settings), 0.1);
}

function pointsForStage(stageIndex, enabledTimes) {
  const times = availableSongSpotTimes(enabledTimes);
  const index = Math.max(0, Math.min(times.length - 1, Math.floor(Number(stageIndex) || 0)));
  const threshold = times[index];
  return threshold ? { threshold, points: songSpotPoints.get(threshold) || 0 } : { threshold: null, points: 0 };
}

function startSongSpotGroupRound(game, settings = {}) {
  const s = sanitizeSongSpotSettings({ ...settings, enabledTimes: game.enabledTimes || settings.enabledTimes });
  const track = pickSongSpotGroupTrack(game.usedTrackIds, s.region);
  const now = Date.now();
  game.region = s.region;
  game.enabledTimes = [...s.enabledTimes];
  game.answerTime = s.answerTime;
  game.timeIndex = 0;
  game.track = track;
  game.usedTrackIds = track ? [...new Set([...array(game.usedTrackIds), track.id])].slice(-Math.max(20, trackPool(s.region).length)) : array(game.usedTrackIds);
  game.previewStartedAt = now;
  game.answers = {};
  game.skipVotes = Object.fromEntries(array(game.players).filter(uid => String(uid).startsWith("bot:")).map(uid => [uid, true]));
  game.roundResult = null;
  game.phase = "preview";
  game.phaseEndsAt = now + groupMaxSeconds(game, s) * 1000;
  game.finished = false;
  return game;
}

export function createSongSpotGame(players, settings = {}) {
  const s = sanitizeSongSpotSettings(settings);
  const list = groupRoster(players);
  const game = {
    mode: "songspot",
    phase: "preview",
    round: 1,
    totalRounds: s.rounds,
    players: list,
    region: s.region,
    enabledTimes: [...s.enabledTimes],
    timeIndex: 0,
    answerTime: s.answerTime,
    track: null,
    usedTrackIds: [],
    previewStartedAt: 0,
    answers: {},
    skipVotes: {},
    scores: Object.fromEntries(list.map(uid => [uid, 0])),
    roundResult: null,
    roundResults: [],
    finished: false,
    rewarded: false,
    phaseEndsAt: 0,
  };
  return startSongSpotGroupRound(game, s);
}

export const SongSpotEngine = {
  reconcile(game, players, settings = {}) {
    if (!game || typeof game !== "object") return false;
    let changed = false;
    const roster = groupRoster(players);
    if (JSON.stringify(game.players || []) !== JSON.stringify(roster)) { game.players = roster; changed = true; }
    const s = sanitizeSongSpotSettings({ ...settings, region: game.region || settings.region, enabledTimes: game.enabledTimes || settings.enabledTimes, answerTime: game.answerTime || settings.answerTime, rounds: game.totalRounds || settings.rounds });
    if (game.region !== s.region) { game.region = s.region; changed = true; }
    if (JSON.stringify(normalizeSongSpotTimes(game.enabledTimes)) !== JSON.stringify(s.enabledTimes)) { game.enabledTimes = [...s.enabledTimes]; changed = true; }
    const normalizedTimeIndex = groupStageIndex(game, s);
    if (Number(game.timeIndex) !== normalizedTimeIndex) { game.timeIndex = normalizedTimeIndex; changed = true; }
    if (Number(game.answerTime) !== s.answerTime) { game.answerTime = s.answerTime; changed = true; }
    if (!Number.isFinite(Number(game.round)) || Number(game.round) < 1) { game.round = 1; changed = true; }
    if (!Number.isFinite(Number(game.totalRounds)) || Number(game.totalRounds) < 1) { game.totalRounds = s.rounds; changed = true; }
    ["answers", "scores", "skipVotes"].forEach(key => {
      if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; }
      Object.keys(game[key]).forEach(uid => { if (!roster.includes(uid)) { delete game[key][uid]; changed = true; } });
    });
    roster.forEach(uid => {
      const score = Math.max(0, Math.floor(Number(game.scores[uid]) || 0));
      if (game.scores[uid] !== score) { game.scores[uid] = score; changed = true; }
    });
    roster.filter(uid => String(uid).startsWith("bot:")).forEach(uid => {
      if (!game.skipVotes[uid]) { game.skipVotes[uid] = true; changed = true; }
    });
    if (!Array.isArray(game.usedTrackIds)) { game.usedTrackIds = []; changed = true; }
    if (!Array.isArray(game.roundResults)) { game.roundResults = []; changed = true; }
    if (!game.track && !game.finished) { startSongSpotGroupRound(game, s); changed = true; }
    if (!Number.isFinite(Number(game.previewStartedAt)) && game.phase === "preview") { game.previewStartedAt = Date.now(); changed = true; }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !game.finished) { game.phaseEndsAt = Date.now() + (game.phase === "answering" ? s.answerTime * 1000 : groupMaxSeconds(game, s) * 1000); changed = true; }
    return changed;
  },
  answer(game, uid, value, submittedAt = Date.now()) {
    if (!game || !["preview", "answering"].includes(game.phase)) return "Ta runda nie przyjmuje już odpowiedzi.";
    if (!array(game.players).includes(uid)) return "Nie jesteś uczestnikiem tej rundy.";
    game.answers = object(game.answers);
    if (uid in game.answers) return "Twoja odpowiedź jest już zapisana.";
    const answerTimestamp = Number(submittedAt) || Date.now();
    if (Number(game.phaseEndsAt) > 0 && answerTimestamp > Number(game.phaseEndsAt) + 120) return "Czas na tę odpowiedź już minął.";
    const text = String(value || "").trim();
    if (!text) return "Wpisz tytuł piosenki.";
    const timing = pointsForStage(groupStageIndex(game), game.enabledTimes);
    const correct = isCorrectGuess(text, game.track || {});
    game.answers[uid] = {
      text: text.slice(0, 140),
      correct,
      submittedAt: answerTimestamp,
      elapsedSeconds: timing.threshold,
      stageIndex: groupStageIndex(game),
      threshold: timing.threshold,
      points: correct ? timing.points : 0,
    };
    if (array(game.players).length && array(game.players).every(player => game.answers[player])) {
      if (game.phase === "preview") game.phase = "answering";
      this.resolveRound(game);
    }
    return undefined;
  },
  skip(game, uid, submittedAt = Date.now()) {
    if (!game || game.phase !== "preview") return "Pomijanie jest dostępne tylko podczas odsłuchu.";
    if (!array(game.players).includes(uid)) return "Nie jesteś uczestnikiem tej rundy.";
    const now = Number(submittedAt) || Date.now();
    game.skipVotes = object(game.skipVotes);
    if (game.skipVotes[uid]) return "Twój głos za pominięciem jest już zapisany.";
    game.skipVotes[uid] = true;
    if (array(game.players).length && array(game.players).every(player => game.skipVotes[player])) {
      const times = groupTimes(game), currentIndex = groupStageIndex(game);
      if (currentIndex < times.length - 1) {
        game.timeIndex = currentIndex + 1;
        game.skipVotes = Object.fromEntries(array(game.players).filter(player => String(player).startsWith("bot:")).map(player => [player, true]));
      } else {
        game.phase = "answering";
        game.phaseEndsAt = now + Math.max(10, Number(game.answerTime) || 20) * 1000;
      }
    }
    return undefined;
  },
  timeout(game, settings = {}) {
    if (!game || !["preview", "answering"].includes(game.phase)) return "Ta faza już się zakończyła.";
    if (game.phase === "preview") {
      game.phase = "answering";
      game.phaseEndsAt = Date.now() + Math.max(10, Number(game.answerTime || settings.answerTime) || 20) * 1000;
      return undefined;
    }
    return this.resolveRound(game);
  },
  resolveRound(game) {
    if (!game || game.phase !== "answering") return "Wynik rundy jest już gotowy.";
    const answers = object(game.answers), players = groupRoster(game.players);
    players.forEach(uid => {
      if (!(uid in answers)) answers[uid] = { text: "", correct: false, submittedAt: 0, elapsedSeconds: null, threshold: null, points: 0, missed: true };
      game.scores = object(game.scores);
      game.scores[uid] = Math.max(0, Number(game.scores[uid]) || 0) + Math.max(0, Number(answers[uid]?.points) || 0);
    });
    game.answers = answers;
    const roundResult = {
      round: Number(game.round || 1),
      track: songSpotTrackSnapshot(game.track),
      answers: JSON.parse(JSON.stringify(answers)),
    };
    game.roundResult = roundResult;
    game.roundResults = [...array(game.roundResults), roundResult].slice(-20);
    game.phase = "roundResult";
    game.phaseEndsAt = Date.now() + 6000;
    return undefined;
  },
  nextRound(game, settings = {}) {
    if (!game || game.phase !== "roundResult") return "Podsumowanie rundy nie jest jeszcze gotowe.";
    const total = Math.max(1, Number(game.totalRounds || settings.rounds) || 5);
    if (Number(game.round || 1) >= total) {
      const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
      game.winners = max > 0 ? array(game.players).filter(uid => Number(game.scores?.[uid] || 0) === max) : [];
      game.phase = "gameSummary";
      game.finished = true;
      game.phaseEndsAt = null;
      return undefined;
    }
    game.round = Number(game.round || 1) + 1;
    startSongSpotGroupRound(game, { ...settings, region: game.region, enabledTimes: game.enabledTimes, answerTime: game.answerTime, rounds: total });
    return undefined;
  },
  botAnswer(game, difficulty = "normal") {
    const track = game?.track;
    if (!track) return "";
    const shouldKnow = difficulty === "expert" ? .9 : difficulty === "hard" ? .78 : difficulty === "normal" ? .62 : .4;
    if (Math.random() > shouldKnow) return "nie wiem";
    return track.title;
  },
};

let songSpotGameTimer = 0;
let songSpotGameTimerKey = "";
let songSpotGameAudioTimer = 0;
const songSpotGroupPlayed = new Set();

function groupPlaybackWasUsed(key) {
  if (songSpotGroupPlayed.has(key)) return true;
  try { return sessionStorage.getItem("grygrupowe-songspot-played:" + key) === "1"; } catch { return false; }
}

function markGroupPlaybackUsed(key) {
  songSpotGroupPlayed.add(key);
  try { sessionStorage.setItem("grygrupowe-songspot-played:" + key, "1"); } catch {}
}

export function stopSongSpotGameTimer() {
  window.clearTimeout(songSpotGameTimer);
  window.clearTimeout(songSpotGameAudioTimer);
  songSpotGameTimer = 0;
  songSpotGameAudioTimer = 0;
  songSpotGameTimerKey = "";
}

function gameNick(accounts, uid) {
  return accounts?.[uid]?.nick || accounts?.[uid]?.displayName || (String(uid).startsWith("bot:") ? "Bot" : "Gracz");
}

function groupScoreboard(game, accounts) {
  return [...array(game.players)].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0)).map((uid, index) => `<div class="songspot-score-row"><span><i>${index + 1}</i>${escapeHtml(gameNick(accounts, uid))}</span><b>${Number(game.scores?.[uid] || 0)} pkt</b></div>`).join("");
}

function groupTimeline(game) {
  const times = groupTimes(game), max = Math.max(...times, 0.1), currentIndex = groupStageIndex(game);
  return `<div class="songspot-group-timeline" aria-label="Kolejne czasy odsłuchu"><div class="songspot-group-timeline-track"><i data-songspot-progress style="width:${Math.min(100, (times[currentIndex] / max) * 100)}%"></i>${times.map((time, index) => `<span class="${index === currentIndex ? "is-selected" : ""}" style="left:${Math.max(1, time / max * 100)}%"><b>${formatSeconds(time)}</b></span>`).join("")}</div><div class="songspot-group-timeline-labels"><span>ten sam utwór · etap ${currentIndex + 1}/${times.length}</span><strong data-songspot-countdown></strong></div></div>`;
}

function groupAnswerStatus(game, accounts, currentUser) {
  return `<div class="songspot-player-status">${array(game.players).map(uid => {
    const answer = game.answers?.[uid], own = uid === currentUser;
    return `<div class="songspot-player-chip ${answer ? (answer.correct ? "is-correct" : "is-wrong") : ""}"><span>${answer ? (answer.correct ? "✓" : "×") : "…"}</span><b>${escapeHtml(own ? "Ty" : gameNick(accounts, uid))}</b><small>${answer ? `${Number(answer.points || 0)} pkt` : "czeka"}</small></div>`;
  }).join("")}</div>`;
}

function groupTrackReveal(track) {
  return `<div class="songspot-group-track-reveal">${track?.coverUrl ? `<img src="${escapeHtml(track.coverUrl)}" alt="" loading="lazy">` : `<span>♫</span>`}<div><small>POPRAWNA ODPOWIEDŹ</small><strong>${escapeHtml(track?.title || "Nieznany utwór")}</strong><b>${escapeHtml(track?.artist || "")}</b></div></div>`;
}

function answerTimingLabel(answer) {
  return answer?.correct && Number.isFinite(Number(answer.elapsedSeconds)) ? `${Number(answer.elapsedSeconds).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} s` : "brak trafienia";
}

function groupRoundResult(game, accounts) {
  const result = game.roundResult || {}, answers = object(result.answers);
  return `<section class="songspot-group-result"><p class="eyebrow">WYNIK RUNDY ${Number(game.round || 1)}/${Number(game.totalRounds || 1)}</p><h2>${escapeHtml(result.track?.title || "Wynik rundy")}</h2>${groupTrackReveal(result.track)}<div class="songspot-round-score-list">${array(game.players).map(uid => { const answer = answers[uid] || {}; return `<div class="songspot-round-score-row"><span>${escapeHtml(gameNick(accounts, uid))}</span><span class="${answer.correct ? "is-correct" : "is-wrong"}">${answer.correct ? "✓" : "×"}</span><small>${escapeHtml(answerTimingLabel(answer))}</small><b>${Number(answer.points || 0)} pkt</b></div>`; }).join("")}</div><div class="songspot-scoreboard"><h3>Wynik meczu</h3>${groupScoreboard(game, accounts)}</div><button id="songspot-next" class="primary">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna piosenka"}</button></section>`;
}

function groupSummary(game, accounts) {
  const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  const winners = array(game.winners).length ? game.winners : array(game.players).filter(uid => Number(game.scores?.[uid] || 0) === max && max > 0);
  const rows = [...array(game.players)].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0));
  const details = array(game.roundResults).map(result => `<article class="songspot-history-row"><div class="songspot-history-track">${result.track?.coverUrl ? `<img src="${escapeHtml(result.track.coverUrl)}" alt="" loading="lazy">` : `<span>♫</span>`}<div><b>${escapeHtml(result.track?.title || "Nieznany utwór")}</b><small>${escapeHtml(result.track?.artist || "")}</small></div></div><div class="songspot-history-answers">${array(game.players).map(uid => { const answer = result.answers?.[uid] || {}, name = gameNick(accounts, uid); return `<span class="${answer.correct ? "is-correct" : "is-wrong"}" title="${escapeHtml(`${name}: ${answer.correct ? `${Number(answer.points || 0)} pkt` : "brak trafienia"}`)}"><b>${answer.correct ? "✓" : "×"}</b><em>${escapeHtml(name)}</em><strong>${Number(answer.points || 0)}</strong></span>`; }).join("")}</div></article>`).join("");
  return `<section class="songspot-group-summary"><div class="songspot-summary-trophy">🏆</div><p class="eyebrow">KONIEC GRY · ${Number(game.totalRounds || game.roundResults?.length || 0)} RUND</p><h2>${winners.length ? `Wygrywa ${winners.map(uid => escapeHtml(gameNick(accounts, uid))).join(", ")}` : "Brak zwycięzcy"}</h2><div class="songspot-final-scores">${rows.map((uid, index) => `<div class="songspot-final-score-row"><span><i>${index + 1}</i>${escapeHtml(gameNick(accounts, uid))}</span><b>${Number(game.scores?.[uid] || 0)} pkt</b></div>`).join("")}</div><div class="songspot-history"><h3>Przebieg rund</h3>${details || `<p class="muted">Brak zapisanych rund.</p>`}</div><button id="songspot-lobby" class="primary">Zagraj ponownie</button></section>`;
}

export function renderSongSpotLobbySettings(room, isHost) {
  const s = sanitizeSongSpotSettings(room?.settings);
  return `<div class="songspot-lobby-settings">${musicRegionPicker(s.region, "region", isHost, "songspot")}<label class="setting-row"><span>Liczba rund</span><select data-songspot-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 7, 10, 15, 20].map(value => `<option value="${value}" ${s.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na wpisanie odpowiedzi</span><select data-songspot-setting="answerTime" ${isHost ? "" : "disabled"}>${[10, 15, 20, 30, 45, 60].map(value => `<option value="${value}" ${s.answerTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><fieldset class="songspot-time-settings"><legend>STAŁA SEKWENCJA ODSŁUCHU I PUNKTACJI</legend><p class="tiny">Każdy utwór zawsze zaczyna się od pierwszego progu. Skip przechodzi do dłuższego fragmentu tego samego utworu i kontynuuje od bieżącej pozycji.</p><div class="songspot-time-options">${songSpotDifficulties.map(item => `<div class="songspot-time-option"><span><b>${formatSeconds(item.seconds)}</b><small>${songSpotPoints.get(item.seconds)} pkt za poprawną odpowiedź na tym etapie</small></span></div>`).join("")}</div></fieldset><p class="tiny">Skip nie zmienia piosenki — przechodzi kolejno przez wszystkie progi. Dopiero Skip po 15 s kończy odsłuch rundy.</p></div>`;
}

function bindSongSpotGameTimer(root, game, actions) {
  const endAt = Number(game.phaseEndsAt || 0);
  if (!endAt || !["preview", "answering"].includes(game.phase)) return;
  const expected = { phase: game.phase, phaseEndsAt: endAt, round: game.round };
  const key = `${game.phase}:${game.round}:${endAt}`;
  songSpotGameTimerKey = key;
  const update = () => {
    if (songSpotGameTimerKey !== key) return;
    const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    root.querySelectorAll("[data-songspot-countdown]").forEach(item => { item.textContent = `${game.phase === "preview" ? "Fragment" : "Odpowiedzi"}: ${left}s`; });
    const progress = root.querySelector("[data-songspot-progress]");
    if (progress && game.phase === "preview") progress.style.width = `${Math.min(100, Math.max(0, ((Date.now() - Number(game.previewStartedAt || Date.now())) / 1000) / groupMaxSeconds(game) * 100))}%`;
    const skip = root.querySelector("[data-songspot-group-skip]");
    if (skip && game.phase === "preview") {
      const votes = Object.keys(game.skipVotes || {}).length;
      const times = groupTimes(game), currentIndex = groupStageIndex(game);
      const nextLabel = currentIndex < times.length - 1 ? `Skip · ${formatSeconds(times[currentIndex + 1])}` : "Poddaj się";
      skip.disabled = skip.dataset.songspotSkipVoted === "1";
      skip.textContent = skip.dataset.songspotSkipVoted === "1" ? `Przejście zapisane (${votes}/${array(game.players).length})` : `${nextLabel} (${votes}/${array(game.players).length})`;
    }
    if (left <= 0) {
      songSpotGameTimer = window.setTimeout(() => { if (songSpotGameTimerKey === key) actions.songSpotGroupTimeout?.(expected); }, 55);
      return;
    }
    songSpotGameTimer = window.setTimeout(update, 250);
  };
  update();
}

function bindSongSpotGameAudio(root, game) {
  const audio = root.querySelector("[data-songspot-game-audio]"), button = root.querySelector("[data-songspot-group-play]");
  if (!audio || !button || !game.track?.previewUrl) return;
  const key = audio.dataset.trackKey;
  const stageSeconds = groupCurrentSeconds(game);
  const playbackUsed = groupPlaybackWasUsed(key);
  const setPlaybackUsedUi = () => {
    button.disabled = true;
    const label = button.querySelector("span");
    if (label) label.textContent = "Fragment już odsłuchany";
  };
  if (playbackUsed) setPlaybackUsedUi();
  const playback = Audio.getTrackPlayback(key);
  const pauseAtEnd = () => { try { audio.pause(); } catch {} };
  const scheduleStageStop = () => {
    window.clearTimeout(songSpotGameAudioTimer);
    const tick = () => {
      if (game.phase !== "preview") return;
      if (Number(audio.currentTime) >= stageSeconds - 0.005 || Date.now() >= Number(game.phaseEndsAt || 0)) { pauseAtEnd(); return; }
      songSpotGameAudioTimer = window.setTimeout(tick, 40);
    };
    tick();
  };
  const shouldResume = game.phase === "preview" && playbackUsed && Number(playback?.time || 0) < stageSeconds - 0.005;
  Audio.bindTrackAudio(audio, key, { autoplay: shouldResume && Boolean(playback?.playing) });
  audio.addEventListener("timeupdate", () => { if (game.phase !== "preview" || Number(audio.currentTime) >= stageSeconds || Date.now() >= Number(game.phaseEndsAt || 0)) pauseAtEnd(); });
  let playbackLocked = playbackUsed;
  audio.addEventListener("play", () => { playbackLocked = true; markGroupPlaybackUsed(key); setPlaybackUsedUi(); scheduleStageStop(); }, { once: true });
  button.addEventListener("click", () => {
    if (game.phase !== "preview" || playbackLocked || groupPlaybackWasUsed(key)) return;
    // Reserve this fragment before play() resolves; double clicks must not
    // queue multiple playback attempts.
    playbackLocked = true;
    markGroupPlaybackUsed(key);
    setPlaybackUsedUi();
    const result = audio.play();
    if (result?.catch) result.catch(() => { const label = button.querySelector("span"); if (label) label.textContent = "Nie udało się odtworzyć fragmentu"; });
  });
  if (shouldResume && !playback?.playing) {
    let resumed = false;
    const resume = () => {
      if (resumed || Number(audio.currentTime) >= stageSeconds - 0.005) return;
      resumed = true;
      const result = audio.play();
      if (result?.catch) result.catch(() => {});
    };
    audio.addEventListener("loadedmetadata", resume, { once: true });
    if (audio.readyState >= 1) queueMicrotask(resume);
  }
  if (game.phase !== "preview") pauseAtEnd();
  window.clearTimeout(songSpotGameAudioTimer);
}

export function renderSongSpotGame(root, { room, accounts, currentUser }, actions, { quiet = false } = {}) {
  const game = room.game, phase = game.phase, expected = { phase, phaseEndsAt: game.phaseEndsAt, round: game.round };
  const settings = sanitizeSongSpotSettings({ ...room.settings, enabledTimes: game.enabledTimes, region: game.region, answerTime: game.answerTime, rounds: game.totalRounds });
  const times = groupTimes(game, settings), currentTimeIndex = groupStageIndex(game, settings), currentSeconds = times[currentTimeIndex] || times[0] || 0.1;
  const skipVotes = Object.keys(game.skipVotes || {}).length;
  const skipVoted = Boolean(game.skipVotes?.[currentUser]);
  const nextTimeLabel = currentTimeIndex < times.length - 1 ? `Skip · ${formatSeconds(times[currentTimeIndex + 1])}` : "Poddaj się";
  let content = `<p class="eyebrow">BITWA O PIOSENKĘ · RUNDA ${Math.min(Number(game.round || 1), Number(game.totalRounds || 1))}/${Number(game.totalRounds || 1)}</p><div class="songspot-game-title-row"><div><h1>Jaki to utwór?</h1><p class="muted">Wszyscy zgadują tę samą piosenkę. Szybsza poprawna odpowiedź = więcej punktów.</p></div><div class="songspot-game-round-clock"><small>${phase === "preview" ? "ODSŁUCH" : phase === "answering" ? "ODPOWIEDZI" : "WYNIK"}</small><b data-songspot-countdown></b></div></div>`;
  if (phase === "preview" || phase === "answering") {
    const answer = game.answers?.[currentUser], audio = game.track?.previewUrl ? `<audio data-songspot-game-audio data-track-audio preload="auto" data-track-key="songspot:room:${escapeHtml(room.roomId)}:${Number(game.round)}:${escapeHtml(game.track.id)}" src="${escapeHtml(game.track.previewUrl)}"></audio>` : "";
    content += `<section class="songspot-group-round"><div class="songspot-group-mystery-cover"><span>♫</span><small>${formatSeconds(currentSeconds)}</small></div><p class="eyebrow">${phase === "preview" ? "WSPÓLNY FRAGMENT" : "FRAGMENT ZAKOŃCZONY"}</p><h2>${phase === "preview" ? "Słuchajcie i zgadujcie" : "Wpisz swoją odpowiedź"}</h2><p class="muted">${phase === "preview" ? `Aktualny próg to ${formatSeconds(currentSeconds)} łącznie od początku. Wspólny Skip dogrywa tylko brakujący fragment tego samego utworu.` : `Odsłuch się skończył — zostało jeszcze ${settings.answerTime} sekund na wpisanie odpowiedzi.`}</p>${groupTimeline(game)}<div class="songspot-group-play-row">${audio}<button class="songspot-play-button" type="button" data-songspot-group-play ${phase !== "preview" ? "disabled" : ""}>▶ <span>${phase === "preview" ? `Odtwórz ${formatSeconds(currentSeconds)}` : "Fragment zakończony"}</span></button><small>${phase === "preview" ? `Każdy gracz uruchamia u siebie fragment ${formatSeconds(currentSeconds)}.` : "Nie można już ponownie odsłuchać utworu."}</small></div>${phase === "preview" ? `<button class="ghost songspot-group-skip" type="button" data-songspot-group-skip data-songspot-skip-voted="${skipVoted ? "1" : "0"}" ${skipVoted ? "disabled" : ""}>${skipVoted ? `Przejście zapisane (${skipVotes}/${array(game.players).length})` : `${nextTimeLabel} (${skipVotes}/${array(game.players).length})`}</button><small class="songspot-skip-hint">Wymagana zgoda wszystkich graczy · kolejny etap kontynuuje ten sam utwór od bieżącej pozycji</small>` : ""}${Audio.trackVolumeControlHtml({ compact:true })}<form class="songspot-group-answer-form" data-songspot-group-answer><label for="songspot-group-answer">Tytuł piosenki</label><div><span class="songspot-answer-input-wrap"><input id="songspot-group-answer" data-songspot-answer-input maxlength="140" autocomplete="off" placeholder="Wpisz tytuł…" ${answer ? "disabled" : ""} required><span class="songspot-suggestions" data-songspot-suggestions role="listbox"></span></span><button class="primary" type="submit" ${answer ? "disabled" : ""}>${answer ? "Odpowiedź zapisana" : "Zgaduję"}</button></div><small>${answer ? `Twój wynik: ${answer.correct ? `+${Number(answer.points || 0)} pkt` : "0 pkt"}. Czekamy na resztę.` : "Liczy się tytuł utworu — wykonawca nie jest wymagany."}</small></form>${groupAnswerStatus(game, accounts, currentUser)}<p class="songspot-group-countdown" data-songspot-countdown></p></section>`;
  } else if (phase === "roundResult") content += groupRoundResult(game, accounts);
  else content += groupSummary(game, accounts);
  root.innerHTML = `<main class="page music-page songspot-group-page${quiet ? " songspot-quiet-update" : " enter"}"><section class="panel music-panel songspot-group-panel">${content}</section><button id="songspot-group-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  root.querySelector("[data-songspot-group-answer]")?.addEventListener("submit", event => { event.preventDefault(); const input = event.currentTarget.querySelector("input"); actions.songSpotGroupAnswer?.(input?.value || "", expected); });
  root.querySelector("[data-songspot-group-skip]")?.addEventListener("click", event => { event.currentTarget.disabled = true; actions.songSpotGroupSkip?.(expected); });
  root.querySelector("#songspot-next")?.addEventListener("click", actions.songSpotGroupNext);
  root.querySelector("#songspot-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#songspot-group-leave")?.addEventListener("click", () => actions.leaveRoom("music-select"));
  Audio.bindTrackVolumeControls(root);
  bindSongSpotAnswerSuggestions(root, settings.region);
  if (phase === "preview" || phase === "answering") { bindSongSpotGameAudio(root, game); bindSongSpotGameTimer(root, game, actions); }
}
