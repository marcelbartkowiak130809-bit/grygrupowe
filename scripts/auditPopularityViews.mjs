import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { popularityTracks } from "../js/popularity.js?v=auditor";

const args = new Map(process.argv.slice(2).map((value, index, values) => value.startsWith("--") ? [value, values[index + 1] || true] : null).filter(Boolean));
const outputPath = String(args.get("--output") || path.join(os.tmpdir(), "grygrupowe-popularity-views-audit.json"));
const limit = Number(args.get("--limit") || 0) || Infinity;
const concurrency = Math.max(1, Math.min(6, Number(args.get("--concurrency") || 3) || 3));
const delayMs = Math.max(0, Number(args.get("--delay") || 350) || 350);
const retryNonOk = Boolean(args.get("--retry-non-ok"));
const forceRefresh = Boolean(args.get("--force"));
const MIN_AUTO_SNAPSHOT = 1000000;

const normalize = value => String(value || "").toLocaleLowerCase("en-US").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const compact = value => normalize(value).replace(/ /g, "");
const countFromText = value => {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
};
const titleCore = title => normalize(String(title || "").replace(/\([^)]*\)|\[[^\]]*\]/g, " ").replace(/\s+(feat\.?|ft\.?|featuring)\s+.*/i, " "));
const badWords = /\b(?:lyrics?|cover|reaction|karaoke|remix|sped up|slowed|nightcore|live video|concert|performance|interview|trailer|teaser|on the dance floor|compilation|fan made|fanmade|shorts|preview)\b/i;
const suspiciousChannels = ["fan", "page", "preview", "unofficial", "lyrics", "cover", "reaction", "karaoke", "reupload", "topic music"];

