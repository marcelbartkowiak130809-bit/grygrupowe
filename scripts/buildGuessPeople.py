"""Build the photo deck using Wikipedia's free lead images and Commons credits."""
import concurrent.futures
import html
import io
import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

GROUPS = {
    "Muzyka": """Taylor Swift|Beyoncé|Rihanna|Adele|Lady Gaga|Ariana Grande|Billie Eilish|Olivia Rodrigo|Dua Lipa|Selena Gomez|Miley Cyrus|Britney Spears|Christina Aguilera|Madonna|Cher|Katy Perry|Shakira|Jennifer Lopez|Mariah Carey|Céline Dion|Whitney Houston|Tina Turner|Sia|Doja Cat|Nicki Minaj|Cardi B|SZA|Lizzo|Chappell Roan|Sabrina Carpenter|Tate McRae|Charli XCX|Lana Del Rey|Halsey (singer)|Pink (singer)|Avril Lavigne|Ellie Goulding|Alicia Keys|Camila Cabello|Rosalía|Karol G|Ed Sheeran|Justin Bieber|The Weeknd|Bruno Mars|Harry Styles|Elton John|Freddie Mercury|Michael Jackson|Prince (musician)|David Bowie|Paul McCartney|John Lennon|Sting (musician)|Phil Collins|Robbie Williams|George Michael|Rick Astley|Ricky Martin|Enrique Iglesias|Bad Bunny|Daddy Yankee|Pitbull (rapper)|Pharrell Williams|Eminem|Snoop Dogg|Drake (musician)|Kendrick Lamar|Travis Scott|Kanye West|Post Malone|Ice Cube|50 Cent|Jay-Z|Lil Wayne|Tupac Shakur|Måneskin's Damiano David|Lisa (rapper)|Jennie (singer)|Rosé (singer)|Jisoo|Jungkook|RM (musician)|PSY|Maryla Rodowicz|Dawid Podsiadło|Sanah (singer)|Doda (singer)|Margaret (singer)|Krzysztof Krawczyk|Michał Szpak|Jennifer Hudson""",
    "Film i seriale": """Margot Robbie|Pedro Pascal|Jack Black|Zendaya|Brad Pitt|Morgan Freeman|Vin Diesel|Tom Cruise|Leonardo DiCaprio|Johnny Depp|Keanu Reeves|Dwayne Johnson|Jason Statham|Ryan Reynolds|Ryan Gosling|Chris Hemsworth|Chris Evans (actor)|Robert Downey Jr.|Tom Holland|Andrew Garfield|Tobey Maguire|Hugh Jackman|Henry Cavill|Daniel Radcliffe|Rupert Grint|Emma Watson|Emma Stone|Jennifer Lawrence|Anne Hathaway|Scarlett Johansson|Natalie Portman|Angelina Jolie|Julia Roberts|Meryl Streep|Nicole Kidman|Reese Witherspoon|Sandra Bullock|Salma Hayek|Penélope Cruz|Sofía Vergara|Jenna Ortega|Millie Bobby Brown|Winona Ryder|Sydney Sweeney|Florence Pugh|Anya Taylor-Joy|Timothée Chalamet|Austin Butler|Joaquin Phoenix|Christian Bale|Heath Ledger|Cillian Murphy|Robert Pattinson|Kristen Stewart|Daniel Craig|Pierce Brosnan|Idris Elba|Benedict Cumberbatch|Martin Freeman|Samuel L. Jackson|Will Smith|Denzel Washington|Jamie Foxx|Eddie Murphy|Jim Carrey|Adam Sandler|Steve Carell|Ben Stiller|Owen Wilson|Robin Williams|Rowan Atkinson|Jackie Chan|Bruce Lee|Jet Li|Arnold Schwarzenegger|Sylvester Stallone|Harrison Ford|Mark Hamill|Carrie Fisher|Sigourney Weaver|Kate Winslet|Orlando Bloom|Viggo Mortensen|Elijah Wood|Ian McKellen|Patrick Stewart|Macaulay Culkin|Kevin Hart|Danny DeVito|Willem Dafoe|Mads Mikkelsen|Tilda Swinton|Cate Blanchett|Uma Thurman|Lucy Liu|Michelle Yeoh|Jack Nicholson|Tom Hanks|Robert De Niro|Al Pacino|John Travolta|Nicolas Cage|Ewan McGregor|Marilyn Monroe|Audrey Hepburn|Katarzyna Figura|Cezary Pazura""",
    "Piłka nożna": """Lionel Messi|Cristiano Ronaldo|Robert Lewandowski|Kylian Mbappé|Neymar|Erling Haaland|Mohamed Salah|Harry Kane|Kevin De Bruyne|Luka Modrić|Jude Bellingham|Vinícius Júnior|Ronaldinho|Ronaldo (Brazilian footballer)|Pelé|Diego Maradona|David Beckham|Zinedine Zidane|Zlatan Ibrahimović|Luis Suárez|Andrés Iniesta|Xavi|Gianluigi Buffon|Manuel Neuer|Iker Casillas|Wojciech Szczęsny|Marta (footballer)|Alex Morgan|Megan Rapinoe|Bukayo Saka|Virgil van Dijk|Sergio Ramos""",
    "Sport": """LeBron James|Stephen Curry|Kobe Bryant|Michael Jordan|Shaquille O'Neal|Kevin Durant|Dennis Rodman|Serena Williams|Venus Williams|Iga Świątek|Roger Federer|Rafael Nadal|Novak Djokovic|Carlos Alcaraz|Naomi Osaka|Aryna Sabalenka|Usain Bolt|Michael Phelps|Simone Biles|Lewis Hamilton|Max Verstappen|Charles Leclerc|Fernando Alonso|Robert Kubica|Mike Tyson|Muhammad Ali|Conor McGregor|Mariusz Pudzianowski|Adam Małysz|Kamil Stoch|Tony Hawk""",
    "Internet i telewizja": """PewDiePie|MrBeast|Markiplier|Jacksepticeye|Pokimane|Ninja (gamer)|KSI|Logan Paul|Jake Paul|IShowSpeed|Kai Cenat|Charli D'Amelio|Addison Rae|Kim Kardashian|Kylie Jenner|Kendall Jenner|Gigi Hadid|Bella Hadid|Hailey Bieber|Gordon Ramsay|Jamie Oliver|Martha Stewart|Oprah Winfrey|Ellen DeGeneres|Simon Cowell|Jimmy Fallon|Jimmy Kimmel|Conan O'Brien|Magda Gessler|Kuba Wojewódzki""",
}

