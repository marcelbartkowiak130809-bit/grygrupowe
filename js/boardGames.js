import { Audio } from "./audio.js";
import { Effects } from "./effects.js";
import { boardPlayerStripHtml, escapeHtml, playerMiniHtml } from "./utils.js?v=20260901-3";
import { gamePassById, hasGamePass, inGamePurchaseById } from "./gamePasses.js?v=20260901-13";

export const boardModeDefinitions = [
  { id:"board-chinczyk", name:"Chińczyk", icon:"🎲", players:"2–4 osoby", minPlayers:2, maxPlayers:4, description:"Rzucaj kostką, wyprowadzaj pionki i zbijaj rywali, zanim oni zrobią to samo.", rules:["Szóstka wyprowadza pionek z bazy.","Po wyrzuceniu szóstki dostajesz dodatkowy rzut.","Pierwszy gracz z czterema pionkami w domu wygrywa."], art:"board-ludo" },
  { id:"board-slowotwor", name:"Słowotwór", icon:"🔤", players:"2–4 osoby", minPlayers:2, maxPlayers:4, description:"Układaj słowa z własnych liter i zbieraj punkty za najciekawsze zagrania.", rules:["Wykorzystuj tylko litery ze swojego stojaka.","Dłuższe słowa i pełny stojak dają więcej punktów.","Jeśli nie masz pomysłu, możesz spasować i dobrać nowe litery."], art:"board-words" },
  { id:"board-statki", name:"Statki", icon:"🚢", players:"2 osoby", minPlayers:2, maxPlayers:2, description:"Ukryj flotę, namierzaj pola przeciwnika i zatop wszystkie jego statki.", rules:["Wybierz dokładnie siedem pól dla swojej floty.","Strzelaj na zmianę — trafione i chybione pola zostają oznaczone.","Zatopienie wszystkich siedmiu pól rywala kończy mecz."], art:"board-ships" },
  { id:"board-reversi", name:"Reversi", icon:"⚫", players:"2 osoby", minPlayers:2, maxPlayers:2, description:"Otaczaj pionki przeciwnika i przejmuj planszę kawałek po kawałku.", rules:["Połóż pionek tak, aby zamknąć linię rywala między swoimi pionkami.","Wszystkie zamknięte pionki zmieniają kolor.","Jeśli nie masz ruchu, pasujesz; wygrywa większa liczba pól."], art:"board-reversi" },
  { id:"board-warcaby", name:"Warcaby", icon:"♟️", players:"2 osoby", minPlayers:2, maxPlayers:2, description:"Planuj bicia, rób damki i zablokuj wszystkie pionki przeciwnika.", rules:["Pionki poruszają się po skosie na ciemne pola.","Bicie jest obowiązkowe, gdy jest możliwe.","Pionek na końcu planszy staje się damką."], art:"board-checkers" },
  { id:"board-cztery", name:"Cztery w rzędzie", icon:"🔴", players:"2 osoby", minPlayers:2, maxPlayers:2, description:"Wrzuć cztery pionki w jednej linii — poziomo, pionowo albo po skosie.", rules:["Wybierz kolumnę, a pionek spadnie na najniższe wolne pole.","Blokuj linie przeciwnika i buduj własną.","Cztery pionki w jednej linii wygrywają; pełna plansza oznacza remis."], art:"board-connect" },
  { id:"board-memory", name:"Memory", icon:"🧠", players:"2–8 osób", minPlayers:2, maxPlayers:8, description:"Odkrywaj pary, zapamiętuj położenie kart i zbuduj największy wynik.", rules:["Odkryj dwie karty w swojej turze.","Trafiona para daje punkt i dodatkową kolejkę.","Po odkryciu wszystkich par wygrywa najwyższy wynik."], art:"board-memory" },
  { id:"board-domino", name:"Domino", icon:"🁫", players:"2–4 osoby", minPlayers:2, maxPlayers:4, description:"Dokładaj kostki do łańcucha, dobieraj sprytnie i pozbądź się ręki jako pierwszy.", rules:["Dopasuj liczbę do lewego albo prawego końca łańcucha.","Gdy nie masz ruchu, dobierz kostkę z talii.","Wygrywa osoba, która skończy rękę albo ma najmniej oczek w blokadzie."], art:"board-domino" },
];

export const boardModeDefaults = {
  "board-chinczyk": { turnTime:45 },
  "board-slowotwor": { turnTime:45, rounds:6 },
  "board-statki": { turnTime:60 },
  "board-reversi": { turnTime:60 },
  "board-warcaby": { turnTime:60 },
  "board-cztery": { turnTime:30 },
  "board-memory": { turnTime:30, pairs:8 },
  "board-domino": { turnTime:45 },
};

const shuffle = list => [...list].sort(() => Math.random() - .5);
const clamp = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const arrayOrEmpty = value => Array.isArray(value) ? value : [];
const playersFor = (players, max) => [...new Set(arrayOrEmpty(players).filter(Boolean))].slice(0, max);
const phaseEnd = seconds => Date.now() + Math.max(5, Number(seconds) || 45) * 1000;
const scoreObject = players => Object.fromEntries(players.map(uid => [uid, 0]));
const boardInfo = id => boardModeDefinitions.find(item => item.id === id) || boardModeDefinitions[0];

export function sanitizeBoardSettings(raw = {}, modeId = "") {
  const settings = { ...(boardModeDefaults[modeId] || boardModeDefaults["board-chinczyk"]), ...objectOrEmpty(raw) };
  settings.turnTime = clamp(settings.turnTime, 15, 180, boardModeDefaults[modeId]?.turnTime || 45);
  if (modeId === "board-slowotwor") settings.rounds = clamp(settings.rounds, 3, 12, 6);
  if (modeId === "board-memory") settings.pairs = clamp(settings.pairs, 4, 12, 8);
  return settings;
}

function startTurn(game, index, settings) {
  const players = arrayOrEmpty(game.players);
  if (!players.length) return;
  game.turnIndex = ((Number(index) || 0) + players.length) % players.length;
  game.currentUid = players[game.turnIndex];
  game.phaseEndsAt = phaseEnd(settings.turnTime);
}

function finishGame(game, winners = [], finalScores = null) {
  const cleanWinners = [...new Set(arrayOrEmpty(winners).filter(Boolean))];
  game.phase = "result";
  game.finished = true;
  game.finishedAt = Date.now();
  game.phaseEndsAt = 0;
  game.winners = cleanWinners;
  game.winner = cleanWinners[0] || "";
  if (finalScores) game.scores = { ...game.scores, ...finalScores };
  else cleanWinners.forEach(uid => { game.scores[uid] = (Number(game.scores[uid]) || 0) + 1; });
}

function ludoStartIndex(game, uid) { return Math.max(0, game.players.indexOf(uid)) * 10; }
function ludoAbsolute(game, uid, position) { return position >= 0 && position <= 39 ? (ludoStartIndex(game, uid) + position) % 40 : null; }
function ludoLegalMoves(game, uid) {
  const roll = Number(game.roll) || 0;
  return arrayOrEmpty(game.pieces?.[uid]).map((position, index) => {
    if (position < 0) return roll === 6 ? index : -1;
    return position + roll <= 43 ? index : -1;
  }).filter(index => index >= 0);
}
function nextLudoTurn(game, settings) { game.roll = null; startTurn(game, (Number(game.turnIndex) || 0) + 1, settings); }

function createLudo(players, settings) {
  const safePlayers = playersFor(players, 4);
  return { boardMode:"board-chinczyk", phase:"playing", players:safePlayers, currentUid:safePlayers[0] || "", turnIndex:0, roll:null, pieces:Object.fromEntries(safePlayers.map(uid => [uid, [-1,-1,-1,-1]])), scores:scoreObject(safePlayers), phaseEndsAt:phaseEnd(settings.turnTime), finished:false };
}

function createWordGame(players, settings) {
  const safePlayers = playersFor(players, 4), bag = shuffle("aaaaaaaąąąbbbbccććddeeeeeeeeeęęffgghhiiiiiijjkklllłłłmmmnnnnnnńńooóóóóppqrrrssśśśttttuuuwwyyzzźż".split(""));
  const rack = Object.fromEntries(safePlayers.map(uid => [uid, bag.splice(0, 7)]));
  return { boardMode:"board-slowotwor", phase:"playing", players:safePlayers, currentUid:safePlayers[0] || "", turnIndex:0, turnNumber:0, totalTurns:Math.max(1, Number(settings.rounds) || 6) * Math.max(1, safePlayers.length), rounds:Number(settings.rounds) || 6, bag, rack, words:[], scores:scoreObject(safePlayers), phaseEndsAt:phaseEnd(settings.turnTime), finished:false };
}

function createShips(players, settings) {
  const safePlayers = playersFor(players, 2);
  return { boardMode:"board-statki", phase:"placement", players:safePlayers, currentUid:"", turnIndex:0, fleets:{}, placementSubmitted:{}, shots:Object.fromEntries(safePlayers.map(uid => [uid, {}])), scores:scoreObject(safePlayers), phaseEndsAt:phaseEnd(settings.turnTime * 2), finished:false };
}

