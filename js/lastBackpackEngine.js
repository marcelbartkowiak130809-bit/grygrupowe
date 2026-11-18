import {puzzleItems,extraBackpackLevels,extraTerrain,extraRecipe,extraProgress,extraPlace} from './backpackPuzzles.js?v=20261118-8';
import {logicSolved} from './backpackAdvancedPuzzles.js?v=20261118-3';
import {craftBatchCount} from './backpackQuality.js?v=20261117-10';
export const backpackItems={oak_log:'Drewno',oak_planks:'Deski',stick:'Patyk',coal:'Węgiel',torch:'Pochodnia',cobblestone:'Bruk',redstone:'Redstone',lever:'Dźwignia',feather:'Pióro',string:'Nić',snowball:'Śnieżka',rotten_flesh:'Zgniłe mięso',...puzzleItems};
export const backpackLevels=[
 {name:'Nad jeziorem lawy',goal:'Zbuduj bezpieczne przejście do skrzyni.',tip:'Możesz użyć bruku albo zrobić deski z drewna.',theme:'lava',stock:{oak_log:2,cobblestone:4,feather:3,string:2,snowball:4,rotten_flesh:2},start:17,end:22},
 {name:'Światło w kopalni',goal:'Oświetl trzy zaznaczone miejsca w kopalni.',tip:'Węgiel nad patykiem daje 4 pochodnie. Deska nad deską daje patyki.',theme:'cave',stock:{oak_planks:2,coal:2,feather:2,string:4,snowball:3,rotten_flesh:3},targets:[10,21,30]},
 {name:'Przywróć zasilanie',goal:'Połącz dźwignię z drzwiami i włącz obwód.',tip:'Patyk nad brukiem daje dźwignię. Uzupełnij cztery przerwy w przewodzie.',theme:'circuit',stock:{oak_planks:2,cobblestone:1,redstone:4,feather:4,string:3,snowball:2,rotten_flesh:2},sockets:[18,19,20,21],switch:17,end:22},
 ...extraBackpackLevels
];
export function backpackRecipe(grid){
 const extra=extraRecipe(grid);if(extra)return extra;
 const cells=grid.map((item,i)=>({item,x:i%3,y:Math.floor(i/3)})).filter(c=>c.item);
 if(cells.length===1&&cells[0].item==='oak_log')return {item:'oak_planks',count:4};
 if(cells.length!==2)return null;
 const [a,b]=cells.sort((a,b)=>a.y-b.y);if(a.x!==b.x||b.y-a.y!==1)return null;
 if(a.item==='oak_planks'&&b.item==='oak_planks')return {item:'stick',count:4};
 if(a.item==='coal'&&b.item==='stick')return {item:'torch',count:4};
 if(a.item==='stick'&&b.item==='cobblestone')return {item:'lever',count:1};
 return null;
}
const levelAttempt = (level,message) => ({
 stock:{...backpackLevels[level].stock},grid:Array(9).fill(''),placed:{},puzzle:{},
 selected:'',on:false,solved:false,undo:[],message
});
export function createBackpackState(){
 return {
  version:2,log:[],legacyActions:0,level:0,unlocked:0,completed:[],attempts:{},
  done:false,moves:0,used:0,startedAt:0,finishedAt:0,finishedMoves:0,
  ...levelAttempt(0,'Wybierz przedmiot z plecaka.')
 };
}
export function backpackLight(state,index){return Object.entries(state.placed).some(([key,item])=>item==='torch'&&Math.abs(Number(key)%8-index%8)+Math.abs(Math.floor(Number(key)/8)-Math.floor(index/8))<=1);}
export function backpackProgress(state){const l=backpackLevels[Math.min(state.level,backpackLevels.length-1)];if(state.level>=3)return extraProgress(l,state);if(state.level===1)return {current:l.targets.filter(i=>backpackLight(state,i)).length,total:l.targets.length,label:'oświetlone miejsca'};if(state.level===2)return {current:l.sockets.filter(i=>state.placed[i]==='redstone').length+(state.on&&state.placed[l.switch]==='lever'?1:0),total:5,label:'elementy obwodu'};return {current:state.solved?1:0,total:1,label:'bezpieczne przejście'};}
export function backpackTerrain(level,index,state={puzzle:{}}){if(level>=3)return extraTerrain(backpackLevels[level],index,state);const x=index%8,y=Math.floor(index/8);if(level===0)return x<=1||x>=6?'grass_block_side':'lava_still';if(level===1)return y===0||y===4||x===0||x===7?'deepslate_tiles':'stone';return y===0||y===4?'deepslate_tiles':'stone_bricks';}
export function backpackBatch(state){return craftBatchCount(state,backpackRecipe(state.grid));}
function add(state,item,count=1){state.stock[item]=(state.stock[item]||0)+count;}
function solved(state){const level=backpackLevels[state.level];if(state.level===1)return level.targets.every(i=>backpackLight(state,i));
 if(state.level===2)return state.on&&state.placed[level.switch]==='lever'&&level.sockets.every(i=>state.placed[i]==='redstone');
 const seen=new Set([level.start]),queue=[level.start];while(queue.length){const i=queue.shift();if(i===level.end)return true;for(const j of [i-8,i+8,...(i%8?[i-1]:[]),...(i%8<7?[i+1]:[])])if(j>=0&&j<40&&!seen.has(j)&&(backpackTerrain(0,j)!=='lava_still'||state.placed[j])){seen.add(j);queue.push(j);}}return false;
}
function execute(state,action){
 if(state.solved)return false;
 if(action.type==='select'){if(!backpackItems[action.item]||!(state.stock[action.item]>0))return false;state.selected=action.item;state.message=`Wybrano: ${backpackItems[action.item]}`;return true;}
 if(action.type==='craft-slot'){const i=action.index;if(!Number.isInteger(i)||i<0||i>8)return false;if(state.grid[i]){add(state,state.grid[i]);state.grid[i]='';}else{const item=action.item||state.selected;if(!backpackItems[item]||!(state.stock[item]>0))return false;state.stock[item]--;state.grid[i]=item;}state.message='Ułóż składniki i odbierz wynik.';return true;}
 if(action.type==='clear'){state.grid.forEach(item=>{if(item)add(state,item);});state.grid.fill('');state.message='Składniki wróciły do plecaka.';return true;}
 if(action.type==='fill-compost'){const l=backpackLevels[state.level];if(l.kind!=='compost'||state.placed[l.bin]!=='composter')return false;const count=Math.min(4-(state.puzzle.compost||0),state.stock.wheat_seeds||0);if(count<1)return false;for(let n=0;n<count;n++)extraPlace(state,l,l.bin,'wheat_seeds');state.message=`Wsypano ${count} nasiona. Kliknij kompostownik, aby odebrać nawóz.`;return true;}
 if(action.type==='craft-all'){const recipe=backpackRecipe(state.grid),count=backpackBatch(state);if(!recipe||count<2)return false;for(const item of state.grid)if(item)state.stock[item]-=count-1;add(state,recipe.item,recipe.count*count);for(const [id,n]of Object.entries(recipe.returns||{}))add(state,id,n*count);state.grid.fill('');state.selected=recipe.item;state.moves++;state.message=`Wytworzono: ${recipe.count*count} × ${backpackItems[recipe.item]}`;return true;}
 if(action.type==='craft'){const recipe=backpackRecipe(state.grid);if(!recipe){state.message='Te składniki nie tworzą receptury.';return true;}add(state,recipe.item,recipe.count);for(const [id,count]of Object.entries(recipe.returns||{}))add(state,id,count);state.grid.fill('');state.selected=recipe.item;state.moves++;state.message=`Wytworzono: ${recipe.count} × ${backpackItems[recipe.item]}`;return true;}
 if(action.type==='remove'){if(!Number.isInteger(action.index)||action.index<0||action.index>=40)return false;const item=state.placed[action.index];if(!item){if(backpackLevels[state.level].kind==='beacon'&&(state.puzzle.base||[]).includes(action.index)&&!state.placed[backpackLevels[state.level].center]){state.puzzle.base=state.puzzle.base.filter(i=>i!==action.index);add(state,'iron_block');state.message='Odzyskano blok podstawy.';return true;}return false;}if(backpackLevels[state.level].kind==='gravity'&&state.placed[action.index-8]){state.message='Najpierw odzyskaj górny blok, żeby dolny nie wisiał w powietrzu.';return true;}if(item==='cake'&&state.puzzle.candle){add(state,'candle');delete state.puzzle.candle;}if(item==='beacon'&&state.puzzle.filter){add(state,state.puzzle.filter);delete state.puzzle.filter;}if(item==='lever'&&state.puzzle.switches)delete state.puzzle.switches[action.index];if(item==='hopper'&&state.puzzle.dirs)delete state.puzzle.dirs[action.index];add(state,item);delete state.placed[action.index];state.on=false;state.message='Przedmiot wrócił do plecaka.';return true;}
 if(action.type!=='place')return false;
 const i=action.index,level=backpackLevels[state.level],item=action.item||state.selected;
 if(!Number.isInteger(i)||i<0||i>=40)return false;
 if(state.level>=3)return extraPlace(state,level,i,item,action.free===true);
 if(state.level===2&&i===level.switch&&state.placed[i]==='lever'){state.on=!state.on;state.message=state.on?'Zasilanie włączone.':'Zasilanie wyłączone.';}
 else{
  if(!backpackItems[item]||!(state.stock[item]>0)||state.placed[i]){state.message='Wybierz przedmiot z plecaka. Zajęte pole możesz odzyskać prawym przyciskiem.';return true;}
  const valid=state.level===0?['cobblestone','oak_planks'].includes(item)&&backpackTerrain(0,i)==='lava_still':state.level===1?item==='torch'&&backpackTerrain(1,i)==='stone':(i===level.switch&&item==='lever')||(level.sockets.includes(i)&&item==='redstone');
  if(!valid){state.message='Ten przedmiot tu nie pasuje. Spróbuj innego miejsca lub receptury.';return true;}
  state.stock[item]--;state.placed[i]=item;state.used++;state.moves++;state.message='Dobrze! Kontynuuj.';
 }
 state.solved=solved(state);if(state.solved)state.message='Wyzwanie ukończone!';return true;
}
function attemptOf({stock,grid,placed,puzzle,selected,on,solved,undo,message}){
 return {stock,grid,placed,puzzle,selected,on,solved,undo,message};
}
function markCompletion(state){
 if(!state.solved)return;
 state.completed[state.level]=true;
 state.unlocked=Math.max(state.unlocked,Math.min(state.level+1,backpackLevels.length-1));
}
function openLevel(state,index){
 if(!state.done)state.attempts[state.level]=attemptOf(state);
 const attempt=state.attempts[index]||levelAttempt(index,'Nowe wyzwanie. Plecak gotowy.');
 delete state.attempts[index];
 Object.assign(state,attempt,{level:index,done:false});
}
function showSummary(state){
 if(!state.done)state.attempts[state.level]=attemptOf(state);
 if(!state.finishedAt){
  state.finishedAt=Date.now();
  state.finishedMoves=state.moves;
 }
 state.level=backpackLevels.length;
 state.done=true;
}
function snapshot(state){
 const {undo,message,...board}=attemptOf(state);
 return JSON.parse(JSON.stringify(board));
}
function applyBackpackAction(state,action,legacy=false){
 if(!action||typeof action!=='object')return false;
 if(action.type==='level'){
  if(legacy||!Number.isInteger(action.index)||action.index<0||action.index>state.unlocked||action.index===state.level)return false;
  openLevel(state,action.index);
 }else if(action.type==='summary'){
  if(legacy||state.done||!state.finishedAt)return false;
  showSummary(state);
 }else if(state.done)return false;
 else if(action.type==='reset-level'){
  if(legacy)return false;
  Object.assign(state,levelAttempt(state.level,'Poziom rozpoczęty od nowa.'));
 }else if(action.type==='next'){
  if(!state.solved)return false;
  if(state.level===backpackLevels.length-1)showSummary(state);
  else openLevel(state,state.level+1);
 }else if(action.type==='undo'){
  const previous=state.undo.pop();
  if(!previous)return false;
  Object.assign(state,previous.board,{message:'Cofnięto ostatni ruch.'});
  state.moves-=previous.moves;
  state.used-=previous.used;
 }else{
  const before=snapshot(state),moves=state.moves,used=state.used;
  if(!execute(state,action))return false;
  // Old saves can contain additional lever placements after the pattern was already correct.
  const level=backpackLevels[state.level];
  if(legacy&&level.kind==='logic'&&state.solved&&level.switches.some(index=>state.placed[index]!=='lever')){
   state.solved=state.on=false;
   state.message='Dobrze! Obserwuj zmianę na planszy.';
  }
  markCompletion(state);
  if(action.type!=='select'&&JSON.stringify(before)!==JSON.stringify(snapshot(state))){
   if(!state.startedAt)state.startedAt=Date.now();
   state.undo.push({board:before,moves:state.moves-moves,used:state.used-used});
  }
 }
 state.log.push({type:action.type,...(action.item?{item:action.item}:{}),...(action.free===true?{free:true}:{}),...(Number.isInteger(action.index)?{index:action.index}:{})});return true;
}
export function backpackAction(state,action){return applyBackpackAction(state,action);}

