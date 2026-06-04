// Dopisuj pytania do odpowiedniej tablicy group("Kategoria", [...]) lub dodaj nową grupę.
const group = (category, prompts) => prompts.map(text => ({ category, text }));

export const mostLikelyPrompts = [
  ...group("Szkoła", [
    "Kto najprędzej zaśnie na pierwszej lekcji?", "Kto najprędzej zapomni o sprawdzianie?",
    "Kto najprędzej odda pustą kartkę i powie, że było łatwo?", "Kto najprędzej zaprzyjaźni się z nauczycielem?",
    "Kto najprędzej przyjdzie bez plecaka?", "Kto najprędzej zacznie odrabiać pracę domową minutę przed lekcją?",
    "Kto najprędzej zgłosi się, nie znając odpowiedzi?", "Kto najprędzej pomyli sale i zauważy to po kwadransie?",
  ]),
  ...group("Impreza", [
    "Kto najprędzej zaśnie na imprezie?", "Kto najprędzej pierwszy zacznie tańczyć?",
    "Kto najprędzej zamówi jedzenie dla całej ekipy?", "Kto najprędzej przejmie playlistę?",
    "Kto najprędzej zacznie opowiadać historię, którą wszyscy już znają?", "Kto najprędzej zniknie bez pożegnania?",
    "Kto najprędzej zrobi sto zdjęć jednego wieczoru?", "Kto najprędzej pomyli godzinę spotkania?",
  ]),
  ...group("Internet", [
    "Kto najprędzej zostanie viralem przez przypadek?", "Kto najprędzej odpisze memem zamiast odpowiedzi?",
    "Kto najprędzej spędzi trzy godziny na scrollowaniu?", "Kto najprędzej uwierzy w absurdalny clickbait?",
    "Kto najprędzej wyśle wiadomość na złą grupę?", "Kto najprędzej ma najwięcej nieprzeczytanych powiadomień?",
    "Kto najprędzej zacznie oglądać filmiki o trzeciej w nocy?", "Kto najprędzej zmieni zdjęcie profilowe pięć razy w tygodniu?",
  ]),
  ...group("Gaming", [
    "Kto najprędzej ragequitnie z gry?", "Kto najprędzej kupi skina zamiast obiadu?",
    "Kto najprędzej powie jeszcze jedna gra i zagra pięć?", "Kto najprędzej zgubi się na prostej mapie?",
    "Kto najprędzej wybierze najwyższy poziom trudności?", "Kto najprędzej będzie udawać, że lagował?",
    "Kto najprędzej przeczyta cały poradnik przed startem?", "Kto najprędzej zaprzyjaźni się z losową osobą z lobby?",
  ]),
  ...group("Znajomi", [
    "Kto najprędzej zacznie się śmiać w złym momencie?", "Kto najprędzej zapomni po co wszedł do pokoju?",
    "Kto najprędzej zaplanuje wspólny wyjazd?", "Kto najprędzej odpisze po trzech dniach jak gdyby nigdy nic?",
    "Kto najprędzej zrobi najlepszy prezent?", "Kto najprędzej zdradzi zakończenie filmu przez przypadek?",
    "Kto najprędzej zna wszystkie plotki?", "Kto najprędzej uratuje ekipę w kryzysie?",
  ]),
  ...group("Dziwne", [
    "Kto najprędzej zacznie rozmawiać z rośliną?", "Kto najprędzej nada imię swojemu odkurzaczowi?",
    "Kto najprędzej zje dziwne połączenie jedzenia i je poleci?", "Kto najprędzej założy dwie różne skarpetki i tego nie zauważy?",
    "Kto najprędzej wyjedzie spontanicznie do losowego miasta?", "Kto najprędzej wygra konkurs wiedzy o zupełnie niepotrzebnej rzeczy?",
    "Kto najprędzej zacznie kolekcjonować coś absurdalnego?", "Kto najprędzej ma najbardziej nietypowy ukryty talent?",
  ]),
  ...group("Spicy lekko", [
    "Kto najprędzej napisze pierwszy po randce?", "Kto najprędzej zakocha się od pierwszego wejrzenia?",
    "Kto najprędzej ma najwięcej tajnych crushów?", "Kto najprędzej zgubi wątek rozmowy przez czyjś uśmiech?",
    "Kto najprędzej pójdzie na randkę w ciemno?", "Kto najprędzej flirtuje, nawet o tym nie wiedząc?",
    "Kto najprędzej wróci do byłej lub byłego?", "Kto najprędzej dostanie romantyczną wiadomość od nieznajomej osoby?",
  ]),
  ...group("Codzienne", [
    "Kto najprędzej zgubi telefon?", "Kto najprędzej wyda wszystkie pieniądze na głupoty?",
    "Kto najprędzej spóźni się, mieszkając najbliżej?", "Kto najprędzej zapomni hasła do własnego konta?",
    "Kto najprędzej zamówi jedzenie zamiast coś ugotować?", "Kto najprędzej obejrzy cały serial w jeden dzień?",
    "Kto najprędzej wyłączy budzik i zaśnie ponownie?", "Kto najprędzej kupi coś tylko dlatego, że było na promocji?",
  ]),
  ...group("Minecraft i Roblox", [
    "Kto najprędzej wykopie diament i od razu wpadnie do lawy?", "Kto najprędzej zbuduje dom z ziemi i nazwie go bazą?",
    "Kto najprędzej oswoi sto wilków w Minecraft?", "Kto najprędzej przestraszy się creepera bardziej niż horroru?",
    "Kto najprędzej wyda Robuxy na kompletnie niepotrzebny item?", "Kto najprędzej utknie na prostym obby?",
    "Kto najprędzej zostanie adminem serwera?", "Kto najprędzej zacznie kłócić się o podział diamentów?",
    "Kto najprędzej zrobi nocny maraton Minecrafta?", "Kto najprędzej wybierze najdziwniejszy avatar w Roblox?",
  ]),
  ...group("Twórcy i social media", [
    "Kto najprędzej założy kanał na YouTube?", "Kto najprędzej nagra viralowego shorta przez przypadek?",
    "Kto najprędzej spotka ulubionego twórcę i nie powie ani słowa?", "Kto najprędzej zostanie streamerem?",
    "Kto najprędzej przeczyta wszystkie komentarze pod swoim filmem?", "Kto najprędzej zrobi clickbaitowy tytuł?",
    "Kto najprędzej wkręci całą ekipę w nagrywanie filmu?", "Kto najprędzej zapomni wyłączyć mikrofon na streamie?",
  ]),
];

