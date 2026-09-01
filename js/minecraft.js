import { avatarHtml, escapeHtml, normalizeAnswer } from "./utils.js?v=20260822-1";
import { gamePassById, hasGamePass, inGamePurchaseById } from "./gamePasses.js?v=20260901-13";

// The Explorer page itself returns HTML for a file URL. The assets subdomain
// is the raw 16x16/32x32 PNG host, so game cards do not accidentally display
// the Explorer document as an image.
export const MC_ASSET_ROOT = "https://assets.mcasset.cloud/1.21.4/assets/minecraft";
const block = id => `${MC_ASSET_ROOT}/textures/block/${id}.png`;
const rawItem = id => `${MC_ASSET_ROOT}/textures/item/${id}.png`;
const rawEntity = (folder, file = folder) => `${MC_ASSET_ROOT}/textures/entity/${folder}/${file}.png`;
const itemAliases = {
  pickaxe: rawItem("iron_pickaxe"), red_bed: rawEntity("bed", "red"), bed: rawEntity("bed", "white"), shield: rawEntity("shield", "base"),
  compass: rawItem("compass_16"), beacon: block("beacon"), torch: block("torch"), respawn_anchor: block("respawn_anchor_side0"),
  enchanting_table: block("enchanting_table_side"), conduit: block("conduit"), grass_block: block("grass_block_side"), sand: block("sand"),
  snow_block: block("snow"), ice: block("ice"), jungle_log: block("jungle_log"), mangrove_log: block("mangrove_log"), dark_oak_log: block("dark_oak_log"),
  warped_nylium: block("warped_nylium"), crimson_nylium: block("crimson_nylium"), soul_sand: block("soul_sand"), basalt: block("basalt_side"),
  sculk: block("sculk"), cherry_log: block("cherry_log"), end_stone: block("end_stone"), creeper_head: rawEntity("creeper"),
  enderman_spawn_egg: rawEntity("enderman"), sponge: block("sponge"), honey_block: block("honey_block_side"), observer: block("observer_front"),
  sculk_sensor: block("sculk_sensor_side"), magma_block: block("magma"), piston: block("piston_side"), lodestone_compass: block("lodestone_side"),
  jukebox: block("jukebox_side"), lever: block("lever"), redstone_torch: block("redstone_torch"), button: block("stone"), target: block("target_side"),
  daylight_detector: block("daylight_detector_side"), sticky_piston: block("piston_side"), redstone_block: block("redstone_block"),
  dispenser: block("dispenser_front_vertical"), note_block: block("note_block"), powered_rail: block("powered_rail"),
  calibrated_sculk_sensor: block("calibrated_sculk_sensor_top"), redstone_lamp: block("redstone_lamp"),
};
const item = id => itemAliases[id] || rawItem(id);
const entity = (folder, file = folder) => ["blaze", "phantom"].includes(folder) ? `${MC_ASSET_ROOT}/textures/entity/${folder}.png` : rawEntity(folder, file);

export const minecraftAssets = { item, block, entity };

export const minecraftModeIcons = {
  "minecraft-sprint": item("iron_pickaxe"),
  "minecraft-crafting": block("crafting_table_front"),
  "minecraft-mob": block("spawner"),
  "minecraft-biome": block("grass_block_side"),
  "minecraft-truth": item("enchanted_book"),
  "minecraft-redstone": item("redstone"),
};

export const minecraftModeMeta = {
  "minecraft-sprint": { name: "Minecraft Sprint", icon: "⛏️", kind: "Pytania na czas" },
  "minecraft-crafting": { name: "Crafting Rush", icon: "🛠️", kind: "Crafting" },
  "minecraft-mob": { name: "Zgadnij Moba", icon: "👾", kind: "Moby" },
  "minecraft-biome": { name: "Jaki to biom?", icon: "🌍", kind: "Biomy" },
  "minecraft-truth": { name: "Minecraft czy kłamstwo?", icon: "📖", kind: "Prawda czy fałsz" },
  "minecraft-redstone": { name: "Awaria Redstone", icon: "🔴", kind: "Logika" },
};

const difficultyRank = { easy: 1, medium: 2, hard: 3, expert: 4 };
const difficultyLabel = { easy: "Łatwy", medium: "Średni", hard: "Trudny", expert: "Ekspert" };
const modes = Object.keys(minecraftModeMeta);
const list = value => Array.isArray(value) ? value : [];
const safePlayers = players => [...new Set(list(players).filter(Boolean))];
const now = () => Date.now();
const setPhaseTimer = (game, seconds) => { const duration = Math.max(1, Number(seconds) || 10) * 1000; game.phaseStartedAt = now(); game.phaseDurationMs = duration; game.phaseEndsAt = game.phaseStartedAt + duration; };
const pick = values => values[Math.floor(Math.random() * values.length)] || values[0];
const unique = values => [...new Set(list(values))];
const compactAnswer = value => normalizeAnswer(value).replace(/[\s-]/g, "");
const matchingText = (value, accepted) => {
  const answer = normalizeAnswer(value);
  const compact = compactAnswer(value);
  if (!answer) return false;
  const answerTokens = new Set(answer.split(/[\s-]+/).filter(Boolean));
  return list(accepted).some(item => {
    const expected = normalizeAnswer(item);
    if (expected === answer || compactAnswer(item) === compact) return true;
    const expectedTokens = expected.split(/[\s-]+/).filter(Boolean);
    return expectedTokens.length > 1 && expectedTokens.every(token => answerTokens.has(token));
  });
};

// These are deliberately public prompts only. The engine uses the same
// records for deterministic validation, while the UI never prints accepted
// aliases before the reveal phase.
const sprintQuestions = [
  { id: "sprint-01", difficulty: "easy", icon: item("pickaxe"), prompt: "Który surowiec jest potrzebny do stworzenia pochodni?", answer: "węgiel", accepted: ["węgiel", "wegiel", "charcoal", "węgiel drzewny"] },
  { id: "sprint-02", difficulty: "easy", icon: item("red_bed"), prompt: "Jaki przedmiot pozwala ustawić punkt odrodzenia w Overworldzie?", answer: "łóżko", accepted: ["łóżko", "lozko", "bed"] },
  { id: "sprint-03", difficulty: "easy", icon: item("water_bucket"), prompt: "Czym najlepiej ugasisz lawę albo ogień?", answer: "woda", accepted: ["woda", "wiadro wody", "water"] },
  { id: "sprint-04", difficulty: "easy", icon: item("ender_pearl"), prompt: "Jaki przedmiot teleportuje gracza po rzuceniu?", answer: "perła kresu", accepted: ["perła kresu", "perla kresu", "ender pearl", "enderpearl"] },
  { id: "sprint-05", difficulty: "medium", icon: item("shield"), prompt: "Jaki przedmiot blokuje większość nadchodzących obrażeń?", answer: "tarcza", accepted: ["tarcza", "shield"] },
  { id: "sprint-06", difficulty: "medium", icon: item("compass"), prompt: "Co w Overworldzie wskazuje punkt spawnu świata?", answer: "kompas", accepted: ["kompas", "compass"] },
  { id: "sprint-07", difficulty: "medium", icon: item("glass_bottle"), prompt: "Do czego zbierzesz oddech smoka?", answer: "butelka", accepted: ["butelka", "szklana butelka", "glass bottle"] },
  { id: "sprint-08", difficulty: "medium", icon: item("flint_and_steel"), prompt: "Czym aktywujesz portal do Netheru?", answer: "krzesiwo", accepted: ["krzesiwo", "flint and steel"] },
  { id: "sprint-09", difficulty: "hard", icon: item("slime_ball"), prompt: "Jaki mob zostawia kulki szlamu?", answer: "slime", accepted: ["slime", "szlam", "slime ball"] },
  { id: "sprint-10", difficulty: "hard", icon: item("totem_of_undying"), prompt: "Co trzymane w ręce może uratować gracza przed śmiercią?", answer: "totem nieśmiertelności", accepted: ["totem nieśmiertelności", "totem niesmiertelnosci", "totem of undying", "totem"] },
  { id: "sprint-11", difficulty: "hard", icon: item("nether_star"), prompt: "Jaki przedmiot wypada po pokonaniu Withera?", answer: "gwiazda netheru", accepted: ["gwiazda netheru", "gwiazda nether", "nether star"] },
  { id: "sprint-12", difficulty: "hard", icon: item("elytra"), prompt: "Jak nazywa się przedmiot pozwalający szybować?", answer: "elytra", accepted: ["elytra", "skrzydła", "skrzydla", "elytra wings"] },
  { id: "sprint-13", difficulty: "expert", icon: item("magma_cream"), prompt: "Z czego robi się miksturę odporności na ogień?", answer: "magmowa śmietanka", accepted: ["magmowa śmietanka", "magmowa smietanka", "magma cream"] },
  { id: "sprint-14", difficulty: "expert", icon: item("echo_shard"), prompt: "Jaki rzadki przedmiot znajdziesz w pradawnych miastach?", answer: "odłamek echa", accepted: ["odłamek echa", "odlamek echa", "echo shard"] },
  { id: "sprint-15", difficulty: "expert", icon: item("soul_lantern"), prompt: "Jaki rodzaj latarni ma niebieski płomień?", answer: "latarnia dusz", accepted: ["latarnia dusz", "soul lantern"] },
  { id: "sprint-16", difficulty: "expert", icon: item("netherite_ingot"), prompt: "Z czego robi się sztabkę netherytu?", answer: "odłamki netherytu i sztabki złota", accepted: ["odłamki netherytu i sztabki złota", "odlamki netherytu i sztabki zlota", "4 odłamki netherytu i 4 sztabki złota", "netherite scrap gold"] },
  { id: "sprint-17", difficulty: "hard", icon: item("beacon"), prompt: "Który blok daje graczom efekty w swoim zasięgu?", answer: "latarnia", accepted: ["latarnia", "beacon"] },
  { id: "sprint-18", difficulty: "expert", icon: item("respawn_anchor"), prompt: "Czego używa się do ładowania kotwicy odrodzenia?", answer: "ładunek żaru", accepted: ["ładunek żaru", "ladunek zaru", "glowstone", "pył jarzeniowy", "glowstone dust"] },
];

