import { escapeHtml } from "./utils.js?v=20260822-1";

export const sequenceDefaults={sequenceLength:5,hardMode:false,sequenceSkin:"defaultSequence"};
const baseColors=["yellow","red","orange","green","blue","purple"],hardColors=["black","white","gold","silver"];
const colorMeta={yellow:["ŻÓŁTY","YLW","#facc15"],red:["CZERWONY","RED","#ef476f"],orange:["POMARAŃCZOWY","ORG","#fb923c"],green:["ZIELONY","GRN","#22c55e"],blue:["NIEBIESKI","BLU","#3b82f6"],purple:["FIOLETOWY","PUR","#a855f7"],black:["CZARNY","BLK","#111827"],white:["BIAŁY","WHT","#f8fafc"],gold:["ZŁOTY","GLD","#fbbf24"],silver:["SREBRNY","SLV","#cbd5e1"]};
const skinClass={defaultSequence:"sequence-skin-default",neonSequence:"sequence-skin-neon",matteSequence:"sequence-skin-matte",stripeSequence:"sequence-skin-stripe",gradientSequence:"sequence-skin-gradient",premiumQuantumSequence:"sequence-skin-premiumQuantum"};
const colorsFor=hard=>hard?[...baseColors,...hardColors]:baseColors;
const GUESS_TIME_LIMIT=20;
const colorButton=(color,skin="defaultSequence")=>`<button class="sequence-color ${skinClass[skin]||skinClass.defaultSequence}" data-sequence-color="${color}" style="--sequence-color:${colorMeta[color][2]}"><span>${colorMeta[color][1]}</span><small>${colorMeta[color][0]}</small></button>`;

export function createSequenceGame(players,settings={}){
  const length=Math.max(5,Math.min(10,Number(settings.sequenceLength)||5)), selected=players.slice(0,2);
  return {mode:"sequence",phase:"create",length,hardMode:Boolean(settings.hardMode),colors:colorsFor(Boolean(settings.hardMode)),players:selected,sequences:{},drafts:Object.fromEntries(selected.map(uid=>[uid,[]])),ready:Object.fromEntries(selected.map(uid=>[uid,false])),createEndsAt:Date.now()+15000,turnUid:"",guesses:[],feedback:[],history:Object.fromEntries(selected.map(uid=>[uid,[]])),winner:"",finished:false,sequenceSkin:"defaultSequence"};
}

function ensureSequenceState(game){
  game.players=Array.isArray(game.players)?game.players.filter(Boolean).slice(0,2):[];
  game.length=Math.max(5,Math.min(10,Number(game.length)||5));
  game.colors=Array.isArray(game.colors)&&game.colors.length?game.colors:colorsFor(Boolean(game.hardMode));
  if(!game.drafts||typeof game.drafts!=="object"||Array.isArray(game.drafts))game.drafts={};
  if(!game.sequences||typeof game.sequences!=="object"||Array.isArray(game.sequences))game.sequences={};
  if(!game.ready||typeof game.ready!=="object"||Array.isArray(game.ready))game.ready={};
  if(!game.history||typeof game.history!=="object"||Array.isArray(game.history))game.history={};
  game.players.forEach(uid=>{if(!Array.isArray(game.drafts[uid]))game.drafts[uid]=[];if(typeof game.ready[uid]!=="boolean")game.ready[uid]=false;if(!Array.isArray(game.history[uid]))game.history[uid]=[];});
  if(!Array.isArray(game.guesses))game.guesses=[];
  if(!Array.isArray(game.feedback))game.feedback=[];
  if(game.phase==="create"&&!Number.isFinite(Number(game.createEndsAt)))game.createEndsAt=Date.now()+15000;
}

