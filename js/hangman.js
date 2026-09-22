import { escapeHtml } from "./utils.js?v=20260922-1";

export const hangmanDefaults = { rounds: 5, turnTime: 20, category: "all" };
const wordBanks = {
  zwierzeta: "aligator antylopa bawół bocian chomik delfin flaming flamingo gepard jeż kameleon kangur krokodyl lama łabędź nietoperz ośmiornica pingwin skunks wiewiórka żółw",
  jedzenie: "ananas bakłażan borówka czekolada drożdżówka gruszka kalafior kardamon naleśniki orzechy pietruszka rzodkiewka spaghetti truskawka winogrona żurawina",
  miejsca: "akwarium biblioteka obserwatorium lotnisko lunapark planetarium przedszkole restauracja stadion warsztat wodospad zamek",
  rozne: "akordeon balet błyskawica chmura dinozaur fortepian hamak instrument kalejdoskop kompas latarnia meteoryt przygoda tajemnica zegarmistrz",
};
const normalize = value => String(value || "").toLocaleLowerCase("pl-PL").normalize("NFC");
const phaseEnd = seconds => Date.now() + Math.max(5, Number(seconds) || 20) * 1000;
function bank(category = "all") { return (category === "all" ? Object.values(wordBanks).join(" ") : wordBanks[category] || wordBanks.rozne).split(/\s+/).filter(Boolean); }
function nextPuzzle(game) {
  if (game.round >= game.rounds) { game.phase = "result"; game.finished = true; game.phaseEndsAt = 0; return; }
  game.round += 1;
  game.word = game.words[game.round - 1] || bank(game.category)[Math.floor(Math.random() * bank(game.category).length)];
  game.mask = [...game.word].map(character => /[a-ząćęłńóśźż]/iu.test(character) ? "" : character);
  game.mistakes = 0;
  game.guessed = [];
  game.roundWinner = "";
  game.turnIndex = (game.round - 1) % game.players.length;
  game.currentUid = game.players[game.turnIndex];
  game.phase = "guessing";
  game.phaseEndsAt = phaseEnd(game.turnTime);
}

export function createHangmanGame(players, settings = {}) {
  const category = settings.category || "all", rounds = Math.max(1, Math.min(12, Number(settings.rounds) || 5)), pool = [...bank(category)].sort(() => Math.random() - .5);
  const words = Array.from({ length: rounds }, (_, index) => pool[index % pool.length]);
  const word = words[0] || "tajemnica";
  return { mode: "hangman", phase: "guessing", round: 1, rounds, players: [...players], words, word, category, mask: [...word].map(character => /[a-ząćęłńóśźż]/iu.test(character) ? "" : character), guessed: [], mistakes: 0, maxMistakes: 6, turnIndex: 0, currentUid: players[0], turnTime: Math.max(8, Number(settings.turnTime) || 20), scores: Object.fromEntries(players.map(uid => [uid, 0])), roundWinner: "", phaseEndsAt: phaseEnd(settings.turnTime), finished: false };
}

