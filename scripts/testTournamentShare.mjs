import assert from 'node:assert/strict';
import {test} from 'node:test';
import {tournamentShareData,formatTournamentDuration,formatTournamentCounts,fitShareText,canShareTournamentFile,TOURNAMENT_SHARE_URL,createTournamentPoster} from '../js/tournamentShare.js';
const state={status:'done',winnerId:'a',tracks:[{id:'a',title:'Małgośka',artist:'Maryla Rodowicz',coverUrl:'https://example.com/cover.jpg'},{id:'b',title:'Hello',artist:'Adele'}],history:[{}],startedAt:1000,finishedAt:62500};
test('poster uses the winner, public player fields and measured final duration only',()=>{
  const data=tournamentShareData(state,{nick:'Gracz Żółw',avatarImage:'data:image/png;base64,test',email:'private@example.com',password:'private'});
  assert.equal(data.title,'Małgośka');assert.equal(data.artist,'Maryla Rodowicz');assert.equal(data.duration,'1 min 1 s');
  assert.equal(data.nick,'Gracz Żółw');assert.ok(!('email' in data));assert.ok(!('password' in data));assert.ok(!('history' in data));
  assert.equal(tournamentShareData({...state,startedAt:0,finishedAt:0}).duration,'Brak pomiaru');
  assert.throws(()=>tournamentShareData({...state,status:'playing'}),/zakończ/);
  assert.equal(TOURNAMENT_SHARE_URL,'https://grygrupowe.pages.dev/playlista-cup');
});
test('time formatting and long labels remain bounded without breaking Unicode',()=>{
  assert.equal(formatTournamentDuration(null),'Brak pomiaru');assert.equal(formatTournamentDuration(0),'0 min 0 s');
  assert.equal(formatTournamentDuration(3661000),'1 h 1 min 1 s');
  assert.equal(formatTournamentCounts(2,1),'2 utwory  ·  1 pojedynek');
  assert.equal(formatTournamentCounts(14,13),'14 utworów  ·  13 pojedynków');
  assert.equal(formatTournamentCounts(23,22),'23 utwory  ·  22 pojedynki');
  const ctx={font:'',measureText:text=>({width:Array.from(text).length*10})};
  assert.equal(fitShareText(ctx,'Maryla',80,40,20),'Maryla');
  const text=fitShareText(ctx,'Żółw 🐢 bardzo długi nick',100,40,20);assert.ok(text.endsWith('…'));assert.ok(Array.from(text).length<=10);
});
test('native sharing is offered only for supported files and download remains a fallback',()=>{
  assert.equal(canShareTournamentFile({},{}),false);
  assert.equal(canShareTournamentFile({},{share:()=>{},canShare:()=>false}),false);
  assert.equal(canShareTournamentFile({},{share:()=>{},canShare:()=>true}),true);
  assert.equal(canShareTournamentFile({},{share:()=>{},canShare:()=>{throw Error('unsupported');}}),false);
});
test('one reusable template draws dynamic cover and avatar; unavailable images cannot taint export',async()=>{
  const sources=[],drawn=[],texts=[];
  globalThis.Image=class {naturalWidth=100;naturalHeight=100; set src(value){sources.push(value);queueMicrotask(()=>{if(value.includes('missing'))this.onerror?.();else this.onload?.();});}};
  const ctx={drawImage:image=>drawn.push(image),measureText:text=>({width:Array.from(text).length*20}),fillText:text=>texts.push(text),
    beginPath(){},roundRect(){},clip(){},save(){},restore(){},arc(){},fillRect(){},fill(){},createLinearGradient(){return {addColorStop(){}};}};
  const canvas={getContext:()=>ctx,toBlob:callback=>callback(new Blob(['png'],{type:'image/png'}))};
  globalThis.document={fonts:{ready:Promise.resolve()},createElement:tag=>{assert.equal(tag,'canvas');return canvas;}};
  const data=tournamentShareData(state,{nick:'Tester',avatarImage:'https://example.com/avatar.png'});
  const poster=await createTournamentPoster(data);
  assert.equal(canvas.width,1080);assert.equal(canvas.height,1350);assert.equal(drawn.length,3);
  assert.ok(sources[0].includes('playlist-cup-base.svg'));assert.ok(texts.includes('Małgośka'));assert.ok(texts.includes('Tester'));assert.equal(poster.blob.type,'image/png');
  drawn.length=0;const fallback=await createTournamentPoster({...data,coverUrl:'https://example.com/missing',avatarImage:'https://example.com/missing'});
  assert.equal(drawn.length,1);assert.equal(fallback.missingCover,true);assert.equal(fallback.missingAvatar,true);
  const aborted=new AbortController();aborted.abort();await assert.rejects(createTournamentPoster(data,{signal:aborted.signal}),{name:'AbortError'});
});