const craftingQuestions = [
  { id: "craft-01", difficulty: "easy", icon: block("crafting_table_front"), prompt: "Ile desek potrzeba do stworzenia stołu rzemieślniczego?", answer: "4", accepted: ["4", "cztery", "4 deski", "cztery deski"] },
  { id: "craft-02", difficulty: "easy", icon: item("torch"), prompt: "Jakie dwa składniki tworzą zwykłą pochodnię?", answer: "węgiel i kij", accepted: ["węgiel i kij", "wegiel i kij", "kij i węgiel", "charcoal stick", "coal stick"] },
  { id: "craft-03", difficulty: "easy", icon: item("bread"), prompt: "Co powstaje z trzech sztuk pszenicy ułożonych w rzędzie?", answer: "chleb", accepted: ["chleb", "bread"] },
  { id: "craft-04", difficulty: "easy", icon: item("paper"), prompt: "Co powstaje z trzech trzcin cukrowych?", answer: "papier", accepted: ["papier", "paper"] },
  { id: "craft-05", difficulty: "medium", icon: item("bucket"), prompt: "Ile sztabek żelaza potrzeba do stworzenia wiadra?", answer: "3", accepted: ["3", "trzy", "3 żelaza", "trzy żelaza"] },
  { id: "craft-06", difficulty: "medium", icon: item("bow"), prompt: "Z jakich dwóch rodzajów przedmiotów robisz łuk?", answer: "3 patyki i 3 nici", accepted: ["patyki i nici", "kije i nici", "3 patyki i 3 nici", "sticks and string"] },
  { id: "craft-07", difficulty: "medium", icon: item("iron_pickaxe"), prompt: "Jaki materiał oprócz dwóch patyków tworzy żelazny kilof?", answer: "3 sztabki żelaza", accepted: ["żelazo", "3 sztabki żelaza", "trzy sztabki żelaza", "iron"] },
  { id: "craft-08", difficulty: "medium", icon: item("cake"), prompt: "Ile wiader mleka trzeba do tortu?", answer: "3", accepted: ["3", "trzy", "3 wiadra", "trzy wiadra"] },
  { id: "craft-09", difficulty: "hard", icon: item("enchanting_table"), prompt: "Podaj główne składniki stołu do zaklinania.", answer: "diamenty obsydian książka", accepted: ["diamenty obsydian książka", "2 diamenty 4 obsydiany książka", "diamenty, obsydian i książka", "diamond obsidian book"] },
  { id: "craft-10", difficulty: "hard", icon: block("piston_side"), prompt: "Co oprócz desek, bruku i sztabki żelaza jest potrzebne do tłoka?", answer: "pył redstone", accepted: ["pył redstone", "pyl redstone", "redstone", "redstone dust"] },
  { id: "craft-11", difficulty: "hard", icon: item("quartz"), prompt: "Z jakiego kwarcu robi się obserwator?", answer: "kwarc netherowy", accepted: ["kwarc netherowy", "kwarc", "nether quartz"] },
  { id: "craft-12", difficulty: "hard", icon: item("firework_rocket"), prompt: "Co dodajesz do rakiety, aby służyła do wzmacniania lotu elytry?", answer: "proch", accepted: ["proch", "gunpowder"] },
  { id: "craft-13", difficulty: "expert", icon: block("lodestone_side"), prompt: "Z czego zrobisz magnetyt, który może związać kompas z konkretnym miejscem?", answer: "cegły kamienne i sztabka netherytu", accepted: ["cegły kamienne i sztabka netherytu", "cegly kamienne i sztabka netherytu", "8 cegieł kamiennych i sztabka netherytu", "chiseled stone bricks netherite"] },
  { id: "craft-14", difficulty: "expert", icon: block("respawn_anchor_side0"), prompt: "Jakie bloki są potrzebne do kotwicy odrodzenia?", answer: "obsydian płaczu i glowstone", accepted: ["obsydian płaczu i glowstone", "obsydian placzu i glowstone", "crying obsidian glowstone"] },
  { id: "craft-15", difficulty: "expert", icon: item("conduit"), prompt: "Z czego buduje się aktywną ramę przewodnika?", answer: "prismarine", accepted: ["prismarine", "pryzmaryn", "pryzmaryn i latarnie morskie", "prismarine sea lantern"] },
];

const mobQuestions = [
  { id: "mob-01", difficulty: "easy", icon: entity("creeper"), prompt: "Zielony, cichy do momentu syczenia i bardzo wybuchowy.", answer: "creeper", accepted: ["creeper", "creepera", "creeperem"] },
  { id: "mob-02", difficulty: "easy", icon: entity("zombie"), prompt: "Nocny nieumarły, który powoli idzie w stronę gracza i pali się na słońcu.", answer: "zombie", accepted: ["zombie", "zombi"] },
  { id: "mob-03", difficulty: "easy", icon: entity("skeleton"), prompt: "Nieumarły łucznik, który potrafi strzelać z dużej odległości.", answer: "szkielet", accepted: ["szkielet", "skeleton"] },
  { id: "mob-04", difficulty: "easy", icon: entity("spider"), prompt: "Wspina się po ścianach, a w ciemności ma czerwone oczy.", answer: "pająk", accepted: ["pająk", "pajak", "spider"] },
  { id: "mob-05", difficulty: "medium", icon: entity("enderman"), prompt: "Wysoki, czarny i teleportuje się, gdy spojrzysz mu prosto w oczy.", answer: "enderman", accepted: ["enderman", "endermanem"] },
  { id: "mob-06", difficulty: "medium", icon: entity("blaze"), prompt: "Lata w Netherze, jest otoczony obracającymi się prętami i strzela ogniem.", answer: "blaze", accepted: ["blaze", "płomyk", "plomyk"] },
  { id: "mob-07", difficulty: "medium", icon: entity("ghast"), prompt: "Duży, biały mob latający w Netherze i wysyłający ogniste kule.", answer: "ghast", accepted: ["ghast", "ghastem"] },
  { id: "mob-08", difficulty: "medium", icon: entity("piglin", "piglin"), prompt: "Netherowy humanoid, który lubi złoto i atakuje graczy bez złotej części zbroi.", answer: "piglin", accepted: ["piglin", "piglinem"] },
  { id: "mob-09", difficulty: "hard", icon: entity("warden"), prompt: "Ślepy strażnik głębin, który wykrywa wibracje i korzysta z ataku sonicznego.", answer: "warden", accepted: ["warden", "strażnik", "straznik"] },
  { id: "mob-10", difficulty: "hard", icon: entity("allay"), prompt: "Mały niebieski pomocnik, który może przynosić przedmioty podobne do wskazanego.", answer: "allay", accepted: ["allay", "alej"] },
  { id: "mob-11", difficulty: "hard", icon: entity("phantom"), prompt: "Latający nieumarły, który poluje na graczy długo niespiących.", answer: "phantom", accepted: ["phantom", "fantom"] },
  { id: "mob-12", difficulty: "hard", icon: entity("shulker"), prompt: "Ukrywa się w fioletowej skorupie i strzela pociskami lewitacji.", answer: "shulker", accepted: ["shulker", "skulker"] },
  { id: "mob-13", difficulty: "expert", icon: entity("breeze"), prompt: "Nowy przeciwnik z komnat prób, który walczy podmuchami wiatru.", answer: "breeze", accepted: ["breeze", "wiatrak", "bryza"] },
  { id: "mob-14", difficulty: "expert", icon: entity("sniffer"), prompt: "Starożytny pasywny mob, który węszy i wykopuje nasiona z ziemi.", answer: "sniffer", accepted: ["sniffer", "węszyciel", "weszyciel"] },
  { id: "mob-15", difficulty: "expert", icon: entity("iron_golem"), prompt: "Duży obrońca wiosek, którego gracz może także zbudować z żelaza i dyni.", answer: "golem żelazny", accepted: ["golem żelazny", "golem zelazny", "iron golem", "żelazny golem"] },
  { id: "mob-16", difficulty: "expert", icon: entity("wither", "wither"), prompt: "Trójgłowy boss, którego przywołuje się z piasku dusz i czaszek szkieletów.", answer: "wither", accepted: ["wither", "with er"] },
];

