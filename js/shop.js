import { cosmeticPreview, cosmetics, getShopRotation, rarityLabels, sortCosmeticsByRarity } from "./cosmetics.js?v=20260831-2";
import { gamePassShopHtml, hasGamePass } from "./gamePasses.js?v=20260831-1";
import { $, formatClock, icon } from "./utils.js?v=20260822-1";

let shopTimer;
export function stopShopTimer() { clearInterval(shopTimer); shopTimer = null; }
const catalogAnimationsKey = "cosmeticCatalogAnimations";
const catalogAnimationsEnabled = () => localStorage.getItem(catalogAnimationsKey) !== "off";

const equipped = (profile, id) => [
  profile.selectedNickEffect,
  profile.selectedAvatarFrame,
  profile.selectedAura,
  profile.selectedCandySkin,
  profile.selectedBombSkin,
  profile.selectedClockSkin,
  profile.selectedMarkerSkin,
  profile.selectedSequenceSkin,
  profile.selectedIdleAnimation,
  profile.selectedWinAnimation,
  profile.selectedLoseAnimation,
].includes(id);

const groups = [
  { type:"nick", title:"Nicki" },
  { type:"frame", title:"Ramki" },
  { type:"aura", title:"Aury" },
  { type:"idle", title:"Idle" },
  { type:"win", title:"Wygrane" },
  { type:"lose", title:"Przegrane" },
  { type:"candy", title:"Cukierki" },
  { type:"bomb", title:"Bomby" },
  { type:"clock", title:"Zegary" },
  { type:"marker", title:"Markery" },
  { type:"sequence", title:"Pola sekwencji" },
];

const defaultCosmetics = {
  marker:{ id:"defaultMarker", type:"marker", name:"Czarny marker", rarity:"common", description:"Domyślny marker do trybu MARKER.", defaultOnly:true },
  sequence:{ id:"defaultSequence", type:"sequence", name:"Klasyczne pola", rarity:"common", description:"Domyślne pola sekwencji.", defaultOnly:true },
  idle:{ id:"defaultIdle", type:"idle", name:"Zwykłe idle", rarity:"common", description:"Bez dodatkowej animacji idle.", defaultOnly:true },
  win:{ id:"defaultWin", type:"win", name:"Zwykła wygrana", rarity:"common", description:"Bez dodatkowej animacji wygranej.", defaultOnly:true },
  lose:{ id:"defaultLose", type:"lose", name:"Zwykła przegrana", rarity:"common", description:"Bez dodatkowej animacji przegranej.", defaultOnly:true },
};

const defaultSelections = {
  marker:{ key:"selectedMarkerSkin", value:"defaultMarker" },
  sequence:{ key:"selectedSequenceSkin", value:"defaultSequence" },
  idle:{ key:"selectedIdleAnimation", value:"" },
  win:{ key:"selectedWinAnimation", value:"" },
  lose:{ key:"selectedLoseAnimation", value:"" },
};

const rail = (id, content, count, side = "owned") => `<div class="cosmetic-carousel ${count > 7 ? "has-carousel-arrows" : "no-carousel-arrows"} ${side === "catalog" ? "catalog-carousel" : "owned-carousel"}">
  <button class="carousel-arrow" data-scroll-cosmetics="${id}" data-dir="-1" aria-label="Przewin w lewo">‹</button>
  <div class="cosmetic-list cosmetic-rail" id="${id}">${content}</div>
  <button class="carousel-arrow" data-scroll-cosmetics="${id}" data-dir="1" aria-label="Przewin w prawo">›</button>
</div>`;

function cosmeticCard(item, profile, { catalog = false } = {}) {
  const owned = item.defaultOnly || Boolean(profile.ownedCosmetics?.[item.id]);
  const defaultSelection = defaultSelections[item.type];
  const active = item.defaultOnly
    ? Boolean(defaultSelection && (profile[defaultSelection.key] || defaultSelection.value) === defaultSelection.value)
    : equipped(profile, item.id);
  const disabled = catalog ? !owned : false;
  const action = item.defaultOnly ? `data-equip="${item.id}"` : owned ? `data-equip="${item.id}"` : "";
  const label = active ? "ZALOZONE" : owned ? catalog ? "POSIADANY" : rarityLabels[item.rarity] : rarityLabels[item.rarity];
  return `<button ${action} class="owned-cosmetic-card ${catalog ? "catalog-card" : ""} rarity-${item.rarity} ${owned ? "owned-catalog-card" : "locked-catalog-card"} ${active ? "equipped-cosmetic" : ""}" ${disabled ? "disabled" : ""}>
    ${cosmeticPreview(item, profile, { compact:true })}
    <span class="owned-cosmetic-copy"><b>${item.name}</b><small>${label}</small></span>
  </button>`;
}

