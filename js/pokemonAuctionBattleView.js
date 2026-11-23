import { avatarHtml, escapeHtml, icon } from "./utils.js?v=20261121-8";
import { serverNow } from "./firebase.js?v=20261124-2";
import { patchRoomView } from "./roomViewPatch.js?v=20261119-15";
import { hasGamePass, pokemonBattleScoutPass } from "./gamePasses.js?v=20261121-9";
import { advancedMove, auctionBattleDamage, auctionBattleDefaults, auctionBattlePokemon, auctionDuelTactics, auctionShinySprite, battleEvolutionsUsed, battleHasUnits, battleSignature, battleSignatureEffectiveness, battleSlots, battleSurrendered, battleTeam, battleUpgradeUsed, megaUsesHeldSlot, usesAuctionAbilities } from "./pokemonAuctionBattle.js?v=20261123-10";
import { auctionAbility, auctionAbilityChoices, auctionAbilityDescription, auctionAbilityName, auctionAbilitySupported, auctionBattleField, auctionBattleSpeed, auctionBattleTypes, auctionDuelPriority, statusNames } from "./pokemonAuctionAbilities.js?v=20261123-1";
import { activeBattleSlot, activeBattleUnit, auctionDuelImpactAt, auctionDuelMoveAvailable, auctionDuelMoves, auctionDuelPP } from "./pokemonAuctionDuel.js?v=20261123-10";
import { auctionHeldItems, learnableTactics, tacticalMoves } from "./pokemonAuctionTactics.js?v=20261123-1";
import { animateBattleAction, animateBattleEntry, battleAccent, battleCard, motionEnabled, playBattleCry, preloadBattleCry } from "./pokemonAuctionBattleEffects.js?v=20261123-7";

const views = new WeakMap();
const spriteLoads = new Map();
const evolutionBySprite = new WeakMap();
const name = pokemon => pokemon.name.replace(/(^|[- ])([a-z])/g, (_, separator, letter) => separator + letter.toUpperCase());
const formClass = kind => kind && kind !== "evolve" ? `is-${kind}` : "";
const nickname = (accounts, uid) => escapeHtml(accounts[uid]?.nick || "Gracz");
const sprite = (pokemon,shiny) => `<img class="battle-sprite" data-battle-species="${pokemon.id}" ${shiny ? "data-battle-shiny" : ""} src="${shiny ? auctionShinySprite(pokemon.id) : pokemon.sprite}" alt="${escapeHtml(name(pokemon))}" draggable="false" onerror="this.onerror=null;this.src='${pokemon.spriteFallback}'">`;
const chips = types => types.map(type =>
  `<img class="battle-type" src="/assets/pokemon/types/${type}.svg" alt="${type}" title="${type}">`
).join("");
const speedNumber = new Intl.NumberFormat("pl-PL",{maximumFractionDigits:1});
const moveTypeIcon = type => type ? `<img src="/assets/pokemon/types/${escapeHtml(type)}.svg" alt="${escapeHtml(type)}" class="duel-move-type">` : "";
// Item sprites: https://github.com/PokeAPI/sprites/tree/master/sprites/items
const heldSprite = id => auctionHeldItems[id] ? `<img class="duel-item-sprite" src="/assets/pokemon/items/${id}.png" alt="" width="22" height="22">` : "";
const isDuelPlayback = game => ["auction-hit","auction-pivot"].includes(game.phase);
const wheelColors = ["#2760a6","#903d8d","#067d76","#a45232","#5340a4","#326b42","#a63c55","#336782"];

function openingWheelMarkup(game,accounts,uid,players,now) {
  const wheel = game.battle.openingWheel;
  const settled = now >= wheel.spinEndsAt;
  const next = game.battle.order.find(player=>players.includes(player) && battleHasUnits(game,player));
  const step = 360/wheel.players.length;
  const slices = wheel.players.map((_,index)=>`${wheelColors[index%wheelColors.length]} ${index*step}deg ${(index+1)*step}deg`);
  const radius = wheel.players.length>=6 ? 33 : 28;
  return `<section class="panel pokemon-panel auction-battle-panel auction-opening">
    <p class="eyebrow">LICYTACJA TEAMU</p>
    <h1 role="status">${settled ? (next===uid ? "Ty zaczynasz!" : `${nickname(accounts,next)} zaczyna!`) : "Kto zacznie bitwę?"}</h1>
    <div class="auction-wheel-wrap" data-settled="${settled}">
      <i class="auction-wheel-pointer" aria-hidden="true"></i>
      <div class="auction-wheel" data-auction-wheel role="group" aria-label="Koło losujące pierwszego gracza"
        style="--wheel-fill:conic-gradient(from ${-step/2}deg,${slices.join(",")})">
        ${wheel.players.map((player,index)=>{
          const angle = index*step*Math.PI/180;
          const profile = accounts[player] || {nick:"Gracz"};
          return `<div class="auction-wheel-seat" style="--x:${50+radius*Math.sin(angle)}%;--y:${50-radius*Math.cos(angle)}%">
            <div class="auction-wheel-profile" data-wheel-winner="${settled && player===wheel.starterUid}" title="${nickname(accounts,player)}">
              ${avatarHtml(profile,"auction-wheel-avatar",{disableIdle:true})}<span>${nickname(accounts,player)}</span>
            </div>
          </div>`;
        }).join("")}
      </div>
      <span class="auction-wheel-hub" aria-hidden="true">${icon("zap",22)}</span>
    </div>
  </section>`;
}

