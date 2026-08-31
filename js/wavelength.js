import { escapeHtml } from "./utils.js?v=20260822-1";
import { hasGamePass } from "./gamePasses.js?v=20260831-6";

export const wavelengthDefaults = { rounds:8, roundTime:60 };
const pairs = [
  ["Gorące","Zimne"],["Bogaty","Biedny"],["Śmieszne","Poważne"],["Szybkie","Wolne"],["Jasne","Ciemne"],["Głośne","Ciche"],["Łatwe","Trudne"],["Stare","Nowe"],["Blisko","Daleko"],["Duże","Małe"],["Wysokie","Niskie"],["Ciężkie","Lekkie"],["Słodkie","Gorzkie"],["Mokre","Suche"],["Miękkie","Twarde"],["Pełne","Puste"],["Otwarte","Zamknięte"],["Dzień","Noc"],["Lato","Zima"],["Miasto","Wieś"],["Formalne","Luźne"],["Bezpieczne","Ryzykowne"],["Zdrowe","Niezdrowe"],["Popularne","Niszowe"],["Tanie","Drogie"],["Spokojne","Chaotyczne"],["Przyjazne","Wrogie"],["Realistyczne","Fantastyczne"],["Nowoczesne","Klasyczne"],["Eleganckie","Kiczowate"],["Praktyczne","Niepraktyczne"],["Pożyteczne","Bezużyteczne"],["Szczęśliwe","Smutne"],["Odważne","Tchórzliwe"],["Mądre","Głupie"],["Czyste","Brudne"],["Szerokie","Wąskie"],["Długie","Krótkie"],["Wysuszone","Wilgotne"],["Naturalne","Sztuczne"],["Widoczne","Ukryte"],["Zwyczajne","Dziwne"],["Prawdopodobne","Nieprawdopodobne"],["Wygodne","Niewygodne"],["Słabe","Mocne"],["Młode","Dojrzałe"],["Poranne","Wieczorne"],["Samotne","Towarzyskie"],["Zwycięskie","Przegrane"],["Królewskie","Zwyczajne"],["Ciepłe","Chłodne"],["Ciasne","Przestronne"],["Radosne","Ponure"],["Skomplikowane","Proste"],["Poważne","Żartobliwe"]
];
const displayPair = pair => pair?.[0] === "Ciasne" ? ["Mało miejsca", "Dużo miejsca"] : pair;
const randomPair = () => displayPair(pairs[Math.floor(Math.random() * pairs.length)]);
const phaseEnd = seconds => Date.now() + Math.max(30, Math.min(120, Number(seconds) || 60)) * 1000;
const scoreFor = difference => Math.max(0, Math.round(100 - Math.abs(Number(difference) || 0) * 2));

export function createWavelengthGame(players, settings) {
  const guesserUid=players[1] || players[0] || "";
  return { mode:"wavelength", phase:"clue", round:1, scores:Object.fromEntries(players.map(uid => [uid, 0])), pair:randomPair(), target:Math.floor(Math.random() * 101), position:50, positionOwner:"", clue:"", clues:{}, guesserUid, describerIndex:0, phaseEndsAt:phaseEnd(settings.roundTime), roundResult:null, passUses:{}, proHints:{}, feedback:null };
}

function finishRound(game, players, settings) {
  const difference = Math.abs(Number(game.position) - Number(game.target));
  const points = scoreFor(difference);
  game.scores = game.scores || Object.fromEntries(players.map(uid => [uid, 0]));
  players.forEach(uid => { game.scores[uid] = Number(game.scores[uid]) || 0; });
  const guesser = game.guesserUid || players[1] || players[0];
  game.scores[guesser] += points;
  game.roundResult = { target:game.target, position:game.position, difference, points, describer:guesser, guesser };
  game.phase = "result";
  game.finished = Number(game.round) >= Math.max(5, Math.min(20, Number(settings.rounds) || 8));
}

