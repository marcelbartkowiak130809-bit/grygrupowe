import { $, boardPlayerStripHtml, escapeHtml, playerMiniHtml, resultPlayerMiniHtml } from "./utils.js?v=20260903-7";
import { Effects } from "./effects.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
const arrayOrEmpty = value => Array.isArray(value) ? value : [];
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const shuffle = items => [...items].sort(() => Math.random() - .5);

export const closestTruthCategories = [
  { id:"geography", name:"Geografia", questions:[
    { text:"Ile kilometrow ma Wisla?", answer:1047, unit:"km" },
    { text:"Ile panstw jest w Europie?", answer:44, unit:"panstw" },
    { text:"Ile kilometrow ma rownik Ziemi?", answer:40075, unit:"km" },
    { text:"Ile metrow wysokosci ma Mount Everest?", answer:8849, unit:"m" },
    { text:"Ile wojewodztw ma Polska?", answer:16, unit:"" },
    { text:"Ile kilometrow ma Nil?", answer:6650, unit:"km" },
    { text:"Ile panstw graniczy z Polska?", answer:7, unit:"panstw" },
    { text:"Ile metrow glebokosci ma Row Marianski?", answer:10984, unit:"m" },
    { text:"Ile kilometrow ma Amazonka?", answer:6400, unit:"km" },
    { text:"Ile kilometrow ma Dunaj?", answer:2850, unit:"km" },
    { text:"Ile metrow wysokosci ma Rysy?", answer:2499, unit:"m" },
    { text:"Ile panstw jest w Unii Europejskiej?", answer:27, unit:"panstw" },
    { text:"Ile kilometrow kwadratowych ma Polska?", answer:312696, unit:"km2" },
    { text:"Ile oceanow jest na Ziemi?", answer:5, unit:"" },
    { text:"Ile kontynentow najczesciej wyroznia sie na Ziemi?", answer:7, unit:"" },
    { text:"Ile kilometrow ma granica Polski?", answer:3511, unit:"km" },
    { text:"Ile metrow wysokosci ma Mont Blanc?", answer:4809, unit:"m" },
    { text:"Ile kilometrow ma rzeka Odra?", answer:854, unit:"km" },
    { text:"Ile panstw lezy w Ameryce Poludniowej?", answer:12, unit:"panstw" },
    { text:"Ile kilometrow kwadratowych ma Sahara?", answer:9200000, unit:"km2" },
    { text:"Ile metrow ponizej poziomu morza lezy powierzchnia Morza Martwego?", answer:430, unit:"m" },
    { text:"Ile kilometrow ma Wielki Mur Chinski wedlug najczestszych szacunkow?", answer:21196, unit:"km" },
    { text:"Ile osob miesci Tauron Arena Krakow podczas duzego koncertu?", answer:22000, unit:"osob" },
    { text:"Ile odcinkow ma serial Simpsonowie?", answer:780, unit:"odcinkow" },
  ] },
  { id:"animals", name:"Zwierzeta", questions:[
    { text:"Ile kilogramow wazy dorosly slon afrykanski?", answer:6000, unit:"kg" },
    { text:"Ile lat moze zyc zolw olbrzymi?", answer:150, unit:"lat" },
    { text:"Ile kilometrow na godzine potrafi biec gepard?", answer:110, unit:"km/h" },
    { text:"Ile serc ma osmiornica?", answer:3, unit:"" },
    { text:"Ile kilogramow moze wazyc pletwal blekitny?", answer:150000, unit:"kg" },
    { text:"Ile dni trwa ciaza slonia?", answer:660, unit:"dni" },
    { text:"Ile zebow ma dorosly rekin bialy naraz?", answer:300, unit:"zebow" },
    { text:"Ile metrow wysokosci ma dorosla zyrafa?", answer:5.5, unit:"m" },
    { text:"Ile nog ma pajak?", answer:8, unit:"" },
    { text:"Ile skrzydel ma pszczola?", answer:4, unit:"" },
    { text:"Ile dni trwa ciaza kota?", answer:64, unit:"dni" },
    { text:"Ile kilogramow moze wazyc dorosly hipopotam?", answer:1500, unit:"kg" },
    { text:"Ile kilometrow na godzine potrafi biec strus?", answer:70, unit:"km/h" },
    { text:"Ile lat moze zyc kot domowy?", answer:15, unit:"lat" },
    { text:"Ile zebow ma dorosly pies?", answer:42, unit:"zeby" },
    { text:"Ile kilogramow moze wazyc dorosly lew?", answer:190, unit:"kg" },
    { text:"Ile centymetrow ma najdluzszy jezyk zyrafy?", answer:50, unit:"cm" },
    { text:"Ile dni trwa ciaza psa?", answer:63, unit:"dni" },
    { text:"Ile metrow dlugosci moze miec anakonda zielona?", answer:6, unit:"m" },
    { text:"Ile kilogramow moze wazyc dorosly tygrys syberyjski?", answer:300, unit:"kg" },
    { text:"Ile razy na sekunde koliber moze machac skrzydlami?", answer:50, unit:"razy" },
    { text:"Ile lat moze zyc kon?", answer:30, unit:"lat" },
  ] },
  { id:"space", name:"Kosmos", questions:[
    { text:"Ile planet ma Uklad Sloneczny?", answer:8, unit:"" },
    { text:"Ile minut leci swiatlo ze Slonca na Ziemie?", answer:8.3, unit:"min" },
    { text:"Ile kilometrow wynosi srednia odleglosc Ziemi od Slonca?", answer:149600000, unit:"km" },
    { text:"Ile ziemskich dni trwa rok na Marsie?", answer:687, unit:"dni" },
    { text:"Ile naturalnych ksiezycow ma Mars?", answer:2, unit:"" },
    { text:"Ile kilometrow srednicy ma Ksiezyc?", answer:3474, unit:"km" },
    { text:"Ile lat swietlnych od Ziemi jest Proxima Centauri?", answer:4.24, unit:"lat sw." },
    { text:"Ile stopni Celsjusza ma srednia temperatura powierzchni Wenus?", answer:464, unit:"C" },
    { text:"Ile naturalnych ksiezycow ma Ziemia?", answer:1, unit:"" },
    { text:"Ile godzin trwa doba na Ziemi?", answer:24, unit:"h" },
    { text:"Ile ziemskich dni trwa rok na Wenus?", answer:225, unit:"dni" },
    { text:"Ile ziemskich dni trwa obrot Wenus wokol osi?", answer:243, unit:"dni" },
    { text:"Ile kilometrow srednicy ma Ziemia?", answer:12742, unit:"km" },
    { text:"Ile kilometrow srednicy ma Slonce?", answer:1392700, unit:"km" },
    { text:"Ile minut trwa pelne zacmienie Slonca maksymalnie w przyblizeniu?", answer:7.5, unit:"min" },
    { text:"Ile glownych pierscieni ma Saturn w uproszczonym podziale?", answer:7, unit:"" },
    { text:"Ile kilometrow na sekunde porusza sie swiatlo?", answer:299792, unit:"km/s" },
    { text:"Ile ziemskich lat trwa obieg Jowisza wokol Slonca?", answer:11.86, unit:"lat" },
    { text:"Ile naturalnych ksiezycow ma Ziemia widocznych golym okiem?", answer:1, unit:"" },
    { text:"Ile kilometrow nad Ziemia zaczyna sie linia Karmana?", answer:100, unit:"km" },
    { text:"Ile osob lecialo w misji Apollo 11?", answer:3, unit:"osoby" },
    { text:"Ile razy czlowiek ladowal na Ksiezycu w misjach Apollo?", answer:6, unit:"razy" },
  ] },
  { id:"history", name:"Historia", questions:[
    { text:"W ktorym roku odbyl sie chrzest Polski?", answer:966, unit:"rok" },
    { text:"W ktorym roku wybuchla II wojna swiatowa?", answer:1939, unit:"rok" },
    { text:"Ile lat trwala I wojna swiatowa?", answer:4, unit:"lata" },
    { text:"W ktorym roku czlowiek pierwszy raz stanal na Ksiezycu?", answer:1969, unit:"rok" },
    { text:"W ktorym roku upadl mur berlinski?", answer:1989, unit:"rok" },
    { text:"Ile lat trwala wojna stuletnia?", answer:116, unit:"lat" },
    { text:"W ktorym roku Polska weszla do Unii Europejskiej?", answer:2004, unit:"rok" },
    { text:"W ktorym roku zakonczyl sie rozbior Polski numer trzy?", answer:1795, unit:"rok" },
    { text:"W ktorym roku wybuchla I wojna swiatowa?", answer:1914, unit:"rok" },
    { text:"W ktorym roku zakonczyla sie II wojna swiatowa w Europie?", answer:1945, unit:"rok" },
    { text:"W ktorym roku podpisano Konstytucje 3 maja?", answer:1791, unit:"rok" },
    { text:"W ktorym roku odbyla sie bitwa pod Grunwaldem?", answer:1410, unit:"rok" },
    { text:"W ktorym roku Polska odzyskala niepodleglosc?", answer:1918, unit:"rok" },
    { text:"W ktorym roku zalozono Rzym wedlug tradycji?", answer:753, unit:"p.n.e." },
    { text:"Ile lat trwala PRL w przyblizeniu od 1944 do 1989?", answer:45, unit:"lat" },
    { text:"W ktorym roku odbyl sie pierwszy rozbior Polski?", answer:1772, unit:"rok" },
    { text:"W ktorym roku odbyl sie drugi rozbior Polski?", answer:1793, unit:"rok" },
    { text:"W ktorym roku koronowano Boleslawa Chrobrego?", answer:1025, unit:"rok" },
    { text:"W ktorym roku wybuchlo powstanie warszawskie?", answer:1944, unit:"rok" },
    { text:"W ktorym roku zaczela sie rewolucja francuska?", answer:1789, unit:"rok" },
    { text:"W ktorym roku Kolumb dotarl do Ameryki?", answer:1492, unit:"rok" },
    { text:"W ktorym roku wynaleziono druk ruchoma czcionka w Europie w przyblizeniu?", answer:1450, unit:"rok" },
  ] },
  { id:"sport", name:"Sport", questions:[
    { text:"Ile minut trwa podstawowy mecz pilki noznej?", answer:90, unit:"min" },
    { text:"Ile zawodnikow jednej druzyny jest na boisku w siatkowce?", answer:6, unit:"" },
    { text:"Ile punktow daje rzut za trzy w koszykowce?", answer:3, unit:"pkt" },
    { text:"Ile kilometrow ma maraton?", answer:42.195, unit:"km" },
    { text:"Ile okrazen ma finalowy bieg na 400 metrow?", answer:1, unit:"okrazenie" },
    { text:"Ile setow trzeba wygrac w meczu tenisowym do 3 wygranych setow?", answer:3, unit:"sety" },
    { text:"Ile metrow ma basen olimpijski?", answer:50, unit:"m" },
    { text:"Ile zawodnikow jednej druzyny gra na parkiecie w koszykowce?", answer:5, unit:"" },
    { text:"Ile minut trwa kwarta w NBA?", answer:12, unit:"min" },
    { text:"Ile minut trwa kwarta w koszykowce FIBA?", answer:10, unit:"min" },
    { text:"Ile metrow ma boisko do pilki noznej w najczestszej dlugosci okolo?", answer:105, unit:"m" },
    { text:"Ile metrow ma rzut karny w pilce noznej?", answer:11, unit:"m" },
    { text:"Ile zawodnikow jednej druzyny gra w pilce recznej na boisku lacznie z bramkarzem?", answer:7, unit:"" },
    { text:"Ile setow trzeba wygrac w siatkowce?", answer:3, unit:"sety" },
    { text:"Ile punktow ma tie-break w siatkowce do zwyciestwa standardowo?", answer:15, unit:"pkt" },
    { text:"Ile kilometrow ma polmaraton?", answer:21.0975, unit:"km" },
    { text:"Ile ringow ma flaga olimpijska?", answer:5, unit:"" },
    { text:"Ile zawodnikow liczy druzyna hokeja na lodzie na tafli razem z bramkarzem?", answer:6, unit:"" },
    { text:"Ile dolek ma standardowa runda golfa?", answer:18, unit:"dolkow" },
    { text:"Ile metrow ma dystans olimpijskiego sprintu na stadionie?", answer:100, unit:"m" },
    { text:"Ile sekund trwa rekordowy bieg na 100 m w przyblizeniu?", answer:9.58, unit:"s" },
    { text:"Ile zawodnikow gra w jednej druzynie baseballowej w obronie?", answer:9, unit:"" },
  ] },
  { id:"technology", name:"Technologia", questions:[
    { text:"W ktorym roku powstal pierwszy iPhone?", answer:2007, unit:"rok" },
    { text:"Ile bitow ma jeden bajt?", answer:8, unit:"bitow" },
    { text:"Ile znakow ma standardowy kod koloru HEX bez znaku #?", answer:6, unit:"znakow" },
    { text:"W ktorym roku powstal YouTube?", answer:2005, unit:"rok" },
    { text:"Ile megabajtow ma jeden gigabajt w zapisie binarnym?", answer:1024, unit:"MB" },
    { text:"Ile klawiszy ma standardowa pelna klawiatura PC?", answer:104, unit:"klawisze" },
    { text:"W ktorym roku wystartowal system Android?", answer:2008, unit:"rok" },
    { text:"Ile pikseli szerokosci ma obraz Full HD?", answer:1920, unit:"px" },
    { text:"Ile pikseli wysokosci ma obraz Full HD?", answer:1080, unit:"px" },
    { text:"Ile pikseli szerokosci ma obraz 4K UHD?", answer:3840, unit:"px" },
    { text:"Ile pikseli wysokosci ma obraz 4K UHD?", answer:2160, unit:"px" },
    { text:"W ktorym roku powstal Facebook?", answer:2004, unit:"rok" },
    { text:"W ktorym roku wystartowal Instagram?", answer:2010, unit:"rok" },
    { text:"W ktorym roku powstal TikTok jako aplikacja Douyin?", answer:2016, unit:"rok" },
    { text:"Ile znakow ma adres IPv4 w bitach?", answer:32, unit:"bity" },
    { text:"Ile bitow ma adres IPv6?", answer:128, unit:"bitow" },
    { text:"Ile bajtow ma kilobajt w zapisie binarnym?", answer:1024, unit:"B" },
    { text:"Ile hercow ma standardowy odswiezacz ekranu 60 Hz?", answer:60, unit:"Hz" },
    { text:"W ktorym roku zaprezentowano pierwszy komputer Macintosh?", answer:1984, unit:"rok" },
    { text:"W ktorym roku wydano Windows 95?", answer:1995, unit:"rok" },
    { text:"Ile cyfr ma najczesciej kod PIN do karty?", answer:4, unit:"cyfry" },
    { text:"Ile megabitow ma jeden gigabit?", answer:1000, unit:"Mb" },
  ] },
  { id:"minecraft", name:"Minecraft", questions:[
    { text:"W ktorym roku wyszla pelna wersja Minecrafta 1.0?", answer:2011, unit:"rok" },
    { text:"Ile przedmiotow miesci standardowy stack w Minecrafcie?", answer:64, unit:"szt." },
    { text:"Ile blokow obsydianu potrzeba minimalnie do portalu do Netheru?", answer:10, unit:"blokow" },
    { text:"Ile diamentow potrzeba do zrobienia diamentowego kilofa?", answer:3, unit:"diamenty" },
    { text:"Ile desek powstaje z jednego bloku drewna?", answer:4, unit:"deski" },
    { text:"Ile kratek ma crafting table?", answer:9, unit:"kratek" },
    { text:"Ile serc ma gracz z pelnym zdrowiem?", answer:10, unit:"serc" },
    { text:"Ile punktow zdrowia ma gracz z pelnym zdrowiem?", answer:20, unit:"HP" },
    { text:"Ile blokow zelaza potrzeba do zbudowania zelaznego golema?", answer:4, unit:"bloki" },
    { text:"Ile sztabek zelaza potrzeba do zrobienia wiadra?", answer:3, unit:"sztabki" },
    { text:"Ile oczu Endera potrzeba maksymalnie do uzupelnienia portalu do Endu?", answer:12, unit:"oczu" },
    { text:"Ile blokow wysokosci ma standardowy Nether portal bez naroznikow?", answer:5, unit:"blokow" },
    { text:"Ile roznych mobow wystepuje obecnie w Minecraft?", answer:85, unit:"mobow" },
  ] },
  { id:"roblox", name:"Roblox", questions:[
    { text:"W ktorym roku Roblox zostal oficjalnie uruchomiony?", answer:2006, unit:"rok" },
    { text:"Ile znakow maksymalnie moze miec nazwa uzytkownika Roblox?", answer:20, unit:"znakow" },
    { text:"Ile znakow minimalnie musi miec nazwa uzytkownika Roblox?", answer:3, unit:"znaki" },
    { text:"Ile Robuxow kosztuje zmiana nazwy uzytkownika Roblox?", answer:1000, unit:"Robux" },
    { text:"Ile slotow akcesoriow na glowe mozna zalozyc naraz w avatarze?", answer:3, unit:"sloty" },
    { text:"Ile glownych czesci ciala ma klasyczny avatar R6?", answer:6, unit:"czesci" },
    { text:"Ile glownych czesci ciala ma avatar R15?", answer:15, unit:"czesci" },
    { text:"Od ilu lat Roblox najczesciej oznacza konta jako 13+?", answer:13, unit:"lat" },
    { text:"Ile liter ma slowo Roblox?", answer:6, unit:"liter" },
    { text:"W ktorym roku Roblox wszedl na gielde?", answer:2021, unit:"rok" },
  ] },
  { id:"fortnite", name:"Fortnite", questions:[
    { text:"W ktorym roku wystartowal Fortnite Battle Royale?", answer:2017, unit:"rok" },
    { text:"Ilu graczy startuje w klasycznym solo Battle Royale?", answer:100, unit:"graczy" },
    { text:"Ile osob liczy standardowy squad w Fortnite?", answer:4, unit:"osoby" },
    { text:"Ile osob liczy duet w Fortnite?", answer:2, unit:"osoby" },
    { text:"Ile paskow tarczy daje pelna tarcza w Fortnite?", answer:100, unit:"pkt" },
    { text:"Ile punktow zdrowia ma gracz bez tarczy?", answer:100, unit:"HP" },
    { text:"Ile slotow na bronie i przedmioty ma standardowy ekwipunek gracza?", answer:5, unit:"slotow" },
    { text:"Ile materialow maksymalnie jednego typu mozna bylo miec w wielu klasycznych trybach budowania?", answer:999, unit:"materialow" },
    { text:"Ile liter ma slowo Fortnite?", answer:8, unit:"liter" },
    { text:"Ile podstawowych typow materialow budowlanych jest w Fortnite?", answer:3, unit:"typy" },
  ] },
  { id:"pokemon", name:"Pokemony", questions:[
    { text:"Ile Pokemonow bylo w pierwszej generacji?", answer:151, unit:"Pokemonow" },
    { text:"Ile Pokemonow moze miec trener w aktywnej druzynie?", answer:6, unit:"Pokemonow" },
    { text:"Ile odznak trzeba zebrac w klasycznych grach, zeby podejsc do ligi?", answer:8, unit:"odznak" },
    { text:"Ile typow Pokemonow istnieje od generacji VI?", answer:18, unit:"typow" },
    { text:"Ile ewolucji Eevee jest najczesciej liczonych w glownej serii?", answer:8, unit:"ewolucji" },
    { text:"Ile form startowych ma podstawowy wybor startera w regionie?", answer:3, unit:"startery" },
    { text:"Ile liter ma imie Pikachu?", answer:7, unit:"liter" },
    { text:"Na ktorym poziomie Charmander ewoluuje w Charmeleona?", answer:16, unit:"poziom" },
    { text:"Na ktorym poziomie Bulbasaur ewoluuje w Ivysaura?", answer:16, unit:"poziom" },
    { text:"Na ktorym poziomie Squirtle ewoluuje w Wartortle?", answer:16, unit:"poziom" },
    { text:"Ile legendarnych ptakow bylo w pierwszej generacji?", answer:3, unit:"ptaki" },
    { text:"Ile etapow ma zwykle pelna linia ewolucji startera?", answer:3, unit:"etapy" },
  ] },
  { id:"games", name:"Gry", questions:[
    { text:"W ktorym roku wyszlo GTA V?", answer:2013, unit:"rok" },
    { text:"W ktorym roku wyszedl pierwszy The Sims?", answer:2000, unit:"rok" },
    { text:"Ile pionkow ma jeden gracz w klasycznym Chinczyku?", answer:4, unit:"pionki" },
    { text:"Ile pol ma plansza w szachach?", answer:64, unit:"pola" },
    { text:"Ile figur ma jeden gracz na starcie partii szachow?", answer:16, unit:"figur" },
    { text:"Ile kart ma standardowa talia bez jokerow?", answer:52, unit:"karty" },
    { text:"Ile kolorow ma kostka Rubika 3x3?", answer:6, unit:"kolorow" },
    { text:"Ile malych kostek widac na jednej scianie kostki Rubika 3x3?", answer:9, unit:"kostek" },
    { text:"Ile graczy maksymalnie gra w standardowym Among Us lobby?", answer:15, unit:"graczy" },
    { text:"W ktorym roku wyszlo Among Us?", answer:2018, unit:"rok" },
    { text:"Ile map bylo w Among Us przed dodaniem Airship?", answer:3, unit:"mapy" },
    { text:"Ile kart na rece dostaje gracz na poczatku rundy UNO?", answer:7, unit:"kart" },
  ] },
  { id:"internet", name:"Internet", questions:[
    { text:"W ktorym roku wystartowal YouTube?", answer:2005, unit:"rok" },
    { text:"W ktorym roku wystartowal Instagram?", answer:2010, unit:"rok" },
    { text:"W ktorym roku powstal Facebook?", answer:2004, unit:"rok" },
    { text:"Ile znakow mial dawny podstawowy limit tweeta na Twitterze?", answer:140, unit:"znakow" },
    { text:"Ile znakow ma standardowy kod koloru HEX bez #?", answer:6, unit:"znakow" },
    { text:"Ile cyfr ma najczesciej kod 2FA z aplikacji?", answer:6, unit:"cyfr" },
    { text:"Ile sekund ma klasyczny krotki filmik Vine?", answer:6, unit:"s" },
    { text:"Ile bitow ma adres IPv4?", answer:32, unit:"bity" },
    { text:"Ile bitow ma adres IPv6?", answer:128, unit:"bitow" },
    { text:"Ile bajtow ma kilobajt w zapisie binarnym?", answer:1024, unit:"B" },
  ] },
  { id:"daily-life", name:"Zycie codzienne", questions:[
    { text:"Ile minut ma doba?", answer:1440, unit:"min" },
    { text:"Ile sekund ma godzina?", answer:3600, unit:"s" },
    { text:"Ile dni ma zwykly rok?", answer:365, unit:"dni" },
    { text:"Ile dni ma rok przestepny?", answer:366, unit:"dni" },
    { text:"Ile tygodni ma rok w przyblizeniu?", answer:52, unit:"tyg." },
    { text:"Ile miesiecy ma rok?", answer:12, unit:"mies." },
    { text:"Ile groszy ma jedna zlotowka?", answer:100, unit:"gr" },
    { text:"Ile centymetrow ma metr?", answer:100, unit:"cm" },
    { text:"Ile gramow ma kilogram?", answer:1000, unit:"g" },
    { text:"Ile mililitrow ma litr?", answer:1000, unit:"ml" },
  ] },
  { id:"school", name:"Szkola", questions:[
    { text:"Ile minut trwa typowa lekcja w polskiej szkole?", answer:45, unit:"min" },
    { text:"Ile klas ma szkola podstawowa w Polsce?", answer:8, unit:"klas" },
    { text:"Ile lat trwa zwykle liceum ogolnoksztalcace?", answer:4, unit:"lata" },
    { text:"Ile lat trwa zwykle technikum?", answer:5, unit:"lat" },
    { text:"Ile procent to polowa oceny maksymalnej?", answer:50, unit:"%" },
    { text:"Ile bokow ma trojkat?", answer:3, unit:"boki" },
    { text:"Ile stopni ma kat prosty?", answer:90, unit:"stopni" },
    { text:"Ile stopni ma suma katow w trojkacie?", answer:180, unit:"stopni" },
    { text:"Ile wynosi liczba pi w zaokragleniu do dwoch miejsc?", answer:3.14, unit:"" },
    { text:"Ile kontynentow zwykle omawia sie w szkolnej geografii?", answer:7, unit:"" },
  ] },
  { id:"food", name:"Jedzenie", questions:[
    { text:"Ile kawalkow ma zwykle pizza pokrojona klasycznie w pizzerii?", answer:8, unit:"kawalkow" },
    { text:"Ile gramow ma standardowa tabliczka czekolady?", answer:100, unit:"g" },
    { text:"Ile mililitrow ma mala puszka napoju energetycznego?", answer:250, unit:"ml" },
    { text:"Ile mililitrow ma standardowa puszka napoju?", answer:330, unit:"ml" },
    { text:"Ile litrow ma duza butelka coli?", answer:2, unit:"l" },
    { text:"Ile gramow ma kilogram ziemniakow?", answer:1000, unit:"g" },
    { text:"Ile jajek miesci standardowa mala wytlaczanka?", answer:6, unit:"jajek" },
    { text:"Ile jajek miesci standardowa duza wytlaczanka?", answer:10, unit:"jajek" },
    { text:"Ile kalorii ma gram bialka w przyblizeniu?", answer:4, unit:"kcal" },
    { text:"Ile kalorii ma gram tluszczu w przyblizeniu?", answer:9, unit:"kcal" },
  ] },
  { id:"movies-series", name:"Filmy i seriale", questions:[
    { text:"Ile minut trwa typowy odcinek sitcomu bez reklam?", answer:22, unit:"min" },
    { text:"Ile sezonow ma serial Breaking Bad?", answer:5, unit:"sezonow" },
    { text:"Ile filmow ma glowna trylogia Wladcy Pierscieni?", answer:3, unit:"filmy" },
    { text:"Ile czesci ma filmowa trylogia Hobbit?", answer:3, unit:"filmy" },
    { text:"W ktorym roku wyszedl pierwszy film Harry Potter?", answer:2001, unit:"rok" },
    { text:"Ile glownych filmow Harry Potter powstalo w oryginalnej serii?", answer:8, unit:"filmow" },
    { text:"W ktorym roku wyszedl pierwszy Shrek?", answer:2001, unit:"rok" },
    { text:"Ile Oscarow zdobyl film Titanic?", answer:11, unit:"Oscarow" },
    { text:"Ile minut trwa jedna godzina filmu?", answer:60, unit:"min" },
    { text:"Ile klatek na sekunde ma klasyczne kino filmowe?", answer:24, unit:"fps" },
  ] },
  { id:"science", name:"Nauka", questions:[
    { text:"Ile litrow krwi krazy w ciele doroslego czlowieka?", answer:5, unit:"l" },
    { text:"Ile kilometrow ma najdluzsza znana jaskinia swiata?", answer:680, unit:"km" },
    { text:"Ile ton moze wazyc dorosly tyranozaur wedlug szacunkow?", answer:9000, unit:"kg" },
    { text:"Ile lat ma najstarsze znane drzewo klonalne?", answer:9550, unit:"lat" },
    { text:"Ile procent powierzchni Ziemi pokrywaja oceany?", answer:71, unit:"%" },
    { text:"Ile kilometrow ma najglebsza znana kopalnia na swiecie?", answer:4, unit:"km" },
    { text:"Ile stopni Celsjusza ma temperatura blysku pioruna?", answer:30000, unit:"C" },
    { text:"Ile kilogramow wody moze jednorazowo wypic wielblad?", answer:135, unit:"kg" },
    { text:"Ile metrow moze miec najwiekszy znany kalmar?", answer:13, unit:"m" },
    { text:"Ile lat trwala najdluzsza opisana erupcja wulkanu?", answer:200, unit:"lat" },
    { text:"Ile procent tlenu zawiera powietrze przy powierzchni Ziemi?", answer:21, unit:"%" },
    { text:"Ile kilometrow moze przejsc chmura pylu po wybuchu wulkanu?", answer:10000, unit:"km" },
    { text:"Ile milionow lat temu pojawily sie pierwsze dinozaury?", answer:230, unit:"mln lat" },
    { text:"Ile litrow wody moze przefiltrowac dorosla ostryga w ciagu dnia?", answer:190, unit:"l" },
    { text:"Ile metrow ma najwiekszy znany koralowiec?", answer:500, unit:"m" },
  ] },
  { id:"travel", name:"Podroze", questions:[
    { text:"Ile kilometrow ma trasa kolei transsyberyjskiej?", answer:9289, unit:"km" },
    { text:"Ile metrow pod ziemia znajduje sie najglebsza stacja metra?", answer:105, unit:"m" },
    { text:"Ile kilometrow ma najdluzszy most drogowy na swiecie?", answer:164, unit:"km" },
    { text:"Ile osob rocznie odwiedza Paryz w przyblizeniu?", answer:38000000, unit:"osob" },
    { text:"Ile kilometrow ma obwodnica wyspy Islandia?", answer:1332, unit:"km" },
    { text:"Ile schodow prowadzi na szczyt wiezy Eiffla dostepny dla turystow?", answer:1665, unit:"schodow" },
    { text:"Ile metrow ma najwyzszy wodospad swiata?", answer:979, unit:"m" },
    { text:"Ile kilometrow ma najdluzszy tunel kolejowy?", answer:57, unit:"km" },
    { text:"Ile wysp obejmuje archipelag Filipin?", answer:7640, unit:"wysp" },
    { text:"Ile kilometrow ma najdluzsza linia brzegowa Kanady?", answer:202000, unit:"km" },
    { text:"Ile metrow ma najwyzszy budynek w Dubaju?", answer:828, unit:"m" },
    { text:"Ile kilometrow ma trasa maratonu na Wielkim Murze?", answer:42, unit:"km" },
    { text:"Ile osob miesci najwiekszy pasazerski samolot?", answer:853, unit:"osob" },
    { text:"Ile kilometrow wynosi najdluzszy lot rejsowy bez miedzyladowania?", answer:19500, unit:"km" },
    { text:"Ile metrow ma najwyzszy posag na swiecie?", answer:182, unit:"m" },
  ] },
  { id:"music", name:"Muzyka", questions:[
    { text:"Ile minut trwa najdluzsza oficjalnie wydana piosenka?", answer:1380, unit:"min" },
    { text:"Ile strun ma standardowy fortepian koncertowy?", answer:230, unit:"strun" },
    { text:"Ile osob liczy najwieksza orkiestra symfoniczna?", answer:1000, unit:"osob" },
    { text:"Ile minut trwa typowy koncert symfoniczny z przerwa?", answer:120, unit:"min" },
    { text:"Ile plyt sprzedal Michael Jackson na calym swiecie w przyblizeniu?", answer:400000000, unit:"plyt" },
    { text:"Ile utworow ma najdluzszy album studyjny wydany jako jedna plyta?", answer:100, unit:"utworow" },
    { text:"Ile decybeli moze miec koncert rockowy przy scenie?", answer:120, unit:"dB" },
    { text:"Ile kilometrow tasmy zuzyto do nagrania najdluzszego mixtape'u?", answer:2, unit:"km" },
    { text:"Ile osob spiewalo jednoczesnie w najwiekszym chorzystycznym wydarzeniu?", answer:120000, unit:"osob" },
    { text:"Ile sekund trwa najkrotszy utwor wydany komercyjnie?", answer:1, unit:"s" },
    { text:"Ile koncertow zagrala trasa Taylor Swift The Eras Tour?", answer:149, unit:"koncertow" },
    { text:"Ile instrumentow gra przecietnie pelna orkiestra symfoniczna?", answer:80, unit:"instrumentow" },
    { text:"Ile minut trwala najdluzsza transmisja koncertu na zywo?", answer:720, unit:"min" },
    { text:"Ile sprzedanych plyt potrzeba mniej wiecej do statusu diamentowej plyty w USA?", answer:10000000, unit:"plyt" },
    { text:"Ile osob obejrzalo najwiekszy koncert online w momencie szczytowym?", answer:23000000, unit:"osob" },
  ] },
  { id:"poland", name:"Polska", questions:[
    { text:"Ile osob mieszka w Warszawie?", answer:1860000, unit:"osob" },
    { text:"Ile kilometrow ma linia brzegowa Polski?", answer:770, unit:"km" },
    { text:"Ile metrow ma najwyzszy budynek w Polsce?", answer:310, unit:"m" },
    { text:"Ile kilometrow ma najdluzsza trasa rowerowa w Polsce?", answer:2000, unit:"km" },
    { text:"Ile lat ma najstarszy dab w Polsce?", answer:760, unit:"lat" },
    { text:"Ile osob odwiedza rocznie Wawel?", answer:5000000, unit:"osob" },
    { text:"Ile kilometrow ma Tatry w granicach Polski?", answer:175, unit:"km" },
    { text:"Ile metrow ma najglebsze jezioro w Polsce?", answer:108, unit:"m" },
    { text:"Ile kilometrow ma najdluzsza polska rzeka liczona w Polsce?", answer:1047, unit:"km" },
    { text:"Ile ton bursztynu wydobywa sie w Polsce rocznie?", answer:10, unit:"ton" },
    { text:"Ile osob miesci Stadion Narodowy podczas koncertu?", answer:73000, unit:"osob" },
    { text:"Ile kilometrow ma najdluzszy tunel drogowy w Polsce?", answer:2.3, unit:"km" },
    { text:"Ile litrow wody miesci Zalew Wislany w przyblizeniu?", answer:2.3e9, unit:"l" },
    { text:"Ile osob odwiedza rocznie polskie parki narodowe?", answer:14000000, unit:"osob" },
    { text:"Ile kilometrow ma najdluzsza granica Polski z jednym panstwem?", answer:790, unit:"km" },
  ] },
];

