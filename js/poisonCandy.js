import { $, avatarHtml, escapeHtml, playerMiniHtml } from "./utils.js?v=20260822-1";
import { Effects } from "./effects.js";
import { Audio } from "./audio.js";
import { hasGamePass } from "./gamePasses.js?v=20260831-6";

let timerId;
const shuffle = items => [...items].sort(() => Math.random() - .5);
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const arrayOrEmpty = value => Array.isArray(value) ? value : [];

export const poisonCandyDefaults = { candyCount:40, poisonedPerPlayer:1, lives:1, skinLayout:"random", rounds:5 };
const candyCounts = [20,40,60,80,100];
const poisonOptions = [1,2,3];
const roundOptions = [3,5,7,10];
const poisonPickMs = 30000;
const livePlayers = game => game.order.filter(uid => game.alive?.[uid]);
const hasLegalCandy = (game, uid) => game.candies.some(candy => !candy.eatenBy && !arrayOrEmpty(candy.poisoners).includes(uid));
const candySkin = profile => profile?.selectedCandySkin || "defaultCandy";
const mini = profile => playerMiniHtml(profile);
export const stopPoisonCandyTimer = () => { clearInterval(timerId); timerId = null; };

export function sanitizePoisonCandySettings(settings = {}, playerCount = 2) {
  const candyCount = candyCounts.includes(Number(settings.candyCount)) ? Number(settings.candyCount) : poisonCandyDefaults.candyCount;
  const maxPoison = Math.max(1, Math.floor(candyCount / (Math.max(2, playerCount) * 2)));
  const poisonedPerPlayer = Math.min(maxPoison, poisonOptions.includes(Number(settings.poisonedPerPlayer)) ? Number(settings.poisonedPerPlayer) : poisonCandyDefaults.poisonedPerPlayer);
  const lives = Math.max(1, Math.min(poisonedPerPlayer, Number(settings.lives) || poisonCandyDefaults.lives));
  const rounds = roundOptions.includes(Number(settings.rounds)) ? Number(settings.rounds) : poisonCandyDefaults.rounds;
  return { ...poisonCandyDefaults, ...settings, candyCount, poisonedPerPlayer, lives, rounds, skinLayout:settings.skinLayout === "nearPlayer" ? "nearPlayer" : "random" };
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
    hits:Object.fromEntries(players.map(uid => [uid, 0])),
    poisonChoices:{},
    eliminated:[],
    lastEvent:null,
    result:null,
    round:Math.max(1, Number(rawSettings?.round) || 1),
    totalRounds:settings.rounds,
    scores:Object.fromEntries(players.map(uid => [uid, 0])),
    roundWinners:[],
    passUses:{},
    purchaseUses:{},
    phaseEndsAt:Date.now()+poisonPickMs,
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
  game.hits = objectOrEmpty(game.hits);
  game.poisonChoices = objectOrEmpty(game.poisonChoices);
  game.eliminated = arrayOrEmpty(game.eliminated);
  game.round = Math.max(1, Number(game.round) || 1);
  game.totalRounds = Math.max(1, Number(game.totalRounds) || 5);
  game.scores = objectOrEmpty(game.scores);
  game.roundWinners = arrayOrEmpty(game.roundWinners);
  game.passUses = objectOrEmpty(game.passUses);
  game.purchaseUses = objectOrEmpty(game.purchaseUses);
  if (game.phase === "poisoning" && !Number(game.phaseEndsAt)) game.phaseEndsAt = Date.now()+poisonPickMs;
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
    const winner = alive[0] || null;
    game.result = { winner };
    if (winner) game.scores[winner] = Number(game.scores[winner] || 0) + 1;
    game.roundWinners = [...game.roundWinners, winner];
    game.finished = game.round >= game.totalRounds;
    game.phase = game.finished ? "gameSummary" : "roundSummary";
    game.phaseEndsAt = null;
    return true;
  }
  return false;
}
function randomPoisonIds(game, needed) {
  return shuffle(game.candies.filter(candy => !candy.eatenBy).map(candy => candy.id)).slice(0, needed);
}
function finishPoisoning(game, players) {
  game.phase = "eating";
  game.turnIndex = 0;
  game.phaseEndsAt = null;
  game.lastEvent = { type:"start", at:Date.now() };
  players.forEach(uid => { if (!game.alive[uid]) game.alive[uid] = true; });
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
    if (players.every(playerId => game.poisonChoices[playerId])) finishPoisoning(game, players);
    return null;
  },
  timeoutPoisoning(game, players, settings) {
    normalize(game);
    if (game.phase !== "poisoning") return;
    const needed = sanitizePoisonCandySettings(settings, players.length).poisonedPerPlayer;
    players.forEach(uid => {
      if (game.poisonChoices[uid]) return;
      const ids = randomPoisonIds(game, needed);
      game.poisonChoices[uid] = ids;
      ids.forEach(id => {
        const candy = game.candies.find(item => item.id === id);
        if (candy && !candy.poisoners.includes(uid)) candy.poisoners.push(uid);
      });
    });
    finishPoisoning(game, players);
  },
  eat(game, uid, candyId, players = [], settings = {}, options = {}) {
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
      const lives = sanitizePoisonCandySettings(settings, game.order.length).lives;
      const hits = Number(game.hits[uid] || 0);
      const threatsLeftAfterPick = game.candies.filter(item => !item.eatenBy && item.id !== candyId && arrayOrEmpty(item.poisoners).some(id => id !== uid)).length;
      const canProtect = lives > 1 && hits < lives - 1 && threatsLeftAfterPick >= lives - hits;
      const charmAvailable = options.survivorCharm && !game.passUses?.[uid]?.["survivor-charm"];
      const shieldAvailable = options.candyShield && !game.purchaseUses?.[uid]?.["candy-shield"];
      if (canProtect && (charmAvailable || shieldAvailable)) {
        const protection = charmAvailable ? "survivor-charm" : "candy-shield";
        if (protection === "survivor-charm") game.passUses[uid] = { ...(game.passUses[uid] || {}), [protection]:true };
        else game.purchaseUses[uid] = { ...(game.purchaseUses[uid] || {}), [protection]:true };
        game.lastEvent = { type:"protected", candyId, uid, poisoner, ownerUid:candy.ownerUid, protection, lives, hits, at:Date.now() };
        advanceTurn(game);
        finishIfNeeded(game);
        return null;
      }
      game.hits[uid] = Number(game.hits[uid] || 0) + 1;
      const dead = game.hits[uid] >= lives;
      game.lastEvent.lives = lives;
      game.lastEvent.hits = game.hits[uid];
      game.lastEvent.dead = dead;
      if (!dead) {
        advanceTurn(game);
        return null;
      }
      game.alive[uid] = false;
      game.eliminated.push({ uid, candyId, poisoner, hits:game.hits[uid], lives, at:Date.now() });
      if (finishIfNeeded(game)) return null;
    }
    advanceTurn(game);
    finishIfNeeded(game);
    return null;
  },
  nextRound(game, players = [], settings = {}) {
    normalize(game);
    if (game.phase !== "roundSummary") return "Ta runda jeszcze się nie zakończyła.";
    const next = createPoisonCandyGame(players, { ...settings, rounds:game.totalRounds });
    const scores = { ...game.scores };
    const roundWinners = [...game.roundWinners];
    const passUses = { ...game.passUses }, purchaseUses = { ...game.purchaseUses };
    Object.assign(game, next, { round:game.round + 1, totalRounds:game.totalRounds, scores, roundWinners, passUses, purchaseUses });
    return null;
  },
};