function uniqueTracks() {
  const seen = new Set();
  return popularityTracks.filter(track => {
    const key = compact(`${track.title} ${track.artist}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseSearchResults(html) {
  const prefix = "var ytInitialData = ";
  const start = html.indexOf(prefix), end = html.indexOf(";</script>", start);
  if (start < 0 || end < 0) return [];
  let data;
  try { data = JSON.parse(html.slice(start + prefix.length, end)); } catch { return []; }
  const results = [];
  const walk = value => {
    if (!value || typeof value !== "object") return;
    if (value.videoRenderer) {
      const video = value.videoRenderer;
      results.push({
        title: (video.title?.runs || []).map(run => run.text).join(""),
        views: video.viewCountText?.simpleText || (video.viewCountText?.runs || []).map(run => run.text).join(""),
        channel: (video.ownerText?.runs || []).map(run => run.text).join(""),
        id: video.videoId,
      });
    }
    Object.values(value).forEach(child => Array.isArray(child) ? child.forEach(walk) : walk(child));
  };
  walk(data);
  return results;
}

function candidateScore(track, candidate, index) {
  const requestedTitle = titleCore(track.title), candidateTitle = normalize(candidate.title), requestedArtist = normalize(track.artist);
  const primaryArtist = requestedArtist.split(" & ")[0].split(",")[0].trim();
  const artistNames = requestedArtist.split(/\s*&\s*|\s*,\s*|\s+(?:feat\.?|ft\.?|featuring)\s+/).map(value => value.trim()).filter(value => value.length > 2);
  const candidateChannel = normalize(candidate.channel), compactChannel = compact(candidate.channel), primaryArtistCompact = compact(primaryArtist), channelMatch = artistNames.some(artist => compactChannel.includes(compact(artist))) || (primaryArtist.length > 2 && compactChannel.includes(primaryArtistCompact));
  const titleTokens = requestedTitle.split(" ").filter(token => token.length > 2);
  const matchedTitleTokens = titleTokens.filter(token => candidateTitle.includes(token)).length;
  const artistTokens = primaryArtist.split(" ").filter(token => token.length > 1);
  const matchedArtistTokens = artistTokens.filter(token => candidateTitle.includes(token) || normalize(candidate.channel).includes(token)).length;
  const exactTitle = requestedTitle.length > 1 && (candidateTitle === requestedTitle || candidateTitle.includes(` ${requestedTitle} `) || candidateTitle.startsWith(`${requestedTitle} `) || candidateTitle.endsWith(` ${requestedTitle}`));
  const bad = badWords.test(candidateTitle);
  const officialVideo = candidateTitle.includes("official") && (candidateTitle.includes("mv") || candidateTitle.includes("music video") || candidateTitle.includes("video"));
  const officialAudio = candidateTitle.includes("official") && candidateTitle.includes("audio");
  const vevo = candidateTitle.includes("vevo") || candidateChannel.includes("vevo");
  const channelLike = /vevo|records|label|topic|official|music channel|artist/i.test(candidateChannel);
  const suspiciousChannel = suspiciousChannels.some(word => candidateChannel.includes(word));
  const exactArtistChannel = compactChannel === primaryArtistCompact;
  const trustedArtistChannel = channelMatch && !suspiciousChannel;
  let score = 0;
  if (exactTitle) score += 60;
  score += titleTokens.length ? Math.round((matchedTitleTokens / titleTokens.length) * 25) : 0;
  score += artistTokens.length ? Math.round((matchedArtistTokens / artistTokens.length) * 25) : 0;
  if (officialVideo) score += 35;
  else if (officialAudio) score += 22;
  else if (candidateTitle.includes("official")) score += 18;
  if (vevo) score += 20;
  if (channelMatch) score += 25;
  else if (channelLike) score += 8;
  else score -= 20;
  if (bad) score -= 45;
  if (index === 0) score += 5;
  const strongOfficial = exactTitle && (officialVideo || officialAudio || vevo) && channelLike;
  const quality = !bad && exactTitle && (trustedArtistChannel || strongOfficial) ? officialVideo ? 4 : officialAudio || vevo ? 3 : 2 : 0;
  const channelRank = exactArtistChannel ? 3 : trustedArtistChannel ? 2 : strongOfficial ? 1 : 0;
  return { score, channelMatch, strongOfficial, exactTitle, bad, suspiciousChannel, quality, channelRank, viewCount: countFromText(candidate.views) || 0 };
}

function chooseCandidate(track, results) {
  const ranked = results.map((candidate, index) => ({ ...candidate, ...candidateScore(track, candidate, index) }))
    .filter(candidate => candidate.views && candidate.id);
  const highConfidence = ranked.filter(candidate => candidate.quality > 0);
  const pool = highConfidence.length ? highConfidence : ranked;
  const exactTitlePool = pool.filter(candidate => candidate.exactTitle);
  const comparable = exactTitlePool.length ? exactTitlePool : pool;
  const largestViewCount = Math.max(...comparable.map(candidate => candidate.viewCount), 0);
  // A result with a matching title and a tiny count is often a mirror or
  // reupload. If another equally titled official-looking result is over 100M,
  // never let the tiny result win solely because its channel name matches.
  const withoutTinyOutlier = comparable.filter(candidate => !(
    candidate.viewCount > 0 &&
    candidate.viewCount < MIN_AUTO_SNAPSHOT &&
    largestViewCount >= 100000000 &&
    largestViewCount >= candidate.viewCount * 100
  ));
  return (withoutTinyOutlier.length ? withoutTinyOutlier : comparable)
    .sort((left, right) => right.viewCount - left.viewCount || right.quality - left.quality || right.channelRank - left.channelRank || right.score - left.score)[0] || null;
}

async function fetchTrack(track) {
  const query = encodeURIComponent(`${track.artist} ${track.title} official music video`);
  const url = `https://www.youtube.com/results?search_query=${query}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(10000) });
      const candidate = chooseCandidate(track, parseSearchResults(await response.text()));
      return {
        key: compact(`${track.title} ${track.artist}`),
        title: track.title,
        artist: track.artist,
        currentViews: Number(track.views) || 0,
        youtubeViews: countFromText(candidate?.views),
        youtubeText: candidate?.views || "",
        videoTitle: candidate?.title || "",
        videoId: candidate?.id || "",
        channel: candidate?.channel || "",
        channelMatch: Boolean(candidate?.channelMatch),
        strongOfficial: Boolean(candidate?.strongOfficial),
        score: candidate?.score || 0,
        status: candidate?.views && candidate.quality > 0 && (candidate.score || 0) >= 90 ? "ok" : "review",
      };
    } catch (error) {
      if (attempt === 2) return { key: compact(`${track.title} ${track.artist}`), title: track.title, artist: track.artist, currentViews: Number(track.views) || 0, youtubeViews: null, youtubeText: "", videoTitle: "", videoId: "", channel: "", score: 0, status: "error", error: error.message };
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

function readCache() {
  try { return JSON.parse(fs.readFileSync(outputPath, "utf8")); } catch { return {}; }
}

function writeCache(cache) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(cache, null, 2));
}

const tracks = uniqueTracks().slice(0, limit);
const cache = readCache();
const pending = tracks.filter(track => {
  const row = cache[compact(`${track.title} ${track.artist}`)];
  return forceRefresh || !row || (retryNonOk && row.status !== "ok");
});
let cursor = 0;
let completed = 0;
const worker = async () => {
  while (cursor < pending.length) {
    const track = pending[cursor++];
    cache[compact(`${track.title} ${track.artist}`)] = await fetchTrack(track);
    completed += 1;
    writeCache(cache);
    console.log(`[${completed}/${pending.length}] ${track.artist} — ${track.title}`);
    if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
  }
};

await Promise.all(Array.from({ length: concurrency }, worker));
const report = tracks.map(track => cache[compact(`${track.title} ${track.artist}`)]).filter(Boolean);
const summary = report.reduce((result, row) => { result[row.status] = (result[row.status] || 0) + 1; return result; }, {});
console.log(JSON.stringify({ outputPath, total: report.length, summary }, null, 2));
