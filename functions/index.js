const crypto = require("node:crypto");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const admin = require("firebase-admin");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

const db = admin.database();
const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const BOOSTER_DURATION_MS = 6 * 60 * 60 * 1000;
const DOUBLE_LUCKY_SPIN_GAMEPASS_ID = "double-lucky-spin";

const GAMEPASS_IDS = [
  "premium-rotation", "double-lucky-spin", "impostor-compensation", "identity-insight", "number-oracle", "wavelength-pro", "pokemon-scout",
  "survivor-charm", "creative-license", "wavelength-second-chance", "proof-last-chance", "clock-second-chance-pass",
];
const EPIC_COSMETIC_IDS = [
  "neonBomb", "lavaBomb", "diamondBomb", "emeraldBomb", "rubyBomb", "cyberClock", "prismClock", "auroraClock", "flameClock", "voidClock",
  "rainbowMarker", "cosmicCandy", "neonCandy", "lavaCandy", "diamondCandy", "emeraldCandy", "rubyCandy", "crystalCandy",
  "sunsetNick", "matrixNick", "fireNick", "electricNick", "glitchNick", "frostNick", "toxicNick", "rainbowNick", "voidNick", "galaxyNick", "hologramNick", "auroraNick", "cosmicNick", "demonicNick", "divineNick", "plasmaNick",
  "fireFrame", "iceFrame", "electricFrame", "toxicFrame", "sunsetFrame", "rainbowFrame", "voidFrame", "galaxyFrame", "auroraFrame", "hologramFrame", "cosmicFrame", "crownFrame", "cursedFrame", "divineFrame", "plasmaFrame",
  "flameAura", "iceAura", "electricAura", "smokeAura", "toxicAura", "sunsetAura", "starsAura", "voidAura", "galaxyAura", "auroraAura", "hologramAura", "cosmicAura", "demonicAura", "divineAura", "plasmaAura",
  "hornedFrame", "impTailFrame", "thunderFrame", "stageFrame", "moneyFrame", "glassFrame", "moonFrame", "roseFrame", "stormFrame", "royalSealFrame", "dragonFrame", "angelFrame",
  "batAura", "coinAura", "crownAura", "spotlightAura", "meteorAura", "heartAura", "pixelAura", "runeAura", "shadowAura", "lavaAura", "haloAura", "cashStormAura",
  "spinIdle", "glitchIdle", "heartbeatIdle", "royalIdle", "voidIdle", "winConfetti", "winFireworks", "winStageBow", "winTrophy", "winHalo", "winPortal", "winLaser", "winRoyalRain", "winMeteor", "winAscend", "winDemonKing",
  "loseThunder", "loseLetters", "loseSquash", "loseBurn", "loseFreeze", "losePortal", "loseMeteorHit", "losePixelBreak", "loseDemonLaugh", "loseBlackHole", "loseCrownDrop",
  "premiumPrismBomb", "premiumChronoClock", "premiumSpectrumMarker", "premiumQuantumSequence", "premiumGalaxyCandy", "premiumAuroraAura",
];
const REWARDS = [
  { id: "coins-small", tier: "weak", wheelIndex: 0, probability: 21, type: "coins", amount: 100 },
  { id: "xp-small", tier: "weak", wheelIndex: 1, probability: 19, type: "xp", amount: 50 },
  { id: "coins-i", tier: "weak", wheelIndex: 2, probability: 16, type: "potion", itemId: "coins-i" },
  { id: "xp-i", tier: "weak", wheelIndex: 3, probability: 14, type: "potion", itemId: "xp-i" },
  { id: "coins-medium", tier: "medium", wheelIndex: 4, probability: 8, type: "coins", amount: 300 },
  { id: "xp-medium", tier: "medium", wheelIndex: 5, probability: 6, type: "xp", amount: 150 },
  { id: "coin-booster", tier: "medium", wheelIndex: 6, probability: 4, type: "coinBooster", multiplier: 2, durationMs: BOOSTER_DURATION_MS },
  { id: "coins-ii", tier: "medium", wheelIndex: 7, probability: 3.5, type: "potion", itemId: "coins-ii" },
  { id: "xp-ii", tier: "medium", wheelIndex: 8, probability: 3.5, type: "potion", itemId: "xp-ii" },
  { id: "coins-large", tier: "strong", wheelIndex: 9, probability: 1.1, type: "coins", amount: 750 },
  { id: "coins-iii", tier: "strong", wheelIndex: 10, probability: 1, type: "potion", itemId: "coins-iii" },
  { id: "xp-iii", tier: "strong", wheelIndex: 11, probability: 0.95, type: "potion", itemId: "xp-iii" },
  { id: "xp-booster", tier: "strong", wheelIndex: 12, probability: 0.85, type: "xpBooster", multiplier: 3, durationMs: 12 * 60 * 60 * 1000 },
  { id: "random-epic-cosmetic", tier: "jackpot", wheelIndex: 13, probability: 1, type: "cosmetic", itemId: "" },
  { id: "random-gamepass", tier: "jackpot", wheelIndex: 14, probability: 0.1, type: "gamePass", itemId: "" },
];
const SPIN_ROLL_TOTAL = 100000;
const POTION_EFFECTS = {
  "coins-i": { effect:"coins", multiplier:1.10, durationMs:5*60*1000 }, "coins-ii": { effect:"coins", multiplier:1.25, durationMs:10*60*1000 }, "coins-iii": { effect:"coins", multiplier:1.50, durationMs:20*60*1000 },
  "xp-i": { effect:"xp", multiplier:1.10, durationMs:5*60*1000 }, "xp-ii": { effect:"xp", multiplier:1.25, durationMs:10*60*1000 }, "xp-iii": { effect:"xp", multiplier:1.50, durationMs:20*60*1000 },
};
const POTION_PACKS = {
  "potion-pack": { price:5000, contents:{ 1:10, 2:5, 3:3 } },
  "mega-potion-pack": { price:10000, contents:{ 1:25, 2:15, 3:7 } },
};
const POTION_TIER_POOLS = {
  1: ["coins-i", "xp-i"],
  2: ["coins-ii", "xp-ii"],
  3: ["coins-iii", "xp-iii"],
};
const HONOR_TYPES = new Set(["nicePlayer", "goodOpponent", "greatHost", "notVerySmart", "poorSport"]);