export const HangmanEngine = {
  guess(game, uid, letter) {
    if (game.phase !== "guessing" || uid !== game.currentUid) return "Poczekaj na swoją kolej.";
    const value = normalize(letter);
    if ([...value].length !== 1 || !/^[a-ząćęłńóśźż]$/u.test(value)) return "Wybierz jedną literę.";
    game.guessed = Array.isArray(game.guessed) ? game.guessed : [];
    if (game.guessed.includes(value)) return "Ta litera była już wybrana.";
    game.guessed.push(value);
    const letters = [...normalize(game.word)];
    if (letters.includes(value)) {
      game.mask = [...game.word].map((character, index) => letters[index] === value ? character : game.mask[index]);
      if (game.mask.every((character, index) => character || !/[a-ząćęłńóśźż]/iu.test(game.word[index]))) {
        game.roundWinner = uid;
        game.scores[uid] = (Number(game.scores[uid]) || 0) + Math.max(1, game.maxMistakes - game.mistakes);
        game.phase = "reveal";
        game.phaseEndsAt = Date.now() + 4200;
        game.finished = game.round >= game.rounds;
        return;
      }
    } else game.mistakes += 1;
    if (game.mistakes >= game.maxMistakes) {
      game.phase = "reveal";
      game.roundWinner = "";
      game.phaseEndsAt = Date.now() + 4200;
      game.finished = game.round >= game.rounds;
      return;
    }
    game.turnIndex = (Number(game.turnIndex) + 1) % game.players.length;
    game.currentUid = game.players[game.turnIndex];
    game.phaseEndsAt = phaseEnd(game.turnTime);
  },
  timeout(game) {
    if (game.phase !== "guessing") return;
    game.mistakes += 1;
    if (game.mistakes >= game.maxMistakes) {
      game.phase = "reveal"; game.roundWinner = ""; game.phaseEndsAt = Date.now() + 4200; game.finished = game.round >= game.rounds; return;
    }
    game.turnIndex = (Number(game.turnIndex) + 1) % game.players.length;
    game.currentUid = game.players[game.turnIndex];
    game.phaseEndsAt = phaseEnd(game.turnTime);
  },
  next(game) { if (game.phase !== "reveal") return "Runda jeszcze trwa."; nextPuzzle(game); },
};

function drawing(mistakes) {
  const parts = [
    `<circle class="hangman-part" cx="150" cy="57" r="18"/>`,
    `<path class="hangman-part" d="M150 75v48"/>`,
    `<path class="hangman-part" d="m150 88-25 20"/>`,
    `<path class="hangman-part" d="m150 88 25 20"/>`,
    `<path class="hangman-part" d="m150 123-22 28"/>`,
    `<path class="hangman-part" d="m150 123 22 28"/>`,
  ];
  return `<svg class="hangman-drawing" viewBox="0 0 220 180" role="img" aria-label="${mistakes} z 6 błędów"><path class="hangman-stand" d="M32 164h166M62 164V20h89v19"/>${parts.slice(0, mistakes).join("")}${mistakes >= 6 ? '<path class="hangman-part hangman-face" d="m143 50 5 5m9-5-5 5m-4 7h4"/>' : ""}</svg>`;
}

