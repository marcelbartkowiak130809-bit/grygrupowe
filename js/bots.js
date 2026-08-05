const BOT_PREFIX = "bot:";

export const BOT_DIFFICULTIES = [
  { id: "easy", label: "Niska", accuracy: 0.50, minDelay: 1800, maxDelay: 5200 },
  { id: "normal", label: "Średnia", accuracy: 0.70, minDelay: 1100, maxDelay: 3600 },
  { id: "hard", label: "Mądra", accuracy: 0.85, minDelay: 700, maxDelay: 2400 },
  { id: "expert", label: "Geniusz", accuracy: 0.97, minDelay: 420, maxDelay: 1500 },
];

export function isBotId(uid = "") { return String(uid).startsWith(BOT_PREFIX); }
export function botIds(room) { return (room?.players || []).filter(isBotId); }
export function botCount(room) { return botIds(room).length; }
export function botRewardMultiplier(room) { return Math.max(0.2, 1 - Math.min(4, botCount(room)) * 0.2); }
export function canUseBots(room, mode) {
  return roomAllowsBots(room, mode);
}
export function botDifficulty(room, uid = "") {
  const profile = uid ? room?.playerProfiles?.[uid] : null;
  return BOT_DIFFICULTIES.find(item => item.id === profile?.botDifficulty) || BOT_DIFFICULTIES[1];
}
export function botDelay(room, kind = "answer", uid = "") {
  const level = botDifficulty(room, uid), span = level.maxDelay - level.minDelay;
  const kindFactor = kind === "thinking" ? 1.25 : kind === "typing" ? 1.5 : 1;
  return Math.round((level.minDelay + Math.random() * Math.max(1, span)) * kindFactor);
}
export function botShouldBeCorrect(room, uid = "") { return Math.random() < botDifficulty(room, uid).accuracy; }
export function botName(index) { return `Bot ${index + 1}`; }
export function botUid() { return `${BOT_PREFIX}${Math.random().toString(36).slice(2, 10)}`; }
export function botProfile(uid, index, difficulty = "normal") {
  return { uid, nick: botName(index), nickOnly: true, isBot: true, botDifficulty: difficulty, adultStatus: "unknown", money: 1000000000, sessionMoney: 1000000000, xp: 0, avatarImage: "", selectedAvatarFrame: "defaultFrame", selectedNickEffect: "defaultNick", selectedAura: "noAura", selectedCandySkin: "defaultCandy", selectedBombSkin: "defaultBomb", selectedClockSkin: "defaultClock" };
}
export function roomAllowsBots(room, mode) {
  return Boolean(room?.status === "lobby" && mode?.supportsLobby && !["co-wolisz", "ranking"].includes(mode.id) && !(mode.id === "quiz" && room.settings?.quizVariant === "competitive"));
}
