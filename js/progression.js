import { cosmeticPreview, cosmetics } from "./cosmetics.js?v=20260604-2";

const reward = (level, type, value, label) => ({ level, type, value, label });

export const trophyRoad = [
  reward(2, "money", 100, "100 coinow"),
  reward(3, "cosmetic", "blueNick", "Niebieski nick"),
  reward(4, "money", 150, "150 coinow"),
  reward(6, "cosmetic", "levelBronzeFrame", "Ramka Weterana"),
  reward(8, "cosmetic", "sparkAura", "Male iskry"),
  reward(10, "cosmetic", "levelVioletNick", "Nick Awansu"),
  reward(12, "money", 350, "350 coinow"),
  reward(14, "cosmetic", "levelImpTailFrame", "Ogon za level"),
  reward(15, "cosmetic", "goldFrame", "Zlota ramka"),
  reward(18, "cosmetic", "levelBlazeFrame", "Ramka Zaru"),
  reward(20, "cosmetic", "levelQuestAura", "Aura Questow"),
  reward(22, "money", 650, "650 coinow"),
  reward(26, "cosmetic", "levelCometAura", "Aura Komety"),
  reward(30, "cosmetic", "rainbowNick", "Rainbow nick"),
  reward(32, "cosmetic", "levelRoyalIdle", "Idle Levelowy"),
  reward(35, "cosmetic", "levelChampionNick", "Nick Czempiona"),
  reward(38, "cosmetic", "levelChampionWin", "Wygrana Czempiona"),
  reward(40, "money", 1400, "1400 coinow"),
  reward(42, "cosmetic", "levelShatterLose", "Porazka Shatter"),
  reward(45, "cosmetic", "levelPrismFrame", "Pryzmatyczna ramka"),
  reward(50, "cosmetic", "divineNick", "Boski nick"),
  reward(55, "cosmetic", "levelDemonFrame", "Rogi Arcymistrza"),
  reward(60, "cosmetic", "levelNovaAura", "Aura Supernowej"),
  reward(70, "cosmetic", "levelAscendWin", "Ascend za level"),
  reward(80, "cosmetic", "levelVoidLose", "Void porazki"),
  reward(90, "cosmetic", "levelHaloAura", "Aureola Legendy"),
];

const modeLabels = {
  "udowodnij":"Udowodnij",
  "impostor":"Impostor",
  "kim-jestem":"Kim jestem",
  "inne-pytanie":"Inne pytanie",
  "kto-najpredzej":"Kto najpredzej",
  "test-znajomosci":"Test znajomosci",
  "zatruty-cukierek":"Zatruty cukierek",
};

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

const dayKey = now => new Date(now).toISOString().slice(0, 10);
const weekKey = now => {
  const date = new Date(now), first = new Date(date.getFullYear(), 0, 1);
  return `${date.getFullYear()}-W${Math.ceil((((date - first) / 86400000) + first.getDay() + 1) / 7)}`;
};
const blankStats = key => ({ key, modes:{}, bought:0, spent:0 });

function normalizeQuestStats(profile = {}, now = Date.now()) {
  const stats = profile.questStats || {}, dailyKey = dayKey(now), weeklyKey = weekKey(now);
  return {
    daily: stats.daily?.key === dailyKey ? { ...blankStats(dailyKey), ...stats.daily, modes:{ ...(stats.daily.modes || {}) } } : blankStats(dailyKey),
    weekly: stats.weekly?.key === weeklyKey ? { ...blankStats(weeklyKey), ...stats.weekly, modes:{ ...(stats.weekly.modes || {}) } } : blankStats(weeklyKey),
  };
}

const questList = now => {
  const d = dayKey(now), w = weekKey(now);
  return [
    { id:`daily-play-impostor-${d}`, period:"daily", title:"Zagraj w Impostora", target:1, metric:"mode", mode:"impostor", reward:{ type:"money", value:250 }, image:"$" },
    { id:`daily-play-most-${d}`, period:"daily", title:"Zagraj w Kto najpredzej", target:1, metric:"mode", mode:"kto-najpredzej", reward:{ type:"level", value:1 }, image:"LVL" },
    { id:`daily-buy-${d}`, period:"daily", title:"Kup 1 kosmetyk", target:1, metric:"bought", reward:{ type:"money", value:400 }, image:"+" },
    { id:`weekly-identity-${w}`, period:"weekly", title:"Zagraj 3 razy w Kim jestem", target:3, metric:"mode", mode:"kim-jestem", reward:{ type:"levelPercent", value:.5 }, image:"0.5" },
    { id:`weekly-spend-${w}`, period:"weekly", title:"Wydaj 2500 coinow", target:2500, metric:"spent", reward:{ type:"money", value:2500 }, image:"$$" },
    { id:`weekly-any-${w}`, period:"weekly", title:"Zagraj 8 dowolnych gier", target:8, metric:"anyMode", reward:{ type:"level", value:1 }, image:"XP" },
  ];
};

