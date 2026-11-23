export const letterTableMode = "board-slowa-z-woreczka";
export const letterTableDefaults = {turnTime:90};
export const letterTableInfo = {
  id:letterTableMode,name:"Plansza słów",icon:"🔠",art:"board-letter-table",players:"2–4 osoby",minPlayers:2,maxPlayers:4,
  description:"Dobieraj litery z woreczka i buduj słowa na wspólnej planszy.",
  rules:[
    "Pierwsze słowo musi przechodzić przez środek. Kolejne łącz z literami na planszy.",
    "Układaj litery w jednej linii. Liczą się także słowa, które przecinają twoje zagranie.",
    "Premie działają przy pierwszym zajęciu pola. Ułożenie wszystkich siedmiu liter daje 25 punktów.",
    "Pustej płytce wybierasz literę. Możesz też wymienić płytki lub spasować.",
    "Partia kończy się po opróżnieniu stojaka przy pustym woreczku lub po dwóch kolejkach bez zagranego słowa. Litery na stojaku odejmują punkty.",
  ],
};
export const tableSize = 13;
export const tableCenter = (tableSize ** 2 - 1) / 2;
const rackSize = 7;
const distribution = {
  a:[9,1],ą:[1,5],b:[2,3],c:[3,2],ć:[1,6],d:[3,2],e:[8,1],ę:[1,5],f:[1,5],g:[2,3],
  h:[2,4],i:[8,1],j:[2,3],k:[3,2],l:[3,2],ł:[2,4],m:[3,2],n:[6,1],ń:[1,6],o:[8,1],
  ó:[1,5],p:[3,2],r:[5,1],s:[5,1],ś:[1,5],t:[4,2],u:[2,3],w:[4,1],y:[4,2],z:[5,1],
  ź:[1,8],ż:[1,6],"?":[2,0],
};
export const tableAlphabet = Object.keys(distribution).filter(letter=>letter!=="?");
export const letterPoints = letter => distribution[letter]?.[1] ?? 0;
const premiumFields = new Map([
  ...[5,7,27,37,69,73,95,99,131,141,161,163].map(square=>[square,"l2"]),
  ...[30,34,62,106,134,138].map(square=>[square,"l3"]),
  ...[16,22,52,64,tableCenter,104,116,146,152].map(square=>[square,"w2"]),
  ...[0,12,156,168].map(square=>[square,"w3"]),
]);
export const letterPremium = square => premiumFields.get(square) || "";
const rackOf = (game,uid) => game.letterRacks?.[uid] || [];
const bagOf = game => game.letterBag || [];
const validSquare = square => Number.isInteger(square) && square>=0 && square<tableSize**2;
const vowels = /^[aąeęioóuy]$/;

function shuffle(list) {
  for(let index=list.length-1;index>0;index--){
    const swap=Math.floor(Math.random()*(index+1));
    [list[index],list[swap]]=[list[swap],list[index]];
  }
  return list;
}

export function createLetterTable(players,settings,now) {
  let id=0;
  const letterBag = shuffle(Object.entries(distribution).flatMap(([letter,[count]])=>
    Array.from({length:count},()=>({id:++id,letter}))));
  const letterRacks = Object.fromEntries(players.map(uid=>{
    const rack=letterBag.splice(0,rackSize);
    let count=rack.filter(tile=>vowels.test(tile.letter)).length;
    for(let index=0;count<2 && index<rack.length;index++){
      if(vowels.test(rack[index].letter) || rack[index].letter==="?") continue;
      const nextVowel=letterBag.findIndex(tile=>vowels.test(tile.letter));
      if(nextVowel<0) break;
      [rack[index],letterBag[nextVowel]]=[letterBag[nextVowel],rack[index]];
      count++;
    }
    return [uid,rack];
  }));
  return {
    boardMode:letterTableMode,phase:"playing",players,turnNumber:0,turnIndex:0,currentUid:players[0],
    phaseEndsAt:now+settings.turnTime*1000,finished:false,letterBag,letterRacks,
    letterBoard:{},letterPasses:0,letterHistory:[],scores:Object.fromEntries(players.map(uid=>[uid,0])),
  };
}

function adjacent(square,step) {
  const next=square+step;
  return validSquare(next) && (Math.abs(step)===tableSize || Math.floor(next/tableSize)===Math.floor(square/tableSize)) ? next : -1;
}

function wordAt(board,square,step) {
  let start=square;
  while (board[adjacent(start,-step)]) start=adjacent(start,-step);
  const cells=[];
  for(let next=start;board[next];next=adjacent(next,step)) cells.push(next);
  return cells;
}

