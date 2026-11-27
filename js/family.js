import { avatarHtml, escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20261121-8";

export const familyDefaults={rounds:5,answerTime:30,turnMode:"afterAnswer",topSize:10,scoring:"one"};
const baseQuestionBank=[
  ["Wymień najpopularniejsze owoce.",[["jabłko",35],["banan",25],["truskawka",18],["pomarańcza",12],["gruszka",7],["winogrono",3]]],
  ["Co ludzie robią rano?",[["myją zęby",30],["piją kawę",25],["jedzą śniadanie",20],["biorą prysznic",14],["ubierają się",7],["sprawdzają telefon",4]]],
  ["Wymień coś, co zabierasz na wakacje.",[["walizka",30],["telefon",22],["krem z filtrem",18],["strój kąpielowy",14],["pieniądze",10],["aparat",6]]],
  ["Popularne sporty.",[["piłka nożna",32],["siatkówka",20],["koszykówka",16],["tenis",12],["pływanie",11],["lekkoatletyka",9]]],
  ["Co można znaleźć w lodówce?",[["mleko",28],["ser",22],["warzywa",18],["jajka",14],["wędlinę",10],["jogurt",8]]],
  ["Wymień zwierzęta domowe.",[["pies",35],["kot",32],["rybki",12],["chomik",9],["królik",7],["papuga",5]]],
  ["Co robisz w weekend?",[["odpoczywam",28],["spotykam się ze znajomymi",24],["gram",18],["oglądam film",14],["sprzątam",9],["uprawiam sport",7]]],
  ["Popularne smaki lodów.",[["waniliowy",27],["czekoladowy",25],["truskawkowy",20],["śmietankowy",14],["miętowy",8],["pistacjowy",6]]],
  ["Wymień coś czerwonego.",[["serce",25],["jabłko",22],["pomidor",20],["róża",15],["krew",10],["samochód",8]]],
  ["Co znajduje się w szkolnym plecaku?",[["zeszyt",28],["długopis",24],["książka",18],["lunch",12],["ołówek",10],["telefon",8]]],
  ["Wymień popularne napoje.",[["woda",32],["kawa",24],["herbata",18],["sok",12],["cola",9],["lemoniada",5]]],
  ["Co robisz przed snem?",[["myję zęby",30],["korzystam z telefonu",25],["przebieram się",18],["czytam",12],["gaszę światło",9],["piję wodę",6]]],
  ["Wymień rzeczy potrzebne na plaży.",[["ręcznik",27],["krem",24],["strój kąpielowy",20],["parasol",13],["okulary",10],["piłka",6]]],
  ["Popularne gry planszowe.",[["Monopoly",28],["chińczyk",22],["Scrabble",18],["warcaby",13],["szachy",11],["Dobble",8]]],
  ["Co może być słodkie?",[["czekolada",30],["cukierek",24],["ciasto",20],["lody",14],["miód",8],["owoce",4]]],
  ["Wymień kolory.",[["niebieski",24],["czerwony",22],["zielony",18],["żółty",15],["czarny",12],["fioletowy",9]]]
].map(([prompt,answers])=>({prompt,answers}));
const rankedQuestion=(prompt,names)=>({prompt,answers:names.map((name,index)=>[name,Math.max(1,30-index)])});
const topQuestions=[
  ["Wymień marki telefonów.","Samsung,Apple,Xiaomi,Huawei,Nokia,Motorola,OnePlus,Google Pixel,Realme,Oppo,Honor,Sony,LG,Asus,ZTE,Tecno,Infinix,Alcatel,HTC,Lenovo,BlackBerry,Nothing,Meizu,Microsoft Lumia,Cat,Doogee,Sharp,Poco,Vivo,Vertu"],
  ["Wymień marki samochodów.","Toyota,Volkswagen,BMW,Mercedes,Audi,Ford,Skoda,Renault,Opel,Fiat,Hyundai,Kia,Volvo,Honda,Nissan,Peugeot,Chevrolet,Tesla,Subaru,Mazda,Jeep,Land Rover,Porsche,Lexus,Seat,Citroen,Dacia,Mitsubishi,Suzuki,Alfa Romeo"],
  ["Wymień marki ubrań.","Nike,Adidas,Puma,Reebok,New Balance,Gucci,Zara,H&M,Reserved,Levi's,Calvin Klein,Tommy Hilfiger,Prada,Versace,Armani,Lacoste,Converse,Under Armour,Decathlon,Uniqlo,The North Face,Vans,Wrangler,Dior,Bershka,Pull&Bear,Diesel,Champion,Timberland,Guess"],
  ["Wymień popularne gry.","Minecraft,Fortnite,Roblox,The Sims,GTA,Among Us,Counter-Strike,League of Legends,Call of Duty,FIFA,Mario Kart,Pokémon,Minecraft Dungeons,Valorant,Overwatch,World of Warcraft,The Witcher,Red Dead Redemption,Assassin's Creed,Tetris,Clash Royale,Brawl Stars,EA Sports FC,God of War,Skyrim,Super Mario,Animal Crossing,Far Cry,Grand Theft Auto Online,Among Us"],
  ["Wymień napoje.","woda,kawa,herbata,cola,sok,lemoniada,piwo,wino,energetyk,mleko,kakao,napój izotoniczny,oranżada,kompot,whisky,wódka,rum,szampan,napój gazowany,kefir,maślanka,drink,gin,tonik,kombucha,yerba mate,espresso,cappuccino,ice tea,smoothie"],
  ["Wymień kraje.","Polska,Niemcy,Francja,Włochy,Hiszpania,Stany Zjednoczone,Wielka Brytania,Japonia,Chiny,Brazylia,Kanada,Australia,Indie,Meksyk,Norwegia,Szwecja,Holandia,Portugalia,Grecja,Turcja,Czechy,Ukraina,Austria,Egipt,Argentyna,Chorwacja,Finlandia,Irlandia,Islandia,Nowa Zelandia"],
  ["Wymień miasta.","Warszawa,Nowy Jork,Londyn,Paryż,Berlin,Rzym,Tokio,Kraków,Los Angeles,Madryt,Barcelona,Praga,Wiedeń,Dubaj,Amsterdam,Chicago,San Francisco,Waszyngton,Sydney,Bruksela,Łódź,Wrocław,Pekin,Moskwa,Seul,Miami,Monachium,Oslo,Ateny,Lizbona"],
  ["Wymień piłkarzy.","Robert Lewandowski,Lionel Messi,Cristiano Ronaldo,Kylian Mbappé,Neymar,Erling Haaland,Kevin De Bruyne,Mohamed Salah,Luka Modrić,Harry Kane,Karim Benzema,Virgil van Dijk,Antoine Griezmann,Paul Pogba,Andrés Iniesta,Xavi,Wayne Rooney,Zlatan Ibrahimović,David Beckham,Manuel Neuer,Thibaut Courtois,Pedri,Jude Bellingham,Vinícius Júnior,Ronaldinho,Pele,Diego Maradona,Robert Pirès,Thierry Henry,Andrea Pirlo"],
  ["Wymień youtuberów lub twórców internetowych.","MrBeast,PewDiePie,Markiplier,Dude Perfect,Karol Friz Wiśniewski,ReZigiusz,Blowek,Stuu,QueQuality,Friz,Lexy,Medusa,Boxdel,Isamu,DisStream,Jacksepticeye,Dream,DanTDM,Logan Paul,KSI,Casey Neistat,Veritasium,Marques Brownlee,Jakub Żulczyk,Abstrachuje,GENZIE,Team X,SA Wardęga,Natsu,Multi"],
  ["Wymień zwierzęta.","pies,kot,koń,lew,tygrys,słoń,żyrafa,małpa,królik,szczur,żaba,wąż,krokodyl,rekin,delfin,wieloryb,pingwin,orzeł,łabędź,kurczak,krowa,świnia,owca,koza,lis,wilk,niedźwiedź,panda,koala,żółw"],
  ["Wymień filmy.","Titanic,Avatar,Shrek,Król Lew,Harry Potter,Star Wars,Avengers,Matrix,Gladiator,Ojciec chrzestny,Jurassic Park,Incepcja,Interstellar,Kevin sam w domu,Forrest Gump,Rocky,Terminator,Spider-Man,Iron Man,Deadpool,Kraina lodu,Minionki,Piraci z Karaibów,Transformers,To,Diuna,Top Gun,Akademia Pana Kleksa,Jak wytresować smoka,Kung Fu Panda"],
  ["Wymień seriale.","Gra o tron,Przyjaciele,Dom z papieru,Stranger Things,The Office,Wednesday,Breaking Bad,The Walking Dead,Simpsonowie,Świat według Kiepskich,Na dobre i na złe,Barwy szczęścia,The Crown,Peaky Blinders,Sherlock,Dark,The Last of Us,Wednesday,Bridgerton,Friends,South Park,Dr House,Lost,Chirurdzy,Better Call Saul,The Boys,Wiedźmin,Black Mirror,Big Bang Theory,How I Met Your Mother"],
  ["Wymień firmy.","Microsoft,Apple,Google,Amazon,Samsung,Meta,Tesla,Coca-Cola,McDonald's,Netflix,Disney,Intel,IBM,Sony,Toyota,Volkswagen,Adidas,Nike,Oracle,Adobe,Spotify,Uber,Airbnb,Shell,Starbucks,PayPal,Pepsi,LG,Siemens,Bosch"],
  ["Wymień sklepy.","Biedronka,Lidl,Żabka,Carrefour,Kaufland,Auchan,Allegro,Amazon,Empik,Media Markt,RTV Euro AGD,Decathlon,IKEA,Castorama,Leroy Merlin,Rossmann,Hebe,Reserved,H&M,Zara,Action,Netto,Dino,Dealz,CCC,Martes Sport,OBI,Selgros,Stokrotka,Orlen"],
  ["Wymień fast foody.","McDonald's,KFC,Burger King,Subway,Domino's,Pizza Hut,Starbucks,Żabka,North Fish,Max Premium Burgers,Pasibus,Doner Kebab,Mr Hamburger,Five Guys,Wendy's,Taco Bell,Papa John's,Little Caesars,Quick,Telepizza,Da Grasso,Green Way,Sphinx,Thai Wok,Chinkalnia,Express Doner,Street Food,Food Truck,Burger King Express,Chicken King"]
].map(([prompt,names])=>rankedQuestion(prompt,names.split(",")));
const questionBank=[...baseQuestionBank,...topQuestions];
const normalize=text=>String(text||"").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[ąćęłńóśźż]/g,c=>({ą:"a",ć:"c",ę:"e",ł:"l",ń:"n",ó:"o",ś:"s",ź:"z",ż:"z"}[c]||c)).replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
const wheelMs = 2200;
const summaryMs = 5000;
const wheelColors = ["#2857a5","#913c77","#136f65","#974c2c","#5541a2","#406b2c","#9b3e53","#2b667b"];
const turnDeadline = game => Date.now() + Math.max(10, Number(game.answerTime) || 30) * 1000;

