import { cosmeticPreview, cosmetics, getShopRotation, rarityLabels } from "./cosmetics.js?v=20260602-8";
import { $, formatClock, icon } from "./utils.js";

let shopTimer;
export function stopShopTimer() { clearInterval(shopTimer); shopTimer = null; }
const equipped = (profile, id) => [profile.selectedNickEffect, profile.selectedAvatarFrame, profile.selectedAura].includes(id);

export function renderShop(root, { profile }, actions) {
  stopShopTimer();
  const rotation = getShopRotation();
  const ownedItems = cosmetics.filter(item => profile.ownedCosmetics[item.id]);
  const wardrobeGroups = [
    { type:"nick", title:"Nicki" },
    { type:"frame", title:"Ramki" },
    { type:"aura", title:"Aury" },
  ];
  const wardrobeHtml = wardrobeGroups.map(group => {
    const items = ownedItems.filter(item => item.type === group.type);
    return `<div class="wardrobe-category"><div class="wardrobe-category-title"><h3>${group.title}</h3><span>${items.length}</span></div><div class="cosmetic-list">${items.map(item => {
      const active=equipped(profile,item.id);
      return `<button data-equip="${item.id}" class="owned-cosmetic-card rarity-${item.rarity} ${active?"equipped-cosmetic":""}" ${active ? "disabled" : ""}>
        ${cosmeticPreview(item,profile,{compact:true})}
        <span class="owned-cosmetic-copy"><b>${item.name}</b><small>${active?"ZAŁOŻONE":rarityLabels[item.rarity]}</small></span>
      </button>`;
    }).join("") || '<p class="muted">Brak kosmetyków w tej kategorii.</p>'}</div></div>`;
  }).join("");
  root.innerHTML = `<main class="page shop-page enter">
    <section class="panel room-header">
      <div><p class="eyebrow">KOSMETYKI</p><h1>Sklep kosmetyczny</h1><p class="muted">3 przedmioty naraz · wspólna rotacja co 15 minut · nowe za <b id="shop-timer"></b></p></div>
      <button class="ghost" id="back-home">Wróć</button>
    </section>
    ${profile.nickOnly ? '<section class="warning">Grasz tylko po nicku. Coiny sesyjne i sklep są wyszarzone. Zaloguj się na nick + hasło, żeby zapisywać i wydawać.</section>' : ""}
    <section class="shop-grid ${profile.nickOnly ? "disabled-shop" : ""}">${rotation.items.map(item => {
      const owned = profile.ownedCosmetics[item.id], active = equipped(profile, item.id);
      return `<article class="shop-item rarity-${item.rarity}">
        <div class="shop-item-head"><span class="rarity">${rarityLabels[item.rarity]}</span>${icon("sparkles", 22)}</div>
        ${cosmeticPreview(item, profile)}
        <h2>${item.name}</h2><p class="muted">${item.description}</p><div class="price">$${item.price}</div>
        <button class="${owned ? "" : "primary"}" data-${owned ? "equip" : "buy"}="${item.id}" ${active ? "disabled" : ""}>${active ? "Założone" : owned ? "Załóż" : "Kup"}</button>
      </article>`;
    }).join("")}</section>
    <section class="panel owned-cosmetics-panel"><div class="section-heading"><div><p class="eyebrow">GARDEROBA</p><h2>Twoje kosmetyki</h2></div><span class="badge">${ownedItems.length}</span></div><p class="muted">Każdy efekt zobaczysz dokładnie tak, jak wygląda przy graczu. Kliknij kartę, aby go założyć.</p>
      <div class="wardrobe-sections">${wardrobeHtml}</div>
    </section>
  </main>`;
  const updateTimer = () => $("#shop-timer") && ($("#shop-timer").textContent = formatClock(Math.ceil((rotation.endsAt - Date.now()) / 1000)));
  updateTimer();
  shopTimer = setInterval(() => Date.now() >= rotation.endsAt ? actions.refresh() : updateTimer(), 1000);
  $("#back-home").addEventListener("click", actions.goHome);
  root.querySelectorAll("[data-buy]").forEach(button => button.addEventListener("click", () => actions.buyCosmetic(button.dataset.buy)));
  root.querySelectorAll("[data-equip]").forEach(button => button.addEventListener("click", () => actions.equipCosmetic(button.dataset.equip)));
}