function spinOpeningWheel(root,wheel,view,now) {
  const disc = root.querySelector("[data-auction-wheel]");
  if (!disc || view.wheelDisc===disc) return;
  view.wheelDisc=disc;
  const rotation = 1440 - wheel.players.indexOf(wheel.starterUid)*360/wheel.players.length;
  const duration = wheel.spinEndsAt-wheel.startedAt;
  const elapsed = Math.max(0,Math.min(duration,now-wheel.startedAt));
  const spin = (node,angle)=>{
    if (!node.animate || !motionEnabled() || elapsed>=duration) {
      node.style.rotate=`${angle}deg`;
      return;
    }
    const running = node.animate([{rotate:"0deg"},{rotate:`${angle}deg`}],{duration,easing:"cubic-bezier(.12,.64,.14,1)",fill:"both"});
    running.currentTime=elapsed;
  };
  spin(disc,rotation);
  disc.querySelectorAll(".auction-wheel-profile").forEach(profile=>spin(profile,-rotation));
}
const shownDuelEvents = (game,now) => (game.battle.events || []).filter(entry=>!isDuelPlayback(game) || !entry.playAt || entry.playAt<=now);

function duelDisplayHp(game,player,slot,member,now) {
  if (!isDuelPlayback(game)) return member.hp;
  for (const entry of game.battle.events || []) {
    if (auctionDuelImpactAt(entry)<=now) continue;
    if (entry.uid===player && entry.slot===slot && Number.isFinite(entry.attackerHpBefore)) return entry.attackerHpBefore;
    if (entry.targetUid===player && entry.targetSlot===slot && Number.isFinite(entry.targetHpBefore)) return entry.targetHpBefore;
  }
  return member.hp;
}

function stats(pokemon) {
  const s = pokemon.stats;
  return `ATK ${s.attack} · DEF ${s.defense} · Sp. ATK ${s.specialAttack} · Sp. DEF ${s.specialDefense} · SPD ${s.speed}`;
}

function unitArt(unit, pokemon, battle) {
  const hp = Math.max(0,unit.hp/unit.maxHp);
  return `<div class="battle-unit-art">${sprite(pokemon,unit.shiny)}</div>
    <b>${escapeHtml(name(pokemon))}</b><div class="battle-types">${chips(battle ? auctionBattleTypes(unit,pokemon,battle) : pokemon.types)}</div>
    <div class="battle-hp" data-health="${hp<=.25?"low":hp<=.5?"medium":"high"}" aria-hidden="true"><i style="width:${hp*100}%"></i></div>
    <small class="battle-hp-count">${unit.hp} / ${unit.maxHp} HP</small>`;
}

function prepAbility(unit, slot, ready) {
  const options = auctionAbilityChoices(unit.id);
  const current = auctionAbility(unit);
  if (!current) return "";
  const fullDescription = auctionAbilityDescription(current);
  const note = fullDescription || (auctionAbilitySupported(current) ? "" : "Ten efekt jest niedostępny w bitwie drużyn.");
  const link = `https://dex.pokemonshowdown.com/abilities/${current.replace(/[^a-z0-9]/g,"")}`;
  return `<div class="battle-ability-prep">
    ${options.length > 1 ? `<select data-battle-ability="${slot}" aria-label="Zdolność ${escapeHtml(name(auctionBattlePokemon(unit.id)))}" ${ready ? "disabled" : ""}>
      ${options.map(id => `<option value="${id}" ${id === current ? "selected" : ""}>${escapeHtml(auctionAbilityName(id))}${auctionAbilitySupported(id) ? "" : " · bez efektu"}</option>`).join("")}
    </select>` : `<strong>${escapeHtml(auctionAbilityName(current))}</strong>`}
    ${note ? `<small>${escapeHtml(note)}</small>` : ""}
    <a href="${link}" target="_blank" rel="noopener noreferrer">Opis zdolności ↗</a>
  </div>`;
}

