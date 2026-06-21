import { gamesList } from "./games.js?v=20260615-2";
import { escapeHtml } from "./utils.js?v=20260605-5";

const ADSENSE_CLIENT = "ca-pub-4038439845706886";
const adPages = new Set(["public:o-grze", "public:jak-grac", "public:tryby-gry"]);
const publicLinks = [
  ["/o-grze", "O grze"],
  ["/jak-grac", "Jak grac"],
  ["/tryby-gry", "Tryby gry"],
  ["/regulamin", "Regulamin"],
  ["/polityka-prywatnosci", "Polityka prywatnosci"],
  ["/kontakt", "Kontakt"],
];

export function adSenseBlock(label = "Reklama", variant = "inline") {
  return `<aside class="adsense-safe-slot adsense-${variant}" data-adsense-public aria-label="${label}"></aside>`;
}

function loadAdSenseScript() {
  if (document.querySelector("script[data-adsense-public-script]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  script.crossOrigin = "anonymous";
  script.dataset.adsensePublicScript = "true";
  document.head.append(script);
}

export function activatePublicAds(root, screen = "platform") {
  if (!root.querySelector("[data-adsense-public]")) return;
  loadAdSenseScript();
}

export function deactivatePublicAds() {
  document.querySelector("script[data-adsense-public-script]")?.remove();
}

export function publicFooterHtml() {
  return `<footer class="public-footer">
    <nav>${publicLinks.map(([href, label]) => `<a href="${href}" data-public-link="${href}">${label}</a>`).join("")}</nav>
    <p>Gry dla znajomych online. Prywatne pokoje, linki zaproszen i rozgrywka w przegladarce.</p>
  </footer>`;
}

export function bindPublicLinks(root, actions) {
  root.querySelectorAll("[data-public-link]").forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    actions.goPublicPage?.(link.dataset.publicLink);
  }));
}

export function homeInfoHtml() {
  return `<section class="public-home-info">
    <div class="public-copy">
      <p class="eyebrow">INFORMACJE O STRONIE</p>
      <h1>Gry dla znajomych online</h1>
      <p>To strona z prostymi grami imprezowymi online dla znajomych, klas, ekip z Discorda i malych grup, ktore chca szybko zaczac wspolna rozgrywke bez instalowania aplikacji.</p>
      <p>Wystarczy wybrac tryb, stworzyc prywatny pokoj i wyslac znajomym kod albo link zaproszenia. Gra dziala w przegladarce na komputerze i telefonie.</p>
    </div>
    <div class="public-info-grid">
      <article><h2>Prywatne pokoje</h2><p>Host tworzy pokoj, wybiera ustawienia i wysyla link. Osoby z linkiem moga dolaczyc bez przepisywania kodu, ale zabezpieczenia pokoju nadal obowiazuja.</p></article>
      <article><h2>Bez instalacji</h2><p>Nie trzeba pobierac programu ani zakladac serwera. Wystarczy przegladarka i wspolna rozmowa na zywo albo wbudowane opcje danego trybu.</p></article>
      <article><h2>Rozne tryby</h2><p>Sa tryby blefu, zgadywania, glosowania, pytan i szybkich rund dla ekip, ktore sie znaja albo dopiero chca sie rozkrecic.</p></article>
    </div>
    <div class="public-faq">
      <h2>FAQ</h2>
      <details open><summary>Czy trzeba cos instalowac?</summary><p>Nie. Gra dziala bezposrednio w przegladarce.</p></details>
      <details><summary>Czy pokoj jest publiczny?</summary><p>Pokoj moze byc prywatny. Znajomi dolaczaja kodem albo linkiem zaproszenia.</p></details>
      <details><summary>Czy da sie grac na telefonie?</summary><p>Tak. Strona jest przygotowana pod pionowy ekran telefonu, a host moze dobrac czas rund do tempa grupy.</p></details>
      <details><summary>Ktory tryb wybrac na start?</summary><p>Na szybka gre sprawdza sie Udowodnij albo Impostor. Do gadania w ekipie dobry jest tryb Kim jestem?.</p></details>
    </div>
    ${adSenseBlock()}
  </section>
  ${publicFooterHtml()}`;
}