function upgradeCurrentLogicAttempt(state){
 const level=backpackLevels[state.level];
 if(level?.kind!=='logic'||state.solved||!logicSolved(level,state))return;
 state.solved=state.on=true;
 state.message='Wyzwanie ukończone!';
 markCompletion(state);
}
// Rebuild from accepted actions, never trust inventory/solved flags from storage.
export function restoreBackpack(raw){
 const s=createBackpackState();try{
  const data=typeof raw==='string'?JSON.parse(raw):raw;
  if(![1,2].includes(data?.version)||!Array.isArray(data.log)||(data.version===1&&data.log.length>10000))return s;
  const legacyActions=data.version===1?data.log.length:data.legacyActions??0;
  if(!Number.isInteger(legacyActions)||legacyActions<0||legacyActions>data.log.length)return s;
  s.legacyActions=legacyActions;
  for(let index=0;index<data.log.length;index++){
   if(index===legacyActions&&legacyActions)upgradeCurrentLogicAttempt(s);
   let action=data.log[index];
   // Old summaries return to the extension available after level 30.
   if(!data.campaignLength&&action?.type==='summary'&&s.unlocked===30&&!s.finishedAt)action={type:'level',index:30};
   if(!applyBackpackAction(s,action,index<legacyActions))return createBackpackState();
  }
  if(legacyActions&&legacyActions===data.log.length)upgradeCurrentLogicAttempt(s);
  if(s.startedAt&&Number.isFinite(data.startedAt)&&data.startedAt>0&&data.startedAt<=Date.now())s.startedAt=data.startedAt;
  if(s.finishedAt&&Number.isFinite(data.finishedAt)&&data.finishedAt>=s.startedAt&&data.finishedAt<=Date.now())s.finishedAt=data.finishedAt;
 }catch{return createBackpackState();}return s;
}
export function saveBackpack(state){return JSON.stringify({version:2,campaignLength:backpackLevels.length,log:state.log,legacyActions:state.legacyActions,startedAt:state.startedAt,finishedAt:state.finishedAt});}
