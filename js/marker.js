import { escapeHtml, resultPlayerMiniHtml } from './utils.js?v=20260903-7';
import { markerCrossValid, markerCellAt } from './markerDrawing.js?v=20261014-5';
export const markerDefaults={boardSize:8,numberMax:50,markerSkin:'defaultMarker'};
const sizes=[8,10,12],ranges=[20,30,40,50,60,70,80,90,100];
const skins={defaultMarker:'#171923',redMarker:'#ef476f',blueMarker:'#3b82f6',neonMarker:'#35f5ff',rainbowMarker:'#d946ef',premiumSpectrumMarker:'#c084fc'};
const validCell=(g,c)=>c!==null&&c!==''&&Number.isInteger(Number(c))&&Number(c)>=0&&Number(c)<g.size*g.size;
const shuffle=list=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
const score=(g,uid)=>Object.keys(g.coverage?.[uid]||{}).length;
export function ensureMarkerState(game){
  const g=game&&typeof game==='object'?game:{};
  g.size=sizes.includes(Number(g.size))?Number(g.size):8;
  g.numberMax=ranges.includes(Number(g.numberMax))?Number(g.numberMax):50;
  g.players=[...new Set(Array.isArray(g.players)?g.players.filter(Boolean):[])].slice(0,2);
  if(!Array.isArray(g.numbers)||g.numbers.length!==g.size*g.size||!g.numbers.every(n=>Number.isInteger(n)&&n>=0&&n<=g.numberMax))g.numbers=Array.from({length:g.size*g.size},(_,i)=>i%(g.numberMax+1));
  // Older rooms used the incorrect shared-field rules. Start a fair race.
  if(g.rulesVersion!==2){g.rulesVersion=2;g.phase='select';g.coverage={};g.selectedCell=null;g.drawerUid='';g.seekerUid='';g.winner='';g.finished=false;g.marked={};g.phaseEndsAt=0;}
  if(!['select','draw','result'].includes(g.phase))g.phase='select';
  if(!g.coverage||typeof g.coverage!=='object'||Array.isArray(g.coverage))g.coverage={};
  for(const uid of g.players)g.coverage[uid]=Object.fromEntries(Object.entries(g.coverage[uid]||{}).filter(([c,v])=>validCell(g,c)&&v===true));
  g.scores=Object.fromEntries(g.players.map(uid=>[uid,score(g,uid)]));
  g.turn=Math.max(0,Number(g.turn)||0);
  if(!g.players.includes(g.turnUid))g.turnUid=g.players[0]||'';
  if(g.phase==='draw'&&(!validCell(g,g.selectedCell)||g.drawerUid!==g.turnUid||!g.players.includes(g.seekerUid)||g.seekerUid===g.drawerUid)){g.phase='select';g.selectedCell=null;}
  g.phaseEndsAt=g.phase==='select'?(Number(g.phaseEndsAt)>0?Number(g.phaseEndsAt):Date.now()+10000):0;
  return g;
}
export function createMarkerGame(players,settings={}){
  const members=[...new Set(players)].filter(Boolean).slice(0,2);
  if(members.length!==2)throw new Error('Marker wymaga dwóch różnych graczy.');
  const size=sizes.includes(Number(settings.boardSize))?Number(settings.boardSize):8;
  const max=ranges.includes(Number(settings.numberMax))?Number(settings.numberMax):50;
  return ensureMarkerState({rulesVersion:2,mode:'marker',phase:'select',players:members,size,numberMax:max,numbers:shuffle(Array.from({length:size*size},(_,i)=>i%(max+1))),turnUid:members[Math.floor(Math.random()*2)],coverage:{},turn:0,selectedCell:null,drawerUid:'',seekerUid:'',winner:'',finished:false});
}
export const MarkerEngine={
  select(game,uid,cell){const g=ensureMarkerState(game);if(g.phase!=='select'||g.turnUid!==uid)return 'To nie jest Twoja kolej.';if(!validCell(g,cell))return 'Wybierz liczbę na planszy.';if(g.players.length!==2)return 'Czekamy na dwóch graczy.';g.selectedCell=Number(cell);g.drawerUid=uid;g.seekerUid=g.players.find(p=>p!==uid);g.phase='draw';g.phaseEndsAt=0;},
  coverage(game,uid,cell,strokes){const g=ensureMarkerState(game);if(g.phase!=='draw'||g.drawerUid!==uid)return 'Nie możesz teraz rysować.';if(!validCell(g,cell)||g.coverage[uid][Number(cell)])return 'To pole jest już zapełnione lub nie istnieje.';if(!markerCrossValid(strokes))return 'Narysuj dwie duże, przecinające się kreski w jednym polu.';g.coverage[uid][Number(cell)]=true;g.scores[uid]=score(g,uid);if(score(g,uid)===g.size*g.size){g.phase='result';g.winner=uid;g.finished=true;g.phaseEndsAt=0;}},
  find(game,uid,cell){const g=ensureMarkerState(game);if(g.phase!=='draw'||g.seekerUid!==uid)return 'Teraz nie szukasz liczby.';if(!validCell(g,cell)||g.numbers[Number(cell)]!==g.numbers[g.selectedCell])return 'To nie ta liczba — spróbuj jeszcze raz.';g.turnUid=uid;g.drawerUid='';g.seekerUid='';g.selectedCell=null;g.turn++;g.phase='select';g.phaseEndsAt=Date.now()+10000;},
  timeout(game,now=Date.now()){const g=ensureMarkerState(game);if(g.phase!=='select'||now<g.phaseEndsAt)return 'Czas na wybór jeszcze nie minął.';return this.select(g,g.turnUid,Math.floor(Math.random()*g.numbers.length));}
};
let markerTimer=0;
export function stopMarkerTimer(){clearTimeout(markerTimer);markerTimer=0;}
export const markerViewKey=(room,uid)=>`${room.roomId||room.code||'marker'}:${room.game?.turn||0}:${room.game?.phase}:${uid}`;
function drawNumbers(canvas,g){const ctx=canvas.getContext('2d'),w=canvas.width,c=w/g.size;ctx.clearRect(0,0,w,w);ctx.font=`700 ${Math.max(13,c*.27)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#252b3b';g.numbers.forEach((n,i)=>ctx.fillText(n,(i%g.size+.5)*c,(Math.floor(i/g.size)+.5)*c));}
function paintCross(ctx,size,cell,index,color){const x=index%size*cell,y=Math.floor(index/size)*cell;ctx.strokeStyle=color;ctx.lineWidth=Math.max(3,cell*.09);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+cell*.16,y+cell*.16);ctx.lineTo(x+cell*.84,y+cell*.84);ctx.moveTo(x+cell*.84,y+cell*.16);ctx.lineTo(x+cell*.16,y+cell*.84);ctx.stroke();}
function bindDrawing(page,uid,actions,expected){
  const canvas=page.querySelector('[data-marker-sheet]');if(!canvas)return;
  const ctx=canvas.getContext('2d'),g=page.__markerGame,w=canvas.width,c=w/g.size;
  const lines=new Map(),pending=new Set();let pointer=null,cell=null,points=[];
  const color=()=>skins[page.__markerGame.markerSkin]||skins.defaultMarker;
  const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*w/r.width,(e.clientY-r.top)*w/r.height];};
  const redraw=()=>{ctx.clearRect(0,0,w,w);ctx.strokeStyle='#d8cdb9';ctx.lineWidth=1;for(let i=1;i<g.size;i++){ctx.beginPath();ctx.moveTo(i*c,0);ctx.lineTo(i*c,w);ctx.moveTo(0,i*c);ctx.lineTo(w,i*c);ctx.stroke();}for(const key of Object.keys(page.__markerGame.coverage[uid]))paintCross(ctx,g.size,c,Number(key),color());for(const [index,strokes] of lines){ctx.strokeStyle=color();ctx.lineWidth=Math.max(3,c*.09);for(const path of strokes){ctx.beginPath();path.forEach((p,i)=>ctx[i?'lineTo':'moveTo']((index%g.size+p[0])*c,(Math.floor(index/g.size)+p[1])*c));ctx.stroke();}}};
  page.__paintProgress=()=>{for(const key of Object.keys(page.__markerGame.coverage[uid])){lines.delete(Number(key));paintCross(ctx,g.size,c,Number(key),color());}};redraw();
  canvas.addEventListener('pointerdown',e=>{if(pointer!==null||e.button>0||page.__markerGame.phase!=='draw')return;const index=markerCellAt(canvas.getBoundingClientRect(),g.size,e.clientX,e.clientY);if(index===null||page.__markerGame.coverage[uid][index]||pending.has(index))return;e.preventDefault();pointer=e.pointerId;cell=index;points=[];canvas.setPointerCapture(pointer);const p=point(e);points.push([p[0]/c-cell%g.size,p[1]/c-Math.floor(cell/g.size)]);});
  const add=e=>{const p=point(e),local=[p[0]/c-cell%g.size,p[1]/c-Math.floor(cell/g.size)];if(local.some(n=>n<0||n>1)||points.length>=256)return;const prev=points.at(-1);ctx.strokeStyle=color();ctx.lineWidth=Math.max(3,c*.09);ctx.lineCap='round';ctx.beginPath();ctx.moveTo((cell%g.size+prev[0])*c,(Math.floor(cell/g.size)+prev[1])*c);ctx.lineTo(p[0],p[1]);ctx.stroke();points.push(local);};
  canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;e.preventDefault();add(e);});
  const finish=async e=>{if(e.pointerId!==pointer)return;add(e);const index=cell,path=points;pointer=null;cell=null;points=[];if(path.length<2)return;const strokes=[...(lines.get(index)||[]),path].slice(-2);lines.set(index,strokes);if(!markerCrossValid(strokes)){page.querySelector('[data-marker-feedback]').textContent='Dwie duże przekątne w jednym polu = krzyżyk.';return;}pending.add(index);paintCross(ctx,g.size,c,index,color());page.querySelector('[data-marker-feedback]').textContent='';try{const ok=await actions.markerCoverage(index,strokes,expected);if(ok===false&&page.isConnected){lines.delete(index);redraw();page.querySelector('[data-marker-feedback]').textContent='Krzyżyk nie został zapisany — tura mogła już się skończyć.';}}catch{if(page.isConnected){lines.delete(index);redraw();page.querySelector('[data-marker-feedback]').textContent='Nie udało się zapisać krzyżyka. Spróbuj ponownie.';}}finally{pending.delete(index);}};
  canvas.addEventListener('pointerup',finish);const cancel=e=>{if(e.pointerId===pointer){pointer=null;cell=null;points=[];redraw();}};canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',cancel);
}
export function renderMarkerGame(root,{room,currentUser,accounts={}},actions){
  const g=ensureMarkerState(room.game),key=markerViewKey(room,currentUser),old=root.querySelector('.marker-page');
  if(old?.dataset.markerViewKey===key){old.__markerGame=g;for(const node of old.querySelectorAll('[data-marker-score]'))node.textContent=`${score(g,node.dataset.markerScore)}/${g.size*g.size}`;old.__paintProgress?.();return;}
  stopMarkerTimer();
  if(g.phase==='result'){root.innerHTML=`<main class="page marker-page"><section class="panel marker-panel center"><p class="eyebrow">MARKER · WYNIKI</p><h1>${escapeHtml(accounts[g.winner]?.nick||'Gracz')} wygrał!</h1><p>Pierwszy zapełnił swoją planszę krzyżykami.</p><div class="marker-result-players">${g.players.map(uid=>`<article>${resultPlayerMiniHtml(accounts[uid],uid===g.winner?'win':'lose')}<b>${score(g,uid)}/${g.size*g.size}</b></article>`).join('')}</div><button class="primary" id="marker-room">Wróć do lobby</button></section></main>`;root.querySelector('#marker-room').addEventListener('click',actions.returnToRoom);return;}
  const drawer=g.drawerUid===currentUser,seeker=g.seekerUid===currentUser,select=g.phase==='select';
  const expected={phase:g.phase,selectedCell:g.selectedCell??null,phaseEndsAt:g.phaseEndsAt,turn:g.turn,turnUid:g.turnUid};
  const title=select?(g.turnUid===currentUser?'Wybierz liczbę':'Przeciwnik wybiera liczbę'):drawer?'Rysuj jak najwięcej krzyżyków!':'Znajdź liczbę!';
  root.innerHTML=`<main class="page marker-page" data-marker-view-key="${escapeHtml(key)}"><section class="panel marker-panel"><p class="eyebrow">MARKER · ${g.size}×${g.size}</p><h1>${title}</h1><div class="marker-race-scores">${g.players.map(uid=>`<span>${escapeHtml(accounts[uid]?.nick||'Gracz')} <b data-marker-score="${escapeHtml(uid)}">${score(g,uid)}/${g.size*g.size}</b></span>`).join('')}</div>${!select?`<div class="marker-target">${drawer?'Przeciwnik szuka':'Znajdź'}: <b>${g.numbers[g.selectedCell]}</b></div>`:''}${select||seeker?'<canvas class="marker-board" data-marker-board width="720" height="720" aria-label="Plansza liczb"></canvas>':''}${drawer?'<div class="marker-sheet-wrap"><canvas class="marker-sheet marker-race-sheet" data-marker-sheet width="720" height="720" aria-label="Twoja plansza krzyżyków"></canvas><p data-marker-feedback role="status"></p></div>':''}<p class="tiny">${select?'Wybierz liczbę w 10 sekund. Potem przeciwnik od razu jej szuka.':drawer?'Rysuj po dwie przekątne w dowolnych pustych polach. Krzyżyki zapisują się automatycznie.':'Kliknij liczbę na planszy. Gdy ją znajdziesz, zamienicie się rolami.'}</p></section></main>`;
  const page=root.querySelector('.marker-page');page.__markerGame=g;
  const board=page.querySelector('[data-marker-board]');if(board){drawNumbers(board,g);board.addEventListener('click',e=>{const cell=markerCellAt(board.getBoundingClientRect(),g.size,e.clientX,e.clientY);if(cell===null)return;if(select&&g.turnUid===currentUser)actions.markerSelect(cell,expected);else if(seeker)actions.markerFind(cell,expected);});}
  if(drawer)bindDrawing(page,currentUser,actions,expected);
  if(select&&g.players.includes(currentUser))markerTimer=setTimeout(()=>actions.markerTimeout(expected),Math.max(100,g.phaseEndsAt-Date.now()+50));
}
export function renderMarkerLobbySettings(room,isHost){const s=room.settings||markerDefaults;return `<div class="marker-settings"><label>Rozmiar planszy <select data-marker-setting="boardSize" ${isHost?'':'disabled'}>${sizes.map(n=>`<option value="${n}" ${Number(s.boardSize)===n?'selected':''}>${n}×${n}</option>`).join('')}</select></label><label>Zakres liczb <select data-marker-setting="numberMax" ${isHost?'':'disabled'}>${ranges.map(n=>`<option value="${n}" ${Number(s.numberMax)===n?'selected':''}>0–${n}</option>`).join('')}</select></label><p class="muted">Jedna osoba wybiera liczbę i rysuje krzyżyki, druga jednocześnie szuka liczby. Po znalezieniu zamiana. Wygrywa pierwszy, który zapełni własne pole.</p></div>`;}
