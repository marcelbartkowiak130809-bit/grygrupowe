import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tournamentSummaryHtml} from '../js/playlistTournament.js';
const tracks=[{id:'a',title:'Winner <test>',artist:'Artist & guest',previewUrl:'https://example.com/a.mp3',coverUrl:'https://example.com/a.jpg'}, {id:'b',title:'Finalist',artist:'Other artist',previewUrl:'https://example.com/b.mp3',coverUrl:''}];
const state={tracks,winnerId:'a',round:1,history:[{round:1,winnerId:'a',loserId:'b'}],byes:[],startedAt:1000,finishedAt:62000};
test('result highlights the actual winner and finalist with measured statistics',()=>{
 const html=tournamentSummaryHtml(state);
 assert.match(html,/Winner &lt;test&gt;/);assert.match(html,/Artist &amp; guest/);
 assert.match(html,/cup-finalist/);assert.match(html,/>Finalist<\/b>/);
 assert.match(html,/<b>2<\/b>utworów/);assert.match(html,/<b>1<\/b>pojedynków/);
 assert.match(html,/1 min 1 s/);
});
test('all existing actions remain available and history starts collapsed',()=>{
 const html=tournamentSummaryHtml(state);
 for(const action of ['share','start','reset','result-audio'])assert.ok(html.includes(`data-cup-${action}`));
 assert.match(html,/Apple Music|Spotify/);
 assert.match(html,/<details class="playlist-cup-history">/);
 assert.equal((html.match(/data-cup-share/g)||[]).length,1);
});
test('mobile and reduced motion layouts are provided without altering game cards',()=>{
 const css=readFileSync(new URL('../css/playlistTournament.css',import.meta.url),'utf8');
 assert.match(css,/cup-winner-hero\{grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/\.light-theme \.cup-winner-hero/);
});