function questValue(stats, quest) {
  const box = stats[quest.period] || blankStats("");
  if (quest.metric === "mode") return Number(box.modes?.[quest.mode]) || 0;
  if (quest.metric === "anyMode") return Object.values(box.modes || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  return Number(box[quest.metric]) || 0;
}

function questRewardLabel(quest) {
  if (quest.reward.type === "money") return `${quest.reward.value} coinow`;
  if (quest.reward.type === "level") return `+${quest.reward.value} level`;
  return `+${quest.reward.value} levela`;
}

export function noteQuestEvent(profile = {}, event = {}, now = Date.now()) {
  const stats = normalizeQuestStats(profile, now);
  ["daily", "weekly"].forEach(period => {
    if (event.type === "mode" && event.mode) stats[period].modes[event.mode] = (Number(stats[period].modes[event.mode]) || 0) + 1;
    if (event.type === "bought") stats[period].bought = (Number(stats[period].bought) || 0) + 1;
    if (event.type === "spent") stats[period].spent = (Number(stats[period].spent) || 0) + Math.max(0, Number(event.amount) || 0);
  });
  return { ...profile, questStats: stats };
}

export function completedQuestRewards(profile = {}, now = Date.now()) {
  const stats = normalizeQuestStats(profile, now), claimed = profile.claimedQuestRewards || {};
  return questList(now).filter(quest => !claimed[quest.id] && questValue(stats, quest) >= quest.target);
}

export function claimCompletedQuestRewards(profile = {}, now = Date.now()) {
  const completed = completedQuestRewards(profile, now), xpKey = profile.nickOnly ? "sessionXp" : "xp", moneyKey = profile.nickOnly ? "sessionMoney" : "money";
  let updated = { ...profile, questStats: normalizeQuestStats(profile, now), claimedQuestRewards:{ ...(profile.claimedQuestRewards || {}) } };
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
  return { profile: updated, completed, money, xpGain };
}

export function levelProgressButtonHtml(profile = {}) {
  const progress = levelProgress(profile), completed = completedQuestRewards(profile).length;
  return `<button class="level-progress-button" id="open-progression" type="button" aria-label="Droga levelowa, level ${progress.level}">
    ${levelBadgeHtml(profile)}
    ${completed ? `<span class="quest-ready-badge">${completed}</span>` : ""}
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

export function progressionModal(profile = {}, closeAction, claimAction) {
  const progress = levelProgress(profile), modal = document.createElement("div");
  const stats = normalizeQuestStats(profile), quests = questList(Date.now()), completed = completedQuestRewards(profile);
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal progression-modal enter" role="dialog" aria-modal="true" aria-labelledby="progression-title">
    <div class="modal-title"><div><p class="eyebrow">DROGA LEVELU</p><h2 id="progression-title">Level ${progress.level}</h2></div><button class="icon-btn" data-close>x</button></div>
    <p class="muted">Graj w rozne tryby, zdobywaj XP i odblokowuj nagrody. Questy daily i weekly daja coiny albo instant level.</p>
    <div class="road-current">${levelBadgeHtml(profile, "large-level-badge")}<div><b>${progress.current}/${progress.needed} XP do kolejnego levelu</b><i><em style="width:${progress.percent}%"></em></i></div></div>
    <section class="quest-board ${completed.length ? "has-completed-quests" : ""}"><div class="section-heading"><div><p class="eyebrow">QUESTY</p><h3>Daily i weekly</h3></div>${completed.length ? `<button class="primary" id="claim-quests">Odbierz ${completed.length}</button>` : '<span class="badge">0 gotowych</span>'}</div><div class="quest-grid">${quests.map(quest => {
      const value = questValue(stats, quest), percent = Math.min(100, Math.round((value / quest.target) * 100)), done = value >= quest.target, claimed = Boolean(profile.claimedQuestRewards?.[quest.id]);
      return `<article class="quest-card ${done && !claimed ? "quest-done" : ""} ${claimed ? "quest-claimed" : ""}"><div class="quest-image">${quest.image}</div><b>${quest.title}</b><small>${quest.period === "daily" ? "DAILY" : "WEEKLY"} - ${quest.mode ? modeLabels[quest.mode] : "Konto"}</small><i><em style="width:${percent}%"></em></i><span>${Math.min(value, quest.target)}/${quest.target} - ${questRewardLabel(quest)}</span></article>`;
    }).join("")}</div></section>
    <div class="trophy-road">${trophyRoad.map(item => {
      const claimed = Boolean(profile.claimedLevelRewards?.[item.level]), unlocked = item.level <= progress.level;
      const cosmetic = item.type === "cosmetic" ? cosmetics.find(entry => entry.id === item.value) : null;
      return `<article class="road-node ${claimed ? "claimed" : unlocked ? "unlocked" : "locked"}">
        <span>LVL ${item.level}</span>
        ${cosmetic ? cosmeticPreview(cosmetic, profile, { compact:true, hideType:true, nick:"Gracz" }) : `<div class="coin-reward-preview"><i>$</i><i>$</i><strong>$</strong></div>`}
        <b>${cosmetic?.name || item.label}</b><small>${claimed ? "Odebrane" : unlocked ? "Odblokowane" : "Przed toba"}</small>
      </article>`;
    }).join("")}</div>
  </section>`;
  modal.querySelector("[data-close]").addEventListener("click", () => closeAction(modal));
  modal.querySelector("#claim-quests")?.addEventListener("click", () => {
    modal.querySelector(".quest-board")?.classList.add("quest-claiming");
    setTimeout(() => claimAction?.(modal), 650);
  });
  return modal;
}
