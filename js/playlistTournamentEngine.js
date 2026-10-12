// A single-elimination bracket. Every track enters once; odd rounds get a bye.
export const TOURNAMENT_PREVIEW_SECONDS = 10;
const states = new Map();
const storageKey = owner => `grygrupowe-playlist-tournament-v1:${owner}`;
const https = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };
export function tournamentTracks(tracks) {
  const seen = new Set();
  const seenIds = new Set();
  return (Array.isArray(tracks) ? tracks : []).slice(0, 200).flatMap(track => {
    const key = `${track.artist}|${track.title}`.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    if (!track.id || !track.title || !track.artist || !https(track.previewUrl) || seen.has(key) || seenIds.has(String(track.id))) return [];
    seen.add(key); seenIds.add(String(track.id));
    return [{id:String(track.id), title:String(track.title).slice(0, 180), artist:String(track.artist).slice(0, 180),
      previewUrl:https(track.previewUrl), coverUrl:https(track.coverUrl), externalUrl:https(track.externalUrl)}];
  });
}
const empty = () => ({status:'setup', tracks:[], history:[], byes:[], entrants:[], survivors:[], index:0, round:0, match:0, stage:'left', seconds:{left:0,right:0}, winnerId:'', session:'', startedAt:0, finishedAt:0});
export function tournamentDuration(state) {
  const start = Number(state.startedAt), end = Number(state.finishedAt);
  return start > 0 && end >= start ? end - start : null;
}
function save(owner, state) { try { globalThis.localStorage?.setItem(storageKey(owner), JSON.stringify(state)); } catch {} }
function get(owner = 'guest') {
  owner = String(owner);
  if (!states.has(owner)) {
    let state = empty();
    try {
      const stored = JSON.parse(globalThis.localStorage?.getItem(storageKey(owner)) || 'null');
      if (stored && stored.tracks?.length >= 2 && ['setup','playing','done'].includes(stored.status)) {
        const tracks = tournamentTracks(stored.tracks), ids = new Set(tracks.map(t => t.id));
        const refs = [...(stored.entrants || []), ...(stored.survivors || [])];
        if (tracks.length === stored.tracks.length && refs.every(id => ids.has(id)) && Array.isArray(stored.history)
          && Array.isArray(stored.byes) && ['left','right','choice'].includes(stored.stage)) state = {...empty(), ...stored, tracks};
      }
    } catch {}
    states.set(owner, state);
  }
  return states.get(owner);
}
export function tournamentMatchKey(state) { return `${state.session}:${state.round}:${state.match}`; }
export function tournamentPair(state) {
  return state.entrants.slice(state.index, state.index + 2).map(id => state.tracks.find(track => track.id === id));
}
function beginPair(state) {
  while (state.entrants.length - state.index < 2) {
    if (state.index < state.entrants.length) {
      const trackId = state.entrants[state.index];
      state.survivors.push(trackId); state.byes.push({round:state.round, trackId});
    }
    if (state.survivors.length === 1) {
      state.winnerId = state.survivors[0]; state.status = 'done'; return;
    }
    state.entrants = state.survivors; state.survivors = []; state.index = 0; state.round++;
  }
  state.match++; state.stage = 'left'; state.seconds = {left:0,right:0};
}
export const PlaylistTournamentEngine = {
  get,
  load(owner, tracks) {
    const clean = tournamentTracks(tracks);
    if (clean.length < 2) throw new Error('Potrzebne są co najmniej 2 różne utwory z odsłuchem.');
    const state = {...empty(), tracks:clean}; states.set(String(owner), state); save(owner, state); return state;
  },
  start(owner, random = Math.random, now = Date.now()) {
    const previous = get(owner);
    if (previous.tracks.length < 2) throw new Error('Najpierw załaduj playlistę.');
    const entrants = previous.tracks.map(t => t.id);
    for (let i = entrants.length - 1; i > 0; i--) { const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1)))); [entrants[i], entrants[j]] = [entrants[j], entrants[i]]; }
    const state = {...empty(), tracks:previous.tracks, status:'playing', entrants, round:1, session:`${now}-${Math.random()}`, startedAt:now};
    beginPair(state); states.set(String(owner), state); save(owner, state); return state;
  },
  progress(owner, side, seconds, expected) {
    const state = get(owner);
    if (state.status !== 'playing' || tournamentMatchKey(state) !== expected || !['left','right'].includes(side)) return false;
    state.seconds[side] = Math.max(0, Math.min(TOURNAMENT_PREVIEW_SECONDS, Number(seconds) || 0)); return true;
  },
  finishPreview(owner, side, expected) {
    const state = get(owner);
    if (state.status !== 'playing' || tournamentMatchKey(state) !== expected || state.stage !== side) return false;
    state.seconds[side] = TOURNAMENT_PREVIEW_SECONDS; state.stage = side === 'left' ? 'right' : 'choice'; save(owner, state); return true;
  },
  choose(owner, side, expected, now = Date.now()) {
    const state = get(owner);
    if (state.status !== 'playing' || state.stage !== 'choice' || tournamentMatchKey(state) !== expected || !['left','right'].includes(side)) return false;
    const pair = tournamentPair(state), winner = pair[side === 'left' ? 0 : 1], loser = pair[side === 'left' ? 1 : 0];
    state.history.push({round:state.round, match:state.match, winnerId:winner.id, loserId:loser.id, leftId:pair[0].id, rightId:pair[1].id});
    state.survivors.push(winner.id); state.index += 2; beginPair(state);
    if (state.status === 'done') state.finishedAt = Math.max(state.startedAt, now);
    save(owner, state); return true;
  },
  reset(owner) { const state = get(owner); const next = {...empty(), tracks:state.tracks}; states.set(String(owner), next); save(owner, next); return next; },
};