const biomeQuestions = [
  { id: "biome-01", difficulty: "easy", icon: item("grass_block"), prompt: "Zwykłe zielone wzgórza, dęby, brzozy i dużo trawy.", answer: "równiny", accepted: ["równiny", "rowniny", "plains"] },
  { id: "biome-02", difficulty: "easy", icon: item("sand"), prompt: "Prawie brak drzew, piasek, kaktusy i gorący klimat.", answer: "pustynia", accepted: ["pustynia", "desert"] },
  { id: "biome-03", difficulty: "easy", icon: item("snow_block"), prompt: "Zimny teren pokryty śniegiem, często z iglastymi drzewami.", answer: "tajga śnieżna", accepted: ["tajga śnieżna", "tajga sniezna", "snowy taiga", "śnieżna tajga"] },
  { id: "biome-04", difficulty: "medium", icon: item("jungle_log"), prompt: "Gęste, wysokie drzewa, liany i papugi.", answer: "dżungla", accepted: ["dżungla", "dzungla", "jungle"] },
  { id: "biome-05", difficulty: "medium", icon: item("ice"), prompt: "Bardzo zimny biom z wysokimi kolumnami lodu.", answer: "kolce lodowe", accepted: ["kolce lodowe", "kolce lodu", "ice spikes"] },
  { id: "biome-06", difficulty: "medium", icon: item("mangrove_log"), prompt: "Bagienny, ciepły biom z namorzynami, błotem i żabami.", answer: "bagna namorzynowe", accepted: ["bagna namorzynowe", "mangrove swamp", "namorzyny"] },
  { id: "biome-07", difficulty: "medium", icon: item("dark_oak_log"), prompt: "Ponury, gęsty las z dużymi dębami i grzybami.", answer: "mroczny las", accepted: ["mroczny las", "dark forest", "ciemny las"] },
  { id: "biome-08", difficulty: "hard", icon: item("warped_nylium"), prompt: "Niebiesko-turkusowy biom Netheru z grzybami i endermanami.", answer: "spaczony las", accepted: ["spaczony las", "warped forest"] },
  { id: "biome-09", difficulty: "hard", icon: item("crimson_nylium"), prompt: "Czerwony biom Netheru z płaczącymi pnączami i hoglinami.", answer: "szkarłatny las", accepted: ["szkarłatny las", "szkarłatny bióm", "crimson forest"] },
  { id: "biome-10", difficulty: "hard", icon: item("soul_sand"), prompt: "Netherowy biom z niebieskim ogniem, piaskiem dusz i bazaltowymi filarami.", answer: "dolina piasku dusz", accepted: ["dolina piasku dusz", "soul sand valley", "dolina dusz"] },
  { id: "biome-11", difficulty: "hard", icon: item("basalt"), prompt: "Czarno-szary, niebezpieczny biom Netheru z lawą i bazaltem.", answer: "delta bazaltowa", accepted: ["delta bazaltowa", "bazaltowa delta", "basalt deltas"] },
  { id: "biome-12", difficulty: "expert", icon: item("sculk"), prompt: "Podziemny biom z blokami sculk, sensorami i pradawnymi miastami.", answer: "głębokie ciemności", accepted: ["głębokie ciemności", "glebokie ciemnosci", "deep dark"] },
  { id: "biome-13", difficulty: "expert", icon: item("cherry_log"), prompt: "Różowy biom z kwitnącymi drzewami, płatkami i wysokimi górami.", answer: "gaj wiśniowy", accepted: ["gaj wiśniowy", "gaj wisniowy", "cherry grove"] },
  { id: "biome-14", difficulty: "expert", icon: item("end_stone"), prompt: "Wyspy z kamienia kresu, obsydianowymi filarami i smokiem.", answer: "kres", accepted: ["kres", "end", "the end"] },
  { id: "biome-15", difficulty: "expert", icon: item("pointed_dripstone"), prompt: "Podziemny biom z naciekami, stalaktytami i stalagmitami.", answer: "jaskinie naciekowe", accepted: ["jaskinie naciekowe", "dripstone caves", "jaskinia naciekowa"] },
];

