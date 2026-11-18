import { gamesList } from "./games.js?v=20261118-19";
import { gameCategory } from "./gameCategories.js";
import { homeMenuHtml, bindHomeMenu } from './homeMenu.js?v=20261118-1';
import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { activePoll, countdownText, formatPollTime, latestPoll, pollState, pollStateOnline, votePoll } from "./polls.js?v=20261118-19";
import { weeklyUnlockSnapshot } from "./weeklyUnlocks.js?v=20261118-14";
import { activatePublicAds, bindPublicLinks, homeInfoHtml } from "./publicPages.js?v=20261118-19";
import { escapeHtml, icon } from "./utils.js?v=20260822-1";
import { formatUnlockDate, formatUnlockTime, isModeLocked, isUnlockDay, modeUnlockInfo } from "./upcomingModes.js?v=20261118-14";
import { animateGlobalStats, globalStatsHtml } from "./globalStats.js?v=20261118-19";
import { minecraftModeIcons } from "./minecraft.js?v=20261118-13";

const filters = [
  ["all", "WSZYSTKIE"],
  ["new", "NOWE"],
  ["popular", "POPULARNE"],
  ["tiktok", "HIT TIKTOKA"],
  ["category", "KATEGORIA"],
  ["music", "MUZYKA"],
  ["everyone", "GRA DLA KAŻDEGO"],
  ["crew", "GRA DLA EKIPY"],
  ["solo", "TRYB SOLO"],
];
let pollCountdownTimer;
let weeklyUnlockTimer;
let modeUnlockAnnouncementTimer;
const POLLS_ENABLED = false;
const hubCategories = new Set(["pokemon", "board", "minecraft", "music"]);
const boardModes = gamesList.filter(mode => !mode.hiddenFromLibrary && gameCategory(mode) === "board");

function modeCategory(mode) {
  const category = gameCategory(mode);
  if (hubCategories.has(category)) return category;
  if (mode.supportsSolo && !mode.supportsLobby) return "solo";
  return category === "crew" ? "crew" : "everyone";
}

function bindModePlayActions(root, actions) {
  root.querySelectorAll("[data-play-mode]").forEach(button => button.addEventListener("click", () => actions.selectGame(button.dataset.playMode)));
  root.querySelectorAll("[data-play-solo-mode]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    actions.selectSoloGame(button.dataset.playSoloMode);
  }));
}

export function renderPokemonModes(root, actions, context = {}) {
  const activityStats = context.activityStats || window.__activityStats || {};
  const pokemonModes = gamesList.filter(game => game.audience === "pokemon");
  const mewtwo = pokemonDex.find(item => item.id === 150);
  const mobileLayout = getMobileGameLayout();
  root.innerHTML = `<main class="page platform-page pokemon-selection-page enter"><section class="pokemon-selection-hero"><button class="ghost" id="back-to-games">← Wróć do wszystkich trybów</button><div class="pokemon-selection-copy"><p class="eyebrow">SPECJALNA STREFA</p><h1>POKEMONY</h1><p>Wybierzcie sposób rywalizacji z Pokémonami.</p></div><div class="pokemon-selection-art">${mewtwo ? `<img src="${mewtwo.sprite}" alt="Mewtwo" onerror="this.onerror=null;this.src='${mewtwo.spriteFallback}'">` : "🧬"}</div></section><section class="${mobileGamesSectionClass(mobileLayout)} pokemon-games-section"><div class="section-intro"><div><p class="eyebrow">TRYBY POKÉMON</p><h2>W co gramy?</h2></div><span class="badge">${pokemonModes.length}</span>${mobileGameLayoutSwitchHtml(mobileLayout)}</div><div class="games-grid">${pokemonModes.map(game=>gameCard({...game,activity:activityStats[game.id]})).join("")}</div></section></main>`;
  root.querySelector("#back-to-games")?.addEventListener("click", actions.goPlatform);
  bindMobileGameLayout(root);
  bindModePlayActions(root, actions);
  bindGameCardInteractions(root);
  watchWeeklyUnlocks(root, actions);
  activatePublicAds(root, "platform");
}

export function renderBoardModes(root, actions, context = {}) {
  const activityStats = context.activityStats || window.__activityStats || {};
  const mobileLayout = getMobileGameLayout();
  root.innerHTML = `<main class="page platform-page board-selection-page enter"><section class="board-selection-hero"><button class="ghost" id="back-to-games">← Wróć do wszystkich trybów</button><div class="board-selection-copy"><p class="eyebrow">SPECJALNA STREFA</p><h1>PLANSZÓWKI</h1><p>Klasyki, gry słowne i szybkie wyzwania dla całej ekipy.</p></div><div class="board-selection-art" aria-hidden="true"><span>🎲</span><i>♟</i><b>🁫</b></div></section><section class="${mobileGamesSectionClass(mobileLayout)} board-games-section"><div class="section-intro"><div><p class="eyebrow">TRYBY PLANSZOWE</p><h2>W co gramy?</h2></div><span class="badge">${boardModes.length}</span>${mobileGameLayoutSwitchHtml(mobileLayout)}</div><div class="games-grid">${boardModes.map(game=>gameCard({...game,activity:activityStats[game.id]})).join("")}</div></section></main>`;
  root.querySelector("#back-to-games")?.addEventListener("click", actions.goPlatform);
  bindMobileGameLayout(root);
  bindModePlayActions(root, actions);
  bindGameCardInteractions(root);
  watchWeeklyUnlocks(root, actions);
  activatePublicAds(root, "platform");
}

