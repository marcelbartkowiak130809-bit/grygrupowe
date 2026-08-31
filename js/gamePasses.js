import { escapeHtml } from "./utils.js?v=20260822-1";

const money = value => `${Number(value || 0).toLocaleString("pl-PL")}$`;

export const GAMEPASS_DEFINITIONS = [
  { id:"premium-rotation", icon:"✦", name:"Premium rotacja", price:10000, scope:"ogólny", description:"Odblokowuje trzy dodatkowe, premium przedmioty w sklepie co 15 minut." },
  { id:"impostor-compensation", icon:"🛡️", name:"Rekompensata", price:10000, scope:"Impostor", maxLevel:5, upgradePrices:[4000,5000,6000,7000], description:"Gdy dwóch graczy kupi tę samą rolę, przegrany losowania odzyskuje część ceny zakupu." },
  { id:"identity-insight", icon:"🔍", name:"Wzrok detektywa", price:9000, scope:"Kim jestem?", description:"Raz na rundę pokazuje jedną literę własnego hasła za darmo." },
  { id:"number-oracle", icon:"🔢", name:"Wyrocznia liczb", price:8500, scope:"Tajemnicza liczba", description:"Daje dwie szerokie, nieprecyzyjne podpowiedzi o twoim numerze w jednej grze." },
  { id:"wavelength-pro", icon:"🌈", name:"Wavelength Pro", price:9500, scope:"Wavelength", description:"Raz na rundę pokazuje szeroki, nieprecyzyjny zakres celu — nigdy dokładnego miejsca." },
  { id:"pokemon-scout", icon:"🧬", name:"Skaner Pokédex", price:12000, scope:"Pokémon", description:"Raz na rundę pokazuje małą, bezpieczną wskazówkę do zadania Pokémon." },
  { id:"survivor-charm", icon:"🍀", name:"Amulet przetrwania", price:11000, scope:"Zatruty cukierek", description:"Raz w grze absorbuje trafienie tylko przy realnym ryzyku utraty wszystkich żyć; nie działa przy 1 życiu." },
  { id:"creative-license", icon:"💡", name:"Licencja kreatywności", price:7500, scope:"Tryby kreatywne", description:"Raz w grze pozwala poprawić własną odpowiedź; w Tajnej zasadzie odblokowuje wcześniejsze zgadywanie." },
  { id:"wavelength-second-chance", icon:"↺", name:"Drugi pomiar", price:7000, scope:"Wavelength", description:"Raz na grę po pierwszym nietrafionym pomiarze pokazuje tylko kierunek celu i daje drugi pomiar." },
  { id:"proof-last-chance", icon:"⏳", name:"Ostatnia szansa", price:6500, scope:"Udowodnij", description:"Raz na grę po skończeniu czasu odpowiedzi dodaje 8 sekund na ostatnią próbę." },
  { id:"clock-second-chance-pass", icon:"⏱️", name:"Drugi pomiar", price:7000, scope:"Zegar", description:"Raz na grę pozwala wykonać drugi pomiar i zachowuje bliższy wynik." },
];

export const IN_GAME_PURCHASES = [
  { id:"impostor-role", mode:"impostor", icon:"🎭", name:"Wybór roli", price:3000, visibility:"private", description:"Jednorazowo wybierz dostępną rolę przed ujawnieniem. Inni gracze nie widzą zakupu." },
  { id:"identity-letter", mode:"kim-jestem", icon:"🔤", name:"Jedna litera", price:500, visibility:"private", description:"Ujawnia jedną literę twojego ukrytego hasła." },
  { id:"number-hint", mode:"number-mystery", icon:"🔢", name:"Wskazówka numeru", price:500, visibility:"private", description:"Ujawnia, czy twój numer jest większy czy mniejszy od połowy zakresu." },
  { id:"wavelength-nudge", mode:"wavelength", icon:"🎯", name:"Delikatne naprowadzenie", price:1200, visibility:"private", description:"Przesuwa własny wskaźnik o kilka procent w stronę najlepszego wyniku." },
  { id:"clock-second-chance", mode:"zegar", icon:"⏱️", name:"Druga wskazówka", price:1000, visibility:"private", description:"Pozwala raz zatrzymać zegar ponownie, jeśli pierwszy stop był nietrafiony." },
  { id:"marker-scan", mode:"marker", icon:"🖍️", name:"Skan planszy", price:900, visibility:"private", description:"Podświetla przez chwilę obszar, w którym znajduje się szukana liczba." },
  { id:"candy-shield", mode:"zatruty-cukierek", icon:"🍬", name:"Tarcza cukierka", price:1800, visibility:"private", description:"Chroni przed jednym zatruciem w tej grze." },
  { id:"auction-credit", mode:"pokemon-auction", icon:"💰", name:"Kredyt aukcyjny", price:2200, visibility:"private", description:"Dodaje jednorazowy limit do jednej wybranej licytacji." },
  { id:"ranking-lock", mode:"ranking", icon:"🔒", name:"Blokada rankingu", price:1000, visibility:"private", description:"Zabezpiecza jedną pozycję przed przypadkowym przesunięciem." },
  { id:"unique-life", mode:"unique-answer", icon:"❤️", name:"Dodatkowe życie", price:1500, visibility:"public", description:"Dodaje jedno życie. Wszyscy widzą, że użyto zakupu." },
  { id:"connect-double-vote", mode:"polacz-nas", icon:"🔗", name:"Podwójny głos", price:1200, visibility:"public", description:"Twój głos liczy się podwójnie w jednej rundzie." },
  { id:"liar-alibi", mode:"klamca", icon:"🃏", name:"Fałszywy trop", price:1800, visibility:"private", description:"Raz pozwala wysłać dodatkową odpowiedź lub zmienić własną przed głosowaniem." },
  { id:"false-message-redraft", mode:"falszywa-wiadomosc", icon:"📱", name:"Druga wersja", price:1400, visibility:"private", description:"Pozwala poprawić wiadomość przed wyborem bohatera." },
  { id:"secret-rule-example", mode:"tajna-zasada", icon:"🧠", name:"Przykład testowy", price:1400, visibility:"private", description:"Dodaje jeden bezpieczny przykład do sprawdzania zasady przeciwnika." },
];

