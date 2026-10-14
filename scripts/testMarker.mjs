import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createMarkerGame,MarkerEngine as engine,ensureMarkerState,markerViewKey} from '../js/marker.js';
import {markerCrossValid,markerCellAt,markerActionMatches} from '../js/markerDrawing.js';
import {scheduleBot} from '../js/botController.js';
const cross=[[[.15,.15],[.85,.85]],[[.85,.15],[.15,.85]]];
const start=()=>{const g=createMarkerGame(['a','b']);g.turnUid='a';engine.select(g,'a',0);return g;};
test('seeker can find immediately, before any cross exists',()=>{const g=start();assert.equal(engine.find(g,'b',0),undefined);assert.equal(g.turnUid,'b');assert.equal(g.phase,'select');assert.deepEqual(g.coverage,{a:{},b:{}});});
test('drawer can fill many independent fields while seeker searches; swap retains both scores',()=>{
 const g=start();for(const cell of [1,7,13])assert.equal(engine.coverage(g,'a',cell,cross),undefined);
 const wrong=g.numbers.findIndex(n=>n!==g.numbers[0]);assert.ok(engine.find(g,'b',wrong));assert.equal(g.phase,'draw');
 assert.equal(engine.find(g,'b',0),undefined);assert.deepEqual(Object.keys(g.coverage.a),['1','7','13']);
 engine.select(g,'b',2);engine.coverage(g,'b',4,cross);assert.equal(engine.find(g,'a',2),undefined);
 assert.equal(Object.keys(g.coverage.a).length,3);assert.equal(Object.keys(g.coverage.b).length,1);
});
test('invalid roles, cells, dots, parallel lines and duplicate crosses cannot score',()=>{
 const g=start();assert.ok(engine.coverage(g,'b',0,cross));for(const c of [-1,64,1.5,null,'',NaN])assert.ok(engine.coverage(g,'a',c,cross));
 for(const lines of [[],[cross[0]], [cross[0],cross[0]], [[[.1,.1],[.2,.2]],cross[1]], [[[.1,.5],[.9,.5]],cross[1]],[[[.1,.1],[.9,.1],[.9,.9]],cross[1]]]){assert.equal(markerCrossValid(lines),false);assert.ok(engine.coverage(g,'a',0,lines));}
 assert.equal(engine.coverage(g,'a',0,cross),undefined);assert.ok(engine.coverage(g,'a',0,cross));assert.equal(Object.keys(g.coverage.a).length,1);
});
test('first player to fill their own grid wins while opponent is still searching, every board size',()=>{
 for(const boardSize of [8,10,12]){let g=createMarkerGame(['a','b'],{boardSize});engine.select(g,g.turnUid,0);const drawer=g.drawerUid;
 for(let c=0;c<boardSize*boardSize;c++){assert.equal(engine.coverage(g,drawer,c,cross),undefined);g=JSON.parse(JSON.stringify(g));}
 assert.equal(g.phase,'result');assert.equal(g.winner,drawer);assert.equal(g.finished,true);assert.equal(Object.keys(g.coverage[drawer]).length,boardSize*boardSize);assert.ok(engine.find(g,g.seekerUid,0));}
});
test('number repeats remain findable and previous-turn drawing is rejected after swap',()=>{
 const g=start(),expected={phase:g.phase,selectedCell:g.selectedCell,turn:g.turn,turnUid:g.turnUid};g.numbers[1]=g.numbers[0];
 assert.equal(markerActionMatches(g,expected),true);engine.find(g,'b',1);assert.equal(markerActionMatches(g,expected),false);assert.ok(engine.coverage(g,'a',0,cross));assert.equal(g.turn,1);assert.ok(engine.find(g,'b',1));
 engine.select(g,'b',1);assert.equal(engine.find(g,'a',0),undefined);
});
test('selection timeout starts simultaneous play; old incompatible rooms reset fairly',()=>{
 const g=createMarkerGame(['a','b']);assert.ok(engine.timeout(g,g.phaseEndsAt-1));assert.equal(engine.timeout(g,g.phaseEndsAt),undefined);assert.equal(g.phase,'draw');assert.equal(g.phaseEndsAt,0);
 const old=ensureMarkerState({phase:'draw',players:['a','b'],coverage:{a:{0:.2}},marked:{0:true}});assert.equal(old.rulesVersion,2);assert.equal(old.phase,'select');assert.deepEqual(old.coverage,{a:{},b:{}});
 assert.throws(()=>createMarkerGame(['a']),/dwóch/);
});
test('Firebase numeric-key arrays preserve personal progress on reconnect',()=>{
 const g=start();g.coverage={a:[true,true,null,true],b:{5:true}};ensureMarkerState(g);
 assert.deepEqual(g.coverage.a,{'0':true,'1':true,'3':true});assert.deepEqual(g.coverage.b,{'5':true});
 engine.find(g,'b',0);engine.select(g,'b',2);assert.equal(Object.keys(g.coverage.a).length,3);
});
test('bot can seek immediately and human crosses do not restart its search delay',async()=>{
 const g=createMarkerGame(['a','bot:b']);g.turnUid='a';engine.select(g,'a',0);
 const room={roomId:'bot-test',hostUid:'a',gameMode:'marker',players:g.players,game:g,settings:{},updatedAt:1};
 const options={mutate:fn=>fn(room.game,room)};const first=scheduleBot(room,options);assert.ok(first);
 engine.coverage(g,'a',1,cross);room.updatedAt++;
 assert.equal(scheduleBot(room,options).key,first.key);await first.run();assert.equal(g.turnUid,'bot:b');
 engine.select(g,'bot:b',0);const draw=scheduleBot(room,options);await draw.run();assert.equal(Object.keys(g.coverage['bot:b']).length,1);assert.notEqual(scheduleBot(room,options).key,draw.key);
});
test('progress updates keep the same drawing view and renderer has no manual save or waiting-for-cross gate',()=>{
 const g=start(),room={roomId:'test',game:g},key=markerViewKey(room,'a');engine.coverage(g,'a',1,cross);assert.equal(markerViewKey(room,'a'),key);engine.find(g,'b',0);assert.notEqual(markerViewKey(room,'a'),key);
 const source=readFileSync(new URL('../js/marker.js',import.meta.url),'utf8');assert.ok(!source.includes('data-marker-save'));assert.ok(!source.includes('Czekaj na gotowy krzyżyk'));
 const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');assert.ok(app.includes('dataset.markerViewKey===markerViewKey'));
 const rect={left:10,top:20,width:320,height:320};assert.equal(markerCellAt(rect,8,10,20),0);assert.equal(markerCellAt(rect,8,329,339),63);assert.equal(markerCellAt(rect,8,330,50),null);
});