function prepTactics(unit,pokemon,slot,ready,team) {
  const picked = auctionDuelTactics(unit);
  const legal = learnableTactics(pokemon).filter(id=>tacticalMoves[id].name !== battleSignature(unit)[0]);
  return `<div class="battle-ability-prep duel-loadout">
    ${legal.length ? picked.map((id,index)=>`<label>Ruch taktyczny ${index+1}
      <select data-duel-tactic="${index}" data-slot="${slot}" ${ready?"disabled":""}>
        <option value="0" ${!id?"selected":""}>Puste pole</option>
        ${legal.map(move=>`<option value="${move}" ${id===move?"selected":""} ${picked[1-index]===move?"disabled":""}>${escapeHtml(tacticalMoves[move].name)}</option>`).join("")}
      </select>${id ? `<small>${escapeHtml(tacticalMoves[id].description)}</small>` : ""}
    </label>`).join("") : ""}
    ${unit.megaTarget ? '<strong>✦ Mega gotowa do aktywacji</strong>' : ""}
    ${megaUsesHeldSlot(unit) ? "" : `<label><span class="duel-item-chip">${heldSprite(unit.item)}Trzymany przedmiot</span>
      <select data-duel-item="${slot}" ${ready?"disabled":""}>
        <option value="">Brak</option>
        ${Object.entries(auctionHeldItems).map(([key,item])=>{
          const equipped = team.some(member=>member!==unit && member.item===key);
          return `<option value="${key}" ${unit.item===key?"selected":""} ${equipped?"disabled":""}>${item.name}${equipped?" · zajęty":""}</option>`;
        }).join("")}
      </select>${unit.item ? `<small>${auctionHeldItems[unit.item].description}</small>` : ""}
    </label>`}
  </div>`;
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
      const disabled = ready.ready || (paid ? upgradeUsed || budget < megaPrice : !evolutionsLeft || unit.megaTarget);
      return ids.map(id => `<button type="button" class="ghost" data-battle-upgrade="${kind}" data-slot="${slot}" data-evolution="${id}" ${disabled ? "disabled" : ""}>
        ${kind === "form" ? "Zmień formę na " : paid ? (game.battle.duel ? "Przygotuj " : "") : "Ewoluuj w "}${escapeHtml(name(auctionBattlePokemon(id)))}${paid ? ` · ${upgradePrice}` : ""}
      </button>`).join("");
    };
    return `<article class="battle-unit ${formClass(pokemon.formKind)}" data-battle-prep-slot="${slot}">
      <div class="battle-order"><span>${position===0?"1 · Prowadzący":position+1}</span>
      <button type="button" class="ghost" data-battle-reorder="-1" data-slot="${slot}" aria-label="Przesuń ${escapeHtml(name(pokemon))} wcześniej" ${position===0||ready.ready?"disabled":""}>←</button>
      <button type="button" class="ghost" data-battle-reorder="1" data-slot="${slot}" aria-label="Przesuń ${escapeHtml(name(pokemon))} później" ${position===team.length-1||ready.ready?"disabled":""}>→</button></div>
      ${unitArt(unit,pokemon)}<small>${stats(pokemon)}</small>
      ${usesAuctionAbilities(game) ? prepAbility(unit,slot,ready.ready) : ""}
      ${game.battle.duel ? prepTactics(unit,pokemon,slot,ready.ready,team) : ""}
      <div class="battle-upgrades">${choices("evolve",pokemon.evolutions)}${choices("mega",pokemon.megas)}${choices("form",pokemon.forms)}</div></article>`;
  });
  return `<section class="panel pokemon-panel auction-battle-panel" id="auction-preparation">
    <header class="battle-heading"><div><p class="eyebrow">LICYTACJA TEAMU · PRZYGOTOWANIE</p><h1>Przygotuj drużynę</h1></div>${timer}</header>
    ${team.length ? `<div class="battle-prep-info"><strong>Budżet aukcji ${budget}$</strong><span>${evolutionStatus} · ${upgradeStatus}</span></div>` : ""}
    <p class="muted">${game.battle.duel ? "Pierwszy Pokémon zaczyna. Masz po 1 szt. każdego przedmiotu na drużynę." : "Ustaw kolejność strzałkami. Koło wylosuje, kto zacznie bitwę."}</p>
    <div class="battle-prep-team">${cards.join("") || "<p>Nie masz Pokémonów w składzie. Możesz obserwować bitwę.</p>"}</div>
    <footer class="battle-footer"><button class="primary" type="button" data-battle-ready ${!team.length||ready.ready?"disabled":""}>${ready.ready?"Drużyna gotowa":"Gotowe do bitwy"}</button>
    <span class="muted">${players.filter(id=>battleTeam(game,id).length).map(id=>`${nickname(accounts,id)} ${game.battle.prep?.[id]?.ready?"✓":"…" }`).join(" · ")}</span></footer>
  </section>`;
}

