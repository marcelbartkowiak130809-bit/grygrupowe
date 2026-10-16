import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {confirmTournamentExit} from '../js/playlistTournament.js';
test('cancel keeps an active tournament, accepting permits ending it',()=>{
 let calls=0;
 assert.equal(confirmTournamentExit({status:'playing'},message=>{calls++;assert.match(message,/Postęp.*utracony/);return false;}),false);
 assert.equal(confirmTournamentExit({status:'playing'},()=>true),true);
 assert.equal(calls,1);
});
test('starting a new set after completion does not ask to discard a finished game',()=>{
 for(const status of ['setup','done'])assert.equal(confirmTournamentExit({status},()=>{assert.fail('Unnecessary confirmation');}),true);
});
test('reset is guarded before the engine changes or the UI repaints',()=>{
 const js=readFileSync(new URL('../js/playlistTournament.js',import.meta.url),'utf8');
 assert.ok(js.includes('if (!confirmTournamentExit(engine.get(playerId))) return; engine.reset(playerId); repaint();'));
});