function drawQuestions(topSize, rounds) {
  const eligible = questionBank.map(({prompt,answers}) => {
    const distinct = new Map();
    for (const row of answers) {
      const key = normalize(row[0]);
      if (key && !distinct.has(key)) distinct.set(key,row);
    }
    return {prompt,answers:[...distinct.values()].slice(0,topSize)};
  });
  const full = eligible.filter(question => question.answers.length === topSize);
  const pool = full.length ? full : eligible;
  const questions = [];
  while (questions.length < rounds) {
    const batch = [...pool];
    for (let i = batch.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [batch[i],batch[j]] = [batch[j],batch[i]];
    }
    questions.push(...batch.slice(0,rounds - questions.length));
  }
  return questions;
}

export function createFamilyGame(players, settings = {}) {
  const rounds = Math.max(1,Math.min(20,Number(settings.rounds)||5));
  const topSize = Math.max(5,Math.min(30,Number(settings.topSize)||10));
  return {
    mode:"family", phase:"wheel", round:1, rounds, topSize,
    scoring:settings.scoring==="higher"||settings.scoring==="lower" ? settings.scoring : "one",
    answerTime:Number(settings.answerTime)||30,
    turnMode:settings.turnMode==="untilWrong" ? "untilWrong" : "afterAnswer",
    players:[...players], questions:drawQuestions(topSize,rounds),
    currentUid:players[Math.floor(Math.random()*players.length)], revealed:[],
    scores:Object.fromEntries(players.map(uid=>[uid,0])), answers:[], wrong:false,
    phaseEndsAt:Date.now()+wheelMs,
  };
}