function luckySpinLimit(profile = {}) {
  const value = profile?.gamePasses?.[DOUBLE_LUCKY_SPIN_GAMEPASS_ID];
  if (typeof value === "object") return Number(value.level) > 0 ? 2 : 1;
  return value ? 2 : 1;
}

function luckySpinStatus(state = {}, profile = {}, now = Date.now()) {
  const nextSpinAt = Number(state.nextSpinAt) || 0;
  const windowActive = nextSpinAt > now;
  const spinLimit = luckySpinLimit(profile);
  const rawUsed = Number(state.spinsUsed);
  const spinsUsed = windowActive
    ? (Number.isFinite(rawUsed) ? Math.max(0, rawUsed) : (state.lastSpinAt ? 1 : 0))
    : 0;
  const spinsRemaining = Math.max(0, spinLimit - spinsUsed);
  return { nextSpinAt, windowActive, spinLimit, spinsUsed, spinsRemaining, available:!windowActive || spinsUsed < spinLimit };
}

function spinId() {
  return `${Date.now()}_${crypto.randomUUID()}`;
}

function drawReward(profile = {}) {
  let cursor = crypto.randomInt(0, SPIN_ROLL_TOTAL);
  const selected = REWARDS.find(reward => {
    cursor -= Math.round(reward.probability * 1000);
    return cursor < 0;
  }) || REWARDS[0];
  const reward = { ...selected };
  if (reward.id === "random-gamepass") {
    const owned = profile.gamePasses && typeof profile.gamePasses === "object" ? profile.gamePasses : {};
    const available = GAMEPASS_IDS.filter(id => {
      const value = owned[id];
      const level = typeof value === "object" ? Number(value.level) || 0 : value ? Number(value) || 1 : 0;
      const definitionMax = id === "impostor-compensation" ? 5 : 1;
      return level < definitionMax;
    });
    reward.itemId = (available.length ? available : GAMEPASS_IDS)[crypto.randomInt(0, (available.length ? available : GAMEPASS_IDS).length)];
  }
  if (reward.id === "random-epic-cosmetic") {
    const owned = profile.ownedCosmetics && typeof profile.ownedCosmetics === "object" ? profile.ownedCosmetics : {};
    const available = EPIC_COSMETIC_IDS.filter(id => !owned[id]);
    const pool = available.length ? available : EPIC_COSMETIC_IDS;
    reward.itemId = pool[crypto.randomInt(0, pool.length)];
  }
  return reward;
}

