import { cosmeticPreview, cosmetics } from "./cosmetics.js?v=20260804-1";
import { botTooltip } from "./bots.js?v=20260823-2";

const reward = (level, type, value, label) => ({ level, type, value, label });

export const trophyRoad = [
  reward(2, "money", 100, "100 coinow"), reward(3, "cosmetic", "blueNick", "Niebieski nick"), reward(4, "money", 150, "150 coinow"),
  reward(5, "cosmetic", "defaultCandy", "Mietowka"), reward(6, "cosmetic", "levelBronzeFrame", "Ramka Weterana"), reward(8, "cosmetic", "sparkAura", "Male iskry"),
  reward(10, "cosmetic", "levelVioletNick", "Nick Awansu"), reward(12, "money", 350, "350 coinow"), reward(14, "cosmetic", "levelImpTailFrame", "Ogon za level"),
  reward(15, "cosmetic", "goldFrame", "Zlota ramka"), reward(17, "money", 500, "500 coinow"), reward(18, "cosmetic", "levelBlazeFrame", "Ramka Zaru"),
  reward(20, "cosmetic", "levelQuestAura", "Aura Questow"), reward(22, "money", 650, "650 coinow"), reward(24, "cosmetic", "mintBomb", "Mietowy ladunek"),
  reward(26, "cosmetic", "levelCometAura", "Aura Komety"), reward(28, "cosmetic", "mintClock", "Mietowy zegar"), reward(30, "cosmetic", "rainbowNick", "Rainbow nick"),
  reward(32, "cosmetic", "royalIdle", "Idle: royal hover"), reward(34, "money", 1000, "1000 coinow"), reward(35, "cosmetic", "levelChampionNick", "Nick Czempiona"),
  reward(38, "cosmetic", "levelChampionWin", "Wygrana Czempiona"), reward(40, "money", 1400, "1400 coinow"), reward(42, "cosmetic", "levelShatterLose", "Porazka Shatter"),
  reward(45, "cosmetic", "levelPrismFrame", "Pryzmatyczna ramka"), reward(48, "cosmetic", "chocoCandy", "Czekoladka"), reward(50, "cosmetic", "divineNick", "Boski nick"),
  reward(55, "cosmetic", "levelDemonFrame", "Rogi Arcymistrza"), reward(58, "money", 2200, "2200 coinow"), reward(60, "cosmetic", "levelNovaAura", "Aura Supernowej"),
  reward(65, "cosmetic", "neonClock", "Neonowy zegar"), reward(70, "cosmetic", "winAscend", "Wygrana: ascend"), reward(75, "cosmetic", "fizzyCandy", "Kwasna rolka"),
  reward(80, "cosmetic", "levelVoidLose", "Void porazki"), reward(85, "cosmetic", "neonBomb", "Neon core"), reward(90, "money", 4200, "4200 coinow"),
  reward(100, "cosmetic", "auroraClock", "Zegar zorzy"), reward(110, "cosmetic", "lavaBomb", "Lava shell"), reward(120, "cosmetic", "levelHaloAura", "Aureola Legendy"),
  reward(135, "money", 9000, "9000 coinow"), reward(150, "cosmetic", "divineAura", "Boska aura"),
];

