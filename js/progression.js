import { cosmeticPreview, cosmetics } from "./cosmetics.js?v=20260602-6";

const reward = (level, type, value, label) => ({ level, type, value, label });

export const trophyRoad = [
  reward(2, "money", 100, "100 coinów"),
  reward(3, "cosmetic", "blueNick", "Niebieski nick"),
  reward(4, "money", 150, "150 coinów"),
  reward(6, "cosmetic", "levelBronzeFrame", "Ramka Weterana"),
  reward(8, "cosmetic", "sparkAura", "Małe iskry"),
  reward(10, "cosmetic", "levelVioletNick", "Nick Awansu"),
  reward(12, "money", 350, "350 coinów"),
  reward(15, "cosmetic", "goldFrame", "Złota ramka"),
  reward(18, "cosmetic", "levelBlazeFrame", "Ramka Żaru"),
  reward(22, "money", 650, "650 coinów"),
  reward(26, "cosmetic", "levelCometAura", "Aura Komety"),
  reward(30, "cosmetic", "rainbowNick", "Rainbow nick"),
  reward(35, "cosmetic", "levelChampionNick", "Nick Czempiona"),
  reward(40, "money", 1400, "1400 coinów"),
  reward(45, "cosmetic", "levelPrismFrame", "Pryzmatyczna ramka"),
  reward(50, "cosmetic", "divineNick", "Boski nick"),
  reward(60, "cosmetic", "levelNovaAura", "Aura Supernowej"),
];

export function xpForLevel(level) {
  const step = Math.max(0, Number(level || 1) - 1);
  return Math.round(55 * step + 18 * step * step);
}

export function profileXp(profile = {}) {
  return Math.max(0, Number(profile.nickOnly ? profile.sessionXp : profile.xp) || 0);
}

export function levelForXp(xp = 0) {
  let level = 1;
  while (level < 100 && Number(xp) >= xpForLevel(level + 1)) level += 1;
  return level;
}

export function levelProgress(profile = {}) {
  const xp = profileXp(profile), level = levelForXp(xp);
  const start = xpForLevel(level), end = xpForLevel(level + 1), needed = Math.max(1, end - start);
  return { xp, level, current: xp - start, needed, percent: Math.min(100, Math.max(0, ((xp - start) / needed) * 100)) };
}

export function levelTier(level = 1) {
  if (level >= 60) return "nova";
  if (level >= 40) return "inferno";
  if (level >= 25) return "electric";
  if (level >= 12) return "gold";
  if (level >= 5) return "silver";
  return "bronze";
}

export function levelBadgeHtml(profile = {}, className = "") {
  const { level } = levelProgress(profile);
  return `<span class="level-badge level-${levelTier(level)} ${className}" title="Level ${level}">LVL ${level}</span>`;
}

export function levelProgressButtonHtml(profile = {}) {
  const progress = levelProgress(profile);
  return `<button class="level-progress-button" id="open-progression" type="button" aria-label="Droga levelowa, level ${progress.level}">
    ${levelBadgeHtml(profile)}
    <span class="level-progress-copy"><b>${progress.current}/${progress.needed} XP</b><i><em style="width:${progress.percent}%"></em></i></span>
  </button>`;
}

export function grantProgression(profile = {}, xpGain = 0) {
  const previous = levelProgress(profile), xpKey = profile.nickOnly ? "sessionXp" : "xp", moneyKey = profile.nickOnly ? "sessionMoney" : "money";
  const updated = { ...profile, [xpKey]: previous.xp + Math.max(0, Number(xpGain) || 0) };
  const next = levelProgress(updated), claimed = { ...(profile.claimedLevelRewards || {}) }, owned = { ...(profile.ownedCosmetics || {}) };
  const unlocked = [];
  let money = 0;
  trophyRoad.forEach(item => {
    if (item.level > next.level || claimed[item.level]) return;
    claimed[item.level] = true;
    unlocked.push(item);
    if (item.type === "money") money += item.value;
    if (item.type === "cosmetic") owned[item.value] = true;
  });
  return {
    profile: { ...updated, [moneyKey]: (Number(updated[moneyKey]) || 0) + money, claimedLevelRewards: claimed, ownedCosmetics: owned },
    previousLevel: previous.level,
    level: next.level,
    leveledUp: next.level > previous.level,
    unlocked,
  };
}

export function progressionModal(profile = {}, closeAction) {
  const progress = levelProgress(profile), modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal progression-modal enter" role="dialog" aria-modal="true" aria-labelledby="progression-title">
    <div class="modal-title"><div><p class="eyebrow">DROGA LEVELU</p><h2 id="progression-title">Level ${progress.level}</h2></div><button class="icon-btn" data-close>×</button></div>
    <p class="muted">Graj w różne tryby, zdobywaj XP i odblokowuj nagrody. Kolejne levele wymagają stopniowo więcej doświadczenia.</p>
    <div class="road-current">${levelBadgeHtml(profile, "large-level-badge")}<div><b>${progress.current}/${progress.needed} XP do kolejnego levelu</b><i><em style="width:${progress.percent}%"></em></i></div></div>
    <div class="trophy-road">${trophyRoad.map(item => {
      const claimed = Boolean(profile.claimedLevelRewards?.[item.level]), unlocked = item.level <= progress.level;
      const cosmetic = item.type === "cosmetic" ? cosmetics.find(entry => entry.id === item.value) : null;
      return `<article class="road-node ${claimed ? "claimed" : unlocked ? "unlocked" : "locked"}">
        <span>LVL ${item.level}</span>
        ${cosmetic ? cosmeticPreview(cosmetic,profile,{compact:true,hideType:true,nick:"Gracz"}) : `<div class="coin-reward-preview"><i>$</i><i>$</i><strong>$</strong></div>`}
        <b>${cosmetic?.name || item.label}</b><small>${claimed ? "Odebrane" : unlocked ? "Odblokowane" : "Przed tobą"}</small>
      </article>`;
    }).join("")}</div>
  </section>`;
  modal.querySelector("[data-close]").addEventListener("click", () => closeAction(modal));
  return modal;
}
