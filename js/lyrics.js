import { avatarHtml, escapeHtml } from "./utils.js?v=20260901-3";
import { musicCategories, musicPreviewCatalog } from "./music.js?v=20260902-10";
import { Audio } from "./audio.js?v=20260902-1";

export const lyricsDefaults = { rounds: 5, audioSeconds: 8, answerTime: 30, category: "all" };
const MIN_AUDIO_SECONDS = 4;
const MAX_AUDIO_SECONDS = 12;
const MIN_ANSWER_SECONDS = 15;
const MAX_ANSWER_SECONDS = 60;
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = value => Array.isArray(value) ? value : [];
const clean = (value, max = 180) => String(value || "").trim().slice(0, max);
const clamp = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
const deadline = seconds => Date.now() + Math.max(5, Number(seconds) || 30) * 1000;
const unique = list => [...new Set(array(list).map(String).filter(Boolean))];
const normalizeLetters = value => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("pl-PL")
  .replace(/[^a-z0-9]/g, "");
const safeCategory = value => musicCategories.some(([id]) => id === value) ? value : "all";
const categoryLabel = value => musicCategories.find(([id]) => id === value)?.[1] || "Wszystko";

// Krótkie fragmenty demonstracyjne prowadzące do znanych previewów.
// Właściwa baza może być później rozszerzana o fragmenty, do których właściciel
// aplikacji ma prawa. Każdy wpis jest celowo krótki, żeby gra nie wyświetlała
// pełnych tekstów utworów.
const lyricSeeds = [
  ["lyrics-blinding-lights", "fallback-0", "I said, ooh, I'm blinded by the lights", ["all", "bangers", "pop", "viral", "2020s"]],
  ["lyrics-as-it-was", "fallback-1", "You know it's not the same as it was", ["all", "pop", "nostalgia", "2020s", "2022"]],
  ["lyrics-flowers", "fallback-3", "I can buy myself flowers", ["all", "pop", "confidence", "2020s", "2023"]],
  ["lyrics-shape-of-you", "fallback-4", "I'm in love with the shape of you", ["all", "pop", "romantic", "2010s", "2017"]],
  ["lyrics-bad-guy", "fallback-5", "So you're a tough guy", ["all", "pop", "dark", "viral", "2010s"]],
  ["lyrics-wake-me-up", "fallback-6", "Wake me up when it's all over", ["all", "dance", "energy", "2010s", "2013"]],
  ["lyrics-mr-brightside", "fallback-7", "It started out with a kiss", ["all", "rock", "bangers", "nostalgia", "2000s"]],
  ["lyrics-believer", "fallback-8", "You made me a believer", ["all", "rock", "energy", "motivation", "2010s"]],
  ["lyrics-one-more-time", "fallback-9", "One more time, we're gonna celebrate", ["all", "electronic", "party", "dance", "2000s"]],
  ["lyrics-rolling-in-the-deep", "fallback-10", "We could have had it all", ["all", "pop", "sad", "2010s", "2011"]],
  ["lyrics-uptown-funk", "fallback-11", "Don't believe me just watch", ["all", "funk", "party", "viral", "2010s"]],
  ["lyrics-starboy", "fallback-13", "I'm tryna put you in the worst mood", ["all", "rap", "dark", "2010s", "2016"]],
  ["lyrics-cruel-summer", "fallback-14", "It's new, the shape of your body", ["all", "pop", "summer", "romantic", "2010s"]],
  ["lyrics-dance-monkey", "fallback-15", "They say, oh my God, I see the way", ["all", "pop", "dance", "viral", "2010s"]],
  ["lyrics-someone-you-loved", "fallback-16", "Now the day bleeds into nightfall", ["all", "pop", "sad", "2010s", "2019"]],
  ["lyrics-perfect", "fallback-17", "I found a love for me", ["all", "pop", "romantic", "2010s", "2017"]],
  ["lyrics-counting-stars", "fallback-18", "Lately, I've been losing sleep", ["all", "pop", "rock", "energy", "2010s"]],
  ["lyrics-cheap-thrills", "fallback-19", "I love cheap thrills", ["all", "pop", "dance", "party", "2010s"]],
  ["lyrics-chandelier", "fallback-20", "I'm gonna swing from the chandelier", ["all", "pop", "sad", "2010s", "2014"]],
  ["lyrics-firework", "fallback-21", "Do you ever feel like a plastic bag", ["all", "pop", "energy", "motivation", "2010s"]],
  ["lyrics-roar", "fallback-22", "I got the eye of the tiger", ["all", "pop", "energy", "motivation", "2010s"]],
  ["lyrics-halo", "fallback-23", "Everywhere I'm looking now", ["all", "pop", "romantic", "2000s", "2009"]],
  ["lyrics-someone-like-you", "fallback-24", "Never mind, I'll find someone like you", ["all", "pop", "sad", "2010s", "2011"]],
  ["lyrics-hello", "fallback-25", "Hello from the other side", ["all", "pop", "sad", "2010s", "2015"]],
  ["lyrics-faded", "fallback-26", "Where are you now? Atlantis", ["all", "electronic", "dark", "2010s", "2015"]],
  ["lyrics-closer", "fallback-27", "So baby pull me closer", ["all", "pop", "dance", "romantic", "2010s"]],
  ["lyrics-something-just-like-this", "fallback-28", "I've been reading books of old", ["all", "pop", "electronic", "energy", "2010s"]],
  ["lyrics-my-universe", "fallback-29", "You are my universe", ["all", "pop", "romantic", "2020s", "2021"]],
  ["lyrics-yellow", "fallback-30", "Look at the stars", ["all", "rock", "romantic", "2000s", "2000"]],
  ["lyrics-summertime-sadness", "fallback-31", "Kiss me hard before you go", ["all", "pop", "sad", "summer", "2010s"]],
  ["lyrics-video-games", "fallback-32", "It's you, it's you, it's all for you", ["all", "pop", "sad", "romantic", "2010s"]],
  ["lyrics-one-dance", "fallback-33", "Baby, I like your style", ["all", "rap", "dance", "party", "2010s"]],
  ["lyrics-circles", "fallback-34", "Seasons change and our love went cold", ["all", "pop", "sad", "2010s", "2019"]],
  ["lyrics-levitating", "fallback-2", "If you wanna run away with me", ["all", "pop", "dance", "energy", "2020s"]],
  ["lyrics-houdini", "fallback-12", "I'll come and I'll go", ["all", "pop", "dance", "viral", "2020s"]],
];