export const WavelengthEngine = {
  revealPro(game, uid, players) {
    game.guesserUid ||= players[1] || players[0] || "";
    if (game.phase !== "guess" || game.guesserUid !== uid) return "Zakres można podejrzeć dopiero podczas twojego pomiaru.";
    game.passUses ||= {};
    const round = Number(game.round) || 1;
    if (game.passUses[uid]?.["wavelength-pro"] === round || game.passUses[uid]?.["wavelength-pro"] === true) return "Wavelength Pro został już użyty w tej rundzie.";
    const target = Number(game.target);
    game.proHints ||= {};
    game.proHints[uid] = { round, low:Math.max(0, target - 20), high:Math.min(100, target + 20) };
    game.passUses[uid] = { ...(game.passUses[uid] || {}), "wavelength-pro":round };
    return null;
  },
  clue(game, uid, text, players, settings) {
    game.guesserUid ||= players[1] || players[0] || "";
    if (game.phase !== "clue" || uid === game.guesserUid || !players.includes(uid)) return "Teraz podpowiada inny gracz.";
    const clue = String(text || "").trim().slice(0, 120);
    const forbidden = game.pair.some(word => clue.toLocaleLowerCase("pl-PL").includes(word.toLocaleLowerCase("pl-PL")));
    if (!clue || /\d/.test(clue) || forbidden) return "Podpowiedź nie może zawierać liczb ani nazw skrajności.";
    game.clues = game.clues && typeof game.clues === "object" ? game.clues : {};
    game.clues[uid] = clue;
    game.clue = Object.values(game.clues).join(" · ");
    const cluePlayers = players.filter(player => player !== game.guesserUid);
    if (cluePlayers.every(player => game.clues[player])) game.phase = "guess";
  },
  move(game, uid, position, players = []) {
    game.guesserUid ||= players[1] || players[0] || "";
    if (game.phase !== "guess") return "Najpierw podajcie podpowiedź.";
    if (game.guesserUid !== uid) return "Tylko wybrany zgadujący ustawia wskaźnik.";
    game.position = Math.max(0, Math.min(100, Number(position) || 0));
    game.positionOwner = uid;
  },
  confirm(game, uid, players, settings, options = {}) {
    game.guesserUid ||= players[1] || players[0] || "";
    if (game.phase !== "guess") return "Ta runda jest już zakończona.";
    if (game.guesserUid !== uid) return "Tylko zgadujący może zatwierdzić ustawienie.";
    if (game.positionOwner !== uid) return "Najpierw ustaw własny wskaźnik, a potem go zatwierdź.";
    const pass = Boolean(options.secondChancePass) && !game.passUses?.[uid]?.["wavelength-second-chance"];
    if (pass && Number(game.target) !== Number(game.position)) {
      const difference = Math.abs(Number(game.position) - Number(game.target));
      const direction = Number(game.target) > Number(game.position) ? (difference > 15 ? ">>" : ">") : (difference > 15 ? "<<" : "<");
      game.passUses ||= {};
      game.passUses[uid] = { ...(game.passUses[uid] || {}), "wavelength-second-chance":true };
      game.feedback = { uid, direction, differenceBand:difference > 15 ? "far" : "near" };
      game.phaseEndsAt = Date.now() + 15000;
      return null;
    }
    game.feedback = null;
    finishRound(game, players, settings);
  },
  timeout(game, players, settings) {
    if (game.phase === "result") return;
    finishRound(game, players, settings);
  },
  nextRound(game, players, settings) {
    if (game.phase !== "result") return "Runda jeszcze się nie zakończyła.";
    if (game.finished) return;
    game.round += 1; game.pair = randomPair(); game.target = Math.floor(Math.random() * 101); game.position = 50; game.positionOwner = ""; game.clue = ""; game.clues = {}; game.roundResult = null; game.feedback = null; game.guesserUid = players[(players.indexOf(game.guesserUid) + 1 + players.length) % players.length] || players[0]; game.phase = "clue"; game.phaseEndsAt = phaseEnd(settings.roundTime);
  }
};

function clueScaleMarkup(game) {
  const left = escapeHtml(game.pair[1]), right = escapeHtml(game.pair[0]);
  return `<section class="wavelength-clue-guide" aria-label="Skala podpowiedzi"><p class="eyebrow">SKALA PODPOWIEDZI</p><div class="wavelength-clue-guide-labels"><b>0% · ${left}</b><b>50% · środek</b><b>100% · ${right}</b></div><div class="wavelength-clue-guide-track"><span></span><span></span><span></span></div><div class="wavelength-clue-guide-hint">Podpowiedz, co pasuje do wybranego miejsca na tej osi. Bez liczb i bez nazw końców skali.</div></section>`;
}

function scaleMarkup(game, canMove, canConfirm, showTarget = false) {
  const target = game.phase === "result" || showTarget ? `<span class="wavelength-target" style="left:${game.target}%"></span><b class="wavelength-target-label" style="left:${game.target}%">${game.target}%</b>` : "";
  const hint = canMove && game.proHints?.[game.guesserUid]?.round === Number(game.round) ? game.proHints[game.guesserUid] : null;
  const hintMarkup = hint ? `<span class="wavelength-pro-range" style="left:${hint.low}%;width:${hint.high - hint.low}%"></span>` : "";
  return `<div class="wavelength-scale"><div class="wavelength-scale-labels"><b>${escapeHtml(game.pair[1])}</b><b>${escapeHtml(game.pair[0])}</b></div><div class="wavelength-track">${hintMarkup}${target}<span class="wavelength-position" style="left:${game.position}%"></span></div>${canMove ? `<input class="wavelength-slider" data-wavelength-slider type="range" min="0" max="100" value="${game.position}">` : ""}<output data-wavelength-position>${game.position}%</output></div>${canConfirm ? `<button class="primary" data-wavelength-confirm>${game.feedback?.uid === game.guesserUid ? "Zatwierdź drugi pomiar" : "Zatwierdź ustawienie"}</button>` : ""}`;
}

