import { escapeHtml, icon } from "./utils.js?v=20260613-2";

export const HONOR_TYPES = [
  { id:"nicePlayer", label:"Miły gracz", emoji:"👍" },
  { id:"goodOpponent", label:"Dobry przeciwnik", emoji:"🧠" },
  { id:"greatHost", label:"Świetny host", emoji:"🎉" },
];

export function honorModal({ room, accounts = {}, currentUser, submitHonor, closeAction }) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop honor-backdrop";
  const players = (room?.players || []).filter(uid => uid && uid !== currentUser);
  const cards = players.map(uid => {
    const player = accounts[uid] || room?.playerProfiles?.[uid] || {};
    const name = player.nick || "Gracz";
    return `<article class="honor-player-card" data-honor-player="${escapeHtml(uid)}">
      <div class="honor-player-name">${escapeHtml(name)}</div>
      <div class="honor-choice-list">${HONOR_TYPES.map(type => `<button class="honor-choice" data-honor-target="${escapeHtml(uid)}" data-honor-type="${type.id}"><span>${type.emoji}</span><span>${type.label}</span></button>`).join("")}</div>
    </article>`;
  }).join("");
  modal.innerHTML = `<section class="modal honor-modal enter" role="dialog" aria-modal="true" aria-labelledby="honor-title">
    <div class="modal-title"><div><p class="eyebrow">PO MECZU</p><h2 id="honor-title">Wyróżnij gracza</h2></div><button class="icon-btn" data-close aria-label="Zamknij">${icon("x",18)}</button></div>
    <p class="muted">To opcjonalne. Możesz wyróżnić jedną inną osobę albo zamknąć okno, aby pominąć.</p>
    <div class="honor-list">${cards || '<p class="muted">Brak innych uczestników do wyróżnienia.</p>'}</div>
    <p class="honor-status muted" aria-live="polite"></p>
  </section>`;
  const close = () => closeAction?.(modal);
  modal.querySelector("[data-close]").addEventListener("click", close);
  modal.addEventListener("click", event => { if (event.target === modal) close(); });
  modal.querySelectorAll("[data-honor-type]").forEach(button => button.addEventListener("click", async () => {
    const targetUid = button.dataset.honorTarget;
    const type = button.dataset.honorType;
    if (!targetUid || targetUid === currentUser) return;
    modal.querySelectorAll("[data-honor-type]").forEach(item => { item.disabled = true; item.classList.add("is-submitting"); });
    const status = modal.querySelector(".honor-status");
    status.textContent = "Zapisywanie wyróżnienia…";
    const result = await submitHonor?.({ roomId:room.roomId, fromUid:currentUser, targetUid, type });
    if (result?.ok) {
      status.textContent = "Wyróżnienie zapisane. Dzięki za dobrą atmosferę!";
      status.className = "honor-status honor-success";
      window.setTimeout(close, 900);
    } else {
      status.textContent = result?.error || "Nie udało się zapisać wyróżnienia.";
      status.className = "honor-status honor-error";
      modal.querySelectorAll("[data-honor-type]").forEach(item => { item.disabled = false; item.classList.remove("is-submitting"); });
    }
  }));
  return modal;
}
