import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {homeMenuHtml,bindHomeMenu,categoryTilesHtml} from '../js/homeMenu.js';
import {filterLibraryGames,libraryModesFor,libraryModeCategory} from '../js/gameCategories.js';
import {gamesList} from '../js/games.js';
import {Router} from '../js/router.js';
test('music leads navigation; counts exclude hidden/locked modes and shortcuts obey locks',()=>{
 const html=homeMenuHtml([{id:'a',audience:'music'},{id:'b',audience:'music'},{id:'c',audience:'music',hiddenFromLibrary:true}],id=>['b','playlista-cup'].includes(id));
 assert.ok(html.includes('home-music-feature'));
 assert.match(html,/data-home-music-count>1<\/span> dostępnych trybów/);assert.ok(html.includes('data-play-solo-mode="playlista-cup" disabled'));
 const categories=categoryTilesHtml(gamesList);
 for(const category of ['music','pokemon','board','minecraft','tiktok'])assert.ok(categories.includes(`data-home-category="${category}"`));
 assert.match(categories,/href="\/hity-tiktoka"/);
 assert.match(categories,/15 trybów/);
});
test('category clicks navigate and discovery shortcuts use existing filters',()=>{
 const handlers={},calls=[];
 const root={addEventListener:(type,handler)=>handlers[type]=handler,querySelector:selector=>selector==='.games-section'?{scrollIntoView:options=>calls.push(options.behavior)}:{click:()=>calls.push(selector)}};
 globalThis.window={matchMedia:()=>({matches:true})};
 bindHomeMenu(root,{goMusicModes:()=>calls.push('music'),goTikTokModes:()=>calls.push('tiktok')});
 const click=(attribute,dataset,ctrlKey=false)=>handlers.click({target:{closest:selector=>selector===attribute?{dataset}:null},preventDefault(){},ctrlKey});
 click('[data-home-category]',{homeCategory:'music'});
 click('[data-home-category]',{homeCategory:'tiktok'});
 click('[data-home-category]',{homeCategory:'tiktok'},true);
 click('[data-home-filter]',{homeFilter:'crew'});
 assert.deepEqual(calls,['music','tiktok','[data-game-filter="crew"]','instant']);
});
test('TikTok is a collection of the original hits and games keep their primary category',()=>{
 const hits=libraryModesFor(gamesList,'tiktok');
 assert.equal(hits.length,15);
 assert.ok(!gamesList.some(mode=>mode.badges?.includes('tiktok')));
 const find=id=>hits.find(mode=>mode.id===id);
 assert.equal(libraryModeCategory(find('charades')).id,'board');
 assert.equal(libraryModeCategory(find('songspot')).id,'music');
 assert.equal(libraryModeCategory(find('impostor')).id,'tiktok');
 assert.equal(Router.appScreenFromPath('/hity-tiktoka'),'tiktok-select');
 assert.ok(libraryModesFor(gamesList,'music').includes(find('songspot')));
});
test('non-category filters and search reach individual modes inside categories',()=>{
 const modes=filterLibraryGames(gamesList,'new','');
 assert.ok(modes.some(mode=>mode.id==='minecraft-journey'));
 assert.ok(modes.some(mode=>mode.id==='songspot'));
 assert.ok(modes.every(mode=>mode.badges.includes('new')&&!mode.hiddenFromLibrary));
 assert.ok(!filterLibraryGames(gamesList,'main','').some(mode=>mode.id==='songspot'||mode.id==='impostor'));
 assert.equal(filterLibraryGames(gamesList,'all','').length,gamesList.filter(mode=>!mode.hiddenFromLibrary).length);
 assert.ok(filterLibraryGames(gamesList,'all','zgadnij utwor').some(mode=>mode.id==='songspot'));
 assert.ok(filterLibraryGames(gamesList,'solo','muzyka').some(mode=>mode.id==='songspot'));
 assert.deepEqual(filterLibraryGames(gamesList,'category',''),[]);
});
test('desktop-only redesign preserves mobile cards and provides reduced-motion support',async()=>{
 const css=await readFile(new URL('../css/homeMenu.css',import.meta.url),'utf8');
 assert.ok(css.includes('.home-hub{display:none}'));assert.ok(css.includes('@media(min-width:901px)'));assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(!css.includes('grid-template-columns:1fr!important'));assert.ok(!css.includes('setInterval'));
 const platform=await readFile(new URL('../js/platform.js',import.meta.url),'utf8');
 for(const id of ['platform-join-form','platform-room-code','platform-room-pass','random-room','data-weekly-unlock','game-search-input'])assert.ok(platform.includes(id));
 assert.ok(!platform.includes('data-category-vote'));
});
