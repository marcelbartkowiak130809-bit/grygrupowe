import { $, avatarHtml, escapeHtml, playerMiniHtml } from "./utils.js?v=20260605-3";
import { Effects } from "./effects.js";
import { Audio } from "./audio.js";

const shuffle = items => [...items].sort(() => Math.random() - .5);
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const arrayOrEmpty = value => Array.isArray(value) ? value : [];

export const poisonCandyDefaults = { candyCount:40, poisonedPerPlayer:1, skinLayout:"random" };
const candyCounts = [20,40,60,80,100];
const poisonOptions = [1,2,3];
const livePlayers = game => game.order.filter(uid => game.alive?.[uid]);
const hasLegalCandy = (game, uid) => game.candies.some(candy => !candy.eatenBy && !arrayOrEmpty(candy.poisoners).includes(uid));
const candySkin = profile => profile?.selectedCandySkin || "defaultCandy";
const mini = profile => playerMiniHtml(profile);
export const stopPoisonCandyTimer = () => {};

export function sanitizePoisonCandySettings(settings = {}, playerCount = 2) {
  const candyCount = candyCounts.includes(Number(settings.candyCount)) ? Number(settings.candyCount) : poisonCandyDefaults.candyCount;
  const maxPoison = Math.max(1, Math.floor(candyCount / (Math.max(2, playerCount) * 2)));
  const poisonedPerPlayer = Math.min(maxPoison, poisonOptions.includes(Number(settings.poisonedPerPlayer)) ? Number(settings.poisonedPerPlayer) : poisonCandyDefaults.poisonedPerPlayer);
  return { ...poisonCandyDefaults, ...settings, candyCount, poisonedPerPlayer, skinLayout:settings.skinLayout === "nearPlayer" ? "nearPlayer" : "random" };
}

function candyOwners(players, count, layout) {
  const owners = [];
  players.forEach(uid => {
    const share = Math.floor(count / players.length);
    for (let i = 0; i < share; i += 1) owners.push(uid);
  });
  while (owners.length < count) owners.push(players[owners.length % players.length]);
  return layout === "random" ? shuffle(owners) : owners;
}

export function createPoisonCandyGame(players, rawSettings) {
  const settings = sanitizePoisonCandySettings(rawSettings, players.length);
  const order = shuffle(players);
  const owners = candyOwners(order, settings.candyCount, settings.skinLayout);
  return {
    phase:"poisoning",
    order,
    turnIndex:0,
    candies:owners.map((ownerUid, index) => ({ id:`c${index}`, ownerUid, poisoners:[], eatenBy:null })),
    alive:Object.fromEntries(players.map(uid => [uid, true])),
    poisonChoices:{},
    eliminated:[],
    lastEvent:null,
    result:null,
  };
}

function normalize(game) {
  game.order = Array.isArray(game.order) ? game.order : [];
  game.candies = arrayOrEmpty(game.candies);
  game.candies.forEach((candy, index) => {
    candy.id ||= `c${index}`;
    candy.poisoners = arrayOrEmpty(candy.poisoners);
    candy.eatenBy ||= null;
  });
  game.alive = objectOrEmpty(game.alive);
  game.poisonChoices = objectOrEmpty(game.poisonChoices);
  game.eliminated = arrayOrEmpty(game.eliminated);
  return game;
}

function activeUid(game) {
  const alive = livePlayers(game);
  if (!alive.length) return "";
  for (let checked = 0; checked < game.order.length; checked += 1) {
    const uid = game.order[game.turnIndex % game.order.length];
    if (game.alive[uid] && hasLegalCandy(game, uid)) return uid;
    game.turnIndex = (game.turnIndex + 1) % game.order.length;
  }
  return alive.find(uid => hasLegalCandy(game, uid)) || "";
}