const modeLabels = {
  all:"Wszystkie tryby", udowodnij:"Udowodnij", impostor:"Impostor", "kim-jestem":"Kim jestem", "inne-pytanie":"Inne pytanie",
  "kto-najpredzej":"Kto najpredzej", "test-znajomosci":"Test znajomosci", "zatruty-cukierek":"Zatruty cukierek",
  bomba:"Bomba", "najblizej-prawdy":"Najbliżej prawdy", ranking:"Ranking", "5-sekund":"5 sekund", zegar:"Zegar",
  "pokemon-dex":"Najbliższy numer Pokédex", "pokemon-last-letter":"Ostatnia litera", "pokemon-evolution":"Evolution Race",
  "pokemon-auction":"Licytacja teamu", "pokemon-types":"Typy na start", "pokemon-match-type":"Dopasuj typ",
  wavelength:"Wavelength", quiz:"Quiz", mathematics:"Matematyka", marker:"Marker", sequence:"Zgadnij sekwencję",
  family:"Familiada", "word-chain":"Łańcuch słów",
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
  while (level < 150 && Number(xp) >= xpForLevel(level + 1)) level += 1;
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
  if (profile?.isBot) return `<span class="level-badge bot-level-badge ${className}" ${botTooltip} aria-label="Bot eksperymentalny">BOT</span>`;
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
const blankStats = key => ({ key, modes:{}, wins:{}, streak:0, bestStreak:0, modeStreaks:{}, clockUnder10:0, bought:0, spent:0 });
const blankGameStats = () => ({ played:0, wins:0, losses:0, modes:{} });
const modeStats = stats => ({ played:0, wins:0, losses:0, ...stats });

function normalizeQuestStats(profile = {}, now = Date.now()) {
  const stats = profile.questStats || {}, dailyKey = dayKey(now), weeklyKey = weekKey(now);
  return {
    daily: stats.daily?.key === dailyKey ? { ...blankStats(dailyKey), ...stats.daily, modes:{ ...(stats.daily.modes || {}) }, wins:{ ...(stats.daily.wins || {}) }, modeStreaks:{ ...(stats.daily.modeStreaks || {}) } } : blankStats(dailyKey),
    weekly: stats.weekly?.key === weeklyKey ? { ...blankStats(weeklyKey), ...stats.weekly, modes:{ ...(stats.weekly.modes || {}) }, wins:{ ...(stats.weekly.wins || {}) }, modeStreaks:{ ...(stats.weekly.modeStreaks || {}) } } : blankStats(weeklyKey),
  };
}

function normalizeGameStats(profile = {}) {
  const raw = profile.gameStats || {}, base = { ...blankGameStats(), ...raw, modes:{ ...(raw.modes || {}) } };
  modeIds.forEach(id => base.modes[id] = modeStats(base.modes[id]));
  return base;
}

function hashSeed(text) {
  let hash = 2166136261;
  for (const char of String(text)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}

function pickWeighted(seed, table) {
  const total = table.reduce((sum, item) => sum + item.weight, 0), roll = hashSeed(seed) % total;
  let cursor = 0;
  return table.find(item => (cursor += item.weight) > roll)?.reward || table[0].reward;
}

function cosmeticReward(seed, rarities) {
  const pool = cosmetics.filter(item => item.price > 0 && !item.exclusive && rarities.includes(item.rarity));
  const item = pool[hashSeed(seed) % Math.max(1, pool.length)];
  return item ? { type:"cosmetic", value:item.id, rarity:item.rarity } : { type:"money", value:300 };
}

const questModeIcons = {
  udowodnij:"⚡", impostor:"🕵️", "kim-jestem":"🤔", "inne-pytanie":"❓", "kto-najpredzej":"🏃",
  "test-znajomosci":"🧠", "zatruty-cukierek":"🍬", bomba:"💣", "najblizej-prawdy":"🎯",
  ranking:"🏆", "5-sekund":"⏱️", zegar:"⏰", wavelength:"🌈", quiz:"🎲", mathematics:"🧮",
  marker:"🖍️", sequence:"🔐", family:"📊", "word-chain":"🔗", "pokemon-dex":"🔴",
  "pokemon-last-letter":"🔤", "pokemon-evolution":"🧬", "pokemon-auction":"💰",
  "pokemon-types":"🔥", "pokemon-match-type":"🔗",
};

function questReward(seed, period, difficulty) {
  const daily = {
    easy:[
      { weight:94, reward:{ type:"money", value:160 + hashSeed(`${seed}:m`) % 120 } },
      { weight:3, reward:cosmeticReward(seed, ["common"]) },
      { weight:2, reward:{ type:"levelPercent", value:.5 } },
      { weight:1, reward:{ type:"xp", value:40 + hashSeed(`${seed}:xp`) % 31 } },
    ],
    medium:[
      { weight:76, reward:{ type:"money", value:260 + hashSeed(`${seed}:m`) % 220 } },
      { weight:9, reward:cosmeticReward(seed, ["common"]) },
      { weight:10, reward:{ type:"levelPercent", value:.5 } },
      { weight:3, reward:{ type:"money", value:650 } },
      { weight:2, reward:{ type:"xp", value:90 + hashSeed(`${seed}:xp`) % 61 } },
    ],
    hard:[
      { weight:62, reward:{ type:"money", value:520 + hashSeed(`${seed}:m`) % 420 } },
      { weight:12, reward:cosmeticReward(seed, ["common", "rare"]) },
      { weight:18, reward:{ type:"levelPercent", value:.5 } },
      { weight:5, reward:{ type:"money", value:1100 } },
      { weight:3, reward:{ type:"xp", value:180 + hashSeed(`${seed}:xp`) % 121 } },
    ],
  };
  const weekly = {
    easy:[
      { weight:70, reward:{ type:"money", value:900 + hashSeed(`${seed}:m`) % 700 } },
      { weight:18, reward:{ type:"levelPercent", value:.5 } },
      { weight:10, reward:cosmeticReward(seed, ["rare"]) },
      { weight:1, reward:{ type:"level", value:1 } },
      { weight:1, reward:{ type:"xp", value:300 + hashSeed(`${seed}:xp`) % 201 } },
    ],
    medium:[
      { weight:52, reward:{ type:"money", value:1700 + hashSeed(`${seed}:m`) % 1400 } },
      { weight:20, reward:{ type:"levelPercent", value:.5 } },
      { weight:16, reward:cosmeticReward(seed, ["rare", "epic"]) },
      { weight:10, reward:{ type:"level", value:1 } },
      { weight:1, reward:cosmeticReward(seed, ["legendary"]) },
      { weight:1, reward:{ type:"xp", value:650 + hashSeed(`${seed}:xp`) % 351 } },
    ],
    hard:[
      { weight:38, reward:{ type:"money", value:3200 + hashSeed(`${seed}:m`) % 2800 } },
      { weight:18, reward:{ type:"levelPercent", value:.5 } },
      { weight:18, reward:cosmeticReward(seed, ["epic"]) },
      { weight:18, reward:{ type:"level", value:1 } },
      { weight:5, reward:cosmeticReward(seed, ["legendary"]) },
      { weight:3, reward:{ type:"level", value:2 } },
      { weight:2, reward:{ type:"xp", value:1200 + hashSeed(`${seed}:xp`) % 801 } },
    ],
  };
  return pickWeighted(seed, (period === "weekly" ? weekly : daily)[difficulty]);
}

const q = (id, period, title, target, metric, image, difficulty, extra = {}) => ({
  id, period, title, target, metric, image:extra.mode ? (questModeIcons[extra.mode] || image) : image, ...extra, reward:questReward(id, period, difficulty),
});

const questList = now => {
  const d = dayKey(now), w = weekKey(now);
  return [
    q(`daily-play-bomb-${d}`,"daily","Zagraj w tryb Bomba",1,"mode","BOMB","easy",{mode:"bomba"}),
    q(`daily-play-clock-${d}`,"daily","Zagraj w Zegar",2,"mode","TIME","easy",{mode:"zegar"}),
    q(`daily-win-new-${d}`,"daily","Wygraj gre w nowym trybie",1,"newModeWin","WIN","medium"),
    q(`daily-play-wavelength-${d}`,"daily","Zagraj w Wavelength",1,"mode","WAVE","easy",{mode:"wavelength"}),
    q(`daily-play-quiz-${d}`,"daily","Zagraj w Quiz",1,"mode","QUIZ","easy",{mode:"quiz"}),
    q(`daily-play-math-${d}`,"daily","Zagraj w Matematyke",1,"mode","MATH","medium",{mode:"mathematics"}),
    q(`daily-play-marker-${d}`,"daily","Zagraj w Marker",1,"mode","MARK","medium",{mode:"marker"}),
    q(`daily-play-sequence-${d}`,"daily","Zagraj w Zgadnij sekwencje",1,"mode","CODE","medium",{mode:"sequence"}),
    q(`daily-play-family-${d}`,"daily","Zagraj w Familiade",1,"mode","FAM","easy",{mode:"family"}),
    q(`daily-play-word-chain-${d}`,"daily","Zagraj w Lancuch slow",1,"mode","WORD","medium",{mode:"word-chain"}),
    q(`daily-win-2-any-${d}`,"daily","Wygraj 2 gry",2,"anyWin","2W","medium"),
    q(`daily-play-5-any-${d}`,"daily","Zagraj 5 gier lacznie",5,"anyMode","PLAY","hard"),
    q(`daily-win-bomb-${d}`,"daily","Wygraj gre w Bombie",1,"winMode","BOOM","medium",{mode:"bomba"}),
    q(`daily-clock-precision-${d}`,"daily","Zatrzymaj Zegar z roznica ponizej 0.01 s",1,"clockUnder10","0.01","hard"),
    q(`daily-buy-${d}`,"daily","Kup 1 kosmetyk",1,"bought","+","easy"),
    q(`weekly-win-bomb-2-${w}`,"weekly","Wygraj 2 gry w Bombie",2,"winMode","B2","easy",{mode:"bomba"}),
    q(`weekly-play-clock-4-${w}`,"weekly","Zagraj 4 gry w Zegar",4,"mode","TIME","easy",{mode:"zegar"}),
    q(`weekly-win-five-5-${w}`,"weekly","Wygraj 5 gier w 5 sekund",5,"winMode","5W","medium",{mode:"5-sekund"}),
    q(`weekly-play-truth-7-${w}`,"weekly","Zagraj 7 gier w Najbliżej prawdy",7,"mode","NUM","medium",{mode:"najblizej-prawdy"}),
    q(`weekly-ranking-5-${w}`,"weekly","Wygraj 5 gier w Rankingu",5,"winMode","RANK","medium",{mode:"ranking"}),
    q(`weekly-win-streak-5-${w}`,"weekly","Wygraj 5 razy pod rzad",5,"bestStreak","STK","hard"),
    q(`weekly-bomb-streak-3-${w}`,"weekly","Wygraj 3 razy pod rzad w Bombie",3,"modeStreak","B3","hard",{mode:"bomba"}),
    q(`weekly-win-15-any-${w}`,"weekly","Wygraj 15 gier lacznie",15,"anyWin","15W","hard"),
    q(`weekly-play-15-any-${w}`,"weekly","Zagraj 15 gier lacznie",15,"anyMode","15","medium"),
    q(`weekly-win-wavelength-${w}`,"weekly","Wygraj 3 gry w Wavelength",3,"winMode","W3","hard",{mode:"wavelength"}),
    q(`weekly-win-quiz-${w}`,"weekly","Wygraj 3 gry w Quizie",3,"winMode","Q3","hard",{mode:"quiz"}),
    q(`weekly-win-family-${w}`,"weekly","Wygraj 3 gry w Familiadzie",3,"winMode","F3","hard",{mode:"family"}),
    q(`weekly-play-sequence-${w}`,"weekly","Zagraj 4 gry w Zgadnij sekwencje",4,"mode","CODE","medium",{mode:"sequence"}),
    q(`weekly-play-word-chain-${w}`,"weekly","Zagraj 4 gry w Lancuch slow",4,"mode","WORD","medium",{mode:"word-chain"}),
    q(`weekly-play-pokemon-${w}`,"weekly","Zagraj 3 gry pokemonowe",3,"anyModeGroup","PKM","hard",{modes:["pokemon-dex","pokemon-last-letter","pokemon-evolution","pokemon-auction","pokemon-types","pokemon-match-type"]}),
    q(`weekly-spend-${w}`,"weekly","Wydaj 2500 coinow",2500,"spent","$$","medium"),
  ];
};

const pickQuestSet = (items, key, count = 3) => [...items]
  .sort((a, b) => hashSeed(`${key}:${a.id}`) - hashSeed(`${key}:${b.id}`))
  .slice(0, count);

const activeQuestList = now => {
  const quests = questList(now), d = dayKey(now), w = weekKey(now);
  return [
    ...pickQuestSet(quests.filter(quest => quest.period === "daily"), d, 3),
    ...pickQuestSet(quests.filter(quest => quest.period === "weekly"), w, 3),
  ];
};

function questValue(stats, quest) {
  const box = stats[quest.period] || blankStats("");
  if (quest.metric === "mode") return Number(box.modes?.[quest.mode]) || 0;
  if (quest.metric === "anyMode") return Object.values(box.modes || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  if (quest.metric === "winMode") return Number(box.wins?.[quest.mode]) || 0;
  if (quest.metric === "anyWin") return Object.values(box.wins || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  if (quest.metric === "anyModeGroup") return (quest.modes || []).reduce((sum, mode) => sum + (Number(box.modes?.[mode]) || 0), 0);
  if (quest.metric === "newModeWin") return ["wavelength","quiz","mathematics","marker","sequence","family","word-chain","pokemon-dex","pokemon-last-letter","pokemon-evolution","pokemon-auction","pokemon-types","pokemon-match-type"].reduce((sum, mode) => sum + (Number(box.wins?.[mode]) || 0), 0);
  if (quest.metric === "bestStreak") return Number(box.bestStreak) || 0;
  if (quest.metric === "modeStreak") return Number(box.modeStreaks?.[quest.mode]) || 0;
  if (quest.metric === "clockUnder10") return Number(box.clockUnder10) || 0;
  return Number(box[quest.metric]) || 0;
}

function questRewardLabel(quest) {
  if (quest.reward.type === "money") return `${quest.reward.value} coinow`;
  if (quest.reward.type === "level") return `+${quest.reward.value} level`;
  if (quest.reward.type === "cosmetic") return cosmetics.find(item => item.id === quest.reward.value)?.name || "kosmetyk";
  if (quest.reward.type === "xp") return `+${quest.reward.value} XP`;
  return `+${quest.reward.value} levela`;
}

export function noteQuestEvent(profile = {}, event = {}, now = Date.now()) {
  const questStats = normalizeQuestStats(profile, now), gameStats = normalizeGameStats(profile);
  ["daily", "weekly"].forEach(period => {
    if (event.type === "mode" && event.mode) {
      questStats[period].modes[event.mode] = (Number(questStats[period].modes[event.mode]) || 0) + 1;
      if (event.result === "win") {
        questStats[period].wins[event.mode] = (Number(questStats[period].wins[event.mode]) || 0) + 1;
        questStats[period].streak = (Number(questStats[period].streak) || 0) + 1;
        questStats[period].bestStreak = Math.max(Number(questStats[period].bestStreak) || 0, questStats[period].streak);
        questStats[period].modeStreaks[event.mode] = (Number(questStats[period].modeStreaks?.[event.mode]) || 0) + 1;
      } else {
        questStats[period].streak = 0;
        questStats[period].modeStreaks[event.mode] = 0;
      }
      if (event.mode === "zegar" && Number(event.clockDifferenceMs) <= 10) questStats[period].clockUnder10 = (Number(questStats[period].clockUnder10) || 0) + 1;
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
  return activeQuestList(now).filter(quest => !claimed[quest.id] && questValue(stats, quest) >= quest.target);
}

export function claimCompletedQuestRewards(profile = {}, now = Date.now()) {
  const completed = completedQuestRewards(profile, now), xpKey = profile.nickOnly ? "sessionXp" : "xp", moneyKey = profile.nickOnly ? "sessionMoney" : "money";
  let updated = { ...profile, questStats:normalizeQuestStats(profile, now), claimedQuestRewards:{ ...(profile.claimedQuestRewards || {}) }, ownedCosmetics:{ ...(profile.ownedCosmetics || {}) } };
  let money = 0, xpGain = 0;
  const grantCosmetic = id => {
    const rewardCosmetic = cosmetics.find(item => item.id === id);
    if (!rewardCosmetic) return;
    if (!updated.ownedCosmetics[id]) { updated.ownedCosmetics[id] = true; return; }
    const pool = cosmetics.filter(item => item.price > 0 && !item.exclusive && item.rarity === rewardCosmetic.rarity && !updated.ownedCosmetics[item.id]);
    const replacement = pool[hashSeed(`${id}:${now}`) % Math.max(1, pool.length)];
    if (replacement) updated.ownedCosmetics[replacement.id] = true;
  };
  completed.forEach(quest => {
    updated.claimedQuestRewards[quest.id] = true;
    if (quest.reward.type === "money") money += quest.reward.value;
    else if (quest.reward.type === "cosmetic") grantCosmetic(quest.reward.value);
    else {
      const progress = levelProgress({ ...updated, [xpKey]:(Number(updated[xpKey]) || 0) + xpGain });
      const span = xpForLevel(progress.level + 1) - xpForLevel(progress.level);
      xpGain += quest.reward.type === "xp" ? Number(quest.reward.value) || 0 : quest.reward.type === "level" ? xpForLevel(progress.level + quest.reward.value) - progress.xp : Math.ceil(span * quest.reward.value);
    }
  });
  if (money) updated[moneyKey] = (Number(updated[moneyKey]) || 0) + money;
  if (xpGain) updated = grantProgression(updated, xpGain).profile;
  return { profile:updated, completed, money, xpGain };
}

export function levelProgressButtonHtml(profile = {}) {
  const progress = levelProgress(profile), completed = completedQuestRewards(profile).length, pendingLevelReward = trophyRoad.some(item => item.level <= progress.level && !profile.claimedLevelRewards?.[item.level]), hasNewQuestCycle = profile.questSeenKey !== questNotificationKey();
  return `<button class="level-progress-button" id="open-progression" type="button" aria-label="Droga levelowa, level ${progress.level}">
    ${levelBadgeHtml(profile)}${completed || pendingLevelReward || hasNewQuestCycle ? `<span class="quest-ready-badge" aria-label="Nowe nagrody lub questy"></span>` : ""}
    <span class="level-progress-copy"><b>${progress.current}/${progress.needed} XP</b><i><em style="width:${progress.percent}%"></em></i></span>
  </button>`;
}

export function questNotificationKey(now = Date.now()) { return `${dayKey(now)}:${weekKey(now)}`; }

export function grantProgression(profile = {}, xpGain = 0) {
  const previous = levelProgress(profile), xpKey = profile.nickOnly ? "sessionXp" : "xp", moneyKey = profile.nickOnly ? "sessionMoney" : "money";
  const updated = { ...profile, [xpKey]:previous.xp + Math.max(0, Number(xpGain) || 0) };
  const next = levelProgress(updated), claimed = { ...(profile.claimedLevelRewards || {}) }, owned = { ...(profile.ownedCosmetics || {}) };
  const unlocked = [], rerolls = [];
  let money = 0;
  if (owned.levelRoyalIdle) owned.royalIdle = true;
  if (owned.levelAscendWin) owned.winAscend = true;
  if (updated.selectedIdleAnimation === "levelRoyalIdle") updated.selectedIdleAnimation = "royalIdle";
  if (updated.selectedWinAnimation === "levelAscendWin") updated.selectedWinAnimation = "winAscend";
  if (updated.selectedWinAnimation === "winLightning") updated.selectedWinAnimation = "";
  const grantCosmetic = id => {
    const rewardCosmetic = cosmetics.find(item => item.id === id);
    if (!rewardCosmetic) return;
    if (!owned[id]) { owned[id] = true; return; }
    const pool = cosmetics.filter(item => item.price > 0 && !item.exclusive && item.rarity === rewardCosmetic.rarity && !owned[item.id]);
    const replacement = pool[Math.floor(Math.random() * pool.length)];
    if (replacement) {
      owned[replacement.id] = true;
      rerolls.push({ from:id, to:replacement.id, rarity:replacement.rarity });
    }
  };
  trophyRoad.forEach(item => {
    if (item.level > next.level || claimed[item.level]) return;
    claimed[item.level] = true; unlocked.push(item);
    if (item.type === "money") money += item.value;
    if (item.type === "cosmetic") grantCosmetic(item.value);
  });
  return { profile:{ ...updated, [moneyKey]:(Number(updated[moneyKey]) || 0) + money, claimedLevelRewards:claimed, ownedCosmetics:owned, lastLevelRerolls:rerolls }, previousLevel:previous.level, level:next.level, leveledUp:next.level > previous.level, unlocked, rerolls };
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
function nextDailyReset(now = new Date()) { const date = new Date(now); date.setDate(date.getDate() + 1); date.setHours(0, 0, 0, 0); return date; }
function nextWeeklyReset(now = new Date()) { const date = new Date(now), days = ((8 - date.getDay()) % 7) || 7; date.setDate(date.getDate() + days); date.setHours(0, 0, 0, 0); return date; }
function resetCountdown(target) { const total = Math.max(0, target - Date.now()), seconds = Math.floor(total / 1000), days = Math.floor(seconds / 86400), hours = Math.floor(seconds % 86400 / 3600), minutes = Math.floor(seconds % 3600 / 60), rest = seconds % 60, clock = [hours, minutes, rest].map(value => String(value).padStart(2, "0")).join(":"); return days ? `${days}d ${clock}` : clock; }

export function progressionModal(profile = {}, closeAction, claimAction) {
  const progress = levelProgress(profile), modal = document.createElement("div"), dailyReset = nextDailyReset(), weeklyReset = nextWeeklyReset();
  const stats = normalizeQuestStats(profile), quests = activeQuestList(Date.now()), completed = completedQuestRewards(profile), daily = quests.filter(q => q.period === "daily"), weekly = quests.filter(q => q.period === "weekly");
  const rerolls = Array.isArray(profile.lastLevelRerolls) ? profile.lastLevelRerolls : [];
  const rerollHtml = rerolls.length ? `<section class="level-reroll-card"><p class="eyebrow">DUPLIKAT ZAMIENIONY</p><div class="level-reroll-strip">${rerolls.map(entry => {
    const won = cosmetics.find(item => item.id === entry.to), from = cosmetics.find(item => item.id === entry.from);
    return `<article><div class="level-reroll-track"><span>${from?.name || "Duplikat"}</span><b>${won?.name || "Nowy kosmetyk"}</b></div><small>${from?.name || "Duplikat"} -> ${won?.name || "nowy kosmetyk"}</small></article>`;
  }).join("")}</div></section>` : "";
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal progression-modal enter" role="dialog" aria-modal="true" aria-labelledby="progression-title">
    <div class="modal-title"><div><p class="eyebrow">DROGA LEVELU</p><h2 id="progression-title">Level ${progress.level}</h2></div><button class="icon-btn" data-close>x</button></div>
    <div class="road-current">${levelBadgeHtml(profile, "large-level-badge")}<div><b>${progress.current}/${progress.needed} XP do kolejnego levelu</b><i><em style="width:${progress.percent}%"></em></i></div></div>
    ${rerollHtml}
    <div class="progression-body">
      <aside class="progression-side">
        ${statsPanel(profile)}
        <section class="progression-side-card quest-board ${completed.length ? "has-completed-quests" : ""}"><div class="section-heading"><div><p class="eyebrow">DAILY</p><h3 class="quest-reset-countdown" data-quest-reset="${dailyReset.getTime()}" data-quest-reset-kind="daily">Reset za --:--:--</h3></div>${completed.length ? `<button class="primary" id="claim-quests">Odbierz ${completed.length}</button>` : ""}</div><div class="quest-grid">${daily.map(quest => questCard(quest, stats, profile)).join("")}</div></section>
        <section class="progression-side-card quest-board"><div class="section-heading"><div><p class="eyebrow">WEEKLY</p><h3 class="quest-reset-countdown" data-quest-reset="${weeklyReset.getTime()}" data-quest-reset-kind="weekly">Reset za --:--:--</h3></div><span class="badge">lepsze nagrody</span></div><div class="quest-grid">${weekly.map(quest => questCard(quest, stats, profile)).join("")}</div></section>
      </aside>
      <section class="progression-rewards"><div class="section-heading"><div><p class="eyebrow">NAGRODY</p><h3>Droga levelowa</h3></div></div><div class="trophy-road">${trophyRoad.map(item => {
        const claimed = Boolean(profile.claimedLevelRewards?.[item.level]), unlocked = item.level <= progress.level;
        const cosmetic = item.type === "cosmetic" ? cosmetics.find(entry => entry.id === item.value) : null;
        return `<article class="road-node ${claimed ? "claimed" : unlocked ? "unlocked" : "locked"}"><span>LVL ${item.level}</span>${cosmetic ? cosmeticPreview(cosmetic, rewardPreviewProfile, { compact:true, hideType:true, nick:"Gracz" }) : `<div class="coin-reward-preview"><i>$</i><i>$</i><strong>$</strong></div>`}<b>${cosmetic?.name || item.label}</b><small>${claimed ? "Odebrane" : unlocked ? "Odblokowane" : "Przed toba"}</small></article>`;
      }).join("")}</div></section>
    </div>
  </section>`;
  const updateResetCountdowns = () => modal.querySelectorAll("[data-quest-reset]").forEach(node => { if (Number(node.dataset.questReset) <= Date.now()) node.dataset.questReset = (node.dataset.questResetKind === "weekly" ? nextWeeklyReset() : nextDailyReset()).getTime(); node.textContent = `Reset za ${resetCountdown(Number(node.dataset.questReset))}`; });
  updateResetCountdowns(); const resetTimer = window.setInterval(updateResetCountdowns, 1000);
  modal.querySelector("[data-close]").addEventListener("click", () => { window.clearInterval(resetTimer); closeAction(modal); });
  modal.querySelector("#claim-quests")?.addEventListener("click", () => { modal.querySelectorAll(".quest-board").forEach(board => board.classList.add("quest-claiming")); setTimeout(() => claimAction?.(modal), 650); });
  modal.querySelector("#progression-stats-mode")?.addEventListener("change", event => {
    const panel = event.target.closest("[data-stats-map]"), stats = JSON.parse(panel?.dataset.statsMap || "{}")[event.target.value] || {};
    panel?.querySelector('[data-stat="played"]')?.replaceChildren(String(stats.played || 0));
    panel?.querySelector('[data-stat="wins"]')?.replaceChildren(String(stats.wins || 0));
    panel?.querySelector('[data-stat="losses"]')?.replaceChildren(String(stats.losses || 0));
  });
  return modal;
}