mostLikelyPrompts.push(
  ...group("Ekipa", [
    "Kto najprędzej zorganizuje spontaniczny wyjazd?", "Kto najprędzej odwoła plan pięć minut przed spotkaniem?",
    "Kto najprędzej zrobi najlepszą playlistę na imprezę?", "Kto najprędzej zaśnie podczas nocnego maratonu?",
    "Kto najprędzej zgubi klucze podczas wspólnego wyjścia?", "Kto najprędzej rozbawi wszystkich w złym momencie?",
    "Kto najprędzej wymyśli najlepszy inside joke?", "Kto najprędzej napisze na grupie o trzeciej w nocy?"
  ]),
  ...group("Minecraft i Roblox", [
    "Kto najprędzej oswoi sto wilków w Minecraft?", "Kto najprędzej zbuduje dom z samych diamentów?",
    "Kto najprędzej wpadnie do lawy z całym ekwipunkiem?", "Kto najprędzej przestraszy się creepera za plecami?",
    "Kto najprędzej wyda wszystkie Robuxy na jeden avatar?", "Kto najprędzej stworzy popularną grę na Roblox?",
    "Kto najprędzej przejdzie najtrudniejsze obby?", "Kto najprędzej zamieszka w wiosce villagerów?"
  ]),
  ...group("Pokémon i nostalgia", [
    "Kto najprędzej rozpozna najwięcej Pokémonów?", "Kto najprędzej wybrałby Pikachu jako kompana?",
    "Kto najprędzej kolekcjonowałby karty Pokémon?", "Kto najprędzej zostałby trenerem Pokémon?",
    "Kto najprędzej obejrzy stare bajki z dzieciństwa?", "Kto najprędzej kupi rzecz tylko przez nostalgię?",
    "Kto najprędzej pamięta tekst starej czołówki bajki?", "Kto najprędzej odpali grę z dzieciństwa na cały wieczór?"
  ]),
  ...group("Filmy i seriale", [
    "Kto najprędzej obejrzy cały serial w jeden weekend?", "Kto najprędzej zdradzi spoiler przez przypadek?",
    "Kto najprędzej zaśnie w kinie?", "Kto najprędzej obejrzy Shreka po raz setny?",
    "Kto najprędzej zapamięta wszystkie cytaty z filmu?", "Kto najprędzej wybierze horror i potem będzie się bać?",
    "Kto najprędzej przebierze się za postać z filmu?", "Kto najprędzej będzie płakać na animacji?"
  ]),
  ...group("Jedzenie", [
    "Kto najprędzej zamówi pizzę o północy?", "Kto najprędzej zje frytki wszystkim znajomym?",
    "Kto najprędzej spróbuje najdziwniejszego smaku lodów?", "Kto najprędzej spali nawet wodę na herbatę?",
    "Kto najprędzej wygra konkurs jedzenia pierogów?", "Kto najprędzej zamówi zawsze to samo?",
    "Kto najprędzej zrobi najlepsze naleśniki?", "Kto najprędzej podzieli się ostatnim kawałkiem pizzy?"
  ]),
  ...group("Podróże", [
    "Kto najprędzej spakuje się pięć minut przed wyjazdem?", "Kto najprędzej zgubi się z mapą w ręce?",
    "Kto najprędzej wybierze spontaniczny lot do innego kraju?", "Kto najprędzej zaśnie natychmiast w samochodzie?",
    "Kto najprędzej zrobi tysiąc zdjęć na wyjeździe?", "Kto najprędzej zapomni ładowarki?",
    "Kto najprędzej nauczy się kilku słów lokalnego języka?", "Kto najprędzej znajdzie najlepsze jedzenie na miejscu?"
  ]),
  ...group("Sport", [
    "Kto najprędzej zacznie kibicować najgłośniej?", "Kto najprędzej trafi piłką w przypadkową osobę?",
    "Kto najprędzej obejrzy cały mecz mimo późnej godziny?", "Kto najprędzej kupi koszulkę ulubionego piłkarza?",
    "Kto najprędzej nauczy się nowego sportu?", "Kto najprędzej wybierze rower zamiast autobusu?",
    "Kto najprędzej spotka Lewandowskiego i poprosi o zdjęcie?", "Kto najprędzej będzie komentować mecz jak ekspert?"
  ])
);

