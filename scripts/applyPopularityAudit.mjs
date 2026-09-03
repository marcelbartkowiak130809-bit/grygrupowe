import fs from "node:fs";
import path from "node:path";

const reportPath = process.argv[2];
if (!reportPath) throw new Error("Podaj ścieżkę do raportu audytu JSON.");
const outputPath = process.argv[3] || path.resolve("js/popularityViewSnapshots.js");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const fallbackPath = process.argv[4];
const fallbackReport = fallbackPath ? JSON.parse(fs.readFileSync(fallbackPath, "utf8")) : {};
const normalize = value => String(value || "").toLocaleLowerCase("en-US").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const compact = value => normalize(value).replace(/ /g, "");

// Te pozycje zostały potwierdzone ręcznie, gdy wyszukiwarka YouTube zwracała
// chwilowy błąd albo nie umiała przypisać oficjalnego kanału do wykonawcy.
const manualSnapshots = new Map([
  [compact("Problem (feat. Iggy Azalea) Ariana Grande"), 1497008330],
  [compact("everything i wanted Billie Eilish"), 532296844],
  [compact("Levels Avicii"), 783843255],
  [compact("X Nicky Jam & J Balvin"), 2353562399],
  [compact("ON BTS"), 353757743],
  [compact("TP Rod Wave"), 630417],
  [compact("X (feat. Future) 21 Savage & Metro Boomin"), 196672185],
  [compact("Nasz Lato Kizo"), 48804747],
  [compact("Rude Boy Rihanna"), 738658874],
  [compact("S&M Rihanna"), 279964841],
  [compact("Juicy Doja Cat"), 394008378],
  [compact("Tia Tamera (feat. Rico Nasty) Doja Cat"), 131436898],
  [compact("Stereo Hearts Gym Class Heroes"), 1092256422],
  [compact("We Can't Stop Miley Cyrus"), 1016725834],
  [compact("Let's Get It Started The Black Eyed Peas"), 316748283],
  [compact("Boom Boom Pow The Black Eyed Peas"), 553729847],
  [compact("I Gotta Feeling The Black Eyed Peas"), 979617115],
  [compact("Valerie Amy Winehouse"), 36759270],
  [compact("DÁKITI Bad Bunny & Jhayco"), 1789637007],
  [compact("Queencard (G)I-DLE"), 454613824],
  [compact("eight IU ft. SUGA"), 195152527],
  [compact("Nie ma fal Dawid Podsiadło"), 50797028],
  [compact("Patointeligencja Mata"), 75759691],
  [compact("Jest taki dzień Czerwone Gitary"), 928429],
  [compact("Something Just Like This The Chainsmokers & Coldplay"), 2544351786],
  [compact("My Oh My Camila Cabello"), 146022005],
  [compact("Despacito (Remix) Luis Fonsi & Daddy Yankee"), 693095659],
  [compact("Just Dance Lady Gaga & Colby O'Donis"), 542221828],
  [compact("Loving You Minnie Riperton"), 7899851],
  [compact("Good Luck, Babe! Chappell Roan"), 155528391],
  [compact("I Had Some Help Post Malone & Morgan Wallen"), 255146977],
  [compact("2:00 sanah"), 48303845],
  [compact("ten Stan sanah"), 81908149],
  [compact("kolońska i szlugi sanah"), 54429672],
  [compact("Orbiter Noah Kahan"), 8433351],
  [compact("You Right Doja Cat & The Weeknd"), 404875437],
  [compact("Rain On Me Lady Gaga & Ariana Grande"), 465628734],
  [compact("Is It Over Now? (Taylor's Version) [From the Vault] Taylor Swift"), 36248476],
  [compact("What I Want Morgan Wallen & Tate McRae"), 21734744],
  [compact("9 to 5 Dolly Parton"), 113390366],
  [compact("Fast Car Luke Combs"), 76607906],
  [compact("I Knew It, I Knew You (From Toy Story 5) Taylor Swift"), 25456372],
  [compact("We Found Love (feat. Calvin Harris) Rihanna"), 1200889382],
  [compact("motive Ariana Grande & Doja Cat"), 66320749],
  [compact("Mr. Right Now (feat. Drake) 21 Savage & Metro Boomin"), 21584343],
  [compact("Peso A$AP Rocky"), 86497153],
  [compact("Creepin' Metro Boomin, The Weeknd & 21 Savage"), 64960355],
  [compact("F**kin' Problems (feat. Drake, 2 Chainz & Kendrick Lamar) A$AP Rocky"), 368571589],
  [compact("L$D A$AP Rocky"), 194966146],
  [compact("Everyday (feat. Rod Stewart x Miguel x Mark Ronson) A$AP Rocky"), 112571057],
  [compact("Praise The Lord (Da Shine) [feat. Skepta] A$AP Rocky"), 760975744],
  [compact("Fashion Killa A$AP Rocky"), 121415011],
  [compact("Goldie A$AP Rocky"), 76032317],
  [compact("Sundress A$AP Rocky"), 55078627],
  [compact("Black Skinhead Kanye West"), 78996123],
  [compact("WIĘCEJ NIEBA Otsochodzi"), 681623],
  [compact("Climbing Cptime"), 480],
  [compact("Schodki Mata"), 81522744],
  [compact("Benz-Dealer Quebonafide"), 7970436],
  [compact("05:05 Bedoes 2115"), 75168634],
  [compact("Taxi Kizo"), 162266940],
  [compact("Jungle Girl Young Leosia"), 53345005],
  [compact("Szklanki Young Leosia"), 45005585],
  [compact("Baila Ella Young Leosia"), 21181984],
  [compact("Sexoholik Żabson"), 36003132],
  [compact("Anyone I Want To Be Roksana Węgiel"), 39976413],
  [compact("My Słowianie Cleo & Donatan"), 12952410],
  [compact("Miasto Roksana Węgiel"), 9183523],
  [compact("DOM (STAMINA) Cleo"), 75556171],
  [compact("Orła cień Varius Manx"), 26981799],
  [compact("Takie ładne oczy Czerwone Gitary"), 3140112],
  [compact("I Can't Love You Anymore Ella Langley & Morgan Wallen"), 10324683],
  [compact("WTF GOIN Belly Gang Kushington & 21 Savage"), 7474737],
  [compact("Ahí KAROL G & Drake"), 7092009],
  [compact("AH HA Cardi B"), 6549885],
  [compact("Movin' To The Sun HUGEL, Imael Angel & Ultra Naté"), 11442843],
  [compact("What is Love? TWICE"), 939305331],
  [compact("Super SEVENTEEN"), 303113041],
  [compact("I Am Rod Wave"), 1059225],
  [compact("12 to 12 sombr"), 62274698],
  [compact("Greyhound Swedish House Mafia"), 709623],
]);