const rejectedQuestionPatterns = [
  /gramow ma kilogram/i, /centymetrow ma metr/i, /mililitrow ma litr/i,
  /sekund ma godzina/i, /minut ma doba/i, /miesiecy ma rok/i,
  /dni ma zwykly rok/i, /dni ma rok przestepny/i, /bokow ma trojkat/i,
  /stopni ma kat prosty/i, /sume katow w trojkacie/i, /bitow ma jeden bajt/i,
  /pionkow ma jeden gracz/i, /kart ma standardowa talia/i, /kolorow ma kostka Rubika/i,
  /liter ma slowo (Roblox|Fortnite|Pikachu)/i, /znakow ma standardowy kod koloru/i,
  /punktow daje rzut za trzy/i, /zawodnikow jednej druzyny.*siatkowce/i,
  /zawodnikow jednej druzyny.*koszykowce/i, /osob liczy duet/i,
];

for (const category of closestTruthCategories) {
  category.questions = category.questions.filter(question => !rejectedQuestionPatterns.some(pattern => pattern.test(question.text)));
}

export const closestTruthDefaults = {
  rounds:8,
  targetScore:20,
  categories:["geography","animals","space","history","sport","technology"],
};

const categoryMap = Object.fromEntries(closestTruthCategories.map(category => [category.id, category]));
const minCategories = 3;

