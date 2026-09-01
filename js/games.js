import { renderGame } from "./game.js?v=20260902-1";
import { impostorDefaults, renderImpostorGameStable as renderImpostorGame } from "./impostor.js?v=20260831-4";
import { identityDefaults, renderIdentityGame } from "./identity.js?v=20260831-4";
import { otherQuestionDefaults, renderOtherQuestionGame } from "./otherQuestion.js?v=20260605-4";
import { renderWouldYouRather } from "./wouldYouRather.js?v=20260902-2";
import { mostLikelyDefaults, renderMostLikelyGame } from "./mostLikely.js?v=20260612-1";
import { friendshipDefaults, renderFriendshipTestGame } from "./friendshipTest.js?v=20260605-1";
import { poisonCandyDefaults, renderPoisonCandyGame } from "./poisonCandy.js?v=20260831-12";
import { bombDefaults, renderBombGame } from "./bomb.js?v=20260621-1";
import { closestTruthDefaults, renderClosestTruthGame } from "./closestTruth.js?v=20260612-3";
import { rankingDefaults, renderRankingGame } from "./ranking.js?v=20260824-2";
import { fiveSecondsDefaults, renderFiveSecondsGame } from "./fiveSeconds.js?v=20260824-1";
import { clockDefaults, renderClockGame } from "./clock.js?v=20260831-3";
import { pokemonDefaults, renderPokemonGame } from "./pokemon.js?v=20260831-11";
import { wavelengthDefaults, renderWavelengthGame } from "./wavelength.js?v=20260831-5";
import { quizDefaults, renderQuizGame } from "./quiz.js?v=20260823-5";
import { mathematicsDefaults, renderMathematicsGame } from "./mathematics.js?v=20260805-1";
import { markerDefaults, renderMarkerGame } from "./marker.js?v=20260823-1";
import { sequenceDefaults, renderSequenceGame } from "./sequence.js?v=20260813-2";
import { familyDefaults, renderFamilyGame } from "./family.js?v=20260822-2";
import { wordChainDefaults, renderWordChainGame } from "./wordChain.js?v=20260822-2";
import { numberMysteryDefaults, renderNumberMysteryGame } from "./numberMystery.js?v=20260831-4";
import { uniqueAnswerDefaults, renderUniqueAnswerGame } from "./uniqueAnswer.js?v=20260823-5";
import { connectDefaults, renderConnectGame } from "./connect.js?v=20260831-4";
import { liarDefaults, renderLiarGame } from "./liar.js?v=20260831-4";
import { falseMessageDefaults, renderFalseMessageGame } from "./falseMessage.js?v=20260831-4";
import { secretRuleDefaults, renderSecretRuleGame } from "./secretRule.js?v=20260831-5";
import { musicDuelDefaults, musicArenaDefaults, renderMusicDuelGame, renderMusicArenaGame } from "./music.js?v=20260901-7";
import { popularityDefaults, renderPopularityGame, renderPopularitySolo } from "./popularity.js?v=20260902-4";
import { boardModeDefaults, renderBoardGame } from "./boardGames.js?v=20260901-10";
import { minecraftDefaults, renderMinecraftGame } from "./minecraft.js?v=20260901-8";