function startGuessing(game){
  game.phase="guess";game.turnUid=game.players[0]||"";game.drafts=Object.fromEntries(game.players.map(uid=>[uid,[]]));game.guesses=[];game.feedback=[];game.guessEndsAt=Date.now()+GUESS_TIME_LIMIT*1000;
}
function completeCreation(game){
  game.sequences=Object.fromEntries(game.players.map(uid=>[uid,[...(game.drafts[uid]||[])]]));
  startGuessing(game);
}

export function markSequenceReady(game,uid){
  ensureSequenceState(game);if(game.phase!=="create"||!game.players.includes(uid))return "Nie można teraz zatwierdzić sekwencji.";
  if((game.drafts[uid]||[]).length!==game.length)return `Wybierz ${game.length} kolorów.`;
  game.ready[uid]=true;if(game.players.every(player=>game.ready[player]))completeCreation(game);
}
export function timeoutSequenceCreation(game,expectedEndsAt){
  ensureSequenceState(game);if(game.phase!=="create"||Number(game.createEndsAt)!==Number(expectedEndsAt)||Date.now()<Number(game.createEndsAt))return "Tworzenie sekwencji jeszcze trwa albo już się zmieniło.";
  game.players.forEach(uid=>{const draft=[...(game.drafts[uid]||[])];while(draft.length<game.length)draft.push(game.colors[Math.floor(Math.random()*game.colors.length)]);game.drafts[uid]=draft;game.ready[uid]=true;});completeCreation(game);
}

export const SequenceEngine={
  draft(game,uid,color){ensureSequenceState(game);if(game.phase!=="create"||!game.players.includes(uid))return "Nie można teraz tworzyć sekwencji.";if(game.ready[uid])return "Sekwencja jest już gotowa.";if(!game.colors.includes(color))return "Nieprawidłowy kolor.";const draft=[...(game.drafts[uid]||[])];if(draft.length>=game.length)return "Sekwencja jest pełna.";draft.push(color);game.drafts[uid]=draft;},
  clearDraft(game,uid){ensureSequenceState(game);if(game.phase==="create"&&!game.ready[uid])game.drafts[uid]=[];},
  guess(game,uid,guess){
    ensureSequenceState(game);if(game.phase!=="guess"||game.turnUid!==uid)return "To nie jest Twoja kolej.";
    if(!Array.isArray(guess)||guess.length!==game.length||guess.some(color=>!game.colors.includes(color)))return "Wybierz pełną sekwencję.";
    const target=game.sequences[game.players.find(player=>player!==uid)]||[],correct=guess.filter((color,index)=>color===target[index]).length;
    const move={uid,guess:[...guess],correct,total:game.length,at:Date.now()};game.guesses.push(move);game.feedback.push(move);game.history[uid].push(move);
    if(correct===game.length){game.phase="result";game.winner=uid;game.finished=true;game.guessEndsAt=0;}else{game.turnUid=game.players.find(player=>player!==uid)||uid;game.drafts[uid]=[];game.guessEndsAt=Date.now()+GUESS_TIME_LIMIT*1000;}
  },
  timeout(game,expectedTurnUid,expectedEndsAt){
    ensureSequenceState(game);if(game.phase!=="guess"||game.turnUid!==expectedTurnUid||Number(game.guessEndsAt)!==Number(expectedEndsAt)||Date.now()<Number(game.guessEndsAt))return "Ta tura jeszcze trwa albo już się zmieniła.";
    const uid=game.turnUid,move={uid,guess:[...(game.drafts[uid]||[])],correct:0,total:game.length,timeout:true,at:Date.now()};game.guesses.push(move);game.feedback.push(move);game.history[uid].push(move);game.drafts[uid]=[];game.turnUid=game.players.find(player=>player!==uid)||uid;game.guessEndsAt=Date.now()+GUESS_TIME_LIMIT*1000;
  }
};

