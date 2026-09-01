import { escapeHtml } from "./utils.js?v=20260822-1";
import { Audio } from "./audio.js?v=20260901-3";

export const musicDuelDefaults = { rounds: 5, selectionTime: 30, votingTime: 25, category: "all" };
export const musicArenaDefaults = { rounds: 10, selectionTime: 30, votingTime: 25, category: "all" };
const MUSIC_LISTENING_SECONDS = 60;
const MUSIC_SKIP_AFTER_SECONDS = 10;

// The category list is intentionally much broader than a normal select menu.
// Positive/party prompts are the majority, with years, genres and darker
// moods mixed in so the game does not turn into the same four prompts.
export const musicCategories = [
  ["all", "Wszystko", "Najpopularniejsze"],
  ["bangers", "Bangery wszech czasów", "Najpopularniejsze"],
  ["party", "Impreza, która wymknęła się spod kontroli", "Najpopularniejsze"],
  ["summer", "Letnie hity", "Najpopularniejsze"],
  ["roadtrip", "Muzyka na roadtrip", "Najpopularniejsze"],
  ["morning", "Dobry początek dnia", "Najpopularniejsze"],
  ["dance", "Do tańca bez wymówek", "Najpopularniejsze"],
  ["energy", "Energetyczne", "Najpopularniejsze"],
  ["motivation", "Motywacja do działania", "Najpopularniejsze"],
  ["gym", "Na siłownię", "Najpopularniejsze"],
  ["confidence", "Czuję się jak główny bohater", "Najpopularniejsze"],
  ["victory", "Muzyka po wygranej", "Najpopularniejsze"],
  ["singalong", "Do darcia się razem", "Najpopularniejsze"],
  ["nostalgia", "Nostalgia", "Najpopularniejsze"],
  ["comfort", "Comfort songs", "Najpopularniejsze"],
  ["chill", "Spokojny wieczór", "Nastroje"],
  ["sunset", "Zachód słońca", "Nastroje"],
  ["rain", "Deszcz za oknem", "Nastroje"],
  ["night", "Późna noc", "Nastroje"],
  ["cozy", "Koc, herbata i serial", "Nastroje"],
  ["romantic", "Romantyczne, ale bez cringu", "Nastroje"],
  ["crush", "Muzyka dla zauroczenia", "Nastroje"],
  ["breakup", "Po rozstaniu", "Nastroje"],
  ["sad", "Smutne, ale piękne", "Nastroje"],
  ["crying", "Do płakania w poduszkę", "Nastroje"],
  ["anger", "Kiedy wszystko wkurza", "Nastroje"],
  ["villain", "Czarny charakter wchodzi do sceny", "Nastroje"],
  ["dark", "Mroczny klimat", "Nastroje"],
  ["dramatic", "Przesadnie dramatyczne", "Nastroje"],
  ["chaos", "Totalny chaos", "Nastroje"],
  ["weird", "Dziwne, ale działa", "Nastroje"],
  ["guilty", "Guilty pleasure", "Nastroje"],
  ["worst", "Najgorszy możliwy wybór", "Nastroje"],
  ["meme", "Memy i internet", "Nastroje"],
  ["tiktok", "Hity z TikToka", "Internet i trendy"],
  ["viral", "Viralowe refreny", "Internet i trendy"],
  ["edit", "Muzyka do editów", "Internet i trendy"],
  ["gaming", "Gaming soundtrack", "Internet i trendy"],
  ["roblox", "Roblox vibes", "Internet i trendy"],
  ["minecraft", "Minecraftowe wspomnienia", "Internet i trendy"],
  ["anime", "Anime openingi i endingi", "Internet i trendy"],
  ["movie", "Filmowy hit", "Internet i trendy"],
  ["series", "Serialowy soundtrack", "Internet i trendy"],
  ["radio", "Jak z radia", "Internet i trendy"],
  ["pop", "Pop", "Gatunki"],
  ["rap", "Rap", "Gatunki"],
  ["polishRap", "Polski rap", "Gatunki"],
  ["hiphop", "Hip-hop i R&B", "Gatunki"],
  ["rock", "Rock", "Gatunki"],
  ["popRock", "Pop rock", "Gatunki"],
  ["metal", "Metal", "Gatunki"],
  ["indie", "Indie", "Gatunki"],
  ["alternative", "Alternatywne", "Gatunki"],
  ["punk", "Punk", "Gatunki"],
  ["electronic", "Elektroniczne", "Gatunki"],
  ["house", "House", "Gatunki"],
  ["techno", "Techno", "Gatunki"],
  ["drumAndBass", "Drum & bass", "Gatunki"],
  ["phonk", "Phonk", "Gatunki"],
  ["disco", "Disco", "Gatunki"],
  ["funk", "Funk", "Gatunki"],
  ["jazz", "Jazz", "Gatunki"],
  ["blues", "Blues", "Gatunki"],
  ["country", "Country", "Gatunki"],
  ["reggae", "Reggae", "Gatunki"],
  ["latin", "Latino", "Gatunki"],
  ["kpop", "K-pop", "Gatunki"],
  ["classical", "Klasyka", "Gatunki"],
  ["acoustic", "Akustyczne", "Gatunki"],
  ["instrumental", "Bez wokalu", "Gatunki"],
  ["oneHit", "One hit wonders", "Gatunki"],
  ["debut", "Najlepszy debiut", "Gatunki"],
  ["collab", "Najlepsza współpraca", "Gatunki"],
  ["female", "Kobiece wokale", "Wokale i wykonawcy"],
  ["male", "Męskie wokale", "Wokale i wykonawcy"],
  ["duets", "Duety", "Wokale i wykonawcy"],
  ["bands", "Zespoły", "Wokale i wykonawcy"],
  ["soloists", "Soliści", "Wokale i wykonawcy"],
  ["polish", "Polskie piosenki", "Wokale i wykonawcy"],
  ["english", "Anglojęzyczne", "Wokale i wykonawcy"],
  ["international", "Międzynarodowe", "Wokale i wykonawcy"],
  ["live", "Wersja live", "Wokale i wykonawcy"],
  ["cover", "Lepszy cover niż oryginał", "Wokale i wykonawcy"],
  ["soundtrack", "Soundtrack życia", "Pomysły"],
  ["opening", "Czołówka, której nie skipujesz", "Pomysły"],
  ["endCredits", "Napisy końcowe", "Pomysły"],
  ["bossFight", "Walka z bossem", "Pomysły"],
  ["finalBattle", "Finał sezonu", "Pomysły"],
  ["firstDate", "Pierwsza randka", "Pomysły"],
  ["wedding", "Wesele", "Pomysły"],
  ["birthday", "Urodziny", "Pomysły"],
  ["holiday", "Wakacje", "Pomysły"],
  ["christmas", "Święta nadchodzą", "Pomysły"],
  ["newYear", "Sylwester", "Pomysły"],
  ["school", "Szkolne wspomnienia", "Pomysły"],
  ["work", "Do pracy albo nauki", "Pomysły"],
  ["cleaning", "Sprzątanie pokoju", "Pomysły"],
  ["sleep", "Do zasypiania", "Pomysły"],
  ["midnight", "Słuchane o północy", "Pomysły"],
  ["2020s", "Hity lat 2020–2025", "Roczniki"],
  ["2025", "Hity 2025", "Roczniki"],
  ["2024", "Hity 2024", "Roczniki"],
  ["2023", "Hity 2023", "Roczniki"],
  ["2022", "Hity 2022", "Roczniki"],
  ["2021", "Hity 2021", "Roczniki"],
  ["2020", "Hity 2020", "Roczniki"],
  ["2010s", "Hity lat 2010–2019", "Roczniki"],
  ["2019", "Hity 2019", "Roczniki"],
  ["2018", "Hity 2018", "Roczniki"],
  ["2017", "Hity 2017", "Roczniki"],
  ["2016", "Hity 2016", "Roczniki"],
  ["2015", "Hity 2015", "Roczniki"],
  ["2014", "Hity 2014", "Roczniki"],
  ["2013", "Hity 2013", "Roczniki"],
  ["2012", "Hity 2012", "Roczniki"],
  ["2011", "Hity 2011", "Roczniki"],
  ["2000s", "Hity lat 2000–2009", "Roczniki"],
  ["2009", "Hity 2009", "Roczniki"],
  ["2008", "Hity 2008", "Roczniki"],
  ["2007", "Hity 2007", "Roczniki"],
  ["2006", "Hity 2006", "Roczniki"],
  ["2005", "Hity 2005", "Roczniki"],
  ["2004", "Hity 2004", "Roczniki"],
  ["2003", "Hity 2003", "Roczniki"],
  ["2002", "Hity 2002", "Roczniki"],
  ["2001", "Hity 2001", "Roczniki"],
  ["2000", "Hity 2000", "Roczniki"],
  ["1990s", "Hity lat 90.", "Roczniki"],
  ["1980s", "Hity lat 80.", "Roczniki"],
  ["1970s", "Hity lat 70.", "Roczniki"],
  ["oldies", "Klasyki, które się nie starzeją", "Roczniki"],
  ["throwback", "Throwback", "Roczniki"],
  ["retro", "Retro", "Roczniki"],
];

