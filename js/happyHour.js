import { escapeHtml } from "./utils.js?v=20261121-8";

export const HAPPY_HOUR_CONFIG = {
  enabled: true,
  intervalMs: 6 * 60 * 60 * 1000,
  durationMs: 30 * 60 * 1000,
  startAt: Date.UTC(2026, 0, 1),
  events: [
    { id:"coins50", label:"+50% monet", icon:"💰", coinMultiplier:1.5 },
    { id:"xp50", label:"+50% XP", icon:"⭐", xpMultiplier:1.5 },
    { id:"selectedRewards", label:"+100% nagród wybranych trybów", icon:"🎁", rewardMultiplier:2, modes:["quiz","mathematics","sequence"] },
    { id:"modeOfDay", label:"Tryb dnia ma dodatkowe nagrody", icon:"🎲", rewardMultiplier:1.5, modes:["udowodnij","impostor","wavelength","pokemon-dex","quiz"] },
  ],
};

function hash(value) { let result = 2166136261; for (const char of String(value)) { result ^= char.charCodeAt(0); result = Math.imul(result, 16777619); } return result >>> 0; }
export function happyHourAt(now = Date.now()) {
  const config = HAPPY_HOUR_CONFIG;
  if (!config.enabled || !config.events.length || now < config.startAt) return null;
  const cycle = Math.floor((now - config.startAt) / config.intervalMs), startsAt = config.startAt + cycle * config.intervalMs;
  if (now >= startsAt + config.durationMs) return null;
  const event = config.events[hash(cycle) % config.events.length];
  const mode = event.modes?.length ? event.modes[hash(`${cycle}:mode`) % event.modes.length] : "";
  return { ...event, mode, cycle, startsAt, endsAt:startsAt + config.durationMs, eventId:`happy-hour:${cycle}` };
}
export function happyHourNextChange(now = Date.now()) {
  const config = HAPPY_HOUR_CONFIG;
  if (!config.enabled) return 0;
  if (now < config.startAt) return config.startAt;
  const cycle = Math.floor((now - config.startAt) / config.intervalMs), startsAt = config.startAt + cycle * config.intervalMs;
  return now < startsAt + config.durationMs ? startsAt + config.durationMs : startsAt + config.intervalMs;
}
export function happyHourMultiplier(room, kind, now = Date.now()) {
  const event = happyHourAt(now);
  if (!event) return 1;
  if (kind === "coins" && event.coinMultiplier) return event.coinMultiplier;
  if (kind === "xp" && event.xpMultiplier) return event.xpMultiplier;
  if (event.rewardMultiplier && (!event.modes?.length || event.modes.includes(room?.gameMode))) return event.rewardMultiplier;
  return 1;
}
export function formatHappyHourCountdown(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours} godz. ${minutes % 60} min`;
  }
  if (minutes) return `${minutes} min ${rest} sek.`;
  return `${rest} sek.`;
}
export function happyHourBannerHtml(event) {
  if (!event) return "";
  const label = event.id === "modeOfDay" ? `${event.label}: ${event.mode}` : event.label;
  return `<div class="happy-hour-banner" data-happy-hour-end="${event.endsAt}" role="status"><span class="happy-hour-banner-icon" aria-hidden="true">${event.icon}</span><div class="happy-hour-banner-copy"><b>HAPPY HOUR</b><strong>${escapeHtml(label)}</strong></div><time data-happy-hour-countdown>${formatHappyHourCountdown((event.endsAt - Date.now()) / 1000)}</time><button type="button" class="happy-hour-dismiss" data-happy-hour-dismiss aria-label="Ukryj Happy Hour" title="Ukryj do końca tego Happy Hour">×</button></div><button type="button" class="happy-hour-reopen" data-happy-hour-reopen aria-label="Pokaż Happy Hour" title="Pokaż Happy Hour"><span aria-hidden="true">${event.icon}</span><span class="happy-hour-sr-only">Pokaż Happy Hour: ${escapeHtml(label)}</span></button>`;
}

export function createHappyHourBanner(root, clock, announce) {
  let active, banner, reopen, countdown, topbar, observer;
  let timer = 0, scheduledAt = 0;

  function syncLayout() {
    if (!banner || banner.hidden) return;
    const topbarRect = topbar?.getBoundingClientRect();
    const bottom = topbarRect ? Math.max(topbarRect.bottom, topbarRect.height) : 0;
    banner.style.setProperty("--happy-hour-top", `${Math.ceil(bottom + 12)}px`);
    root.style.setProperty("--happy-hour-height", `${banner.offsetHeight}px`);
  }

  function setMinimized(minimized) {
    banner.hidden = minimized;
    reopen.hidden = !minimized;
    root.classList.toggle("has-happy-hour-banner", !minimized);
    if (minimized) root.style.removeProperty("--happy-hour-height");
    else syncLayout();
  }

  function sync() {
    if (!root.isConnected) return;
    const now = clock(), event = happyHourAt(now);
    if (event?.eventId !== active?.eventId || (event && !banner?.isConnected)) {
      observer?.disconnect();
      observer = topbar = null;
      banner?.remove();
      reopen?.remove();
      banner = reopen = countdown = null;
      root.classList.remove("has-happy-hour-banner");
      root.style.removeProperty("--happy-hour-height");
      active = event;
      if (event) {
        root.insertAdjacentHTML("beforeend", happyHourBannerHtml(event));
        banner = root.querySelector(".happy-hour-banner");
        reopen = root.querySelector("[data-happy-hour-reopen]");
        countdown = banner.querySelector("[data-happy-hour-countdown]");
        const dismiss = banner.querySelector("[data-happy-hour-dismiss]");
        const dismissedKey = `happy-hour-dismissed:${event.eventId}`;
        setMinimized(localStorage.getItem(dismissedKey) === "1");
        dismiss.onclick = () => {
          localStorage.setItem(dismissedKey, "1");
          setMinimized(true);
          reopen.focus({ preventScroll:true });
        };
        reopen.onclick = () => {
          localStorage.removeItem(dismissedKey);
          setMinimized(false);
          dismiss.focus({ preventScroll:true });
        };
        if (window.ResizeObserver) {
          observer = new ResizeObserver(syncLayout);
          observer.observe(banner);
        }
        const seenKey = `happy-hour-seen:${event.eventId}`;
        if (!localStorage.getItem(seenKey)) {
          localStorage.setItem(seenKey, "1");
          announce(event);
        }
      }
    }
    if (event) {
      const header = root.querySelector(".topbar");
      if (header !== topbar) {
        if (topbar) observer?.unobserve(topbar);
        topbar = header;
        if (topbar) observer?.observe(topbar);
        syncLayout();
      }
      const label = formatHappyHourCountdown((event.endsAt - now) / 1000);
      if (countdown.textContent !== label) countdown.textContent = label;
    }
    const wakeAt = event ? Math.min(event.endsAt, (Math.floor(now / 1000) + 1) * 1000) : happyHourNextChange(now);
    if (wakeAt !== scheduledAt) {
      window.clearTimeout(timer);
      scheduledAt = wakeAt;
      if (wakeAt) timer = window.setTimeout(() => {
        scheduledAt = 0;
        sync();
      }, Math.max(1, wakeAt - now));
    }
  }
  return sync;
}