export const gamesRegistry = {
  udowodnij: {
    id: "udowodnij",
    name: "Udowodnij!",
    description: "Licytuj liczbę odpowiedzi, podbijaj stawkę i sprawdzaj, kto tylko blefuje.",
    help: ["Gracz deklaruje, ile poprawnych odpowiedzi poda na temat.", "Kolejni gracze podbijają wynik albo sprawdzają deklarację.", "Sprawdzany gracz wpisuje odpowiedzi przed końcem czasu.", "Da radę - wygrywa rundę. Nie da rady - przegrywa rundę."],
    allowReports: true,
    players: "2-8 osób",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "⚡",
    art: "prove",
    featured: true,
    render: renderGame,
    defaultSettings: { answerTime: 30, rounds: 5 },
  },
  impostor: {
    id: "impostor",
    name: "Impostor",
    description: "Jedna osoba nie zna sekretnego hasła. Rozmawiajcie i znajdźcie impostora.",
    help: ["Większość graczy dostaje to samo słowo, impostor inne albo gorszą podpowiedź.", "Po kolei piszecie wskazówki tak, żeby nie zdradzić słowa zbyt łatwo.", "Po rundach głosujecie, kto jest impostorem.", "Obywatele wygrywają, gdy wyrzucą impostora. Impostor wygrywa, gdy się ukryje."],
    allowReports: true,
    players: "3-8 osób",
    minPlayers: 3,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "🕵️",
    art: "impostor",
    audience: "everyone",
    badges: ["popular", "tiktok"],
    render: renderImpostorGame,
    defaultSettings: impostorDefaults,
  },
  "kim-jestem": {
    id: "kim-jestem",
    name: "Kim jestem?",
    description: "Odgadnij swoją postać, zadając znajomym pytania, na które odpowiedzą tak lub nie.",
    help: ["Każdy widzi hasła innych graczy, ale nie swoje.", "W swojej turze zadajesz pytanie albo próbujesz zgadnąć, kim jesteś.", "Reszta odpowiada zgodnie z ustawieniami pokoju.", "Gra kończy się po rundach albo gdy gracze zdobędą wymagane trafienia."],
    allowReports: true,
    players: "2-8 osób",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "❓",
    art: "identity",
    audience: "everyone",
    badges: ["popular", "newQuestions"],
    render: renderIdentityGame,
    defaultSettings: identityDefaults,
  },
  "inne-pytanie": {
    id: "inne-pytanie",
    name: "Inne pytanie",
    description: "Odpowiedz tak, żeby pasować do grupy, ale uważaj: ktoś dostał zupełnie inne pytanie.",
    help: ["Prawie wszyscy dostają jedno pytanie, jedna osoba inne.", "Każdy pisze odpowiedź tak, żeby brzmiała naturalnie.", "Czytacie odpowiedzi i głosujecie, kto miał inne pytanie.", "Grupa wygrywa, gdy złapie tę osobę. Osoba z innym pytaniem wygrywa, gdy się ukryje."],
    allowReports: true,
    players: "3-8 osób",
    minPlayers: 3,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "🤔",
    art: "question",
    audience: "everyone",
    render: renderOtherQuestionGame,
    defaultSettings: otherQuestionDefaults,
  },
  "co-wolisz": {
    id: "co-wolisz",
    name: "Co wolisz?",
    description: "Wybieraj jedną z dwóch opcji i porównuj swoje odpowiedzi z innymi graczami.",
    adult: false,
    help: ["Dostajesz pytanie z dwiema opcjami.", "Wybierasz jedną odpowiedź.", "Od razu widzisz wynik głosowania.", "To tryb solo, bez pokoju."],
    players: "Tryb solo",
    minPlayers: 1,
    maxPlayers: 12,
    supportsLobby: false,
    supportsSolo: true,
    symbol: "⚖️",
    art: "choice",
    render: renderWouldYouRather,
    defaultSettings: {},
  },
  "kto-najpredzej": {
    id: "kto-najpredzej",
    name: "Kto najprędzej...?",
    description: "Głosujcie, kto z was najpewniej zrobi daną rzecz. Wyniki potrafią zaskoczyć.",
    adultBySettings: true,
    help: ["Pojawia się pytanie typu: kto najprędzej coś zrobi.", "Każdy głosuje na jednego gracza.", "Po rundzie widzicie wyniki i punkty.", "Tryb najlepiej działa w ekipie, która się zna."],
    allowReports: false,
    players: "2-8 osób",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "☝",
    art: "vote",
    audience: "crew",
    render: renderMostLikelyGame,
    defaultSettings: mostLikelyDefaults,
  },
  "test-znajomosci": {
    id: "test-znajomosci",
    name: "Test znajomości",
    description: "Sprawdźcie, kto naprawdę zna ekipę najlepiej. Każda odpowiedź ma znaczenie.",
    help: ["Gracze odpowiadają na pytania o sobie.", "Potem reszta zgaduje, kto dał którą odpowiedź.", "Za trafienia wpadają punkty.", "Tryb wymaga znajomości graczy, więc najlepiej grać ze swoją ekipą."],
    allowReports: false,
    players: "3-8 osób",
    minPlayers: 3,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "❤️",
    art: "friends",
    audience: "crew",
    render: renderFriendshipTestGame,
    defaultSettings: friendshipDefaults,
  },
  "zatruty-cukierek": {
    id: "zatruty-cukierek",
    name: "Zatruty cukierek!",
    description: "Zatruj swoje cukierki po cichu, a potem jedzcie po kolei, az przy stole zostanie jedna osoba.",
    help: ["Każdy po cichu wybiera cukierki, które zatruwa.", "Potem gracze po kolei jedzą po jednym cukierku ze stołu.", "Nie możesz zjeść własnego zatrutego cukierka.", "Kto trafi na cudzy zatruty cukierek, odpada. Wygrywa ostatni żywy gracz."],
    allowReports: true,
    players: "2-8 osob",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "🍬",
    art: "candy",
    audience: "everyone",
    badges: ["tiktok"],
    render: renderPoisonCandyGame,
    defaultSettings: poisonCandyDefaults,
  },
  bomba: {
    id: "bomba",
    name: "Bomba",
    description: "Podawajcie odpowiedzi po kolei, zanim ukryty timer wysadzi bombe na stole.",
    help: ["Host wybiera rundy, punkty, czas odpowiedzi i minimum trzy kategorie.", "Gra losuje kategorie, a gracze po kolei wpisuja odpowiedzi.", "Nie wolno powtarzac odpowiedzi ani oddawac pustej tury.", "Po wybuchu gracz z bomba przegrywa runde, a pozostali dostaja punkty."],
    allowReports: true,
    players: "2-8 osob",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "💣",
    art: "bomb",
    audience: "crew",
    badges: [],
    render: renderBombGame,
    defaultSettings: bombDefaults,
  },
  "najblizej-prawdy": {
    id: "najblizej-prawdy",
    name: "Najbliżej prawdy",
    description: "Strzelajcie liczby i sprawdzajcie, kto byl najblizej prawdziwej odpowiedzi.",
    help: ["Gra pokazuje pytanie liczbowe z wybranej kategorii.", "Kazdy wpisuje jedna liczbe, bez podgladania odpowiedzi innych.", "Po komplecie odpowiedzi widzicie prawidlowa liczbe, roznice i ranking rundy.", "Najblizsza odpowiedz dostaje najwiecej punktow, kolejne miejsca mniej."],
    allowReports: true,
    players: "2-8 osob",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "🎯",
    art: "truth",
    audience: "everyone",
    badges: [],
    render: renderClosestTruthGame,
    defaultSettings: closestTruthDefaults,
  },
  ranking: {
    id: "ranking",
    name: "Ranking",
    description: "Ukladajcie listy po swojemu i sprawdzajcie, kto mysli najbardziej jak grupa.",
    help: ["Kazdy dostaje te sama liste elementow.", "Przeciagacie elementy, ukladajac ranking od najlepszego do najslabszego.", "Po rundzie gra tworzy ranking grupowy ze srednich pozycji.", "Im bardziej twoja lista pasuje do grupowej, tym wiecej punktow dostajesz."],
    allowReports: true,
    players: "3-8 osob",
    minPlayers: 3,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "🏆",
    art: "ranking",
    audience: "crew",
    badges: [],
    render: renderRankingGame,
    defaultSettings: rankingDefaults,
  },
  "5-sekund": {
    id: "5-sekund",
    name: "5 sekund",
    description: "Masz kilka sekund, zeby wymienic trzy rzeczy z podanej kategorii.",
    help: ["Gra pokazuje zadanie typu: wymien 3 zwierzeta.", "Aktywny gracz ma 5, 10 albo 15 sekund na wpisanie odpowiedzi.", "Po czasie odpowiedz blokuje sie i tura przechodzi dalej.", "Pelna odpowiedz daje 3 punkty, czesciowa mniej."],
    allowReports: true,
    players: "2-8 osob",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "⏱️",
    art: "five",
    audience: "everyone",
    badges: [],
    render: renderFiveSecondsGame,
    defaultSettings: fiveSecondsDefaults,
  },
  zegar: {
    id: "zegar",
    name: "Zegar",
    description: "Wyczuj czas bez patrzenia na licznik i zatrzymaj zegar najblizej celu.",
    help: ["Gra losuje czas od 3 do 15 sekund.", "Kazdy widzi swoj stylowy zegar, ale nie widzi aktualnego czasu.", "Gdy czujesz, ze cel minal, naciskasz STOP.", "Po komplecie stopow widzicie wspolna os czasu i roznice od wyniku."],
    allowReports: true,
    players: "1-8 osob",
    minPlayers: 1,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: true,
    symbol: "⌚",
    art: "clock",
    audience: "everyone",
    badges: ["tiktok"],
    render: renderClockGame,
    defaultSettings: clockDefaults,
  },
  "pokemon-dex": {
    id: "pokemon-dex", name: "Najbliższy numer Pokédex", description: "Wpisz Pokémona z numerem jak najbliższym wylosowanemu celowi.", help: ["Gra losuje numer National Dex.", "Wpisz nazwę Pokémona, bez podawania numeru.", "Najmniejsza różnica wygrywa rundę."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"#", art:"pokemon-dex", audience:"pokemon", badges:["new"], render:renderPokemonGame, defaultSettings:pokemonDefaults["pokemon-dex"],
  },
  "pokemon-last-letter": {
    id: "pokemon-last-letter", name: "Ostatnia litera", description: "Budujcie łańcuch Pokémonów, pilnując ostatniej litery.", help: ["Pierwszy gracz podaje dowolnego Pokémona.", "Następny musi zacząć od ostatniej litery poprzedniej nazwy.", "Powtórki są niedozwolone."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"↗", art:"pokemon-letter", audience:"pokemon", badges:["new"], render:renderPokemonGame, defaultSettings:pokemonDefaults["pokemon-last-letter"],
  },
  "pokemon-evolution": {
    id: "pokemon-evolution", name: "Evolution Race", description: "Znajdź kolejną lub końcową ewolucję szybciej od innych.", help: ["Gra pokazuje bazowego Pokémona.", "Wpisz nazwę Pokémona z tej samej linii ewolucji.", "Każda odpowiedź ma limit czasu."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"↻", art:"pokemon-evolution", audience:"pokemon", badges:["new"], render:renderPokemonGame, defaultSettings:pokemonDefaults["pokemon-evolution"],
  },
  "pokemon-auction": {
    id: "pokemon-auction", name: "Licytacja teamu", description: "Licytuj Pokémony i zbuduj drużynę z najwyższym BST.", help: ["Każdy gracz dostaje ten sam budżet.", "Pokémony są wystawiane po kolei, a każda oferta ma limit czasu.", "BST zostaje ujawnione dopiero po zakończeniu aukcji."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"$", art:"pokemon-auction", audience:"pokemon", badges:["new"], render:renderPokemonGame, defaultSettings:pokemonDefaults["pokemon-auction"],
  },
  "pokemon-types": {
    id: "pokemon-types", name: "Typy na start", description: "Wybierzcie typy i znajdźcie Pokémona pasującego do kombinacji.", help: ["Każdy gracz wybiera jeden typ.", "Po ujawnieniu kombinacji wpisujecie poprawnego Pokémona.", "Brakująca kombinacja odblokowuje ponowny wybór."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"✦", art:"pokemon-types", audience:"pokemon", badges:["new"], render:renderPokemonGame, defaultSettings:pokemonDefaults["pokemon-types"],
  },
  "pokemon-match-type": {
    id: "pokemon-match-type", name: "Dopasuj typ", description: "Rozpoznaj wszystkie typy pokazanego Pokémona szybciej od innych.", help: ["Wszyscy widzą tego samego Pokémona.", "Zaznacz wszystkie jego typy.", "Błędna odpowiedź zabiera serce."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"◈", art:"pokemon-types", audience:"pokemon", badges:["new"], render:renderPokemonGame, defaultSettings:pokemonDefaults["pokemon-match-type"],
  },
  wavelength: {
    id: "wavelength", name: "Wavelength", description: "Naprowadź ekipę na ukryty punkt między dwoma przeciwieństwami.", help: ["Opisujący widzi ukryty cel i podaje jedno słowo lub krótkie zdanie.", "Pozostali wspólnie ustawiają wskaźnik na skali.", "Host zatwierdza ustawienie, a wynik zależy od odległości od celu."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"◌", art:"wavelength", audience:"everyone", badges:["new"], render:renderWavelengthGame, defaultSettings:wavelengthDefaults,
  },
  "number-mystery": {
    id: "number-mystery", name: "Tajemnicza liczba", description: "Zadawaj nieoczywiste pytania i spróbuj odgadnąć swój ukryty numer.", help: ["Każdy gracz dostaje losowy numer od 1 do 150 i widzi numer przeciwnika, ale nie swój.", "Pytania są pośrednie — nie wpisuj w nich liczb ani ich nazw.", "Wybierz własne pytania, gotową bazę albo oba sposoby naraz.", "Możesz wygrać od razu po trafieniu albo po ustalonej liczbie rund."], allowReports:true, players:"2 osoby", minPlayers:2, maxPlayers:2, supportsLobby:true, supportsSolo:false, symbol:"🔢", art:"number-mystery", audience:"everyone", badges:["new", "tiktok"], render:renderNumberMysteryGame, defaultSettings:numberMysteryDefaults,
  },
  "unique-answer": {
    id: "unique-answer", name: "Bez powtórek", description: "Odpowiedz na wspólne pytanie tak, żeby nikt nie podał tego samego.", help: ["Wszyscy dostają jedno pytanie i wpisują po jednej odpowiedzi.", "Każda powtórzona odpowiedź zabiera życie wszystkim, którzy jej użyli.", "Po utracie wszystkich żyć gracz odpada, a ostatnia osoba w grze wygrywa.", "Przy 5–8 graczach host może sam wymyślać pytania."], allowReports:true, players:"3-8 osób", minPlayers:3, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"🧩", art:"unique-answer", audience:"everyone", badges:["tiktok"], render:renderUniqueAnswerGame, defaultSettings:uniqueAnswerDefaults,
  },
  "polacz-nas": {
    id: "polacz-nas", name: "Połącz nas", description: "Dwie zupełnie różne rzeczy. Wymyśl najlepsze połączenie między nimi i przekonaj resztę.", help: ["W każdej rundzie dostajecie dwie pozornie niezwiązane rzeczy.", "Każdy gracz pisze własne logiczne albo zabawne wyjaśnienie.", "Potem anonimowo głosujecie na najlepszą odpowiedź — nie można głosować na siebie.", "Po ostatniej rundzie wygrywa osoba z największą liczbą punktów."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"🔗", art:"connect", audience:"everyone", badges:["new"], render:renderConnectGame, defaultSettings:connectDefaults,
  },
  klamca: {
    id: "klamca", name: "Kłamca", description: "Wszyscy odpowiadają na to samo pytanie, ale jedna osoba musi skłamać. Znajdźcie kłamcę.", help: ["Wszyscy dostają to samo pytanie o opinię albo doświadczenie.", "Jedna osoba widzi tajną instrukcję i musi odpowiedzieć kłamstwem.", "Po odpowiedziach czytacie wypowiedzi i głosujecie, kto jest Kłamcą.", "Trafiony gracz daje głosującym punkt, a niewykryty Kłamca dostaje 2 punkty."], allowReports: true, players: "3-8 osób", minPlayers: 3, maxPlayers: 8, supportsLobby: true, supportsSolo: false, symbol: "🎭", art: "impostor", audience: "everyone", badges: ["new", "tiktok"], render: renderLiarGame, defaultSettings: liarDefaults,
  },
  "falszywa-wiadomosc": {
    id: "falszywa-wiadomosc", name: "Fałszywa wiadomość", description: "Co napisałby twój znajomy w absurdalnej sytuacji? Podszyj się pod niego i daj się nabrać.", help: ["W każdej rundzie jeden gracz zostaje bohaterem sytuacji.", "Pozostali piszą anonimowe wiadomości, które bohater może wysłać.", "Bohater wybiera wiadomość najbardziej pasującą do niego, a jej autor zdobywa punkt.", "Każdy dostaje swoją rundę bohatera, a na końcu wygrywa najlepszy autor wiadomości."], allowReports: true, players: "3-8 osób", minPlayers: 3, maxPlayers: 8, supportsLobby: true, supportsSolo: false, symbol: "📱", art: "chat", audience: "everyone", badges: ["new", "tiktok"], render: renderFalseMessageGame, defaultSettings: falseMessageDefaults,
  },
  quiz: {
    id: "quiz", name: "Quiz", description: "Sprawdźcie wiedzę w trybie Casual albo zmierzcie się w teleturniejowej rywalizacji.", help: ["Najpierw wybierzcie wariant Casual albo Rywalizacja.", "Casual pozwala hostowi ustawić liczbę i czas pytań.", "Rywalizacja dobiera graczy do szybkiego meczu 2–4 osób."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"?", art:"quiz", audience:"everyone", badges:["new"], render:renderQuizGame, defaultSettings:quizDefaults,
  },
  mathematics: {
    id: "mathematics", name: "Matematyka", description: "Rozwiązujcie proceduralnie generowane zadania i ścigajcie się o poprawne odpowiedzi.", help: ["Host wybiera liczbę pytań, czas, sposób odpowiedzi i typy zadań.", "Pytania rosną z poziomem trudności wraz z numerem pytania.", "Pierwsza poprawna odpowiedź daje punkt."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"∑", art:"mathematics", audience:"everyone", badges:["new"], render:renderMathematicsGame, defaultSettings:mathematicsDefaults,
  },
  marker: {
    id: "marker", name: "Marker", description: "Znajdź liczby na wspólnej planszy i zakreśl je szybciej od przeciwnika.", help: ["Wybierz liczbę na wspólnej planszy.", "Przeciwnik szuka liczby, a Ty pokrywasz własne pole markerem.", "System sprawdza faktyczne pokrycie pola, więc samo kliknięcie nie wystarczy."], allowReports:true, players:"2 osoby", minPlayers:2, maxPlayers:2, supportsLobby:true, supportsSolo:false, symbol:"✎", art:"marker", audience:"everyone", badges:["new"], render:renderMarkerGame, defaultSettings:markerDefaults,
  },
  sequence: {
    id: "sequence", name: "Zgadnij sekwencję", description: "Twórzcie tajne sekwencje kolorów i łamcie kod przeciwnika.", help: ["Każdy gracz tworzy własną sekwencję dla przeciwnika.", "Po każdej próbie widzicie tylko liczbę kolorów na poprawnym miejscu.", "Nie pokazujemy, które pozycje są prawidłowe."], allowReports:true, players:"2 osoby", minPlayers:2, maxPlayers:2, supportsLobby:true, supportsSolo:false, symbol:"◎", art:"sequence", audience:"everyone", badges:["new"], render:renderSequenceGame, defaultSettings:sequenceDefaults,
  },
  family: {
    id: "family", name: "Familiada", description: "Odgadujcie najpopularniejsze odpowiedzi i zdobywajcie punkty z tablicy.", help: ["Gra losuje pytanie i odpowiedzi z ukrytej tablicy.", "Po każdej odpowiedzi pokazujemy tylko miejsce i wartość trafienia.", "Host wybiera sposób zmiany gracza oraz liczbę rund."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"★", art:"family", audience:"everyone", badges:["new"], render:renderFamilyGame, defaultSettings:familyDefaults,
  },
  "word-chain": {
    id: "word-chain", name: "Łańcuch słów", description: "Budujcie łańcuch słów, pilnując ostatniej litery.", help: ["Pierwsze słowo jest losowane z dużego słownika.", "Każde kolejne słowo zaczyna się ostatnią literą poprzedniego.", "Host może włączyć język angielski oraz kontrolowane powtórki."], allowReports:true, players:"2-8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"↔", art:"word-chain", audience:"everyone", badges:["new"], render:renderWordChainGame, defaultSettings:wordChainDefaults,
  },
  "tajna-zasada": {
    id: "tajna-zasada", name: "Tajna zasada", description: "Podawaj przykłady, odkrywaj wzór i odgadnij tajną zasadę przeciwnika jako pierwszy.", help: ["Obaj gracze widzą wspólną kategorię, ale każdy zapisuje własną tajną zasadę.", "Na zmianę podawajcie przykłady i zatwierdzajcie ręcznie, czy pasują do Waszej zasady.", "Możesz zgadywać zasadę według ustawionego harmonogramu albo wtedy, gdy jesteś gotowy.", "Wygrywa osoba, której zgadywanie zostanie zaakceptowane."], allowReports: true, players: "2 osoby", minPlayers: 2, maxPlayers: 2, supportsLobby: true, supportsSolo: false, symbol: "🧠", art: "secret-rule", audience: "everyone", badges: ["new", "tiktok"], render: renderSecretRuleGame, defaultSettings: secretRuleDefaults,
  },
  "minecraft-sprint": {
    id: "minecraft-sprint", name: "Minecraft Sprint", description: "Szybkie pytania o Minecrafta. Odpowiadaj pierwszy, zanim czas zniknie.", help: ["W każdej rundzie jeden gracz dostaje pytanie o Minecrafta.", "Pytania rosną od prostych mechanik do zaawansowanych szczegółów.", "Poprawna odpowiedź daje punkt, a po krótkim ujawnieniu kolej przechodzi dalej."], allowReports: true, players: "1–8 osób", minPlayers: 1, maxPlayers: 8, supportsLobby: true, supportsSolo: true, symbol: "⛏️", art: "minecraft-sprint", audience: "minecraft", badges: ["new"], render: renderMinecraftGame, defaultSettings: minecraftDefaults["minecraft-sprint"],
  },
  "minecraft-crafting": {
    id: "minecraft-crafting", name: "Crafting Rush", description: "Rozpoznaj recepturę albo składniki szybciej niż reszta ekipy.", help: ["Gra pokazuje przedmiot i pytanie o jego recepturę albo składniki.", "Wpisujesz krótką odpowiedź, a system akceptuje również popularne polskie i angielskie nazwy.", "Każdy poprawny crafting daje punkt."], allowReports: true, players: "1–8 osób", minPlayers: 1, maxPlayers: 8, supportsLobby: true, supportsSolo: true, symbol: "🛠️", art: "minecraft-crafting", audience: "minecraft", badges: ["new"], render: renderMinecraftGame, defaultSettings: minecraftDefaults["minecraft-crafting"],
  },
  "minecraft-mob": {
    id: "minecraft-mob", name: "Zgadnij Moba", description: "Poznaj moba po zachowaniu, ataku i miejscu występowania.", help: ["Dostajesz prawdziwą teksturę moba oraz opis jego zachowania.", "Wpisz nazwę po polsku albo angielsku — działają najczęstsze warianty.", "Trudniejsze poziomy sięgają Netheru, Endu i najnowszych mobów."], allowReports: true, players: "1–8 osób", minPlayers: 1, maxPlayers: 8, supportsLobby: true, supportsSolo: true, symbol: "👾", art: "minecraft-mob", audience: "minecraft", badges: ["new"], render: renderMinecraftGame, defaultSettings: minecraftDefaults["minecraft-mob"],
  },
  "minecraft-biome": {
    id: "minecraft-biome", name: "Jaki to biom?", description: "Odczytaj klimat, roślinność i bloki — zgadnij biom Minecrafta.", help: ["Opis i ikona bloku prowadzą cię od Overworldu do Netheru i Endu.", "Akceptowane są polskie nazwy oraz angielskie nazwy biomów.", "Ekspert dorzuca rzadsze biomy, takie jak Deep Dark i Dripstone Caves."], allowReports: true, players: "1–8 osób", minPlayers: 1, maxPlayers: 8, supportsLobby: true, supportsSolo: true, symbol: "🌍", art: "minecraft-biome", audience: "minecraft", badges: ["new"], render: renderMinecraftGame, defaultSettings: minecraftDefaults["minecraft-biome"],
  },
  "minecraft-truth": {
    id: "minecraft-truth", name: "Minecraft czy kłamstwo?", description: "Oceń minecraftowe ciekawostki i sprawdź, kto zna prawdziwe mechaniki.", help: ["Wszyscy odpowiadają jednocześnie: Prawda albo Fałsz.", "Po zebraniu odpowiedzi pokazujemy właściwą odpowiedź i krótkie wyjaśnienie.", "To dobry tryb solo z wynikiem, ale działa też jako szybka rywalizacja."], allowReports: true, players: "1–8 osób", minPlayers: 1, maxPlayers: 8, supportsLobby: true, supportsSolo: true, symbol: "📖", art: "minecraft-truth", audience: "minecraft", badges: ["new", "tiktok"], render: renderMinecraftGame, defaultSettings: minecraftDefaults["minecraft-truth"],
  },
  "minecraft-redstone": {
    id: "minecraft-redstone", name: "Awaria Redstone", description: "Napraw obwód, rozgryź mechanikę i zostań inżynierem ekipy.", help: ["W każdej rundzie dostajesz jedno pytanie logiczne o redstone.", "Wybierasz rozwiązanie spośród odpowiedzi, od podstawowych po eksperckie.", "Po odpowiedzi pokazujemy wyjaśnienie, żeby gra uczyła, a nie tylko punktowała."], allowReports: true, players: "1–8 osób", minPlayers: 1, maxPlayers: 8, supportsLobby: true, supportsSolo: true, symbol: "🔴", art: "minecraft-redstone", audience: "minecraft", badges: ["new"], render: renderMinecraftGame, defaultSettings: minecraftDefaults["minecraft-redstone"],
  },
  "board-chinczyk": {
    id:"board-chinczyk", name:"Chińczyk", description:"Rzucaj kostką, wyprowadzaj pionki i zbijaj rywali, zanim oni zrobią to samo.", help:["Rzuć kostką i wyprowadź pionek po wyrzuceniu szóstki.","Zbijaj pionki rywali, wracając je do bazy.","Wszystkie cztery pionki w domu oznaczają zwycięstwo."], allowReports:true, players:"2–4 osoby", minPlayers:2, maxPlayers:4, supportsLobby:true, supportsSolo:false, symbol:"🎲", art:"board-ludo", audience:"board", badges:["new"], render:renderBoardGame, defaultSettings:boardModeDefaults["board-chinczyk"],
  },
  "board-slowotwor": {
    id:"board-slowotwor", name:"Słowotwór", description:"Układaj słowa z własnych liter i zbieraj punkty za najciekawsze zagrania.", help:["W swojej turze ułóż słowo wyłącznie z liter na stojaku.","Dłuższe słowa dają więcej punktów.","Po ustalonej liczbie kolejek wygrywa najlepszy słowny strateg."], allowReports:true, players:"2–4 osoby", minPlayers:2, maxPlayers:4, supportsLobby:true, supportsSolo:false, symbol:"🔤", art:"board-words", audience:"board", badges:["new"], render:renderBoardGame, defaultSettings:boardModeDefaults["board-slowotwor"],
  },
  "board-statki": {
    id:"board-statki", name:"Statki", description:"Ukryj flotę, namierzaj pola przeciwnika i zatop wszystkie jego statki.", help:["Najpierw wybierz siedem pól dla swojej floty.","Następnie strzelaj naprzemiennie w planszę rywala.","Pierwszy kapitan, który trafi wszystkie pola, wygrywa."], allowReports:true, players:"2 osoby", minPlayers:2, maxPlayers:2, supportsLobby:true, supportsSolo:false, symbol:"🚢", art:"board-ships", audience:"board", badges:["new"], render:renderBoardGame, defaultSettings:boardModeDefaults["board-statki"],
  },
  "board-reversi": {
    id:"board-reversi", name:"Reversi", description:"Otaczaj pionki przeciwnika i przejmuj planszę kawałek po kawałku.", help:["Kładź pionki tak, aby zamknąć linię pionków przeciwnika.","Zamknięte pionki zmieniają kolor.","Na koniec wygrywa osoba z większą liczbą pól."], allowReports:true, players:"2 osoby", minPlayers:2, maxPlayers:2, supportsLobby:true, supportsSolo:false, symbol:"⚫", art:"board-reversi", audience:"board", badges:["new"], render:renderBoardGame, defaultSettings:boardModeDefaults["board-reversi"],
  },
  "board-warcaby": {
    id:"board-warcaby", name:"Warcaby", description:"Planuj bicia, rób damki i zablokuj wszystkie pionki przeciwnika.", help:["Pionki poruszają się po ciemnych polach po skosie.","Bicie jest obowiązkowe, a dojście do końca robi damkę.","Wygrywa gracz, który zbije albo zablokuje rywala."], allowReports:true, players:"2 osoby", minPlayers:2, maxPlayers:2, supportsLobby:true, supportsSolo:false, symbol:"♟️", art:"board-checkers", audience:"board", badges:["new"], render:renderBoardGame, defaultSettings:boardModeDefaults["board-warcaby"],
  },
  "board-cztery": {
    id:"board-cztery", name:"Cztery w rzędzie", description:"Wrzuć cztery pionki w jednej linii — poziomo, pionowo albo po skosie.", help:["Wybierz kolumnę, a pionek spadnie na najniższe wolne pole.","Układaj linie i blokuj ruchy przeciwnika.","Pierwsza linia czterech wygrywa."], allowReports:true, players:"2 osoby", minPlayers:2, maxPlayers:2, supportsLobby:true, supportsSolo:false, symbol:"🔴", art:"board-connect", audience:"board", badges:["new"], render:renderBoardGame, defaultSettings:boardModeDefaults["board-cztery"],
  },
  "board-memory": {
    id:"board-memory", name:"Memory", description:"Odkrywaj pary, zapamiętuj położenie kart i zbuduj największy wynik.", help:["Odkryj dwie karty w swojej turze.","Trafiona para daje punkt i dodatkową kolejkę.","Po odkryciu wszystkich par wygrywa najwyższy wynik."], allowReports:true, players:"2–8 osób", minPlayers:2, maxPlayers:8, supportsLobby:true, supportsSolo:false, symbol:"🧠", art:"board-memory", audience:"board", badges:["new"], render:renderBoardGame, defaultSettings:boardModeDefaults["board-memory"],
  },
  "board-domino": {
    id:"board-domino", name:"Domino", description:"Dokładaj kostki do łańcucha, dobieraj sprytnie i pozbądź się ręki jako pierwszy.", help:["Dokładaj kostkę do lewego albo prawego końca łańcucha.","Jeśli nie masz ruchu, dobierz kostkę z talii.","Gdy nikt nie może już zagrać, wygrywa najlżejsza ręka."], allowReports:true, players:"2–4 osoby", minPlayers:2, maxPlayers:4, supportsLobby:true, supportsSolo:false, symbol:"🁫", art:"board-domino", audience:"board", badges:["new"], render:renderBoardGame, defaultSettings:boardModeDefaults["board-domino"],
  },
  "pojedynek-hitow": {
    id: "pojedynek-hitow", name: "Pojedynek hitów", description: "Wybierzcie piosenki pod wspólny temat i przekonajcie ekipę, który numer wygrywa.", help: ["Wszyscy wybierają po jednym utworze z wyszukiwarki — bez kopiowania linków.", "Po wyborze słuchacie krótkich podglądów i głosujecie na najlepszy numer.", "Każdy głos trafia na jedną piosenkę, a remis daje punkt wszystkim zwycięzcom.", "Po kilku rundach wygrywa osoba z największą liczbą punktów."], allowReports: true, players: "2-8 osób", minPlayers: 2, maxPlayers: 8, supportsLobby: true, supportsSolo: false, symbol: "🎵", art: "music-duel", audience: "music", badges: ["new", "tiktok"], render: renderMusicDuelGame, defaultSettings: musicDuelDefaults,
  },
  "bitwa-hitow": {
    id: "bitwa-hitow", name: "Bitwa hitów", description: "Dwóch graczy wybiera numery, a reszta ekipy rozstrzyga, który hit jest lepszy.", help: ["W każdej rundzie losujemy dwóch muzycznych reprezentantów.", "Wybrani gracze wyszukują swoje piosenki, a pozostali słuchają obu propozycji.", "Publiczność głosuje na jeden numer; osoby wybierające piosenki nie głosują.", "Szanse niewylosowanych rosną z każdą rundą, więc każdy ma swoją kolej."], allowReports: true, players: "4-100 osób", minPlayers: 4, maxPlayers: 100, supportsLobby: true, supportsSolo: false, symbol: "🎶", art: "music-arena", audience: "music", badges: ["new", "tiktok"], render: renderMusicArenaGame, defaultSettings: musicArenaDefaults,
  },
  "popularnosc-hitow": {
    id: "popularnosc-hitow", name: "Kto ma więcej?", description: "Porównujcie piosenki albo artystów i zgadnijcie, kto ma większą popularność.", help: ["W każdej rundzie widzicie dwie piosenki albo dwóch artystów z dużej bazy.", "Wybieracie, która opcja ma więcej wyświetleń lub miesięcznych słuchaczy.", "Liczby są ukryte do momentu ujawnienia, a każdy trafny wybór daje punkt.", "W trybie Reversed punkt zdobywa wybór z mniejszą liczbą. Możecie też zagrać solo ze streakiem."], allowReports: true, players: "2-8 osób", minPlayers: 2, maxPlayers: 8, supportsLobby: true, supportsSolo: true, symbol: "📈", art: "music-duel", audience: "music", badges: ["new", "tiktok"], render: renderPopularityGame, defaultSettings: popularityDefaults,
  },
  "popularnosc-solo": {
    id: "popularnosc-solo", name: "Kto ma więcej? · Solo", description: "Zgaduj popularność piosenek lub artystów i buduj rekordową serię.", help: ["Porównujesz dwie opcje bez presji czasu.", "Możesz przełączać wyświetlenia, słuchaczy piosenek albo słuchaczy artystów.", "Po każdym wyborze od razu dostajesz następną parę, a jedna pomyłka kończy serię."], allowReports: false, players: "Tryb solo", minPlayers: 1, maxPlayers: 1, supportsLobby: false, supportsSolo: true, symbol: "🔥", art: "choice", audience: "music", badges: ["new"], hiddenFromLibrary: true, render: renderPopularitySolo, defaultSettings: popularityDefaults,
  },
};

export const gamesList = Object.values(gamesRegistry);

export function getGameMode(id) {
  return gamesRegistry[id] || gamesRegistry.udowodnij;
}
