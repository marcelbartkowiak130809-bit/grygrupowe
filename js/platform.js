import { gamesList } from "./games.js?v=20260822-5";
import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { activePoll, countdownText, formatPollTime, latestPoll, pollState, pollStateOnline, votePoll } from "./polls.js?v=20260822-4";
import { activatePublicAds, bindPublicLinks, homeInfoHtml } from "./publicPages.js?v=20260822-1";
import { escapeHtml, icon } from "./utils.js?v=20260822-1";
import { modeUnlockInfo } from "./upcomingModes.js?v=20260823-1";
import { animateGlobalStats, globalStatsHtml } from "./globalStats.js?v=20260804-1";

const filters = [
  ["all", "WSZYSTKIE"],
  ["new", "NOWE"],
  ["popular", "POPULARNE"],
  ["everyone", "GRA DLA KAŻDEGO"],
  ["crew", "GRA DLA EKIPY"],
  ["solo", "TRYB SOLO"],
];
let pollCountdownTimer;
const POLLS_ENABLED = false;

function modeCategory(mode) {
  if (mode.audience === "pokemon") return "pokemon";
  if (mode.supportsSolo && !mode.supportsLobby) return "solo";
  return mode.audience === "crew" ? "crew" : "everyone";
}

export function renderPokemonModes(root, actions, context = {}) {
  const activityStats = context.activityStats || window.__activityStats || {};
  const pokemonModes = gamesList.filter(game => game.audience === "pokemon");
  const mewtwo = pokemonDex.find(item => item.id === 150);
  root.innerHTML = `<main class="page platform-page pokemon-selection-page enter"><section class="pokemon-selection-hero"><button class="ghost" id="back-to-games">← Wróć do wszystkich trybów</button><div class="pokemon-selection-copy"><p class="eyebrow">SPECJALNA STREFA</p><h1>POKEMONY</h1><p>Wybierzcie sposób rywalizacji z Pokémonami.</p></div><div class="pokemon-selection-art">${mewtwo ? `<img src="${mewtwo.sprite}" alt="Mewtwo" onerror="this.onerror=null;this.src='${mewtwo.spriteFallback}'">` : "🧬"}</div></section><section class="games-section pokemon-games-section"><div class="section-intro"><div><p class="eyebrow">TRYBY POKÉMON</p><h2>W co gramy?</h2></div><span class="badge">${pokemonModes.length}</span></div><div class="games-grid">${pokemonModes.map(game=>gameCard({...game,activity:activityStats[game.id]})).join("")}</div></section></main>`;
  root.querySelector("#back-to-games")?.addEventListener("click", actions.goPlatform);
  root.querySelectorAll("[data-play-mode]").forEach(button => button.addEventListener("click", () => actions.selectGame(button.dataset.playMode)));
  root.querySelectorAll(".game-card").forEach(card => card.addEventListener("dblclick", () => card.querySelector("[data-play-mode]")?.click()));
  activatePublicAds(root, "platform");
}

function modeFilterTags(mode) {
  return [modeCategory(mode), mode.supportsSolo ? "solo" : "", ...(mode.badges || [])].filter(Boolean).join(" ");
}

function categoryTag(mode) {
  const category = modeCategory(mode);
  if (mode.audience === "pokemon") return "";
  const labels = { solo:"TRYB SOLO", crew:"GRA DLA EKIPY", everyone:"GRA DLA KAZDEGO", pokemon:"POKEMONY" };
  return `<span class="tag tag-category-${category}">${labels[category]}</span>`;
}

function badgeTag(type) {
  const labels = { popular:"Popularne 🔥", new:"Nowe ✨", newQuestions:"Nowe pytania ✅" };
  return labels[type] ? `<span class="tag game-badge game-badge-${type}">${labels[type]}</span>` : "";
}

const pokemonCardIds = { "pokemon-dex":25, "pokemon-last-letter":133, "pokemon-evolution":1, "pokemon-auction":149, "pokemon-types":7, "pokemon-match-type":4 };
const newModeIcons = { wavelength:"🌈", quiz:"🎲", mathematics:"🧮", marker:"🖍️", sequence:"🔐", family:"📊", "word-chain":"🔗" };
function visualSymbol(mode) {
  if (newModeIcons[mode.id]) return newModeIcons[mode.id];
  const item = pokemonDex.find(pokemon => pokemon.id === pokemonCardIds[mode.id]);
  return item ? `<img src="${item.sprite}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null;this.src='${item.spriteFallback}'">` : mode.symbol;
}

function pokemonHubCard() {
  const mewtwo = pokemonDex.find(item => item.id === 150);
  return `<article class="game-card pokemon-hub-card" data-pokemon-hub><div class="game-visual game-visual-pokemon-hub"><div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div><span>${mewtwo ? `<img src="${mewtwo.sprite}" alt="Mewtwo" onerror="this.onerror=null;this.src='${mewtwo.spriteFallback}'">` : "🧬"}</span><b class="pokemon-hub-badge">POKÉMON</b></div><div class="game-card-content"><div class="game-card-top"><span class="tag tag-category-pokemon">KOLEKCJA TRYBÓW</span></div><h2>POKEMONY</h2><p class="muted">Rywalizujcie w specjalnych trybach z Pokémonami: Pokédex, ewolucje, typy, aukcja i więcej.</p><div class="game-card-activity"><span>6 trybów</span><span>MEWTWO CZEKA</span></div><div class="game-card-footer"><span class="players-count">🧬 SPECJALNA STREFA</span><button class="primary" data-open-pokemon>Wybierz tryb</button></div></div></article>`;
}

