import assert from "node:assert/strict";
import {test} from "node:test";
import {createPokemonGame, PokemonEngine} from "../js/pokemon.js";
import {
  auctionBattleAttack, auctionBattleBotAction, auctionBattleDamage, auctionBattlePokemon,
  auctionBattlePrep, auctionBattleSurrender, auctionBattleTimeout, battleSignatureEffectiveness, battleSlots, battleTeam, prepareAuctionBattle,
} from "../js/pokemonAuctionBattle.js";
import { gamePassById, passesForMode, pokemonBattleScoutPass } from "../js/gamePasses.js";
import { auctionAbility, auctionAbilityChoices, auctionAbilityName } from "../js/pokemonAuctionAbilities.js";
import { battleSpeciesData } from "../js/pokemonAuctionBattleData.js";

function abilityDuel(first, second, advancedAbilities = true) {
  const players = ["a","b"];
  const game = createPokemonGame("pokemon-auction",players,{battleAfterAuction:true,advancedAbilities});
  game.teams = {a:[first],b:[second]};
  prepareAuctionBattle(game,players,1000);
  for (const uid of players) auctionBattlePrep(game,uid,{kind:"ready"},players,2000);
  const unit = uid => battleTeam(game,uid)[0];
  const attack = (uid,move = "basic") => {
    game.battle.activeUid = uid;
    assert.equal(auctionBattleAttack(game,uid,{slot:0,targetSlot:0,targetUid:uid === "a" ? "b" : "a",move},players,2050),undefined);
    return game.battle.last;
  };
  return {game,unit,attack};
}

test("all auction forms have named abilities and prep only accepts legal choices",()=>{
  for (const id of Object.keys(battleSpeciesData)) {
    const options = auctionAbilityChoices(Number(id));
    assert.ok(options.length && options.every(auctionAbilityName),id);
  }
  assert.deepEqual(auctionAbilityChoices(25),["static","lightning-rod"]);
  assert.equal(auctionAbilityChoices(10035)[0],"drought");
  assert.equal(auctionAbilityChoices(10078)[0],"desolate-land");
  for (const advancedAbilities of [false,true]) {
    const game = createPokemonGame("pokemon-auction",["a","b"],{battleAfterAuction:true,advancedAbilities});
    game.teams = {a:[25],b:[7]};
    prepareAuctionBattle(game,["a","b"],0);
    const choose = ability => auctionBattlePrep(game,"a",{kind:"ability",slot:0,ability},["a","b"],1);
    assert.ok(choose("levitate"));
    assert.equal(Boolean(choose("lightning-rod")),!advancedAbilities);
    assert.equal(auctionAbility(battleTeam(game,"a")[0]),advancedAbilities ? "lightning-rod" : "static");
  }
});

test("preview is read-only and Levitate blocks a ground signature unless Mold Breaker bypasses it",()=>{
  const {game,unit,attack} = abilityDuel(383,479);
  const original = JSON.stringify(game);
  assert.equal(auctionBattleDamage(unit("a"),unit("b"),"signature",game).factor,0);
  assert.equal(JSON.stringify(game),original);
  assert.deepEqual(attack("a","signature").abilityEvents,["Drought","Levitate"]);
  assert.equal(unit("b").hp,unit("b").maxHp);
  const breaker = abilityDuel(530,479);
  breaker.unit("a").ability = "mold-breaker";
  assert.ok(auctionBattleDamage(breaker.unit("a"),breaker.unit("b"),"signature",breaker.game).damage > 0);
  const ordinary = abilityDuel(383,479,false);
  assert.ok(auctionBattleDamage(ordinary.unit("a"),ordinary.unit("b"),"signature",ordinary.game).damage > 0);
});

test("Wonder Guard, Intimidate, absorption and form changes are resolved by the battle engine",()=>{
  const shedinja = abilityDuel(130,292);
  assert.equal(shedinja.unit("b").hp,1);
  const hit = shedinja.attack("a","signature");
  assert.ok(hit.abilityEvents.includes("Wonder Guard"));
  assert.ok(hit.abilityEvents.includes("Intimidate"));
  assert.equal(shedinja.unit("b").stages.attack,-1);
  assert.equal(shedinja.unit("b").hp,1);

  const water = abilityDuel(382,134);
  water.unit("b").hp = 50;
  const absorbed = water.attack("a","signature");
  assert.ok(absorbed.abilityEvents.includes("Water Absorb"));
  assert.equal(water.unit("b").hp,50 + Math.floor(water.unit("b").maxHp / 4));

  const aegislash = abilityDuel(681,242);
  assert.ok(aegislash.attack("a").abilityEvents.includes("Stance Change"));
  assert.equal(aegislash.unit("a").id,10026);
});

