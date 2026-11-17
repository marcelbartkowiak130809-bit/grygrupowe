const neighbors=i=>[...(i>=8?[i-8]:[]),...(i<32?[i+8]:[]),...(i%8?[i-1]:[]),...(i%8<7?[i+1]:[])];
export function shelfPower(level,state){
 const tx=level.table%8,ty=Math.floor(level.table/8);
 return Object.entries(state.placed).filter(([key,item])=>{
  if(item!=='bookshelf')return false;const i=Number(key),dx=i%8-tx,dy=Math.floor(i/8)-ty;
  if(Math.max(Math.abs(dx),Math.abs(dy))!==2)return false;
  const gap=level.table+Math.sign(dx)+8*Math.sign(dy);
  return !state.placed[gap];
 }).length;
}
export function railRoute(level,state){
 const queue=[[level.start]],seen=new Set([level.start]);
 while(queue.length){const path=queue.shift(),at=path.at(-1);if(at===level.end)return path;
  for(const i of neighbors(at))if(!seen.has(i)&&['rail','powered_rail'].includes(state.placed[i])){seen.add(i);queue.push([...path,i]);}
 }return [];
}
export function railPowered(level,state,path=railRoute(level,state)){
 return path.some(i=>state.placed[i]==='powered_rail'&&neighbors(i).some(j=>state.placed[j]==='redstone_torch'));
}
export function craftBatchCount(state,recipe){
 if(!recipe)return 0;const counts={};for(const item of state.grid)if(item)counts[item]=(counts[item]||0)+1;
 return Math.min(64,1+Math.min(...Object.entries(counts).map(([id,n])=>Math.floor((state.stock[id]||0)/n))));
}
