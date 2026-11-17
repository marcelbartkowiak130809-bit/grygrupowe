# Droga do Alex

Osobny tryb solo `minecraft-journey`, niezależny od Ostatniego plecaka.
Dziesięć połączonych scenerii tworzy jeden świat o szerokości 160 bloków.
Steve zbiera przedmioty kliknięciem; narzędzia, crafting i budowanie obsługuje się
myszką albo dotykiem. Klawiatura nie jest potrzebna do chodzenia.

| Miejsce | Problem | Co zostaje na później |
| --- | --- | --- |
| Polana | Zebrać leżący pień i zdobyć jedzenie | Drewno, surowy schab; opcjonalnie patyki i jagody |
| Rzeka | Zwolnić podporę kłody, dobudować dwa pola mostu i przejść | Opuszczona kłoda i most pozostają |
| Obóz | Zasilić znaleziony piec i upiec jedzenie | Prowiant; dodatkowy węgiel ze skrzyni |
| Kamieniołom | Drewnianym kilofem zdobyć materiał na kamienny | Narzędzia i zapas bruku z bocznego złoża |
| Kopalnia | Doświetlić tunel i wydobyć żelazo | Pochodnie, ruda, dodatkowe zapasy |
| Kuźnia | Przygotować żelazny kilof, używając pieca i paliwa | Żelazny kilof; piec z pozostałym ciepłem |
| Wioska | Obciążyć linę brukiem, podnieść pokrywę i zabrać mapę | Uruchomiona przeciwwaga, mapa i jedzenie |
| Przełęcz | Zbudować podparte stopnie na wyższą półkę | Schody pozostają w świecie |
| Brama | Wydobyć redstone, zamknąć obwód i włączyć dźwignię | Działająca brama i wcześniejszy ekwipunek |
| Dom Alex | Zapalić światło i przywitać Alex | Podsumowanie; możliwość obejrzenia całej przebytej drogi |

## Reguły

- Ekwipunek nie jest resetowany pomiędzy sceneriami. Kolejność slotów jest stała
  według odkrywania przedmiotów, także po zużyciu ostatniej sztuki.
- Drzewa w oddali są dekoracją. Zbieralny leżący pień, złoża, jedzenie i skrzynie
  są obiektami interaktywnymi. Raz zebrane przedmioty nie odradzają się.
- Kamera przesuwa ten sam pas świata. Poprzednie sceny i ich stan pozostają
  zamontowane; przyciski odkrytych miejsc pozwalają wrócić po zapasy.
- Budowane schody potrzebują podpory. Most rośnie od brzegu. Przejście jest
  sprawdzane według ciągłości terenu i dopuszczalnej wysokości kroku.
- Węgiel daje 8 jednostek paliwa, kłoda 2, deska 1. Paliwo należy do konkretnego
  pieca, nie do całej podróży; stary piec również pozostaje dostępny.
- Kamienny i żelazny kilof wydobywają bruk szybciej od drewnianego. Jedzenie
  daje zapas sił; każde wzmocnione wydobycie dostarcza o jeden surowiec więcej.
- Opcjonalne surowce i skrzynie nie są wymagane do ukończenia minimalnej trasy,
  ale oszczędzają paliwo, drewno lub późniejsze wydobywanie.
- Receptury można układać ręcznie albo przygotować z książki receptur. Brakujące
  materiały są wypisane; przygotowanie nie przyznaje brakujących przedmiotów.
- Cofanie przywraca razem plecak, surowce, konstrukcje, paliwo i położenie Steve’a.
- Zapis jest oddzielny dla gracza: `grygrupowe-alex-journey-v1:<id>`. Jest to
  dziennik działań, odtwarzany i walidowany zamiast zaufania zapisanym zasobom.
- Nowe wyprawy mają `rulesVersion: 2`: łącznie 5 sztuk drewna w całym świecie,
  w tym jeden zapasowy pień przy domu. Starsze zapisy bez tej informacji nadal
  odtwarzają pierwotne zasoby i zagadki; aktualizacja nie resetuje plecaka.
- Polecenie nad światem wskazuje następną czynność i reaguje na postęp.
  Po przywitaniu Alex pojawiają się serca oraz wyraźny koniec gry z czasem
  w minutach i sekundach, liczbą miejsc i otwartych skrytek. Czas końcowy
  zostaje zapisany i nie rośnie po ponownym otwarciu strony.

## Inspiracje konkretnymi zagadkami

Przejrzano [opis przejścia pierwszego Adam & Eve, Jay Is Games](https://www.jayisgames.com/review/adam-eve.php):
„Broken Bridge” łączy podporę i dwa odcinki mostu, a „Elevator” wykorzystuje
głaz oraz mechanizm podnoszenia. Na tej zasadzie powstały autorskie zagadki
z opadającą kłodą nad rzeką i przeciwwagą studni. Nie kopiowano grafiki ani
postaci Adama i Ewy; oprawa i przedmioty pozostają minecraftowe.

To autorska przygoda fanowska w formie łamigłówki, nie pełna symulacja Minecrafta.
Nie ma nieodwracalnej śmierci ani utraty plecaka. Na telefonie kamera pokazuje
12 kolumn z przyciskami rozglądania, a szybki plecak i skrót do craftingu są pod planszą.

## Grafiki i weryfikacja

Oryginalne tekstury Minecraft Java Edition 1.21.4. Steve, Alex i świnia są
wyświetlane z fragmentów lokalnych oryginalnych skórek, bez generowanych ilustracji.
Autorzy i właściciele zasobów: Mojang / Microsoft. Informacja fanowska jest w grze.

`testAlexJourney.mjs` sprawdza minimalną trasę, dodatkowe poszukiwania, cofanie,
zapis i blokady. `verifyAlexJourneyUI.mjs` przechodzi dziesięć scenerii przez
rzeczywisty komponent, porównując jego zapis z niezależnie prowadzonym stanem.
Sprawdzono także Chrome: zbieranie zasobów, przejście kamery, budowę mostu,
wejście z menu strony, widok 390 px wszystkich scenerii i finał u Alex.
Podgląd deweloperski: `scripts/journeyReview.html`.