function createReversi(players, settings) {
  const safePlayers = playersFor(players, 2), cells=Array(64).fill(null);
  cells[27]=safePlayers[1]; cells[28]=safePlayers[0]; cells[35]=safePlayers[0]; cells[36]=safePlayers[1];
  return { boardMode:"board-reversi", phase:"playing", players:safePlayers, currentUid:safePlayers[0] || "", turnIndex:0, cells, scores:scoreObject(safePlayers), phaseEndsAt:phaseEnd(settings.turnTime), finished:false, passCount:0 };
}

function createCheckers(players, settings) {
  const safePlayers = playersFor(players, 2), pieces=[];
  safePlayers.forEach((uid, playerIndex) => {
    const rows = playerIndex === 0 ? [0,1,2] : [5,6,7];
    rows.forEach(row => { for (let col=0; col<8; col += 1) if ((row + col) % 2 === 1) pieces.push({ id:`${playerIndex}-${row}-${col}`, uid, pos:row*8+col, king:false }); });
  });
  return { boardMode:"board-warcaby", phase:"playing", players:safePlayers, currentUid:safePlayers[0] || "", turnIndex:0, pieces, scores:scoreObject(safePlayers), phaseEndsAt:phaseEnd(settings.turnTime), finished:false };
}

function createConnectFour(players, settings) {
  const safePlayers = playersFor(players, 2);
  return { boardMode:"board-cztery", phase:"playing", players:safePlayers, currentUid:safePlayers[0] || "", turnIndex:0, cells:Array(42).fill(null), scores:scoreObject(safePlayers), phaseEndsAt:phaseEnd(settings.turnTime), finished:false };
}

const memoryIcons = ["🍕","🚀","🐸","🎸","🍩","🦊","🌈","⚽","🎮","🌵","🛸","🍉"];
function createMemory(players, settings) {
  const safePlayers=playersFor(players,8), pairs=clamp(settings.pairs,4,12,8), cards=shuffle(Array.from({length:pairs},(_,pair)=>[0,1].map(side=>({id:`${pair}-${side}`,pair,value:memoryIcons[pair%memoryIcons.length],matched:false})) ).flat());
  return { boardMode:"board-memory", phase:"playing", players:safePlayers, currentUid:safePlayers[0] || "", turnIndex:0, cards, flipped:[], memorySeen:{}, scores:scoreObject(safePlayers), pairs, phaseEndsAt:phaseEnd(settings.turnTime), flipLockUntil:0, finished:false };
}

function dominoSet() { return Array.from({length:7},(_,a)=>Array.from({length:7-a},(_,offset)=>{const b=a+offset;return {id:`${a}-${b}`,a,b};})).flat(); }
function createDomino(players, settings) {
  const safePlayers=playersFor(players,4), tiles=shuffle(dominoSet()), hands=Object.fromEntries(safePlayers.map(uid=>[uid,tiles.splice(0,7)]));
  return { boardMode:"board-domino", phase:"playing", players:safePlayers, currentUid:safePlayers[0] || "", turnIndex:0, hands, boneyard:tiles, chain:[], scores:scoreObject(safePlayers), phaseEndsAt:phaseEnd(settings.turnTime), finished:false };
}

export function createBoardGame(modeId, players, rawSettings = {}) {
  const settings=sanitizeBoardSettings(rawSettings,modeId);
  let game;
  if(modeId === "board-chinczyk") game=createLudo(players,settings);
  else if(modeId === "board-slowotwor") game=createWordGame(players,settings);
  else if(modeId === "board-statki") game=createShips(players,settings);
  else if(modeId === "board-reversi") game=createReversi(players,settings);
  else if(modeId === "board-warcaby") game=createCheckers(players,settings);
  else if(modeId === "board-cztery") game=createConnectFour(players,settings);
  else if(modeId === "board-memory") game=createMemory(players,settings);
  else game=createDomino(players,settings);
  return { ...game, passUses:{}, purchaseUses:{} };
}

function ludoAction(game, uid, action, payload, settings) {
  if (game.currentUid !== uid) return "Poczekaj na swoją kolej.";
  if (action === "ludo-roll") {
    if (game.roll != null) return "Najpierw przesuń pionek.";
    game.roll=1+Math.floor(Math.random()*6);
    if (!ludoLegalMoves(game,uid).length) nextLudoTurn(game,settings);
    return;
  }
  if (action !== "ludo-move" || game.roll == null) return "Najpierw rzuć kostką.";
  const pieceIndex=Number(payload), pieces=game.pieces?.[uid] || [], position=pieces[pieceIndex];
  if (!Number.isInteger(pieceIndex) || position === undefined || !ludoLegalMoves(game,uid).includes(pieceIndex)) return "Tym pionkiem nie możesz teraz ruszyć.";
  const roll=Number(game.roll), nextPosition=position < 0 ? 0 : position + roll;
  pieces[pieceIndex]=nextPosition;
  const absolute=ludoAbsolute(game,uid,nextPosition);
  if (absolute !== null && nextPosition < 40) Object.entries(game.pieces || {}).forEach(([otherUid,otherPieces]) => { if(otherUid===uid)return; otherPieces.forEach((otherPosition,index)=>{if(ludoAbsolute(game,otherUid,otherPosition)===absolute&&otherPosition<40)otherPieces[index]=-1;}); });
  if (pieces.every(value=>value>=40)) return finishGame(game,[uid]);
  if (roll === 6 && ludoLegalMoves(game,uid).length) { game.roll=null; game.phaseEndsAt=phaseEnd(settings.turnTime); return; }
  nextLudoTurn(game,settings);
}

const validFleet = fleet => { const cells=[...new Set(arrayOrEmpty(fleet).map(Number))]; return cells.length===7 && cells.every(cell=>Number.isInteger(cell)&&cell>=0&&cell<100); };
function shipAction(game, uid, action, payload, settings) {
  if (game.phase === "placement") {
    if (action !== "ships-place") return "Najpierw ustaw swoją flotę.";
    const fleet=String(payload||"").split(",").filter(Boolean).map(Number);
    if (!validFleet(fleet)) return "Wybierz dokładnie 7 pól dla swojej floty.";
    game.fleets[uid]=fleet; game.placementSubmitted[uid]=true;
    if (game.players.every(player=>validFleet(game.fleets[player]))) { game.phase="playing"; game.currentUid=game.players[0]; game.turnIndex=0; game.phaseEndsAt=phaseEnd(settings.turnTime); }
    return;
  }
  if (action !== "ships-fire") return "Nie możesz teraz wykonać tego ruchu.";
  if (game.currentUid !== uid) return "Poczekaj na swoją kolej.";
  const target=game.players.find(player=>player!==uid), cell=Number(payload), shots=game.shots[uid] || {};
  if (!target || !Number.isInteger(cell) || cell<0 || cell>=100 || shots[cell]) return "To pole było już sprawdzane.";
  const hit=(game.fleets[target] || []).includes(cell); shots[cell]=hit?"hit":"miss"; game.shots[uid]=shots;
  if (hit && (game.fleets[target] || []).every(shipCell=>shots[shipCell]==="hit")) return finishGame(game,[uid]);
  const next=(Number(game.turnIndex)||0)+1; startTurn(game,next,settings);
}

const wordCount = text => { const counts={}; String(text).toLocaleLowerCase("pl-PL").split("").forEach(letter=>counts[letter]=(counts[letter]||0)+1); return counts; };
const wordLetterScores = { a:1,ą:1,b:3,c:2,ć:2,d:2,e:1,ę:1,f:4,g:3,h:3,i:1,j:3,k:2,l:2,ł:3,m:2,n:1,ń:4,o:1,ó:1,p:2,r:1,s:1,ś:4,t:2,u:3,w:1,y:2,z:1,ź:5,ż:5 };
const wordScore = word => [...String(word).toLocaleLowerCase("pl-PL")].reduce((sum,letter)=>sum+(wordLetterScores[letter]||1),0)+([...String(word)].length>=7?10:0);
function wordAction(game, uid, action, payload, settings) {
  if (game.currentUid !== uid) return "Poczekaj na swoją kolej.";
  if (action !== "word-submit" && action !== "word-pass") return "Nieprawidłowy ruch.";
  const rack=game.rack[uid] || [];
  if (action === "word-submit") {
    const word=String(payload||"").trim().toLocaleLowerCase("pl-PL");
    if(!/^[a-ząćęłńóśźż]{2,15}$/iu.test(word)) return "Wpisz jedno słowo złożone z 2–15 liter.";
    const need=wordCount(word), have=wordCount(rack.join(""));
    if(Object.entries(need).some(([letter,count])=>(have[letter]||0)<count)) return "Nie masz wszystkich liter tego słowa.";
    Object.entries(need).forEach(([letter,count])=>{for(let i=0;i<count;i+=1)rack.splice(rack.indexOf(letter),1);});
    while(rack.length<7&&game.bag.length)rack.push(game.bag.pop());
    const points=wordScore(word); game.words.push({uid,word,points,turn:game.turnNumber+1}); game.scores[uid]=(Number(game.scores[uid])||0)+points;
  }
  game.turnNumber+=1;
  if(game.turnNumber>=game.totalTurns){const max=Math.max(...game.players.map(player=>Number(game.scores[player])||0));return finishGame(game,game.players.filter(player=>(Number(game.scores[player])||0)===max));}
  startTurn(game,(Number(game.turnIndex)||0)+1,settings);
}