const lyricBank = lyricSeeds.map(([id, trackId, line, categories]) => {
  const track = musicPreviewCatalog.find(item => item.id === trackId) || {};
  return {
    id,
    title: clean(track.title || "Nieznany utwór", 100),
    artist: clean(track.artist || "Nieznany wykonawca", 100),
    coverUrl: clean(track.coverUrl, 500),
    previewUrl: clean(track.previewUrl, 500),
    externalUrl: clean(track.spotifyUrl || track.externalUrl, 500),
    line: clean(line, 180),
    categories: unique(categories),
  };
});

export const lyricsTracks = lyricBank.map(item => ({ ...item }));
const lyricById = id => lyricBank.find(item => item.id === id) || lyricBank[0];

export function sanitizeLyricsSettings(settings = {}) {
  return {
    rounds: clamp(settings.rounds, 1, 20, lyricsDefaults.rounds),
    audioSeconds: clamp(settings.audioSeconds, MIN_AUDIO_SECONDS, MAX_AUDIO_SECONDS, lyricsDefaults.audioSeconds),
    answerTime: clamp(settings.answerTime, MIN_ANSWER_SECONDS, MAX_ANSWER_SECONDS, lyricsDefaults.answerTime),
    category: safeCategory(settings.category),
  };
}

function eligibleLyrics(category = "all") {
  const selected = lyricBank.filter(item => category === "all" || item.categories.includes(category));
  return selected.length >= 2 ? selected : lyricBank;
}

function pickLyric(usedIds = [], category = "all") {
  const pool = eligibleLyrics(category);
  const unused = pool.filter(item => !usedIds.includes(item.id));
  const source = unused.length ? unused : pool;
  return source[Math.floor(Math.random() * source.length)] || lyricBank[0];
}

function cutPoint(line) {
  const length = [...String(line || "")].length;
  if (length < 8) return Math.max(1, Math.floor(length / 2));
  const min = Math.max(3, Math.floor(length * .32));
  const max = Math.max(min + 1, Math.ceil(length * .64));
  const chars = [...line];
  // Urywamy między słowami, żeby odpowiedź była naturalną kontynuacją,
  // a nie przypadkową połową słowa. Jeśli krótki wers nie ma dogodnego
  // miejsca, zostawiamy bezpieczny punkt z dotychczasowego zakresu.
  const boundaries = [];
  for (let index = min; index <= Math.min(max, chars.length - 2); index += 1) {
    if (chars[index - 1] === " " || chars[index] === " ") boundaries.push(index + (chars[index] === " " ? 1 : 0));
  }
  const candidates = boundaries.filter(index => index > 1 && index < chars.length - 1);
  if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
  return Math.min(chars.length - 1, min + Math.floor(Math.random() * (max - min + 1)));
}

function startLyricsRound(game, settings) {
  const usedIds = unique(game.usedIds);
  const item = pickLyric(usedIds, settings.category);
  game.usedIds = [...new Set([...usedIds, item.id])].slice(-lyricBank.length);
  game.lyricId = item.id;
  game.cutAt = cutPoint(item.line);
  game.audioSeconds = settings.audioSeconds;
  game.revealStartedAt = Date.now();
  game.answers = {};
  game.roundResult = null;
  game.phase = "listening";
  game.phaseEndsAt = deadline(settings.audioSeconds);
}

function expectedAnswer(game) {
  const item = lyricById(game?.lyricId);
  return [...item.line].slice(Math.max(1, Number(game?.cutAt) || 1)).join("").trim();
}

function gradeAnswer(game, text) {
  const expected = normalizeLetters(expectedAnswer(game));
  const actual = normalizeLetters(text);
  if (!expected) return { accuracy: 0, correctLetters: 0, totalLetters: 0, points: 0 };
  let correctLetters = 0;
  [...expected].forEach((letter, index) => { if (actual[index] === letter) correctLetters += 1; });
  const totalLetters = Math.max(expected.length, actual.length);
  const accuracy = totalLetters ? correctLetters / totalLetters : 0;
  const points = accuracy >= .9 ? 3 : accuracy >= .65 ? 2 : accuracy >= .35 ? 1 : 0;
  return { accuracy, correctLetters, totalLetters, points };
}

function resolveRound(game) {
  const item = lyricById(game.lyricId);
  const answers = object(game.answers), resultAnswers = {};
  game.scores = object(game.scores);
  array(game.players).forEach(uid => {
    const submitted = object(answers[uid]);
    const grade = gradeAnswer(game, submitted.text || "");
    game.scores[uid] = Number(game.scores[uid] || 0) + grade.points;
    resultAnswers[uid] = {
      text: clean(submitted.text, 180),
      accuracy: grade.accuracy,
      correctLetters: grade.correctLetters,
      totalLetters: grade.totalLetters,
      points: grade.points,
      timedOut: Boolean(submitted.timedOut),
    };
  });
  game.roundResult = {
    round: Number(game.round || 1),
    lyricId: item.id,
    cutAt: Number(game.cutAt) || 1,
    answers: resultAnswers,
    fullText: item.line,
    expected: expectedAnswer(game),
  };
  game.phase = "roundResult";
  game.phaseEndsAt = Date.now() + 6000;
}

export function createLyricsGame(players, settings = {}) {
  const safe = sanitizeLyricsSettings(settings);
  const list = [...new Set(array(players).map(String).filter(Boolean))].slice(0, 8);
  const game = {
    mode: "dokoncz-tekst",
    phase: "listening",
    round: 1,
    totalRounds: safe.rounds,
    players: list,
    category: safe.category,
    audioSeconds: safe.audioSeconds,
    answerTime: safe.answerTime,
    lyricId: "",
    cutAt: 1,
    usedIds: [],
    answers: {},
    scores: Object.fromEntries(list.map(uid => [uid, 0])),
    roundResult: null,
    finished: false,
    revealStartedAt: Date.now(),
    phaseEndsAt: 0,
  };
  startLyricsRound(game, safe);
  return game;
}

