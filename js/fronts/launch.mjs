export const frontsOpeningAt = Date.parse('2026-12-01T18:00:00+01:00');
const firstCracksAt = Date.parse('2026-11-24T00:00:00+01:00');
const dayMs = 24*60*60*1000;

export function frontsLaunchState(now = Date.now()) {
  const remaining = Math.max(0,frontsOpeningAt-now);
  const stage = Math.max(0,Math.min(8,Math.floor((now-firstCracksAt)/dayMs)+1));
  return {open:remaining===0,remaining,stage};
}

export function frontsCountdown(remaining) {
  const total = Math.max(0,Math.ceil(remaining/1000));
  const days = Math.floor(total/86400);
  const hours = Math.floor(total%86400/3600);
  const minutes = Math.floor(total%3600/60);
  const seconds = total%60;
  const clock = [hours,minutes,seconds].map(value=>String(value).padStart(2,'0')).join(':');
  return days ? `${days} d ${clock}` : clock;
}
