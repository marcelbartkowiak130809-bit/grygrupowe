import { escapeHtml } from "./utils.js?v=20260822-1";

export const musicDuelDefaults = { rounds: 5, selectionTime: 30, votingTime: 25, category: "all" };
export const musicArenaDefaults = { rounds: 10, selectionTime: 30, votingTime: 25, category: "all" };

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

const fallbackTracks = [
  ["Blinding Lights", "The Weeknd"], ["As It Was", "Harry Styles"], ["Levitating", "Dua Lipa"],
  ["Flowers", "Miley Cyrus"], ["Shape of You", "Ed Sheeran"], ["Bad Guy", "Billie Eilish"],
  ["Wake Me Up", "Avicii"], ["Mr. Brightside", "The Killers"], ["Believer", "Imagine Dragons"],
  ["One More Time", "Daft Punk"], ["Rolling in the Deep", "Adele"], ["Uptown Funk", "Mark Ronson"],
  ["Houdini", "Dua Lipa"], ["Starboy", "The Weeknd"], ["Cruel Summer", "Taylor Swift"],
].map(([title, artist], index) => ({ id:`fallback-${index}`, title, artist, coverUrl:"", previewUrl:"", externalUrl:`https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`, provider:"search" }));

function normalizeTrack(track) {
  if (!track || typeof track !== "object") return null;
  const title = clean(track.title || track.trackName, 100), artist = clean(track.artist || track.artistName, 100);
  if (!title || !artist) return null;
  const id = clean(track.id || track.trackId || `${artist}-${title}`, 120);
  const query = encodeURIComponent(`${artist} ${title}`);
  return {
    id,
    title,
    artist,
    album: clean(track.album || track.collectionName, 100),
    coverUrl: clean(track.coverUrl || track.artworkUrl100, 500),
    previewUrl: clean(track.previewUrl, 500),
    externalUrl: clean(track.externalUrl || track.trackViewUrl || `https://open.spotify.com/search/${query}`, 500),
    spotifyUrl: clean(track.spotifyUrl || `https://open.spotify.com/search/${query}`, 500),
    provider: clean(track.provider || "preview", 30),
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

function startDuelVoting(game, settings) {
  game.phase = "voting";
  game.votes = {};
  game.phaseEndsAt = deadline(settings.votingTime);
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
    if (game.players.every(player => player in game.submissions)) startDuelVoting(game, sanitizeMusicDuelSettings(settings));
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
  timeout(game, settings = {}) {
    if (game.phase === "selecting") {
      game.submissions = object(game.submissions);
      game.players.forEach((uid, index) => { if (!(uid in game.submissions)) game.submissions[uid] = null; });
      startDuelVoting(game, sanitizeMusicDuelSettings(settings));
    } else if (game.phase === "voting") resolveDuelVoting(game);
  },
  nextRound(game, settings = {}) {
    if (game.phase !== "roundResult") return "Podsumowanie rundy nie jest jeszcze gotowe.";
    const s = sanitizeMusicDuelSettings(settings);
    if (Number(game.round) >= Number(game.totalRounds || s.rounds)) { game.phase = "gameSummary"; game.finished = true; game.phaseEndsAt = null; return; }
    game.round += 1; game.submissions = {}; game.votes = {}; game.roundResult = null; game.phase = "selecting"; game.phaseEndsAt = deadline(s.selectionTime);
  },
  botTrack(game, uid) {
    const available = trackPool(game);
    return trackForRound(available[Math.floor(Math.random() * available.length)], Math.floor(Math.random() * fallbackTracks.length));
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
    if (game.duelists.every(player => player in game.submissions)) startArenaVoting(game, sanitizeMusicArenaSettings(settings));
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
  timeout(game, settings = {}) {
    if (game.phase === "selecting") {
      game.submissions = object(game.submissions);
      game.duelists.forEach((uid, index) => { if (!(uid in game.submissions)) game.submissions[uid] = null; });
      startArenaVoting(game, sanitizeMusicArenaSettings(settings));
    } else if (game.phase === "voting") resolveArenaVoting(game);
  },
  nextRound(game, settings = {}) {
    if (game.phase !== "roundResult") return "Podsumowanie rundy nie jest jeszcze gotowe.";
    const s = sanitizeMusicArenaSettings(settings);
    if (Number(game.round) >= Number(game.totalRounds || s.rounds)) { game.phase = "gameSummary"; game.finished = true; game.phaseEndsAt = null; return; }
    const selected = new Set(game.duelists || []);
    game.selectionWeights = Object.fromEntries(game.players.map(uid => [uid, selected.has(uid) ? 1 : Math.min(100, Math.max(1, Number(game.selectionWeights?.[uid] || 1) + 1))]));
    chooseArenaDuelists(game); game.round += 1; game.submissions = {}; game.votes = {}; game.roundResult = null; game.phase = "selecting"; game.phaseEndsAt = deadline(s.selectionTime);
  },
  botTrack(game) {
    const available = trackPool(game);
    return trackForRound(available[Math.floor(Math.random() * available.length)], Math.floor(Math.random() * fallbackTracks.length));
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
  return `<div class="music-settings"><label class="setting-row"><span>Liczba rund</span><select data-music-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 7, 10, 15, 20].map(value => `<option value="${value}" ${s.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na wybór utworu</span><select data-music-setting="selectionTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${s.selectionTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Czas głosowania</span><select data-music-setting="votingTime" ${isHost ? "" : "disabled"}>${[15, 25, 30, 45, 60].map(value => `<option value="${value}" ${s.votingTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Kategoria</span>${categorySelect(s.category, "category", isHost)}</label><p class="tiny">Każdy wyszukuje i wybiera jeden utwór. Potem słuchacie propozycji i głosujecie na najlepszą.</p></div>`;
}

export function renderMusicArenaLobbySettings(room, isHost) {
  const s = sanitizeMusicArenaSettings(room.settings);
  return `<div class="music-settings"><label class="setting-row"><span>Liczba rund</span><select data-music-setting="rounds" ${isHost ? "" : "disabled"}>${[10, 20, 30, 50, 100].map(value => `<option value="${value}" ${s.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na wybór utworu</span><select data-music-setting="selectionTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${s.selectionTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Czas głosowania</span><select data-music-setting="votingTime" ${isHost ? "" : "disabled"}>${[15, 25, 30, 45, 60].map(value => `<option value="${value}" ${s.votingTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Kategoria</span>${categorySelect(s.category, "category", isHost)}</label><p class="tiny">W każdej rundzie losujemy dwóch graczy. Szanse osób niewylosowanych rosną, ale nikt nie jest całkiem wykluczony.</p></div>`;
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

function playlistHtml(submissions, accounts, { allowVote = false, currentUser = "", arena = false } = {}) {
  const entries = Object.entries(submissions || {}).filter(([, track]) => track);
  const first = entries[0]?.[1];
  const player = first?.previewUrl ? `<audio data-music-preview controls autoplay preload="auto" src="${escapeHtml(first.previewUrl)}"></audio><p class="music-autoplay-note">Jeśli przeglądarka zablokuje dźwięk, kliknij „Odtwórz”.</p>` : `<p class="music-no-preview">Ten utwór nie ma dostępnego podglądu. <a href="${escapeHtml(first?.spotifyUrl || first?.externalUrl || "#")}" target="_blank" rel="noreferrer">Otwórz w Spotify</a></p>`;
  return `<div class="music-playlist" data-music-playlist><div class="music-now-playing"><div><p class="eyebrow">TERAZ GRA</p><strong data-music-now-playing>${escapeHtml(first ? trackIdentity(first) : "Brak utworów")}</strong></div><span data-music-playlist-count>${first ? `1/${entries.length}` : "0/0"}</span></div><div class="music-player" data-music-player>${player}</div><div class="music-song-list">${entries.map(([uid, track], index) => `<article class="music-song-card ${index === 0 ? "is-active" : ""}" data-music-track-card data-track-index="${index}" data-preview-url="${escapeHtml(track.previewUrl || "")}" data-external-url="${escapeHtml(track.spotifyUrl || track.externalUrl || "")}"><div class="music-song-card-head"><span class="music-song-number">${arena ? (index === 0 ? "A" : "B") : `#${index + 1}`}</span>${trackInfoHtml(track, `<small class="music-track-owner">${allowVote ? "" : escapeHtml(nick(accounts, uid))}</small>`)}</div><div class="music-song-card-actions"><button class="ghost" type="button" data-music-play-track>▶ Odtwórz</button>${allowVote ? `<button class="primary" type="button" data-music-vote="${escapeHtml(uid)}" ${uid === currentUser ? "" : ""}>Wybieram ten utwór</button>` : ""}</div></article>`).join("")}</div></div>`;
}

function bindTrackSearch(root, actions, onSelect) {
  const form = root.querySelector("[data-music-search-form]"), results = root.querySelector("[data-music-search-results]");
  if (!form || !results) return;
  let found = [];
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const input = form.querySelector("input"), button = form.querySelector("button");
    button.disabled = true; button.textContent = "Szukam…"; results.innerHTML = `<p class="muted">Wyszukiwanie utworów…</p>`;
    found = await actions.musicSearchTracks(input.value);
    results.innerHTML = trackSearchResultsHtml(found);
    results.querySelectorAll("[data-music-search-result]").forEach(item => item.addEventListener("click", () => onSelect(found[Number(item.dataset.musicSearchResult)])));
    button.disabled = false; button.textContent = "Szukaj";
  });
}

function bindMusicPlayback(root) {
  const playlist = root.querySelector("[data-music-playlist]");
  if (!playlist) return;
  const audio = playlist.querySelector("audio[data-music-preview]"), player = playlist.querySelector("[data-music-player]"), now = playlist.querySelector("[data-music-now-playing]"), counter = playlist.querySelector("[data-music-playlist-count]"), cards = [...playlist.querySelectorAll("[data-music-track-card]")];
  const syncPlaybackState = () => player?.classList.toggle("is-playing", Boolean(audio && !audio.paused));
  audio?.addEventListener("play", syncPlaybackState);
  audio?.addEventListener("pause", syncPlaybackState);
  audio?.addEventListener("ended", syncPlaybackState);
  syncPlaybackState();
  const activate = card => {
    cards.forEach(item => item.classList.toggle("is-active", item === card));
    const index = Number(card.dataset.trackIndex) + 1;
    if (now) now.textContent = card.querySelector(".music-track-info b")?.textContent || "Utwór";
    if (counter) counter.textContent = `${index}/${cards.length}`;
    if (!audio || !card.dataset.previewUrl) return;
    audio.src = card.dataset.previewUrl; audio.load();
    const playResult = audio.play();
    if (playResult?.catch) playResult.catch(() => playlist.classList.add("autoplay-blocked"));
  };
  cards.forEach(card => card.querySelector("[data-music-play-track]")?.addEventListener("click", () => {
    if (card.dataset.previewUrl) activate(card);
    else if (card.dataset.externalUrl) window.open(card.dataset.externalUrl, "_blank", "noopener,noreferrer");
  }));
  if (audio) {
    const playResult = audio.play();
    if (playResult?.catch) playResult.catch(() => playlist.classList.add("autoplay-blocked"));
  }
}

function scheduleTimer(game, actions, method, expected) {
  if (!["selecting", "voting"].includes(game.phase) || !Number(game.phaseEndsAt)) return;
  musicTimer = window.setTimeout(() => actions[method](expected), Math.max(100, Number(game.phaseEndsAt) - Date.now() + 50));
}

let musicTimer = 0;
export function stopMusicTimer() { window.clearTimeout(musicTimer); musicTimer = 0; }

function musicHeader(game, title, accounts, arena = false) {
  return `<p class="eyebrow">${escapeHtml(title)} · RUNDA ${Math.min(Number(game.round || 1), Number(game.totalRounds || 1))}/${Number(game.totalRounds || 1)}</p><h1>${arena ? "Który utwór wygrywa?" : "Który numer bierze rundę?"}</h1><div class="music-category-banner"><span>🎵</span><div><small>KATEGORIA</small><strong>${escapeHtml(categoryLabel(game.category))}</strong></div></div>`;
}

export function renderMusicDuelGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt }, timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  let content = musicHeader(game, "POJEDYNEK HITÓW", accounts);
  if (game.phase === "selecting") {
    const selected = game.submissions?.[currentUser];
    content += selected ? `<div class="music-selected-track"><p class="eyebrow">TWÓJ WYBÓR</p>${trackInfoHtml(selected)}<p class="muted">Czekamy na resztę ekipy. ${Object.keys(game.submissions || {}).length}/${game.players.length} utworów.</p></div>` : `<div class="music-task-card"><h2>Wybierz piosenkę</h2><p class="muted">Znajdź numer pasujący do kategorii i przekonaj ekipę.</p>${trackSearchHtml()}</div><p class="music-timer">Pozostało <b>${timer}s</b></p>`;
  } else if (game.phase === "voting") {
    content += `<h2>Posłuchajcie propozycji</h2><p class="muted">Głosujesz na numer, który najbardziej pasuje do kategorii. ${currentUser in (game.votes || {}) ? "Twój głos jest zapisany." : "Wybierz jeden utwór poniżej."}</p>${playlistHtml(game.submissions, accounts, { allowVote:!(currentUser in (game.votes || {})), currentUser })}<p class="music-timer">Głosowanie kończy się za <b>${timer}s</b></p>`;
  } else if (game.phase === "roundResult") {
    const winners = game.roundResult?.winners || [];
    content += `<h2>Wynik rundy</h2>${playlistHtml(game.roundResult?.submissions || game.submissions, accounts)}<div class="music-result-list">${Object.entries(game.roundResult?.submissions || {}).map(([uid, track]) => track ? `<div><span>${escapeHtml(nick(accounts, uid))}</span><b>${Number(game.roundResult?.voteCounts?.[uid] || 0)} gł.</b></div>` : "").join("")}</div><p class="music-winner">${winners.length ? `🏆 ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")} wygrywa rundę!` : "Nikt nie zdobył punktu."}</p><div class="music-ranking">${playerRows(game, accounts)}</div><button id="music-duel-next" class="primary">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna runda"}</button>`;
  } else {
    const top = Math.max(0, ...Object.values(game.scores || {}).map(Number)), winners = game.players.filter(uid => Number(game.scores?.[uid] || 0) === top && top > 0);
    content += `<div class="music-final"><span>🏆</span><h2>Koniec pojedynku</h2><p>${winners.length ? `Wygrywa ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}!` : "Tym razem nie było zwycięzcy."}</p><div class="music-ranking">${playerRows(game, accounts)}</div></div><button id="music-duel-lobby" class="primary">Zagraj ponownie</button>`;
  }
  root.innerHTML = `<main class="page music-page music-duel-page enter"><section class="panel music-panel">${content}</section><button id="music-duel-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  bindTrackSearch(root, actions, track => track && actions.musicDuelSelect(track, expected));
  root.querySelectorAll("[data-music-vote]").forEach(button => button.addEventListener("click", () => actions.musicDuelVote(button.dataset.musicVote, expected)));
  root.querySelector("#music-duel-next")?.addEventListener("click", actions.musicDuelNext);
  root.querySelector("#music-duel-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#music-duel-leave")?.addEventListener("click", () => actions.leaveRoom());
  bindMusicPlayback(root);
  scheduleTimer(game, actions, "musicDuelTimeout", expected);
}

export function renderMusicArenaGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt }, timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  let content = musicHeader(game, "BITWA HITÓW", accounts, true);
  if (game.phase === "selecting") {
    const duelists = game.duelists || [], isDuelist = duelists.includes(currentUser), selected = game.submissions?.[currentUser];
    content += `<div class="music-challengers"><p class="eyebrow">WYLOSOWANI GRACZE</p>${duelists.map(uid => `<span>${escapeHtml(nick(accounts, uid))}</span>`).join("<b>VS</b>")}</div>`;
    content += isDuelist ? (selected ? `<div class="music-selected-track"><p class="eyebrow">TWÓJ WYBÓR</p>${trackInfoHtml(selected)}<p class="muted">Drugi gracz wybiera swoją propozycję.</p></div>` : `<div class="music-task-card"><h2>Wejdź do bitwy</h2><p class="muted">Wyszukaj piosenkę, która pokona drugi numer.</p>${trackSearchHtml()}</div>`) : `<div class="waiting-state"><h2>Jesteś dziś publicznością</h2><p>Czekamy, aż ${duelists.map(uid => escapeHtml(nick(accounts, uid))).join(" i ")} wybiorą utwory.</p></div>`;
    content += `<p class="music-timer">Pozostało <b>${timer}s</b></p>`;
  } else if (game.phase === "voting") {
    const eligible = !(game.duelists || []).includes(currentUser), voted = currentUser in (game.votes || {});
    content += `<h2>Głosowanie publiczności</h2><p class="muted">Posłuchajcie obu propozycji i wybierzcie lepszą. ${voted ? "Twój głos jest zapisany." : eligible ? "Wybrani gracze nie głosują." : "Nie głosujesz w tej rundzie."}</p>${playlistHtml(game.submissions, accounts, { allowVote:eligible && !voted, currentUser, arena:true })}<p class="music-timer">Głosowanie kończy się za <b>${timer}s</b></p>`;
  } else if (game.phase === "roundResult") {
    const winners = game.roundResult?.winners || [];
    content += `<h2>Wynik bitwy</h2>${playlistHtml(game.roundResult?.submissions || game.submissions, accounts, { arena:true })}<div class="music-result-list">${Object.entries(game.roundResult?.submissions || {}).map(([uid, track]) => track ? `<div><span>${escapeHtml(nick(accounts, uid))}</span><b>${Number(game.roundResult?.voteCounts?.[uid] || 0)} gł.</b></div>` : "").join("")}</div><p class="music-winner">${winners.length ? `🏆 Wygrywa ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}!` : "Remis — nikt nie zdobywa punktu."}</p><div class="music-ranking">${playerRows(game, accounts, "wins")}</div><button id="music-arena-next" class="primary">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna bitwa"}</button>`;
  } else {
    const top = Math.max(0, ...Object.values(game.scores || {}).map(Number)), winners = game.players.filter(uid => Number(game.scores?.[uid] || 0) === top && top > 0);
    content += `<div class="music-final"><span>🏆</span><h2>Koniec bitwy</h2><p>${winners.length ? `Najwięcej zwycięstw ma ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}!` : "Nie wyłoniono zwycięzcy."}</p><div class="music-ranking">${playerRows(game, accounts, "wins")}</div></div><button id="music-arena-lobby" class="primary">Zagraj ponownie</button>`;
  }
  root.innerHTML = `<main class="page music-page music-arena-page enter"><section class="panel music-panel">${content}</section><button id="music-arena-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  bindTrackSearch(root, actions, track => track && actions.musicArenaSelect(track, expected));
  root.querySelectorAll("[data-music-vote]").forEach(button => button.addEventListener("click", () => actions.musicArenaVote(button.dataset.musicVote, expected)));
  root.querySelector("#music-arena-next")?.addEventListener("click", actions.musicArenaNext);
  root.querySelector("#music-arena-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#music-arena-leave")?.addEventListener("click", () => actions.leaveRoom());
  bindMusicPlayback(root);
  scheduleTimer(game, actions, "musicArenaTimeout", expected);
}
