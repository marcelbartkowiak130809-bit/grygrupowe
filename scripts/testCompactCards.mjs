import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const css=readFileSync(new URL('../css/style.css',import.meta.url),'utf8');
const first=css.indexOf('.mobile-games-compact .games-grid');
const start=css.lastIndexOf('@media(max-width:720px)',first);
const end=css.indexOf('.songspot-stage-list',first);
const compact=css.slice(start,end);
const rule=selector=>{
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const matches=[...compact.matchAll(new RegExp(escaped+'\\{([^}]*)\\}','g'))];
  assert.ok(matches.length,selector);return matches.map(match=>match[1]).join(';');
};
test('mobile cards keep two columns but room and solo get a full-width row each',()=>{
  assert.match(rule('.mobile-games-compact .games-grid'),/repeat\(2,minmax\(0,1fr\)\)/);
  const options=rule('.mobile-games-compact .game-card-play-options');
  assert.match(options,/grid-template-columns:minmax\(0,1fr\)/);assert.ok(!options.includes('auto-fit'));
  assert.match(rule('.mobile-games-compact .game-card-play-options button'),/min-height:44px/);
  assert.match(rule('.mobile-games-compact .game-card-play-options button'),/white-space:nowrap/);
});
test('badges and full titles wrap instead of being truncated',()=>{
  assert.match(rule('.mobile-games-compact .game-card-top'),/flex-wrap:wrap/);
  assert.match(rule('.mobile-games-compact .game-card-top'),/max-height:none/);
  assert.match(rule('.mobile-games-compact .game-card-top .tag'),/white-space:normal/);
  assert.match(rule('.mobile-games-compact .game-card-content h2'),/-webkit-line-clamp:unset/);
});
test('category card height is content-driven and not clipped by skipped rendering',()=>{
  const card=rule('.mobile-games-compact .game-card');
  assert.match(card,/height:auto/);assert.match(card,/content-visibility:visible/);
  assert.match(card,/contain-intrinsic-size:none/);
  assert.match(rule('.mobile-games-compact .game-card-content'),/flex:1/);
});
test('locked cards place the unlock label above its value, all fixes remain mobile-scoped',()=>{
  assert.match(rule('.mobile-games-compact .unlock-date'),/flex-direction:column/);
  assert.match(rule('.mobile-games-compact .game-card-footer'),/margin-top:auto/);
  assert.equal(start>=0,true);assert.equal(start<first,true);assert.equal(end>first,true);
});
