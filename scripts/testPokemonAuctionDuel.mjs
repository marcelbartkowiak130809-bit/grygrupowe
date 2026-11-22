import assert from "node:assert/strict";
import { test } from "node:test";
import { createPokemonGame } from "../js/pokemon.js";
import { advancedMove, auctionBattleDamage, auctionBattlePrep, auctionBattleTimeout, auctionBattlePokemon, battleTeam, prepareAuctionBattle } from "../js/pokemonAuctionBattle.js";
import { activeBattleSlot, activeBattleUnit, auctionDuelAction, auctionDuelBot } from "../js/pokemonAuctionDuel.js";
import { auctionCommandContext, auctionCommandDigest } from "../js/pokemonAuctionCommitments.js";

const players = ["a","b"];
const move = (key,mega=false) => ({kind:"move",move:key,mega});
const switchTo = slot => ({kind:"switch",slot});
const digests = {a:"a".repeat(64),b:"b".repeat(64)};
function duel(a,b) {
  const game = createPokemonGame("pokemon-auction",players,{battleAfterAuction:true,advancedAbilities:true});
  Object.assign(game,{teams:{a,b},budgets:{a:10,b:10}});
  prepareAuctionBattle(game,players,1000);
  const prep = (id,action) => auctionBattlePrep(game,id,action,players,game.phaseEndsAt-1);
  const act = (id,action) => auctionDuelAction(game,id,action,players,game.phaseEndsAt-1);
  const tick = () => auctionBattleTimeout(game,players,game.phaseEndsAt);
  const commit = uid => act(uid,{kind:"commit",digest:digests[uid]});
  const reveal = (uid,order) => act(uid,{kind:"reveal",digest:digests[uid],order});
  return {game,prep,act,tick,commit,reveal,unit:uid=>activeBattleUnit(game,uid),
    start:()=>players.forEach(uid=>assert.equal(prep(uid,{kind:"ready"}),undefined)),
    play:(a,b)=>{players.forEach(uid=>assert.equal(commit(uid),undefined)); assert.equal(reveal("a",a),undefined); assert.equal(reveal("b",b),undefined);},
  };
}

test("both choices lock before reveal, and a faster attack is blocked by Protect",async()=>{
  const d = duel([25],[4]);
  d.start();
  const {game} = d;
  assert.equal(game.phase,"auction-command");
  assert.equal(d.commit("a"),undefined);
  assert.ok(d.reveal("a",move("signature")));
  assert.equal(JSON.stringify(game.battle).includes('"signature"'),false);
  assert.equal(d.commit("b"),undefined);
  assert.equal(game.phase,"auction-reveal-moves");
  assert.ok(d.act("a",{kind:"reveal",digest:digests.b,order:move("signature")}));
  assert.equal(d.reveal("a",move("signature")),undefined);
  assert.equal(d.reveal("b",move("182")),undefined);
  assert.equal(game.phase,"auction-hit");
  assert.deepEqual(game.battle.events.map(entry=>entry.uid),["b","a"]);
  assert.equal(game.battle.events[0].name,"Protect");
  assert.equal(game.battle.events[1].blocked,true);
  assert.equal(d.unit("b").hp,d.unit("b").maxHp);
  assert.equal(d.unit("b").usedPP["182"],1);
  const context = auctionCommandContext({roomId:"room",game},"a");
  assert.notEqual(await auctionCommandDigest(context,move("basic"),"secret"),await auctionCommandDigest(context,move("signature"),"secret"));
  d.tick();
  assert.equal(game.phase,"auction-command");
  assert.equal(d.unit("b").protect,undefined);
});

test("switches precede attacks and Regenerator or Natural Cure apply on leaving",()=>{
  const d = duel([25],[113,50]);
  d.start();
  const chansey = d.unit("b");
  chansey.condition = "burn";
  assert.equal(d.game.battle.turn,1);
  d.play(move("signature"),switchTo(1));
  assert.equal(activeBattleSlot(d.game,"b"),1);
  assert.equal(chansey.condition,undefined);
  assert.ok(d.game.battle.events.find(entry=>entry.abilityEvents?.includes("Natural Cure")));
  assert.equal(d.game.battle.events.find(entry=>entry.uid==="a").factor,0);
  const regenerator = duel([25],[114,50]);
  assert.equal(regenerator.prep("b",{kind:"ability",slot:0,ability:"regenerator"}),undefined);
  regenerator.start();
  const tangela = regenerator.unit("b");
  tangela.hp = 50;
  regenerator.play(move("signature"),switchTo(1));
  assert.equal(tangela.hp,50+Math.floor(tangela.maxHp/3));
});

test("U-turn pauses the round to select a replacement before the slower opponent attacks",()=>{
  const d = duel([212,50],[79]);
  assert.equal(d.prep("a",{kind:"tactic",slot:0,index:1,move:369}),undefined);
  assert.ok(d.prep("b",{kind:"tactic",slot:0,index:1,move:183}));
  d.start();
  d.play(move("369"),move("basic"));
  assert.equal(d.game.phase,"auction-pivot");
  assert.equal(d.game.battle.events[0].name,"U-turn");
  assert.ok(d.act("b",switchTo(0)));
  assert.equal(d.act("a",switchTo(1)),undefined);
  assert.equal(d.game.phase,"auction-hit");
  assert.equal(d.game.battle.events.at(-1).targetSlot,1);
});