export function passesForMode(modeId) {
  return GAMEPASS_DEFINITIONS.filter(item => item.scope === "ogólny" || item.scope.toLocaleLowerCase("pl-PL").includes(String(modeId || "").replaceAll("-", " ")) || (modeId === "impostor" && item.id === "impostor-compensation") || (modeId === "kim-jestem" && item.id === "identity-insight") || (modeId === "number-mystery" && item.id === "number-oracle") || (modeId === "wavelength" && item.id === "wavelength-pro") || (String(modeId || "").startsWith("pokemon-") && item.id === "pokemon-scout") || (modeId === "zatruty-cukierek" && item.id === "survivor-charm") || (["polacz-nas","klamca","falszywa-wiadomosc","tajna-zasada"].includes(modeId) && item.id === "creative-license"));
}

export function purchasesForMode(modeId) {
  return IN_GAME_PURCHASES.filter(item => item.mode === modeId || (modeId === "pokemon-auction" && item.mode === "pokemon-auction"));
}

export function commerceAvailable(modeId) {
  return { passes:passesForMode(modeId), purchases:purchasesForMode(modeId) };
}

export function gamePassLevel(profile, id) {
  const value = profile?.gamePasses?.[id];
  return typeof value === "object" ? Math.max(0, Number(value.level) || 0) : value ? Math.max(1, Number(value) || 1) : 0;
}

export function hasGamePass(profile, id, level = 1) { return gamePassLevel(profile, id) >= level; }

export function gamePassState(profile, item) {
  const level = gamePassLevel(profile, item.id);
  const max = Number(item.maxLevel) || 1;
  const nextPrice = level ? item.upgradePrices?.[level - 1] : item.price;
  return { level, max, owned:level > 0, complete:level >= max, nextPrice:Number(nextPrice || 0) };
}

export function defaultCommercePreferences() {
  return {
    gamePurchases:localStorage.getItem("grygrupowe-game-purchases") !== "off",
    gamePassesEnabled:localStorage.getItem("grygrupowe-gamepasses") !== "off",
  };
}

export function saveCommercePreferences(next = {}) {
  if (typeof next.gamePurchases === "boolean") localStorage.setItem("grygrupowe-game-purchases", next.gamePurchases ? "on" : "off");
  if (typeof next.gamePassesEnabled === "boolean") localStorage.setItem("grygrupowe-gamepasses", next.gamePassesEnabled ? "on" : "off");
}

export function normalizeCommerceSettings(modeId, settings = {}, preferences = defaultCommercePreferences()) {
  const available = commerceAvailable(modeId);
  return {
    ...settings,
    gamePurchases:available.purchases.length ? settings.gamePurchases !== false && preferences.gamePurchases !== false : false,
    gamePassesEnabled:available.passes.length ? settings.gamePassesEnabled !== false && preferences.gamePassesEnabled !== false : false,
  };
}

export function roomCommerceSettings(modeId, settings = {}) {
  const available = commerceAvailable(modeId);
  return {
    ...settings,
    gamePurchases:available.purchases.length ? settings.gamePurchases !== false : false,
    gamePassesEnabled:available.passes.length ? settings.gamePassesEnabled !== false : false,
  };
}