export function previewLetterPlay(game,uid,placements) {
  if (!Array.isArray(placements) || !placements.length || placements.length>rackSize) return {error:"Połóż litery na planszy."};
  if(placements.some(tile=>!tile || typeof tile!=="object")) return {error:"Nieprawidłowe zagranie."};
  const before=game.letterBoard || {};
  const board={...before}, added=new Set(), used=new Set();
  const rack=rackOf(game,uid);
  for(const {square,id,blank} of placements){
    const tile=rack.find(item=>item.id===id);
    if(!validSquare(square) || board[square] || !tile || used.has(id)) return {error:"Wybierz wolne pola i litery ze swojego stojaka."};
    if(tile.letter==="?" && !tableAlphabet.includes(blank)) return {error:"Wybierz literę pustej płytki."};
    board[square]={id,letter:tile.letter==="?"?blank:tile.letter,blank:tile.letter==="?"};
    added.add(square);
    used.add(id);
  }
  const squares=[...added], first=squares[0];
  const sameRow=squares.every(square=>Math.floor(square/tableSize)===Math.floor(first/tableSize));
  const sameCol=squares.every(square=>square%tableSize===first%tableSize);
  if(!sameRow && !sameCol) return {error:"Ułóż płytki w jednej linii."};
  const step=sameRow?1:tableSize;
  if(squares.length>1 && !squares.every(square=>wordAt(board,first,step).includes(square))) return {error:"Uzupełnij przerwy między literami."};
  if(!Object.values(before).some(Boolean)){
    if(!added.has(tableCenter)) return {error:"Pierwsze słowo musi przechodzić przez środek."};
  }else if(!squares.some(square=>[1,-1,tableSize,-tableSize].some(offset=>before[adjacent(square,offset)]))){
    return {error:"Połącz zagranie z literami na planszy."};
  }
  const shapes=new Map();
  for(const square of squares) for(const axis of [step,step===1?tableSize:1]){
    const cells=wordAt(board,square,axis);
    if(cells.length>=2) shapes.set(`${cells[0]}:${axis}`,cells);
  }
  if(!shapes.size) return {error:"Słowo musi mieć co najmniej dwie litery."};
  const words=[...shapes.values()].map(cells=>{
    let value=0, multiplier=1;
    const text=cells.map(square=>{
      const tile=board[square];
      const premium=added.has(square)?letterPremium(square):"";
      if(premium.startsWith("w")) multiplier*=Number(premium[1]);
      value+=(tile.blank?0:letterPoints(tile.letter))*(premium.startsWith("l")?Number(premium[1]):1);
      return tile.letter;
    }).join("");
    return {text,points:value*multiplier};
  });
  return {board,used,words,points:words.reduce((total,word)=>total+word.points,0)+(used.size===rackSize?25:0)};
}

const dictionaries = new Map();
const requests = new Map();

async function loadDictionary(head) {
  if(dictionaries.has(head)) return;
  if(!requests.has(head)) requests.set(head,(async()=>{
    const url=new URL(`../assets/letter-table/dictionary/${head.charCodeAt(0)}.gz`,import.meta.url);
    const response=await fetch(url);
    if(!response.ok || !response.body) throw new Error("Słownik jest chwilowo niedostępny.");
    const data=await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).text();
    dictionaries.set(head,`\n${data}`);
  })().finally(()=>requests.delete(head)));
  await requests.get(head);
}

export async function prepareLetterDictionary(game,uid,placements) {
  const move=previewLetterPlay(game,uid,placements);
  if(!move.error) await Promise.all([...new Set(move.words.map(word=>word.text[0]))].map(loadDictionary));
  return move.error;
}

function finishTable(game,finisher,finish) {
  const leftover=Object.fromEntries(game.players.map(uid=>[uid,rackOf(game,uid).reduce((sum,tile)=>sum+letterPoints(tile.letter),0)]));
  const scores=Object.fromEntries(game.players.map(uid=>[uid,game.scores[uid]-leftover[uid]]));
  if(finisher) scores[finisher]+=Object.values(leftover).reduce((sum,value)=>sum+value,0);
  const best=Math.max(...Object.values(scores));
  finish(game,game.players.filter(uid=>scores[uid]===best),scores);
}

export function letterTableAction(game,uid,action,payload,now,settings,finish,hasWord) {
  const player=game.currentUid;
  const left=!game.players.includes(player);
  if (action==="timeout" && !left && now<game.phaseEndsAt) return;
  const late=now>=game.phaseEndsAt;
  if(action!=="timeout" && (uid!==player || left || late)) return late?"Czas na ten ruch minął.":"Poczekaj na swoją kolej.";
  const rack=rackOf(game,player), bag=[...bagOf(game)];
  let entry={uid:player,kind:"pass"}, remaining=rack;
  if(action==="letter-play"){
    const move=previewLetterPlay(game,uid,payload);
    if(move.error) return move.error;
    if(!hasWord && move.words.some(({text})=>!dictionaries.has(text[0]))) return "Wczytaj słownik ponownie.";
    const invalid=move.words.filter(({text})=>!(hasWord?hasWord(text):dictionaries.get(text[0]).includes(`\n${text}\n`)));
    if(invalid.length) return `Brak w słowniku · ${invalid.map(word=>word.text.toUpperCase()).join(", ")}`;
    game.letterBoard=move.board;
    remaining=rack.filter(tile=>!move.used.has(tile.id));
    game.scores[player]+=move.points;
    entry={uid:player,kind:"play",words:move.words,points:move.points,squares:payload.map(tile=>tile.square)};
  }else if(action==="letter-exchange"){
    const ids=new Set(Array.isArray(payload)?payload:[]);
    const returning=rack.filter(tile=>ids.has(tile.id));
    if(!ids.size || ids.size!==returning.length || ids.size>bag.length) return "Za mało liter w woreczku na tę wymianę.";
    remaining=rack.filter(tile=>!ids.has(tile.id));
    remaining.push(...bag.splice(0,ids.size));
    bag.push(...returning);
    entry={uid:player,kind:"exchange",count:ids.size};
  }else if(!["letter-pass","timeout"].includes(action)) return "Nieznany ruch.";

  if(action==="letter-play") remaining.push(...bag.splice(0,rackSize-remaining.length));
  game.letterRacks={...game.letterRacks,[player]:remaining};
  game.letterBag=bag;
  game.letterHistory=[...(game.letterHistory || []),entry].slice(-100);
  game.letterPasses=entry.kind==="play" ? 0 : (Number(game.letterPasses)||0)+1;
  game.turnNumber++;
  if (!remaining.length && !bag.length) return finishTable(game,player,finish);
  if (game.letterPasses>=game.players.length*2) return finishTable(game,"",finish);
  game.turnIndex=(game.players.indexOf(player)+1)%game.players.length;
  game.currentUid=game.players[game.turnIndex];
  game.phaseEndsAt=now+settings.turnTime*1000;
}
