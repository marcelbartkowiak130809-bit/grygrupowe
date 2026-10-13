import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {songSpotMobileSummary} from '../js/songSpot.js';
const css=readFileSync(new URL('../css/songSpotMobile.css',import.meta.url),'utf8');
const source=readFileSync(new URL('../js/songSpot.js',import.meta.url),'utf8');
test('collapsed settings show the actual mix and ranked/training status',()=>{
  assert.equal(songSpotMobileSummary({}),'All · Ranking');
  assert.equal(songSpotMobileSummary({era:'classic'}),'< 2000s · Trening');
  assert.equal(songSpotMobileSummary({mode:'artists',artists:['adele','doja cat','sia']}),'3 artystów · Trening');
  assert.equal(songSpotMobileSummary({mode:'playlist'}),'All · Trening');
  assert.match(songSpotMobileSummary({level:'cycle'}),/Cykl.*Trening/);
});
test('desktop retains sidebars, mobile puts gameplay before collapsed panels',()=>{
  assert.ok(css.indexOf('display:contents')<css.indexOf('@media(max-width:900px)'));
  assert.match(css,/\.songspot-page \.songspot-center\{order:0/);
  assert.match(css,/\.songspot-page \.songspot-mobile-panel\{display:block;order:1/);
  assert.match(css,/songspot-mobile-panel:not\(\.is-open\).*display:none/);
  assert.ok(source.includes('aria-expanded="false"'));
  assert.ok(source.includes("classList.toggle('is-open')"));
});
test('answer field spans both columns; submit and skip remain full-sized and suggestions point down',()=>{
  assert.ok(css.includes('"input input" "submit skip"'));
  assert.match(css,/songspot-answer-input-wrap input\{min-height:44px/);
  assert.ok(!css.includes('overflow:hidden'));
  const base=readFileSync(new URL('../css/style.css',import.meta.url),'utf8');
  assert.ok(base.includes('top:calc(100% + 6px)'));
});