export function renderPoisonCandyLobbySettings(room, isHost) {
  const players = room.players?.length || 2;
  const settings = sanitizePoisonCandySettings(room.settings, players);
  const canUsePoison = amount => players * amount <= settings.candyCount / 2;
  const lifeOptions = Array.from({ length:settings.poisonedPerPlayer }, (_, index) => index + 1);
  return `<div class="impostor-settings-grid">
    <label>Liczba cukierkow<select data-candy-setting="candyCount" ${isHost ? "" : "disabled"}>${candyCounts.map(count => `<option value="${count}" ${settings.candyCount === count ? "selected" : ""}>${count}</option>`).join("")}</select></label>
    <label>Zatrute na gracza<select data-candy-setting="poisonedPerPlayer" ${isHost ? "" : "disabled"}>${poisonOptions.map(amount => `<option value="${amount}" ${settings.poisonedPerPlayer === amount ? "selected" : ""} ${canUsePoison(amount) ? "" : "disabled"}>${amount}</option>`).join("")}</select></label>
    <label>Zycia<select data-candy-setting="lives" ${isHost ? "" : "disabled"}>${lifeOptions.map(amount => `<option value="${amount}" ${settings.lives === amount ? "selected" : ""}>${amount}</option>`).join("")}</select></label>
    <label>Uklad skinow<select data-candy-setting="skinLayout" ${isHost ? "" : "disabled"}><option value="random" ${settings.skinLayout === "random" ? "selected" : ""}>Losowo na stole</option><option value="nearPlayer" ${settings.skinLayout === "nearPlayer" ? "selected" : ""}>Blizej wlasciciela</option></select></label>
    <label>Liczba rund<select data-candy-setting="rounds" ${isHost ? "" : "disabled"}>${roundOptions.map(rounds => `<option value="${rounds}" ${settings.rounds === rounds ? "selected" : ""}>${rounds}</option>`).join("")}</select></label>
  </div><p class="tiny">Kazdy gracz zatruwa swoje cukierki po cichu. Nie da sie zjesc wlasnego zatrutego cukierka.</p>`;
}