function groupSection(group, items, profile, idPrefix, options = {}) {
  const base = defaultCosmetics[group.type] ? [defaultCosmetics[group.type]] : [];
  const defaultId = defaultCosmetics[group.type]?.id;
  const filtered = items.filter(item => item.type === group.type && item.id !== defaultId);
  const sorted = [...base, ...sortCosmeticsByRarity(filtered, { rareFirst:idPrefix !== "owned" })];
  const content = sorted.map(item => cosmeticCard(item, profile, options)).join("");
  return `<div class="wardrobe-category">
    <div class="wardrobe-category-title"><h3>${group.title}</h3><span>${sorted.length}</span></div>
    ${rail(`${idPrefix}-${group.type}`, content, sorted.length, idPrefix)}
  </div>`;
}

export function renderShop(root, { profile }, actions) {
  stopShopTimer();
  const premiumRotation = hasGamePass(profile, "premium-rotation");
  const rotation = getShopRotation(undefined, { premium:premiumRotation });
  const animationsOn = catalogAnimationsEnabled();
  const ownedItems = sortCosmeticsByRarity(cosmetics.filter(item => profile.ownedCosmetics?.[item.id]), { rareFirst:true });
  const wardrobeHtml = groups.map(group => groupSection(group, ownedItems, profile, "owned")).join("");
  const catalogHtml = groups.map(group => groupSection(group, cosmetics, profile, "catalog", { catalog:true })).join("");

  root.innerHTML = `<main class="page shop-page enter">
    <section class="panel room-header">
      <div><p class="eyebrow">KOSMETYKI</p><h1>Sklep kosmetyczny</h1><p class="muted">3 przedmioty naraz · wspolna rotacja co 15 minut · nowe za <b id="shop-timer"></b></p></div>
      <div class="modal-actions"><button class="ghost" id="open-catalog">Katalog kosmetykow</button><button class="ghost" id="back-home">Wroc</button></div>
    </section>
    ${profile.nickOnly ? '<section class="warning">Grasz tylko po nicku. Coiny sesyjne i sklep sa wyszarzone. Zaloguj sie na nick + haslo, zeby zapisywac i wydawac.</section>' : ""}
    <section class="shop-grid ${profile.nickOnly ? "disabled-shop" : ""}">${rotation.items.map(item => {
      const owned = profile.ownedCosmetics?.[item.id], active = equipped(profile, item.id);
      return `<article class="shop-item rarity-${item.rarity}">
        <div class="shop-item-head"><span class="rarity">${rarityLabels[item.rarity]}</span>${icon("sparkles", 22)}</div>
        ${cosmeticPreview(item, profile)}
        <h2>${item.name}</h2><p class="muted">${item.description}</p><div class="price">$${item.price}</div>
        <button class="${owned ? "" : "primary"}" data-${owned ? "equip" : "buy"}="${item.id}" ${active ? "disabled" : ""}>${active ? "Zalozone" : owned ? "Zaloz" : "Kup"}</button>
      </article>`;
    }).join("")}</section>
    ${premiumRotation ? `<section class="premium-rotation-panel"><div class="section-heading"><div><p class="eyebrow">✦ PREMIUM ROTACJA</p><h2>Dodatkowe przedmioty</h2></div><span class="badge">3</span></div><p class="muted">Dzięki gamepassowi Premium rotacja masz trzy kolejne, ekskluzywne przedmioty co 15 minut.</p><div class="shop-grid premium-shop-grid">${rotation.premiumItems.map(item => {
      const owned = profile.ownedCosmetics?.[item.id], active = equipped(profile, item.id);
      return `<article class="shop-item premium-shop-item rarity-${item.rarity}">
        <div class="shop-item-head"><span class="rarity">PREMIUM · ${rarityLabels[item.rarity]}</span>${icon("sparkles", 22)}</div>
        ${cosmeticPreview(item, profile)}
        <h2>${item.name}</h2><p class="muted">${item.description}</p><div class="price">$${item.price}</div>
        <button class="${owned ? "" : "primary"}" data-${owned ? "equip" : "buy"}="${item.id}" ${active ? "disabled" : ""}>${active ? "Zalozone" : owned ? "Zaloz" : "Kup"}</button>
      </article>`;
    }).join("")}</div></section>` : ""}
    ${gamePassShopHtml(profile)}
    <section class="panel owned-cosmetics-panel"><div class="section-heading"><div><p class="eyebrow">GARDEROBA</p><h2>Twoje kosmetyki</h2></div><span class="badge">${ownedItems.length}</span></div><p class="muted">Kliknij karte, aby zalozyc efekt. Strzalki pojawiaja sie dopiero gdy w kategorii jest wiecej niz 7 kart.</p>
      <div class="wardrobe-sections">${wardrobeHtml}</div>
    </section>
    <section class="panel owned-cosmetics-panel cosmetic-catalog ${animationsOn ? "" : "catalog-animations-off"}" id="cosmetic-catalog"><div class="section-heading"><div><p class="eyebrow">KATALOG</p><h2>Wszystkie kosmetyki</h2></div><div class="catalog-tools"><button class="catalog-animation-toggle ${animationsOn ? "is-on" : ""}" id="catalog-animation-toggle" type="button" aria-pressed="${animationsOn}"><span></span><b>${animationsOn ? "Animacje wlaczone" : "Animacje wylaczone"}</b></button><span class="badge">${cosmetics.length}</span></div></div><p class="muted">Najrzadsze sa po prawej stronie karuzeli. Posiadany kosmetyk mozesz zalozyc z katalogu.</p>
      <div class="wardrobe-sections">${catalogHtml}</div>
    </section>
  </main>`;

  const updateTimer = () => $("#shop-timer") && ($("#shop-timer").textContent = formatClock(Math.ceil((rotation.endsAt - Date.now()) / 1000)));
  updateTimer();
  shopTimer = setInterval(() => Date.now() >= rotation.endsAt ? actions.refresh() : updateTimer(), 1000);
  $("#back-home").addEventListener("click", actions.goHome);
  $("#open-catalog").addEventListener("click", () => { actions.playSound?.("catalogOpen"); $("#cosmetic-catalog")?.scrollIntoView({ behavior:"smooth", block:"start" }); });
  $("#catalog-animation-toggle")?.addEventListener("click", event => {
    const catalog = $("#cosmetic-catalog", root), enabled = catalog?.classList.toggle("catalog-animations-off") === false;
    localStorage.setItem(catalogAnimationsKey, enabled ? "on" : "off");
    event.currentTarget.classList.toggle("is-on", enabled);
    event.currentTarget.setAttribute("aria-pressed", String(enabled));
    const label = event.currentTarget.querySelector("b");
    if (label) label.textContent = enabled ? "Animacje wlaczone" : "Animacje wylaczone";
  });
  root.querySelectorAll("[data-scroll-cosmetics]").forEach(button => button.addEventListener("click", () => {
    const target = $(`#${button.dataset.scrollCosmetics}`, root);
    const animationsOff = Boolean(target?.closest(".catalog-animations-off"));
    target?.scrollBy({ left:Number(button.dataset.dir) * 520, behavior:animationsOff ? "auto" : "smooth" });
  }));
  root.querySelectorAll("[data-buy]").forEach(button => button.addEventListener("click", () => actions.buyCosmetic(button.dataset.buy)));
  root.querySelectorAll("[data-equip]").forEach(button => button.addEventListener("click", () => { if(!button.classList.contains("equipped-cosmetic")) actions.equipCosmetic(button.dataset.equip); }));
  root.querySelectorAll("[data-buy-gamepass]").forEach(button => button.addEventListener("click", () => actions.buyGamePass(button.dataset.buyGamepass)));
  root.querySelectorAll("[data-upgrade-gamepass]").forEach(button => button.addEventListener("click", () => actions.upgradeGamePass(button.dataset.upgradeGamepass)));
}
