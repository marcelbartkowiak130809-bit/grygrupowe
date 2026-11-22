import { priceGuessItems } from "./priceGuessData.js?v=20261122-4";

export const priceGuessMode = "zgadnij-cene";
export const priceGuessCategories = {
  cars:{name:"Motoryzacja",symbol:"🚗"},
  home:{name:"Dom i codzienność",symbol:"🏠"},
  food:{name:"Jedzenie i napoje",symbol:"🛒"},
  tech:{name:"Elektronika",symbol:"🎧"},
  hobby:{name:"Hobby i zabawki",symbol:"🧩"},
};
export const priceGuessDefaults = {rounds:8,priceSeconds:30};
export const priceGuessRoundOptions = [3,5,8,10,12,15,20];
export const priceGuessTimeOptions = [15,20,30,45,60];
const items = new Map(priceGuessItems.map(item=>[item.id,item]));
const maximum = 1_000_000_000;

export function priceGuessSettings(raw = {}) {
  const allowed = Array.isArray(raw.priceCategories) ? [...new Set(raw.priceCategories.filter(key=>Object.hasOwn(priceGuessCategories,key)))] : [];
  const priceCategories = allowed.length ? allowed : Object.keys(priceGuessCategories);
  const count = priceGuessItems.filter(item=>priceCategories.includes(item.category)).length;
  return {
    priceCategories,
    rounds:Math.min(count,priceGuessRoundOptions.includes(Number(raw.rounds)) ? Number(raw.rounds) : priceGuessDefaults.rounds),
    priceSeconds:priceGuessTimeOptions.includes(Number(raw.priceSeconds)) ? Number(raw.priceSeconds) : priceGuessDefaults.priceSeconds,
  };
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [copy[j],copy[i]] = [copy[i],copy[j]];
  }
  return copy;
}

export function createPriceGuessGame(players,raw,now = Date.now()) {
  const settings = priceGuessSettings(raw);
  const pool = priceGuessItems.filter(item=>settings.priceCategories.includes(item.category));
  const groups = settings.priceCategories.map(category=>shuffle(pool.filter(item=>item.category===category)));
  const itemIds = [];
  while (itemIds.length<settings.rounds) {
    for (const group of shuffle(groups)) {
      if (group.length) itemIds.push(group.pop().id);
      if (itemIds.length===settings.rounds) break;
    }
  }
  return {
    mode:priceGuessMode,round:1,phase:"price-guess",phaseEndsAt:now+settings.priceSeconds*1000,
    priceSeconds:settings.priceSeconds,itemIds,guesses:{},scores:Object.fromEntries(players.map(uid=>[uid,0])),
  };
}

export const currentPriceGuessItem = game => items.get(game.itemIds?.[game.round-1]);
export const priceGuessHasAnswer = (game,uid) => Object.hasOwn(game.guesses || {},uid);
export const priceGuessRanking = (game,players) => players.map(uid=>({uid,score:game.scores?.[uid] || 0})).sort((a,b)=>b.score-a.score);

export function parsePriceGuess(raw) {
  const value = String(raw ?? "").trim().replace(/[\s\u00a0\u202f]+/g,"").replace(",",".");
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(value)) return null;
  const [zlotys,grosze=""] = value.split(".");
  const cents = Number(zlotys)*100 + Number(grosze.padEnd(2,"0"));
  return cents <= maximum ? cents : null;
}

function reveal(game,players) {
  const item = currentPriceGuessItem(game);
  const rows = players.filter(uid=>priceGuessHasAnswer(game,uid)).map(uid=>({
    uid,guess:game.guesses[uid],distance:Math.abs(game.guesses[uid]-item.cents),
  })).sort((a,b)=>a.distance-b.distance);
  game.roundWinners = rows.filter(row=>row.distance===rows[0]?.distance).map(row=>row.uid);
  for (const uid of game.roundWinners) game.scores[uid]=(game.scores[uid] || 0)+1;
  game.phase = "price-reveal";
  game.phaseEndsAt = 0;
}

export function applyPriceGuessAction(game,uid,kind,raw,players,now = Date.now()) {
  if (game.mode!==priceGuessMode || !players.includes(uid)) return "Ta partia jest niedostępna.";
  if (kind==="next" && game.phase==="price-reveal") {
    if (game.round>=game.itemIds.length) {
      const ranking = priceGuessRanking(game,players);
      game.winners = ranking.filter(row=>row.score>0 && row.score===ranking[0]?.score).map(row=>row.uid);
      game.phase = "result";
      game.finished = true;
    } else {
      game.round++;
      game.phase = "price-guess";
      game.phaseEndsAt = now+game.priceSeconds*1000;
      game.guesses = {};
      delete game.roundWinners;
    }
    return;
  }
  if (game.phase!=="price-guess") return "Ta runda już się skończyła.";
  if (!currentPriceGuessItem(game)) return "Produkt tej rundy jest niedostępny.";
  if (kind==="timeout") {
    if (now<game.phaseEndsAt && !players.every(player=>priceGuessHasAnswer(game,player))) return "Runda jeszcze trwa.";
    reveal(game,players);
    return;
  }
  if (kind!=="guess" || now>=game.phaseEndsAt || priceGuessHasAnswer(game,uid)) return "Nie możesz już zmienić odpowiedzi.";
  const guess = parsePriceGuess(raw);
  if (guess===null) return "Wpisz cenę w złotówkach, np. 12,99.";
  (game.guesses ||= {})[uid] = guess;
  if (players.every(player=>priceGuessHasAnswer(game,player))) reveal(game,players);
}

export function priceGuessBotAnswer(game,difficulty) {
  const {cents} = currentPriceGuessItem(game);
  const spread = {easy:.9,normal:.52,hard:.3,expert:.16}[difficulty] || .52;
  const estimate = Math.max(1,cents * Math.exp((Math.random()+Math.random()-1)*spread));
  const step = cents>=1_000_000 ? 50_000 : cents>=100_000 ? 5_000 : cents>=10_000 ? 500 : cents>=2_000 ? 100 : 10;
  let rounded = Math.round(estimate/step)*step;
  if (rounded===cents) rounded+=step;
  return rounded/100;
}
