import { levelBadgeHtml } from "./progression.js?v=20260605-3";

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[char]);
}

export function avatarHtml(profile = {}, className = "") {
  const classes = `avatar ${profile.selectedAvatarFrame || "defaultFrame"} ${profile.selectedAura || "noAura"} ${profile.selectedIdleAnimation || ""} ${className}`.trim();
  const content = profile.avatarImage
    ? `<img src="${escapeHtml(profile.avatarImage)}" alt="">`
    : escapeHtml((profile.nick || "?")[0].toUpperCase());
  return `<div class="${classes}">${content}</div>`;
}

function playerFxHtml(profile = {}) {
  return [profile.selectedWinAnimation, profile.selectedLoseAnimation].filter(Boolean).map(id => {
    if (id === "winLaser") return '<span class="fx-laser laser-a"></span><span class="fx-laser laser-b"></span><span class="fx-laser laser-c"></span><span class="fx-laser laser-d"></span><span class="fx-laser laser-e"></span>';
    if (id === "winMeteor") return '<span class="fx-loss-meteor fx-win-dodge-meteor"></span><span class="fx-impact fx-win-dodge-impact"></span><span class="fx-rubble rubble-a"></span><span class="fx-rubble rubble-b"></span><span class="fx-rubble rubble-c"></span>';
    if (id === "loseMeteorHit") return '<span class="fx-loss-meteor"></span><span class="fx-impact"></span><span class="fx-rubble rubble-a"></span><span class="fx-rubble rubble-b"></span><span class="fx-rubble rubble-c"></span>';
    if (id === "loseBlackHole") return '<span class="fx-black-hole"></span>';
    if (id === "levelVoidLose") return '<span class="fx-void-rift"></span><span class="fx-void-ring"></span>';
    if (id === "winDemonKing") return '<span class="fx-demon-throne"></span><span class="fx-demon-crown"></span><span class="fx-demon-horns"></span><span class="fx-ha ha-a">HA</span><span class="fx-ha ha-b">HA</span><span class="fx-ha ha-c">HA</span><span class="fx-ha ha-d">HA</span><span class="fx-ha ha-e">HA</span>';
    if (id === "loseDemonLaugh") return '<span class="fx-demon-shadow"></span><span class="fx-ha ha-a">HA</span><span class="fx-ha ha-b">HA</span><span class="fx-ha ha-c">HA</span><span class="fx-ha ha-d">HA</span>';
    if (id === "winMoney") return '<span class="fx-cash-toss cash-a"></span><span class="fx-cash-toss cash-b"></span><span class="fx-cash-toss cash-c"></span>';
    if (id === "winRoyalRain") return '<span class="fx-money money-a"></span><span class="fx-money money-b"></span><span class="fx-money money-c"></span><span class="fx-money money-d"></span>';
    if (id === "levelChampionWin") return '<span class="fx-royal-mantle"></span><span class="fx-crown"></span>';
    if (id === "winCrown") return '<span class="fx-crown fx-worn-crown"></span>';
    if (id === "loseCrownDrop") return '<span class="fx-falling-crown"></span><span class="fx-crown-dust dust-left"></span><span class="fx-crown-dust dust-right"></span>';
    if (id === "winSpotlight") return '<span class="fx-spotlight"></span>';
    if (id === "winConfetti") return '<span class="fx-confetti confetti-a"></span><span class="fx-confetti confetti-b"></span><span class="fx-confetti confetti-c"></span><span class="fx-confetti confetti-d"></span><span class="fx-confetti confetti-e"></span><span class="fx-confetti confetti-f"></span>';
    if (id === "winFireworks") return '<span class="fx-firework fw-a"></span><span class="fx-firework fw-b"></span><span class="fx-firework fw-c"></span>';
    if (id === "loseThunder") return '<span class="fx-loss-thunder"></span>';
    if (id === "winTrophy") return '<span class="fx-trophy"></span><span class="fx-trophy-shine"></span>';
    if (id === "winAscend" || id === "levelAscendWin") return '<span class="fx-ascend-column"></span><span class="fx-ascend-sparks"></span>';
    if (id === "winPortal") return '<span class="fx-rick-portal"></span><span class="fx-gem gem-a"></span><span class="fx-gem gem-b"></span><span class="fx-gem gem-c"></span><span class="fx-portal-money portal-money-a"></span><span class="fx-portal-money portal-money-b"></span>';
    if (id === "losePortal") return '<span class="fx-exit-portal fx-rick-exit"></span><span class="fx-portal-gun"></span><span class="fx-portal-core"></span>';
    if (id === "winHalo") return '<span class="fx-halo-ring"></span><span class="fx-halo-rays"></span>';
    if (id === "winStageBow") return '<span class="fx-stage-floor"></span>';
    if (id === "loseFreeze") return '<span class="fx-freeze-pane"></span><span class="fx-ice-crack crack-a"></span><span class="fx-ice-crack crack-b"></span>';
    if (id === "loseBurn") return '<span class="fx-ash ash-a"></span><span class="fx-ash ash-b"></span><span class="fx-ash ash-c"></span>';
    if (id === "loseCrack") return '<span class="fx-glass-crack"></span><span class="fx-crack-shard shard-a"></span><span class="fx-crack-shard shard-b"></span>';
    if (id === "levelShatterLose") return '<span class="fx-shatter-pane"></span><span class="fx-shatter-piece shatter-a"></span><span class="fx-shatter-piece shatter-b"></span><span class="fx-shatter-piece shatter-c"></span><span class="fx-shatter-piece shatter-d"></span>';
    if (id === "losePixelBreak") return '<span class="fx-pixels pixel-a"></span><span class="fx-pixels pixel-b"></span><span class="fx-pixels pixel-c"></span><span class="fx-pixels pixel-d"></span>';
    if (id === "loseLetters") return '<span class="fx-letter l-a">N</span><span class="fx-letter l-b">I</span><span class="fx-letter l-c">C</span><span class="fx-letter l-d">K</span>';
    if (id === "loseDust") return '<span class="fx-dust-cloud"></span><span class="fx-dust dust-a"></span><span class="fx-dust dust-b"></span><span class="fx-dust dust-c"></span>';
    if (id === "loseBonk") return '<span class="fx-bonk-hammer"></span><span class="fx-bonk-star star-a"></span><span class="fx-bonk-star star-b"></span>';
    if (id === "loseSquash") return '<span class="fx-anvil"></span><span class="fx-squash-line line-a"></span><span class="fx-squash-line line-b"></span>';
    return "";
  }).join("");
}

