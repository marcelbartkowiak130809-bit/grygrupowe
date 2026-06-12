import { pokemonAnswers } from "./pokemon.js";
import { aliases, expandedPools, focusedPools, mergeUnique, supplementalPools } from "./expandedPools.js?v=20260604-8";
import { newCategoryDefinitions, newCategoryPools, newCategoryPrompts } from "./newCategories.js?v=20260602-2";
import { moreAnswerPools } from "./moreAnswers.js?v=20260602-3";
import { specificTasks } from "./specificTasks.js?v=20260612-1";

// Każda kategoria ma współdzieloną, szeroką pulę odpowiedzi. Dzięki temu nowe
// warianty pytań nie odrzucają popularnych odpowiedzi tylko przez zbyt krótką listę.
const list = text => [...new Set(text.split("|").map(item => item.trim()).filter(Boolean))];
const tasks = (prefix, answers, prompts) => prompts.map((prompt, index) => ({
  id: `${prefix}_${String(index + 1).padStart(2, "0")}`,
  prompt,
  answers,
}));

const pools = {
  animals:list("pies|kot|koń|krowa|świnia|owca|koza|kura|kogut|kaczka|gęś|indyk|lew|tygrys|gepard|pantera|jaguar|puma|wilk|lis|niedźwiedź|hiena|słoń|żyrafa|zebra|nosorożec|hipopotam|małpa|goryl|szympans|orangutan|krokodyl|aligator|żółw|wąż|jaszczurka|iguana|żaba|ropucha|rekin|delfin|wieloryb|orka|foka|pingwin|orzeł|sowa|wróbel|gołąb|kruk|wrona|bocian|papuga|mewa|sokół|jastrząb|pelikan|flaming|pająk|mrówka|pszczoła|osa|motyl|komar|mucha|chrząszcz|chomik|królik|zając|jeleń|sarna|dzik|bóbr|wydra|kangur|koala|panda|lama|alpaka|wiewiórka|jeż|nietoperz|ślimak|ośmiornica|meduza|krab|homar"),
  fruits:list("jabłko|gruszka|banan|pomarańcza|mandarynka|cytryna|limonka|grejpfrut|truskawka|malina|borówka|jagoda|winogrono|arbuz|melon|kiwi|ananas|mango|papaja|brzoskwinia|nektarynka|śliwka|wiśnia|czereśnia|granat|kokos|awokado|morela|figa|daktyl|porzeczka|agrest|jeżyna|żurawina|poziomka|marakuja|liczi|pomelo|pigwa|persymona|kaki|karambola|gujawa|pitaja|smoczy owoc|durian|rambutan|kumkwat|morwa|aronia|mirabelka|renkloda|opuncja|tamarillo|jackfruit|chlebowiec|acerola|klementynka|bergamotka|melon miodowy|melon kantalupa"),
  countries:list("polska|niemcy|francja|hiszpania|portugalia|włochy|czechy|słowacja|ukraina|litwa|łotwa|estonia|norwegia|szwecja|finlandia|dania|holandia|belgia|austria|szwajcaria|wielka brytania|irlandia|islandia|grecja|chorwacja|serbia|rumunia|bułgaria|węgry|słowenia|albania|turcja|usa|stany zjednoczone|kanada|meksyk|brazylia|argentyna|chile|peru|kolumbia|wenezuela|urugwaj|paragwaj|boliwia|chiny|japonia|korea południowa|indie|pakistan|tajlandia|wietnam|indonezja|filipiny|malezja|singapur|australia|nowa zelandia|egipt|maroko|tunezja|kenia|nigeria|rpa|etiopia|ghana|madagaskar|izrael|arabia saudyjska|zjednoczone emiraty arabskie|gruzja|armenia|kazachstan"),
  games:list("minecraft|roblox|fortnite|gta|gta v|valorant|league of legends|csgo|counter strike|counter strike 2|among us|brawl stars|clash royale|clash of clans|pokemon go|subnautica|terraria|stardew valley|the sims|fifa|ea fc|rocket league|war thunder|genshin impact|honkai star rail|call of duty|overwatch|apex legends|fall guys|pubg|dota 2|world of warcraft|diablo|hearthstone|the witcher|wiedźmin|cyberpunk|skyrim|elden ring|dark souls|hades|hollow knight|cuphead|undertale|portal|half life|red dead redemption|animal crossing|mario kart|super mario|zelda|pokemon|palworld|helldivers|dead by daylight|phasmophobia|the forest|rust|ark|geometry dash|osu|farming simulator|euro truck simulator|need for speed|forza horizon|mortal kombat|tekken|street fighter|rainbow six siege|destiny|warframe"),
  tech:list("komputer|laptop|telefon|smartfon|tablet|monitor|klawiatura|mysz|słuchawki|mikrofon|głośnik|kamera|drukarka|router|modem|procesor|karta graficzna|płyta główna|ram|dysk ssd|dysk hdd|zasilacz|obudowa|wentylator|chłodzenie|bios|chipset|usb|hdmi|bluetooth|wi-fi|wifi|internet|aplikacja|przeglądarka|system operacyjny|windows|linux|android|ios|macos|serwer|baza danych|kod|program|algorytm|sztuczna inteligencja|ai|chatgpt|robot|dron|konsola|playstation|xbox|nintendo switch|steam deck|powerbank|ładowarka|kabel|pendrive|karta pamięci|procesor graficzny|touchpad|webcam|smartwatch|vr|drukarka 3d"),
  food:list("pizza|kebab|burger|hamburger|frytki|hot dog|zapiekanka|pierogi|rosół|pomidorowa|schabowy|spaghetti|lasagne|naleśniki|gołąbki|sałatka|tortilla|sushi|ramen|kanapka|jajecznica|omlet|lody|czekolada|sernik|szarlotka|pączek|drożdżówka|gofry|tost|makaron|ryż|kasza|ziemniaki|kurczak|stek|ryba|łosoś|krewetki|tacos|burrito|nachos|risotto|carbonara|pad thai|curry|falafel|hummus|kopytka|placki ziemniaczane|bigos|żurek|barszcz|ogórkowa|krupnik|kotlet mielony|kotlet de volaille|musli|owsianka|parówki|kiełbasa|ser|jogurt|budyń|galaretka|popcorn|chipsy|baton|ciastko"),
  school:list("matematyka|polski|język polski|angielski|niemiecki|hiszpański|francuski|historia|geografia|biologia|chemia|fizyka|informatyka|wos|edb|wf|religia|etyka|plastyka|muzyka|technika|zeszyt|podręcznik|ćwiczenia|długopis|ołówek|gumka|linijka|ekierka|cyrkiel|plecak|piórnik|tablica|kreda|marker|ławka|krzesło|sala|klasa|korytarz|szatnia|biblioteka|stołówka|sekretariat|dyrektor|nauczyciel|uczeń|kartkówka|sprawdzian|matura|egzamin|ocena|uwaga|przerwa|dzwonek|plan lekcji|praca domowa|lektura|wypracowanie|prezentacja|projekt|kanapka|legitymacja|dziennik|e-dziennik|wakacje|ferie"),
  music:list("pop|rock|rap|hip hop|metal|jazz|blues|reggae|disco polo|elektroniczna|techno|house|klasyczna|country|indie|k-pop|folk|punk|trap|drill|gitara|pianino|fortepian|perkusja|skrzypce|flet|saksofon|trąbka|bas|ukulele|harfa|akordeon|wiolonczela|mikrofon|koncert|festiwal|spotify|youtube music|apple music|sanah|dawid podsiadło|mata|taco hemingway|young leosia|queen|metallica|the weeknd|taylor swift|billie eilish|lady gaga|ariana grande|dua lipa|rihanna|beyonce|bruno mars|justin bieber|lana del rey|ed sheeran|eminem|drake|post malone|doja cat|imagine dragons|coldplay|linkin park|nirvana|abba|bts|blackpink"),
  sport:list("piłka nożna|koszykówka|siatkówka|tenis|pływanie|bieganie|lekkoatletyka|skoki narciarskie|narciarstwo|snowboard|boks|mma|judo|karate|gimnastyka|hokej|golf|rugby|kolarstwo|wspinaczka|surfing|badminton|tenis stołowy|ping pong|piłka ręczna|baseball|futbol amerykański|krykiet|szachy|esport|łyżwiarstwo|kajakarstwo|wioślarstwo|żeglarstwo|triathlon|maraton|formuła 1|f1|rajdy|motocross|skateboarding|deskorolka|rolki|jazda konna|jeździectwo|strzelectwo|łucznictwo|szermierka|zapasy|kickboxing|taekwondo|curling|biathlon|parkour|squash|dart|bilard|real madryt|barcelona|arsenal|chelsea|liverpool|manchester city|manchester united|juventus|inter mediolan|ac milan|bayern monachium|psg|legia warszawa|lech poznań"),
  cities:list("warszawa|kraków|wrocław|poznań|gdańsk|gdynia|sopot|łódź|szczecin|lublin|katowice|bydgoszcz|toruń|rzeszów|białystok|opole|olsztyn|kielce|zakopane|radom|gliwice|zabrze|częstochowa|sosnowiec|płock|elbląg|koszalin|zielona góra|gorzów wielkopolski|bielsko-biała|londyn|paryż|berlin|rzym|madryt|lizbona|praga|wiedeń|ateny|tokio|seul|pekin|nowy jork|los angeles|chicago|sydney|dubaj|kair|barcelona|amsterdam|bruksela|budapeszt|oslo|sztokholm|helsinki|kopenhaga|dublin|edynburg|wenecja|mediolan|neapol|monachium|hamburg|moskwa|stambuł|bangkok|singapur|rio de janeiro|buenos aires|toronto|vancouver|meksyk"),
  movies:list("harry potter|shrek|barbie|oppenheimer|avatar|titanic|star wars|marvel|avengers|batman|spider-man|stranger things|breaking bad|wednesday|the office|friends|gra o tron|wiedźmin|squid game|black mirror|peaky blinders|król lew|toy story|auta|kraina lodu|minionki|kung fu panda|madagaskar|jak wytresować smoka|piraci z karaibów|władca pierścieni|hobbit|matrix|john wick|james bond|jurassic park|transformers|mission impossible|fast and furious|szybcy i wściekli|deadpool|iron man|thor|hulk|kapitan ameryka|guardians of the galaxy|joker|superman|aquaman|shazam|the boys|rick and morty|south park|simpsonowie|dom z papieru|narcos|dark|chernobyl|the walking dead|better call saul|cobra kai|lucifer|dexter|dr house|sherlock|top gun|diuna|interstellar|incepcja"),
  everyday:list("stół|krzesło|łóżko|kanapa|telewizor|lodówka|pralka|zmywarka|czajnik|kubek|talerz|widelec|łyżka|nóż|poduszka|koc|lampa|lustro|szafa|biurko|odkurzacz|ręcznik|szczoteczka|pasta do zębów|mydło|szampon|papier toaletowy|telefon|ładowarka|słuchawki|klucze|portfel|plecak|torba|buty|kurtka|spodnie|koszulka|skarpetki|czapka|parasol|butelka|garnek|patelnia|miska|deska do krojenia|kosz na śmieci|miotła|mop|żelazko|suszarka|grzebień|szczotka|zegar|zegarek|pilot|bateria|długopis|ołówek|zeszyt|książka|kabel|komputer|monitor|mysz|klawiatura|rower|samochód|okulary|drzwi|okno|dywan|firanka|roślina"),
  vegetables:list("ziemniak|marchewka|pomidor|ogórek|papryka|cebula|czosnek|burak|sałata|kapusta|brokuł|kalafior|cukinia|bakłażan|dynia|fasola|groszek|kukurydza|por|seler|pietruszka|rzodkiewka|szpinak|jarmuż|brukselka|kalarepa|rzepa|batat|szparagi|karczoch|rukola|roszponka|cykoria|boćwina|koper|koperek|chrzan|imbir|kurkuma|soczewica|ciecierzyca|bób|soja|groch|fasolka szparagowa|kabaczek|patison|topinambur|maniok|okra|edamame|papryczka chili|jalapeno|wasabi|kapusta pekińska|pak choi|rabarbar|szczaw|cebula dymka|szalotka"),
  internet:list("facebook|instagram|tiktok|youtube|discord|messenger|whatsapp|snapchat|reddit|twitch|x|twitter|telegram|pinterest|linkedin|threads|signal|spotify|netflix|google|gmail|outlook|wikipedia|allegro|olx|amazon|temu|shein|vinted|steam|epic games|battle net|roblox|chatgpt|gemini|copilot|teams|zoom|skype|meet|google meet|tinder|bereal|tumblr|wykop|9gag|imgur|canva|capcut|paypal|revolut|uber|bolt|pyszne|glovo|booking|airbnb|github|stackoverflow|duolingo|discord nitro|youtube shorts|reels|stories|hashtag|meme|gif|emoji|stream|podcast|blog|forum"),
  minecraft:list("creeper|zombie|szkielet|pająk|enderman|wiedźma|slime|ghast|blaze|piglin|hoglin|warden|wieśniak|żelazny golem|bałwan|owca|krowa|świnia|kurczak|wilk|kot|koń|lama|pszczoła|lis|żaba|axolotl|delfin|guardian|elder guardian|shulker|phantom|drowned|pillager|evoker|ravager|endermite|silverfish|magma cube|wither skeleton|zombified piglin|ziemia|trawa|kamień|bruk|drewno|deski|szkło|piasek|żwir|obsydian|bedrock|diament|węgiel|żelazo|złoto|redstone|lapis|szmaragd|netherrack|soul sand|end stone|crafting table|piec|skrzynia|tnt|wełna|glina|cegły|beton|terakota|miedź|deepslate|sculk|kilof|miecz|łopata|siekiera|motyka|łuk|kusza|tarcza|wiadro|wędka|pochodnia|kompas|mapa|łóżko|elitra|totem|perła endermana|oko endera|mikstura|netherite|trójząb|nether|end|overworld|smok endu|wither|portal"),
  roblox:list("adopt me|brookhaven|blox fruits|doors|murder mystery 2|tower of hell|piggy|arsenal|jailbreak|royale high|pet simulator|bedwars|dress to impress|obby|natural disaster survival|blade ball|anime adventures|rainbow friends|meepcity|work at a pizza place|bee swarm simulator|evade|restaurant tycoon|theme park tycoon|driving empire|welcome to bloxburg|bloxburg|build a boat for treasure|obby creator|survive the killer|flee the facility|hide and seek extreme|breaking point|tower defense simulator|anime fighters|all star tower defense|shindo life|king legacy|brookhaven rp|livetopia|berry avenue|catalog avatar creator|epic minigames|speed draw|fashion famous|3008|apeirophobia|pressure|combat warriors|slap battles|strongest battlegrounds|toilet tower defense|arsenal reloaded|phantom forces|frontlines|mad city|prison life|lumber tycoon 2|mining simulator|vehicle simulator|ninja legends|super bomb survival|obby but you are on a bike"),
  creators:list("friz|rezi|blowek|stuu|gimper|izak|poczciwy krzychu|mandzio|disowskyy|dealereq|tromba|wersow|mortalcio|karol paciorek|naruciak|wardęga|boxdel|multi|nitro|rembol|vertez|skkf|eleven|mietczynski|kacper porębski|young multi|mrbeast|pewdiepie|markiplier|jacksepticeye|ishowspeed|kai cenat|dream|georgenotfound|tommyinnit|dan tdm|dantdm|preston|lazar beam|lazarbeam|ninja|pokimane|xqc|ksi|logan paul|jake paul|sidemen|technoblade|aphmau|sssniperwolf|sapnap|tubbo|ranboo|stampy|captainsparklez|ksiol|quaz|rock alone|karolek|skkf|rojo|remek|kamerzysta|marcin dubiel|mini majk|natsu|fagata|genzie|ekipa|mishon|rafonix|kasix|pago|shroud|mrbeast gaming|speed|caseoh|adin ross"),
  brands:list("nike|adidas|puma|reebok|new balance|vans|converse|apple|samsung|xiaomi|sony|lg|lenovo|asus|acer|hp|dell|huawei|motorola|nokia|coca cola|pepsi|fanta|sprite|mcdonalds|kfc|burger king|subway|starbucks|lego|ikea|netflix|spotify|playstation|xbox|nintendo|steam|epic games|zara|h&m|reserved|cropp|house|bershka|pull&bear|stradivarius|żabka|biedronka|lidl|kaufland|carrefour|allegro|amazon|tesla|bmw|mercedes|audi|volkswagen|toyota|ford|ferrari|lamborghini|porsche|skoda|renault|volvo|red bull|monster|lays|pringles|oreo|milka|nutella|haribo|nivea|rossmann|sephora|youtube|tiktok|discord"),
  pokemon:pokemonAnswers,
};

