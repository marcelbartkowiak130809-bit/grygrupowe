const pollStorageKey = "udowodnij.pollVotes.v1";

export const polls = [
  {
    id: "next-feature-v2-0",
    question: "Co następnego powinno zostać dodane?",
    endsAt: "2026-06-07T20:00:00+02:00",
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

export function activePoll(now = Date.now()) {
  return polls.find(poll => Number(new Date(poll.endsAt)) > now) || null;
}

export function latestPoll() {
  return polls[0] || null;
}

export function pollState(poll, voterId, now = Date.now()) {
  if (!poll) return { poll:null, active:false, ended:false, vote:null, totals:{}, total:0, showResults:false };
  const votes = readVotes()[poll.id] || {};
  const totals = Object.fromEntries(poll.options.map(option => [option.id, 0]));
  Object.values(votes).forEach(optionId => { if (optionId in totals) totals[optionId] += 1; });
  const ended = Number(new Date(poll.endsAt)) <= now;
  return { poll, active:!ended, ended, vote:votes[voterId] || null, totals, total:Object.values(totals).reduce((sum, value) => sum + value, 0), showResults:ended };
}

export function votePoll(pollId, voterId, optionId) {
  const poll = polls.find(item => item.id === pollId);
  if (!poll || !voterId || Number(new Date(poll.endsAt)) <= Date.now()) return false;
  if (!poll.options.some(option => option.id === optionId)) return false;
  const votes = readVotes(), pollVotes = { ...(votes[pollId] || {}) };
  if (pollVotes[voterId]) return false;
  pollVotes[voterId] = optionId;
  writeVotes({ ...votes, [pollId]:pollVotes });
  return true;
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
