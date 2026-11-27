# Mapa projektu

Strona startuje z [index.html](../index.html), który ładuje moduły JavaScript i arkusze CSS. [app.js](../js/app.js) łączy widoki, rozgrywkę i dane graczy. [router.js](../js/router.js) odpowiada za adresy i nawigację. Zwykły podgląd frontendu działa bez instalowania zależności.

| Szukasz | Zacznij tutaj |
| --- | --- |
| Menu, kategorie, polecane i filtry | [platform.js](../js/platform.js), [homeMenu.js](../js/homeMenu.js), [gameCategories.js](../js/gameCategories.js), [games.js](../js/games.js), [homeMenu.css](../css/homeMenu.css) |
| Pokój, lista graczy, ustawienia i boty | [room.js](../js/room.js), [roomViewPatch.js](../js/roomViewPatch.js), [roomLifecycle.js](../js/roomLifecycle.js), [room.css](../css/room.css), [botController.js](../js/botController.js), [bots.js](../js/bots.js) |
| Zgadnij utwór i Turniej hitów | [songSpot.js](../js/songSpot.js), [playlistTournament.js](../js/playlistTournament.js), [playlistTournamentEngine.js](../js/playlistTournamentEngine.js), [songSpotMobile.css](../css/songSpotMobile.css), [playlistTournament.css](../css/playlistTournament.css) |
| Wspólny katalog utworów i okładki | [tournamentMusic.js](../js/tournamentMusic.js) scala źródła katalogu, [tournamentMusicKey.js](../js/tournamentMusicKey.js) identyfikuje duplikaty, [songSpotLibrary.js](../js/songSpotLibrary.js) i [musicArtwork.js](../js/musicArtwork.js) obsługują bibliotekę oraz okładki |
| Pokémon, Licytacja teamu i Losowanie typów | [pokemon.js](../js/pokemon.js), [pokemonData.js](../js/pokemonData.js), [style.css](../css/style.css) |
| Marker, Impostor i Zgadnij kto | [marker.js](../js/marker.js), [markerDrawing.js](../js/markerDrawing.js), [impostor.js](../js/impostor.js), [hasła Impostora](../content/impostor/words.js), [guessPeople.js](../js/guessPeople.js), [guessPeople.css](../css/guessPeople.css) |
| Droga do Alex | Rozdział 1 ma [widok](../js/alexJourney.js), [logikę](../js/alexJourneyEngine.js) i [dane świata](../js/alexJourneyWorld.js). Rozdział 2 ma [widok](../js/alexJourneyRescueView.js) i [logikę](../js/alexJourneyRescue.js). Rozdział 3 ma [widok](../js/alexJourneySiegeView.js) i [logikę](../js/alexJourneySiege.js). Wspólne są [style](../css/alexJourney.css), [scenki](../js/alexJourneyComic.js) i [podpowiedzi](../js/alexJourneyHints.js). |
| Ostatni plecak | [lastBackpack.js](../js/lastBackpack.js), [lastBackpackEngine.js](../js/lastBackpackEngine.js), pliki `js/backpack*Puzzles.js`, [lastBackpack.css](../css/lastBackpack.css), [opis zagadek](backpack-puzzles.md) |
| Pełny ekran w trybach Minecraft | [gamePresentation.js](../js/gamePresentation.js), [gamePresentation.css](../css/gamePresentation.css) |
| Sklep, ekwipunek i nagrody solo | [shop.js](../js/shop.js), [equipment.js](../js/equipment.js), [gamePasses.js](../js/gamePasses.js), [soloRewards.js](../js/soloRewards.js) |
| Statystyki i sobotnie odblokowania | [globalStats.js](../js/globalStats.js), [soloSiteStats.js](../js/soloSiteStats.js), [weeklyUnlocks.js](../js/weeklyUnlocks.js), [upcomingModes.js](../js/upcomingModes.js) |
| Podstrony publiczne, SEO i backend | [publicPages.js](../js/publicPages.js), [sitemap.xml](../sitemap.xml), [robots.txt](../robots.txt), [firebase.js](../js/firebase.js), [functions/index.js](../functions/index.js) |

## Szybki podgląd i testy

Z katalogu głównego uruchom `python scripts/serveLocal.py`. Przykładowe adresy to `http://127.0.0.1:49322/minecraft-journey` i `http://127.0.0.1:49322/playlista-cup`. Opcja `--port 8768` pozwala wybrać inny port, jeśli ten jest zajęty. Serwer obsługuje lokalnie bezpośrednie wejście na podstronę i zwraca 404 dla brakującego pliku. [JAK_URUCHOMIC.txt](../JAK_URUCHOMIC.txt) zawiera instrukcje istniejącego uruchamiania i konfiguracji gier online.

| Zmiana | Test z katalogu głównego |
| --- | --- |
| Menu | `node --test scripts/testHomeMenu.mjs scripts/testCompactCards.mjs` |
| Rozdziały Alex | `node --test scripts/testAlexJourney.mjs scripts/testAlexJourneyRescue.mjs scripts/testAlexJourneySiege.mjs` |
| Ostatni plecak | `node --test scripts/testLastBackpack.mjs scripts/testBackpackPuzzles.mjs` |
| Muzyka | `node --test scripts/testSongSpotLibrary.mjs scripts/testPlaylistTournament.mjs scripts/testMusicArtwork.mjs` |
| Pokémon | `node --test scripts/testPokemonAuction.mjs scripts/testPokemonTypeDraw.mjs` |
| Impostor i Marker | `node --test scripts/testImpostorVoting.mjs scripts/testImpostorSettings.mjs scripts/testMarker.mjs` |
| Historia aktualizacji i pamięć przeglądarki | `node --test scripts/testChangelog.mjs scripts/testOfflineCache.mjs` |
| SEO, statyczne podstrony i CSS | `node scripts/prerenderPublicPages.mjs` oraz `node --test scripts/testPrerenderPublicPages.mjs` |

Skrypty `verifyAlexJourneyUI.mjs` i `verifyBackpackUI.mjs` korzystają z LinkeDOM wskazanego przez `BACKPACK_DOM_MODULE`. Sprawdzają integrację widoku. Rozmiary, animacje i zachowanie na telefonie najlepiej sprawdzać w przeglądarce. Do szybkiego odtworzenia błędu z obrazka przydaje się nazwa trybu, etap i ostatnia wykonana akcja.

## Wydanie strony

- [index.html](../index.html) zawiera wyświetlaną wersję oraz adresy arkuszy CSS i modułu wejściowego. [service-worker.js](../service-worker.js) przechowuje wersję pamięci podręcznej aplikacji.
- Moduły mają wersjonowane importy `?v=`. W wydaniu odśwież odnośniki do zmienionych plików i do modułów, przez które dochodzi się do nich od punktu wejścia. Zostaw parametry niezwiązanych plików.
- [changelog.js](../js/changelog.js) zawiera wpisy o większych zmianach. Drobne poprawki mogą dostać nowy numer strony i trafić do najbliższego większego wpisu.
- Podstrony z [sitemap.xml](../sitemap.xml) i wspólny arkusz CSS generuje `node scripts/prerenderPublicPages.mjs`. Ten skrypt scala style w kolejności z `scripts/cssBundleSources.json` i zapisuje statyczne HTML-e dla wszystkich adresów mapy.
- Po publikacji sprawdź zarówno numer wydania, jak i działanie dotkniętego ekranu. Zmiany w dokumentacji i lokalnych narzędziach nie potrzebują nowej wersji strony.