const promptSets = {
  animals:["Wymień zwierzęta"],
  fruits:["Wymień owoce"],
  countries:["Wymień kraje"],
  games:["Wymień gry komputerowe, konsolowe lub mobilne"],
  tech:["Wymień rzeczy związane z technologią"],
  food:["Wymień jedzenie lub potrawy"],
  school:["Wymień rzeczy związane ze szkołą"],
  music:["Wymień rzeczy związane z muzyką"],
  sport:["Wymień rzeczy związane ze sportem"],
  cities:["Wymień miasta"],
  movies:["Wymień filmy lub seriale"],
  everyday:["Wymień rzeczy codziennego użytku"],
  vegetables:["Wymień warzywa"],
  internet:["Wymień serwisy, aplikacje lub pojęcia internetowe"],
  minecraft:["Wymień rzeczy z Minecrafta"],
  roblox:["Wymień gry lub rzeczy kojarzące się z Roblox"],
  creators:["Wymień youtuberów lub streamerów"],
  brands:["Wymień popularne marki"],
  pokemon:["Wymień Pokémony"],
  ...newCategoryPrompts,
};

const extraPromptSets = {
  animals:["Wymien zwierzeta domowe albo dzikie"],
  fruits:["Wymien owoce, ktore mozna kupic w sklepie"],
  countries:["Wymien panstwa z dowolnego kontynentu"],
  games:["Wymien popularne gry, stare albo nowe"],
  tech:["Wymien sprzet, aplikacje albo pojecia z technologii"],
  food:["Wymien dania, przekaski albo desery"],
  school:["Wymien przedmioty, miejsca albo rzeczy ze szkoly"],
  music:["Wymien wykonawcow, gatunki albo instrumenty"],
  sport:["Wymien sporty, kluby albo rzeczy ze sportu"],
  cities:["Wymien miasta w Polsce albo za granica"],
  movies:["Wymien filmy, seriale albo bajki"],
  everyday:["Wymien rzeczy, ktore czesto sa w domu"],
  vegetables:["Wymien warzywa albo straczki"],
  internet:["Wymien aplikacje, strony albo slowa z internetu"],
  minecraft:["Wymien moby, bloki albo przedmioty z Minecrafta"],
  roblox:["Wymien gry, miejsca albo rzeczy z Robloxa"],
  creators:["Wymien tworcow internetowych"],
  brands:["Wymien marki sklepowe, technologiczne albo modowe"],
  pokemon:["Wymien Pokemony z dowolnej generacji"],
};

