import { applyChartForecastAction, chartForecastDefaults, chartForecastRanking, chartForecastSettings, chartRoundOptions, chartTimeOptions, createChartForecastGame, currentForecastChart, forecastPlayers } from "./chartForecast.js?v=20261121-20";
import { chartNumber, drawForecastSegment, forecastPointer, paintForecastChart } from "./chartForecastCanvas.js?v=20261121-17";
import { chartForecastData } from "./chartForecastData.js?v=20261121-20";
import { patchRoomView } from "./roomViewPatch.js?v=20261119-15";
import { escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20261121-8";
import { serverNow } from "./firebase.js?v=20261124-2";

const catalog = new Map(chartForecastData.map(chart => [chart.id, chart]));
const colors = ["#49c5d9","#f6aa53","#cc88e8","#a2d357","#f27c95","#a6aaff","#eac94f","#68d8ab"];
const percentage = new Intl.NumberFormat("pl-PL",{minimumFractionDigits:1,maximumFractionDigits:1});
const accuracy = value => `${percentage.format(value || 0)}%`;
const drafts = new WeakMap();
const draftStorageKey = "grygrupowe_chart_forecast_draft";
let clock, chartBinding;
export const chartForecastSoloMode = "dorysuj-wykres-solo";
const soloPlayer = "solo";
const soloAccounts = {[soloPlayer]:{nick:"Twoja prognoza"}};
let soloRoom;

export function renderChartForecastSolo(root,onExit) {
  const room = soloRoom ??= {
    roomId:chartForecastSoloMode, hostUid:soloPlayer, players:[soloPlayer],
    game:{...createChartForecastGame([soloPlayer],chartForecastDefaults,serverNow()), siteGameId:crypto.randomUUID()},
  };
  renderChartForecastGame(root,{room,accounts:soloAccounts,currentUser:soloPlayer,solo:true},{
    chartForecastAction(action,payload,expected) {
      const game = room.game;
      if (!root.isConnected || room!==soloRoom || game.phase!==expected.phase || game.phaseEndsAt!==expected.phaseEndsAt) return false;
      if (applyChartForecastAction(game,soloPlayer,action,payload,room.players,serverNow())) return false;
      renderChartForecastSolo(root,onExit);
      return true;
    },
    restartChartForecast() {
      soloRoom = null;
      renderChartForecastSolo(root,onExit);
    },
    leaveRoom() {
      soloRoom = null;
      onExit();
    },
  });
}

export function stopChartForecastTimer() { clearInterval(clock); }
export function stopChartForecastView() {
  if(!chartBinding) return;
  chartBinding.observer.disconnect();
  cancelAnimationFrame(chartBinding.frame);
  chartBinding=null;
}

function readDraft(key,chart) {
  try {
    const saved=JSON.parse(sessionStorage.getItem(draftStorageKey));
    if(saved?.key!==key) return null;
    const [min,max]=chart.scale;
    const limit=chart.values.length-chart.cut;
    const valid=values=>Array.isArray(values)&&values.length>0&&values.length<=limit&&
      values[0]===chart.values[chart.cut]&&values.every(value=>Number.isFinite(value)&&value>=min&&value<=max);
    if(valid(saved.draft)) return {draft:saved.draft,undos:Array.isArray(saved.undos)?saved.undos.filter(valid).slice(-40):[]};
  } catch {}
  return null;
}

function saveDraft(state) {
  try { sessionStorage.setItem(draftStorageKey,JSON.stringify({key:state.draftKey,draft:state.draft,undos:state.undos})); }
  catch {}
}

function clearDraft(key) {
  try {
    if(JSON.parse(sessionStorage.getItem(draftStorageKey))?.key===key) sessionStorage.removeItem(draftStorageKey);
  } catch {}
}

export function renderChartForecastLobby(room,isHost) {
  const settings=chartForecastSettings(room.settings);
  const select=(key,label,options,suffix="")=>`<label class="setting-row"><span>${label}</span><select data-chart-setting="${key}" ${isHost?"":"disabled"}>${options.map(value=>`<option value="${value}" ${settings[key]===value?"selected":""}>${value}${suffix}</option>`).join("")}</select></label>`;
  return `<div class="board-lobby-settings">${select("rounds","Liczba wykresów",chartRoundOptions)}${select("chartTime","Czas na prognozę",chartTimeOptions," s")}</div>`;
}

function scoresHtml(game,accounts,currentUser) {
  const ordering=game.chartRanking||chartForecastRanking(game);
  if(!ordering.length) return '<p class="chart-no-forecasts">Brak zatwierdzonych prognoz.</p>';
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

function resultPanel(game,chart,state,currentUser,accounts,row,source,solo) {
  const tabs=game.chartRounds.map((item,index)=>`<button type="button" class="ghost" data-chart-review="${index}" aria-pressed="${state.review===index}">${escapeHtml(catalog.get(item.chartId)?.title||"Wykres")} <b>${accuracy(item.rows?.[currentUser]?.accuracy)}</b></button>`).join("");
  const payout=game.rewardSummary?.payouts?.[currentUser];
  return `<section class="chart-final">
    <div class="chart-stats"><strong>${accuracy(game.scores[currentUser])}</strong><span>Średnia trafność ${payout!=null?`· +${payout}$`:""}</span></div>
    ${solo?"":scoresHtml(game,accounts,currentUser)}
  </section>
  <section class="chart-review"><h2>Twoje wykresy</h2><div class="chart-review-tabs">${tabs}</div>${chartStage(chart,{caption:true})}${statLine(row,chart.unit)}${source}</section>`;
}

function bindDrawing(canvas,panel,chart,state,expected,actions,repaint) {
  const start=chart.values[chart.cut], count=chart.values.length-chart.cut-1;
  const status=panel.querySelector("[data-chart-status]");
  const submit=panel.querySelector("[data-chart-submit]"), undo=panel.querySelector("[data-chart-undo]");
  const expired=()=>serverNow()>=expected.phaseEndsAt;
  const controls=()=>{
    const closed=expired();
    submit.disabled=closed || state.pending || state.pointer!==null || state.draft.length<=count;
    undo.disabled=closed || state.pending || state.pointer!==null || !state.undos.length;
    const message=state.pending?"Zapisywanie prognozy…":closed?"Czas minął. Czekamy na wyniki.":state.draft.length>count?"Możesz zatwierdzić lub poprawić linię."
      :state.draft.length>1?"Dorysuj linię do końca osi.":"Przeciągnij od punktu startowego.";
    if(status.textContent!==message) status.textContent=message;
  };
  const recordUndo=(before=state.draft.slice())=>{
    state.undos.push(before);
    if(state.undos.length>40) state.undos.shift();
  };
  canvas.onpointerdown=event=>{
    if(expired() || state.pending || state.pointer!==null || (event.pointerType==="mouse" && event.button!==0)) return;
    const point=forecastPointer(canvas,chart,event,start);
    if(!point.canStart || point.index>state.draft.length) return;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId);
    state.strokeStart=state.draft.slice(); state.pointer=event.pointerId;
    const previous=state.draft.length-1;
    const from=point.index>previous?{index:previous,value:state.draft[previous]}:point;
    drawForecastSegment(state.draft,from,point);
    state.cursor=point; controls(); repaint();
  };
  canvas.onpointermove=event=>{
    if(expired() || state.pointer!==event.pointerId) return;
    const point=forecastPointer(canvas,chart,event,start);
    drawForecastSegment(state.draft,state.cursor,point);
    state.cursor=point; controls(); repaint();
  };
  const end=(event,cancelled)=>{
    if(state.pointer!==event.pointerId) return;
    const before=state.strokeStart;
    if(cancelled) state.draft=before;
    else if(state.draft.length!==before.length||state.draft.some((value,index)=>value!==before[index])) {
      recordUndo(before); saveDraft(state);
    }
    state.strokeStart=null;
    state.pointer=null; state.cursor=null; controls(); repaint();
  };
  canvas.onpointerup=event=>{canvas.onpointermove(event);end(event,false);};
  canvas.onpointercancel=event=>end(event,true);
  canvas.onlostpointercapture=event=>end(event,true);
  canvas.onkeydown=event=>{
    if(expired() || state.pending || state.pointer!==null || !["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const cursor=state.cursor?.index||0;
    const vertical=event.key==="ArrowUp" || event.key==="ArrowDown";
    const index=Math.min(count,state.draft.length,Math.max(1,cursor+(event.key==="ArrowRight"?1:event.key==="ArrowLeft"?-1:0)));
    const [min,max]=chart.scale;
    const base=state.draft[index]??state.draft[index-1]??start;
    const value=vertical?Math.max(min,Math.min(max,base+(event.key==="ArrowUp"?1:-1)*(max-min)/40)):base;
    if(vertical || index===state.draft.length) {
      recordUndo(); drawForecastSegment(state.draft,{index,value},{index,value}); saveDraft(state);
    }
    state.cursor={index,value}; controls(); repaint();
  };
  undo.onclick=()=>{state.draft=state.undos.pop()||[start];saveDraft(state);state.cursor=null;controls();repaint();};
  submit.onclick=async()=>{
    const key=state.draftKey;
    state.pending=true;controls();
    try { if(await actions.chartForecastAction("submit",state.draft.slice(1),expected)) clearDraft(key); }
    finally { if(state.draftKey===key) {state.pending=false;controls();} }
  };
  controls();
  return controls;
}

function bindClock(panel,game,players,host,actions,expected,state,updateControls) {
  const key=`${game.round}:${game.phase}:${game.phaseEndsAt}`;
  if(state.clockRequest?.key!==key) state.clockRequest={key,retryAt:0,pending:false};
  const request=state.clockRequest;
  const revealing=game.phase==="chart-reveal";
  const allReady=!revealing && host && players.length && players.every(uid=>Object.hasOwn(game.forecasts||{},uid));
  const tick=()=>{
    const now=serverNow();
    const left=Math.max(0,Math.ceil((game.phaseEndsAt-now)/1000));
    const time=panel.querySelector("[data-chart-clock]");
    const label=`${left} s`;
    if(time.textContent!==label) time.textContent=label;
    time.classList.toggle("is-low",left<=5);
    if(left===0) updateControls?.();
    if((allReady || (left===0 && (!revealing||host))) && !request.pending && now>=request.retryAt) {
      request.pending=true;
      request.retryAt=now+2000;
      Promise.resolve(actions.chartForecastAction(revealing?"next":"timeout",null,expected)).finally(()=>{request.pending=false;});
    }
  };
  clock=setInterval(tick,250);tick();
}

function bindCanvas(canvas,paint,animate) {
  if(chartBinding?.canvas!==canvas) {
    stopChartForecastView();
    const binding={canvas,frame:0,start:animate?performance.now():null,paint};
    binding.repaint=()=>{
      if(binding.frame) return;
      binding.frame=requestAnimationFrame(now=>{
        binding.frame=0;
        if(!canvas.isConnected) return;
        const progress=binding.start===null?1:Math.max(0,Math.min(1,(now-binding.start)/550));
        binding.paint(progress);
        if(progress<1) binding.repaint();
      });
    };
    binding.observer=new ResizeObserver(binding.repaint);
    binding.observer.observe(canvas);
    chartBinding=binding;
  } else chartBinding.paint=paint;
  chartBinding.repaint();
  return chartBinding.repaint;
}

export function renderChartForecastGame(root,{room,accounts,currentUser,solo=false},actions) {
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
  const draftKey=`${matchKey}:${game.round}:${game.chartIds[game.round-1]}`;
  const openedNewRound=state.draftKey && state.draftKey!==draftKey && game.phase==="chart-draw";
  if(state.draftKey!==draftKey) {
    const saved=editable?readDraft(draftKey,chart):null;
    Object.assign(state,{draftKey,draft:saved?.draft||[start],undos:saved?.undos||[],pending:false,cursor:null,pointer:null,strokeStart:null,highlight:currentUser});
  }
  if(!editable) clearDraft(draftKey);
  const row=roundResult?.rows?.[currentUser];
  const profile=uid=>escapeHtml(accounts[uid]?.nick || "Gracz");
  const series=Object.entries(roundResult?.rows||{}).filter(([uid,item])=>Array.isArray(item.forecast)&&(!summary||uid===currentUser))
    .map(([uid,item])=>({uid,values:item.forecast,color:colors[game.players.indexOf(uid)%colors.length]}));
  const winning=game.winners?.includes(currentUser);
  const ranking=summary?(game.chartRanking||chartForecastRanking(game)):[];
  const place=ranking.includes(currentUser)?1+ranking.filter(uid=>game.scores[uid]>game.scores[currentUser]).length:0;
  const finalTitle=solo?"Wynik solo":winning?(game.winners.length>1?"Remis":"Wygrywasz!")
    :place?`Zajmujesz ${place}. miejsce`:"Koniec partii";
  const steps=`<div class="chart-steps" aria-label="Wykres ${game.round} z ${game.chartIds.length}">${game.chartIds.map((_,index)=>`<span class="${index<game.round?"is-past":""} ${index===game.round-1?"is-current":""}"></span>`).join("")}</div>`;
  const ready=`Gotowi · ${players.filter(uid=>Object.hasOwn(game.forecasts||{},uid)).length}/${players.length}`;
  const rankedLines=series.slice().sort((a,b)=>roundResult.rows[b.uid].accuracy-roundResult.rows[a.uid].accuracy);
  const legend=`<div class="chart-legend"><span class="chart-actual-label">Rzeczywiste dane</span>${rankedLines.map(item=>`<button type="button" class="ghost" data-chart-highlight="${escapeHtml(item.uid)}" aria-pressed="${state.highlight===item.uid}" style="--series-color:${item.color}">${profile(item.uid)} · ${accuracy(roundResult.rows[item.uid].accuracy)}</button>`).join("")}</div>`;
  const source=`<a class="chart-source" href="${escapeHtml(chart.source)}" rel="noopener noreferrer" target="_blank">Dane · ${escapeHtml(chart.publisher)} ↗</a>`;
  const tools=`<div class="chart-actions"><button type="button" class="ghost" data-chart-undo>Cofnij</button><button type="button" class="primary" data-chart-submit>Gotowe</button></div>`;
  const drawingFooter=`<div class="chart-drawing-footer"><div>${solo?"":`<span>${ready}</span>`}${editable?'<span data-chart-status aria-live="polite"></span>':""}</div>${editable?tools:""}</div>`;
  const revealFooter=`${legend}${statLine(row,chart.unit)}<div class="chart-actions">${source}${host?`<button type="button" class="primary" data-chart-next>${game.round===game.chartIds.length?"Pokaż wyniki":"Następny wykres"}</button>`:""}</div>`;
  const phasePanel=summary?resultPanel(game,chart,state,currentUser,accounts,row,source,solo)
    :`${chartStage(chart,{editable})}${revealing?revealFooter:drawingFooter}`;
  const showClock=!summary && (!solo || !revealing);
  patchRoomView(root,`${matchKey}:${game.round}:${game.phase}`,`<main class="page chart-forecast-page" data-chart-forecast>
    <header class="chart-heading"><div><p class="eyebrow">${summary?"Podsumowanie":solo?"Dorysuj wykres · Solo":"Dorysuj wykres"}</p><h1>${summary?finalTitle:escapeHtml(chart.title)}</h1></div>
      ${summary?"":`<div class="chart-progress">${steps}<span>${game.round}/${game.chartIds.length}</span>${showClock?"<time data-chart-clock></time>":""}</div>`}
    </header>
    ${phasePanel}
    <footer class="chart-footer">${summary&&solo?'<button type="button" class="primary" data-chart-restart>Zagraj jeszcze raz</button>':""}${summary&&host&&!solo?'<button type="button" class="ghost" data-chart-lobby>Wróć do pokoju</button>':""}<button type="button" class="ghost" data-chart-leave>${solo?"Wróć do Wiedzy":"Wyjdź"}</button></footer>
  </main>`);

  const canvas=root.querySelector(".chart-canvas"), panel=root.querySelector("[data-chart-forecast]");
  if(openedNewRound) requestAnimationFrame(()=>{
    if(!panel.isConnected) return;
    const top=document.querySelector(".topbar")?.getBoundingClientRect().bottom||0;
    if(panel.getBoundingClientRect().top<top) panel.scrollIntoView({block:"start",behavior:"instant"});
  });
  const expected={phase:game.phase,phaseEndsAt:game.phaseEndsAt};
  const repaint=bindCanvas(canvas,progress=>paintForecastChart(canvas,chart,{
    draft:submitted?[start,...submitted]:state.draft,series,revealed:summary||revealing,highlight:state.highlight,progress,cursor:state.cursor,
  }),revealing&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  let updateControls;
  if(editable) updateControls=bindDrawing(canvas,panel,chart,state,expected,actions,repaint);
  else {
    canvas.onpointerdown=null; canvas.onkeydown=null;
    canvas.onpointermove=null; canvas.onpointerup=null; canvas.onlostpointercapture=null; canvas.onpointercancel=null;
  }
  panel.querySelector("[data-chart-leave]").onclick=()=>actions.leaveRoom();
  const lobby=panel.querySelector("[data-chart-lobby]");
  if(lobby) lobby.onclick=()=>actions.returnToRoom();
  const restart=panel.querySelector("[data-chart-restart]");
  if(restart) restart.onclick=actions.restartChartForecast;
  panel.querySelectorAll("[data-chart-review]").forEach(button=>button.onclick=()=>{
    state.review=Number(button.dataset.chartReview);
    renderChartForecastGame(root,{room,accounts,currentUser,solo},actions);
  });
  panel.querySelectorAll("[data-chart-highlight]").forEach(button=>button.onclick=()=>{
    state.highlight=state.highlight===button.dataset.chartHighlight?"":button.dataset.chartHighlight;
    for(const item of panel.querySelectorAll("[data-chart-highlight]")) item.setAttribute("aria-pressed",String(item.dataset.chartHighlight===state.highlight));
    repaint();
  });
  const next=panel.querySelector("[data-chart-next]");
  if(next) next.onclick=()=>actions.chartForecastAction("next",null,expected);
  if(showClock) bindClock(panel,game,players,host,actions,expected,state,updateControls);
}