const reversiDirections=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const cellRC=cell=>[Math.floor(cell/8),cell%8];
const rcCell=(row,col)=>row*8+col;
function reversiFlips(game, uid, cell) {
  if(game.cells[cell]!==null)return [];
  const opponent=game.players.find(player=>player!==uid), [row,col]=cellRC(cell), flips=[];
  reversiDirections.forEach(([dr,dc])=>{let r=row+dr,c=col+dc,line=[];while(r>=0&&r<8&&c>=0&&c<8&&game.cells[rcCell(r,c)]===opponent){line.push(rcCell(r,c));r+=dr;c+=dc;}if(line.length&&r>=0&&r<8&&c>=0&&c<8&&game.cells[rcCell(r,c)]===uid)flips.push(...line);});
  return flips;
}
function reversiMoves(game, uid) { return game.cells.map((_,cell)=>({cell,flips:reversiFlips(game,uid,cell)})).filter(item=>item.flips.length).reduce((map,item)=>(map[item.cell]=item.flips,map),{}); }
function finishReversi(game) { const counts=Object.fromEntries(game.players.map(uid=>[uid,game.cells.filter(cell=>cell===uid).length])), max=Math.max(...Object.values(counts)); return finishGame(game,game.players.filter(uid=>counts[uid]===max),counts); }
function reversiAction(game, uid, action, payload, settings) {
  if(game.currentUid!==uid)return "Poczekaj na swoją kolej.";
  const moves=reversiMoves(game,uid);
  if(action === "reversi-pass") { if(Object.keys(moves).length)return "Masz dostępny ruch — nie możesz spasować."; game.passCount=(Number(game.passCount)||0)+1;if(game.passCount>=2)return finishReversi(game);startTurn(game,(Number(game.turnIndex)||0)+1,settings);return; }
  const cell=Number(payload), flips=moves[cell];if(!flips)return "Ten ruch nie otacza żadnego pionka.";
  game.cells[cell]=uid;flips.forEach(index=>game.cells[index]=uid);game.passCount=0;
  if(game.cells.every(Boolean))return finishReversi(game);
  const next=(Number(game.turnIndex)||0)+1, nextUid=game.players[next%game.players.length];if(Object.keys(reversiMoves(game,nextUid)).length)startTurn(game,next,settings);else if(Object.keys(reversiMoves(game,uid)).length){game.phaseEndsAt=phaseEnd(settings.turnTime);game.passCount=(Number(game.passCount)||0)+1;}else return finishReversi(game);
}

function checkersMoves(game, uid) {
  const occupied=Object.fromEntries(game.pieces.map(piece=>[piece.pos,piece])), own=game.pieces.filter(piece=>piece.uid===uid), all=[];
  own.forEach(piece=>{
    const [row,col]=cellRC(piece.pos), dirs=piece.king?[[-1,-1],[-1,1],[1,-1],[1,1]]:(uid===game.players[0]?[[1,-1],[1,1]]:[[-1,-1],[-1,1]]);
    dirs.forEach(([dr,dc])=>{const r=row+dr,c=col+dc,jump=occupied[rcCell(r,c)],simple=rcCell(r,c);if(r>=0&&r<8&&c>=0&&c<8&&!jump)all.push({id:piece.id,to:simple,capture:null});else if(jump&&jump.uid!==uid){const rr=row+2*dr,cc=col+2*dc,landing=rcCell(rr,cc);if(rr>=0&&rr<8&&cc>=0&&cc<8&&!occupied[landing])all.push({id:piece.id,to:landing,capture:jump.id});}});
  });
  const captures=all.filter(move=>move.capture);return captures.length?captures:all;
}
function checkersAction(game, uid, action, payload, settings) {
  if(game.currentUid!==uid)return "Poczekaj na swoją kolej.";
  if(action!=="checkers-move")return "Wybierz ruch pionkiem.";
  const [id,toRaw]=String(payload||"").split("|"), to=Number(toRaw), moves=checkersMoves(game,uid), move=moves.find(item=>item.id===id&&item.to===to);
  if(!move)return "Ten ruch jest niedozwolony.";
  const piece=game.pieces.find(item=>item.id===id);piece.pos=to;piece.king=piece.king||((uid===game.players[0]&&Math.floor(to/8)===7)||(uid===game.players[1]&&Math.floor(to/8)===0));if(move.capture)game.pieces=game.pieces.filter(item=>item.id!==move.capture);
  const opponents=game.pieces.filter(item=>item.uid!==uid);if(!opponents.length||!checkersMoves({...game,currentUid:opponents[0]?.uid},opponents[0]?.uid).length)return finishGame(game,[uid]);
  const more=move.capture&&checkersMoves(game,uid).some(item=>item.id===id&&item.capture);if(more){game.phaseEndsAt=phaseEnd(settings.turnTime);return;}startTurn(game,(Number(game.turnIndex)||0)+1,settings);
}

function connectAction(game, uid, action, payload, settings) {
  if(game.currentUid!==uid)return "Poczekaj na swoją kolej.";
  if(action!=="connect-drop")return "Wybierz kolumnę.";
  const col=Number(payload);if(!Number.isInteger(col)||col<0||col>6)return "Nieprawidłowa kolumna.";
  let row=-1;for(let candidate=5;candidate>=0;candidate-=1)if(!game.cells[candidate*7+col]){row=candidate;break;}if(row<0)return "Ta kolumna jest pełna.";
  game.cells[row*7+col]=uid;
  const directions=[[0,1],[1,0],[1,1],[1,-1]],hasFour=directions.some(([dr,dc])=>{let total=1;for(const sign of [-1,1]){let r=row+dr*sign,c=col+dc*sign;while(r>=0&&r<6&&c>=0&&c<7&&game.cells[r*7+c]===uid){total+=1;r+=dr*sign;c+=dc*sign;}}return total>=4;});
  if(hasFour)return finishGame(game,[uid]);if(game.cells.every(Boolean))return finishGame(game,[],scoreObject(game.players));startTurn(game,(Number(game.turnIndex)||0)+1,settings);
}

function memoryAction(game, uid, action, payload, settings) {
  const flipped=Array.isArray(game.flipped)?game.flipped:(game.flipped=[]);
  if(action === "memory-resolve") {
    if (game.currentUid !== uid) return "Tylko gracz wykonujący ruch może rozliczyć odkryte karty.";
    if(!game.flipLockUntil||Date.now()<Number(game.flipLockUntil)||flipped.length<2)return;
    const [first,second]=flipped.map(id=>game.cards.find(card=>card.id===id));
    const seen=objectOrEmpty(game.memorySeen);
    [first,second].forEach(card=>{if(card?.id)seen[card.id]=card.value;});
    game.memorySeen=seen;
    if(first?.pair===second?.pair){game.cards.forEach(card=>{if(flipped.includes(card.id))card.matched=true;});game.scores[uid]=(Number(game.scores[uid])||0)+1;game.flipped=[];game.flipLockUntil=0;if(game.cards.every(card=>card.matched))return finishGame(game,game.players.filter(player=>game.scores[player]===Math.max(...game.players.map(item=>Number(game.scores[item])||0)))) ;game.phaseEndsAt=phaseEnd(settings.turnTime);return;}
    game.flipped=[];game.flipLockUntil=0;startTurn(game,(Number(game.turnIndex)||0)+1,settings);return;
  }
  if(game.currentUid!==uid)return "Poczekaj na swoją kolej.";
  if(action!=="memory-flip"||game.flipLockUntil)return "Poczekaj, aż karty się odwrócą.";
  const id=String(payload||""),card=game.cards.find(item=>item.id===id);if(!card||card.matched||flipped.includes(id)||flipped.length>=2)return "Tej karty nie możesz teraz odkryć.";
  game.flipped.push(id);if(game.flipped.length===2)game.flipLockUntil=Date.now()+850;else game.phaseEndsAt=phaseEnd(settings.turnTime);
}

function dominoPips(hand){return arrayOrEmpty(hand).reduce((sum,tile)=>sum+Number(tile.a||0)+Number(tile.b||0),0);}
function dominoOrientedTile(tile, chain, side){
  if(!tile)return null;
  if(!chain.length)return {...tile};
  const end=side==="left"?chain[0].a:chain.at(-1).b;
  if(side==="left") {
    if(tile.b===end)return {...tile};
    if(tile.a===end)return {...tile,a:tile.b,b:tile.a};
  } else {
    if(tile.a===end)return {...tile};
    if(tile.b===end)return {...tile,a:tile.b,b:tile.a};
  }
  return null;
}
function dominoFits(tile, chain, side){return Boolean(dominoOrientedTile(tile,chain,side));}
function dominoHasMove(game, uid){return (game.hands[uid]||[]).some(tile=>dominoFits(tile,game.chain,"left")||dominoFits(tile,game.chain,"right"));}
function finishDomino(game){const pips=Object.fromEntries(game.players.map(uid=>[uid,dominoPips(game.hands[uid])]));const min=Math.min(...Object.values(pips));return finishGame(game,game.players.filter(uid=>pips[uid]===min),Object.fromEntries(game.players.map(uid=>[uid,Math.max(0,42-pips[uid])]))) ;}
function dominoAction(game, uid, action, payload, settings) {
  if(game.currentUid!==uid)return "Poczekaj na swoją kolej.";
  if(action==="domino-draw") {if(dominoHasMove(game,uid))return "Masz dostępny ruch — najpierw dołóż kostkę.";if(!game.boneyard.length)return "Nie ma już kostek do dobrania.";game.hands[uid].push(game.boneyard.pop());game.phaseEndsAt=phaseEnd(settings.turnTime);return;}
  if(action!=="domino-play")return "Dobierz kostkę albo zagraj swoją.";
  const [tileId,side]=String(payload||"").split("|"),hand=game.hands[uid]||[],index=hand.findIndex(tile=>tile.id===tileId),tile=hand[index];if(index<0||!["left","right"].includes(side)||!dominoFits(tile,game.chain,side))return "Tej kostki nie możesz tu dołożyć.";
  const placed=dominoOrientedTile(tile,game.chain,side);if(!placed)return "Tej kostki nie możesz tu dołożyć.";
  hand.splice(index,1);if(!game.chain.length)game.chain=[placed];else if(side==="left")game.chain.unshift(placed);else game.chain.push(placed);
  if(!hand.length)return finishDomino(game);if(!game.players.some(player=>dominoHasMove(game,player))&&!game.boneyard.length)return finishDomino(game);startTurn(game,(Number(game.turnIndex)||0)+1,settings);
}

