export function auctionCommandContext(room,uid) {
  return JSON.stringify([room.roomId,room.game.siteGameId || room.game.startedAt || 0,room.game.battle.turn,uid]);
}

const saved = new Map();
const storageKey = context => `pokemon-command:${context}`;
const hex = bytes => [...bytes].map(value=>value.toString(16).padStart(2,"0")).join("");

export async function auctionCommandDigest(context,order,salt) {
  const encoded = new TextEncoder().encode(JSON.stringify([context,order,salt]));
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",encoded)));
}

export async function saveAuctionCommand(context,order) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const record = {order,salt,digest:await auctionCommandDigest(context,order,salt)};
  saved.set(context,record);
  try { sessionStorage.setItem(storageKey(context),JSON.stringify(record)); } catch { /* Private tabs can block storage. */ }
  return record.digest;
}

export async function readAuctionCommand(context,expected) {
  let record = saved.get(context);
  if (!record) {
    try { record = JSON.parse(sessionStorage.getItem(storageKey(context))); } catch { return null; }
  }
  if (record?.digest !== expected) return null;
  const digest = await auctionCommandDigest(context,record.order,record.salt);
  return digest === expected ? {digest,order:record.order} : null;
}

export function clearAuctionCommand(context) {
  saved.delete(context);
  try { sessionStorage.removeItem(storageKey(context)); } catch { /* Private tabs can block storage. */ }
}
