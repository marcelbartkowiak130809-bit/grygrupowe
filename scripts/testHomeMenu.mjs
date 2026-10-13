import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {homeMenuHtml,bindHomeMenu} from '../js/homeMenu.js';
test('music leads navigation; counts exclude hidden/locked modes and shortcuts obey locks',()=>{
 const html=homeMenuHtml([{id:'a',audience:'music'},{id:'b',audience:'music'},{id:'c',audience:'music',hiddenFromLibrary:true}],id=>['b','playlista-cup'].includes(id));
 assert.ok(html.indexOf('home-music-feature')<html.indexOf('home-category-stack'));
 assert.ok(html.includes('1 dostępnych trybów'));assert.ok(html.includes('data-play-solo-mode="playlista-cup" disabled'));
 for(const category of ['music','pokemon','board','minecraft'])assert.ok(html.includes(`data-home-category="${category}"`));
});
test('category clicks navigate and discovery shortcuts use existing filters',()=>{
 const handlers={},calls=[];
 const node=id=>({dataset:{homeCategory:id,homeFilter:id},addEventListener:(type,handler)=>handlers[id]=handler});
 const root={querySelectorAll:selector=>selector==='[data-home-category]'?['music','pokemon','board','minecraft'].map(node):['crew','all'].map(node),querySelector:selector=>selector==='.games-section'?{scrollIntoView:options=>calls.push(options.behavior)}:{click:()=>calls.push(selector)}};
 globalThis.window={matchMedia:()=>({matches:true})};bindHomeMenu(root,{goMusicModes:()=>calls.push('music'),goPokemonModes:()=>{},goBoardModes:()=>{},goMinecraftModes:()=>{}});
 handlers.music();handlers.crew();assert.deepEqual(calls,['music','[data-game-filter="crew"]','instant']);
});
test('desktop-only redesign preserves mobile cards and provides reduced-motion support',async()=>{
 const css=await readFile(new URL('../css/homeMenu.css',import.meta.url),'utf8');
 assert.ok(css.includes('.home-hub{display:none}'));assert.ok(css.includes('@media(min-width:901px)'));assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(!css.includes('grid-template-columns:1fr!important'));assert.ok(!css.includes('setInterval'));
 const platform=await readFile(new URL('../js/platform.js',import.meta.url),'utf8');
 for(const id of ['platform-join-form','platform-room-code','platform-room-pass','random-room','data-category-vote','game-search-input'])assert.ok(platform.includes(id));
});
