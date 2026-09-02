import { avatarHtml, escapeHtml } from "./utils.js?v=20260901-3";
import { isMusicTrackInRegion, musicCategories, musicPreviewCatalog, musicRegionLabel, musicRegionOptions, musicRegionPicker } from "./music.js?v=20260902-17";
import { Audio } from "./audio.js?v=20260902-1";

export const lyricsDefaults = { rounds: 5, audioSeconds: 8, answerTime: 30, category: "all", region: "global" };
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
const safeRegion = value => value === "polish" ? "polish" : "global";
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
  ["lyrics-espresso", "fallback-35", "I'm working late, 'cause I'm a singer", ["all", "pop", "dance", "viral", "2020s", "2024"]],
  ["lyrics-die-with-a-smile", "fallback-36", "If the world was ending, I'd wanna be next", ["all", "pop", "romantic", "sad", "2020s", "2024"]],
  ["lyrics-apt", "fallback-37", "Uh-huh, you and me", ["all", "pop", "dance", "viral", "2020s", "2024"]],
  ["lyrics-birds-of-a-feather", "fallback-38", "I want you to stay", ["all", "pop", "romantic", "sad", "2020s", "2024"]],
  ["lyrics-beautiful-things", "fallback-39", "Please don't take these beautiful things", ["all", "pop", "sad", "2020s", "2024"]],
  ["lyrics-drivers-license", "fallback-40", "I got my driver's license last week", ["all", "pop", "sad", "2020s", "2021"]],
  ["lyrics-watermelon-sugar", "fallback-41", "Tastes like strawberries on a summer evenin'", ["all", "pop", "summer", "2020s", "2020"]],
  ["lyrics-heat-waves", "fallback-42", "Sometimes all I think about is you", ["all", "pop", "electronic", "sad", "2020s", "2021"]],
  ["lyrics-sweater-weather", "fallback-43", "And all I am is a man", ["all", "pop", "romantic", "2010s", "2013"]],
  ["lyrics-somebody-that-i-used-to-know", "fallback-44", "But you didn't have to cut me off", ["all", "pop", "sad", "nostalgia", "2010s", "2012"]],
  ["lyrics-take-on-me", "fallback-45", "Take on me, take me on", ["all", "pop", "rock", "nostalgia", "1980s", "1985"]],
  ["lyrics-billie-jean", "fallback-46", "Billie Jean is not my lover", ["all", "pop", "dance", "nostalgia", "1980s", "1982"]],
  ["lyrics-smells-like-teen-spirit", "fallback-47", "With the lights out, it's less dangerous", ["all", "rock", "dark", "nostalgia", "1990s", "1991"]],
  ["lyrics-dont-stop-me-now", "fallback-48", "I'm having such a good time", ["all", "rock", "party", "energy", "1970s", "1978"]],
  ["lyrics-the-nights", "fallback-49", "He said one day you'll leave this world behind", ["all", "dance", "energy", "motivation", "2010s", "2014"]],
  ["lyrics-titanium", "fallback-50", "I'm bulletproof, nothing to lose", ["all", "dance", "energy", "motivation", "2010s", "2011"]],
  ["lyrics-havana", "fallback-51", "Havana, ooh na-na", ["all", "pop", "dance", "party", "2010s", "2017"]],
  ["lyrics-anti-hero", "fallback-52", "It's me, hi, I'm the problem, it's me", ["all", "pop", "dark", "viral", "2020s", "2022"]],
  ["lyrics-bad-habit", "fallback-53", "I wish I knew you wanted me", ["all", "pop", "romantic", "2020s", "2022"]],
  ["lyrics-ordinary", "fallback-56", "They say the world's gonna end", ["all", "pop", "viral", "2020s", "2024"]],
  ["lyrics-taste", "fallback-57", "I leave quite an impression", ["all", "pop", "viral", "2020s", "2024"]],
  ["lyrics-good-luck-babe", "fallback-58", "You'd have to stop the world", ["all", "pop", "sad", "viral", "2020s", "2024"]],
  ["lyrics-i-had-some-help", "fallback-59", "You thought I'd never do it", ["all", "pop", "party", "viral", "2020s", "2024"]],
  ["lyrics-seven-rings", "fallback-65", "I see it, I like it, I want it, I got it", ["all", "pop", "party", "confidence", "2010s", "2019"]],
  ["lyrics-one-last-time", "fallback-66", "So one last time, I need to be the one", ["all", "pop", "romantic", "sad", "2010s", "2015"]],
  ["lyrics-thank-u-next", "fallback-67", "Thank you, next", ["all", "pop", "confidence", "viral", "2010s", "2019"]],
  ["lyrics-positions", "fallback-68", "Heaven sent you to me", ["all", "pop", "romantic", "2020s", "2020"]],
  ["lyrics-no-tears-left-to-cry", "fallback-69", "I'm pickin' it up", ["all", "pop", "dance", "energy", "2010s", "2018"]],
  ["lyrics-woman", "fallback-70", "Let me be your woman", ["all", "pop", "confidence", "2020s", "2021"]],
  ["lyrics-kiss-me-more", "fallback-71", "Can you kiss me more?", ["all", "pop", "romantic", "viral", "2020s", "2021"]],
  ["lyrics-streets", "fallback-72", "I've been goin' through it", ["all", "rap", "sad", "2020s", "2021"]],
  ["lyrics-paint-the-town-red", "fallback-73", "Mmm, she's the devil", ["all", "rap", "dark", "viral", "2020s", "2023"]],
  ["lyrics-agora-hills", "fallback-74", "Kiss me out in the street", ["all", "rap", "romantic", "2020s", "2023"]],
  ["lyrics-say-so", "fallback-75", "Why don't you say so?", ["all", "pop", "dance", "viral", "2020s", "2020"]],
  ["lyrics-need-to-know", "fallback-76", "I need to know", ["all", "rap", "dark", "2020s", "2021"]],
  ["lyrics-you-right", "fallback-77", "I got a man, but I want you", ["all", "rap", "romantic", "2020s", "2021"]],
  ["lyrics-poker-face", "fallback-78", "Can't read my, can't read my", ["all", "pop", "dance", "party", "2000s", "2008"]],
  ["lyrics-just-dance", "fallback-79", "Just dance, gonna be okay", ["all", "pop", "dance", "party", "2000s", "2008"]],
  ["lyrics-bad-romance", "fallback-80", "I want your love", ["all", "pop", "dance", "dark", "2000s", "2009"]],
  ["lyrics-paparazzi", "fallback-81", "I'm your biggest fan", ["all", "pop", "romantic", "2000s", "2009"]],
  ["lyrics-shallow", "fallback-82", "I'm off the deep end", ["all", "pop", "romantic", "sad", "2010s", "2018"]],
  ["lyrics-abracadabra", "fallback-83", "Abracadabra, amor-ooh-na-na", ["all", "pop", "dance", "viral", "2020s", "2025"]],
  ["lyrics-always-remember-us-this-way", "fallback-84", "When the sun goes down", ["all", "pop", "romantic", "sad", "2010s", "2018"]],
  ["lyrics-telephone", "fallback-85", "Stop callin', stop callin'", ["all", "pop", "dance", "party", "2000s", "2010"]],
  ["lyrics-pl-ale-jazz", "polish-6", "Ale jazz, ale jazz", ["all", "polish", "pop", "party"]],
  ["lyrics-pl-szampan", "polish-7", "A ja mam w sobie szampan", ["all", "polish", "pop", "party"]],
  ["lyrics-pl-melodia", "polish-8", "To jest moja melodia", ["all", "polish", "pop"]],
  ["lyrics-pl-malomiast", "polish-14", "Małomiasteczkowy styl", ["all", "polish", "pop"]],
  ["lyrics-pl-nie-ma-fal", "polish-15", "Nie ma fal, nie ma fal", ["all", "polish", "pop"]],
  ["lyrics-pl-trojkaty", "polish-16", "Trójkąty i kwadraty", ["all", "polish", "pop"]],
  ["lyrics-pl-pastempomat", "polish-17", "W aucie mam pastempomat", ["all", "polish", "pop"]],
  ["lyrics-pl-deszcz", "polish-20", "Pada deszcz na betonie", ["all", "polish", "rap", "rain"]],
  ["lyrics-pl-nostalgia", "polish-21", "Nostalgia, nostalgia", ["all", "polish", "rap", "sad"]],
  ["lyrics-pl-candy", "polish-27", "To nie jest candy", ["all", "polish", "rap"]],
  ["lyrics-pl-patointeligencja", "polish-33", "Patointeligencja", ["all", "polish", "rap"]],
  ["lyrics-pl-szklanki", "polish-51", "Znowu pełne szklanki", ["all", "polish", "party", "pop"]],
  ["lyrics-pl-jezyk", "polish-57", "Jeżyk, jeżyk", ["all", "polish", "rap"]],
  ["lyrics-pl-molly", "polish-60", "Molly, Molly", ["all", "polish", "rap", "night"]],
  ["lyrics-pl-jestem-bogiem", "polish-62", "Jestem Bogiem, uświadom to sobie", ["all", "polish", "rap"]],
  ["lyrics-pl-zlote-bloki", "polish-65", "Złote bloki, złote bloki", ["all", "polish", "pop"]],
  ["lyrics-pl-hej-hej", "polish-67", "Hej hej, czy Ty wiesz", ["all", "polish", "pop"]],
  ["lyrics-pl-male-rzeczy", "polish-68", "Cieszmy się z małych rzeczy", ["all", "polish", "pop", "comfort"]],
  ["lyrics-pl-radio-hello", "polish-70", "Radio Hello", ["all", "polish", "party"]],
  ["lyrics-pl-dzaga", "polish-72", "Dżaga, Dżaga", ["all", "polish", "pop"]],
  ["lyrics-pl-nie-plakaj", "polish-74", "Nie płacz Ewka", ["all", "polish", "rock", "nostalgia"]],
  ["lyrics-pl-mniej-niz-zero", "polish-75", "Mniej niż zero", ["all", "polish", "rock", "nostalgia"]],
  ["lyrics-pl-dlugosc", "polish-77", "Długość dźwięku samotności", ["all", "polish", "rock", "sad"]],
  ["lyrics-pl-zanim-pojde", "polish-78", "Miłość to nie pluszowy miś", ["all", "polish", "rock", "sad"]],
  ["lyrics-pl-arahja", "polish-79", "Arahja, Arahja", ["all", "polish", "rock"]],
  ["lyrics-pl-gdy-nie-ma", "polish-80", "Gdy nie ma dzieci, to...", ["all", "polish", "party", "rock"]],
  ["lyrics-pl-kocham-cie", "polish-81", "Kocham Cię, kochanie moje", ["all", "polish", "romantic"]],
  ["lyrics-pl-poczatek", "polish-86", "Wynoszę się stąd", ["all", "polish", "pop", "motivation"]],
  ["lyrics-pl-solo", "polish-87", "I never needed you to be my hero", ["all", "polish", "pop", "viral"]],
  ["lyrics-pl-my-slowianie", "polish-90", "My Słowianie wiemy jak", ["all", "polish", "party"]],
  ["lyrics-pl-dzis", "polish-93", "Dziś późno pójdę spać", ["all", "polish", "cozy", "night"]],
  ["lyrics-pl-ostatni-raz", "polish-95", "Ostatni raz zatańczysz ze mną", ["all", "polish", "romantic"]],
  ["lyrics-pl-biala-armia", "polish-101", "Biała armia", ["all", "polish", "rock"]],
  ["lyrics-pl-dmuchawce", "polish-102", "Dmuchawce, latawce, wiatr", ["all", "polish", "nostalgia"]],
  ["lyrics-pl-jest-taki-dzien", "polish-103", "Jest taki dzień, bardzo ciepły", ["all", "polish", "christmas"]],
  ["lyrics-pl-baska", "polish-113", "Baśka miała fajny biust", ["all", "polish", "rock", "nostalgia"]],
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
    region: isMusicTrackInRegion(track, "polish") ? "polish" : "global",
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
    region: safeRegion(settings.region),
  };
}