mostLikelyPrompts.push(
  ...group("Szkoła", [
    "Kto najprędzej zrobi prezentację noc przed terminem?", "Kto najprędzej będzie negocjować ocenę do ostatniej sekundy?",
    "Kto najprędzej zaśnie z otwartym zeszytem?", "Kto najprędzej powie, że nic nie umie, a dostanie najlepszą ocenę?",
    "Kto najprędzej zgubi legitymację?", "Kto najprędzej zrobi ściągę i zapomni jej użyć?",
    "Kto najprędzej zostanie przewodniczącym klasy?", "Kto najprędzej pomyli sprawdzian z kartkówką?",
    "Kto najprędzej spóźni się na lekcję, bo kupował jedzenie?", "Kto najprędzej zapomni, że dziś jest wycieczka?"
  ]),
  ...group("Impreza", [
    "Kto najprędzej wróci z imprezy bez głosu?", "Kto najprędzej zna wszystkich po godzinie?",
    "Kto najprędzej zrobi after bez planu?", "Kto najprędzej przejmie kabel AUX?",
    "Kto najprędzej zaprosi przypadkową osobę do ekipy?", "Kto najprędzej będzie robić zdjęcia jedzenia zamiast ludzi?",
    "Kto najprędzej wyjdzie po przekąski i wróci po godzinie?", "Kto najprędzej zacznie karaoke?",
    "Kto najprędzej obieca, że nie pije dużo, a potem będzie pierwszy na parkiecie?", "Kto najprędzej zgubi bluzę na imprezie?"
  ]),
  ...group("Internet", [
    "Kto najprędzej odpowie tylko reakcją?", "Kto najprędzej wkręci się w dramę internetową?",
    "Kto najprędzej będzie miał najdziwniejszy For You Page?", "Kto najprędzej wyśle mema bez kontekstu?",
    "Kto najprędzej zrobi screen rozmowy i zapomni komu wysłał?", "Kto najprędzej zacznie stalkować profil z ciekawości?",
    "Kto najprędzej założy drugie konto do podglądania?", "Kto najprędzej będzie robić research jak detektyw?",
    "Kto najprędzej kliknie reklamę, która wygląda podejrzanie?", "Kto najprędzej spędzi cały dzień na komentarzach?"
  ]),
  ...group("Gaming", [
    "Kto najprędzej zacznie obwiniać ping?", "Kto najprędzej wyda pieniądze na battle passa?",
    "Kto najprędzej będzie mainować najtrudniejszą postać?", "Kto najprędzej zrobi tutorial wszystkim, choć sam nie umie?",
    "Kto najprędzej zepsuje stealth misję?", "Kto najprędzej będzie lootować, gdy reszta walczy?",
    "Kto najprędzej wymyśli najgorszą taktykę i wygra?", "Kto najprędzej odpali grę tylko na chwilę i zniknie na noc?",
    "Kto najprędzej kupi grę i nigdy jej nie odpali?", "Kto najprędzej będzie miał mikrofon cały czas włączony?"
  ]),
  ...group("Znajomi", [
    "Kto najprędzej zapamięta każdy sekret?", "Kto najprędzej zrobi najlepszy plan awaryjny?",
    "Kto najprędzej rozładuje napięcie żartem?", "Kto najprędzej powie coś zbyt szczerze?",
    "Kto najprędzej będzie mediatorem w kłótni?", "Kto najprędzej zapomni odpisać, ale będzie online?",
    "Kto najprędzej wymyśli nową tradycję ekipy?", "Kto najprędzej będzie trzymać wszystkich przy życiu na wyjeździe?",
    "Kto najprędzej przejmie rolę fotografa?", "Kto najprędzej spóźni się i przyniesie przeprosiny w jedzeniu?"
  ]),
  ...group("Dziwne", [
    "Kto najprędzej kupi coś totalnie bezużytecznego?", "Kto najprędzej uwierzy, że ma ukrytą supermoc?",
    "Kto najprędzej zacznie mówić do GPS-a?", "Kto najprędzej wymyśli teorię spiskową o lodówce?",
    "Kto najprędzej zrobi ranking najdziwniejszych zapachów?", "Kto najprędzej nada pseudonim każdemu przedmiotowi?",
    "Kto najprędzej przestraszy się własnego cienia?", "Kto najprędzej zje coś tylko dlatego, że ktoś rzucił wyzwanie?",
    "Kto najprędzej założy konto dla swojego zwierzaka?", "Kto najprędzej będzie testować najgłupszy lifehack?"
  ]),
  ...group("Spicy lekko", [
    "Kto najprędzej wyśle flirtującą wiadomość i będzie udawać, że to żart?", "Kto najprędzej ma największy roster crushów?",
    "Kto najprędzej pójdzie na randkę z osobą poznaną godzinę wcześniej?", "Kto najprędzej wróci do kogoś, do kogo nie powinien?",
    "Kto najprędzej będzie mieć situationship?", "Kto najprędzej dostanie wiadomość o północy z tekstem tęsknię?",
    "Kto najprędzej będzie flirtować z obsługą?", "Kto najprędzej zakocha się po jednej rozmowie?",
    "Kto najprędzej pomyli uprzejmość z flirtem?", "Kto najprędzej będzie mieć tajnego crusha w ekipie?"
  ]),
  ...group("Codzienne", [
    "Kto najprędzej wyjdzie z domu bez telefonu?", "Kto najprędzej zamówi taksówkę na trasę 500 metrów?",
    "Kto najprędzej zapomni, co miał kupić?", "Kto najprędzej będzie mieć 20 otwartych kart w przeglądarce?",
    "Kto najprędzej zaśnie w ubraniu?", "Kto najprędzej zrobi remont pokoju o 2 w nocy?",
    "Kto najprędzej zje śniadanie na kolację?", "Kto najprędzej kupi coś, bo miało ładne opakowanie?",
    "Kto najprędzej zostawi pranie w pralce na cały dzień?", "Kto najprędzej będzie żyć na jedzeniu z dowozu?"
  ]),
  ...group("Minecraft i Roblox", [
    "Kto najprędzej zrobi bazę pod ziemią i zapomni wejścia?", "Kto najprędzej nazwie miecz jakimś dramatycznym imieniem?",
    "Kto najprędzej wkurzy villagerów?", "Kto najprędzej będzie farmić godzinami zamiast grać fabułę?",
    "Kto najprędzej w Robloxie stworzy najdziwniejszy outfit?", "Kto najprędzej wyda Robuxy i od razu pożałuje?",
    "Kto najprędzej przejdzie horror na Robloxie z krzykiem?", "Kto najprędzej zrobi serwer dla ekipy?",
    "Kto najprędzej zbuduje dom, który wygląda jak pudełko?", "Kto najprędzej zacznie speedrun bez przygotowania?"
  ]),
  ...group("Twórcy i social media", [
    "Kto najprędzej nagra story i usunie po minucie?", "Kto najprędzej zostanie modem na czyimś streamie?",
    "Kto najprędzej zrobi dramę przez źle zrozumiany komentarz?", "Kto najprędzej kupi merch twórcy?",
    "Kto najprędzej zacznie streamować bez planu?", "Kto najprędzej zrobi viralowy komentarz?",
    "Kto najprędzej będzie refreshować statystyki posta?", "Kto najprędzej zrobi rebranding profilu?",
    "Kto najprędzej wymyśli najgorszy tytuł clickbaitowy?", "Kto najprędzej zacznie mówić jak ulubiony youtuber?"
  ]),
  ...group("Ekipa", [
    "Kto najprędzej zostanie kierownikiem wyjazdu?", "Kto najprędzej zgubi grupę w galerii?",
    "Kto najprędzej zrobi wspólną playlistę?", "Kto najprędzej kupi wszystkim przekąski?",
    "Kto najprędzej będzie pamiętać każdy inside joke?", "Kto najprędzej napisze na grupie elaborat?",
    "Kto najprędzej zacznie planować sylwestra w lipcu?", "Kto najprędzej zrobi zdjęcie, które stanie się memem?",
    "Kto najprędzej zaprosi dodatkową osobę bez pytania?", "Kto najprędzej przekona wszystkich do głupiego pomysłu?"
  ]),
  ...group("Pokémon i nostalgia", [
    "Kto najprędzej płakałby przy starej bajce?", "Kto najprędzej kupi booster kart dla zabawy?",
    "Kto najprędzej pamięta imiona postaci z dzieciństwa?", "Kto najprędzej wybrałby Pokémona po wyglądzie?",
    "Kto najprędzej zostałby liderem sali?", "Kto najprędzej oglądałby stare reklamy z nostalgii?",
    "Kto najprędzej wróci do gry z dzieciństwa i przepadnie?", "Kto najprędzej kolekcjonowałby pluszaki?",
    "Kto najprędzej zna opening z pamięci?", "Kto najprędzej będzie bronić swojego startera jak rodziny?"
  ]),
  ...group("Filmy i seriale", [
    "Kto najprędzej zrobi teorię po pierwszym odcinku?", "Kto najprędzej wybierze film trzy godziny?",
    "Kto najprędzej będzie płakać na finale sezonu?", "Kto najprędzej ogląda napisy końcowe do końca?",
    "Kto najprędzej poleci serial każdej osobie?", "Kto najprędzej zaspoileruje sam sobie zakończenie?",
    "Kto najprędzej zrobi maraton horrorów i będzie spać przy lampce?", "Kto najprędzej przebierze się na premierę?",
    "Kto najprędzej zapamięta wszystkie cytaty?", "Kto najprędzej będzie kibicować złemu bohaterowi?"
  ]),
  ...group("Jedzenie", [
    "Kto najprędzej zrobi midnight snack?", "Kto najprędzej połączy słodkie ze słonym i powie, że działa?",
    "Kto najprędzej zamówi za dużo jedzenia?", "Kto najprędzej ukradnie frytkę z talerza?",
    "Kto najprędzej zna najlepsze promocje na jedzenie?", "Kto najprędzej zrobi jedzenie wyglądające źle, ale smaczne?",
    "Kto najprędzej będzie mieć sos do wszystkiego?", "Kto najprędzej wyda ostatnie pieniądze na bubble tea?",
    "Kto najprędzej zje ostre i będzie udawać, że nic mu nie jest?", "Kto najprędzej zrobi ranking kebabów w mieście?"
  ]),
  ...group("Podróże", [
    "Kto najprędzej kupi bilet bez sprawdzenia daty?", "Kto najprędzej zgubi boarding pass?",
    "Kto najprędzej będzie gadać z lokalsami?", "Kto najprędzej zrobi plan zwiedzania co do minuty?",
    "Kto najprędzej pojedzie gdzieś tylko dla jedzenia?", "Kto najprędzej spakuje pół domu?",
    "Kto najprędzej nie weźmie kurtki i będzie marznąć?", "Kto najprędzej zrobi najładniejsze zdjęcia z podróży?",
    "Kto najprędzej wróci z magnesem dla każdego?", "Kto najprędzej wybierze nocny spacer w obcym mieście?"
  ]),
  ...group("Sport", [
    "Kto najprędzej zacznie trening i po tygodniu kupi cały sprzęt?", "Kto najprędzej będzie krzyczeć na sędziego przez telewizor?",
    "Kto najprędzej zrobi kontuzję przy rozgrzewce?", "Kto najprędzej pójdzie na siłownię tylko dla zdjęcia?",
    "Kto najprędzej będzie znać statystyki wszystkich zawodników?", "Kto najprędzej zacznie biegać o 6 rano?",
    "Kto najprędzej wybierze sport ekstremalny?", "Kto najprędzej będzie udawać eksperta po jednym meczu?",
    "Kto najprędzej założy ligę fantasy?", "Kto najprędzej będzie mieć szczęśliwą koszulkę meczową?"
  ]),
  ...group("18+ Flirt", [
    "Kto najprędzej wyśle odważną wiadomość po północy?", "Kto najprędzej będzie mieć najwięcej matchy?",
    "Kto najprędzej flirtuje tak naturalnie, że nawet nie zauważa?", "Kto najprędzej pójdzie na randkę bez sprawdzenia profilu?",
    "Kto najprędzej wróci z imprezy z czyimś numerem?", "Kto najprędzej napisze do byłej lub byłego po alkoholu?",
    "Kto najprędzej będzie mieć tajne rozmowy na telefonie?", "Kto najprędzej wyśle komuś serduszko przez przypadek?",
    "Kto najprędzej da się złapać na stalkowaniu profilu?", "Kto najprędzej będzie mieć randkę, o której nie powie ekipie?",
    "Kto najprędzej podrywa przez żarty?", "Kto najprędzej zrobi pierwszy krok w klubie?"
  ]),
  ...group("18+ Seks", [
    "Kto najprędzej opowie za dużo o swoim życiu łóżkowym?", "Kto najprędzej ma najbardziej odważne fantazje?",
    "Kto najprędzej wysłałby pikantną wiadomość nie tej osobie?", "Kto najprędzej miałby friends with benefits?",
    "Kto najprędzej poszedłby na jednorazową przygodę?", "Kto najprędzej miałby najbardziej nietypowy turn-on?",
    "Kto najprędzej kupiłby zabawkę erotyczną dla żartu, a potem serio jej używał?", "Kto najprędzej zaproponowałby coś nowego w łóżku?",
    "Kto najprędzej byłby głośny za ścianą?", "Kto najprędzej miałby najwięcej pikantnych historii?",
    "Kto najprędzej dostałby nudesy?", "Kto najprędzej wysłałby nudesy zaufanej osobie?"
  ]),
  ...group("18+ Impreza", [
    "Kto najprędzej wypije za dużo i będzie wszystkim mówić, że ich kocha?", "Kto najprędzej zrobi after u siebie?",
    "Kto najprędzej zniknie z imprezy z kimś poznanym tego wieczoru?", "Kto najprędzej obudzi się z kacem moralnym?",
    "Kto najprędzej postawi wszystkim kolejkę?", "Kto najprędzej zacznie tańczyć na stole?",
    "Kto najprędzej wysłałby żenującą wiadomość po alkoholu?", "Kto najprędzej zgubi telefon na imprezie?",
    "Kto najprędzej będzie pamiętać najmniej z wieczoru?", "Kto najprędzej zrobi najbardziej przypałowe story?",
    "Kto najprędzej pocałuje kogoś na imprezie?", "Kto najprędzej zacznie mówić za dużo prawdy?"
  ]),
  ...group("18+ Bez wstydu", [
    "Kto najprędzej pokazałby znajomym historię wyszukiwania?", "Kto najprędzej przyzna się do największego crusha?",
    "Kto najprędzej zada ekipie zbyt prywatne pytanie?", "Kto najprędzej powiedziałby prawdę w truth or dare?",
    "Kto najprędzej ma najbardziej przypałową randkową historię?", "Kto najprędzej przypadkiem odczyta pikantną wiadomość na głos?",
    "Kto najprędzej ma najdziwniejszy typ?", "Kto najprędzej przyzna się do rzeczy, której reszta by nie powiedziała?",
    "Kto najprędzej zgodzi się na odważne wyzwanie?", "Kto najprędzej zdradzi sekret po jednym drinku?",
    "Kto najprędzej ma najwięcej rzeczy ukrytych w notatkach telefonu?", "Kto najprędzej robi dobrą minę do najbardziej niezręcznej sytuacji?"
  ])
);

const uniqueMostLikelyPrompts = new Map(mostLikelyPrompts.map(item => [`${item.category}|${item.text}`, item]));
mostLikelyPrompts.splice(0, mostLikelyPrompts.length, ...uniqueMostLikelyPrompts.values());

export const mostLikelyCategories = [...new Set(mostLikelyPrompts.map(item => item.category))];
