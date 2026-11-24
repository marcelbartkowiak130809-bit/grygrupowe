import { applyAction, createMatch, matchView } from './engine.mjs';

const queueLife = 35000;
const finishLife = 10*60*1000;
const abandonedLife = 20*60*1000;

function ownEntry(pool,uid) {
  const id = pool.active?.[uid];
  const entry = pool.matches?.[id];
  if (!entry || entry.players.indexOf(uid) < 0) return null;
  return {id,entry,side:entry.players.indexOf(uid)};
}

export function statusFor(pool,uid,now) {
  const own = ownEntry(pool,uid);
  if (own) return {stage:own.entry.state.phase, id:own.id, match:matchView(own.entry.state,own.side), now};
  const ticket = pool.queue?.[uid];
  return {stage:ticket?.expires > now ? 'searching' : 'idle',now};
}

export function updatePool(previous, uid, request, now, random, newId) {
  const pool = structuredClone(previous || {});
  pool.matches ||= {};
  pool.queue ||= {};
  pool.active ||= {};
  if (request.kind === 'join') {
    for (const [id, entry] of Object.entries(pool.matches)) {
      if (now-entry.changed < (entry.state.phase === 'finished' ? finishLife : abandonedLife)) continue;
      for (const user of entry.players) if (pool.active[user] === id) delete pool.active[user];
      delete pool.matches[id];
    }
    for (const [user,ticket] of Object.entries(pool.queue)) {
      if (ticket.expires <= now || pool.active[user]) delete pool.queue[user];
    }
    const own = ownEntry(pool,uid);
    if (own?.entry.state.phase === 'battle') return pool;
    delete pool.active[uid];
    const rival = Object.entries(pool.queue).filter(([user]) => user !== uid)
      .sort(([,a],[,b]) => a.since-b.since)[0];
    const name = typeof request.name === 'string' ? request.name.trim().slice(0,22) || 'Wędrowiec' : 'Wędrowiec';
    if (rival) {
      const participants = [[rival[0],rival[1].name],[uid,name]];
      if (random() < .5) participants.reverse();
      const players = participants.map(([user]) => user);
      const state = createMatch(participants.map(([,nick]) => nick),now,random);
      pool.matches[newId] = {players,state,changed:now};
      for (const user of players) {
        pool.active[user] = newId;
        delete pool.queue[user];
      }
    } else {
      pool.queue[uid] = {name,since:pool.queue[uid]?.since || now,expires:now+queueLife};
    }
  } else if (request.kind === 'cancel') {
    delete pool.queue[uid];
  } else if (request.kind === 'act' || request.kind === 'status') {
    const own = ownEntry(pool,uid);
    if (own?.entry.state.phase === 'battle') {
      const state = own.entry.state;
      const action = request.kind === 'status' ? {type:'timeout'} : request.id === own.id && request.revision === state.revision && request.action?.type !== 'timeout' ? request.action : null;
      const result = applyAction(state,own.side,action,now);
      if (result) {
        own.entry.state = result;
        own.entry.changed = now;
      }
    }
  }
  return pool;
}

export function needsUpdate(pool,uid,request,now) {
  if (request.kind !== 'status') return true;
  const own = ownEntry(pool,uid);
  return own?.entry.state.phase === 'battle' && own.entry.state.deadline <= now;
}
