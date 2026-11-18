import { escapeHtml } from "./utils.js?v=20260822-1";

export const HOST_ANNOUNCEMENTS = [
  { id:"startingSoon", text:"📢 Gra startuje za chwilę" },
  { id:"waitingPlayer", text:"⏳ Czekamy na gracza" },
  { id:"everyoneReady", text:"✅ Wszyscy gotowi?" },
  { id:"oneMoment", text:"⚠ Jeszcze chwila" },
  { id:"almostStarting", text:"🎉 Zaraz zaczynamy" },
];

export function renderHostAnnouncements(view, room, currentUser, actions, onExpired) {
  const announcement = room?.hostAnnouncement;
  if (announcement?.expiresAt > Date.now()) {
    const banner = document.createElement("div");
    banner.className = "host-announcement-banner";
    banner.setAttribute("role", "status");
    banner.innerHTML = `<span>${escapeHtml(announcement.text || "")}</span>`;
    view.append(banner);
    window.setTimeout(() => onExpired?.(), Math.max(100, Number(announcement.expiresAt) - Date.now() + 80));
  }
  const anchor = view.querySelector("[data-host-announcement-anchor]");
  if (room?.status !== "lobby" || room.hostUid !== currentUser || !anchor) return;
  const cooldown = Math.max(0, Number(room.hostAnnouncement?.cooldownUntil || 0) - Date.now());
  if (cooldown) window.setTimeout(() => onExpired?.(), cooldown + 80);
  anchor.innerHTML = `<button class="ghost room-icon-action" type="button" data-host-announcements aria-expanded="false" aria-label="Komunikaty hosta" title="Komunikaty hosta" ${cooldown ? "disabled" : ""}>📣</button>
    <div class="host-announcement-menu" hidden>${HOST_ANNOUNCEMENTS.map(item => `<button type="button" data-host-announcement="${item.id}" ${cooldown ? "disabled" : ""}>${item.text}</button>`).join("")}</div>`;
  const toggle = anchor.querySelector("[data-host-announcements]");
  const menu = anchor.querySelector(".host-announcement-menu");
  const setOpen = open => {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setOpen(menu.hidden));
  anchor.addEventListener("keydown", event => {
    if (event.key !== "Escape" || menu.hidden) return;
    event.stopPropagation();
    setOpen(false);
    toggle.focus();
  });
  view.addEventListener("click", event => {
    if (!anchor.contains(event.target)) setOpen(false);
  });
  menu.querySelectorAll("[data-host-announcement]").forEach(button => button.addEventListener("click", () => {
    setOpen(false);
    toggle.focus();
    actions.sendHostAnnouncement(button.dataset.hostAnnouncement);
  }));
}
