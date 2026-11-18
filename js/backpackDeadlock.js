// One batch per recipe. Only recipes that can supply a mandatory objective are included.
const recipes = {
 oak_planks: [4, {oak_log: 1}],
 stick: [4, {oak_planks: 2}],
 torch: [4, {stick: 1, coal: 1}],
 lever: [1, {stick: 1, cobblestone: 1}],
 wooden_hoe: [1, {oak_planks: 2, stick: 2}],
 wooden_pickaxe: [1, {oak_planks: 3, stick: 2}],
 stone_pickaxe: [1, {cobblestone: 3, stick: 2}],
 iron_pickaxe: [1, {iron_ingot: 3, stick: 2}],
 bucket: [1, {iron_ingot: 3}],
 flint_and_steel: [1, {iron_ingot: 1, flint: 1}],
 bow: [1, {stick: 3, string: 3}],
 arrow: [4, {flint: 1, stick: 1, feather: 1}],
 glistering_melon_slice: [1, {melon_slice: 1, gold_nugget: 8}],
 beacon: [1, {glass: 5, nether_star: 1, obsidian: 3}],
 conduit: [1, {heart_of_the_sea: 1, nautilus_shell: 8}],
 blue_stained_glass: [8, {blue_dye: 1, glass: 8}],
 red_stained_glass: [8, {red_dye: 1, glass: 8}],
 piston: [1, {oak_planks: 3, cobblestone: 4, iron_ingot: 1, redstone: 1}],
 brush: [1, {feather: 1, copper_ingot: 1, stick: 1}],
 decorated_pot: [1, {brick: 4}],
 shears: [1, {iron_ingot: 2}],
 red_wool: [1, {white_wool: 1, red_dye: 1}],
 blue_wool: [1, {white_wool: 1, blue_dye: 1}],
 yellow_wool: [1, {white_wool: 1, yellow_dye: 1}],
 compass: [1, {iron_ingot: 4, redstone: 1}],
 map: [1, {compass: 1, paper: 8}],
 cake: [1, {milk_bucket: 3, sugar: 2, egg: 1, wheat: 3}],
 oak_slab: [6, {oak_planks: 3}],
 composter: [1, {oak_slab: 7}],
 ender_eye: [1, {ender_pearl: 1, blaze_powder: 1}],
 diamond_chestplate: [1, {diamond: 8}],
};

function canSupply(stock, required) {
 const remaining = {...stock};
 const take = (item, count) => {
  if (count < 1) return true;
  const shortfall = count - (remaining[item] || 0);
  if (shortfall <= 0) {
   remaining[item] -= count;
   return true;
  }
  const recipe = recipes[item];
  if (!recipe) return false;
  const [output, inputs] = recipe;
  const batches = Math.ceil(shortfall / output);
  remaining[item] = batches * output - shortfall;
  return Object.entries(inputs).every(([ingredient, amount]) => take(ingredient, amount * batches));
 };
 return Object.entries(required).every(([item, count]) => take(item, count));
}

function deepShortage(level, state, stock) {
 const pending = level.steps.filter(step => !state.puzzle.stations?.[step.id]);
 const supply = {...stock};
 const required = {lever: (level.switches || []).filter((_, i) => state.puzzle.switches?.[i] === undefined).length};
 for (const step of pending) {
  for (const [item, count] of Object.entries(step.take || {})) required[item] = (required[item] || 0) + count;
  for (const [item, count] of Object.entries(step.give || {})) supply[item] = (supply[item] || 0) + count;
 }
 // Stations count as potential suppliers, even if their signal or route is currently blocked.
 if (!canSupply(supply, required)) return true;

 // Check that outputs aren't their own only source, e.g. stations that exchange empty and filled buckets.
 const available = {...stock};
 const reachable = {...stock};
 const finished = new Set(Object.keys(state.puzzle.stations || {}));
 let changed;
 do {
  changed = false;
  for (const [item, [output, inputs]] of Object.entries(recipes)) {
   const batches = Math.min(...Object.entries(inputs).map(([id, count]) => Math.floor((reachable[id] || 0) / count)));
   const count = (available[item] || 0) + batches * output;
   if (count > (reachable[item] || 0)) {
    reachable[item] = count;
    changed = true;
   }
  }
  for (const step of pending) {
   if (!finished.has(step.id) && (step.after || []).every(id => finished.has(id)) &&
       (!step.tool || reachable[step.tool] > 0) &&
       Object.entries(step.take || {}).every(([id, count]) => reachable[id] >= count)) {
    finished.add(step.id);
    changed = true;
    for (const [item, count] of Object.entries(step.give || {})) {
     available[item] = (available[item] || 0) + count;
     reachable[item] = (reachable[item] || 0) + count;
    }
   }
  }
 } while (changed);
 return pending.some(step => !finished.has(step.id));
}

export function backpackNeedsReset(level, state) {
 if (state.solved || state.done) return false;
 const p = state.puzzle;
 // The crafting grid and ordinary placements can be recovered without a reset.
 const stock = {...state.stock};
 for (const item of [...state.grid, ...Object.values(state.placed)]) {
  if (item) stock[item] = (stock[item] || 0) + 1;
 }
 const short = required => !canSupply(stock, required);
 switch (level.kind || level.theme) {
  case 'deep': return deepShortage(level, state, stock);
  case 'lava': return short({oak_planks: level.end - level.start - 1 - (stock.cobblestone || 0)});
  case 'cave': return short({torch: level.targets.length});
  case 'circuit': return short({lever: 1});
  case 'farm': return (p.tilled?.length || 0) < level.plots.length && short({wooden_hoe: 1});
  case 'forge': return p.smelted ? short({bucket: 1}) : !p.fuel && short({coal: 1});
  case 'portal': return short({flint_and_steel: 1});
  case 'mine': {
   const unmined = cells => cells.filter(cell => !p.mined?.includes(cell)).length;
   const oreLeft = unmined(level.ores);
   stock.cobblestone = (stock.cobblestone || 0) + unmined(level.stones);
   if (!p.smelted) stock.iron_ingot = (stock.iron_ingot || 0) + 3;
   return short({
    iron_pickaxe: 1,
    stone_pickaxe: oreLeft && !stock.iron_pickaxe ? 1 : 0,
    wooden_pickaxe: unmined(level.stones) && oreLeft && !stock.stone_pickaxe && !stock.iron_pickaxe ? 1 : 0,
    coal: !p.smelted && !p.fuel && !state.stock.iron_pickaxe ? 1 : 0,
   });
  }
  case 'archery': return short({bow: 1, arrow: level.targets.length - (p.hits?.length || 0)});
  case 'hopper': return short({iron_ingot: 1});
  case 'demolition': return short({tnt: 1});
  case 'beacon': return short({beacon: 1, blue_stained_glass: 1});
  case 'pistons': return short({piston: level.controls.length});
  case 'archaeology': {
   const sites = level.sites.filter(cell => p.brushed?.[cell] !== 2).length;
   stock.brick = (stock.brick || 0) + sites;
   return short({brush: Number(sites > 0), decorated_pot: 1});
  }
  case 'wool': {
   const woolLeft = level.sources.length - (p.sheared?.length || 0);
   stock.white_wool = (stock.white_wool || 0) + woolLeft;
   return short({shears: Number(woolLeft > 0), red_wool: 1, blue_wool: 1, yellow_wool: 1});
  }
  case 'treasure': return !p.mapped && short({map: 1});
  case 'compost': return short({composter: 1});
  case 'copper': return level.blocks.some((cell, i) => (p.ages?.[cell] ?? 3) < level.ages[i]);
  default: return false;
 }
}
