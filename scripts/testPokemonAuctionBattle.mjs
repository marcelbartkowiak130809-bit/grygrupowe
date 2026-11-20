import assert from "node:assert/strict";
import {test} from "node:test";
import {createPokemonGame, PokemonEngine} from "../js/pokemon.js";
import {
  auctionBattleAttack, auctionBattleBotAction, auctionBattleDamage, auctionBattlePokemon,
  auctionBattlePrep, auctionBattleTimeout, battleSlots, battleTeam, prepareAuctionBattle,
} from "../js/pokemonAuctionBattle.js";

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
  assert.equal(game.battle.prep.a.evolution.mega,true);
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