ROOT = Path(__file__).resolve().parents[1]
PHOTO_DIR = ROOT / "assets" / "guess-people"
AGENT = "GryGrupowePhotoCatalog/1.0 (https://grygrupowe.pages.dev)"
PHOTO_OVERRIDES = {"Pokimane": "Pokimane in 2019 in a Podcast.jpg"}


def request(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={"User-Agent": AGENT}), timeout=20) as response:
                return response.read()
        except OSError:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def query(domain, **params):
    url = "https://" + domain + "/w/api.php?" + urlencode(
        dict(action="query", format="json", formatversion=2, **params))
    return json.loads(request(url))["query"]


def plain(value):
    return html.unescape(re.sub(r"<[^>]*>", "", value)).strip()


def get_photo(entry):
    page, group = entry
    try:
        override = PHOTO_OVERRIDES.get(page["title"])
        file = override or page["pageimage"]
        if Path(file).suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            return
        info = query("commons.wikimedia.org", titles="File:" + file, prop="imageinfo",
                     iiprop="url|extmetadata", iiextmetadatafilter="Artist|LicenseShortName|LicenseUrl",
                     iiurlwidth=330)["pages"][0]["imageinfo"][0]
        meta = info["extmetadata"]
        license = meta["LicenseShortName"]["value"]
        if not (re.fullmatch(r"CC BY(?:-SA)? [\d.]+", license) or
                license in {"CC0", "Public domain", "PDM"}):
            return
        author = plain(meta.get("Artist", {}).get("value", ""))
        if license.startswith("CC BY") and not author:
            return
        uid = str(page["pageid"])
        source = info["thumburl"] if override else page["thumbnail"]["source"].split("?")[0]
        with Image.open(io.BytesIO(request(source))) as picture:
            image = ImageOps.exif_transpose(picture).convert("RGB")
            image.thumbnail((350, 460))
            image.save(PHOTO_DIR / (uid + ".webp"), "WEBP", quality=85)
        return [uid, re.sub(r" \([^)]*\)$", "", page["title"]), group,
                info["descriptionurl"], author, license, meta.get("LicenseUrl", {}).get("value", "")]
    except (KeyError, IndexError, OSError, ValueError) as error:
        print("Skipped", page.get("title"), str(error)[:100], flush=True)


def main():
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    entries = {}
    for group, raw in GROUPS.items():
        titles = raw.split("|")
        for start in range(0, len(titles), 25):
            batch = query("en.wikipedia.org", titles="|".join(titles[start:start + 25]),
                          redirects=1, prop="pageimages", piprop="name|thumbnail",
                          pilicense="free", pithumbsize=330, pilimit=50)
            entries.update({page["pageid"]: (page, group) for page in batch["pages"]
                            if page.get("pageimage") and page.get("thumbnail")})
    # Round robin preserves a broad mix when the target deck size is reached.
    pools = {group: [entry for entry in entries.values() if entry[1] == group] for group in GROUPS}
    weights = ["Muzyka", "Film i seriale", "Sport", "Muzyka", "Film i seriale",
               "Piłka nożna", "Film i seriale", "Muzyka", "Internet i telewizja"]
    queue = []
    while any(pools.values()):
        for group in weights:
            if pools[group]:
                queue.append(pools[group].pop(0))
    featured = {"Pokimane", "Maryla Rodowicz", "Iga Świątek", "Sanah (singer)"}
    priority = [entry for entry in queue if entry[0]["title"] in featured]
    queue = priority + [entry for entry in queue if entry[0]["title"] not in featured]
    deck = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as workers:
        for start in range(0, len(queue), 20):
            deck.extend(card for card in workers.map(get_photo, queue[start:start + 20]) if card)
            print(f"{len(deck)} licensed photographs", flush=True)
            if len(deck) >= 200:
                break
    assert len(deck) >= 200, len(deck)
    deck = sorted(deck[:200], key=lambda card: card[1].casefold())
    keep = {card[0] + ".webp" for card in deck}
    for photo in PHOTO_DIR.glob("*.webp"):
        if photo.name not in keep:
            photo.unlink()
    (ROOT / "js" / "guessPeopleCatalog.js").write_text(
        "// [Wikipedia ID, name, category, Commons source, author, license, license URL]\n"
        "export const guessPeople = " + json.dumps(deck, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8")


if __name__ == "__main__":
    main()
