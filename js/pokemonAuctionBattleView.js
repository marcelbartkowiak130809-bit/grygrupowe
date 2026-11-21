import { escapeHtml } from "./utils.js?v=20261121-8";
import { patchRoomView } from "./roomViewPatch.js?v=20261119-15";
import { hasGamePass, pokemonBattleScoutPass } from "./gamePasses.js?v=20261121-8";
import { auctionBattleDamage, auctionBattleDefaults, auctionBattlePokemon, battleEvolutionsUsed, battleHasUnits, battleSignature, battleSignatureEffectiveness, battleSlots, battleSurrendered, battleTeam, battleUpgradeUsed } from "./pokemonAuctionBattle.js?v=20261121-3";

const views = new WeakMap();
const name = pokemon => pokemon.name.replace(/(^|[- ])([a-z])/g, (_, separator, letter) => separator + letter.toUpperCase());
const formClass = kind => kind && kind !== "evolve" ? `is-${kind}` : "";
const nickname = (accounts, uid) => escapeHtml(accounts[uid]?.nick || "Gracz");
const sprite = pokemon => `<img class="battle-sprite" src="${pokemon.sprite}" alt="${escapeHtml(name(pokemon))}" draggable="false" onerror="this.onerror=null;this.src='${pokemon.spriteFallback}'">`;
const chips = pokemon => pokemon.types.map(type =>
  `<img class="battle-type" src="/assets/pokemon/types/${type}.svg" alt="${type}" title="${type}">`
).join("");

function stats(pokemon) {
  const s = pokemon.stats;
  return `ATK ${s.attack} · DEF ${s.defense} · Sp. ATK ${s.specialAttack} · Sp. DEF ${s.specialDefense} · SPD ${s.speed}`;
}

function unitArt(unit, pokemon) {
  return `<div class="battle-unit-art">${sprite(pokemon)}</div>
    <b>${escapeHtml(name(pokemon))}</b><div class="battle-types">${chips(pokemon)}</div>
    <div class="battle-hp" aria-hidden="true"><i style="width:${Math.max(0, unit.hp/unit.maxHp*100)}%"></i></div>
    <small>${unit.hp} / ${unit.maxHp} HP</small>`;
}

