import { escapeHtml } from "./utils.js?v=20260822-1";
import { GAMEPASS_DEFINITIONS } from "./gamePasses.js?v=20260901-9";
import { cosmetics } from "./cosmetics.js?v=20260804-1";

export const REWARD_ORDER = [
  { id:"coins-small", tier:"weak", emoji:"🪙", label:"100 monet", short:"100", probability:21 },
  { id:"xp-small", tier:"weak", emoji:"⭐", label:"50 XP", short:"XP", probability:19 },
  { id:"coins-i", tier:"weak", emoji:"🧪", label:"Potka monet I", short:"$ I", probability:16 },
  { id:"xp-i", tier:"weak", emoji:"🧪", label:"Potka XP I", short:"XP I", probability:14 },
  { id:"coins-medium", tier:"medium", emoji:"💰", label:"300 monet", short:"300", probability:8 },
  { id:"xp-medium", tier:"medium", emoji:"✨", label:"150 XP", short:"XP", probability:6 },
  { id:"coin-booster", tier:"medium", emoji:"🪙", label:"Booster monet 2×", short:"2× $", probability:4 },
  { id:"coins-ii", tier:"medium", emoji:"🧪", label:"Potka monet II", short:"$ II", probability:3.5 },
  { id:"xp-ii", tier:"medium", emoji:"🧪", label:"Potka XP II", short:"XP II", probability:3.5 },
  { id:"coins-large", tier:"strong", emoji:"💎", label:"750 monet", short:"750", probability:1.1 },
  { id:"coins-iii", tier:"strong", emoji:"🧪", label:"Potka monet III", short:"$ III", probability:1 },
  { id:"xp-iii", tier:"strong", emoji:"⭐", label:"Potka XP III", short:"XP III", probability:.95 },
  { id:"xp-booster", tier:"strong", emoji:"🚀", label:"Booster XP 3×", short:"3× XP", probability:.85 },
  { id:"random-epic-cosmetic", tier:"jackpot", emoji:"✨", label:"Losowy kosmetyk Epic+", short:"1%", probability:1 },
  { id:"random-gamepass", tier:"jackpot", emoji:"🎟️", label:"Losowy gamepass", short:"0,1%", probability:.1 },
];
const REWARD_BY_ID = Object.fromEntries(REWARD_ORDER.map(item => [item.id, item]));
const LOCAL_BOOSTER_DURATION = 6 * 60 * 60 * 1000;
const DOUBLE_LUCKY_SPIN_PASS_ID = "double-lucky-spin";
const LUCKY_SPIN_WINDOW_MS = 24 * 60 * 60 * 1000;
const RANDOM_GAMEPASS_POOL = GAMEPASS_DEFINITIONS.map(item => item.id);
const RANDOM_EPIC_COSMETIC_POOL = cosmetics.filter(item => item.price > 0 && ["epic", "legendary", "mythic"].includes(item.rarity)).map(item => item.id);

function currentGamePassLevel(profile, id) {
  const value = profile?.gamePasses?.[id];
  return typeof value === "object" ? Math.max(0, Number(value.level) || 0) : value ? Math.max(1, Number(value) || 1) : 0;
}

function pickRandomItem(pool, fallbackPool = pool) {
  const choices = pool.length ? pool : fallbackPool;
  return choices[Math.floor(Math.random() * choices.length)] || "";
}

function pickRewardItem() {
  let cursor = Math.random() * 100;
  for (const item of REWARD_ORDER) {
    cursor -= item.probability;
    if (cursor < 0) return item;
  }
  return REWARD_ORDER[0];
}

export function luckySpinStatus(profile = {}, now = Date.now()) {
  const state = profile?.luckySpin || {};
  const nextSpinAt = Number(state.nextSpinAt) || 0;
  const windowActive = nextSpinAt > now;
  const spinLimit = currentGamePassLevel(profile, DOUBLE_LUCKY_SPIN_PASS_ID) > 0 ? 2 : 1;
  const rawUsed = Number(state.spinsUsed);
  const spinsUsed = windowActive
    ? (Number.isFinite(rawUsed) ? Math.max(0, rawUsed) : (state.lastSpinAt ? 1 : 0))
    : 0;
  const spinsRemaining = Math.max(0, spinLimit - spinsUsed);
  return { nextSpinAt, windowActive, spinLimit, spinsUsed, spinsRemaining, available:!windowActive || spinsUsed < spinLimit };
}

