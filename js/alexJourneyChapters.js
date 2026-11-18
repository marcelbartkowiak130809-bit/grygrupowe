const THIRD_CHAPTER_DATE = '2026-11-20T20:00:00+01:00';
export const THIRD_CHAPTER_AT = Date.parse(THIRD_CHAPTER_DATE);
const countdowns = new WeakMap();

export function canPlayThirdChapter(secondComplete, now = Date.now()) {
 return Boolean(secondComplete && now >= THIRD_CHAPTER_AT);
}

export function chapterCountdown(now = Date.now()) {
 const seconds = Math.max(0,Math.ceil((THIRD_CHAPTER_AT-now)/1000));
 if (!seconds) return 'Już dostępny';
 const days = Math.floor(seconds/86400);
 const clock = [Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60].map(value=>String(value).padStart(2,'0')).join(':');
 return days ? `${days} d ${clock}` : clock;
}

function thirdChapterCard(active, secondComplete, now) {
 const playable = canPlayThirdChapter(secondComplete,now);
 const upcoming = now < THIRD_CHAPTER_AT;
 return `<button type="button" class="journey-third-chapter" data-journey-chapter="3" data-second-complete="${secondComplete}" ${active===3?'aria-current="page"':''} ${playable?'':'disabled'}>
  <small>ROZDZIAŁ 3</small><strong>Wieża Kruków</strong>
  ${upcoming?`<span>Piątek, 20 listopada · 20:00</span><time datetime="${THIRD_CHAPTER_DATE}" data-journey-countdown>${chapterCountdown(now)}</time>`:playable?'':'<span>Ukończ rozdział 2</span>'}
 </button>`;
}

export function chapterMenu(active,unlocked,secondComplete=false,now=Date.now()) {
 return `<nav class="journey-story-chapters" aria-label="Rozdziały Drogi do Alex">
  <button type="button" data-journey-chapter="1" ${active===1?'aria-current="page"':''}><small>ROZDZIAŁ 1</small><strong>Droga do Alex</strong></button>
  <button type="button" data-journey-chapter="2" ${active===2?'aria-current="page"':''} ${unlocked?'':'disabled'}><small>ROZDZIAŁ 2</small><strong>Śladami zombie</strong>${unlocked?'':'<span>Ukończ rozdział 1</span>'}</button>
  ${thirdChapterCard(active,secondComplete,now)}
 </nav>`;
}

export function bindChapterMenu(root,onSelect) {
 const bind = button => {
  button.onclick = () => onSelect(Number(button.dataset.journeyChapter));
 };
 root.querySelectorAll('[data-journey-chapter]').forEach(bind);
 clearTimeout(countdowns.get(root));
 const label = root.querySelector('[data-journey-countdown]');
 const tick = () => {
  if (!label?.isConnected) return;
  const now = Date.now();
  if (now >= THIRD_CHAPTER_AT) {
   const old = label.closest('[data-journey-chapter="3"]');
   old.outerHTML = thirdChapterCard(0,old.dataset.secondComplete==='true',now);
   bind(root.querySelector('[data-journey-chapter="3"]'));
   return;
  }
  label.textContent = chapterCountdown(now);
  const timer = setTimeout(tick, Math.min(1000,THIRD_CHAPTER_AT-now));
  timer.unref?.();
  countdowns.set(root,timer);
 };
 tick();
}
