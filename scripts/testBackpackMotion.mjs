import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {backpackAnimate,backpackFeedback} from '../js/backpackMotion.js';
test('reduced-motion preferences disable JS effects; rapid effects cancel predecessors',()=>{
 globalThis.window={matchMedia:()=>({matches:true})};let count=0,cancelled=0;
 const node={animate(){count++;return {cancel(){cancelled++;}};}};
 backpackAnimate(node,[]);assert.equal(count,0);
 window.matchMedia=()=>({matches:false});backpackAnimate(node,[]);backpackAnimate(node,[]);assert.equal(count,2);assert.equal(cancelled,1);
 assert.doesNotThrow(()=>backpackAnimate({},[]));
});
test('place, rejected moves, crafting and success get distinct bounded nonblocking effects',()=>{
 globalThis.window={matchMedia:()=>({matches:false})};const calls=[];
 const root={querySelector:selector=>({animate(frames,options){calls.push({selector,frames,options});return {cancel(){}};}})};
 backpackFeedback(root,{type:'place',index:18},{placed:{},on:false,moves:0,solved:false},{placed:{18:'cobblestone'},on:false,moves:1,solved:true});
 assert.ok(calls.some(c=>c.selector==='[data-bp-tile="18"]'));assert.ok(calls.some(c=>c.selector==='.backpack-next'));assert.ok(calls.every(c=>c.options.duration<=650));
 const js=readFileSync(new URL('../js/lastBackpack.js',import.meta.url),'utf8');assert.ok(js.includes('patchBackpackView(root,'));assert.ok(!js.includes('root.innerHTML='));assert.ok(!js.includes("addEventListener('click'"));
 const css=readFileSync(new URL('../css/lastBackpack.css',import.meta.url),'utf8');assert.ok(css.includes('prefers-reduced-motion:reduce'));assert.ok(css.includes('height:64px;min-height:64px'));
});