function ensureFamilyRoundState(game) {
  if (!Array.isArray(game.revealed)) game.revealed = [];
  if (!Array.isArray(game.answers)) game.answers = [];
  if (!game.scores || typeof game.scores !== "object" || Array.isArray(game.scores)) game.scores = {};
}

function nextPlayer(game) {
  const index = game.players.indexOf(game.currentUid);
  game.currentUid = game.players[(index+1)%game.players.length];
}

function nextRound(game) {
  if (game.round >= game.rounds) {
    game.phase = "result";
    game.finished = true;
    return;
  }
  game.round += 1;
  game.questions[game.round-1] ||= drawQuestions(game.topSize,1)[0];
  game.revealed = [];
  game.answers = [];
  game.wrong = false;
  game.currentUid = game.players[Math.floor(Math.random()*game.players.length)];
  game.phase = "wheel";
  game.phaseEndsAt = Date.now()+wheelMs;
}

export const FamilyEngine = {
  answer(game,uid,text) {
    if (game.phase !== "answer" || game.currentUid !== uid) return "To nie jest Twoja kolej.";
    if (Date.now() >= game.phaseEndsAt) return "Czas na odpowiedź minął.";
    const value = normalize(text);
    if (!value) return "Wpisz odpowiedź.";
    ensureFamilyRoundState(game);
    const question = game.questions[game.round-1];
    const hit = question.answers.findIndex(([answer])=>normalize(answer)===value);
    const revealedNames = new Set(game.revealed.map(index=>normalize(question.answers[index]?.[0])));
    const correct = hit>=0 && !revealedNames.has(value);
    const points = correct ? game.scoring==="one" ? 1 : game.scoring==="higher" ? question.answers[hit][1] : game.topSize-hit : 0;
    game.answers.push({uid,text:value,hit,points});
    if (correct) {
      // Older games can contain duplicate labels. One guess uncovers every copy.
      question.answers.forEach(([answer],index)=>{
        if (normalize(answer)===value) game.revealed.push(index);
      });
      revealedNames.add(value);
      game.scores[uid] = (game.scores[uid]||0)+points;
    }
    game.wrong = !correct;
    if (question.answers.every(([answer])=>revealedNames.has(normalize(answer)))) {
      game.phase = "summary";
      game.phaseEndsAt = Date.now()+summaryMs;
    } else {
      if (!correct || game.turnMode==="afterAnswer") nextPlayer(game);
      game.phaseEndsAt = turnDeadline(game);
    }
  },
  timeout(game) {
    if (Date.now() < game.phaseEndsAt) return;
    if (game.phase === "wheel") {
      game.phase = "answer";
      game.phaseEndsAt = turnDeadline(game);
    } else if (game.phase === "summary") nextRound(game);
    else if (game.phase === "answer") {
      game.wrong = true;
      nextPlayer(game);
      game.phaseEndsAt = turnDeadline(game);
    }
  },
  next(game) {
    if (game.phase !== "summary" || Date.now() < game.phaseEndsAt) return "Runda jeszcze trwa.";
    nextRound(game);
  },
};

