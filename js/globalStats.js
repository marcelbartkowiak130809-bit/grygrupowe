import { escapeHtml } from "./utils.js?v=20260822-1";
import { getGameMode } from "./games.js?v=20260901-11";

export const emptyGlobalStats = { gamesPlayed:0, roomsCreated:0, registeredUsers:0, coinsEarned:0, playedMinutes:0, peakOnline:0, modeCounts:{} };

export function globalStatsHtml(rawStats = {}) {
  const stats = { ...emptyGlobalStats, ...(rawStats || {}), modeCounts:{ ...(rawStats?.modeCounts || {}) } };
  const popular = Object.entries(stats.modeCounts).sort((a,b) => Number(b[1]) - Number(a[1]))[0];
  const cards = [
    ["gamesPlayed", "Rozegrane gry", "🎮", ""],
    ["roomsCreated", "Utworzone pokoje", "🏠", ""],
    ["registeredUsers", "Zarejestrowani użytkownicy", "👥", ""],
    ["coinsEarned", "Zdobyte monety", "🪙", ""],
    ["playedMinutes", "Rozegrane minuty", "⏱️", ""],
    ["peakOnline", "Rekord online", "⚡", ""],
  ];
  const popularName = popular ? (getGameMode(popular[0])?.name || popular[0]) : "";
  return `<section class="global-stats-section"><div class="section-intro"><div><p class="eyebrow">CAŁA SPOŁECZNOŚĆ</p><h2>Statystyki strony</h2></div><p class="muted">Dane z rzeczywistych rozgrywek i aktywności graczy.</p></div><div class="global-stats-grid">${cards.map(([key,label,emoji]) => `<article class="global-stat-card"><span class="global-stat-icon">${emoji}</span><strong data-global-stat="${key}" data-global-value="${Number(stats[key]) || 0}">0</strong><small>${label}</small></article>`).join("")}<article class="global-stat-card global-popular-card"><span class="global-stat-icon">🔥</span><strong>${escapeHtml(popularName || "—")}</strong><small>Najpopularniejszy tryb</small></article></div>${popular ? `<p class="global-popular-mode">${Number(popular[1]) || 0} rozegranych gier w tym trybie</p>` : '<p class="global-popular-mode muted">Najpopularniejszy tryb pojawi się po rozegraniu pierwszych gier.</p>'}</section>`;
}

export function animateGlobalStats(root) {
  root.querySelectorAll("[data-global-stat]").forEach(node => {
    const target = Math.max(0, Number(node.dataset.globalValue) || 0), duration = 850, started = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - started) / duration), eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = Math.round(target * eased).toLocaleString("pl-PL");
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