const truthQuestions = [
  { id: "truth-01", difficulty: "easy", icon: item("creeper_head"), statement: "Creeper powstał przez przypadkowe odwrócenie modelu świni.", answer: true, explanation: "To prawda — błąd wysokości i szerokości modelu dał początek creeperowi." },
  { id: "truth-02", difficulty: "easy", icon: item("water_bucket"), statement: "Woda może ugasić ogień na graczu.", answer: true, explanation: "To prawda. Woda gasi ogień, choć nie działa w Netherze jako postawiony blok." },
  { id: "truth-03", difficulty: "easy", icon: item("diamond"), statement: "Diamentowy kilof jest potrzebny do wydobycia obsydianu.", answer: true, explanation: "To prawda — bez diamentowego albo netherytowego kilofa obsydian nie wypadnie jako blok." },
  { id: "truth-04", difficulty: "easy", icon: item("bed"), statement: "Spanie w łóżku w Netherze jest bezpieczne.", answer: false, explanation: "Fałsz — próba użycia łóżka w Netherze albo Endzie wywołuje eksplozję." },
  { id: "truth-05", difficulty: "medium", icon: item("enderman_spawn_egg"), statement: "Enderman może podnosić niektóre bloki.", answer: true, explanation: "To prawda — może przenosić wybrane naturalne bloki, zależnie od wersji i ustawień gry." },
  { id: "truth-06", difficulty: "medium", icon: item("redstone"), statement: "Pył redstone może zasilać blok stojący bezpośrednio pod nim.", answer: true, explanation: "To prawda — redstone przekazuje sygnał do sąsiednich bloków i mechanizmów." },
  { id: "truth-07", difficulty: "medium", icon: item("sponge"), statement: "Gąbka może wchłonąć lawę.", answer: false, explanation: "Fałsz — gąbka wchłania wodę, ale nie lawę." },
  { id: "truth-08", difficulty: "medium", icon: item("elytra"), statement: "Elytra zużywa się podczas szybowania.", answer: true, explanation: "To prawda — trwałość elytry spada w trakcie lotu i można ją naprawiać membranami fantoma." },
  { id: "truth-09", difficulty: "medium", icon: item("gold_ingot"), statement: "Pigliny zawsze atakują gracza noszącego dowolny złoty element zbroi.", answer: false, explanation: "Fałsz — złoty element zwykle powstrzymuje ich neutralną reakcję, ale są wyjątki, np. otwieranie skrzyń." },
  { id: "truth-10", difficulty: "hard", icon: item("honey_block"), statement: "Blok miodu i blok szlamu mogą przykleić się do siebie.", answer: false, explanation: "Fałsz — te dwa typy bloków nie przyklejają się do siebie, co jest ważne w maszynach redstone." },
  { id: "truth-11", difficulty: "hard", icon: item("observer"), statement: "Obserwator może wykryć zmianę stanu obserwowanego bloku.", answer: true, explanation: "To prawda — wysyła krótki impuls redstone po wykryciu zmiany przed swoją twarzą." },
  { id: "truth-12", difficulty: "hard", icon: item("turtle_helmet"), statement: "Hełm żółwia pozwala oddychać pod wodą bez żadnego limitu.", answer: false, explanation: "Fałsz — daje dodatkowy czas oddychania, ale nie nieskończony." },
  { id: "truth-13", difficulty: "hard", icon: item("sculk_sensor"), statement: "Sculk sensor reaguje na wibracje, ale można go wyciszyć wełną.", answer: true, explanation: "To prawda — wełna blokuje przenoszenie wibracji między źródłem a sensorem." },
  { id: "truth-14", difficulty: "hard", icon: item("magma_block"), statement: "Blok magmy zadaje obrażenia zawsze, nawet gdy gracz na nim kuca.", answer: false, explanation: "Fałsz — kucanie chroni przed obrażeniami od bloku magmy." },
  { id: "truth-15", difficulty: "expert", icon: item("piston"), statement: "Tłok może przesunąć blok obsydianu.", answer: false, explanation: "Fałsz — obsydian należy do bloków, których zwykły tłok nie może przesunąć." },
  { id: "truth-16", difficulty: "expert", icon: item("conduit"), statement: "Przewodnik może działać również pod wodą, jeśli otacza go poprawna rama.", answer: true, explanation: "To prawda — przewodnik jest właśnie podwodnym źródłem efektów." },
  { id: "truth-17", difficulty: "expert", icon: item("respawn_anchor"), statement: "Kotwicę odrodzenia można ładować wodą.", answer: false, explanation: "Fałsz — ładuje się ją blokami glowstone, a woda nie ma z tym nic wspólnego." },
  { id: "truth-18", difficulty: "expert", icon: item("amethyst_shard"), statement: "Kryształ ametystu odrasta z pączkującego ametystu, ale samego pączkującego bloku nie da się normalnie wydobyć.", answer: true, explanation: "To prawda — pączkujący ametyst jest blokiem źródłowym dla kryształów." },
  { id: "truth-19", difficulty: "expert", icon: item("lodestone_compass"), statement: "Kompas związany z magnetytem zawsze wskaże ten magnetyt, nawet w innej dimensji.", answer: false, explanation: "Fałsz — magnetyt i kompas muszą znajdować się w tej samej dimensji." },
  { id: "truth-20", difficulty: "hard", icon: item("trident"), statement: "Trójząb może wrócić do gracza dzięki zaklęciu Lojalność.", answer: true, explanation: "To prawda — Lojalność sprawia, że rzucony trójząb wraca do właściciela." },
  { id: "truth-21", difficulty: "medium", icon: item("milk_bucket"), statement: "Mleko usuwa wszystkie aktywne efekty mikstur.", answer: true, explanation: "To prawda — wypicie mleka usuwa również pozytywne efekty." },
  { id: "truth-22", difficulty: "hard", icon: item("snowball"), statement: "Śnieżka zadaje zwykłe obrażenia wszystkim mobom.", answer: false, explanation: "Fałsz — śnieżki mają specjalne zachowanie, ale nie są uniwersalną bronią obrażeniową." },
  { id: "truth-23", difficulty: "expert", icon: item("netherite_scrap"), statement: "Netherytowe przedmioty płoną w lawie tak samo jak drewniane.", answer: false, explanation: "Fałsz — netherytowe przedmioty nie spadają jako zniszczone w lawie." },
  { id: "truth-24", difficulty: "expert", icon: item("jukebox"), statement: "Płyta muzyczna może uruchomić wibrację wykrywalną przez sculk sensor.", answer: true, explanation: "To prawda — odtwarzanie płyty generuje zdarzenia dźwiękowe i wibracje." },
  { id: "truth-25", difficulty: "medium", icon: item("campfire"), statement: "Ognisko może upiec jedzenie bez używania paliwa.", answer: true, explanation: "To prawda — ognisko gotuje położone na nim jedzenie bez paliwa." },
  { id: "truth-26", difficulty: "medium", icon: item("ender_chest"), statement: "Skrzynie kresu danego gracza mają wspólną zawartość, niezależnie od ich miejsca na mapie.", answer: true, explanation: "To prawda — wszystkie skrzynie kresu tego samego gracza prowadzą do jego wspólnego magazynu." },
  { id: "truth-27", difficulty: "medium", icon: item("spawner"), statement: "Jedwabny dotyk pozwala normalnie zebrać spawner jako blok.", answer: false, explanation: "Fałsz — spawnera nie da się zdobyć jako bloku w zwykłym survivalu, również z Jedwabnym dotykiem." },
  { id: "truth-28", difficulty: "medium", icon: item("armor_stand"), statement: "Stojak na zbroję może przechowywać elementy zbroi oraz trzymany przedmiot.", answer: true, explanation: "To prawda — stojak ma miejsca na zbroję i może trzymać przedmiot w ręce." },
  { id: "truth-29", difficulty: "medium", icon: item("composter"), statement: "Kompostownik może zamienić odpowiednie przedmioty roślinne w mączkę kostną.", answer: true, explanation: "To prawda — kompostowalne przedmioty zapełniają kompostownik, a pełny daje mączkę kostną." },
  { id: "truth-30", difficulty: "medium", icon: item("iron_ingot"), statement: "Żelaznego golema można uleczyć, używając na nim sztabki żelaza.", answer: true, explanation: "To prawda — użycie sztabki żelaza na golemie przywraca mu część zdrowia." },
  { id: "truth-31", difficulty: "medium", icon: item("chorus_fruit"), statement: "Zjedzenie owocu refrenu może teleportować gracza na krótką, losową odległość.", answer: true, explanation: "To prawda — owoc refrenu teleportuje jedzącego, podobnie jak bezpieczna, mała perła Endu." },
  { id: "truth-32", difficulty: "medium", icon: item("ender_pearl"), statement: "Rzucona perła Endu może teleportować gracza w miejsce trafienia.", answer: true, explanation: "To prawda — po trafieniu perła teleportuje gracza i zadaje mu niewielkie obrażenia." },
  { id: "truth-33", difficulty: "medium", icon: item("tnt"), statement: "TNT można podpalić krzesiwem.", answer: true, explanation: "To prawda — krzesiwo aktywuje TNT, rozpoczynając jego odliczanie do wybuchu." },
  { id: "truth-34", difficulty: "medium", icon: item("oak_boat"), statement: "Łódź może przewozić małego moba jako pasażera.", answer: true, explanation: "To prawda — łodzie mogą przewozić pasażera, w tym wiele małych mobów." },
  { id: "truth-35", difficulty: "medium", icon: item("anvil"), statement: "Kowadło pozwala zmienić nazwę przedmiotu.", answer: true, explanation: "To prawda — nazwę przedmiotu zmienia się w pierwszym polu interfejsu kowadła." },
  { id: "truth-36", difficulty: "medium", icon: item("name_tag"), statement: "Znacznik nazw można użyć na mobie bez wcześniejszego nazwania go w kowadle.", answer: false, explanation: "Fałsz — znacznik nazw trzeba najpierw nazwać w kowadle, dopiero potem można użyć go na mobie." },
  { id: "truth-37", difficulty: "medium", icon: item("beacon"), statement: "Latarnia morska daje swoje efekty, nawet jeśli nie stoi na żadnej piramidzie.", answer: false, explanation: "Fałsz — do aktywacji latarni potrzebna jest poprawna piramida z odpowiednich bloków." },
  { id: "truth-38", difficulty: "medium", icon: item("hopper"), statement: "Lej może pobierać przedmioty z pojemnika znajdującego się bezpośrednio nad nim.", answer: true, explanation: "To prawda — lej pobiera przedmioty z góry i przekazuje je do swojego wyjścia." },
  { id: "truth-39", difficulty: "medium", icon: item("sugar_cane"), statement: "Trzcina cukrowa urośnie na piasku bez sąsiadującej wody.", answer: false, explanation: "Fałsz — do posadzenia trzciny potrzebna jest woda przy jednym z sąsiadujących bloków." },
  { id: "truth-40", difficulty: "medium", icon: item("cactus"), statement: "Kaktus można posadzić na piasku.", answer: true, explanation: "To prawda — piasek jest jednym z podstawowych bloków, na których rośnie kaktus." },
  { id: "truth-41", difficulty: "medium", icon: item("firework_rocket"), statement: "Rakieta fajerwerkowa może przyspieszyć lot gracza używającego elytry.", answer: true, explanation: "To prawda — zwykła rakieta bez gwiazdki może napędzać lot na elytrze." },
  { id: "truth-42", difficulty: "medium", icon: item("saddle"), statement: "Siodło można stworzyć w zwykłym stole rzemieślniczym.", answer: false, explanation: "Fałsz — w vanilla siodła nie da się wytworzyć; zdobywa się je między innymi w skrzyniach i handlu." },
  { id: "truth-43", difficulty: "medium", icon: item("water_bucket"), statement: "W Netherze można bezpiecznie postawić wodę z wiadra.", answer: false, explanation: "Fałsz — woda z wiadra od razu znika w Netherze, poza wyjątkami takimi jak kocioł." },
  { id: "truth-44", difficulty: "medium", icon: item("bed"), statement: "Łóżko może ustawić punkt odrodzenia gracza w Overworldzie.", answer: true, explanation: "To prawda — użycie łóżka w Overworldzie ustawia je jako punkt odrodzenia." },
  { id: "truth-45", difficulty: "medium", icon: item("lodestone_compass"), statement: "Kompas związany z magnetytem wskazuje ten magnetyt tylko w tej samej dimensji.", answer: true, explanation: "To prawda — w innej dimensji taki kompas przestaje prawidłowo wskazywać cel." },
  { id: "truth-46", difficulty: "medium", icon: item("clock"), statement: "Zwykły zegar działa normalnie w Netherze i pokazuje tam aktualną porę dnia.", answer: false, explanation: "Fałsz — w Netherze i Endzie wskazówka zegara obraca się nieregularnie." },
  { id: "truth-47", difficulty: "medium", icon: item("compass"), statement: "Zwykły kompas w Overworldzie domyślnie wskazuje światowy punkt odrodzenia.", answer: true, explanation: "To prawda — bez związania z magnetytem kompas prowadzi do światowego spawnu." },
  { id: "truth-48", difficulty: "medium", icon: item("crying_obsidian"), statement: "Do zbudowania działającego portalu do Netheru można użyć obsydianu płaczu zamiast zwykłego obsydianu.", answer: false, explanation: "Fałsz — obsydian płaczu nie zastępuje obsydianu w ramie portalu." },
  { id: "truth-49", difficulty: "medium", icon: item("obsidian"), statement: "Narożniki ramy portalu do Netheru są obowiązkowe.", answer: false, explanation: "Fałsz — działający portal może mieć pominięte cztery narożne bloki ramy." },
  { id: "truth-50", difficulty: "medium", icon: item("name_tag"), statement: "Nazwanie moba znacznikiem nazw chroni go przed naturalnym zniknięciem.", answer: true, explanation: "To prawda — nazwane moby nie despawnują się naturalnie, z wyjątkami wynikającymi z konkretnych mechanik." },
  { id: "truth-51", difficulty: "medium", icon: item("villager_spawn_egg"), statement: "Wieśniak, z którym wykonano już handel, może później dowolnie zmienić profesję.", answer: false, explanation: "Fałsz — pierwszy handel blokuje profesję wieśniaka." },
  { id: "truth-52", difficulty: "medium", icon: item("golden_apple"), statement: "Zainfekowanego wieśniaka można wyleczyć złotym jabłkiem podczas efektu Słabości.", answer: true, explanation: "To prawda — trzeba zastosować złote jabłko na zainfekowanym wieśniaku z efektem Słabości." },
  { id: "truth-53", difficulty: "medium", icon: item("iron_block"), statement: "Żelaznego golema można zbudować z czterech bloków żelaza i wyrzeźbionej dyni.", answer: true, explanation: "To prawda — cztery bloki żelaza układa się w kształt litery T i dodaje wyrzeźbioną dynię." },
  { id: "truth-54", difficulty: "medium", icon: item("redstone"), statement: "Maksymalna siła sygnału pyłu redstone wynosi 15.", answer: true, explanation: "To prawda — sygnał zaczyna od 15 i słabnie o jeden za każdy blok od źródła." },
];