test("held items trigger on the correct step, and item choice is reserved when Mega is purchased",()=>{
  const heal = duel([6],[4]);
  assert.equal(heal.prep("b",{kind:"item",slot:0,item:"leftovers"}),undefined);
  heal.start();
  const b = heal.unit("b");
  b.hp = 70;
  heal.play(move("182"),move("182"));
  assert.equal(b.hp,70+Math.floor(b.maxHp/16));
  assert.ok(heal.game.battle.events.some(entry=>entry.abilityEvents?.includes("Leftovers")));
  const mega = duel([6],[4]);
  const target = auctionBattlePokemon(6).megas[1];
  assert.equal(mega.prep("a",{kind:"item",slot:0,item:"focus-sash"}),undefined);
  assert.equal(mega.prep("a",{kind:"mega",slot:0,target}),undefined);
  assert.equal(mega.game.budgets.a,5);
  assert.equal(battleTeam(mega.game,"a")[0].id,6);
  assert.ok(mega.prep("a",{kind:"item",slot:0,item:"sitrus-berry"}));
  mega.start();
  mega.unit("a").hp = 70;
  mega.play(move("182",true),move("182"));
  assert.equal(mega.unit("a").id,target);
  assert.equal(mega.unit("a").hp,70);
  assert.ok(mega.game.battle.events.find(entry=>entry.toId===target));
});

test("advanced prep lasts two minutes and each trainer gets one of each held item",()=>{
  const d = duel([6,25,1],[4]);
  assert.equal(d.game.phaseEndsAt,121000);
  const equip = (uid,slot,item)=>d.prep(uid,{kind:"item",slot,item});
  assert.equal(equip("a",0,"leftovers"),undefined);
  assert.ok(equip("a",1,"leftovers"));
  assert.equal(equip("b",0,"leftovers"),undefined);
  assert.equal(equip("a",2,"focus-sash"),undefined);
  assert.equal(d.prep("a",{kind:"evolve",slot:2,target:2}),undefined);
  assert.equal(battleTeam(d.game,"a")[2].item,"focus-sash");
  assert.equal(d.prep("a",{kind:"mega",slot:0,target:auctionBattlePokemon(6).megas[0]}),undefined);
  assert.equal(equip("a",1,"leftovers"),undefined);
  assert.equal(equip("a",1,""),undefined);
  assert.equal(equip("a",2,"leftovers"),undefined);
  d.start();
  assert.equal(d.game.phase,"auction-command");
});

test("Mega Zygarde gains a special signature that hits Fairy and can equip real damaging moves",()=>{
  const d = duel([718],[35]);
  const base = battleTeam(d.game,"a")[0];
  assert.deepEqual(base.tactics,[414,482]);
  assert.equal(d.prep("a",{kind:"tactic",slot:0,index:1,move:406}),undefined);
  assert.equal(d.prep("a",{kind:"mega",slot:0,target:10301}),undefined);
  d.start();
  assert.equal(advancedMove(d.unit("a"),"signature").name,"Thousand Arrows");
  const fairy = d.unit("b");
  const preview = {...base,id:10301};
  assert.equal(auctionBattleDamage(preview,fairy,"signature",d.game,"b").factor,1);
  const damage = auctionBattleDamage(preview,fairy,"signature",d.game,"b").damage;
  assert.ok(damage>0);
  fairy.stages = {specialDefense:6};
  assert.equal(auctionBattleDamage(preview,fairy,"signature",d.game,"b").damage,damage);
  d.play(move("signature",true),move("basic"));
  assert.equal(d.unit("a").id,10301);
  assert.equal(advancedMove(d.unit("a"),"signature").kind,"special");
  assert.ok(d.game.battle.events.some(entry=>entry.name==="Nihil Light" && entry.cryId===10301 && entry.damage>0));
});

test("Focus Sash prevents a knockout once and consuming Sitrus Berry activates Unburden",()=>{
  const sash = duel([383],[462]);
  assert.equal(sash.prep("b",{kind:"item",slot:0,item:"focus-sash"}),undefined);
  sash.start();
  sash.play(move("signature"),move("basic"));
  assert.equal(sash.unit("b").hp,1);
  assert.equal(sash.unit("b").item,undefined);
  assert.ok(sash.game.battle.events.some(entry=>entry.abilityEvents?.includes("Focus Sash")));
  const berry = duel([4],[426]);
  assert.equal(berry.prep("b",{kind:"item",slot:0,item:"sitrus-berry"}),undefined);
  assert.equal(berry.prep("b",{kind:"ability",slot:0,ability:"unburden"}),undefined);
  berry.start();
  const unit = berry.unit("b");
  const half = Math.floor(unit.maxHp/2);
  unit.hp = half;
  berry.play(move("182"),move("182"));
  assert.equal(unit.hp,half+Math.floor(unit.maxHp/4));
  assert.equal(unit.unburdened,true);
  assert.equal(unit.item,undefined);
});

test("knockouts prompt for reserves, and bots and deadlines can complete a turn",()=>{
  const d = duel([383],[25,4]);
  d.start();
  d.unit("b").hp = 1;
  d.play(move("signature"),move("basic"));
  assert.equal(d.unit("b").hp,0);
  d.tick();
  assert.equal(d.game.phase,"auction-switch");
  assert.equal(d.act("b",switchTo(1)),undefined);
  assert.equal(d.game.phase,"auction-command");
  auctionDuelBot(d.game,"b",players,d.game.phaseEndsAt-1);
  assert.equal(d.game.battle.commits.b,"bot");
  d.tick();
  assert.equal(d.game.phase,"auction-reveal-moves");
  d.tick();
  assert.equal(d.game.phase,"auction-hit");
});
