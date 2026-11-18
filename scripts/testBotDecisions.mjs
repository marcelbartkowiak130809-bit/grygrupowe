import assert from "node:assert/strict";
import test from "node:test";
import { botActor, botMutation, scheduleBot } from "../js/botController.js";
import { boardBotAction, createBoardGame } from "../js/boardGames.js";
import { createFiveSecondsGame } from "../js/fiveSeconds.js";
import { createNumberMysteryGame, numberMysteryQuickQuestions, NumberMysteryEngine } from "../js/numberMystery.js";
import { createSequenceGame, SequenceEngine } from "../js/sequence.js";
import { createPokemonGame, PokemonEngine, pokemonCandidates } from "../js/pokemon.js";
import { createMathematicsGame } from "../js/mathematics.js";
import { createFriendshipTestGame, FriendshipTestEngine, friendshipDefaults } from "../js/friendshipTest.js";
import { createIdentityGame } from "../js/identity.js";
import { hangmanBotLetter, numberMysteryBotAction, sequenceBotGuess } from "../js/botDeduction.js";

const bot = "bot:expert";
const human = "human";
const players = [bot, human];
const expert = { [bot]: { botDifficulty: "expert" } };
const roomFor = (gameMode, game, overrides = {}) => ({ gameMode, game, players, settings: {}, playerProfiles: expert, ...overrides });

test("Hangman uses the mask and wrong letters, never the hidden word", () => {
  const game = { mask: ["", "o", ""], guessed: ["o", "p"], get word() { throw new Error("hidden word"); } };
  assert.equal(hangmanBotLetter(game, ["pot", "kot", "kos"], "expert"), "k");
});

test("the sequence bot creates its full draft and solves using visible feedback", () => {
  const game = createSequenceGame(players);
  botMutation(roomFor("sequence", game))(game);
  assert.equal(game.drafts[bot].length, game.length);
  assert.ok(game.ready[bot]);
  const hidden = [game.colors[1], game.colors[2], game.colors[2], game.colors[4], game.colors[5]];
  let access = false;
  const sequences = { [bot]: game.drafts[bot], get [human]() { if (!access) throw new Error("hidden sequence"); return hidden; } };
  Object.assign(game, { phase: "guess", turnUid: bot, sequences });
  for (let i = 0; i < 34 && !game.finished; i++) {
    const guess = sequenceBotGuess(game, bot, "expert");
    assert.ok(!game.history[bot].some(row => row.guess.join(",") === guess.join(",")));
    access = true;
    assert.equal(SequenceEngine.guess(game, bot, guess), undefined);
    access = false;
    if (!game.finished) game.turnUid = bot;
  }
  assert.equal(game.winner, bot);
});

test("the number bot asks legal indirect questions and derives bounds without reading its number", () => {
  const game = createNumberMysteryGame(players, { roundMode: "rounds" });
  game.numbers = { get [bot]() { throw new Error("hidden number"); }, [human]: 40 };
  const first = numberMysteryBotAction(game, bot, "expert");
  assert.ok(numberMysteryQuickQuestions.includes(first.value));
  assert.equal(NumberMysteryEngine.ask(game, bot, first.value), undefined);
  game.pendingBy = human;
  game.pendingQuestion = "Czy tyle minut wystarczyłoby na szybki prysznic?";
  assert.deepEqual(numberMysteryBotAction(game, bot, "expert"), { action: "answer", value: "yes" });
  game.phase = "guess";
  game.history = [
    { asker: bot, question: "Czy taka kwota wystarczyłaby na skromny dzień w mieście?", answer: "yes" },
    { asker: bot, question: "Czy tyle zdjęć z wyjazdu zanudziłoby znajomych?", answer: "no" },
  ];
  const guess = numberMysteryBotAction(game, bot, "expert");
  assert.equal(guess.action, "guess");
  assert.ok(guess.value > 58 && guess.value < 82);
});

test("Connect Four blocks a win and uses future positions without modifying the live board", () => {
  const game = createBoardGame("board-cztery", players);
  Object.assign(game, { cells: Array(42).fill(""), currentUid: bot });
  for (const column of [0, 1, 2]) game.cells[35 + column] = human;
  assert.deepEqual(boardBotAction(game, bot, "expert"), {action:"connect-drop", payload:"3"});
  assert.equal(game.cells[38], "");
  // Two endpoints for the bot's horizontal line. A setup move beats an opponent without an immediate reply.
  game.cells = Array(42).fill("");
  game.cells[36] = bot;
  game.cells[37] = bot;
  assert.equal(boardBotAction(game, bot, "expert").payload, "3");
});