const players=["a","b","c"];
const makeGame=()=>({
  teams:{a:[5,133],b:[3],c:[94]}, budgets:{a:5,b:4,c:10},
});

test("auction can branch into preparation, while the old BST result remains the default",t=>{
  t.mock.method(Date,"now",()=>10000);
  for(const battleAfterAuction of [false,true]){
    const game=createPokemonGame("pokemon-auction",players,{battleAfterAuction,teamSize:2});
    assert.equal(game.battleAfterAuction,battleAfterAuction);
    Object.assign(game,makeGame(),{phase:"auction-reveal",items:[132],auctionIndex:0,phaseEndsAt:5000});
    PokemonEngine.timeout(game,"a",players,{});
    assert.equal(game.phase,battleAfterAuction?"auction-prep":"result");
    assert.equal(Boolean(game.finished),!battleAfterAuction);
  }
  const alone={teams:{a:[5],b:[],c:[]}};
  assert.equal(prepareAuctionBattle(alone,players,1000),false);
});

test("evolutions are validated, only available once, and Mega spends auction cash once",()=>{
  const game=makeGame();
  prepareAuctionBattle(game,players,1000);
  assert.equal(game.phaseEndsAt,61000);
  const prep=(uid,kind,slot,target)=>auctionBattlePrep(game,uid,{kind,slot,target},players,2000);
  assert.ok(prep("a","evolve",0,7));
  assert.equal(prep("a","evolve",0,6),undefined);
  assert.deepEqual(battleTeam(game,"a").map(unit=>unit.id),[6,133]);
  assert.ok(prep("a","evolve",1,134));
  const [mega]=auctionBattlePokemon(6).megas;
  assert.equal(prep("a","mega",0,mega),undefined);
  assert.equal(game.budgets.a,0);
  assert.equal(battleTeam(game,"a")[0].id,mega);
  assert.equal(game.battle.prep.a.evolution.fromId,6);
  assert.equal(game.battle.prep.a.evolution.toId,mega);
  assert.equal(game.battle.prep.a.evolution.kind,"mega");
  assert.ok(prep("a","mega",0,mega));
  assert.ok(prep("b","mega",0,auctionBattlePokemon(3).megas[0]));
  assert.equal(game.budgets.b,4);
  for(const uid of players) assert.equal(prep(uid,"ready"),undefined);
  assert.equal(game.phase,"auction-battle");
});

test("lineup order locks when ready and the lead's speed determines who starts",()=>{
  const game={teams:{a:[94,143],b:[1]},budgets:{}};
  const duel=["a","b"];
  prepareAuctionBattle(game,duel,1000);
  const move={kind:"reorder",slot:1,direction:-1};
  assert.equal(auctionBattlePrep(game,"a",move,duel,2000),undefined);
  assert.deepEqual(battleSlots(game,"a"),[1,0]);
  assert.deepEqual(battleTeam(game,"a").map(unit=>unit.id),[94,143]);
  auctionBattlePrep(game,"a",{kind:"ready"},duel,2000);
  assert.match(auctionBattlePrep(game,"a",move,duel,2000),/gotowy/);
  auctionBattlePrep(game,"b",{kind:"ready"},duel,2000);
  assert.equal(game.battle.activeUid,"b");
});

