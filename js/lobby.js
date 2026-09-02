import { $, escapeHtml, icon } from "./utils.js?v=20260822-1";
import { getGameMode } from "./games.js?v=20260902-15";
import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { commerceCreationHtml, commerceSummaryHtml, defaultCommercePreferences, normalizeCommerceSettings, saveCommercePreferences } from "./gamePasses.js?v=20260901-13";
import { minecraftModeIcons } from "./minecraft.js?v=20260901-8";

const isBotId = uid => String(uid || "").startsWith("bot:");

const pokemonCardIds = { "pokemon-dex":25, "pokemon-last-letter":133, "pokemon-evolution":1, "pokemon-auction":149, "pokemon-types":7, "pokemon-match-type":4 };
const modeEmojis = { wavelength:"🌈", quiz:"🎲", mathematics:"🧮", marker:"🖍️", sequence:"🔐", family:"📊", "word-chain":"🔗", "tajna-zasada":"🧠", "pojedynek-hitow":"🎵", "bitwa-hitow":"🎶" };
function modeVisual(mode) { const pokemon = mode.audience === "pokemon" && pokemonDex.find(item => item.id === pokemonCardIds[mode.id]); if (pokemon) return `<img class="mode-pokemon-symbol" src="${pokemon.sprite}" alt="${escapeHtml(pokemon.name)}" onerror="this.onerror=null;this.src='${pokemon.spriteFallback}'">`; if (mode.audience === "minecraft" && minecraftModeIcons[mode.id]) return `<img class="mode-minecraft-symbol" src="${minecraftModeIcons[mode.id]}" alt="Kilof Minecraft">`; return modeEmojis[mode.id] || mode.symbol; }
export const ENTRY_FEE_OPTIONS = [50, 100, 250, 500, 1000, 2500, 5000];
const roomTypeLabel = room => room?.roomType === "betting" ? `ZAKŁADY · ${Number(room.entryFee || 0).toLocaleString("pl-PL")}$` : "STANDARD";

const presetValue = (preset, quick, standard, long) => preset === "quick" ? quick : preset === "long" ? long : standard;
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);