const boardBotPick = (list, difficulty = "normal") => {
  const values = arrayOrEmpty(list);
  if (!values.length) return null;
  const random = Math.random();
  if (difficulty === "expert" || difficulty === "hard") return values[0];
  if (difficulty === "easy") return values[Math.floor(random * values.length)];
  return values[Math.floor(random * Math.min(values.length, 3))];
};

function boardBotFleet(uid) {
  // Statki currently uses seven occupied cells rather than ship shapes. Keep
  // the layout stable between retries, but spread it over the board so a bot
  // does not always hide an obvious horizontal row.
  let seed = [...String(uid || "bot")].reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) >>> 0, 17);
  const cells = Array.from({ length: 100 }, (_, index) => index);
  for (let index = cells.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const swap = seed % (index + 1);
    [cells[index], cells[swap]] = [cells[swap], cells[index]];
  }
  return cells.slice(0, 7);
}

const botWords = [
  "dom", "kot", "pies", "las", "most", "park", "sok", "ser", "mleko", "kawa", "lody", "pizza",
  "rower", "motor", "pociag", "samolot", "telefon", "komputer", "muzyka", "film", "gra", "plansza",
  "szkola", "lekcja", "wakacje", "morze", "gory", "rzeka", "chmura", "slonce", "deszcz", "zima",
  "wiosna", "jesien", "lato", "przyjaciel", "rodzina", "zabawa", "przygoda", "historia", "ksiazka",
  "prezent", "impreza", "taniec", "sport", "pilka", "mecz", "druzyna", "smiech", "spokoj", "marzenie",
].map(word => word.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

function wordFitsRack(word, rack) {
  const need = wordCount(word), have = wordCount(rack.join(""));
  return Object.entries(need).every(([letter, count]) => (have[letter] || 0) >= count);
}

function boardBotWord(game, uid, difficulty) {
  const rack = arrayOrEmpty(game.rack?.[uid]);
  const candidates = botWords
    .filter(word => word.length >= 2 && word.length <= 15 && wordFitsRack(word, rack))
    .map(word => ({ word, score: wordScore(word) + (word.length >= 6 ? 4 : 0) }))
    .sort((first, second) => second.score - first.score);
  if (!candidates.length) return "";
  const choices = difficulty === "easy" ? candidates.map(item => item.word) : candidates.slice(0, difficulty === "normal" ? 4 : 2).map(item => item.word);
  return boardBotPick(choices, difficulty) || choices[0];
}

function boardBotMemoryCard(game, difficulty) {
  const available = arrayOrEmpty(game.cards).filter(card => card && !card.matched && !arrayOrEmpty(game.flipped).includes(card.id));
  if (!available.length) return null;
  const seen = objectOrEmpty(game.memorySeen);
  const seenValue = card => seen[card?.id] || "";
  const knownPair = available.find(card => {
    const value = seenValue(card);
    return value && available.some(other => other !== card && seenValue(other) === value);
  });
  if (knownPair && difficulty !== "easy") return knownPair;
  if (game.flipped?.length === 1) {
    const open = game.cards.find(card => card.id === game.flipped[0]);
    const knownValue = seenValue(open);
    const partner = knownValue ? available.find(card => seenValue(card) === knownValue) : null;
    if (partner && difficulty !== "easy") return partner;
    if (difficulty === "hard" || difficulty === "expert") {
      const peekedPartner = available.find(card => card.pair === open?.pair);
      if (peekedPartner) return peekedPartner;
    }
  }
  if (difficulty === "hard" || difficulty === "expert") {
    const knownPair = available.find(card => available.some(other => other !== card && other.pair === card.pair));
    if (knownPair) return knownPair;
  }
  return available[Math.floor(Math.random() * available.length)];
}

function ludoBotMove(game, uid, difficulty) {
  const moves = ludoLegalMoves(game, uid);
  if (!moves.length) return null;
  const pieces = game.pieces?.[uid] || [];
  const scored = moves.map(index => {
    const position = Number(pieces[index]);
    const nextPosition = position < 0 ? 0 : position + Number(game.roll || 0);
    const absolute = ludoAbsolute(game, uid, nextPosition);
    const capture = absolute !== null && nextPosition < 40 && Object.entries(game.pieces || {}).some(([otherUid, otherPieces]) => otherUid !== uid && arrayOrEmpty(otherPieces).some(otherPosition => Number(otherPosition) < 40 && ludoAbsolute(game, otherUid, Number(otherPosition)) === absolute));
    return { index, score: (nextPosition >= 40 ? 1000 : nextPosition) + (position < 0 ? 55 : 0) + (capture ? 180 : 0) };
  }).sort((first, second) => second.score - first.score);
  return boardBotPick(scored.map(item => item.index), difficulty);
}

function boardBotShipShot(game, uid, difficulty) {
  const shots = objectOrEmpty(game.shots?.[uid]);
  const available = Array.from({ length: 100 }, (_, cell) => cell).filter(cell => !(String(cell) in shots));
  if (!available.length) return null;
  const adjacentToHit = Object.entries(shots).filter(([, result]) => result === "hit").flatMap(([cell]) => {
    const row = Math.floor(Number(cell) / 10), col = Number(cell) % 10;
    return [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
      .filter(([nextRow, nextCol]) => nextRow >= 0 && nextRow < 10 && nextCol >= 0 && nextCol < 10)
      .map(([nextRow, nextCol]) => nextRow * 10 + nextCol);
  }).filter(cell => available.includes(cell));
  const hunt = available.filter(cell => (Math.floor(cell / 10) + cell % 10) % 2 === 0);
  const pool = adjacentToHit.length && difficulty !== "easy" ? [...new Set(adjacentToHit)] : (difficulty === "easy" || !hunt.length ? available : hunt);
  return boardBotPick(pool, difficulty);
}

function boardBotReversiMove(game, uid, difficulty) {
  const moves = Object.entries(reversiMoves(game, uid));
  if (!moves.length) return null;
  const scored = moves.map(([cell, flips]) => {
    const index = Number(cell), row = Math.floor(index / 8), col = index % 8;
    const corner = (row === 0 || row === 7) && (col === 0 || col === 7);
    const edge = row === 0 || row === 7 || col === 0 || col === 7;
    return { cell, score: (corner ? 1000 : edge ? 35 : 0) + flips.length * (difficulty === "easy" ? 1 : 3) };
  }).sort((first, second) => second.score - first.score);
  return boardBotPick(scored.map(item => item.cell), difficulty);
}

function boardBotCheckersMove(game, uid, difficulty) {
  const moves = checkersMoves(game, uid);
  if (!moves.length) return null;
  const targetRow = game.players?.[0] === uid ? 7 : 0;
  const scored = moves.map(move => {
    const piece = game.pieces.find(item => item.id === move.id);
    const row = Math.floor(Number(move.to) / 8), col = Number(move.to) % 8;
    return { move, score: (move.capture ? 100 : 0) + (row === targetRow && !piece?.king ? 35 : 0) + (3 - Math.abs(3.5 - col)) + (difficulty === "easy" ? Math.random() * 8 : 0) };
  }).sort((first, second) => second.score - first.score);
  return boardBotPick(scored.map(item => item.move), difficulty);
}

function connectHasFour(cells, uid, row, col) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  return directions.some(([dr, dc]) => {
    let total = 1;
    for (const sign of [-1, 1]) {
      let nextRow = row + dr * sign, nextCol = col + dc * sign;
      while (nextRow >= 0 && nextRow < 6 && nextCol >= 0 && nextCol < 7 && cells[nextRow * 7 + nextCol] === uid) { total += 1; nextRow += dr * sign; nextCol += dc * sign; }
    }
    return total >= 4;
  });
}

function connectWinningColumn(game, uid, column) {
  const cells = [...arrayOrEmpty(game.cells)];
  for (let row = 5; row >= 0; row -= 1) if (!cells[row * 7 + column]) { cells[row * 7 + column] = uid; return connectHasFour(cells, uid, row, column); }
  return false;
}

function boardBotConnectColumn(game, uid, difficulty) {
  const columns = [0, 1, 2, 3, 4, 5, 6].filter(column => !game.cells?.[column]);
  if (!columns.length) return null;
  if (difficulty !== "easy") {
    const winning = columns.find(column => connectWinningColumn(game, uid, column));
    if (winning !== undefined) return winning;
    const opponent = game.players.find(player => player !== uid);
    const block = opponent && columns.find(column => connectWinningColumn(game, opponent, column));
    if (block !== undefined && (difficulty === "hard" || difficulty === "expert" || Math.random() < .75)) return block;
  }
  const preferred = [3, 2, 4, 1, 5, 0, 6].filter(column => columns.includes(column));
  return boardBotPick(preferred, difficulty);
}

function boardBotDominoMove(game, uid, difficulty) {
  const hand = arrayOrEmpty(game.hands?.[uid]);
  const moves = hand.flatMap(tile => ["left", "right"].map(side => dominoFits(tile, game.chain, side) ? { tile, side } : null).filter(Boolean));
  if (!moves.length) return null;
  const scored = moves.map(move => ({ move, score: (move.tile.a === move.tile.b ? 12 : 0) + Number(move.tile.a || 0) + Number(move.tile.b || 0) + (game.chain.length ? 2 : 0) })).sort((first, second) => second.score - first.score);
  return boardBotPick(scored.slice(0, difficulty === "easy" ? scored.length : difficulty === "normal" ? 3 : 1).map(item => item.move), difficulty);
}

/**
 * Return one legal action for a bot. The action is deliberately selected here
 * rather than in the UI so every bot move still goes through BoardEngine's
 * normal validation and multiplayer mutation path.
 */
export function boardBotAction(game, uid, difficulty = "normal") {
  if (!game || game.finished || game.phase === "result" || !game.players?.includes(uid)) return null;
  if (game.boardMode === "board-statki" && game.phase === "placement") {
    if (game.placementSubmitted?.[uid]) return null;
    return { action: "ships-place", payload: boardBotFleet(uid).join(",") };
  }
  if (game.currentUid !== uid) return null;
  if (game.boardMode === "board-chinczyk") {
    if (game.roll == null) return { action: "ludo-roll", payload: "" };
    const move = ludoBotMove(game, uid, difficulty);
    return move === null ? null : { action: "ludo-move", payload: String(move) };
  }
  if (game.boardMode === "board-slowotwor") {
    const rack = arrayOrEmpty(game.rack?.[uid]);
    const word = boardBotWord(game, uid, difficulty);
    return rack.length >= 2 && word ? { action: "word-submit", payload: word } : { action: "word-pass", payload: "" };
  }
  if (game.boardMode === "board-statki") {
    const target = boardBotShipShot(game, uid, difficulty);
    return target === null ? null : { action: "ships-fire", payload: String(target) };
  }
  if (game.boardMode === "board-reversi") {
    const target = boardBotReversiMove(game, uid, difficulty);
    return target === null ? { action: "reversi-pass", payload: "" } : { action: "reversi-move", payload: String(target) };
  }
  if (game.boardMode === "board-warcaby") {
    const move = boardBotCheckersMove(game, uid, difficulty);
    return move ? { action: "checkers-move", payload: `${move.id}|${move.to}` } : null;
  }
  if (game.boardMode === "board-cztery") {
    const target = boardBotConnectColumn(game, uid, difficulty);
    return target === null ? null : { action: "connect-drop", payload: String(target) };
  }
  if (game.boardMode === "board-memory") {
    if (game.flipLockUntil && game.flipped?.length >= 2) return { action: "memory-resolve", payload: "" };
    if (game.flipLockUntil || game.flipped?.length >= 2) return null;
    const card = boardBotMemoryCard(game, difficulty);
    return card ? { action: "memory-flip", payload: card.id } : null;
  }
  if (game.boardMode === "board-domino") {
    const move = boardBotDominoMove(game, uid, difficulty);
    if (move) return { action: "domino-play", payload: `${move.tile.id}|${move.side}` };
    return game.boneyard?.length ? { action: "domino-draw", payload: "" } : null;
  }
  return null;
}

function timeoutBoard(game, uid, settings) {
  if(game.phase!=="playing"&&game.phase!=="placement")return;
  if(game.boardMode==="board-statki"&&game.phase==="placement") { const draft=game.fleets[uid]||[0,1,2,10,11,12,13]; return shipAction(game,uid,"ships-place",draft.join(","),settings); }
  if(game.boardMode==="board-chinczyk") { if(game.currentUid===uid){if(game.roll==null)game.roll=1+Math.floor(Math.random()*6);const moves=ludoLegalMoves(game,uid);if(moves.length)return ludoAction(game,uid,"ludo-move",moves[0],settings);nextLudoTurn(game,settings);} return; }
  if(game.boardMode==="board-slowotwor")return wordAction(game,uid,"word-pass","",settings);
  if(game.boardMode==="board-reversi") { const moves=reversiMoves(game,uid),cells=Object.keys(moves); return cells.length ? reversiAction(game,uid,"reversi-move",cells[0],settings) : reversiAction(game,uid,"reversi-pass","",settings); }
  if(game.boardMode==="board-memory") { if(game.flipped?.length >= 2)return memoryAction(game,uid,"memory-resolve","",settings); game.flipped=[];game.flipLockUntil=0;return startTurn(game,(Number(game.turnIndex)||0)+1,settings); }
  if(game.boardMode==="board-domino") {const canPlay=dominoHasMove(game,uid);if(!canPlay&&game.boneyard.length)return dominoAction(game,uid,"domino-draw","",settings);if(canPlay){const tile=(game.hands[uid]||[]).find(item=>dominoFits(item,game.chain,"left")||dominoFits(item,game.chain,"right")),side=dominoFits(tile,game.chain,"left")?"left":"right";return dominoAction(game,uid,"domino-play",`${tile?.id||""}|${side}`,settings);}return startTurn(game,(Number(game.turnIndex)||0)+1,settings);}
  startTurn(game,(Number(game.turnIndex)||0)+1,settings);
}

export const BoardEngine = {
  action(game, uid, action, payload, players, rawSettings = {}) {
    const settings=sanitizeBoardSettings(rawSettings,game.boardMode);
    if(game.finished||game.phase==="result"||!game.players?.includes(uid))return game.finished||game.phase==="result"?"Ten mecz jest już zakończony.":"Nie jesteś już graczem w tym meczu.";
    const info=boardInfo(game.boardMode),activePlayers=playersFor(players,info.maxPlayers),previousPlayers=playersFor(game.players,info.maxPlayers),nextPlayers=previousPlayers.filter(player=>activePlayers.includes(player));
    if(activePlayers.length<info.minPlayers) {
      game.players=activePlayers;
      game.scores=objectOrEmpty(game.scores);
      activePlayers.forEach(player=>{if(!Number.isFinite(Number(game.scores[player])))game.scores[player]=0;});
      finishGame(game,activePlayers.length===1?activePlayers:[]);
      return;
    }
    game.players=nextPlayers.length?nextPlayers:previousPlayers;game.scores=objectOrEmpty(game.scores);game.players.forEach(player=>{if(!Number.isFinite(Number(game.scores[player])))game.scores[player]=0;});
    if(game.phase==="playing"&&game.currentUid&&!game.players.includes(game.currentUid))startTurn(game,Number(game.turnIndex)||0,settings);
    if(action === "board-extend-time") {
      const placementTurn=game.boardMode==="board-statki"&&game.phase==="placement"&&!game.placementSubmitted?.[uid];
      if(!placementTurn&&(game.phase!=="playing"||game.currentUid!==uid))return "Możesz wydłużyć tylko własny ruch.";
      const currentEnd=Number(game.phaseEndsAt||0);
      if(!Number.isFinite(currentEnd)||currentEnd<=Date.now())return "Czas na ten ruch już minął.";
      game.phaseEndsAt=currentEnd+15000;
      return;
    }
    if(action === "timeout")return timeoutBoard(game,uid,settings);
    if(game.boardMode==="board-chinczyk")return ludoAction(game,uid,action,payload,settings);
    if(game.boardMode==="board-slowotwor")return wordAction(game,uid,action,payload,settings);
    if(game.boardMode==="board-statki")return shipAction(game,uid,action,payload,settings);
    if(game.boardMode==="board-reversi")return reversiAction(game,uid,action,payload,settings);
    if(game.boardMode==="board-warcaby")return checkersAction(game,uid,action,payload,settings);
    if(game.boardMode==="board-cztery")return connectAction(game,uid,action,payload,settings);
    if(game.boardMode==="board-memory")return memoryAction(game,uid,action,payload,settings);
    return dominoAction(game,uid,action,payload,settings);
  },
  restart(game, players, settings) { const fresh=createBoardGame(game.boardMode,players,settings);Object.keys(game).forEach(key=>delete game[key]);Object.assign(game,fresh);return; },
};

export function renderBoardLobbySettings(room, isHost) {
  const mode=room.gameMode,s=sanitizeBoardSettings(room.settings,mode), timeOptions=[15,30,45,60,90,120];
  return `<div class="board-lobby-settings"><div class="board-setting-intro"><span>🎲</span><div><b>Planszówkowe ustawienia</b><small>Wybierz tempo, reszta zasad jest prosta i gotowa do gry.</small></div></div><label class="setting-row"><span>Czas na ruch</span><select data-board-setting="turnTime" ${isHost?"":"disabled"}>${timeOptions.map(value=>`<option value="${value}" ${Number(s.turnTime)===value?"selected":""}>${value} sekund</option>`).join("")}</select></label>${mode==="board-slowotwor"?`<label class="setting-row"><span>Rundy na gracza</span><select data-board-setting="rounds" ${isHost?"":"disabled"}>${[3,4,6,8,10,12].map(value=>`<option value="${value}" ${Number(s.rounds)===value?"selected":""}>${value}</option>`).join("")}</select></label>`:""}${mode==="board-memory"?`<label class="setting-row"><span>Liczba par kart</span><select data-board-setting="pairs" ${isHost?"":"disabled"}>${[4,6,8,10,12].map(value=>`<option value="${value}" ${Number(s.pairs)===value?"selected":""}>${value} par</option>`).join("")}</select></label>`:""}<p class="tiny">Jeśli ktoś nie wykona ruchu na czas, gra wykona bezpieczne pominięcie albo ruch awaryjny.</p></div>`;
}

let boardTimerId=0,boardTimeoutId=0;
export function stopBoardGameTimer(){clearInterval(boardTimerId);clearTimeout(boardTimeoutId);boardTimerId=0;boardTimeoutId=0;}
const safeName=(accounts,uid)=>escapeHtml(accounts[uid]?.nick||"Gracz");
const boardButton=(action,payload,label,disabled=false,extra="")=>`<button class="${disabled?"ghost":"primary"} board-action-button" data-board-action="${action}" data-board-payload="${escapeHtml(String(payload ?? ""))}" ${disabled?"disabled":""} ${extra}>${label}</button>`;
const boardTimer=game=>game.phaseEndsAt?`<div class="board-timer"><span>⏱</span><b data-board-timer>${Math.max(0,Math.ceil((Number(game.phaseEndsAt)-Date.now())/1000))}s</b></div>`:"";
const boardScores=(game,accounts)=>`<div class="board-score-row">${game.players.map(uid=>`<article class="${uid===game.currentUid&&game.phase==="playing"?"is-current":""}">${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid]||0)} pkt</strong></article>`).join("")}</div>`;
const boardRules=info=>`<details class="board-rules"><summary>Jak grać?</summary><div>${arrayOrEmpty(info.rules).map((rule,index)=>`<p><b>${index+1}</b>${escapeHtml(rule)}</p>`).join("")}</div></details>`;
function boardCommerceHtml(game,room,accounts,currentUser){
  const user=accounts?.[currentUser]||{}, pass=gamePassById("board-pace-control"), purchase=inGamePurchaseById("board-timeout-token");
  const ownTurn=(game.phase==="playing"&&game.currentUid===currentUser)||(game.boardMode==="board-statki"&&game.phase==="placement"&&!game.placementSubmitted?.[currentUser]);
  if(!ownTurn||!game.phaseEndsAt)return "";
  const passReady=hasGamePass(user,pass.id)&&!game.passUses?.[currentUser]?.[pass.id];
  const balance=Number(user.money??user.sessionMoney??0),purchaseReady=room.settings?.gamePurchases!==false&&!user.nickOnly&&balance>=purchase.price&&!game.purchaseUses?.[currentUser]?.[purchase.id];
  if(!passReady&&!purchaseReady)return "";
  return `<div class="board-commerce-actions"><span class="board-commerce-label">⏳ Brakuje czasu?</span>${passReady?`<button class="ghost board-commerce-button" data-board-boost="${pass.id}">${pass.icon} +15 s z gamepassa</button>`:""}${purchaseReady?`<button class="primary board-commerce-button" data-board-boost="${purchase.id}">${purchase.icon} +15 s · ${purchase.price.toLocaleString("pl-PL")}$</button>`:""}</div>`;
}
const boardAudioStates=new Map();
function boardAudioSnapshot(game,currentUser){
  const ownShots=Object.entries(game.shots?.[currentUser]||{}).sort(([a],[b])=>Number(a)-Number(b)).map(([cell,value])=>`${cell}:${value}`).join(",");
  const shotState=Object.entries(game.shots||{}).flatMap(([uid,shots])=>Object.entries(shots||{}).map(([cell,value])=>`${uid}:${cell}:${value}`)).sort().join(",");
  const pieceState=Array.isArray(game.pieces)?game.pieces.map(piece=>`${piece?.id||""}:${piece?.uid||""}:${piece?.pos??""}:${piece?.king?1:0}`).sort().join(","):Object.entries(game.pieces||{}).flatMap(([uid,pieces])=>arrayOrEmpty(pieces).map((position,index)=>`${uid}:${index}:${position}`)).sort().join(",");
  const cells=Array.isArray(game.cells)?game.cells.map(value=>value||"").join(","):"";
  const matched=Array.isArray(game.cards)?game.cards.filter(card=>card?.matched).length:0;
  const handCount=Object.values(game.hands||{}).reduce((sum,hand)=>sum+arrayOrEmpty(hand).length,0);
  const pieceCount=arrayOrEmpty(game.pieces).length||Object.values(game.pieces||{}).reduce((sum,pieces)=>sum+arrayOrEmpty(pieces).length,0),ludoHome=game.boardMode==="board-chinczyk"?Object.values(game.pieces||{}).flat().filter(position=>Number(position)<0).length:0;
  return {phase:game.phase,currentUid:game.currentUid||"",roll:game.roll??null,ownShots,shotState,pieceState,pieceCount,ludoHome,cells,words:arrayOrEmpty(game.words).length,flipped:arrayOrEmpty(game.flipped).length,matched,chain:arrayOrEmpty(game.chain).length,boneyard:arrayOrEmpty(game.boneyard).length,handCount};
}
function playBoardAudioTransitions(game,room,currentUser){
  const key=`${room.roomId}:${currentUser}`,next=boardAudioSnapshot(game,currentUser),previous=boardAudioStates.get(key);boardAudioStates.set(key,next);
  if(!previous||previous.phase===next.phase&&previous.currentUid===next.currentUid&&previous.roll===next.roll&&previous.ownShots===next.ownShots&&previous.shotState===next.shotState&&previous.pieceState===next.pieceState&&previous.pieceCount===next.pieceCount&&previous.ludoHome===next.ludoHome&&previous.cells===next.cells&&previous.words===next.words&&previous.flipped===next.flipped&&previous.matched===next.matched&&previous.chain===next.chain&&previous.boneyard===next.boneyard&&previous.handCount===next.handCount)return {finished:false};
  if(next.phase==="result"&&previous.phase!=="result")return {finished:true};
  if(previous.phase!==next.phase){Audio.play("boardTurn");return {finished:false};}
  if(previous.currentUid!==next.currentUid&&next.currentUid===currentUser)Audio.play("boardTurn");
  if(game.boardMode==="board-chinczyk"){
    if(previous.roll==null&&next.roll!=null)Audio.play("boardDice");
    else if(previous.pieceState!==next.pieceState)Audio.play(next.ludoHome>previous.ludoHome?"boardCapture":"boardMove");
  } else if(game.boardMode==="board-statki"&&previous.shotState!==next.shotState){const added=next.shotState.split(",").find(entry=>!previous.shotState.includes(entry));if(added)Audio.play(added.endsWith(":hit")?"boardHit":"boardMiss");}
  else if(game.boardMode==="board-slowotwor"&&previous.words!==next.words)Audio.play("boardWord");
  else if(game.boardMode==="board-warcaby"&&previous.pieceState!==next.pieceState)Audio.play(next.pieceCount<previous.pieceCount?"boardCapture":"boardMove");
  else if(game.boardMode==="board-cztery"&&previous.cells!==next.cells)Audio.play("boardDrop");
  else if(game.boardMode==="board-reversi"&&previous.cells!==next.cells)Audio.play("boardMove");
  else if(game.boardMode==="board-memory"){
    if(next.matched>previous.matched)Audio.play("boardPair");else if(next.flipped>previous.flipped)Audio.play("boardFlip");
  } else if(game.boardMode==="board-domino"){
    if(next.chain>previous.chain)Audio.play("boardDomino");else if(next.boneyard<previous.boneyard)Audio.play("boardDraw");
  }
  return {finished:false};
}