export function renderHangmanGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase: game.phase, phaseEndsAt: game.phaseEndsAt, round: game.round }, isTurn = game.currentUid === currentUser;
  if (game.phase === "result") {
    const ranking = Object.entries(game.scores || {}).sort((a, b) => b[1] - a[1]);
    root.innerHTML = `<main class="page hangman-page enter"><section class="hangman-panel hangman-final center"><span class="hangman-trophy">🏆</span><p class="eyebrow">WISIELEC · PODSUMOWANIE</p><h1>Świetna robota!</h1><div class="hangman-ranking">${ranking.map(([uid, score], index) => `<article>${index + 1}. ${escapeHtml(accounts[uid]?.nick || "Gracz")} <b>${Number(score) || 0} pkt</b></article>`).join("")}</div><button class="primary" id="hangman-room">Wróć do lobby</button></section></main>`;
    root.querySelector("#hangman-room").addEventListener("click", actions.returnToRoom);
    return;
  }
  if (game.phase === "reveal") {
    root.innerHTML = `<main class="page hangman-page enter"><section class="hangman-panel hangman-reveal center">${drawing(game.mistakes)}<p class="eyebrow">HASŁO ${game.round} / ${game.rounds}</p><h1>${escapeHtml(game.word)}</h1><p>${game.roundWinner ? `${escapeHtml(accounts[game.roundWinner]?.nick || "Gracz")} odgadł hasło!` : "Skończyły się próby — następnym razem się uda."}</p><button class="primary" id="hangman-next" ${room.hostUid === currentUser ? "" : "disabled"}>${game.finished ? "Zobacz wyniki" : "Następne hasło"}</button></section></main>`;
    root.querySelector("#hangman-next").addEventListener("click", actions.hangmanNext);
    renderHangmanGame.timer = setTimeout(() => actions.hangmanNext(), Math.max(100, Number(game.phaseEndsAt) - Date.now() + 50));
    return;
  }
  const keyboard = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŹŻ".split("").map(letter => { const normalized = normalize(letter); const used = game.guessed?.includes(normalized); return `<button type="button" class="hangman-key ${used ? "is-used" : ""}" data-hangman-letter="${letter}" ${!isTurn || used ? "disabled" : ""}>${letter}</button>`; }).join("");
  root.innerHTML = `<main class="page hangman-page enter"><section class="hangman-panel"><header class="hangman-heading"><div><p class="eyebrow">WISIELEC · HASŁO ${game.round} / ${game.rounds}</p><h1>${isTurn ? "Twoja kolej na literę" : `Kolej: ${escapeHtml(accounts[game.currentUid]?.nick || "Gracz")}`}</h1></div><div class="hangman-clock"><b data-hangman-clock>${Math.max(0, Math.ceil((game.phaseEndsAt - Date.now()) / 1000))}</b><small>sek.</small></div></header><div class="hangman-layout">${drawing(game.mistakes)}<div class="hangman-word" aria-label="Ukryte hasło">${game.mask.map((character, index) => `<span class="${character ? "is-revealed" : ""}">${character ? escapeHtml(character.toLocaleUpperCase("pl-PL")) : "·"}</span>`).join("")}</div></div><div class="hangman-lives">${Array.from({ length: game.maxMistakes }, (_, index) => `<i class="${index < game.mistakes ? "is-lost" : ""}">${index < game.mistakes ? "×" : "♥"}</i>`).join("")}<span>${game.maxMistakes - game.mistakes} próby</span></div><div class="hangman-keyboard">${keyboard}</div><div class="hangman-score-strip">${game.players.map(uid => `<span>${escapeHtml(accounts[uid]?.nick || "Gracz")} <b>${Number(game.scores?.[uid]) || 0}</b></span>`).join("")}</div></section></main>`;
  root.querySelectorAll("[data-hangman-letter]").forEach(button => button.addEventListener("click", () => actions.hangmanGuess(button.dataset.hangmanLetter, expected)));
  renderHangmanGame.countdown = setInterval(() => { const clock = root.querySelector("[data-hangman-clock]"); if (clock) clock.textContent = String(Math.max(0, Math.ceil((game.phaseEndsAt - Date.now()) / 1000))); }, 250);
  renderHangmanGame.timer = setTimeout(() => actions.hangmanTimeout(expected), Math.max(100, Number(game.phaseEndsAt) - Date.now() + 50));
}
export function stopHangmanTimer() { clearTimeout(renderHangmanGame.timer); clearInterval(renderHangmanGame.countdown); }
export function renderHangmanLobbySettings(room, isHost) { const s = { ...hangmanDefaults, ...(room.settings || {}) }; return `<div class="hangman-settings"><label>Liczba haseł<select data-hangman-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,7,10,12].map(value => `<option value="${value}" ${Number(s.rounds) === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label>Czas na ruch<select data-hangman-setting="turnTime" ${isHost ? "" : "disabled"}>${[10,15,20,30,45].map(value => `<option value="${value}" ${Number(s.turnTime) === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label><label>Kategoria<select data-hangman-setting="category" ${isHost ? "" : "disabled"}><option value="all" ${s.category === "all" ? "selected" : ""}>Wszystko po trochu</option>${Object.keys(wordBanks).map(key => `<option value="${key}" ${s.category === key ? "selected" : ""}>${key[0].toUpperCase() + key.slice(1)}</option>`).join("")}</select></label><p class="tiny">Gracze podają litery na zmianę. Sześć pomyłek odkrywa całe hasło.</p></div>`; }