function duelMarkup(game,accounts,uid,players,timer,view,now) {
  const battle = game.battle;
  const unit = activeBattleUnit(game,uid);
  const field = auctionBattleField(battle).join(" · ");
  const rivals = players.filter(player=>player!==uid && activeBattleUnit(game,player)?.hp);
  const targetUid = rivals.includes(view.target) ? view.target : rivals[0];
  const target = activeBattleUnit(game,targetUid);
  const choose = game.phase === "auction-command" && unit?.hp && !battle.commits?.[uid];
  const forced = game.phase === "auction-switch" && !unit?.hp && battleHasUnits(game,uid) && battle.replacements?.[uid] === undefined;
  const pivot = game.phase === "auction-pivot" && battle.pivotUid === uid;
  const moves = unit?.hp ? auctionDuelMoves(unit) : [];
  const shownMoves = moves.some(move=>auctionDuelMoveAvailable(unit,move)) ? moves : moves.length ? ["struggle"] : [];
  const order = view.order;
  const moveUnit = view.mega && order?.kind !== "switch" && unit?.megaTarget && !unit.transformBase
    ? {...unit,id:unit.megaTarget,ability:undefined,copiedAbility:undefined,entered:false,lockedSignature:battleSignature(unit)}
    : unit;
  const confirm = choose && order && !view.busy;
  const scout = hasGamePass(accounts[uid], pokemonBattleScoutPass);
  const heading = forced || pivot ? "Wybierz następcę" : choose ? "Wybierz ruch" :
    game.phase === "auction-hit" ? "Wynik tury" : battle.commits?.[uid] && game.phase === "auction-command" ? "Ruch zatwierdzony" : "Czekamy na graczy";
  const playerName = player => player===uid ? "Ty" : nickname(accounts,player);
  const onField = players.filter(player=>activeBattleSlot(game,player) !== undefined);
  const speeds = new Map(onField.flatMap(player=>{
    const active = activeBattleUnit(game,player);
    return active?.hp ? [[player,auctionBattleSpeed(active,auctionBattlePokemon(active.id),battle)]] : [];
  }));
  const fastest = Math.max(...speeds.values());
  const fastestCount = [...speeds.values()].filter(value=>value===fastest).length;
  const visibleEvents = shownDuelEvents(game,now);
  const acting = isDuelPlayback(game) ? visibleEvents.findLast(entry=>entry.targetUid && entry.playAt && now<entry.playAt+750) : null;
  const card = (player,slot,active=false) => {
    const member = battleTeam(game,player)[slot];
    const hp = duelDisplayHp(game,player,slot,member,now);
    const species = auctionBattlePokemon(member.id);
    const authored = player===uid && member.hp && !active && (choose || forced || pivot);
    const held = player===uid && member.item ? auctionHeldItems[member.item]?.name : "";
    const condition = statusNames[member.condition] || (member.confusion ? statusNames.confusion : "");
    const ready = battle.commits?.[player] && game.phase==="auction-command";
    const label = active ? `${playerName(player)}${ready?" · ✓":""}` : !hp ? "Nokaut" : "";
    const speed = active ? speeds.get(player) : undefined;
    const leads = speed===fastest && speeds.size>1;
    const tag = active ? "article" : "button";
    return `<${tag} class="battle-unit ${active?"duel-active":""} ${hp?"":"is-out"}" data-battle-player="${escapeHtml(player)}" data-slot="${slot}" data-duel-acting="${active && acting?.uid===player}"
      ${active ? `style="--accent:${battleAccent(species.types[0])}"` : `type="button" ${authored?`data-duel-switch="${slot}"`:"disabled"} aria-pressed="${player===uid && order?.kind==="switch" && order.slot===slot}"`}>
      ${label ? `<small class="duel-slot">${label}</small>` : ""}${unitArt({...member,hp},species,active?battle:null)}
      ${active ? `<small class="duel-speed" data-fastest="${leads && fastestCount===1}" title="Szybkość. Ruchy priorytetowe mogą zmienić kolejność.">${icon("zap",12)} ${speed===undefined?"SPD —":`SPD ${speedNumber.format(speed)}`}${leads ? `<b>${fastestCount===1?"Najszybszy":"Remis"}</b>` : ""}</small>` : ""}
      <small class="battle-ability-chip">${escapeHtml([auctionAbilityName(auctionAbility(member)),condition].filter(Boolean).join(" · "))}</small>
      ${held ? `<small class="duel-item-chip" title="${escapeHtml(held)}">${heldSprite(member.item)}<span>${escapeHtml(held)}</span></small>` : ""}
    </${tag}>`;
  };
  const bench = onField.map(player=>{
    const slots = battleSlots(game,player).filter(slot=>slot !== activeBattleSlot(game,player));
    if (!slots.length) return "";
    return `<section class="duel-bench"><h2>${player===uid?"Twoja rezerwa":`Rezerwa · ${playerName(player)}`}</h2>
      <div class="battle-party">${slots.map(slot=>card(player,slot)).join("")}</div></section>`;
  }).join("");
  const events = visibleEvents.map(entry=>{
    const label = nickname(accounts,entry.uid);
    const detail = entry.damage ? `−${entry.damage} HP` : entry.missed ? "pudło" :
      entry.skipped ? "utrata ruchu" : entry.blocked || entry.failed ? "bez efektu" : "";
    return `<li>${moveTypeIcon(entry.moveType)}<b>${label} · ${escapeHtml(entry.name)}</b>${detail ? ` · ${detail}` : ""}${entry.knockedOut ? " · nokaut" : ""}
      ${entry.abilityEvents?.length ? `<small>${escapeHtml(entry.abilityEvents.join(" · "))}</small>` : ""}</li>`;
  });
  const labels = moves.length && !shownMoves.includes("struggle");
  return `<section class="panel pokemon-panel auction-battle-panel" id="auction-fight">
    <header class="battle-heading"><div><p class="eyebrow">⭐ BITWA POKÉMON · TURA ${battle.turn}</p><h1>${heading}</h1></div>${timer}</header>
    ${field ? `<p class="battle-field">✦ ${escapeHtml(field)}</p>` : ""}
    <div class="duel-stage" data-weather="${field ? escapeHtml(battle.weather?.end>=battle.turn ? battle.weather.kind : "") : ""}">
      ${onField.map(player=>card(player,activeBattleSlot(game,player),true)).join("")}
    </div>
    ${bench ? `<div class="duel-benches">${bench}</div>` : ""}
    ${choose ? `<section class="duel-controls">
      ${rivals.length>1 ? `<label>Cel <select data-duel-target>${rivals.map(player=>`<option value="${escapeHtml(player)}" ${player===targetUid?"selected":""}>${nickname(accounts,player)}</option>`).join("")}</select></label>` : ""}
      <div class="duel-moves">${shownMoves.map(move=>{
        const details = advancedMove(moveUnit,move);
        const priority = auctionDuelPriority(moveUnit,details);
        const categoryIcon = details.kind==="status" ? "shield" : details.kind==="special" ? "sparkles" : "zap";
        const categoryLabel = {status:"Status",special:"Specjalny",physical:"Fizyczny"}[details.kind];
        const available = !labels || auctionDuelMoveAvailable(unit,move);
        const hit = target?.hp && available && details.power && (game.battleRules.showDamagePreview || scout)
          ? auctionBattleDamage(moveUnit,target,move,game,targetUid) : null;
        const quad = scout && hit?.factor===4;
        const hint = hit && [
          game.battleRules.showDamagePreview ? `≈ ${hit.damage} HP` : "",
          scout && hit.factor>1 ? `<span class="battle-matchup-label">×${hit.factor} super skuteczny</span>` : "",
          scout && hit.factor===0 ? "odporność" : "",
        ].filter(Boolean).join(" · ");
        return `<button type="button" class="ghost" data-duel-move="${move}" ${quad?'data-battle-matchup="quad"':""} style="--accent:${battleAccent(details.type)}" aria-pressed="${order?.move===move}" ${available?"":"disabled"}>
          <strong>${moveTypeIcon(details.type)}${escapeHtml(details.name)}<span class="duel-move-kind" title="${categoryLabel}" aria-label="${categoryLabel}">${icon(categoryIcon,13)}</span></strong><small>${labels ? `${auctionDuelPP(moveUnit,move)}/${details.pp} PP` : "Brak PP w innych ruchach"}${priority ? ` · Priorytet ${priority>0?"+":""}${priority}` : ""}${details.description ? ` · ${details.description}` : ""}</small>
          ${hint ? `<small>${hint}</small>` : ""}
        </button>`;
      }).join("")}</div>
      ${unit.megaTarget && !unit.transformBase ? `<label class="check"><input type="checkbox" data-duel-mega ${view.mega?"checked":""} ${order?.kind==="switch"?"disabled":""}> ✦ Megaewolucja razem z ruchem</label>` : ""}
      <button type="button" class="primary" data-duel-confirm ${confirm?"":"disabled"}>${order?.kind==="switch" ? "Zatwierdź zmianę" : "Zatwierdź ruch"}</button>
    </section>` : ""}
    ${events.length ? `<ol class="duel-events" aria-label="Przebieg ostatniej tury">${events.join("")}</ol>` : ""}
    ${battleHasUnits(game,uid)?'<button class="ghost battle-surrender" type="button" data-battle-surrender>Poddaj się</button>':""}
  </section>`;
}

