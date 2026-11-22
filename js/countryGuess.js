import { normalizeAnswer } from "./utils.js?v=20261121-8";

export const countryGuessMode = "guess-the-country";
export const countryGuessDefaults = {rounds:10,flagSeconds:20};
export const countryGuessRounds = [3,5,10,15,20,30];
export const countryGuessTimes = [10,15,20,30,45];
const revealMs = 3500;

export const countryFlagCodes = "ad ag al am ao ar at au az ba bb bd be bf bg bh bi bj bn bo br bs bt bw by ca cd cf cg ch ci cl cm cn co cr cu cv cy cz de dj dk dm do dz ec ee eg er es et fi fj fm fr ga gb gd ge gh gm gn gr gt gy hn hr ht hu id ie il in iq ir is it jm jo jp ke kg kh ki km kn kr kw kz la lb lc li lk lt lv ly ma md me mg mh mk ml mm mn mr mt mu mv mw mx my mz na ne ng ni nl no np nr nz om pa pe pg ph pk pl pt pw py qa ro rs ru rw sa sb sc se sg si sk sm sn so sr sv sz tg th tj tl tm tn to tr tt tv tz ua ug us uy uz vc ve vn vu ws za zm zw".split(" ");
const polishNames = new Intl.DisplayNames(["pl"],{type:"region"});
const englishNames = new Intl.DisplayNames(["en"],{type:"region"});
const aliases = {
  ba:["Bośnia","Bosnia"],
  cd:["DR Konga","DR Kongo","DR Congo","Democratic Republic of the Congo","Kongo Kinszasa","Congo Kinshasa"],
  cf:["Republika Środkowoafrykańska","Central African Republic"],
  cg:["Republika Konga","Republic of the Congo","Kongo Brazzaville","Congo Brazzaville"],
  ci:["Wybrzeże Kości Słoniowej","Ivory Coast","Côte d’Ivoire"],
  cz:["Republika Czeska","Czech Republic"],
  gb:["Wielka Brytania","United Kingdom","Great Britain","UK","Zjednoczone Królestwo"],
  kr:["Korea Południowa","South Korea","Republika Korei"],
  mk:["Macedonia","Macedonia Północna","North Macedonia"],
  mm:["Birma","Burma","Mjanma","Myanmar"],
  nl:["Holandia","Niderlandy","Netherlands","Holland"],
  nz:["NZ"],
  ph:["the Philippines"],
  ru:["Federacja Rosyjska","Russian Federation"],
  sa:["Kingdom of Saudi Arabia"],
  sz:["Eswatini","Suazi","Swaziland"],
  tl:["Timor Wschodni","East Timor","Timor Leste"],
  tr:["Turkey","Türkiye"],
  us:["USA","US","U.S.A.","Stany Zjednoczone Ameryki","United States of America","Ameryka"],
  vc:["Saint Vincent i Grenadyny","St Vincent and the Grenadines"],
  za:["RPA","Republika Południowej Afryki","South Africa"],
};
const normalizeCountry = value => normalizeAnswer(String(value ?? "").replace(/[-–—]/g," "));

const countries = new Map(countryFlagCodes.map(code=>{
  const name = polishNames.of(code.toUpperCase());
  const english = englishNames.of(code.toUpperCase());
  const answers = [name,english,...(aliases[code] || [])].map(normalizeCountry);
  return [code,{code,name,answers:new Set(answers)}];
}));

export function countryGuessSettings(raw = {}) {
  const rounds = Number(raw.rounds);
  const flagSeconds = Number(raw.flagSeconds);
  return {
    rounds:countryGuessRounds.includes(rounds) ? rounds : countryGuessDefaults.rounds,
    flagSeconds:countryGuessTimes.includes(flagSeconds) ? flagSeconds : countryGuessDefaults.flagSeconds,
  };
}

export function createCountryGuessGame(players,raw,now = Date.now()) {
  const {rounds,flagSeconds} = countryGuessSettings(raw);
  const pool = [...countryFlagCodes];
  const flagCodes = Array.from({length:rounds},()=>{
    const index = Math.floor(Math.random()*pool.length);
    const code = pool[index];
    pool[index] = pool[pool.length-1];
    pool.pop();
    return code;
  });
  return {
    mode:countryGuessMode,round:1,phase:"country-guess",phaseEndsAt:now+flagSeconds*1000,
    flagSeconds,flagCodes,scores:Object.fromEntries(players.map(uid=>[uid,0])),
  };
}

export const currentCountry = game => countries.get(game.flagCodes?.[game.round-1]);
export const countryGuessRanking = (game,players) => players.map(uid=>({uid,score:game.scores?.[uid] || 0})).sort((a,b)=>b.score-a.score);

export function applyCountryGuessAction(game,uid,kind,raw,players,now = Date.now()) {
  if (game.mode!==countryGuessMode || !players.includes(uid)) return "Ta partia jest niedostępna.";
  if (kind==="tick" && game.phase==="country-reveal" && now>=game.phaseEndsAt) {
    if (game.round>=game.flagCodes.length) {
      const ranking = countryGuessRanking(game,players);
      game.winners = ranking.filter(row=>row.score>0 && row.score===ranking[0]?.score).map(row=>row.uid);
      game.phase = "result";
      game.phaseEndsAt = 0;
      game.finished = true;
    } else {
      game.round++;
      game.phase = "country-guess";
      game.phaseEndsAt = now+game.flagSeconds*1000;
      delete game.roundWinner;
      delete game.botPasses;
    }
    return;
  }
  if (game.phase!=="country-guess") return "Ta runda już się skończyła.";
  const country = currentCountry(game);
  if (!country) return "Flaga tej rundy jest niedostępna.";
  if (kind==="tick") {
    if (now<game.phaseEndsAt) return "Runda jeszcze trwa.";
  } else {
    if (kind!=="guess" || now>=game.phaseEndsAt) return "Czas na odpowiedź minął.";
    if (!country.answers.has(normalizeCountry(raw))) return "To inny kraj. Spróbuj jeszcze raz!";
    game.roundWinner = uid;
    game.scores[uid] = (game.scores[uid] || 0)+1;
  }
  game.phase = "country-reveal";
  game.phaseEndsAt = now+revealMs;
}
