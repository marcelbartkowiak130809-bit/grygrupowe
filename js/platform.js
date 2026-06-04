import { gamesList } from "./games.js?v=20260604-7";
import { icon } from "./utils.js";

const filters = [
  ["all", "Wszystkie"],
  ["original", "Oryginalna gra"],
  ["everyone", "Gra dla kazdego"],
  ["crew", "Gra dla ekipy"],
  ["solo", "Tryb solo"],
];

function modeCategory(mode) {
  if (mode.featured) return "original";
  if (mode.supportsSolo && !mode.supportsLobby) return "solo";
  return mode.audience === "crew" ? "crew" : "everyone";
}

function categoryTag(mode) {
  const category = modeCategory(mode);
  const labels = { original:"ORYGINALNA GRA", solo:"TRYB SOLO", crew:"GRA DLA EKIPY", everyone:"GRA DLA KAZDEGO" };
  return `<span class="tag tag-category-${category}">${labels[category]}</span>`;
}

function badgeTag(type) {
  const labels = { popular:"Popularne 🔥", new:"Nowe ✨", newQuestions:"Nowe pytania ✅" };
  return labels[type] ? `<span class="tag game-badge game-badge-${type}">${labels[type]}</span>` : "";
}

function gameCard(mode) {
  return `<article class="game-card ${mode.featured ? "featured-game" : ""}" data-mode-category="${modeCategory(mode)}">
    <div class="game-visual game-visual-${mode.art}">
      <div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div>
      <span>${mode.symbol}</span>
    </div>
    <div class="game-card-content">
      <div class="game-card-top">${categoryTag(mode)}${(mode.badges || []).map(badgeTag).join("")}</div>
      <h2>${mode.name}</h2>
      <p class="muted">${mode.description}</p>
      <div class="game-card-footer"><span class="players-count">${icon("users", 17)} ${mode.players}</span><button class="primary" data-play-mode="${mode.id}">${icon("play", 17)} Zagraj</button></div>
    </div>
  </article>`;
}

export function renderPlatform(root, actions) {
  root.innerHTML = `<main class="page platform-page enter">
    <section class="platform-hero">
      <div>
        <p class="eyebrow">GRY DLA ZNAJOMYCH</p>
        <h1>Jedna ekipa.<br><span>Osiem sposobów</span> na dobry wieczór.</h1>
        <p>Wybierz tryb, zaproś znajomych kodem pokoju i zacznijcie grać. Bez instalowania czegokolwiek.</p>
        <form class="platform-join" id="platform-join-form">
          <div><p class="eyebrow">MASZ JUŻ POKÓJ?</p><strong>Dołącz kodem pokoju</strong></div>
          <input id="platform-room-code" placeholder="KOD POKOJU" maxlength="6" autocomplete="off">
          <input id="platform-room-pass" placeholder="hasło, jeśli prywatny" autocomplete="off">
          <button class="primary">${icon("userPlus", 17)} Dołącz</button>
        </form>
      </div>
      <div class="hero-stack" aria-hidden="true"><div></div><div></div><div>⚡</div></div>
    </section>
    <section class="games-section">
      <div class="section-intro"><div><p class="eyebrow">BIBLIOTEKA GIER</p><h2>W co dziś gramy?</h2></div><p class="muted">Filtruj tryby po tym, czy są dla znajomych, dla każdego, solo albo oryginalne.</p></div>
      <div class="game-filters" role="tablist" aria-label="Filtr trybow">${filters.map(([id, label], index) => `<button class="filter-chip ${index ? "" : "active"}" type="button" data-game-filter="${id}">${label}</button>`).join("")}</div>
      <div class="games-grid">${gamesList.map(gameCard).join("")}</div>
    </section>
  </main>`;

  root.querySelectorAll("[data-game-filter]").forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.gameFilter;
    root.querySelectorAll("[data-game-filter]").forEach(item => item.classList.toggle("active", item === button));
    root.querySelectorAll("[data-mode-category]").forEach(card => card.classList.toggle("hidden-game-card", filter !== "all" && card.dataset.modeCategory !== filter));
  }));
  root.querySelectorAll("[data-play-mode]").forEach(button => button.addEventListener("click", () => actions.selectGame(button.dataset.playMode)));
  root.querySelector("#platform-join-form").addEventListener("submit", event => {
    event.preventDefault();
    actions.joinByCode(root.querySelector("#platform-room-code").value, root.querySelector("#platform-room-pass").value);
  });
}