export function playerMiniHtml(profile = {}, className = "") {
  const animationClasses = `${profile.selectedWinAnimation || ""} ${profile.selectedLoseAnimation || ""}`.trim();
  return `<div class="mini-player ${animationClasses} ${className}">${playerFxHtml(profile)}${avatarHtml(profile)}<span class="nick ${profile.selectedNickEffect || "defaultNick"}">${escapeHtml(profile.nick || "Gracz")}</span>${levelBadgeHtml(profile)}</div>`;
}

export function boardPlayerStripHtml(players = [], accounts = {}, options = {}) {
  const { activeUid = "", scores = null, scoreLabel = "pkt" } = options;
  return `<section class="board-player-strip">${players.map(uid => `<article class="board-player ${uid === activeUid ? "active-board-player" : ""}">${playerMiniHtml(accounts[uid])}${scores ? `<small>${Number(scores[uid]) || 0} ${escapeHtml(scoreLabel)}</small>` : ""}</article>`).join("")}</section>`;
}

export function randomGuestNick() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let index = 0; index < 6; index += 1) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `gracz_${suffix}`;
}

export function normalizeNick(nick) {
  return String(nick || "").toLowerCase().trim().replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "").slice(0, 18);
}

export function normalizeAnswer(value) {
  return String(value || "").toLowerCase().trim().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l")
    .replace(/[^a-z0-9\s-]/gi, "").replace(/\s+/g, " ");
}

export function formatClock(seconds) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function uid(prefix = "") {
  return `${prefix}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const icons = {
  audio: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 9.5a4 4 0 0 1 0 5"/><path d="M17.5 7a7 7 0 0 1 0 10"/>',
  crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z"/><path d="M5 20h14"/>',
  lock: '<rect width="16" height="12" x="4" y="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  logout: '<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/>',
  play: '<path d="m5 3 14 9-14 9V3Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  shop: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  scroll: '<path d="M8 21h10a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h9"/><path d="M8 21a3 3 0 0 1 0-6h1"/><path d="M18 9a3 3 0 0 0 0-6H7a3 3 0 0 0-3 3v12"/><path d="M7 3a3 3 0 0 1 0 6"/>',
  sparkles: '<path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9Z"/><path d="m5 18-.7 1.3L3 20l1.3.7L5 22l.7-1.3L7 20l-1.3-.7Z"/><path d="m19 16-.7 1.3L17 18l1.3.7L19 20l.7-1.3L21 18l-1.3-.7Z"/>',
  timer: '<path d="M10 2h4"/><path d="M12 14v-4"/><circle cx="12" cy="14" r="8"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>',
};

export function icon(name, size = 20) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ""}</svg>`;
}
