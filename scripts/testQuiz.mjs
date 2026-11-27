import assert from "node:assert/strict";
import { test } from "node:test";
import { quizQuestionRows } from "../content/quiz/questions.js";
import { createQuizGame, questionById, quizQuestions, QuizEngine, renderQuizLobbySettings } from "../js/quiz.js";

const players = ["a", "b"];
const current = game => questionById(game.questionIds[game.questionIndex]);
const expire = game => {
  game.phaseEndsAt = Date.now() - 1;
  QuizEngine.timeout(game, players);
};
const canonical = value => value.toLocaleLowerCase("pl").replace(/[^\p{L}\p{N}]+/gu, "");

test("every new quiz question is distinct and has four unique options with the intended answer", () => {
  assert.equal(new Set(quizQuestions.map(question => canonical(question.q))).size, quizQuestions.length);
  for (const [difficulty, rows] of Object.entries(quizQuestionRows)) {
    assert.ok(rows.length >= 70, difficulty);
    const questions = rows.map((_, index) => questionById(`v2-${difficulty}-${index}`));
    assert.deepEqual([...new Set(questions.map(question => question.answer))].sort(), [0, 1, 2, 3]);
    for (const [index, question] of questions.entries()) {
      assert.equal(question.q, rows[index][0]);
      assert.equal(question.options.length, 4, question.q);
      assert.equal(new Set(question.options.map(canonical)).size, 4, question.q);
      assert.equal(question.options[question.answer], rows[index][1], question.q);
    }
  }
});

test("Casual draws unique questions at the selected difficulty and scores their stored answer order", () => {
  for (const difficulty of ["easy", "hard"]) {
    const game = createQuizGame(players, { difficulty, questionCount: 30 });
    assert.equal(new Set(game.questionIds).size, 30);
    while (game.phase !== "result") {
      const question = current(game);
      assert.equal(question.difficulty, difficulty);
      QuizEngine.answer(game, "a", question.answer, players);
      QuizEngine.answer(game, "b", (question.answer + 1) % 4, players);
      assert.equal(game.phase, "question-reveal");
      expire(game);
    }
    assert.deepEqual(game.scores, { a: 30, b: 0 });
  }
});

test("Casual holds answers until everyone votes, then shows the result before advancing", () => {
  const game = createQuizGame(players, {});
  const correct = current(game).answer;
  assert.ok(QuizEngine.answer(game, "a", -1, players));
  QuizEngine.answer(game, "a", correct, players);
  assert.equal(game.phase, "question");
  assert.equal(game.scores.a, 0);
  assert.ok(QuizEngine.answer(game, "a", (correct + 1) % 4, players));
  QuizEngine.timeout(game, players);
  assert.equal(game.phase, "question");
  QuizEngine.answer(game, "b", (correct + 1) % 4, players);
  assert.equal(game.phase, "question-reveal");
  assert.equal(game.questionIndex, 0);
  assert.equal(game.scores.a, 1);
  assert.equal(game.scores.b, 0);
  assert.equal(game.history.length, 1);
  expire(game);
  assert.equal(game.phase, "question");
  assert.equal(game.questionIndex, 1);
  assert.deepEqual(game.answers, {});
});

test("Casual reveals on timeout and shows the last reveal before finishing", () => {
  const game = createQuizGame(players, {});
  game.questionIndex = game.questionIds.length - 1;
  QuizEngine.answer(game, "a", current(game).answer, players);
  game.phaseEndsAt = Date.now() - 1;
  assert.ok(QuizEngine.answer(game, "b", current(game).answer, players));
  QuizEngine.timeout(game, players);
  assert.equal(game.phase, "question-reveal");
  assert.equal(game.finished, undefined);
  assert.deepEqual(game.scores, {a:1,b:0});
  expire(game);
  assert.equal(game.phase, "result");
  assert.equal(game.finished, true);
  assert.equal(game.history.length, 1);
});

test("Casual restores an in-progress legacy match without scoring submitted answers twice", () => {
  const game = createQuizGame(players, {});
  delete game.scoreOnReveal;
  game.answers = {a:current(game).answer};
  game.scores = {a:1,b:0};
  QuizEngine.answer(game, "b", current(game).answer, players);
  expire(game);
  assert.deepEqual(game.scores, {a:1,b:1});
  assert.equal(game.scoreOnReveal, true);
});