function presetSettingsFor(mode, preset, { mathematicsVariant = "single" } = {}) {
  const defaults = mode.defaultSettings || {};
  const settings = {};
  const set = (key, quick, long, standard = defaults[key]) => {
    if (hasOwn(defaults, key) || standard !== undefined) settings[key] = presetValue(preset, quick, standard, long);
  };
  const id = mode.id;

  if (id === "quiz") {
    set("questionCount", 5, 15, 10);
    set("questionTime", 30, 90, 60);
  } else if (id === "mathematics") {
    set("questionCount", 5, 15, 10);
    set("questionTime", 25, 60, 45);
    set("testTime", 180, 600, 300);
    settings.mathematicsVariant = mathematicsVariant;
  } else if (id === "impostor") {
    set("clueTime", 10, 30, 20);
    set("minRounds", 1, 3, 2);
  } else if (id === "kim-jestem") {
    set("turnTime", 30, 60, 45);
    set("rounds", 3, 10, 3);
  } else if (id === "wavelength") {
    set("roundTime", 30, 90, 60);
    set("rounds", 5, 10, 8);
  } else if (id === "inne-pytanie") {
    set("answerTime", 15, 30, 20);
    set("discussionTime", 30, 90, 60);
    set("voteTime", 10, 25, 15);
    set("rounds", 3, 10, 5);
  } else if (id === "test-znajomosci") {
    set("answerTime", 10, 30, 15);
    set("assignTime", 20, 60, 30);
    set("rounds", 3, 10, 5);
  } else if (id === "kto-najpredzej") {
    set("questionTime", 15, 45, 30);
    set("voteTime", 10, 25, 15);
    set("rounds", 3, 10, 8);
  } else if (id === "number-mystery") {
    set("questionTime", 15, 45, 30);
    set("rounds", 3, 10, 7);
  } else if (id === "klamca") {
    set("answerTime", 15, 60, 30);
    set("discussionTime", 10, 30, 20);
    set("voteTime", 15, 45, 25);
    set("rounds", 3, 10, 5);
  } else if (id === "falszywa-wiadomosc") {
    // 0 oznacza „każdy gracz raz” — preset nie powinien tego zmieniać na arbitralną liczbę rund.
    set("rounds", 0, 0, 0);
    set("answerTime", 15, 60, 30);
    set("voteTime", 15, 45, 25);
  } else if (id === "tajna-zasada") {
    set("ruleTime", 30, 90, 60);
    set("reviewTime", 10, 30, 20);
    set("guessTime", 15, 45, 30);
  } else if (["pojedynek-hitow", "bitwa-hitow"].includes(id)) {
    set("selectionTime", 15, 60, 30);
    set("votingTime", 15, 35, 25);
    set("rounds", id === "bitwa-hitow" ? 3 : 3, id === "bitwa-hitow" ? 15 : 10, defaults.rounds);
  } else if (id === "popularnosc-hitow") {
    set("choiceTime", 5, 20, 10);
    set("rounds", 3, 15, 10);
  } else if (id.startsWith("minecraft-")) {
    set("questionTime", 8, 20, defaults.questionTime);
    set("rounds", 5, 15, defaults.rounds);
  } else if (id === "5-sekund") {
    set("answerTime", 5, 10, 5);
    set("rounds", 3, 10, 8);
  } else if (["pokemon-dex", "pokemon-evolution", "pokemon-types"].includes(id)) {
    set("answerTime", 10, 30, 15);
    set("rounds", 3, 10, 5);
    if (id === "pokemon-types") set("selectTime", 5, 20, 10);
  } else if (id === "pokemon-last-letter") {
    set("answerTime", 10, 30, 15);
    set("rounds", 3, 15, 10);
  } else if (id === "pokemon-match-type") {
    set("answerTime", 10, 30, 15);
  } else if (id === "word-chain") {
    set("answerTime", 10, 30, 20);
  } else {
    if (hasOwn(defaults, "answerTime")) set("answerTime", 15, 60, defaults.answerTime);
    if (hasOwn(defaults, "rounds")) set("rounds", 3, 10, defaults.rounds);
  }
  return settings;
}

const averagePhase = (seconds, fraction = .5, minimum = 4) => Math.max(minimum, (Number(seconds) || 0) * fraction);
const roundWord = count => count === 1 ? "partia" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? "rundy" : "rund";
const durationLabel = seconds => {
  const rounded = Math.max(30, Math.round(Number(seconds || 0) / 30) * 30);
  if (rounded < 60) return `około ${rounded} sek.`;
  const minutes = Math.max(1, Math.round(rounded / 60));
  return `około ${minutes} min`;
};

