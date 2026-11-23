import { wouldYouRatherCategories, wouldYouRatherQuestions } from "../content/co-wolisz/questions.js?v=20260602-11";
import { escapeHtml, playerMiniHtml } from "./utils.js?v=20261121-8";
import { getLocalWouldYouRatherAnswers, getWouldYouRatherAnswer, loadWouldYouRatherHistory, subscribeWouldYouRatherVotes } from "./firebase.js?v=20261124-2";

let state={category:"Losowe"};
let unsubscribe=()=>{};
let renderToken=0;
const isChoice=value=>value==="a"||value==="b";
const playerKey=(profile,playerId)=>playerId||(profile?profile.nickOnly?`guest_${profile.nick}`:`account_${profile.nick}`:"guest");
const knownAnswers=(profile,key)=>({...profile?.answeredWouldYouRather,...getLocalWouldYouRatherAnswers(key)});
async function chooseNext(profile,key,skipId,isCurrent){
  const answered=knownAnswers(profile,key);
  const available=wouldYouRatherQuestions.filter(q=>!isChoice(answered[q.id]) && (state.category==="Losowe"?!q.adult:q.category===state.category));
  const skipped=available.find(q=>q.id===skipId);
  const candidates=available.filter(q=>q.id!==skipId);
  while(candidates.length && isCurrent()){
    const [question]=candidates.splice(Math.floor(Math.random()*candidates.length),1);
    if(!isChoice(await getWouldYouRatherAnswer(question.id,key,key))) return question;
  }
  if(skipped && isCurrent() && !isChoice(await getWouldYouRatherAnswer(skipped.id,key,key))) return skipped;
  return null;
}
const pct=(value,total)=>total?Math.round(value/total*100):0;
const age = value => { if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||"")))return null;const date=new Date(`${value}T00:00:00`),today=new Date();let years=today.getFullYear()-date.getFullYear();if(today.getMonth()<date.getMonth()||today.getMonth()===date.getMonth()&&today.getDate()<date.getDate())years--;return years; };
const isMinor = profile => profile?.birthDate && age(profile.birthDate) !== null && age(profile.birthDate) < 18;
const moodTabs=profile=>["Losowe",...wouldYouRatherCategories].map(category=>{const locked=String(category).startsWith("18+")&&isMinor(profile);return `<button class="mood-tab ${state.category===category?"active":""} ${locked?"adult-disabled":""}" data-wyr-category="${category}" ${locked?"disabled title=\"Tylko dla osob 18+\"":""}>${category}</button>`;}).join("");
function answerCard(side,text,votes,total,selected,picked){
  const percent=pct(votes,total);
  return `<button class="wyr-card wyr-${side} ${selected?"wyr-selected":""} ${picked===side?"wyr-picked":""}" data-wyr-choice="${side}" ${selected?"disabled":""}>
    <span class="wyr-letter">${side.toUpperCase()}</span><strong>${escapeHtml(text)}</strong>
    ${selected?`<div class="wyr-results"><b>${percent}%</b><div class="wyr-bar"><i style="width:${percent}%"></i></div><small>${picked===side?"Twój wybór · ":""}${votes} ${votes===1?"głos":"głosów"}</small></div>`:'<span class="wyr-pick">Wybieram</span>'}
  </button>`;
}
export function stopWouldYouRather(){
  unsubscribe();unsubscribe=()=>{};
  renderToken++;
  state={category:"Losowe"};
}