export function sanitizeClosestTruthSettings(raw = {}) {
  const selected = [...new Set(arrayOrEmpty(raw.categories).filter(id => categoryMap[id]))];
  const categories = selected.length >= minCategories ? selected : closestTruthDefaults.categories.slice(0, minCategories);
  return {
    ...closestTruthDefaults,
    ...raw,
    rounds:clamp(raw.rounds || closestTruthDefaults.rounds, 3, 20),
    targetScore:clamp(raw.targetScore || closestTruthDefaults.targetScore, 5, 80),
    categories,
  };
}

function questionPool(settings, used = []) {
  const blocked = new Set(arrayOrEmpty(used));
  const selected = sanitizeClosestTruthSettings(settings).categories;
  const pool = selected.flatMap(id => (categoryMap[id]?.questions || []).map((question, index) => ({ ...question, id:`${id}:${index}`, categoryId:id, categoryName:categoryMap[id].name })));
  const fresh = pool.filter(question => !blocked.has(question.id));
  return fresh.length ? fresh : pool;
}

function chooseQuestion(settings, used) {
  const pool = questionPool(settings, used);
  return pool[Math.floor(Math.random() * pool.length)] || questionPool(closestTruthDefaults, [])[0];
}

function scoreRows(game, players) {
  const answer = Number(game.question?.answer) || 0;
  const rows = players.map(uid => {
    const value = Number(game.answers?.[uid]);
    const distance = Math.abs(value - answer);
    return { uid, value, distance:Number.isFinite(distance) ? distance : Infinity };
  }).sort((a, b) => a.distance - b.distance || a.value - b.value);
  let place = 0;
  let previousDistance = null;
  return rows.map((row, index) => {
    if (previousDistance === null || row.distance !== previousDistance) place = index + 1;
    previousDistance = row.distance;
    return { ...row, place, points:Math.max(1, players.length - place + 1) };
  });
}

