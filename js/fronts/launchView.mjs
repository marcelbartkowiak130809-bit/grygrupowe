import {frontsCountdown,frontsLaunchState} from './launch.mjs?v=1';

const paths = [
  '100 73,94 68,90 69,88 60,85 57',
  '89 68,84 76,79 78,75 89,70 100',
  '85 57,81 51,82 42,76 36,77 24,71 12,66 0',
  '81 50,73 54,69 47,61 50',
  '78 78,68 76,63 66,55 69,49 59,44 60',
  '94 69,99 86,98 91,100 99',
  '76 34,66 33,63 22,55 24,49 14,39 10,34 0',
  '55 67,47 74,43 71,37 79,30 79,23 88,12 89,5 100',
];

const dateHtml = '<time datetime="2026-12-01T18:00:00+01:00">1 grudnia · 18:00</time>';

function fissure(path,width) {
  const points = path.split(',').map(pair=>pair.split(' ').map(Number));
  const edge = direction => points.map(([x,y],i)=>{
    const from = points[Math.max(0,i-1)], to = points[Math.min(points.length-1,i+1)];
    const dx = to[0]-from[0], dy = to[1]-from[1];
    const spread = direction*width*Math.max(.12,Math.sin(Math.PI*i/(points.length-1)))/Math.hypot(dx,dy);
    return `${(x-dy*spread).toFixed(2)}% ${(y+dx*spread).toFixed(2)}%`;
  });
  return `polygon(${[...edge(1),...edge(-1).reverse()].join(',')})`;
}

const cracks = `<span class="fronts-seal-cracks" aria-hidden="true">${paths.map(path=>
  `<i style="--fissure:${fissure(path,.68)};--ember:${fissure(path,.27)}"></i>`
).join('')}</span>`;

export function frontsTileHtml(now) {
  const {open,stage,remaining} = frontsLaunchState(now);
  if (open) return `<a class="library-category-tile home-fronts-tile" href="/trzy-fronty">
    <span class="library-category-icon" aria-hidden="true">⚔</span>
    <span class="library-category-copy"><strong>Trzy Fronty</strong><small>Karcianka 1 na 1</small></span>
    <i aria-hidden="true">↗</i>
  </a>`;
  return `<a class="library-category-tile home-fronts-tile fronts-seal" data-seal-stage="${stage}" href="/trzy-fronty" aria-label="Trzy Fronty, Grand Opening 1 grudnia o 18:00">
    ${cracks}
    <span class="fronts-seal-copy"><small>Grand Opening</small><strong>Trzy Fronty</strong>${dateHtml}
      <span class="fronts-seal-clock" data-fronts-clock>${frontsCountdown(remaining)}</span>
    </span>
  </a>`;
}

export function frontsTeaserHtml(now) {
  const {stage,remaining} = frontsLaunchState(now);
  return `<main class="fronts-teaser-page"><a class="ghost" href="/">← Wróć do wszystkich trybów</a>
    <section class="fronts-seal fronts-teaser" data-seal-stage="${stage}">
      ${cracks}
      <div class="fronts-seal-copy"><small>Grand Opening</small><h1>Trzy Fronty</h1>
        ${dateHtml}
        <span class="fronts-seal-clock" data-fronts-clock aria-label="Czas do otwarcia">${frontsCountdown(remaining)}</span>
      </div>
    </section>
  </main>`;
}

export function watchFrontsLaunch(seal, clock, onOpen) {
  if (!seal) return () => {};
  let timer;
  const countdown = seal.querySelector('[data-fronts-clock]');
  const tick = () => {
    if (!seal.isConnected) return;
    const now = clock();
    const launch = frontsLaunchState(now);
    if (launch.open) {
      onOpen(now);
      return;
    }
    seal.dataset.sealStage = launch.stage;
    countdown.textContent = frontsCountdown(launch.remaining);
    timer = setTimeout(tick,Math.min(1000,launch.remaining));
  };
  tick();
  return () => clearTimeout(timer);
}