export async function renderWouldYouRather(root,{profile,playerId},actions){
  const key=playerKey(profile,playerId);
  if(state.key!==key) state={key,category:"Losowe",history:loadWouldYouRatherHistory(key)};
  if(state.category==="18+" && isMinor(profile)){
    state.category="Losowe";
    state.current=null;
    state.choice=null;
    state.exhausted=false;
  }
  const token=++renderToken, isCurrent=()=>token===renderToken&&root.isConnected;
  unsubscribe();unsubscribe=()=>{};
  if(state.current && !state.choice && isChoice(knownAnswers(profile,key)[state.current.id])) state.current=null;
  if(!state.current && !state.exhausted){
    await state.history;
    if(!isCurrent()) return;
    const next=await chooseNext(profile,key,state.skipId,isCurrent);
    if(!isCurrent()) return;
    state.current=next;
    state.exhausted=!next;
  }
  const q=state.current;
  const again=(category,skipId)=>{
    if(!isCurrent() || state.pending) return;
    Object.assign(state,{category,current:null,choice:null,votes:null,skipId,exhausted:false});
    void renderWouldYouRather(root,{profile,playerId},actions);
  };
  const paint=()=>{
    if(!isCurrent()) return;
    const votes=state.votes||{a:0,b:0};
    const total=votes.a+votes.b, selected=Boolean(state.choice);
    root.innerHTML=`<main class="page wyr-page choice-board board-shell"><section class="wyr-header"><div><p class="eyebrow">TRYB SOLO</p><h1>Co wolisz?</h1><p class="muted">Wybieraj jedną z dwóch opcji i porównuj swoje odpowiedzi z innymi graczami.</p></div><div class="wyr-profile">${playerMiniHtml(profile||{nick:"Gość"})}<button class="ghost" id="wyr-home">Wróć do menu</button></div></section>
    <section class="panel wyr-filters"><div><p class="eyebrow">NASTRÓJ PYTAŃ</p><div class="wyr-mood-tabs">${moodTabs(profile)}</div></div></section>
    ${q?`<section class="wyr-stage" data-wyr-question="${q.id}"><h2>Wybierz jedną odpowiedź</h2><div class="wyr-grid">${answerCard("a",q.optionA,votes.a,total,selected,state.choice)}<div class="wyr-or">ALBO</div>${answerCard("b",q.optionB,votes.b,total,selected,state.choice)}</div>
      ${selected?`<div class="wyr-summary"><b>${total}</b> ${total===1?"oddany głos":"oddanych głosów"} · ${votes.source==="demo"?"wyniki z tego urządzenia":"wyniki globalne"}</div>`:""}</section>
      <section class="wyr-actions">${selected?'<button class="primary big" id="wyr-next">Następne pytanie</button>':'<button class="ghost" id="wyr-skip">Pomiń</button>'}</section>`:
      '<section class="panel wyr-stage"><h2>To już wszystkie pytania z tej kategorii</h2><p class="muted">Wybierz inny nastrój, żeby grać dalej.</p></section>'}
    </main>`;
    root.querySelector("#wyr-home").onclick=actions.goPlatform;
    root.querySelectorAll("[data-wyr-category]").forEach(button=>{
      button.disabled ||= Boolean(state.pending);
      button.onclick=()=>{
        const category=button.dataset.wyrCategory;
        const apply=()=>again(category);
        if(category.startsWith("18+")) actions.confirmAdultSolo?.(apply);
        else apply();
      };
    });
    for(const button of root.querySelectorAll("[data-wyr-choice]")){
      button.disabled ||= Boolean(state.pending);
      button.onclick=async()=>{
        if(!isCurrent() || state.pending || state.choice) return;
        const live=state;
        live.pending=true;paint();
        try { await actions.wyrVote(button.dataset.wyrChoice,q.id); }
        finally { live.pending=false;if(isCurrent()) paint(); }
      };
    }
    const next=root.querySelector("#wyr-next, #wyr-skip");
    if(next){next.disabled=Boolean(state.pending);next.onclick=()=>again(state.category,q.id);}
  };
  paint();
  if(q && state.choice && state.votes?.source==="firebase"){
    unsubscribe=subscribeWouldYouRatherVotes(q.id,votes=>{
      if(!isCurrent() || (votes.a===state.votes.a && votes.b===state.votes.b)) return;
      state.votes=votes;paint();
    });
  }
}
export function setWouldYouRatherVote(questionId,key,choice,votes){
  if(state.current?.id!==questionId || state.key!==key) return false;
  Object.assign(state,{choice,votes});
  return true;
}
export function currentWouldYouRather(){return state.current;}
export function wouldYouRatherPlayerKey(profile,playerId){return playerKey(profile,playerId);}
