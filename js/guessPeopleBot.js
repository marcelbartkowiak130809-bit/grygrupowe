import { guessPeople } from "./guessPeopleCatalog.js?v=20261117-11";
import { guessPeopleVisibleTraits } from "./guessPeopleVisibleTraits.js?v=20261118-15";
import { normalizeAnswer } from "./utils.js?v=20261121-6";

export const UNKNOWN_BOT_ANSWER = "Nie umiem ocenić";

const categories = new Map(guessPeople.map(([id, , category]) => [id, category]));
const checks = [
  { key: "hands", question: "Czy widać dłonie?", match: /\b(?:dlon\w*|rece|reke|rak|rekach|rekami)\b/ },
  { key: "smile", question: "Czy ta osoba się uśmiecha?", match: /\b(?:usmiech\w*|usmiechn\w*)\b/ },
  { key: "glasses", question: "Czy nosi okulary?", match: /\b(?:okular\w*|bryle)\b/ },
  { key: "longHair", question: "Czy widać długie włosy?", match: /\b(?:dlug\w*.*wlos\w*|wlos\w*.*dlug\w*)\b/ },
  { key: "hat", question: "Czy ma nakrycie głowy?", match: /\b(?:nakrycie glowy|czapk\w*|kapelusz\w*|kaszkiet\w*)\b/ },
  { key: "beard", question: "Czy widać zarost?", match: /\bzarost\w*\b/ },
].map(check => ({ ...check, accepts: id => guessPeopleVisibleTraits[check.key].has(id) }));

const categoryChecks = [...new Set(categories.values())].map(category => ({
  question: `Czy karta jest z kategorii „${category}”?`,
  accepts: id => categories.get(id) === category,
}));
const questions = [...checks, ...categoryChecks];

function interpretQuestion(question) {
  const text = normalizeAnswer(question);
  const exact = questions.find(item => normalizeAnswer(item.question) === text);
  if (exact) return exact;
  if (!/^czy /.test(text) || /\b(?:nie|bez|albo|lub|oraz|i|przeciwsloneczn\w*|bial\w*|czarn\w*|czerwon\w*|niebiesk\w*|zielon\w*|zolt\w*|brazow\w*|rozow\w*|obie|obydwie)\b/.test(text)) return null;
  const matches = checks.filter(item => item.match.test(text));
  return matches.length === 1 ? matches[0] : null;
}

export function guessPeopleBotAction(game, uid, difficulty = "normal") {
  const target = game.targets?.[game.currentUid];
  const ownCard = game.secrets?.[uid];
  if (!ownCard || !target) return null;
  if (game.question) {
    if (target !== uid) return null;
    const check = interpretQuestion(game.question);
    return { action: "guess-people-answer", payload: check ? (check.accepts(ownCard) ? "Tak" : "Nie") : UNKNOWN_BOT_ANSWER };
  }
  if (game.currentUid !== uid) return null;

  const wrong = new Set(game.wrongGuesses?.[`${uid}:${target}`] || []);
  const history = (game.history || []).filter(row => row.from === uid && row.to === target);
  const previouslyAsked = new Set(history.map(row => interpretQuestion(row.question)).filter(Boolean));
  const answers = history.filter(row => row.answer === "Tak" || row.answer === "Nie")
    .map(row => ({ check: interpretQuestion(row.question), yes: row.answer === "Tak" }))
    .filter(row => row.check);
  const candidates = game.deck.filter(id => id !== ownCard && !wrong.has(id));
  if (!candidates.length) return null;
  // Rank by matching clues. A contradictory human answer can't empty the board.
  const scores = candidates.map(id => answers.reduce((sum, row) => sum + Number(row.check.accepts(id) === row.yes), 0));
  const highest = Math.max(...scores);
  const plausible = candidates.filter((_, index) => scores[index] === highest);
  const useful = questions.filter(check => !previouslyAsked.has(check)).map(check => {
    const yes = plausible.filter(id => check.accepts(id)).length;
    return { check, split: Math.min(yes, plausible.length - yes) };
  }).filter(item => item.split > 0);
  const guessAt = { easy: 4, normal: 3, hard: 2, expert: 1 }[difficulty] ?? 3;
  const pick = values => values[Math.floor(Math.random() * values.length)];
  if (plausible.length <= guessAt || !useful.length) {
    return { action: "guess-people-try", payload: pick(plausible) };
  }
  const bestSplit = Math.max(...useful.map(item => item.split));
  const options = difficulty === "easy" ? useful : useful.filter(item => item.split === bestSplit);
  return { action: "guess-people-ask", payload: pick(options).check.question };
}
