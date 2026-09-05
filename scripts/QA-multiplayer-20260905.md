# QA — multiplayer, mobile i cache (2026-09-05)

## Powtarzalne testy

Uruchom z katalogu projektu:

```powershell
node --test scripts/testMultiplayer.mjs scripts/testOfflineCache.mjs
```

Wynik: 9/9. Testy obejmują opóźnione akcje bota po zmianie rundy/meczu,
zmianę hosta i odejście bota, przekroczenie deadline, duplikaty, brak odpowiedzi,
przedwczesny timeout, zachowanie deadline po ponownym renderze oraz rozróżnianie
offline nawigacji od brakujących plików JS/audio. To testy silnika i logiki,
nie produkcyjnego Firebase.

## Sprawdzone w Chrome przez Playwright

- Lokalny serwer HTTP, uruchomienie pełnej aplikacji bez błędów pageerror.
- Dwie strony z rzeczywistym renderPopularityGame i PopularityEngine, ze
  wspólnym lokalnym transportem testowym (bez zapisów w produkcyjnej bazie).
- Po odpowiedzi A obie jego karty są zablokowane, B nadal ma dwie aktywne.
- Klawisze D i strzałka w prawo po zapisanym wyborze A nie wysyłają odpowiedzi.
- Dopiero odpowiedź B kończy rundę; oba widoki mają zgodne wybory i roundResult.
- Szerokości 320, 360, 390, 720 i 1366 px: brak poziomego overflow;
  na telefonie karty A/B widoczne obok siebie. Kontrola wizualna 390 × 844.
- Sprawdzenie składni zmienionych plików JS i git diff --check: poprawne.

## Granice sprawdzenia / przed publikacją

Zewnętrzne zapytania były zablokowane, więc odsłuchy i okładki z dostawców nie
były sprawdzane. Service worker sprawdzony w izolowanym teście, nie w realnym
przełączeniu sieci z zainstalowanym PWA. Nie sprawdzono reguł produkcyjnego
Firebase, konfliktów jego transakcji ani reconnectu dwóch kont na żywej bazie.

Na środowisku testowym Firebase należy dodatkowo sprawdzić dwie zalogowane
osoby: równoczesne wybory, rozłączenie i reconnect, opuszczenie pokoju przez
hosta podczas odliczania oraz opóźniony ruch po przejściu do lobby. Żadna z
tych operacji nie powinna cofnąć rundy ani nadpisać wyboru drugiego gracza.

Wersja użytkowa pozostaje 4.3.0; zmieniono jedynie znaczniki cache zasobów.