const categoryIds = new Set(musicCategories.map(([id]) => id));
const categoryLabel = id => musicCategories.find(item => item[0] === id)?.[1] || "Wszystko";
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = value => Array.isArray(value) ? value : [];
const clamp = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
const clean = (value, max = 180) => String(value || "").trim().slice(0, max);
const deadline = seconds => Date.now() + Math.max(5, Number(seconds) || 30) * 1000;
const shuffled = list => [...list].sort(() => Math.random() - 0.5);
const nick = (accounts, uid) => accounts?.[uid]?.nick || (String(uid).startsWith("bot:") ? "Bot" : "Gracz");
const same = (left, right) => String(left || "").trim().toLocaleLowerCase("pl-PL") === String(right || "").trim().toLocaleLowerCase("pl-PL");

const fallbackTrackNames = [
  ["Blinding Lights", "The Weeknd"], ["As It Was", "Harry Styles"], ["Levitating", "Dua Lipa"],
  ["Flowers", "Miley Cyrus"], ["Shape of You", "Ed Sheeran"], ["Bad Guy", "Billie Eilish"],
  ["Wake Me Up", "Avicii"], ["Mr. Brightside", "The Killers"], ["Believer", "Imagine Dragons"],
  ["One More Time", "Daft Punk"], ["Rolling in the Deep", "Adele"], ["Uptown Funk", "Mark Ronson"],
  ["Houdini", "Dua Lipa"], ["Starboy", "The Weeknd"], ["Cruel Summer", "Taylor Swift"],
];

// Boty korzystają z lokalnego katalogu, więc musimy przechowywać w nim te
// same publiczne assety, które normalnie zwraca wyszukiwarka iTunes.
// Dzięki temu bot nie pokazuje pustej karty nawet bez wcześniejszego searchu.
const fallbackTrackAssets = [
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/b4/8f/17b48f9a-0b93-6bb8-fe1d-3a16623c2cfb/mzaf_9560252727299052414.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/10/16/67101606-3869-ca44-6c03-e13d6322cb51/mzaf_1135399237022217274.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/67/ff/8c67ff91-31c3-3fef-1884-ce3ec89f3af4/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/9e/f7/689ef7fe-14fe-a846-c87f-7d3b2d6344b1/mzaf_4167137058064023087.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/c7/4f/44c74f0d-72dc-6143-d4d0-ba14d661ca0d/mzaf_9566898362556366703.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1a/37/d1/1a37d1b1-8508-54f2-f541-bf4e437dda76/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/87/1f/c3871f7e-3260-d615-1c66-5fdca2c3a48f/mzaf_10721331211699880949.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4d/50/b8/4d50b864-b336-7616-a422-50e18f04022c/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/65/b9/b0/65b9b0a0-530c-0137-9462-b6672e944b53/mzaf_1369429484595404848.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/43/a2/e7/43a2e738-d879-19ca-8590-d3553087cb00/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b2/1a/e8/b21ae8eb-9d11-2aaf-cc48-0e8ca210c485/mzaf_18420207698003017244.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c0/3f/36/c03f367a-b66b-fd0a-a54c-30f8250c4410/mzaf_12768434238801682952.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/fd/4a/77/fd4a77db-0ebc-d043-41a2-f32fa1bb0fb4/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5d/93/d8/5d93d83f-ad1e-da4d-1d79-9937bdff24ec/mzaf_14396932211949300852.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f8/df/0a/f8df0ac9-ae76-9dae-86d3-4e913fc54fb1/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/84/ab/e5/84abe549-c9d6-3de2-cdd0-90e9256a637e/mzaf_7958095177960014950.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7e/30/c5/7e30c572-aa47-5f7b-c6fd-42d50cd2c56d/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b9/96/2c/b9962c79-3662-235c-e55d-6c4b41457499/mzaf_18075623088273148288.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/dd/af/ea/ddafeab5-797a-5b6f-7735-f96c537b45e0/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2c/da/b5/2cdab5c6-04a8-5231-c697-00101e876479/mzaf_5586859405346659517.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/71/d6/1171d6ad-3c96-e027-2af6-58028426588c/mzaf_15137631797407745471.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/af/81/44af8168-9609-1b85-5048-ada08dceacf/mzaf_1341699644335558812.plus.aac.p.m4a"],
];

const fallbackTracks = fallbackTrackNames.map(([title, artist], index) => {
  const [coverUrl = "", previewUrl = ""] = fallbackTrackAssets[index] || [];
  return { id:`fallback-${index}`, title, artist, coverUrl, previewUrl, externalUrl:`https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`, provider:"preview" };
});

