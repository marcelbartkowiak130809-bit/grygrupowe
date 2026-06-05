import { cosmeticPreview, cosmetics } from "./cosmetics.js?v=20260605-4";

const reward = (level, type, value, label) => ({ level, type, value, label });

export const trophyRoad = [
  reward(2, "money", 100, "100 coinow"), reward(3, "cosmetic", "blueNick", "Niebieski nick"), reward(4, "money", 150, "150 coinow"),
  reward(6, "cosmetic", "levelBronzeFrame", "Ramka Weterana"), reward(8, "cosmetic", "sparkAura", "Male iskry"), reward(10, "cosmetic", "levelVioletNick", "Nick Awansu"),
  reward(12, "money", 350, "350 coinow"), reward(14, "cosmetic", "levelImpTailFrame", "Ogon za level"), reward(15, "cosmetic", "goldFrame", "Zlota ramka"),
  reward(18, "cosmetic", "levelBlazeFrame", "Ramka Zaru"), reward(20, "cosmetic", "levelQuestAura", "Aura Questow"), reward(22, "money", 650, "650 coinow"),
  reward(26, "cosmetic", "levelCometAura", "Aura Komety"), reward(30, "cosmetic", "rainbowNick", "Rainbow nick"), reward(32, "cosmetic", "levelRoyalIdle", "Idle Levelowy"),
  reward(35, "cosmetic", "levelChampionNick", "Nick Czempiona"), reward(38, "cosmetic", "levelChampionWin", "Wygrana Czempiona"), reward(40, "money", 1400, "1400 coinow"),
  reward(42, "cosmetic", "levelShatterLose", "Porazka Shatter"), reward(45, "cosmetic", "levelPrismFrame", "Pryzmatyczna ramka"), reward(50, "cosmetic", "divineNick", "Boski nick"),
  reward(55, "cosmetic", "levelDemonFrame", "Rogi Arcymistrza"), reward(60, "cosmetic", "levelNovaAura", "Aura Supernowej"), reward(70, "cosmetic", "levelAscendWin", "Ascend za level"),
  reward(80, "cosmetic", "levelVoidLose", "Void porazki"), reward(90, "cosmetic", "levelHaloAura", "Aureola Legendy"),
];

const modeLabels = {
  all:"Wszystkie tryby", udowodnij:"Udowodnij", impostor:"Impostor", "kim-jestem":"Kim jestem", "inne-pytanie":"Inne pytanie",
  "kto-najpredzej":"Kto najpredzej", "test-znajomosci":"Test znajomosci", "zatruty-cukierek":"Zatruty cukierek",
};
const modeIds = Object.keys(modeLabels).filter(id => id !== "all");

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
  return { xp, level, current:xp - start, needed, percent:Math.min(100, Math.max(0, ((xp - start) / needed) * 100)) };
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

