// Component checks; browser motion and responsive checks are performed separately.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createJourney,journeyAction,restoreJourney} from '../js/alexJourneyEngine.js';
import {solveJourneyScene} from './journeyTestSolutions.mjs';
const {parseHTML}=await import(pathToFileURL(process.env.BACKPACK_DOM_MODULE).href);
const {window}=parseHTML('<html><body><div id="root"></div></body></html>');
globalThis.window=window;globalThis.document=window.document;window.matchMedia=()=>({matches:true});window.confirm=()=>true;
const stored=new Map();globalThis.localStorage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)};
const {renderAlexJourney}=await import('../js/alexJourney.js');
const root=document.getElementById('root'),playerId='journey-component',s=createJourney();
const click=sel=>{const b=root.querySelector(sel);assert.ok(b,sel);assert.ok(!b.disabled&&!b.hasAttribute('disabled'),sel);b.click();};
renderAlexJourney(root,{playerId},{});
assert.ok(root.querySelector('[data-journey-chapter="2"]').hasAttribute('disabled'));
const track=root.querySelector('.journey-track'),firstScene=root.querySelector('[data-j-scene-panel="0"]');
const perform=a=>{
 if(a.item&&['node','tile','eat'].includes(a.type)&&s.selected!==a.item){assert.ok(journeyAction(s,{type:'select',item:a.item}));click(`.journey-inventory [data-j-item="${a.item}"]`);}
 assert.ok(journeyAction(s,a),JSON.stringify(a));
 if(a.type==='node'){if(a.id==='hearth')click('[data-j-x="10"][data-j-y="5"]');else {assert.equal(typeof root.querySelector(`[data-j-node="${a.id}"]`).onclick,'function',a.id);click(`[data-j-node="${a.id}"]`);}}
 else if(a.type==='prepare')click(`[data-j-recipe="${a.id}"]`);
 else if(a.type==='craft')click('[data-j-craft]');
 else if(a.type==='tile')click(`[data-j-x="${a.x}"][data-j-y="${a.y}"]`);
 else if(a.type==='switch')click('[data-j-x="7"][data-j-y="5"]');
 else if(a.type==='exit')click('[data-j-exit]');
 else if(a.type==='next')click('[data-j-next]');
 else if(a.type==='eat')click('[data-j-eat]');
 else throw Error('Unsupported UI action '+a.type);
 if(a.type==='tile'&&s.scene===4){
  const targets=[...root.querySelectorAll('.torch-target')].map(button=>Number(button.dataset.jX));
  assert.deepEqual(targets,a.x===8?[13]:[]);
  if(!targets.length)assert.match(root.querySelector('.journey-objective').textContent,/kamienny kilof/);
 }
 const replayed=restoreJourney(stored.get('grygrupowe-alex-journey-v1:'+playerId));assert.deepEqual(replayed.stock,s.stock,JSON.stringify(a)+' / '+root.querySelector('.journey-message')?.textContent+' / '+JSON.stringify(replayed.world[replayed.scene].placed));assert.deepEqual(replayed.world,s.world);assert.equal(replayed.scene,s.scene);
 if(!s.done){
  assert.equal(root.querySelector('.journey-track'),track,'camera track persists');
  assert.equal(root.querySelector('[data-j-scene-panel="0"]'),firstScene,'earlier scenery remains mounted');
 }
 return true;
};
for(let scene=0;scene<10;scene++){
 console.log(`Checking journey scene ${scene+1}/10`);
 if(scene===4){
  assert.deepEqual([...root.querySelectorAll('.torch-target')].map(button=>Number(button.dataset.jX)),[7,13]);
  assert.match(root.querySelector('.journey-track').getAttribute('style'),/--pan:4/);
  assert.match(root.querySelector('.journey-objective').textContent,/dwóch złotych kratkach/);
 }
 solveJourneyScene(s,{perform});
 if(!s.done)assert.ok(root.querySelector('.journey-message.good'));
 if(scene<9)perform({type:'next'});
}
assert.ok(root.querySelector('[data-alex-comic="reunion-0"]'));
for(const frame of [1,2]){click('[data-comic-next]');assert.ok(root.querySelector(`[data-alex-comic="reunion-${frame}"]`));}
assert.ok(root.querySelector('.alex-hug-alex svg g[transform]'));
click('[data-comic-next]');
assert.ok(root.querySelector('.journey-ending'));assert.equal(root.querySelectorAll('[data-j-scene-panel]').length,10);
assert.equal(root.querySelectorAll('.journey-hearts span').length,8);assert.equal(root.querySelector('[data-j-exit]'),null);assert.match(root.querySelector('.journey-ending').textContent,/czas przejścia/);assert.ok(root.querySelector('.is-finished'));
// Return to the first scene after the ending: the old log and pig remain depleted.
click('[data-j-travel="0"]');assert.ok(root.querySelector('[data-j-node="pig"]').disabled);assert.ok(root.querySelector('[data-j-node="first-log"]').disabled);
const {renderAlexJourney:fresh}=await import('../js/alexJourney.js?fresh-ui-test');fresh(root,{playerId},{});assert.ok(root.querySelector('[data-j-node="first-log"]').disabled);
click('[data-j-travel="9"]');assert.match(root.querySelector('.journey-track').getAttribute('style'),/--pan:4/);assert.ok(root.querySelector('.journey-hearts'));
const {renderAlexJourney:reloadEnding}=await import('../js/alexJourney.js?ending-reload-test');reloadEnding(root,{playerId},{});assert.match(root.querySelector('.journey-track').getAttribute('style'),/--pan:4/);
click('[data-journey-chapter="2"]');
assert.ok(root.querySelector('[data-alex-comic="raid-0"]'));
for(const frame of [1,2]){click('[data-comic-next]');assert.ok(root.querySelector(`[data-alex-comic="raid-${frame}"]`));}
click('[data-comic-next]');
assert.match(root.querySelector('.rescue-quest h2').textContent,/Ten sam dom/);
assert.equal(root.querySelector('[data-rescue-node="embrace"]'),null);
assert.match(root.querySelector('.rescue-foot').textContent,/Zombie porwały Alex/);
click('[data-rescue-node="trail"]');click('[data-rescue-next]');
assert.match(root.querySelector('.rescue-quest h2').textContent,/Zbrojownia/);
const {renderAlexJourney:resumedChapter}=await import('../js/alexJourney.js?chapter-two-reload-test');
resumedChapter(root,{playerId},{});
assert.match(root.querySelector('.rescue-quest h2').textContent,/Zbrojownia/);
click('[data-journey-chapter="1"]');
assert.ok(root.querySelector('.journey-ending'));
click('[data-j-restart]');assert.match(root.querySelector('.journey-empty').textContent,/pusto/);assert.ok(!root.querySelector('[data-j-node="first-log"]').disabled);
console.log('PASS: 10-scene UI, persistent world DOM, collection, shared inventory, crafting, smelting, construction, lighting, gate, ending, backtracking, reload and restart.');
