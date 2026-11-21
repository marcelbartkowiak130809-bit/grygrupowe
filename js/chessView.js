import { chessInfo, chessMoveLog, chessPosition, chessTime } from "./chessGame.js?v=20261121-8";
import { serverNow } from "./firebase.js?v=20261121-14";
import { patchRoomView } from "./roomViewPatch.js?v=20261121-7";
import { escapeHtml } from "./utils.js?v=20261121-8";

const glyph = { k:"♚", q:"♛", r:"♜", b:"♝", n:"♞", p:"♟" };
const pieceNames = { k:"król", q:"hetman", r:"wieża", b:"goniec", n:"skoczek", p:"pion" };
const endings = {
  mate:"Mat", time:"Czas minął", resign:"Poddanie", agreement:"Remis za porozumieniem",
  stalemate:"Pat", material:"Brak materiału do mata", repetition:"Trzykrotne powtórzenie", fifty:"Reguła 50 ruchów",
};
const positions = new WeakMap();
const nick = (profiles,uid) => escapeHtml(profiles[uid]?.nick || "Gracz");
const clockText = ms => {
  const seconds = Math.ceil(ms/1000);
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;
};
const icon = (type,color) => `<span class="chess-piece chess-${color}" aria-hidden="true">${glyph[type]}︎</span>`;

function playerBar(game,profiles,color,captured,now) {
  const uid=(game.chessSeats||game.players)[color==="w"?0:1];
  const active=game.phase==="playing" && uid===game.currentUid;
  return `<div class="chess-player${active?" is-active":""}">
    <span class="chess-player-name">${icon("k",color)}<b>${nick(profiles,uid)}</b></span>
    <span class="chess-captured" aria-label="Zbite figury">${captured.map(move=>icon(move.captured,move.color==="w"?"b":"w")).join("")}</span>
    <time class="chess-clock" data-chess-clock="${color}">${clockText(chessTime(game,color,now))}</time>
  </div>`;
}

function chessBoard(position, ownColor, selected, moves, last, playable) {
  const cells=position.board().flat().map((piece,index)=>({piece,index}));
  if(ownColor==="b")cells.reverse();
  const checked=position.isCheck();
  const targets=new Map(moves.map(move=>[move.to,move]));
  return cells.map(({piece,index},offset)=>{
    const file="abcdefgh"[index%8],rank=8-Math.floor(index/8),square=file+rank;
    const target=targets.get(square), source=playable&&piece?.color===ownColor;
    const classes=["chess-cell",(index%8+Math.floor(index/8))%2?"dark":"light",
      square===selected?"is-selected":"",last&&(last.from===square||last.to===square)?"is-last":"",
      checked&&piece?.type==="k"&&piece.color===position.turn()?"is-check":"",
      target?(target.captured?"can-capture":"can-move"):""].join(" ");
    const label=piece?`${square}, ${piece.color==="w"?"białe":"czarne"}, ${pieceNames[piece.type]}`:square;
    const inner=`${offset%8===0?`<small class="chess-rank" aria-hidden="true">${rank}</small>`:""}${offset>=56?`<small class="chess-file" aria-hidden="true">${file}</small>`:""}${piece?icon(piece.type,piece.color):""}`;
    if(source||target)return `<button type="button" class="${classes}" data-chess-square="${square}" aria-label="${label}${target?", dostępny ruch":""}" ${source?`aria-pressed="${selected===square}"`:""}>${inner}</button>`;
    return `<div class="${classes}" data-chess-square="${square}" ${piece?`role="img" aria-label="${label}"`:'aria-hidden="true"'}>${inner}</div>`;
  }).join("");
}