function answerRows(game,question) {
  return question.answers.map(([answer,points],index)=>{
    const revealed = game.revealed.includes(index) || (game.phase==="summary" &&
      game.revealed.some(slot=>normalize(question.answers[slot]?.[0])===normalize(answer)));
    return `<div class="family-answer-row ${revealed?"is-revealed":""}"><b>${index+1}.</b><span>${revealed?escapeHtml(answer):"???"}</span><strong>${revealed?points:""}</strong></div>`;
  }).join("");
}

function wheelMarkup(game, accounts) {
  const step = 360 / game.players.length;
  const slices = game.players.map((_,index)=>`${wheelColors[index%wheelColors.length]} ${index*step}deg ${(index+1)*step}deg`);
  return `<div class="family-wheel-wrap">
    <span class="family-wheel-pointer" aria-hidden="true"></span>
    <div class="family-player-wheel" style="background:conic-gradient(from ${-step/2}deg,${slices.join(",")})" role="group" aria-label="Koło losujące pierwszego gracza">
      ${game.players.map((uid,index)=>{
        const angle = index*step*Math.PI/180;
        const profile = accounts[uid] || {nick:"Gracz"};
        return `<div class="family-wheel-seat" style="--x:${50+34*Math.sin(angle)}%;--y:${50-34*Math.cos(angle)}%">
          <div class="family-wheel-profile">${avatarHtml(profile,"family-wheel-avatar",{disableIdle:true})}<span>${escapeHtml(profile.nick||"Gracz")}</span></div>
        </div>`;
      }).join("")}
    </div>
  </div><h1>Kto zaczyna?</h1>`;
}