test("5 seconds selects words from its actual category", () => {
  const game = createFiveSecondsGame(players, { categories:["countries"] });
  Object.assign(game, { activeUid: bot, categoryId:"countries", phase:"turn", startedAt:Date.now(), phaseEndsAt:Date.now()+5000 });
  const settings = { categories: ["countries"], rounds: 2 };
  assert.equal(botMutation(roomFor("5-sekund", game, {settings}))(game), null);
  assert.ok(game.history[0].accepted.length > 0 || game.history[0].raw.length === 0);
  assert.deepEqual(game.history[0].rejected, []);
});

test("Pokémon bots search the lobby's filtered dex and complete a type phase with multiple bots", () => {
  const settings = { generations:[1] };
  const game = createPokemonGame("pokemon-last-letter", players, settings);
  game.chain = [{ name: "abra" }];
  game.usedIds = pokemonCandidates(settings).filter(item => !item.name.startsWith("a")).map(item => item.id);
  botMutation(roomFor("pokemon-last-letter", game, {settings}))(game);
  assert.equal(game.chain.length, 2);
  assert.ok(game.chain.at(-1).id <= 151);
  const bots = [bot, "bot:second", human];
  const typeGame = createPokemonGame("pokemon-types", bots, settings);
  const room = roomFor("pokemon-types", typeGame, {players:bots, settings});
  assert.equal(botActor(room), bot);
  botMutation(room)(typeGame);
  assert.equal(botActor(room), "bot:second");
  botMutation(room)(typeGame);
  const pool = pokemonCandidates(settings);
  const valid = pool.find(item => Object.values(typeGame.selectedTypes).every(type => item.types.includes(type)));
  PokemonEngine.selectType(typeGame, human, valid.types[0], bots, settings);
  assert.equal(typeGame.phase, "answer");
  botMutation(room)(typeGame);
  assert.equal(typeGame.phase, "result");
  assert.equal(typeGame.scores[bot], 1);
});

test("the mathematics bot does not end a full test at the shorter question deadline", async () => {
  const game = createMathematicsGame(players, { mathematicsVariant:"full-test" });
  game.phaseEndsAt = Date.now() - 1;
  const room = roomFor("mathematics", game);
  const plan = scheduleBot(room, { mutate: mutation => mutation(game, room) });
  await plan.run();
  assert.equal(game.phase, "test");
  assert.equal(game.progress[bot], 1);
});

test("the friendship bot submits all anonymous assignments without using author IDs as answers", () => {
  const group = [bot, human, "third", "fourth"];
  const game = createFriendshipTestGame(group, friendshipDefaults);
  group.forEach(uid => FriendshipTestEngine.answer(game, uid, "odpowiedź", group, friendshipDefaults));
  botMutation(roomFor("test-znajomosci", game, {players:group, settings:friendshipDefaults}))(game);
  assert.equal(Object.keys(game.guesses[bot]).length, 3);
  assert.equal(new Set(Object.values(game.guesses[bot])).size, 3);
});

test("the Identity bot responds about the visible card and uses options on its own turn", () => {
  const game = createIdentityGame(players, {});
  game.words[human] = "Sonic";
  Object.assign(game, { phase:"responses", pending:{ uid:human, type:"question", text:"Czy moje hasło zaczyna się na literę S?" } });
  assert.equal(botMutation(roomFor("kim-jestem", game))(game), null);
  assert.equal(game.history.at(-1).answer, "TAK");
});

test("Wavelength decodes a clue without consulting the secret point", () => {
  const game = { phase:"guess", pair:["Gorące","Zimne"], clues:{ [human]:"kostka lodu" }, guesserUid:bot, scores:{[human]:0,[bot]:0}, phaseEndsAt:Date.now()+5000 };
  const move = botMutation(roomFor("wavelength", game));
  let targetReads = 0;
  Object.defineProperty(game, "target", { get() { targetReads++; return 94; } });
  move(game);
  assert.ok(game.position <= 10);
  assert.equal(targetReads, 2); // The scoring engine alone reads the target.
});