function resultMarkup(game, accounts, actions) {
  const result = game.roundResult || {}, name = escapeHtml(accounts[result.describer]?.nick || "Opisujący");
  const standings=Object.entries(game.scores||{}).sort(([,a],[,b])=>Number(b)-Number(a));
  const ranking=standings.map(([uid,score],index)=>`<div class="wavelength-ranking-row"><span>${index+1}. ${escapeHtml(accounts[uid]?.nick||"Gracz")}</span><b>${Number(score)||0} pkt</b></div>`).join("");
  const podium=game.finished ? `<div class="wavelength-podium">${standings.slice(0,3).map(([uid,score],index)=>`<div class="wavelength-podium-place place-${index+1}"><strong>${index+1}</strong><b>${escapeHtml(accounts[uid]?.nick||"Gracz")}</b><span>${Number(score)||0} pkt</span></div>`).join("")}</div>` : "";
  return `<section class="panel wavelength-panel enter"><p class="eyebrow">WAVELENGTH · RUNDA ${game.round}</p><h1>Cel został odsłonięty</h1><div class="wavelength-reveal">${scaleMarkup(game, false, false)}</div><p class="wavelength-clue">„${escapeHtml(game.clue || "Brak podpowiedzi")}" · ${name}</p><div class="wavelength-result-stats"><b>Odległość: ${result.difference ?? "-"}</b><strong>+${result.points ?? 0} pkt</strong></div>${podium}<div class="wavelength-ranking"><p class="eyebrow">RANKING</p>${ranking}</div>${game.finished ? `<p class="money-pop">To koniec gry. Nagrody zostały przyznane.</p><button class="primary" id="wavelength-lobby">Wróć do lobby</button>` : `<button class="primary" id="wavelength-next">Następna runda</button>`}</section>`;
}