function renderLudo(game,accounts,currentUser){
  const boardSkin=accounts?.[currentUser]?.selectedBoardLudoSkin==="neonLudoBoard"?"neonLudoBoard":"defaultLudoBoard";
  const tokenAt=position=>game.players.flatMap(uid=>(game.pieces?.[uid]||[]).map((piece,index)=>ludoAbsolute(game,uid,piece)===position?{uid,index}:null)).filter(Boolean);
  return `<section class="board-stage board-ludo-stage"><div class="board-stage-title"><div><p class="eyebrow">CHIŃCZYK</p><h1>Wyrzuć wszystkie pionki</h1></div>${boardTimer(game)}</div><div class="ludo-board board-ludo-skin-${boardSkin}"><div class="ludo-track">${Array.from({length:40},(_,index)=>`<div class="ludo-cell ludo-cell-${index%4}"><small>${index+1}</small>${tokenAt(index).map(token=>{const canMove=token.uid===currentUser&&game.currentUid===currentUser&&game.roll!=null&&ludoLegalMoves(game,token.uid).includes(token.index);return canMove?`<button class="ludo-token ludo-token-button token-${game.players.indexOf(token.uid)}" title="Przesuń pionek" data-board-action="ludo-move" data-board-payload="${token.index}">${indexOfToken(game,token.uid,token.index)}</button>`:`<span class="ludo-token token-${game.players.indexOf(token.uid)}">${indexOfToken(game,token.uid,token.index)}</span>`;}).join("")}</div>`).join("")}</div><div class="ludo-home-grid">${game.players.map((uid,playerIndex)=>`<article class="ludo-home home-${playerIndex}"><div>${playerMiniHtml(accounts[uid])}</div><div class="ludo-home-pieces">${(game.pieces?.[uid]||[]).map((position,index)=>`<button class="ludo-home-token ${position<0?"at-home":""} ${uid===currentUser&&game.currentUid===uid&&game.roll!=null&&ludoLegalMoves(game,uid).includes(index)?"can-move":""}" data-board-action="ludo-move" data-board-payload="${index}" ${uid!==currentUser||game.currentUid!==currentUser||game.roll==null||!ludoLegalMoves(game,uid).includes(index)?"disabled":""}>${position<0?"●":position>=40?"✓":position}</button>`).join("")}</div></article>`).join("")}</div></div><div class="board-turn-banner"><b>${game.phase==="result"?"Koniec gry":game.currentUid===currentUser?"TWÓJ RUCH":"RUCH: "+safeName(accounts,game.currentUid)}</b>${game.roll!=null?`<span class="dice-result">Wyrzucono <strong>${game.roll}</strong></span>`:""}${game.currentUid===currentUser&&game.roll==null?boardButton("ludo-roll","","🎲 Rzuć kostką"):""}</div></section>`;
}
function indexOfToken(game,uid,index){return (game.pieces?.[uid]||[])[index]>=40?"✓":String(index+1);}