function advanceTurn(game) {
  for (let checked = 0; checked < game.order.length; checked += 1) {
    game.turnIndex = (game.turnIndex + 1) % game.order.length;
    if (game.alive[game.order[game.turnIndex]] && hasLegalCandy(game, game.order[game.turnIndex])) return;
  }
}

function finishIfNeeded(game) {
  const alive = livePlayers(game);
  if (alive.length <= 1 || !alive.some(uid => hasLegalCandy(game, uid))) {
    game.phase = "results";
    game.result = { winner:alive[0] || null };
    return true;
  }
  return false;
}

export const PoisonCandyEngine = {
  poison(game, uid, candyIds, players, settings) {
    normalize(game);
    if (game.phase !== "poisoning") return "Zatruwanie juz sie skonczylo.";
    if (game.poisonChoices[uid]) return "Juz wybrales zatrute cukierki.";
    const needed = sanitizePoisonCandySettings(settings, players.length).poisonedPerPlayer;
    const ids = [...new Set(Array.isArray(candyIds) ? candyIds : [candyIds])].filter(Boolean);
    if (ids.length !== needed) return `Wybierz ${needed} cukierkow.`;
    const valid = ids.every(id => game.candies.some(candy => candy.id === id));
    if (!valid) return "Ten cukierek nie istnieje.";
    game.poisonChoices[uid] = ids;
    ids.forEach(id => {
      const candy = game.candies.find(item => item.id === id);
      if (candy) candy.poisoners.push(uid);
    });
    if (players.every(playerId => game.poisonChoices[playerId])) {
      game.phase = "eating";
      game.turnIndex = 0;
      game.lastEvent = { type:"start", at:Date.now() };
    }
    return null;
  },
  eat(game, uid, candyId) {
    normalize(game);
    if (game.phase !== "eating") return "Teraz nie jemy cukierkow.";
    if (activeUid(game) !== uid) return "To nie jest twoja kolej.";
    const candy = game.candies.find(item => item.id === candyId);
    if (!candy || candy.eatenBy) return "Tego cukierka nie mozna zjesc.";
    candy.poisoners = arrayOrEmpty(candy.poisoners);
    if (candy.poisoners.includes(uid)) return "Nie mozesz zjesc swojego zatrutego cukierka.";
    candy.eatenBy = uid;
    candy.eatenAt = Date.now();
    const poisoner = candy.poisoners.find(id => id !== uid) || null;
    const died = Boolean(poisoner);
    game.lastEvent = { type:died ? "poisoned" : "safe", candyId, uid, poisoner, ownerUid:candy.ownerUid, at:Date.now() };
    if (died) {
      game.alive[uid] = false;
      game.eliminated.push({ uid, candyId, poisoner, at:Date.now() });
      if (finishIfNeeded(game)) return null;
    }
    advanceTurn(game);
    finishIfNeeded(game);
    return null;
  },
};

export function renderPoisonCandyLobbySettings(room, isHost) {
  const players = room.players?.length || 2;
  const settings = sanitizePoisonCandySettings(room.settings, players);
  const canUsePoison = amount => players * amount <= settings.candyCount / 2;
  return `<div class="impostor-settings-grid">
    <label>Liczba cukierkow<select data-candy-setting="candyCount" ${isHost ? "" : "disabled"}>${candyCounts.map(count => `<option value="${count}" ${settings.candyCount === count ? "selected" : ""}>${count}</option>`).join("")}</select></label>
    <label>Zatrute na gracza<select data-candy-setting="poisonedPerPlayer" ${isHost ? "" : "disabled"}>${poisonOptions.map(amount => `<option value="${amount}" ${settings.poisonedPerPlayer === amount ? "selected" : ""} ${canUsePoison(amount) ? "" : "disabled"}>${amount}</option>`).join("")}</select></label>
    <label>Uklad skinow<select data-candy-setting="skinLayout" ${isHost ? "" : "disabled"}><option value="random" ${settings.skinLayout === "random" ? "selected" : ""}>Losowo na stole</option><option value="nearPlayer" ${settings.skinLayout === "nearPlayer" ? "selected" : ""}>Blizej wlasciciela</option></select></label>
  </div><p class="tiny">Kazdy gracz zatruwa swoje cukierki po cichu. Nie da sie zjesc wlasnego zatrutego cukierka.</p>`;
}