function cooldownError(nextSpinAt, spinsRemaining = 0) {
  return new HttpsError("resource-exhausted", "Spin będzie dostępny ponownie później.", { nextSpinAt, spinsRemaining });
}

function publicReward(reward) {
  return {
    id: reward.id,
    tier: reward.tier || "weak",
    wheelIndex: Number.isInteger(reward.wheelIndex) ? reward.wheelIndex : 0,
    type: reward.type,
    itemId: reward.itemId || "",
    amount: reward.amount || 0,
    multiplier: reward.multiplier || 0,
    durationMs: reward.durationMs || 0,
  };
}

function safeProfilePatch(profile = {}) {
  return {
    money: Number(profile.money) || 0,
    xp: Number(profile.xp) || 0,
    sessionMoney: Number(profile.sessionMoney) || 0,
    sessionXp: Number(profile.sessionXp) || 0,
    luckySpin: profile.luckySpin || null,
    coinBooster: profile.coinBooster || null,
    xpBooster: profile.xpBooster || null,
    potionInventory: profile.potionInventory || {},
    ownedCosmetics: profile.ownedCosmetics || {},
    gamePasses: profile.gamePasses || {},
  };
}

async function applyReward(uid, state, guestProfileOverride = false) {
  const profileRef = db.ref(`profiles/${uid}`);
  const result = await profileRef.transaction((current) => {
    const profile = current && typeof current === "object" ? { ...current } : {};
    const existingSpin = profile.luckySpin && typeof profile.luckySpin === "object" ? profile.luckySpin : {};
    if (existingSpin.lastAppliedSpinId === state.spinId) return profile;

    const reward = state.reward || {};
    const guestProfile = guestProfileOverride || Boolean(profile.nickOnly);
    const moneyKey = guestProfile ? "sessionMoney" : "money";
    const xpKey = guestProfile ? "sessionXp" : "xp";
    if (reward.type === "coins") profile[moneyKey] = (Number(profile[moneyKey]) || 0) + Number(reward.amount || 0);
    if (reward.type === "xp") profile[xpKey] = (Number(profile[xpKey]) || 0) + Number(reward.amount || 0);
    if (reward.type === "potion" && reward.itemId) {
      profile.potionInventory = { ...(profile.potionInventory || {}), [reward.itemId]: (Number(profile.potionInventory?.[reward.itemId]) || 0) + 1 };
    }
    if (reward.type === "gamePass" && GAMEPASS_IDS.includes(reward.itemId)) {
      const current = profile.gamePasses && typeof profile.gamePasses === "object" ? profile.gamePasses : {};
      const value = current[reward.itemId];
      const level = typeof value === "object" ? Math.max(1, Number(value.level) || 0) : value ? Math.max(1, Number(value) || 1) : 1;
      profile.gamePasses = { ...current, [reward.itemId]: { ...(typeof value === "object" ? value : {}), level, purchasedAt: value?.purchasedAt || Date.now(), source: value?.source || "lucky-spin" } };
    }
    if (reward.type === "cosmetic" && EPIC_COSMETIC_IDS.includes(reward.itemId)) {
      profile.ownedCosmetics = { ...(profile.ownedCosmetics || {}), [reward.itemId]: true };
    }

    if (reward.type === "coinBooster") {
      const current = profile.coinBooster && typeof profile.coinBooster === "object" ? profile.coinBooster : {};
      profile.coinBooster = {
        multiplier: Math.max(Number(current.multiplier) || 1, Number(reward.multiplier) || 1),
        expiresAt: Math.max(Number(current.expiresAt) || 0, Number(state.lastSpinAt) + Number(reward.durationMs || 0)),
      };
    }
    if (reward.type === "xpBooster") {
      const current = profile.xpBooster && typeof profile.xpBooster === "object" ? profile.xpBooster : {};
      profile.xpBooster = {
        multiplier: Math.max(Number(current.multiplier) || 1, Number(reward.multiplier) || 1),
        expiresAt: Math.max(Number(current.expiresAt) || 0, Number(state.lastSpinAt) + Number(reward.durationMs || 0)),
      };
    }

    profile.luckySpin = {
      windowStartedAt: Number(state.windowStartedAt) || Number(state.lastSpinAt) || Date.now(),
      lastSpinAt: state.lastSpinAt,
      nextSpinAt: state.nextSpinAt,
      spinsUsed: Number(state.spinsUsed) || 1,
      spinLimit: Number(state.spinLimit) || 1,
      lastReward: publicReward(reward),
      lastAppliedSpinId: state.spinId,
    };
    profile.updatedAt = Date.now();
    return profile;
  });
  return result.snapshot.val() || {};
}