const hardReject = /unofficial|cover|reaction|karaoke|sped up|slowed|nightcore|live video|concert|performance|teaser|preview|dance video|fan made|fanmade/i;
const isRejected = row => hardReject.test(`${row?.videoTitle || ""} ${row?.channel || ""}`) || (/\bremix\b/i.test(row?.videoTitle || "") && !/\bremix\b/i.test(row?.title || ""));
const artistParts = value => String(value || "").replace(/\b(?:feat\.?|ft\.?|featuring|with)\b/gi, "&").split(/[&,]/).map(normalize).filter(part => part.length > 2);
const trustworthyReview = row => {
  if (!row || !row.videoId || !(Number(row.youtubeViews) > 0) || isRejected(row)) return false;
  const title = compact(row.title), videoTitle = compact(row.videoTitle), channel = compact(row.channel);
  if (title.length < 2 || !videoTitle.includes(title)) return false;
  const artistMatch = artistParts(row.artist).some(part => {
    const partTokens = part.split(" ").filter(token => token.length > 3 && token !== "the");
    return channel.includes(compact(part)) || partTokens.some(token => channel.includes(token));
  });
  const trustedChannel = /vevo|records|label|topic|warner|universal|sony|columbia|interscope|fueledbyramen|recording/i.test(normalize(row.channel));
  return artistMatch || trustedChannel;
};
const usable = row => {
  if (!row || !row.videoId || !(Number(row.youtubeViews) > 0) || isRejected(row)) return false;
  const titleTokens = normalize(row.title).split(" ").filter(token => token.length > 2 && !["feat", "the"].includes(token));
  const videoTitle = normalize(row.videoTitle);
  const titleMatches = titleTokens.filter(token => videoTitle.includes(token)).length;
  if (!titleMatches || titleMatches < Math.max(1, Math.ceil(titleTokens.length * 0.55))) return false;
  return row.status === "ok" || trustworthyReview(row);
};
const rowsByKey = new Map(Object.values(report).map(row => [row.key, row]));
for (const row of Object.values(fallbackReport)) {
  if (usable(row) && !usable(rowsByKey.get(row.key))) rowsByKey.set(row.key, { ...row, source: "fallback-audit" });
}
const rows = [...rowsByKey.values()];
const snapshots = new Map();
for (const row of rows) {
  if (usable(row) && Number.isFinite(Number(row.youtubeViews)) && Number(row.youtubeViews) > 0) {
    snapshots.set(row.key, Math.round(Number(row.youtubeViews)));
  }
}
for (const [key, value] of manualSnapshots) {
  snapshots.set(key, value);
}

const unresolved = rows.filter(row => !snapshots.has(row.key));
const lines = [
  "// Generated from the YouTube popularity audit. Do not edit individual values by hand.",
  `// Audit date: ${new Date().toISOString().slice(0, 10)}; verified: ${snapshots.size}; unresolved: ${unresolved.length}.`,
  "export const popularityViewSnapshots = new Map([",
  ...[...snapshots.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `  [${JSON.stringify(key)}, ${value}],`),
  "]);",
  `export const popularityViewAuditMeta = ${JSON.stringify({ auditDate: new Date().toISOString().slice(0, 10), total: rows.length, verified: snapshots.size, unresolved: unresolved.map(row => ({ key: row.key, title: row.title, artist: row.artist, status: row.status })) }, null, 2)};`,
  "",
];
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n"));
console.log(JSON.stringify({ outputPath, total: rows.length, verified: snapshots.size, unresolved: unresolved.length, unresolvedItems: unresolved.map(row => `${row.artist} — ${row.title}`) }, null, 2));
