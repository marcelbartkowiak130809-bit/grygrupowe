import { chartForecastSettings, chartRoundOptions, chartTimeOptions, currentForecastChart, forecastPlayers } from "./chartForecast.js?v=20261121-15";
import { chartNumber, drawForecastSegment, forecastPointer, paintForecastChart } from "./chartForecastCanvas.js?v=20261121-15";
import { chartForecastData } from "./chartForecastData.js?v=20261121-15";
import { patchRoomView } from "./roomViewPatch.js?v=20261119-15";
import { escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20261121-8";
import { serverNow } from "./firebase.js?v=20261121-14";

const catalog = new Map(chartForecastData.map(chart => [chart.id, chart]));
const colors = ["#49c5d9","#f6aa53","#cc88e8","#a2d357","#f27c95","#a6aaff","#eac94f","#68d8ab"];
const percentage = new Intl.NumberFormat("pl-PL",{minimumFractionDigits:1,maximumFractionDigits:1});
const accuracy = value => `${percentage.format(value || 0)}%`;
const drafts = new WeakMap();
let clock, chartBinding;

export function stopChartForecastTimer() { clearInterval(clock); }
export function stopChartForecastView() { chartBinding?.observer.disconnect(); chartBinding=null; }

export function renderChartForecastLobby(room,isHost) {
  const settings=chartForecastSettings(room.settings);
  const select=(key,label,options,suffix="")=>`<label class="setting-row"><span>${label}</span><select data-chart-setting="${key}" ${isHost?"":"disabled"}>${options.map(value=>`<option value="${value}" ${settings[key]===value?"selected":""}>${value}${suffix}</option>`).join("")}</select></label>`;
  return `<div class="board-lobby-settings">${select("rounds","Liczba wykresów",chartRoundOptions)}${select("chartTime","Czas na prognozę",chartTimeOptions," s")}</div>`;
}

function scoresHtml(game,accounts,currentUser) {
  const ordering=game.players.slice().sort((a,b)=>(game.scores[b]||0)-(game.scores[a]||0));
  return `<ol class="chart-score-list">${ordering.map(uid=>{
    const place=ordering.findIndex(key=>game.scores[key]===game.scores[uid])+1;
    return `<li class="${uid===currentUser?"is-you":""}"><span>${place}.</span>${resultPlayerMiniHtml(accounts[uid],game.winners?.includes(uid)?"win":"static")}<strong>${accuracy(game.scores[uid])}</strong></li>`;
  }).join("")}</ol>`;
}

function chartStage(chart,{editable=false,caption=false}={}) {
  return `<div class="chart-stage">
    ${caption?`<h2>${escapeHtml(chart.title)}</h2>`:""}
    <p class="chart-unit">${escapeHtml(chart.unit)}</p>
    <canvas class="chart-canvas" ${editable?'tabindex="0" aria-label="Wykres. Przeciągnij od punktu startu albo użyj strzałek, aby ustawiać punkty." aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"':'role="img" aria-label="Wykres danych i prognoz"'}></canvas>
  </div>`;
}

function statLine(row,unit) {
  const errorUnit=unit.startsWith("%")?"p.p.":unit.split(" · ")[0];
  const error=row?.miss==null?"Brak prognozy":`Średni błąd ${chartNumber(row.miss)} ${escapeHtml(errorUnit)}`;
  return `<div class="chart-stats"><strong>${accuracy(row?.accuracy)}</strong><span>${error}</span></div>`;
}

function resultPanel(game,chart,state,currentUser,accounts,row,source) {
  const tabs=game.chartRounds.map((item,index)=>`<button type="button" class="ghost" data-chart-review="${index}" aria-pressed="${state.review===index}">${escapeHtml(catalog.get(item.chartId)?.title||"Wykres")} <b>${accuracy(item.rows?.[currentUser]?.accuracy)}</b></button>`).join("");
  const payout=game.rewardSummary?.payouts?.[currentUser];
  return `<section class="chart-final">
    <div class="chart-stats"><strong>${accuracy(game.scores[currentUser])}</strong><span>Średnia trafność ${payout!=null?`· +${payout}$`:""}</span></div>
    ${scoresHtml(game,accounts,currentUser)}
  </section>
  <section class="chart-review"><h2>Twoje wykresy</h2><div class="chart-review-tabs">${tabs}</div>${chartStage(chart,{caption:true})}${statLine(row,chart.unit)}${source}</section>`;
}

function bindDrawing(canvas,panel,chart,state,ready,expected,actions,repaint) {
  const start=chart.values[chart.cut], count=chart.values.length-chart.cut-1;
  const status=panel.querySelector("[data-chart-status]");
  const submit=panel.querySelector("[data-chart-submit]"), undo=panel.querySelector("[data-chart-undo]");
  const controls=()=>{
    submit.disabled=state.pending || state.pointer!==null || state.draft.length<=count;
    undo.disabled=state.pending || state.pointer!==null || !state.undos.length;
    const message=state.draft.length>count?ready:"Przeciągnij od punktu i dorysuj linię.";
    if(status.textContent!==message) status.textContent=message;
  };
  const recordUndo=()=>{
    state.undos.push(state.draft.slice());
    if(state.undos.length>40) state.undos.shift();
  };
  canvas.onpointerdown=event=>{
    if(state.pending || state.pointer!==null || (event.pointerType==="mouse" && event.button!==0)) return;
    const point=forecastPointer(canvas,chart,event,start);
    if(point.index>state.draft.length) return;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId);
    recordUndo(); state.pointer=event.pointerId;
    const previous=state.draft.length-1;
    const from=point.index>previous?{index:previous,value:state.draft[previous]}:point;
    drawForecastSegment(state.draft,from,point);
    state.cursor=point; controls(); repaint();
  };
  canvas.onpointermove=event=>{
    if(state.pointer!==event.pointerId) return;
    const point=forecastPointer(canvas,chart,event,start);
    drawForecastSegment(state.draft,state.cursor,point);
    state.cursor=point; controls(); repaint();
  };
  const end=event=>{
    if(state.pointer!==event.pointerId) return;
    state.pointer=null; state.cursor=null; controls(); repaint();
  };
  canvas.onpointerup=event=>{canvas.onpointermove(event);end(event);};
  canvas.onpointercancel=end;
  canvas.onlostpointercapture=end;
  canvas.onkeydown=event=>{
    if(state.pending || !["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const cursor=state.cursor?.index||0;
    const vertical=event.key==="ArrowUp" || event.key==="ArrowDown";
    const index=Math.min(count,state.draft.length,Math.max(1,cursor+(event.key==="ArrowRight"?1:event.key==="ArrowLeft"?-1:0)));
    const [min,max]=chart.scale;
    const base=state.draft[index]??state.draft[index-1]??start;
    const value=vertical?Math.max(min,Math.min(max,base+(event.key==="ArrowUp"?1:-1)*(max-min)/40)):base;
    if(vertical || index===state.draft.length) {
      recordUndo(); drawForecastSegment(state.draft,{index,value},{index,value});
    }
    state.cursor={index,value}; controls(); repaint();
  };
  undo.onclick=()=>{state.draft=state.undos.pop()||[start];state.cursor=null;controls();repaint();};
  submit.onclick=async()=>{
    state.pending=true;controls();
    try { await actions.chartForecastAction("submit",state.draft.slice(1),expected); }
    finally { state.pending=false;controls(); }
  };
  controls();
}

function bindClock(panel,game,host,actions,expected) {
  let retryAt=0;
  const tick=()=>{
    const now=serverNow();
    const left=Math.max(0,Math.ceil((game.phaseEndsAt-now)/1000));
    const time=panel.querySelector("[data-chart-clock]");
    const label=`${left} s`;
    if(time.textContent!==label) time.textContent=label;
    time.classList.toggle("is-low",left<=5);
    const revealing=game.phase==="chart-reveal";
    if(left===0 && now>=retryAt && (!revealing||host)) {
      retryAt=now+2000;
      void actions.chartForecastAction(revealing?"next":"timeout",null,expected);
    }
  };
  clock=setInterval(tick,250);tick();
}

export function renderChartForecastGame(root,{room,accounts,currentUser},actions) {
  stopChartForecastTimer();
  const game=room.game, players=forecastPlayers(game,room.players);
  const summary=game.phase==="result", revealing=game.phase==="chart-reveal";
  const host=room.hostUid===currentUser, submitted=game.forecasts?.[currentUser];
  const editable=!summary && !revealing && !submitted && players.includes(currentUser);
  const matchKey=JSON.stringify([room.roomId,game.siteGameId||game.startedAt,currentUser]);
  let state=drafts.get(root);
  if(state?.key!==matchKey) { state={key:matchKey,round:0,review:0}; drafts.set(root,state); }
  const roundResult=summary?game.chartRounds[state.review]:revealing?game.chartRounds.at(-1):null;
  const chart=roundResult?catalog.get(roundResult.chartId):currentForecastChart(game);
  if(!chart) return;
  const start=chart.values[chart.cut];
  if(state.round!==game.round) {
    Object.assign(state,{round:game.round,draft:[start],undos:[],pending:false,cursor:null,pointer:null,highlight:currentUser});
  }
  const row=roundResult?.rows?.[currentUser];
  const profile=uid=>escapeHtml(accounts[uid]?.nick || "Gracz");
  const series=Object.entries(roundResult?.rows||{}).filter(([uid,item])=>Array.isArray(item.forecast)&&(!summary||uid===currentUser))
    .map(([uid,item])=>({uid,values:item.forecast,color:colors[game.players.indexOf(uid)%colors.length]}));
  const winning=game.winners?.includes(currentUser);
  const place=1+game.players.filter(uid=>(game.scores[uid]||0)>(game.scores[currentUser]||0)).length;
  const finalTitle=winning?(game.winners.length>1?"Remis":"Wygrywasz!")
    :game.winners?.length?`Zajmujesz ${place}. miejsce`:"Koniec partii";
  const steps=`<div class="chart-steps" aria-label="Wykres ${game.round} z ${game.chartIds.length}">${game.chartIds.map((_,index)=>`<span class="${index<game.round?"is-past":""} ${index===game.round-1?"is-current":""}"></span>`).join("")}</div>`;
  const ready=`Gotowi · ${players.filter(uid=>Object.hasOwn(game.forecasts||{},uid)).length}/${players.length}`;
  const rankedLines=series.slice().sort((a,b)=>roundResult.rows[b.uid].accuracy-roundResult.rows[a.uid].accuracy);
  const legend=`<div class="chart-legend"><span class="chart-actual-label">Rzeczywiste dane</span>${rankedLines.map(item=>`<button type="button" class="ghost" data-chart-highlight="${escapeHtml(item.uid)}" aria-pressed="${state.highlight===item.uid}" style="--series-color:${item.color}">${profile(item.uid)} · ${accuracy(roundResult.rows[item.uid].accuracy)}</button>`).join("")}</div>`;
  const source=`<a class="chart-source" href="${escapeHtml(chart.source)}" rel="noopener noreferrer" target="_blank">Dane · ${escapeHtml(chart.publisher)} ↗</a>`;
  const tools=`<div class="chart-actions"><button type="button" class="ghost" data-chart-undo>Cofnij</button><button type="button" class="primary" data-chart-submit>Gotowe</button></div>`;
  const drawingFooter=`<div class="chart-drawing-footer"><span data-chart-status aria-live="polite">${ready}</span>${editable?tools:""}</div>`;
  const revealFooter=`${legend}${statLine(row,chart.unit)}<div class="chart-actions">${source}${host?`<button type="button" class="primary" data-chart-next>${game.round===game.chartIds.length?"Pokaż wyniki":"Następny wykres"}</button>`:""}</div>`;
  const phasePanel=summary?resultPanel(game,chart,state,currentUser,accounts,row,source)
    :`${chartStage(chart,{editable})}${revealing?revealFooter:drawingFooter}`;
  patchRoomView(root,`${matchKey}:${game.round}:${game.phase}:${summary?state.review:""}`,`<main class="page chart-forecast-page" data-chart-forecast>
    <header class="chart-heading"><div><p class="eyebrow">${summary?"Podsumowanie":"Dorysuj wykres"}</p><h1>${summary?finalTitle:escapeHtml(chart.title)}</h1></div>
      ${summary?"":`<div class="chart-progress">${steps}<span>${game.round}/${game.chartIds.length}</span><time data-chart-clock></time></div>`}
    </header>
    ${phasePanel}
    <footer class="chart-footer">${summary?'<button type="button" class="ghost" data-chart-lobby>Wróć do pokoju</button>':""}<button type="button" class="ghost" data-chart-leave>Wyjdź</button></footer>
  </main>`);

  const canvas=root.querySelector(".chart-canvas"), panel=root.querySelector("[data-chart-forecast]");
  const expected={phase:game.phase,phaseEndsAt:game.phaseEndsAt};
  const isNew=chartBinding?.canvas!==canvas;
  const revealStart=isNew&&revealing&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches?performance.now():0;
  let frame=0;
  const repaint=()=>{
    if(frame) return;
    frame=requestAnimationFrame(now=>{
      frame=0;
      if(!canvas.isConnected) return;
      const progress=revealStart?Math.min(1,(now-revealStart)/550):1;
      paintForecastChart(canvas,chart,{draft:submitted?[start,...submitted]:state.draft,series,revealed:summary||revealing,highlight:state.highlight,progress,cursor:state.cursor});
      if(progress<1) repaint();
    });
  };
  if(isNew) {
    stopChartForecastView();
    const observer=new ResizeObserver(()=>chartBinding?.repaint());
    observer.observe(canvas);
    chartBinding={canvas,observer,repaint};
  } else chartBinding.repaint=repaint;
  repaint();
  if(editable) bindDrawing(canvas,panel,chart,state,ready,expected,actions,repaint);
  else {
    canvas.onpointerdown=null; canvas.onkeydown=null;
    canvas.onpointermove=null; canvas.onpointerup=null; canvas.onlostpointercapture=null; canvas.onpointercancel=null;
  }
  panel.querySelector("[data-chart-leave]").onclick=()=>actions.leaveRoom();
  const lobby=panel.querySelector("[data-chart-lobby]");
  if(lobby) lobby.onclick=()=>actions.returnToRoom();
  panel.querySelectorAll("[data-chart-review]").forEach(button=>button.onclick=()=>{
    state.review=Number(button.dataset.chartReview);
    renderChartForecastGame(root,{room,accounts,currentUser},actions);
  });
  panel.querySelectorAll("[data-chart-highlight]").forEach(button=>button.onclick=()=>{
    state.highlight=state.highlight===button.dataset.chartHighlight?"":button.dataset.chartHighlight;
    for(const item of panel.querySelectorAll("[data-chart-highlight]")) item.setAttribute("aria-pressed",String(item.dataset.chartHighlight===state.highlight));
    repaint();
  });
  const next=panel.querySelector("[data-chart-next]");
  if(next) next.onclick=()=>actions.chartForecastAction("next",null,expected);
  if(!summary) bindClock(panel,game,host,actions,expected);
}
