import { normalizeAnswer } from "./utils.js?v=20261121-6";

export const randomBotChoice = items => items[Math.floor(Math.random() * items.length)];

export function shuffledBotChoices(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function hangmanBotLetter(game, words, difficulty) {
  const alphabet = [..."aeioprnzstwykmdlcujbgłóhąęśżćńźf"];
  const guessed = new Set(game.guessed || []);
  const letters = [...new Set([...alphabet, ..."qvx"])].filter(letter => !guessed.has(letter));
  const mask = game.mask || [];
  const candidates = words.map(word => [...word.toLocaleLowerCase("pl-PL").normalize("NFC")])
    .filter(word => word.length === mask.length && word.every((letter, index) =>
      mask[index] ? letter === mask[index].toLocaleLowerCase("pl-PL") : !guessed.has(letter)
    ));
  const scores = new Map(letters.map(letter => [letter, 0]));
  for (const word of candidates) {
    const unrevealed = word.filter((_, index) => !mask[index]);
    for (const letter of new Set(unrevealed)) {
      if (scores.has(letter)) scores.set(letter, scores.get(letter) + 1);
    }
  }
  letters.sort((a, b) => scores.get(b) - scores.get(a));
  const breadth = { easy: 6, normal: 3, hard: 2, expert: 1 }[difficulty] || 3;
  const useful = letters.filter(letter => scores.get(letter) > 0);
  return randomBotChoice((useful.length ? useful : letters).slice(0, breadth));
}

export function sequenceBotGuess(game, uid, difficulty) {
  const { colors, length } = game;
  const history = (game.history?.[uid] || []).filter(move => !move.timeout && move.guess.length === length);
  const matches = (a, b) => a.reduce((sum, color, i) => sum + Number(color === b[i]), 0);
  if (difficulty === "hard" || difficulty === "expert") {
    const counts = history.map(() => 0);
    const palette = shuffledBotChoices(colors);
    const candidate = [];
    let visits = 0;
    function search() {
      if (++visits > 22000) return false;
      const index = candidate.length;
      if (index === length) return true;
      for (const color of palette) {
        candidate.push(color);
        history.forEach((move, i) => { counts[i] += Number(move.guess[index] === color); });
        const compatible = history.every((move, i) => counts[i] <= move.correct && counts[i] + length - index - 1 >= move.correct);
        if (compatible && search()) return true;
        history.forEach((move, i) => { counts[i] -= Number(move.guess[index] === color); });
        candidate.pop();
        if (visits > 22000) break;
      }
      return false;
    }
    if (search()) return candidate;
  }

  // Isolate one change at a time against a single-colour probe.
  // Every comparison either settles a slot or rules out one colour.
  const mono = colors.map(color => history.find(move => move.guess.every(value => value === color))).find(Boolean);
  const baseline = mono?.guess || Array(length).fill(colors[0]);
  if (!mono) return baseline;
  const known = [];
  const probes = [];
  for (let index = 0; index < length; index++) {
    const choices = [];
    let settled = false;
    for (const color of colors.filter(color => color !== baseline[index])) {
      const guess = [...baseline];
      guess[index] = color;
      const result = history.find(move => matches(move.guess, guess) === length);
      if (!result) choices.push(guess);
      else if (result.correct !== mono.correct) {
        known[index] = result.correct > mono.correct ? color : baseline[index];
        settled = true;
        break;
      }
    }
    if (!settled && choices.length) probes.push(...choices);
    if (!settled && !choices.length) known[index] = baseline[index];
  }
  return (difficulty === "easy" ? randomBotChoice(probes) : probes[0]) || baseline.map((color, index) => known[index] || color);
}

// Range or threshold implied by an existing, indirect quick question.
const numberQuestions = [
  ["Czy tyle minut wystarczyłoby na szybki prysznic?", 8, 150],
  ["Czy tyle minut czekania na autobus byłoby irytujące?", 19, 150],
  ["Czy tyle minut wystarczyłoby na przygotowanie śniadania?", 15, 150],
  ["Czy tyle minut wystarczyłoby na krótką drzemkę?", 20, 150],
  ["Czy tyle minut oczekiwania na pizzę byłoby normalne?", 15, 46],
  ["Czy taki wiek pasowałby do studenta?", 18, 27],
  ["Czy taki wiek kojarzyłby się z dorosłością?", 18, 150],
  ["Czy taki wiek pasowałby do osoby planującej emeryturę?", 57, 67],
  ["Czy taka kwota wystarczyłaby na skromny dzień w mieście?", 65, 150],
  ["Czy taka cena byłaby przesadą za zwykły obiad?", 60, 150],
  ["Czy taka kwota wyglądałaby jak oszczędności na nagły wydatek?", 110, 150],
  ["Czy taka długość filmu byłaby męcząca?", 126, 150],
  ["Czy taka temperatura kojarzyłaby się z upałem?", 30, 150],
  ["Czy tyle osób zmieściłoby się przy dużym stole?", 1, 16],
  ["Czy taka liczba książek zmieściłaby się na półce?", 1, 35],
  ["Czy tyle zdjęć z wyjazdu zanudziłoby znajomych?", 74, 150],
  ["Czy tyle kilometrów na rowerze byłoby dobrym wyzwaniem?", 38, 150],
  ["Czy tyle minut muzyki zmieściłoby się na krótkiej płycie?", 1, 36],
  ["Czy tyle stron byłoby krótką książką?", 1, 125],
  ["Czy taka liczba procent baterii wystarczyłaby do wieczora?", 48, 100],
  ["Czy tyle minut podcastu pasowałoby do podróży?", 45, 100],
].map(([question, min, max]) => ({ question, matches: value => value >= min && value <= max }));
const numberQuestionByText = new Map(numberQuestions.map(rule => [normalizeAnswer(rule.question), rule]));

export function numberMysteryBotAction(game, uid, difficulty) {
  if (game.phase === "answer") {
    const rule = numberQuestionByText.get(normalizeAnswer(game.pendingQuestion));
    const visibleNumber = game.numbers?.[game.pendingBy];
    return { action: "answer", value: !rule || !Number.isFinite(visibleNumber) ? "maybe" : rule.matches(visibleNumber) ? "yes" : "no" };
  }
  const history = (game.history || []).filter(row => row.asker === uid);
  const tried = new Set(history.map(row => row.guess).filter(Number.isInteger));
  const asked = new Set(history.map(row => normalizeAnswer(row.question)));
  const clues = history.filter(row => row.answer === "yes" || row.answer === "no")
    .map(row => [numberQuestionByText.get(normalizeAnswer(row.question)), row.answer === "yes"])
    .filter(([rule]) => rule);
  const remaining = Array.from({length:150}, (_, i) => i + 1).filter(value => !tried.has(value));
  const weights = remaining.map(value => clues.reduce((weight, [rule, yes]) => weight * (rule.matches(value) === yes ? 1 : .22), 1));
  const total = weights.reduce((sum, value) => sum + value, 0);
  const best = Math.max(...weights);
  const likely = remaining.filter((_, index) => weights[index] === best);
  const choices = numberQuestions.filter(rule => !asked.has(normalizeAnswer(rule.question))).map(rule => {
    const yesWeight = remaining.reduce((sum, value, index) => sum + (rule.matches(value) ? weights[index] : 0), 0);
    return { rule, balance: Math.min(yesWeight, total - yesWeight) };
  }).sort((a, b) => b.balance - a.balance);
  const breadth = { easy: 5, normal: 3, hard: 2, expert: 1 }[difficulty] || 3;
  const final = game.phase === "guess";
  const worthAsking = choices[0]?.balance > total * .09;
  if (final || (game.roundMode === "race" && (likely.length <= breadth + 2 || !worthAsking))) {
    if (!final && game.roundMode === "race") return { action: "guess", value: randomBotChoice(likely) || 75 };
    let cumulative = 0;
    const median = remaining.find((_, index) => (cumulative += weights[index]) >= total / 2);
    return { action: "guess", value: median || 75 };
  }
  const choice = randomBotChoice(choices.slice(0, breadth));
  return { action: "ask", value: choice?.rule.question || numberQuestions[history.length % numberQuestions.length].question };
}
