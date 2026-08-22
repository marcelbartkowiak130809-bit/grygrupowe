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
  if (room?.status !== "lobby" || room.hostUid !== currentUser) return;
  const controls = document.createElement("section");
  controls.className = "host-announcement-controls panel";
  const cooldown = Math.max(0, Number(room.hostAnnouncement?.cooldownUntil || 0) - Date.now());
  if (cooldown) window.setTimeout(() => onExpired?.(), cooldown + 80);
  controls.innerHTML = `<div><p class="eyebrow">HOST</p><h3>Komunikaty</h3><p class="muted">Wyślij krótką informację wszystkim graczom.</p></div><div class="host-announcement-actions"><button class="primary" data-host-announcements ${cooldown ? "disabled" : ""}>📣 Komunikaty</button><div class="host-announcement-menu" hidden>${HOST_ANNOUNCEMENTS.map(item => `<button type="button" data-host-announcement="${item.id}" ${cooldown ? "disabled" : ""}>${item.text}</button>`).join("")}</div></div>`;
  const toggle = controls.querySelector("[data-host-announcements]");
  const menu = controls.querySelector(".host-announcement-menu");
  toggle.addEventListener("click", () => { menu.hidden = !menu.hidden; });
  controls.querySelectorAll("[data-host-announcement]").forEach(button => button.addEventListener("click", () => { actions.sendHostAnnouncement(button.dataset.hostAnnouncement); menu.hidden = true; }));
  const layout = view.querySelector(".room-page .lobby-layout");
  if (layout) {
    layout.classList.add("has-host-announcements");
    layout.insertBefore(controls, layout.firstElementChild);
  } else view.append(controls);
}