const fleetDrafts=new Map();
function renderShips(game,accounts,currentUser,room){
  const target=game.players.find(uid=>uid!==currentUser),draftKey=`${room.roomId}:${currentUser}`,draft=fleetDrafts.get(draftKey) || game.fleets?.[currentUser] || [],submitted=Boolean(game.placementSubmitted?.[currentUser]);
  if(game.phase==="placement")return `<section class="board-stage board-ships-stage"><div class="board-stage-title"><div><p class="eyebrow">STATKI · PRZYGOTOWANIE</p><h1>Ukryj swoją flotę</h1><p class="muted">Wybierz dokładnie 7 pól. Przeciwnik zobaczy tylko trafienia.</p></div>${boardTimer(game)}</div><div class="ships-placement-layout"><div class="ships-grid">${Array.from({length:100},(_,cell)=>`<button class="ship-cell ${draft.includes(cell)?"is-ship":""}" data-fleet-cell="${cell}" ${submitted?"disabled":""}>${draft.includes(cell)?"🚢":""}</button>`).join("")}</div><aside class="ships-help"><b>${draft.length}/7 pól</b><p>Ułóż je jak chcesz — w tej szybkiej wersji liczy się sprytne ukrycie.</p>${submitted?`<div class="waiting-state"><span>✓</span><b>Flota gotowa</b><small>Czekamy na drugiego kapitana.</small></div>`:`<form id="board-fleet-form">${boardButton("ships-place","", "⚓ Zatwierdź flotę", draft.length!==7)}</form>`}</aside></div></section>`;
  const shots=game.shots?.[currentUser]||{};
  return `<section class="board-stage board-ships-stage"><div class="board-stage-title"><div><p class="eyebrow">STATKI · BITWA</p><h1>Namierz flotę przeciwnika</h1><p class="muted">Każde pole możesz ostrzelać tylko raz.</p></div>${boardTimer(game)}</div><div class="ships-battle-layout"><div class="ships-grid battle-grid">${Array.from({length:100},(_,cell)=>`<button class="ship-cell ${shots[cell]==="hit"?"is-hit":shots[cell]==="miss"?"is-miss":""}" data-board-action="ships-fire" data-board-payload="${cell}" ${game.currentUid!==currentUser||shots[cell]?"disabled":""}>${shots[cell]==="hit"?"✦":shots[cell]==="miss"?"·":""}</button>`).join("")}</div><div class="ships-opponent-card">${playerMiniHtml(accounts[target])}<b>${game.currentUid===currentUser?"🎯 Twój ostrzał":"⏳ Przeciwnik celuje"}</b><small>Trafienia: ${Object.values(shots).filter(value=>value==="hit").length}/7</small></div></div></section>`;
}

