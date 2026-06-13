import { modeUnlockInfo } from "./upcomingModes.js?v=20260613-1";

const stagedModes = [
  { id: "bomba", name: "BOMBA" },
  { id: "najblizej-prawdy", name: "NAJBLIZEJ PRAWDY" },
  { id: "ranking", name: "RANKING" },
  { id: "5-sekund", name: "5 SEKUND" },
  { id: "zegar", name: "ZEGAR" },
];

function unlockedModeChanges(now = Date.now()) {
  return stagedModes
    .filter(mode => !modeUnlockInfo(mode.id, now).locked)
    .map(mode => `Odblokowano tryb: ${mode.name}.`);
}

function buildChangelogEntries(now = Date.now()) {
  return [
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
        "Rozbudowano tryb ZEGAR o gre od 1 osoby, tag trybu solo i nagrody za precyzje w solo.",
        "Dodano zarabianie i progres dla nowych trybow: Bomba, Najblizej Prawdy, Ranking, 5 Sekund i Zegar.",
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
    const entries = buildChangelogEntries();
    const value = entries[property];
    return typeof value === "function" ? value.bind(entries) : value;
  },
  ownKeys() {
    return Reflect.ownKeys(buildChangelogEntries());
  },
  getOwnPropertyDescriptor(_target, property) {
    return Object.getOwnPropertyDescriptor(buildChangelogEntries(), property);
  },
});

export const latestChangelog = new Proxy({}, {
  get(_target, property) {
    return buildChangelogEntries()[0][property];
  },
});