function estimatePreset(mode, preset, playerCount, extra = {}) {
  const settings = { ...(mode.defaultSettings || {}), ...presetSettingsFor(mode, preset, extra) };
  const players = Math.max(mode.minPlayers || 2, Math.min(Number(playerCount) || 4, mode.id === "bitwa-hitow" ? 100 : 8));
  const id = mode.id;
  let seconds = 120;
  let roundsText = "1 partia";
  const rounds = Number(settings.rounds) || 0;
  if (rounds > 0) roundsText = `${rounds} ${roundWord(rounds)}`;

  switch (id) {
    case "udowodnij":
    case "polacz-nas":
      seconds = rounds * (averagePhase(settings.answerTime, .5, 8) + 8);
      break;
    case "impostor":
      seconds = 15 + Number(settings.minRounds || 2) * players * averagePhase(settings.clueTime, .45, 5) + 5 + 10 + 15;
      roundsText = `min. ${settings.minRounds || 2} ${roundWord(Number(settings.minRounds || 2))}`;
      break;
    case "kim-jestem":
      seconds = rounds * players * (averagePhase(settings.turnTime, .45, 8) + 3);
      break;
    case "inne-pytanie":
      seconds = rounds * (averagePhase(settings.answerTime, .5, 8) + averagePhase(settings.discussionTime, .5, 10) + averagePhase(settings.voteTime, .5, 6) + 5);
      break;
    case "kto-najpredzej":
      seconds = rounds * (averagePhase(settings.questionTime, .45, 8) + averagePhase(settings.voteTime, .5, 6) + 5);
      break;
    case "test-znajomosci":
      seconds = rounds * (averagePhase(settings.answerTime, .5, 8) + averagePhase(settings.assignTime, .5, 10) + 8);
      break;
    case "zatruty-cukierek":
      seconds = rounds * (15 + players * 4);
      break;
    case "bomba":
      seconds = rounds * (players * averagePhase(settings.answerTime, .35, 4) + 7);
      break;
    case "najblizej-prawdy":
      seconds = rounds * 32;
      break;
    case "ranking":
      seconds = rounds * 38;
      break;
    case "5-sekund":
      seconds = rounds * players * (averagePhase(settings.answerTime, .7, 3) + 3) + 5;
      break;
    case "zegar":
      seconds = rounds * (((Number(settings.minSeconds) || 3) + (Number(settings.maxSeconds) || 15)) / 2 * 1.15 + 8);
      break;
    case "pokemon-dex":
    case "pokemon-evolution":
      seconds = rounds * (averagePhase(settings.answerTime, .5, 7) + 8);
      break;
    case "pokemon-last-letter": {
      const turns = Number(settings.rounds) || 10;
      seconds = turns * (averagePhase(settings.answerTime, .4, 4) + 3);
      roundsText = `${turns} tur`;
      break;
    }
    case "pokemon-auction":
      seconds = 90;
      roundsText = "1 aukcja";
      break;
    case "pokemon-types":
      seconds = rounds * (averagePhase(settings.selectTime, .5, 4) + averagePhase(settings.answerTime, .5, 7) + 8);
      break;
    case "pokemon-match-type":
      seconds = 150;
      roundsText = "do wyeliminowania graczy";
      break;
    case "wavelength":
      seconds = rounds * (averagePhase(settings.roundTime, .6, 18) + 8);
      break;
    case "number-mystery":
      if (settings.roundMode === "rounds") seconds = rounds * players * (averagePhase(settings.questionTime, .35, 6) + 4);
      else { seconds = 210; roundsText = "do trafienia"; }
      break;
    case "unique-answer":
      seconds = 180;
      roundsText = "1 partia";
      break;
    case "quiz":
      seconds = Number(settings.questionCount || 10) * (averagePhase(settings.questionTime, .5, 12) + 4);
      roundsText = `${Number(settings.questionCount || 10)} pytań`;
      break;
    case "mathematics":
      if (settings.mathematicsVariant === "full-test") { seconds = Number(settings.testTime || 300) * .8 + 12; roundsText = "1 test"; }
      else { seconds = Number(settings.questionCount || 10) * (averagePhase(settings.questionTime, .5, 12) + 3); roundsText = `${Number(settings.questionCount || 10)} zadań`; }
      break;
    case "marker":
      seconds = 150;
      roundsText = "1 mecz";
      break;
    case "sequence":
      seconds = 15 + 7 * 20 + 20;
      roundsText = "1 mecz";
      break;
    case "family":
      seconds = rounds * (averagePhase(settings.answerTime, .45, 8) + 7);
      break;
    case "word-chain":
      seconds = players * (Number(settings.hearts || 3) * (averagePhase(settings.answerTime, .35, 5) + 3));
      roundsText = "1 partia";
      break;
    case "klamca":
      seconds = rounds * (averagePhase(settings.answerTime, .5, 8) + averagePhase(settings.discussionTime, .5, 8) + averagePhase(settings.voteTime, .5, 8) + 10);
      break;
    case "falszywa-wiadomosc":
      seconds = (Number(settings.rounds) || players) * (averagePhase(settings.answerTime, .5, 8) + averagePhase(settings.voteTime, .5, 8) + 10);
      roundsText = settings.rounds ? `${settings.rounds} ${roundWord(Number(settings.rounds))}` : "każdy gracz raz";
      break;
    case "tajna-zasada":
      seconds = averagePhase(settings.ruleTime, .5, 15) + 15 + 4 * (averagePhase(settings.guessTime, .4, 8) + 5);
      roundsText = "do odkrycia zasady";
      break;
    case "pojedynek-hitow":
    case "bitwa-hitow":
      // Dwa podglądy mają po 30 sekund. Odsłuch rundy jest więc stały i nie
      // może być skracany presetem ani średnim czasem odpowiedzi.
      seconds = rounds * (averagePhase(settings.selectionTime, .5, 8) + 60 + averagePhase(settings.votingTime, .5, 8) + 7);
      break;
    case "popularnosc-hitow":
      seconds = rounds * (averagePhase(settings.choiceTime, .7, 4) + 7);
      break;
    default:
      seconds = rounds ? rounds * 45 : 120;
  }
  return `łącznie ${durationLabel(seconds)} · ${roundsText}`;
}