const definitions = [
  ["animals","Zwierzęta"],["fruits","Owoce"],["countries","Kraje"],["games","Gry"],
  ["tech","Technologia"],["food","Jedzenie"],["school","Szkoła"],["music","Muzyka"],
  ["sport","Sport"],["cities","Miasta"],["movies","Filmy i seriale"],["everyday","Rzeczy codzienne"],
  ["vegetables","Warzywa"],["internet","Internet"],["minecraft","Minecraft"],["roblox","Roblox"],
  ["creators","YouTube i twórcy"],["brands","Marki"],
  ["pokemon","Pokémon"],
  ...newCategoryDefinitions,
];

const poolAliases = { games:aliases.games, internet:aliases.internet, brands:aliases.brands, creators:aliases.creators };
Object.entries(expandedPools).forEach(([id,answers]) => {
  pools[id] = mergeUnique(pools[id] || [],answers,poolAliases[id] || []);
});
Object.entries(supplementalPools).forEach(([id,answers]) => {
  pools[id] = mergeUnique(pools[id] || [],answers,poolAliases[id] || []);
});
Object.entries(newCategoryPools).forEach(([id,answers]) => {
  pools[id] = mergeUnique(pools[id] || [],answers);
});
Object.entries(moreAnswerPools).forEach(([id,answers]) => {
  pools[id] = mergeUnique(pools[id] || [],answers);
});
Object.entries(poolAliases).forEach(([id,answers]) => {
  pools[id] = mergeUnique(pools[id] || [],answers);
});

