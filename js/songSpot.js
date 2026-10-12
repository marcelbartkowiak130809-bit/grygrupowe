import { musicCatalogForRegion, musicPreviewCatalog, musicRegionOptions, musicRegionPicker } from "./music.js?v=20261012-2";
import { Audio } from "./audio.js?v=20260926-1";
import { escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20260903-7";
import { songSpotEras, songSpotGenres, normalizeSongSpotFilters, songSpotRanked, filterSongSpotTracks, songSpotArtistOptions } from './songSpotFilters.js?v=20261012-2';
import { songSpotLevels, songSpotTier, songSpotRoundTier, importSongSpotPlaylist, songSpotTrackLinks } from './songSpotLibrary.js?v=20261012-1';

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
const trackPools = new Map();
const trackPool = region => {
  const key = safeRegion(region);
  if (!trackPools.has(key)) trackPools.set(key, musicCatalogForRegion(key).filter(track => track?.previewUrl && track.title && track.artist));
  return trackPools.get(key);
};
const tracksById = new Map();
for (const track of musicPreviewCatalog) if (!tracksById.has(String(track.id))) tracksById.set(String(track.id), track);
const trackById = id => {
  const wanted = String(id || "");
  return wanted ? tracksById.get(wanted) || null : null;
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
    filters: normalizeSongSpotFilters(source.filters),
    playlist: {tracks:array(source.playlist?.tracks).filter(track=>track?.id && track.previewUrl && track.title && track.artist).slice(0,200),missing:array(source.playlist?.missing).map(String).slice(0,200),total:Number(source.playlist?.total)||0},
    currentTier:String(source.currentTier || 'all'),
    rankedRun: Boolean(source.rankedRun && songSpotRanked(source.filters)),
    records: {global:Math.max(0,Number(source.records?.global)||0),polish:Math.max(0,Number(source.records?.polish)||0)},
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
    playbackPersistedPosition: Math.max(0, Number(source.playbackPersistedPosition ?? source.playbackPosition) || 0),
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
  songSpotState.playlist.tracks.forEach(track=>tracksById.set(String(track.id),track));
  songSpotOwner = owner;
  return songSpotState;
}

function chooseTrack(usedIds, region, filters, playlist=[], tier='all') {
  const sourcePool=filters?.mode==='playlist'?playlist:trackPool(region);
  const pool = filterSongSpotTracks(sourcePool, filters).filter(track=>tier==='all'||songSpotTier(track)===tier);
  if (!pool.length) return null;
  const used = new Set(usedIds);
  const fresh = pool.filter(track => !used.has(String(track.id)));
  const source = fresh.length ? fresh : pool;
  return source[Math.floor(Math.random() * source.length)] || null;
}

function startRound(state) {
  state.currentTier=songSpotRoundTier(state.filters.level,state.round);
  let track = chooseTrack(state.usedIds, state.region, state.filters,state.playlist.tracks,state.currentTier);
  if(!track && state.filters.level==='cycle') {
    for(let offset=1;offset<3 && !track;offset++) {
      state.currentTier=songSpotRoundTier('cycle',state.round+offset);
      track=chooseTrack(state.usedIds,state.region,state.filters,state.playlist.tracks,state.currentTier);
    }
  }
  if (!track) {
    state.status = "idle";
    state.lastError = "Brak utworów dla tych filtrów. Zmień wybór.";
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
  state.playbackPersistedPosition = 0;
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

const songSpotSearchIndices = new Map();
function songSpotSuggestionTracks(query, region, pool) {
  const needle = normalizeGuess(query);
  if (needle.length < 2) return [];
  const key = safeRegion(region);
  if (!songSpotSearchIndices.has(key)) songSpotSearchIndices.set(key, trackPool(key).map(track => ({ track, title:normalizeGuess(track.title), artist:normalizeGuess(track.artist) })));
  return (pool?pool.map(track=>({track,title:normalizeGuess(track.title),artist:normalizeGuess(track.artist)})):songSpotSearchIndices.get(key))
    .map(({track, title, artist}) => {
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

function bindSongSpotAnswerSuggestions(root, region, pool) {
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
    matches = songSpotSuggestionTracks(input.value, region,pool);
    suggestions.innerHTML = matches.map(songSpotSuggestionHtml).join("");
    input.setAttribute("aria-expanded", matches.length ? "true" : "false");
  };
  suggestions.addEventListener("click", event => {
    const button = event.target.closest?.("[data-songspot-suggestion]");
    if (!button || !suggestions.contains(button)) return;
    const track = matches[Number(button.dataset.songspotSuggestion)];
    if (!track) return;
    input.value = track.title;
    close();
    if (document.activeElement !== input) suppressFocusUpdate = true;
    input.focus();
  });
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
  const seconds = state.played
    ? Math.min(stageTimeFor(state), Math.max(0, Number(state.playbackPosition) || 0))
    : skipped ? stageTimeFor(state) : 0;
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
      filters: normalizeSongSpotFilters(previous.filters),
      playlist:previous.playlist,
      rankedRun: songSpotRanked(previous.filters),
      records: {...previous.records},
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
      playbackPersistedPosition: 0,
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
  setFilters(playerId, filters) {
    const state = readState(playerId), selected = normalizeSongSpotFilters(filters);
    if(selected.artists.length>0 && selected.artists.length<3) return {error:'Wybierz minimum 3 artystów.'};
    if(JSON.stringify(selected)===JSON.stringify(state.filters)) return state;
    this.stop(playerId);
    state.filters=selected;
    state.rankedRun=false;
    saveStored(state);
    return state;
  },
  setPlaylist(playerId,playlist) {
    const state=readState(playerId);
    this.stop(playerId);
    state.playlist={tracks:array(playlist.tracks).filter(track=>track.previewUrl).slice(0,200),missing:array(playlist.missing),total:Number(playlist.total)||0};
    state.playlist.tracks.forEach(track=>tracksById.set(String(track.id),track));
    state.filters=normalizeSongSpotFilters({...state.filters,mode:'playlist',level:'all'});
    state.rankedRun=false;
    saveStored(state);return state;
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
      state.playbackPersistedPosition = 0;
      state.timeIndex = 0;
      state.lastResult = null;
    }
    state.region = nextRegion;
    state.filters.artists = [];
    state.rankedRun = false;
    saveStored(state);
    return state;
  },
  markPlayed(playerId) {
    const state = readState(playerId);
    if (state.status !== "playing") return state;
    state.played = true;
    state.playbackDone = false;
    // Every click is a fresh local listen from the beginning. The round's
    // threshold and scoring stage do not change when the player replays it.
    state.playbackStartedAt = 0;
    state.playbackPosition = 0;
    state.playbackPersistedPosition = 0;
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
    if (next - (Number(state.playbackPosition) || 0) < 0.005) return state;
    state.playbackPosition = next;
    // Keep the live audio clock in memory; synchronous storage writes must
    // not run on every playback/UI tick. Completion saves the exact boundary.
    if (next - (Number(state.playbackPersistedPosition) || 0) >= 0.4) {
      state.playbackPersistedPosition = next;
      saveStored(state);
    }
    return state;
  },
  setPlaybackPosition(playerId, seconds) {
    const state = readState(playerId);
    if (state.status !== "playing" || !state.played) return state;
    const value = Number(seconds);
    if (!Number.isFinite(value)) return state;
    state.playbackPosition = Math.max(0, value);
    state.playbackPersistedPosition = state.playbackPosition;
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
    if (state.status !== "playing") return state;
    if (expected.trackId && String(expected.trackId) !== state.trackId) return state;
    if (!String(value || "").trim()) return state;
    const result = resultFor(state, value, false);
    if(!result.correct && stageIndexFor(state)<songSpotTimes.length-1)return this.skip(playerId,expected);
    state.lastResult = result;
    if (result.correct) {
      state.streak += 1;
      state.best = Math.max(state.best, state.streak);
      if(state.rankedRun && songSpotRanked(state.filters)) state.records[state.region] = Math.max(state.records[state.region] || 0,state.streak);
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
        state.playbackPersistedPosition = 0;
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
    state.playbackPersistedPosition = 0;
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
  return `${Number(seconds).toLocaleString("pl-PL", { minimumFractionDigits: seconds < 1 ? 1 : 0, maximumFractionDigits: seconds < 1 ? 2 : 1 })} s`;
}

function regionPicker(state) {
  return `<div class="songspot-region-picker" role="radiogroup" aria-label="Katalog utworów">${musicRegionOptions.map(([id, icon, label, description]) => `<button type="button" class="music-region-option ${state.region === id ? "is-selected" : ""}" data-songspot-region="${escapeHtml(id)}" aria-pressed="${state.region === id ? "true" : "false"}"><span class="music-region-option-icon">${icon}</span><span><b>${escapeHtml(label)}</b><small>${escapeHtml(description)}</small></span></button>`).join("")}</div>`;
}

function timeline(state) {
  const times = availableSongSpotTimes(state?.enabledTimes), currentIndex = stageIndexFor(state, times), max = Math.max(...times, 0.1);
  return `<div class="songspot-timeline" aria-label="Kolejne czasy odsłuchu"><div class="songspot-timeline-track"><i data-songspot-solo-progress style="width:0%"></i>${times.map((time, index) => `<span class="${index === currentIndex ? "is-selected" : ""}" style="left:${Math.max(1, (time / max) * 100)}%"><b>${formatSeconds(time)}</b></span>`).join("")}</div></div>`;
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
  const listen=correct?`<p class="songspot-result-time">Zgadnięto po <b>${formatSeconds(result.seconds || 0)}</b> odsłuchu</p>`:'';
  const playback=result.previewUrl?`<audio controls preload="auto" data-songspot-result-audio data-track-key="songspot-result:${escapeHtml(state.playerId)}:${state.round}:${escapeHtml(result.trackId)}" src="${escapeHtml(result.previewUrl)}"></audio>`:'';
  const links=songSpotTrackLinks({...result,id:result.trackId});
  const full=`<div class="songspot-listen-actions">${links.embed?`<button type="button" class="primary" data-songspot-full-track data-embed="${escapeHtml(links.embed)}">♫ Pełny utwór tutaj</button><a class="ghost" href="${escapeHtml(links.apple)}" target="_blank" rel="noopener noreferrer">♫ Apple Music ↗</a>`:''}<a class="ghost" href="${escapeHtml(links.spotify)}" target="_blank" rel="noopener noreferrer">Wyszukaj w Spotify ↗</a></div><div data-songspot-full-player></div>${links.embed?'<small class="songspot-full-note">Pełne odtwarzanie wymaga zalogowania i abonamentu Apple Music.</small>':''}`;
  return `<section class="songspot-result ${correct ? "is-correct" : "is-wrong"}"><div class="songspot-result-mark">${correct ? "✓" : "×"}</div><p class="eyebrow">${correct ? "TRAFIONO" : "KONIEC SERII"}</p><h2>Streak: ${Number(state.streak || 0)}</h2><div class="songspot-result-track">${coverHtml(result)}<div><small>POPRAWNA ODPOWIEDŹ</small><strong>${escapeHtml(result.title || "Nieznany utwór")}</strong><span>${escapeHtml(result.artist || "")}</span></div></div>${listen}${result.guess ? `<p class="songspot-result-guess">Twoja odpowiedź: <b>${escapeHtml(result.guess)}</b></p>` : `<p class="songspot-result-guess">Utwór został pominięty.</p>`}${playback}<small class="songspot-preview-note">Odsłuch utworu · do 30 s</small>${full}<div class="songspot-result-actions">${correct ? `<button class="primary big" id="songspot-next">Następny utwór</button><button class="ghost" id="songspot-stop">Przerwij serię</button>` : `<button class="primary big" id="songspot-restart">Zagraj jeszcze raz</button><button class="ghost" id="songspot-menu">Wróć do muzyki</button>`}</div></section>`;
}

function header(state) {
  const region = musicRegionOptions.find(([id]) => id === state.region) || musicRegionOptions[0];
  const description = "";
  return `<p class="eyebrow">TRYB SOLO · ${region[1]} ${escapeHtml(region[2])}</p><div class="songspot-title-row"><div><h1>Zgadnij utwór</h1>${description}</div><div class="lyrics-solo-streak"><small>STREAK</small><b>${Number(state.streak || 0)}</b></div></div>`;
}

function startHtml(state) {
  return `<section class="songspot-start"><div class="songspot-icon">🎧</div><h2>Posłuchaj i zgadnij.</h2>${stageSequence()}<div class="songspot-best"><span>🏆</span><div><small>TWÓJ REKORD</small><b>${Number(state.best || 0)} trafień</b></div></div>${state.lastError ? `<p class="songspot-error">⚠️ ${escapeHtml(state.lastError)}</p>` : ""}<button class="primary big" id="songspot-start">Zacznij serię</button></section>`;
}

function activeHtml(state, item) {
  const times = availableSongSpotTimes(state.enabledTimes), stageIndex = stageIndexFor(state, times);
  // The key identifies the actual preview, not the current threshold. That
  // lets Skip continue the same audio element while replay still starts at 0.
  const audio = item?.previewUrl ? `<audio data-songspot-audio data-track-audio preload="auto" data-track-key="songspot:${escapeHtml(state.playerId)}:${escapeHtml(state.round)}:${escapeHtml(state.trackId)}" src="${escapeHtml(item.previewUrl)}"></audio>` : "";
  const nextLabel = stageIndex < times.length - 1 ? "Skip" : "Poddaj się";
  const roundClass = `songspot-round${state.played ? " is-played" : ""}${state.playbackDone ? " is-ready" : ""}`;
  return `<section class="${roundClass}">${timeline(state)}<div class="songspot-play-area">${audio}<button class="songspot-play-button" type="button" data-songspot-play aria-label="Odtwórz fragment od początku">▶</button><small data-songspot-audio-state aria-live="polite"></small></div>${Audio.trackVolumeControlHtml({ compact: true })}<form class="songspot-answer-form" data-songspot-answer-form><div><span class="songspot-answer-input-wrap"><input id="songspot-answer" name="answer" data-songspot-answer-input maxlength="140" autocomplete="off" aria-label="Nazwa utworu" placeholder="Nazwa utworu…" required><span class="songspot-suggestions" data-songspot-suggestions role="listbox"></span></span><button class="primary" type="submit">Sprawdź</button></div></form><button class="ghost songspot-skip" type="button" data-songspot-skip>${nextLabel}</button></section>`;
}

function songSpotSoloViewKey(state) {
  const result = state?.lastResult || {};
  return [
    state?.status,
    state?.region,
    state?.round,
    state?.trackId,
    state?.timeIndex,
    state?.played ? 1 : 0,
    state?.playbackDone ? 1 : 0,
    state?.streak,
    state?.best,
    JSON.stringify(state.filters),
    result.trackId,
    result.correct ? 1 : 0,
    result.skipped ? 1 : 0,
    result.guess,
    state?.lastError,
  ].map(value => String(value ?? "")).join("|");
}

function updateSongSpotSoloStageInPlace(page, state, viewKey, playerId) {
  if (!page || state.status !== "playing" || String(page.dataset.songspotTrackId || "") !== String(state.trackId || "")) return false;
  const round = page.querySelector(".songspot-round");
  if (!round) return false;
  const times = availableSongSpotTimes(state.enabledTimes), stageIndex = stageIndexFor(state, times), duration = times[stageIndex] || times[0];
  const coverTime = round.querySelector(".songspot-mystery-cover small");
  if (coverTime) coverTime.textContent = formatSeconds(duration);
  round.classList.toggle("is-played", Boolean(state.played));
  round.classList.toggle("is-ready", Boolean(state.playbackDone));
  round.querySelectorAll(".songspot-timeline-track>span").forEach((marker, index) => marker.classList.toggle("is-selected", index === stageIndex));
  const progress = round.querySelector("[data-songspot-solo-progress]");
  if (progress) progress.style.width = `${Math.min(100, (Math.max(0, Number(state.playbackPosition) || 0) / 15) * 100)}%`;
  const submit = round.querySelector('[data-songspot-answer-form] button[type="submit"]'), input = round.querySelector("[data-songspot-answer-input]");
  if (submit) submit.disabled = false;
  if (input) input.disabled = false;
  const skip = round.querySelector("[data-songspot-skip]");
  if (skip) skip.textContent = stageIndex < times.length - 1 ? "Skip" : "Poddaj się";
  page.dataset.songspotViewKey = viewKey;
  bindSongSpotAudio(page, state, playerId);
  return true;
}

function carouselHtml(key, options, selected) {
  const label=options.find(([id])=>id===selected)?.[1] || 'All';
  return `<div class="songspot-filter-wheel"><button type="button" data-songspot-filter="${key}" data-direction="-1" aria-label="Poprzedni ${key==='era'?'okres':'gatunek'}">‹</button><b key="${escapeHtml(selected)}">${escapeHtml(label)}</b><button type="button" data-songspot-filter="${key}" data-direction="1" aria-label="Następny ${key==='era'?'okres':'gatunek'}">›</button></div>`;
}
function artistRowsHtml(state) {
  const selected=new Set(state.filters.artists);
  return songSpotArtistOptions(trackPool(state.region)).sort((a,b)=>Number(selected.has(b[0]))-Number(selected.has(a[0]))).map(([id,name,cover,count])=>`<label data-artist-name="${escapeHtml(name.toLowerCase())}"><input type="checkbox" data-songspot-artist="${escapeHtml(id)}" ${selected.has(id)?'checked':''}><small class="songspot-artist-count" title="${count} utworów">${count}</small><span class="songspot-artist-avatar">${cover?`<img src="${escapeHtml(cover)}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true">`:''}<span aria-hidden="true">♫</span></span><span class="songspot-artist-name">${escapeHtml(name)}</span></label>`).join('');
}
function levelPickerHtml(state) {
  return `<div class="songspot-level-picker" aria-label="Trudność utworów">${songSpotLevels.map(([id,label])=>`<button type="button" class="songspot-level-${id}" data-songspot-level="${id}" aria-pressed="${state.filters.level===id}" title="Orientacyjna rozpoznawalność na podstawie archiwalnych wyświetleń; nie są to aktualne odsłuchy Spotify">${label}</button>`).join('')}</div><small class="songspot-current-tier" data-songspot-current-tier></small>`;
}
function filtersHtml(state) {
  const count=state.filters.artists.length;
  return `<aside class="songspot-filters" data-region="${state.region}" data-artists="${escapeHtml(JSON.stringify(state.filters.artists))}"><h2>Twój miks</h2><div class="songspot-filter-modes" aria-label="Sposób wyboru utworów"><button type="button" data-songspot-filter-mode="mix">Gatunek i dekada</button><button type="button" data-songspot-filter-mode="artists">Artyści</button><button type="button" data-songspot-filter-mode="playlist">☷ Twoja playlista</button></div><div class="songspot-mix-options"><label>Dekada</label>${carouselHtml('era',songSpotEras,state.filters.era)}<label>Gatunek</label>${carouselHtml('genre',songSpotGenres,state.filters.genre)}</div><details open class="songspot-artist-picker"><summary>Artyści <b>${count || 'All'}</b></summary><input type="search" data-songspot-artist-search placeholder="Szukaj artysty…" aria-label="Szukaj artysty"><label class="songspot-artist-all"><input type="checkbox" data-songspot-artists-all ${count?'':'checked'}> All</label><div class="songspot-artist-list">${artistRowsHtml(state)}</div><small data-songspot-artists-hint>All lub minimum 3 artystów</small><button type="button" class="primary" data-songspot-artists-apply>Zastosuj</button></details><form class="songspot-playlist-form" data-songspot-playlist-form><label for="songspot-playlist-text">Artysta — Tytuł</label><textarea id="songspot-playlist-text" aria-label="Lista utworów" placeholder="Adele — Hello&#10;Doja Cat — Say So" maxlength="30000" rows="6"></textarea><small>Jeden utwór w wierszu · do 200 · bez łączenia kont. Brakujące odsłuchy wyszukamy w Apple Music.</small><button type="submit" class="primary">Załaduj playlistę</button><output data-songspot-playlist-status aria-live="polite"></output><details data-songspot-playlist-missing hidden></details></form><small class="songspot-ranked-note">${songSpotRanked(state.filters)?'◆ Gra rankingowa':'◇ Trening · poza rankingiem'}</small></aside>`;
}

function sortSelectedArtists(sidebar) {
  const list=sidebar.querySelector('.songspot-artist-list'), scroll=list.scrollTop, focused=document.activeElement;
  const rows=[...list.children].sort((a,b)=>Number(b.querySelector('input').checked)-Number(a.querySelector('input').checked)||a.dataset.artistName.localeCompare(b.dataset.artistName,'pl'));
  rows.forEach((row,index)=>{if(list.children[index]!==row)list.insertBefore(row,list.children[index] || null);});
  if(focused && list.contains(focused) && document.activeElement!==focused)focused.focus({preventScroll:true});
  list.scrollTop=scroll;
}

function syncSongSpotFilters(sidebar,state,actions,playerId) {
  if(!sidebar) return;
  sidebar.__songSpotActions={actions,playerId};
  const changedMode=sidebar.dataset.mode!==state.filters.mode;
  sidebar.dataset.mode=state.filters.mode;
  sidebar.querySelector('.songspot-mix-options').hidden=state.filters.mode!=='mix';
  sidebar.querySelector('.songspot-artist-picker').hidden=state.filters.mode!=='artists';
  sidebar.querySelector('.songspot-playlist-form').hidden=state.filters.mode!=='playlist';
  if(changedMode)sidebar.__playlistImport?.abort();
  if(changedMode && state.filters.mode==='artists')sidebar.querySelector('.songspot-artist-picker').open=true;
  sidebar.querySelectorAll('[data-songspot-filter-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.songspotFilterMode===state.filters.mode)));
  const changedRegion=sidebar.dataset.region!==state.region;
  if(changedRegion) {
    sidebar.querySelector('.songspot-artist-list').innerHTML=artistRowsHtml(state);
    sidebar.dataset.region=state.region;
  }
  const artistKey=JSON.stringify(state.filters.artists);
  if(changedMode || changedRegion || sidebar.dataset.artists!==artistKey) {
    const selected=new Set(state.filters.artists);
    sidebar.querySelectorAll('[data-songspot-artist]').forEach(input=>input.checked=selected.has(input.dataset.songspotArtist));
    sidebar.querySelector('[data-songspot-artists-all]').checked=!selected.size;
    sidebar.querySelector('summary b').textContent=selected.size || 'All';
    sidebar.dataset.artists=artistKey;
    sidebar.querySelector('[data-songspot-artists-hint]').textContent='All lub minimum 3 artystów';
    sortSelectedArtists(sidebar);
  }
  for(const [key,options] of [['era',songSpotEras],['genre',songSpotGenres]]) {
    const label=sidebar.querySelector(`[data-songspot-filter="${key}"]`).parentElement.querySelector('b');
    const value=options.find(([id])=>id===state.filters[key])?.[1] || 'All';
    if(label.textContent!==value) {
      label.textContent=value;
      label.getAnimations?.().forEach(animation=>animation.cancel());
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) label.animate?.([{opacity:0,transform:'translateX(8px)'},{opacity:1,transform:'translateX(0)'}],{duration:180,easing:'ease-out'});
    }
  }
  sidebar.querySelector('.songspot-ranked-note').textContent=songSpotRanked(state.filters)?'◆ Gra rankingowa':'◇ Trening · poza rankingiem';
  const search=()=>{
    const query=sidebar.querySelector('[data-songspot-artist-search]').value.toLowerCase();
    sidebar.querySelectorAll('[data-artist-name]').forEach(row=>row.hidden=!row.dataset.artistName.includes(query));
  };
  if(changedRegion) search();
  if(sidebar.__songSpotBound) return;
  sidebar.__songSpotBound=true;
  sidebar.addEventListener('submit',async event=>{
    if(!event.target.matches('[data-songspot-playlist-form]'))return;
    event.preventDefault();
    if(sidebar.__playlistImport){sidebar.__playlistImport.abort();return;}
    const controller=new AbortController();sidebar.__playlistImport=controller;
    const output=sidebar.querySelector('[data-songspot-playlist-status]'),button=event.target.querySelector('button'),missing=sidebar.querySelector('[data-songspot-playlist-missing]');
    button.textContent='Anuluj import';missing.hidden=true;
    try {
      const data=await importSongSpotPlaylist(event.target.querySelector('textarea').value,musicPreviewCatalog,{signal:controller.signal,onProgress:progress=>{if(!sidebar.isConnected){controller.abort();return;}output.textContent=`${progress.done}/${progress.total} · odsłuchy: ${progress.loaded}`;}});
      if(controller.signal.aborted || !sidebar.isConnected)return;
      if(!data.tracks.length)throw new Error('Nie udało się załadować odsłuchów. Sprawdź nazwy i połączenie z internetem.');
      output.textContent=`Załadowano ${data.tracks.length}/${data.total} utworów`;
      missing.hidden=!data.missing.length;
      missing.innerHTML=`<summary>Nie załadowano: ${data.missing.length}</summary><ul>${data.missing.map(line=>`<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
      sidebar.__songSpotActions.actions.songSpotPlaylist?.(data);
    } catch(error){output.textContent=controller.signal.aborted?'Import anulowany.':error.message;}
    finally{if(sidebar.__playlistImport===controller)sidebar.__playlistImport=null;button.textContent='Załaduj playlistę';}
  });
  sidebar.addEventListener('input',event=>{if(event.target.matches('[data-songspot-artist-search]'))search();});
  sidebar.addEventListener('change',event=>{
    const all=sidebar.querySelector('[data-songspot-artists-all]'), inputs=[...sidebar.querySelectorAll('[data-songspot-artist]')];
    if(event.target===all) {if(all.checked)inputs.forEach(input=>input.checked=false);else if(!inputs.some(input=>input.checked))all.checked=true;}
    else if(event.target.matches('[data-songspot-artist]'))all.checked=!inputs.some(input=>input.checked);
    else return;
    sidebar.querySelector('summary b').textContent=inputs.filter(input=>input.checked).length || 'All';
    sortSelectedArtists(sidebar);
  });
  sidebar.addEventListener('click',event=>{
    const {actions,playerId}=sidebar.__songSpotActions, live=SongSpotSoloEngine.get(playerId);
    const button=event.target.closest('[data-songspot-filter]');
    const mode=event.target.closest('[data-songspot-filter-mode]');
    if(mode) {
      if(mode.dataset.songspotFilterMode!==live.filters.mode)actions.songSpotFilters?.({mode:mode.dataset.songspotFilterMode,level:live.filters.level});
    } else if(button) {
      const key=button.dataset.songspotFilter, options=key==='era'?songSpotEras:songSpotGenres, index=options.findIndex(([id])=>id===live.filters[key]);
      actions.songSpotFilters?.({...live.filters,[key]:options[(index+Number(button.dataset.direction)+options.length)%options.length][0]});
    } else if(event.target.closest('[data-songspot-artists-apply]')) {
      const artists=[...sidebar.querySelectorAll('[data-songspot-artist]:checked')].map(input=>input.dataset.songspotArtist);
      if(artists.length>0 && artists.length<3) {sidebar.querySelector('[data-songspot-artists-hint]').textContent='Wybierz minimum 3 artystów.';return;}
      actions.songSpotFilters?.({...live.filters,artists});
    }
  });
}
function leaderboardHtml(state, leaderboard, playerId, online) {
  const rows=Object.entries(leaderboard || {}).map(([uid,row])=>({uid,...row,best:Number(row.records?.[state.region])||0})).filter(row=>row.best>0).sort((a,b)=>b.best-a.best||Number(a.updatedAt)-Number(b.updatedAt)||a.uid.localeCompare(b.uid));
  const own=rows.findIndex(row=>row.uid===playerId), local=Math.max(state.records[state.region]||0,own>=0?rows[own].best:0);
  return `<aside class="songspot-leaderboard"><h2>${state.region==='polish'?'🇵🇱 Polski ranking':'🌍 Globalny ranking'}</h2><small>Najdłuższa seria · wszystkie filtry All</small><ol>${rows.slice(0,10).map((row,index)=>`<li class="${row.uid===playerId?'is-me':''}"><span>${index+1}</span><b>${escapeHtml(row.nick || 'Gracz')}</b><strong>${row.best}</strong></li>`).join('')}</ol>${!rows.length?`<p class="muted">${online?'Brak wyników. Zdobądź pierwszy rekord!':'Ranking online niedostępny.'}</p>`:''}<div class="songspot-own-record"><span>Twój rekord</span><b>${local}</b>${own>=0?`<small>Miejsce #${own+1}</small>`:''}</div><small>${online?'Wyniki zalogowanych graczy':'Rekord zapisany na tym urządzeniu'}</small></aside>`;
}
function syncSongSpotLevels(page,state,actions,playerId) {
  if(!page)return;
  page.__songSpotLevelActions={actions,playerId};
  page.querySelectorAll('[data-songspot-level]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.songspotLevel===state.filters.level)));
  page.querySelector('[data-songspot-current-tier]').textContent=state.filters.level==='cycle'?`Easy → Medium → Hard · teraz: ${state.currentTier || 'easy'}`:'';
  page.querySelector('.songspot-center>.songspot-region-picker').hidden=state.filters.mode==='playlist';
  if(page.__songSpotLevelBound)return;
  page.__songSpotLevelBound=true;
  page.addEventListener('click',event=>{
    const button=event.target.closest('[data-songspot-level]');if(!button)return;
    const {actions,playerId}=page.__songSpotLevelActions,live=SongSpotSoloEngine.get(playerId);
    actions.songSpotFilters?.({...live.filters,level:button.dataset.songspotLevel});
  });
}
export function songSpotMobileSummary(raw) {
  const filters = normalizeSongSpotFilters(raw);
  const ranked = songSpotRanked(filters) ? 'Ranking' : 'Trening';
  if (filters.mode === 'playlist') return `Twoja playlista · ${ranked}`;
  if (filters.mode === 'artists' && filters.artists.length) return `${filters.artists.length} artystów · ${ranked}`;
  const era = songSpotEras.find(([id]) => id === filters.era)?.[1] || 'All';
  const genre = songSpotGenres.find(([id]) => id === filters.genre)?.[1] || 'All';
  const level = songSpotLevels.find(([id]) => id === filters.level)?.[1] || 'All';
  const labels = [era, genre, level].filter(label => label !== 'All');
  return `${labels.length ? labels.join(' · ') : 'All'} · ${ranked}`;
}
function mobilePanelHtml(id, title, content) {
  return `<div class="songspot-mobile-panel"><button class="songspot-mobile-toggle" type="button" data-songspot-mobile-toggle="${id}" aria-expanded="false" aria-controls="songspot-mobile-${id}"><span><b>${title}</b><small data-songspot-mobile-note="${id}"></small></span><i aria-hidden="true">⌄</i></button><div class="songspot-mobile-panel-body" id="songspot-mobile-${id}">${content}</div></div>`;
}
function syncSongSpotMobilePanels(page, state) {
  if (!page) return;
  page.querySelector('[data-songspot-mobile-note="mix"]').textContent = songSpotMobileSummary(state.filters);
  page.querySelector('[data-songspot-mobile-note="ranking"]').textContent = `${state.region === 'polish' ? 'Polski' : 'Globalny'} · rekord ${state.records[state.region] || 0}`;
  if (page.__mobilePanelsBound) return;
  page.__mobilePanelsBound = true;
  page.addEventListener('click', event => {
    const button = event.target.closest('[data-songspot-mobile-toggle]');
    if (!button || !page.contains(button)) return;
    const open = button.closest('.songspot-mobile-panel').classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
}
export function renderSongSpotSolo(root, { playerId, leaderboard = {}, online = false }, actions, { quiet = false } = {}) {
  const state = SongSpotSoloEngine.get(playerId);
  const item = trackById(state.trackId);
  const viewKey = songSpotSoloViewKey(state);
  const currentPage = root.querySelector(".songspot-page");
  syncSongSpotMobilePanels(currentPage, state);
  syncSongSpotLevels(currentPage,state,actions,playerId);
  syncSongSpotFilters(currentPage?.querySelector('.songspot-filters'),state,actions,playerId);
  const board=currentPage?.querySelector('.songspot-leaderboard');
  if(board) { const markup=leaderboardHtml(state,leaderboard,playerId,online); if(board.outerHTML!==markup) board.innerHTML=markup.replace(/^<aside[^>]*>|<\/aside>$/g,''); }
  if (currentPage?.dataset.songspotViewKey === viewKey) return;
  if (quiet && updateSongSpotSoloStageInPlace(currentPage, state, viewKey, playerId)) return;

  stopSongSpotTimer();
  const previousAudio = root.querySelector("[data-songspot-audio]");
  const previousAudioKey = previousAudio?.dataset?.trackKey || "";
  const expected = { trackId: state.trackId };
  let body;
  if (state.status === "idle" && state.lastError) body = `<section class="songspot-empty"><span aria-hidden="true">♫</span><h2>Brak utworów</h2><p>${escapeHtml(state.lastError)}</p></section>`;
  else if (state.status === "idle") body = startHtml(state);
  else if (state.status === "playing" && item) body = activeHtml(state, item);
  else if (state.status === "playing") body = `<section class="songspot-round"><p class="songspot-error">Nie udało się przygotować tego preview.</p><button class="primary" id="songspot-missing-skip">Skip</button></section>`;
  else body = resultHtml(state);
  const bodyChanged=!currentPage || currentPage.__songSpotBodyMarkup!==body;
  if(currentPage) {
    // Retain the shell, filter nodes, their focus, search, scroll and disclosures.
    // Only a genuinely new round/result replaces the game body.
    const center=currentPage.querySelector('.songspot-center');
    if(bodyChanged)center.querySelector('.songspot-solo-body').innerHTML=body;
    const region=musicRegionOptions.find(([id])=>id===state.region);
    center.querySelector('.eyebrow').textContent=state.filters.mode==='playlist'?'TRYB SOLO · ☷ Twoja playlista':`TRYB SOLO · ${region[1]} ${region[2]}`;
    center.querySelector('.lyrics-solo-streak b').textContent=state.streak;
    center.querySelectorAll('[data-songspot-region]').forEach(button=>{
      const selected=button.dataset.songspotRegion===state.region;
      button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));
    });
    currentPage.dataset.songspotViewKey=viewKey;
    currentPage.dataset.songspotTrackId=state.trackId || '';
  } else {
    root.innerHTML = `<main class="page music-page songspot-page${quiet ? " songspot-quiet-update" : " enter"}" data-songspot-view-key="${escapeHtml(viewKey)}" data-songspot-track-id="${escapeHtml(state.trackId || "")}"><section class="panel music-panel songspot-panel"><div class="songspot-layout"><div class="songspot-center">${header(state)}${regionPicker(state)}${levelPickerHtml(state)}<div class="songspot-solo-body">${body}</div></div>${mobilePanelHtml("mix","Twój miks",filtersHtml(state))}${mobilePanelHtml("ranking","Ranking",leaderboardHtml(state,leaderboard,playerId,online))}</div></section><button id="songspot-home" class="ghost">Wróć do muzyki</button></main>`;
    syncSongSpotFilters(root.querySelector('.songspot-filters'),state,actions,playerId);
    syncSongSpotLevels(root.querySelector('.songspot-page'),state,actions,playerId);
    syncSongSpotMobilePanels(root.querySelector('.songspot-page'),state);
    if(state.filters.mode==='playlist')root.querySelector('.songspot-center>.eyebrow').textContent='TRYB SOLO · ☷ Twoja playlista';
    root.querySelectorAll('[data-songspot-region]').forEach(button=>button.addEventListener('click',()=>actions.songSpotRegion?.(button.dataset.songspotRegion)));
    root.querySelector('#songspot-home')?.addEventListener('click',actions.goMusicModes || actions.goPlatform);
  }
  root.querySelector('.songspot-page').__songSpotBodyMarkup=body;
  // A threshold change is not a new playback session. Reattach the existing
  // media element so a user gesture can continue it without autoplay.
  const nextAudio = root.querySelector("[data-songspot-audio]");
  if (previousAudio && nextAudio && previousAudioKey && previousAudioKey === nextAudio.dataset.trackKey) nextAudio.replaceWith(previousAudio);
  if(bodyChanged) {
  root.querySelector('[data-songspot-full-track]')?.addEventListener('click',event=>{
    const button=event.currentTarget,container=root.querySelector('[data-songspot-full-player]');
    if(container.querySelector('iframe'))return;
    Audio.stopAllTrackAudio({clearPlayback:true});
    const preview=root.querySelector('[data-songspot-result-audio]');if(preview)preview.hidden=true;
    const frame=document.createElement('iframe');frame.src=button.dataset.embed;frame.title='Pełny utwór w Apple Music';frame.allow='autoplay; encrypted-media';frame.referrerPolicy='strict-origin-when-cross-origin';container.append(frame);
  });
  root.querySelector("#songspot-start")?.addEventListener("click", () => actions.songSpotStart(SongSpotSoloEngine.get(playerId).region));
  root.querySelector("#songspot-restart")?.addEventListener("click", () => actions.songSpotStart(SongSpotSoloEngine.get(playerId).region));
  root.querySelector("#songspot-next")?.addEventListener("click", actions.songSpotNext);
  root.querySelector("#songspot-stop")?.addEventListener("click", actions.songSpotStop);
  root.querySelector("#songspot-menu")?.addEventListener("click", actions.goMusicModes || actions.goPlatform);
  root.querySelector("#songspot-missing-skip")?.addEventListener("click", () => actions.songSpotSkip(expected));
  root.querySelector("[data-songspot-answer-form]")?.addEventListener("submit", event => { event.preventDefault(); const input = event.currentTarget.querySelector("input"); actions.songSpotGuess(input?.value || "", expected); });
  root.querySelector("[data-songspot-skip]")?.addEventListener("click", () => actions.songSpotSkip(expected));
  Audio.bindTrackVolumeControls(root);
  bindSongSpotAnswerSuggestions(root, state.region,state.filters.mode==='playlist'?state.playlist.tracks:undefined);
  const resultAudio=root.querySelector('[data-songspot-result-audio]');
  if(resultAudio){Audio.bindTrackAudio(resultAudio,resultAudio.dataset.trackKey,{autoplay:false});const playing=resultAudio.play();if(playing?.catch)playing.catch(()=>{});}
  }
  if (state.status === "playing" && item) bindSongSpotAudio(root, state, playerId, actions);
}

export function bindSongSpotPlaybackButton(audio, button) {
  const update = () => {
    const playing = !audio.paused && !audio.ended && !audio.error;
    button.classList.toggle("is-playing", playing);
    button.innerHTML = playing ? '<span class="songspot-pause-icon" aria-hidden="true"></span>' : '▶';
    button.setAttribute("aria-label", playing ? "Wstrzymaj fragment" : "Odtwórz fragment");
    button.setAttribute("aria-pressed", String(playing));
  };
  for (const event of ["play", "playing", "pause", "ended", "error", "emptied"]) audio.addEventListener(event, update);
  update();
}

function bindSongSpotAudio(root, state, playerId) {
  const audio = root.querySelector("[data-songspot-audio]"), button = root.querySelector("[data-songspot-play]"), status = root.querySelector("[data-songspot-audio-state]"), input = root.querySelector("[data-songspot-answer-form] input"), submit = root.querySelector('[data-songspot-answer-form] button[type="submit"]'), hint = root.querySelector("[data-songspot-answer-form] small");
  if (!audio || !button) return;
  const key = audio.dataset.trackKey;
  const isNewBinding = !audio.__songSpotBinding;
  const binding = audio.__songSpotBinding || { key, playerId, playbackLocked:false, rememberedPosition:0, eventsBound:false };
  binding.key = key;
  binding.playerId = playerId;
  binding.root = root;
  binding.state = state;
  binding.duration = stageTimeFor(state);
  binding.button = button;
  binding.status = status;
  binding.input = input;
  binding.submit = submit;
  binding.hint = hint;
  binding.playbackLocked = binding.playbackLocked || Boolean(state.played);
  binding.rememberedPosition = Math.max(binding.rememberedPosition, Number(state.playbackPosition) || 0);
  audio.__songSpotBinding = binding;
  const updatePlayedUi = () => {
    binding.button.disabled = false;
    if (binding.input) binding.input.disabled = false;
    if (binding.submit) binding.submit.disabled = false;
  };
  const updateFinishedUi = () => {
    updatePlayedUi();
    if (binding.status) binding.status.textContent = "";
    if (binding.input) binding.input.disabled = false;
    if (binding.submit) binding.submit.disabled = false;
    if (binding.hint) binding.hint.textContent = "Możesz wpisać sam tytuł — wykonawca nie jest wymagany.";
  };
  const finish = () => {
    if (songSpotTimerKey !== binding.key) return;
    const live = SongSpotSoloEngine.get(binding.playerId);
    if (live.status !== "playing" || String(live.trackId) !== String(binding.state.trackId)) return;
    const duration = binding.duration;
    // A timer callback can observe a few frames after the threshold. Snap
    // the media element back to the exact cumulative boundary before pausing,
    // so 0.1 s really remains 0.1 s for the next stage too.
    const position = Number(audio.currentTime);
    if (Number.isFinite(position) && position >= duration - 0.005) {
      try { audio.currentTime = duration; } catch {}
      binding.rememberedPosition = duration;
      SongSpotSoloEngine.setPlaybackPosition(binding.playerId, duration);
    } else {
      SongSpotSoloEngine.updatePlaybackPosition(binding.playerId, position);
    }
    songSpotTimerKey = "";
    songSpotTimer = 0;
    try { audio.pause(); } catch {}
    SongSpotSoloEngine.markPlaybackDone(binding.playerId);
    updateFinishedUi();
  };
  const scheduleFinish = () => {
    if (songSpotTimerKey === binding.key) return;
    songSpotTimerKey = binding.key;
    const tick = () => {
      if (songSpotTimerKey !== binding.key) return;
      const live = SongSpotSoloEngine.get(binding.playerId);
      if (live.status !== "playing" || String(live.trackId) !== String(binding.state.trackId)) return;
      const duration = binding.duration;
      const progress = binding.root.querySelector("[data-songspot-solo-progress]");
      const audioPosition = Number(audio.currentTime);
      const storedPosition = Number(live.playbackPosition) || 0;
      // HTMLMediaElement.currentTime is the source of truth. The persisted
      // value only bridges the tiny gap while a new audio element is loading.
      const position = Number.isFinite(audioPosition) ? Math.max(storedPosition, audioPosition) : storedPosition;
      binding.rememberedPosition = Math.max(binding.rememberedPosition, position);
      SongSpotSoloEngine.updatePlaybackPosition(binding.playerId, binding.rememberedPosition);
      const bounded = Math.min(duration, binding.rememberedPosition);
      if (progress) progress.style.width = `${Math.min(100, (bounded / 15) * 100)}%`;
      if (bounded >= duration - 0.005) { finish(); return; }
      songSpotTimer = window.setTimeout(tick, Math.min(50, Math.max(8, (duration - bounded) * 1000)));
    };
    tick();
  };
  const started = () => {
    binding.playbackLocked = true;
    SongSpotSoloEngine.markPlaybackStarted(binding.playerId);
    updatePlayedUi();
    if (binding.status) binding.status.textContent = "";
    scheduleFinish();
  };
  if (!binding.eventsBound) {
    bindSongSpotPlaybackButton(audio, button);
    audio.addEventListener("play", started);
    audio.addEventListener("pause", () => { if (audio.paused && songSpotTimerKey === binding.key) stopSongSpotTimer(); });
    audio.addEventListener("timeupdate", () => {
      if (songSpotTimerKey === binding.key && Number(audio.currentTime) >= binding.duration - 0.005) finish();
    });
    audio.addEventListener("ended", finish);
    audio.addEventListener("error", () => {
      if (songSpotTimerKey === binding.key) {
        songSpotTimerKey = "";
        songSpotTimer = 0;
      }
      try { audio.pause(); } catch {}
      SongSpotSoloEngine.markPlaybackDone(binding.playerId);
      updateFinishedUi();
      if (binding.status) binding.status.textContent = "Nie udało się odtworzyć fragmentu.";
    });
    binding.eventsBound = true;
  }
  if (button.__songSpotClickBound !== binding) {
    button.__songSpotClickBound = binding;
    button.addEventListener("click", () => {
      const live = SongSpotSoloEngine.get(binding.playerId);
      if (live.status !== "playing") return;
      if (!audio.paused) { audio.pause(); return; }
      if (live.played && !live.playbackDone && Number(audio.currentTime) < binding.duration - 0.005) {
        const playing = audio.play();
        if (playing?.catch) playing.catch(() => { if (binding.status) binding.status.textContent = "Nie udało się wznowić fragmentu."; });
        return;
      }
      // Replay is always allowed and always starts at the beginning. Clear
      // the previous timer/position before asking the browser to play again.
      stopSongSpotTimer();
      try { audio.pause(); } catch {}
      try { audio.currentTime = 0; } catch {}
      binding.playbackLocked = true;
      SongSpotSoloEngine.markPlayed(binding.playerId);
      binding.rememberedPosition = 0;
      updatePlayedUi();
      if (binding.status) binding.status.textContent = "";
      Audio.bindTrackAudio(audio, binding.key, { autoplay: false });
      try { audio.currentTime = 0; } catch {}
      const playing = audio.play();
      if (playing?.catch) playing.catch(() => {
        SongSpotSoloEngine.markPlaybackDone(binding.playerId);
        updateFinishedUi();
        if (binding.status) binding.status.textContent = "Dźwięk zablokowany — kliknij ▶, aby spróbować ponownie.";
      });
    });
  }
  const live = SongSpotSoloEngine.get(binding.playerId);
  const savedPlayback = Audio.getTrackPlayback(binding.key);
  const shouldResume = Boolean(live.played && !live.playbackDone && live.playbackStartedAt && Math.max(Number(live.playbackPosition) || 0, Number(savedPlayback?.time) || 0) < binding.duration - 0.005);
  if (!savedPlayback && Number(live.playbackPosition) > 0) {
    try { audio.currentTime = Math.min(Number(live.playbackPosition), binding.duration); } catch {}
  }
  Audio.bindTrackAudio(audio, binding.key, { autoplay: isNewBinding && shouldResume });
  if (isNewBinding && shouldResume) {
    // A reload can restore a run which was already playing. Do this only for
    // the first binding; stage changes reuse the same audio element and the
    // skip action is responsible for continuing it.
    let resumed = false;
    const resume = () => {
      if (resumed || songSpotTimerKey === binding.key) return;
      const current = SongSpotSoloEngine.get(binding.playerId);
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
  return `<div class="songspot-group-timeline" aria-label="Kolejne czasy odsłuchu"><div class="songspot-group-timeline-track"><i data-songspot-progress style="width:0%"></i>${times.map((time, index) => `<span class="${index === currentIndex ? "is-selected" : ""}" style="left:${Math.max(1, time / max * 100)}%"><b>${formatSeconds(time)}</b></span>`).join("")}</div></div>`;
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
  return `<section class="songspot-group-result"><p class="eyebrow">WYNIK RUNDY ${Number(game.round || 1)}/${Number(game.totalRounds || 1)}</p><h2>${escapeHtml(result.track?.title || "Wynik rundy")}</h2>${groupTrackReveal(result.track)}<div class="songspot-round-score-list">${array(game.players).map(uid => { const answer = answers[uid] || {}; return `<div class="songspot-round-score-row"><div class="songspot-round-score-player">${resultPlayerMiniHtml(accounts[uid], answer.correct ? "win" : "lose")}</div><span class="${answer.correct ? "is-correct" : "is-wrong"}">${answer.correct ? "✓" : "×"}</span><small>${escapeHtml(answerTimingLabel(answer))}</small><b>${Number(answer.points || 0)} pkt</b></div>`; }).join("")}</div><div class="songspot-scoreboard"><h3>Wynik meczu</h3>${groupScoreboard(game, accounts)}</div><button id="songspot-next" class="primary">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna piosenka"}</button></section>`;
}

function groupSummary(game, accounts) {
  const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  const winners = array(game.winners).length ? game.winners : array(game.players).filter(uid => Number(game.scores?.[uid] || 0) === max && max > 0);
  const rows = [...array(game.players)].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0));
  const details = array(game.roundResults).map(result => `<article class="songspot-history-row"><div class="songspot-history-track">${result.track?.coverUrl ? `<img src="${escapeHtml(result.track.coverUrl)}" alt="" loading="lazy">` : `<span>♫</span>`}<div><b>${escapeHtml(result.track?.title || "Nieznany utwór")}</b><small>${escapeHtml(result.track?.artist || "")}</small></div></div><div class="songspot-history-answers">${array(game.players).map(uid => { const answer = result.answers?.[uid] || {}, name = gameNick(accounts, uid); return `<span class="${answer.correct ? "is-correct" : "is-wrong"}" title="${escapeHtml(`${name}: ${answer.correct ? `${Number(answer.points || 0)} pkt` : "brak trafienia"}`)}"><b>${answer.correct ? "✓" : "×"}</b><em>${escapeHtml(name)}</em><strong>${Number(answer.points || 0)}</strong></span>`; }).join("")}</div></article>`).join("");
  return `<section class="songspot-group-summary"><div class="songspot-summary-trophy">🏆</div><p class="eyebrow">KONIEC GRY · ${Number(game.totalRounds || game.roundResults?.length || 0)} RUND</p><h2>${winners.length ? `Wygrywa ${winners.map(uid => escapeHtml(gameNick(accounts, uid))).join(", ")}` : "Brak zwycięzcy"}</h2><div class="songspot-final-scores">${rows.map((uid, index) => `<div class="songspot-final-score-row"><div class="songspot-final-score-player"><i>${index + 1}</i>${resultPlayerMiniHtml(accounts[uid], winners.includes(uid) ? "win" : "lose")}</div><b>${Number(game.scores?.[uid] || 0)} pkt</b></div>`).join("")}</div><div class="songspot-history"><h3>Przebieg rund</h3>${details || `<p class="muted">Brak zapisanych rund.</p>`}</div><button id="songspot-lobby" class="primary">Zagraj ponownie</button></section>`;
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
    root.querySelectorAll("[data-songspot-countdown]").forEach(item => { item.textContent = `${left}s`; });
    const skip = root.querySelector("[data-songspot-group-skip]");
    if (skip && game.phase === "preview") {
      const votes = Object.keys(game.skipVotes || {}).length;
      const times = groupTimes(game), currentIndex = groupStageIndex(game);
      const nextLabel = currentIndex < times.length - 1 ? `Skip · ${formatSeconds(times[currentIndex + 1])}` : "Poddaj się";
      skip.disabled = skip.dataset.songspotSkipVoted === "1";
      skip.textContent = skip.dataset.songspotSkipVoted === "1" ? `✓ ${votes}/${array(game.players).length}` : `${nextLabel} (${votes}/${array(game.players).length})`;
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
  bindSongSpotPlaybackButton(audio, button);
  const setPlaybackUi = () => {
    button.disabled = false;
  };
  const playback = Audio.getTrackPlayback(key);
  const pauseAtEnd = () => { try { audio.pause(); } catch {} };
  const scheduleStageStop = () => {
    window.clearTimeout(songSpotGameAudioTimer);
    const tick = () => {
      if (!["preview", "answering"].includes(game.phase)) return;
      const progress = root.querySelector("[data-songspot-progress]");
      if (progress) progress.style.width = `${Math.min(100, (Math.min(stageSeconds, Number(audio.currentTime) || 0) / groupMaxSeconds(game)) * 100)}%`;
      if (Number(audio.currentTime) >= stageSeconds - 0.005 || Date.now() >= Number(game.phaseEndsAt || 0)) { pauseAtEnd(); return; }
      songSpotGameAudioTimer = window.setTimeout(tick, 40);
    };
    tick();
  };
  const shouldResume = ["preview", "answering"].includes(game.phase) && Boolean(playback?.playing) && Number(playback?.time || 0) < stageSeconds - 0.005;
  Audio.bindTrackAudio(audio, key, { autoplay: shouldResume });
  audio.addEventListener("timeupdate", () => { if (!["preview", "answering"].includes(game.phase) || Number(audio.currentTime) >= stageSeconds || Date.now() >= Number(game.phaseEndsAt || 0)) pauseAtEnd(); });
  audio.addEventListener("play", () => { setPlaybackUi(); scheduleStageStop(); });
  audio.addEventListener("pause", () => { if (audio.paused) window.clearTimeout(songSpotGameAudioTimer); });
  button.addEventListener("click", () => {
    if (!["preview", "answering"].includes(game.phase)) return;
    if (!audio.paused) { audio.pause(); return; }
    if (Number(audio.currentTime) > 0 && Number(audio.currentTime) < stageSeconds - 0.005) {
      const playing = audio.play();
      if (playing?.catch) playing.catch(() => { const status = root.querySelector('[data-songspot-group-audio-state]'); if (status) status.textContent = "Nie udało się wznowić fragmentu."; });
      return;
    }
    window.clearTimeout(songSpotGameAudioTimer);
    try { audio.pause(); } catch {}
    try { audio.currentTime = 0; } catch {}
    Audio.bindTrackAudio(audio, key, { autoplay: false });
    try { audio.currentTime = 0; } catch {}
    setPlaybackUi();
    const result = audio.play();
    if (result?.catch) result.catch(() => { const status = root.querySelector('[data-songspot-group-audio-state]'); if (status) status.textContent = "Nie udało się odtworzyć fragmentu."; });
  });
  if (!["preview", "answering"].includes(game.phase)) pauseAtEnd();
  window.clearTimeout(songSpotGameAudioTimer);
}

function songSpotGameViewKey(game, currentUser) {
  return JSON.stringify({
    currentUser,
    phase: game?.phase,
    phaseEndsAt: game?.phaseEndsAt,
    round: game?.round,
    totalRounds: game?.totalRounds,
    timeIndex: game?.timeIndex,
    trackId: game?.track?.id,
    players: game?.players,
    answers: game?.answers,
    skipVotes: game?.skipVotes,
    scores: game?.scores,
    roundResult: game?.roundResult,
    roundResults: game?.roundResults,
    winners: game?.winners,
    finished: game?.finished,
  });
}

export function renderSongSpotGame(root, { room, accounts, currentUser }, actions, { quiet = false } = {}) {
  const game = room.game, phase = game.phase, expected = { phase, phaseEndsAt: game.phaseEndsAt, round: game.round };
  const viewKey = songSpotGameViewKey(game, currentUser);
  const currentPage = root.querySelector(".songspot-group-page");
  if (currentPage?.dataset.songspotViewKey === viewKey) return;
  const sceneKey = JSON.stringify([currentUser, phase, game.phaseEndsAt, game.round, game.totalRounds, game.timeIndex, game.track?.id]);
  if (quiet && ["preview", "answering"].includes(phase) && currentPage?.dataset.songspotSceneKey === sceneKey) {
    // Votes/other players' answers do not create a new audio session or erase
    // the local draft. Update only the changing multiplayer indicators.
    const status = currentPage.querySelector(".songspot-player-status");
    if (status) status.outerHTML = groupAnswerStatus(game, accounts, currentUser);
    const ownAnswer = game.answers?.[currentUser], form = currentPage.querySelector("[data-songspot-group-answer]");
    if (form) {
      const input = form.querySelector("input"), submit = form.querySelector('button[type="submit"]'), hint = form.querySelector("small");
      if (input) input.disabled = Boolean(ownAnswer);
      if (submit && !form.dataset.submitting) { submit.disabled = Boolean(ownAnswer); submit.textContent = ownAnswer ? "Zapisano" : "Sprawdź"; }
      if (hint && ownAnswer) hint.textContent = ownAnswer.correct ? `+${Number(ownAnswer.points || 0)} pkt` : "0 pkt";
    }
    const skip = currentPage.querySelector("[data-songspot-group-skip]");
    if (skip) skip.dataset.songspotSkipVoted = game.skipVotes?.[currentUser] ? "1" : "0";
    currentPage.dataset.songspotViewKey = viewKey;
    window.clearTimeout(songSpotGameTimer);
    bindSongSpotGameTimer(root, game, actions);
    return;
  }
  const previousInput = currentPage?.querySelector("[data-songspot-answer-input]");
  const previousTrackKey = currentPage?.querySelector("[data-songspot-game-audio]")?.dataset.trackKey;
  const draft = previousInput && !previousInput.disabled ? { value: previousInput.value, focused: document.activeElement === previousInput, start: previousInput.selectionStart, end: previousInput.selectionEnd } : null;
  Audio.prepareTrackRerender();
  stopSongSpotGameTimer();
  const settings = sanitizeSongSpotSettings({ ...room.settings, enabledTimes: game.enabledTimes, region: game.region, answerTime: game.answerTime, rounds: game.totalRounds });
  const times = groupTimes(game, settings), currentTimeIndex = groupStageIndex(game, settings), currentSeconds = times[currentTimeIndex] || times[0] || 0.1;
  const skipVotes = Object.keys(game.skipVotes || {}).length;
  const skipVoted = Boolean(game.skipVotes?.[currentUser]);
  const nextTimeLabel = currentTimeIndex < times.length - 1 ? `Skip · ${formatSeconds(times[currentTimeIndex + 1])}` : "Poddaj się";
  let content = `<p class="eyebrow">RUNDA ${Math.min(Number(game.round || 1), Number(game.totalRounds || 1))}/${Number(game.totalRounds || 1)}</p><div class="songspot-game-title-row"><div><h1>Zgadnij utwór</h1></div><div class="songspot-game-round-clock"><small>CZAS</small><b data-songspot-countdown></b></div></div>`;
  if (phase === "preview" || phase === "answering") {
    const answer = game.answers?.[currentUser], audio = game.track?.previewUrl ? `<audio data-songspot-game-audio data-track-audio preload="auto" data-track-key="songspot:room:${escapeHtml(room.roomId)}:${Number(game.round)}:${escapeHtml(game.track.id)}" src="${escapeHtml(game.track.previewUrl)}"></audio>` : "";
    content += `<section class="songspot-group-round">${groupTimeline(game)}<div class="songspot-group-play-row">${audio}<button class="songspot-play-button" type="button" data-songspot-group-play aria-label="Odtwórz fragment od początku">▶</button><small data-songspot-group-audio-state aria-live="polite"></small></div>${phase === "preview" ? `<button class="ghost songspot-group-skip" type="button" data-songspot-group-skip data-songspot-skip-voted="${skipVoted ? "1" : "0"}" title="Wspólny Skip wymaga zgody wszystkich graczy" ${skipVoted ? "disabled" : ""}>${skipVoted ? `✓ ${skipVotes}/${array(game.players).length}` : `${nextTimeLabel} (${skipVotes}/${array(game.players).length})`}</button>` : ""}${Audio.trackVolumeControlHtml({ compact:true })}<form class="songspot-group-answer-form" data-songspot-group-answer><div><span class="songspot-answer-input-wrap"><input id="songspot-group-answer" data-songspot-answer-input maxlength="140" autocomplete="off" aria-label="Nazwa utworu" placeholder="Nazwa utworu…" ${answer ? "disabled" : ""} required><span class="songspot-suggestions" data-songspot-suggestions role="listbox"></span></span><button class="primary" type="submit" ${answer ? "disabled" : ""}>${answer ? "Zapisano" : "Sprawdź"}</button></div><small>${answer ? `${answer.correct ? "+" : ""}${Number(answer.points || 0)} pkt` : ""}</small></form>${groupAnswerStatus(game, accounts, currentUser)}</section>`;
  } else if (phase === "roundResult") content += groupRoundResult(game, accounts);
  else content += groupSummary(game, accounts);
  root.innerHTML = `<main class="page music-page songspot-group-page${quiet ? " songspot-quiet-update" : " enter"}" data-songspot-view-key="${escapeHtml(viewKey)}"><section class="panel music-panel songspot-group-panel">${content}</section><button id="songspot-group-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  root.querySelector(".songspot-group-page").dataset.songspotSceneKey = sceneKey;
  root.querySelector("[data-songspot-group-answer]")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, input = form.querySelector("input"), submit = form.querySelector('button[type="submit"]');
    if (!input?.value.trim() || form.dataset.submitting) return;
    form.dataset.submitting = "1";
    if (submit) { submit.disabled = true; submit.textContent = "…"; }
    root.querySelector("[data-songspot-game-audio]")?.pause();
    try { await actions.songSpotGroupAnswer?.(input.value, expected); }
    finally { delete form.dataset.submitting; if (submit?.isConnected) { submit.disabled = Boolean(input.disabled); submit.textContent = input.disabled ? "Zapisano" : "Sprawdź"; } }
  });
  root.querySelector("[data-songspot-group-skip]")?.addEventListener("click", event => { event.currentTarget.disabled = true; actions.songSpotGroupSkip?.(expected); });
  root.querySelector("#songspot-next")?.addEventListener("click", actions.songSpotGroupNext);
  root.querySelector("#songspot-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#songspot-group-leave")?.addEventListener("click", () => actions.leaveRoom("music-select"));
  const replayButton = root.querySelector("[data-songspot-group-play]");
  if (replayButton) {
    replayButton.disabled = false;
  }
  Audio.bindTrackVolumeControls(root);
  bindSongSpotAnswerSuggestions(root, settings.region);
  const nextInput = root.querySelector("[data-songspot-answer-input]");
  if (draft && nextInput && !nextInput.disabled && previousTrackKey === root.querySelector("[data-songspot-game-audio]")?.dataset.trackKey) {
    nextInput.value = draft.value;
    if (draft.focused) { nextInput.focus({ preventScroll: true }); nextInput.setSelectionRange(draft.start, draft.end); }
  }
  if (phase === "preview" || phase === "answering") { bindSongSpotGameAudio(root, game); bindSongSpotGameTimer(root, game, actions); }
}
