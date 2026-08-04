import { escapeHtml } from "./utils.js?v=20260613-2";

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

function addBubbles(view, room, accounts) {
  const reactions = room?.game?.quickReactions || {};
  const active = Object.entries(reactions).filter(([, item]) => item?.expiresAt > Date.now());
  if (!active.length) return;
  const layer = document.createElement("div");
  layer.className = "quick-reaction-bubble-layer";
  active.forEach(([uid, item]) => {
    const reaction = reactionById(item.id) || { text:String(item.text || "") };
    const bubble = document.createElement("div");
    bubble.className = "quick-reaction-bubble";
    bubble.dataset.reactionUid = uid;
    bubble.innerHTML = `<span>${escapeHtml(reaction.text)}</span><small>${escapeHtml(accounts?.[uid]?.nick || room?.playerProfiles?.[uid]?.nick || "Gracz")}</small>`;
    const player = [...view.querySelectorAll("[data-player-uid]")].find(item => item.dataset.playerUid === uid);
    if (player) player.append(bubble);
    else { bubble.classList.add("quick-reaction-floating"); layer.append(bubble); }
  });
  view.append(layer);
}

export function renderQuickReactions(view, room, accounts, actions) {
  const panel = document.createElement("div");
  panel.className = "quick-reactions-bar";
  panel.setAttribute("aria-label", "Szybkie reakcje");
  panel.innerHTML = `<span class="quick-reactions-label">Reakcje</span>${QUICK_REACTIONS.map(item => `<button type="button" class="quick-reaction-button" data-quick-reaction="${item.id}" aria-label="Reakcja ${item.label}">${item.label}</button>`).join("")}`;
  panel.querySelectorAll("[data-quick-reaction]").forEach(button => button.addEventListener("click", () => actions.quickReact(button.dataset.quickReaction, Boolean(view.querySelector(".chat-messages")))));
  view.append(panel);
  if (!view.querySelector(".chat-messages")) addBubbles(view, room, accounts);
}
