import assert from "node:assert/strict";
import { test } from "node:test";
import { quizQuestionRows } from "../content/quiz/questions.js";
import { createQuizGame, questionById, quizQuestions, QuizEngine, renderQuizLobbySettings } from "../js/quiz.js";

const players = ["a", "b"];
const current = game => questionById(game.questionIds[game.questionIndex]);
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
    }
    assert.deepEqual(game.scores, { a: 30, b: 0 });
  }
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
  }, {}), { easy:150, hard:150 });
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
