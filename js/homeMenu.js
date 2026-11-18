import { libraryCategories, libraryModesFor } from './gameCategories.js?v=20261118-21';

const categoryActionNames = {
  music:'goMusicModes', tiktok:'goTikTokModes', minecraft:'goMinecraftModes',
  board:'goBoardModes', pokemon:'goPokemonModes',
};

export function categoryTilesHtml(games) {
  return libraryCategories.map(({id,name,symbol,path}) => {
    const count = libraryModesFor(games,id).length;
    const noun = new Intl.PluralRules('pl').select(count);
    const tryby = noun === 'one' ? 'tryb' : noun === 'few' ? 'tryby' : 'trybów';
    return `<a class="library-category-tile library-category-${id}" href="${path}" data-home-category="${id}">
      <span class="library-category-icon" aria-hidden="true">${symbol}</span>
      <span class="library-category-copy"><strong>${name}</strong><small>${count} ${tryby}</small></span>
      <i aria-hidden="true">›</i>
    </a>`;
  }).join("");
}

export function homeMenuHtml(games, isLocked) {
  const music=games.filter(game=>game.audience==='music' && !game.hiddenFromLibrary);
  const available=music.filter(game=>!isLocked(game.id)).length;
  return `<section class="home-hub" aria-label="Odkryj kategorie"><header class="home-hub-heading"><div><p class="eyebrow">WYBIERZ SWÓJ KLIMAT</p><h1>Dobry wieczór<br>zaczyna się <em>tutaj.</em></h1></div><p>Solo albo z ekipą.<br>Jedno kliknięcie i gracie.</p></header><div class="home-destinations"><article class="home-music-feature"><div class="home-feature-copy"><span class="home-live-label"><i></i> STREFA MUZYKI</span><h2>Włącz swój<br><span>tryb grania.</span></h2><p>Zgaduj hity. Wybieraj zwycięzców.<br>Sprawdź, jak dobrze znasz swoją muzykę.</p><button class="primary" data-home-category="music">Odkryj muzykę <span aria-hidden="true">↗</span></button><small><span data-home-music-count>${available}</span> dostępnych trybów · polskie i globalne hity</small></div><div class="home-record-scene" aria-hidden="true"><div class="home-record"><div class="home-record-label">GG<span>PLAY YOUR WAY</span></div></div><div class="home-player-chip"><span>♫</span><div><b>Twój następny hit</b><small>czeka na odkrycie</small></div><div class="home-equalizer">${[0,1,2,3,4].map(i=>`<i style="--beat:${i}"></i>`).join('')}</div></div><span class="home-note home-note-a">♪</span><span class="home-note home-note-b">♫</span></div></article></div><div class="home-quick-picks"><span>Na szybki start</span><button data-play-solo-mode="songspot-solo" ${isLocked('songspot-solo')?'disabled':''}>🎧 Zgadnij utwór <span>Solo ↗</span></button><button data-play-solo-mode="playlista-cup" ${isLocked('playlista-cup')?'disabled':''}>🏆 Turniej hitów <span>Solo ↗</span></button><button data-home-filter="all">Cała biblioteka <span>↓</span></button></div></section>`;
}

const boundMenus = new WeakSet();
export function bindHomeMenu(root, actions) {
  if (boundMenus.has(root)) return;
  boundMenus.add(root);
  root.addEventListener('click',event => {
    const category = event.target.closest?.('[data-home-category]');
    const action = category && actions[categoryActionNames[category.dataset.homeCategory]];
    if (action && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      action();
      return;
    }
    const link = event.target.closest?.('[data-home-filter]');
    if (!link) return;
    root.querySelector(`[data-game-filter="${link.dataset.homeFilter}"]`)?.click();
    root.querySelector('.games-section')?.scrollIntoView({
      behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',
      block:'start',
    });
  });
}
