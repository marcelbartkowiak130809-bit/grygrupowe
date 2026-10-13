import { escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20260903-7";
import { MARKER_MIN_COVERAGE, markerInkCoverage, markerCellAt } from './markerDrawing.js?v=20261013-4';

export const markerDefaults = { boardSize:8, numberMax:50, markerSkin:"defaultMarker" };
const MARKER_TURN_TIME = 10;
const skins = { defaultMarker:"#171923", redMarker:"#ef476f", blueMarker:"#3b82f6", neonMarker:"#35f5ff", rainbowMarker:"#d946ef", premiumSpectrumMarker:"#c084fc" };
const sizeOptions=[8,10,12], rangeOptions=[20,30,40,50,60,70,80,90,100];
const shuffle=list=>{const result=[...list];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;};
const validCell=(game,value)=>value!==null && value!=='' && Number.isInteger(Number(value)) && Number(value)>=0 && Number(value)<game.size*game.size;
export function ensureMarkerState(game) {
  game=game && typeof game==='object'?game:{};
  game.size=sizeOptions.includes(Number(game.size))?Number(game.size):8;
  game.numberMax=rangeOptions.includes(Number(game.numberMax))?Number(game.numberMax):50;
  const total=game.size*game.size;
  if(!Array.isArray(game.numbers)||game.numbers.length!==total||!game.numbers.every(n=>n!==null&&n!==''&&Number.isInteger(Number(n))&&Number(n)>=0&&Number(n)<=game.numberMax))
    game.numbers=Array.from({length:total},(_,i)=>i%(game.numberMax+1));
  game.phase=['select','draw','result'].includes(game.phase)?game.phase:'select';
  game.players=[...new Set(Array.isArray(game.players)?game.players.filter(Boolean):[])].slice(0,2);
  game.marked=game.marked && typeof game.marked==='object'&&!Array.isArray(game.marked)?game.marked:{};
  game.marked=Object.fromEntries(Object.entries(game.marked).filter(([cell,marked])=>validCell(game,cell)&&marked).map(([cell])=>[cell,true]));
  game.coverage=game.coverage && typeof game.coverage==='object'&&!Array.isArray(game.coverage)?game.coverage:{};
  game.players.forEach(uid=>{if(!game.coverage[uid]||typeof game.coverage[uid]!=='object'||Array.isArray(game.coverage[uid]))game.coverage[uid]={};});
  game.turn=Math.max(0,Number(game.turn)||0);
  if(!game.players.includes(game.turnUid))game.turnUid=game.players[0]||'';
  if(game.phase==='draw' && (!validCell(game,game.selectedCell)||!game.players.includes(game.drawerUid)||!game.players.includes(game.seekerUid)||game.drawerUid===game.seekerUid)){
    game.phase='select';game.selectedCell=null;game.drawerUid='';game.seekerUid='';game.phaseEndsAt=0;
  }
  game.phaseEndsAt=game.phase==='select'?(Number(game.phaseEndsAt)>0?Number(game.phaseEndsAt):Date.now()+MARKER_TURN_TIME*1000):0;
  return game;
}
export function createMarkerGame(players,settings={}) {
  const members=[...new Set(players)].filter(Boolean).slice(0,2);
  if(members.length!==2)throw new Error('Marker wymaga dwóch różnych graczy.');
  const size=sizeOptions.includes(Number(settings.boardSize))?Number(settings.boardSize):8;
  const max=rangeOptions.includes(Number(settings.numberMax))?Number(settings.numberMax):50;
  return {mode:'marker',phase:'select',size,numberMax:max,numbers:shuffle(Array.from({length:size*size},(_,i)=>i%(max+1))),turnUid:members[Math.floor(Math.random()*members.length)],drawerUid:'',seekerUid:'',selectedCell:null,marked:{},coverage:Object.fromEntries(members.map(uid=>[uid,{}])),players:members,winner:'',turn:0,phaseEndsAt:Date.now()+MARKER_TURN_TIME*1000};
}
const opponent=(game,uid)=>game.players.find(player=>player!==uid);
function swapRoles(game) {
  game.turnUid=game.seekerUid;game.drawerUid='';game.seekerUid='';game.selectedCell=null;
  game.turn++;game.phase='select';game.phaseEndsAt=Date.now()+MARKER_TURN_TIME*1000;
}
export const MarkerEngine={
  select(game,uid,cell){
    ensureMarkerState(game);
    if(game.phase!=='select'||game.turnUid!==uid)return 'To nie jest Twoja kolej.';
    if(!validCell(game,cell)||game.marked[Number(cell)])return 'Wybierz wolne pole na planszy.';
    if(game.players.length!==2)return 'Czekamy na dwóch graczy.';
    game.selectedCell=Number(cell);game.drawerUid=uid;game.seekerUid=opponent(game,uid);game.phase='draw';game.phaseEndsAt=0;
  },
  coverage(game,uid,ratio){
    ensureMarkerState(game);
    if(game.phase!=='draw'||game.drawerUid!==uid)return 'Nie możesz teraz rysować.';
    if(game.coverage[uid][game.selectedCell]>=MARKER_MIN_COVERAGE)return 'Krzyżyk jest już zapisany.';
    const value=Number(ratio);
    if(!Number.isFinite(value)||value<MARKER_MIN_COVERAGE||value>1)return 'Narysuj większy krzyżyk na wybranym polu.';
    game.coverage[uid][game.selectedCell]=value;
  },
  find(game,uid,cell){
    ensureMarkerState(game);
    if(game.phase!=='draw'||game.seekerUid!==uid||!(game.coverage[game.drawerUid]?.[game.selectedCell]>=MARKER_MIN_COVERAGE))return 'Najpierw poczekaj na gotowy krzyżyk.';
    if(!validCell(game,cell)||game.marked[Number(cell)]||Number(game.numbers[Number(cell)])!==Number(game.numbers[game.selectedCell]))return 'To nie ta liczba — spróbuj jeszcze raz.';
    // Repeated numbers are visually indistinguishable: accept any free copy,
    // while completing the selected field shared by both players.
    game.marked[game.selectedCell]=true;
    if(Object.keys(game.marked).length===game.size*game.size){game.phase='result';game.winner=uid;game.finished=true;game.phaseEndsAt=0;}
    else swapRoles(game);
  },
  timeout(game,now=Date.now()){
    ensureMarkerState(game);
    if(game.phase!=='select')return 'Nie ma teraz odliczania.';
    if(now<game.phaseEndsAt)return 'Czas na wybór jeszcze nie minął.';
    const available=game.numbers.map((_,index)=>index).filter(index=>!game.marked[index]);
    if(!available.length){game.phase='result';game.finished=true;game.winner=game.turnUid;game.phaseEndsAt=0;return;}
    return this.select(game,game.turnUid,available[Math.floor(Math.random()*available.length)]);
  }
};
function drawCommon(canvas,game) {
  const ctx=canvas.getContext('2d'),size=canvas.width,cell=size/game.size;
  ctx.clearRect(0,0,size,size);ctx.font=`700 ${Math.max(13,cell*.27)}px Arial,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  game.numbers.forEach((number,index)=>{
    const x=(index%game.size)*cell+cell/2,y=Math.floor(index/game.size)*cell+cell/2,found=Boolean(game.marked[index]);
    ctx.fillStyle=found?'#8b93a1':'#252b3b';ctx.fillText(number,x,y);
    if(found){ctx.strokeStyle='#626b78';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-cell*.33,y);ctx.lineTo(x+cell*.33,y);ctx.stroke();}
  });
}
const drafts=new Map();
let markerTimer=0;
let captureMarkerDraft=()=>{};
export function stopMarkerTimer(){clearTimeout(markerTimer);markerTimer=0;captureMarkerDraft();captureMarkerDraft=()=>{};}
function bindCanvases(root,game,uid,actions,expected,draftKey) {
  const common=root.querySelector('[data-marker-board]');
  if(common){
    drawCommon(common,game);
    common.addEventListener('click',event=>{
      const cell=markerCellAt(common.getBoundingClientRect(),game.size,event.clientX,event.clientY);
      if(cell===null||game.marked[cell])return;
      if(game.phase==='select'&&game.turnUid===uid)actions.markerSelect(cell,expected);
      else if(game.phase==='draw'&&game.seekerUid===uid)actions.markerFind(cell,expected);
    });
  }
  const sheet=root.querySelector('[data-marker-sheet]');
  if(!sheet)return;
  const ctx=sheet.getContext('2d'),save=root.querySelector('[data-marker-save]'),clear=root.querySelector('[data-marker-clear]'),feedback=root.querySelector('[data-marker-feedback]');
  const ready=Boolean(game.coverage[uid]?.[game.selectedCell]>=MARKER_MIN_COVERAGE);
  const refresh=()=>{save.disabled=markerInkCoverage(ctx.getImageData(0,0,sheet.width,sheet.height))<MARKER_MIN_COVERAGE;};
  if(ready){
    ctx.strokeStyle=skins[game.markerSkin]||skins.defaultMarker;ctx.lineWidth=24;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(70,70);ctx.lineTo(290,290);ctx.moveTo(290,70);ctx.lineTo(70,290);ctx.stroke();drafts.delete(draftKey);return;
  }
  if(drafts.has(draftKey))ctx.putImageData(drafts.get(draftKey),0,0);
  let pointer=null,lastPoint;
  const point=event=>{const r=sheet.getBoundingClientRect();return {x:Math.max(0,Math.min(sheet.width,(event.clientX-r.left)*sheet.width/r.width)),y:Math.max(0,Math.min(sheet.height,(event.clientY-r.top)*sheet.height/r.height))};};
  const store=()=>{drafts.set(draftKey,ctx.getImageData(0,0,sheet.width,sheet.height));if(drafts.size>32)drafts.delete(drafts.keys().next().value);refresh();};
  captureMarkerDraft=store;
  sheet.addEventListener('pointerdown',event=>{
    if(pointer!==null||event.button>0)return;
    event.preventDefault();pointer=event.pointerId;sheet.setPointerCapture(pointer);lastPoint=point(event);
    ctx.strokeStyle=skins[game.markerSkin]||skins.defaultMarker;ctx.lineWidth=24;ctx.lineCap='round';feedback.textContent='';
  });
  sheet.addEventListener('pointermove',event=>{
    if(pointer!==event.pointerId)return;event.preventDefault();const p=point(event);
    ctx.beginPath();ctx.moveTo(lastPoint.x,lastPoint.y);ctx.lineTo(p.x,p.y);ctx.stroke();lastPoint=p;
  });
  const finish=event=>{if(pointer!==event.pointerId)return;pointer=null;store();};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])sheet.addEventListener(event,finish);
  clear?.addEventListener('click',()=>{ctx.clearRect(0,0,sheet.width,sheet.height);drafts.delete(draftKey);refresh();feedback.textContent='';});
  save?.addEventListener('click',async()=>{
    const ratio=markerInkCoverage(ctx.getImageData(0,0,sheet.width,sheet.height));
    if(ratio<MARKER_MIN_COVERAGE){feedback.textContent='Narysuj większy krzyżyk.';return;}
    save.disabled=true;save.textContent='Zapisuję…';
    try{await actions.markerCoverage(ratio,expected);}
    catch{feedback.textContent='Nie udało się zapisać. Spróbuj ponownie.';}
    finally{if(save.isConnected){save.textContent='Zapisz krzyżyk';refresh();}}
  });
  refresh();
}
export function renderMarkerGame(root,{room,currentUser,accounts},actions) {
  stopMarkerTimer();const game=ensureMarkerState(room?.game||{}),safeAccounts=accounts||{};
  if(game.phase==='result'){
    root.innerHTML=`<main class="page marker-page"><section class="panel marker-panel center"><p class="eyebrow">MARKER · WYNIKI</p><h1>${escapeHtml(safeAccounts[game.winner]?.nick||'Gracz')} wygrał!</h1><p class="muted">Wszystkie pola zostały poprawnie oznaczone.</p><div class="marker-result-players">${game.players.map(uid=>`<article class="marker-result-player">${resultPlayerMiniHtml(safeAccounts[uid],uid===game.winner?'win':'lose')}<strong>${uid===game.winner?'Zwycięzca':'Przegrany'}</strong></article>`).join('')}</div><button class="primary" id="marker-room">Wróć do lobby</button></section></main>`;
    root.querySelector('#marker-room').addEventListener('click',actions.returnToRoom);return;
  }
  const expected={phase:game.phase,selectedCell:game.selectedCell ?? null,phaseEndsAt:game.phaseEndsAt,turn:game.turn,turnUid:game.turnUid};
  const isDrawer=game.drawerUid===currentUser,isSeeker=game.seekerUid===currentUser;
  const ready=game.phase==='draw'&&game.coverage[game.drawerUid]?.[game.selectedCell]>=MARKER_MIN_COVERAGE;
  const showBoard=game.phase==='select'||isSeeker;
  const key=`${room?.roomId||room?.code||'marker'}:${currentUser}:${game.turn}:${game.selectedCell}`;
  const title=game.phase==='select'?(game.turnUid===currentUser?'Wybierz liczbę':'Przeciwnik wybiera liczbę'):isDrawer?(ready?'Krzyżyk zapisany':'Narysuj krzyżyk'):ready?'Znajdź wskazaną liczbę':'Przeciwnik rysuje krzyżyk';
  root.innerHTML=`<main class="page marker-page enter"><section class="panel marker-panel"><p class="eyebrow">MARKER · ${game.size}×${game.size} · 0–${game.numberMax}</p><h1>${title}</h1><div class="marker-status"><span>Pola: ${Object.keys(game.marked).length}/${game.size*game.size}</span>${game.phase==='draw'&&game.selectedCell!=null?`<b>${isDrawer?'Wybrana liczba':ready?'Znajdź liczbę':'Czekaj na gotowy krzyżyk'}${isDrawer||ready?': '+game.numbers[game.selectedCell]:''}</b>`:''}</div>${showBoard?`<canvas class="marker-board" data-marker-board width="720" height="720" aria-label="Wspólna plansza"></canvas>`:''}${isDrawer?`<div class="marker-sheet-wrap marker-zoomed-sheet"><p class="eyebrow">TWOJE POLE · WIERSZ ${Math.floor(game.selectedCell/game.size)+1} · KOLUMNA ${game.selectedCell%game.size+1}</p><canvas class="marker-sheet" data-marker-sheet width="360" height="360" aria-label="Narysuj krzyżyk na wybranym polu"></canvas>${ready?'<p class="tiny">Zapisane. Czekamy na drugiego gracza.</p>':'<div class="marker-drawing-actions"><button class="ghost" data-marker-clear>Wyczyść</button><button class="primary" data-marker-save disabled>Zapisz krzyżyk</button></div><p data-marker-feedback role="status"></p>'}</div>`:''}<p class="tiny">${game.phase==='select'?'Masz 10 sekund na wybór liczby.':isSeeker&&ready?'Kliknij dowolne wolne pole z tą liczbą.':isDrawer&&!ready?'Narysuj obie kreski i kliknij Zapisz krzyżyk.':'Czekamy na przeciwnika.'}</p></section></main>`;
  bindCanvases(root,game,currentUser,actions,expected,key);
  if(game.phase==='select'&&game.players.includes(currentUser))markerTimer=setTimeout(()=>actions.markerTimeout(expected),Math.max(100,Number(game.phaseEndsAt)-Date.now()+50));
}
export function renderMarkerLobbySettings(room,isHost) {
  const s=room.settings||markerDefaults;
  return `<div class="marker-settings"><label>Rozmiar planszy <select data-marker-setting="boardSize" ${isHost?'':'disabled'}>${sizeOptions.map(value=>`<option value="${value}" ${Number(s.boardSize)===value?'selected':''}>${value}×${value}</option>`).join('')}</select></label><label>Zakres liczb <select data-marker-setting="numberMax" ${isHost?'':'disabled'}>${rangeOptions.map(value=>`<option value="${value}" ${Number(s.numberMax)===value?'selected':''}>0–${value}</option>`).join('')}</select></label><p class="muted">Pierwszy gracz jest losowany. Narysuj krzyżyk i zapisz go, aby przeciwnik mógł znaleźć liczbę.</p></div>`;
}
