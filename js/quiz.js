import { easierFormerMediumQuestions, quizQuestionRows } from "../content/quiz/questions.js?v=20261127-8";
import { Audio } from "./audio.js?v=20261123-7";
import { avatarHtml, escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20261121-8";

export const quizDefaults = { quizVariant:"casual", questionCount:10, questionTime:60, difficulty:"all", lifelinesEnabled:false, alternativeScoring:false };
const quizDifficultyLabels = { all:"Wszystkie", easy:"Łatwe", hard:"Trudne" };
const quizDifficulty = value => Object.hasOwn(quizDifficultyLabels, value) ? value : quizDefaults.difficulty;

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

function newQuestion(originalDifficulty, row, index) {
  const [q, correct, ...wrong] = row;
  const id = `v2-${originalDifficulty}-${index}`;
  const difficulty = originalDifficulty === "medium"
    ? (easierFormerMediumQuestions.has(index) ? "easy" : "hard")
    : originalDifficulty;
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
const casualRevealMs = 6000;
const questionDurationMs = seconds => Math.max(30,Math.min(180,Number(seconds)||60))*1000;
const phaseEnd = seconds => Date.now() + questionDurationMs(seconds);

function timedAnswerPoints(game, submittedAt) {
  const duration = questionDurationMs(game.questionTime);
  const elapsed = Math.max(0, submittedAt - (game.phaseEndsAt - duration));
  const percentage = Math.min(100, Math.floor(elapsed * 100 / duration));
  return 1000 - percentage * 10;
}

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
  if (variant === "casual") { const count=Math.max(5,Math.min(30,Number(settings.questionCount)||10)),difficulty=quizDifficulty(settings.difficulty),pool=difficulty==="all"?quizQuestions:quizQuestions.filter(item=>item.difficulty===difficulty); return { mode:"quiz", variant, difficulty, questionTime:Number(settings.questionTime)||60, scoreOnReveal:true, alternativeScoring:settings.alternativeScoring===true, lifelinesEnabled:settings.lifelinesEnabled===true, phase:"question", questionIndex:0, questionIds:shuffle(pool).slice(0,count).map(item=>item.id), answers:{}, scores, phaseEndsAt:phaseEnd(settings.questionTime) }; }
  return { mode:"quiz", variant, phase:"r1", round:1, questionIndex:0, questionIds:shuffle(quizQuestions).map(item=>item.id), order:shuffle(players), turnIndex:0, r1Turns:0, responder:"", selectedUid:"", answers:{}, eliminated:[], hearts:Object.fromEntries(players.map(uid=>[uid,3])), scores, phaseEndsAt:phaseEnd(20) };
}
const lifelineTypes = {
  half: {
    label:"50:50",
    hint:"Ukryj dwie błędne odpowiedzi",
    art:'<path d="M12 4a8 8 0 0 0 0 16V4Z" fill="currentColor" stroke="none"/><path d="M15 5a8 8 0 0 1 0 14"/><path d="M15 12h4"/>',
  },
  audience: {
    label:"Głosy ekipy",
    hint:"Podejrzyj anonimowo oddane już głosy",
    art:'<path d="M4 19h16M6 15v-3m6 3V5m6 10V9"/><circle cx="6" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="5" r="1" fill="currentColor" stroke="none"/>',
  },
  double: {
    label:"Drugi strzał",
    hint:"Zaznacz dwie odpowiedzi. Wystarczy jedna trafiona",
    art:'<path d="m4 7 3 3 5-6M12 15l3 3 5-6M4 19h4M16 5h4"/>',
  },
};

function activeLifeline(game, uid, type) {
  const use = game.lifelines?.[uid]?.[type];
  return use?.questionIndex === game.questionIndex ? use : null;
}

function currentVotesForOption(game, option, players, excludedUid) {
  return players.filter(uid => uid !== excludedUid && (
    game.answers?.[uid] === option || game.bonusAnswers?.[uid] === option
  ));
}

function useCasualLifeline(game, uid, type, players) {
  if (game.variant !== "casual" || !game.lifelinesEnabled || !Object.hasOwn(lifelineTypes, type)) return "To koło ratunkowe jest niedostępne.";
  if (game.phase !== "question" || Date.now() >= game.phaseEndsAt || game.answers?.[uid] != null) return "Koła użyj przed zapisaniem odpowiedzi.";
  if (game.lifelines?.[uid]?.[type]) return "To koło zostało już wykorzystane.";

  const question = questionById(game.questionIds[game.questionIndex]);
  const use = {questionIndex:game.questionIndex};
  if (type === "half") {
    const first = activeLifeline(game,uid,"double")?.first;
    const wrongOptions = [0,1,2,3].filter(option => option !== question.answer && option !== first);
    use.removed = shuffle(wrongOptions).slice(0,2);
  } else if (type === "audience") {
    const counts = [0,1,2,3].map(option => currentVotesForOption(game,option,players,uid).length);
    if (!counts.some(Boolean)) return "Nikt jeszcze nie oddał głosu. Koło jest nadal dostępne.";
    use.counts = counts;
  }
  game.lifelines ||= {};
  game.lifelines[uid] ||= {};
  game.lifelines[uid][type] = use;
}

function revealCasualAnswer(game) {
  const question = questionById(game.questionIds[game.questionIndex]);
  game.answers ||= {};
  for (const uid of Object.keys(game.lifelines || {})) {
    const double = activeLifeline(game,uid,"double");
    if (double?.first == null || game.answers[uid] != null) continue;
    game.answers[uid] = double.first;
    if (game.alternativeScoring) {
      game.answerValues ||= {};
      game.answerValues[uid] = double.firstPoints || 0;
    }
  }
  game.history ||= [];
  const record = {id:question.id, answers:{...game.answers}};
  if (game.bonusAnswers) record.bonusAnswers = {...game.bonusAnswers};
  if (game.alternativeScoring) record.points = {};
  for (const [uid, option] of Object.entries(game.answers)) {
    if (!game.scoreOnReveal || (option !== question.answer && game.bonusAnswers?.[uid] !== question.answer)) continue;
    const points = game.alternativeScoring ? game.answerValues?.[uid] || 0 : 1;
    game.scores[uid] = (game.scores[uid] || 0) + points;
    if (game.alternativeScoring) {
      record.points[uid] = points;
      game.correctCounts ||= {};
      game.correctCounts[uid] = (game.correctCounts[uid] || 0) + 1;
    }
  }
  game.history.push(record);
  game.phase = "question-reveal";
  game.phaseEndsAt = Date.now() + casualRevealMs;
}

function nextCasualQuestion(game) {
  if (game.questionIndex + 1 >= game.questionIds.length) {
    game.phase = "result";
    game.finished = true;
    return;
  }
  game.questionIndex += 1;
  game.phase = "question";
  game.answers = {};
  delete game.bonusAnswers;
  delete game.answerValues;
  game.scoreOnReveal = true;
  game.phaseEndsAt = phaseEnd(game.questionTime);
}

function casualAnswer(game, uid, option, players) {
  const submittedAt = Date.now();
  if (game.phase !== "question" || submittedAt >= game.phaseEndsAt) return "Czas na odpowiedź minął.";
  if (!Number.isInteger(option) || option < 0 || option > 3) return "Wybierz jedną z odpowiedzi.";
  game.answers ||= {};
  if (game.answers[uid] != null) return "Odpowiedź została już wysłana.";
  if (activeLifeline(game,uid,"half")?.removed?.includes(option)) return "Ta odpowiedź odpadła po użyciu 50:50.";
  const double = activeLifeline(game,uid,"double");
  if (double && double.first == null) {
    double.first = option;
    if (game.alternativeScoring) double.firstPoints = timedAnswerPoints(game,submittedAt);
    return;
  }
  if (double && option === double.first) return "Wybierz inną odpowiedź.";
  game.answers[uid] = double ? double.first : option;
  if (game.alternativeScoring) {
    game.answerValues ||= {};
    game.answerValues[uid] = timedAnswerPoints(game,submittedAt);
  }
  if (double) {
    game.bonusAnswers ||= {};
    game.bonusAnswers[uid] = option;
  }
  // Rooms started before the reveal phase already award points when a vote arrives.
  if (!game.scoreOnReveal && option === questionById(game.questionIds[game.questionIndex]).answer) game.scores[uid] += 1;
  if (players.every(player => game.answers[player] != null)) revealCasualAnswer(game);
}

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
  useLifeline: useCasualLifeline,
  answer(game, uid, option, players) {
    if (game.variant === "casual") return casualAnswer(game, uid, option, players);
    return competitiveAnswer(game, uid, option, players);
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
      if (Date.now() < game.phaseEndsAt) return;
      if (game.phase === "question") revealCasualAnswer(game);
      else if (game.phase === "question-reveal") nextCasualQuestion(game);
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

function answerVoters(game, option, accounts) {
  const voters = currentVotesForOption(game,option,Object.keys(game.answers || {}));
  if (!voters.length) return "";
  return `<div class="quiz-voters">${voters.map(uid => {
    const player = accounts[uid] || {nick:"Gracz"};
    return `<span class="quiz-voter">${avatarHtml(player,"quiz-avatar")}<span>${escapeHtml(player.nick || "Gracz")}</span></span>`;
  }).join("")}</div>`;
}

function lifelineButtons(game, uid) {
  if (!game.lifelinesEnabled) return "";
  const used = game.lifelines?.[uid] || {};
  const hasAnswered = game.answers?.[uid] != null;
  return `<div class="quiz-lifelines" role="group" aria-label="Koła ratunkowe">
    ${Object.entries(lifelineTypes).map(([type, {label,hint,art}]) => `
      <button type="button" class="quiz-lifeline ${used[type] ? "is-spent" : ""}" data-quiz-lifeline="${type}"
        title="${hint}" aria-label="${label}: ${used[type] ? "wykorzystane" : hint}" ${used[type] || hasAnswered ? "disabled" : ""}>
        <span class="quiz-lifeline-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${art}</svg></span>
        <span>${label}</span>
      </button>`).join("")}
  </div>`;
}

const answerLetters = ["A", "B", "C", "D"];
const quizPresentation = new Map();

function answerLabel(option, index) {
  return `<span class="quiz-option-key" aria-hidden="true">${answerLetters[index]}</span>
    <span class="quiz-option-label">${escapeHtml(option)}</span>`;
}

function quizQuestionHeader(game, question, status) {
  const casual = game.variant === "casual";
  const reveal = game.phase === "question-reveal";
  const progress = casual
    ? `Pytanie ${game.questionIndex + 1} z ${game.questionIds.length}`
    : `Runda ${game.phase[1]} · Pytanie ${game.questionIndex + 1}`;
  return `<div class="quiz-question-header">
    <div class="quiz-question-meta"><p class="eyebrow">${casual ? "Quiz Casual" : "Quiz Rywalizacja"}</p><span>${progress}</span></div>
    <div class="quiz-clock"><span data-quiz-countdown>${Math.max(0,Math.ceil((game.phaseEndsAt-Date.now())/1000))} s</span>
      <div class="quiz-clock-track" aria-hidden="true"><div data-quiz-clock-fill></div></div>
    </div>
  </div>
  <div class="quiz-question-copy">
    <p class="quiz-casual-status ${reveal ? "quiz-reveal-status" : ""}" role="status">${status}</p>
    <h1>${escapeHtml(question.q)}</h1>
  </div>`;
}

function casualMarkup(game, accounts, currentUser) {
  const question = questionById(game.questionIds[game.questionIndex]);
  const committed = game.answers?.[currentUser];
  const double = activeLifeline(game,currentUser,"double");
  const chosen = committed ?? double?.first;
  const extra = game.bonusAnswers?.[currentUser];
  const removed = activeLifeline(game,currentUser,"half")?.removed || [];
  const peek = activeLifeline(game,currentUser,"audience")?.counts;
  const revealed = game.phase === "question-reveal";
  const lastQuestion = game.questionIndex + 1 === game.questionIds.length;
  const options = question.options.map((option, index) => {
    const selected = index === chosen || index === extra;
    const state = revealed
      ? index === question.answer ? "is-correct" : selected ? "is-wrong" : ""
      : selected ? "is-chosen" : "";
    const text = answerLabel(option,index);
    if (!revealed) {
      if (removed.includes(index)) return `<div class="quiz-option quiz-option-removed" aria-label="Opcja odrzucona przez 50:50"><span class="quiz-option-key" aria-hidden="true">${answerLetters[index]}</span><span class="quiz-option-label">—</span></div>`;
      const votes = peek ? `<small class="quiz-peek-count">Głosy · ${peek[index]}</small>` : "";
      return `<button type="button" class="quiz-option ${state}" data-quiz-answer="${index}" ${committed != null || selected ? "disabled" : ""} aria-pressed="${selected}">${text}${votes}</button>`;
    }
    const label = state === "is-correct" ? "Poprawna odpowiedź" : state === "is-wrong" ? "Twoja błędna odpowiedź" : "";
    return `<div class="quiz-option ${state}">${text}${label ? `<small class="quiz-answer-verdict">${label}</small>` : ""}${answerVoters(game,index,accounts)}</div>`;
  }).join("");
  const status = revealed ? (lastQuestion ? "Wyniki za chwilę" : "Odsłonięcie odpowiedzi")
    : committed != null ? "Odpowiedź zapisana"
    : double ? (chosen == null ? "Wybierz pierwszą odpowiedź" : "Wybierz drugą odpowiedź")
    : "Czas na odpowiedź";
  const points = revealed && game.alternativeScoring ? game.history?.[game.questionIndex]?.points?.[currentUser] || 0 : null;
  const statusWithPoints = points == null ? status : `${status} · +${points.toLocaleString("pl-PL")} pkt`;
  return `${quizQuestionHeader(game,question,statusWithPoints)}<div class="quiz-options">${options}</div>
    ${revealed ? "" : lifelineButtons(game,currentUser)}`;
}

function competitiveMarkup(game, accounts, currentUser) {
  const question = questionById(game.questionIds[game.questionIndex]);
  const active = game.phase === "r1" ? game.order[game.turnIndex] : game.responder;
  const canBuzz = game.phase.endsWith("-buzz");
  const choosing = game.phase === "r3-choose";
  const status = choosing ? "Wybór odpowiadającego gracza" : canBuzz ? "Zgłoś się do odpowiedzi" : "Czas na odpowiedź";
  const stations = game.order.map(uid => `<div class="quiz-station ${uid===active?"is-active":""}">
    ${avatarHtml(accounts[uid]||{nick:"Gracz"},"quiz-station-avatar")}<b>${escapeHtml(accounts[uid]?.nick||"Gracz")}</b>
    <span>${game.scores[uid]||0} pkt · ${game.hearts?.[uid]??3} ♥</span></div>`).join("");
  const choices = choosing && game.responder === currentUser
    ? `<div class="quiz-choose-player">${game.order.filter(uid=>!game.eliminated?.includes(uid)).map(uid=>`<button class="ghost" data-quiz-choose="${uid}">${escapeHtml(accounts[uid]?.nick||"Gracz")}</button>`).join("")}</div>` : "";
  const answers = choosing ? "" : `<div class="quiz-options">${question.options.map((option,index)=>`<button class="quiz-option" data-quiz-answer="${index}" ${active!==currentUser?"disabled":""}>${answerLabel(option,index)}</button>`).join("")}</div>`;
  return `${quizQuestionHeader(game,question,status)}${answers}
    ${canBuzz ? '<button class="primary quiz-buzz" data-quiz-buzz>Zgłaszam się!</button>' : ""}${choices}
    <div class="quiz-stations">${stations}</div>`;
}

function resultMarkup(game, accounts, currentUser) {
  const ranking = Object.entries(game.scores || {}).sort(([,a],[,b])=>b-a);
  const topScore = Number(ranking[0]?.[1] || 0);
  let place = 1;
  const rows = ranking.map(([uid, score], index) => {
    if (index > 0 && score !== ranking[index-1][1]) place = index + 1;
    return `<article class="quiz-result-row ${uid===currentUser?"is-self":""}"><b>${place}.</b>
      ${resultPlayerMiniHtml(accounts[uid],Number(score)===topScore&&topScore>0?"win":"lose")}<strong>${score} pkt</strong>
    </article>`;
  }).join("");
  return `<p class="eyebrow">Quiz · Wyniki końcowe</p><h1>${game.variant==="casual"?"Wyniki":"Podium"}</h1>
    <div class="quiz-results">${rows}</div><button class="primary" id="quiz-lobby">Wróć do lobby</button>`;
}

function quizPresentationState(view, room, currentUser) {
  const game = room.game;
  const match = game.siteGameId || game.startedAt || game.questionIds.join(",");
  const session = JSON.stringify([room.roomId,match,currentUser]);
  if (!quizPresentation.has(session)) {
    if (quizPresentation.size >= 12) quizPresentation.delete(quizPresentation.keys().next().value);
    quizPresentation.set(session, {heard:new Set()});
  }
  const state = quizPresentation.get(session);
  const soundStage = game.phase === "result" ? "result" : `${game.questionIndex}:${game.phase}`;
  const stageChanged = state.stage !== soundStage;
  if (stageChanged) {
    state.stage = soundStage;
    state.startedAt = performance.now();
    state.heard.clear();
  }
  const panel = view.querySelector(".quiz-panel");
  const elapsed = performance.now() - state.startedAt;
  if (elapsed < 340) {
    panel.style.setProperty("--quiz-enter-delay", `${-elapsed}ms`);
    panel.classList.add("quiz-stage-enter");
  }

  let cue = stageChanged ? "question" : "";
  let key = soundStage;
  if (game.phase === "result") cue = "result";
  else if (game.phase === "question-reveal") {
    const answer = questionById(game.questionIds[game.questionIndex]).answer;
    const first = game.answers?.[currentUser];
    cue = first == null ? "reveal" : first === answer || game.bonusAnswers?.[currentUser] === answer ? "correct" : "miss";
  } else if (game.variant === "casual") {
    const used = Object.keys(lifelineTypes).filter(type => activeLifeline(game,currentUser,type)).length;
    if (game.answers?.[currentUser] != null || activeLifeline(game,currentUser,"double")?.first != null) {
      cue = "lock";
      key += game.answers?.[currentUser] != null ? ":locked" : ":first";
    } else if (used) {
      cue = "lifeline";
      key += `:lifeline:${used}`;
    }
  } else if (!["r1","r2-buzz","r3-buzz"].includes(game.phase)) cue = "";

  const playerStage = JSON.stringify([session,key]);
  panel.dataset.quizCue = playerStage;
  if (!cue || state.heard.has(key)) return;
  state.heard.add(key);
  const screen = view.parentElement || view;
  const isCurrent = () => screen.isConnected && screen.querySelector(".quiz-panel")?.dataset.quizCue === playerStage;
  void Audio.playSfxSample(new URL(`../assets/quiz/${cue}.wav`,import.meta.url).href,isCurrent).catch(()=>{});
}

export function renderQuizGame(root, {room, accounts, currentUser}, actions) {
  stopQuizTimer();
  const game = room.game;
  const casual = game.variant === "casual";
  const finished = game.phase === "result";
  const phaseClass = finished ? "quiz-finished" : game.phase === "question-reveal" ? "quiz-reveal" : "";
  const markup = finished ? resultMarkup(game,accounts,currentUser) : casual
    ? casualMarkup(game,accounts,currentUser) : competitiveMarkup(game,accounts,currentUser);
  root.innerHTML = `<main class="page quiz-page ${casual?"quiz-casual":"quiz-competitive"} ${phaseClass}"><section class="panel quiz-panel">${markup}</section></main>`;
  quizPresentationState(root,room,currentUser);
  if (finished) {
    root.querySelector("#quiz-lobby")?.addEventListener("click",actions.returnToRoom);
    return;
  }
  const expected = {phase:game.phase, phaseEndsAt:game.phaseEndsAt, questionIndex:game.questionIndex};
  root.querySelectorAll("[data-quiz-answer]").forEach(button => {
    button.addEventListener("click", () => actions.quizAnswer(Number(button.dataset.quizAnswer),expected));
  });
  root.querySelectorAll("[data-quiz-lifeline]").forEach(button => {
    button.addEventListener("click", () => actions.quizLifeline(button.dataset.quizLifeline,expected));
  });
  root.querySelector("[data-quiz-buzz]")?.addEventListener("click", () => actions.quizBuzz(expected));
  root.querySelectorAll("[data-quiz-choose]").forEach(button => {
    button.addEventListener("click", () => actions.quizChoose(button.dataset.quizChoose,expected));
  });
  const countdown = root.querySelector("[data-quiz-countdown]");
  const fill = root.querySelector("[data-quiz-clock-fill]");
  const clock = fill.closest(".quiz-clock");
  const duration = game.phase === "question-reveal" ? casualRevealMs
    : casual ? questionDurationMs(game.questionTime)
    : (game.phase === "r2-answer" ? 10 : game.phase === "r3-answer" ? 20 : 30) * 1000;
  const updateClock = () => {
    const remaining = Math.max(0,expected.phaseEndsAt-Date.now());
    countdown.textContent = `${Math.ceil(remaining/1000)} s`;
    clock.classList.toggle("is-urgent", remaining <= 5000 && game.phase !== "question-reveal");
    fill.style.transform = `scaleX(${Math.min(1,remaining/duration)})`;
  };
  updateClock();
  renderQuizGame.countdown = setInterval(updateClock,250);
  renderQuizGame.timer = setTimeout(() => actions.quizTimeout(expected),Math.max(100, expected.phaseEndsAt-Date.now()+50));
}
export function renderQuizLobbySettings(room,isHost){const s=room.settings||quizDefaults;if(s.quizVariant==="competitive")return `<div class="quiz-settings"><p class="muted">Szybki mecz Rywalizacji. Pokój rozpoczyna grę po zebraniu minimum 2 osób.</p></div>`;return `<div class="quiz-settings"><label>Liczba pytań <input data-quiz-setting="questionCount" type="number" min="5" max="30" value="${s.questionCount||10}" ${isHost?"":"disabled"}></label><label>Czas na pytanie <input data-quiz-setting="questionTime" type="number" min="30" max="180" value="${s.questionTime||60}" ${isHost?"":"disabled"}> s</label><label>Poziom trudności <select data-quiz-setting="difficulty" ${isHost?"":"disabled"}>${Object.entries(quizDifficultyLabels).map(([id,label])=>`<option value="${id}" ${quizDifficulty(s.difficulty)===id?"selected":""}>${label}</option>`).join("")}</select></label><label class="settings-toggle"><span><b>Koła ratunkowe</b><small>50:50, Głosy ekipy i Drugi strzał. Każde raz na grę dla każdego gracza.</small></span><input type="checkbox" data-quiz-setting="lifelinesEnabled" ${s.lifelinesEnabled===true?"checked":""} ${isHost?"":"disabled"}></label><label class="settings-toggle"><span><b>Alternatywne liczenie punktów</b><small>Więcej punktów za szybsze odpowiedzi. Od 1000 pkt za trafienie odejmuje się 10 pkt za każdy pełny 1% wykorzystanego czasu.</small></span><input type="checkbox" data-quiz-setting="alternativeScoring" ${s.alternativeScoring===true?"checked":""} ${isHost?"":"disabled"}></label></div>`;}
export function renderQuizSelect(root, actions) {
  root.innerHTML = `<main class="page quiz-select-page enter">
    <section class="quiz-choice quiz-choice-casual">
      <p class="eyebrow">DLA KAŻDEGO</p><h1>CASUAL</h1>
      <p>Spokojny quiz dla ekipy z własnymi ustawieniami hosta.</p>
      <button class="primary" data-quiz-variant="casual">Graj w Casual</button>
    </section>
    <section class="quiz-choice quiz-choice-competitive">
      <p class="eyebrow">TELETURNIEJ</p><h1>RYWALIZACJA</h1>
      <p>Szybkie mecze, zgłaszanie się i walka o miejsce w rankingu.</p>
      <button class="primary" data-quiz-variant="competitive">Graj w Rywalizację</button>
      <button class="quiz-leaderboard-trigger" type="button" data-quiz-leaderboard aria-haspopup="dialog" aria-controls="quiz-leaderboard-dialog">🏆 <b>TOPKA</b><span>Wyniki rywalizacji</span></button>
    </section>
  </main>
  <dialog class="quiz-leaderboard-dialog" id="quiz-leaderboard-dialog" aria-labelledby="quiz-leaderboard-title">
    <div class="quiz-leaderboard-content">
      <header><h2 id="quiz-leaderboard-title">Top 20 Rywalizacji</h2><form method="dialog"><button class="ghost" aria-label="Zamknij ranking" autofocus>✕</button></form></header>
      <div class="quiz-leaderboard-results" role="region" aria-label="Wyniki rankingu" tabindex="0"></div>
      <p>Ranking obejmuje wygrane w wariancie Rywalizacja.</p>
    </div>
  </dialog>`;

  root.querySelectorAll("[data-quiz-variant]").forEach(button =>
    button.addEventListener("click", () => actions.chooseQuizVariant(button.dataset.quizVariant)));
  const dialog = root.querySelector(".quiz-leaderboard-dialog");
  const results = dialog.querySelector(".quiz-leaderboard-results");
  root.querySelector("[data-quiz-leaderboard]").addEventListener("click", () => {
    let entries = [];
    try {
      entries = Object.entries(JSON.parse(localStorage.getItem("quizCompetitiveLeaderboard")) || {});
    } catch {}
    const rows = entries.sort(([,a],[,b]) => b - a).slice(0,20)
      .map(([nick,wins],index) => `<li><span>${index+1}. ${escapeHtml(nick)}</span><b>${Number(wins)||0}</b></li>`).join("");
    results.innerHTML = rows ? `<ol>${rows}</ol>` : "<p>Ranking zaczyna się od pierwszego meczu.</p>";
    results.scrollTop = 0;
    dialog.showModal();
  });
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
}
export function stopQuizTimer(){window.clearTimeout(renderQuizGame.timer);window.clearInterval(renderQuizGame.countdown);}