function roomCard(room, mode) {
  const identityFlow = mode.id === "kim-jestem" ? `<span class="room-mode-pill">${room.settings?.gameFlow === "browserVoice" || room.settings?.gameFlow === "voice" ? "Voice chat w grze" : room.settings?.gameFlow === "externalVoice" ? "Glos poza gra" : "Tryb tekstowy"}</span>` : "";
  const adult = Boolean(mode.adult || [room.settings?.category, ...(Array.isArray(room.settings?.categories) ? room.settings.categories : [])].some(item => String(item || "").startsWith("18+")));
  return `<article class="room-card">
    <div><div class="room-mode">${modeVisual(mode)} ${mode.name} <span class="room-type-badge ${room.roomType === "betting" ? "is-betting" : "is-standard"}">${room.roomType === "betting" ? "◈" : "●"} ${roomTypeLabel(room)}</span></div><h3>${escapeHtml(room.name)}</h3>
      <p class="muted">${room.roomId} · ${room.players.length}/${room.maxPlayers || mode.maxPlayers} · ${room.status === "lobby" ? "oczekuje" : "gra trwa"}</p>${adult ? '<span class="adult-room-badge">18+</span>' : ""}${identityFlow}${commerceSummaryHtml(room.gameMode, room.settings, { compact:true })}</div>
    <div class="room-right">${room.isPrivate ? icon("lock", 18) : ""}<button data-join-room="${room.roomId}">Wejdź</button></div>
  </article>`;
}

