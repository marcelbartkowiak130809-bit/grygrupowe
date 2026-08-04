import { escapeHtml } from "./utils.js?v=20260613-2";

export const potionEquipment = [
  { id:"luck-i", name:"Luck I", subtitle:"+10% LUCK", slot:"luck", rarity:"common", image:"./assets/equipment/luck-i.jpg" },
  { id:"luck-ii", name:"Luck II", subtitle:"+25% LUCK", slot:"luck", rarity:"rare", image:"./assets/equipment/luck-ii.jpg" },
  { id:"luck-iii", name:"Luck III", subtitle:"+50% LUCK", slot:"luck", rarity:"legendary", image:"./assets/equipment/luck-iii.jpg" },
  { id:"coins-i", name:"Coins I", subtitle:"+10% COINS", slot:"coins", rarity:"common", image:"./assets/equipment/coins-i.jpg" },
  { id:"coins-ii", name:"Coins II", subtitle:"+25% COINS", slot:"coins", rarity:"rare", image:"./assets/equipment/coins-ii.jpg" },
  { id:"coins-iii", name:"Coins III", subtitle:"+50% COINS", slot:"coins", rarity:"legendary", image:"./assets/equipment/coins-iii.jpg" },
  { id:"luck-coins-i", name:"Luck & Coins I", subtitle:"+10% LUCK & COINS", slot:"hybrid", rarity:"common", image:"./assets/equipment/luck-coins-i.jpg" },
  { id:"luck-coins-ii", name:"Luck & Coins II", subtitle:"+25% LUCK & COINS", slot:"hybrid", rarity:"rare", image:"./assets/equipment/luck-coins-ii.jpg" },
  { id:"luck-coins-iii", name:"Luck & Coins III", subtitle:"+50% LUCK & COINS", slot:"hybrid", rarity:"legendary", image:"./assets/equipment/luck-coins-iii.jpg" },
];

export const equipmentPlaceholders = [
  { id:"placeholder-chest", name:"Skrzynie", subtitle:"Losowe dropy", slot:"utility", rarity:"rare", icon:"🧰" },
  { id:"placeholder-relic", name:"Relikty", subtitle:"Efekty kolekcji", slot:"utility", rarity:"epic", icon:"🗿" },
  { id:"placeholder-scroll", name:"Zwoje", subtitle:"Wzmocnienia rundy", slot:"utility", rarity:"legendary", icon:"📜" },
];

export const equipmentItems = [...potionEquipment, ...equipmentPlaceholders];
export const equipmentById = Object.fromEntries(equipmentItems.map(item => [item.id, item]));
export const defaultEquipmentInventory = Object.fromEntries(potionEquipment.map(item => [item.id, true]));
const rarityLabel = { common:"COMMON", rare:"RARE", epic:"EPIC", legendary:"LEGENDARY" };
const slotLabel = { luck:"Luck", coins:"Coins", hybrid:"Luck + Coins", utility:"Wkrótce" };

function itemVisual(item, compact = false) {
  if (item.image) return `<img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy">`;
  return `<span class="equipment-placeholder-icon" aria-hidden="true">${item.icon || "✦"}</span>`;
}

function itemCard(item, profile, onEquip) {
  const owned = Boolean(profile.equipmentInventory?.[item.id]);
  const active = Object.values(profile.selectedEquipment || {}).includes(item.id);
  const disabled = item.placeholder || !owned;
  return `<button class="equipment-card rarity-${item.rarity} ${active ? "is-equipped" : ""} ${disabled ? "is-placeholder" : ""}" data-equipment-id="${item.id}" ${disabled ? "disabled" : ""} type="button">
    <span class="equipment-card-art">${itemVisual(item, true)}</span>
    <span class="equipment-card-copy"><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.subtitle)}</small><em>${active ? "WYPOSAŻONE" : item.placeholder ? "PLACEHOLDER" : rarityLabel[item.rarity]}</em></span>
  </button>`;
}

export function equipmentModal(profile = {}, closeAction, onEquip) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  const selected = profile.selectedEquipment || {};
  modal.innerHTML = `<section class="modal equipment-modal enter" role="dialog" aria-modal="true" aria-labelledby="equipment-title">
    <div class="modal-title"><div><p class="eyebrow">PLECAK</p><h2 id="equipment-title">Twój ekwipunek</h2></div><button class="icon-btn" data-close aria-label="Zamknij">×</button></div>
    <p class="muted equipment-intro">Przedmioty, które możesz nosić przy profilu. Potki są przygotowane jako placeholdery pod przyszłe dropy i boostery.</p>
    <section class="equipment-loadout"><div class="section-heading"><div><p class="eyebrow">AKTYWNE SLOTY</p><h3>Wyposażenie</h3></div><span class="badge">${Object.keys(selected).length}/3</span></div><div class="equipment-slots">${["luck","coins","hybrid"].map(slot => {
      const item = equipmentById[selected[slot]], label = slotLabel[slot];
      return `<div class="equipment-slot ${item ? "has-item" : "empty-slot"}"><span>${item ? itemVisual(item, true) : "＋"}</span><b>${item ? escapeHtml(item.name) : `Slot ${label}`}</b><small>${item ? escapeHtml(item.subtitle) : "Wybierz potkę poniżej"}</small></div>`;
    }).join("")}</div></section>
    <section class="equipment-collection"><div class="section-heading"><div><p class="eyebrow">KOLEKCJA</p><h3>Potki</h3></div><span class="badge">${potionEquipment.length}</span></div><div class="equipment-grid">${potionEquipment.map(item => itemCard(item, profile, onEquip)).join("")}</div></section>
    <section class="equipment-collection equipment-coming-soon"><div class="section-heading"><div><p class="eyebrow">W PRZYGOTOWANIU</p><h3>Więcej przedmiotów</h3></div><span class="badge">${equipmentPlaceholders.length}</span></div><div class="equipment-grid">${equipmentPlaceholders.map(item => itemCard(item, profile, onEquip)).join("")}</div></section>
  </section>`;
  const close = () => closeAction?.(modal);
  modal.querySelector("[data-close]").addEventListener("click", close);
  modal.addEventListener("click", event => { if (event.target === modal) close(); });
  modal.querySelectorAll("[data-equipment-id]").forEach(button => button.addEventListener("click", () => {
    const item = equipmentById[button.dataset.equipmentId];
    if (item && !item.placeholder && profile.equipmentInventory?.[item.id]) { onEquip?.(item); close(); }
  }));
  return modal;
}