function renderWords(game,accounts,currentUser){
  const isMine=game.currentUid===currentUser;
  return `<section class="board-stage board-words-stage"><div class="board-stage-title"><div><p class="eyebrow">SŁOWOTWÓR · RUNDA ${Math.min(Number(game.turnNumber||0)+1,game.totalTurns)}/${game.totalTurns}</p><h1>Ułóż słowo z liter</h1><p class="muted">Każda litera z twojego stojaka może zostać użyta tylko raz. Litery mają różną wartość, a 7-literowe słowo daje bonus.</p></div>${boardTimer(game)}</div><div class="words-score-layout"><div class="words-board"><div class="word-history">${arrayOrEmpty(game.words).length?game.words.map((entry,index)=>`<article style="--delay:${index}"><span>${index+1}</span>${playerMiniHtml(accounts[entry.uid])}<b>${escapeHtml(entry.word)}</b><strong>+${entry.points}</strong></article>`).join(""):`<div class="empty-board-note">Plansza czeka na pierwsze słowo.</div>`}</div><form id="board-word-form" class="board-word-form"><div class="word-rack">${(game.rack?.[currentUser]||[]).map(letter=>`<span title="${wordLetterScores[letter]||1} pkt">${escapeHtml(letter.toUpperCase())}</span>`).join("")}</div><input id="board-word-input" autocomplete="off" maxlength="15" placeholder="Wpisz słowo" ${isMine?"":"disabled"}><button class="primary" ${isMine?"":"disabled"}>Zagraj słowo</button></form>${isMine?boardButton("word-pass","","⏭ Pasuję",false,"type=\"button\""):""}</div><aside>${boardScores(game,accounts)}</aside></div></section>`;
}

function renderReversi(game,accounts,currentUser){
  const moves=reversiMoves(game,game.currentUid),isMine=game.currentUid===currentUser;
  return `<section class="board-stage board-reversi-stage"><div class="board-stage-title"><div><p class="eyebrow">REVERSI</p><h1>Przejmij więcej pól</h1><p class="muted">Kliknij podświetlone pole, aby odwrócić pionki przeciwnika.</p></div>${boardTimer(game)}</div><div class="reversi-layout"><div class="reversi-board">${game.cells.map((uid,cell)=>`<button class="reversi-cell ${uid===game.players[0]?"cell-a":uid===game.players[1]?"cell-b":""} ${isMine&&moves[cell]?"is-legal":""}" data-board-action="reversi-move" data-board-payload="${cell}" ${!isMine||!moves[cell]?"disabled":""}>${uid?"●":""}</button>`).join("")}</div><div class="board-side-card">${boardScores(game,accounts)}${isMine&&!Object.keys(moves).length?boardButton("reversi-pass","","⏭ Pasuj",false):""}<p>${isMine?"TWÓJ RUCH":"RUCH: "+safeName(accounts,game.currentUid)}</p></div></div></section>`;
}

function renderCheckers(game,accounts,currentUser){
  const moves=checkersMoves(game,game.currentUid),isMine=game.currentUid===currentUser,byCell=Object.fromEntries(moves.map(move=>[move.to,move]));
  return `<section class="board-stage board-checkers-stage"><div class="board-stage-title"><div><p class="eyebrow">WARCABY</p><h1>Zablokuj przeciwnika</h1><p class="muted">Bicie jest obowiązkowe. Pionek na końcu planszy zostaje damką.</p></div>${boardTimer(game)}</div><div class="checkers-layout"><div class="checkers-board">${Array.from({length:64},(_,cell)=>{const piece=game.pieces.find(item=>item.pos===cell),move=byCell[cell];return `<div class="checkers-cell ${cellRC(cell).reduce((a,b)=>a+b,0)%2?"dark":"light"} ${move&&isMine?"is-target":""}">${move&&isMine?boardButton("checkers-move",`${move.id}|${move.to}`,"↗",false,"type=\"button\""):piece?`<span class="checkers-piece ${piece.uid===game.players[0]?"piece-a":"piece-b"} ${piece.king?"is-king":""}">${piece.king?"♛":"●"}</span>`:""}</div>`;}).join("")}</div><div class="board-side-card">${boardScores(game,accounts)}<p>${isMine?"TWÓJ RUCH":"RUCH: "+safeName(accounts,game.currentUid)}</p></div></div></section>`;
}

function renderConnect(game,accounts,currentUser){
  const isMine=game.currentUid===currentUser;
  return `<section class="board-stage board-connect-stage"><div class="board-stage-title"><div><p class="eyebrow">CZTERY W RZĘDZIE</p><h1>Zbuduj linię z czterech</h1></div>${boardTimer(game)}</div><div class="connect-column-buttons">${Array.from({length:7},(_,col)=>boardButton("connect-drop",col,"↓",!isMine||game.cells[col])) .join("")}</div><div class="connect-board">${game.cells.map(uid=>`<span class="connect-cell ${uid===game.players[0]?"cell-a":uid===game.players[1]?"cell-b":""}">${uid?"●":""}</span>`).join("")}</div><div class="board-turn-banner"><b>${isMine?"TWÓJ RUCH":"RUCH: "+safeName(accounts,game.currentUid)}</b>${boardScores(game,accounts)}</div></section>`;
}