function prepMarkup(game, accounts, uid, players, timer) {
  const team = battleTeam(game, uid);
  const ready = game.battle.prep?.[uid] || {};
  const budget = Number(game.budgets?.[uid] || 0);
  const {freeEvolutions, megaEnabled, megaPrice} = game.battleRules || auctionBattleDefaults;
  const evolutionsLeft = Math.max(0, freeEvolutions - battleEvolutionsUsed(ready));
  const upgradeUsed = battleUpgradeUsed(ready);
  const species = team.map(unit => auctionBattlePokemon(unit.id));
  let evolutionStatus = `Darmowe ewolucje · ${evolutionsLeft}/${freeEvolutions}`;
  if (!freeEvolutions) evolutionStatus = "Darmowe ewolucje wyłączone";
  else if (!evolutionsLeft) evolutionStatus = "Limit darmowych ewolucji wykorzystany";
  else if (!species.some(pokemon => pokemon.evolutions.length)) evolutionStatus = "Brak Pokémonów do ewolucji";
  const upgradePrice = megaPrice ? `${megaPrice}$` : "za darmo";
  let upgradeStatus = `1 Mega lub zmiana formy · ${upgradePrice}`;
  if (!megaEnabled) upgradeStatus = "Mega i zmiany formy wyłączone";
  else if (upgradeUsed) upgradeStatus = "Wspólny limit Mega i zmiany formy wykorzystany";
  else if (!species.some(pokemon => pokemon.megas.length || pokemon.forms.length)) upgradeStatus = "Brak dostępnej Megaewolucji lub zmiany formy";
  else if (budget < megaPrice) upgradeStatus = `Do Mega lub zmiany formy brakuje ${megaPrice - budget}$`;
  const cards = battleSlots(game,uid).map((slot,position) => {
    const unit = team[slot];
    const pokemon = species[slot];
    const choices = (kind, ids) => {
      const paid = kind !== "evolve";
      if (paid ? !megaEnabled : !freeEvolutions) return "";
      const disabled = ready.ready || (paid ? upgradeUsed || budget < megaPrice : !evolutionsLeft);
      return ids.map(id => `<button type="button" class="ghost" data-battle-upgrade="${kind}" data-slot="${slot}" data-evolution="${id}" ${disabled ? "disabled" : ""}>
        ${kind === "form" ? "Zmień formę na " : paid ? "" : "Ewoluuj w "}${escapeHtml(name(auctionBattlePokemon(id)))}${paid ? ` · ${upgradePrice}` : ""}
      </button>`).join("");
    };
    return `<article class="battle-unit ${formClass(pokemon.formKind)}" data-battle-prep-slot="${slot}">
      <div class="battle-order"><span>${position===0?"1 · Prowadzący":position+1}</span>
      <button type="button" class="ghost" data-battle-reorder="-1" data-slot="${slot}" aria-label="Przesuń ${escapeHtml(name(pokemon))} wcześniej" ${position===0||ready.ready?"disabled":""}>←</button>
      <button type="button" class="ghost" data-battle-reorder="1" data-slot="${slot}" aria-label="Przesuń ${escapeHtml(name(pokemon))} później" ${position===team.length-1||ready.ready?"disabled":""}>→</button></div>
      ${unitArt(unit,pokemon)}<small>${stats(pokemon)}</small>
      <div class="battle-upgrades">${choices("evolve",pokemon.evolutions)}${choices("mega",pokemon.megas)}${choices("form",pokemon.forms)}</div></article>`;
  });
  return `<section class="panel pokemon-panel auction-battle-panel" id="auction-preparation">
    <header class="battle-heading"><div><p class="eyebrow">LICYTACJA TEAMU · PRZYGOTOWANIE</p><h1>Przygotuj drużynę</h1></div>${timer}</header>
    ${team.length ? `<div class="battle-prep-info"><strong>Budżet aukcji ${budget}$</strong><span>${evolutionStatus} · ${upgradeStatus}</span></div>` : ""}
    <p class="muted">Ustaw kolejność strzałkami. Szybkość prowadzącego decyduje, kto rozpoczyna bitwę.</p>
    <div class="battle-prep-team">${cards.join("") || "<p>Nie masz Pokémonów w składzie. Możesz obserwować bitwę.</p>"}</div>
    <footer class="battle-footer"><button class="primary" type="button" data-battle-ready ${!team.length||ready.ready?"disabled":""}>${ready.ready?"Drużyna gotowa":"Gotowe do bitwy"}</button>
    <span class="muted">${players.filter(id=>battleTeam(game,id).length).map(id=>`${nickname(accounts,id)} ${game.battle.prep?.[id]?.ready?"✓":"…" }`).join(" · ")}</span></footer>
  </section>`;
}

