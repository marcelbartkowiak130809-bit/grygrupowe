import { avatarHtml, escapeHtml, icon } from "./utils.js?v=20260613-1";

const incomingRequests = account => account?.friendRequests?.incoming || {};
const outgoingRequests = account => account?.friendRequests?.outgoing || {};
export const friendRequestCount = account => Object.keys(incomingRequests(account)).length;
const isFriend = (account, uid) => Array.isArray(account?.friends) && account.friends.includes(uid);

function playerStatus(uid, rooms = [], presence = {}) {
  const room = rooms.filter(item => ["lobby", "playing"].includes(item.status) && item.players?.includes(uid)).sort((a,b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0))[0];
  if (room?.status === "playing") return { label:"🎮 w grze", detail:`Tryb: ${room.modeName || room.gameMode || "Gra"} · ${room.players.length}/${room.maxPlayers || 8}` };
  if (room?.status === "lobby") return { label:"online", detail:`Lobby: ${room.players.length}/${room.maxPlayers || 8} · ${room.modeName || room.gameMode || "Gra"}` };
  return presence[uid] ? { label:"online", detail:"Dostępny" } : { label:"offline", detail:"Offline" };
}

function friendRow(uid, item, context, actionHtml = "") {
  const status = playerStatus(uid, context.rooms, context.presence);
  const statusClass = status.label === "offline" ? "offline" : status.label === "🎮 w grze" ? "playing" : "online";
  return `<article class="friend-row"><div class="friend-player">${avatarHtml(item, "friend-avatar")}<div><b>${escapeHtml(item.nick || "Gracz")}</b><small class="friend-status friend-status-${statusClass}">${status.label}</small><small>${escapeHtml(status.detail)}</small></div></div><div class="friend-actions">${actionHtml}</div></article>`;
}

function requestRow(request, context, actions) {
  const item = context.directory[request.fromUid] || { nick:request.fromNick || "Gracz" };
  const isGame = request.type === "gameInvite", isJoin = request.type === "joinRequest";
  const title = isGame ? `${item.nick} zaprasza Cię do gry` : isJoin ? `${item.nick} chce dołączyć do Twojej gry` : `${item.nick} wysłał Ci zaproszenie do znajomych`;
  const buttons = isGame ? `<button class="primary" data-friend-accept-invite="${request.id}">Dołącz</button><button class="ghost" data-friend-ignore="${request.id}">Ignoruj</button>` : isJoin ? `<button class="primary" data-friend-accept-join="${request.id}">Akceptuj</button><button class="ghost" data-friend-ignore="${request.id}">Odrzuć</button>` : `<button class="primary" data-friend-accept="${request.id}">Akceptuj</button><button class="ghost" data-friend-reject="${request.id}">Odrzuć</button>`;
  return `<article class="friend-request-row"><div>${avatarHtml(item, "friend-avatar")}<div><b>${escapeHtml(title)}</b><small>${isGame ? `Tryb: ${escapeHtml(request.modeName || "Gra")} · Gracze: ${request.players || "?"}` : request.message || ""}</small></div></div><div class="friend-actions">${buttons}</div></article>`;
}

