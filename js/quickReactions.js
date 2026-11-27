import { escapeHtml } from "./utils.js?v=20261121-8";

export const QUICK_REACTIONS = [
  { id:"thumbsUp", label:"👍", text:"👍" },
  { id:"laugh", label:"😂", text:"😂" },
  { id:"surprised", label:"😮", text:"😮" },
  { id:"cry", label:"😭", text:"😭" },
  { id:"clap", label:"👏", text:"👏" },
  { id:"heart", label:"❤️", text:"❤️" },
  { id:"fire", label:"🔥", text:"🔥" },
  { id:"skull", label:"💀", text:"💀" },
  { id:"gg", label:"GG", text:"GG" },
  { id:"xd", label:"XD", text:"XD" },
];

const reactionById = id => QUICK_REACTIONS.find(item => item.id === id);
const reactionCooldowns = new Map();
const sideReactions = new WeakMap();
const quickReactionViews = new WeakMap();

function reactionBubble(uid, item, room, accounts) {
  const reaction = reactionById(item.id) || { text:String(item.text || "") };
  const bubble = document.createElement("div");
  bubble.className = "quick-reaction-bubble";
  bubble.dataset.reactionUid = uid;
  bubble.dataset.expiresAt = String(item.expiresAt || 0);
  bubble.innerHTML = `<span>${escapeHtml(reaction.text)}</span><small>${escapeHtml(accounts?.[uid]?.nick || room?.playerProfiles?.[uid]?.nick || "Gracz")}</small>`;
  return bubble;
}

function createReactionPicker(view, room, actions, collapsible) {
  const panel = document.createElement(collapsible ? "details" : "div");
  panel.className = collapsible ? "quick-reactions-side" : "quick-reactions-bar";
  const buttons = QUICK_REACTIONS.map(item => `<button type="button" class="quick-reaction-button" data-quick-reaction="${item.id}" aria-label="Reakcja ${item.label}">${item.label}</button>`).join("");
  if (collapsible) {
    panel.innerHTML = `<summary aria-label="Reakcje" title="Reakcje">☺</summary><div class="quick-reactions-bar" aria-label="Szybkie reakcje">${buttons}</div>`;
    panel.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !panel.open) return;
      panel.open = false;
      panel.querySelector("summary").focus();
    });
  } else {
    panel.setAttribute("aria-label", "Szybkie reakcje");
    panel.innerHTML = `<span class="quick-reactions-label">Reakcje</span>${buttons}`;
  }
  const cooldownKey = room?.roomId || "local";
  const applyCooldown = () => {
    const remaining = Math.max(0, Number(reactionCooldowns.get(cooldownKey) || 0) - Date.now());
    panel.classList.toggle("is-cooldown", remaining > 0);
    panel.querySelectorAll("[data-quick-reaction]").forEach(button => { button.disabled = remaining > 0; });
    if (remaining > 0) window.setTimeout(() => { if (panel.isConnected) applyCooldown(); }, remaining + 20);
  };
  applyCooldown();
  panel.querySelectorAll("[data-quick-reaction]").forEach(button => button.addEventListener("click", () => {
    if (Number(reactionCooldowns.get(cooldownKey) || 0) > Date.now()) return;
    reactionCooldowns.set(cooldownKey, Date.now() + 2000);
    applyCooldown();
    actions.quickReact(button.dataset.quickReaction, !collapsible && Boolean(view.querySelector(".chat-messages")));
  }));
  return panel;
}

export function renderQuickReactions(view, room, accounts, actions) {
  const key = JSON.stringify([room.roomId,room.game?.siteGameId || room.game?.startedAt || room.game?.createdAt || ""]);
  let current = quickReactionViews.get(view);
  if (current?.key !== key || !current.panel.isConnected) {
    current?.panel.remove();
    current?.layer.remove();
    view.querySelectorAll(".quick-reaction-bubble").forEach(node => node.remove());
    const panel = createReactionPicker(view,room,actions,false);
    const layer = document.createElement("div");
    layer.className = "quick-reaction-bubble-layer";
    view.append(panel,layer);
    current = {key,panel,layer};
    quickReactionViews.set(view,current);
  }

  const existing = new Map([...view.querySelectorAll(".quick-reaction-bubble[data-reaction-uid]")].map(node => [node.dataset.reactionUid,node]));
  const now = Date.now();
  const canShowBubbles = !view.querySelector(".chat-messages");
  for (const [uid,item] of Object.entries(room.game?.quickReactions || {})) {
    if (!canShowBubbles || !(item?.expiresAt > now)) continue;
    const previous = existing.get(uid);
    existing.delete(uid);
    if (previous?.dataset.expiresAt === String(item.expiresAt)) continue;
    const bubble = reactionBubble(uid,item,room,accounts);
    const player = [...view.querySelectorAll("[data-player-uid]")].find(node => node.dataset.playerUid === uid);
    if (player) player.append(bubble);
    else {
      bubble.classList.add("quick-reaction-floating");
      current.layer.append(bubble);
    }
    const expiresAt = Number(item.expiresAt);
    window.setTimeout(() => {
      if (bubble.isConnected && bubble.dataset.expiresAt === String(expiresAt) && Date.now() >= expiresAt) bubble.remove();
    },Math.max(0,expiresAt-now)+30);
  }
  existing.forEach(node => node.remove());
}

export function clearSideReactions(root) {
  const current = sideReactions.get(root);
  if (!current) return;
  current.panel.remove();
  current.layer.remove();
  sideReactions.delete(root);
}

export function renderSideReactions(root, room, accounts, actions) {
  const key = JSON.stringify([room.roomId, room.game.siteGameId || room.game.startedAt]);
  let current = sideReactions.get(root);
  if (current?.key !== key || !current.panel.isConnected) {
    clearSideReactions(root);
    const panel = createReactionPicker(root, room, actions, true);
    const layer = document.createElement("div");
    layer.className = "quick-reaction-bubble-layer quick-reaction-side-layer";
    root.append(panel, layer);
    current = {key, panel, layer};
    sideReactions.set(root, current);
  }
  const bubbles = new Map([...current.layer.children].map(node => [node.dataset.reactionUid,node]));
  const now = Date.now();
  for (const [uid, item] of Object.entries(room.game.quickReactions || {})) {
    if (!(item?.expiresAt > now)) continue;
    const previous = bubbles.get(uid);
    bubbles.delete(uid);
    if (previous?.dataset.expiresAt === String(item.expiresAt)) continue;
    const bubble = reactionBubble(uid,item,room,accounts);
    bubble.dataset.expiresAt = String(item.expiresAt);
    if (previous) previous.replaceWith(bubble);
    else current.layer.append(bubble);
    window.setTimeout(() => bubble.remove(), item.expiresAt - now);
  }
  for (const bubble of bubbles.values()) bubble.remove();
}