function createRound(players, settings, round, scores = {}, usedQuestions = []) {
  const question = chooseQuestion(settings, usedQuestions);
  return {
    phase:"answering",
    round,
    question,
    usedQuestions:[...arrayOrEmpty(usedQuestions), question.id],
    answers:{},
    scores:{ ...Object.fromEntries(players.map(uid => [uid, 0])), ...scores },
    roundScores:{},
    ranking:[],
    revealedAt:null,
  };
}

export function createClosestTruthGame(players, rawSettings) {
  return createRound(players, sanitizeClosestTruthSettings(rawSettings), 1);
}

function normalize(game, players = []) {
  game.answers = objectOrEmpty(game.answers);
  game.scores = objectOrEmpty(game.scores);
  game.roundScores = objectOrEmpty(game.roundScores);
  game.ranking = arrayOrEmpty(game.ranking).filter(row => players.includes(row.uid));
  game.usedQuestions = arrayOrEmpty(game.usedQuestions);
  players.forEach(uid => { if (!(uid in game.scores)) game.scores[uid] = 0; });
  Object.keys(game.scores).forEach(uid => { if (!players.includes(uid)) delete game.scores[uid]; });
  Object.keys(game.answers).forEach(uid => { if (!players.includes(uid)) delete game.answers[uid]; });
  return game;
}