let createTimer=0,createCountdown=0,guessCountdown=0;
export function stopSequenceTimer(){clearTimeout(createTimer);clearInterval(createCountdown);clearInterval(guessCountdown);createTimer=0;createCountdown=0;guessCountdown=0;}
const sequenceText=(color,colorblind)=>colorblind&&color?colorMeta[color][1]:"";
const sequenceSlots=(values,length,colorblind)=>Array.from({length},(_,i)=>`<span class="sequence-slot ${values[i]?"filled":""}" style="--sequence-color:${values[i]?colorMeta[values[i]][2]:"transparent"}">${sequenceText(values[i],colorblind)}</span>`).join("");

function bindDraft(root,actions,expected){root.querySelectorAll("[data-sequence-color]").forEach(button=>button.addEventListener("click",()=>actions.sequenceDraft(button.dataset.sequenceColor,expected)));root.querySelector("#sequence-clear")?.addEventListener("click",()=>actions.sequenceClear(expected));}
function bindGuess(root,game,actions,expected){root.querySelectorAll("[data-sequence-color]").forEach(button=>button.addEventListener("click",()=>actions.sequenceGuessColor(button.dataset.sequenceColor,expected)));root.querySelector("#sequence-submit")?.addEventListener("click",()=>actions.sequenceGuess([...(game.drafts[expected.uid]||[])],expected));}
function historyHtml(game,accounts){return game.players.map(uid=>`<details class="sequence-history"><summary>${escapeHtml(accounts[uid]?.nick||"Gracz")} · ${game.history?.[uid]?.length||0} prób</summary><div>${(game.history?.[uid]||[]).map((move,index)=>`<p><b>${index+1}.</b> ${move.guess.map(color=>`<i class="sequence-history-dot" style="background:${colorMeta[color]?.[2]||"#64748b"}"></i>`).join("")} <span>${move.timeout?"Czas minął":`${move.correct}/${move.total} poprawnych`}</span></p>`).join("")||`<p class="muted">Brak prób.</p>`}</div></details>`).join("");}