export function friendsModal(context) {
  const modal = document.createElement("div"); modal.className = "modal-backdrop"; let refreshTimer;
  let tab = context.inviteMode ? "friends" : "friends", searchResults = [];
  const getContext = () => ({ ...context, account:context.actions.getAccount(), directory:context.actions.getFriendDirectory(), rooms:context.actions.getRooms(), presence:context.actions.getPresence?.() || context.presence });
  const render = () => {
    const current = getContext(), account = current.account, friends = (account?.friends || []).filter(uid => current.directory[uid]);
    const incoming = Object.values(incomingRequests(account)); const friendIncoming = incoming.filter(request => request.type === "friend"); const gameIncoming = incoming.filter(request => request.type === "gameInvite" || request.type === "joinRequest"); const outgoing = Object.values(outgoingRequests(account));
    const friendRows = friends.length ? friends.map(uid => { const lobby=current.rooms.find(room=>room.status==="lobby"&&room.players?.includes(uid)); const action=current.inviteMode ? `<button class="primary" data-friend-invite="${uid}">Zaproś</button>` : lobby ? `<button class="ghost" data-friend-join-request="${uid}" data-friend-room="${lobby.roomId}">Poproś o dołączenie</button>` : ""; return friendRow(uid,current.directory[uid],current,action); }).join("") : `<p class="muted">Nie masz jeszcze znajomych.</p>`;
    const content = tab === "friends" ? `<div class="friend-search"><input id="friend-search-input" placeholder="Wyszukaj gracza po nicku" maxlength="18"><button class="primary" id="friend-search">Szukaj</button></div><div class="friend-search-results">${searchResults.map(item => friendRow(item.uid,item,current,isFriend(account,item.uid) ? "" : `<button class="primary" data-friend-add="${item.uid}">Dodaj</button>`)).join("")}</div><div class="friends-list">${friendRows}</div>` : tab === "incomingFriends" ? `<div class="friends-list">${friendIncoming.length ? friendIncoming.map(request => requestRow(request,current,context.actions)).join("") : `<p class="muted">Brak zaproszeń do znajomych.</p>`}</div>` : tab === "incomingGames" ? `<div class="friends-list">${gameIncoming.length ? gameIncoming.map(request => requestRow(request,current,context.actions)).join("") : `<p class="muted">Brak zaproszeń do gier.</p>`}</div>` : `<div class="friends-list">${outgoing.length ? outgoing.map(request => `<article class="friend-request-row"><div><b>${escapeHtml(request.toNick || "Gracz")}</b><small>Zaproszenie oczekuje na odpowiedź.</small></div><button class="ghost" data-friend-cancel="${request.id}">Anuluj</button></article>`).join("") : `<p class="muted">Brak wysłanych zaproszeń.</p>`}</div>`;
    modal.innerHTML = `<section class="modal friends-modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">SPOŁECZNOŚĆ</p><h2>Znajomi</h2></div><button class="icon-btn" data-friends-close>${icon("x",18)}</button></div><div class="friends-tabs"><button class="${tab === "friends" ? "active" : ""}" data-friends-tab="friends">Moi znajomi</button><button class="${tab === "incomingFriends" ? "active" : ""}" data-friends-tab="incomingFriends">Zaproszenia do znajomych ${friendIncoming.length ? `<b>${friendIncoming.length}</b>` : ""}</button><button class="${tab === "incomingGames" ? "active" : ""}" data-friends-tab="incomingGames">Zaproszenia do gier ${gameIncoming.length ? `<b>${gameIncoming.length}</b>` : ""}</button><button class="${tab === "outgoing" ? "active" : ""}" data-friends-tab="outgoing">Wysłane</button></div>${context.inviteMode ? `<p class="friend-invite-note">Wybierz znajomego, którego chcesz zaprosić do lobby.</p>` : ""}${content}</section>`;
    modal.querySelector("[data-friends-close]").addEventListener("click", () => { window.clearInterval(refreshTimer); context.actions.closeModal(modal); });
    modal.querySelectorAll("[data-friends-tab]").forEach(button => button.addEventListener("click", () => { tab = button.dataset.friendsTab; searchResults = []; render(); }));
    modal.querySelector("#friend-search")?.addEventListener("click", async () => { searchResults = await context.actions.searchFriends(modal.querySelector("#friend-search-input").value); render(); });
    modal.querySelectorAll("[data-friend-add]").forEach(button => button.addEventListener("click", async () => { await context.actions.sendFriendRequest(button.dataset.friendAdd); context.actions.refresh?.(); render(); }));
    modal.querySelectorAll("[data-friend-invite]").forEach(button => button.addEventListener("click", async () => { await context.actions.inviteFriend(button.dataset.friendInvite); render(); }));
    modal.querySelectorAll("[data-friend-join-request]").forEach(button => button.addEventListener("click", async () => { const room=current.rooms.find(item=>item.roomId===button.dataset.friendRoom); await context.actions.requestJoinFriend(button.dataset.friendJoinRequest,room); render(); }));
    modal.querySelectorAll("[data-friend-accept]").forEach(button => button.addEventListener("click", async () => { await context.actions.acceptFriendRequest(button.dataset.friendAccept); context.actions.refresh?.(); render(); }));
    modal.querySelectorAll("[data-friend-reject]").forEach(button => button.addEventListener("click", async () => { await context.actions.rejectFriendRequest(button.dataset.friendReject); context.actions.refresh?.(); render(); }));
    modal.querySelectorAll("[data-friend-ignore]").forEach(button => button.addEventListener("click", async () => { await context.actions.rejectFriendRequest(button.dataset.friendIgnore); context.actions.refresh?.(); render(); }));
    modal.querySelectorAll("[data-friend-accept-invite]").forEach(button => button.addEventListener("click", () => { const request = incomingRequests(current.account)[button.dataset.friendAcceptInvite]; context.actions.acceptGameInvite(request); context.actions.closeModal(modal); }));
    modal.querySelectorAll("[data-friend-accept-join]").forEach(button => button.addEventListener("click", async () => { await context.actions.acceptJoinRequest(button.dataset.friendAcceptJoin); render(); }));
    modal.querySelectorAll("[data-friend-cancel]").forEach(button => button.addEventListener("click", async () => { await context.actions.cancelFriendRequest(button.dataset.friendCancel); context.actions.refresh?.(); render(); }));
  };
  render(); document.body.append(modal); refreshTimer = window.setInterval(async () => { await context.actions.refreshFriendsData?.(); if (document.body.contains(modal)) render(); }, 4000); context.actions.playSound?.("modalOpen"); return modal;
}

