import { escapeHtml } from "./utils.js?v=20260822-1";

export const POTION_PACKS = [
  { id:"potion-pack", icon:"🧪", name:"Zestaw potek", price:5000, contents:[{ tier:1, count:10 }, { tier:2, count:5 }, { tier:3, count:3 }], description:"18 losowych potek: 10 z tieru 1, 5 z tieru 2 i 3 z tieru 3." },
  { id:"mega-potion-pack", icon:"🧰", name:"Mega zestaw potek", price:10000, contents:[{ tier:1, count:25 }, { tier:2, count:15 }, { tier:3, count:7 }], description:"47 losowych potek: 25 z tieru 1, 15 z tieru 2 i 7 z tieru 3." },
];

const tierPools = {
  1: ["coins-i", "xp-i"],
  2: ["coins-ii", "xp-ii"],
  3: ["coins-iii", "xp-iii"],
};

export function potionPackById(id) { return POTION_PACKS.find(pack => pack.id === id) || null; }

export function drawPotionPackItems(pack, random = Math.random) {
  return (pack?.contents || []).flatMap(({ tier, count }) => Array.from({ length:count }, () => {
    const pool = tierPools[tier] || tierPools[1];
    return pool[Math.floor(Math.max(0, Math.min(.999999, Number(random()) || 0)) * pool.length)];
  }));
}

export function potionPackShopHtml(profile = {}) {
  const disabled = profile?.nickOnly ? "disabled" : "";
  return `<section class="panel potion-packs-panel ${profile?.nickOnly ? "disabled-shop" : ""}">
    <div class="section-heading"><div><p class="eyebrow">SKLEP W GRZE</p><h2>Zestawy potek</h2></div><span class="badge">2 oferty</span></div>
    <p class="muted">Kup losowe potki hurtowo i odbierz je od razu w swoim ekwipunku.</p>
    <div class="potion-pack-grid">${POTION_PACKS.map(pack => `<article class="potion-pack-card">
      <div class="potion-pack-icon" aria-hidden="true">${pack.icon}</div>
      <div class="potion-pack-copy"><h3>${escapeHtml(pack.name)}</h3><p>${escapeHtml(pack.description)}</p>
        <div class="potion-pack-contents">${pack.contents.map(item => `<span><b>${item.count}×</b> tier ${item.tier}</span>`).join("")}</div>
      </div>
      <div class="potion-pack-buy"><strong>${pack.price.toLocaleString("pl-PL")}$</strong><button class="primary" data-buy-potion-pack="${pack.id}" type="button" ${disabled}>Kup zestaw</button></div>
    </article>`).join("")}</div>
  </section>`;
}