function battleMarkup(game, accounts, uid, players, timer, selection) {
  const {activeUid,last,turn} = game.battle;
  const canAttack = activeUid===uid && game.phase==="auction-battle";
  const attacker = battleTeam(game,uid)[selection.slot], target = battleTeam(game,selection.targetUid)[selection.targetSlot];
  const pokemon = auctionBattlePokemon(attacker?.id);
  const advanced = usesAuctionAbilities(game);
  const field = advanced ? auctionBattleField(game.battle).join(" · ") : "";
  const ownsMatchups = hasGamePass(accounts[uid], pokemonBattleScoutPass);
  const showMatchups = canAttack && attacker?.hp > 0 && !attacker.signatureSpent && ownsMatchups;
  const teams = players.map(player => `<section class="battle-team ${player===activeUid?"is-active":""}">
    <h2>${player===uid?"Twój team":nickname(accounts,player)}${battleSurrendered(game,player)?' <small>· Poddanie</small>':""}</h2>
    <div class="battle-party">${battleSlots(game,player).map(slot=>{
      const unit = battleTeam(game,player)[slot];
      const selected = player===uid ? slot===selection.slot : player===selection.targetUid && slot===selection.targetSlot;
      const species = auctionBattlePokemon(unit.id);
      const factor = showMatchups && player!==uid && unit.hp>0 ? battleSignatureEffectiveness(attacker,unit,game,player) : 0;
      const matchup = factor===4 ? "quad" : factor>1 ? "super" : factor===1 ? "effective" : "";
      const badge = player!==uid && ownsMatchups ? `<small class="battle-matchup-label"${matchup ? "" : ' aria-hidden="true"'}>${factor>1 ? `×${factor} Super` : matchup ? "×1 Skuteczny" : "&nbsp;"}</small>` : "";
      const condition = unit.perishTurn ? `Perish · ${Math.ceil((unit.perishTurn - turn) / game.battle.order.length)}`
        : statusNames[unit.condition] || (unit.confusion ? statusNames.confusion : "");
      const ability = advanced ? `<small class="battle-ability-chip">${escapeHtml([auctionAbilityName(auctionAbility(unit)),condition].filter(Boolean).join(" · "))}</small>` : "";
      return `<button type="button" class="battle-unit ${formClass(species.formKind)} ${unit.hp===0?"is-out":""}" data-battle-player="${escapeHtml(player)}" data-slot="${slot}" ${matchup ? `data-battle-matchup="${matchup}"` : ""} aria-pressed="${selected}" title="${stats(species)}" ${!canAttack||unit.hp===0?"disabled":""}>${unitArt(unit,species,advanced ? game.battle : null)}${ability}${badge}</button>`;
    }).join("")||'<span class="muted">Pusty skład</span>'}</div></section>`);
  const moveButton = (kind,label,spent=false) => {
    const available = canAttack && attacker?.hp > 0 && target?.hp > 0 && !spent;
    let note = spent ? "<small>Odnowisz zwykłym atakiem</small>" : "";
    if (!spent && game.battleRules?.showDamagePreview === true && canAttack) {
      const hit = available ? auctionBattleDamage(attacker,target,kind,game,selection.targetUid) : null;
      const preview = !hit ? (attacker?.hp ? "Wybierz cel" : "Wybierz Pokémona")
        : hit.copies ? "Kopiuje formę lub ruch" : hit.skipped ? "Utrata ruchu" : hit.factor === 0 || !hit.damage ? "Brak bezpośrednich obrażeń" : `${advanced ? "≈ " : ""}−${hit.damage} HP`;
      note = `<small data-damage-preview>${preview}</small>`;
    }
    return `<button type="button" class="${kind==="signature"?"primary":"ghost"}" data-battle-move="${kind}" ${available?"":"disabled"}>
     <span>${escapeHtml(label)}</span>${note}
    </button>`;
  };
  const result = last?.skipped ? "ruch przepada" : last?.missed ? "pudło"
    : last?.copies ? (last.name === "Transform" ? "skopiowano formę" : "skopiowano ruch")
    : last?.damage ? `−${last.damage} HP` : "brak bezpośrednich obrażeń";
  const events = Array.isArray(last?.abilityEvents) ? last.abilityEvents.join(" · ") : "";
  const event = last ? `<p class="battle-event" role="status"><b>${escapeHtml(last.name)}</b> · ${result}${last.knockedOut?" · nokaut celu":""}${last.attackerOut?" · nokaut atakującego":""}${last.critical?" · krytyk":""}${last.damage&&last.factor>1?" · super skuteczny":last.damage&&last.factor>0&&last.factor<1?" · mało skuteczny":""}${events ? `<small class="battle-ability-events">✦ ${escapeHtml(events)}</small>` : ""}</p>` : '<p class="battle-event" role="status"></p>';
  return `<section class="panel pokemon-panel auction-battle-panel" id="auction-fight">
    <header class="battle-heading"><div><p class="eyebrow">BITWA POKÉMON · TURA ${turn}</p><h1>${game.phase==="auction-hit"?"Atak w toku":canAttack?"Twój ruch":`Tura gracza ${nickname(accounts,activeUid)}`}</h1></div>${timer}</header>
    ${field ? `<p class="battle-field">✦ ${escapeHtml(field)}</p>` : ""}${event}<div class="battle-arena">${teams.join("")}</div>
    <div class="battle-move-row"><p class="muted">${pokemon?`${escapeHtml(name(pokemon))} · ${stats(pokemon)}`:"Wybierz Pokémona ze swojego teamu, potem cel u rywala."}</p>
    <div>${moveButton("basic","Uderzenie")}${moveButton("signature",attacker?battleSignature(attacker)[0]:"Atak specjalny",attacker?.signatureSpent)}</div></div>
    ${battleHasUnits(game,uid) ? '<button class="ghost battle-surrender" type="button" data-battle-surrender>Poddaj się</button>' : ""}
  </section>`;
}