test("Quiz offers exactly three filters and old medium rooms use the full pool", () => {
  const settings = { difficulty:"medium" };
  const html = renderQuizLobbySettings({ settings }, true);
  assert.match(html, /<option value="all" selected>Wszystkie<\/option>/);
  assert.match(html, /<option value="easy" >Łatwe<\/option>/);
  assert.match(html, /<option value="hard" >Trudne<\/option>/);
  assert.doesNotMatch(html, /value="medium"/);
  assert.equal(createQuizGame(players, settings).difficulty, "all");
  assert.equal(createQuizGame(players, { difficulty:"all" }).difficulty, "all");
  assert.deepEqual(quizQuestions.reduce((counts, q) => {
    counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
    return counts;
  }, {}), { easy:398, hard:398 });
});

test("competitive prompts advance across turns, round boundaries, assignments and timeouts", () => {
  const game = createQuizGame(players, { quizVariant: "competitive" });
  const seen = new Set();
  const record = () => {
    assert.ok(game.questionIndex < game.questionIds.length);
    const id = current(game).id;
    assert.ok(!seen.has(id), id);
    seen.add(id);
  };
  for (let i = 0; i < 6; i++) {
    assert.equal(game.phase, "r1");
    record();
    QuizEngine.answer(game, game.order[game.turnIndex], current(game).answer, players);
  }
  for (let i = 0; i < 10; i++) {
    assert.equal(game.phase, "r2-buzz");
    record();
    if (i > 0) QuizEngine.buzz(game, "a", players);
    if (i >= 2 && i < 9) QuizEngine.answer(game, "a", current(game).answer, players);
    else QuizEngine.timeout(game, players);
  }
  assert.equal(game.phase, "r3-buzz");
  record();
  QuizEngine.buzz(game, "a", players);
  QuizEngine.answer(game, "a", current(game).answer, players);
  assert.equal(game.phase, "r3-choose");
  QuizEngine.choose(game, "a", "b", players);
  assert.equal(game.phase, "r3-answer");
  record();
  QuizEngine.timeout(game, players);
  assert.equal(game.hearts.b, 2);
  assert.equal(game.phase, "r3-buzz");
  record();
  while (game.phase !== "result") QuizEngine.timeout(game, players);
  assert.equal(game.finished, true);
  assert.equal(game.questionIndex, game.questionIds.length - 1);
});

test("rooms with the old question IDs keep their original questions and answer index", () => {
  for (const level of Object.keys(quizQuestionRows)) {
    assert.equal(questionById(level + "-0").options[0], "Warszawa");
    assert.equal(questionById(level + "-30").options[0], "366");
    assert.equal(questionById(level + "-299").options[0], "8");
    assert.equal(questionById(level + "-299").answer, 0);
  }
  const game = createQuizGame(players, { quizVariant: "competitive" });
  Object.assign(game, {
    phase: "r2-answer", responder: "a", questionIndex: 9,
    questionIds: Array.from({ length: 30 }, (_, index) => "medium-" + index),
  });
  QuizEngine.timeout(game, players);
  assert.equal(game.phase, "r3-buzz");
  assert.equal(current(game).id, "medium-10");
});

test("50:50 keeps the correct option, rejects hidden choices, and is spent only for its owner", () => {
  const game = createQuizGame(players, { lifelinesEnabled:true });
  const correct = current(game).answer;
  QuizEngine.useLifeline(game, "a", "half", players);
  const {removed} = game.lifelines.a.half;
  assert.equal(new Set(removed).size, 2);
  assert.ok(!removed.includes(correct));
  assert.equal(game.lifelines.b, undefined);
  assert.match(QuizEngine.answer(game, "a", removed[0], players), /50:50/);
  assert.ok(QuizEngine.useLifeline(game, "a", "half", players));
  QuizEngine.answer(game, "a", correct, players);
  QuizEngine.answer(game, "b", removed[0], players);
  expire(game);
  assert.ok(QuizEngine.useLifeline(game, "a", "half", players));
  assert.equal(QuizEngine.useLifeline(game, "b", "half", players), undefined);
});