function candyHtml(candy, index, total, game, accounts, currentUser, canPick, settings) {
  const ownerIndex = Math.max(0, game.order.indexOf(candy.ownerUid));
  const skin = candySkin(accounts[candy.ownerUid]);
  const baseAngle = settings.skinLayout === "nearPlayer"
    ? (ownerIndex / Math.max(1, game.order.length)) * 360 + ((index % 9) - 4) * 7
    : index * 137.508;
  const radius = settings.skinLayout === "nearPlayer"
    ? 18 + (index % 5) * 6
    : 8 + Math.sqrt((index + .5) / Math.max(1, total)) * 39;
  const angle = baseAngle * Math.PI / 180;
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;
  const poisoners = arrayOrEmpty(candy.poisoners);
  const ownPoison = poisoners.includes(currentUser);
  const poisonedByMe = ownPoison;
  const disabled = candy.eatenBy || ownPoison || !canPick;
  const style = `--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%;--delay:${(index % 12) * 22}ms`;
  return `<button class="candy-token candy-${skin} ${candy.eatenBy ? "eaten-candy" : ""} ${poisonedByMe ? "marked-poison" : ""} ${game.lastEvent?.candyId === candy.id ? "last-candy" : ""}" style="${style}" data-candy-id="${candy.id}" ${disabled ? "disabled" : ""} aria-label="Cukierek ${index + 1}">
    <span></span>${poisonedByMe ? "<i>!</i>" : ""}
  </button>`;
}

function playersRing(game, accounts, active) {
  return `<section class="candy-players-ring">${game.order.map(uid => `<article class="${uid === active ? "active-candy-player" : ""} ${game.alive[uid] ? "" : "dead-candy-player"}">${avatarHtml(accounts[uid], "candy-avatar")}<b>${escapeHtml(accounts[uid]?.nick || "Gracz")}</b><small>${game.alive[uid] ? "gra" : "odpada"}</small></article>`).join("")}</section>`;
}

function eventHtml(game, accounts) {
  const event = game.lastEvent;
  if (!event?.uid) return "";
  const nick = escapeHtml(accounts[event.uid]?.nick || "Gracz");
  if (event.type === "poisoned") return `<div class="candy-event poison-event"><b>${nick} trafil na zatrutego cukierka</b><span>Odpada i oglada dalsza gre.</span><i></i><i></i><i></i></div>`;
  return `<div class="candy-event safe-event"><b>${nick} zjadl bezpiecznego cukierka</b><span>Kolejka leci dalej.</span><i></i><i></i><i></i></div>`;
}

