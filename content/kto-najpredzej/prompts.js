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

const uniqueMostLikelyPrompts = new Map(mostLikelyPrompts.map(item => [`${item.category}|${item.text}`, item]));
mostLikelyPrompts.splice(0, mostLikelyPrompts.length, ...uniqueMostLikelyPrompts.values());

export const mostLikelyCategories = [...new Set(mostLikelyPrompts.map(item => item.category))];