function commerceList(items) {
  return items.length ? `<div class="commerce-available-list">${items.map(item => `<span class="commerce-chip" data-commerce-tooltip="${escapeHtml(`${item.icon} ${item.name} — ${item.description}`)}"><b>${item.icon}</b>${escapeHtml(item.name)}<small>${money(item.price)}</small></span>`).join("")}</div>` : "";
}

export function commerceCreationHtml(modeId, settings = {}, options = {}) {
  const available = commerceAvailable(modeId), prefs = options.preferences || defaultCommercePreferences(), normalized = normalizeCommerceSettings(modeId, settings, prefs), disabled = options.disabled ? "disabled" : "";
  if (!available.passes.length && !available.purchases.length) return "";
  return `<section class="commerce-setup" data-commerce-setup><div class="commerce-setup-head"><div><p class="eyebrow">DODATKI DO GRY</p><b>Zakupy i gamepassy</b></div><span class="commerce-setup-mark">$</span></div><p class="tiny">Host decyduje przed utworzeniem pokoju. Po starcie ustawienia są zablokowane.</p>${available.purchases.length ? `<label class="commerce-toggle"><span><b>🛒 Zakupy w grze</b><small>Jednorazowe dodatki kupowane podczas rozgrywki.</small></span><input data-commerce-setting="gamePurchases" type="checkbox" ${normalized.gamePurchases ? "checked" : ""} ${disabled}></label>${commerceList(available.purchases)}` : ""}${available.passes.length ? `<label class="commerce-toggle"><span><b>✦ Gamepassy</b><small>Stałe ulepszenia konta działające w tym trybie.</small></span><input data-commerce-setting="gamePassesEnabled" type="checkbox" ${normalized.gamePassesEnabled ? "checked" : ""} ${disabled}></label>${commerceList(available.passes)}` : ""}</section>`;
}

export function commerceSummaryHtml(modeId, settings = {}, options = {}) {
  const available = commerceAvailable(modeId), normalized = roomCommerceSettings(modeId, settings), details = [];
  if (available.purchases.length) details.push(`Zakupy w grze: ${normalized.gamePurchases ? "włączone" : "wyłączone"}`);
  if (available.passes.length) details.push(`Gamepassy: ${normalized.gamePassesEnabled ? "włączone" : "wyłączone"}`);
  if (!details.length) return "";
  return `<div class="commerce-summary ${options.compact ? "is-compact" : ""}"><span>✦ Dodatki pokoju</span><b>${details.join(" · ")}</b>${options.readOnly ? "<small>Zmiana wymaga utworzenia nowego pokoju.</small>" : ""}</div>`;
}

export function gamePassShopHtml(profile) {
  return `<section class="panel gamepass-shop-panel ${profile?.nickOnly ? "disabled-shop" : ""}"><div class="section-heading"><div><p class="eyebrow">PREMIUM</p><h2>Gamepassy i dodatki</h2></div><span class="badge">${GAMEPASS_DEFINITIONS.length}</span></div><p class="muted">Stałe ulepszenia kupujesz raz. Poziomy rekompensaty rozwijają się kropkami.</p><div class="gamepass-grid">${GAMEPASS_DEFINITIONS.map(item => { const state = gamePassState(profile, item), action = state.complete ? "" : state.owned ? "upgrade-gamepass" : "buy-gamepass"; return `<article class="gamepass-card ${state.owned ? "is-owned" : ""} ${state.complete ? "is-complete" : ""}"><div class="gamepass-card-head"><span class="gamepass-icon">${item.icon}</span><span class="gamepass-scope">${escapeHtml(item.scope)}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p>${item.maxLevel ? `<div class="gamepass-levels" aria-label="Poziom ${state.level} z ${state.max}">${Array.from({length:item.maxLevel}, (_, index) => `<i class="${index < state.level ? "filled" : ""}" title="Poziom ${index + 1}"></i>`).join("")}</div><small class="gamepass-level-label">Poziom ${state.level}/${state.max}${state.complete ? " · MAX" : ""}</small>` : ""}<div class="gamepass-buy-row"><strong>${state.complete ? "MAX" : money(state.nextPrice)}</strong><button class="${state.complete ? "ghost" : "primary"}" ${action ? `data-${action}="${item.id}"` : "disabled"}>${state.complete ? "Odblokowany" : state.owned ? "Ulepsz" : "Kup"}</button></div></article>`; }).join("")}</div></section>`;
}

export function gamePassById(id) { return GAMEPASS_DEFINITIONS.find(item => item.id === id) || null; }
export function inGamePurchaseById(id) { return IN_GAME_PURCHASES.find(item => item.id === id) || null; }
export function modeHasCommerce(modeId) { const available = commerceAvailable(modeId); return Boolean(available.passes.length || available.purchases.length); }