function spinWheel(root, game) {
  const wheel = root.querySelector(".family-player-wheel");
  if (!wheel) return;
  const winner = Math.max(0,game.players.indexOf(game.currentUid));
  const rotation = 1080 - winner*360/game.players.length;
  const elapsed = Math.max(0,Math.min(wheelMs,wheelMs-(game.phaseEndsAt-Date.now())));
  const spin = (node,angle)=>{
    if (!node.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches || elapsed >= wheelMs) {
      node.style.rotate = `${angle}deg`;
      return;
    }
    const animation = node.animate([{rotate:"0deg"},{rotate:`${angle}deg`}],{duration:wheelMs,easing:"cubic-bezier(.14,.6,.19,1)",fill:"both"});
    animation.currentTime = elapsed;
  };
  spin(wheel,rotation);
  wheel.querySelectorAll(".family-wheel-profile").forEach(profile=>spin(profile,-rotation));
}

function roundSummary(game,accounts) {
  const points = {};
  const seen = new Set();
  for (const {uid,hit,points:awarded} of game.answers) {
    if (hit < 0 || seen.has(hit)) continue;
    seen.add(hit);
    const boardPoints = game.questions[game.round-1].answers[hit]?.[1];
    const value = awarded ?? (game.scoring==="one" ? 1 : game.scoring==="higher" ? boardPoints : game.topSize-hit);
    if (value > 0) points[uid] = (points[uid]||0)+value;
  }
  return `<div class="family-summary">
    <div class="family-summary-header"><div><b>Tablica wypełniona</b><small>${game.round>=game.rounds?"Wyniki za":"Następna runda za"}</small></div><strong data-family-summary-time aria-label="Pozostałe sekundy"></strong></div>
    <div class="family-summary-track" aria-hidden="true"><div data-family-summary-fill></div></div>
    ${Object.keys(points).length ? `<div class="family-summary-points">${Object.entries(points).sort(([,a],[,b])=>b-a).map(([uid,value])=>`<span>${escapeHtml(accounts[uid]?.nick||"Gracz")} <b>+${value} pkt</b></span>`).join("")}</div>` : ""}
  </div>`;
}