test("audience snapshots votes without names and stays available when nobody has answered", () => {
  const group = ["a", "b", "c"];
  const game = createQuizGame(group, { lifelinesEnabled:true });
  assert.ok(QuizEngine.useLifeline(game, "a", "audience", group));
  assert.equal(game.lifelines, undefined);
  QuizEngine.answer(game, "b", 0, group);
  QuizEngine.useLifeline(game, "a", "audience", group);
  assert.deepEqual(game.lifelines.a.audience, {questionIndex:0,counts:[1,0,0,0]});
  QuizEngine.answer(game, "c", 1, group);
  assert.deepEqual(game.lifelines.a.audience.counts, [1,0,0,0]);
  assert.ok(QuizEngine.useLifeline(game, "a", "audience", group));
});

test("double shot takes two distinct picks and can use its first pick when time expires", () => {
  const game = createQuizGame(players, { lifelinesEnabled:true });
  const correct = current(game).answer, wrong = (correct+1)%4;
  QuizEngine.useLifeline(game, "a", "double", players);
  QuizEngine.answer(game, "a", wrong, players);
  QuizEngine.answer(game, "b", correct, players);
  assert.equal(game.phase, "question");
  assert.ok(QuizEngine.answer(game, "a", wrong, players));
  QuizEngine.answer(game, "a", correct, players);
  assert.deepEqual(game.scores, {a:1,b:1});
  assert.deepEqual(game.history[0].bonusAnswers, {a:correct});
  expire(game);
  assert.equal(game.bonusAnswers, undefined);
  assert.ok(QuizEngine.useLifeline(game, "a", "double", players));
  QuizEngine.useLifeline(game, "b", "double", players);
  QuizEngine.answer(game, "b", current(game).answer, players);
  expire(game);
  assert.deepEqual(game.scores, {a:1,b:2});
});

test("lifelines are optional and excluded from competitive matches", () => {
  for (const settings of [{}, {quizVariant:"competitive",lifelinesEnabled:true}]) {
    const game = createQuizGame(players, settings);
    assert.ok(QuizEngine.useLifeline(game, "a", "half", players));
    assert.equal(game.lifelines, undefined);
  }
});

test("alternative scoring drops ten points per full percent and uses the submission time", ({mock}) => {
  let now = 100000;
  mock.method(Date, "now", () => now);
  const group = ["instant", "beforeStep", "onStep", "half", "late", "wrong"];
  const game = createQuizGame(group, {alternativeScoring:true, questionTime:30});
  const correct = current(game).answer;
  const elapsed = [["instant",0], ["beforeStep",299], ["onStep",300], ["half",15000], ["late",29999]];
  for (const [uid,elapsedMs] of elapsed) {
    now = 100000 + elapsedMs;
    QuizEngine.answer(game, uid, correct, group);
    assert.equal(game.scores[uid],0);
  }
  QuizEngine.answer(game, "wrong", (correct+1)%4, group);
  assert.equal(game.phase, "question-reveal");
  assert.deepEqual(game.scores, {instant:1000,beforeStep:1000,onStep:990,half:500,late:10,wrong:0});
  assert.deepEqual(game.correctCounts, {instant:1,beforeStep:1,onStep:1,half:1,late:1});
  assert.equal(game.history[0].points.half,500);
  expire(game);
  assert.equal(game.answerValues,undefined);
});

test("timed double shot scores once using the final pick, or keeps the first pick's value on timeout", ({mock}) => {
  let now = 100000;
  mock.method(Date, "now", () => now);
  const game = createQuizGame(players, {alternativeScoring:true, lifelinesEnabled:true, questionTime:60});
  QuizEngine.useLifeline(game, "a", "double", players);
  QuizEngine.useLifeline(game, "b", "double", players);
  const correct = current(game).answer;
  now += 6000;
  QuizEngine.answer(game, "a", correct, players);
  QuizEngine.answer(game, "b", correct, players);
  now += 24000;
  QuizEngine.answer(game, "a", (correct+1)%4, players);
  expire(game);
  assert.deepEqual(game.scores, {a:500,b:900});
  assert.deepEqual(game.correctCounts, {a:1,b:1});
  assert.equal(game.phase,"question-reveal");
});

test("alternative scoring is off unless the Casual host enables it", () => {
  const game = createQuizGame(players, {});
  assert.equal(game.alternativeScoring,false);
  assert.equal(createQuizGame(players,{quizVariant:"competitive",alternativeScoring:true}).alternativeScoring,undefined);
  assert.match(renderQuizLobbySettings({settings:{alternativeScoring:true}}, true), /data-quiz-setting="alternativeScoring" checked/);
  assert.match(renderQuizLobbySettings({settings:{}}, false), /data-quiz-setting="alternativeScoring" {2}disabled/);
});