async function markApplied(stateRef, state) {
  await stateRef.transaction((current) => {
    if (!current || current.spinId !== state.spinId) return current;
    return { ...current, appliedSpinId: state.spinId };
  });
}

async function claimOrRecoverSpin(uid, guestProfileOverride = false) {
  const stateRef = db.ref(`luckySpins/${uid}`);
  const now = Date.now();
  const currentSnapshot = await stateRef.get();
  let state = currentSnapshot.val() || {};

  if (state.spinId && state.appliedSpinId !== state.spinId) {
    const profile = await applyReward(uid, state, guestProfileOverride);
    await markApplied(stateRef, state);
    return { state, profile };
  }
  const profile = (await db.ref(`profiles/${uid}`).get()).val() || {};
  const availability = luckySpinStatus(state, profile, now);
  if (!availability.available) throw cooldownError(availability.nextSpinAt, availability.spinsRemaining);
  const requestSpinId = spinId();
  const claimedAt = Date.now();
  const spinsUsed = availability.windowActive ? availability.spinsUsed + 1 : 1;
  const nextSpinAt = availability.windowActive ? availability.nextSpinAt : claimedAt + SPIN_COOLDOWN_MS;
  const proposedState = {
    lastSpinAt: claimedAt,
    windowStartedAt: availability.windowActive ? Number(state.windowStartedAt) || Number(state.lastSpinAt) || claimedAt : claimedAt,
    nextSpinAt,
    spinsUsed,
    spinLimit: availability.spinLimit,
    spinId: requestSpinId,
    reward: publicReward(drawReward(profile)),
    appliedSpinId: "",
  };
  await stateRef.transaction((current) => {
    const value = current && typeof current === "object" ? current : {};
    if (value.spinId && value.appliedSpinId !== value.spinId) return value;
    if (!luckySpinStatus(value, profile, claimedAt).available) return value;
    return proposedState;
  });

  state = (await stateRef.get()).val() || {};
  if (!state.spinId) throw new HttpsError("aborted", "Nie udało się zarezerwować spinu.");
  if (state.appliedSpinId !== state.spinId) {
    const profile = await applyReward(uid, state, guestProfileOverride);
    await markApplied(stateRef, state);
    return { state, profile };
  }
  const finalStatus = luckySpinStatus(state, profile, Date.now());
  throw cooldownError(finalStatus.nextSpinAt, finalStatus.spinsRemaining);
}

exports.luckySpin = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Zaloguj się, aby zakręcić kołem.");

  const isAnonymous = request.auth?.token?.firebase?.sign_in_provider === "anonymous";
  const { state, profile } = await claimOrRecoverSpin(uid, isAnonymous);
  return {
    accepted: true,
    serverNow: Date.now(),
    nextSpinAt: Number(state.nextSpinAt),
    spinsUsed: Number(state.spinsUsed) || 1,
    spinLimit: Number(state.spinLimit) || luckySpinLimit(profile),
    spinsRemaining: Math.max(0, (Number(state.spinLimit) || luckySpinLimit(profile)) - (Number(state.spinsUsed) || 1)),
    reward: publicReward(state.reward),
    profile: safeProfilePatch(profile),
  };
});