function historyMarkup(log,ply,live) {
  const rows=[];
  for(let i=0;i<log.length;i+=2){
    const button=index=>log[index]?`<button type="button" data-chess-ply="${index+1}" ${index+1===ply?'aria-current="step"':""}>${escapeHtml(log[index])}</button>`:"<span></span>";
    rows.push(`<li><span>${i/2+1}.</span>${button(i)}${button(i+1)}</li>`);
  }
  return `<aside class="chess-history"><h2>Historia ruchów</h2>
    <ol class="chess-history-list">${rows.join("")||'<li class="chess-history-empty">Jeszcze bez ruchów</li>'}</ol>
    <div class="chess-history-controls">
      <button type="button" class="ghost" data-chess-ply="${ply-1}" aria-label="Poprzedni ruch" ${ply<=0?"disabled":""}>←</button>
      <button type="button" class="ghost" data-chess-ply="${ply+1}" aria-label="Następny ruch" ${ply>=log.length?"disabled":""}>→</button>
      <button type="button" class="ghost" data-chess-ply="live" ${live?"disabled":""}>Bieżąca pozycja</button>
    </div></aside>`;
}

export function renderChessGame(root, {room,accounts,currentUser}, actions) {
  const game=room.game, profiles={...room.playerProfiles,...accounts}, log=chessMoveLog(game);
  const key=JSON.stringify([room.roomId,currentUser,game.siteGameId||game.chessStartedAt]);
  let view=positions.get(root);
  if(view?.key!==key){view={key,live:chessPosition(game),log:JSON.stringify(log)};positions.set(root,view);}
  const latest=JSON.stringify(log);
  const animateMove=view.log!==latest && view.ply===undefined && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(view.log!==latest){
    view.live=chessPosition(game);
    view.log=latest;
    view.selected="";
    view.promotion=null;
  }
  if(game.phase!=="playing"){view.selected="";view.promotion=null;}
  const ownColor=(game.chessSeats||game.players)[1]===currentUser?"b":"w", topColor=ownColor==="w"?"b":"w";
  const ply=view.ply??log.length, live=view.ply===undefined;
  const board=live?view.live:chessPosition(game,ply);
  const moves=board.history({verbose:true}), last=moves.at(-1);
  const turn=game.phase==="playing" && game.currentUid===currentUser;
  const playable=turn&&live&&!view.promotion;
  const targets=playable&&view.selected?board.moves({square:view.selected,verbose:true}):[];
  const header=game.phase==="result"?(game.winners?.length?`Wygrywa ${nick(profiles,game.winners[0])}`:"Remis")
    :turn?"Twój ruch":`Ruch gracza ${nick(profiles,game.currentUid)}`;
  const status=game.phase==="result"?(endings[game.chessEnd]||"Koniec partii"):!live?`Podgląd · ${ply}/${log.length}`:board.isCheck()?"Szach":"";
  const offer=game.chessDrawOffer;
  const commands=game.phase==="result"
    ? `${room.hostUid===currentUser&&game.players.length===2?'<button type="button" class="primary" data-chess-command="restart">Rewanż</button>':""}<button type="button" class="ghost" data-chess-command="lobby">Do pokoju</button>`
    : offer&&offer!==currentUser
      ? '<button type="button" class="ghost" data-chess-command="chess-accept">Przyjmij remis</button><button type="button" class="ghost" data-chess-command="chess-decline">Odrzuć</button>'
      : `<button type="button" class="ghost" data-chess-command="chess-offer" ${offer?"disabled":""}>${offer?"Remis zaproponowany":"Zaproponuj remis"}</button><button type="button" class="ghost" data-chess-command="chess-resign">Poddaj się</button>`;
  const promotion=view.promotion && `<div class="chess-promotion" role="group" aria-label="Promocja piona">
    <b>Wybierz figurę</b>${view.promotion.choices.map(type=>`<button type="button" class="ghost" data-chess-promote="${type}" aria-label="${pieceNames[type]}">${icon(type,ownColor)}</button>`).join("")}
    <button type="button" class="ghost" data-chess-promote="cancel" aria-label="Anuluj promocję">×</button></div>`;
  const now=serverNow(), draw=()=>renderChessGame(root,{room,accounts,currentUser},actions);
  const captured=color=>moves.filter(move=>move.color===color&&move.captured);
  patchRoomView(root,key,`<main class="page chess-page" data-chess-game>
    <header class="chess-heading"><h1>Szachy</h1><span role="status"><b>${header}</b>${status?` <small>${status}</small>`:""}</span></header>
    <div class="chess-layout"><section class="chess-play">
      ${playerBar(game,profiles,topColor,captured(topColor),now)}
      <div class="chess-board" aria-label="Szachownica">${chessBoard(board,ownColor,view.selected,targets,last,playable)}</div>
      ${playerBar(game,profiles,ownColor,captured(ownColor),now)}
      ${promotion||""}
    </section><div class="chess-side">${historyMarkup(log,ply,live)}<div class="chess-commands">${commands}</div></div></div>
    <footer class="chess-footer"><details><summary>Zasady</summary>${chessInfo.rules.map(rule=>`<p>${escapeHtml(rule)}</p>`).join("")}</details><button type="button" class="ghost" data-chess-command="leave">Wyjdź z pokoju</button></footer>
  </main>`);
  const expected={phase:game.phase,phaseEndsAt:game.phaseEndsAt};
  if(animateMove&&last){
    const from=root.querySelector(`[data-chess-square="${last.from}"]`)?.getBoundingClientRect();
    const to=root.querySelector(`[data-chess-square="${last.to}"]`);
    const target=to?.getBoundingClientRect();
    if(from&&target)to.querySelector(".chess-piece")?.animate(
      [{transform:`translate(${from.x-target.x}px,${from.y-target.y}px)`},{transform:"translate(0,0)"}],
      {duration:180,easing:"cubic-bezier(.18,.8,.3,1)"}
    );
  }
  const submit=async (kind,payload="")=>{
    if(view.pending)return;
    view.pending=true;
    try { await actions.boardAction(kind,payload,expected); }
    finally { view.pending=false; }
  };
  const list=root.querySelector(".chess-history-list");
  if(live)list.scrollTop=list.scrollHeight;
  const main=root.querySelector("[data-chess-game]");
  main.onclick=event=>{
    const button=event.target.closest("button");
    if(!button||button.disabled||view.pending)return;
    if(button.hasAttribute("data-chess-ply")){
      const value=button.dataset.chessPly;
      view.ply=value==="live"||Number(value)===log.length?undefined:Number(value);
      view.selected="";
      view.promotion=null;
      draw();
    }else if(button.dataset.chessSquare){
      const square=button.dataset.chessSquare;
      const options=targets.filter(move=>move.to===square);
      if(options[0]?.promotion){
        view.promotion={from:view.selected,to:square,choices:options.map(move=>move.promotion)};
        draw();
        root.querySelector("[data-chess-promote]")?.focus({preventScroll:true});
      }else if(options.length){
        submit("chess-move",`${view.selected}|${square}`);
      }else{
        view.selected=view.selected===square?"":square;
        draw();
        if(event.detail===0)root.querySelector(".chess-cell.can-move,.chess-cell.can-capture")?.focus({preventScroll:true});
      }
    }else if(button.dataset.chessPromote){
      const choice=button.dataset.chessPromote;
      if(choice==="cancel"){view.promotion=null;draw();}
      else submit("chess-move",`${view.promotion.from}|${view.promotion.to}|${choice}`);
    }else if(button.dataset.chessCommand){
      const command=button.dataset.chessCommand;
      if(command==="leave")actions.leaveRoom();
      else if(command==="restart")actions.boardRestart();
      else if(command==="lobby")actions.returnToRoom();
      else if(command!=="chess-resign"||window.confirm("Poddać partię?"))submit(command);
    }
  };
  return ()=>{
    if(game.phase!=="playing")return;
    const now=serverNow();
    for(const node of main.querySelectorAll("[data-chess-clock]")){
      const ms=chessTime(game,node.dataset.chessClock,now);
      const value=clockText(ms);
      if(node.textContent!==value)node.textContent=value;
      node.classList.toggle("is-low",ms<15_000);
    }
    if(now>=game.phaseEndsAt && !view.timeout && now>=(view.retryTimeoutAt||0)){
      view.timeout=true;
      view.retryTimeoutAt=now+2000;
      Promise.resolve(actions.boardAction("timeout","",expected)).finally(()=>{view.timeout=false;});
    }
  };
}
