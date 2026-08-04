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
  { id: "coins-small", type: "coins", amount: 100, weight: 40 },
  { id: "coins-medium", type: "coins", amount: 300, weight: 25 },
  { id: "coins-large", type: "coins", amount: 750, weight: 15 },
  { id: "xp", type: "xp", amount: 100, weight: 10 },
  { id: "coin-booster", type: "coinBooster", multiplier: 2, durationMs: BOOSTER_DURATION_MS, weight: 5 },
  { id: "xp-booster", type: "xpBooster", multiplier: 2, durationMs: BOOSTER_DURATION_MS, weight: 5 },
];
const TOTAL_WEIGHT = REWARDS.reduce((total, reward) => total + reward.weight, 0);
const HONOR_TYPES = new Set(["nicePlayer", "goodOpponent", "greatHost"]);

function spinId() {
  return `${Date.now()}_${crypto.randomUUID()}`;
}

function drawReward() {
  let cursor = crypto.randomInt(0, TOTAL_WEIGHT);
  for (const reward of REWARDS) {
    cursor -= reward.weight;
    if (cursor < 0) return { ...reward };
  }
  return { ...REWARDS[REWARDS.length - 1] };
}

function cooldownError(nextSpinAt) {
  return new HttpsError("resource-exhausted", "Spin będzie dostępny ponownie później.", { nextSpinAt });
}

function publicReward(reward) {
  return {
    id: reward.id,
    type: reward.type,
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
    const counts = { nicePlayer:0, goodOpponent:0, greatHost:0, ...(profile.honorCounts || {}) };
    counts[type] = (Number(counts[type]) || 0) + 1;
    applied[vote.voteId] = true;
    return { ...profile, honorCounts:counts, honorVoteIds:applied, updatedAt:Date.now() };
  });
  const updatedCounts = updated.snapshot.val()?.honorCounts || { nicePlayer:0, goodOpponent:0, greatHost:0 };
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