export function renderFamilyGame(root,{room,accounts,currentUser},actions) {
  stopFamilyTimer();
  const game = room.game;
  ensureFamilyRoundState(game);
  const question = game.questions?.[game.round-1];
  const heading = `<p class="eyebrow">FAMILIADA · RUNDA ${game.round}/${game.rounds}</p>`;
  if (game.phase==="result" || !Array.isArray(question?.answers)) {
    const scores = Object.entries(game.scores).sort(([,a],[,b])=>b-a);
    const ranking = scores.map(([uid,score],index)=>`<div class="family-rank-row"><b>${index+1}.</b>${resultPlayerMiniHtml(accounts[uid],score>0&&score===scores[0][1]?"win":"lose")}<strong>${score} pkt</strong></div>`).join("");
    root.innerHTML = `<main class="page family-page"><section class="panel family-panel center"><p class="eyebrow">FAMILIADA</p><h1>${game.phase==="result"?"Wyniki końcowe":"Nie udało się odczytać pytania"}</h1>${game.phase==="result"?`<div class="family-ranking">${ranking}</div>`:""}<button class="primary" id="family-room">Wróć do lobby</button></section></main>`;
    root.querySelector("#family-room").addEventListener("click",actions.returnToRoom);
    return;
  }

  const expected = {phase:game.phase,phaseEndsAt:game.phaseEndsAt,round:game.round};
  const isTurn = game.currentUid===currentUser;
  const turn = isTurn ? "Twoja kolej" : "Kolej: "+escapeHtml(accounts[game.currentUid]?.nick||"Gracz");
  const content = game.phase==="wheel" ? wheelMarkup(game,accounts)
    : `<h1>${escapeHtml(question.prompt)}</h1>
      ${game.phase==="summary" ? roundSummary(game,accounts) : `<p class="family-turn">${turn}</p>${game.wrong?'<div class="family-miss">X · Nie ma tego na tablicy</div>':""}
      <form id="family-answer" class="family-form"><input id="family-input" placeholder="Wpisz odpowiedź" autocomplete="off" ${isTurn?"":"disabled"}><button class="primary" ${isTurn?"":"disabled"}>Odpowiedz</button></form>`}
      <div class="family-board">${answerRows(game,question)}</div>
      ${game.phase==="summary" ? "" : `<div class="family-scores">${Object.entries(game.scores).map(([uid,score])=>`<span>${escapeHtml(accounts[uid]?.nick||"Gracz")}: <b>${score}</b></span>`).join("")}</div>`}`;
  root.innerHTML = `<main class="page family-page"><section class="panel family-panel ${game.phase==="wheel"?"center":""}">${heading}${content}</section></main>`;
  root.querySelector("#family-answer")?.addEventListener("submit",event=>{
    event.preventDefault();
    actions.familyAnswer(root.querySelector("#family-input").value,expected);
  });
  spinWheel(root,game);
  const time = root.querySelector("[data-family-summary-time]");
  if (time) {
    const fill = root.querySelector("[data-family-summary-fill]");
    const tick = ()=>{
      const remaining = Math.max(0,expected.phaseEndsAt-Date.now());
      const label = `${Math.ceil(remaining/1000)} s`;
      if (time.textContent !== label) time.textContent = label;
      fill.style.transform = `scaleX(${Math.min(1,remaining/summaryMs)})`;
    };
    tick();
    renderFamilyGame.summaryTimer = setInterval(tick,100);
  }
  renderFamilyGame.countdown = setTimeout(()=>actions.familyTimeout(expected),Math.max(100,game.phaseEndsAt-Date.now()+50));
}

export function stopFamilyTimer() {
  clearTimeout(renderFamilyGame.countdown);
  clearInterval(renderFamilyGame.summaryTimer);
}

export function renderFamilyLobbySettingsV2(room,isHost){const s=room.settings||familyDefaults;const sizes=[5,10,15,20,25,30];return `<div class="family-settings"><label>Liczba rund <input data-family-setting="rounds" type="number" min="1" max="20" value="${s.rounds||5}" ${isHost?"":"disabled"}></label><label>Czas odpowiedzi <input data-family-setting="answerTime" type="number" min="10" max="180" value="${s.answerTime||30}" ${isHost?"":"disabled"}> s</label><label>Ranking <select data-family-setting="topSize" ${isHost?"":"disabled"}>${sizes.map(value=>`<option value="${value}" ${Number(s.topSize||10)===value?"selected":""}>Top ${value}</option>`).join("")}</select></label><label>Punktacja <select data-family-setting="scoring" ${isHost?"":"disabled"}><option value="one" ${s.scoring!=="higher"&&s.scoring!=="lower"?"selected":""}>Każda poprawna = 1</option><option value="higher" ${s.scoring==="higher"?"selected":""}>Wyżej = więcej punktów</option><option value="lower" ${s.scoring==="lower"?"selected":""}>Niżej = więcej punktów</option></select></label><label>Sposób zmiany gracza <select data-family-setting="turnMode" ${isHost?"":"disabled"}><option value="afterAnswer" ${s.turnMode!=="untilWrong"?"selected":""}>Po każdej odpowiedzi</option><option value="untilWrong" ${s.turnMode==="untilWrong"?"selected":""}>Dopóki się nie pomyli</option></select></label><p class="tiny">Zbyt długie rankingi są automatycznie pomijane, jeśli pytanie nie ma tylu sensownych odpowiedzi.</p></div>`;}