export function renderLobby(root, { rooms, selectedGameMode, onlineBackend }, actions) {
  const mode = getGameMode(selectedGameMode);
  const wavelengthHint = mode.id === "wavelength" && localStorage.getItem("wavelengthTutorialSeen") !== "1" ? '<span class="wavelength-info-hint">↗ Kliknij „i”, aby poznać zasady</span>' : "";
  const modeRooms = rooms.filter(room => room.gameMode === mode.id && room.status === "lobby" && (room.players || []).some(uid => !isBotId(uid)));
  const commerceHint = commerceSummaryHtml(mode.id, {}, { compact:true }) ? '<p class="commerce-mode-hint">✦ Ten tryb ma opcjonalne zakupy używane podczas rozgrywki. Host może je włączyć przy tworzeniu pokoju.</p>' : "";
  const backendNote = onlineBackend === null
    ? '<section class="online-note">Łączenie z trybem online...</section>'
    : onlineBackend
      ? '<section class="online-note">Tryb online aktywny. Pokoje są synchronizowane między urządzeniami.</section>'
      : '<section class="warning">Nie udało się połączyć z trybem online. Odśwież stronę i spróbuj ponownie.</section>';
  root.innerHTML = `<main class="page lobby-page enter">
    <section class="mode-hero panel">
      <div class="game-symbol game-symbol-${mode.art}">${modeVisual(mode)}</div>
      <div><p class="eyebrow">WYBRANY TRYB</p><h1>${mode.name}</h1><p class="muted">${mode.description}</p><span class="players-count">${icon("users", 17)} ${mode.players}</span>${commerceHint}</div>
      <div class="mode-hero-actions">${wavelengthHint}<button class="icon-btn info-button" id="mode-info" aria-label="Jak grać">i</button><button class="ghost" id="change-mode">Zmień tryb</button></div>
    </section>
    <section class="panel">
      <div class="section-heading"><div><p class="eyebrow">NOWA ROZGRYWKA</p><h2>Stwórz pokój lub dołącz kodem</h2></div><button id="create-room" class="primary">${icon("userPlus", 18)} Stwórz pokój</button></div>
      <div class="row lobby-code-row"><input id="join-code" placeholder="KOD POKOJU" maxlength="6"><input id="join-pass" placeholder="hasło, jeśli prywatny"><button id="join-code-button">Dołącz</button></div>
    </section>
    ${backendNote}
    <section class="panel"><div class="section-heading"><h2>Otwarte pokoje</h2><span class="badge">${modeRooms.length}</span></div>
      <div class="room-grid">${modeRooms.length ? modeRooms.map(room => roomCard(room, mode)).join("") : '<p class="muted">Brak pokoi w tym trybie. Stwórz pierwszy i zaproś ekipę.</p>'}</div>
    </section>
  </main>`;
  if (mode.id === "quiz" && localStorage.getItem("quizTutorialSeen") !== "1") { const hint = document.createElement("span"); hint.className = "quiz-info-hint"; hint.textContent = "Kliknij i, aby poznać zasady"; root.querySelector(".mode-hero-actions")?.prepend(hint); }
  $("#change-mode").addEventListener("click", () => {
    if (typeof actions.goModeCategory === "function") actions.goModeCategory(mode);
    else actions.goPlatform();
  });
  $("#mode-info").addEventListener("click", () => { if (mode.id === "wavelength") localStorage.setItem("wavelengthTutorialSeen", "1"); actions.showGameInfo(mode.id); });
  $("#create-room").addEventListener("click", actions.openCreateRoom);
  $("#join-code-button").addEventListener("click", () => actions.joinByCode($("#join-code").value, $("#join-pass").value));
  root.querySelectorAll("[data-join-room]").forEach(button => button.addEventListener("click", () => actions.joinRoom(button.dataset.joinRoom)));
}