export function drawLocalLuckySpin(profile = {}, now = Date.now()) {
  const availability = luckySpinStatus(profile, now);
  if (!availability.available) return { ok:false, code:"resource-exhausted", error:"Spin będzie dostępny ponownie później.", nextSpinAt:availability.nextSpinAt, spinsRemaining:availability.spinsRemaining };
  const item = pickRewardItem();
  const reward = { id:item.id, tier:item.tier, wheelIndex:REWARD_ORDER.indexOf(item), type:"coins", amount:0, multiplier:0, durationMs:0, itemId:"" };
  if (item.id.startsWith("coins-") && item.id.endsWith("small")) { reward.type="coins"; reward.amount=100; }
  else if (item.id === "xp-small") { reward.type="xp"; reward.amount=50; }
  else if (item.id === "coins-medium") { reward.type="coins"; reward.amount=300; }
  else if (item.id === "xp-medium") { reward.type="xp"; reward.amount=150; }
  else if (item.id === "coins-large") { reward.type="coins"; reward.amount=750; }
  else if (item.id === "coin-booster") { reward.type="coinBooster"; reward.multiplier=2; reward.durationMs=LOCAL_BOOSTER_DURATION; }
  else if (item.id === "xp-booster") { reward.type="xpBooster"; reward.multiplier=3; reward.durationMs=12 * 60 * 60 * 1000; }
  else if (item.id === "random-gamepass") {
    const available = RANDOM_GAMEPASS_POOL.filter(id => currentGamePassLevel(profile, id) < (GAMEPASS_DEFINITIONS.find(pass => pass.id === id)?.maxLevel || 1));
    reward.type="gamePass";
    reward.itemId=pickRandomItem(available, RANDOM_GAMEPASS_POOL);
  }
  else if (item.id === "random-epic-cosmetic") {
    const available = RANDOM_EPIC_COSMETIC_POOL.filter(id => !profile.ownedCosmetics?.[id]);
    reward.type="cosmetic";
    reward.itemId=pickRandomItem(available, RANDOM_EPIC_COSMETIC_POOL);
  }
  else { reward.type="potion"; reward.itemId=item.id; }

  const next = availability.windowActive ? availability.nextSpinAt : now + LUCKY_SPIN_WINDOW_MS;
  const spinsUsed = availability.windowActive ? availability.spinsUsed + 1 : 1;
  const updated = { ...profile, luckySpin:{ ...(profile.luckySpin || {}), windowStartedAt:availability.windowActive ? Number(profile.luckySpin?.windowStartedAt) || Number(profile.luckySpin?.lastSpinAt) || now : now, lastSpinAt:now, nextSpinAt:next, spinsUsed, spinLimit:availability.spinLimit, lastReward:reward } };
  const add = (key, amount) => { updated[key] = (Number(updated[key]) || 0) + amount; };
  if (reward.type === "coins") add(profile.nickOnly ? "sessionMoney" : "money", reward.amount);
  if (reward.type === "xp") add(profile.nickOnly ? "sessionXp" : "xp", reward.amount);
  if (reward.type === "gamePass" && reward.itemId) updated.gamePasses = { ...(updated.gamePasses || {}), [reward.itemId]: { level:Math.max(1, currentGamePassLevel(updated, reward.itemId)), purchasedAt:Date.now(), source:"lucky-spin" } };
  if (reward.type === "cosmetic" && reward.itemId) updated.ownedCosmetics = { ...(updated.ownedCosmetics || {}), [reward.itemId]:true };
  if (reward.type === "potion") updated.potionInventory = { ...(updated.potionInventory || {}), [reward.itemId]:(Number(updated.potionInventory?.[reward.itemId]) || 0) + 1 };
  if (reward.type === "coinBooster") updated.coinBooster = { multiplier:Math.max(Number(updated.coinBooster?.multiplier) || 1, reward.multiplier), expiresAt:Math.max(Number(updated.coinBooster?.expiresAt) || 0, now + reward.durationMs) };
  if (reward.type === "xpBooster") updated.xpBooster = { multiplier:Math.max(Number(updated.xpBooster?.multiplier) || 1, reward.multiplier), expiresAt:Math.max(Number(updated.xpBooster?.expiresAt) || 0, now + reward.durationMs) };
  return { ok:true, accepted:true, local:true, serverNow:now, nextSpinAt:next, spinsUsed, spinLimit:availability.spinLimit, spinsRemaining:Math.max(0, availability.spinLimit - spinsUsed), reward, profile:updated };
}
const formatRemaining = milliseconds => {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(total / 3600), minutes = Math.floor((total % 3600) / 60), seconds = total % 60;
  return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
};
export const isLuckySpinAvailable = (profile = {}, now = Date.now()) => luckySpinStatus(profile, now).available;

