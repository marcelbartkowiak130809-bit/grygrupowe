import { libraryCategories, libraryModesFor } from './gameCategories.js?v=20261118-30';
import { modeUnlockInfo } from './upcomingModes.js?v=20261118-14';

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

export function homeModePicks(games, now, previous = [], random = Math.random) {
  const available = games
    .filter(mode => !mode.hiddenFromLibrary)
    .map(mode => ({mode, unlock:modeUnlockInfo(mode.id, now)}))
    .filter(({unlock}) => !unlock.locked);
  let latest = null;
  for (const {mode, unlock} of available) {
    const updateAt = mode.majorUpdateAt <= now ? mode.majorUpdateAt : 0;
    const time = Math.max(updateAt, unlock.unlockTime);
    if (!latest || time > latest.time) {
      latest = {mode, time, updated:updateAt > unlock.unlockTime};
    }
  }
  const pool = available.map(({mode}) => mode).filter(mode => mode !== latest?.mode);
  const recommended = previous.filter(mode => pool.includes(mode));
  const choices = pool.filter(mode => !recommended.includes(mode));
  while (recommended.length < 2 && choices.length) {
    recommended.push(choices.splice(Math.floor(random() * choices.length), 1)[0]);
  }
  return {latest, recommended};
}

const boundMenus = new WeakSet();
export function bindHomeMenu(root, actions) {
  if (boundMenus.has(root)) return;
  boundMenus.add(root);
  root.addEventListener('click', event => {
    const category = event.target.closest?.('[data-home-category]');
    if (!category || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    actions.goLibraryCategory(category.dataset.homeCategory);
  });
}