const pad = value => String(value).padStart(2, "0");
const dayKey = now => {
  const date = new Date(now);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const weekKey = now => {
  const date = new Date(now), day = (date.getDay() + 6) % 7;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
};
const blankStats = key => ({ key, modes:{}, wins:{}, bought:0, spent:0 });
const blankGameStats = () => ({ played:0, wins:0, losses:0, modes:{} });
const modeStats = stats => ({ played:0, wins:0, losses:0, ...stats });

function normalizeQuestStats(profile = {}, now = Date.now()) {
  const stats = profile.questStats || {}, dailyKey = dayKey(now), weeklyKey = weekKey(now);
  return {
    daily: stats.daily?.key === dailyKey ? { ...blankStats(dailyKey), ...stats.daily, modes:{ ...(stats.daily.modes || {}) }, wins:{ ...(stats.daily.wins || {}) } } : blankStats(dailyKey),
    weekly: stats.weekly?.key === weeklyKey ? { ...blankStats(weeklyKey), ...stats.weekly, modes:{ ...(stats.weekly.modes || {}) }, wins:{ ...(stats.weekly.wins || {}) } } : blankStats(weeklyKey),
  };
}

function normalizeGameStats(profile = {}) {
  const raw = profile.gameStats || {}, base = { ...blankGameStats(), ...raw, modes:{ ...(raw.modes || {}) } };
  modeIds.forEach(id => base.modes[id] = modeStats(base.modes[id]));
  return base;
}

const questList = now => {
  const d = dayKey(now), w = weekKey(now);
  return [
    { id:`daily-play-impostor-${d}`, period:"daily", title:"Zagraj w Impostora", target:1, metric:"mode", mode:"impostor", reward:{ type:"money", value:180 }, image:"$" },
    { id:`daily-win-any-${d}`, period:"daily", title:"Wygraj 1 gre", target:1, metric:"anyWin", reward:{ type:"money", value:300 }, image:"WIN" },
    { id:`daily-buy-${d}`, period:"daily", title:"Kup 1 kosmetyk", target:1, metric:"bought", reward:{ type:"money", value:220 }, image:"+" },
    { id:`weekly-identity-${w}`, period:"weekly", title:"Zagraj 3 razy w Kim jestem", target:3, metric:"mode", mode:"kim-jestem", reward:{ type:"levelPercent", value:.5 }, image:"0.5" },
    { id:`weekly-win-3-${w}`, period:"weekly", title:"Wygraj 3 gry", target:3, metric:"anyWin", reward:{ type:"level", value:1 }, image:"LVL" },
    { id:`weekly-spend-${w}`, period:"weekly", title:"Wydaj 2500 coinow", target:2500, metric:"spent", reward:{ type:"money", value:3000 }, image:"$$" },
  ];
};

function questValue(stats, quest) {
  const box = stats[quest.period] || blankStats("");
  if (quest.metric === "mode") return Number(box.modes?.[quest.mode]) || 0;
  if (quest.metric === "anyMode") return Object.values(box.modes || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  if (quest.metric === "winMode") return Number(box.wins?.[quest.mode]) || 0;
  if (quest.metric === "anyWin") return Object.values(box.wins || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  return Number(box[quest.metric]) || 0;
}

function questRewardLabel(quest) {
  if (quest.reward.type === "money") return `${quest.reward.value} coinow`;
  if (quest.reward.type === "level") return `+${quest.reward.value} level`;
  return `+${quest.reward.value} levela`;
}

export function noteQuestEvent(profile = {}, event = {}, now = Date.now()) {
  const questStats = normalizeQuestStats(profile, now), gameStats = normalizeGameStats(profile);
  ["daily", "weekly"].forEach(period => {
    if (event.type === "mode" && event.mode) {
      questStats[period].modes[event.mode] = (Number(questStats[period].modes[event.mode]) || 0) + 1;
      if (event.result === "win") questStats[period].wins[event.mode] = (Number(questStats[period].wins[event.mode]) || 0) + 1;
    }
    if (event.type === "bought") questStats[period].bought = (Number(questStats[period].bought) || 0) + 1;
    if (event.type === "spent") questStats[period].spent = (Number(questStats[period].spent) || 0) + Math.max(0, Number(event.amount) || 0);
  });
  if (event.type === "mode" && event.mode) {
    const target = gameStats.modes[event.mode] = modeStats(gameStats.modes[event.mode]);
    gameStats.played += 1; target.played += 1;
    if (event.result === "win") { gameStats.wins += 1; target.wins += 1; }
    if (event.result === "loss") { gameStats.losses += 1; target.losses += 1; }
  }
  return { ...profile, questStats, gameStats };
}

export function completedQuestRewards(profile = {}, now = Date.now()) {
  const stats = normalizeQuestStats(profile, now), claimed = profile.claimedQuestRewards || {};
  return questList(now).filter(quest => !claimed[quest.id] && questValue(stats, quest) >= quest.target);
}

export function claimCompletedQuestRewards(profile = {}, now = Date.now()) {
  const completed = completedQuestRewards(profile, now), xpKey = profile.nickOnly ? "sessionXp" : "xp", moneyKey = profile.nickOnly ? "sessionMoney" : "money";
  let updated = { ...profile, questStats:normalizeQuestStats(profile, now), claimedQuestRewards:{ ...(profile.claimedQuestRewards || {}) } };
  let money = 0, xpGain = 0;
  completed.forEach(quest => {
    updated.claimedQuestRewards[quest.id] = true;
    if (quest.reward.type === "money") money += quest.reward.value;
    else {
      const progress = levelProgress({ ...updated, [xpKey]:(Number(updated[xpKey]) || 0) + xpGain });
      const span = xpForLevel(progress.level + 1) - xpForLevel(progress.level);
      xpGain += quest.reward.type === "level" ? xpForLevel(progress.level + quest.reward.value) - progress.xp : Math.ceil(span * quest.reward.value);
    }
  });
  if (money) updated[moneyKey] = (Number(updated[moneyKey]) || 0) + money;
  if (xpGain) updated = grantProgression(updated, xpGain).profile;
  return { profile:updated, completed, money, xpGain };
}

export function levelProgressButtonHtml(profile = {}) {
  const progress = levelProgress(profile), completed = completedQuestRewards(profile).length;
  return `<button class="level-progress-button" id="open-progression" type="button" aria-label="Droga levelowa, level ${progress.level}">
    ${levelBadgeHtml(profile)}${completed ? `<span class="quest-ready-badge">${completed}</span>` : ""}
    <span class="level-progress-copy"><b>${progress.current}/${progress.needed} XP</b><i><em style="width:${progress.percent}%"></em></i></span>
  </button>`;
}

export function grantProgression(profile = {}, xpGain = 0) {
  const previous = levelProgress(profile), xpKey = profile.nickOnly ? "sessionXp" : "xp", moneyKey = profile.nickOnly ? "sessionMoney" : "money";
  const updated = { ...profile, [xpKey]:previous.xp + Math.max(0, Number(xpGain) || 0) };
  const next = levelProgress(updated), claimed = { ...(profile.claimedLevelRewards || {}) }, owned = { ...(profile.ownedCosmetics || {}) };
  const unlocked = [];
  let money = 0;
  trophyRoad.forEach(item => {
    if (item.level > next.level || claimed[item.level]) return;
    claimed[item.level] = true; unlocked.push(item);
    if (item.type === "money") money += item.value;
    if (item.type === "cosmetic") owned[item.value] = true;
  });
  return { profile:{ ...updated, [moneyKey]:(Number(updated[moneyKey]) || 0) + money, claimedLevelRewards:claimed, ownedCosmetics:owned }, previousLevel:previous.level, level:next.level, leveledUp:next.level > previous.level, unlocked };
}

function questCard(quest, stats, profile) {
  const value = questValue(stats, quest), percent = Math.min(100, Math.round((value / quest.target) * 100)), done = value >= quest.target, claimed = Boolean(profile.claimedQuestRewards?.[quest.id]);
  return `<article class="quest-card ${done && !claimed ? "quest-done" : ""} ${claimed ? "quest-claimed" : ""}"><div class="quest-image">${quest.image}</div><b>${quest.title}</b><small>${quest.mode ? modeLabels[quest.mode] : "Konto"} - ${questRewardLabel(quest)}</small><i><em style="width:${percent}%"></em></i><span>${Math.min(value, quest.target)}/${quest.target}</span></article>`;
}

function statsPanel(profile) {
  const stats = normalizeGameStats(profile);
  const payload = { all:modeStats(stats), ...Object.fromEntries(modeIds.map(id => [id,modeStats(stats.modes[id])])) };
  return `<section class="progression-side-card" data-stats-map='${JSON.stringify(payload)}'><div class="section-heading"><div><p class="eyebrow">STATYSTYKI</p><h3>Twoje gry</h3></div></div><select id="progression-stats-mode">${Object.entries(modeLabels).map(([id,label]) => `<option value="${id}">${label}</option>`).join("")}</select><div class="stats-cards"><span><b data-stat="played">${payload.all.played}</b><small>zagrane</small></span><span><b data-stat="wins">${payload.all.wins}</b><small>wygrane</small></span><span><b data-stat="losses">${payload.all.losses}</b><small>przegrane</small></span></div></section>`;
}

const rewardPreviewProfile = { nick:"Gracz" };

export function progressionModal(profile = {}, closeAction, claimAction) {
  const progress = levelProgress(profile), modal = document.createElement("div");
  const stats = normalizeQuestStats(profile), quests = questList(Date.now()), completed = completedQuestRewards(profile), daily = quests.filter(q => q.period === "daily"), weekly = quests.filter(q => q.period === "weekly");
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal progression-modal enter" role="dialog" aria-modal="true" aria-labelledby="progression-title">
    <div class="modal-title"><div><p class="eyebrow">DROGA LEVELU</p><h2 id="progression-title">Level ${progress.level}</h2></div><button class="icon-btn" data-close>x</button></div>
    <div class="road-current">${levelBadgeHtml(profile, "large-level-badge")}<div><b>${progress.current}/${progress.needed} XP do kolejnego levelu</b><i><em style="width:${progress.percent}%"></em></i></div></div>
    <div class="progression-body">
      <aside class="progression-side">
        ${statsPanel(profile)}
        <section class="progression-side-card quest-board ${completed.length ? "has-completed-quests" : ""}"><div class="section-heading"><div><p class="eyebrow">DAILY</p><h3>Odświeża się o 00:00</h3></div>${completed.length ? `<button class="primary" id="claim-quests">Odbierz ${completed.length}</button>` : ""}</div><div class="quest-grid">${daily.map(quest => questCard(quest, stats, profile)).join("")}</div></section>
        <section class="progression-side-card quest-board"><div class="section-heading"><div><p class="eyebrow">WEEKLY</p><h3>Reset w poniedziałek 00:00</h3></div><span class="badge">lepsze nagrody</span></div><div class="quest-grid">${weekly.map(quest => questCard(quest, stats, profile)).join("")}</div></section>
      </aside>
      <section class="progression-rewards"><div class="section-heading"><div><p class="eyebrow">NAGRODY</p><h3>Droga levelowa</h3></div></div><div class="trophy-road">${trophyRoad.map(item => {
        const claimed = Boolean(profile.claimedLevelRewards?.[item.level]), unlocked = item.level <= progress.level;
        const cosmetic = item.type === "cosmetic" ? cosmetics.find(entry => entry.id === item.value) : null;
        return `<article class="road-node ${claimed ? "claimed" : unlocked ? "unlocked" : "locked"}"><span>LVL ${item.level}</span>${cosmetic ? cosmeticPreview(cosmetic, rewardPreviewProfile, { compact:true, hideType:true, nick:"Gracz" }) : `<div class="coin-reward-preview"><i>$</i><i>$</i><strong>$</strong></div>`}<b>${cosmetic?.name || item.label}</b><small>${claimed ? "Odebrane" : unlocked ? "Odblokowane" : "Przed toba"}</small></article>`;
      }).join("")}</div></section>
    </div>
  </section>`;
  modal.querySelector("[data-close]").addEventListener("click", () => closeAction(modal));
  modal.querySelector("#claim-quests")?.addEventListener("click", () => { modal.querySelectorAll(".quest-board").forEach(board => board.classList.add("quest-claiming")); setTimeout(() => claimAction?.(modal), 650); });
  modal.querySelector("#progression-stats-mode")?.addEventListener("change", event => {
    const panel = event.target.closest("[data-stats-map]"), stats = JSON.parse(panel?.dataset.statsMap || "{}")[event.target.value] || {};
    panel?.querySelector('[data-stat="played"]')?.replaceChildren(String(stats.played || 0));
    panel?.querySelector('[data-stat="wins"]')?.replaceChildren(String(stats.wins || 0));
    panel?.querySelector('[data-stat="losses"]')?.replaceChildren(String(stats.losses || 0));
  });
  return modal;
}