export function showFriendNotification(request, context) {
  if (!request || document.querySelector(`[data-friend-toast="${request.id}"]`)) return;
  const item = context.directory[request.fromUid] || { nick:request.fromNick || "Gracz" }, isInvite = request.type === "gameInvite", isJoin = request.type === "joinRequest";
  const toast = document.createElement("aside"); toast.className = "friend-toast enter"; toast.dataset.friendToast = request.id;
  toast.innerHTML = `<div>${avatarHtml(item,"friend-avatar")}<div><b>${escapeHtml(isInvite ? `${item.nick} zaprasza Cię do gry` : isJoin ? `${item.nick} chce dołączyć do Twojej gry` : `${item.nick} wysłał Ci zaproszenie do znajomych`)}</b><small>${isInvite || isJoin ? `Tryb: ${escapeHtml(request.modeName || "Gra")}` : "Dodajcie się do znajomych."}</small></div></div><div class="friend-toast-actions">${isInvite ? `<button class="primary" data-toast-join>Dołącz</button>` : isJoin ? `<button class="primary" data-toast-join-request>Akceptuj</button>` : `<button class="primary" data-toast-accept>Akceptuj</button>`}<button class="ghost" data-toast-dismiss>Ignoruj</button></div>`;
  toast.querySelector("[data-toast-accept]")?.addEventListener("click",()=>context.actions.acceptFriendRequest(request.id).then(()=>{context.actions.refresh?.();toast.remove();}));
  toast.querySelector("[data-toast-join]")?.addEventListener("click",()=>context.actions.acceptGameInvite(request).then(()=>{context.actions.refresh?.();toast.remove();}));
  toast.querySelector("[data-toast-join-request]")?.addEventListener("click",()=>context.actions.acceptJoinRequest(request.id).then(()=>{context.actions.refresh?.();toast.remove();}));
  toast.querySelector("[data-toast-dismiss]").addEventListener("click",()=>{context.actions.rejectFriendRequest(request.id).then(()=>context.actions.refresh?.());toast.remove();});
  document.body.append(toast); context.actions.playSound?.("notification"); window.setTimeout(()=>toast.remove(),8000);
}
