import { escapeHtml } from "./utils.js?v=20260613-2";

const REWARD_ORDER = [
  { id:"coins-small", emoji:"🪙", label:"100 monet", short:"100" },
  { id:"coins-medium", emoji:"💰", label:"300 monet", short:"300" },
  { id:"coins-large", emoji:"💎", label:"750 monet", short:"750" },
  { id:"xp", emoji:"⭐", label:"100 XP", short:"XP" },
  { id:"coin-booster", emoji:"🤑", label:"2× monety", short:"2× $" },
  { id:"xp-booster", emoji:"🚀", label:"2× XP", short:"2× XP" },
];
const REWARD_BY_ID = Object.fromEntries(REWARD_ORDER.map(item => [item.id, item]));
const formatRemaining = milliseconds => {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(total / 3600), minutes = Math.floor((total % 3600) / 60), seconds = total % 60;
  return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
};

function rewardText(reward) {
  const item = REWARD_BY_ID[reward?.id];
  if (!item) return "Nagroda";
  if (reward.type === "coinBooster" || reward.type === "xpBooster") return `${item.label} przez 6 godzin`;
  return item.label;
}

function updateButtonState(modal, nextSpinAt, clockOffset = 0) {
  const button = modal.querySelector("#lucky-spin-start"), countdown = modal.querySelector("[data-lucky-countdown]"), now = Date.now() + clockOffset;
  const available = !nextSpinAt || nextSpinAt <= now;
  if (countdown) countdown.textContent = available ? "Darmowy spin jest dostępny" : `Następny spin za ${formatRemaining(nextSpinAt - now)}`;
  if (button && !modal.dataset.luckySpinning) {
    button.disabled = !available;
    button.textContent = available ? "Zakręć kołem" : "Spin niedostępny";
  }
  return available;
}

export function luckySpinModal({ profile = {}, claimSpin, closeAction, onProfileUpdated } = {}) {
  let currentProfile = { ...profile };
  let nextSpinAt = Number(currentProfile.luckySpin?.nextSpinAt) || 0;
  let clockOffset = 0;
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal lucky-spin-modal enter" role="dialog" aria-modal="true" aria-labelledby="lucky-spin-title">
    <div class="modal-title"><div><p class="eyebrow">NAGRODY</p><h2 id="lucky-spin-title">Lucky Spin</h2></div><button class="icon-btn" data-close aria-label="Zamknij">×</button></div>
    <p class="muted lucky-spin-intro">Raz dziennie możesz zakręcić kołem i wygrać monety, XP albo tymczasowy booster.</p>
    <div class="lucky-wheel-area">
      <div class="lucky-wheel-pointer" aria-hidden="true">▼</div>
      <div class="lucky-wheel" data-lucky-wheel aria-label="Koło nagród">${REWARD_ORDER.map((item, index) => `<span class="lucky-wheel-label" style="--lucky-index:${index}"><b>${item.emoji}</b><small>${escapeHtml(item.short)}</small></span>`).join("")}<i class="lucky-wheel-center">★</i></div>
    </div>
    <div class="lucky-spin-result" data-lucky-result aria-live="polite">Wynik zostanie wylosowany bezpiecznie na serwerze.</div>
    <div class="lucky-spin-footer"><span class="lucky-spin-countdown" data-lucky-countdown></span><button class="primary lucky-spin-button" id="lucky-spin-start" type="button">Zakręć kołem</button></div>
  </section>`;

  const close = () => { window.clearInterval(timer); closeAction?.(modal); };
  modal.querySelector("[data-close]").addEventListener("click", close);
  modal.addEventListener("click", event => { if (event.target === modal) close(); });
  const resultNode = modal.querySelector("[data-lucky-result]");
  const wheel = modal.querySelector("[data-lucky-wheel]");
  const button = modal.querySelector("#lucky-spin-start");
  const timer = window.setInterval(() => updateButtonState(modal, nextSpinAt, clockOffset), 1000);
  updateButtonState(modal, nextSpinAt, clockOffset);

  button.addEventListener("click", async () => {
    if (modal.dataset.luckySpinning || !updateButtonState(modal, nextSpinAt, clockOffset)) return;
    modal.dataset.luckySpinning = "true";
    button.disabled = true;
    button.textContent = "Losowanie…";
    resultNode.textContent = "Serwer losuje nagrodę…";
    const response = await claimSpin?.();
    if (!response?.ok) {
      if (response?.nextSpinAt) nextSpinAt = Number(response.nextSpinAt);
      delete modal.dataset.luckySpinning;
      resultNode.textContent = response?.error || "Nie udało się wykonać spinu.";
      updateButtonState(modal, nextSpinAt, clockOffset);
      return;
    }

    clockOffset = Number(response.serverNow) ? Number(response.serverNow) - Date.now() : 0;
    nextSpinAt = Number(response.nextSpinAt) || (Date.now() + clockOffset + 24 * 60 * 60 * 1000);
    const reward = response.reward || {};
    const rewardIndex = Math.max(0, REWARD_ORDER.findIndex(item => item.id === reward.id));
    const targetRotation = 360 * 6 + (360 - rewardIndex * 60 - 30);
    wheel.classList.add("is-spinning");
    wheel.style.setProperty("--lucky-rotation", `${targetRotation}deg`);
    await new Promise(resolve => window.setTimeout(resolve, 5600));
    wheel.classList.remove("is-spinning");
    const updated = { ...currentProfile, ...(response.profile || {}), luckySpin:{ ...(currentProfile.luckySpin || {}), ...(response.profile?.luckySpin || {}), nextSpinAt } };
    currentProfile = updated;
    onProfileUpdated?.(updated);
    resultNode.innerHTML = `Wygrałeś: <strong>${escapeHtml(rewardText(reward))}</strong>`;
    button.textContent = "Odebrano";
    delete modal.dataset.luckySpinning;
    updateButtonState(modal, nextSpinAt, clockOffset);
  });
  return modal;
}
