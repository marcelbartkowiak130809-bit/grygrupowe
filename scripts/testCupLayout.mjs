import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const css=readFileSync(new URL('../css/playlistTournament.css',import.meta.url),'utf8');
const js=readFileSync(new URL('../js/playlistTournament.js',import.meta.url),'utf8');
test('compact desktop round keeps large covers and puts native volume vertically on the right',()=>{
 assert.match(css,/@media\(min-width:701px\)/);
 assert.match(css,/clamp\(240px,calc\(100dvh - 480px\),270px\)/);
 assert.match(css,/writing-mode:vertical-lr;direction:rtl/);
 assert.match(css,/round>\.music-track-volume\{grid-column:2;grid-row:2/);
 assert.ok(js.includes("state.status === 'playing' ? ' is-playing'"));
 assert.ok(js.includes('playlist-cup-toolbar'));assert.ok(js.includes("setAttribute('aria-label','Głośność piosenek')"));
 assert.equal((js.match(/data-cup-reset>Przerwij turniej/g)||[]).length,1);
});
