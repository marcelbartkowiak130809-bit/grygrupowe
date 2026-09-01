import { modeUnlockInfo } from "./upcomingModes.js?v=20260901-8";

const stagedModes = [
  { id: "bomba", name: "Bomba" },
  { id: "najblizej-prawdy", name: "Najbliżej prawdy" },
  { id: "ranking", name: "Ranking" },
  { id: "5-sekund", name: "5 sekund" },
  { id: "zegar", name: "Zegar" },
  { id: "number-mystery", name: "Tajemnicza liczba" },
];

function unlockedModeChanges(now = Date.now()) {
  return stagedModes
    .filter(mode => !modeUnlockInfo(mode.id, now).locked)
    .map(mode => `Odblokowano tryb: ${mode.name}.`);
}

function buildChangelogEntries(now = Date.now()) {
  return [
    {
      version: "v4.3.0",
      date: "2026-09-01",
      title: "Nowe tryby, muzyka i planszówki",
      changes: [
        "Dodano tryb Pojedynek hitów dla 2–8 osób: każdy wybiera piosenkę, słuchacie podglądów i głosujecie na najlepszy numer.",
        "Dodano tryb Bitwa hitów dla 4–100 osób: w każdej rundzie dwóch graczy wybiera utwory, a reszta lobby głosuje.",
        "Dodano wyszukiwarkę utworów bez kopiowania linków oraz 30-sekundowe podglądy z ręcznym odtworzeniem jako fallbackiem.",
        "Dodano 133 kategorie muzyczne: głównie pozytywne, ale też roczniki, nostalgiczne, smutne, dziwne i bardziej ryzykowne klimaty.",
        "Dodano ustawienia kategorii, liczby rund, czasu wyboru i czasu głosowania oraz responsywny interfejs na telefonach.",
        "Dodano rozdzielanie szans losowania graczy w Bitwie hitów — osoby niewylosowane dostają większą szansę w kolejnych rundach.",
        "Dodano nowy tryb multiplayer Kto ma więcej? dla 2–8 osób: w 10 sekund wybieracie, która piosenka ma większą popularność.",
        "Dodano wybór statystyki: wyświetlenia YouTube albo miesięczni słuchacze Spotify.",
        "Dodano bazę 328 utworów z równym dla wszystkich snapshotem danych, ukrytymi liczbami i efektownym ujawnieniem wyniku.",
        "Dodano automatyczne pobieranie okładek z publicznego katalogu muzycznego oraz bezpieczny fallback, gdy obrazek nie jest dostępny.",
        "Dodano animowane karty A/B, awatary wyborów, informację o trafieniach i ranking po każdej rundzie.",
        "Dodano płynne ujawnianie liczb, skróty A/D i strzałki oraz widoczny stan gotowych graczy.",
        "Dodano wariant solo z rekordem streaka, bez limitu rund i możliwością przerwania serii w dowolnym momencie.",
        "Dodano ustawienia liczby rund i czasu wyboru oraz obsługę botów w trybie multiplayer.",
        "Dodano 8 trybów planszówkowych: Chińczyk, Słowotwór, Statki, Reversi, Warcaby, Cztery w rzędzie, Memory i Domino.",
        "Dodano wspólny system lobby, timerów, botów, wyników, ponownego meczu i automatycznych ruchów awaryjnych dla planszówek.",
        "Dodano kosmetyki Neonowy stół do Chińczyka oraz Holograficzne karty do Memory.",
        "Dodano komunikaty o dzisiejszym odblokowaniu trybów, ujawnianie nazwy od północy i animowane fajerwerki po starcie.",
      ],
    },
    {
      version: "v4.2.0",
      date: "2026-08-31",
      title: "Gamepassy, zakupy i wygodniejsze pokoje",
      changes: [
        "Dodano kompletny system gamepassów z ulepszeniami konta i efektami przypisanymi do konkretnych trybów.",
        "Dodano opcjonalne zakupy w trakcie gry, które host może włączyć albo wyłączyć przy tworzeniu pokoju.",
        "Dodano w lobby sekcję zakupów i gamepassów z krótkimi opisami działania oraz podglądem dostępnych dodatków.",
        "Dodano Zestaw potek: 10 losowych potek tieru 1, 5 tieru 2 i 3 tieru 3 za 5 000$.",
        "Dodano Mega zestaw potek: 25 losowych potek tieru 1, 15 tieru 2 i 7 tieru 3 za 10 000$.",
        "Potki coinów działają tylko w normalnych grach, więc zakłady nie mogą służyć do przerzucania pieniędzy.",
        "Wyważono ceny gamepassów i poziomów Rekompensaty: odblokowanie kosztuje 10 000$, a kolejne ulepszenia są tańsze.",
        "Dopracowano Amulet przetrwania, żeby nie gwarantował wygranej i działał tylko wtedy, gdy naprawdę grozi utrata życia.",
        "Naprawiono synchronizację i odświeżanie ekwipunku potek oraz komunikaty o używaniu posiadanych potek.",
        "Dodano podpowiedzi gamepassów, które nie są przycinane przez modal i podążają za kursorem.",
        "Usunięto znak zapytania pojawiający się przy kursorze na elementach z podpowiedziami.",
        "Uproszczono okno tworzenia pokoju: szerszy układ, kafelki presetów i rodzaju pokoju oraz zwijane dodatki.",
        "Ukryto wizualne scrollbary w oknie tworzenia pokoju, zachowując przewijanie na małych ekranach.",
        "Poprawiono responsywność lobby i formularza tworzenia pokoju na komputerach, tabletach i telefonach.",
        "Dopracowano Happy Hour: prostszy baner, zamykanie do końca wydarzenia i ponowne otwieranie z ikonki.",
        "Dodano i zintegrowano nowe tryby Połącz nas, Kłamca, Fałszywa wiadomość i Tajna zasada.",
        "Rozbudowano kolejkę odblokowywania trybów i uporządkowano ich prezentację na ekranie głównym.",
        "Dodano bezpieczne przejście z changeloga bezpośrednio do sklepu gamepassów i dodatków.",
      ],
    },
    {
      version: "v4.1.2",
      date: "2026-08-22",
      title: "Restart pokoi i odświeżenie aplikacji",
      changes: [
        "Zamknięto stare pokoje przed rozpoczęciem kolejnego cyklu testów.",
        "Po aktualizacji aplikacja czyści lokalne kopie pokoi i wymusza jednorazowe odświeżenie strony.",
        "Dodano tryb Tajemnicza liczba z pytaniami własnymi, quick chatem, historią i dwoma warunkami zwycięstwa.",
      ],
    },
    {
      version: "v4.0.0",
      date: "2026-08-04",
      title: "Nowy rytm GryGrupowe",
      changes: [
        "Scalono zawartość aktualizacji Pokémon oraz Friend Requests z wersji 3.1.0 i 3.2.0.",
        "Dodano kategorię POKEMONY, bazę Pokémonów, tryby Pokémon oraz kompletny system znajomych.",
        "Odświeżono główny ekran, nawigację, przyciski i karty trybów.",
        "Dodano nowy układ informacji o pokojach, aktywności i szybkich akcjach.",
        "Dodano wspólny system botów działający w prywatnych pokojach.",
        "Boty mają cztery poziomy trudności, opóźnienia reakcji i zmienne style gry.",
        "Dodano boty do odpowiedzi tekstowych, wyborów, timerów, głosowań i ruchów specjalnych.",
        "Dodano automatyczne oznaczenia botów oraz wygodniejsze wolne sloty w lobby.",
        "Dodano zmniejszenie nagród bankowych zależne od liczby botów.",
        "Wyniki zakładów między prawdziwymi graczami pozostają bez zmian.",
        "Rozbudowano tryby Pokémon o wspólną obsługę faz, timerów i podpowiedzi.",
        "Dodano Wavelength, Quiz, Matematyka, Marker, Zgadnij sekwencję, Familiada i Łańcuch słów.",
        "Dodano nowe tryby typów Pokémonów, Evolution Race i aukcji drużyn.",
        "Dodano efekty, animacje i responsywne widoki dla nowych rozgrywek.",
        "Poprawiono działanie pokoi prywatnych, zaproszeń i synchronizacji między urządzeniami.",
        "Przygotowano system automatycznego odblokowywania kolejnych trybów co trzy dni.",
        "Nowe tryby są odblokowywane etapami: jeden tryb co trzy dni o 20:00.",
      ],
    },
    {
      version: "v3.2.0",
      date: "2026-08-04",
      title: "FRIEND REQUESTS",
      changes: [
        "Dodano kompletny system znajomych inspirowany lobby gier multiplayer.",
        "Dodano wyszukiwanie graczy po nicku oraz zaproszenia do znajomych.",
        "Dodano listy znajomych, otrzymanych zaproszeń i wysłanych zaproszeń.",
        "Dodano zapraszanie znajomych do lobby oraz prośby o dołączenie do gry.",
        "Dodano statusy online, offline i w grze oraz oznaczenia znajomych w lobby.",
        "Dodano animowane powiadomienia i licznik nowych zaproszeń.",
      ],
    },
    {
      version: "v3.1.0",
      date: "2026-08-04",
      title: "POKEMONY",
      changes: [
        "Dodano kategorię POKEMONY z pięcioma nowymi trybami gry.",
        "Dodano lokalną bazę 1025 Pokémonów z numerami National Dex, typami, generacjami, BST i liniami ewolucji.",
        "Dodano tryby Najbliższy numer Pokédex, Ostatnia litera, Evolution Race, Licytacja Teamu i Typy i szybka odpowiedź.",
        "Dodano ustawienia generacji, timerów, budżetu aukcji i wielkości drużyny.",
        "Nowe tryby działają responsywnie na telefonach i komputerach oraz automatycznie kończą fazy po czasie.",
      ],
    },
    {
      version: "v3.0.0",
      date: "2026-06-13",
      title: "Swiezy start 3.0.0",
      changes: [
        "Odswiezono wyglad strony glownej, lobby i pokoi bez zmiany mechanik gry.",
        "Dodano system stopniowego odblokowywania nowych trybow.",
        "Dodano karty nadchodzacych trybow z datami odblokowania.",
        "Dodano udostepnianie strony z kodem QR i kopiowaniem QR jako grafiki.",
        "Dodano animacje przejsc w lobby, sklepie, questach i widokach strony.",
        "Dodano kosmetyki bomb, cukierkow i zegarow oraz nowe efekty wizualne w wybranych trybach.",
        "Rozbudowano tryb Zegar o gre od 1 osoby, tag trybu solo i nagrody za precyzje w solo.",
        "Dodano zarabianie i progres dla nowych trybow: Bomba, Najbliżej prawdy, Ranking, 5 sekund i Zegar.",
        "Rozbudowano questy daily i weekly o nowe tryby, serie zwyciestw i wyzwania precyzji zegara.",
        "Rozszerzono droge levelowa do 150 poziomu i dodano nagrody z nowych kosmetykow.",
        "Poprawiono czytelnosc kodu pokoju, akcji zapraszania i listy graczy.",
        ...unlockedModeChanges(now),
      ],
    },
    {
      version: "v2.2.0",
      date: "2026-06-11",
      title: "Publiczne strony, pytania i poprawki online",
      changes: [
        "Dodano publiczne strony informacyjne: o grze, jak grac, tryby gry, regulamin, polityke prywatnosci i kontakt.",
        "Dodano stopke z linkami oraz sekcje informacyjna z FAQ na stronie glownej.",
        "Rozszerzono pule pytan i hasel w trybach Inne pytanie, Impostor i Kim jestem.",
        "Dodano liczniki uzycia kategorii w pokojach, zeby gracze widzieli ryzyko powtorek.",
        "Naprawiono wyniki glosowania na stronie glownej, zeby pokazywaly zsumowane glosy.",
        "Poprawiono licznik online, aby nie zawyzal martwych polaczen.",
      ],
    },
    {
      version: "v2.1.0",
      date: "2026-06-05",
      title: "Poprawki wygody, pokoi i kosmetykow",
      changes: [
        "Dodano glebokie linki do prywatnych pokoi i bezposrednie zapraszanie linkiem.",
        "Dodano realny voice chat WebRTC w trybie Kim jestem.",
        "Dodano licznik online w gornym pasku i skrocono go do formatu X online.",
        "Dodano przelacznik animacji w katalogu kosmetykow, zeby katalog mniej lagowal.",
        "Poprawiono uklad i logike ustawien w Kim jestem, w tym gre do 1 trafienia.",
        "Dodano nowe skiny cukierkow i dopracowano stol w Zatrutym cukierku.",
        "Rozbudowano i poprawiono efekty kosmetykow wygranej, przegranej, idle oraz nickow.",
        "Dodano ostatnia szanse impostora na zgadniecie hasla po glosowaniu.",
        "Poprawiono statystyki, kick z pokoju, pola tekstowe i obsluge daty urodzenia.",
        "Poprawiono kompatybilnosc mobilna i kilka problemow z rerenderem UI.",
      ],
    },
    {
      version: "v2.0.0",
      date: "2026-06-04",
      title: "Duza aktualizacja gier i profilu",
      changes: [
        "Dodano osmy tryb: Zatruty cukierek!",
        "Dodano i rozbudowano kosmetyki: ramki, aury, cukierki oraz animacje idle, wygranej i przegranej.",
        "Dodano katalog kosmetykow i wygodniejsze przewijanie garderoby.",
        "Dodano questy daily i weekly z nagrodami.",
        "Dodano wiecej nagrod za level i automatyczne odbieranie zaleglych nagrod.",
        "Dodano wybor kategorii w kolejnych trybach oraz minimalny wybor kilku kategorii tam, gdzie ma to sens.",
        "Rozszerzono pule pytan i hasel w trybach imprezowych.",
        "Dodano tagi trybow: Popularne, Nowe i Nowe pytania.",
        "Dodano filtry trybow w menu glownym.",
        "Dodano ostrzezenia i oznaczenia 18+ dla pokojow oraz kategorii.",
        "Dodano zglaszanie graczy, inbox konta i podstawowe narzedzia administracyjne.",
        "Poprawiono bledy synchronizacji, podskakiwania UI i kasowania wpisywanych odpowiedzi przy rerenderze.",
        "Poprawiono kilka bledow w Impostorze, Kim jestem i Zatrutym cukierku.",
      ],
    },
  ];
}

export const changelogEntries = new Proxy([], {
  get(_target, property) {
    const entries = buildChangelogEntries().filter(entry => !["v3.1.0", "v3.2.0"].includes(entry.version));
    const value = entries[property];
    return typeof value === "function" ? value.bind(entries) : value;
  },
  ownKeys() {
    return Reflect.ownKeys(buildChangelogEntries().filter(entry => !["v3.1.0", "v3.2.0"].includes(entry.version)));
  },
  getOwnPropertyDescriptor(_target, property) {
    return Object.getOwnPropertyDescriptor(buildChangelogEntries().filter(entry => !["v3.1.0", "v3.2.0"].includes(entry.version)), property);
  },
});

export const latestChangelog = new Proxy({}, {
  get(_target, property) {
    return buildChangelogEntries().filter(entry => !["v3.1.0", "v3.2.0"].includes(entry.version))[0][property];
  },
});
