import { gamesList } from "./games.js?v=20261127-14";
import { gameCategory, filterLibraryGames, libraryCategories, libraryGameTags, libraryModesFor, libraryModeCategory } from "./gameCategories.js?v=20261118-30";
import { homeMusicFeatureHtml, homeModePicks, bindHomeMenu, categoryTilesHtml } from './homeMenu.js?v=20261122-7';
import {frontsTileHtml,watchFrontsLaunch} from './fronts/launchView.mjs?v=1';
import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { activePoll, countdownText, formatPollTime, latestPoll, pollState, pollStateOnline, votePoll } from "./polls.js?v=20261124-2";
import { weeklyUnlockSnapshot } from "./weeklyUnlocks.js?v=20261122-7";
import { activatePublicAds, bindPublicLinks, homeInfoHtml } from "./publicPages.js?v=20261127-14";
import { escapeHtml, icon } from "./utils.js?v=20261121-8";
import { formatUnlockDate, formatUnlockTime, isModeLocked, isUnlockDay, modeUnlockInfo } from "./upcomingModes.js?v=20261122-7";
import { animateGlobalStats, globalStatsHtml } from "./globalStats.js?v=20261127-14";
import { minecraftModeIcons } from "./minecraft.js?v=20261121-12";

const filters = [
  ["main", "KATEGORIE"],
  ["all", "WSZYSTKIE"],
  ["new", "NOWE"],
  ["newQuestions", "NOWE PYTANIA"],
  ["popular", "POPULARNE"],
  ["everyone", "GRA DLA KAŻDEGO"],
  ["crew", "GRA DLA EKIPY"],
  ["solo", "TRYB SOLO"],
];
let pollCountdownTimer;
let weeklyUnlockTimer;
let modeUnlockAnnouncementTimer;
const POLLS_ENABLED = false;

function modeCategory(mode) {
  const category = gameCategory(mode);
  if (["pokemon", "music", "minecraft", "board"].includes(category)) return category;
  if (mode.supportsSolo && !mode.supportsLobby) return "solo";
  return mode.audience === "crew" ? "crew" : "everyone";
}

function bindModePlayActions(root, actions) {
  root.querySelectorAll("[data-play-mode]").forEach(button => button.addEventListener("click", () => actions.selectGame(button.dataset.playMode)));
  root.querySelectorAll("[data-play-solo-mode]").forEach(button => button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    actions.selectSoloGame(button.dataset.playSoloMode);
  }));
}

export const categoryDescriptions = {
  music: "Zgaduj utwory, porównuj popularność hitów i wybieraj zwycięzców muzycznych pojedynków.",
  tiktok: "Zagraj w popularne wyzwania z TikToka, od Impostora po Połącz nas.",
  minecraft: "Buduj, rozwiązuj łamigłówki i wyrusz na poszukiwanie Alex.",
  board: "Zagraj w klasyczne planszówki, gry słowne i kalambury.",
  pokemon: "Sprawdź znajomość Pokémonów lub wylicytuj własną drużynę.",
  knowledge: "Sprawdź się w quizach, licytuj odpowiedzi i podawaj własne szacunki.",
  other: "Wybieraj między dwiema opcjami albo sprawdź, jak dobrze znasz swoją ekipę.",
};

function categoryArtwork(id, symbol) {
  if (id === "pokemon") {
    const mewtwo = pokemonDex.find(item => item.id === 150);
    if (mewtwo) return `<img src="${mewtwo.sprite}" alt="" onerror="this.onerror=null;this.src='${mewtwo.spriteFallback}'">`;
  }
  if (id === "minecraft") return `<img class="collection-art-pixelated" src="${minecraftModeIcons["minecraft-sprint"]}" alt="">`;
  return symbol;
}