export const LyricsEngine = {
  answer(game, uid, text, players, settings = {}) {
    const safe = sanitizeLyricsSettings(settings);
    if (game.phase !== "answering") return "Teraz nie można już wpisywać odpowiedzi.";
    // The game roster is the same roster used by the renderer. During a
    // remote transaction room.players may briefly lag behind game.players;
    // validating against that second snapshot made a visible answer form
    // reject the player's submission as if they were a spectator.
    const roster = unique(array(game.players).length ? game.players : players);
    const playerId = String(uid || "");
    if (!roster.includes(playerId)) return "Nie bierzesz udziału w tej rundzie.";
    const value = clean(text, 180);
    if (!value) return "Wpisz brakujący fragment tekstu.";
    game.answers = object(game.answers);
    if (playerId in game.answers) return "Twoja odpowiedź jest już zapisana.";
    game.answers[playerId] = { text: value, submittedAt: Date.now() };
    if (roster.every(player => player in game.answers)) resolveRound(game);
    else if (!Number.isFinite(Number(game.phaseEndsAt))) game.phaseEndsAt = deadline(safe.answerTime);
  },
  timeout(game, settings = {}) {
    const safe = sanitizeLyricsSettings(settings);
    if (game.phase === "listening") {
      game.phase = "answering";
      game.phaseEndsAt = deadline(safe.answerTime);
      return;
    }
    if (game.phase === "answering") {
      game.answers = object(game.answers);
      array(game.players).forEach(uid => { if (!(uid in game.answers)) game.answers[uid] = { text: "", timedOut: true }; });
      resolveRound(game);
    }
  },
  nextRound(game, settings = {}) {
    const safe = sanitizeLyricsSettings(settings);
    if (game.phase !== "roundResult") return "Wynik rundy nie jest jeszcze gotowy.";
    if (Number(game.round) >= Number(game.totalRounds || safe.rounds)) {
      const top = Math.max(0, ...Object.values(game.scores || {}).map(Number));
      game.winners = array(game.players).filter(uid => Number(game.scores?.[uid] || 0) === top && top > 0);
      game.phase = "gameSummary";
      game.finished = true;
      game.phaseEndsAt = null;
      return;
    }
    game.round = Number(game.round || 1) + 1;
    startLyricsRound(game, { ...safe, category:game.category || safe.category });
  },
  botAnswer(game, bot, shouldBeCorrect = true, difficulty = "normal") {
    const expected = expectedAnswer(game);
    if (shouldBeCorrect) return expected;
    const chars = [...expected];
    if (chars.length > 2) {
      const index = difficulty === "easy" ? 0 : Math.min(chars.length - 1, Math.floor(chars.length / 2));
      chars[index] = chars[index] === "a" ? "e" : "a";
    }
    return chars.join("").slice(0, Math.max(1, chars.length - (difficulty === "easy" ? 2 : 1)));
  },
  reconcile(game, players, settings = {}) {
    const safe = sanitizeLyricsSettings(settings);
    let changed = false;
    const order = [...new Set(array(players).map(String).filter(Boolean))].slice(0, 8);
    if (JSON.stringify(game.players || []) !== JSON.stringify(order)) { game.players = order; changed = true; }
    if (!game.lyricId || !lyricById(game.lyricId)) { startLyricsRound(game, safe); changed = true; }
    if (!Number.isFinite(Number(game.cutAt)) || Number(game.cutAt) < 1) { game.cutAt = cutPoint(lyricById(game.lyricId).line); changed = true; }
    if (!Number.isFinite(Number(game.round)) || Number(game.round) < 1) { game.round = 1; changed = true; }
    if (!Number.isFinite(Number(game.totalRounds))) { game.totalRounds = safe.rounds; changed = true; }
    if (!game.answers || typeof game.answers !== "object" || Array.isArray(game.answers)) { game.answers = {}; changed = true; }
    Object.keys(game.answers).forEach(uid => { if (!order.includes(uid)) { delete game.answers[uid]; changed = true; } });
    if (!game.scores || typeof game.scores !== "object" || Array.isArray(game.scores)) { game.scores = {}; changed = true; }
    order.forEach(uid => { if (!Number.isFinite(Number(game.scores[uid]))) { game.scores[uid] = 0; changed = true; } });
    if (!Array.isArray(game.usedIds)) { game.usedIds = []; changed = true; }
    if (!["listening", "answering", "roundResult", "gameSummary"].includes(game.phase)) { game.phase = "listening"; changed = true; }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !["roundResult", "gameSummary"].includes(game.phase)) {
      game.phaseEndsAt = deadline(game.phase === "answering" ? safe.answerTime : safe.audioSeconds);
      changed = true;
    }
    if (game.phase === "listening" && order.length && order.every(uid => uid in game.answers)) { game.answers = {}; changed = true; }
    if (game.phase === "answering" && order.length && order.every(uid => uid in game.answers)) { resolveRound(game); changed = true; }
    return changed;
  },
};

function itemForGame(game, result = null) {
  return lyricById(result?.lyricId || game?.lyricId);
}

function maskedText(line, revealCount, cutAt) {
  const chars = [...String(line || "")];
  const shown = Math.min(chars.length, Math.max(0, Number(revealCount) || 0));
  const rendered = chars.map((char, index) => {
    if (index < shown) return `<span class="lyrics-letter lyrics-letter-visible">${escapeHtml(char)}</span>`;
    if (char === " ") return `<span class="lyrics-letter lyrics-letter-space">&nbsp;</span>`;
    return `<span class="lyrics-letter lyrics-letter-hidden">•</span>`;
  }).join("");
  return `<span class="lyrics-line" data-lyrics-reveal data-lyrics-cut="${Number(cutAt) || 1}" data-lyrics-revealed="${shown}">${rendered}</span>`;
}

function continuationPreview(line, cutAt) {
  const chars = [...String(line || "")];
  const safeCut = Math.max(1, Math.min(Math.max(1, chars.length - 1), Number(cutAt) || 1));
  return chars.slice(0, safeCut).join("").trim();
}

function karaokeStage(line, revealCount, cutAt, phase = "listening") {
  const chars = [...String(line || "")];
  const safeCut = Math.max(1, Math.min(Math.max(1, chars.length - 1), Number(cutAt) || 1));
  const shown = phase === "listening" ? Math.min(safeCut, Math.max(0, Number(revealCount) || 0)) : safeCut;
  const rendered = chars.slice(0, safeCut).map((char, index) => {
    if (char === " ") return `<span class="lyrics-letter lyrics-letter-space">&nbsp;</span>`;
    const visible = index < shown;
    return `<span class="lyrics-letter ${visible ? "lyrics-letter-visible" : "lyrics-letter-hidden"} ${visible && index >= Math.max(0, shown - 4) ? "lyrics-karaoke-current" : ""}">${visible ? escapeHtml(char) : "•"}</span>`;
  }).join("");
  const tail = phase === "listening"
    ? `<span class="lyrics-karaoke-cut">▸ fragment zatrzyma się tutaj</span>`
    : `<span class="lyrics-karaoke-missing">… dalszy ciąg …</span>`;
  return `<span class="lyrics-line lyrics-karaoke-line" data-lyrics-reveal data-lyrics-cut="${safeCut}" data-lyrics-revealed="${shown}">${rendered}${tail}</span>`;
}

