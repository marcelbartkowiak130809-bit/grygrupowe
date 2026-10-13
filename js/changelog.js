import { modeUnlockInfo } from "./upcomingModes.js?v=20261013-7";

const stagedModes = [
  { id: "bomba", name: "Bomba" },
  { id: "najblizej-prawdy", name: "Najbliżej prawdy" },
  { id: "ranking", name: "Ranking" },
  { id: "5-sekund", name: "5 sekund" },
  { id: "zegar", name: "Zegar" },
  { id: "number-mystery", name: "Tajemnicza liczba" },
  { id: "charades", name: "Kalambury" },
  { id: "hangman", name: "Wisielec" },
];

function unlockedModeChanges(now = Date.now()) {
  return stagedModes
    .filter(mode => !modeUnlockInfo(mode.id, now).locked)
    .map(mode => `Odblokowano tryb: ${mode.name}.`);
}

function buildChangelogEntries(now = Date.now()) {
  return [
    {
      version: "v5.4.5",
      date: "2026-10-13",
      title: "Działający podgląd czasu w Impostorze",
      changes: ["Czas podpowiedzi zmienia się na żywo podczas przesuwania suwaka. Po puszczeniu zapisuje się dla pokoju, bez przeładowywania panelu."],
    },
    {
      version: "v5.4.4",
      date: "2026-10-13",
      title: "Dokończ tekst wraca do głosowania",
      changes: ["Tryb zablokowano i dodano do muzycznej puli głosowania; dawne odblokowania go nie otwierają.", "Zastąpiono sztuczny zegar tekstu znacznikami z analizy konkretnych odsłuchów. Na początek 5 dopasowanych fragmentów: 3 globalne i 2 polskie. Odpowiadanie zaczyna się po zakończeniu odsłuchu, nie w trakcie buforowania."],
    },
    {
      version: "v5.4.3",
      date: "2026-10-13",
      title: "Szersze skojarzenia w Impostorze",
      changes: ["Dalsze dopracowanie par: popularne hasła z tej samej szerszej grupy zamiast najbliższych odpowiedników, np. gitara — pianino i papuga — pingwin. Krokodyl — hipopotam pozostaje."],
    },
    {
      version: "v5.4.2",
      date: "2026-10-13",
      title: "Naprawiony Marker",
      changes: ["Krzyżyk jest sprawdzany w obrębie wybranego pola, a nie całej planszy. Powiększone pole do rysowania, przyciski zapisu i czyszczenia oraz zachowanie szkicu przy odświeżeniach.", "Poprawiono powtarzające się liczby, zabezpieczenia tur i kończenie rozgrywki."],
    },
    {
      version: "v5.4.1",
      date: "2026-10-13",
      title: "Lepsze pary haseł w Impostorze",
      changes: ["Poprawiono zbyt podobne hasła i synonimy. Pary zachowują wspólne skojarzenie, ale mają wyraźniejsze różnice, np. krokodyl — hipopotam."],
    },
    {
      version: "v5.4.0",
      date: "2026-10-13",
      title: "Nowe główne menu",
      changes: ["Nowa strefa odkrywania na komputerze: muzyka i kategorie na górze, animowana płyta i szybkie wejścia do gry.", "Czytelniejsza biblioteka oraz pasek dołączania do pokoju. Na telefonie zachowano układ kompaktowy i dodano lekkie animacje."],
    },
    {
      version: "v5.3.6",
      date: "2026-10-13",
      title: "Turniej losowych hitów",
      changes: ["Zestawy 8, 16, 32, 64 i 128 piosenek z puli polskiej, globalnej albo mieszanej, wybór długości odsłuchu i szacunki czasu gry.", "Usunięto własne playlisty ze Zgadnij utwór. Zostają filtry oraz udostępnianie grafiki wyniku."],
    },
    {
      version: "v5.3.5",
      date: "2026-10-12",
      title: "Udostępnij wynik Zgadnij utwór",
      changes: ["Grafika wyniku z okładką, artystą, nickiem, profilowym i dokładnym czasem odsłuchu. Podgląd, pobieranie PNG oraz udostępnianie na obsługiwanych urządzeniach."],
    },
    {
      version: "v5.3.4",
      date: "2026-10-12",
      title: "Wygodny pasek mobilny",
      changes: ["Logo, level, saldo i profil mieszczą się w jednym rzędzie; dodatkowe opcje są w rozwijanym menu zamiast ucinanego paska ikon."],
    },
    {
      version: "v5.3.3",
      date: "2026-10-12",
      title: "Zgadnij utwór wygodniej na telefonie",
      changes: [
        "Gra trafia na górę ekranu. Twój miks i ranking są zwijanymi panelami pod odsłuchem.",
        "Mniejsze odstępy i nagłówek, pełna szerokość odpowiedzi oraz wygodne przyciski Sprawdź i Skip.",
      ],
    },
    {
      version: "v5.3.2",
      date: "2026-10-12",
      title: "Czytelne karty na telefonie",
      changes: [
        "Widok kompaktowy: pełne etykiety i nazwy, poprawne wysokości kart kategorii oraz wygodne przyciski Pokój i Solo.",
      ],
    },
    {
      version: "v5.3.1",
      date: "2026-10-12",
      title: "Udostępnij zwycięski hit",
      changes: [
        "Podsumowanie Playlista Cup tworzy grafikę ze zwycięzcą, okładką, nickiem, profilowym i czasem turnieju.",
        "Jeden wielorazowy szablon; podgląd, pobranie PNG i udostępnianie pliku na wspieranych urządzeniach.",
      ],
    },
    {
      version: "v5.3.0",
      date: "2026-10-12",
      title: "Playlista Cup",
      changes: [
        "Nowy turniej solo z własnej playlisty: 10 sekund utworu A, 10 sekund B i wybór zwycięzcy.",
        "Zwycięzcy par przechodzą do kolejnych rund aż do finału; nieparzyste rundy mają wolny los.",
        "Animowane karty, pauza, powtórki odsłuchów i podsumowanie całej drogi do zwycięstwa.",
      ],
    },
    {
      version: "v5.2.1",
      date: "2026-10-12",
      title: "Polskie klasyki",
      changes: [
        "Dodano 74 znane polskie utwory sprzed 2000 roku, w tym 8 piosenek Maryli Rodowicz.",
        "Klasyki mają odsłuchy, okładki i daty pierwotnych wydań, niezależne od dat reedycji.",
      ],
    },
    {
      version: "v5.2.0",
      date: "2026-10-12",
      title: "Druga szansa i własna playlista",
      changes: [
        "Błędna odpowiedź w solo odsłania kolejny fragment; przegrywasz dopiero na ostatnim progu.",
        "Podsumowanie odtwarza utwór, pokazuje czas odsłuchu i pozwala uruchomić pełny odtwarzacz Apple Music.",
        "Dodano poziomy Easy, Medium, Hard, All i cykl; do rankingu liczy się wyłącznie All przy pełnej puli.",
        "Artyści mają liczniki utworów. Własną playlistę można załadować z listy Artysta — Tytuł.",
      ],
    },
    {
      version: "v5.1.1",
      date: "2026-10-10",
      title: "Artyści bez przeskakiwania ekranu",
      changes: [
        "Dodano okładki albumów przy artystach i wybrane osoby na górze listy.",
        "Rozdzielono filtrowanie na gatunek z dekadą albo artystów.",
        "Zmiany ustawień nie przebudowują już całego ekranu; lista zachowuje wyszukiwanie i przewijanie.",
      ],
    },
    {
      version: "v5.1.0",
      date: "2026-10-10",
      title: "Twój miks w Zgadnij utwór",
      changes: [
        "Dodano zapętlane filtry dekad i gatunków oraz wybór artystów, również z featuringów.",
        "Dodano osobne rankingi globalne i polskie. Liczą się tylko serie ze wszystkimi filtrami na All.",
        "Uzupełniono metadane katalogu i dopasowano układ do telefonów.",
      ],
    },
    {
      version: "v5.0.4",
      date: "2026-10-10",
      title: "ADÉLA, Doja Cat i więcej rapu",
      changes: [
        "Dodano 17 kolejnych utworów ADÉLI oraz 12 Doja Cat.",
        "Rozszerzono katalog o 80 utworów zagranicznych raperów i raperek z odsłuchem.",
      ],
    },
    {
      version: "v5.0.3",
      date: "2026-10-10",
      title: "Więcej muzyki",
      changes: [
        "Dodano 51 polskich i 81 globalnych utworów, w tym aktualne hity z list Apple Music.",
        "Uzupełniono brakujące odsłuchy 5 istniejących utworów.",
      ],
    },
    {
      version: "v5.0.2",
      date: "2026-10-10",
      title: "Płynniejsze Zgadnij utwór",
      changes: [
        "Odpowiedź w solo można sprawdzić w dowolnym momencie, także podczas odtwarzania.",
        "Ograniczono zapisy postępu podczas odsłuchu, żeby zmniejszyć przycięcia.",
        "Uproszczono ekran: duży przycisk odtwarzania, pasek odsłuchu, odpowiedź i Skip.",
        "Aktualizacje głosów i odpowiedzi innych graczy nie przeładowują już odsłuchu ani nie kasują wpisywanego tytułu.",
      ],
    },
    {
      version: "v5.0.1",
      date: "2026-09-26",
      title: "Pewniejsze odtwarzanie piosenek",
      changes: [
        "Naprawiono nakładanie się previewów po pominięciu utworu w trybie Kto ma więcej?.",
        "Dodano widoczny przycisk ręcznego odtwarzania, gdy przeglądarka blokuje start piosenki.",
        "Ujednolicono sterowanie dźwiękiem między grami, żeby pauza i głośność działały tak samo w każdej przeglądarce.",
      ],
    },
    {
      version: "v5.0.0",
      date: "2026-09-22",
      title: "Kalambury i Wisielec",
      changes: [
        "Dodano Kalambury dla 3–8 osób: pokazuj hasła gestami, zgaduj na czas i zdobywaj punkty dla całej ekipy.",
        "Dodano Wisielca dla 2–8 osób: odkrywajcie słowa na zmianę, śledźcie próby i rywalizujcie o wynik.",
        "Oba tryby otrzymały ustawienia lobby, animowane ekrany gry, wyniki, nagrody, zadania i miejsce w kolejce odblokowań.",
        "Odświeżono wspólne animacje i dopracowano układ nowych ekranów na telefonach oraz dla ograniczonego ruchu.",
      ],
    },
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
        "Dodano 157 nowych globalnych utworów z działającymi okładkami i previewami, dzięki czemu globalna pula ma 243 grywalne utwory.",
        "Globalna i polska pula są rozdzielone; łącznie katalog zawiera 358 utworów.",
        "Naprawiono otwieranie Lucky Spin i jego przycisku na urządzeniach dotykowych.",
        "Zgadnij utwór działa teraz jak Songspot: progi 0,1 → 0,5 → 2 → 8 → 15 s i Skip przechodzący do kolejnego czasu tego samego utworu.",
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
