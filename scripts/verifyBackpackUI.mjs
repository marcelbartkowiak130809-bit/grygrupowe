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
// Native drag and drop path, without selecting the dragged resource first.
let dragged;const start=new window.Event('dragstart');start.dataTransfer={setData:(type,value)=>dragged=value};root.querySelector('[data-bp-item="cobblestone"]').dispatchEvent(start);
assert.equal(dragged,'cobblestone');const drop=new window.Event('drop',{cancelable:true});drop.dataTransfer={getData:()=>dragged};root.querySelector('[data-bp-tile="18"]').dispatchEvent(drop);
assert.ok(root.querySelector('[data-bp-tile="18"]').classList.contains('has-item'));
click('[data-bp-undo]');assert.ok(!root.querySelector('[data-bp-tile="18"]').classList.contains('has-item'));
item('cobblestone');for(const i of [18,19,20,21])tile(i);assert.ok(root.querySelector('[data-bp-next]'));
click('[data-bp-next]');craft('oak_planks','oak_planks');craft('coal','stick');
assert.match(root.querySelector('.backpack-status').textContent,/4 × Pochodnia/);
for(const i of [10,21,30]){item('torch');tile(i);}
assert.equal(root.querySelectorAll('.target-done').length,3);click('[data-bp-next]');
craft('oak_planks','oak_planks');craft('stick','cobblestone');tile(17);item('redstone');for(const i of [18,19,20,21])tile(i);
assert.equal(root.querySelector('[data-bp-next]'),null);tile(17);assert.ok(root.querySelector('.powered'));
click('[data-bp-next]');assert.match(root.textContent,/Wszystkie przeszkody pokonane/);assert.ok(stored.size);
// A fresh module/session reconstructs the completed game from storage.
const {renderLastBackpack:fresh}=await import('../js/lastBackpack.js?restore-component-test');fresh(root,context,{});assert.ok(root.querySelector('.backpack-finish'));
// Touch drag path: one item is consumed once, and a cancelled gesture consumes none.
click('[data-bp-restart]');const b=root.querySelector('[data-bp-item="cobblestone"]');b.setPointerCapture=()=>{};
b.onpointerdown({pointerType:'touch',pointerId:1,clientX:10,clientY:10});b.onpointermove({pointerId:1,clientX:50,clientY:50,preventDefault(){}});
document.elementFromPoint=()=>root.querySelector('[data-bp-tile="18"]');b.onpointerup({type:'pointerup',pointerId:1,clientX:50,clientY:50});
assert.ok(!document.querySelector('.backpack-drag-ghost'));assert.equal(root.querySelector('[data-bp-item="cobblestone"] b').textContent,'3');
const c=root.querySelector('[data-bp-item="cobblestone"]');c.setPointerCapture=()=>{};c.onpointerdown({pointerType:'touch',pointerId:2,clientX:10,clientY:10});c.onpointermove({pointerId:2,clientX:50,clientY:50,preventDefault(){}});c.onpointercancel({type:'pointercancel'});
assert.ok(!document.querySelector('.backpack-drag-ghost'));assert.equal(root.querySelector('[data-bp-item="cobblestone"] b').textContent,'3');
console.log('PASS: full three-stage UI, crafting, mouse drag/drop, touch drag/cancel, undo, selection stability, save/reload, restart.');
