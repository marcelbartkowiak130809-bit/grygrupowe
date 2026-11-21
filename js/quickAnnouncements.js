import { escapeHtml } from "./utils.js?v=20261121-6";

export const HOST_ANNOUNCEMENTS = [
  { id:"startingSoon", text:"📢 Gra startuje za chwilę" },
  { id:"waitingPlayer", text:"⏳ Czekamy na gracza" },
  { id:"everyoneReady", text:"✅ Wszyscy gotowi?" },
  { id:"oneMoment", text:"⚠ Jeszcze chwila" },
  { id:"almostStarting", text:"🎉 Zaraz zaczynamy" },
];

const renderedAnnouncements = new WeakMap();

export function renderHostAnnouncements(view, room, currentUser, actions, onExpired) {
  const announcement = room?.hostAnnouncement;
  const now = Date.now();
  const active = announcement?.expiresAt > now;
  const anchor = view.querySelector("[data-host-announcement-anchor]:not([hidden])");
  const cooldown = anchor ? Math.max(0, Number(announcement?.cooldownUntil || 0) - now) : 0;
  const key = JSON.stringify([active && announcement.text, active && announcement.expiresAt, cooldown && announcement.cooldownUntil]);
  const previous = renderedAnnouncements.get(view);
  if (previous?.anchor === anchor && previous.key === key) return;

  previous?.controller.abort();
  previous?.banner?.remove();
  clearTimeout(previous?.timer);
  const controller = new AbortController();
  const {signal} = controller;
  const current = {anchor, key, controller};
  renderedAnnouncements.set(view, current);
  const nextChange = Math.min(active ? announcement.expiresAt - now : Infinity, cooldown || Infinity);
  if (Number.isFinite(nextChange)) current.timer = window.setTimeout(() => onExpired?.(), nextChange + 80);
  if (active) {
    const banner = document.createElement("div");
    banner.className = "host-announcement-banner";
    banner.setAttribute("role", "status");
    banner.innerHTML = `<span>${escapeHtml(announcement.text || "")}</span>`;
    view.append(banner);
    current.banner = banner;
  }
  if (room?.status !== "lobby" || room.hostUid !== currentUser || !anchor) return;
  anchor.innerHTML = `<button class="ghost room-icon-action" type="button" data-host-announcements aria-expanded="false" aria-label="Komunikaty hosta" title="Komunikaty hosta" ${cooldown ? "disabled" : ""}>📣</button>
    <div class="host-announcement-menu" hidden>${HOST_ANNOUNCEMENTS.map(item => `<button type="button" data-host-announcement="${item.id}" ${cooldown ? "disabled" : ""}>${item.text}</button>`).join("")}</div>`;
  const toggle = anchor.querySelector("[data-host-announcements]");
  const menu = anchor.querySelector(".host-announcement-menu");
  const setOpen = open => {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setOpen(menu.hidden), {signal});
  anchor.addEventListener("keydown", event => {
    if (event.key !== "Escape" || menu.hidden) return;
    event.stopPropagation();
    setOpen(false);
    toggle.focus();
  }, {signal});
  view.addEventListener("click", event => {
    if (!anchor.contains(event.target)) setOpen(false);
  }, {signal});
  menu.querySelectorAll("[data-host-announcement]").forEach(button => button.addEventListener("click", () => {
    setOpen(false);
    toggle.focus();
    actions.sendHostAnnouncement(button.dataset.hostAnnouncement);
  }, {signal}));
}
