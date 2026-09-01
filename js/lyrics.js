import { escapeHtml } from "./utils.js?v=20260901-3";
import { musicCategories, musicPreviewCatalog } from "./music.js?v=20260902-8";
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
  let cut = min + Math.floor(Math.random() * (max - min + 1));
  const chars = [...line];
  // Nie urywamy tuż po spacji — wtedy brakujący fragment zaczyna się od litery.
  while (cut < chars.length - 1 && chars[cut] === " ") cut += 1;
  return Math.min(chars.length - 1, cut);
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
    if (!array(players).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    const value = clean(text, 180);
    if (!value) return "Wpisz brakujący fragment tekstu.";
    game.answers = object(game.answers);
    if (uid in game.answers) return "Twoja odpowiedź jest już zapisana.";
    game.answers[uid] = { text: value, submittedAt: Date.now() };
    if (array(players).every(player => player in game.answers)) resolveRound(game);
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

function revealedCount(game, now = Date.now()) {
  const line = lyricById(game?.lyricId)?.line || "";
  const cutAt = Math.max(1, Math.min([...line].length - 1, Number(game?.cutAt) || 1));
  if (game?.phase !== "listening") return cutAt;
  const duration = Math.max(1, Number(game?.audioSeconds) || lyricsDefaults.audioSeconds) * 1000;
  const elapsed = Math.max(0, Math.min(duration, now - Number(game?.revealStartedAt || now)));
  return Math.max(0, Math.min(cutAt, Math.floor((elapsed / duration) * cutAt)));
}

function trackHtml(item) {
  const image = item.coverUrl ? `<img src="${escapeHtml(item.coverUrl)}" alt="" loading="lazy" decoding="async">` : `<span class="music-cover-placeholder">♫</span>`;
  return `<div class="lyrics-track"><div class="lyrics-track-cover">${image}</div><div><p class="eyebrow">FRAGMENT UTWORU</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.artist)}</p></div></div>`;
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
    : `<form class="lyrics-answer-form" data-lyrics-answer-form><label for="lyrics-answer">Dokończ tekst</label><div><input id="lyrics-answer" name="answer" maxlength="180" autocomplete="off" placeholder="Wpisz brakujący fragment…" required><button class="primary" type="submit">Zatwierdź</button></div><small>Liczy się każda poprawna litera. Nie musisz wpisywać znaków interpunkcyjnych.</small></form>`;
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
      root.querySelectorAll("[data-lyrics-reveal]").forEach(node => { node.outerHTML = maskedText(line, revealedCount(game), game.cutAt); });
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

function bindLyricsAudio(root, game, namespace) {
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
    lyricsAudioStopTimer = window.setTimeout(lock, Math.max(100, Number(game.phaseEndsAt) - Date.now() + 40));
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
    content += `<section class="lyrics-challenge listening">${trackHtml(item)}<div class="lyrics-progress"><span>Odsłuch fragmentu</span><b data-lyrics-countdown>${timer}s</b></div><div class="lyrics-text-stage">${maskedText(item.line, revealedCount(game), game.cutAt)}</div><div class="lyrics-audio-box"><audio data-lyrics-audio preload="auto" src="${escapeHtml(item.previewUrl || "")}"></audio><button class="ghost" type="button" data-lyrics-play ${item.previewUrl ? "" : "disabled"}>▶ Odtwórz fragment</button><span data-lyrics-audio-state>${item.previewUrl ? "Fragment włączy się automatycznie po wejściu." : "Brak dostępnego preview tego utworu."}</span></div><p class="lyrics-hint">Słuchaj uważnie. Gdy fragment się zatrzyma, brakująca część tekstu zostanie ukryta.</p></section>`;
  } else if (game.phase === "answering") {
    content += `<section class="lyrics-challenge answering">${trackHtml(item)}<div class="lyrics-progress"><span>Twoja odpowiedź</span><b data-lyrics-countdown>${timer}s</b></div><div class="lyrics-text-stage">${maskedText(item.line, game.cutAt, game.cutAt)}</div>${answerForm(game, currentUser)}</section>`;
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
  if (game.phase === "listening") bindLyricsAudio(root, game, namespace);
  scheduleLyricsTimer(root, game, actions, expected);
}

export function renderLyricsLobbySettings(room, isHost) {
  const settings = sanitizeLyricsSettings(room.settings);
  const categoryOptions = musicCategories.map(([id, label, group]) => `<option value="${escapeHtml(id)}" ${settings.category === id ? "selected" : ""}>${escapeHtml(label)} · ${escapeHtml(group)}</option>`).join("");
  return `<div class="music-settings lyrics-settings"><label class="setting-row"><span>Liczba rund</span><select data-lyrics-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 7, 10, 15, 20].map(value => `<option value="${value}" ${settings.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Długość fragmentu</span><select data-lyrics-setting="audioSeconds" ${isHost ? "" : "disabled"}>${[5, 8, 10, 12].map(value => `<option value="${value}" ${settings.audioSeconds === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label><label class="setting-row"><span>Czas na odpowiedź</span><select data-lyrics-setting="answerTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${settings.answerTime === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label><label class="setting-row"><span>Kategoria</span><select data-lyrics-setting="category" ${isHost ? "" : "disabled"}>${categoryOptions}</select></label><div class="lyrics-settings-note"><b>Jak to działa?</b><small>Najpierw słuchacie krótkiego preview. Po zatrzymaniu audio każdy wpisuje brakujący fragment. Wynik liczy się procentowo za poprawne litery.</small></div></div>`;
}