function finishRound(game, players, settings) {
  const ranking = scoreRows(game, players);
  game.ranking = ranking;
  game.roundScores = {};
  ranking.forEach(row => {
    game.roundScores[row.uid] = row.points;
    game.scores[row.uid] = Number(game.scores?.[row.uid] || 0) + row.points;
  });
  game.phase = "roundResult";
  game.revealedAt = Date.now();
  const maxScore = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  if (Number(game.round) >= Number(settings.rounds) || maxScore >= Number(settings.targetScore)) {
    game.phase = "gameSummary";
    game.result = { gameOver:true };
  }
}

export const ClosestTruthEngine = {
  answer(game, uid, rawValue, players, rawSettings) {
    const settings = sanitizeClosestTruthSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "answering") return "Ta runda juz jest zamknieta.";
    if (!players.includes(uid)) return "Nie ma cie w tej rundzie.";
    if (uid in game.answers) return "Twoja odpowiedz juz jest zapisana.";
    const normalized = String(rawValue ?? "").trim().replace(",", ".");
    if (!normalized) return "Wpisz liczbe.";
    const value = Number(normalized);
    if (!Number.isFinite(value)) return "To musi byc liczba.";
    game.answers[uid] = value;
    if (players.every(player => player in game.answers)) finishRound(game, players, settings);
    return null;
  },
  nextRound(game, players, rawSettings) {
    const settings = sanitizeClosestTruthSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "roundResult") return "Najpierw trzeba odslonic wyniki rundy.";
    Object.assign(game, createRound(players, settings, Number(game.round || 1) + 1, game.scores, game.usedQuestions));
    return null;
  },
};