function gameCard(mode) {
  const unlock = modeUnlockInfo(mode.id), locked = unlock.locked;
  const searchText = escapeHtml(`${mode.name} ${mode.description}`.toLocaleLowerCase("pl-PL"));
  return `<article class="game-card ${mode.featured ? "featured-game" : ""} ${locked ? "locked-game-card coming-soon-card" : ""}" data-mode-category="${modeCategory(mode)}" data-mode-tags="${modeFilterTags(mode)}" data-mode-search="${searchText}" ${locked ? `data-mode-locked="true" title="${escapeHtml(lockedModeTitle(mode, unlock))}"` : ""}>
    <div class="game-visual game-visual-${mode.art}">
      <div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div>
      <span>${locked ? "???" : visualSymbol(mode)}</span>
      ${locked ? `<div class="coming-lock">${icon("lock", 50)}<b>???</b></div>` : ""}
    </div>
    <div class="game-card-content">
      <div class="game-card-top">${categoryTag(mode)}${mode.supportsSolo && mode.supportsLobby ? '<span class="tag game-badge game-badge-solo">TRYB SOLO</span>' : ""}${(mode.badges || []).map(badgeTag).join("")}</div>
      <h2>${locked ? "Nadchodzący tryb" : mode.name}</h2>
      <p class="muted">${locked ? "Nowa rozgrywka pojawi się wkrótce." : mode.description}</p>
      ${locked ? `<div class="unlock-date"><span>Odblokowanie</span><b>${escapeHtml(unlock.label)}</b></div>` : ""}
      <div class="game-card-activity"><span>${mode.activity?.players||0} graczy</span><span>${mode.activity?.lobbies||0} lobby</span></div><div class="game-card-footer"><span class="players-count">${icon("users", 17)} ${mode.players}</span><button class="${locked ? "ghost locked-play-button" : "primary"}" data-play-mode="${mode.id}">${locked ? icon("lock", 17) + " Niedostepne" : icon("play", 17) + " Zagraj"}</button></div>
    </div>
  </article>`;
}

function lockedModeTitle(mode, unlock) {
  return `Nowy tryb odblokuje sie ${unlock.label}`;
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
  modal.innerHTML = `<section class="modal global-stats-modal enter" role="dialog" aria-modal="true" aria-labelledby="global-stats-modal-title"><button class="icon-btn global-stats-close" data-close aria-label="Zamknij">×</button>${globalStatsHtml(context.globalStats || window.__globalStats)}</section>`;
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

export async function renderPlatform(root, actions, context = {}) {
  clearInterval(pollCountdownTimer);
  const activityStats=context.activityStats||window.__activityStats||{};
  const currentPollState = POLLS_ENABLED ? await pollStateOnline(visiblePoll(), context.voterId || "anonymous") : null;
  root.innerHTML = `<main class="page platform-page enter">
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
    ${pollPanelHtml(context, currentPollState)}
    ${sharePanelHtml()}
    <section class="games-section">
      <div class="section-intro"><div><p class="eyebrow">BIBLIOTEKA GIER</p><h2>W co dziś gramy?</h2></div><p class="muted">Filtruj tryby po tym, czy są dla znajomych, dla każdego, solo albo oryginalne.</p></div>
      <div class="game-discovery-tools"><label class="game-search" for="game-search-input"><span>${icon("search", 18)}</span><input id="game-search-input" type="search" autocomplete="off" placeholder="Szukaj trybu po nazwie lub opisie…"></label><div class="game-filters" role="tablist" aria-label="Filtr trybów">${filters.map(([id, label], index) => `<button class="filter-chip ${index ? "" : "active"}" type="button" data-game-filter="${id}">${label}</button>`).join("")}</div></div>
      <div class="games-grid">${gamesList.filter(game => game.audience !== "pokemon").map(game=>gameCard({...game,activity:activityStats[game.id]})).join("")}${pokemonHubCard()}</div>
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
  root.querySelectorAll("[data-play-mode]").forEach(button => button.addEventListener("click", () => actions.selectGame(button.dataset.playMode)));
  root.querySelector("[data-pokemon-hub]")?.addEventListener("click", event => { if (!event.target.closest("button")) actions.goPokemonModes(); });
  root.querySelector("[data-open-pokemon]")?.addEventListener("click", actions.goPokemonModes);
  root.querySelectorAll(".game-card").forEach(card => card.addEventListener("dblclick", () => {
    const button = card.querySelector("[data-play-mode]");
    if (button) actions.selectGame(button.dataset.playMode);
  }));
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
}
