const styles = {
  steel: ['#e6eeff','✦','slash'], rush: ['#ffe0a0','➤','arrow'],
  thunder: ['#d9d4ff','ϟ','spark'], purple: ['#df9bfa','✧','spiral'],
  shield: ['#93e9ff','◇','ward'], powder: ['#ffb578','✹','burst'],
  royal: ['#ffe198','✥','ward'], sun: ['#fff0a5','✺','bloom'],
  stone: ['#e5b587','◆','burst'], wing: ['#f8dfaf','✶','spiral'],
  arrow: ['#d8efab','➶','arrow'], thorn: ['#91e88f','✶','slash'],
  slime: ['#abff80','●','bubble'], fire: ['#ff8d55','✹','comet'],
  spores: ['#efcfa7','·','bloom'], fox: ['#ffa873','✦','rush'],
  acorn: ['#e2bf7d','◆','burst'], claw: ['#c5ecff','✦','claw'],
  leaf: ['#9fe771','✿','bloom'], poison: ['#b795ff','●','bubble'],
  frost: ['#a7eaff','❄','shards'], prism: ['#e4b8ff','✦','spark'],
  wind: ['#bbffe5','↬','spiral'], bubble: ['#a8f5ff','○','bubble'],
  page: ['#e8d8ae','▫','flutter'], ghost: ['#b2efff','✧','haze'],
  lantern: ['#ffdc83','✦','bloom'], crystal: ['#eca3ff','◇','shards'],
  river: ['#86d8ff','◌','surge'], fur: ['#c1e9fc','✵','burst'],
  pearl: ['#ccfcf2','◈','ward'], moon: ['#f0e0ff','☾','bloom'],
  hail: ['#d1ecff','❄','rain'], quake: ['#ebbb90','◆','crack'],
  rain: ['#91ffc7','✿','rain'], fog: ['#d2e4e9','·','haze'],
  trap: ['#ffc980','✶','claw'], gust: ['#bcffe0','↬','spiral'],
  cleanse: ['#93e4ff','⋄','rain'], horn: ['#ffcf91','➤','rush'],
  portal: ['#f5abff','◇','spiral'], camp: ['#ffbb73','✹','bloom'],
  meteor: ['#ffa189','✵','comet'], barrier: ['#a5ffe1','◈','ward'],
  boulder: ['#e5c39d','◆','crack'], bolt: ['#fff1a6','ϟ','spark'],
  golem: ['#c9bfa1','▣','crack'], phoenix: ['#ffcf74','✵','spiral'],
  wyvern: ['#ff7568','✷','surge'], vines: ['#7dec62','❧','spiral'],
  egg: ['#ffb16c','◉','bloom'], mini: ['#ceff9a','•','bubble'],
};

export const cardStyles = {
  knight:'steel', lancer:'thunder', duelist:'purple', guard:'shield', runner:'rush',
  sapper:'powder', marshal:'royal', paladin:'sun', dwarf:'stone', griffin:'wing',
  archer:'arrow', ranger:'thorn', slime:'slime', golem:'golem', phoenix:'phoenix',
  mushroom:'spores', fox:'fox', squirrel:'acorn', wolf:'claw', ent:'leaf',
  witch:'poison', frost:'frost', ember:'fire', elemental:'prism', sprite:'wind',
  bubble:'bubble', owl:'page', wyvern:'wyvern', ghost:'ghost', spirit:'lantern',
  spider:'crystal', otter:'river', mammoth:'fur', turtle:'pearl', unicorn:'moon',
  hail:'hail', quake:'quake', rain:'rain', fog:'fog', trap:'trap', gust:'gust',
  cleanse:'cleanse', order:'horn', portal:'portal', camp:'camp', thorns:'vines',
  meteor:'meteor', barrier:'barrier', boulder:'boulder', bolt:'bolt', mini:'mini', egg:'egg',
};

const elementStyles = {fire:'fire',ice:'frost',wind:'wind'};
export function cardEffect(id,element) {
  const [color,glyph,motion] = styles[elementStyles[element] || cardStyles[id]];
  return {color,glyph,motion};
}

export const soundUrl = name => `/assets/fronts/sfx/${name}.wav`;

function place(node,point) {
  node.style.left = point.x+'px';
  node.style.top = point.y+'px';
}

export function burst(layer,point,style,phase,delay=0) {
  const burstNode = document.createElement('span');
  burstNode.className = 'tf-fx-burst';
  burstNode.dataset.shape = style.motion;
  burstNode.dataset.phase = phase;
  burstNode.style.setProperty('--fx-color',style.color);
  burstNode.style.setProperty('--fx-delay',delay+'ms');
  place(burstNode,point);
  const ring = document.createElement('i');
  ring.className = 'tf-fx-ring';
  burstNode.append(ring);
  const count = phase === 'spell' ? 12 : 8;
  for (let i=0;i<count;i++) {
    const spark = document.createElement('i');
    const angle = (i/count)*2*Math.PI;
    spark.className = 'tf-fx-spark';
    spark.textContent = style.glyph;
    spark.style.setProperty('--dx',Math.round(Math.cos(angle)*(35+i%3*9))+'px');
    spark.style.setProperty('--dy',Math.round(Math.sin(angle)*(32+i%4*7))+'px');
    spark.style.setProperty('--spin',((i%2?1:-1)*(i+2)*13)+'deg');
    spark.style.animationDelay = delay+i*13+'ms';
    burstNode.append(spark);
  }
  layer.append(burstNode);
  setTimeout(()=>burstNode.remove(),850+delay);
}

export function strike(layer,start,end,style) {
  const trace = document.createElement('i');
  trace.className = 'tf-fx-strike';
  trace.dataset.shape = style.motion;
  trace.textContent = style.glyph;
  trace.style.setProperty('--fx-color',style.color);
  trace.style.setProperty('--dx',(end.x-start.x)+'px');
  trace.style.setProperty('--dy',(end.y-start.y)+'px');
  trace.style.setProperty('--heading',Math.atan2(end.y-start.y,end.x-start.x)+'rad');
  place(trace,start);
  layer.append(trace);
  setTimeout(()=>trace.remove(),380);
  burst(layer,end,style,'attack',165);
}