const redstoneQuestions = [
  { id: "redstone-01", difficulty: "easy", icon: item("lever"), prompt: "Który element ręcznie włącza i wyłącza sygnał?", options: ["Dźwignia", "Komparator", "Lej"], answer: 0, explanation: "Dźwignia przełącza stabilny sygnał redstone." },
  { id: "redstone-02", difficulty: "easy", icon: item("redstone_torch"), prompt: "Co dzieje się z pochodnią redstone, gdy zasilisz blok, na którym stoi?", options: ["Gaśnie", "Zmienia kolor na niebieski", "Wysyła nieskończony impuls"], answer: 0, explanation: "Zasilony blok wyłącza stojącą na nim pochodnię redstone." },
  { id: "redstone-03", difficulty: "easy", icon: item("button"), prompt: "Który element daje sygnał tylko przez krótki czas po kliknięciu?", options: ["Przycisk", "Dźwignia", "Skrzynia"], answer: 0, explanation: "Przycisk generuje chwilowy impuls." },
  { id: "redstone-04", difficulty: "medium", icon: item("repeater"), prompt: "Do czego przede wszystkim służy repeater?", options: ["Wzmacnia i opóźnia sygnał", "Niszczy redstone", "Zamienia sygnał na wodę"], answer: 0, explanation: "Repeater odświeża moc sygnału i może dodać opóźnienie." },
  { id: "redstone-05", difficulty: "medium", icon: item("comparator"), prompt: "Komparator potrafi porównywać sygnały oraz mierzyć zawartość kontenera.", options: ["Prawda", "Fałsz", "Tylko w Netherze"], answer: 0, explanation: "Komparator ma tryb porównania i może odczytywać poziom napełnienia kontenerów." },
  { id: "redstone-06", difficulty: "medium", icon: item("piston"), prompt: "Ile bloków może przesunąć zwykły tłok jednym wysunięciem?", options: ["Do 12", "Do 64", "Tylko 1"], answer: 0, explanation: "Limit tłoka wynosi 12 bloków." },
  { id: "redstone-07", difficulty: "medium", icon: item("observer"), prompt: "W którą stronę obserwator wysyła impuls?", options: ["Od strony czerwonej kropki", "Od strony twarzy", "W obie strony naraz"], answer: 0, explanation: "Czerwona kropka oznacza stronę wyjścia sygnału." },
  { id: "redstone-08", difficulty: "hard", icon: item("hopper"), prompt: "Co zrobi lej, gdy jest zasilony sygnałem redstone?", options: ["Przestanie przenosić przedmioty", "Spali wszystkie przedmioty", "Zacznie je sortować automatycznie"], answer: 0, explanation: "Zasilony lej zostaje zablokowany i nie pobiera ani nie wysyła przedmiotów." },
  { id: "redstone-09", difficulty: "hard", icon: item("target"), prompt: "Co jest specjalnego w trafieniu bloku celu pociskiem?", options: ["Generuje sygnał redstone", "Zmienia porę dnia", "Otwiera End"], answer: 0, explanation: "Trafienie celu generuje impuls, którego siła zależy od środka trafienia." },
  { id: "redstone-10", difficulty: "hard", icon: item("daylight_detector"), prompt: "Co robi detektor światła dziennego?", options: ["Daje sygnał zależny od światła nieba", "Oświetla jaskinię", "Przywołuje słońce"], answer: 0, explanation: "Jego moc zmienia się zależnie od światła dziennego." },
  { id: "redstone-11", difficulty: "hard", icon: item("sculk_sensor"), prompt: "Który blok jest kluczowym elementem cichych mechanizmów reagujących na dźwięk?", options: ["Sculk sensor", "Piasek", "Kowadło"], answer: 0, explanation: "Sculk sensor wykrywa wibracje w otoczeniu." },
  { id: "redstone-12", difficulty: "hard", icon: item("sticky_piston"), prompt: "Co odróżnia lepki tłok od zwykłego?", options: ["Może przyciągnąć blok po schowaniu", "Jest dwa razy szybszy", "Działa bez sygnału"], answer: 0, explanation: "Lepki tłok może zabrać ze sobą przylegający blok." },
  { id: "redstone-13", difficulty: "expert", icon: item("redstone_block"), prompt: "Czy blok redstone zasila sąsiedni pył redstone?", options: ["Tak", "Nie", "Tylko gdy pada deszcz"], answer: 0, explanation: "Blok redstone jest stałym źródłem zasilania." },
  { id: "redstone-14", difficulty: "expert", icon: item("dispenser"), prompt: "Czym różni się wyrzutnik od dozownika?", options: ["Dozownik używa przedmiotu zgodnie z jego funkcją", "Wyrzutnik zawsze podpala bloki", "Nie ma różnicy"], answer: 0, explanation: "Dozownik może np. postawić wodę albo wystrzelić strzałę, podczas gdy wyrzutnik wyrzuca przedmiot." },
  { id: "redstone-15", difficulty: "expert", icon: item("note_block"), prompt: "Co zmienia dźwięk bloku nutowego?", options: ["Blok pod nim", "Pogoda", "Kolor pyłu redstone"], answer: 0, explanation: "Materiał bloku pod nuteblokiem wpływa na instrument." },
  { id: "redstone-16", difficulty: "expert", icon: item("powered_rail"), prompt: "Co robi zasilona szyna napędowa?", options: ["Przyspiesza albo zatrzymuje wagonik", "Buduje tor", "Teleportuje wagonik do Netheru"], answer: 0, explanation: "Powered rail zmienia prędkość wagonika, gdy otrzymuje sygnał." },
  { id: "redstone-17", difficulty: "expert", icon: item("calibrated_sculk_sensor"), prompt: "Co wyróżnia skalibrowany sculk sensor?", options: ["Może filtrować częstotliwość wibracji", "Nie reaguje na nic", "Wysyła sygnał tylko w dzień"], answer: 0, explanation: "Kalibrowany sensor pozwala wybrać zakres częstotliwości, na który reaguje." },
  { id: "redstone-18", difficulty: "expert", icon: item("redstone_lamp"), prompt: "Jak wyłączyć lampę redstone połączoną z aktywnym sygnałem?", options: ["Odciąć albo wyłączyć sygnał", "Dodać więcej redstone", "Postawić pod nią wodę"], answer: 0, explanation: "Lampa świeci, gdy otrzymuje moc — trzeba przerwać obwód albo sygnał." },
];

const questionPools = {
  "minecraft-sprint": sprintQuestions,
  "minecraft-crafting": craftingQuestions,
  "minecraft-mob": mobQuestions,
  "minecraft-biome": biomeQuestions,
  "minecraft-truth": truthQuestions,
  "minecraft-redstone": redstoneQuestions,
};

export const minecraftDefaults = Object.fromEntries(modes.map(modeId => [modeId, {
  rounds: modeId === "minecraft-truth" ? 8 : 10,
  questionTime: modeId === "minecraft-redstone" ? 15 : modeId === "minecraft-crafting" || modeId === "minecraft-biome" ? 12 : 10,
  difficulty: "medium",
}]));

export function sanitizeMinecraftSettings(settings = {}, modeId = "minecraft-sprint") {
  const defaults = minecraftDefaults[modeId] || minecraftDefaults["minecraft-sprint"];
  const difficulty = ["easy", "medium", "hard", "expert"].includes(settings.difficulty) ? settings.difficulty : defaults.difficulty;
  return {
    ...defaults,
    ...settings,
    rounds: Math.max(3, Math.min(20, Number(settings.rounds ?? defaults.rounds) || defaults.rounds)),
    questionTime: Math.max(5, Math.min(30, Number(settings.questionTime ?? defaults.questionTime) || defaults.questionTime)),
    difficulty,
  };
}

function questionFor(modeId, settings, usedIds = []) {
  const pool = questionPools[modeId] || sprintQuestions;
  const limit = difficultyRank[settings.difficulty] || 2;
  const filtered = pool.filter(question => (difficultyRank[question.difficulty] || 2) <= limit);
  const eligible = filtered.length ? filtered : pool;
  const unused = eligible.filter(question => !usedIds.includes(question.id));
  return { ...(pick(unused.length ? unused : eligible) || eligible[0]) };
}

function scoresFor(players, scores = {}) {
  return Object.fromEntries(players.map(uid => [uid, Math.max(0, Number(scores[uid]) || 0)]));
}