export function createRoomModal(mode, actions) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop room-create-backdrop";
  let roomType = "standard";
  let entryFee = ENTRY_FEE_OPTIONS[0];
  let maxPlayers = mode.maxPlayers;
  const savedPreset = localStorage.getItem("grygrupowe-room-preset");
  let roomPreset = ["quick", "standard", "long"].includes(savedPreset) ? savedPreset : "standard";
  let commerceSettings = normalizeCommerceSettings(mode.id, {}, defaultCommercePreferences());
  const commercePanel = commerceCreationHtml(mode.id, commerceSettings);
  const savedCapacity = Number(localStorage.getItem(`grygrupowe-capacity-${mode.id}`));
  if (savedCapacity >= mode.minPlayers && savedCapacity <= mode.maxPlayers) maxPlayers = savedCapacity;
  let mathematicsVariant = mode.id === "mathematics" ? (mode.defaultSettings?.mathematicsVariant || "single") : "single";
  const presetDetails = () => ({
    quick: estimatePreset(mode, "quick", maxPlayers, { mathematicsVariant }),
    standard: estimatePreset(mode, "standard", maxPlayers, { mathematicsVariant }),
    long: estimatePreset(mode, "long", maxPlayers, { mathematicsVariant }),
  });
  let currentPresetDetails = presetDetails();
  const updatePresetTimes = () => {
    currentPresetDetails = presetDetails();
    backdrop.querySelectorAll("[data-preset]").forEach(option => {
      const time = option.querySelector("[data-preset-time]");
      if (time) time.textContent = currentPresetDetails[option.dataset.preset] || "";
    });
  };
  backdrop.innerHTML = `<section class="modal room-create-modal enter" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-title"><div><p class="eyebrow">${mode.name}</p><h2 id="modal-title">Nowy pokój</h2><p class="room-create-subtitle">Ustaw podstawy i zaproś ekipę.</p></div><button class="icon-btn" data-close>${icon("x", 18)}</button></div>
    <div class="room-create-layout ${commercePanel ? "has-aside" : "is-single"}">
      <div class="room-create-main">
        <div class="room-create-field-grid"><div><label for="room-name">Nazwa pokoju</label><input id="room-name" placeholder="Pokój dla ekipy"></div><div id="room-max-slot"></div></div>
        <fieldset class="room-preset-choice"><legend>SZYBKI PRESET ROZGRYWKI</legend><div class="room-preset-grid">
          <label class="room-preset-option ${roomPreset === "quick" ? "is-selected" : ""}" data-preset="quick"><input type="radio" name="room-preset" value="quick" ${roomPreset === "quick" ? "checked" : ""}><span class="room-preset-icon">⚡</span><span><b>Szybka</b><small data-preset-time>${currentPresetDetails.quick}</small></span></label>
          <label class="room-preset-option ${roomPreset === "standard" ? "is-selected" : ""}" data-preset="standard"><input type="radio" name="room-preset" value="standard" ${roomPreset === "standard" ? "checked" : ""}><span class="room-preset-icon">✦</span><span><b>Standardowa</b><small data-preset-time>${currentPresetDetails.standard}</small></span></label>
          <label class="room-preset-option ${roomPreset === "long" ? "is-selected" : ""}" data-preset="long"><input type="radio" name="room-preset" value="long" ${roomPreset === "long" ? "checked" : ""}><span class="room-preset-icon">🌙</span><span><b>Długa</b><small data-preset-time>${currentPresetDetails.long}</small></span></label>
        </div><p class="tiny room-preset-help">Czas jest orientacyjny i zakłada, że gracze często kończą rundę przed limitem. Dokładne ustawienia zmienisz później w lobby.</p></fieldset>
        <label class="check room-private-row"><input id="room-private" type="checkbox"> Pokój prywatny z hasłem</label><input id="room-password" class="hidden" placeholder="hasło pokoju">
        <fieldset class="room-type-choice"><legend>RODZAJ POKOJU</legend><div class="room-type-grid"><label class="room-type-option is-selected"><input type="radio" name="room-type" value="standard" checked><span><b>● Standard</b><small>Bez wpisowego, nagrody z banku gry.</small></span></label><label class="room-type-option"><input type="radio" name="room-type" value="betting"><span><b>◈ Zakłady</b><small>Wpisowe trafia do wspólnej puli.</small></span></label></div><label id="entry-fee-field" class="hidden">Wpisowe<select id="entry-fee">${ENTRY_FEE_OPTIONS.map(fee => `<option value="${fee}">${fee.toLocaleString("pl-PL")}$</option>`).join("")}</select></label></fieldset>
      </div>
      ${commercePanel ? `<div class="room-create-aside">${commercePanel}</div>` : ""}
    </div>
    <div class="modal-actions"><button class="ghost" data-close>Anuluj</button><button class="primary" id="confirm-create">Stwórz pokój</button></div>
  </section>`;
  const maxPlayersField = document.createElement("label");
  maxPlayersField.className = "room-create-field";
  maxPlayersField.htmlFor = "room-max-players";
  maxPlayersField.textContent = "Liczba graczy";
  const maxPlayersSelect = document.createElement(mode.maxPlayers > 20 ? "input" : "select");
  maxPlayersSelect.id = "room-max-players";
  if (maxPlayersSelect.tagName === "INPUT") {
    maxPlayersSelect.type = "number";
    maxPlayersSelect.min = String(mode.minPlayers);
    maxPlayersSelect.max = String(mode.maxPlayers);
    maxPlayersSelect.value = String(maxPlayers);
    maxPlayersSelect.inputMode = "numeric";
  } else {
    maxPlayersSelect.innerHTML = Array.from({length:Math.max(1,mode.maxPlayers-mode.minPlayers+1)},(_,index)=>mode.minPlayers+index).map(value=>`<option value="${value}" ${value===maxPlayers?"selected":""}>${value} ${value===1?"osoba":"osób"}</option>`).join("");
  }
  maxPlayersField.append(maxPlayersSelect);
  backdrop.querySelector("#room-max-slot").append(maxPlayersField);
  if (mode.id === "mathematics") {
    const variantField = document.createElement("fieldset");
    variantField.className = "mathematics-variant-choice";
    variantField.innerHTML = `<legend>Podtryb matematyki</legend><label class="room-type-option ${mathematicsVariant === "single" ? "is-selected" : ""}"><input type="radio" name="math-variant" value="single" ${mathematicsVariant === "single" ? "checked" : ""}> <span><b>1 PYTANIE NA RAZ</b><small>Wspólne pytanie i wspólny limit czasu.</small></span></label><label class="room-type-option ${mathematicsVariant === "full-test" ? "is-selected" : ""}"><input type="radio" name="math-variant" value="full-test" ${mathematicsVariant === "full-test" ? "checked" : ""}> <span><b>CAŁY TEST</b><small>Każdy gracz rozwiązuje test niezależnie.</small></span></label>`;
    backdrop.querySelector(".room-preset-choice").insertAdjacentElement("afterend", variantField);
    variantField.querySelectorAll("[name='math-variant']").forEach(input => input.addEventListener("change", () => {
      mathematicsVariant = input.value;
      variantField.querySelectorAll(".room-type-option").forEach(item => item.classList.toggle("is-selected", item.querySelector("input")?.checked));
      updatePresetTimes();
    }));
  }
  const close = () => actions.closeModal(backdrop);
  backdrop.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", close));
  $("#room-private", backdrop).addEventListener("change", event => $("#room-password", backdrop).classList.toggle("hidden", !event.target.checked));
  backdrop.querySelectorAll("[name='room-type']").forEach(input => input.addEventListener("change", () => { roomType=input.value; backdrop.querySelectorAll(".room-type-option").forEach(item=>item.classList.toggle("is-selected",item.querySelector("input")?.checked)); backdrop.querySelector("#entry-fee-field").classList.toggle("hidden",roomType!=="betting"); }));
  backdrop.querySelector("#entry-fee").addEventListener("change", event => { entryFee=Number(event.target.value)||ENTRY_FEE_OPTIONS[0]; });
  backdrop.querySelector("#room-max-players")?.addEventListener("change", event => { maxPlayers=Number(event.target.value)||mode.maxPlayers; localStorage.setItem(`grygrupowe-capacity-${mode.id}`, String(maxPlayers)); updatePresetTimes(); });
  backdrop.querySelectorAll("[name='room-preset']").forEach(input => input.addEventListener("change", () => { roomPreset=input.value; backdrop.querySelectorAll(".room-preset-option").forEach(item=>item.classList.toggle("is-selected",item.querySelector("input")?.checked)); localStorage.setItem("grygrupowe-room-preset", roomPreset); }));
  backdrop.querySelectorAll("[data-commerce-setting]").forEach(input => input.addEventListener("change", event => { const key=event.target.dataset.commerceSetting; commerceSettings={...commerceSettings,[key]:event.target.checked}; saveCommercePreferences(commerceSettings); }));
  $("#confirm-create", backdrop).addEventListener("click", async () => {
    const presetSettings = presetSettingsFor(mode, roomPreset, { mathematicsVariant });
    if (await actions.createRoom({ name: $("#room-name", backdrop).value, maxPlayers, isPrivate: $("#room-private", backdrop).checked, password: $("#room-password", backdrop).value, roomType, entryFee, settings: { ...mode.defaultSettings, ...presetSettings, ...commerceSettings } }) !== false) close();
  });
  return backdrop;
}
