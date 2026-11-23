import { letterPoints, letterPremium, letterTableInfo, previewLetterPlay, tableAlphabet, tableCenter, tableSize } from "./letterTable.js?v=20261123-19";
import { patchRoomView } from "./roomViewPatch.js?v=20261119-15";
import { escapeHtml, playerMiniHtml } from "./utils.js?v=20261121-8";
import { Audio } from "./audio.js?v=20261123-7";
import { serverNow } from "./firebase.js?v=20261123-20";

const views=new WeakMap();
const premiumNames={l2:"Litera ×2",l3:"Litera ×3",w2:"Słowo ×2",w3:"Słowo ×3"};
const badges={l2:"L²",l3:"L³",w2:"S²",w3:"S³"};
const coord=square=>`${"ABCDEFGHIJKLM"[square%tableSize]}${Math.floor(square/tableSize)+1}`;
const tileFace=(tile,blank=false)=>`<span class="lt-tile${blank||tile.letter==="?"?" is-blank":""}"><b>${escapeHtml(tile.letter==="?"?"✧":tile.letter.toUpperCase())}</b><small>${blank?0:letterPoints(tile.letter)}</small></span>`;
const motion=()=>!window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateDraw(root,state,tiles) {
  if(!motion()) return;
  const bag=root.querySelector(".lt-bag");
  if(!bag) return;
  Audio.play("boardDice");
  bag.animate([
    {transform:"translate(0,0) rotate(0) scale(1)"},
    {transform:"translate(-7px,1px) rotate(-10deg) scale(1.08,.91)",offset:.16},
    {transform:"translate(8px,-7px) rotate(11deg) scale(.94,1.11)",offset:.34},
    {transform:"translate(-6px,1px) rotate(-6deg) scale(1.05,.93)",offset:.55},
    {transform:"translate(3px,-2px) rotate(4deg) scale(.98,1.06)",offset:.73},
    {transform:"translate(0,0) rotate(0) scale(1)"},
  ],{duration:500,easing:"ease-in-out"});
  bag.querySelector(".lt-bag-mouth").animate(
    [{scale:"1 1"},{scale:"1.08 .6",offset:.24},{scale:".93 1.4",offset:.52},{scale:"1 1"}],
    {duration:410,easing:"ease-in-out"});
  tiles.forEach((tile,index)=>{
    window.setTimeout(()=>{
      const destination=()=>root.querySelector(`[data-lt-rack="${tile.id}"]`);
      const settle=()=>{
        state.flying.delete(tile.id);
        const slot=destination();
        slot?.removeAttribute("data-flying");
        if(slot?.animate) slot.animate([{transform:"translateY(-4px) scale(1.06)"},{transform:"translateY(2px) scale(.95)"},{transform:"none"}],{duration:200,easing:"ease-out"});
      };
      if(!root.isConnected || views.get(root)!==state || !destination()) return settle();
      const lip=root.querySelector(".lt-bag-mouth")?.getBoundingClientRect();
      if(!lip) return settle();
      const clamp=(value,dimension)=>Math.max(26,Math.min(dimension-26,value));
      const sprite=document.createElement("span");
      sprite.className="lt-flight";
      sprite.setAttribute("aria-hidden","true");
      sprite.innerHTML=tileFace(tile);
      document.body.append(sprite);
      const start=[clamp(lip.x+lip.width/2,innerWidth),clamp(lip.y+lip.height/2,innerHeight)];
      const center=[innerWidth/2+(index-(tiles.length-1)/2)*Math.min(49,innerWidth/8),innerHeight*.45];
      const transform=([x,y],scale,rotation,tilt=0)=>`translate3d(${x}px,${y}px,0) translate(-50%,-50%) perspective(380px) rotateX(${tilt}deg) rotateZ(${rotation}deg) scale(${scale})`;
      const sign=index%2?1:-1;
      const ascent=sprite.animate([
        {transform:transform(start,.42,sign*38,-58),opacity:0},
        {transform:transform([(start[0]+center[0])/2,Math.min(start[1],center[1])-55],1.25,sign*15,22),opacity:1,offset:.60},
        {transform:transform(center,1.12,sign*3),opacity:1},
      ],{duration:410,easing:"cubic-bezier(.21,.72,.25,1)",fill:"forwards"});
      ascent.onfinish=()=>{
        window.setTimeout(()=>{
          const slot=destination();
          if(!root.isConnected || views.get(root)!==state || !slot){sprite.remove();settle();return;}
          const target=slot.getBoundingClientRect();
          const landing=[target.x+target.width/2,target.y+target.height/2];
          const flight=sprite.animate([
            {transform:transform(center,1.12,sign*3),opacity:1},
            {transform:transform([landing[0],landing[1]-5],Math.min(1,target.width/52),sign*7),opacity:1,offset:.86},
            {transform:transform(landing,Math.min(1,target.width/55),0),opacity:1},
          ],{duration:330,easing:"cubic-bezier(.36,0,.42,1)",fill:"forwards"});
          flight.onfinish=()=>{
            sprite.remove();
            settle();
            if(index===tiles.length-1 && root.isConnected && views.get(root)===state) Audio.play("boardMove");
          };
        },120);
      };
    },235+index*101);
  });
}

