import { claimModeCategoryRelease, getRemotePollVotes, loadModeCategoryReleases, voteRemotePoll } from "./firebase.js?v=20260901-6";

export const CATEGORY_VOTING_START_AT = "2026-09-01T20:00:00+02:00";
export const CATEGORY_VOTE_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
export const CATEGORY_RESULT_DURATION_MS = 24 * 60 * 60 * 1000;
export const CATEGORY_CYCLE_DURATION_MS = CATEGORY_VOTE_DURATION_MS + CATEGORY_RESULT_DURATION_MS;

const CATEGORY_RELEASES_KEY = "udowodnij.modeCategoryVoting.v1";
const CATEGORY_VOTES_KEY = "udowodnij.modeCategoryVotes.v1";
const HIDDEN_SOLO_VARIANTS = new Set(["popularnosc-solo"]);
const CATEGORY_MODE_IDS = {
  pokemon: ["pokemon-last-letter", "pokemon-evolution", "pokemon-auction", "pokemon-types", "pokemon-match-type"],
  board: ["board-chinczyk", "board-slowotwor", "board-statki", "board-reversi", "board-warcaby", "board-cztery", "board-memory", "board-domino"],
  minecraft: ["minecraft-sprint", "minecraft-crafting", "minecraft-mob", "minecraft-biome", "minecraft-truth", "minecraft-redstone"],
  music: ["pojedynek-hitow", "bitwa-hitow", "popularnosc-hitow"],
};

export const categoryVoteCategories = [
  { id: "pokemon", label: "Pokémon", icon: "⚡", description: "Pokédex, ewolucje i typy" },
  { id: "board", label: "Planszówki", icon: "🎲", description: "Klasyczne gry przy jednej planszy" },
  { id: "minecraft", label: "Minecraft", icon: "⛏️", description: "Moby, crafting, biomy i redstone" },
  { id: "music", label: "Muzyka", icon: "🎵", description: "Hity, pojedynki i popularność" },
];

const categoryMap = new Map(categoryVoteCategories.map(category => [category.id, category]));
const publicCategoryModes = categoryId => (CATEGORY_MODE_IDS[categoryId] || []).filter(modeId => !HIDDEN_SOLO_VARIANTS.has(modeId)).map(id => ({ id }));
const releaseModeId = modeId => modeId === "popularnosc-solo" ? "popularnosc-hitow" : modeId;

let cachedReleases;

function safeLocalStorage() {
  try { return window.localStorage; } catch { return null; }
}

function readLocalReleases() {
  if (cachedReleases) return { ...cachedReleases };
  try {
    const saved = JSON.parse(safeLocalStorage()?.getItem(CATEGORY_RELEASES_KEY) || "{}");
    cachedReleases = saved?.releases && typeof saved.releases === "object" ? { ...saved.releases } : {};
  } catch { cachedReleases = {}; }
  return { ...cachedReleases };
}

function saveLocalReleases(releases) {
  cachedReleases = { ...releases };
  try { safeLocalStorage()?.setItem(CATEGORY_RELEASES_KEY, JSON.stringify({ version: 1, startAt: CATEGORY_VOTING_START_AT, releases: cachedReleases })); } catch {}
}

function normalizeRelease(value, cycleIndex) {
  const categoryId = String(value?.categoryId || "");
  const modeId = releaseModeId(String(value?.modeId || ""));
  if (!categoryMap.has(categoryId) || !publicCategoryModes(categoryId).some(mode => mode.id === modeId)) return null;
  return {
    cycle: Number.isFinite(Number(value?.cycle)) ? Number(value.cycle) : cycleIndex,
    categoryId,
    modeId,
    pollId: String(value?.pollId || categoryPollId(cycleIndex)),
    decidedAt: Number(value?.decidedAt) || Date.now(),
  };
}

function mergeReleases(local, remote) {
  const merged = { ...local };
  Object.entries(remote?.releases || {}).forEach(([cycleIndex, release]) => {
    const normalized = normalizeRelease(release, Number(cycleIndex));
    if (normalized) merged[String(cycleIndex)] = normalized;
  });
  saveLocalReleases(merged);
  return merged;
}

export function getCategoryReleases() {
  return readLocalReleases();
}