function eligibleLyrics(category = "all", region = "global") {
  const regional = lyricBank.filter(item => item.region === safeRegion(region));
  const selected = regional.filter(item => category === "all" || item.categories.includes(category));
  return selected.length >= 2 ? selected : regional;
}

function pickLyric(usedIds = [], category = "all", region = "global") {
  const pool = eligibleLyrics(category, region);
  const unused = pool.filter(item => !usedIds.includes(item.id));
  const source = unused.length ? unused : pool;
  return source[Math.floor(Math.random() * source.length)] || pool[0] || null;
}

function cutPoint(line) {
  const length = [...String(line || "")].length;
  const chars = [...String(line || "")];
  const allBoundaries = [];
  for (let index = 1; index < chars.length; index += 1) {
    if (/\s/.test(chars[index - 1]) && !/\s/.test(chars[index])) allBoundaries.push(index);
  }
  if (length < 8) return allBoundaries[0] || Math.max(1, Math.floor(length / 2));
  const min = Math.max(3, Math.floor(length * .32));
  const max = Math.max(min + 1, Math.ceil(length * .64));
  // Urywamy między słowami, żeby odpowiedź była naturalną kontynuacją,
  // a nie przypadkową połową słowa. Jeśli krótki wers nie ma dogodnego
  // miejsca, zostawiamy bezpieczny punkt z dotychczasowego zakresu.
  const boundaries = [];
  for (let index = min; index <= Math.min(max, chars.length - 2); index += 1) {
    if (chars[index - 1] === " " || chars[index] === " ") boundaries.push(index + (chars[index] === " " ? 1 : 0));
  }
  const candidates = boundaries.filter(index => index > 1 && index < chars.length - 1);
  if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
  const nearest = allBoundaries.filter(index => index > 1 && index < chars.length - 1).sort((a, b) => Math.abs(a - (min + max) / 2) - Math.abs(b - (min + max) / 2))[0];
  if (nearest) return nearest;
  return Math.min(chars.length - 1, min + Math.floor(Math.random() * (max - min + 1)));
}