const focusedTasks = {
  countries:[
    ["countries_europe","Wymień kraje w Europie",focusedPools.europe],
    ["countries_asia","Wymień kraje w Azji",focusedPools.asia],
    ["countries_africa","Wymień kraje w Afryce",focusedPools.africa],
    ["usa_states","Wymień stany USA",focusedPools.usaStates],
  ],
  cities:[
    ["cities_poland","Wymień miasta w Polsce",focusedPools.polishCities],
    ["cities_world","Wymień miasta z całego świata",pools.cities],
  ],
  tech:[
    ["computer_parts","Wymień części komputera i akcesoria komputerowe",focusedPools.computerParts],
  ],
  food:[
    ["restaurant_chains","Wymień sieciówki gastronomiczne, fast foody albo kawiarnie",focusedPools.restaurantChains],
  ],
  everyday:[
    ["kitchen_items","Wymień rzeczy, które można znaleźć w kuchni",focusedPools.kitchen],
    ["colors","Wymień kolory i odcienie",focusedPools.colors],
  ],
  brands:[
    ["car_brands","Wymień marki samochodów",focusedPools.carBrands],
  ],
};

export const categories = definitions.map(([id,name]) => ({
  id,
  name,
  tasks:[
    ...tasks(id,pools[id],[...(promptSets[id] || []),...(extraPromptSets[id] || [])]),
    ...(specificTasks[id] || []).map(([taskId,prompt,answers]) => ({ id:taskId,prompt,answers:mergeUnique(answers) })),
    ...(focusedTasks[id] || []).map(([taskId,prompt,answers]) => ({ id:taskId,prompt,answers:mergeUnique(answers) })),
  ],
}));
