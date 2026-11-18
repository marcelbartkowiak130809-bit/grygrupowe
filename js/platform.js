import { gamesList } from "./games.js?v=20261118-23";
import { gameCategory, filterLibraryGames, libraryGameTags, libraryModesFor, libraryModeCategory } from "./gameCategories.js?v=20261118-21";
import { homeMenuHtml, bindHomeMenu, categoryTilesHtml } from './homeMenu.js?v=20261118-21';
import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { activePoll, countdownText, formatPollTime, latestPoll, pollState, pollStateOnline, votePoll } from "./polls.js?v=20261118-20";
import { weeklyUnlockSnapshot } from "./weeklyUnlocks.js?v=20261118-14";
import { activatePublicAds, bindPublicLinks, homeInfoHtml } from "./publicPages.js?v=20261118-23";
import { escapeHtml, icon } from "./utils.js?v=20260822-1";
import { formatUnlockDate, formatUnlockTime, isModeLocked, isUnlockDay, modeUnlockInfo } from "./upcomingModes.js?v=20261118-14";
import { animateGlobalStats, globalStatsHtml } from "./globalStats.js?v=20261118-23";
import { minecraftModeIcons } from "./minecraft.js?v=20261118-13";

const filters = [
  ["main", "GŁÓWNE"],
  ["all", "WSZYSTKIE"],
  ["new", "NOWE"],
  ["newQuestions", "NOWE PYTANIA"],
  ["popular", "POPULARNE"],
  ["category", "KATEGORIE"],
  ["everyone", "GRA DLA KAŻDEGO"],
  ["crew", "GRA DLA EKIPY"],
  ["solo", "TRYB SOLO"],
];
let pollCountdownTimer;
let weeklyUnlockTimer;
let modeUnlockAnnouncementTimer;
const POLLS_ENABLED = false;
const boardModes = libraryModesFor(gamesList, "board");

function modeCategory(mode) {
  const category = gameCategory(mode);
  if (category && libraryModeCategory(mode)?.id === category) return category;
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
  const pokemonModes = libraryModesFor(gamesList, "pokemon");
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
  const minecraftModes = libraryModesFor(gamesList, "minecraft");
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
  const musicModes = libraryModesFor(gamesList, "music");
  const mobileLayout = getMobileGameLayout();
  root.innerHTML = `<main class="page platform-page music-selection-page enter"><section class="music-selection-hero"><button class="ghost" id="back-to-games">← Wróć do wszystkich trybów</button><div class="music-selection-copy"><p class="eyebrow">SPECJALNA STREFA</p><h1>MUZYKA</h1><p>Wybierajcie hity, słuchajcie krótkich previewów i sprawdzajcie, który numer wygrywa.</p></div><div class="music-selection-art" aria-hidden="true"><div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div><span>🎵</span><i>♫</i><b>HITS</b></div></section><section class="${mobileGamesSectionClass(mobileLayout)} music-games-section"><div class="section-intro"><div><p class="eyebrow">TRYBY MUZYCZNE</p><h2>W co gramy?</h2></div><span class="badge">${musicModes.length}</span>${mobileGameLayoutSwitchHtml(mobileLayout)}</div><div class="games-grid">${musicModes.map(game => gameCard({...game, activity:activityStats[game.id]})).join("")}</div></section></main>`;
  root.querySelector("#back-to-games")?.addEventListener("click", actions.goPlatform);
  bindMobileGameLayout(root);
  bindModePlayActions(root, actions);
  bindGameCardInteractions(root);
  watchWeeklyUnlocks(root, actions);
  activatePublicAds(root, "platform");
}