export function isCategoryModeReleased(modeId, releases = readLocalReleases()) {
  const normalizedModeId = releaseModeId(modeId);
  return Object.values(releases).some(release => releaseModeId(release?.modeId) === normalizedModeId);
}

export function categoryModesRemaining(categoryId, releases = readLocalReleases()) {
  const released = new Set(Object.values(releases).filter(release => release?.categoryId === categoryId).map(release => releaseModeId(release.modeId)));
  return publicCategoryModes(categoryId).filter(mode => !released.has(mode.id));
}

export function eligibleCategoryVotes(releases = readLocalReleases()) {
  return categoryVoteCategories.filter(category => categoryModesRemaining(category.id, releases).length > 0);
}

function categoryPollId(cycleIndex) {
  return `mode-category-${cycleIndex}`;
}

export function categoryVoteCycle(now = Date.now()) {
  const startAt = new Date(CATEGORY_VOTING_START_AT).getTime();
  const safeNow = Number.isFinite(now) ? now : Date.now();
  if (!Number.isFinite(startAt) || safeNow < startAt) {
    return { index: 0, phase: "voting", phaseStartsAt: startAt, phaseEndsAt: startAt + CATEGORY_VOTE_DURATION_MS, cycleEndsAt: startAt + CATEGORY_CYCLE_DURATION_MS };
  }
  const index = Math.floor((safeNow - startAt) / CATEGORY_CYCLE_DURATION_MS);
  const cycleStartsAt = startAt + index * CATEGORY_CYCLE_DURATION_MS;
  const inCycle = safeNow - cycleStartsAt;
  const voting = inCycle < CATEGORY_VOTE_DURATION_MS;
  return {
    index,
    phase: voting ? "voting" : "result",
    phaseStartsAt: cycleStartsAt + (voting ? 0 : CATEGORY_VOTE_DURATION_MS),
    phaseEndsAt: cycleStartsAt + (voting ? CATEGORY_VOTE_DURATION_MS : CATEGORY_CYCLE_DURATION_MS),
    cycleEndsAt: cycleStartsAt + CATEGORY_CYCLE_DURATION_MS,
  };
}

export function categoryVotePoll(cycleIndex, categories = eligibleCategoryVotes(), releases = readLocalReleases()) {
  const startAt = new Date(CATEGORY_VOTING_START_AT).getTime() + cycleIndex * CATEGORY_CYCLE_DURATION_MS;
  return {
    id: categoryPollId(cycleIndex),
    question: "Która kategoria ma odblokować następny tryb?",
    startsAt: new Date(startAt).toISOString(),
    endsAt: new Date(startAt + CATEGORY_VOTE_DURATION_MS).toISOString(),
    options: categories.map(category => ({ ...category, remaining: categoryModesRemaining(category.id, releases) })),
  };
}

function readLocalVotes() {
  try { return JSON.parse(safeLocalStorage()?.getItem(CATEGORY_VOTES_KEY) || "{}"); } catch { return {}; }
}

function writeLocalVote(pollId, voterId, optionId) {
  const votes = readLocalVotes();
  const pollVotes = { ...(votes[pollId] || {}) };
  if (pollVotes[voterId]) return false;
  pollVotes[voterId] = optionId;
  try { safeLocalStorage()?.setItem(CATEGORY_VOTES_KEY, JSON.stringify({ ...votes, [pollId]: pollVotes })); } catch {}
  return true;
}

function localPollState(poll, voterId, now = Date.now()) {
  const votes = readLocalVotes()[poll.id] || {};
  const totals = Object.fromEntries(poll.options.map(option => [option.id, 0]));
  Object.values(votes).forEach(optionId => { if (optionId in totals) totals[optionId] += 1; });
  const ended = Number(new Date(poll.endsAt)) <= now;
  return { poll, active: !ended, ended, vote: votes[voterId] || null, totals, total: Object.values(totals).reduce((sum, value) => sum + value, 0), source: "local" };
}

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function chooseRelease(cycleIndex, poll, pollState, releases) {
  const categories = poll.options.filter(option => categoryModesRemaining(option.id, releases).length > 0);
  if (!categories.length) return null;
  const highest = Math.max(...categories.map(option => Number(pollState?.totals?.[option.id]) || 0));
  const tied = categories.filter(option => (Number(pollState?.totals?.[option.id]) || 0) === highest);
  const category = tied[hashSeed(`category:${cycleIndex}`) % tied.length];
  const remaining = categoryModesRemaining(category.id, releases);
  if (!remaining.length) return null;
  const mode = remaining[hashSeed(`mode:${cycleIndex}:${category.id}`) % remaining.length];
  return { cycle: cycleIndex, categoryId: category.id, modeId: mode.id, pollId: poll.id, decidedAt: Date.now() };
}

