import { escapeHtml } from "./utils.js?v=20260822-1";

export const REWARD_ORDER = [
  { id:"coins-small", tier:"weak", emoji:"🪙", label:"100 monet", short:"100" },
  { id:"xp-small", tier:"weak", emoji:"⭐", label:"50 XP", short:"XP" },
  { id:"coins-i", tier:"weak", emoji:"🧪", label:"Potka monet I", short:"$ I" },
  { id:"xp-i", tier:"weak", emoji:"🧪", label:"Potka XP I", short:"XP I" },
  { id:"coins-medium", tier:"medium", emoji:"💰", label:"300 monet", short:"300" },
  { id:"xp-medium", tier:"medium", emoji:"✨", label:"150 XP", short:"XP" },
  { id:"coin-booster", tier:"medium", emoji:"🪙", label:"Booster monet 2×", short:"2× $" },
  { id:"coins-ii", tier:"medium", emoji:"🧪", label:"Potka monet II", short:"$ II" },
  { id:"xp-ii", tier:"medium", emoji:"🧪", label:"Potka XP II", short:"XP II" },
  { id:"coins-large", tier:"strong", emoji:"💎", label:"750 monet", short:"750" },
  { id:"coins-iii", tier:"strong", emoji:"🧪", label:"Potka monet III", short:"$ III" },
  { id:"xp-iii", tier:"strong", emoji:"⭐", label:"Potka XP III", short:"XP III" },
  { id:"xp-booster", tier:"strong", emoji:"🚀", label:"Booster XP 3×", short:"3× XP" },
];
const REWARD_BY_ID = Object.fromEntries(REWARD_ORDER.map(item => [item.id, item]));
const LOCAL_TIER_WEIGHTS = { weak:70, medium:25, strong:5 };
const LOCAL_BOOSTER_DURATION = 6 * 60 * 60 * 1000;

export function drawLocalLuckySpin(profile = {}, now = Date.now()) {
  const nextSpinAt = Number(profile.luckySpin?.nextSpinAt) || 0;
  if (nextSpinAt > now) return { ok:false, code:"resource-exhausted", error:"Spin będzie dostępny ponownie później.", nextSpinAt };
  let cursor = Math.random() * 100, tier = "strong";
  for (const [candidate, weight] of Object.entries(LOCAL_TIER_WEIGHTS)) {
    cursor -= weight;
    if (cursor < 0) { tier = candidate; break; }
  }
  const pool = REWARD_ORDER.filter(item => item.tier === tier);
  const item = pool[Math.floor(Math.random() * pool.length)];
  const reward = { id:item.id, tier:item.tier, wheelIndex:REWARD_ORDER.indexOf(item), type:"coins", amount:0, multiplier:0, durationMs:0, itemId:"" };
  if (item.id.startsWith("coins-") && item.id.endsWith("small")) { reward.type="coins"; reward.amount=100; }
  else if (item.id === "xp-small") { reward.type="xp"; reward.amount=50; }
  else if (item.id === "coins-medium") { reward.type="coins"; reward.amount=300; }
  else if (item.id === "xp-medium") { reward.type="xp"; reward.amount=150; }
  else if (item.id === "coins-large") { reward.type="coins"; reward.amount=750; }
  else if (item.id === "coin-booster") { reward.type="coinBooster"; reward.multiplier=2; reward.durationMs=LOCAL_BOOSTER_DURATION; }
  else if (item.id === "xp-booster") { reward.type="xpBooster"; reward.multiplier=3; reward.durationMs=12 * 60 * 60 * 1000; }
  else { reward.type="potion"; reward.itemId=item.id; }

  const next = now + 24 * 60 * 60 * 1000;
  const updated = { ...profile, luckySpin:{ ...(profile.luckySpin || {}), lastSpinAt:now, nextSpinAt:next, lastReward:reward } };
  const add = (key, amount) => { updated[key] = (Number(updated[key]) || 0) + amount; };
  if (reward.type === "coins") add(profile.nickOnly ? "sessionMoney" : "money", reward.amount);
  if (reward.type === "xp") add(profile.nickOnly ? "sessionXp" : "xp", reward.amount);
  if (reward.type === "potion") updated.potionInventory = { ...(updated.potionInventory || {}), [reward.itemId]:(Number(updated.potionInventory?.[reward.itemId]) || 0) + 1 };
  if (reward.type === "coinBooster") updated.coinBooster = { multiplier:Math.max(Number(updated.coinBooster?.multiplier) || 1, reward.multiplier), expiresAt:Math.max(Number(updated.coinBooster?.expiresAt) || 0, now + reward.durationMs) };
  if (reward.type === "xpBooster") updated.xpBooster = { multiplier:Math.max(Number(updated.xpBooster?.multiplier) || 1, reward.multiplier), expiresAt:Math.max(Number(updated.xpBooster?.expiresAt) || 0, now + reward.durationMs) };
  return { ok:true, accepted:true, local:true, serverNow:now, nextSpinAt:next, reward, profile:updated };
}
const formatRemaining = milliseconds => {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(total / 3600), minutes = Math.floor((total % 3600) / 60), seconds = total % 60;
  return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
};
export const isLuckySpinAvailable = (profile = {}, now = Date.now()) => !Number(profile.luckySpin?.nextSpinAt) || Number(profile.luckySpin.nextSpinAt) <= now;