function battleMarkup(game, accounts, uid, players, timer, selection) {
  const {activeUid,last,turn} = game.battle;
  const canAttack = activeUid===uid && game.phase==="auction-battle";
  const attacker = battleTeam(game,uid)[selection.slot], target = battleTeam(game,selection.targetUid)[selection.targetSlot];
  const pokemon = auctionBattlePokemon(attacker?.id);
  const ownsMatchups = hasGamePass(accounts[uid], pokemonBattleScoutPass);
  const showMatchups = canAttack && attacker?.hp > 0 && !attacker.signatureSpent && ownsMatchups;
  const teams = players.map(player => `<section class="battle-team ${player===activeUid?"is-active":""}">
    <h2>${player===uid?"Twój team":nickname(accounts,player)}${battleSurrendered(game,player)?' <small>· Poddanie</small>':""}</h2>
    <div class="battle-party">${battleSlots(game,player).map(slot=>{
      const unit = battleTeam(game,player)[slot];
      const selected = player===uid ? slot===selection.slot : player===selection.targetUid && slot===selection.targetSlot;
      const species = auctionBattlePokemon(unit.id);
      const factor = showMatchups && player!==uid && unit.hp>0 ? battleSignatureEffectiveness(attacker,unit) : 0;
      const matchup = factor>1 ? "super" : factor===1 ? "effective" : "";
      const badge = player!==uid && ownsMatchups ? `<small class="battle-matchup-label"${matchup ? "" : ' aria-hidden="true"'}>${matchup==="super" ? `×${factor} Super` : matchup ? "×1 Skuteczny" : "&nbsp;"}</small>` : "";
      return `<button type="button" class="battle-unit ${formClass(species.formKind)} ${unit.hp===0?"is-out":""}" data-battle-player="${escapeHtml(player)}" data-slot="${slot}" ${matchup ? `data-battle-matchup="${matchup}"` : ""} aria-pressed="${selected}" title="${stats(species)}" ${!canAttack||unit.hp===0?"disabled":""}>${unitArt(unit,species)}${badge}</button>`;
    }).join("")||'<span class="muted">Pusty skład</span>'}</div></section>`);
  const moveButton = (kind,label,spent=false) => {
    const available = canAttack && attacker?.hp > 0 && target?.hp > 0 && !spent;
    let note = spent ? "<small>Odnowisz zwykłym atakiem</small>" : "";
    if (!spent && game.battleRules?.showDamagePreview === true && canAttack) {
      const hit = available ? auctionBattleDamage(attacker,target,kind) : null;
      const preview = !hit ? (attacker?.hp ? "Wybierz cel" : "Wybierz Pokémona")
        : hit.copies ? "Kopiuje formę lub ruch" : hit.factor === 0 ? "Brak efektu" : `−${hit.damage} HP`;
      note = `<small data-damage-preview>${preview}</small>`;
    }
    return `<button type="button" class="${kind==="signature"?"primary":"ghost"}" data-battle-move="${kind}" ${available?"":"disabled"}>
     <span>${escapeHtml(label)}</span>${note}
    </button>`;
  };
  const event = last ? `<p class="battle-event" role="status"><b>${escapeHtml(last.name)}</b> · ${last.copies?(last.name==="Transform"?"skopiowano formę":"skopiowano ruch"):last.damage?`−${last.damage} HP`:"brak efektu"}${last.knockedOut?" · nokaut":""}${last.factor>1?" · super skuteczny":last.factor>0&&last.factor<1?" · mało skuteczny":""}</p>` : '<p class="battle-event" role="status"></p>';
  return `<section class="panel pokemon-panel auction-battle-panel" id="auction-fight">
    <header class="battle-heading"><div><p class="eyebrow">BITWA POKÉMON · TURA ${turn}</p><h1>${game.phase==="auction-hit"?"Atak w toku":canAttack?"Twój ruch":`Tura gracza ${nickname(accounts,activeUid)}`}</h1></div>${timer}</header>
    ${event}<div class="battle-arena">${teams.join("")}</div>
    <div class="battle-move-row"><p class="muted">${pokemon?`${escapeHtml(name(pokemon))} · ${stats(pokemon)}`:"Wybierz Pokémona ze swojego teamu, potem cel u rywala."}</p>
    <div>${moveButton("basic","Uderzenie")}${moveButton("signature",attacker?battleSignature(attacker)[0]:"Atak specjalny",attacker?.signatureSpent)}</div></div>
    ${battleHasUnits(game,uid) ? '<button class="ghost battle-surrender" type="button" data-battle-surrender>Poddaj się</button>' : ""}
  </section>`;
}

function animateHit(root, hit) {
  if (!hit || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cells = [...root.querySelectorAll("[data-battle-player]")];
  const picture = (uid,slot) => cells.find(cell=>cell.dataset.battlePlayer===uid&&Number(cell.dataset.slot)===slot)?.querySelector(".battle-sprite");
  const from=picture(hit.uid,hit.slot), to=picture(hit.targetUid,hit.targetSlot);
  if (!from || !to) return;
  const a=from.getBoundingClientRect(), b=to.getBoundingClientRect();
  const x=b.x+b.width/2-a.x-a.width/2, y=b.y+b.height/2-a.y-a.height/2;
  from.animate([{transform:"none"},{transform:`translate(${x*.92}px, ${y*.92}px)`,offset:.48},{transform:"none"}],{duration:630,easing:"ease-in-out"});
  to.animate([{transform:"none"},{transform:"translateY(-15px)"},{transform:"none"}],{duration:270,delay:290,easing:"ease-out"});
}

function animateEvolution(root, event) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const art = root.querySelector(`[data-battle-prep-slot="${event.slot}"] .battle-unit-art`);
  const evolved = art?.querySelector(".battle-sprite");
  if (!evolved?.animate) return;
  const pokemon = auctionBattlePokemon(event.fromId);
  art.querySelector(".battle-evolution-old")?.remove();
  art.querySelector(".battle-evolution-flash")?.remove();
  const former = root.ownerDocument.createElement("img");
  former.className="battle-sprite battle-evolution-old";
  former.src=pokemon.sprite;
  former.alt="";
  const flash=root.ownerDocument.createElement("span");
  const effect = formClass(event.kind || (event.mega ? "mega" : ""));
  flash.className=`battle-evolution-flash ${effect}`;
  art.append(former,flash);
  const duration=effect?1450:1050;
  former.animate([{opacity:1},{opacity:1,filter:"brightness(0) invert(1)",offset:.28},{opacity:0,scale:1.2,offset:.58},{opacity:0}],{duration,fill:"forwards"});
  evolved.animate([{opacity:0},{opacity:0,offset:.42},{opacity:1,scale:1.19,offset:.7},{opacity:1,scale:1}],{duration});
  flash.animate([{opacity:0,scale:.4},{opacity:1,scale:1,offset:.48},{opacity:0,scale:2.1}],{duration}).onfinish=()=>{former.remove();flash.remove();};
}

