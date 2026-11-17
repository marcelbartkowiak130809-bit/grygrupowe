// Component-level DOM checks, not a substitute for browser/device visual QA.
// npm install --prefix <temp-dir> --no-save --package-lock=false linkedom
// BACKPACK_DOM_MODULE=<temp-dir>/node_modules/linkedom/esm/index.js node scripts/verifyBackpackUI.mjs
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {parseHTML}=await import(pathToFileURL(process.env.BACKPACK_DOM_MODULE).href);
const {window}=parseHTML('<html><body><div id="root"></div></body></html>');
globalThis.window=window;globalThis.document=window.document;window.confirm=()=>true;
const stored=new Map();globalThis.localStorage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)};
const {renderLastBackpack}=await import('../js/lastBackpack.js');
const root=document.getElementById('root'),context={playerId:'component-test'};
const render=()=>renderLastBackpack(root,context,{goMinecraftModes(){}});
const click=selector=>{const el=root.querySelector(selector);assert.ok(el,selector);assert.ok(!el.hasAttribute('disabled'),selector);el.click();};
const item=id=>click(`[data-bp-item="${id}"]`),tile=i=>click(`[data-bp-tile="${i}"]`),slot=i=>click(`[data-bp-craft-slot="${i}"]`);
const craft=(a,b)=>{item(a);slot(0);if(b){item(b);slot(3);}click('[data-bp-craft]');};
render();
const original=root.querySelector('.backpack-world');item('oak_log');assert.equal(root.querySelector('.backpack-world'),original,'select does not replace the board');
const originalTile=root.querySelector('[data-bp-tile="0"]'),originalInventory=root.querySelector('[data-bp-item="cobblestone"]');
// A wooden bridge has an explicit visible texture, not only a CSS variable.
slot(0);click('[data-bp-craft]');tile(18);
assert.ok(root.querySelector('[data-bp-tile="18"] img.backpack-block-surface[src$="oak_planks.png"]'));
assert.ok(!root.querySelector('[data-bp-tile="18"]').classList.contains('lava-tile'));
click('[data-bp-undo]');assert.equal(root.querySelector('[data-bp-tile="18"] img.backpack-block-surface'),null);
// Native drag and drop path, without selecting the dragged resource first.
let dragged;const start=new window.Event('dragstart');start.dataTransfer={setData:(type,value)=>dragged=value};root.querySelector('[data-bp-item="cobblestone"]').dispatchEvent(start);
assert.equal(dragged,'cobblestone');const drop=new window.Event('drop',{cancelable:true});drop.dataTransfer={getData:()=>dragged};root.querySelector('[data-bp-tile="18"]').dispatchEvent(drop);
assert.ok(root.querySelector('[data-bp-tile="18"]').classList.contains('has-item'));
assert.equal(root.querySelector('.backpack-world'),original,'placing preserves world node and lava timeline');
assert.equal(root.querySelector('[data-bp-tile="0"]'),originalTile,'unaffected tile retained');
assert.equal(root.querySelector('[data-bp-item="cobblestone"]'),originalInventory,'inventory retained');
click('[data-bp-undo]');assert.ok(!root.querySelector('[data-bp-tile="18"]').classList.contains('has-item'));
item('cobblestone');for(const i of [18,19,20,21])tile(i);assert.ok(root.querySelector('[data-bp-next]'));
click('[data-bp-next]');craft('oak_planks','oak_planks');craft('coal','stick');
assert.match(root.querySelector('.backpack-status').textContent,/4 × Pochodnia/);
for(const i of [10,21,30]){item('torch');tile(i);}
assert.equal(root.querySelectorAll('.target-done').length,3);click('[data-bp-next]');
craft('oak_planks','oak_planks');craft('stick','cobblestone');tile(17);item('redstone');for(const i of [18,19,20,21])tile(i);
assert.equal(root.querySelector('[data-bp-next]'),null);tile(17);assert.ok(root.querySelector('.powered'));
click('[data-bp-next]');assert.match(root.textContent,/Ostatnie nasiona/);
const put=(i,id)=>{if(id)item(id);tile(i);};
const pattern=slots=>{for(const [i,id]of slots){item(id);slot(i);}click('[data-bp-craft]');};
const pick=material=>pattern([[0,material],[1,material],[2,material],[4,'stick'],[7,'stick']]);
craft('oak_planks','oak_planks');pattern([[0,'oak_planks'],[1,'oak_planks'],[4,'stick'],[7,'stick']]);put(12,'water_bucket');for(const i of [18,20,22]){put(i,'wooden_hoe');put(i,'wheat_seeds');}
assert.equal(root.querySelectorAll('img[src$="wheat_stage3.png"]').length,3);click('[data-bp-next]');assert.match(root.textContent,/Ekspres do skrzyni/);
for(const i of [18,19,21,22])put(i,'rail');put(20,'powered_rail');put(28,'redstone_torch');put(17,'minecart');click('[data-bp-next]');
assert.match(root.textContent,/Grawitacja nie wybacza/);for(const [i,id]of [[18,'sand'],[18,'sand'],[19,'sand'],[19,'sand'],[20,'gravel'],[20,'gravel']])put(i,id);assert.ok(root.querySelector('[data-bp-tile="26"] img[src$="sand.png"]'));click('[data-bp-next]');
for(let i=0;i<3;i++)put(10,'iron_ore');put(26,'coal');tile(18);pattern([[0,'iron_ingot'],[2,'iron_ingot'],[4,'iron_ingot']]);put(22,'bucket');click('[data-bp-next]');
for(const i of [1,3,5,33])put(i,'bookshelf');put(19,'lapis_lazuli');put(19,'book');click('[data-bp-next]');
for(const i of [2,3,9,12,17,20,25,28,34,35])put(i,'obsidian');pattern([[0,'flint'],[8,'iron_ingot']]);put(10,'flint_and_steel');click('[data-bp-next]');
pattern([[0,'oak_log']]);pattern([[0,'oak_log']]);craft('oak_planks','oak_planks');pick('oak_planks');for(const i of [9,17,25])put(i,'wooden_pickaxe');pick('cobblestone');for(const i of [11,19,27])put(i,'stone_pickaxe');for(let i=0;i<3;i++)put(14,'iron_ore');put(30,'coal');tile(22);craft('oak_planks','oak_planks');pick('iron_ingot');put(21,'iron_pickaxe');
assert.match(root.querySelector('[data-bp-next]').textContent,/podsumowanie/);click('[data-bp-next]');assert.match(root.textContent,/Wszystkie przeszkody pokonane/);assert.match(root.textContent,/10\/10/);assert.ok(stored.size);
// A fresh module/session reconstructs the completed game from storage.
const {renderLastBackpack:fresh}=await import('../js/lastBackpack.js?restore-component-test');fresh(root,context,{});assert.ok(root.querySelector('.backpack-finish'));
// Touch drag path: one item is consumed once, and a cancelled gesture consumes none.
click('[data-bp-restart]');const b=root.querySelector('[data-bp-item="cobblestone"]');b.setPointerCapture=()=>{};
b.onpointerdown({pointerType:'touch',pointerId:1,clientX:10,clientY:10});b.onpointermove({pointerId:1,clientX:50,clientY:50,preventDefault(){}});
document.elementFromPoint=()=>root.querySelector('[data-bp-tile="18"]');b.onpointerup({type:'pointerup',pointerId:1,clientX:50,clientY:50});
assert.ok(!document.querySelector('.backpack-drag-ghost'));assert.equal(root.querySelector('[data-bp-item="cobblestone"] b').textContent,'3');
assert.equal(root.querySelector('[data-bp-item="cobblestone"]').dataset.suppressClick,'true');
root.querySelector('[data-bp-item="cobblestone"]').click();assert.ok(!root.querySelector('[data-bp-item="cobblestone"]').dataset.suppressClick);
const c=root.querySelector('[data-bp-item="cobblestone"]');c.setPointerCapture=()=>{};c.onpointerdown({pointerType:'touch',pointerId:2,clientX:10,clientY:10});c.onpointermove({pointerId:2,clientX:50,clientY:50,preventDefault(){}});c.onpointercancel({type:'pointercancel'});
assert.ok(!document.querySelector('.backpack-drag-ghost'));assert.equal(root.querySelector('[data-bp-item="cobblestone"] b').textContent,'3');
console.log('PASS: full ten-stage UI, all seven new mechanics, crafting, mouse drag/drop, touch drag/cancel, undo, selection stability, save/reload, restart.');