function renderMemory(game,accounts,currentUser){
  const isMine=game.currentUid===currentUser;
  const boardSkin=accounts?.[currentUser]?.selectedBoardMemorySkin==="holoMemoryBoard"?"holoMemoryBoard":"defaultMemoryBoard";
  const cards=arrayOrEmpty(game.cards),flipped=arrayOrEmpty(game.flipped);
  return `<section class="board-stage board-memory-stage"><div class="board-stage-title"><div><p class="eyebrow">MEMORY · ${game.pairs} PAR</p><h1>Znajdź pary</h1><p class="muted">Zapamiętaj odkryte karty. Trafiona para daje punkt i dodatkową kolejkę.</p></div>${boardTimer(game)}</div><div class="memory-board board-memory-skin-${boardSkin}">${cards.map(card=>{const open=card.matched||flipped.includes(card.id);return `<button class="memory-card ${open?"is-open":""} ${card.matched?"is-matched":""}" data-board-action="memory-flip" data-board-payload="${card.id}" ${!isMine||open||Boolean(game.flipLockUntil)?"disabled":""}><span>${open?card.value:"?"}</span></button>`;}).join("")}</div><div class="board-turn-banner"><b>${isMine?"TWÓJ RUCH":"RUCH: "+safeName(accounts,game.currentUid)}</b>${boardScores(game,accounts)}</div></section>`;
}

function renderDomino(game,accounts,currentUser){
  const hand=game.hands?.[currentUser]||[],isMine=game.currentUid===currentUser;
  return `<section class="board-stage board-domino-stage"><div class="board-stage-title"><div><p class="eyebrow">DOMINO · ${game.boneyard.length} W TALII</p><h1>Dokładaj do łańcucha</h1><p class="muted">Wybierz kostkę i stronę, do której chcesz ją dołożyć. Dobieranie jest dostępne dopiero, gdy nie masz legalnego ruchu.</p></div>${boardTimer(game)}</div><div class="domino-chain">${game.chain.length?game.chain.map(tile=>`<span class="domino-tile"><b>${tile.a}</b><i></i><b>${tile.b}</b></span>`).join(""):`<span class="empty-board-note">Pierwsza kostka może być dowolna.</span>`}</div><div class="domino-hand">${hand.map(tile=>`<article><span class="domino-tile"><b>${tile.a}</b><i></i><b>${tile.b}</b></span><div>${boardButton("domino-play",`${tile.id}|left`,"←",!isMine||!dominoFits(tile,game.chain,"left"),"type=\"button\"")}${boardButton("domino-play",`${tile.id}|right`,"→",!isMine||!dominoFits(tile,game.chain,"right"),"type=\"button\"")}</div></article>`).join("")}</div>${isMine&&game.boneyard.length&&!dominoHasMove(game,currentUser)?boardButton("domino-draw","","🎴 Dobierz kostkę",false,"type=\"button\""):""}<div class="board-turn-banner"><b>${isMine?"TWÓJ RUCH":"RUCH: "+safeName(accounts,game.currentUid)}</b>${boardScores(game,accounts)}</div></section>`;
}

function renderBoardResult(game,accounts){
  const winners=arrayOrEmpty(game.winners),max=Math.max(...game.players.map(uid=>Number(game.scores?.[uid])||0));
  return `<section class="board-stage board-result-stage"><p class="eyebrow">PLANSZÓWKA · KONIEC MECZU</p><div class="board-result-icon">🏆</div><h1>${winners.length?`Wygrywa ${winners.map(uid=>safeName(accounts,uid)).join(", ")}`:"Remis!"}</h1><p class="muted">Dobra partia. Możecie od razu zagrać jeszcze raz.</p><div class="board-final-ranking">${game.players.slice().sort((a,b)=>(Number(game.scores?.[b])||0)-(Number(game.scores?.[a])||0)).map((uid,index)=>`<article class="${winners.includes(uid)?"is-winner":""}"><b>#${index+1}</b>${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid]||0)} pkt</strong></article>`).join("")}</div></section>`;
}

export function renderBoardGame(root,{room,accounts,currentUser},actions){
  stopBoardGameTimer();
  const game=room.game, info=boardInfo(game.boardMode||room.gameMode), expected={phase:game.phase,phaseEndsAt:game.phaseEndsAt};
  const boardAudio=playBoardAudioTransitions(game,room,currentUser);
  let body=game.phase==="result"?renderBoardResult(game,accounts):game.boardMode==="board-chinczyk"?renderLudo(game,accounts,currentUser):game.boardMode==="board-statki"?renderShips(game,accounts,currentUser,room):game.boardMode==="board-slowotwor"?renderWords(game,accounts,currentUser):game.boardMode==="board-reversi"?renderReversi(game,accounts,currentUser):game.boardMode==="board-warcaby"?renderCheckers(game,accounts,currentUser):game.boardMode==="board-cztery"?renderConnect(game,accounts,currentUser):game.boardMode==="board-memory"?renderMemory(game,accounts,currentUser):renderDomino(game,accounts,currentUser);
  root.innerHTML=`<main class="page board-game-page board-shell enter">${boardPlayerStripHtml(room.players,accounts,{scores:game.scores})}<section class="board-game-heading"><span class="board-game-heading-icon">${info.icon}</span><div><p class="eyebrow">PLANSZÓWKI · ${escapeHtml(info.name.toUpperCase())}</p><h2>${escapeHtml(info.description)}</h2></div></section>${boardRules(info)}${body}${boardCommerceHtml(game,room,accounts,currentUser)}${game.phase==="result"?`<div class="board-result-actions"><button class="primary" id="board-restart" ${room.hostUid===currentUser?"":"disabled"}>🔄 Zagraj ponownie</button><button class="ghost" id="board-lobby">Wróć do lobby</button></div>`:""}<button class="ghost leave-game" id="leave-room">Wyjdź z pokoju</button></main>`;
  root.querySelector("#leave-room")?.addEventListener("click",actions.leaveRoom);root.querySelector("#board-lobby")?.addEventListener("click",actions.returnToRoom);root.querySelector("#board-restart")?.addEventListener("click",actions.boardRestart);
  root.querySelectorAll("[data-board-boost]").forEach(button=>button.addEventListener("click",()=>{
    if(button.disabled||button.dataset.boardPending)return;
    button.dataset.boardPending="1";button.disabled=true;button.classList.add("is-pending");
    actions.boardUseTimeBoost(button.dataset.boardBoost);
  }));
  root.querySelectorAll("[data-board-action]").forEach(button=>button.addEventListener("click",()=>{
    if(button.disabled||button.dataset.boardPending)return;
    button.dataset.boardPending="1";button.disabled=true;button.classList.add("is-pending");
    window.setTimeout(()=>{if(button.isConnected){button.disabled=false;delete button.dataset.boardPending;button.classList.remove("is-pending");}},900);
    actions.boardAction(button.dataset.boardAction,button.dataset.boardPayload||"",expected);
  }));
  root.querySelector("#board-word-form")?.addEventListener("submit",event=>{event.preventDefault();actions.boardAction("word-submit",root.querySelector("#board-word-input").value,expected);});
  root.querySelectorAll("[data-fleet-cell]").forEach(button=>button.addEventListener("click",()=>{const key=`${room.roomId}:${currentUser}`,draft=new Set(fleetDrafts.get(key)||game.fleets?.[currentUser]||[]),cell=Number(button.dataset.fleetCell);if(draft.has(cell))draft.delete(cell);else if(draft.size<7)draft.add(cell);fleetDrafts.set(key,[...draft]);renderBoardGame(root,{room,accounts,currentUser},actions);}));
  root.querySelector("#board-fleet-form")?.addEventListener("submit",event=>{event.preventDefault();const key=`${room.roomId}:${currentUser}`;actions.boardAction("ships-place",(fleetDrafts.get(key)||[]).join(","),expected);});
  if(game.phase==="playing"||game.phase==="placement") {
    const timerTarget=game.boardMode==="board-memory"&&game.flipLockUntil?Number(game.flipLockUntil):Number(game.phaseEndsAt||0);
    const tick=()=>{const node=root.querySelector("[data-board-timer]");if(node)node.textContent=`${Math.max(0,Math.ceil((timerTarget-Date.now())/1000))}s`;if(Date.now()>=timerTarget){stopBoardGameTimer();actions.boardAction(game.boardMode==="board-memory"&&game.flipLockUntil?"memory-resolve":"timeout","",expected);}};
    boardTimerId=window.setInterval(tick,250);tick();
  }
  if(game.boardMode==="board-memory"&&game.flipLockUntil&&Date.now()<Number(game.flipLockUntil)) { boardTimeoutId=window.setTimeout(()=>actions.boardAction("memory-resolve","",expected),Math.max(50,Number(game.flipLockUntil)-Date.now()+20)); }
  if(game.phase==="result"&&boardAudio.finished)Effects.play("boardWin",`${room.roomId}:board:${game.boardMode}:${game.finishedAt||"result"}`);
}