function decodedSprite(pokemon,shiny) {
  if (!pokemon) return Promise.resolve(null);
  const src = shiny ? auctionShinySprite(pokemon.id) : pokemon.sprite;
  if (spriteLoads.has(src)) return spriteLoads.get(src);
  const image = new Image();
  image.src=src;
  const ready = (async ()=>{
    try {
      await image.decode();
    } catch {
      if (!pokemon.spriteFallback || pokemon.spriteFallback === src) return null;
      image.src=pokemon.spriteFallback;
      await image.decode();
    }
    return image;
  })().catch(()=>null);
  spriteLoads.set(src,ready);
  if (spriteLoads.size>24) spriteLoads.delete(spriteLoads.keys().next().value);
  void ready.then(result=>{
    if (result?.src!==src && spriteLoads.get(src)===ready) spriteLoads.delete(src);
  });
  return ready;
}

async function animateEvolution(root, event) {
  const card = event.uid ? battleCard(root,event.uid,event.slot) : root.querySelector(`[data-battle-prep-slot="${event.slot}"]`);
  const art = card?.querySelector(".battle-unit-art");
  const evolved = art?.querySelector(".battle-sprite");
  if (!evolved || Number(evolved.dataset.battleSpecies)!==event.toId) return;
  evolutionBySprite.get(evolved)?.cancel();
  const animations = [];
  let former;
  const flash=root.ownerDocument.createElement("span");
  const cancel = () => {
    evolved.style.removeProperty("visibility");
    animations.forEach(animation=>animation.cancel());
    former?.remove();
    flash.remove();
    evolutionBySprite.delete(evolved);
  };
  const current = () => root.isConnected && root.contains(evolved) && evolutionBySprite.get(evolved)?.cancel===cancel &&
    Number(evolved.dataset.battleSpecies)===event.toId;
  evolutionBySprite.set(evolved,{id:event.toId,cancel});
  evolved.style.visibility="hidden";
  const shiny = evolved.hasAttribute("data-battle-shiny");
  const target = decodedSprite(auctionBattlePokemon(event.toId),shiny);
  const before = await decodedSprite(auctionBattlePokemon(event.fromId),shiny);
  if (!current()) return;
  if (before) {
    const outgoing=before.cloneNode();
    if (await outgoing.decode().then(()=>true,()=>false)) {
      if (!current()) return;
      former=outgoing;
      former.className="battle-sprite battle-evolution-old";
      former.alt="";
      art.append(former);
    }
  }
  if (!current()) return;
  const after = await target;
  if (!current()) return;
  const display = after || before;
  if (display && evolved.src!==display.src) evolved.src=display.src;
  const decoded = display && await evolved.decode().then(()=>true,()=>false);
  if (!current()) return;
  if (!decoded || !former || !evolved.animate || !motionEnabled()) return cancel();

  evolved.style.removeProperty("visibility");
  const effect = formClass(event.kind || (event.mega ? "mega" : ""));
  flash.className=`battle-evolution-flash ${effect}`;
  art.append(flash);
  const duration=event.uid?650:effect?1450:1050;
  animations.push(former.animate([{opacity:1},{opacity:1,filter:"brightness(1.9) saturate(.6)",offset:.28},{opacity:0,scale:1.2,offset:.68},{opacity:0}],{duration,fill:"forwards"}),
    evolved.animate([{opacity:0},{opacity:0,offset:.36},{opacity:1,scale:1.19,offset:.66},{opacity:1,scale:1}],{duration}),
    flash.animate([{opacity:0,scale:.4},{opacity:1,scale:1,offset:.48},{opacity:0,scale:2.1}],{duration}));
  animations.at(-1).onfinish=cancel;
}