export function renderAuctionBattle(root, room, accounts, uid, actions, timer) {
  const game=room.game;
  const evolution=game.battle.prep?.[uid]?.evolution;
  const key=JSON.stringify(["auction-battle",room.roomId,game.siteGameId||game.startedAt]);
  let view=views.get(root);
  if(view?.key!==key){
    view={key, selection:{}, hit:game.phase==="auction-hit" ? undefined : game.battle.last?.turn, evolution:evolution?.sequence};
    views.set(root,view);
  }
  if(game.phase==="auction-battle"&&view.turn!==game.battle.turn){
    view.turn=game.battle.turn;
    view.selection={slot:battleSlots(game,uid).find(slot=>battleTeam(game,uid)[slot]?.hp>0)};
  }
  const profiles={...room.playerProfiles,...accounts};
  const body=game.phase==="auction-prep" ? prepMarkup(game,profiles,uid,room.players,timer) : battleMarkup(game,profiles,uid,room.players,timer,view.selection);
  patchRoomView(root,key,`<main class="page pokemon-game-page" data-auction-battle>${body}</main>`);
  const expected={phase:game.phase,phaseEndsAt:game.phaseEndsAt,turn:game.battle.turn};
  root.querySelectorAll("[data-battle-upgrade]").forEach(button=>{
    button.onclick=()=>actions.pokemonBattlePrep({kind:button.dataset.battleUpgrade,slot:Number(button.dataset.slot),target:Number(button.dataset.evolution)},expected);
  });
  root.querySelectorAll("[data-battle-reorder]").forEach(button=>{
    button.onclick=()=>actions.pokemonBattlePrep({kind:"reorder",slot:Number(button.dataset.slot),direction:Number(button.dataset.battleReorder)},expected);
  });
  const ready=root.querySelector("[data-battle-ready]");
  if(ready)ready.onclick=()=>actions.pokemonBattlePrep({kind:"ready"},expected);
  const surrender=root.querySelector("[data-battle-surrender]");
  if(surrender)surrender.onclick=()=>{
    if(window.confirm("Poddajesz bitwę i wypadasz z walki. Potwierdzasz?")) actions.pokemonBattleSurrender();
  };
  root.querySelectorAll("[data-battle-player]").forEach(button=>{
    button.onclick=()=>{
      const slot=Number(button.dataset.slot), player=button.dataset.battlePlayer;
      Object.assign(view.selection,player===uid?{slot}:{targetUid:player,targetSlot:slot});
      renderAuctionBattle(root,room,accounts,uid,actions,timer);
    };
  });
  root.querySelectorAll("[data-battle-move]").forEach(button=>{
    button.onclick=()=>actions.pokemonBattleAttack({...view.selection,move:button.dataset.battleMove},expected);
  });
  if(game.phase==="auction-hit"&&game.battle.last&&view.hit!==game.battle.last.turn){
    view.hit=game.battle.last.turn;
    animateHit(root,game.battle.last);
  }
  if(game.phase==="auction-prep"&&evolution?.sequence!==view.evolution){
    view.evolution=evolution?.sequence;
    if(evolution)animateEvolution(root,evolution);
  }
}