test("alternate forms use the Mega slot, keep free evolution and change battle data",()=>{
  const game={teams:{a:[888,383,6,133],b:[383,6],c:[383]},budgets:{a:10,b:10,c:4}};
  prepareAuctionBattle(game,players,1000);
  const prep=(uid,kind,slot,target)=>auctionBattlePrep(game,uid,{kind,slot,target},players,2000);
  const [crowned]=auctionBattlePokemon(888).forms;
  const [primal]=auctionBattlePokemon(383).forms;
  const [mega]=auctionBattlePokemon(6).megas;
  assert.ok(prep("a","form",0,primal));
  assert.ok(prep("a","evolve",0,crowned));
  assert.equal(prep("a","form",0,crowned),undefined);
  assert.equal(game.budgets.a,5);
  assert.deepEqual(game.battle.prep.a.evolution,{slot:0,fromId:888,toId:crowned,kind:"form",sequence:1});
  assert.deepEqual(auctionBattlePokemon(crowned).types,["fairy","steel"]);
  assert.equal(auctionBattlePokemon(crowned).signature[0],"Behemoth Blade");
  assert.equal(auctionBattleDamage({id:888},{id:crowned,hp:160},"signature").factor,.5);
  assert.ok(prep("a","form",1,primal));
  assert.ok(prep("a","mega",2,mega));
  assert.equal(prep("a","evolve",3,134),undefined);
  assert.equal(game.budgets.a,5);
  assert.ok(prep("c","form",0,primal));
  assert.equal(battleTeam(game,"c")[0].id,383);
  assert.equal(game.budgets.c,4);
  game.battle.prep.c = {mega:true};
  game.budgets.c = 5;
  assert.ok(prep("c","form",0,primal));
  assert.equal(game.budgets.c,5);
  auctionBattleBotAction(game,"b",players,2000);
  assert.equal(game.battle.prep.b.ready,true);
  assert.equal(battleTeam(game,"b")[0].id,primal);
  assert.equal(game.budgets.b,5);
  assert.deepEqual(auctionBattlePokemon(primal).types,["ground","fire"]);
  assert.equal(auctionBattlePokemon(primal).stats.attack,180);
  assert.equal(auctionBattlePokemon(primal).signature[0],"Precipice Blades");
});

test("Hoopa can change form with no free evolutions in the team unless Mega used the slot",()=>{
  const game={teams:{a:[720,6],b:[720,6]},budgets:{a:10,b:10}};
  const duel=["a","b"];
  prepareAuctionBattle(game,duel,1000);
  const prep=(uid,kind,slot,target)=>auctionBattlePrep(game,uid,{kind,slot,target},duel,2000);
  assert.ok(battleTeam(game,"a").every(unit=>auctionBattlePokemon(unit.id).evolutions.length===0));
  const [unbound]=auctionBattlePokemon(720).forms;
  assert.equal(auctionBattlePokemon(unbound).name,"Hoopa Unbound");
  assert.equal(prep("a","form",0,unbound),undefined);
  assert.equal(game.budgets.a,5);
  assert.equal(battleTeam(game,"a")[0].id,unbound);
  assert.equal(game.battle.prep.a.evolved,undefined);
  const [mega]=auctionBattlePokemon(6).megas;
  assert.equal(prep("b","mega",1,mega),undefined);
  assert.match(prep("b","form",0,unbound),/wykorzystane/);
  assert.equal(game.budgets.b,5);
  assert.equal(battleTeam(game,"b")[0].id,720);
});

test("host battle rules control both allowances and the shared upgrade price",()=>{
  const game=createPokemonGame("pokemon-auction",players,{
    battleAfterAuction:true,freeEvolutions:"2",megaPrice:"8",showDamagePreview:true,
  });
  assert.deepEqual(game.battleRules,{freeEvolutions:2,megaEnabled:true,megaPrice:8,showDamagePreview:true,advancedAbilities:false});
  Object.assign(game,{teams:{a:[4,720,133],b:[4,720],c:[6]},budgets:{a:9,b:7,c:0}});
  prepareAuctionBattle(game,players,1000);
  const prep=(uid,kind,slot,target)=>auctionBattlePrep(game,uid,{kind,slot,target},players,2000);
  assert.equal(prep("a","evolve",0,5),undefined);
  assert.equal(prep("a","evolve",0,6),undefined);
  assert.match(prep("a","evolve",2,134),/Brak dostępnych/);
  assert.equal(prep("a","form",1,10086),undefined);
  assert.equal(game.budgets.a,1);
  auctionBattleBotAction(game,"b",players,2000);
  assert.deepEqual(battleTeam(game,"b").map(unit=>unit.id),[6,720]);
  assert.equal(game.budgets.b,7);
  const [mega]=auctionBattlePokemon(6).megas;
  assert.match(prep("c","mega",0,mega),/8\$/);
  game.battleRules.megaPrice=0;
  assert.equal(prep("c","mega",0,mega),undefined);
  assert.equal(game.budgets.c,0);
});

