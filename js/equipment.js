import { escapeHtml } from "./utils.js?v=20260822-1";

export const potionEquipment = [
  { id:"coins-i", name:"Coins I", subtitle:"+10% monet · 5 min", effect:"coins", multiplier:1.10, durationMs:5*60*1000, rarity:"common", image:"./assets/equipment/coins-i.png" },
  { id:"coins-ii", name:"Coins II", subtitle:"+25% monet · 10 min", effect:"coins", multiplier:1.25, durationMs:10*60*1000, rarity:"rare", image:"./assets/equipment/coins-ii.png" },
  { id:"coins-iii", name:"Coins III", subtitle:"+50% monet · 20 min", effect:"coins", multiplier:1.50, durationMs:20*60*1000, rarity:"legendary", image:"./assets/equipment/coins-iii.png" },
  { id:"xp-i", name:"XP I", subtitle:"+10% XP · 5 min", effect:"xp", multiplier:1.10, durationMs:5*60*1000, rarity:"common", image:"./assets/equipment/xp-i.png" },
  { id:"xp-ii", name:"XP II", subtitle:"+25% XP · 10 min", effect:"xp", multiplier:1.25, durationMs:10*60*1000, rarity:"rare", image:"./assets/equipment/xp-ii.png" },
  { id:"xp-iii", name:"XP III", subtitle:"+50% XP · 20 min", effect:"xp", multiplier:1.50, durationMs:20*60*1000, rarity:"legendary", image:"./assets/equipment/xp-iii.png" },
];

export const equipmentItems = potionEquipment;
export const equipmentById = Object.fromEntries(equipmentItems.map(item => [item.id, item]));
export const defaultEquipmentInventory = {};
const rarityLabel = { common:"SŁABA", rare:"ŚREDNIA", legendary:"MOCNA" };

function itemVisual(item) {
  return `<img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy">`;
}

function activeBoost(profile, item) {
  const keys = [item.effect === "xp" ? "xpBooster" : "coinBooster"];
  return keys.some(key => Number(profile[key]?.expiresAt) > Date.now());
}

function itemCard(item, profile, onUse) {
  const quantity = Math.max(0, Number(profile.potionInventory?.[item.id]) || 0);
  const active = activeBoost(profile, item);
  return `<article class="equipment-card rarity-${item.rarity} ${quantity ? "is-owned" : "is-locked"}">
    <span class="equipment-card-art">${itemVisual(item)}</span>
    <span class="equipment-card-copy"><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.subtitle)}</small><em>${rarityLabel[item.rarity]} · ${quantity} szt.</em></span>
    <button class="secondary potion-use-button" data-potion-id="${item.id}" type="button" ${quantity ? "" : "disabled"}>${active ? "Aktywna" : "Użyj"}</button>
  </article>`;
}

export function equipmentModal(profile = {}, closeAction, onUse) {
  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  const ownedPotions = potionEquipment.filter(item => (Number(profile.potionInventory?.[item.id]) || 0) > 0);
  const boosts = [
    ["coinBooster", "🪙 Monety"], ["xpBooster", "⭐ XP"],
  ].filter(([key]) => Number(profile[key]?.expiresAt) > Date.now());
  modal.innerHTML = `<section class="modal equipment-modal enter" role="dialog" aria-modal="true" aria-labelledby="equipment-title">
    <div class="modal-title"><div><p class="eyebrow">PLECAK</p><h2 id="equipment-title">Twój ekwipunek</h2></div><button class="icon-btn" data-close aria-label="Zamknij">×</button></div>
    <p class="muted equipment-intro">Potki zdobywasz z codziennego koła. Użyj ich, aby aktywować czasowy boost — lepsza potka działa mocniej i dłużej.</p>
    <section class="equipment-loadout"><div class="section-heading"><div><p class="eyebrow">AKTYWNE BOOSTY</p><h3>Teraz działają</h3></div><span class="badge">${boosts.length}</span></div><div class="active-boost-list">${boosts.length ? boosts.map(([key,label]) => `<span class="active-boost"><b>${label}</b><small>Pozostało ${Math.max(0, Math.ceil((Number(profile[key].expiresAt)-Date.now())/60000))} min</small></span>`).join("") : `<p class="muted">Nie masz teraz aktywnych boostów.</p>`}</div></section>
    <section class="equipment-collection"><div class="section-heading"><div><p class="eyebrow">KOLEKCJA POTEK</p><h3>Potki</h3></div><span class="badge">${Object.values(profile.potionInventory || {}).reduce((sum, value) => sum + (Number(value) || 0), 0)} szt.</span></div>${ownedPotions.length ? `<div class="equipment-grid">${ownedPotions.map(item => itemCard(item, profile, onUse)).join("")}</div>` : `<div class="empty-equipment-state"><span>🎒</span><b>Ekwipunek jest pusty</b><small>Zdobywaj potki, kręcąc codziennym Lucky Spin.</small></div>`}</section>
  </section>`;
  const close = () => closeAction?.(modal);
  modal.querySelector("[data-close]").addEventListener("click", close);
  modal.addEventListener("click", event => { if (event.target === modal) close(); });
  modal.querySelectorAll("[data-potion-id]").forEach(button => button.addEventListener("click", async () => {
    button.disabled = true;
    const result = await onUse?.(button.dataset.potionId);
    if (!result?.ok) button.disabled = false;
    else close();
  }));
  return modal;
}