function revealedCount(game, now = Date.now()) {
  const line = lyricById(game?.lyricId)?.line || "";
  const cutAt = Math.max(1, Math.min([...line].length - 1, Number(game?.cutAt) || 1));
  if ((game?.phase || game?.status) !== "listening") return cutAt;
  if (!Number(game?.revealStartedAt)) return 0;
  const duration = Math.max(1, Number(game?.audioSeconds) || lyricsDefaults.audioSeconds) * 1000;
  const elapsed = Math.max(0, Math.min(duration, now - Number(game?.revealStartedAt || now)));
  return Math.max(0, Math.min(cutAt, Math.floor((elapsed / duration) * cutAt)));
}

function trackHtml(item) {
  const image = item.coverUrl ? `<img data-lyrics-cover src="${escapeHtml(item.coverUrl)}" alt="" loading="lazy" decoding="async">` : `<span class="music-cover-placeholder">♫</span>`;
  return `<div class="lyrics-track"><div class="lyrics-track-cover">${image}</div><div><p class="eyebrow">FRAGMENT UTWORU</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.artist)}</p></div></div>`;
}

function bindLyricsCoverFallbacks(root) {
  root.querySelectorAll("[data-lyrics-cover]").forEach(image => image.addEventListener("error", () => {
    const placeholder = document.createElement("span");
    placeholder.className = "music-cover-placeholder";
    placeholder.textContent = "♫";
    image.replaceWith(placeholder);
  }, { once:true }));
}

function resultRows(game, accounts = {}) {
  return array(game.players).map((uid, index) => {
    const result = object(game.roundResult?.answers?.[uid]);
    const accuracy = Math.round(Math.max(0, Math.min(1, Number(result.accuracy) || 0)) * 100);
    const name = accounts?.[uid]?.nick || (String(uid).startsWith("bot:") ? "Bot" : "Gracz");
    return `<div class="lyrics-result-row"><span><b>${escapeHtml(name)}</b><small>${result.timedOut ? "Brak odpowiedzi" : `${accuracy}% zgodności`}</small></span><strong>${Number(result.points || 0)} pkt</strong><em>#${index + 1}</em></div>`;
  }).join("");
}

function rankingRows(game, accounts = {}) {
  return [...array(game.players)].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0)).map((uid, index) => {
    const name = accounts?.[uid]?.nick || (String(uid).startsWith("bot:") ? "Bot" : "Gracz");
    return `<div class="lyrics-ranking-row"><span>${index + 1}. ${escapeHtml(name)}</span><b>${Number(game.scores?.[uid] || 0)} pkt</b></div>`;
  }).join("");
}

function answerForm(game, currentUser) {
  if (!array(game.players).includes(currentUser)) return `<div class="lyrics-answer-saved lyrics-spectator-note"><span>◌</span><div><b>Obserwujesz rundę</b><small>Odpowiadają tylko gracze tego pokoju.</small></div></div>`;
  const answered = Boolean(game.answers?.[currentUser]);
  return answered
    ? `<div class="lyrics-answer-saved"><span>✓</span><div><b>Odpowiedź zapisana</b><small>Czekamy na resztę ekipy.</small></div></div>`
    : `<form class="lyrics-answer-form" data-lyrics-answer-form><label for="lyrics-answer">Dalszy ciąg tekstu</label><div><input id="lyrics-answer" name="answer" maxlength="180" autocomplete="off" placeholder="Wpisz kontynuację…" required><button class="primary" type="submit">Zatwierdź</button></div><small>To zawsze kontynuacja tego samego fragmentu. Liczy się każda poprawna litera — interpunkcja nie ma znaczenia.</small></form>`;
}

function scheduleLyricsTimer(root, game, actions, expected) {
  window.clearTimeout(lyricsTimer);
  window.clearTimeout(lyricsClockTimer);
  lyricsTimer = 0;
  lyricsClockTimer = 0;
  lyricsTimerKey = "";
  const endAt = Number(game.phaseEndsAt);
  if (!Number.isFinite(endAt) || endAt <= 0 || !["listening", "answering"].includes(game.phase)) return;
  const key = `${game.round}:${game.phase}:${endAt}`;
  lyricsTimerKey = key;
  const update = () => {
    if (lyricsTimerKey !== key) return;
    const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    root.querySelectorAll("[data-lyrics-countdown]").forEach(node => { node.textContent = `${left}s`; });
    if (game.phase === "listening") {
      const line = lyricById(game.lyricId)?.line || "";
      root.querySelectorAll("[data-lyrics-reveal]").forEach(node => { node.outerHTML = karaokeStage(line, revealedCount(game), game.cutAt, "listening"); });
    }
    if (left <= 0) {
      lyricsClockTimer = 0;
      lyricsTimer = window.setTimeout(() => { if (lyricsTimerKey === key) { lyricsTimerKey = ""; actions.lyricsTimeout(expected); } }, 50);
      return;
    }
    lyricsClockTimer = window.setTimeout(update, 100);
  };
  update();
}

let lyricsTimer = 0;
let lyricsClockTimer = 0;
let lyricsTimerKey = "";
let lyricsAudioStopTimer = 0;
let lyricsAudio = null;
const lockedAudioKeys = new Set();

export function stopLyricsTimer() {
  window.clearTimeout(lyricsTimer);
  window.clearTimeout(lyricsClockTimer);
  window.clearTimeout(lyricsAudioStopTimer);
  lyricsTimer = 0;
  lyricsClockTimer = 0;
  lyricsAudioStopTimer = 0;
  lyricsTimerKey = "";
  if (lyricsAudio) {
    lyricsAudio.dataset.rerenderPause = "1";
    try { lyricsAudio.pause(); } catch {}
    delete lyricsAudio.dataset.rerenderPause;
  }
  lyricsAudio = null;
}