function rewardText(reward) {
  const item = REWARD_BY_ID[reward?.id];
  if (reward?.type === "gamePass") return `Gamepass: ${GAMEPASS_DEFINITIONS.find(pass => pass.id === reward.itemId)?.name || "losowy gamepass"}`;
  if (reward?.type === "cosmetic") return `Kosmetyk: ${cosmetics.find(cosmetic => cosmetic.id === reward.itemId)?.name || "losowy kosmetyk Epic+"}`;
  if (reward?.type === "potion") {
    const names = { "xp-i":"XP I", "xp-ii":"XP II", "xp-iii":"XP III", "coins-i":"Coins I", "coins-ii":"Coins II", "coins-iii":"Coins III" };
    return `Potka ${names[reward.itemId || reward.id] || "specjalna"}`;
  }
  if (!item) return "Nagroda";
  if (reward.type === "coinBooster" || reward.type === "xpBooster") return `${item.label} przez ${reward.durationMs >= 12 * 60 * 60 * 1000 ? 12 : 6} godzin`;
  return item.label;
}

const formatChance = value => `${Number(value).toLocaleString("pl-PL", { maximumFractionDigits:1 })}%`;
const ODDS_GROUPS = [
  { className:"weak", icon:"🪙", label:"Zwykłe nagrody", chance:70 },
  { className:"medium", icon:"💰", label:"Lepsze nagrody", chance:25 },
  { className:"strong", icon:"💎", label:"Mocne nagrody", chance:3.9 },
  { className:"epic", icon:"✨", label:"Kosmetyk Epic+", chance:1 },
  { className:"gamepass", icon:"🎟️", label:"Losowy gamepass", chance:.1 },
];

function updateButtonState(modal, clockOffset = 0) {
  const button = modal.querySelector("#lucky-spin-start"), countdown = modal.querySelector("[data-lucky-countdown]"), now = Date.now() + clockOffset, status = luckySpinStatus(currentProfile, now);
  const available = status.available;
  if (countdown) countdown.textContent = available
    ? (status.windowActive ? `Pozostało ${status.spinsRemaining} z ${status.spinLimit} spinów · reset za ${formatRemaining(status.nextSpinAt - now)}` : `Dostępne spiny: ${status.spinLimit}`)
    : `Następny spin za ${formatRemaining(status.nextSpinAt - now)}`;
  if (button && !modal.dataset.luckySpinning) {
    button.disabled = !available;
    button.textContent = available ? "Zakręć kołem" : "Spin niedostępny";
  }
  return available;
}

