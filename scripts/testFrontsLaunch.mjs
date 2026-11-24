import {test} from 'node:test';
import assert from 'node:assert/strict';
import {frontsOpeningAt,frontsLaunchState,frontsCountdown} from '../js/fronts/launch.mjs';
import {frontsTileHtml,frontsTeaserHtml} from '../js/fronts/launchView.mjs';

test('otwarcie jest 1 grudnia 2026 o 18:00 w Polsce',()=>{
  assert.equal(new Date(frontsOpeningAt).toISOString(),'2026-12-01T17:00:00.000Z');
  assert.deepEqual(frontsLaunchState(frontsOpeningAt-1),{open:false,remaining:1,stage:8});
  assert.equal(frontsLaunchState(frontsOpeningAt).open,true);
  assert.equal(frontsLaunchState(frontsOpeningAt+86400000).open,true);
});

test('od północy czasu polskiego przybywa jedno pęknięcie dziennie',()=>{
  const first = Date.parse('2026-11-24T00:00:00+01:00');
  assert.equal(frontsLaunchState(first-1).stage,0);
  for(let i=0;i<8;i++){
    const midnight=first+i*86400000;
    assert.equal(frontsLaunchState(midnight-1).stage,i);
    assert.equal(frontsLaunchState(midnight).stage,i+1);
  }
});

test('kafelek pokazuje odliczanie przed otwarciem i link do gry po otwarciu',()=>{
  assert.match(frontsTileHtml(frontsOpeningAt-60000),/data-seal-stage="8".*href="\/trzy-fronty"/);
  assert.match(frontsTeaserHtml(frontsOpeningAt-60000),/00:01:00/);
  assert.doesNotMatch(frontsTileHtml(frontsOpeningAt),/data-seal-stage/);
  assert.match(frontsTileHtml(frontsOpeningAt),/Karcianka 1 na 1/);
  assert.equal(frontsCountdown(86400001),'1 d 00:00:01');
  assert.equal(frontsCountdown(1),'00:00:01');
});