export function renderWavelengthGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, settings = room.settings || wavelengthDefaults, players = room.players || [];
  game.pair = displayPair(game.pair) || ["Szybkie", "Wolne"];
  game.guesserUid ||= players[1] || players[0] || "";
  const guesser = game.guesserUid === currentUser, positionOwner = game.positionOwner === currentUser;
  window.clearTimeout(renderWavelengthGame.timer); window.clearInterval(renderWavelengthGame.countdown);
  if (game.phase === "result") { root.innerHTML = `<main class="page wavelength-page">${resultMarkup(game, accounts, actions)}</main>`; root.querySelector("#wavelength-next")?.addEventListener("click", actions.wavelengthNext); root.querySelector("#wavelength-lobby")?.addEventListener("click", actions.returnToRoom); return; }
  const pair = `<div class="wavelength-pair"><span>${escapeHtml(game.pair[1])}</span><span>↔</span><span>${escapeHtml(game.pair[0])}</span></div>`;
  const clueEntries=guesser ? Object.entries(game.clues||{}).filter(([,text])=>text).map(([uid,text])=>`<div class="wavelength-clue-entry">${escapeHtml(accounts[uid]?.nick||"Gracz")} — <b>„${escapeHtml(text)}”</b></div>`).join("") : "";
  const clue = clueEntries ? `<div class="wavelength-clues"><p class="eyebrow">PODPOWIEDZI GRACZY</p>${clueEntries}</div>` : "";
  const ownClue = game.clues?.[currentUser];
  const clueForm = !guesser && game.phase === "clue" && !ownClue ? `<form class="wavelength-clue-form"><input id="wavelength-clue" maxlength="120" placeholder="Jedno słowo lub krótkie zdanie"><button class="primary">Podaj podpowiedź</button></form>` : game.phase === "clue" ? `<p class="muted">${guesser ? "Czekamy na podpowiedzi pozostałych graczy." : "Twoja podpowiedź została wysłana."}</p>` : "";
  const canMove = guesser && game.phase === "guess", canConfirm = canMove && positionOwner;
  const proOwned = hasGamePass(accounts?.[currentUser], "wavelength-pro") && room.settings?.gamePassesEnabled !== false;
  const secondChanceOwned = hasGamePass(accounts?.[currentUser], "wavelength-second-chance") && room.settings?.gamePassesEnabled !== false;
  const proUsed = game.passUses?.[currentUser]?.["wavelength-pro"] === Number(game.round) || game.passUses?.[currentUser]?.["wavelength-pro"] === true, secondUsed = Boolean(game.passUses?.[currentUser]?.["wavelength-second-chance"]);
  const proPanel = canMove ? `${proOwned && !proUsed ? `<button class="ghost" data-wavelength-pro>Podejrzyj szeroki zakres celu</button>` : ""}${game.feedback?.uid === currentUser ? `<p class="wavelength-feedback">Gra podpowiada kierunek: <strong>${game.feedback.direction}</strong></p>` : ""}${secondChanceOwned && !secondUsed ? `<small>Drugi pomiar zadziała po pierwszym nietrafionym zatwierdzeniu.</small>` : ""}` : "";
  root.innerHTML = `<main class="page wavelength-page enter"><section class="panel wavelength-panel"><p class="eyebrow">WAVELENGTH · RUNDA ${game.round}/${settings.rounds || 8}</p><h1>${game.phase === "clue" ? (guesser ? "Czekaj na podpowiedzi" : "Daj podpowiedź zgadującemu") : "Ustaw swój wskaźnik"}</h1>${guesser && game.phase === "clue" ? `<p class="wavelength-secret">Ukryty cel jest tajny dla zgadującego.</p>` : ""}${pair}${clue}<p class="muted">${game.phase === "clue" ? "Nie używaj liczb ani nazw skrajności." : "Im bliżej ukrytego celu, tym więcej punktów."}</p>${clueForm}${game.phase === "guess" ? scaleMarkup(game, canMove, canConfirm, false) : `<div class="wavelength-wait">${guesser ? "Skala pojawi się, gdy wszyscy podadzą podpowiedź." : "Czekamy na pozostałych graczy."}</div>`}${proPanel}<div class="wavelength-timer" data-wavelength-countdown>${Math.max(0, Math.ceil((game.phaseEndsAt - Date.now()) / 1000))}s</div></section></main>`;
  if (game.phase === "clue") {
    root.querySelector(".wavelength-pair")?.insertAdjacentHTML("afterend", clueScaleMarkup(game));
    const instruction = root.querySelector(".wavelength-panel > .muted");
    if (instruction) instruction.textContent = "Opisz miejsce na osi słowami — bez liczb i bez powtarzania nazw końców.";
  }
  root.querySelector(".wavelength-clue-form")?.addEventListener("submit", event => { event.preventDefault(); actions.wavelengthClue(root.querySelector("#wavelength-clue").value, { phase:game.phase, phaseEndsAt:game.phaseEndsAt }); });
  const slider=root.querySelector("[data-wavelength-slider]"), output=root.querySelector("[data-wavelength-position]"); slider?.addEventListener("input", () => { output.textContent=`${slider.value}%`; root.querySelector(".wavelength-position").style.left=`${slider.value}%`; }); slider?.addEventListener("change", () => actions.wavelengthMove(Number(slider.value), { phase:game.phase, phaseEndsAt:game.phaseEndsAt }));
  root.querySelector("[data-wavelength-confirm]")?.addEventListener("click", () => actions.wavelengthConfirm({ phase:game.phase, phaseEndsAt:game.phaseEndsAt }));
  root.querySelector("[data-wavelength-pro]")?.addEventListener("click", () => actions.wavelengthRevealPro());
  renderWavelengthGame.countdown=window.setInterval(()=>{const node=root.querySelector("[data-wavelength-countdown]");if(node)node.textContent=`${Math.max(0,Math.ceil((game.phaseEndsAt-Date.now())/1000))}s`;},250); renderWavelengthGame.timer=window.setTimeout(()=>actions.wavelengthTimeout({phase:game.phase,phaseEndsAt:game.phaseEndsAt}),Math.max(100,game.phaseEndsAt-Date.now()+50));
}

export function renderWavelengthLobbySettings(room, isHost) { const settings=room.settings || wavelengthDefaults; return `<div class="wavelength-settings"><label>Liczba rund <input data-wavelength-setting="rounds" type="number" min="5" max="20" value="${settings.rounds || 8}" ${isHost ? "" : "disabled"}></label><label>Czas rundy <input data-wavelength-setting="roundTime" type="number" min="30" max="120" value="${settings.roundTime || 60}" ${isHost ? "" : "disabled"}> s</label><p class="tiny">Każda runda losuje nową parę przeciwieństw i ukryty cel.</p></div>`; }

export function stopWavelengthTimer() { window.clearTimeout(renderWavelengthGame.timer); window.clearInterval(renderWavelengthGame.countdown); }