function reconcilePlayers(game, players) {
  if (!game) return [];
  const roomPlayers = safePlayers(players);
  const previousPlayers = safePlayers(game.players);
  // The room roster is authoritative while a game is running. Keeping only
  // the intersection with the previous snapshot could silently remove the
  // current player during a Firebase/local state refresh.
  const activePlayers = roomPlayers.length ? roomPlayers : previousPlayers;
  game.players = activePlayers;
  game.scores = scoresFor(activePlayers, game.scores);
  if (game.mode === "minecraft-truth") {
    game.answers = Object.fromEntries(Object.entries(game.answers || {}).filter(([uid]) => activePlayers.includes(uid)));
    if (game.roundResult?.answers) game.roundResult.answers = Object.fromEntries(Object.entries(game.roundResult.answers).filter(([uid]) => activePlayers.includes(uid)));
    if (game.phase === "question" && activePlayers.length && activePlayers.every(uid => uid in game.answers)) revealTruth(game, activePlayers);
  } else if (activePlayers.length && game.currentUid && !activePlayers.includes(game.currentUid)) {
    game.currentUid = activePlayers[(Number(game.turnIndex) || 0) % activePlayers.length];
  }
  if (activePlayers.length && game.currentUid && !activePlayers.includes(game.currentUid)) game.currentUid = activePlayers[(Number(game.turnIndex) || 0) % activePlayers.length];
  if (game.roundResult?.scoreSnapshot) game.roundResult.scoreSnapshot = scoresFor(activePlayers, game.roundResult.scoreSnapshot);
  if (game.roundResult?.points) game.roundResult.points = Object.fromEntries(Object.entries(game.roundResult.points).filter(([uid]) => activePlayers.includes(uid)));
  if (game.phase === "result" || game.finished) {
    const result = winnerData(game);
    game.result = { ...(game.result || {}), ...result };
    game.winners = result.winners;
  }
  return activePlayers;
}

function winnerData(game) {
  const players = safePlayers(game.players);
  const scores = scoresFor(players, game.scores);
  const max = Math.max(0, ...players.map(uid => scores[uid]));
  const winners = players.filter(uid => scores[uid] === max);
  return { scores, max, winners, ranking: players.map(uid => ({ uid, score: scores[uid] })).sort((a, b) => b.score - a.score) };
}

function beginQuestion(game, settings, players) {
  const question = questionFor(game.mode, settings, game.usedQuestionIds);
  game.question = question;
  game.usedQuestionIds = unique([...list(game.usedQuestionIds), question.id]);
  game.answers = {};
  game.lastAnswer = null;
  game.roundResult = null;
  game.phase = game.mode === "minecraft-truth" ? "question" : "turn";
  game.currentUid = game.mode === "minecraft-truth" ? "" : players[(Number(game.turnIndex) || 0) % Math.max(1, players.length)] || "";
  setPhaseTimer(game, settings.questionTime);
}

function revealTruth(game, players) {
  const answers = Object.fromEntries(players.map(uid => {
    const choice = game.answers?.[uid];
    return [uid, { choice, correct: choice != null && Boolean(choice) === Boolean(game.question.answer) }];
  }));
  players.forEach(uid => { if (answers[uid].correct) game.scores[uid] = (Number(game.scores[uid]) || 0) + 1; });
  game.roundResult = { kind: "truth", correctAnswer: Boolean(game.question.answer), answers, points: Object.fromEntries(players.map(uid => [uid, answers[uid].correct ? 1 : 0])), scoreSnapshot: scoresFor(players, game.scores), explanation: game.question.explanation };
  game.phase = "reveal";
  setPhaseTimer(game, 2.6);
}

function revealTurn(game, uid, raw, correct) {
  game.lastAnswer = { uid, raw: String(raw || "Nie udzielono odpowiedzi."), correct: Boolean(correct) };
  if (correct) game.scores[uid] = (Number(game.scores[uid]) || 0) + 1;
  game.roundResult = { kind: "turn", uid, answer: String(raw || "Nie udzielono odpowiedzi."), correct: Boolean(correct), points: correct ? 1 : 0, scoreSnapshot: scoresFor(game.players, game.scores), expected: game.question.answer, explanation: game.question.explanation };
  game.phase = "reveal";
  setPhaseTimer(game, 2.3);
}

export function createMinecraftGame(modeId, players, settings = {}) {
  const listPlayers = safePlayers(players);
  const safeSettings = sanitizeMinecraftSettings(settings, modeId);
  const recentQuestionIds = unique(safeSettings.minecraftRecentQuestionIds).slice(-40);
  const game = {
    mode: modeId,
    phase: "question",
    round: 1,
    totalRounds: safeSettings.rounds,
    players: listPlayers,
    difficulty: safeSettings.difficulty,
    scores: scoresFor(listPlayers),
    answers: {},
    usedQuestionIds: recentQuestionIds,
    currentUid: "",
    turnIndex: 0,
    question: null,
    lastAnswer: null,
    roundResult: null,
    finished: false,
    phaseEndsAt: 0,
    phaseStartedAt: 0,
    phaseDurationMs: 0,
  };
  beginQuestion(game, safeSettings, listPlayers);
  return game;
}

export const MinecraftEngine = {
  reconcile(game, players) {
    return reconcilePlayers(game, players);
  },

  answer(game, uid, payload, players, settings = {}) {
    const listPlayers = reconcilePlayers(game, players);
    if (!game || game.finished) return "Gra jest już zakończona.";
    if (!listPlayers.includes(uid)) return "Nie jesteś graczem tego pokoju.";
    if (!game.phase || !["question", "turn"].includes(game.phase)) return "Ta odpowiedź jest już zamknięta.";
    if (Number(game.phaseEndsAt || 0) && now() >= Number(game.phaseEndsAt)) return "Czas na odpowiedź już minął.";
    if (game.mode === "minecraft-truth") {
      if (uid in (game.answers || {})) return "Odpowiedź jest już zapisana.";
      const choice = Number(payload?.option ?? payload);
      if (![0, 1].includes(choice)) return "Wybierz Prawdę albo Fałsz.";
      game.answers = { ...(game.answers || {}), [uid]: Boolean(choice === 0) };
      if (listPlayers.every(player => player in game.answers)) revealTruth(game, listPlayers);
      return;
    }
    if (game.currentUid !== uid) return "Teraz odpowiada inny gracz.";
    const question = game.question || {};
    let value = payload?.text ?? payload?.answer ?? payload;
    if (game.mode === "minecraft-redstone") value = Number(payload?.option ?? payload);
    if (typeof value === "string") value = value.trim().slice(0, 160);
    if (game.mode === "minecraft-redstone" && !Number.isInteger(value)) return "Wybierz jedną odpowiedź.";
    if (game.mode !== "minecraft-redstone" && !String(value || "").trim()) return "Wpisz odpowiedź.";
    const correct = game.mode === "minecraft-redstone" ? Number(value) === Number(question.answer) : matchingText(value, question.accepted);
    revealTurn(game, uid, value, correct);
  },

  timeout(game, players, settings = {}) {
    const listPlayers = reconcilePlayers(game, players);
    if (!game || game.finished || !["question", "turn"].includes(game.phase)) return;
    if (game.mode === "minecraft-truth") {
      game.answers = { ...(game.answers || {}) };
      listPlayers.forEach(uid => { if (!(uid in game.answers)) game.answers[uid] = null; });
      revealTruth(game, listPlayers);
      return;
    }
    revealTurn(game, game.currentUid, "Nie udzielono odpowiedzi na czas.", false);
  },

  nextRound(game, settings = {}, players = []) {
    const listPlayers = reconcilePlayers(game, players.length ? players : game?.players);
    if (!game || game.finished) return "Gra jest już zakończona.";
    if (game.phase !== "reveal") return "Najpierw zakończcie bieżące pytanie.";
    if (Number(game.round) >= Number(game.totalRounds || settings.rounds || 10)) {
      const result = winnerData(game);
      game.phase = "result";
      game.finished = true;
      game.phaseEndsAt = 0;
      game.result = result;
      game.winners = result.winners;
      return;
    }
    game.round = Number(game.round || 1) + 1;
    if (game.mode !== "minecraft-truth") game.turnIndex = (Number(game.turnIndex) || 0) + 1;
    beginQuestion(game, sanitizeMinecraftSettings(settings, game.mode), listPlayers);
  },
};

export function minecraftBotAnswer(game, room, bot, shouldBeCorrect = true, difficulty = "normal") {
  const question = game?.question || {};
  const seed = [...`${bot || "bot"}:${game?.round || 1}`].reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) >>> 0, 7);
  if (game?.mode === "minecraft-truth") {
    const correct = Boolean(question.answer);
    return { option: shouldBeCorrect ? (correct ? 0 : 1) : (correct ? 1 : 0) };
  }
  if (game?.mode === "minecraft-redstone") {
    const answer = Number(question.answer) || 0;
    const options = Math.max(2, list(question.options).length);
    return { option: shouldBeCorrect ? answer : (answer + 1 + (seed % Math.max(1, options - 1))) % options };
  }
  if (shouldBeCorrect) {
    const accepted = list(question.accepted);
    const index = difficulty === "expert" ? 0 : seed % Math.max(1, accepted.length);
    return { text: accepted[index] || question.answer || "gotowe" };
  }
  const misses = difficulty === "easy"
    ? ["nie pamiętam", "chyba coś innego", "nie mam pojęcia"]
    : ["musiałbym sprawdzić", "nie jestem pewien", "chyba pomyliłem recepturę"];
  return { text: misses[seed % misses.length] };
}