export function renderTikTokModes(root, actions, context = {}) {
  const activityStats = context.activityStats || window.__activityStats || {};
  const layout = getMobileGameLayout();
  const modes = libraryModesFor(gamesList, "tiktok").sort(compareMainModes);
  const now = Date.now();
  root.innerHTML = `<main class="page platform-page tiktok-selection-page enter">
    <header class="tiktok-selection-hero library-category-tiktok">
      <button class="ghost" id="back-to-games">← Biblioteka</button>
      <h1>Hity TikToka</h1><span class="tiktok-hero-note" aria-hidden="true">♪</span>
    </header>
    <section class="${mobileGamesSectionClass(layout)}">
      <div class="tiktok-library-tools">${mobileGameLayoutSwitchHtml(layout)}</div>
      <div class="games-grid">${modes.map(mode => gameCard({ ...mode, activity:activityStats[mode.id] },now,"collection")).join("")}</div>
    </section>
  </main>`;
  root.querySelector("#back-to-games").addEventListener("click", actions.goPlatform);
  bindHomeMenu(root, actions);
  bindMobileGameLayout(root);
  bindModePlayActions(root, actions);
  bindGameCardInteractions(root);
  watchWeeklyUnlocks(root, actions);
  activatePublicAds(root, "platform");
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
      template.innerHTML = gameCard({ ...mode, activity: activity[mode.id] }, now, card.dataset.libraryContext || "");
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

function filterTag(label, css, filter) {
  return filter
    ? `<button class="tag ${css}" type="button" data-card-filter="${filter}">${label}</button>`
    : `<span class="tag ${css}">${label}</span>`;
}

function categoryTag(mode, context) {
  const category = modeCategory(mode);
  if (category === "pokemon" || category === "music" || (context && libraryModeCategory(mode))) return "";
  const labels = { solo:"TRYB SOLO", crew:"GRA DLA EKIPY", everyone:"GRA DLA KAŻDEGO", board:"PLANSZÓWKI", minecraft:"MINECRAFT" };
  const filter = context === "home" && ["solo","crew","everyone"].includes(category) ? category : "";
  return filterTag(labels[category], `tag-category-${category}`, filter);
}

function badgeTag(type, context) {
  const labels = { popular:"Popularne 🔥", new:"Nowe ✨", newQuestions:"Nowe pytania ✅" };
  const filter = context === "home" && ["new","popular","newQuestions"].includes(type) ? type : "";
  return labels[type] ? filterTag(labels[type], `game-badge game-badge-${type}`, filter) : "";
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

function gameCard(mode, now = Date.now(), context = "") {
  const unlock = modeUnlockInfo(mode.id, now), locked = unlock.locked, revealName = locked && isUnlockDay(unlock.unlockAt);
  const origin = context && libraryModeCategory(mode);
  const originLink = origin && !(context === "collection" && origin.id === "tiktok")
    ? `<a class="library-card-origin library-category-${origin.id}" href="${origin.path}" data-home-category="${origin.id}" title="${origin.name}" aria-label="Kategoria: ${origin.name}">${origin.symbol}<span aria-hidden="true">↗</span></a>`
    : "";
    const soloModeId = mode.soloModeId || (mode.id === "popularnosc-hitow" ? "popularnosc-solo" : "");
  const soloAvailable = soloModeId && !isModeLocked(soloModeId);
    const soloOnly = Boolean(soloModeId && !mode.supportsLobby);
  const playControls = soloModeId && !locked
    ? soloOnly
          ? `<div class="game-card-play-options"><button class="primary" data-play-solo-mode="${escapeHtml(soloModeId)}">${mode.id === "songspot" ? "🎧" : mode.id === "dokoncz-tekst" ? "🎤" : "🔥"} Solo</button></div>`
          : `<div class="game-card-play-options"><button class="primary" data-play-mode="${mode.id}">${icon("play", 17)} Pokój</button>${soloAvailable ? `<button class="ghost" data-play-solo-mode="${escapeHtml(soloModeId)}">${mode.id === "dokoncz-tekst" ? "🎤" : mode.id === "songspot" ? "🎧" : "🔥"} Solo</button>` : ""}</div>`
    : `<button class="${locked ? "ghost locked-play-button" : "primary"}" data-play-mode="${mode.id}">${locked ? icon("lock", 17) + " Niedostepne" : icon("play", 17) + " Zagraj"}</button>`;
  return `<article class="game-card ${mode.featured ? "featured-game" : ""} ${locked ? "locked-game-card coming-soon-card" : ""} ${revealName ? "unlock-day-card" : ""} ${unlock.celebrating ? "weekly-release-highlight" : ""}" data-game-id="${mode.id}" data-library-context="${context}" ${locked ? `data-mode-locked="true" title="${escapeHtml(lockedModeTitle(mode, unlock))}"` : ""}>
    <div class="game-visual game-visual-${mode.art}">
      <div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div>
      <span>${revealName ? visualSymbol(mode) : locked ? "???" : visualSymbol(mode)}</span>
      ${locked ? `<div class="coming-lock ${revealName ? "is-revealed" : ""}">${revealName ? `<small>DZIŚ O ${escapeHtml(formatUnlockTime(unlock.unlockAt))}</small>` : icon("lock", 50)}<b>${revealName ? "WKRÓTCE" : "???"}</b></div>` : ""}
      ${originLink}
    </div>
    <div class="game-card-content">
      <div class="game-card-top">${categoryTag(mode, context)}${mode.supportsLobby && libraryGameTags(mode).includes("solo") ? filterTag("TRYB SOLO", "game-badge game-badge-solo", context === "home" ? "solo" : "") : ""}${(mode.badges || []).map(type => badgeTag(type,context)).join("")}</div>
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
    const mode = snapshot.celebrating && gamesList.find(game => game.id === snapshot.latest.modeId);
    root.querySelectorAll("[data-home-category]").forEach(link => {
      const category = link.dataset.homeCategory;
      link.classList.toggle("weekly-release-highlight", Boolean(mode && (gameCategory(mode) === category || mode.collections?.includes(category))));
    });
    const musicCount = root.querySelector("[data-home-music-count]");
    if (musicCount) musicCount.textContent = gamesList.filter(game => game.audience === "music" && !game.hiddenFromLibrary && !isModeLocked(game.id, now)).length;
  }
  syncWeeklyCards(root, actions, now);
  if (snapshot.nextChangeAt) {
    weeklyUnlockTimer = setTimeout(() => {
      if (root.isConnected) watchWeeklyUnlocks(root, actions);
    }, Math.max(0, snapshot.nextChangeAt - Date.now()));
  }
}

function bindLibraryFilters(root, actions, initialActivity) {
  const search = root.querySelector("#game-search-input");
  const grid = root.querySelector(".games-grid");
  const categories = root.querySelector(".library-filter-categories");
  const empty = root.querySelector(".library-empty");
  const chips = [...root.querySelectorAll("[data-game-filter]")];
  let filter = "main";
  let rendered;
  const render = () => {
    const showCategories = filter === "category";
    const matches = filterLibraryGames(gamesList,filter,search.value).sort(compareMainModes);
    const key = matches.map(mode => mode.id).join(",");
    categories.hidden = !showCategories;
    grid.hidden = showCategories || !matches.length;
    empty.hidden = showCategories || Boolean(matches.length);
    if (rendered === key) return;
    rendered = key;
    const now = Date.now(), activity = window.__activityStats || initialActivity;
    grid.innerHTML = matches.map(mode => gameCard({ ...mode, activity:activity[mode.id] },now,"home")).join("");
    bindModePlayActions(grid,actions);
  };
  const select = id => {
    filter = id;
    chips.forEach(chip => {
      const active = chip.dataset.gameFilter === filter;
      chip.classList.toggle("active",active);
      chip.setAttribute("aria-pressed",String(active));
    });
    render();
  };
  chips.forEach(chip => chip.addEventListener("click", () => select(chip.dataset.gameFilter)));
  grid.addEventListener("click", event => {
    const tag = event.target.closest?.("[data-card-filter]");
    if (!tag) return;
    const id = tag.dataset.cardFilter;
    select(id);
    chips.find(chip => chip.dataset.gameFilter === id)?.focus();
  });
  search.addEventListener("input", () => filter === "category" ? select("all") : render());
  render();
}

export function renderPlatform(root, actions, context = {}) {
  clearInterval(pollCountdownTimer);
  clearTimeout(modeUnlockAnnouncementTimer);
  const activityStats=context.activityStats||window.__activityStats||{};
  const mobileLayout = getMobileGameLayout();
  const currentPollState = POLLS_ENABLED ? pollState(visiblePoll(), context.voterId || "anonymous") : null;
  root.innerHTML = `<main class="page platform-page home-menu-page enter">
    <div data-weekly-unlock aria-live="polite"></div>
    <nav class="library-categories" aria-label="Kategorie gier">
      <h2>Kategorie</h2><div class="library-category-grid">${categoryTilesHtml(gamesList)}</div>
    </nav>
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
       <div class="section-intro"><div><p class="eyebrow">BIBLIOTEKA GIER</p><h2>W co dziś gramy?</h2></div></div>
       <div class="game-discovery-tools"><label class="game-search" for="game-search-input"><span>${icon("search", 18)}</span><input id="game-search-input" type="search" autocomplete="off" placeholder="Szukaj trybu…"></label><div class="game-filters" role="group" aria-label="Filtr trybów">${filters.map(([id, label], index) => `<button class="filter-chip ${index ? "" : "active"}" type="button" data-game-filter="${id}" aria-pressed="${!index}">${label}</button>`).join("")}</div>${mobileGameLayoutSwitchHtml(mobileLayout)}</div>
       <div class="library-category-grid library-filter-categories" hidden>${categoryTilesHtml(gamesList)}</div>
       <div class="games-grid"></div><p class="library-empty" role="status" hidden>Brak pasujących gier.</p>
    </section>
    ${homeInfoHtml()}
  </main>`;

  root.querySelector("#platform-poll")?.addEventListener("click", () => { actions.playSound?.("poll"); openPollModal(context, actions); });
  root.querySelector("#platform-poll")?.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { actions.playSound?.("poll"); openPollModal(context, actions); } });
  const countdown = root.querySelector("[data-poll-countdown]");
  if (countdown && visiblePoll() && !currentPollState.ended) {
    pollCountdownTimer = setInterval(() => { if (!countdown.isConnected) return clearInterval(pollCountdownTimer); countdown.textContent = countdownText(countdown.dataset.pollCountdown); }, 1000);
  }
  bindLibraryFilters(root, actions, activityStats);
  bindHomeMenu(root, actions);
  bindMobileGameLayout(root);
  root.querySelectorAll("[data-unlock-mode]").forEach(button=>button.addEventListener("click", event => actions.selectGame(event.currentTarget.dataset.unlockMode)));
  bindModePlayActions(root.querySelector(".home-quick-picks"), actions);
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
