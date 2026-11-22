import { tacticalLearnsets } from "./pokemonAuctionTacticsData.js?v=20261123-1";

const moves = [
  [414,"Earth Power","ground",90,10,"10% szans na obniżenie Obrony Specjalnej celu.",{kind:"special",secondary:10,targetStat:"specialDefense"}],
  [482,"Sludge Wave","poison",95,10,"10% szans na zatrucie celu.",{kind:"special",secondary:10,ailment:"poison",ailmentChance:10}],
  [406,"Dragon Pulse","dragon",85,10,"Specjalny atak typu Dragon.",{kind:"special",flags:["pulse"]}],
  [182,"Protect","normal",0,10,"Chroni przed większością ruchów w tej turze.",{effect:"protect",priority:4}],
  [14,"Swords Dance","normal",0,20,"Atak +2.",{effect:"boost",stats:{attack:2}}],
  [369,"U-turn","bug",70,20,"Po trafieniu wymienia Pokémona.",{effect:"pivot",flags:["contact"]}],
  [521,"Volt Switch","electric",70,20,"Po trafieniu wymienia Pokémona.",{effect:"pivot",kind:"special"}],
  [105,"Recover","normal",0,5,"Odnawia połowę maksymalnego HP.",{effect:"heal"}],
  [86,"Thunder Wave","electric",0,20,"Paraliżuje cel.",{effect:"status",ailment:"paralysis",accuracy:90}],
  [261,"Will-O-Wisp","fire",0,15,"Parzy cel.",{effect:"status",ailment:"burn",accuracy:85}],
  [420,"Ice Shard","ice",40,30,"Atak o podwyższonym priorytecie.",{priority:1}],
  [98,"Quick Attack","normal",40,30,"Atak o podwyższonym priorytecie.",{priority:1,flags:["contact"]}],
  [453,"Aqua Jet","water",40,20,"Atak o podwyższonym priorytecie.",{priority:1,flags:["contact"]}],
  [418,"Bullet Punch","steel",40,30,"Atak o podwyższonym priorytecie.",{priority:1,flags:["contact","punch"]}],
  [425,"Shadow Sneak","ghost",40,30,"Atak o podwyższonym priorytecie.",{priority:1,flags:["contact"]}],
  [183,"Mach Punch","fighting",40,30,"Atak o podwyższonym priorytecie.",{priority:1,flags:["contact","punch"]}],
  [417,"Nasty Plot","dark",0,20,"Atak Specjalny +2.",{effect:"boost",stats:{specialAttack:2}}],
  [347,"Calm Mind","psychic",0,20,"Atak i Obrona Specjalna +1.",{effect:"boost",stats:{specialAttack:1,specialDefense:1}}],
  [45,"Growl","normal",0,40,"Atak celu −1.",{effect:"lower",stats:{attack:-1},flags:["sound"]}],
  [97,"Agility","psychic",0,30,"Szybkość +2.",{effect:"boost",stats:{speed:2}}],
  [240,"Rain Dance","water",0,5,"Przywołuje deszcz na 5 tur.",{effect:"weather",weather:"rain"}],
  [241,"Sunny Day","fire",0,5,"Przywołuje słońce na 5 tur.",{effect:"weather",weather:"sun"}],
  [92,"Toxic","poison",0,10,"Powoduje narastające zatrucie.",{effect:"status",ailment:"toxic",accuracy:90}],
];

export const tacticalMoves = Object.fromEntries(moves.map(([id,name,type,power,pp,description,effects]) => [id,{
  id,name,type,power,basePower:power,pp,description,key:name.toLowerCase().replaceAll(" ","-"),accuracy:100,
  kind:power ? "physical" : "status",priority:0,flags:[],minHits:1,maxHits:1,crit:0,slot:String(id),...effects,
}]));

export const learnableTactics = pokemon => tacticalLearnsets[pokemon.id] || (pokemon.formKind === "mega" ? tacticalLearnsets[pokemon.baseId] : []) || [];

export const auctionHeldItems = {
  leftovers:{name:"Leftovers",description:"Odnawia 1/16 HP na koniec tury."},
  "focus-sash":{name:"Focus Sash",description:"Jednorazowo ratuje przed nokautem z pełnego HP."},
  "sitrus-berry":{name:"Sitrus Berry",description:"Przy ½ HP lub mniej odnawia ¼ maksymalnego HP."},
  "lum-berry":{name:"Lum Berry",description:"Jednorazowo usuwa status lub dezorientację."},
};

export function heldItem(unit, ability) {
  return ability === "klutz" ? "" : unit.item;
}

export function consumeItem(unit, ability, log) {
  const item = unit.item;
  delete unit.item;
  if (ability === "unburden") unit.unburdened = true;
  log(auctionHeldItems[item].name,true);
  if (ability === "unburden") log(ability);
}

export function checkHeldBerry(unit, ability, opponent, log) {
  if (!unit.hp || ["unnerve","as-one-glastrier","as-one-spectrier"].includes(opponent)) return;
  const item = heldItem(unit,ability);
  if (item === "sitrus-berry" && unit.hp * 2 <= unit.maxHp) {
    unit.hp = Math.min(unit.maxHp,unit.hp + Math.max(1,Math.floor(unit.maxHp / (ability === "ripen" ? 2 : 4))));
  } else if (item === "lum-berry" && (unit.condition || unit.confusion)) {
    delete unit.condition;
    delete unit.conditionTurns;
    delete unit.confusion;
  } else return;
  consumeItem(unit,ability,log);
  if (ability === "cheek-pouch") {
    unit.hp = Math.min(unit.maxHp,unit.hp + Math.max(1,Math.floor(unit.maxHp / 3)));
    log(ability);
  }
}
