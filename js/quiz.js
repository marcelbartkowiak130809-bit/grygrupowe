import { quizQuestionRows } from "../content/quiz/questions.js?v=20261126-3";
import { avatarHtml, escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20261121-8";

export const quizDefaults = { quizVariant:"casual", questionCount:10, questionTime:60, difficulty:"medium", showOthersAnswers:true };
const makeQuestion = (q, answer, other) => ({ q, options:[answer, ...other].slice(0,4), answer:0 });
const capitals = [["Polski","Warszawa"],["Niemiec","Berlin"],["Francji","Paryż"],["Włoch","Rzym"],["Hiszpanii","Madryt"],["Portugalii","Lizbona"],["Czech","Praga"],["Austrii","Wiedeń"],["Węgier","Budapeszt"],["Norwegii","Oslo"],["Szwecji","Sztokholm"],["Finlandii","Helsinki"],["Danii","Kopenhaga"],["Grecji","Ateny"],["Japonii","Tokio"],["Chin","Pekin"],["Indii","New Delhi"],["Kanady","Ottawa"],["Meksyku","Meksyk"],["Brazylii","Brasília"],["Argentyny","Buenos Aires"],["Egiptu","Kair"],["Australii","Canberra"],["Turcji","Ankara"],["Ukrainy","Kijów"],["Irlandii","Dublin"],["Islandii","Reykjavík"],["Belgii","Bruksela"],["Holandii","Amsterdam"],["Rumunii","Bukareszt"]];
const capitalNames = capitals.map(([,capital])=>capital);
const capitalQuestions = capitals.map(([country,answer]) => makeQuestion(`Stolicą ${country} jest:`,answer,capitalNames.filter(item=>item!==answer).sort(()=>Math.random()-.5).slice(0,3)));
const facts = [
  ["Ile dni ma rok przestępny?","366",["364","365","367"]],["Ile boków ma sześciokąt?","6",["5","7","8"]],["Jaki ocean jest największy?","Spokojny",["Atlantycki","Indyjski","Arktyczny"]],["Która planeta jest najbliżej Słońca?","Merkury",["Wenus","Mars","Jowisz"]],["Jak nazywa się naturalny satelita Ziemi?","Księżyc",["Europa","Tytan","Fobos"]],["Ile kolorów ma tęcza?","7",["5","6","8"]],["Jaki gaz jest potrzebny do oddychania?","Tlen",["Azot","Wodór","Hel"]],["Który metal ma symbol Fe?","Żelazo",["Miedź","Srebro","Cyna"]],["Ile minut ma godzina?","60",["30","90","100"]],["Który kontynent jest najmniejszy?","Australia",["Europa","Antarktyda","Ameryka Południowa"]],["Jak nazywa się proces, w którym rośliny tworzą pokarm?","Fotosynteza",["Fermentacja","Grawitacja","Erozja"]],["Który sport rozgrywa się na korcie?","Tenis",["Hokej","Golf","Boks"]],["Ile strun ma standardowa gitara?","6",["4","5","8"]],["Jaki język ma najwięcej rodzimych użytkowników?","Chiński",["Angielski","Hiszpański","Arabski"]],["Które zwierzę jest ssakiem?","Delfin",["Rekin","Żaba","Pstrąg"]],["Jaki jest wynik 9 × 9?","81",["72","90","99"]],["Która pora roku następuje po lecie?","Jesień",["Wiosna","Zima","Przedwiośnie"]],["Jak nazywa się nauka o gwiazdach?","Astronomia",["Geologia","Biologia","Meteorologia"]],["Który instrument ma klawisze?","Fortepian",["Skrzypce","Flet","Perkusja"]],["Ile planet ma Układ Słoneczny?","8",["7","9","10"]]
].map(([q,a,o])=>makeQuestion(q,a,o));
// Keep the original IDs and correct answer index for games started before the catalog update.
const nonMathSeeds = [...capitalQuestions,...facts];
const difficultyTemplates = {
  easy:["Odpowiedz: %Q","Szybkie pytanie — %Q","Która odpowiedź pasuje do pytania: %Q","Sprawdź podstawową wiedzę: %Q","Wybierz poprawną odpowiedź. %Q","Quiz dla każdego: %Q","Znasz odpowiedź? %Q","Rozgrzewka: %Q","Jedno proste pytanie: %Q","Wiedza ogólna: %Q"],
  medium:["Zastanów się i odpowiedz: %Q","Pytanie ze średniego poziomu: %Q","Sprawdź swoją wiedzę: %Q","Która odpowiedź jest prawidłowa? %Q","Runda wiedzy ogólnej: %Q","Nie zgaduj zbyt szybko: %Q","Wybierz najlepszą odpowiedź: %Q","Co wiesz na ten temat? %Q","Pytanie dla uważnych: %Q","Czas na poprawną odpowiedź: %Q"],
  hard:["Trudniejsze pytanie — %Q","Sprawdź szczegółową wiedzę: %Q","Tylko pewna odpowiedź da punkt. %Q","Pytanie dla ekspertów: %Q","Nie daj się zmylić: %Q","Wymagana jest dokładna wiedza: %Q","Wybierz jedną, najtrafniejszą odpowiedź: %Q","Poziom trudny: %Q","To pytanie wymaga skupienia: %Q","Runda zaawansowana: %Q"]
};
function buildDifficultyPool(difficulty) {
  const templates=difficultyTemplates[difficulty];
  return Array.from({length:300},(_,index)=>{const seed=nonMathSeeds[index%nonMathSeeds.length],template=templates[index%templates.length];return {...seed,id:`${difficulty}-${index}`,difficulty,q:template.replace("%Q",seed.q)};});
}
const legacyQuestions = Object.keys(quizQuestionRows).flatMap(buildDifficultyPool);

function newQuestion(difficulty, row, index) {
  const [q, correct, ...wrong] = row;
  const id = `v2-${difficulty}-${index}`;
  // The ID is stored in the room. Derive the same answer order on every device.
  let seed = 2166136261;
  for (const char of id) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  const options = [correct, ...wrong];
  for (let i = options.length - 1; i > 0; i--) {
    seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
    const j = (seed >>> 0) % (i + 1);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { id, difficulty, q, options, answer:options.indexOf(correct) };
}

export const quizQuestions = Object.entries(quizQuestionRows)
  .flatMap(([difficulty, rows]) => rows.map((row, index) => newQuestion(difficulty, row, index)));
const questionsById = new Map([...quizQuestions, ...legacyQuestions].map(question => [question.id, question]));
export const questionById = id => questionsById.get(id) || quizQuestions[0];
const phaseEnd = seconds => Date.now() + Math.max(30,Math.min(180,Number(seconds)||60))*1000;

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function ensureCompetitiveState(game, players) {
  const ids = Array.isArray(players) ? players : [];
  game.order = Array.isArray(game.order) && game.order.length ? game.order : [...ids];
  game.eliminated = Array.isArray(game.eliminated) ? game.eliminated : [];
  game.hearts = game.hearts && typeof game.hearts === "object" && !Array.isArray(game.hearts) ? game.hearts : {};
  game.scores = game.scores && typeof game.scores === "object" && !Array.isArray(game.scores) ? game.scores : {};
  ids.forEach(uid => {
    if (!(uid in game.hearts)) game.hearts[uid] = 3;
    if (!(uid in game.scores)) game.scores[uid] = 0;
  });
  return game;
}

export function createQuizGame(players, settings) {
  const variant=settings.quizVariant === "competitive" ? "competitive" : "casual";
  const scores=Object.fromEntries(players.map(uid=>[uid,0]));
  if (variant === "casual") { const count=Math.max(5,Math.min(30,Number(settings.questionCount)||10)),difficulty=["easy","medium","hard"].includes(settings.difficulty)?settings.difficulty:"medium",pool=quizQuestions.filter(item=>item.difficulty===difficulty); return { mode:"quiz", variant, difficulty, questionTime:Number(settings.questionTime)||60, playerCount:players.length, phase:"question", questionIndex:0, questionIds:shuffle(pool).slice(0,count).map(item=>item.id), answers:{}, skipVotes:[], scores, phaseEndsAt:phaseEnd(settings.questionTime) }; }
  return { mode:"quiz", variant, phase:"r1", round:1, questionIndex:0, questionIds:shuffle(quizQuestions).map(item=>item.id), order:shuffle(players), turnIndex:0, r1Turns:0, responder:"", selectedUid:"", answers:{}, eliminated:[], hearts:Object.fromEntries(players.map(uid=>[uid,3])), scores, phaseEndsAt:phaseEnd(20) };
}
function saveCasualHistory(game) { game.history=Array.isArray(game.history)?game.history:[];game.history.push({id:game.questionIds[game.questionIndex],answers:{...(game.answers||{})}}); }
function nextCasualQuestion(game) { const next=game.questionIndex+1;if(next>=game.questionIds.length){game.phase="result";game.finished=true;return;}game.questionIndex=next;game.answers={};game.skipVotes=[];game.phaseEndsAt=phaseEnd(game.questionTime||60); }
function completeCasualQuestion(game, players) { if (Object.keys(game.answers||{}).length < players.length) return; saveCasualHistory(game);nextCasualQuestion(game); }
function casualAnswer(game, uid, option, players) { if(game.phase!=="question"||game.answers?.[uid]!=null)return "Odpowiedź została już wysłana.";game.answers=game.answers||{};game.answers[uid]=Number(option);const question=questionById(game.questionIds[game.questionIndex]);if(Number(option)===question.answer)game.scores[uid]+=1;completeCasualQuestion(game,players); }
function casualSkip(game, uid, players) { game.skipVotes=Array.isArray(game.skipVotes)?game.skipVotes:[];if(!game.skipVotes.includes(uid))game.skipVotes.push(uid);if(game.skipVotes.length>=Math.ceil(players.length/2)){saveCasualHistory(game);nextCasualQuestion(game);} }
function nextCompetitiveQuestion(game) {
  if (game.questionIndex + 1 < game.questionIds.length) {
    game.questionIndex += 1;
    return true;
  }
  game.phase = "result";
  game.finished = true;
  return false;
}

function competitiveAdvance(game, players) {
  game.turnIndex = (game.turnIndex + 1) % game.order.length;
  game.r1Turns += 1;
  if (!nextCompetitiveQuestion(game)) return;
  if (game.r1Turns >= players.length * 3) {
    game.phase = "r2-buzz";
    game.r2Turns = 0;
    game.responder = "";
    game.phaseEndsAt = phaseEnd(10);
  } else game.phaseEndsAt = phaseEnd(20);
}

function advanceBuzzer(game) {
  const inRoundTwo = game.phase.startsWith("r2-");
  // Saved games from before r2Turns used questionIndex to count this round.
  if (inRoundTwo) game.r2Turns = (game.r2Turns ?? game.questionIndex) + 1;
  if (!nextCompetitiveQuestion(game)) return;
  game.responder = "";
  game.phase = inRoundTwo && game.r2Turns < 10 ? "r2-buzz" : "r3-buzz";
  game.phaseEndsAt = phaseEnd(game.phase === "r2-buzz" ? 10 : 20);
}

function loseCompetitiveHeart(game, uid, players) {
  game.hearts[uid] = Math.max(0, (game.hearts[uid] || 0) - 1);
  if (game.hearts[uid] === 0 && !game.eliminated.includes(uid)) game.eliminated.push(uid);
  if (players.filter(player => !game.eliminated.includes(player)).length <= 1) {
    game.phase = "result";
    game.finished = true;
  } else advanceBuzzer(game);
}

function competitiveAnswer(game, uid, option, players) {
  ensureCompetitiveState(game, players);
  const correct = Number(option) === questionById(game.questionIds[game.questionIndex]).answer;
  if (game.phase === "r1" && game.order[game.turnIndex] === uid) {
    if (correct) game.scores[uid] += Date.now() < game.phaseEndsAt - 15000 ? 3 : 1;
    competitiveAdvance(game, players);
  } else if (game.phase === "r2-answer" && game.responder === uid) {
    if (correct) game.scores[uid] += Date.now() < game.answerStartedAt + 2500 ? 3 : 1;
    else game.scores[uid] = Math.max(0, game.scores[uid] - 1);
    advanceBuzzer(game);
  } else if (game.phase === "r3-answer" && game.responder === uid) {
    if (correct) {
      game.scores[uid] += Date.now() < game.answerStartedAt + 2500 ? 3 : 1;
      game.phase = "r3-choose";
      game.phaseEndsAt = phaseEnd(20);
    } else loseCompetitiveHeart(game, uid, players);
  }
}

export const QuizEngine = {
  answer(game, uid, option, players) {
    if (game.variant === "casual") return casualAnswer(game, uid, option, players);
    return competitiveAnswer(game, uid, option, players);
  },
  skip(game, uid, players) {
    if (game.variant !== "casual") return "Skip jest dostępny tylko w Casual.";
    casualSkip(game, uid, players);
  },
  buzz(game, uid, players) {
    ensureCompetitiveState(game, players);
    if (!["r2-buzz","r3-buzz"].includes(game.phase) || game.responder) return "Ktoś już się zgłosił.";
    if (game.phase === "r3-buzz" && game.eliminated.includes(uid)) return "Ten gracz odpadł.";
    game.responder = uid;
    game.answerStartedAt = Date.now();
    game.phase = game.phase === "r2-buzz" ? "r2-answer" : "r3-answer";
    game.phaseEndsAt = Date.now() + (game.phase === "r2-answer" ? 10000 : 20000);
  },
  choose(game, uid, target, players) {
    ensureCompetitiveState(game, players);
    if (game.phase !== "r3-choose" || game.responder !== uid) return "To nie jest Twoja kolej.";
    if (!players.includes(target) || game.eliminated.includes(target) || !nextCompetitiveQuestion(game)) return;
    game.selectedUid = target;
    game.responder = target;
    game.phase = "r3-answer";
    game.answerStartedAt = Date.now();
    game.phaseEndsAt = Date.now() + 20000;
  },
  timeout(game, players) {
    if (game.variant === "casual") {
      saveCasualHistory(game);
      nextCasualQuestion(game);
      return;
    }
    ensureCompetitiveState(game, players);
    if (game.phase === "r1") competitiveAdvance(game, players);
    else if (game.phase === "r3-answer") loseCompetitiveHeart(game, game.responder, players);
    else if (["r2-buzz", "r2-answer", "r3-choose", "r3-buzz"].includes(game.phase)) advanceBuzzer(game);
  },
  next(game) {
    if (game.phase !== "result") return "Gra jeszcze trwa.";
  },
};

function answerAvatars(game, option, accounts) { return Object.entries(game.answers||{}).filter(([,value])=>Number(value)===option).map(([uid])=>`<span class="quiz-answer-avatar" data-tooltip="${escapeHtml(accounts[uid]?.nick||"Gracz")}">${avatarHtml(accounts[uid]||{nick:"Gracz"},"quiz-avatar")}</span>`).join(""); }
function casualMarkup(game, accounts, currentUser, settings) { const question=questionById(game.questionIds[game.questionIndex]), chosen=game.answers?.[currentUser], showOthers=settings.showOthersAnswers!==false;return `<p class="eyebrow">QUIZ · CASUAL · PYTANIE ${game.questionIndex+1}/${game.questionIds.length}</p><h1>${escapeHtml(question.q)}</h1><div class="quiz-options">${question.options.map((option,index)=>`<button class="quiz-option ${chosen!=null&&index===question.answer?"is-correct":""} ${chosen!=null&&index===chosen&&chosen!==question.answer?"is-wrong":""}" data-quiz-answer="${index}" ${chosen!=null?"disabled":""}><span>${escapeHtml(option)}</span>${showOthers?answerAvatars(game,index,accounts):""}</button>`).join("")}</div><div class="quiz-bottom"><span data-quiz-countdown>${Math.max(0,Math.ceil((game.phaseEndsAt-Date.now())/1000))}s</span><button class="ghost" data-quiz-skip>Skip · ${game.skipVotes?.length||0}/${Math.ceil((game.playerCount||2)/2)}</button></div>`; }
function competitiveMarkup(game, accounts, currentUser) { const q=questionById(game.questionIds[game.questionIndex]);const active=game.phase==="r1"?game.order[game.turnIndex]:game.responder;const choose=game.phase==="r3-choose"&&game.responder===currentUser;return `<p class="eyebrow">QUIZ · RYWALIZACJA · ${game.phase.toUpperCase()}</p><h1>${escapeHtml(q.q)}</h1><div class="quiz-stations">${game.order.map(uid=>`<div class="quiz-station ${uid===active?"is-active":""}">${avatarHtml(accounts[uid]||{nick:"Gracz"},"quiz-station-avatar")}<b>${escapeHtml(accounts[uid]?.nick||"Gracz")}</b><span>${game.scores[uid]||0} pkt · ${game.hearts?.[uid]??3} ♥</span></div>`).join("")}</div>${game.phase==="r2-buzz"||game.phase==="r3-buzz"?`<button class="primary quiz-buzz" data-quiz-buzz>Zgłaszam się!</button>`:""}${choose?`<div class="quiz-choose-player"><p>Wybierz, kto odpowie:</p>${game.order.filter(uid=>!game.eliminated?.includes(uid)).map(uid=>`<button class="ghost" data-quiz-choose="${uid}">${escapeHtml(accounts[uid]?.nick||"Gracz")}</button>`).join("")}</div>`:""}${game.phase!=="r3-choose"?`<div class="quiz-options">${q.options.map((option,index)=>`<button class="quiz-option" data-quiz-answer="${index}" ${active!==currentUser?"disabled":""}>${escapeHtml(option)}</button>`).join("")}</div>`:""}<div class="quiz-bottom"><span data-quiz-countdown>${Math.max(0,Math.ceil((game.phaseEndsAt-Date.now())/1000))}s</span></div>`; }
function resultMarkup(game, accounts) { const ranking=Object.entries(game.scores||{}).sort(([,a],[,b])=>b-a),topScore=Math.max(0,...ranking.map(([,score])=>Number(score)||0)),rows=ranking.map(([uid,score],i)=>`<div class="quiz-result-row"><b>${i+1}.</b>${resultPlayerMiniHtml(accounts[uid],Number(score)===topScore&&topScore>0?"win":"lose")}<strong>${score} pkt</strong></div>`).join("");return `<section class="panel quiz-panel center"><p class="eyebrow">QUIZ · WYNIKI</p><h1>Podium</h1><div class="quiz-results">${rows}</div><button class="primary" id="quiz-lobby">Wróć do lobby</button></section>`; }
export function renderQuizGame(root, {room,accounts,currentUser}, actions) { const game=room.game,settings=room.settings||quizDefaults;window.clearTimeout(renderQuizGame.timer);window.clearInterval(renderQuizGame.countdown);if(game.phase==="result"){root.innerHTML=`<main class="page quiz-page">${resultMarkup(game,accounts)}</main>`;root.querySelector("#quiz-lobby")?.addEventListener("click",actions.returnToRoom);return;}root.innerHTML=`<main class="page quiz-page enter"><section class="panel quiz-panel">${game.variant==="casual"?casualMarkup(game,accounts,currentUser,settings):competitiveMarkup(game,accounts,currentUser)}</section></main>`;const expected={phase:game.phase,phaseEndsAt:game.phaseEndsAt};root.querySelectorAll("[data-quiz-answer]").forEach(button=>button.addEventListener("click",()=>actions.quizAnswer(Number(button.dataset.quizAnswer),expected)));root.querySelector("[data-quiz-skip]")?.addEventListener("click",()=>actions.quizSkip(expected));root.querySelector("[data-quiz-buzz]")?.addEventListener("click",()=>actions.quizBuzz(expected));root.querySelectorAll("[data-quiz-choose]").forEach(button=>button.addEventListener("click",()=>actions.quizChoose(button.dataset.quizChoose,expected)));renderQuizGame.countdown=setInterval(()=>{const node=root.querySelector("[data-quiz-countdown]");if(node)node.textContent=`${Math.max(0,Math.ceil((game.phaseEndsAt-Date.now())/1000))}s`;},250);renderQuizGame.timer=setTimeout(()=>actions.quizTimeout(expected),Math.max(100,game.phaseEndsAt-Date.now()+50));}
export function renderQuizLobbySettings(room,isHost){const s=room.settings||quizDefaults;if(s.quizVariant==="competitive")return `<div class="quiz-settings"><p class="muted">Szybki mecz Rywalizacji. Pokój rozpoczyna grę po zebraniu minimum 2 osób.</p></div>`;return `<div class="quiz-settings"><label>Liczba pytań <input data-quiz-setting="questionCount" type="number" min="5" max="30" value="${s.questionCount||10}" ${isHost?"":"disabled"}></label><label>Czas na pytanie <input data-quiz-setting="questionTime" type="number" min="30" max="180" value="${s.questionTime||60}" ${isHost?"":"disabled"}> s</label><label>Poziom trudności <select data-quiz-setting="difficulty" ${isHost?"":"disabled"}><option value="easy" ${s.difficulty==="easy"?"selected":""}>Łatwy</option><option value="medium" ${s.difficulty!=="easy"&&s.difficulty!=="hard"?"selected":""}>Średni</option><option value="hard" ${s.difficulty==="hard"?"selected":""}>Trudny</option></select></label><label class="settings-toggle"><span><b>Pokazuj odpowiedzi innych graczy</b><small>W trakcie pytania widać, kto wybrał daną odpowiedź.</small></span><input data-quiz-setting="showOthersAnswers" type="checkbox" ${s.showOthersAnswers!==false?"checked":""} ${isHost?"":"disabled"}></label></div>`;}
export function renderQuizSelect(root,actions){const board=Object.entries(JSON.parse(localStorage.getItem("quizCompetitiveLeaderboard")||"{}")).sort(([,a],[,b])=>b-a).slice(0,20).map(([nick,wins],index)=>`<li><span>${index+1}. ${escapeHtml(nick)}</span><b>${wins}</b></li>`).join("")||"<li>Ranking zaczyna się od pierwszego meczu.</li>";root.innerHTML=`<main class="page quiz-select-page enter"><section class="quiz-choice quiz-choice-casual"><p class="eyebrow">DLA KAŻDEGO</p><h1>CASUAL</h1><p>Spokojny quiz dla ekipy z własnymi ustawieniami hosta.</p><button class="primary" data-quiz-variant="casual">Graj w Casual</button></section><section class="quiz-choice quiz-choice-competitive"><p class="eyebrow">TELETURNIEJ</p><h1>RYWALIZACJA</h1><p>Szybkie mecze, zgłaszanie się i walka o miejsce w rankingu.</p><button class="primary" data-quiz-variant="competitive">Graj w Rywalizację</button><button class="quiz-leaderboard-trigger" type="button" data-quiz-leaderboard>🏆 <b>TOPKA</b><span>Wyniki rywalizacji</span></button><div class="quiz-leaderboard" data-quiz-leaderboard-panel hidden><b>TOP 20 RYWALIZACJI</b><ol>${board}</ol><small>Ranking obejmuje wyłącznie wygrane w wariancie Rywalizacja.</small></div></section></main>`;root.querySelectorAll("[data-quiz-variant]").forEach(button=>button.addEventListener("click",()=>actions.chooseQuizVariant(button.dataset.quizVariant)));root.querySelector("[data-quiz-leaderboard]")?.addEventListener("click",()=>{const panel=root.querySelector("[data-quiz-leaderboard-panel]");panel.hidden=!panel.hidden;});}
export function stopQuizTimer(){window.clearTimeout(renderQuizGame.timer);window.clearInterval(renderQuizGame.countdown);}
