import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const css=readFileSync(new URL('../css/popularitySoloMobile.css',import.meta.url),'utf8');
test('compact popularity layout is confined to solo on phones',()=>{
  assert.match(css,/@media\(max-width:720px\)/);
  const selectors=css.slice(css.indexOf('@media')).split('\n').filter(line=>line.includes('.popularity-'));
  assert.ok(selectors.every(line=>line.includes('.popularity-solo-page')));
  assert.match(readFileSync(new URL('../index.html',import.meta.url),'utf8'),/popularitySoloMobile.css\?v=/);
});
test('both choices share a row and next action precedes result details',()=>{
  assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(css,/popularity-solo-over-actions\{order:-1/);
  assert.match(css,/min-height:44px/);
  assert.ok(!css.includes('text-overflow:ellipsis'));
});