export function renderPoisonCandyGame(root, { room, accounts, currentUser }, actions) {
  const game = normalize(room.game);
  const settings = sanitizePoisonCandySettings(room.settings, room.players.length);
  const active = activeUid(game);
  const isAlive = Boolean(game.alive[currentUser]);
  const isTurn = active === currentUser;
  const needed = settings.poisonedPerPlayer;
  if (game.phase === "results") Effects.play("roundWin", `${room.roomId}:candy:results`);
  const selectionKey = `poison-candy-selection:${room.roomId}:${currentUser}`;
  let savedSelection = [];
  try { savedSelection = JSON.parse(sessionStorage.getItem(selectionKey) || "[]"); } catch {}
  const selected = new Set(game.poisonChoices[currentUser] ? [] : savedSelection.slice(0, needed));
  const body = game.phase === "results"
    ? `<section class="panel center candy-result"><p class="eyebrow">KONIEC GRY</p><h1>${escapeHtml(accounts[game.result?.winner]?.nick || "Nikt")} wygrywa</h1><div class="final-ranking">${game.order.map(uid => `<article><b>${game.alive[uid] ? "WIN" : "OUT"}</b>${mini(accounts[uid])}<strong>${game.alive[uid] ? "ocalal" : "zatruty"}</strong></article>`).join("")}</div><button class="primary" id="candy-lobby">Wroc do lobby</button></section>`
    : `<section class="poison-candy-stage"><div class="candy-topline"><div><p class="eyebrow">${game.phase === "poisoning" ? "ZATRUWANIE" : "JEDZENIE"}</p><h1>${game.phase === "poisoning" ? "Wybierz zatrute cukierki" : `${escapeHtml(accounts[active]?.nick || "Gracz")} wybiera cukierka`}</h1></div><span class="badge">${livePlayers(game).length} zywych</span></div>${playersRing(game, accounts, active)}<div class="candy-table">${game.candies.map((candy, index) => candyHtml(candy, index, game.candies.length, game, accounts, currentUser, game.phase === "poisoning" ? !game.poisonChoices[currentUser] : isTurn && isAlive, settings)).join("")}</div><div class="candy-event-slot">${eventHtml(game, accounts)}</div>${game.phase === "poisoning" ? (game.poisonChoices[currentUser] ? `<div class="waiting-state"><span class="waiting-pulse">OK</span><h3>Cukierki zatrute</h3><p>Czekamy jeszcze na ${Math.max(0, room.players.length - Object.keys(game.poisonChoices).length)} graczy.</p></div>` : `<section class="panel candy-action-panel"><h3>Wybierz ${needed}</h3><p class="muted">Tylko ty widzisz swoje zatrute cukierki. Kliknij cukierki na stole i potwierdz.</p><button class="primary" id="candy-poison-submit" disabled>Zatruj wybrane</button></section>`) : (!isAlive ? `<div class="waiting-state"><span class="waiting-pulse">X</span><h3>Odpadasz, ale ogladzasz gre</h3><p>Stol dalej gra do ostatniego zywego gracza.</p></div>` : isTurn ? `<section class="panel candy-action-panel"><h3>Twoja kolej</h3><p class="muted">Wybierz cukierka, ktory nie jest twoim zatrutym.</p></section>` : `<div class="waiting-state"><span class="waiting-pulse">...</span><h3>Czekasz na ruch gracza</h3><p>Kamera trzyma stol i aktywnego gracza.</p></div>`)}</section>`;
  root.innerHTML = `<main class="page poison-candy-page board-shell">${body}<button class="ghost" id="leave-room">Wyjdz z pokoju</button></main>`;
  $("#leave-room").addEventListener("click", actions.leaveRoom);
  $("#candy-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelectorAll("[data-candy-id]").forEach(button => {
    if (selected.has(button.dataset.candyId)) button.classList.add("selected-candy");
  });
  const submitButton = $("#candy-poison-submit");
  if (submitButton) submitButton.disabled = selected.size !== needed;
  root.querySelectorAll("[data-candy-id]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.candyId;
    if (game.phase === "poisoning") {
      if (game.poisonChoices[currentUser]) return;
      if (selected.has(id)) { selected.delete(id); button.classList.remove("selected-candy"); Audio.play("buttonClick"); }
      else if (selected.size < needed) { selected.add(id); button.classList.add("selected-candy"); Audio.play("candyPick"); }
      try { sessionStorage.setItem(selectionKey, JSON.stringify([...selected])); } catch {}
      const submit = $("#candy-poison-submit");
      if (submit) submit.disabled = selected.size !== needed;
      return;
    }
    Audio.play("candyPick");actions.poisonCandyEat(id);
  }));
  $("#candy-poison-submit")?.addEventListener("click", () => { try { sessionStorage.removeItem(selectionKey); } catch {} actions.poisonCandyPoison([...selected]); });
}