function normalizeTrack(track) {
  if (!track || typeof track !== "object") return null;
  const title = clean(track.title || track.trackName, 100), artist = clean(track.artist || track.artistName, 100);
  if (!title || !artist) return null;
  const id = clean(track.id || track.trackId || `${artist}-${title}`, 120);
  const fallback = fallbackTracks.find(item => item.id === id || (item.title === title && item.artist === artist)) || {};
  const query = encodeURIComponent(`${artist} ${title}`);
  return {
    id,
    title,
    artist,
    album: clean(track.album || track.collectionName || fallback.album, 100),
    coverUrl: clean(track.coverUrl || track.artworkUrl100 || fallback.coverUrl, 500),
    previewUrl: clean(track.previewUrl || fallback.previewUrl, 500),
    externalUrl: clean(track.externalUrl || track.trackViewUrl || fallback.externalUrl || `https://open.spotify.com/search/${query}`, 500),
    spotifyUrl: clean(track.spotifyUrl || `https://open.spotify.com/search/${query}`, 500),
    provider: clean(track.provider || fallback.provider || "preview", 30),
  };
}

export async function searchMusicTracks(query) {
  const value = clean(query, 100);
  if (value.length < 2) return [];
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(value)}&entity=song&limit=8&country=PL`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("search failed");
    const data = await response.json();
    const tracks = array(data?.results).map(item => normalizeTrack({ ...item, provider:"preview" })).filter(Boolean);
    if (tracks.length) return tracks;
  } catch {}
  return fallbackTracks.filter(track => `${track.title} ${track.artist}`.toLocaleLowerCase("pl-PL").includes(value.toLocaleLowerCase("pl-PL"))).slice(0, 8);
}

export function sanitizeMusicDuelSettings(settings = {}) {
  return { rounds:clamp(settings.rounds, 1, 20, 5), selectionTime:clamp(settings.selectionTime ?? settings.answerTime, 10, 90, 30), votingTime:clamp(settings.votingTime, 10, 90, 25), category:categoryIds.has(settings.category) ? settings.category : "all" };
}

export function sanitizeMusicArenaSettings(settings = {}) {
  return { rounds:clamp(settings.rounds, 1, 100, 10), selectionTime:clamp(settings.selectionTime ?? settings.answerTime, 10, 90, 30), votingTime:clamp(settings.votingTime, 10, 90, 25), category:categoryIds.has(settings.category) ? settings.category : "all" };
}

function validPlayers(players, min) {
  return [...new Set(array(players).map(String))].filter(Boolean).slice(0, 100).length >= min;
}

function trackForRound(track, fallbackIndex = 0) {
  return normalizeTrack(track) || { ...fallbackTracks[fallbackIndex % fallbackTracks.length] };
}

function trackPool(game) {
  const used = new Set(array(game.usedTracks));
  const choices = fallbackTracks.filter(track => !used.has(track.id));
  return choices.length ? choices : fallbackTracks;
}

function botTrackScore(track) {
  const index = fallbackTracks.findIndex(item => item.id === track?.id || (item.title === track?.title && item.artist === track?.artist));
  // The fallback catalog is ordered from the most recognisable songs to the
  // more niche ones. Real search results stay usable too, just with a neutral
  // score instead of being treated as automatically better.
  return index < 0 ? 8 : fallbackTracks.length - index;
}

function botTrackChoice(game, difficulty = "normal") {
  const available = trackPool(game);
  if (!available.length) return trackForRound(null);
  const ranked = [...available].sort((first, second) => botTrackScore(second) - botTrackScore(first));
  const count = difficulty === "expert" ? 3 : difficulty === "hard" ? 5 : difficulty === "normal" ? 8 : ranked.length;
  const pool = ranked.slice(0, Math.max(1, Math.min(ranked.length, count)));
  return trackForRound(pool[Math.floor(Math.random() * pool.length)]);
}

function botVoteChoice(game, uid, difficulty = "normal", arena = false) {
  const entries = Object.entries(game.submissions || {}).filter(([, track]) => track);
  if (!entries.length) return "";
  const withoutOwn = entries.filter(([owner]) => owner !== uid);
  const eligible = !arena && withoutOwn.length ? withoutOwn : entries;
  const ranked = [...eligible].sort(([, first], [, second]) => botTrackScore(second) - botTrackScore(first));
  const count = difficulty === "expert" ? 2 : difficulty === "hard" ? 3 : difficulty === "normal" ? 4 : ranked.length;
  const pool = ranked.slice(0, Math.max(1, Math.min(ranked.length, count)));
  return pool[Math.floor(Math.random() * pool.length)]?.[0] || eligible[0]?.[0] || "";
}

function startDuelVoting(game, settings) {
  game.phase = "voting";
  game.votes = {};
  game.phaseEndsAt = deadline(settings.votingTime);
}

function startDuelListening(game) {
  game.phase = "listening";
  game.listeningStartedAt = Date.now();
  game.skipAvailableAt = game.listeningStartedAt + MUSIC_SKIP_AFTER_SECONDS * 1000;
  game.skipRequests = {};
  game.phaseEndsAt = game.listeningStartedAt + MUSIC_LISTENING_SECONDS * 1000;
}

function resolveDuelVoting(game) {
  const submissions = object(game.submissions), votes = object(game.votes), counts = {};
  Object.values(votes).forEach(uid => { if (uid in submissions && submissions[uid]) counts[uid] = (counts[uid] || 0) + 1; });
  const max = Math.max(0, ...Object.values(counts).map(Number));
  const winners = max > 0 ? Object.keys(counts).filter(uid => Number(counts[uid]) === max) : [];
  game.scores = object(game.scores);
  winners.forEach(uid => { game.scores[uid] = Number(game.scores[uid] || 0) + 1; });
  game.roundResult = { round:game.round, submissions:{...submissions}, votes:{...votes}, voteCounts:counts, winners };
  game.phase = "roundResult";
  game.phaseEndsAt = Date.now() + 7000;
}

export function createMusicDuelGame(players, settings = {}) {
  const s = sanitizeMusicDuelSettings(settings), list = array(players).slice(0, 8);
  const game = { mode:"muzyczny-pojedynek", phase:"selecting", round:1, totalRounds:s.rounds, players:list, category:s.category, submissions:{}, votes:{}, scores:Object.fromEntries(list.map(uid => [uid, 0])), usedTracks:[], roundResult:null, finished:false, phaseEndsAt:deadline(s.selectionTime) };
  return game;
}

export const MusicDuelEngine = {
  select(game, uid, track, settings = {}) {
    if (game.phase !== "selecting") return "Wybór utworu jest już zamknięty.";
    if (!array(game.players).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    game.submissions = object(game.submissions);
    if (uid in game.submissions) return "Twój utwór jest już zapisany.";
    const cleanTrack = normalizeTrack(track);
    if (!cleanTrack) return "Wybierz utwór z wyników wyszukiwania.";
    game.submissions[uid] = cleanTrack;
    game.usedTracks = [...new Set([...array(game.usedTracks), cleanTrack.id])].slice(-100);
    if (game.players.every(player => player in game.submissions)) startDuelListening(game);
  },
  vote(game, uid, target) {
    if (game.phase !== "voting") return "Głosowanie jest już zakończone.";
    if (!array(game.players).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    if (!(target in object(game.submissions)) || !game.submissions[target]) return "Ten utwór nie ma poprawnej propozycji.";
    game.votes = object(game.votes);
    if (uid in game.votes) return "Twój głos jest już zapisany.";
    game.votes[uid] = target;
    if (game.players.every(player => player in game.votes)) resolveDuelVoting(game);
  },
  skip(game, uid, settings = {}) {
    if (game.phase !== "listening") return "Głosowanie rozpocznie się po odsłuchu.";
    if (!array(game.players).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    if (Date.now() < Number(game.skipAvailableAt || 0)) return `Możecie pominąć odsłuch dopiero po ${MUSIC_SKIP_AFTER_SECONDS} sekundach.`;
    game.skipRequests = object(game.skipRequests);
    game.skipRequests[uid] = true;
    if (game.players.every(player => game.skipRequests[player])) startDuelVoting(game, sanitizeMusicDuelSettings(settings));
  },
  timeout(game, settings = {}) {
    if (game.phase === "selecting") {
      game.submissions = object(game.submissions);
      game.players.forEach((uid, index) => { if (!(uid in game.submissions)) game.submissions[uid] = null; });
      startDuelListening(game);
    } else if (game.phase === "listening") {
      startDuelVoting(game, sanitizeMusicDuelSettings(settings));
    } else if (game.phase === "voting") resolveDuelVoting(game);
  },
  nextRound(game, settings = {}) {
    if (game.phase !== "roundResult") return "Podsumowanie rundy nie jest jeszcze gotowe.";
    const s = sanitizeMusicDuelSettings(settings);
    if (Number(game.round) >= Number(game.totalRounds || s.rounds)) { game.phase = "gameSummary"; game.finished = true; game.phaseEndsAt = null; return; }
    game.round += 1; game.submissions = {}; game.votes = {}; game.skipRequests = {}; game.roundResult = null; game.phase = "selecting"; game.phaseEndsAt = deadline(s.selectionTime);
  },
  botTrack(game, uid, difficulty = "normal") {
    return botTrackChoice(game, difficulty);
  },
  botVote(game, uid, difficulty = "normal") {
    return botVoteChoice(game, uid, difficulty);
  },
};

function weightedPick(weights, excluded) {
  const entries = Object.entries(weights).filter(([uid]) => !excluded.has(uid));
  const total = entries.reduce((sum, [, weight]) => sum + Math.max(1, Number(weight) || 1), 0);
  let cursor = Math.random() * Math.max(1, total);
  for (const [uid, weight] of entries) { cursor -= Math.max(1, Number(weight) || 1); if (cursor <= 0) return uid; }
  return entries[entries.length - 1]?.[0] || "";
}

function chooseArenaDuelists(game) {
  const players = array(game.players), weights = object(game.selectionWeights), first = weightedPick(weights, new Set()), second = weightedPick(weights, new Set([first]));
  game.duelists = [first || players[0] || "", second || players.find(uid => uid !== first) || players[1] || ""].filter(Boolean);
}

function startArenaVoting(game, settings) {
  game.phase = "voting"; game.votes = {}; game.phaseEndsAt = deadline(settings.votingTime);
}

function startArenaListening(game) {
  game.phase = "listening";
  game.listeningStartedAt = Date.now();
  game.skipAvailableAt = game.listeningStartedAt + MUSIC_SKIP_AFTER_SECONDS * 1000;
  game.skipRequests = {};
  game.phaseEndsAt = game.listeningStartedAt + MUSIC_LISTENING_SECONDS * 1000;
}

function resolveArenaVoting(game) {
  const submissions = object(game.submissions), votes = object(game.votes), counts = {};
  Object.values(votes).forEach(uid => { if (uid in submissions && submissions[uid]) counts[uid] = (counts[uid] || 0) + 1; });
  const max = Math.max(0, ...Object.values(counts).map(Number));
  const winners = max > 0 ? Object.keys(counts).filter(uid => Number(counts[uid]) === max) : [];
  game.scores = object(game.scores); game.wins = object(game.wins);
  winners.forEach(uid => { game.scores[uid] = Number(game.scores[uid] || 0) + 1; game.wins[uid] = Number(game.wins[uid] || 0) + 1; });
  game.roundResult = { round:game.round, duelists:[...game.duelists], submissions:{...submissions}, votes:{...votes}, voteCounts:counts, winners };
  game.phase = "roundResult"; game.phaseEndsAt = Date.now() + 7000;
}

export function createMusicArenaGame(players, settings = {}) {
  const s = sanitizeMusicArenaSettings(settings), list = array(players).slice(0, 100), selectionWeights = Object.fromEntries(list.map(uid => [uid, 1]));
  const game = { mode:"muzyczna-arena", phase:"selecting", round:1, totalRounds:s.rounds, players:list, category:s.category, duelists:[], submissions:{}, votes:{}, scores:Object.fromEntries(list.map(uid => [uid, 0])), wins:Object.fromEntries(list.map(uid => [uid, 0])), selectionWeights, usedTracks:[], roundResult:null, finished:false, phaseEndsAt:deadline(s.selectionTime) };
  chooseArenaDuelists(game);
  return game;
}

export const MusicArenaEngine = {
  select(game, uid, track, settings = {}) {
    if (game.phase !== "selecting") return "Wybór utworu jest już zamknięty.";
    if (!array(game.duelists).includes(uid)) return "W tej rundzie wybrano innych graczy.";
    game.submissions = object(game.submissions);
    if (uid in game.submissions) return "Twój utwór jest już zapisany.";
    const cleanTrack = normalizeTrack(track);
    if (!cleanTrack) return "Wybierz utwór z wyników wyszukiwania.";
    game.submissions[uid] = cleanTrack;
    game.usedTracks = [...new Set([...array(game.usedTracks), cleanTrack.id])].slice(-100);
    if (game.duelists.every(player => player in game.submissions)) startArenaListening(game);
  },
  vote(game, uid, target) {
    if (game.phase !== "voting") return "Głosowanie jest już zakończone.";
    if (array(game.duelists).includes(uid) || !array(game.players).includes(uid)) return "Gracze wybierający utwór nie głosują w tej rundzie.";
    if (!(target in object(game.submissions)) || !game.submissions[target]) return "Ten utwór nie ma poprawnej propozycji.";
    game.votes = object(game.votes);
    if (uid in game.votes) return "Twój głos jest już zapisany.";
    game.votes[uid] = target;
    const voters = game.players.filter(player => !game.duelists.includes(player));
    if (voters.every(player => player in game.votes)) resolveArenaVoting(game);
  },
  skip(game, uid, settings = {}) {
    if (game.phase !== "listening") return "Głosowanie rozpocznie się po odsłuchu.";
    if (!array(game.duelists).includes(uid)) return "Tylko osoby wybierające utwór mogą zaakceptować pominięcie.";
    if (Date.now() < Number(game.skipAvailableAt || 0)) return `Możecie pominąć odsłuch dopiero po ${MUSIC_SKIP_AFTER_SECONDS} sekundach.`;
    game.skipRequests = object(game.skipRequests);
    game.skipRequests[uid] = true;
    if (game.duelists.every(player => game.skipRequests[player])) startArenaVoting(game, sanitizeMusicArenaSettings(settings));
  },
  timeout(game, settings = {}) {
    if (game.phase === "selecting") {
      game.submissions = object(game.submissions);
      game.duelists.forEach((uid, index) => { if (!(uid in game.submissions)) game.submissions[uid] = null; });
      startArenaListening(game);
    } else if (game.phase === "listening") {
      startArenaVoting(game, sanitizeMusicArenaSettings(settings));
    } else if (game.phase === "voting") resolveArenaVoting(game);
  },
  nextRound(game, settings = {}) {
    if (game.phase !== "roundResult") return "Podsumowanie rundy nie jest jeszcze gotowe.";
    const s = sanitizeMusicArenaSettings(settings);
    if (Number(game.round) >= Number(game.totalRounds || s.rounds)) { game.phase = "gameSummary"; game.finished = true; game.phaseEndsAt = null; return; }
    const selected = new Set(game.duelists || []);
    game.selectionWeights = Object.fromEntries(game.players.map(uid => [uid, selected.has(uid) ? 1 : Math.min(100, Math.max(1, Number(game.selectionWeights?.[uid] || 1) + 1))]));
    chooseArenaDuelists(game); game.round += 1; game.submissions = {}; game.votes = {}; game.skipRequests = {}; game.roundResult = null; game.phase = "selecting"; game.phaseEndsAt = deadline(s.selectionTime);
  },
  botTrack(game, uid, difficulty = "normal") {
    return botTrackChoice(game, difficulty);
  },
  botVote(game, uid, difficulty = "normal") {
    return botVoteChoice(game, uid, difficulty, true);
  },
};

function categoryOptions(selected) {
  let previous = "";
  return musicCategories.map(([id, label, group]) => {
    const optgroup = group !== previous ? `<optgroup label="${escapeHtml(group)}">` : "";
    previous = group;
    return `${optgroup}<option value="${escapeHtml(id)}" ${id === selected ? "selected" : ""}>${escapeHtml(label)}</option>${group !== musicCategories.find((item, index) => index > musicCategories.findIndex(item2 => item2[0] === id) && item[2] === group)?.[2] ? "</optgroup>" : ""}`;
  }).join("");
}

function categorySelect(selected, setting, isHost) {
  // A flat select is more usable than a huge grid on phones; optgroups still
  // make the large list scannable on desktop.
  const groups = [];
  musicCategories.forEach(([id, label, group]) => { let current = groups.find(item => item.label === group); if (!current) { current = { label:group, options:[] }; groups.push(current); } current.options.push(`<option value="${escapeHtml(id)}" ${id === selected ? "selected" : ""}>${escapeHtml(label)}</option>`); });
  return `<select data-music-setting="${setting}" ${isHost ? "" : "disabled"}>${groups.map(group => `<optgroup label="${escapeHtml(group.label)}">${group.options.join("")}</optgroup>`).join("")}</select>`;
}

export function renderMusicDuelLobbySettings(room, isHost) {
  const s = sanitizeMusicDuelSettings(room.settings);
  return `<div class="music-settings"><label class="setting-row"><span>Liczba rund</span><select data-music-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 7, 10, 15, 20].map(value => `<option value="${value}" ${s.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na wybór utworu</span><select data-music-setting="selectionTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${s.selectionTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><div class="music-fixed-listening"><b>Odsłuch rundy · 60 s</b><small>Stałe 30 sekund na każdy z dwóch podglądów. Tego czasu nie zmienia preset.</small></div><label class="setting-row"><span>Czas głosowania</span><select data-music-setting="votingTime" ${isHost ? "" : "disabled"}>${[15, 25, 30, 45, 60].map(value => `<option value="${value}" ${s.votingTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Kategoria</span>${categorySelect(s.category, "category", isHost)}</label><p class="tiny">Każdy wyszukuje i wybiera jeden utwór. Potem słuchacie propozycji i głosujecie na najlepszą.</p></div>`;
}

export function renderMusicArenaLobbySettings(room, isHost) {
  const s = sanitizeMusicArenaSettings(room.settings);
  return `<div class="music-settings"><label class="setting-row"><span>Liczba rund</span><select data-music-setting="rounds" ${isHost ? "" : "disabled"}>${[10, 20, 30, 50, 100].map(value => `<option value="${value}" ${s.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na wybór utworu</span><select data-music-setting="selectionTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${s.selectionTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><div class="music-fixed-listening"><b>Odsłuch rundy · 60 s</b><small>Oba wybrane podglądy mają po 30 sekund. Pominięcie wymaga zgody obu autorów po 10 sekundach.</small></div><label class="setting-row"><span>Czas głosowania</span><select data-music-setting="votingTime" ${isHost ? "" : "disabled"}>${[15, 25, 30, 45, 60].map(value => `<option value="${value}" ${s.votingTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Kategoria</span>${categorySelect(s.category, "category", isHost)}</label><p class="tiny">W każdej rundzie losujemy dwóch graczy. Szanse osób niewylosowanych rosną, ale nikt nie jest całkiem wykluczony.</p></div>`;
}

function playerRows(game, accounts, field = "scores") {
  return [...array(game.players)].sort((a, b) => Number(game[field]?.[b] || 0) - Number(game[field]?.[a] || 0)).map((uid, index) => `<div class="music-ranking-row"><span>${index + 1}. ${escapeHtml(nick(accounts, uid))}</span><b>${Number(game[field]?.[uid] || 0)} pkt</b></div>`).join("");
}

function trackIdentity(track) {
  const normalized = normalizeTrack(track);
  return normalized ? `${normalized.title} — ${normalized.artist}` : "Brak propozycji";
}

function trackInfoHtml(track, extra = "") {
  const normalized = normalizeTrack(track);
  if (!normalized) return `<div class="music-no-track">Brak wybranego utworu</div>`;
  return `<div class="music-track-info">${normalized.coverUrl ? `<img src="${escapeHtml(normalized.coverUrl)}" alt="" loading="lazy">` : `<span class="music-cover-placeholder">♫</span>`}<div><b>${escapeHtml(normalized.title)}</b><small>${escapeHtml(normalized.artist)}${normalized.album ? ` · ${escapeHtml(normalized.album)}` : ""}</small></div>${extra}</div>`;
}

function trackSearchHtml() {
  return `<form class="music-track-search" data-music-search-form><div class="music-search-input-row"><input type="search" maxlength="100" autocomplete="off" placeholder="Wpisz tytuł albo wykonawcę…" required><button class="primary" type="submit">Szukaj</button></div><p class="tiny">Wybierz gotowy wynik — nie musisz kopiować żadnego linku.</p><div class="music-search-results" data-music-search-results></div></form>`;
}

function trackSearchResultsHtml(results) {
  return results.map((track, index) => `<button class="music-search-result" type="button" data-music-search-result="${index}">${trackInfoHtml(track)}<span>Wybierz</span></button>`).join("") || `<p class="muted">Nie znaleziono utworu. Spróbuj tytułu albo wykonawcy.</p>`;
}

const musicSearchStates = new Map();
function musicSearchStateKey(room, game, currentUser) {
  return `${room?.roomId || "local"}:${room?.gameMode || game?.mode || "music"}:${Number(game?.round || 1)}:${currentUser || "guest"}`;
}
function musicSearchStateFor(key) {
  if (!key) return { query:"", results:[], searched:false, pending:false, requestId:0 };
  let state = musicSearchStates.get(key);
  if (!state) {
    state = { query:"", results:[], searched:false, pending:false, requestId:0 };
    musicSearchStates.set(key, state);
  }
  return state;
}
function bindMusicSearchResults(results, found, onSelect, stateKey) {
  results.querySelectorAll("[data-music-search-result]").forEach(item => item.addEventListener("click", () => {
    const track = found[Number(item.dataset.musicSearchResult)];
    if (!track) return;
    const result = onSelect(track);
    const clear = value => { if (value !== false && stateKey) musicSearchStates.delete(stateKey); };
    if (result?.then) result.then(clear).catch(() => {});
    else clear(result);
  }));
}

function playlistHtml(submissions, accounts, { allowVote = false, currentUser = "", arena = false, namespace = "room" } = {}) {
  const entries = Object.entries(submissions || {}).filter(([, track]) => track);
  const playable = entries.find(([, track]) => track?.previewUrl) || entries[0];
  const firstIndex = playable ? Math.max(0, entries.findIndex(([uid]) => uid === playable[0])) : 0;
  const first = playable?.[1];
  const firstKey = first ? `music:${namespace}:${playable[0]}:${first.id || firstIndex}` : "";
  const player = first?.previewUrl ? `<audio data-music-preview data-track-audio controls preload="metadata" data-track-key="${escapeHtml(firstKey)}" src="${escapeHtml(first.previewUrl)}"></audio><p class="music-autoplay-note">Podglądy lecą po kolei. Jeśli przeglądarka zablokuje dźwięk, kliknij „Odtwórz”.</p>${Audio.trackVolumeControlHtml({ compact:true })}` : `<p class="music-no-preview">Brak dostępnego podglądu tego utworu. <a href="${escapeHtml(first?.spotifyUrl || first?.externalUrl || "#")}" target="_blank" rel="noreferrer">Otwórz w Spotify</a></p>${Audio.trackVolumeControlHtml({ compact:true })}`;
  return `<div class="music-playlist" data-music-playlist><div class="music-now-playing"><div><p class="eyebrow">TERAZ GRA</p><strong data-music-now-playing>${escapeHtml(first ? trackIdentity(first) : "Brak utworów")}</strong></div><span data-music-playlist-count>${first ? `${firstIndex + 1}/${entries.length}` : "0/0"}</span></div><div class="music-player" data-music-player>${player}</div><div class="music-song-list">${entries.map(([uid, track], index) => { const key = `music:${namespace}:${uid}:${track.id || index}`; return `<article class="music-song-card ${index === firstIndex ? "is-active" : ""}" data-music-track-card data-track-key="${escapeHtml(key)}" data-track-index="${index}" data-preview-url="${escapeHtml(track.previewUrl || "")}" data-external-url="${escapeHtml(track.spotifyUrl || track.externalUrl || "")}"><div class="music-song-card-head"><span class="music-song-number">${arena ? (index === 0 ? "A" : "B") : `#${index + 1}`}</span>${trackInfoHtml(track, `<small class="music-track-owner">${allowVote ? "" : escapeHtml(nick(accounts, uid))}</small>`)}</div><div class="music-song-card-actions"><button class="ghost" type="button" data-music-play-track>▶ Odtwórz</button>${allowVote ? `<button class="primary" type="button" data-music-vote="${escapeHtml(uid)}">Wybieram ten utwór</button>` : ""}</div></article>`; }).join("")}</div></div>`;
}

function bindTrackSearch(root, actions, onSelect, stateKey = "") {
  const form = root.querySelector("[data-music-search-form]"), results = root.querySelector("[data-music-search-results]");
  if (!form || !results) return;
  const state = musicSearchStateFor(stateKey);
  let found = Array.isArray(state.results) ? state.results : [];
  const input = form.querySelector("input"), button = form.querySelector("button");
  if (state.query && input) input.value = state.query;
  const renderSavedResults = () => {
    if (state.pending) {
      results.innerHTML = `<p class="muted">Wyszukiwanie utworów…</p>`;
      if (button) { button.disabled = true; button.textContent = "Szukam…"; }
      return;
    }
    if (!state.searched) return;
    results.innerHTML = trackSearchResultsHtml(found);
    bindMusicSearchResults(results, found, onSelect, stateKey);
  };
  renderSavedResults();
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const query = input?.value || "";
    state.query = query;
    state.searched = true;
    state.pending = true;
    const requestId = ++state.requestId;
    button.disabled = true; button.textContent = "Szukam…"; results.innerHTML = `<p class="muted">Wyszukiwanie utworów…</p>`;
    try {
      const nextFound = await actions.musicSearchTracks(query);
      if (state.requestId !== requestId) return;
      found = Array.isArray(nextFound) ? nextFound : [];
      state.results = found;
      state.pending = false;
      if (form.isConnected) {
        results.innerHTML = trackSearchResultsHtml(found);
        bindMusicSearchResults(results, found, onSelect, stateKey);
        button.disabled = false; button.textContent = "Szukaj";
      }
    } catch {
      if (state.requestId !== requestId) return;
      state.results = [];
      state.pending = false;
      if (form.isConnected) {
        results.innerHTML = trackSearchResultsHtml([]);
        button.disabled = false; button.textContent = "Szukaj";
      }
    }
  });
}

function bindMusicPlayback(root) {
  const playlist = root.querySelector("[data-music-playlist]");
  if (!playlist) return;
  const audio = playlist.querySelector("audio[data-music-preview]"), player = playlist.querySelector("[data-music-player]"), now = playlist.querySelector("[data-music-now-playing]"), counter = playlist.querySelector("[data-music-playlist-count]"), cards = [...playlist.querySelectorAll("[data-music-track-card]")];
  const syncPlaybackState = () => player?.classList.toggle("is-playing", Boolean(audio && !audio.paused));
  audio?.addEventListener("play", syncPlaybackState);
  audio?.addEventListener("pause", syncPlaybackState);
  audio?.addEventListener("ended", () => {
    syncPlaybackState();
    const currentIndex = cards.findIndex(card => card.dataset.trackKey === Audio.activeTrackKey);
    const next = cards.slice(Math.max(0, currentIndex) + 1).find(card => card.dataset.previewUrl);
    if (next) activate(next);
  });
  syncPlaybackState();
  const activate = (card, { autoplay = true } = {}) => {
    cards.forEach(item => item.classList.toggle("is-active", item === card));
    const index = Number(card.dataset.trackIndex) + 1;
    if (now) now.textContent = card.querySelector(".music-track-info b")?.textContent || "Utwór";
    if (counter) counter.textContent = `${index}/${cards.length}`;
    if (!audio || !card.dataset.previewUrl) return;
    if (audio.dataset.trackKey === card.dataset.trackKey && audio.currentSrc === card.dataset.previewUrl) {
      Audio.bindTrackAudio(audio, card.dataset.trackKey, { autoplay });
      return;
    }
    Audio.setTrackAudioSource(audio, card.dataset.trackKey, card.dataset.previewUrl, { autoplay });
  };
  cards.forEach(card => card.querySelector("[data-music-play-track]")?.addEventListener("click", () => {
    if (card.dataset.previewUrl) activate(card);
    else if (card.dataset.externalUrl) window.open(card.dataset.externalUrl, "_blank", "noopener,noreferrer");
  }));
  if (audio) {
    const preferred = cards.find(card => card.dataset.trackKey === Audio.activeTrackKey && card.dataset.previewUrl) || cards.find(card => card.dataset.previewUrl);
    if (preferred) activate(preferred);
  }
  Audio.bindTrackVolumeControls(playlist);
}

function scheduleTimer(game, actions, method, expected) {
  const endAt = Number(game.phaseEndsAt);
  if (!["selecting", "listening", "voting"].includes(game.phase) || !Number.isFinite(endAt) || endAt <= 0) return;
  const timerKey = `${method}:${game.phase}:${endAt}`;
  musicTimerKey = timerKey;
  const update = () => {
    if (musicTimerKey !== timerKey) return;
    const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    document.querySelectorAll("[data-music-countdown]").forEach(item => { item.textContent = `${left}s`; });
    if (left <= 0) {
      musicClockTimer = 0;
      musicTimer = window.setTimeout(() => {
        if (musicTimerKey !== timerKey) return;
        musicTimerKey = "";
        actions[method](expected);
      }, 50);
      return;
    }
    musicClockTimer = window.setTimeout(update, 250);
  };
  update();
}

let musicTimer = 0;
let musicClockTimer = 0;
let musicTimerKey = "";
let musicSkipUnlockTimer = 0;
let musicSkipUnlockKey = "";
export function stopMusicTimer() { window.clearTimeout(musicTimer); window.clearTimeout(musicClockTimer); musicTimer = 0; musicClockTimer = 0; musicTimerKey = ""; }

function musicHeader(game, title, accounts, arena = false) {
  return `<p class="eyebrow">${escapeHtml(title)} · RUNDA ${Math.min(Number(game.round || 1), Number(game.totalRounds || 1))}/${Number(game.totalRounds || 1)}</p><h1>${arena ? "Który utwór wygrywa?" : "Który numer bierze rundę?"}</h1><div class="music-category-banner"><span>🎵</span><div><small>KATEGORIA</small><strong>${escapeHtml(categoryLabel(game.category))}</strong></div></div>`;
}

function musicSkipPanel(game, currentUser, eligible) {
  const players = array(eligible), requests = object(game.skipRequests), requested = players.filter(uid => requests[uid]).length;
  const available = Date.now() >= Number(game.skipAvailableAt || 0);
  const ownRequest = Boolean(requests[currentUser]);
  const canRequest = players.includes(currentUser);
  const wait = Math.max(1, Math.ceil((Number(game.skipAvailableAt || 0) - Date.now()) / 1000));
  const agreementText = players.length === 2 ? "Obie osoby muszą potwierdzić." : "Wszyscy uczestnicy muszą potwierdzić.";
  const people = players.map(uid => { const value = String(uid); return `<span class="${requests[uid] ? "is-ready" : ""}">${escapeHtml(value === String(currentUser) ? "Ty" : value.startsWith("bot:") ? "Bot" : "Gracz")}${requests[uid] ? " ✓" : ""}</span>`; }).join("");
  return `<div class="music-skip-panel"><div><p class="eyebrow">WCZEŚNIEJSZE POMINIĘCIE</p><b>${requested}/${players.length} osób zgadza się na skip</b><small>Normalnie odsłuch trwa pełną minutę. ${agreementText}</small></div><div class="music-skip-people">${people}</div>${canRequest ? `<button class="ghost" type="button" data-music-skip ${!available || ownRequest ? "disabled" : ""}>${ownRequest ? "Zgoda zapisana" : available ? "Zgadzam się na skip" : `Dostępne za ${wait}s`}</button>` : `<small class="muted">Czekamy na zgodę wybranych graczy.</small>`}</div>`;
}

function bindMusicSkipAvailability(root, game) {
  const button = root.querySelector("[data-music-skip]");
  const remaining = Number(game.skipAvailableAt || 0) - Date.now();
  if (!button) return;
  if (remaining <= 0) {
    button.disabled = false;
    button.textContent = "Zgadzam się na skip";
    return;
  }
  const key = String(game.skipAvailableAt);
  if (musicSkipUnlockKey !== key) {
    window.clearTimeout(musicSkipUnlockTimer);
    musicSkipUnlockKey = key;
    musicSkipUnlockTimer = window.setTimeout(() => {
      musicSkipUnlockKey = "";
      document.querySelectorAll("[data-music-skip]").forEach(item => { item.disabled = false; item.textContent = "Zgadzam się na skip"; });
    }, remaining + 50);
  }
}

export function renderMusicDuelGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt }, timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  const namespace = room.roomId || "duel";
  let content = musicHeader(game, "POJEDYNEK HITÓW", accounts);
  if (game.phase === "selecting") {
    const selected = game.submissions?.[currentUser];
    content += selected ? `<div class="music-selected-track"><p class="eyebrow">TWÓJ WYBÓR</p>${trackInfoHtml(selected)}<p class="muted">Czekamy na resztę ekipy. ${Object.keys(game.submissions || {}).length}/${game.players.length} utworów.</p></div>` : `<div class="music-task-card"><h2>Wybierz piosenkę</h2><p class="muted">Znajdź numer pasujący do kategorii i przekonaj ekipę.</p>${trackSearchHtml()}</div><p class="music-timer">Pozostało <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "listening") {
    content += `<h2>Pełny odsłuch rundy</h2><p class="muted">Każdy podgląd trwa 30 sekund. Runda odsłuchu trwa zawsze 60 sekund, niezależnie od presetu.</p>${playlistHtml(game.submissions, accounts, { namespace })}${musicSkipPanel(game, currentUser, game.players)}<p class="music-timer">Do głosowania: <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "voting") {
    content += `<h2>Posłuchajcie propozycji</h2><p class="muted">Głosujesz na numer, który najbardziej pasuje do kategorii. ${currentUser in (game.votes || {}) ? "Twój głos jest zapisany." : "Wybierz jeden utwór poniżej."}</p>${playlistHtml(game.submissions, accounts, { allowVote:!(currentUser in (game.votes || {})), currentUser, namespace })}<p class="music-timer">Głosowanie kończy się za <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "roundResult") {
    const winners = game.roundResult?.winners || [];
    content += `<h2>Wynik rundy</h2>${playlistHtml(game.roundResult?.submissions || game.submissions, accounts, { namespace })}<div class="music-result-list">${Object.entries(game.roundResult?.submissions || {}).map(([uid, track]) => track ? `<div><span>${escapeHtml(nick(accounts, uid))}</span><b>${Number(game.roundResult?.voteCounts?.[uid] || 0)} gł.</b></div>` : "").join("")}</div><p class="music-winner">${winners.length ? `🏆 ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")} wygrywa rundę!` : "Nikt nie zdobył punktu."}</p><div class="music-ranking">${playerRows(game, accounts)}</div><button id="music-duel-next" class="primary">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna runda"}</button>`;
  } else {
    const top = Math.max(0, ...Object.values(game.scores || {}).map(Number)), winners = game.players.filter(uid => Number(game.scores?.[uid] || 0) === top && top > 0);
    content += `<div class="music-final"><span>🏆</span><h2>Koniec pojedynku</h2><p>${winners.length ? `Wygrywa ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}!` : "Tym razem nie było zwycięzcy."}</p><div class="music-ranking">${playerRows(game, accounts)}</div></div><button id="music-duel-lobby" class="primary">Zagraj ponownie</button>`;
  }
  root.innerHTML = `<main class="page music-page music-duel-page enter"><section class="panel music-panel">${content}</section><button id="music-duel-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  bindTrackSearch(root, actions, track => track && actions.musicDuelSelect(track, expected), musicSearchStateKey(room, game, currentUser));
  root.querySelectorAll("[data-music-vote]").forEach(button => button.addEventListener("click", () => actions.musicDuelVote(button.dataset.musicVote, expected)));
  root.querySelector("[data-music-skip]")?.addEventListener("click", () => actions.musicDuelSkip(expected));
  if (game.phase === "listening") bindMusicSkipAvailability(root, game);
  root.querySelector("#music-duel-next")?.addEventListener("click", actions.musicDuelNext);
  root.querySelector("#music-duel-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#music-duel-leave")?.addEventListener("click", () => actions.leaveRoom());
  bindMusicPlayback(root);
  scheduleTimer(game, actions, "musicDuelTimeout", expected);
}

export function renderMusicArenaGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt }, timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  const namespace = room.roomId || "arena";
  let content = musicHeader(game, "BITWA HITÓW", accounts, true);
  if (game.phase === "selecting") {
    const duelists = game.duelists || [], isDuelist = duelists.includes(currentUser), selected = game.submissions?.[currentUser];
    content += `<div class="music-challengers"><p class="eyebrow">WYLOSOWANI GRACZE</p>${duelists.map(uid => `<span>${escapeHtml(nick(accounts, uid))}</span>`).join("<b>VS</b>")}</div>`;
    content += isDuelist ? (selected ? `<div class="music-selected-track"><p class="eyebrow">TWÓJ WYBÓR</p>${trackInfoHtml(selected)}<p class="muted">Drugi gracz wybiera swoją propozycję.</p></div>` : `<div class="music-task-card"><h2>Wejdź do bitwy</h2><p class="muted">Wyszukaj piosenkę, która pokona drugi numer.</p>${trackSearchHtml()}</div>`) : `<div class="waiting-state"><h2>Jesteś dziś publicznością</h2><p>Czekamy, aż ${duelists.map(uid => escapeHtml(nick(accounts, uid))).join(" i ")} wybiorą utwory.</p></div>`;
    content += `<p class="music-timer">Pozostało <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "listening") {
    const duelists = game.duelists || [];
    content += `<h2>Pełny odsłuch rundy</h2><p class="muted">Oba podglądy trwają po 30 sekund, więc odsłuch ma stałe 60 sekund. Dopiero potem publiczność głosuje.</p>${playlistHtml(game.submissions, accounts, { arena:true, namespace })}${musicSkipPanel(game, currentUser, duelists)}<p class="music-timer">Do głosowania: <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "voting") {
    const eligible = !(game.duelists || []).includes(currentUser), voted = currentUser in (game.votes || {});
    content += `<h2>Głosowanie publiczności</h2><p class="muted">Posłuchajcie obu propozycji i wybierzcie lepszą. ${voted ? "Twój głos jest zapisany." : eligible ? "Wybrani gracze nie głosują." : "Nie głosujesz w tej rundzie."}</p>${playlistHtml(game.submissions, accounts, { allowVote:eligible && !voted, currentUser, arena:true, namespace })}<p class="music-timer">Głosowanie kończy się za <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "roundResult") {
    const winners = game.roundResult?.winners || [];
    content += `<h2>Wynik bitwy</h2>${playlistHtml(game.roundResult?.submissions || game.submissions, accounts, { arena:true, namespace })}<div class="music-result-list">${Object.entries(game.roundResult?.submissions || {}).map(([uid, track]) => track ? `<div><span>${escapeHtml(nick(accounts, uid))}</span><b>${Number(game.roundResult?.voteCounts?.[uid] || 0)} gł.</b></div>` : "").join("")}</div><p class="music-winner">${winners.length ? `🏆 Wygrywa ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}!` : "Remis — nikt nie zdobywa punktu."}</p><div class="music-ranking">${playerRows(game, accounts, "wins")}</div><button id="music-arena-next" class="primary">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna bitwa"}</button>`;
  } else {
    const top = Math.max(0, ...Object.values(game.scores || {}).map(Number)), winners = game.players.filter(uid => Number(game.scores?.[uid] || 0) === top && top > 0);
    content += `<div class="music-final"><span>🏆</span><h2>Koniec bitwy</h2><p>${winners.length ? `Najwięcej zwycięstw ma ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}!` : "Nie wyłoniono zwycięzcy."}</p><div class="music-ranking">${playerRows(game, accounts, "wins")}</div></div><button id="music-arena-lobby" class="primary">Zagraj ponownie</button>`;
  }
  root.innerHTML = `<main class="page music-page music-arena-page enter"><section class="panel music-panel">${content}</section><button id="music-arena-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  bindTrackSearch(root, actions, track => track && actions.musicArenaSelect(track, expected), musicSearchStateKey(room, game, currentUser));
  root.querySelectorAll("[data-music-vote]").forEach(button => button.addEventListener("click", () => actions.musicArenaVote(button.dataset.musicVote, expected)));
  root.querySelector("[data-music-skip]")?.addEventListener("click", () => actions.musicArenaSkip(expected));
  if (game.phase === "listening") bindMusicSkipAvailability(root, game);
  root.querySelector("#music-arena-next")?.addEventListener("click", actions.musicArenaNext);
  root.querySelector("#music-arena-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#music-arena-leave")?.addEventListener("click", () => actions.leaveRoom());
  bindMusicPlayback(root);
  scheduleTimer(game, actions, "musicArenaTimeout", expected);
}
