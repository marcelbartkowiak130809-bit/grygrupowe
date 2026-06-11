import { wouldYouRatherCategories, wouldYouRatherQuestions } from "../content/co-wolisz/questions.js?v=20260602-11";
import { $, escapeHtml, playerMiniHtml } from "./utils.js?v=20260605-5";
import { getLocalWouldYouRatherAnswers, getWouldYouRatherVotes, subscribeWouldYouRatherVotes } from "./firebase.js?v=20260605-6";

const state={category:"Losowe",current:null,votes:{a:0,b:0,source:"demo"},choice:null,loading:false};
let unsubscribe=()=>{};
const pool=()=>wouldYouRatherQuestions.filter(q=>state.category==="Losowe"?!q.adult:q.category===state.category);
const playerKey=(profile,playerId)=>playerId||(profile?profile.nickOnly?`guest_${profile.nick}`:`account_${profile.nick}`:"anonymous");
function chooseNext(profile,playerId){
  const answered=getLocalWouldYouRatherAnswers(playerKey(profile,playerId)), available=pool().filter(q=>!answered[q.id]&&q.id!==state.current?.id);
  const candidates=available.length?available:pool().filter(q=>q.id!==state.current?.id);
  state.current=candidates[Math.floor(Math.random()*Math.max(1,candidates.length))]||pool()[0];
  state.choice=answered[state.current?.id]||null;
}
async function loadVotes(){if(!state.current)return;state.loading=true;state.votes=await getWouldYouRatherVotes(state.current.id);state.loading=false;}
const pct=(value,total)=>total?Math.round(value/total*100):0;
const moodTabs=()=>["Losowe",...wouldYouRatherCategories].map(category=>`<button class="mood-tab ${state.category===category?"active":""}" data-wyr-category="${category}">${category}</button>`).join("");
function answerCard(side,text,votes,total,selected,picked){
  const percent=pct(votes,total);
  return `<button class="wyr-card wyr-${side} ${selected?"wyr-selected":""} ${picked===side?"wyr-picked":""}" data-wyr-choice="${side}" ${selected?"disabled":""}>
    <span class="wyr-letter">${side.toUpperCase()}</span><strong>${escapeHtml(text)}</strong>
    ${selected?`<div class="wyr-results"><b>${percent}%</b><div class="wyr-bar"><i style="width:${percent}%"></i></div><small>${votes} ${votes===1?"głos":"głosów"}</small></div>`:'<span class="wyr-pick">Wybieram</span>'}
  </button>`;
}
export async function renderWouldYouRather(root,{profile,playerId},actions){
  if(!state.current)chooseNext(profile,playerId);state.choice=getLocalWouldYouRatherAnswers(playerKey(profile,playerId))[state.current.id]||null;await loadVotes();const q=state.current,total=state.votes.a+state.votes.b,selected=Boolean(state.choice);
  unsubscribe();unsubscribe=subscribeWouldYouRatherVotes(q.id,votes=>{if(votes.a===state.votes.a&&votes.b===state.votes.b)return;state.votes=votes;actions.refresh();});
  root.innerHTML=`<main class="page wyr-page choice-board board-shell enter"><section class="wyr-header"><div><p class="eyebrow">TRYB SOLO</p><h1>Co wolisz?</h1><p class="muted">Wybieraj jedną z dwóch opcji i porównuj swoje odpowiedzi z innymi graczami.</p></div><div class="wyr-profile">${playerMiniHtml(profile||{nick:"Gość"})}<button class="ghost" id="wyr-home">Wróć do menu</button></div></section>
  ${state.votes.source==="demo"?'<section class="warning wyr-demo">Firebase Realtime Database jest niedostępny. Grasz lokalnie, a wyniki są oznaczone jako demo.</section>':""}
  <section class="panel wyr-filters"><div><p class="eyebrow">NASTRÓJ PYTAŃ</p><div class="wyr-mood-tabs">${moodTabs()}</div></div><span class="badge wyr-mood-badge mood-${q.category.toLowerCase().replace(/[^a-z0-9]+/g,"-")}">${q.category}</span></section>
  <section class="wyr-stage"><p class="eyebrow">${q.question}</p><h2>Wybierz jedną odpowiedź</h2><div class="wyr-grid">${answerCard("a",q.optionA,state.votes.a,total,selected,state.choice)}<div class="wyr-or">ALBO</div>${answerCard("b",q.optionB,state.votes.b,total,selected,state.choice)}</div>
  ${selected?`<div class="wyr-summary"><b>${total}</b> ${total===1?"oddany głos":"oddanych głosów"} ${state.votes.source==="demo"?"· wyniki lokalne/demo":"· wyniki globalne na żywo"}</div>`:""}</section>
  <section class="wyr-actions">${selected?'<button class="primary big" id="wyr-next">Następne pytanie</button>':""}<button class="ghost" id="wyr-skip">Pomiń</button></section></main>`;
  $("#wyr-home").addEventListener("click",actions.goPlatform);root.querySelectorAll("[data-wyr-category]").forEach(button=>button.addEventListener("click",()=>{state.category=button.dataset.wyrCategory;chooseNext(profile,playerId);actions.refresh();}));root.querySelectorAll("[data-wyr-choice]").forEach(b=>b.addEventListener("click",()=>actions.wyrVote(b.dataset.wyrChoice)));$("#wyr-next")?.addEventListener("click",()=>{chooseNext(profile,playerId);actions.refresh();});$("#wyr-skip").addEventListener("click",()=>{chooseNext(profile,playerId);actions.refresh();});
}
export function setWouldYouRatherVote(choice,votes){state.choice=choice;state.votes=votes;}
export function currentWouldYouRather(){return state.current;}
export function wouldYouRatherPlayerKey(profile,playerId){return playerKey(profile,playerId);}