function imageHtml(src, alt, className = "minecraft-question-icon") {
  const fallback = item("grass_block");
  return `<img class="${className}" src="${escapeHtml(src || fallback)}" alt="${escapeHtml(alt || "Ikona Minecraft")}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${fallback}'">`;
}

function scoreStrip(game, accounts) {
  return `<div class="minecraft-score-strip">${safePlayers(game.players).map(uid => {
    const profile = accounts[uid] || { nick: "Gracz" };
    return `<div class="minecraft-score-player ${uid === game.currentUid ? "is-active" : ""}">${avatarHtml(profile, "minecraft-score-avatar", { disableIdle: true })}<span><b>${escapeHtml(profile.nick || "Gracz")}</b><small>${Number(game.scores?.[uid] || 0)} pkt</small></span></div>`;
  }).join("")}</div>`;
}

function roundRanking(game, accounts) {
  const ranking = safePlayers(game.players).map(uid => ({ uid, score: Number(game.roundResult?.scoreSnapshot?.[uid] ?? game.scores?.[uid] ?? 0) || 0 }))
    .sort((a, b) => b.score - a.score || safePlayers(game.players).indexOf(a.uid) - safePlayers(game.players).indexOf(b.uid));
  return `<div class="minecraft-round-ranking"><p class="eyebrow">RANKING PO RUNDZIE</p>${ranking.map((entry, index) => `<div class="minecraft-round-ranking-row"><span>#${index + 1}</span>${avatarHtml(accounts[entry.uid] || { nick: "Gracz" }, "minecraft-mini-avatar", { disableIdle: true })}<b>${escapeHtml(accounts[entry.uid]?.nick || "Gracz")}</b><strong>${entry.score} pkt</strong>${Number(game.roundResult?.points?.[entry.uid] || 0) > 0 ? `<em class="minecraft-earned">+${Number(game.roundResult.points[entry.uid])}</em>` : ""}</div>`).join("")}</div>`;
}

function timerMarkup(game) {
  if (!game.phaseEndsAt) return "";
  const duration = Math.max(1000, Number(game.phaseDurationMs) || 10000);
  const remaining = Math.max(0, Number(game.phaseEndsAt) - now());
  const percent = Math.max(0, Math.min(100, remaining / duration * 100));
  return `<div class="minecraft-timer ${remaining <= 3000 ? "is-urgent" : ""}" data-minecraft-timer-wrap><span class="minecraft-timer-label">⏱ <b data-minecraft-timer>${Math.ceil(remaining / 1000)}s</b></span><span class="minecraft-timer-track"><i data-minecraft-timer-bar style="width:${percent}%"></i></span></div>`;
}

function turnStatus(game, currentUser, accounts) {
  if (game.mode === "minecraft-truth") {
    const answered = Object.keys(game.answers || {}).length;
    const total = safePlayers(game.players).length;
    return `<span class="minecraft-turn-badge is-all">⚡ WSZYSCY ODPOWIADAJĄ <small>${answered}/${total}</small></span>`;
  }
  const isCurrent = game.currentUid === currentUser;
  const nick = accounts?.[game.currentUid]?.nick || "Gracz";
  return `<span class="minecraft-turn-badge ${isCurrent ? "is-mine" : ""}">${isCurrent ? "⚡ TWÓJ RUCH" : `⏳ RUCH: ${escapeHtml(nick)}`}</span>`;
}

function minecraftCommerceHtml(game, room, accounts, currentUser) {
  if (game.mode === "minecraft-truth" || game.phase !== "turn" || game.currentUid !== currentUser || !game.phaseEndsAt) return "";
  const user = accounts?.[currentUser] || {};
  const pass = gamePassById("minecraft-redstone-clock");
  const purchase = inGamePurchaseById("minecraft-time-charge");
  const passReady = hasGamePass(user, pass.id) && !game.passUses?.[currentUser]?.[pass.id];
  const balance = Number(user.money ?? user.sessionMoney ?? 0);
  const purchaseReady = room.settings?.gamePurchases !== false && !user.nickOnly && balance >= purchase.price && !game.purchaseUses?.[currentUser]?.[purchase.id];
  if (!passReady && !purchaseReady) return "";
  return `<div class="minecraft-commerce-actions"><span class="minecraft-commerce-label">⏱ Brakuje czasu?</span>${passReady ? `<button class="ghost minecraft-commerce-button" data-minecraft-boost="${pass.id}">${pass.icon} +8 s z gamepassa</button>` : ""}${purchaseReady ? `<button class="primary minecraft-commerce-button" data-minecraft-boost="${purchase.id}">${purchase.icon} +5 s · ${purchase.price.toLocaleString("pl-PL")}$</button>` : ""}</div>`;
}

function questionCard(game, currentUser, accounts) {
  const question = game.question || {};
  const meta = minecraftModeMeta[game.mode] || minecraftModeMeta["minecraft-sprint"];
  const isTruth = game.mode === "minecraft-truth";
  const isTurn = !isTruth;
  const isCurrent = game.currentUid === currentUser;
  const alreadyAnswered = currentUser in (game.answers || {});
  let prompt = question.prompt || question.statement || "Odpowiedz na pytanie.";
  if (isTruth) {
    return `<section class="minecraft-question-card minecraft-truth-card"><div class="minecraft-question-heading">${imageHtml(question.icon || item("enchanted_book"), "Książka Minecraft")}<div><p class="eyebrow">STWIERDZENIE</p><h2>${escapeHtml(question.statement || prompt)}</h2></div></div>${turnStatus(game, currentUser, accounts)}<p class="minecraft-instruction">Każdy wybiera własną odpowiedź. Po zebraniu odpowiedzi sprawdzimy fakt.</p><div class="minecraft-choice-grid"><button class="minecraft-choice minecraft-choice-true" data-minecraft-answer-option="0" ${alreadyAnswered || game.phase !== "question" ? "disabled" : ""}>✅ PRAWDA</button><button class="minecraft-choice minecraft-choice-false" data-minecraft-answer-option="1" ${alreadyAnswered || game.phase !== "question" ? "disabled" : ""}>❌ FAŁSZ</button></div>${alreadyAnswered ? '<p class="minecraft-waiting">Odpowiedź zapisana — czekamy na resztę ekipy.</p>' : ""}</section>`;
  }
  const questionImage = question.icon || minecraftModeIcons[game.mode];
  const promptLabel = game.mode === "minecraft-mob" ? "JAKI TO MOB?" : game.mode === "minecraft-biome" ? "JAKI TO BIOM?" : game.mode === "minecraft-crafting" ? "CRAFTING CHALLENGE" : game.mode === "minecraft-redstone" ? "AWARIA REDSTONE" : "MINECRAFT SPRINT";
  const answerMarkup = game.phase === "turn" && isCurrent ? game.mode === "minecraft-redstone"
    ? `<div class="minecraft-choice-grid minecraft-redstone-options">${list(question.options).map((option, index) => `<button class="minecraft-choice" data-minecraft-answer-option="${index}">${String.fromCharCode(65 + index)}. ${escapeHtml(option)}</button>`).join("")}</div>`
    : `<form class="minecraft-answer-form" data-minecraft-answer-form><input name="answer" maxlength="160" autocomplete="off" placeholder="Wpisz odpowiedź…" autofocus><button class="primary" type="submit">Sprawdź <span>↵</span></button></form>`
    : `<div class="minecraft-waiting-card">${isTurn ? `${imageHtml(minecraftModeIcons[game.mode], "Minecraft")}<span>${escapeHtml(game.currentUid ? `Teraz odpowiada ${accounts?.[game.currentUid]?.nick || "wybrany gracz"}.` : "Czekamy na odpowiedź.")}</span>` : ""}</div>`;
  const questionClass = game.mode === "minecraft-mob" ? " minecraft-mob-question" : "";
  return `<section class="minecraft-question-card${questionClass} ${isCurrent ? "is-your-turn" : ""}"><div class="minecraft-question-heading">${imageHtml(questionImage, meta.kind, game.mode === "minecraft-mob" ? "minecraft-question-icon minecraft-mob-silhouette" : "minecraft-question-icon")}<div><p class="eyebrow">${promptLabel}</p><h2>${escapeHtml(prompt)}</h2></div></div>${turnStatus(game, currentUser, accounts)}${game.mode === "minecraft-mob" ? `<p class="minecraft-hint-line">Rozpoznaj po zachowaniu, ataku i miejscu występowania.</p>` : ""}${game.mode === "minecraft-biome" ? `<p class="minecraft-hint-line">Klimat, roślinność i bloki zdradzają wszystko.</p>` : ""}${answerMarkup}</section>`;
}