function rewardText(reward) {
  const item = REWARD_BY_ID[reward?.id];
  if (reward?.type === "potion") {
    const names = { "xp-i":"XP I", "xp-ii":"XP II", "xp-iii":"XP III", "coins-i":"Coins I", "coins-ii":"Coins II", "coins-iii":"Coins III" };
    return `Potka ${names[reward.itemId || reward.id] || "specjalna"}`;
  }
  if (!item) return "Nagroda";
  if (reward.type === "coinBooster" || reward.type === "xpBooster") return `${item.label} przez ${reward.durationMs >= 12 * 60 * 60 * 1000 ? 12 : 6} godzin`;
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
      <div class="lucky-wheel" data-lucky-wheel aria-label="Koło nagród">${REWARD_ORDER.map((item, index) => `<span class="lucky-wheel-label tier-${item.tier}" style="--lucky-index:${index}"><b>${item.emoji}</b><small>${escapeHtml(item.short)}</small></span>`).join("")}<i class="lucky-wheel-center">★</i></div>
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
    let response;
    try { response = await claimSpin?.(); } catch (error) {
      response = { ok:false, error:error?.message || "Nie udało się połączyć z serwerem Lucky Spin." };
    }
    if (!response?.ok) {
      if (response?.nextSpinAt) nextSpinAt = Number(response.nextSpinAt);
      delete modal.dataset.luckySpinning;
      const rawError = String(response?.error || "Nie udało się wykonać spinu.");
      resultNode.textContent = rawError === "internal" ? "Serwer Lucky Spin wymaga ponownego wdrożenia. Spróbuj za chwilę." : rawError;
      updateButtonState(modal, nextSpinAt, clockOffset);
      return;
    }

    clockOffset = Number(response.serverNow) ? Number(response.serverNow) - Date.now() : 0;
    nextSpinAt = Number(response.nextSpinAt) || (Date.now() + clockOffset + 24 * 60 * 60 * 1000);
    const reward = response.reward || {};
    const rewardIndex = Number.isInteger(reward.wheelIndex) ? reward.wheelIndex : Math.max(0, REWARD_ORDER.findIndex(item => item.id === reward.id));
    const segmentAngle = 360 / REWARD_ORDER.length;
    const targetRotation = 360 * 6 + (360 - rewardIndex * segmentAngle - segmentAngle / 2);
    wheel.classList.add("is-spinning");
    wheel.style.setProperty("--lucky-rotation", `${targetRotation}deg`);
    await new Promise(resolve => window.setTimeout(resolve, 5600));
    wheel.classList.remove("is-spinning");
    // Keep the wheel on the awarded segment after the transition instead of
    // snapping back to its initial position when the animation class is removed.
    wheel.style.setProperty("--lucky-wheel-rotation", `${targetRotation}deg`);
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