const modeLongDescription = {
  udowodnij:"Udowodnij! polega na deklarowaniu, ile odpowiedzi umiesz podac na dany temat. Kolejni gracze moga przebic stawke albo sprawdzic blef. Tryb jest szybki, dynamiczny i dobrze dziala nawet wtedy, gdy gracze nie znaja sie bardzo dobrze.",
  impostor:"Impostor rozdaje role i hasla tak, ze jedna osoba musi ukryc, ze ma inne informacje. Gracze podaja wskazowki, obserwuja odpowiedzi innych i glosuja, kto zachowuje sie podejrzanie. To tryb rozmowy, blefu i ostroznego zdradzania szczegolow.",
  "kim-jestem":"W trybie Kim jestem? kazdy widzi hasla innych, ale nie swoje. Gracz zadaje pytania, zbiera odpowiedzi i probuje odgadnac, kim jest. Tryb nadaje sie do spokojniejszej gry, rozmowy glosowej i dluzej rozgrywki.",
  "co-wolisz":"Co wolisz? to tryb solo z pytaniami wyboru. Gracz wybiera jedna z dwoch opcji i porownuje wynik z innymi odpowiedziami. Ten tryb moze zawierac mocniejsze kategorie, dlatego powinien byc wybierany swiadomie.",
  "inne-pytanie":"Inne pytanie ukrywa roznice miedzy graczami. Prawie wszyscy dostaja jedno pytanie, a jedna osoba inne. Po odpowiedziach grupa probuje wykryc, kto nie pasuje do reszty.",
  "kto-najpredzej":"Kto najpredzej...? to tryb glosowania na osoby z ekipy. Najlepiej dziala wsrod znajomych, bo pytania opieraja sie na wspolnych skojarzeniach i poczuciu humoru grupy.",
  "test-znajomosci":"Test znajomosci sprawdza, jak dobrze gracze kojarza odpowiedzi innych. Najpierw kazdy odpowiada, potem grupa zgaduje autorow. To tryb typowo dla ekip, ktore juz troche sie znaja.",
  "zatruty-cukierek":"Zatruty cukierek! to lekka gra eliminacyjna. Gracze zatruwaja wybrane cukierki, a potem po kolei jedza ze wspolnego stolu. Wygrywa ten, kto najdluzej unika cudzych pulapek.",
};

