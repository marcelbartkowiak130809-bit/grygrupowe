const nudges = [
  [
    'Przydadzą się jeden pień i jedzenie. Szukaj na pierwszym planie.',
    'Spójrz na kłodę przy brzegu i na poziom, na którym stoi Steve.',
    'Schab upieczesz w piecu, kiedy ten będzie miał paliwo.',
    'Drewniany kilof wystarczy na początek. Bruk pozwoli zrobić lepszy.',
    'Najpierw zadbaj o światło. Złoże żelaza jest na końcu tunelu.',
    'Przygotuj piec, zanim spróbujesz zrobić coś z rudą żelaza.',
    'Przyjrzyj się studni pośrodku wioski. Mapa jest ukryta pod pokrywą.',
    'Buduj od dołu. Każdy następny stopień może być tylko o jeden blok wyższy.',
    'Brama potrzebuje ciągłego obwodu i źródła zasilania.',
    'Alex czeka po prawej. Najpierw rozjaśnij wejście do domu.',
  ],
  [
    'Po napastnikach coś zostało. Zajrzyj na prawą stronę domu.',
    'Zobacz, co łączy skrzynię z dzwonem. Na lewej ścianie wisi narzędzie.',
    'Koła wagonika nie są zepsute. Coś blokuje jedno z nich.',
    'Użyj trzech stanowisk po kolei, zaczynając od źródła ciepła.',
    'Zamiast walczyć z grupą, zwab ją tam, gdzie możesz użyć wody.',
    'Zobacz, co wagonik może nacisnąć. Strażnik nie lubi światła.',
  ],
  [
    'Poszukaj w domu zapasów i czegoś, co wskaże bezpieczną drogę.',
    'Metal powinien chronić najbardziej odsłonięty punkt tarczy.',
    'Łuk potrzebuje naprężonej nici. Przy stojaku znajdziesz materiały na amunicję.',
    'Miękki materiał pomoże przenieść dzwon bez hałasu.',
    'Przy drodze zostały znaki. Porównaj je z mapą Alex.',
    'Dźwięk odciągnie patrol. Zanim go użyjesz, przygotuj mechanizm kraty.',
    'Najpierw wytrzymaj salwę, potem przyjrzyj się przyciskowi nad pomostem.',
    'Kolejność zwrotnic podpowiada tablica w magazynie.',
    'Alex widzi coś, czego Steve nie może odczytać z zewnątrz.',
    'Do okna trzeba się wspiąć. Przy opuszczaniu rygla przyda się pomoc Alex.',
  ],
];

const exact = {
  '1-1': 'Kliknij pień raz i świnię dwa razy. Kiedy zbierzesz drewno i jedzenie, kliknij „Idź dalej”.',
  '1-8': 'Wydobądź 6 bruku. Od miejsca, gdzie zaczyna się budowanie, ułóż trzy bloki obok siebie na dole, dwa nad prawymi dwoma i jeden nad prawym. Wejdź na półkę po prawej.',
  '2-3': 'Wybierz pochodnię i kliknij uchwyt na drewnianej podporze. Wyjmij klin spod prawego koła i przesuń wagonik. Wybierz kilof, wydobądź żelazo i węgiel, a na końcu kliknij strzałkę na ścianie.',
  '2-5': 'Kliknij mechanizm po lewej, by zabrać dzwon i łańcuch. Z łańcuchem kliknij śluzę. Wybierz dzwon i kliknij ramę, a potem dźwignię po prawej.',
  '2-6': 'Kliknij wagonik po lewej i właz u góry. Wybierz miecz i kliknij zombie. Wybierz zdobyty klucz, kliknij kratę, a potem Alex.',
  '3-5': 'Wybierz mapę i kliknij znak przy wejściu. Kliknij kamienie w kolejności: listek → gwiazda → tarcza. Na końcu zdejmij łańcuch z bramy.',
  '3-8': 'Kliknij tablicę nad torem. Ustaw dźwignie od lewej na ↑ ↓ ↑. Wybierz łańcuch, kliknij wagon i odbierz klucz oraz korbę ze skrytki po prawej.',
  '3-9': 'Kliknij sylwetkę Alex. Naciśnij płytki w kolejności: słońce → pióro → klucz. Wybierz klucz ze skrytki i kliknij kratę.',
  '3-10': 'Wybierz deski, kliknij rampę i zużyj 3 deski. Wybierz korbę i kliknij podporę. Kliknij Alex, żeby przytrzymała mechanizm. Wybierz łuk i strzel w rygiel okna.',
};

export function alexHintOptions(chapter, index, scene, available = true) {
  const id = `${chapter}-${index + 1}`;
  return { key: `alex-${id}`, hint: nudges[chapter - 1][index], solution: exact[id] || scene.hint, available };
}
