"""Resolve the built-in Kim jestem? cards to encyclopaedia articles."""
import concurrent.futures
import json
import re
import subprocess
import time
from pathlib import Path
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "content/kim-jestem"
AGENT = "GryGrupoweIdentity/1.0 (https://grygrupowe.pages.dev)"
WIKIS = {
    "pl": ("https://pl.wikipedia.org/w/api.php", "https://pl.wikipedia.org/wiki/"),
    "en": ("https://en.wikipedia.org/w/api.php", "https://en.wikipedia.org/wiki/"),
    "mc": ("https://minecraft.wiki/api.php", "https://minecraft.wiki/w/"),
    "rb": ("https://roblox.fandom.com/api.php", "https://roblox.fandom.com/wiki/"),
}
FICTION = {"Postacie z bajek", "Postacie z filmów", "Postacie z gier",
           "Superbohaterowie", "Anime i manga", "Książki i komiksy", "Seriale i anime"}


def read_decks():
    source = """import {identityCategories as c} from './content/kim-jestem/categories.js';
import {pokemonDex} from './js/pokemonData.js';
console.log(JSON.stringify({c,pokemon:pokemonDex.map(({name,id})=>[name,id])}));"""
    return json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e", source], cwd=ROOT, encoding="utf-8"))


def fetch_batch(wiki, titles):
    url = WIKIS[wiki][0] + "?" + urlencode(dict(
        action="query", titles="|".join(titles), redirects=1, prop="info|pageprops",
        ppprop="disambiguation", inprop="url", format="json", formatversion=2))
    for attempt in range(4):
        try:
            with urlopen(Request(url, headers={"User-Agent": AGENT}), timeout=15) as response:
                data = json.load(response)["query"]
            break
        except (OSError, KeyError):
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    redirects = {r["from"]: r for r in data.get("redirects", [])}
    normalized = {r["from"]: r["to"] for r in data.get("normalized", [])}
    pages = {p["title"]: p for p in data["pages"]}
    result = {}
    for title in titles:
        to = normalized.get(title, title)
        fragments = []
        for _ in range(8):
            if to not in redirects:
                break
            entry = redirects[to]
            to = entry["to"]
            if entry.get("tofragment"):
                fragments.append(entry["tofragment"])
        page = pages.get(to, {})
        namespaces = {0, 114} if wiki == "rb" else {0}
        if page.get("ns") not in namespaces or "missing" in page or "disambiguation" in page.get("pageprops", {}):
            continue
        result[title] = WIKIS[wiki][1] + quote(to.replace(" ", "_"), safe="()'!,:/") + (
            "#" + quote(fragments[-1].replace(" ", "_"), safe="()':") if fragments else "")
    return wiki, result


def main():
    source = read_decks()
    aliases = json.loads((INPUT / "referenceAliases.json").read_text(encoding="utf-8"))
    pokemon = {re.sub(r"[^a-z0-9]", "", name): name for name, _ in source["pokemon"]}
    catalog = {}
    candidates = {}
    requests = {wiki: set() for wiki in WIKIS}
    for category, words in source["c"].items():
        for word in words:
            identifier = category + "|" + word
            key = re.sub(r"[^a-z0-9]", "", word.lower().replace("♀", "f").replace("♂", "m"))
            override = aliases.get(identifier, aliases.get(word))
            if isinstance(override, str):
                catalog[identifier] = override
                continue
            if category == "Pokémon" and key in pokemon:
                catalog[identifier] = "https://www.pokemon.com/us/pokedex/" + pokemon[key]
                continue
            if override:
                choices = [tuple(pair) for pair in override]
            elif category == "Minecraft":
                choices = [("mc", word)]
            elif category == "Roblox":
                choices = [("rb", word)]
            elif category in FICTION:
                choices = [("pl", word + " (postać)"), ("en", word + " (character)"), ("pl", word), ("en", word)]
            else:
                choices = [("pl", word), ("en", word)]
            candidates[identifier] = choices
            for wiki, title in choices:
                requests[wiki].add(title)
    batches = []
    for wiki, titles in requests.items():
        titles = sorted(titles)
        batches.extend((wiki, titles[i:i+45]) for i in range(0, len(titles), 45))
    found = {}
    for wiki in WIKIS:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as workers:
            for _, matches in workers.map(lambda pair: fetch_batch(*pair), (b for b in batches if b[0] == wiki)):
                found.update({(wiki, name): link for name, link in matches.items()})
    unresolved = []
    for identifier, choices in candidates.items():
        for choice in choices:
            if choice in found:
                catalog[identifier] = found[choice]
                break
        else:
            unresolved.append(identifier)
    # Collapse entries with the same article. Keep category-qualified overrides for homonyms.
    by_word = {}
    for identifier in candidates.keys() | catalog.keys():
        word = identifier.split("|", 1)[1]
        by_word.setdefault(word, []).append(identifier)
    compact = {}
    for word, identifiers in by_word.items():
        values = {catalog.get(key) for key in identifiers}
        if len(values) == 1 and None not in values:
            compact[word] = values.pop()
        else:
            for key in identifiers:
                if key in catalog:
                    compact[key] = catalog[key]
    (INPUT / "references.js").write_text(
        "// Generated by scripts/buildIdentityReferences.py.\nexport const identityReferences = "
        + json.dumps(compact, sort_keys=True, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"Resolved {len(catalog)} category cards. Unresolved ({len(unresolved)}):", flush=True)
    print("\n".join(sorted(unresolved)))


if __name__ == "__main__":
    main()