export function renderSequenceGame(root,{room,currentUser,accounts},actions){
  stopSequenceTimer();const game=room.game;ensureSequenceState(game);const colorblind=Boolean(accounts[currentUser]?.colorblindMode),skin=accounts[currentUser]?.selectedSequenceSkin||game.sequenceSkin||"defaultSequence";
  if(game.phase==="result"){
    root.innerHTML=`<main class="page sequence-page"><section class="panel sequence-panel"><p class="eyebrow">ZGADNIJ SEKWENCJĘ · WYNIKI</p><h1>${escapeHtml(accounts[game.winner]?.nick||"Gracz")} odgadł sekwencję!</h1><p class="muted">Obie sekwencje i pełna historia prób pozostają widoczne do zamknięcia rundy.</p><div class="sequence-results">${game.players.map(uid=>`<article><h3>${escapeHtml(accounts[uid]?.nick||"Gracz")}</h3><div class="sequence-reveal">${sequenceSlots(game.sequences?.[uid]||[],game.length,true)}</div></article>`).join("")}</div><div class="sequence-feedback">${game.feedback.map(item=>`<div><b>${escapeHtml(accounts[item.uid]?.nick||"Gracz")}</b><span>${item.timeout?"Czas minął":`${item.correct}/${item.total} na poprawnym miejscu`}</span></div>`).join("")}</div>${historyHtml(game,accounts)}<button class="primary" id="sequence-room">Wróć do lobby</button></section></main>`;
    root.querySelector("#sequence-room").addEventListener("click",actions.returnToRoom);return;
  }
  const expected={phase:game.phase,turnUid:game.turnUid,guessEndsAt:game.guessEndsAt,createEndsAt:game.createEndsAt,uid:currentUser};
  if(game.phase==="create"){
    const draft=game.drafts[currentUser]||[],ready=Boolean(game.ready[currentUser]);root.innerHTML=`<main class="page sequence-page enter"><section class="panel sequence-panel"><p class="eyebrow">ZGADNIJ SEKWENCJĘ · TWORZENIE</p><h1>Ułóż sekwencję dla przeciwnika</h1><p class="muted">Wybierz ${game.length} kolorów. ${ready?"Sekwencja zatwierdzona — czekamy na drugiego gracza.":"Masz 15 sekund. Po zatwierdzeniu nie można jej zmienić."}</p><div class="sequence-slots">${sequenceSlots(draft,game.length,colorblind)}</div><div class="sequence-palette">${game.colors.map(color=>colorButton(color,skin)).join("")}</div><div class="sequence-actions"><button class="ghost" id="sequence-clear" ${ready?"disabled":""}>Wyczyść</button><span>${draft.length}/${game.length}</span><button class="primary" id="sequence-ready" ${ready||draft.length!==game.length?"disabled":""}>${ready?"Gotowe ✓":"Gotowe"}</button></div></section></main>`;
    bindDraft(root,actions,expected);root.querySelector("#sequence-ready")?.addEventListener("click",()=>actions.sequenceReady(expected));root.querySelectorAll("[data-sequence-color]").forEach(button=>button.disabled=ready);createCountdown=window.setInterval(()=>{if(!root.isConnected)return stopSequenceTimer();},1000);createTimer=window.setTimeout(()=>actions.sequenceCreateTimeout(expected),Math.max(100,Number(game.createEndsAt)-Date.now()+50));return;
  }
  const guess=game.drafts[currentUser]||[],isTurn=game.turnUid===currentUser;root.innerHTML=`<main class="page sequence-page enter"><section class="panel sequence-panel"><p class="eyebrow">ZGADNIJ SEKWENCJĘ · ${isTurn?"TWOJA KOLEJ":"OCZEKIWANIE"}</p><h1>Odgadnij sekwencję przeciwnika</h1><p class="muted">${isTurn?`Pozostało <b id="sequence-timer">${Math.max(0,Math.ceil((Number(game.guessEndsAt||0)-Date.now())/1000))}</b> s na próbę.`:"Przeciwnik układa próbę..."}</p><div class="sequence-slots">${sequenceSlots(guess,game.length,colorblind)}</div>${isTurn?`<div class="sequence-palette">${game.colors.map(color=>colorButton(color,skin)).join("")}</div><button class="primary" id="sequence-submit" ${guess.length!==game.length?"disabled":""}>Sprawdź sekwencję</button>`:`<p class="sequence-wait">Przeciwnik układa próbę...</p>`}<div class="sequence-feedback">${game.feedback.map(item=>`<div><b>${escapeHtml(accounts[item.uid]?.nick||"Gracz")}</b><span>${item.timeout?"Czas minął":`${item.correct}/${item.total} na poprawnym miejscu`}</span></div>`).join("")}</div></section></main>`;
  if(isTurn){bindGuess(root,game,actions,expected);guessCountdown=window.setInterval(()=>{if(!root.isConnected)return stopSequenceTimer();const seconds=Math.max(0,Math.ceil((Number(game.guessEndsAt||0)-Date.now())/1000));if(root.querySelector("#sequence-timer"))root.querySelector("#sequence-timer").textContent=seconds;if(seconds<=0){stopSequenceTimer();actions.sequenceTimeout(expected);}},250);}
}
export function renderSequenceLobbySettings(room,isHost){const s=room.settings||sequenceDefaults;return `<div class="sequence-settings"><label>Długość sekwencji <select data-sequence-setting="sequenceLength" ${isHost?"":"disabled"}>${[5,6,7,8,9,10].map(value=>`<option value="${value}" ${Number(s.sequenceLength)===value?"selected":""}>${value}</option>`).join("")}</select></label><label class="check"><input type="checkbox" data-sequence-setting="hardMode" ${s.hardMode?"checked":""} ${isHost?"":"disabled"}> Hard Mode (+ czarny, biały, złoty, srebrny)</label></div>`;}
