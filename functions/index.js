const crypto = require("node:crypto");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const admin = require("firebase-admin");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

const db = admin.database();
const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const BOOSTER_DURATION_MS = 6 * 60 * 60 * 1000;

const REWARDS = [
  { id: "coins-small", tier: "weak", wheelIndex: 0, type: "coins", amount: 100 },
  { id: "xp-small", tier: "weak", wheelIndex: 1, type: "xp", amount: 50 },
  { id: "coins-i", tier: "weak", wheelIndex: 0, type: "potion", itemId: "coins-i" },
  { id: "xp-i", tier: "weak", wheelIndex: 2, type: "potion", itemId: "xp-i" },
  { id: "coins-medium", tier: "medium", wheelIndex: 3, type: "coins", amount: 300 },
  { id: "xp-medium", tier: "medium", wheelIndex: 4, type: "xp", amount: 150 },
  { id: "coin-booster", tier: "medium", wheelIndex: 5, type: "coinBooster", multiplier: 2, durationMs: BOOSTER_DURATION_MS },
  { id: "coins-ii", tier: "medium", wheelIndex: 3, type: "potion", itemId: "coins-ii" },
  { id: "xp-ii", tier: "medium", wheelIndex: 4, type: "potion", itemId: "xp-ii" },
  { id: "coins-large", tier: "strong", wheelIndex: 6, type: "coins", amount: 750 },
  { id: "coins-iii", tier: "strong", wheelIndex: 6, type: "potion", itemId: "coins-iii" },
  { id: "xp-iii", tier: "strong", wheelIndex: 7, type: "potion", itemId: "xp-iii" },
  { id: "xp-booster", tier: "strong", wheelIndex: 8, type: "xpBooster", multiplier: 3, durationMs: 12 * 60 * 60 * 1000 },
];
const TIER_WEIGHTS = { weak: 70, medium: 25, strong: 5 };
const TIER_REWARDS = Object.fromEntries(Object.keys(TIER_WEIGHTS).map(tier => [tier, REWARDS.filter(reward => reward.tier === tier)]));
const POTION_EFFECTS = {
  "coins-i": { effect:"coins", multiplier:1.10, durationMs:5*60*1000 }, "coins-ii": { effect:"coins", multiplier:1.25, durationMs:10*60*1000 }, "coins-iii": { effect:"coins", multiplier:1.50, durationMs:20*60*1000 },
  "xp-i": { effect:"xp", multiplier:1.10, durationMs:5*60*1000 }, "xp-ii": { effect:"xp", multiplier:1.25, durationMs:10*60*1000 }, "xp-iii": { effect:"xp", multiplier:1.50, durationMs:20*60*1000 },
};
const HONOR_TYPES = new Set(["nicePlayer", "goodOpponent", "greatHost", "notVerySmart", "poorSport"]);

function spinId() {
  return `${Date.now()}_${crypto.randomUUID()}`;
}

function drawReward() {
  let tierCursor = crypto.randomInt(0, Object.values(TIER_WEIGHTS).reduce((sum, weight) => sum + weight, 0));
  let tier = "strong";
  for (const [candidate, weight] of Object.entries(weights)) {
    tierCursor -= weight;
    if (tierCursor < 0) { tier = candidate; break; }
  }
  const pool = TIER_REWARDS[tier];
  return { ...pool[crypto.randomInt(0, pool.length)] };
}

function cooldownError(nextSpinAt) {
  return new HttpsError("resource-exhausted", "Spin będzie dostępny ponownie później.", { nextSpinAt });
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
      lastSpinAt: state.lastSpinAt,
      nextSpinAt: state.nextSpinAt,
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
  if (Number(state.nextSpinAt) > now) throw cooldownError(Number(state.nextSpinAt));

  const requestSpinId = spinId();
  const claimedAt = Date.now();
  const proposedState = {
    lastSpinAt: claimedAt,
    nextSpinAt: claimedAt + SPIN_COOLDOWN_MS,
    spinId: requestSpinId,
    reward: publicReward(drawReward()),
    appliedSpinId: "",
  };
  await stateRef.transaction((current) => {
    const value = current && typeof current === "object" ? current : {};
    if (value.spinId && value.appliedSpinId !== value.spinId) return value;
    if (Number(value.nextSpinAt) > claimedAt) return value;
    return proposedState;
  });

  state = (await stateRef.get()).val() || {};
  if (!state.spinId) throw new HttpsError("aborted", "Nie udało się zarezerwować spinu.");
  if (state.appliedSpinId !== state.spinId) {
    const profile = await applyReward(uid, state, guestProfileOverride);
    await markApplied(stateRef, state);
    return { state, profile };
  }
  throw cooldownError(Number(state.nextSpinAt));
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

function roomHasPlayer(room, uid) {
  return Array.isArray(room?.players) ? room.players.includes(uid) : Boolean(room?.players?.[uid]);
}

exports.giveHonor = onCall(async (request) => {
  const fromUid = request.auth?.uid;
  const roomId = String(request.data?.roomId || "").trim();
  const targetUid = String(request.data?.targetUid || "").trim();
  const type = String(request.data?.type || "").trim();
  if (!fromUid) throw new HttpsError("unauthenticated", "Zaloguj się, aby wyróżnić gracza.");
  if (!roomId || !targetUid || !HONOR_TYPES.has(type) || targetUid === fromUid) throw new HttpsError("invalid-argument", "Nieprawidłowe wyróżnienie.");
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
  const guard = await eventRef.transaction(current => current || { type, createdAt:Date.now() });
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
  const profiles = (await db.ref("profiles").get()).val() || {};
  return { ...stats, registeredUsers:Math.max(Number(stats.registeredUsers) || 0, Object.keys(profiles).length) };
});