function startLyricsRound(game, settings) {
  const usedIds = unique(game.usedIds);
  const item = pickLyric(usedIds, settings.category, settings.region);
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

function matchingLetters(expected, actual) {
  // LCS utrzymuje kolejność liter, ale nie zeruje całej odpowiedzi przez
  // pojedynczą literówkę albo brakujący znak na początku. Interpunkcja,
  // spacje i tak są wcześniej usuwane przez normalizeLetters().
  const target = [...expected], typed = [...actual];
  let previous = new Array(typed.length + 1).fill(0);
  for (const letter of target) {
    const current = new Array(typed.length + 1).fill(0);
    for (let index = 1; index <= typed.length; index += 1) {
      current[index] = letter === typed[index - 1]
        ? previous[index - 1] + 1
        : Math.max(previous[index], current[index - 1]);
    }
    previous = current;
  }
  return previous[typed.length] || 0;
}

function gradeAnswer(game, text) {
  const expected = normalizeLetters(expectedAnswer(game));
  const actual = normalizeLetters(text);
  if (!expected) return { accuracy: 0, correctLetters: 0, totalLetters: 0, points: 0 };
  const correctLetters = matchingLetters(expected, actual);
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
    region: safe.region,
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
    startLyricsRound(game, { ...safe, category:game.category || safe.category, region:game.region || safe.region });
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
    if (game.region !== safe.region) { game.region = safe.region; changed = true; }
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

function lyricWords(line) {
  const chars = [...String(line || "")], words = [];
  let start = -1;
  chars.forEach((char, index) => {
    if (!/\s/.test(char) && start < 0) start = index;
    const isLast = index === chars.length - 1;
    if (start >= 0 && (isLast || /\s/.test(chars[index + 1]))) {
      const text = chars.slice(start, index + 1).join("");
      const normalized = normalizeLetters(text);
      const syllables = normalized.match(/[aeiouy]+/g)?.length || 1;
      words.push({ text, start, end: index + 1, weight: Math.max(1, syllables * 1.35 + normalized.length * .06) });
      start = -1;
    }
  });
  return words;
}

function visibleLyricWords(words, cutAt, revealedChars) {
  const playable = words.map((word, index) => ({ word, index })).filter(({ word }) => word.end <= cutAt);
  if (!playable.length) return new Set();
  const totalWeight = playable.reduce((sum, { word }) => sum + word.weight, 0);
  const progress = Math.max(0, Math.min(1, Number(revealedChars) / Math.max(1, cutAt)));
  const targetWeight = totalWeight * progress;
  let consumed = 0;
  const visible = new Set();
  playable.forEach(({ word, index }) => {
    consumed += word.weight;
    if (progress >= 1 || consumed <= targetWeight) visible.add(index);
  });
  return visible;
}

function karaokeStage(line, revealCount, cutAt, phase = "listening") {
  const chars = [...String(line || "")];
  const safeCut = Math.max(1, Math.min(Math.max(1, chars.length - 1), Number(cutAt) || 1));
  const shown = phase === "listening" ? Math.min(safeCut, Math.max(0, Number(revealCount) || 0)) : safeCut;
  const words = lyricWords(line);
  const visibleWords = visibleLyricWords(words, safeCut, shown);
  let currentIndex = -1;
  visibleWords.forEach(index => { currentIndex = index; });
  const rendered = words.map(word => {
    const index = words.indexOf(word);
    const visible = phase !== "listening" ? word.end <= safeCut : visibleWords.has(index);
    return `<span class="lyrics-karaoke-word ${visible ? "lyrics-word-visible" : "lyrics-word-blank"} ${visible && index === currentIndex ? "lyrics-karaoke-word-current" : ""}" data-lyrics-word aria-hidden="${visible ? "false" : "true"}">${visible ? escapeHtml(word.text) : ""}</span>`;
  }).join(" ");
  return `<span class="lyrics-karaoke-lines${phase === "listening" ? "" : " is-paused"}" data-lyrics-reveal data-lyrics-cut="${safeCut}" data-lyrics-revealed="${shown}"><span class="lyrics-line lyrics-karaoke-line">${rendered}</span></span>`;
}

function revealedCount(game, now = Date.now(), audioTime = undefined) {
  const line = lyricById(game?.lyricId)?.line || "";
  const cutAt = Math.max(1, Math.min([...line].length - 1, Number(game?.cutAt) || 1));
  if ((game?.phase || game?.status) !== "listening") return cutAt;
  const duration = Math.max(1, Number(game?.audioSeconds) || lyricsDefaults.audioSeconds) * 1000;
  const elapsed = Number.isFinite(Number(audioTime))
    ? Math.max(0, Math.min(duration, Number(audioTime) * 1000))
    : !Number(game?.revealStartedAt)
      ? 0
      : Math.max(0, Math.min(duration, now - Number(game?.revealStartedAt || now)));
  return Math.max(0, Math.min(cutAt, Math.floor((elapsed / duration) * cutAt)));
}

function updateLyricsKaraokeStage(root, game, phase = "listening", audioTime = undefined) {
  if (!root || phase !== "listening") return;
  const line = lyricById(game?.lyricId)?.line || "";
  const chars = [...line];
  const words = lyricWords(line);
  const cutAt = Math.max(1, Math.min(Math.max(1, chars.length - 1), Number(game?.cutAt) || 1));
  const stage = root.querySelector("[data-lyrics-reveal]");
  if (!stage) return;
  const shown = revealedCount(game, Date.now(), audioTime);
  const previousShown = Number(stage.dataset.lyricsRevealed);
  const stableShown = Number.isFinite(previousShown) ? Math.max(previousShown, shown) : shown;
  const visibleWords = visibleLyricWords(words, cutAt, stableShown);
  let currentIndex = -1;
  visibleWords.forEach(index => { currentIndex = index; });
  const wordNodes = [...stage.querySelectorAll(".lyrics-karaoke-line .lyrics-karaoke-word")];
  wordNodes.forEach((node, index) => {
    const word = words[index];
    const visible = Boolean(word && visibleWords.has(index));
    node.classList.toggle("lyrics-word-visible", visible);
    node.classList.toggle("lyrics-word-blank", !visible);
    node.classList.toggle("lyrics-karaoke-word-current", visible && index === currentIndex);
    node.setAttribute("aria-hidden", String(!visible));
    node.textContent = visible ? word.text : "";
  });
  stage.dataset.lyricsRevealed = String(stableShown);
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
    : `<form class="lyrics-answer-form" data-lyrics-answer-form><label for="lyrics-answer">Brakujący fragment</label><div><input id="lyrics-answer" name="answer" maxlength="180" autocomplete="off" placeholder="Wpisz brakujące słowa…" required><button class="primary" type="submit">Zatwierdź</button></div><small>Wpisz brakujące słowa. Liczy się każda poprawna litera — interpunkcja nie ma znaczenia.</small></form>`;
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
    if (game.phase === "listening" && root.querySelector("[data-lyrics-audio]")?.dataset.lyricsSyncActive !== "1") {
      updateLyricsKaraokeStage(root, game, "listening");
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
    audio.dataset.lyricsSyncActive = "1";
    updateLyricsKaraokeStage(root, game, "listening", audio.currentTime);
    if (onStarted && audio.dataset.lyricsPlayStarted !== "1") {
      audio.dataset.lyricsPlayStarted = "1";
      // Pierwszy start solo zapisuje moment rozpoczęcia i może odświeżyć ekran.
      // Po takim odświeżeniu powstaje nowy element <audio>, więc callback musi
      // potwierdzić, że stan faktycznie zmienił się pierwszy raz. Bez tego
      // przywrócone odtwarzanie uruchamiało nieskończoną pętlę renderów.
      const accepted = onStarted();
      if (accepted !== true) delete audio.dataset.lyricsPlayStarted;
    }
    const state = root.querySelector("[data-lyrics-audio-state]");
    if (state) state.textContent = "Słuchaj uważnie — fragment zaraz się zatrzyma.";
  };
  audio.addEventListener("play", started);
  audio.addEventListener("loadedmetadata", () => updateLyricsKaraokeStage(root, game, "listening", audio.currentTime));
  audio.addEventListener("timeupdate", () => {
    audio.dataset.lyricsSyncActive = "1";
    updateLyricsKaraokeStage(root, game, "listening", audio.currentTime);
    if (Number(audio.currentTime) >= Number(audio.dataset.trackPreviewLimit)) lock();
  });
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
    content += `<section class="lyrics-challenge listening">${trackHtml(item)}<div class="lyrics-progress"><span>Odsłuch fragmentu</span><b data-lyrics-countdown>${timer}s</b></div><div class="lyrics-text-stage" data-lyrics-stage>${karaokeStage(item.line, revealedCount(game), game.cutAt, "listening")}</div><div class="lyrics-audio-box"><audio data-lyrics-audio preload="auto" src="${escapeHtml(item.previewUrl || "")}"></audio><button class="ghost" type="button" data-lyrics-play ${item.previewUrl ? "" : "disabled"}>▶ Odtwórz fragment</button><span data-lyrics-audio-state>${item.previewUrl ? "Fragment włączy się automatycznie po wejściu." : "Brak dostępnego preview tego utworu."}</span></div><p class="lyrics-hint">Tekst pojawia się w rytmie odsłuchu. Audio i tekst zatrzymają się w tym samym miejscu — potem wpisujesz brakujące słowa.<small class="lyrics-sync-warning">⚠️ Synchronizacja jest orientacyjna — zależy od wybranego preview i nie zawsze pokrywa się idealnie z wokalem.</small></p></section>`;
  } else if (game.phase === "answering") {
    content += `<section class="lyrics-challenge answering">${trackHtml(item)}<div class="lyrics-progress"><span>Twoja odpowiedź</span><b data-lyrics-countdown>${timer}s</b></div><div class="lyrics-text-stage" data-lyrics-stage>${karaokeStage(item.line, game.cutAt, game.cutAt, "answering")}</div>${answerForm(game, currentUser)}</section>`;
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
    region: safeRegion(source.region),
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
  const item = pickLyric(state.usedIds, "all", state.region);
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
    correct: grade.accuracy >= .60,
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
  start(playerId, region = "global") {
    const owner = String(playerId || "guest");
    const previous = readLyricsSoloState(owner);
    lyricsSoloState = { playerId:owner, status:"listening", region:safeRegion(region), streak:0, best:Number(previous.best) || 0, round:1, lyricId:"", cutAt:1, usedIds:[], audioSeconds:SOLO_AUDIO_SECONDS, answerTime:SOLO_ANSWER_SECONDS, revealStartedAt:0, phaseEndsAt:0, lastResult:null };
    lyricsSoloOwner = owner;
    startLyricsSoloRound(lyricsSoloState);
    saveLyricsSoloState(lyricsSoloState);
    return lyricsSoloState;
  },
  setRegion(playerId, region) {
    const state = readLyricsSoloState(playerId);
    if (state.status !== "idle") return state;
    state.region = safeRegion(region);
    saveLyricsSoloState(state);
    return state;
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
    if (state.status === "listening" && root.querySelector("[data-lyrics-audio]")?.dataset.lyricsSyncActive !== "1") {
      updateLyricsKaraokeStage(root, state, "listening");
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
  const region = musicRegionOptions.find(([id]) => id === state.region) || musicRegionOptions[0];
  return `<p class="eyebrow">TRYB SOLO · ${region[1]} ${escapeHtml(region[2])}</p><div class="lyrics-solo-title-row"><div><h1>Dokończ tekst</h1><p class="muted">Posłuchaj początku, wpisz dalszy ciąg i zbuduj jak najdłuższą serię.</p></div><div class="lyrics-solo-streak"><small>STREAK</small><b>${Number(state.streak || 0)}</b></div></div>`;
}

function lyricsSoloRegionPicker(state) {
  return `<div class="lyrics-solo-region-picker" role="radiogroup" aria-label="Katalog utworów">${musicRegionOptions.map(([id, icon, label, description]) => `<button type="button" class="music-region-option ${state.region === id ? "is-selected" : ""}" data-lyrics-solo-region="${id}" aria-pressed="${state.region === id ? "true" : "false"}"><span class="music-region-option-icon">${icon}</span><span><b>${escapeHtml(label)}</b><small>${escapeHtml(description)}</small></span></button>`).join("")}</div>`;
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
    content += `<section class="lyrics-solo-start"><div class="lyrics-solo-icon">🎤</div><p class="eyebrow">SZYBKI SOLO RUN</p><h2>Ile fragmentów trafisz z rzędu?</h2><p class="muted">Najpierw słuchasz krótkiego preview. Potem tekst zatrzymuje się w konkretnym miejscu, a Ty wpisujesz jego dalszą część.</p>${lyricsSoloRegionPicker(state)}<div class="lyrics-solo-best"><span>🏆</span><div><small>TWÓJ REKORD</small><b>${Number(state.best || 0)} trafień</b></div></div><p class="lyrics-beta-note">⚠️ BETA: synchronizacja tekstu z wokalem jest orientacyjna i może nie zawsze być dokładna.</p><button class="primary big" id="lyrics-solo-start">Zacznij serię</button></section>`;
  } else if (state.status === "listening") {
    content += `<section class="lyrics-challenge listening lyrics-solo-challenge">${trackHtml(item)}<div class="lyrics-progress"><span>Odsłuch fragmentu</span><b data-lyrics-countdown>${timerLabel}</b></div><div class="lyrics-text-stage" data-lyrics-stage>${karaokeStage(item.line, revealedCount(state), state.cutAt, "listening")}</div><div class="lyrics-audio-box"><audio data-lyrics-audio preload="auto" src="${escapeHtml(item.previewUrl || "")}"></audio><button class="ghost" type="button" data-lyrics-play ${item.previewUrl ? "" : "disabled"}>▶ Odtwórz fragment</button><span data-lyrics-audio-state>${item.previewUrl ? "Kliknij, jeśli przeglądarka zablokuje automatyczny dźwięk." : "Brak dostępnego preview tego utworu."}</span></div><p class="lyrics-hint">Tekst startuje razem z odsłuchem. Po zatrzymaniu audio wpiszesz brakujące słowa.<small class="lyrics-sync-warning">⚠️ Synchronizacja jest orientacyjna — zależy od wybranego preview i nie zawsze pokrywa się idealnie z wokalem.</small></p></section>`;
  } else if (state.status === "answering") {
    content += `<section class="lyrics-challenge answering lyrics-solo-challenge">${trackHtml(item)}<div class="lyrics-progress"><span>Uzupełnij brakujący fragment</span><b data-lyrics-countdown>${timer}s</b></div><div class="lyrics-text-stage" data-lyrics-stage>${karaokeStage(item.line, state.cutAt, state.cutAt, "answering")}</div><form class="lyrics-answer-form" data-lyrics-solo-answer-form><label for="lyrics-solo-answer">Brakujący fragment</label><div><input id="lyrics-solo-answer" name="answer" maxlength="180" autocomplete="off" placeholder="Wpisz brakujące słowa…" required><button class="primary" type="submit">Zatwierdź</button></div><small>Liczy się każda poprawna litera — interpunkcja nie ma znaczenia.</small></form></section>`;
  } else {
    content += lyricsSoloResult(state);
  }
  root.innerHTML = `<main class="page music-page lyrics-page lyrics-solo-page enter"><div class="lyrics-solo-layout"><section class="panel music-panel lyrics-panel lyrics-solo-main">${content}<p class="popularity-snapshot-note">Solo ma osobny streak i osobny ranking — nie łączy się z „Kto ma więcej?”.</p></section>${lyricsSoloLeaderboard(accounts, playerId, state, profile, leaderboard)}</div><button id="lyrics-solo-home" class="ghost">Wróć do menu</button></main>`;
  root.querySelectorAll("[data-lyrics-solo-region]").forEach(button => button.addEventListener("click", () => actions.lyricsSoloRegion?.(button.dataset.lyricsSoloRegion)));
  root.querySelector("#lyrics-solo-start")?.addEventListener("click", () => actions.lyricsSoloStart(state.region));
  root.querySelector("#lyrics-solo-restart")?.addEventListener("click", () => actions.lyricsSoloStart(state.region));
  root.querySelector("#lyrics-solo-next")?.addEventListener("click", actions.lyricsSoloNext);
  root.querySelector("#lyrics-solo-stop")?.addEventListener("click", actions.lyricsSoloStop);
  root.querySelector("#lyrics-solo-menu")?.addEventListener("click", actions.goPlatform);
  root.querySelector("#lyrics-solo-home")?.addEventListener("click", actions.goPlatform);
  root.querySelector("[data-lyrics-solo-answer-form]")?.addEventListener("submit", event => { event.preventDefault(); const input = event.currentTarget.querySelector("input"); actions.lyricsSoloAnswer(input?.value || "", expected); });
  bindLyricsCoverFallbacks(root);
  if (state.status === "listening") bindLyricsAudio(root, state, `solo:${playerId}`, () => {
    const started = actions.lyricsSoloAudioStarted?.();
    if (started) {
      const liveState = LyricsSoloEngine.get(playerId);
      scheduleLyricsSoloTimer(root, liveState, actions, { phase: liveState.status, phaseEndsAt: liveState.phaseEndsAt });
    }
    return started;
  });
  scheduleLyricsSoloTimer(root, state, actions, expected);
}

export function renderLyricsLobbySettings(room, isHost) {
  const settings = sanitizeLyricsSettings(room.settings);
  const categoryOptions = musicCategories.map(([id, label, group]) => `<option value="${escapeHtml(id)}" ${settings.category === id ? "selected" : ""}>${escapeHtml(label)} · ${escapeHtml(group)}</option>`).join("");
  return `<div class="music-settings lyrics-settings">${musicRegionPicker(settings.region, "region", isHost, "lyrics")}<label class="setting-row"><span>Liczba rund</span><select data-lyrics-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 7, 10, 15, 20].map(value => `<option value="${value}" ${settings.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Długość fragmentu</span><select data-lyrics-setting="audioSeconds" ${isHost ? "" : "disabled"}>${[5, 8, 10, 12].map(value => `<option value="${value}" ${settings.audioSeconds === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label><label class="setting-row"><span>Czas na odpowiedź</span><select data-lyrics-setting="answerTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${settings.answerTime === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label><label class="setting-row"><span>Kategoria</span><select data-lyrics-setting="category" ${isHost ? "" : "disabled"}>${categoryOptions}</select></label><div class="lyrics-settings-note"><b>Jak to działa?</b><small>Najpierw słuchacie krótkiego preview. Po zatrzymaniu audio każdy wpisuje brakujący fragment. Wynik liczy się procentowo za poprawne litery.</small><small class="lyrics-beta-note">⚠️ Tryb beta: synchronizacja piosenka–tekst może być niedokładna.</small></div></div>`;
}