function bindLyricsAudio(root, game, namespace, onStarted = null) {
  const audio = root.querySelector("[data-lyrics-audio]");
  const button = root.querySelector("[data-lyrics-play]");
  if (!audio) return;
  const key = `lyrics:${namespace}:${Number(game.revealStartedAt || game.round || 1)}:${Number(game.round || 1)}:${game.lyricId}`;
  audio.dataset.trackKey = key;
  audio.dataset.trackPreviewLimit = String(Math.max(MIN_AUDIO_SECONDS, Number(game.audioSeconds) || lyricsDefaults.audioSeconds));
  lyricsAudio = audio;
  const locked = () => lockedAudioKeys.has(key);
  const lock = () => {
    if (locked()) return;
    lockedAudioKeys.add(key);
    audio.dataset.rerenderPause = "1";
    try { audio.pause(); } catch {}
    delete audio.dataset.rerenderPause;
    if (button) { button.disabled = true; button.textContent = "Fragment zakończony"; }
    const state = root.querySelector("[data-lyrics-audio-state]");
    if (state) state.textContent = "Odsłuch zakończony — dokończ tekst.";
  };
  const started = () => {
    if (onStarted && audio.dataset.lyricsPlayStarted !== "1") {
      audio.dataset.lyricsPlayStarted = "1";
      onStarted();
    }
    const state = root.querySelector("[data-lyrics-audio-state]");
    if (state) state.textContent = "Słuchaj uważnie — fragment zaraz się zatrzyma.";
  };
  audio.addEventListener("play", started);
  audio.addEventListener("timeupdate", () => { if (Number(audio.currentTime) >= Number(audio.dataset.trackPreviewLimit)) lock(); });
  audio.addEventListener("ended", lock);
  if (button) button.addEventListener("click", () => {
    if (locked()) return;
    Audio.bindTrackAudio(audio, key, { autoplay:false });
    const playing = audio.play();
    if (playing?.catch) playing.catch(() => {
      const state = root.querySelector("[data-lyrics-audio-state]");
      if (state) state.textContent = "Przeglądarka zablokowała dźwięk — kliknij ponownie.";
    });
  });
  if (locked()) {
    if (button) { button.disabled = true; button.textContent = "Fragment zakończony"; }
  } else {
    Audio.bindTrackAudio(audio, key, { autoplay:true });
    if (Number(game.phaseEndsAt) > 0) lyricsAudioStopTimer = window.setTimeout(lock, Math.max(100, Number(game.phaseEndsAt) - Date.now() + 40));
  }
}

