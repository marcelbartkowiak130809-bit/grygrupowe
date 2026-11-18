export const THIRD_CHAPTER_AT=Date.parse('2026-11-20T20:00:00+01:00');
const countdowns=new WeakMap();

export function chapterCountdown(now=Date.now()){
 const seconds=Math.max(0,Math.ceil((THIRD_CHAPTER_AT-now)/1000));
 if(!seconds)return 'W przygotowaniu';
 const days=Math.floor(seconds/86400);
 const clock=[Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60].map(value=>String(value).padStart(2,'0')).join(':');
 return days?`${days} d ${clock}`:clock;
}

export function chapterMenu(active,unlocked){
 return `<nav class="journey-story-chapters" aria-label="Rozdziały Drogi do Alex">
  <button type="button" data-journey-chapter="1" ${active===1?'aria-current="page"':''}><small>ROZDZIAŁ 1</small><strong>Droga do Alex</strong></button>
  <button type="button" data-journey-chapter="2" ${active===2?'aria-current="page"':''} ${unlocked?'':'disabled'}><small>ROZDZIAŁ 2</small><strong>Śladami zombie</strong>${unlocked?'':'<span>Ukończ rozdział 1</span>'}</button>
  <div class="journey-third-chapter"><small>ROZDZIAŁ 3</small><strong>Piątek, 20 listopada · 20:00</strong><time datetime="2026-11-20T20:00:00+01:00" data-journey-countdown>${chapterCountdown()}</time></div>
 </nav>`;
}

export function bindChapterMenu(root,onSelect){
 root.querySelectorAll('[data-journey-chapter]').forEach(button=>{
  button.onclick=()=>onSelect(Number(button.dataset.journeyChapter));
 });
 const label=root.querySelector('[data-journey-countdown]');
 clearTimeout(countdowns.get(root));
 const tick=()=>{
  if(!label?.isConnected)return;
  const now=Date.now();
  label.textContent=chapterCountdown(now);
  if(now<THIRD_CHAPTER_AT){
   const timer=setTimeout(tick,Math.min(1000,THIRD_CHAPTER_AT-now));
   timer.unref?.();
   countdowns.set(root,timer);
  }
 };
 tick();
}
