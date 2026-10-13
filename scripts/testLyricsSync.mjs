import assert from 'node:assert/strict';
import {test} from 'node:test';
import {lyricsTracks,createLyricsGame,LyricsEngine,LyricsSoloEngine} from '../js/lyrics.js';
import {validLyricsSync,lyricsVisibleWordCount} from '../js/lyricsSync.js';
import {categoryModesRemaining,isCategoryModeReleased,categoryModeProgress,LYRICS_REVOTE_MIN_CYCLE} from '../js/categoryVoting.js';
import {isModeLocked} from '../js/upcomingModes.js';
test('lyrics is locked and votable; historical releases and permanent flags cannot reopen it',()=>{
 assert.equal(isModeLocked('dokoncz-tekst'),true);assert.equal(isCategoryModeReleased('dokoncz-tekst',{}),false);
 const old={'1':{modeId:'dokoncz-tekst',categoryId:'music',cycle:1,winningVotes:20}};
 assert.equal(isCategoryModeReleased('dokoncz-tekst',old),false);
 assert.ok(categoryModesRemaining('music',old,LYRICS_REVOTE_MIN_CYCLE).some(t=>t.id==='dokoncz-tekst'));
 assert.ok(!categoryModesRemaining('music',{},LYRICS_REVOTE_MIN_CYCLE-1).some(t=>t.id==='dokoncz-tekst'));
 assert.equal(categoryModeProgress('music',old).find(t=>t.id==='dokoncz-tekst').released,false);
 const fresh={current:{modeId:'dokoncz-tekst',categoryId:'music',cycle:LYRICS_REVOTE_MIN_CYCLE,winningVotes:1}};
 assert.equal(isCategoryModeReleased('dokoncz-tekst',fresh),true);assert.equal(isCategoryModeReleased('songspot',{}),true);
});
test('only URL-bound audio-aligned excerpts are playable in both regions',()=>{
 assert.equal(lyricsTracks.length,5);assert.ok(lyricsTracks.filter(t=>t.region==='global').length>=2);assert.ok(lyricsTracks.filter(t=>t.region==='polish').length>=2);
 for(const track of lyricsTracks){assert.equal(validLyricsSync(track.previewUrl,track.sync),true);assert.equal(validLyricsSync(track.previewUrl+'?different',track.sync),false);assert.equal(track.previousLine,track.sync.previousLine);assert.equal(track.answer,track.sync.answer);assert.deepEqual(track.contextLines,[track.previousLine]);}
});
test('word reveal follows the actual audio clock and can move backwards after seek',()=>{
 const sync=lyricsTracks[0].sync;assert.equal(lyricsVisibleWordCount(sync,undefined),0);assert.equal(lyricsVisibleWordCount(sync,sync.start),0);
 assert.equal(lyricsVisibleWordCount(sync,sync.wordTimes[1][0]),2);assert.equal(lyricsVisibleWordCount(sync,sync.stop),sync.wordTimes.length);assert.equal(lyricsVisibleWordCount(sync,sync.start),0);
});
test('multiplayer waits for every human audio completion, not a wall-clock countdown',()=>{
 const game=createLyricsGame(['a','b','bot:qa']);assert.equal(game.phaseEndsAt,0);assert.equal(game.revealStartedAt,0);
 assert.ok(LyricsEngine.finishAudio(game,'outsider'));LyricsEngine.finishAudio(game,'a');assert.equal(game.phase,'listening');LyricsEngine.finishAudio(game,'a');assert.equal(game.phase,'listening');
 LyricsEngine.finishAudio(game,'b');assert.equal(game.phase,'answering');assert.ok(game.phaseEndsAt>Date.now());assert.ok(LyricsEngine.finishAudio(game,'b'));
 const item=lyricsTracks.find(t=>t.id===game.lyricId);for(const uid of game.players)LyricsEngine.answer(game,uid,item.answer,game.players);
 assert.equal(game.phase,'roundResult');for(const answer of Object.values(game.roundResult.answers))assert.equal(answer.accuracy,1);
});
test('solo does not use a buffering-dependent timer for the listening phase',()=>{
 const store=new Map();globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
 LyricsSoloEngine.start('sync-qa','polish');let state=LyricsSoloEngine.get('sync-qa');const item=lyricsTracks.find(t=>t.id===state.lyricId);
 assert.equal(state.phaseEndsAt,0);assert.equal(state.audioSeconds,item.sync.stop-item.sync.start);assert.equal(LyricsSoloEngine.audioStarted('sync-qa'),true);assert.equal(LyricsSoloEngine.audioStarted('sync-qa'),false);assert.equal(LyricsSoloEngine.get('sync-qa').phaseEndsAt,0);
 LyricsSoloEngine.timeout('sync-qa',{phase:'listening'});assert.equal(LyricsSoloEngine.get('sync-qa').status,'answering');LyricsSoloEngine.answer('sync-qa',item.answer);assert.equal(LyricsSoloEngine.get('sync-qa').status,'reveal');
});