export function renderClosestTruthLobbySettings(room, isHost) {
  const settings = sanitizeClosestTruthSettings(room.settings);
  const selected = settings.categories;
  return `<div class="impostor-settings-grid truth-settings-grid">
    <label>Liczba rund<select data-truth-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,8,10,12,15,20].map(n => `<option value="${n}" ${settings.rounds === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label>Punkty do wygranej<select data-truth-setting="targetScore" ${isHost ? "" : "disabled"}>${[10,15,20,25,30,40,60,80].map(n => `<option value="${n}" ${settings.targetScore === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <div class="most-category-box"><b>Kategorie</b><small>minimum ${minCategories}, baza: ${closestTruthCategories.reduce((sum, category) => sum + category.questions.length, 0)} pytan</small><div class="multi-category-list">${closestTruthCategories.map(category => {
      const disabled = !isHost || selected.includes(category.id) && selected.length <= minCategories;
      return `<label class="check category-chip"><input data-truth-category="${category.id}" type="checkbox" ${selected.includes(category.id) ? "checked" : ""} ${disabled ? "disabled" : ""}> <span>${escapeHtml(category.name)}</span><span class="category-count">${category.questions.length}</span></label>`;
    }).join("")}</div></div>
  </div>`;
}

const numberText = (value, unit = "") => `${Number(value).toLocaleString("pl-PL", { maximumFractionDigits:3 })}${unit ? ` ${escapeHtml(unit)}` : ""}`;

function answerForm(game, currentUser) {
  if (currentUser in objectOrEmpty(game.answers)) return `<div class="waiting-state truth-waiting"><span class="waiting-pulse">OK</span><h3>Odpowiedz zapisana</h3><p>Czekamy na reszte ekipy.</p></div>`;
  return `<form id="truth-answer-form" class="truth-answer-form"><input id="truth-answer-input" type="number" step="any" placeholder="Twoja liczba..." autocomplete="off" autofocus><button class="primary">Zatwierdz</button></form>`;
}

function answeringStage(room, accounts, currentUser, game) {
  const answered = Object.keys(game.answers || {}).length;
  return `<section class="truth-stage">
    <div class="truth-question-card">
      <p class="eyebrow">${escapeHtml(game.question?.categoryName || "Kategoria")} - runda ${Number(game.round) || 1}</p>
      <h1>${escapeHtml(game.question?.text || "Pytanie liczbowe")}</h1>
      <div class="truth-progress"><span style="width:${Math.round(answered / Math.max(1, room.players.length) * 100)}%"></span></div>
      <small>${answered}/${room.players.length} odpowiedzi</small>
    </div>
    <div class="truth-answer-grid">${room.players.map(uid => `<article class="${uid in objectOrEmpty(game.answers) ? "answered" : ""}">${playerMiniHtml(accounts[uid])}<b>${uid in objectOrEmpty(game.answers) ? "Gotowe" : "Mysli..."}</b></article>`).join("")}</div>
    ${answerForm(game, currentUser)}
  </section>`;
}

function resultStage(room, accounts, game) {
  const ranking = arrayOrEmpty(game.ranking);
  const maxDistance = Math.max(1, ...ranking.map(row => Number(row.distance) || 0));
  return `<section class="truth-stage truth-reveal">
    <div class="truth-question-card reveal-card">
      <p class="eyebrow">${escapeHtml(game.question?.categoryName || "Kategoria")} - odpowiedz</p>
      <h1>${numberText(game.question?.answer, game.question?.unit)}</h1>
      <p>${escapeHtml(game.question?.text || "")}</p>
    </div>
    <div class="truth-bars">${ranking.map((row, index) => {
      const closeness = Math.max(0, Math.round((1 - (Number(row.distance) || 0) / maxDistance) * 100));
      return `<article class="${index === 0 ? "closest" : ""}" style="--truth:${closeness}">
        <div class="truth-bar-head"><b>#${row.place}</b>${resultPlayerMiniHtml(accounts[row.uid], Number(row.points) > 0 ? "win" : "lose")}<strong>+${row.points} pkt</strong></div>
        <div class="truth-scale"><span></span></div>
        <div class="truth-values"><span>${numberText(row.value, game.question?.unit)}</span><span>roznica: ${numberText(row.distance, game.question?.unit)}</span></div>
      </article>`;
    }).join("")}</div>
    <div class="truth-round-ranking final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index,rows)=>{const topScore=Math.max(0,...rows.map(player=>Number(game.scores?.[player]||0)));return `<article class="${Number(game.scores?.[uid]||0)===topScore&&topScore>0?"winner-card":""}"><b>#${index + 1}</b>${resultPlayerMiniHtml(accounts[uid], Number(game.scores?.[uid]||0)===topScore&&topScore>0 ? "win" : "lose")}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`;}).join("")}</div>
    <button class="primary" id="truth-next-round">Nastepna runda</button>
  </section>`;
}

function summaryStage(room, accounts, game) {
  const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  const winners = room.players.filter(uid => Number(game.scores?.[uid] || 0) === max);
  Effects.play("roundWin", `${room.roomId}:truth:summary`);
  return `<section class="truth-stage truth-summary"><p class="eyebrow">KONIEC GRY</p><h1>${winners.map(uid => escapeHtml(accounts[uid]?.nick || "Gracz")).join(", ")} najblizej prawdy</h1><div class="final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${winners.includes(uid) ? "winner-card" : ""}"><b>#${index + 1}</b>${resultPlayerMiniHtml(accounts[uid], winners.includes(uid) ? "win" : "lose")}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div><button class="primary" id="truth-lobby">Wroc do lobby</button></section>`;
}

export function renderClosestTruthGame(root, { room, accounts, currentUser }, actions) {
  const game = normalize(room.game, room.players);
  const activeScores = game.scores || {};
  const stage = game.phase === "answering" ? answeringStage(room, accounts, currentUser, game) : game.phase === "roundResult" ? resultStage(room, accounts, game) : summaryStage(room, accounts, game);
  root.innerHTML = `<main class="page truth-page board-shell enter">${boardPlayerStripHtml(room.players, accounts, { scores:activeScores })}${stage}<button class="ghost leave-game" id="leave-room">Wyjdz z pokoju</button></main>`;
  $("#leave-room")?.addEventListener("click", actions.leaveRoom);
  $("#truth-answer-form")?.addEventListener("submit", event => {
    event.preventDefault();
    actions.closestTruthAnswer($("#truth-answer-input")?.value || "");
  });
  $("#truth-answer-input")?.focus();
  $("#truth-next-round")?.addEventListener("click", actions.closestTruthNext);
  $("#truth-lobby")?.addEventListener("click", actions.returnToRoom);
}