exports.usePotion = onCall(async (request) => {
  const uid = request.auth?.uid;
  const itemId = String(request.data?.itemId || "").trim();
  const potion = POTION_EFFECTS[itemId];
  if (!uid) throw new HttpsError("unauthenticated", "Zaloguj się, aby użyć potki.");
  if (!potion) throw new HttpsError("invalid-argument", "Nieprawidłowa potka.");

  const profileRef = db.ref(`profiles/${uid}`);
  const result = await profileRef.transaction(current => {
    const profile = current && typeof current === "object" ? { ...current } : {};
    const inventory = { ...(profile.potionInventory || {}) };
    const quantity = Number(inventory[itemId]) || 0;
    if (quantity < 1) return;
    inventory[itemId] = quantity - 1;
    profile.potionInventory = inventory;
    const expiresAt = Date.now() + potion.durationMs;
    const apply = key => {
      const currentBoost = profile[key] && typeof profile[key] === "object" ? profile[key] : {};
      profile[key] = { multiplier:Math.max(Number(currentBoost.multiplier) || 1, potion.multiplier), expiresAt:Math.max(Number(currentBoost.expiresAt) || 0, expiresAt) };
    };
    if (potion.effect === "xp") apply("xpBooster");
    if (potion.effect === "coins") apply("coinBooster");
    profile.updatedAt = Date.now();
    return profile;
  });
  if (!result.committed) throw new HttpsError("failed-precondition", "Nie masz tej potki w ekwipunku.");
  return { ok:true, message:`Użyto potki ${itemId}. Boost jest aktywny.`, profile:safeProfilePatch(result.snapshot.val() || {}) };
});

exports.buyPotionPack = onCall(async (request) => {
  const uid = request.auth?.uid;
  const packId = String(request.data?.packId || "").trim();
  const pack = POTION_PACKS[packId];
  if (!uid) throw new HttpsError("unauthenticated", "Zaloguj się, aby kupić zestaw potek.");
  if (!pack) throw new HttpsError("invalid-argument", "Nieprawidłowy zestaw potek.");

  const rewards = [];
  Object.entries(pack.contents).forEach(([tier, count]) => {
    const pool = POTION_TIER_POOLS[tier] || POTION_TIER_POOLS[1];
    for (let index = 0; index < count; index += 1) rewards.push(pool[crypto.randomInt(0, pool.length)]);
  });
  const profileRef = db.ref(`profiles/${uid}`);
  const result = await profileRef.transaction(current => {
    const profile = current && typeof current === "object" ? { ...current } : {};
    if (profile.nickOnly || (Number(profile.money) || 0) < pack.price) return;
    const inventory = profile.potionInventory && typeof profile.potionInventory === "object" ? { ...profile.potionInventory } : {};
    rewards.forEach(itemId => { inventory[itemId] = (Number(inventory[itemId]) || 0) + 1; });
    profile.money = (Number(profile.money) || 0) - pack.price;
    profile.potionInventory = inventory;
    profile.updatedAt = Date.now();
    return profile;
  });
  if (!result.committed) {
    const current = result.snapshot.val() || {};
    if (current.nickOnly) throw new HttpsError("failed-precondition", "Zestawy potek są dostępne tylko dla zapisanych kont.");
    throw new HttpsError("failed-precondition", "Nie masz wystarczająco monet na ten zestaw.");
  }
  return { ok:true, packId, profile:safeProfilePatch(result.snapshot.val() || {}) };
});

function roomHasPlayer(room, uid) {
  return Array.isArray(room?.players) ? room.players.includes(uid) : Boolean(room?.players?.[uid]);
}

exports.giveHonor = onCall(async (request) => {
  const fromUid = request.auth?.uid;
  const roomId = String(request.data?.roomId || "").trim();
  const targetUid = String(request.data?.targetUid || "").trim();
  const type = String(request.data?.type || "").trim();
  if (!fromUid) throw new HttpsError("unauthenticated", "Zaloguj się, aby wyróżnić gracza.");
  if (!roomId || !targetUid || targetUid.startsWith("bot:") || !HONOR_TYPES.has(type) || targetUid === fromUid) throw new HttpsError("invalid-argument", "Nieprawidłowe wyróżnienie.");
  const room = (await db.ref(`rooms/${roomId}`).get()).val();
  const game = room?.gameState || room?.game || {};
  const finished = game?.finished === true || ["result", "results", "gameSummary"].includes(game?.phase) || room?.status === "results";
  if (!roomHasPlayer(room, fromUid) || !roomHasPlayer(room, targetUid) || !finished) throw new HttpsError("failed-precondition", "Wyróżnienie jest dostępne po zakończeniu gry.");

  const voteRef = db.ref(`honorVotes/${roomId}/${fromUid}`);
  const proposed = { voteId:crypto.randomUUID(), targetUid, type, createdAt:Date.now() };
  await voteRef.transaction(current => current || proposed);
  const vote = (await voteRef.get()).val();
  if (!vote || vote.targetUid !== targetUid || vote.type !== type) throw new HttpsError("already-exists", "Możesz wyróżnić tylko jedną osobę w tym meczu.");

  const profileRef = db.ref(`profiles/${targetUid}`);
  const updated = await profileRef.transaction(current => {
    const profile = current && typeof current === "object" ? { ...current } : {};
    const applied = profile.honorVoteIds && typeof profile.honorVoteIds === "object" ? { ...profile.honorVoteIds } : {};
    if (applied[vote.voteId]) return profile;
    const counts = { nicePlayer:0, goodOpponent:0, greatHost:0, notVerySmart:0, poorSport:0, ...(profile.honorCounts || {}) };
    counts[type] = (Number(counts[type]) || 0) + 1;
    applied[vote.voteId] = true;
    return { ...profile, honorCounts:counts, honorVoteIds:applied, updatedAt:Date.now() };
  });
  const updatedCounts = updated.snapshot.val()?.honorCounts || { nicePlayer:0, goodOpponent:0, greatHost:0, notVerySmart:0, poorSport:0 };
  await db.ref(`publicProfiles/${targetUid}/honorCounts`).set(updatedCounts);
  return { accepted:true, targetUid, type };
});