export function renderCollectionModes(root, actions, categoryId, context = {}) {
  const { id, name, symbol } = libraryCategories.find(category => category.id === categoryId);
  const activityStats = context.activityStats || window.__activityStats || {};
  const layout = getMobileGameLayout();
  const modes = libraryModesFor(gamesList, id);
  const now = Date.now();
  if (id === "board") modes.sort((left,right)=>Number(isModeLocked(left.id,now))-Number(isModeLocked(right.id,now)));
  else if (["tiktok", "knowledge", "other"].includes(id)) modes.sort(compareMainModes);
  root.innerHTML = `<main class="page platform-page collection-selection-page ${id}-selection-page enter">
    <header class="collection-selection-hero library-category-${id}">
      <button class="ghost" id="back-to-games" type="button">← Wróć do wszystkich trybów</button>
      <div class="collection-hero-copy"><h1>${name}</h1><p>${categoryDescriptions[id]}</p></div>
      <div class="collection-hero-symbol" aria-hidden="true">${categoryArtwork(id, symbol)}</div>
    </header>
    <section class="${mobileGamesSectionClass(layout)} ${id}-games-section" aria-label="Tryby w kategorii ${name}">
      <div class="collection-library-tools">${mobileGameLayoutSwitchHtml(layout)}</div>
      <div class="games-grid">${modes.map(mode => gameCard({ ...mode, activity:activityStats[mode.id] },now,id)).join("")}</div>
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
      if (!locked && fresh.dataset.libraryContext === "board") {
        const grid = fresh.parentElement;
        const firstLocked = grid.querySelector("[data-mode-locked]");
        if (firstLocked) grid.insertBefore(fresh,firstLocked);
      }
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
  if (category === "pokemon" || category === "music" || (context && gameCategory(mode) !== "other")) return "";
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

function gameCardArtwork(mode, showArtwork) {
  if (!showArtwork) return '<span aria-hidden="true">???</span>';
  if (mode.art === "board-letter-table") return `<div class="cover-letter-grid" aria-hidden="true"></div>
    <span class="cover-letters" aria-hidden="true"><i>G<small>3</small></i><i>R<small>1</small></i><i>A<small>1</small></i></span>`;
  if (mode.art === "bomb") return `<span class="cover-bomb" aria-hidden="true"><i class="cover-bomb-body"></i><i class="cover-bomb-fuse"></i><i class="cover-bomb-spark"></i><i class="cover-bomb-burst"></i></span>`;
  return `<span class="cover-symbol" aria-hidden="true">${visualSymbol(mode)}</span>`;
}

function gameCard(mode, now = Date.now(), context = "") {
  const unlock = modeUnlockInfo(mode.id, now), locked = unlock.locked, revealName = locked && isUnlockDay(unlock.unlockAt);
  const origin = context && libraryModeCategory(mode);
  const originLink = origin && origin.id !== context
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
    <div class="game-visual ${locked && !revealName ? "" : `game-visual-${mode.art}`}">
      <div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div>
      ${gameCardArtwork(mode, !locked || revealName)}
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
    syncHomePicks(root, actions, now);
  }
  syncWeeklyCards(root, actions, now);
  if (snapshot.nextChangeAt) {
    weeklyUnlockTimer = setTimeout(() => {
      if (root.isConnected) watchWeeklyUnlocks(root, actions);
    }, Math.max(0, snapshot.nextChangeAt - Date.now()));
  }
}

const homeRecommendations = new WeakMap();

function syncHomePicks(root, actions, now) {
  const slot = root.querySelector("[data-home-picks]");
  if (!slot) return;
  const {latest, recommended} = homeModePicks(gamesList, now, homeRecommendations.get(root));
  homeRecommendations.set(root, recommended);
  const key = [latest?.mode.id, latest?.updated, ...recommended.map(mode => mode.id)].join("/");
  if (slot.dataset.picks === key) return;
  slot.dataset.picks = key;
  const pick = mode => `<button class="home-pick library-category-${gameCategory(mode)}" type="button" data-play-mode="${mode.id}">
    <span class="home-pick-icon" aria-hidden="true">${visualSymbol(mode)}</span><span>${escapeHtml(mode.name)}</span><i aria-hidden="true">↗</i>
  </button>`;
  slot.innerHTML = `<section aria-labelledby="home-recommended-heading">
    <h2 id="home-recommended-heading">Polecane</h2>
    <div class="home-recommended-grid">${recommended.map(pick).join("")}</div>
  </section>${latest ? `<section class="home-latest" aria-labelledby="home-latest-heading">
    <h2 id="home-latest-heading">${latest.updated ? "Ostatnio ulepszone" : "Najnowszy tryb"}</h2>
    ${pick(latest.mode)}
  </section>` : ""}`;
  bindModePlayActions(slot, actions);
}

function bindLibraryFilters(root, actions, initialActivity) {
  const search = root.querySelector("#game-search-input");
  const grid = root.querySelector(".games-grid");
  const categories = root.querySelector(".library-filter-categories");
  const empty = root.querySelector(".library-empty");
  const mobileLayout = root.querySelector("[data-library-layout]");
  const chips = [...root.querySelectorAll("[data-game-filter]")];
  let filter = "main";
  let rendered;
  const render = () => {
    const showCategories = filter === "main" && !search.value.trim();
    const matches = filterLibraryGames(gamesList,filter,search.value).sort(compareMainModes);
    const key = matches.map(mode => mode.id).join(",");
    categories.hidden = !showCategories;
    mobileLayout.hidden = showCategories || !matches.length;
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
  search.addEventListener("input", render);
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
    ${homeMusicFeatureHtml()}
    <div class="home-picks" data-home-picks></div>
     <section class="${mobileGamesSectionClass(mobileLayout)}">
       <div class="section-intro"><h2>Biblioteka gier</h2></div>
       <div class="game-discovery-tools">
         <label class="game-search" for="game-search-input"><span aria-hidden="true">${icon("search", 16)}</span><input id="game-search-input" type="search" autocomplete="off" placeholder="Szukaj trybu…" aria-label="Szukaj trybu"></label>
         <div class="game-filters" role="group" aria-label="Filtr trybów">${filters.map(([id, label], index) => `<button class="filter-chip ${index ? "" : "active"}" type="button" data-game-filter="${id}" aria-pressed="${!index}">${label}</button>`).join("")}</div>
         <div data-library-layout hidden>${mobileGameLayoutSwitchHtml(mobileLayout)}</div>
       </div>
       <nav class="library-category-grid library-filter-categories" aria-label="Kategorie gier">${categoryTilesHtml(gamesList)}${frontsTileHtml(context.clock?.())}</nav>
       <div class="games-grid"></div><p class="library-empty" role="status" hidden>Brak pasujących gier.</p>
    </section>
    <section class="home-join" aria-labelledby="home-join-heading">
      <h2 id="home-join-heading">Dołącz do pokoju</h2>
      <form class="home-join-form" id="platform-join-form">
        <label for="platform-room-code">Kod pokoju<input id="platform-room-code" placeholder="np. ABC123" maxlength="6" autocomplete="off"></label>
        <label for="platform-room-pass">Hasło<input id="platform-room-pass" placeholder="Opcjonalne" autocomplete="off"></label>
        <button class="primary" type="submit">${icon("userPlus", 17)} Dołącz</button>
      </form>
      <div class="home-join-options">
        <button class="ghost" id="random-room" type="button"><span aria-hidden="true">🎲</span> Losowy pokój</button>
        <button class="ghost" id="open-global-stats" type="button"><span aria-hidden="true">📊</span> Statystyki strony</button>
      </div>
    </section>
    ${modeUnlockAnnouncementHtml()}
    ${pollPanelHtml(context, currentPollState)}
    ${sharePanelHtml()}
    ${homeInfoHtml()}
  </main>`;

  const seal = root.querySelector('.home-fronts-tile.fronts-seal');
  watchFrontsLaunch(seal, context.clock || Date.now, now => {
    const focused = document.activeElement === seal;
    seal.outerHTML = frontsTileHtml(now);
    const tile = root.querySelector('.home-fronts-tile');
    tile.classList.add('fronts-unsealed');
    if (focused) tile.focus();
  });
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