export function renderLyricsGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game;
  const item = itemForGame(game, game.roundResult);
  const expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt };
  const timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  const namespace = room.roomId || "lyrics";
  let content = `<p class="eyebrow">DOKOŃCZ TEKST · RUNDA ${Math.min(Number(game.round || 1), Number(game.totalRounds || 1))}/${Number(game.totalRounds || 1)}</p><h1>Jaki jest następny wers?</h1><div class="lyrics-category-banner"><span>✍️</span><div><small>KATEGORIA</small><strong>${escapeHtml(categoryLabel(game.category))}</strong></div></div>`;
  if (game.phase === "listening") {
    content += `<section class="lyrics-challenge listening">${trackHtml(item)}<div class="lyrics-progress"><span>Odsłuch fragmentu</span><b data-lyrics-countdown>${timer}s</b></div><div class="lyrics-text-stage" data-lyrics-stage>${karaokeStage(item.line, revealedCount(game), game.cutAt, "listening")}</div><div class="lyrics-audio-box"><audio data-lyrics-audio preload="auto" src="${escapeHtml(item.previewUrl || "")}"></audio><button class="ghost" type="button" data-lyrics-play ${item.previewUrl ? "" : "disabled"}>▶ Odtwórz fragment</button><span data-lyrics-audio-state>${item.previewUrl ? "Fragment włączy się automatycznie po wejściu." : "Brak dostępnego preview tego utworu."}</span></div><p class="lyrics-hint">Tekst pojawia się w rytmie odsłuchu. Audio i tekst zatrzymają się w tym samym miejscu — potem wpisujesz dalszy ciąg.</p></section>`;
  } else if (game.phase === "answering") {
    content += `<section class="lyrics-challenge answering">${trackHtml(item)}<div class="lyrics-progress"><span>Twoja odpowiedź</span><b data-lyrics-countdown>${timer}s</b></div><div class="lyrics-text-stage" data-lyrics-stage>${karaokeStage(item.line, game.cutAt, game.cutAt, "answering")}</div><p class="lyrics-continuation-note">Kontynuacja zaczyna się po: <b>${escapeHtml(continuationPreview(item.line, game.cutAt))}</b></p>${answerForm(game, currentUser)}</section>`;
  } else if (game.phase === "roundResult") {
    const fullText = game.roundResult?.fullText || item.line;
    const winners = array(game.players).filter(uid => Number(game.roundResult?.answers?.[uid]?.points || 0) === Math.max(0, ...Object.values(game.roundResult?.answers || {}).map(answer => Number(answer?.points) || 0)) && Number(game.roundResult?.answers?.[uid]?.points || 0) > 0);
    content += `<section class="lyrics-challenge result">${trackHtml(item)}<p class="eyebrow">UJAWNIENIE</p><div class="lyrics-full-text">${escapeHtml(fullText)}</div><p class="lyrics-answer-note">Brakujący fragment: <b>${escapeHtml(game.roundResult?.expected || "")}</b></p><div class="lyrics-result-list">${resultRows(game, accounts)}</div>${winners.length ? `<p class="lyrics-winner">✦ Najlepiej trafili: ${winners.map(uid => escapeHtml(accounts?.[uid]?.nick || "Gracz")).join(", ")}</p>` : ""}<p class="lyrics-score-note">Każda poprawna litera zwiększa procent zgodności. Maksymalnie 3 punkty za rundę.</p><button class="primary big" id="lyrics-next">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż końcowy ranking" : "Następna runda"}</button></section>`;
  } else {
    const winners = array(game.winners).length ? game.winners : array(game.players).filter(uid => Number(game.scores?.[uid] || 0) === Math.max(0, ...Object.values(game.scores || {}).map(Number)));
    content += `<section class="lyrics-final"><span>🎤</span><p class="eyebrow">KONIEC GRY</p><h2>${winners.length ? `Wygrywa ${winners.map(uid => escapeHtml(accounts?.[uid]?.nick || "Gracz")).join(", ")}!` : "Tym razem bez zwycięzcy."}</h2><p>Najlepszy wynik w dokończeniu tekstów.</p><div class="lyrics-ranking-list">${rankingRows(game, accounts)}</div><button class="primary big" id="lyrics-lobby">Zagraj ponownie</button></section>`;
  }
  root.innerHTML = `<main class="page music-page lyrics-page enter"><section class="panel music-panel lyrics-panel">${content}</section><button id="lyrics-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  root.querySelector("[data-lyrics-answer-form]")?.addEventListener("submit", event => { event.preventDefault(); const input = event.currentTarget.querySelector("input"); actions.lyricsAnswer(input?.value || "", expected); });
  root.querySelector("#lyrics-next")?.addEventListener("click", actions.lyricsNext);
  root.querySelector("#lyrics-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#lyrics-leave")?.addEventListener("click", () => actions.leaveRoom());
  bindLyricsCoverFallbacks(root);
  if (game.phase === "listening") bindLyricsAudio(root, game, namespace);
  scheduleLyricsTimer(root, game, actions, expected);
}

const lyricsSoloStorageKey = playerId => `grygrupowe-lyrics-solo-v1:${String(playerId || "guest")}`;
const SOLO_AUDIO_SECONDS = 8;
const SOLO_ANSWER_SECONDS = 30;

function normalizeLyricsSoloState(raw, playerId) {
  const owner = String(playerId || raw?.playerId || "guest");
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const status = ["idle", "listening", "answering", "reveal", "over"].includes(source.status) ? source.status : "idle";
  const best = Math.max(0, Number(source.best) || 0);
  return {
    playerId: owner,
    status,
    streak: status === "idle" ? 0 : Math.max(0, Number(source.streak) || 0),
    best: Math.max(best, status !== "idle" ? Number(source.streak) || 0 : 0),
    round: Math.max(0, Number(source.round) || 0),
    lyricId: String(source.lyricId || ""),
    cutAt: Math.max(1, Number(source.cutAt) || 1),
    usedIds: unique(source.usedIds),
    audioSeconds: clamp(source.audioSeconds, MIN_AUDIO_SECONDS, MAX_AUDIO_SECONDS, SOLO_AUDIO_SECONDS),
    answerTime: clamp(source.answerTime, MIN_ANSWER_SECONDS, MAX_ANSWER_SECONDS, SOLO_ANSWER_SECONDS),
    revealStartedAt: Number(source.revealStartedAt) || 0,
    phaseEndsAt: Number(source.phaseEndsAt) || 0,
    lastResult: source.lastResult && typeof source.lastResult === "object" ? source.lastResult : null,
  };
}

let lyricsSoloState = null;
let lyricsSoloOwner = "";

function readLyricsSoloState(playerId) {
  const owner = String(playerId || "guest");
  if (lyricsSoloOwner === owner && lyricsSoloState) return lyricsSoloState;
  try { lyricsSoloState = normalizeLyricsSoloState(JSON.parse(localStorage.getItem(lyricsSoloStorageKey(owner)) || "null"), owner); }
  catch { lyricsSoloState = normalizeLyricsSoloState(null, owner); }
  lyricsSoloOwner = owner;
  return lyricsSoloState;
}

function saveLyricsSoloState(state) {
  try { localStorage.setItem(lyricsSoloStorageKey(state.playerId), JSON.stringify(state)); } catch {}
}

function startLyricsSoloRound(state) {
  const item = pickLyric(state.usedIds, "all");
  state.usedIds = [...new Set([...state.usedIds, item.id])].slice(-lyricBank.length);
  state.lyricId = item.id;
  state.cutAt = cutPoint(item.line);
  state.audioSeconds = SOLO_AUDIO_SECONDS;
  state.answerTime = SOLO_ANSWER_SECONDS;
  state.revealStartedAt = item.previewUrl ? 0 : Date.now();
  state.phaseEndsAt = item.previewUrl ? 0 : deadline(state.audioSeconds);
  state.lastResult = null;
  state.status = "listening";
}

function soloResult(state, text, grade) {
  const item = lyricById(state.lyricId);
  return {
    lyricId: item.id,
    title: item.title,
    artist: item.artist,
    coverUrl: item.coverUrl,
    previewUrl: item.previewUrl,
    fullText: item.line,
    prefix: continuationPreview(item.line, state.cutAt),
    expected: expectedAnswer(state),
    answer: clean(text, 180),
    accuracy: grade.accuracy,
    correctLetters: grade.correctLetters,
    totalLetters: grade.totalLetters,
    points: grade.points,
    correct: grade.accuracy >= .65,
  };
}

function submitLyricsSoloAnswer(state, text) {
  const grade = gradeAnswer(state, text);
  state.lastResult = soloResult(state, text, grade);
  state.phaseEndsAt = 0;
  if (!state.lastResult.correct) {
    state.status = "over";
    state.best = Math.max(Number(state.best) || 0, Number(state.streak) || 0);
    state.streak = Number(state.streak) || 0;
  } else {
    state.streak = Number(state.streak || 0) + 1;
    state.best = Math.max(Number(state.best) || 0, state.streak);
    state.status = "reveal";
  }
  saveLyricsSoloState(state);
  return state;
}

export const LyricsSoloEngine = {
  start(playerId) {
    const owner = String(playerId || "guest");
    const previous = readLyricsSoloState(owner);
    lyricsSoloState = { playerId:owner, status:"listening", streak:0, best:Number(previous.best) || 0, round:1, lyricId:"", cutAt:1, usedIds:[], audioSeconds:SOLO_AUDIO_SECONDS, answerTime:SOLO_ANSWER_SECONDS, revealStartedAt:0, phaseEndsAt:0, lastResult:null };
    lyricsSoloOwner = owner;
    startLyricsSoloRound(lyricsSoloState);
    saveLyricsSoloState(lyricsSoloState);
    return lyricsSoloState;
  },
  stop(playerId) {
    const state = readLyricsSoloState(playerId);
    state.status = "idle";
    state.streak = 0;
    state.round = 0;
    state.lyricId = "";
    state.phaseEndsAt = 0;
    state.lastResult = null;
    saveLyricsSoloState(state);
    return state;
  },
  get(playerId) { return { ...readLyricsSoloState(playerId) }; },
  audioStarted(playerId) {
    const state = readLyricsSoloState(playerId);
    if (state.status !== "listening" || Number(state.phaseEndsAt) > Date.now()) return false;
    state.revealStartedAt = Date.now();
    state.phaseEndsAt = deadline(state.audioSeconds);
    saveLyricsSoloState(state);
    return true;
  },
  answer(playerId, text, expected = {}) {
    const state = readLyricsSoloState(playerId);
    if (state.status !== "answering") return state;
    if (expected.phase && expected.phase !== state.status) return state;
    if (expected.phaseEndsAt && Number(expected.phaseEndsAt) !== Number(state.phaseEndsAt)) return state;
    if (!clean(text, 180)) return "Wpisz dalszy ciąg tekstu.";
    return submitLyricsSoloAnswer(state, text);
  },
  timeout(playerId, expected = {}) {
    const state = readLyricsSoloState(playerId);
    if (!["listening", "answering"].includes(state.status)) return state;
    if (expected.phase && expected.phase !== state.status) return state;
    if (expected.phaseEndsAt && Number(expected.phaseEndsAt) !== Number(state.phaseEndsAt)) return state;
    if (state.status === "listening") {
      state.status = "answering";
      state.phaseEndsAt = deadline(state.answerTime);
      saveLyricsSoloState(state);
      return state;
    }
    return submitLyricsSoloAnswer(state, "");
  },
  next(playerId) {
    const state = readLyricsSoloState(playerId);
    if (state.status !== "reveal" || !state.lastResult?.correct) return state;
    state.round = Number(state.round || 0) + 1;
    startLyricsSoloRound(state);
    saveLyricsSoloState(state);
    return state;
  },
};

let lyricsSoloTimer = 0;
let lyricsSoloClockTimer = 0;
let lyricsSoloTimerKey = "";

export function stopLyricsSoloTimer() {
  window.clearTimeout(lyricsSoloTimer);
  window.clearTimeout(lyricsSoloClockTimer);
  lyricsSoloTimer = 0;
  lyricsSoloClockTimer = 0;
  lyricsSoloTimerKey = "";
}

function scheduleLyricsSoloTimer(root, state, actions, expected) {
  stopLyricsSoloTimer();
  const endAt = Number(state.phaseEndsAt);
  if (!Number.isFinite(endAt) || endAt <= 0 || !["listening", "answering"].includes(state.status)) return;
  const key = `${state.round}:${state.status}:${endAt}`;
  lyricsSoloTimerKey = key;
  const update = () => {
    if (lyricsSoloTimerKey !== key) return;
    const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    root.querySelectorAll("[data-lyrics-countdown]").forEach(node => { node.textContent = `${left}s`; });
    if (state.status === "listening") {
      const line = lyricById(state.lyricId)?.line || "";
      root.querySelectorAll("[data-lyrics-reveal]").forEach(node => { node.outerHTML = karaokeStage(line, revealedCount(state), state.cutAt, "listening"); });
    }
    if (left <= 0) {
      lyricsSoloClockTimer = 0;
      lyricsSoloTimer = window.setTimeout(() => { if (lyricsSoloTimerKey === key) { lyricsSoloTimerKey = ""; actions.lyricsSoloTimeout(expected); } }, 50);
      return;
    }
    lyricsSoloClockTimer = window.setTimeout(update, 100);
  };
  update();
}

function lyricsSoloLeaderboard(accounts = {}, playerId, state = {}, currentProfile = null, leaderboard = {}) {
  const currentId = String(playerId || "guest");
  const ids = [...new Set([...Object.keys(object(accounts)), ...Object.keys(object(leaderboard)), currentId])].filter(Boolean);
  const ranked = ids.map(uid => {
    const account = accounts?.[uid] || {}, remote = leaderboard?.[uid] || {};
    const remoteBest = Number(remote.best ?? remote.records?.best) || 0;
    const best = uid === currentId ? Math.max(Number(state.best) || 0, remoteBest) : remoteBest;
    const nick = uid === currentId ? (currentProfile?.nick || account.nick || remote.nick || "Ty") : (account.nick || remote.nick || "Gracz");
    const profile = Object.keys(account).length ? account : { ...remote, nick, uid };
    return { uid, best, nick, profile, isCurrent:uid === currentId };
  }).filter(item => item.best > 0 || item.isCurrent).sort((a, b) => b.best - a.best || a.nick.localeCompare(b.nick, "pl"));
  const visible = ranked.slice(0, 8);
  if (!visible.some(item => item.isCurrent)) {
    const current = ranked.find(item => item.isCurrent);
    if (current) visible[visible.length - 1] = current;
  }
  const rows = visible.length ? visible.map((item, index) => `<div class="popularity-leaderboard-row ${item.isCurrent ? "is-you" : ""}"><span class="popularity-leaderboard-rank">${index + 1}</span>${avatarHtml(item.profile, "popularity-avatar", { disableIdle:true })}<span class="popularity-leaderboard-player"><b>${escapeHtml(item.nick)}</b><small>${item.isCurrent ? "Twój rekord" : "Najlepsza seria"}</small></span><strong>${item.best}</strong></div>`).join("") : `<p class="muted">Brak zapisanych serii.</p>`;
  return `<aside class="panel popularity-leaderboard lyrics-solo-leaderboard" aria-label="Ranking Dokończ tekst solo"><div class="section-heading"><div><p class="eyebrow">DOKOŃCZ TEKST</p><h2>Ranking serii</h2></div><span class="badge">${ranked.length}</span></div><p class="popularity-leaderboard-note">Osobny rekord dla solo. Każde trafienie wydłuża serię.</p><div class="popularity-leaderboard-list">${rows}</div></aside>`;
}

function lyricsSoloHeader(state) {
  return `<p class="eyebrow">TRYB SOLO</p><div class="lyrics-solo-title-row"><div><h1>Dokończ tekst</h1><p class="muted">Posłuchaj początku, wpisz dalszy ciąg i zbuduj jak najdłuższą serię.</p></div><div class="lyrics-solo-streak"><small>STREAK</small><b>${Number(state.streak || 0)}</b></div></div>`;
}

function lyricsSoloResult(state) {
  const result = state.lastResult || {}, item = lyricById(result.lyricId || state.lyricId);
  const percentage = Math.round(Math.max(0, Math.min(1, Number(result.accuracy) || 0)) * 100);
  const correct = Boolean(result.correct);
  return `<section class="lyrics-solo-result ${correct ? "is-correct" : "is-wrong"}"><div class="lyrics-solo-result-icon">${correct ? "✓" : "×"}</div><p class="eyebrow">${correct ? "DOBRZE TRAFIONE" : "SERIA ZAKOŃCZONA"}</p><h2>${correct ? "Dobra pamięć!" : `Streak: ${Number(state.streak || 0)}`}</h2><p class="muted">Twoja zgodność: <b>${percentage}%</b> · ${Number(result.points || 0)} pkt</p><div class="lyrics-solo-reveal-track">${trackHtml(item)}</div><div class="lyrics-full-text">${escapeHtml(result.fullText || item.line)}</div><p class="lyrics-answer-note">Brakujący ciąg zaczynał się po: <b>${escapeHtml(result.prefix || continuationPreview(item.line, state.cutAt))}</b></p>${correct ? `<div class="lyrics-solo-result-actions"><button class="primary big" id="lyrics-solo-next">Następny fragment</button><button class="ghost" id="lyrics-solo-stop">Przerwij serię</button></div>` : `<div class="lyrics-solo-result-actions"><button class="primary big" id="lyrics-solo-restart">Zagraj jeszcze raz</button><button class="ghost" id="lyrics-solo-menu">Wróć do menu</button></div>`}</section>`;
}

export function renderLyricsSolo(root, { profile, playerId, accounts = {}, leaderboard = {} }, actions) {
  stopLyricsSoloTimer();
  const state = readLyricsSoloState(playerId);
  const item = lyricById(state.lyricId);
  const timer = Math.max(0, Math.ceil((Number(state.phaseEndsAt || 0) - Date.now()) / 1000));
  const timerLabel = state.status === "listening" && !state.phaseEndsAt && item.previewUrl ? "▶" : `${timer}s`;
  const expected = { phase:state.status, phaseEndsAt:state.phaseEndsAt };
  let content = lyricsSoloHeader(state);
  if (state.status === "idle") {
    content += `<section class="lyrics-solo-start"><div class="lyrics-solo-icon">🎤</div><p class="eyebrow">SZYBKI SOLO RUN</p><h2>Ile fragmentów trafisz z rzędu?</h2><p class="muted">Najpierw słuchasz krótkiego preview. Potem tekst zatrzymuje się w konkretnym miejscu, a Ty wpisujesz jego dalszą część.</p><div class="lyrics-solo-best"><span>🏆</span><div><small>TWÓJ REKORD</small><b>${Number(state.best || 0)} trafień</b></div></div><button class="primary big" id="lyrics-solo-start">Zacznij serię</button></section>`;
  } else if (state.status === "listening") {
    content += `<section class="lyrics-challenge listening lyrics-solo-challenge">${trackHtml(item)}<div class="lyrics-progress"><span>Odsłuch fragmentu</span><b data-lyrics-countdown>${timerLabel}</b></div><div class="lyrics-text-stage" data-lyrics-stage>${karaokeStage(item.line, revealedCount(state), state.cutAt, "listening")}</div><div class="lyrics-audio-box"><audio data-lyrics-audio preload="auto" src="${escapeHtml(item.previewUrl || "")}"></audio><button class="ghost" type="button" data-lyrics-play ${item.previewUrl ? "" : "disabled"}>▶ Odtwórz fragment</button><span data-lyrics-audio-state>${item.previewUrl ? "Kliknij, jeśli przeglądarka zablokuje automatyczny dźwięk." : "Brak dostępnego preview tego utworu."}</span></div><p class="lyrics-hint">Tekst startuje razem z odsłuchem. Po zatrzymaniu audio wpiszesz dokładną kontynuację.</p></section>`;
  } else if (state.status === "answering") {
    content += `<section class="lyrics-challenge answering lyrics-solo-challenge">${trackHtml(item)}<div class="lyrics-progress"><span>Dokończ zatrzymany fragment</span><b data-lyrics-countdown>${timer}s</b></div><div class="lyrics-text-stage" data-lyrics-stage>${karaokeStage(item.line, state.cutAt, state.cutAt, "answering")}</div><p class="lyrics-continuation-note">Kontynuacja zaczyna się po: <b>${escapeHtml(continuationPreview(item.line, state.cutAt))}</b></p><form class="lyrics-answer-form" data-lyrics-solo-answer-form><label for="lyrics-solo-answer">Dalszy ciąg tekstu</label><div><input id="lyrics-solo-answer" name="answer" maxlength="180" autocomplete="off" placeholder="Wpisz kontynuację…" required><button class="primary" type="submit">Zatwierdź</button></div><small>Liczy się każda poprawna litera — interpunkcja nie ma znaczenia.</small></form></section>`;
  } else {
    content += lyricsSoloResult(state);
  }
  root.innerHTML = `<main class="page music-page lyrics-page lyrics-solo-page enter"><div class="lyrics-solo-layout"><section class="panel music-panel lyrics-panel lyrics-solo-main">${content}<p class="popularity-snapshot-note">Solo ma osobny streak i osobny ranking — nie łączy się z „Kto ma więcej?”.</p></section>${lyricsSoloLeaderboard(accounts, playerId, state, profile, leaderboard)}</div><button id="lyrics-solo-home" class="ghost">Wróć do menu</button></main>`;
  root.querySelector("#lyrics-solo-start")?.addEventListener("click", () => actions.lyricsSoloStart());
  root.querySelector("#lyrics-solo-restart")?.addEventListener("click", () => actions.lyricsSoloStart());
  root.querySelector("#lyrics-solo-next")?.addEventListener("click", actions.lyricsSoloNext);
  root.querySelector("#lyrics-solo-stop")?.addEventListener("click", actions.lyricsSoloStop);
  root.querySelector("#lyrics-solo-menu")?.addEventListener("click", actions.goPlatform);
  root.querySelector("#lyrics-solo-home")?.addEventListener("click", actions.goPlatform);
  root.querySelector("[data-lyrics-solo-answer-form]")?.addEventListener("submit", event => { event.preventDefault(); const input = event.currentTarget.querySelector("input"); actions.lyricsSoloAnswer(input?.value || "", expected); });
  bindLyricsCoverFallbacks(root);
  if (state.status === "listening") bindLyricsAudio(root, state, `solo:${playerId}`, () => { if (actions.lyricsSoloAudioStarted) actions.lyricsSoloAudioStarted(); });
  scheduleLyricsSoloTimer(root, state, actions, expected);
}

export function renderLyricsLobbySettings(room, isHost) {
  const settings = sanitizeLyricsSettings(room.settings);
  const categoryOptions = musicCategories.map(([id, label, group]) => `<option value="${escapeHtml(id)}" ${settings.category === id ? "selected" : ""}>${escapeHtml(label)} · ${escapeHtml(group)}</option>`).join("");
  return `<div class="music-settings lyrics-settings"><label class="setting-row"><span>Liczba rund</span><select data-lyrics-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 7, 10, 15, 20].map(value => `<option value="${value}" ${settings.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Długość fragmentu</span><select data-lyrics-setting="audioSeconds" ${isHost ? "" : "disabled"}>${[5, 8, 10, 12].map(value => `<option value="${value}" ${settings.audioSeconds === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label><label class="setting-row"><span>Czas na odpowiedź</span><select data-lyrics-setting="answerTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${settings.answerTime === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label><label class="setting-row"><span>Kategoria</span><select data-lyrics-setting="category" ${isHost ? "" : "disabled"}>${categoryOptions}</select></label><div class="lyrics-settings-note"><b>Jak to działa?</b><small>Najpierw słuchacie krótkiego preview. Po zatrzymaniu audio każdy wpisuje brakujący fragment. Wynik liczy się procentowo za poprawne litery.</small></div></div>`;
}
