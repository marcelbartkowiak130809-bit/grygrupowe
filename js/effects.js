import { Audio } from "./audio.js";

const played = new Set();
const themes = {
  gameStart: { className:"fx-start", title:"START!", subtitle:"Gramy!", sound:"impactStart", particles:18 },
  success: { className:"fx-success", title:"TRAFIONE!", subtitle:"Dobra odpowiedź", sound:"impactSuccess", particles:14 },
  miss: { className:"fx-miss", title:"PUDŁO!", subtitle:"Ta odpowiedź nie pasuje", sound:"impactMiss", particles:10 },
  roundWin: { className:"fx-win", title:"WYGRANA!", subtitle:"Runda zaliczona", sound:"victory", particles:26 },
  roundFail: { className:"fx-fail", title:"CZAS MINĄŁ!", subtitle:"Pozostali zgarniają nagrodę", sound:"defeat", particles:18 },
  gameVictory: { className:"fx-game-win", title:"ZWYCIĘSTWO!", subtitle:"Wygrywasz całą rozgrywkę", sound:"gameVictory", particles:42 },
  gameDefeat: { className:"fx-game-lose", title:"KONIEC GRY", subtitle:"Tym razem wygrywa przeciwnik", sound:"gameDefeat", particles:24 },
  impostorWin: { className:"fx-impostor", title:"IMPOSTOR WYGRYWA", subtitle:"Nikt go nie wykrył", sound:"evilLaugh", particles:32 },
  citizensWin: { className:"fx-detect", title:"WYKRYTY!", subtitle:"Obywatele znaleźli podejrzanego", sound:"detect", particles:26 },
  reveal: { className:"fx-reveal", title:"REVEAL", subtitle:"Sprawdźmy odpowiedź", sound:"reveal", particles:14 },
  voteResult: { className:"fx-vote", title:"WERDYKT", subtitle:"Głosy zostały policzone", sound:"voteHit", particles:18 },
  choice: { className:"fx-choice", title:"WYBRANO", subtitle:"Głos zapisany", sound:"choice", particles:12 },
  auctionBid: { className:"fx-auction", title:"PODBICIE!", subtitle:"Oferta zaktualizowana", sound:"bid", particles:16 },
};

function particle(index) {
  const angle=(index*137.5)%360,distance=90+(index%5)*28,delay=(index%6)*.035;
  return `<i style="--angle:${angle}deg;--distance:${distance}px;--delay:${delay}s"></i>`;
}

function show(name, key) {
  const finalOutcome=window.__gameFinalAudio;
  const isFinalRoundEffect=Boolean(finalOutcome&&(name==="roundWin"||name==="roundFail"));
  const theme=themes[isFinalRoundEffect?finalOutcome:name];if(!theme)return;
  if(isFinalRoundEffect)window.__lastFinalEffect=true;
  document.querySelector(".game-fx")?.remove();
  const overlay=document.createElement("div");
  overlay.className=`game-fx ${theme.className}`;
  overlay.innerHTML=`<div class="fx-flash"></div><div class="fx-particles">${Array.from({length:theme.particles},(_,index)=>particle(index)).join("")}</div><section><strong>${theme.title}</strong><span>${theme.subtitle}</span></section>`;
  document.body.append(overlay);
  document.body.classList.remove("screen-impact");void document.body.offsetWidth;document.body.classList.add("screen-impact");
  setTimeout(()=>document.body.classList.remove("screen-impact"),620);
  setTimeout(()=>overlay.remove(),1500);
  Audio.play(theme.sound);
}

export const Effects = {
  play(name, key) {
    if(key&&played.has(key))return;
    if(key)played.add(key);
    show(name, key);
  },
  hit(valid) { show(valid?"success":"miss"); },
};