function revealCard(game, accounts) {
  const result = game.roundResult || {};
  if (result.kind === "truth") {
    return `<section class="minecraft-reveal-card is-truth"><p class="eyebrow">UJAWNIENIE FAKTU</p><strong class="minecraft-big-reveal">${result.correctAnswer ? "✅ PRAWDA" : "❌ FAŁSZ"}</strong><p class="minecraft-explanation">${escapeHtml(result.explanation || "Sprawdzone w grze.")}</p><div class="minecraft-round-answers">${safePlayers(game.players).map(uid => `<span>${avatarHtml(accounts[uid] || { nick: "Gracz" }, "minecraft-mini-avatar", { disableIdle: true })}<b>${escapeHtml(accounts[uid]?.nick || "Gracz")}</b><small>${result.answers?.[uid]?.correct ? "+1 pkt" : "nie trafił"}</small></span>`).join("")}</div>${roundRanking(game, accounts)}</section>`;
  }
  const answerOwner = accounts[result.uid] || { nick: "Gracz" };
  const expected = result.expected || game.question?.answer || "—";
  return `<section class="minecraft-reveal-card ${result.correct ? "is-correct" : "is-wrong"}"><p class="eyebrow">ODPOWIEDŹ ${result.correct ? "TRAFIONA" : "NIE TRAFIŁA"}</p>${game.mode === "minecraft-mob" ? imageHtml(game.question?.icon, "Rozwiązany mob", "minecraft-reveal-icon") : ""}<div class="minecraft-reveal-owner">${avatarHtml(answerOwner, "minecraft-reveal-avatar", { disableIdle: true })}<b>${escapeHtml(answerOwner.nick || "Gracz")}</b></div><strong class="minecraft-answer-reveal">${result.correct ? "✅" : "❌"} ${escapeHtml(result.answer || "Brak odpowiedzi")}</strong><p class="minecraft-expected">Poprawna odpowiedź: <b>${escapeHtml(expected)}</b></p>${result.explanation ? `<p class="minecraft-explanation">${escapeHtml(result.explanation)}</p>` : ""}${roundRanking(game, accounts)}</section>`;
}

function finalResults(game, accounts, room, currentUser) {
  const result = game.result || winnerData(game);
  const isHost = room?.hostUid === currentUser;
  return `<section class="minecraft-final-card"><div class="minecraft-final-icon">🏆</div><p class="eyebrow">MINECRAFT · KONIEC GRY</p><h2>${result.winners?.length > 1 ? "REMIS!" : "ZWYCIĘZCA"}</h2><p class="minecraft-final-winner">${result.winners?.map(uid => escapeHtml(accounts[uid]?.nick || "Gracz")).join(" · ") || "Ekipa"}</p><div class="minecraft-leaderboard">${list(result.ranking).map((entry, index) => `<div class="minecraft-leaderboard-row"><span>#${index + 1}</span>${avatarHtml(accounts[entry.uid] || { nick: "Gracz" }, "minecraft-mini-avatar", { disableIdle: true })}<b>${escapeHtml(accounts[entry.uid]?.nick || "Gracz")}</b><strong>${entry.score} pkt</strong></div>`).join("")}</div><p class="muted">Wynik zapisany. Możecie od razu powtórzyć ten tryb albo wrócić do lobby.</p><div class="minecraft-result-actions"><button class="primary" id="minecraft-play-again" ${isHost ? "" : "disabled"}>🔄 Zagraj ponownie</button><button class="ghost" id="minecraft-exit">Wyjdź z pokoju</button></div>${isHost ? "" : '<small class="minecraft-result-note">Tylko host uruchamia kolejną grę.</small>'}</section>`;
}

export function renderMinecraftGame(root, { room, accounts, currentUser }, actions) {
  stopMinecraftTimer();
  const game = room.game;
  const meta = minecraftModeMeta[game.mode || room.gameMode] || minecraftModeMeta["minecraft-sprint"];
  if (game.phase === "result" || game.finished) {
    root.innerHTML = `<main class="page minecraft-game-page minecraft-result-page enter"><section class="panel minecraft-shell">${finalResults(game, accounts, room, currentUser)}</section></main>`;
    root.querySelector("#minecraft-play-again")?.addEventListener("click", () => actions.minecraftPlayAgain());
    root.querySelector("#minecraft-exit")?.addEventListener("click", () => actions.leaveRoom("platform"));
    return;
  }
  const expected = { phase: game.phase, phaseEndsAt: game.phaseEndsAt };
  const isReveal = game.phase === "reveal";
  const difficulty = difficultyLabel[room.settings?.difficulty || game.difficulty] || difficultyLabel.medium;
  root.innerHTML = `<main class="page minecraft-game-page enter"><section class="panel minecraft-shell"><header class="minecraft-game-head"><div><p class="eyebrow"><img src="${minecraftModeIcons[game.mode] || item("grass_block")}" alt="" class="minecraft-inline-icon"> ${escapeHtml(meta.name)} · RUNDA ${game.round}/${game.totalRounds}</p><h1>${escapeHtml(meta.kind)}</h1><div class="minecraft-head-meta"><span class="minecraft-difficulty-chip">${escapeHtml(difficulty)}</span><span class="minecraft-head-caption">${game.mode === "minecraft-truth" ? "Odpowiada cała ekipa" : "Jedna odpowiedź · jedna szansa"}</span></div></div>${timerMarkup(game)}</header>${scoreStrip(game, accounts)}${isReveal ? revealCard(game, accounts) : questionCard(game, currentUser, accounts)}${minecraftCommerceHtml(game, room, accounts, currentUser)}${isReveal ? `<div class="minecraft-next-wrap"><button class="primary" id="minecraft-next" ${room.hostUid === currentUser ? "" : "disabled"}>${Number(game.round) >= Number(game.totalRounds) ? "Pokaż wyniki" : "Następne pytanie"}</button><small>${room.hostUid === currentUser ? "Host może przejść dalej wcześniej." : "Czekamy, aż host przejdzie dalej."}</small></div>` : ""}</section></main>`;
  root.querySelectorAll("[data-minecraft-answer-option]").forEach(button => button.addEventListener("click", () => { root.querySelectorAll("[data-minecraft-answer-option]").forEach(control => { control.disabled = true; }); actions.minecraftAnswer({ option: Number(button.dataset.minecraftAnswerOption) }, expected); }));
  root.querySelector("[data-minecraft-answer-form]")?.addEventListener("submit", event => { event.preventDefault(); const input = event.currentTarget.elements.answer; const submit = event.currentTarget.querySelector("button[type=submit]"); if (!input.value.trim() || submit?.disabled) return; input.disabled = true; if (submit) submit.disabled = true; actions.minecraftAnswer({ text: input.value }, expected); });
  root.querySelectorAll("[data-minecraft-boost]").forEach(button => button.addEventListener("click", () => { if (button.disabled || button.dataset.minecraftPending) return; button.dataset.minecraftPending = "1"; button.disabled = true; button.classList.add("is-pending"); actions.minecraftUseTimeBoost(button.dataset.minecraftBoost); }));
  root.querySelector("#minecraft-next")?.addEventListener("click", () => actions.minecraftNext());
  if (game.phaseEndsAt) {
    const tick = () => { const remaining = Math.max(0, Number(game.phaseEndsAt) - now()); const node = root.querySelector("[data-minecraft-timer]"); const bar = root.querySelector("[data-minecraft-timer-bar]"); const wrap = root.querySelector("[data-minecraft-timer-wrap]"); const duration = Math.max(1000, Number(game.phaseDurationMs) || 10000); if (node) node.textContent = `${Math.ceil(remaining / 1000)}s`; if (bar) bar.style.width = `${Math.max(0, Math.min(100, remaining / duration * 100))}%`; if (wrap) wrap.classList.toggle("is-urgent", remaining <= 3000); };
    minecraftTimerInterval = window.setInterval(tick, 250);
    minecraftTimer = window.setTimeout(() => {
      if (game.phase === "reveal") { if (currentUser === room.hostUid) actions.minecraftNext(); }
      else actions.minecraftTimeout(expected);
    }, Math.max(100, Number(game.phaseEndsAt) - now() + 50));
    tick();
  }
}

let minecraftTimer = 0;
let minecraftTimerInterval = 0;
export function stopMinecraftTimer() { window.clearTimeout(minecraftTimer); window.clearInterval(minecraftTimerInterval); minecraftTimer = 0; minecraftTimerInterval = 0; }

export function renderMinecraftLobbySettings(room, isHost) {
  const modeId = room.gameMode;
  const settings = sanitizeMinecraftSettings(room.settings, modeId);
  return `<div class="minecraft-lobby-settings"><div class="minecraft-settings-heading"><img src="${minecraftModeIcons[modeId] || item("grass_block")}" alt="" class="minecraft-settings-icon"><div><p class="eyebrow">MINECRAFT</p><b>${escapeHtml(minecraftModeMeta[modeId]?.name || "Minecraft")}</b><small>Realne ikony, pytania i receptury z gry.</small></div></div><label class="setting-row"><span>Poziom pytań</span><select data-minecraft-setting="difficulty" ${isHost ? "" : "disabled"}>${Object.entries(difficultyLabel).map(([value, label]) => `<option value="${value}" ${settings.difficulty === value ? "selected" : ""}>${label}</option>`).join("")}</select></label><label class="setting-row"><span>Liczba rund</span><select data-minecraft-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 8, 10, 15, 20].map(value => `<option value="${value}" ${settings.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na odpowiedź</span><select data-minecraft-setting="questionTime" ${isHost ? "" : "disabled"}>${[5, 8, 10, 12, 15, 20, 30].map(value => `<option value="${value}" ${settings.questionTime === value ? "selected" : ""}>${value} sek.</option>`).join("")}</select></label><p class="tiny">W trybach pytaniowych kolejka przechodzi po jednej odpowiedzi. W „Minecraft czy kłamstwo?” wszyscy odpowiadają jednocześnie.</p></div>`;
}