test("zero evolutions and disabled Mega are enforced and legacy usage still counts",()=>{
  const game=createPokemonGame("pokemon-auction",players,{freeEvolutions:0,megaEnabled:false,megaPrice:0});
  assert.deepEqual(game.battleRules,{freeEvolutions:0,megaEnabled:false,megaPrice:0,showDamagePreview:false,advancedAbilities:false});
  Object.assign(game,{teams:{a:[5,6,720],b:[3],c:[94]},budgets:{a:10,b:10,c:10}});
  prepareAuctionBattle(game,players,1000);
  const prep=(kind,slot,target)=>auctionBattlePrep(game,"a",{kind,slot,target},players,2000);
  assert.match(prep("evolve",0,6),/Brak dostępnych/);
  assert.match(prep("mega",1,auctionBattlePokemon(6).megas[0]),/wyłączył/);
  assert.match(prep("form",2,10086),/wyłączył/);
  assert.equal(game.budgets.a,10);
  game.battle.prep.a = {evolved:true};
  delete game.battleRules;
  assert.match(prep("evolve",0,6),/Brak dostępnych/);
});

test("surrender works off-turn, advances an active player and awards the last survivor",()=>{
  const game={teams:{a:[94],b:[1],c:[4],d:[7]},budgets:{}};
  const roster=["a","b","c","d"];
  prepareAuctionBattle(game,roster,1000);
  assert.ok(auctionBattleSurrender(game,"a",roster,2000));
  auctionBattleTimeout(game,roster,61000);
  assert.equal(game.battle.activeUid,"a");
  assert.equal(game.phaseEndsAt,81000);
  assert.equal(auctionBattleSurrender(game,"b",roster,61500),undefined);
  assert.equal(game.phaseEndsAt,81000);
  assert.equal(game.battle.activeUid,"a");
  assert.ok(auctionBattleSurrender(game,"b",roster,61600));
  assert.equal(auctionBattleSurrender(game,"a",roster,62000),undefined);
  assert.equal(game.battle.activeUid,"c");
  assert.equal(game.phaseEndsAt,82000);
  assert.equal(auctionBattleSurrender(game,"d",roster,62500),undefined);
  assert.equal(game.phase,"result");
  assert.deepEqual(game.winners,["c"]);
  assert.deepEqual(game.battle.surrendered,["b","a","d"]);
  assert.equal(game.ranking[0].uid,"c");
  assert.equal(game.ranking.find(row=>row.uid==="a").remaining,0);
});

test("type analysis matches signature effectiveness and belongs to the auction pass",()=>{
  const fire={id:6,hp:100,copiedSignature:["Fire Punch","fire",75,"physical"]};
  for (const [id,factor] of [[3,2],[25,1],[7,.5],[597,4]]) {
    const target={id,hp:100};
    assert.equal(battleSignatureEffectiveness(fire,target),factor);
    assert.equal(auctionBattleDamage(fire,target,"signature").factor,factor);
  }
  assert.equal(battleSignatureEffectiveness({id:132},{id:25}),0);
  assert.equal(gamePassById(pokemonBattleScoutPass).price,12000);
  assert.ok(passesForMode("pokemon-auction").some(item=>item.id===pokemonBattleScoutPass));
  assert.ok(!passesForMode("pokemon-dex").some(item=>item.id===pokemonBattleScoutPass));
});

test("turns, types, timeout and post-hit knockout work without reviving defeated players",()=>{
  const game=makeGame();
  prepareAuctionBattle(game,players,1000);
  auctionBattleTimeout(game,players,game.phaseEndsAt);
  assert.equal(game.battle.activeUid,"c");
  const attack={slot:0,targetUid:"b",targetSlot:0,move:"signature"};
  assert.ok(auctionBattleAttack(game,"a",attack,players,62000));
  const target=battleTeam(game,"b")[0];
  target.hp=1;
  assert.equal(auctionBattleAttack(game,"c",{...attack,move:"basic"},players,62000),undefined);
  assert.equal(game.phase,"auction-hit");
  assert.equal(target.hp,0);
  assert.ok(game.battle.last.knockedOut);
  auctionBattleTimeout(game,players,game.phaseEndsAt);
  assert.equal(game.battle.activeUid,"a");
  assert.equal(game.battle.turn,2);
  auctionBattleBotAction(game,"a",players,63000);
  assert.equal(game.phase,"auction-hit");
  auctionBattleTimeout(game,["a","b"],game.phaseEndsAt);
  assert.equal(game.phase,"result");
  assert.deepEqual(game.winners,["a"]);
  assert.equal(game.ranking[0].uid,"a");
  const electric={id:25,hp:200}, ground={id:51,hp:200};
  assert.equal(auctionBattleDamage(electric,ground,"signature").damage,0);
  assert.ok(auctionBattleDamage(electric,ground,"basic").damage>0);
});