const pages = {
  "public:o-grze": {
    title:"O grze",
    eyebrow:"PROJEKT",
    allowAds:true,
    body:`<p>Gry dla znajomych online to strona z grami imprezowymi uruchamianymi w przegladarce. Projekt jest tworzony z mysla o znajomych, klasach, grupach Discord i malych ekipach, ktore chca szybko zagrac razem bez instalowania osobnej aplikacji.</p>
      <p>Rozgrywka opiera sie na prywatnych pokojach. Host tworzy pokoj, wybiera tryb oraz ustawienia, a potem wysyla kod albo link zaproszenia. Link prowadzi bezposrednio do danego pokoju, ale nie omija zabezpieczen takich jak limit miejsc, status gry czy zamkniety pokoj.</p>
      <p>Strona laczy proste zasady, szybkie rundy i tryby nastawione na rozmowe. Niektore gry dzialaja z losowymi osobami, a inne najlepiej wypadaja w ekipie, ktora zna swoje zarty i historie.</p>`,
  },
  "public:jak-grac": {
    title:"Jak grac",
    eyebrow:"INSTRUKCJA",
    allowAds:true,
    body:`<ol class="public-steps">
      <li><b>Stworz pokoj.</b><span>Na stronie glownej wybierz tryb gry, wejdz do lobby i utworz prywatny pokoj.</span></li>
      <li><b>Zapros znajomych.</b><span>Skopiuj kod pokoju albo link zaproszenia i wyslij go znajomym na czacie, Discordzie lub Messengerze.</span></li>
      <li><b>Wybierz tryb i ustawienia.</b><span>Host moze ustawic liczbe rund, czas odpowiedzi, kategorie pytan i inne opcje zalezne od trybu.</span></li>
      <li><b>Rozpocznij runde.</b><span>Gdy gracze sa gotowi, host uruchamia gre. Dalej ekran prowadzi was przez tury, odpowiedzi, glosowania i wyniki.</span></li>
      <li><b>Gdy ktos gra z telefonu.</b><span>Najlepiej trzymac telefon pionowo, nie blokowac ekranu i dac troche dluzsze czasy rund, jesli gracze wpisuja dluzsze odpowiedzi.</span></li>
    </ol>`,
  },
  "public:tryby-gry": {
    title:"Tryby gry",
    eyebrow:"BIBLIOTEKA",
    allowAds:true,
    body:`<div class="public-mode-list">${gamesList.map(mode => `<article><h2>${escapeHtml(mode.name)}</h2><p>${escapeHtml(modeLongDescription[mode.id] || mode.description)}</p><small>${escapeHtml(mode.players || "")}</small></article>`).join("")}</div>`,
  },
  "public:regulamin": {
    title:"Regulamin",
    eyebrow:"ZASADY",
    body:`<p>Strona jest projektem rozrywkowym sluzacym do grania online ze znajomymi. Korzystaj z niej w sposob zgodny z prawem, z szacunkiem do innych osob i bez prob psucia rozgrywki.</p>
      <ul class="public-list"><li>Nie spamuj, nie naduzywaj czatu, zgloszen ani funkcji pokoju.</li><li>Nie podszywaj sie pod innych graczy i nie wykorzystuj bledow strony.</li><li>Host pokoju odpowiada za dobranie trybu oraz ustawien odpowiednich dla swojej grupy.</li><li>Strona, tryby, pytania, kosmetyki i funkcje moga sie zmieniac wraz z rozwojem projektu.</li><li>Projekt ma charakter rozrywkowy i nie powinien byc traktowany jako usluga gwarantowana bez przerw.</li></ul>`,
  },
  "public:polityka-prywatnosci": {
    title:"Polityka prywatnosci",
    eyebrow:"PRYWATNOSC",
    body:`<p>Podczas korzystania ze strony moga byc przetwarzane dane potrzebne do dzialania gry, takie jak nick, ustawienia konta, awatar, postep, statystyki, wybrane kosmetyki, tresci wpisane w pokojach oraz podstawowe dane techniczne przegladarki.</p>
      <p>Projekt korzysta z Firebase do logowania, synchronizacji pokoi, profili, obecnosci online i wybranych funkcji realtime. Dane techniczne moga byc przetwarzane przez dostawce infrastruktury zgodnie z jego zasadami.</p>
      <p>Projekt moze korzystac z Google AdSense. Oznacza to, ze Google moze uzywac cookies reklamowych i podobnych technologii do wyswietlania oraz mierzenia reklam.</p>
      <p>Kontakt w sprawach prywatnosci: <b>grygrupowe@gmail.com</b>.</p>`,
  },
  "public:kontakt": {
    title:"Kontakt",
    eyebrow:"WIADOMOSC",
    body:`<p>Masz blad, problem z kontem, pomysl na tryb albo propozycje pytan? Tu powinien znalezc sie kontakt do administracji projektu.</p>
      <p>E-mail kontaktowy: <b>grygrupowe@gmail.com</b></p>
      <p>Przy zglaszaniu bledu najlepiej opisac, jaki tryb byl uruchomiony, co kliknieto i co dokladnie poszlo nie tak.</p>`,
  },
};

export function renderPublicPage(root, screen, actions) {
  const page = pages[screen] || pages["public:o-grze"];
  root.innerHTML = `<main class="page public-page enter">
    <section class="public-article">
      <p class="eyebrow">${page.eyebrow}</p>
      <h1>${page.title}</h1>
      <div class="public-body">${page.body}</div>
      ${page.allowAds ? adSenseBlock() : ""}
    </section>
    ${publicFooterHtml()}
  </main>`;
  bindPublicLinks(root, actions);
  activatePublicAds(root, screen);
}