export function renderMinecraftModes(root, actions, context = {}) {
  const activityStats = context.activityStats || window.__activityStats || {};
  const minecraftModes = gamesList.filter(game => game.audience === "minecraft");
  const mobileLayout = getMobileGameLayout();
  root.innerHTML = `<main class="page platform-page minecraft-selection-page enter"><section class="minecraft-selection-hero"><button class="ghost" id="back-to-games">← Wróć do wszystkich trybów</button><div class="minecraft-selection-copy"><p class="eyebrow">SPECJALNA STREFA</p><h1>MINECRAFT</h1><p>Przygody z budowaniem, jeden świat i plecak pełen pomysłów. Wybierz swoją drogę.</p></div><div class="minecraft-selection-art"><img src="${minecraftModeIcons["minecraft-sprint"]}" alt="Kilof Minecraft"><span>CRAFT</span><b>PLAY</b></div></section><section class="${mobileGamesSectionClass(mobileLayout)} minecraft-games-section"><div class="section-intro"><div><p class="eyebrow">TRYBY MINECRAFT</p><h2>W co gramy?</h2></div><span class="badge">${minecraftModes.length}</span>${mobileGameLayoutSwitchHtml(mobileLayout)}</div><div class="games-grid">${minecraftModes.map(game => gameCard({...game, activity:activityStats[game.id]})).join("")}</div></section></main>`;
  root.querySelector("#back-to-games")?.addEventListener("click", actions.goPlatform);
  bindMobileGameLayout(root);
  bindModePlayActions(root, actions);
  bindGameCardInteractions(root);
  watchWeeklyUnlocks(root, actions);
  activatePublicAds(root, "platform");
}

export function renderMusicModes(root, actions, context = {}) {
  const activityStats = context.activityStats || window.__activityStats || {};
  const musicModes = gamesList.filter(game => game.audience === "music" && !game.hiddenFromLibrary);
  const mobileLayout = getMobileGameLayout();
  root.innerHTML = `<main class="page platform-page music-selection-page enter"><section class="music-selection-hero"><button class="ghost" id="back-to-games">← Wróć do wszystkich trybów</button><div class="music-selection-copy"><p class="eyebrow">SPECJALNA STREFA</p><h1>MUZYKA</h1><p>Wybierajcie hity, słuchajcie krótkich previewów i sprawdzajcie, który numer wygrywa.</p></div><div class="music-selection-art" aria-hidden="true"><div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div><span>🎵</span><i>♫</i><b>HITS</b></div></section><section class="${mobileGamesSectionClass(mobileLayout)} music-games-section"><div class="section-intro"><div><p class="eyebrow">TRYBY MUZYCZNE</p><h2>W co gramy?</h2></div><span class="badge">${musicModes.length}</span>${mobileGameLayoutSwitchHtml(mobileLayout)}</div><div class="games-grid">${musicModes.map(game => gameCard({...game, activity:activityStats[game.id]})).join("")}</div></section></main>`;
  root.querySelector("#back-to-games")?.addEventListener("click", actions.goPlatform);
  bindMobileGameLayout(root);
  bindModePlayActions(root, actions);
  bindGameCardInteractions(root);
  watchWeeklyUnlocks(root, actions);
  activatePublicAds(root, "platform");
}

function modeFilterTags(mode) {
  return [modeCategory(mode), mode.supportsSolo ? "solo" : "", ...(mode.badges || [])].filter(Boolean).join(" ");
}

const MOBILE_GAME_LAYOUT_STORAGE_KEY = "mobileGameLayout";

function getMobileGameLayout() {
  try {
    return localStorage.getItem(MOBILE_GAME_LAYOUT_STORAGE_KEY) === "classic" ? "classic" : "compact";
  } catch {
    return "compact";
  }
}

function mobileGamesSectionClass(layout) {
  return `games-section ${layout === "classic" ? "mobile-games-classic" : "mobile-games-compact"}`;
}

function mobileGameLayoutSwitchHtml(layout) {
  const compact = layout !== "classic";
  return `<div class="mobile-game-layout-switch" role="group" aria-label="Widok trybów"><span>Widok</span><button type="button" data-mobile-game-layout="compact" class="${compact ? "is-active" : ""}" aria-pressed="${compact}">Kompaktowy</button><button type="button" data-mobile-game-layout="classic" class="${compact ? "" : "is-active"}" aria-pressed="${!compact}">Klasyczny</button></div>`;
}

