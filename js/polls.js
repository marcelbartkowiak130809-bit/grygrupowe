import { getRemotePollVotes, voteRemotePoll } from "./firebase.js?v=20260822-16";
const pollStorageKey = "udowodnij.pollVotes.v1";

export const polls = [
  {
    id: "next-feature-v2-1-2026-06-12",
    question: "Co następnego powinno zostać dodane?",
    endsAt: "2026-06-12T20:00:00+02:00",
    options: [
      { id: "cosmetics", label: "Więcej kosmetyków!" },
      { id: "new-mode", label: "Nowy tryb" },
      { id: "questions", label: "Więcej kategorii i pytań" },
    ],
  },
];

const readVotes = () => {
  try { return JSON.parse(localStorage.getItem(pollStorageKey) || "{}"); } catch { return {}; }
};
const writeVotes = votes => localStorage.setItem(pollStorageKey, JSON.stringify(votes));
function writeLocalVote(pollId, voterId, optionId) {
  const votes = readVotes(), pollVotes = { ...(votes[pollId] || {}) };
  if (pollVotes[voterId]) return false;
  pollVotes[voterId] = optionId;
  writeVotes({ ...votes, [pollId]:pollVotes });
  return true;
}

export function activePoll(now = Date.now()) {
  return polls.find(poll => Number(new Date(poll.endsAt)) > now) || null;
}

export function latestPoll() {
  return polls[0] || null;
}

export function pollState(poll, voterId, now = Date.now()) {
  if (!poll) return { poll:null, active:false, ended:false, vote:null, totals:{}, total:0, showResults:false };
  const votes = readVotes()[poll.id] || {};
  return buildPollStateFromVotes(poll, votes, votes[voterId] || null, "local", now);
}

function emptyTotals(poll) {
  return Object.fromEntries(poll.options.map(option => [option.id, 0]));
}

function buildPollStateFromVotes(poll, votes, vote, source, now = Date.now()) {
  const totals = emptyTotals(poll);
  Object.values(votes).forEach(optionId => { if (optionId in totals) totals[optionId] += 1; });
  return buildPollStateFromTotals(poll, totals, vote, source, now);
}

function buildPollStateFromTotals(poll, incomingTotals, vote, source, now = Date.now()) {
  const totals = emptyTotals(poll);
  poll.options.forEach(option => totals[option.id] = Number(incomingTotals?.[option.id] || 0));
  const ended = Number(new Date(poll.endsAt)) <= now;
  return { poll, active:!ended, ended, vote, totals, total:Object.values(totals).reduce((sum, value) => sum + value, 0), showResults:ended, source };
}

export async function pollStateOnline(poll, voterId, now = Date.now()) {
  if (!poll) return pollState(poll, voterId, now);
  const localVotes = readVotes()[poll.id] || {};
  await Promise.all(Object.entries(localVotes)
    .filter(([, optionId]) => poll.options.some(option => option.id === optionId))
    .map(([localVoterId, optionId]) => voteRemotePoll({ pollId:poll.id, voterId:localVoterId, optionId })));
  const remote = await getRemotePollVotes(poll.id, voterId);
  if (remote) return buildPollStateFromTotals(poll, remote.totals, remote.vote || localVotes[voterId] || null, remote.source, now);
  return pollState(poll, voterId, now);
}

export async function votePoll(pollId, voterId, optionId) {
  const poll = polls.find(item => item.id === pollId);
  if (!poll || !voterId || Number(new Date(poll.endsAt)) <= Date.now()) return false;
  if (!poll.options.some(option => option.id === optionId)) return false;
  const remoteAccepted = await voteRemotePoll({ pollId, voterId, optionId });
  const localAccepted = writeLocalVote(pollId, voterId, optionId);
  return remoteAccepted || localAccepted;
}

export function formatPollTime(endsAt) {
  return new Intl.DateTimeFormat("pl-PL", { day:"numeric", month:"long", hour:"2-digit", minute:"2-digit" }).format(new Date(endsAt));
}

export function countdownText(endsAt, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((Number(new Date(endsAt)) - now) / 1000));
  const days = Math.floor(seconds / 86400), hours = Math.floor((seconds % 86400) / 3600), minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `${days}d ${hours}h ${minutes}m`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