function candySlotIndex(candy, index) {
  const fromId = Number.parseInt(String(candy.id || "").replace(/\D/g, ""), 10);
  return Number.isFinite(fromId) ? fromId : index;
}

function candyHtml(candy, index, total, game, accounts, currentUser, canPick, settings) {
  const slot = candySlotIndex(candy, index);
  const ownerIndex = Math.max(0, game.order.indexOf(candy.ownerUid));
  const skin = candySkin(accounts[candy.ownerUid]);
  const baseAngle = settings.skinLayout === "nearPlayer"
    ? (ownerIndex / Math.max(1, game.order.length)) * 360 + ((slot % 9) - 4) * 7
    : slot * 137.508;
  const radius = settings.skinLayout === "nearPlayer"
    ? 18 + (slot % 5) * 6
    : 8 + Math.sqrt((slot + .5) / Math.max(1, total)) * 39;
  const angle = baseAngle * Math.PI / 180;
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;
  const poisoners = arrayOrEmpty(candy.poisoners);
  const ownPoison = poisoners.includes(currentUser);
  const poisonedByMe = ownPoison;
  const disabled = candy.eatenBy || ownPoison || !canPick;
  const style = `--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%;--delay:${(slot % 12) * 22}ms`;
  return `<button class="candy-token candy-${skin} ${candy.eatenBy ? "eaten-candy" : ""} ${poisonedByMe ? "marked-poison" : ""} ${game.lastEvent?.candyId === candy.id ? "last-candy" : ""}" style="${style}" data-candy-id="${candy.id}" ${disabled ? "disabled" : ""} aria-label="Cukierek ${index + 1}">
    <span></span>${poisonedByMe ? "<i>!</i>" : ""}
  </button>`;
}

function heartMeter(game, uid, settings) {
  const lost = Math.min(settings.lives, Number(game.hits?.[uid] || 0));
  return `<span class="candy-hearts" aria-label="Zycia ${settings.lives - lost} z ${settings.lives}">${Array.from({ length:settings.lives }, (_, index) => `<i class="${index < lost ? "lost" : "live"}">♥</i>`).join("")}</span>`;
}

function playersRing(game, accounts, active, settings) {
  return `<section class="candy-players-ring">${game.order.map(uid => `<article class="${uid === active ? "active-candy-player" : ""} ${game.alive[uid] ? "" : "dead-candy-player"}">${avatarHtml(accounts[uid], "candy-avatar")}<b>${escapeHtml(accounts[uid]?.nick || "Gracz")}</b>${heartMeter(game, uid, settings)}<small>${game.alive[uid] ? "gra" : "odpada"}</small></article>`).join("")}</section>`;
}

function eventHtml(game, accounts) {
  const event = game.lastEvent;
  if (!event?.uid) return "";
  const nick = escapeHtml(accounts[event.uid]?.nick || "Gracz");
  if (event.type === "protected") return `<div class="candy-event safe-event protected-event"><strong>AMULET ZADZIAŁAŁ!</strong><b>${nick} uniknął utraty życia</b><span>Trafienie zostało pochłonięte, ale nadal można odpaść w tej grze.</span><i></i><i></i><i></i></div>`;
  if (event.type === "poisoned") return `<div class="candy-event poison-event ${event.dead ? "death-event" : "hit-event"}"><strong class="death-flash">${event.dead ? "ELIMINACJA!" : "TRAFIENIE!"}</strong><b>${nick} trafil na zatrutego cukierka</b><span>${event.dead ? "Umiera i oglada dalsza gre." : `Przetrwal, ale ma ${event.hits}/${event.lives} trafien.`}</span><i></i><i></i><i></i></div>`;
  return `<div class="candy-event safe-event"><b>${nick} zjadl bezpiecznego cukierka</b><span>Kolejka leci dalej.</span><i></i><i></i><i></i></div>`;
}