export function luckySpinModal({ profile = {}, claimSpin, closeAction, onProfileUpdated } = {}) {
  let currentProfile = { ...profile };
  let clockOffset = 0;
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal lucky-spin-modal enter" role="dialog" aria-modal="true" aria-labelledby="lucky-spin-title">
    <div class="modal-title"><div><p class="eyebrow">NAGRODY</p><h2 id="lucky-spin-title">Lucky Spin</h2></div><button class="icon-btn" data-close aria-label="Zamknij">×</button></div>
    <p class="muted lucky-spin-intro">Raz dziennie możesz zakręcić kołem i wygrać monety, XP, potki albo wyjątkową nagrodę.</p>
    <div class="lucky-wheel-area">
      <div class="lucky-wheel-pointer" aria-hidden="true">▼</div>
      <div class="lucky-wheel" data-lucky-wheel style="--lucky-segments:${REWARD_ORDER.length}" aria-label="Koło nagród">${REWARD_ORDER.map((item, index) => `<span class="lucky-wheel-label tier-${item.tier}" style="--lucky-index:${index}" title="${escapeHtml(`${item.label} — ${formatChance(item.probability)}`)}"><b>${item.emoji}</b><small>${escapeHtml(item.short)}</small><em>${formatChance(item.probability)}</em></span>`).join("")}<i class="lucky-wheel-center">★</i></div>
    </div>
    <div class="lucky-odds" aria-label="Szanse nagród">${ODDS_GROUPS.map(group => `<span class="lucky-odds-item odds-${group.className}"><b>${group.icon} ${group.label}</b><strong>${formatChance(group.chance)}</strong></span>`).join("")}</div>
    <div class="lucky-spin-result" data-lucky-result aria-live="polite">Wynik zostanie wylosowany bezpiecznie na serwerze.</div>
    <div class="lucky-spin-footer"><span class="lucky-spin-countdown" data-lucky-countdown></span><button class="primary lucky-spin-button" id="lucky-spin-start" type="button">Zakręć kołem</button></div>
  </section>`;

  const close = () => { window.clearInterval(timer); closeAction?.(modal); };
  modal.querySelector("[data-close]").addEventListener("click", close);
  modal.addEventListener("click", event => { if (event.target === modal) close(); });
  const resultNode = modal.querySelector("[data-lucky-result]");
  const wheel = modal.querySelector("[data-lucky-wheel]");
  const button = modal.querySelector("#lucky-spin-start");
  const timer = window.setInterval(() => updateButtonState(modal, clockOffset), 1000);
  updateButtonState(modal, clockOffset);

  button.addEventListener("click", async () => {
    if (modal.dataset.luckySpinning || !updateButtonState(modal, clockOffset)) return;
    modal.dataset.luckySpinning = "true";
    button.disabled = true;
    button.textContent = "Losowanie…";
    resultNode.textContent = "Serwer losuje nagrodę…";
    let response;
    try { response = await claimSpin?.(); } catch (error) {
      response = { ok:false, error:error?.message || "Nie udało się połączyć z serwerem Lucky Spin." };
    }
    if (!response?.ok) {
      if (response?.nextSpinAt) currentProfile = { ...currentProfile, luckySpin:{ ...(currentProfile.luckySpin || {}), nextSpinAt:Number(response.nextSpinAt), spinsUsed:Number(response.spinsUsed) || currentProfile.luckySpin?.spinsUsed || 1 } };
      delete modal.dataset.luckySpinning;
      const rawError = String(response?.error || "Nie udało się wykonać spinu.");
      resultNode.textContent = rawError === "internal" ? "Serwer Lucky Spin wymaga ponownego wdrożenia. Spróbuj za chwilę." : rawError;
      updateButtonState(modal, clockOffset);
      return;
    }

    clockOffset = Number(response.serverNow) ? Number(response.serverNow) - Date.now() : 0;
    const nextSpinAt = Number(response.nextSpinAt) || (Date.now() + clockOffset + LUCKY_SPIN_WINDOW_MS);
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
    const updated = { ...currentProfile, ...(response.profile || {}), luckySpin:{ ...(currentProfile.luckySpin || {}), ...(response.profile?.luckySpin || {}), nextSpinAt, spinsUsed:Number(response.spinsUsed) || Number(response.profile?.luckySpin?.spinsUsed) || 1, spinLimit:Number(response.spinLimit) || Number(response.profile?.luckySpin?.spinLimit) || luckySpinStatus(currentProfile).spinLimit } };
    currentProfile = updated;
    onProfileUpdated?.(updated);
    resultNode.innerHTML = `Wygrałeś: <strong>${escapeHtml(rewardText(reward))}</strong>`;
    button.textContent = "Odebrano";
    delete modal.dataset.luckySpinning;
    updateButtonState(modal, clockOffset);
  });
  return modal;
}
