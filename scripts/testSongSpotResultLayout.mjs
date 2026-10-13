import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source = readFileSync(new URL('../js/songSpot.js', import.meta.url), 'utf8');
const body = source.match(/function resultHtml\(state\) \{([\s\S]*?)\n\}/)[1];
const render = new Function('state','formatSeconds','escapeHtml','songSpotTrackLinks','coverHtml',body);
test('next song is above cover, audio and sharing after either outcome', () => {
  for (const correct of [true, false]) {
    const html = render({streak: 2, lastResult: {correct, title:'Test', previewUrl:'preview'}}, String, String,
      () => ({spotify:'spotify'}), () => '<img>');
    const button = correct ? 'id="songspot-next"' : 'id="songspot-restart"';
    assert.ok(html.includes(`${button}>Następny utwór</button>`));
    assert.equal(html.split(button).length, 2);
    for (const marker of ['songspot-result-track', '<audio', 'data-songspot-share']) {
      assert.ok(html.indexOf(button) < html.indexOf(marker), marker);
    }
  }
});
