import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createMarkerGame,MarkerEngine as engine,ensureMarkerState} from '../js/marker.js';
import {markerInkCoverage,markerCellAt,markerActionMatches} from '../js/markerDrawing.js';
test('cross coverage is relative to one field, not the whole board',()=>{
 const pixels={width:100,height:100,data:new Uint8ClampedArray(40000)};
 for(let i=0;i<10000;i++){const x=i%100,y=Math.floor(i/100);if(Math.abs(x-y)<5||Math.abs(x+y-99)<5)pixels.data[i*4+3]=255;}
 const ratio=markerInkCoverage(pixels);assert.ok(ratio>.05);assert.ok(ratio/64<.05);
 for(const boardSize of [8,10,12]){const game=createMarkerGame(['a','b'],{boardSize});engine.select(game,game.turnUid,0);assert.equal(engine.coverage(game,game.drawerUid,ratio),undefined);assert.equal(engine.find(game,game.seekerUid,0),undefined);assert.equal(game.marked[0],true);}
});
test('invalid cells, wrong roles, tiny marks and repeated saves are rejected',()=>{
 const game=createMarkerGame(['a','b']);for(const cell of [-1,64,1.5,null,'',NaN])assert.ok(engine.select(game,game.turnUid,cell));assert.equal(game.phase,'select');
 engine.select(game,game.turnUid,0);assert.ok(engine.coverage(game,game.seekerUid,.2));for(const ratio of [.01,NaN,Infinity,2])assert.ok(engine.coverage(game,game.drawerUid,ratio));
 assert.ok(engine.find(game,game.seekerUid,0));assert.equal(engine.coverage(game,game.drawerUid,.2),undefined);assert.ok(engine.coverage(game,game.drawerUid,.3));
 const wrong=game.numbers.findIndex(n=>n!==game.numbers[0]);assert.ok(engine.find(game,game.seekerUid,wrong));assert.equal(game.marked[0],undefined);
});
test('identical numbers on different free cells count as correct and change roles once',()=>{
 const game=createMarkerGame(['a','b']);game.numbers[1]=game.numbers[0];const first=game.turnUid;
 engine.select(game,first,0);const second=game.seekerUid;engine.coverage(game,first,.2);assert.equal(engine.find(game,second,1),undefined);assert.equal(game.marked[0],true);assert.equal(game.turnUid,second);assert.equal(game.turn,1);assert.ok(engine.find(game,second,1));
});
test('a complete board reaches results for every size and survives serialized state',()=>{
 for(const boardSize of [8,10,12]){let game=createMarkerGame(['a','b'],{boardSize});for(let cell=0;cell<boardSize*boardSize;cell++){
  assert.equal(engine.select(game,game.turnUid,cell),undefined);assert.equal(engine.coverage(game,game.drawerUid,.2),undefined);const seeker=game.seekerUid;assert.equal(engine.find(game,seeker,cell),undefined);game=JSON.parse(JSON.stringify(game));
 }assert.equal(game.phase,'result');assert.equal(game.finished,true);assert.ok(game.players.includes(game.winner));assert.equal(Object.keys(game.marked).length,boardSize*boardSize);}
});
test('timeout respects deadline and action tokens reject previous turns',()=>{
 const game=createMarkerGame(['a','b']),expected={phase:game.phase,selectedCell:null,turn:game.turn,turnUid:game.turnUid};
 assert.equal(markerActionMatches(game,expected),true);assert.ok(engine.timeout(game,game.phaseEndsAt-1));assert.equal(engine.timeout(game,game.phaseEndsAt),undefined);
 engine.coverage(game,game.drawerUid,.2);engine.find(game,game.seekerUid,game.selectedCell);assert.equal(markerActionMatches(game,expected),false);
});
test('canvas hit-testing handles edges and corrupted boards recover deterministically',()=>{
 const rect={left:10,top:20,width:320,height:320};assert.equal(markerCellAt(rect,8,10,20),0);assert.equal(markerCellAt(rect,8,329,339),63);assert.equal(markerCellAt(rect,8,330,50),null);
 const a=ensureMarkerState({size:10,numberMax:30,numbers:[],phase:'draw',players:['a','b'],selectedCell:1000});const b=ensureMarkerState({size:10,numberMax:30,numbers:[]});assert.deepEqual(a.numbers,b.numbers);assert.equal(a.phase,'select');assert.ok(a.phaseEndsAt>Date.now());
 assert.throws(()=>createMarkerGame(['a']),/dwóch/);
});