function playDuelEffects(root,game,view) {
  const battle = game.battle;
  const before = view.activeSlots;
  view.activeSlots = {...battle.activeSlots};
  for (const [uid,slot] of Object.entries(view.activeSlots)) {
    if (before?.[uid] !== slot) animateBattleEntry(battleCard(root,uid,slot));
  }
  if (!isDuelPlayback(game)) return;
  if (view.effectTurn !== battle.turn) {
    view.effectTurn = battle.turn;
    view.shownEvents = 0;
  }
  const events = battle.events || [];
  const fresh = events.slice(view.shownEvents);
  view.shownEvents = events.length;
  const actions = fresh.filter(entry=>entry.toId || entry.targetUid);
  actions.forEach((entry,index)=>{
    if (entry.toId) {
      void animateEvolution(root,{...entry,kind:"mega"});
      return;
    }
    const playAt = entry.playAt || serverNow() + index*350;
    if (entry.playAt && serverNow()-playAt > 700) return;
    window.setTimeout(()=>{
      const current = () => views.get(root) === view && root.isConnected &&
        view.commandTurn === battle.turn && Boolean(root.querySelector(".duel-stage")) && serverNow()-playAt < 850;
      if (!current()) return;
      playBattleCry(entry,battleTeam(game,entry.uid)[entry.slot]?.id,current);
      animateBattleAction(root,entry);
    },Math.max(0,playAt-serverNow()));
  });
}

