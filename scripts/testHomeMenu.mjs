import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {homeModePicks,bindHomeMenu,categoryTilesHtml} from '../js/homeMenu.js';
import {filterLibraryGames,libraryModesFor,libraryModeCategory} from '../js/gameCategories.js';
import {gamesList} from '../js/games.js';
import {Router} from '../js/router.js';
test('all categories are present in the library and each visible mode appears in its primary category',()=>{
 const categories=categoryTilesHtml(gamesList);
 for(const category of ['music','pokemon','board','minecraft','tiktok','knowledge','other'])assert.ok(categories.includes(`data-home-category="${category}"`));
 assert.match(categories,/href="\/hity-tiktoka"/);
 assert.match(categories,/href="\/inne"/);
 assert.ok(!categories.includes('data-home-category="solo"'));
 for(const mode of gamesList.filter(mode=>!mode.hiddenFromLibrary)){
  assert.ok(libraryModesFor(gamesList,libraryModeCategory(mode).id).includes(mode),mode.id);
 }
 assert.ok(libraryModesFor(gamesList,'other').some(mode=>mode.id==='co-wolisz'));
 assert.ok(libraryModesFor(gamesList,'board').some(mode=>mode.id==='kim-jestem'));
 assert.equal(Router.appScreenFromPath('/inne'),'other-select');
});
test('category clicks navigate and modified clicks keep native link behavior',()=>{
 const handlers={},calls=[];
 const root={addEventListener:(type,handler)=>handlers[type]=handler};
 bindHomeMenu(root,{goLibraryCategory:id=>calls.push(id)});
 const click=(attribute,dataset,ctrlKey=false)=>handlers.click({target:{closest:selector=>selector===attribute?{dataset}:null},preventDefault(){},ctrlKey});
 click('[data-home-category]',{homeCategory:'music'});
 click('[data-home-category]',{homeCategory:'tiktok'});
 click('[data-home-category]',{homeCategory:'tiktok'},true);
 click('[data-home-category]',{homeCategory:'other'});
 assert.deepEqual(calls,['music','tiktok','other']);
});
test('featured picks exclude locked and hidden modes and use the later of a major update and an unlock',()=>{
 const before=Date.parse('2026-11-21T19:59:59+01:00');
 const {latest,recommended}=homeModePicks(gamesList,before,[],()=>0);
 assert.equal(latest.mode.id,'minecraft-backpack');
 assert.equal(latest.updated,true);
 assert.equal(new Set([latest.mode,...recommended]).size,3);
 assert.ok(recommended.every(mode=>!mode.hiddenFromLibrary && !['pokemon-dex','minecraft-redstone'].includes(mode.id)));
 assert.deepEqual(homeModePicks(gamesList,before,recommended,()=>0.99).recommended,recommended);
 const after=homeModePicks(gamesList,before+1000,recommended,()=>0.99);
 assert.equal(after.latest.mode.id,'minecraft-redstone');
 assert.equal(after.latest.updated,false);
});
test('TikTok is a collection of the original hits and games keep their primary category',()=>{
 const hits=libraryModesFor(gamesList,'tiktok');
 assert.equal(hits.length,19);
 assert.ok(!gamesList.some(mode=>mode.badges?.includes('tiktok')));
 const find=id=>hits.find(mode=>mode.id===id);
 for(const id of ['inne-pytanie','marker','sequence','polacz-nas'])assert.ok(find(id),id);
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
test('Udowodnij comes first in Wiedza and the category is available as a direct route',()=>{
 const expected=['udowodnij','najblizej-prawdy','quiz','mathematics','family'];
 const modes=libraryModesFor(gamesList,'knowledge');
 assert.deepEqual(modes.map(mode=>mode.id),expected);
 assert.equal(Router.appScreenFromPath('/wiedza'),'knowledge-select');
 assert.ok(modes.every(mode=>libraryModeCategory(mode).id==='knowledge'));
 const results=filterLibraryGames(gamesList,'all','wiedza');
 assert.ok(modes.every(mode=>results.includes(mode)));
 assert.ok(!filterLibraryGames(gamesList,'main','').some(mode=>expected.includes(mode.id)));
});
test('home recommendations support mobile and appear above the category grid',async()=>{
 const css=await readFile(new URL('../css/homeMenu.css',import.meta.url),'utf8');
 assert.ok(css.includes('@media(max-width:650px)'));assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(!css.includes('grid-template-columns:1fr!important'));assert.ok(!css.includes('setInterval'));
 const platform=await readFile(new URL('../js/platform.js',import.meta.url),'utf8');
 for(const id of ['platform-join-form','platform-room-code','platform-room-pass','random-room','data-weekly-unlock','game-search-input'])assert.ok(platform.includes(id));
 assert.ok(!platform.includes('data-category-vote'));
 assert.ok(platform.indexOf('class="home-picks"') < platform.indexOf('aria-label="Kategorie gier"'));
});
