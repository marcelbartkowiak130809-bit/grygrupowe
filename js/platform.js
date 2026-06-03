import { gamesList } from "./games.js?v=20260603-9";
import { icon } from "./utils.js";

function gameCard(mode) {
  return `<article class="game-card ${mode.featured ? "featured-game" : ""}">
    <div class="game-visual game-visual-${mode.art}">
      <div class="visual-orbit orbit-a"></div><div class="visual-orbit orbit-b"></div>
      <span>${mode.symbol}</span>
    </div>
    <div class="game-card-content">
      <div class="game-card-top">${mode.featured ? '<span class="tag">ORYGINALNA GRA</span>' : mode.supportsSolo && !mode.supportsLobby ? '<span class="tag">TRYB SOLO</span>' : '<span class="tag tag-soft">GRA DLA EKIPY</span>'}</div>
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
        <h1>Jedna ekipa.<br><span>Siedem sposobów</span> na dobry wieczór.</h1>
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
      <div class="section-intro"><div><p class="eyebrow">BIBLIOTEKA GIER</p><h2>W co dziś gramy?</h2></div><p class="muted">Każdy znajdzie coś dla siebie.</p></div>
      <div class="games-grid">${gamesList.map(gameCard).join("")}</div>
    </section>
  </main>`;
  root.querySelectorAll("[data-play-mode]").forEach(button => button.addEventListener("click", () => actions.selectGame(button.dataset.playMode)));
  root.querySelector("#platform-join-form").addEventListener("submit", event => {
    event.preventDefault();
    actions.joinByCode(root.querySelector("#platform-room-code").value, root.querySelector("#platform-room-pass").value);
  });
}