export function renderAuctionBattle(root, room, accounts, uid, actions, timer) {
  const game=room.game;
  const evolution=game.battle.prep?.[uid]?.evolution;
  const key=JSON.stringify(["auction-battle",room.roomId,game.siteGameId||game.startedAt]);
  let view=views.get(root);
  if(view?.key!==key){
    clearTimeout(view?.playbackTimer);
    view={key, selection:{}, hit:game.phase==="auction-hit" ? undefined : game.battle.last?.turn, evolution:evolution?.sequence};
    views.set(root,view);
  }
  if(game.phase==="auction-battle"&&view.turn!==game.battle.turn){
    view.turn=game.battle.turn;
    view.selection={slot:battleSlots(game,uid).find(slot=>battleTeam(game,uid)[slot]?.hp>0)};
  }
  if (game.battle.duel && view.commandTurn !== game.battle.turn) {
    view.commandTurn = game.battle.turn;
    view.order = null;
    view.mega = false;
    view.busy = false;
    view.revealing = false;
  }
  const profiles={...room.playerProfiles,...accounts};
  const now=serverNow();
  if (game.phase==="auction-prep" || game.phase==="auction-command") {
    for (const player of room.players) for (const unit of battleTeam(game,player)) {
      if (unit.megaTarget) void decodedSprite(auctionBattlePokemon(unit.megaTarget),unit.shiny);
    }
  }
  if (game.phase==="auction-prep") {
    for (const player of room.players) preloadBattleCry(battleTeam(game,player)[battleSlots(game,player)[0]]);
  } else if (game.phase==="auction-command") {
    for (const player of room.players) preloadBattleCry(activeBattleUnit(game,player));
  } else if (game.phase==="auction-battle") {
    for (const unit of battleTeam(game,game.battle.activeUid)) if (unit.hp) preloadBattleCry(unit);
  }
  const wheel = game.phase==="auction-wheel" ? game.battle.openingWheel : null;
  const body=wheel ? openingWheelMarkup(game,profiles,uid,room.players,now) :
    game.phase==="auction-prep" ? prepMarkup(game,profiles,uid,room.players,timer) :
    game.battle.duel ? duelMarkup(game,profiles,uid,room.players,timer,view,now) : battleMarkup(game,profiles,uid,room.players,timer,view.selection);
  patchRoomView(root,key,`<main class="page pokemon-game-page" data-auction-battle>${body}</main>`);
  for (const image of root.querySelectorAll(".battle-sprite[data-battle-species]")) {
    const transition = evolutionBySprite.get(image);
    if (transition && transition.id!==Number(image.dataset.battleSpecies)) transition.cancel();
  }
  const expected={phase:game.phase,phaseEndsAt:game.phaseEndsAt,turn:game.battle.turn};
  const paint = () => renderAuctionBattle(root,room,accounts,uid,actions,timer);
  clearTimeout(view.playbackTimer);
  if (wheel) {
    spinOpeningWheel(root,wheel,view,now);
    if (now<wheel.spinEndsAt) view.playbackTimer=window.setTimeout(()=>{
      if (root.isConnected && root.contains(view.wheelDisc)) paint();
    },Math.max(16,wheel.spinEndsAt-now));
    return;
  }
  if (game.battle.duel && isDuelPlayback(game)) {
    const boundaries = (game.battle.events || []).flatMap(entry=>entry.playAt
      ? [entry.playAt,auctionDuelImpactAt(entry),...(entry.targetUid ? [entry.playAt+750] : [])] : []);
    const next = Math.min(...boundaries.filter(time=>time>now));
    if (Number.isFinite(next)) view.playbackTimer = window.setTimeout(()=>{
      if (root.isConnected && views.get(root)===view) paint();
    },Math.max(16,next-now));
  }
  root.querySelectorAll("[data-battle-upgrade]").forEach(button=>{
    button.onclick=()=>{
      const target = Number(button.dataset.evolution);
      const slot = Number(button.dataset.slot);
      void decodedSprite(auctionBattlePokemon(target),battleTeam(game,uid)[slot]?.shiny);
      return actions.pokemonBattlePrep({kind:button.dataset.battleUpgrade,slot,target},expected);
    };
  });
  root.querySelectorAll("[data-battle-reorder]").forEach(button=>{
    button.onclick=()=>actions.pokemonBattlePrep({kind:"reorder",slot:Number(button.dataset.slot),direction:Number(button.dataset.battleReorder)},expected);
  });
  root.querySelectorAll("[data-battle-ability]").forEach(select=>{
    select.onchange=()=>actions.pokemonBattlePrep({kind:"ability",slot:Number(select.dataset.battleAbility),ability:select.value},expected);
  });
  root.querySelectorAll("[data-duel-tactic]").forEach(select=>{
    select.onchange=()=>actions.pokemonBattlePrep({kind:"tactic",slot:Number(select.dataset.slot),index:Number(select.dataset.duelTactic),move:Number(select.value)},expected);
  });
  root.querySelectorAll("[data-duel-item]").forEach(select=>{
    select.onchange=()=>actions.pokemonBattlePrep({kind:"item",slot:Number(select.dataset.duelItem),item:select.value},expected);
  });
  const ready=root.querySelector("[data-battle-ready]");
  if(ready)ready.onclick=()=>actions.pokemonBattlePrep({kind:"ready"},expected);
  const surrender=root.querySelector("[data-battle-surrender]");
  if(surrender)surrender.onclick=()=>{
    if(window.confirm("Poddajesz bitwę i wypadasz z walki. Potwierdzasz?")) actions.pokemonBattleSurrender();
  };
  if (game.battle.duel) {
    const target = root.querySelector("[data-duel-target]");
    if (target) target.onchange = () => { view.target = target.value; paint(); };
    const mega = root.querySelector("[data-duel-mega]");
    if (mega) mega.onchange = () => { view.mega = mega.checked; paint(); };
    root.querySelectorAll("[data-duel-move]").forEach(button=>{
      button.onclick=()=>{ view.order={kind:"move",move:button.dataset.duelMove}; paint(); };
    });
    root.querySelectorAll("[data-duel-switch]").forEach(button=>{
      button.onclick=()=>{
        const order = {kind:"switch",slot:Number(button.dataset.duelSwitch)};
        if (game.phase === "auction-command") { view.order=order; paint(); }
        else actions.pokemonBattleDuel(order,expected);
      };
    });
    const confirm = root.querySelector("[data-duel-confirm]");
    if (confirm) confirm.onclick=async()=>{
      if (view.busy || !view.order) return;
      view.busy=true;
      confirm.disabled=true;
      const order=view.order.kind === "move" ? {...view.order,target:target?.value || "",mega:view.mega} : view.order;
      try { await actions.pokemonBattleCommand(order,expected); }
      finally { view.busy=false; if (confirm.isConnected) confirm.disabled=false; }
    };
    if (game.phase==="auction-reveal-moves" && game.battle.commits?.[uid] && !game.battle.reveals?.[uid] && !view.revealing) {
      view.revealing=true;
      void actions.pokemonBattleReveal(expected).finally(()=>{view.revealing=false;});
    }
    playDuelEffects(root,game,view);
  } else root.querySelectorAll("[data-battle-player]").forEach(button=>{
    button.onclick=()=>{
      const slot=Number(button.dataset.slot), player=button.dataset.battlePlayer;
      Object.assign(view.selection,player===uid?{slot}:{targetUid:player,targetSlot:slot});
      renderAuctionBattle(root,room,accounts,uid,actions,timer);
    };
  });
  root.querySelectorAll("[data-battle-move]").forEach(button=>{
    button.onclick=()=>actions.pokemonBattleAttack({...view.selection,move:button.dataset.battleMove},expected);
  });
  if(!game.battle.duel&&game.phase==="auction-hit"&&game.battle.last&&view.hit!==game.battle.last.turn){
    const last=game.battle.last;
    view.hit=last.turn;
    playBattleCry(last,battleTeam(game,last.uid)[last.slot]?.id,()=>root.isConnected && views.get(root)===view &&
      view.hit===last.turn && Boolean(root.querySelector("[data-auction-battle]")));
    animateBattleAction(root,last);
  }
  if(game.phase==="auction-prep"&&evolution?.sequence!==view.evolution){
    view.evolution=evolution?.sequence;
    if(evolution)animateEvolution(root,evolution);
  }
}