exports.recordSiteEvent = onCall(async (request) => {
  const uid = request.auth?.uid;
  const data = request.data || {};
  const type = String(data.type || "").trim();
  const eventId = String(data.eventId || "").replace(/[.#$\[\]/]/g, "_").slice(0, 180);
  const allowed = new Set(["gameFinished", "roomCreated", "userRegistered", "coinsEarned", "onlinePeak"]);
  if (!uid) throw new HttpsError("unauthenticated", "Zaloguj się.");
  if (!eventId || !allowed.has(type)) throw new HttpsError("invalid-argument", "Nieprawidłowe zdarzenie.");
  const eventRef = db.ref(`siteStatEvents/${uid}/${eventId}`);
  const eventRecord = { type, eventId, createdAt:Date.now() };
  if (data.modeId) eventRecord.modeId = String(data.modeId).slice(0, 80);
  if (data.minutes != null) eventRecord.minutes = Math.max(0, Math.min(1440, Number(data.minutes) || 0));
  if (data.amount != null) eventRecord.amount = Math.max(0, Math.min(100000000, Number(data.amount) || 0));
  if (data.value != null) eventRecord.value = Math.max(0, Math.min(1000000, Number(data.value) || 0));
  const guard = await eventRef.transaction(current => current || eventRecord);
  if (!guard.committed) return { accepted:true, duplicate:true };
  const statsRef = db.ref("siteStats/global");
  await statsRef.transaction(current => {
    const stats = current && typeof current === "object" ? { ...current } : {};
    stats.gamesPlayed = Number(stats.gamesPlayed) || 0;
    stats.roomsCreated = Number(stats.roomsCreated) || 0;
    stats.registeredUsers = Number(stats.registeredUsers) || 0;
    stats.coinsEarned = Number(stats.coinsEarned) || 0;
    stats.playedMinutes = Number(stats.playedMinutes) || 0;
    stats.peakOnline = Number(stats.peakOnline) || 0;
    stats.modeCounts = stats.modeCounts && typeof stats.modeCounts === "object" ? { ...stats.modeCounts } : {};
    if (type === "gameFinished") { stats.gamesPlayed += 1; stats.playedMinutes += Math.max(0, Number(data.minutes) || 0); const modeId = String(data.modeId || "unknown"); stats.modeCounts[modeId] = (Number(stats.modeCounts[modeId]) || 0) + 1; }
    if (type === "roomCreated") stats.roomsCreated += 1;
    if (type === "userRegistered") stats.registeredUsers += 1;
    if (type === "coinsEarned") stats.coinsEarned += Math.max(0, Number(data.amount) || 0);
    if (type === "onlinePeak") stats.peakOnline = Math.max(stats.peakOnline, Number(data.value) || 0);
    stats.updatedAt = Date.now();
    return stats;
  });
  return { accepted:true };
});

exports.getSiteStats = onCall(async () => {
  const stats = (await db.ref("siteStats/global").get()).val() || {};
  const profiles = (await db.ref("publicProfiles").get()).val() || {};
  return { ...stats, registeredUsers:Math.max(Number(stats.registeredUsers) || 0, Object.keys(profiles).length) };
});