export function renderPoisonCandyGame(root, { room, accounts, currentUser }, actions) {
  stopPoisonCandyTimer();
  const scrollY = window.scrollY;
  const players = Array.isArray(room?.players) ? room.players.filter(Boolean) : [];
  const safeAccounts = accounts && typeof accounts === "object" ? accounts : {};
  const game = normalize(room?.game && typeof room.game === "object" ? room.game : { order:players, alive:Object.fromEntries(players.map(uid => [uid, true])), candies:[] });
  game.order = game.order.length ? game.order.filter(uid => players.includes(uid)) : players;
  game.order.forEach(uid => { if (!(uid in game.alive)) game.alive[uid] = true; });
  const settings = sanitizePoisonCandySettings(room?.settings, players.length || 2);
  if (["roundSummary", "gameSummary", "results"].includes(game.phase) && !game.result) game.result = { winner:livePlayers(game)[0] || game.order[0] || null };
  const active = activeUid(game);
  const isAlive = Boolean(game.alive[currentUser]);
  const isTurn = active === currentUser;
  const needed = settings.poisonedPerPlayer;
  const poisonLeft = Math.max(0, Math.ceil(((game.phaseEndsAt || Date.now()) - Date.now()) / 1000));
  const poisonTimer = game.phase === "poisoning" ? `<div class="timer-box ${poisonLeft <= 5 ? "timer-urgent" : ""}"><span class="tiny">AUTO LOSOWANIE</span><b id="candy-poison-timer">${poisonLeft}s</b></div>` : "";
  if (["gameSummary", "results"].includes(game.phase)) Effects.play("roundWin", `${room.roomId}:candy:summary`);
  const selectionKey = `poison-candy-selection:${room.roomId}:${currentUser}`;
  let savedSelection = [];
  try { savedSelection = JSON.parse(sessionStorage.getItem(selectionKey) || "[]"); } catch {}
  const selected = new Set(game.poisonChoices[currentUser] ? [] : savedSelection.slice(0, needed));
  const resultOrder = [...game.order].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0));
  const topScore = Math.max(0, ...resultOrder.map(uid => Number(game.scores?.[uid] || 0)));
  const overallWinner = resultOrder.find(uid => Number(game.scores?.[uid] || 0) === topScore && topScore > 0) || game.result?.winner || resultOrder[0];
  const body = ["gameSummary", "results"].includes(game.phase)
    ? `<section class="panel center candy-result"><p class="eyebrow">KONIEC GRY</p><h1>${escapeHtml(safeAccounts[overallWinner]?.nick || "Nikt")} wygrywa</h1><p class="muted">Rozegrano ${game.totalRounds} rund. Każdy punkt oznacza wygraną rundę.</p><div class="final-ranking candy-final-ranking">${resultOrder.map(uid => `<article class="${Number(game.scores?.[uid] || 0) === topScore && topScore > 0 ? "winner-card" : ""}"><b>${Number(game.scores?.[uid] || 0) === topScore && topScore > 0 ? "WIN" : ""}</b>${mini(safeAccounts[uid] || room.playerProfiles?.[uid] || { nick:"Gracz" })}<div class="candy-summary-life"><strong>${Number(game.scores?.[uid] || 0)} pkt</strong><span>${Number(game.roundWinners?.filter(winner => winner === uid).length || 0)} wygranych rund</span></div></article>`).join("")}</div><button class="primary" id="candy-lobby">Wroc do lobby</button></section>`
    : game.phase === "roundSummary"
      ? `<section class="panel center candy-result candy-round-summary"><p class="eyebrow">PODSUMOWANIE RUNDY ${game.round}/${game.totalRounds}</p><h1>${escapeHtml(safeAccounts[game.result?.winner]?.nick || "Nikt")} wygrywa rundę</h1><p class="muted">Następna runda przywróci wszystkim życia i rozłoży nowy stół cukierków.</p><div class="final-ranking candy-final-ranking">${resultOrder.map(uid => `<article class="${uid === game.result?.winner ? "winner-card" : ""}">${mini(safeAccounts[uid] || room.playerProfiles?.[uid] || { nick:"Gracz" })}<div class="candy-summary-life"><strong>${Number(game.scores?.[uid] || 0)} pkt łącznie</strong><span>${uid === game.result?.winner ? "wygrana runda" : "pokonany"}</span></div></article>`).join("")}</div><button class="primary" id="candy-next-round">${game.round >= game.totalRounds ? "Pokaż wyniki" : "Następna runda"}</button></section>`
    : `<section class="poison-candy-stage"><div class="candy-topline"><div><p class="eyebrow">${game.phase === "poisoning" ? "ZATRUWANIE" : "JEDZENIE"}</p><h1>${game.phase === "poisoning" ? "Wybierz zatrute cukierki" : `${escapeHtml(safeAccounts[active]?.nick || "Gracz")} wybiera cukierka`}</h1></div><div class="candy-top-status">${poisonTimer}<span class="badge">${livePlayers(game).length} zywych</span></div></div>${playersRing(game, safeAccounts, active, settings)}<div class="candy-table">${game.candies.map((candy, index) => candyHtml(candy, index, game.candies.length, game, safeAccounts, currentUser, game.phase === "poisoning" ? !game.poisonChoices[currentUser] : isTurn && isAlive, settings)).join("")}</div><div class="candy-event-slot">${eventHtml(game, safeAccounts)}</div>${game.phase === "poisoning" ? (game.poisonChoices[currentUser] ? `<div class="waiting-state"><span class="waiting-pulse">OK</span><h3>Cukierki zatrute</h3><p>Czekamy jeszcze na ${Math.max(0, players.length - Object.keys(game.poisonChoices).length)} graczy. Brakujace wybory po czasie zostana dolosowane.</p></div>` : `<section class="panel candy-action-panel"><h3>Wybierz ${needed}</h3><p class="muted">Tylko ty widzisz swoje zatrute cukierki. Masz 30 sekund, potem gra przyzna brakujace zatrucia losowo.</p><button class="primary" id="candy-poison-submit" disabled>Zatruj wybrane</button></section>`) : (!isAlive ? `<div class="waiting-state"><span class="waiting-pulse">X</span><h3>Odpadasz, ale ogladzasz gre</h3><p>Stol dalej gra do ostatniego zywego gracza.</p></div>` : isTurn ? `<section class="panel candy-action-panel"><h3>Twoja kolej</h3><p class="muted">Wybierz cukierka, ktory nie jest twoim zatrutym.</p>${hasGamePass(safeAccounts[currentUser], "survivor-charm") && settings.gamePassesEnabled !== false ? `<small>🍀 Amulet: zadziała tylko, gdy po trafieniu nadal pozostanie realne ryzyko odpadnięcia.</small>` : ""}${settings.gamePurchases !== false && !game.purchaseUses?.[currentUser]?.["candy-shield"] ? `<button class="ghost" data-candy-shield>🍬 Uzbrój tarczę za 1800$</button>` : ""}</section>` : `<div class="waiting-state"><span class="waiting-pulse">...</span><h3>Czekasz na ruch gracza</h3><p>Kamera trzyma stol i aktywnego gracza.</p></div>`)}</section>`;
  const roundLabel = `RUNDA ${Math.min(game.round, game.totalRounds)}/${game.totalRounds}`;
  root.innerHTML = `<main class="page poison-candy-page board-shell"><section class="panel game-top candy-game-header"><div><p class="eyebrow">ZATRUTY CUKIEREK · ${roundLabel}</p><h1>${["gameSummary", "results"].includes(game.phase) ? "Podsumowanie gry" : "Zatruty cukierek!"}</h1></div><button class="ghost leave-game" id="leave-room">Wyjdź z pokoju</button></section>${body}</main>`;
  requestAnimationFrame(() => window.scrollTo({ top:scrollY, left:0, behavior:"auto" }));
  $("#leave-room").addEventListener("click", actions.leaveRoom);
  $("#candy-lobby")?.addEventListener("click", actions.returnToRoom);
  $("#candy-next-round")?.addEventListener("click", actions.poisonCandyNextRound);
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
  root.querySelector("[data-candy-shield]")?.addEventListener("click", () => actions.poisonCandyBuyShield?.());
  if (game.phase === "poisoning") startPoisonTimer(game, actions);
}
function startPoisonTimer(game, actions) {
  const guard = { phase:game.phase, phaseEndsAt:Number(game.phaseEndsAt || 0) };
  const tick = () => {
    const left = Math.max(0, Math.ceil(((guard.phaseEndsAt || Date.now()) - Date.now()) / 1000));
    const timer = $("#candy-poison-timer");
    if (timer) {
      timer.textContent = `${left}s`;
      timer.parentElement?.classList.toggle("timer-urgent", left <= 5);
    }
    if (left <= 0) {
      stopPoisonCandyTimer();
      actions.poisonCandyTimeout?.(guard);
    }
  };
  tick();
  timerId = setInterval(tick, 500);
}