async function resolveMissingReleases(cycle, voterId, releases) {
  const remote = await loadModeCategoryReleases();
  if (remote) releases = mergeReleases(releases, remote);
  for (let index = 0; index <= cycle.index; index += 1) {
    if (releases[String(index)]) continue;
    const cycleStart = new Date(CATEGORY_VOTING_START_AT).getTime() + index * CATEGORY_CYCLE_DURATION_MS;
    const resultStartsAt = cycleStart + CATEGORY_VOTE_DURATION_MS;
    if (Date.now() < resultStartsAt) break;
    const categories = eligibleCategoryVotes(releases);
    if (!categories.length) break;
    const poll = categoryVotePoll(index, categories, releases);
    const local = localPollState(poll, voterId, Date.now());
    const remotePoll = await getRemotePollVotes(poll.id, voterId, poll.options.map(option => option.id));
    const pollState = remotePoll ? { ...local, totals: remotePoll.totals, total: Object.values(remotePoll.totals || {}).reduce((sum, value) => sum + (Number(value) || 0), 0), vote: remotePoll.vote || local.vote, source: remotePoll.source } : local;
    const release = chooseRelease(index, poll, pollState, releases);
    if (!release) break;
    releases[String(index)] = release;
    saveLocalReleases(releases);
    await claimModeCategoryRelease(index, release);
    const latestRemote = await loadModeCategoryReleases();
    if (latestRemote) releases = mergeReleases(releases, latestRemote);
  }
  return releases;
}

export async function loadCategoryVotingView(voterId = "anonymous", now = Date.now()) {
  const cycle = categoryVoteCycle(now);
  let releases = readLocalReleases();
  releases = await resolveMissingReleases(cycle, voterId, releases);
  const categories = eligibleCategoryVotes(releases);
  if (!categories.length) return { phase: "complete", cycleIndex: cycle.index, releases, categories: [], poll: null, pollState: null, phaseEndsAt: cycle.cycleEndsAt };
  const poll = categoryVotePoll(cycle.index, categories, releases);
  const pollStateRemote = await getRemotePollVotes(poll.id, voterId, poll.options.map(option => option.id));
  const pollState = pollStateRemote ? { ...localPollState(poll, voterId, now), totals: pollStateRemote.totals, total: Object.values(pollStateRemote.totals || {}).reduce((sum, value) => sum + (Number(value) || 0), 0), vote: pollStateRemote.vote || localPollState(poll, voterId, now).vote, source: pollStateRemote.source } : localPollState(poll, voterId, now);
  const release = releases[String(cycle.index)] || null;
  return { phase: release || cycle.phase === "result" ? "result" : "voting", cycleIndex: cycle.index, releases, categories, poll, pollState, release, phaseEndsAt: cycle.phaseEndsAt, cycleEndsAt: cycle.cycleEndsAt };
}

export async function voteCategory(view, voterId, categoryId) {
  if (!view?.poll || view.phase !== "voting" || !voterId || view.pollState?.vote) return false;
  if (!view.poll.options.some(option => option.id === categoryId)) return false;
  const localAccepted = writeLocalVote(view.poll.id, voterId, categoryId);
  if (!localAccepted) return false;
  const remoteAccepted = await voteRemotePoll({ pollId: view.poll.id, voterId, optionId: categoryId, optionIds: view.poll.options.map(option => option.id) });
  return remoteAccepted || localAccepted;
}

export function categoryName(categoryId) {
  return categoryMap.get(categoryId)?.label || categoryId;
}

export function categoryForMode(modeId) {
  const normalizedModeId = releaseModeId(modeId);
  const categoryId = Object.entries(CATEGORY_MODE_IDS).find(([, modeIds]) => modeIds.includes(normalizedModeId))?.[0];
  return categoryMap.get(categoryId) || null;
}