function bindMobileGameLayout(root) {
  const section = root.querySelector(".games-section");
  if (!section) return;
  const setLayout = layout => {
    const value = layout === "classic" ? "classic" : "compact";
    section.classList.toggle("mobile-games-compact", value === "compact");
    section.classList.toggle("mobile-games-classic", value === "classic");
    root.querySelectorAll("[data-mobile-game-layout]").forEach(button => {
      const active = button.dataset.mobileGameLayout === value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    try { localStorage.setItem(MOBILE_GAME_LAYOUT_STORAGE_KEY, value); } catch {}
  };
  root.querySelectorAll("[data-mobile-game-layout]").forEach(button => button.addEventListener("click", () => setLayout(button.dataset.mobileGameLayout)));
}

function syncWeeklyCards(root, actions, now) {
  const activity = window.__activityStats || {};
  for (const card of root.querySelectorAll("[data-game-id]")) {
    const mode = gamesList.find(item => item.id === card.dataset.gameId);
    if (!mode) continue;
    const { locked, celebrating } = modeUnlockInfo(mode.id, now);
    if (locked !== card.hasAttribute("data-mode-locked")) {
      const template = root.ownerDocument.createElement("template");
      template.innerHTML = gameCard({ ...mode, activity: activity[mode.id] }, now);
      const fresh = template.content.firstElementChild;
      const focused = card.contains(root.ownerDocument.activeElement);
      card.replaceWith(fresh);
      bindModePlayActions(fresh, actions);
      if (focused) fresh.querySelector("button")?.focus({ preventScroll: true });
    } else {
      card.classList.toggle("weekly-release-highlight", celebrating);
    }
  }
}

export function updatePlatformActivity(root, activity) {
  if (!root) return;
  for (const card of root.querySelectorAll("[data-game-id]")) {
    const stats = activity[card.dataset.gameId];
    const players = card.querySelector("[data-game-player-count]");
    const rooms = card.querySelector("[data-game-lobby-count]");
    const playerText = `${stats?.players || 0} graczy`;
    const roomText = `${stats?.lobbies || 0} lobby`;
    if (players && players.textContent !== playerText) players.textContent = playerText;
    if (rooms && rooms.textContent !== roomText) rooms.textContent = roomText;
  }
}

function bindGameCardInteractions(root) {
  if (root.dataset.gameCardInteractionsBound === "true") return;
  root.dataset.gameCardInteractionsBound = "true";
  root.addEventListener("dblclick", event => {
    const card = event.target.closest?.(".game-card");
    if (!card || !root.contains(card)) return;
    card.querySelector("[data-play-mode]")?.click();
  });
}

function categoryTag(mode) {
  const category = modeCategory(mode);
  if (mode.audience === "pokemon") return "";
  const labels = { solo:"TRYB SOLO", crew:"GRA DLA EKIPY", everyone:"GRA DLA KAZDEGO", pokemon:"POKEMONY", board:"PLANSZÓWKI", minecraft:"MINECRAFT", music:"MUZYKA" };
  return `<span class="tag tag-category-${category}">${labels[category]}</span>`;
}

function badgeTag(type) {
  const labels = { popular:"Popularne 🔥", new:"Nowe ✨", newQuestions:"Nowe pytania ✅", tiktok:"HIT TIKTOKA 🎵" };
  return labels[type] ? `<span class="tag game-badge game-badge-${type}">${labels[type]}</span>` : "";
}

const pokemonCardIds = { "pokemon-dex":25, "pokemon-last-letter":133, "pokemon-evolution":1, "pokemon-auction":149, "pokemon-types":7, "pokemon-match-type":4 };
const newModeIcons = { wavelength:"🌈", quiz:"🎲", mathematics:"🧮", marker:"🖍️", sequence:"🔐", family:"📊", "word-chain":"🔗", charades:"🎭", hangman:"🪢", "unique-answer":"🧩", "polacz-nas":"🔗", klamca:"🎭", "falszywa-wiadomosc":"📱", "tajna-zasada":"🧠", "pojedynek-hitow":"🎵", "bitwa-hitow":"🎶", "popularnosc-hitow":"📈", "dokoncz-tekst":"✍️", songspot:"🎧", "board-chinczyk":"🎲", "board-slowotwor":"🔤", "board-statki":"🚢", "board-reversi":"⚫", "board-warcaby":"♟️", "board-cztery":"🔴", "board-memory":"🧠", "board-domino":"🁫" };
function visualSymbol(mode) {
  if(mode.id==='minecraft-journey')return '<img class="mode-minecraft-symbol" src="./assets/minecraft/backpack/compass.png" alt="Droga do Alex" loading="lazy">';
  if(mode.id==='minecraft-backpack')return '<img class="mode-minecraft-symbol" src="./assets/minecraft/backpack/diamond.png" alt="Ostatni plecak" loading="lazy">';
  if (mode.audience === "minecraft" && minecraftModeIcons[mode.id]) return `<img class="mode-minecraft-symbol" src="${minecraftModeIcons[mode.id]}" alt="Minecraft" loading="lazy" decoding="async">`;
  if (newModeIcons[mode.id]) return newModeIcons[mode.id];
  const item = pokemonDex.find(pokemon => pokemon.id === pokemonCardIds[mode.id]);
  return item ? `<img src="${item.sprite}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null;this.src='${item.spriteFallback}'">` : mode.symbol;
}

function pokemonHubCard() {
  const mewtwo = pokemonDex.find(item => item.id === 150);
  return `<article class="game-card pokemon-hub-card" data-pokemon-hub data-mode-category="pokemon" data-mode-tags="pokemon category new everyone" data-mode-search="pokemony pokemon kategoria specjalna strefa"><div class="game-visual game-visual-pokemon-hub"><div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div><span>${mewtwo ? `<img src="${mewtwo.sprite}" alt="Mewtwo" onerror="this.onerror=null;this.src='${mewtwo.spriteFallback}'">` : "🧬"}</span><b class="pokemon-hub-badge">POKÉMON</b></div><div class="game-card-content"><div class="game-card-top"><span class="tag tag-category-pokemon">KATEGORIA</span></div><h2>POKEMONY</h2><p class="muted">Rywalizujcie w specjalnych trybach z Pokémonami: Pokédex, ewolucje, typy, aukcja i więcej.</p><div class="game-card-activity"><span>6 trybów</span><span>MEWTWO CZEKA</span></div><div class="game-card-footer"><span class="players-count">🧬 SPECJALNA STREFA</span><button class="primary" data-open-pokemon>Wybierz tryb</button></div></div></article>`;
}

function boardHubCard() {
  return `<article class="game-card board-hub-card" data-board-hub data-mode-category="board" data-mode-tags="board category new everyone" data-mode-search="planszówki planszowki gry planszowe ${escapeHtml(boardModes.map(mode => mode.name).join(" "))}"><div class="game-visual game-visual-board-hub"><div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div><span>🎲</span><b class="board-hub-badge">PLANSZÓWKI</b></div><div class="game-card-content"><div class="game-card-top"><span class="tag tag-category-board">KATEGORIA</span></div><h2>PLANSZÓWKI</h2><p class="muted">Chińczyk, Statki, Kalambury i inne gry dla całej ekipy.</p><div class="game-card-activity"><span>${boardModes.length} trybów</span><span>KLASYKI I STRATEGIA</span></div><div class="game-card-footer"><span class="players-count">🎲 DLA EKIPY</span><button class="primary" data-open-board>Wybierz tryb</button></div></div></article>`;
}

function minecraftHubCard() {
  return `<article class="game-card minecraft-hub-card" data-minecraft-hub data-mode-category="minecraft" data-mode-tags="minecraft category new everyone solo" data-mode-search="minecraft crafting sprint mob biomy redstone quiz kategoria"><div class="game-visual game-visual-minecraft-hub"><div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div><span><img src="${minecraftModeIcons["minecraft-sprint"]}" alt="Kilof Minecraft"></span><b class="minecraft-hub-badge">MINECRAFT</b></div><div class="game-card-content"><div class="game-card-top"><span class="tag tag-category-minecraft">KATEGORIA</span></div><h2>MINECRAFT</h2><p class="muted">Droga do Alex: dwa rozdziały przygody. Ostatni plecak: 50 graficznych łamigłówek.</p><div class="game-card-activity"><span>8 trybów</span><span>2 PRZYGODY JUŻ DOSTĘPNE</span></div><div class="game-card-footer"><span class="players-count">⛏️ DLA EKIPY I SOLO</span><button class="primary" data-open-minecraft>Wybierz tryb</button></div></div></article>`;
}

function musicHubCard() {
  return `<article class="game-card music-hub-card" data-music-hub data-mode-category="music" data-mode-tags="music category new everyone crew solo" data-mode-search="muzyka muzyka hity piosenki spotify artyści wyświetlenia słuchacze pojedynek bitwa popularność tekst dokończ lyric zgadnij utwór songspot kategoria"><div class="game-visual game-visual-music-hub"><div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div><span>🎵</span><i>♫</i><b class="music-hub-badge">MUZYKA</b></div><div class="game-card-content"><div class="game-card-top"><span class="tag tag-category-music">KATEGORIA</span></div><h2>MUZYKA</h2><p class="muted">Pojedynki hitów, bitwy ekip, popularność, teksty i rozpoznawanie piosenek.</p><div class="game-card-activity"><span>5 trybów</span><span>HITY I ZGADYWANIE</span></div><div class="game-card-footer"><span class="players-count">🎧 DLA EKIP I ZNAJOMYCH</span><button class="primary" data-open-music>Wybierz tryb</button></div></div></article>`;
}

function gameCard(mode, now = Date.now()) {
  const unlock = modeUnlockInfo(mode.id, now), locked = unlock.locked, revealName = locked && isUnlockDay(unlock.unlockAt);
  const searchText = escapeHtml(`${mode.name} ${mode.description}`.toLocaleLowerCase("pl-PL"));
    const soloModeId = mode.soloModeId || (mode.id === "popularnosc-hitow" ? "popularnosc-solo" : "");
  const soloAvailable = soloModeId && !isModeLocked(soloModeId);
    const soloOnly = Boolean(soloModeId && !mode.supportsLobby);
  const playControls = soloModeId && !locked
    ? soloOnly
          ? `<div class="game-card-play-options"><button class="primary" data-play-solo-mode="${escapeHtml(soloModeId)}">${mode.id === "songspot" ? "🎧" : mode.id === "dokoncz-tekst" ? "🎤" : "🔥"} Solo</button></div>`
          : `<div class="game-card-play-options"><button class="primary" data-play-mode="${mode.id}">${icon("play", 17)} Pokój</button>${soloAvailable ? `<button class="ghost" data-play-solo-mode="${escapeHtml(soloModeId)}">${mode.id === "dokoncz-tekst" ? "🎤" : mode.id === "songspot" ? "🎧" : "🔥"} Solo</button>` : ""}</div>`
    : `<button class="${locked ? "ghost locked-play-button" : "primary"}" data-play-mode="${mode.id}">${locked ? icon("lock", 17) + " Niedostepne" : icon("play", 17) + " Zagraj"}</button>`;
  return `<article class="game-card ${mode.featured ? "featured-game" : ""} ${locked ? "locked-game-card coming-soon-card" : ""} ${revealName ? "unlock-day-card" : ""} ${unlock.celebrating ? "weekly-release-highlight" : ""}" data-game-id="${mode.id}" data-mode-category="${modeCategory(mode)}" data-mode-tags="${modeFilterTags(mode)}" data-mode-search="${searchText}" ${locked ? `data-mode-locked="true" title="${escapeHtml(lockedModeTitle(mode, unlock))}"` : ""}>
    <div class="game-visual game-visual-${mode.art}">
      <div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div>
      <span>${revealName ? visualSymbol(mode) : locked ? "???" : visualSymbol(mode)}</span>
      ${locked ? `<div class="coming-lock ${revealName ? "is-revealed" : ""}">${revealName ? `<small>DZIŚ O ${escapeHtml(formatUnlockTime(unlock.unlockAt))}</small>` : icon("lock", 50)}<b>${revealName ? "WKRÓTCE" : "???"}</b></div>` : ""}
    </div>
    <div class="game-card-content">
      <div class="game-card-top">${categoryTag(mode)}${mode.supportsSolo && mode.supportsLobby ? '<span class="tag game-badge game-badge-solo">TRYB SOLO</span>' : ""}${(mode.badges || []).map(badgeTag).join("")}</div>
      <h2>${locked && !revealName ? "Nadchodzący tryb" : mode.name}</h2>
      <p class="muted">${locked && !revealName ? "Nowa rozgrywka pojawi się wkrótce." : mode.description}</p>
      ${locked ? `<div class="unlock-date"><span>${revealName ? "Dzisiaj" : "Odblokowanie"}</span><b>${revealName ? `Od ${escapeHtml(formatUnlockTime(unlock.unlockAt))}` : escapeHtml(unlock.label)}</b></div>` : ""}
      <div class="game-card-activity"><span data-game-player-count>${mode.activity?.players||0} graczy</span><span data-game-lobby-count>${mode.activity?.lobbies||0} lobby</span></div><div class="game-card-footer"><span class="players-count">${icon("users", 17)} ${mode.players}</span>${playControls}</div>
    </div>
  </article>`;
}

function lockedModeTitle(mode, unlock) {
  if (unlock.manuallyLocked) return `${mode.name} jest obecnie zablokowany`;
  if (unlock.weekly) return `${mode.name} jest w kolejce sobotnich premier`;
  return isUnlockDay(unlock.unlockAt) ? `${mode.name} odblokuje się dzisiaj o ${formatUnlockTime(unlock.unlockAt)}` : `Nowy tryb odblokuje sie ${unlock.label}`;
}

function modeUnlockAnnouncement(now = Date.now()) {
  const candidates = gamesList
    .filter(game => !game.hiddenFromLibrary && game.audience !== "pokemon" && game.audience !== "board")
    .map(game => ({ game, unlock: modeUnlockInfo(game.id, now) }))
    .filter(({ unlock }) => Boolean(unlock.unlockAt) && isUnlockDay(unlock.unlockAt, now))
    .sort((left, right) => left.unlock.unlockTime - right.unlock.unlockTime);
  if (!candidates.length) return null;
  const first = candidates[0];
  const sameUnlock = candidates.filter(item => item.unlock.unlockTime === first.unlock.unlockTime);
  return {
    games: sameUnlock.map(item => item.game),
    unlock: first.unlock,
    live: first.unlock.unlockTime <= now,
  };
}

function modeUnlockAnnouncementHtml(now = Date.now()) {
  const announcement = modeUnlockAnnouncement(now);
  if (!announcement) return "";
  const names = announcement.games.map(game => escapeHtml(game.name)).join(" i ");
  const primaryMode = announcement.games[0];
  const live = announcement.live;
  return `<section class="mode-unlock-announcement ${live ? "is-live" : ""}" aria-live="polite">
    ${live ? '<div class="mode-unlock-fireworks" aria-hidden="true"><i></i><i></i><i></i></div>' : ""}
    <div class="mode-unlock-copy"><span class="mode-unlock-icon">${live ? "🎉" : "✨"}</span><div><p class="eyebrow">${live ? "NOWY TRYB JUŻ DOSTĘPNY" : "DZISIAJ W GRACH"}</p><h2>${live ? `${names} jest już odblokowany!` : `Tryb ${names} odblokuje się dzisiaj o ${escapeHtml(formatUnlockTime(announcement.unlock.unlockAt))}`}</h2><p>${live ? "Wskakujcie do nowej rozgrywki — czeka na Was w bibliotece gier." : "Nazwa trybu jest już znana. Zagrać będzie można od godziny startu."}</p></div></div>
    ${live ? `<button class="primary mode-unlock-cta" type="button" data-unlock-mode="${escapeHtml(primaryMode.id)}">${icon("play", 17)} Zagraj teraz</button>` : `<span class="mode-unlock-time">Od ${escapeHtml(formatUnlockTime(announcement.unlock.unlockAt))}</span>`}
  </section>`;
}

function scheduleModeUnlockAnnouncementRefresh(actions, now = Date.now()) {
  clearTimeout(modeUnlockAnnouncementTimer);
  const refreshTimes = gamesList.map(game => modeUnlockInfo(game.id, now)).filter(unlock => unlock.locked).flatMap(unlock => [unlock.unlockTime - 20 * 60 * 60 * 1000, unlock.unlockTime]);
  const next = refreshTimes.filter(time => Number.isFinite(time) && time > now).sort((left, right) => left - right)[0];
  if (next) modeUnlockAnnouncementTimer = window.setTimeout(() => actions.refresh?.(), Math.max(1000, next - now + 500));
}

function compareMainModes(left, right) {
  const leftPokemon = left.audience === "pokemon", rightPokemon = right.audience === "pokemon";
  if (leftPokemon !== rightPokemon) return leftPokemon ? 1 : -1;
  const leftUnlock = modeUnlockInfo(left.id), rightUnlock = modeUnlockInfo(right.id);
  if (leftUnlock.locked !== rightUnlock.locked) return leftUnlock.locked ? 1 : -1;
  if (leftUnlock.locked && rightUnlock.locked) return leftUnlock.unlockTime - rightUnlock.unlockTime;
  return 0;
}

function normalizeModeSearch(value) {
  return String(value || "").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function visiblePoll() {
  return activePoll() || latestPoll();
}

function pollResultsHtml(state) {
  return `<div class="poll-results">${state.poll.options.map(option => {
    const count = state.totals[option.id] || 0, percent = state.total ? Math.round((count / state.total) * 100) : 0;
    return `<div class="poll-result-row"><span>${escapeHtml(option.label)}</span><b>${percent}% · ${count} gł.</b><i><em style="width:${percent}%"></em></i></div>`;
  }).join("")}</div>`;
}

function pollPanelHtml(context = {}, stateOverride = null) {
  if (!POLLS_ENABLED) return "";
  const poll = visiblePoll(), state = stateOverride || pollState(poll, context.voterId || "anonymous");
  if (!poll) return `<section class="platform-poll platform-poll-empty" id="platform-poll"><p class="eyebrow">GŁOSOWANIE</p><h2>Nie ma obecnie żadnego głosowania</h2></section>`;
  const voted = Boolean(state.vote), hot = state.active && !voted;
  return `<section class="platform-poll ${hot ? "poll-hot" : ""} ${voted ? "poll-voted" : ""} ${state.ended ? "poll-ended" : ""}" id="platform-poll" role="button" tabindex="0">
    <div><p class="eyebrow">${state.ended ? "WYNIKI GŁOSOWANIA" : "AKTYWNE GŁOSOWANIE"}</p><h2>${escapeHtml(poll.question)}</h2><p>${state.ended ? "Wyniki są już jawne." : voted ? "Głos zapisany. Wyniki pokażą się po zakończeniu." : "Kliknij i wybierz jedną odpowiedź."}</p></div>
    <strong data-poll-countdown="${escapeHtml(poll.endsAt)}">${state.ended ? `${state.total} gł.` : countdownText(poll.endsAt)}</strong>
  </section>`;
}

function sharePanelHtml() {
  return `<section class="platform-share-panel">
    <div class="share-copy">
      <p class="eyebrow">UDOSTEPNIJ STRONE</p>
      <h2>Zapros ekipę do gry</h2>
      <p class="muted">Udostepnij link znajomym albo skopiuj go i wyslij tam, gdzie umawiacie gre.</p>
      <div class="share-actions">
        <button class="primary" type="button" id="share-site-link">${icon("share", 17)} Udostepnij</button>
        <button class="ghost" type="button" id="copy-site-link">${icon("copy", 17)} Kopiuj link</button>
      </div>
    </div>
  </section>`;
}

function openGlobalStatsModal(context = {}) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal global-stats-modal enter" role="dialog" aria-modal="true" aria-labelledby="global-stats-modal-title"><button class="icon-btn global-stats-close" data-close aria-label="Zamknij">×</button>${globalStatsHtml(window.__globalStats || context.globalStats)}</section>`;
  const close = () => modal.remove();
  modal.querySelector("[data-close]").addEventListener("click", close);
  modal.addEventListener("click", event => { if (event.target === modal) close(); });
  document.body.append(modal);
  animateGlobalStats(modal);
}

async function openPollModal(context = {}, actions) {
  const poll = visiblePoll(), state = await pollStateOnline(poll, context.voterId || "anonymous"), modal = document.createElement("div");
  modal.className = "modal-backdrop";
  if (!poll) {
    modal.innerHTML = `<section class="modal poll-modal enter"><div class="modal-title"><div><p class="eyebrow">GŁOSOWANIE</p><h2>Nie ma obecnie żadnego głosowania</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><p class="muted">Wróć później, gdy pojawi się nowe pytanie.</p></section>`;
  } else {
    const ended = state.ended, voted = Boolean(state.vote);
    modal.innerHTML = `<section class="modal poll-modal enter"><div class="modal-title"><div><p class="eyebrow">${ended ? "WYNIKI" : "GŁOSOWANIE"} · do ${escapeHtml(formatPollTime(poll.endsAt))}</p><h2>${escapeHtml(poll.question)}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div>
      ${ended ? pollResultsHtml(state) : `<div class="poll-options">${poll.options.map(option => `<button class="${state.vote === option.id ? "selected-poll-option" : ""}" data-poll-option="${option.id}" ${voted ? "disabled" : ""}>${escapeHtml(option.label)}</button>`).join("")}</div><p class="muted">${voted ? "Masz już zapisany głos. Wyniki pokażą się po zakończeniu." : "Każdy gracz ma jeden głos."}</p>`}
    </section>`;
  }
  modal.querySelector("[data-close]").addEventListener("click", () => modal.remove());
  modal.querySelectorAll("[data-poll-option]").forEach(button => button.addEventListener("click", async () => {
    actions.playSound?.("poll");
    await votePoll(poll.id, context.voterId || "anonymous", button.dataset.pollOption);
    modal.remove();
    actions.refresh();
  }));
  document.body.append(modal);
}

function openRandomRoomModal(actions){
  const saved=JSON.parse(localStorage.getItem("randomRoomFilters")||"null")||gamesList.map(game=>game.id);
  const modal=document.createElement("div");modal.className="modal-backdrop random-room-modal";
  modal.innerHTML=`<section class="modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">LOSOWA GRA</p><h2>Dołącz do pokoju</h2></div><button class="icon-btn" data-close>×</button></div><p class="muted">Wybierz tryby, do których chcesz dołączać.</p><div class="random-room-filters">${gamesList.map(game=>`<label><input type="checkbox" data-random-mode="${game.id}" ${saved.includes(game.id)?"checked":""}> ${escapeHtml(game.name)}</label>`).join("")}</div><div class="modal-actions"><button class="ghost" data-close>Anuluj</button><button class="primary" id="random-room-submit">Szukaj pokoju</button></div></section>`;
  const close=()=>modal.remove();modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",close));modal.querySelector("#random-room-submit").addEventListener("click",async()=>{const modes=[...modal.querySelectorAll("[data-random-mode]:checked")].map(input=>input.dataset.randomMode);if(!modes.length)return actions.playSound?.("error");localStorage.setItem("randomRoomFilters",JSON.stringify(modes));const button=modal.querySelector("#random-room-submit");button.disabled=true;button.textContent="Szukam…";modal.querySelector(".modal").classList.add("random-room-searching");await new Promise(resolve=>setTimeout(resolve,650));const joined=await actions.joinRandomRoom(modes);if(joined)close();else{button.disabled=false;button.textContent="Szukaj pokoju";modal.querySelector(".modal").classList.remove("random-room-searching");}});document.body.append(modal);actions.playSound?.("modalOpen");
}

function weeklyUnlockHtml(snapshot) {
  const { latest, next, celebrating } = snapshot;
  const mode = latest && gamesList.find(game => game.id === latest.modeId);
  const nextDate = next ? formatUnlockDate(next.unlockAt, { weekday: "long" }) : "";
  const title = mode ? `Odblokowano: ${escapeHtml(mode.name)}` : "Sobotnie odblokowania";
  const subtitle = mode
    ? next ? `Następne odblokowanie · ${nextDate}` : "Wszystkie tryby z kolejki są już dostępne."
    : "Co sobotę o 20:00 odblokowuje się jeden losowo wybrany tryb.";
  return `<section class="mode-unlock-announcement weekly-unlock-announcement ${celebrating ? "is-live" : ""}">
    ${celebrating ? '<div class="mode-unlock-fireworks" aria-hidden="true"><i></i><i></i><i></i></div>' : ""}
    <div class="mode-unlock-copy"><span class="mode-unlock-icon" aria-hidden="true">${celebrating ? "🎆" : mode ? "🔓" : "✨"}</span><div><h2>${title}</h2><p>${escapeHtml(subtitle)}</p></div></div>
    ${mode ? `<button class="primary mode-unlock-cta" type="button" data-weekly-mode="${escapeHtml(mode.id)}">${icon("play", 17)} Otwórz tryb</button>` : `<span class="mode-unlock-time">${escapeHtml(nextDate)}</span>`}
  </section>`;
}

function watchWeeklyUnlocks(root, actions) {
  clearTimeout(weeklyUnlockTimer);
  const now = Date.now();
  const snapshot = weeklyUnlockSnapshot(now);
  const slot = root.querySelector("[data-weekly-unlock]");
  if (slot) {
    const focused = slot.contains(root.ownerDocument.activeElement);
    slot.innerHTML = weeklyUnlockHtml(snapshot);
    const button = slot.querySelector("[data-weekly-mode]");
    button?.addEventListener("click", () => actions.selectGame(button.dataset.weeklyMode));
    if (focused) button?.focus({ preventScroll: true });
    const category = snapshot.celebrating && gameCategory(gamesList.find(game => game.id === snapshot.latest.modeId));
    root.querySelectorAll("[data-home-category]").forEach(link => {
      link.classList.toggle("weekly-release-highlight", link.dataset.homeCategory === category);
    });
    const musicCount = root.querySelector("[data-home-music-count]");
    if (musicCount) musicCount.textContent = gamesList.filter(game => game.audience === "music" && !game.hiddenFromLibrary && !isModeLocked(game.id, now)).length;
  } else {
    syncWeeklyCards(root, actions, now);
  }
  if (snapshot.nextChangeAt) {
    weeklyUnlockTimer = setTimeout(() => {
      if (root.isConnected) watchWeeklyUnlocks(root, actions);
    }, Math.max(0, snapshot.nextChangeAt - Date.now()));
  }
}

export function renderPlatform(root, actions, context = {}) {
  clearInterval(pollCountdownTimer);
  clearTimeout(modeUnlockAnnouncementTimer);
  const activityStats=context.activityStats||window.__activityStats||{};
  const mobileLayout = getMobileGameLayout();
  const currentPollState = POLLS_ENABLED ? pollState(visiblePoll(), context.voterId || "anonymous") : null;
  root.innerHTML = `<main class="page platform-page home-menu-page enter">
    <div data-weekly-unlock aria-live="polite"></div>
    <section class="backpack-release" aria-label="Nowa przygoda Minecraft"><img src="./assets/minecraft/backpack/compass.png" alt="Kompas Minecraft"><div><p class="eyebrow">NOWA PRZYGODA MINECRAFT</p><h2>Droga do Alex</h2><p>Spotkaj Alex, rozwiąż zagadki po drodze i odkryj kolejne rozdziały wyprawy.</p></div><button class="primary" data-unlock-mode="minecraft-journey">Wyrusz w drogę →</button><button class="ghost" data-unlock-mode="minecraft-backpack">Ostatni plecak</button></section>
    ${homeMenuHtml(gamesList,isModeLocked)}
    <section class="platform-hero">
      <div>
        <p class="eyebrow">GRY GRUPOWE</p>
        <h1>Jedna ekipa.<br><span>Wiele sposobów</span> na dobry wieczór.</h1>
        <p>Wybierz tryb, zaproś znajomych kodem pokoju i zacznijcie grać. Bez instalowania czegokolwiek.</p>
        <form class="platform-join" id="platform-join-form">
          <div><p class="eyebrow">MASZ JUŻ POKÓJ?</p><strong>Dołącz kodem pokoju</strong></div>
          <input id="platform-room-code" placeholder="KOD POKOJU" maxlength="6" autocomplete="off">
          <input id="platform-room-pass" placeholder="hasło, jeśli prywatny" autocomplete="off">
          <button class="primary">${icon("userPlus", 17)} Dołącz</button>
        </form>
        <button class="ghost random-room-button" id="random-room">Dołącz do losowego pokoju</button>
      </div>
      <div class="hero-side-actions"><div class="hero-stack" aria-hidden="true"><div></div><div></div><div>⚡</div></div><button class="ghost global-stats-trigger" id="open-global-stats" type="button">📊 Statystyki strony</button></div>
    </section>
    ${modeUnlockAnnouncementHtml()}
    ${pollPanelHtml(context, currentPollState)}
    ${sharePanelHtml()}
     <section class="${mobileGamesSectionClass(mobileLayout)}">
       <div class="section-intro"><div><p class="eyebrow">BIBLIOTEKA GIER</p><h2>W co dziś gramy?</h2></div><p class="muted">Filtruj tryby po tym, czy są dla znajomych, dla każdego, solo albo oryginalne.</p></div>
       <div class="game-discovery-tools"><label class="game-search" for="game-search-input"><span>${icon("search", 18)}</span><input id="game-search-input" type="search" autocomplete="off" placeholder="Szukaj trybu po nazwie lub opisie…"></label><div class="game-filters" role="tablist" aria-label="Filtr trybów">${filters.map(([id, label], index) => `<button class="filter-chip ${index ? "" : "active"}" type="button" data-game-filter="${id}">${label}</button>`).join("")}</div>${mobileGameLayoutSwitchHtml(mobileLayout)}</div>
       <div class="games-grid">${gamesList.filter(game => !hubCategories.has(modeCategory(game)) && !game.hiddenFromLibrary).sort(compareMainModes).map(game=>gameCard({...game,activity:activityStats[game.id]})).join("")}${pokemonHubCard()}${boardHubCard()}${minecraftHubCard()}${musicHubCard()}</div>
    </section>
    ${homeInfoHtml()}
  </main>`;

  root.querySelector("#platform-poll")?.addEventListener("click", () => { actions.playSound?.("poll"); openPollModal(context, actions); });
  root.querySelector("#platform-poll")?.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { actions.playSound?.("poll"); openPollModal(context, actions); } });
  const countdown = root.querySelector("[data-poll-countdown]");
  if (countdown && visiblePoll() && !currentPollState.ended) {
    pollCountdownTimer = setInterval(() => { if (!countdown.isConnected) return clearInterval(pollCountdownTimer); countdown.textContent = countdownText(countdown.dataset.pollCountdown); }, 1000);
  }
  const applyGameFilters = () => {
    const filter = root.querySelector("[data-game-filter].active")?.dataset.gameFilter || "all";
    const query = normalizeModeSearch(root.querySelector("#game-search-input")?.value);
    root.querySelectorAll("[data-mode-category]").forEach(card => {
      const tags = String(card.dataset.modeTags || card.dataset.modeCategory || "").split(/\s+/);
      const searchText = normalizeModeSearch(card.dataset.modeSearch);
      card.classList.toggle("hidden-game-card", (filter !== "all" && !tags.includes(filter)) || (query && !searchText.includes(query)));
    });
  };
  root.querySelectorAll("[data-game-filter]").forEach(button => button.addEventListener("click", () => {
    root.querySelectorAll("[data-game-filter]").forEach(item => item.classList.toggle("active", item === button));
    applyGameFilters();
  }));
  root.querySelector("#game-search-input")?.addEventListener("input", applyGameFilters);
  bindHomeMenu(root, actions);
  bindMobileGameLayout(root);
  bindModePlayActions(root, actions);
  root.querySelectorAll("[data-unlock-mode]").forEach(button=>button.addEventListener("click", event => actions.selectGame(event.currentTarget.dataset.unlockMode)));
  root.querySelector("[data-pokemon-hub]")?.addEventListener("click", event => { if (!event.target.closest("button")) actions.goPokemonModes(); });
  root.querySelector("[data-open-pokemon]")?.addEventListener("click", actions.goPokemonModes);
  root.querySelector("[data-board-hub]")?.addEventListener("click", event => { if (!event.target.closest("button")) actions.goBoardModes(); });
  root.querySelector("[data-open-board]")?.addEventListener("click", actions.goBoardModes);
  root.querySelector("[data-minecraft-hub]")?.addEventListener("click", event => { if (!event.target.closest("button")) actions.goMinecraftModes(); });
  root.querySelector("[data-open-minecraft]")?.addEventListener("click", actions.goMinecraftModes);
  root.querySelector("[data-music-hub]")?.addEventListener("click", event => { if (!event.target.closest("button")) actions.goMusicModes(); });
  root.querySelector("[data-open-music]")?.addEventListener("click", actions.goMusicModes);
  bindGameCardInteractions(root);
  root.querySelector("#platform-join-form").addEventListener("submit", event => {
    event.preventDefault();
    actions.joinByCode(root.querySelector("#platform-room-code").value, root.querySelector("#platform-room-pass").value);
  });
  root.querySelector("#random-room")?.addEventListener("click", () => openRandomRoomModal(actions));
  root.querySelector("#open-global-stats")?.addEventListener("click", () => openGlobalStatsModal(context));
  const shareUrl = () => window.location.origin + window.location.pathname;
  root.querySelector("#copy-site-link")?.addEventListener("click", async () => {
    try { await navigator.clipboard?.writeText(shareUrl()); actions.playSound?.("success"); } catch {}
  });
  root.querySelector("#share-site-link")?.addEventListener("click", async () => {
    const url = shareUrl();
    try {
      if (navigator.share) await navigator.share({ title: "Gry grupowe", text: "Wbijaj do gry dla ekipy.", url });
      else await navigator.clipboard?.writeText(url);
      actions.playSound?.("success");
    } catch {}
  });
  bindPublicLinks(root, actions);
  activatePublicAds(root, "platform");
  watchWeeklyUnlocks(root, actions);
  scheduleModeUnlockAnnouncementRefresh(actions);
}