export function renderLetterTable(root,{room,accounts,currentUser},actions) {
  const game=room.game, profiles={...room.playerProfiles,...accounts};
  const rack=game.letterRacks?.[currentUser]||[], board=game.letterBoard||{};
  const bagCount=game.letterBag?.length||0, history=game.letterHistory||[], last=history.at(-1);
  const playing=game.phase==="playing", yourTurn=playing && game.currentUid===currentUser;
  const key=JSON.stringify([room.roomId,game.siteGameId||game.startedAt,currentUser]);
  let state=views.get(root);
  if(state?.key!==key){
    state={key,seen:new Set(),flying:new Set(),turn:-1,selected:null,draft:[],exchange:null,blank:null,pending:false};
    views.set(root,state);
  }
  const newTurn=state.turn!==game.turnNumber;
  if(newTurn){
    if(state.turn>=0 && last?.kind==="play") Audio.play("boardWord");
    Object.assign(state,{turn:game.turnNumber,selected:null,draft:[],exchange:null,blank:null,pending:false,timeoutAt:0});
  }
  const newTiles=playing ? rack.filter(tile=>!state.seen.has(tile.id)) : [];
  state.seen=new Set(rack.map(tile=>tile.id));
  if(motion()) newTiles.forEach(tile=>state.flying.add(tile.id));
  const byId=new Map(rack.map(tile=>[tile.id,tile]));
  const draftFields=new Map(state.draft.map(move=>[move.square,move]));
  const placedIds=new Set(state.draft.map(move=>move.id));
  const preview=state.draft.length ? previewLetterPlay(game,currentUser,state.draft) : null;
  const boardCells=Array.from({length:tableSize**2},(_,square)=>{
    const staged=draftFields.get(square);
    const tile=board[square] || (staged ? {letter:staged.blank||byId.get(staged.id)?.letter||"?",blank:Boolean(staged.blank)} : null);
    const premium=letterPremium(square);
    const name=tile ? `${coord(square)}, ${tile.letter.toUpperCase()}` : `${coord(square)}${premium ? `, ${premiumNames[premium]}`:""}`;
    return `<button type="button" data-lt-cell="${square}" tabindex="${square===tableCenter?0:-1}" aria-label="${name}" class="lt-cell ${tile?"has-tile":""} ${staged?"is-draft":""} ${last?.squares?.includes(square)?"is-new":""}" data-premium="${premium}">${tile?tileFace(tile,tile.blank):square===tableCenter?"✦":badges[premium]||""}</button>`;
  }).join("");
  const rackTiles=Array.from({length:7},(_,index)=>{
    const tile=rack[index];
    if(!tile || placedIds.has(tile.id)) return '<span class="lt-rack-slot" aria-hidden="true"></span>';
    const selected=state.selected===tile.id || state.exchange?.has(tile.id);
    return `<button class="lt-rack-slot" data-lt-rack="${tile.id}" aria-pressed="${Boolean(selected)}" type="button" draggable="${yourTurn && !state.exchange}" aria-label="${tile.letter==="?"?"Pusta płytka":tile.letter.toUpperCase()}" ${state.flying.has(tile.id)?"data-flying":""}>${tileFace(tile)}</button>`;
  }).join("");
  const recap=history.slice(-8).reverse().map(entry=>{
    const name=escapeHtml(profiles[entry.uid]?.nick||"Gracz");
    const words=entry.words?.map(word=>escapeHtml(word.text.toUpperCase())).join(" · ");
    return `<li><div><small>${name}</small><b>${words || (entry.kind==="exchange"?"Wymiana liter":"Pas")}</b></div>${entry.kind==="play"?`<strong>+${entry.points}</strong>`:""}</li>`;
  }).join("");
  const winners=(game.winners||[]).map(uid=>escapeHtml(profiles[uid]?.nick||"Gracz"));
  const status=playing ? (yourTurn?"Twój ruch":`Ruch gracza ${escapeHtml(profiles[game.currentUid]?.nick||"Gracz")}`) : (winners.length===1?`Wygrywa ${winners[0]}`:"Remis");
  const controls=state.exchange
    ? `<button class="primary" data-lt-action="trade" ${state.exchange.size && state.exchange.size<=bagCount && !state.pending?"":"disabled"}>Wymień (${state.exchange.size})</button><button class="ghost" data-lt-action="cancel">Anuluj</button>`
    : `<button class="primary" data-lt-action="play" ${yourTurn && preview && !preview.error && !state.pending?"":"disabled"}>Zagraj${preview && !preview.error?` · +${preview.points}`:""}</button><button class="ghost" data-lt-action="undo" ${yourTurn && state.draft.length && !state.pending?"":"disabled"}>Cofnij</button><button class="ghost" data-lt-action="exchange" ${yourTurn && bagCount && !state.pending?"":"disabled"}>Wymień</button><button class="ghost" data-lt-action="pass" ${yourTurn && !state.pending?"":"disabled"}>Pas</button>`;
  const blankDialog=state.blank ? `<div class="lt-blank-panel" role="group" aria-label="Przypisz literę"><b>Wybierz literę</b><div>${tableAlphabet.map(letter=>`<button type="button" class="ghost" data-lt-blank="${letter}">${letter.toUpperCase()}</button>`).join("")}</div><button class="ghost" data-lt-action="blank-cancel">Anuluj</button></div>` : "";

  patchRoomView(root,key,`<main class="page lt-page" data-letter-table>
    <header class="lt-heading"><div><p class="eyebrow">PLANSZÓWKI</p><h1>Słowa z woreczka</h1></div><div class="lt-turn ${yourTurn?"is-yours":""}" role="status"><b>${status}</b>${playing?'<time data-lt-clock></time>':""}</div></header>
    <div class="lt-layout"><div class="lt-play">
      <div class="lt-board" role="group" aria-label="Plansza słów">${boardCells}</div>
      <div class="lt-workbench">
        <section class="lt-dock"><div class="lt-dock-title"><b>Twoje litery</b><small>${state.pending?"Sprawdzam…":state.exchange?"Wybierz płytki do wymiany":preview?.error||""}</small></div>
        <div class="lt-rack">${rackTiles}</div>${blankDialog}</section>
        <div class="lt-bag-scene" aria-label="Woreczek, ${bagCount} liter"><div class="lt-bag" aria-hidden="true"><i class="lt-bag-body"></i><i class="lt-bag-mouth"></i><i class="lt-bag-cord"></i><i class="lt-bag-patch">✦</i></div><strong>${bagCount}</strong></div>
      </div>
      <div class="lt-controls">${playing?controls:room.hostUid===currentUser?'<button class="primary" data-lt-action="restart">Zagraj ponownie</button>':""}</div>
    </div><aside class="lt-sidebar">
      <div class="lt-scores">${game.players.map(uid=>`<div class="${uid===game.currentUid && playing?"is-current":""}">${playerMiniHtml(profiles[uid]||{nick:"Gracz"})}<b>${Number(game.scores[uid]||0)}</b></div>`).join("")}</div>
      <section class="lt-history"><h2>Ruchy</h2>${recap?`<ol>${recap}</ol>`:'<p class="muted">Czekamy na pierwsze słowo.</p>'}</section>
      <details class="lt-rules"><summary>Zasady</summary><ul>${letterTableInfo.rules.map(rule=>`<li>${rule}</li>`).join("")}</ul><p>Słownik <a href="https://sjp.pl/sl/growy/" target="_blank" rel="noopener noreferrer">SJP.PL</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. Lista ograniczona do alfabetu i rozmiaru planszy.</p></details>
      <div class="lt-exit">${!playing?'<button class="ghost" data-lt-action="lobby">Wróć do pokoju</button>':""}<button class="ghost" data-lt-action="leave">Wyjdź</button></div>
    </aside></div>
  </main>`);
  if(newTiles.length) animateDraw(root,state,newTiles);

  const expected={phase:game.phase,phaseEndsAt:game.phaseEndsAt};
  const repaint=()=>renderLetterTable(root,{room,accounts,currentUser},actions);
  state.repaint=repaint;
  const play=async(action,payload)=>{
    if(state.pending) return;
    state.pending=true; repaint();
    try {
      if(action==="letter-play") await actions.letterTablePlay(payload,expected);
      else await actions.boardAction(action,payload,expected);
    }
    finally { if(root.isConnected && views.get(root)===state){state.pending=false;state.repaint();} }
  };
  function place(square,id,blank){
    if(!yourTurn || state.pending || state.exchange || board[square]) return;
    const tile=byId.get(id);
    if(!tile || placedIds.has(id) || draftFields.has(square) || state.flying.has(id)) return;
    if(tile.letter==="?" && !blank) {state.blank={square,id};repaint();return;}
    state.draft.push({square,id,...(blank?{blank}:{})});
    state.selected=null;state.blank=null;
    Audio.play("boardMove");repaint();
  }
  root.onclick=event=>{
    const button=event.target.closest("button");
    if(!button || button.disabled) return;
    const action=button.dataset.ltAction;
    if(action==="leave") return actions.leaveRoom();
    if(action==="lobby") return actions.returnToRoom();
    if(action==="restart") return actions.boardRestart();
    if(!yourTurn || state.pending) return;
    if(button.hasAttribute("data-lt-rack")){
      const id=Number(button.dataset.ltRack);
      if(state.flying.has(id)) return;
      if(state.exchange){if(state.exchange.has(id)) state.exchange.delete(id);else state.exchange.add(id);}
      else state.selected=state.selected===id?null:id;
      repaint();return;
    }
    if(button.hasAttribute("data-lt-cell")){
      const square=Number(button.dataset.ltCell), staged=draftFields.get(square);
      if(staged){state.draft=state.draft.filter(move=>move.square!==square);repaint();}
      else place(square,state.selected);
      return;
    }
    if(button.dataset.ltBlank && state.blank) return place(state.blank.square,state.blank.id,button.dataset.ltBlank);
    if(action==="play") return play("letter-play",state.draft);
    if(action==="trade") return play("letter-exchange",[...state.exchange]);
    if(action==="pass") return play("letter-pass","");
    if(action==="undo") state.draft.pop();
    if(action==="exchange"){state.draft=[];state.selected=null;state.exchange=new Set();}
    if(action==="cancel") state.exchange=null;
    state.blank=null; repaint();
  };
  root.ondragstart=event=>{
    const tile=event.target.closest("[data-lt-rack]");
    if(tile && yourTurn && !state.pending && !tile.hasAttribute("data-flying")){
      event.dataTransfer.setData("text/plain",tile.dataset.ltRack);
      event.dataTransfer.effectAllowed="move";
    }
  };
  root.ondragover=event=>{if(yourTurn && event.target.closest("[data-lt-cell]")) event.preventDefault();};
  root.ondrop=event=>{
    const cell=event.target.closest("[data-lt-cell]");
    if(!cell) return;
    event.preventDefault();
    place(Number(cell.dataset.ltCell),Number(event.dataTransfer.getData("text/plain")));
  };
  root.onkeydown=event=>{
    const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-tableSize,ArrowDown:tableSize}[event.key];
    const cell=event.target.closest("[data-lt-cell]");
    if(!cell || !step) return;
    event.preventDefault();
    const from=Number(cell.dataset.ltCell), to=from+step;
    if(Math.abs(step)===1 && Math.floor(from/tableSize)!==Math.floor(to/tableSize)) return;
    const next=root.querySelector(`[data-lt-cell="${to}"]`);
    if(next){cell.tabIndex=-1;next.tabIndex=0;next.focus({preventScroll:true});}
  };

  return ()=>{
    if(!playing || !root.isConnected || views.get(root)!==state) return;
    const now=serverNow();
    const seconds=Math.max(0,Math.ceil((game.phaseEndsAt-now)/1000));
    const node=root.querySelector("[data-lt-clock]");
    if(node) node.textContent=`${seconds} s`;
    if(!seconds && !state.timeout && now>=state.timeoutAt){
      state.timeout=true;
      state.timeoutAt=now+1800;
      void Promise.resolve(actions.boardAction("timeout","",expected)).finally(()=>{state.timeout=false;});
    }
  };
}
