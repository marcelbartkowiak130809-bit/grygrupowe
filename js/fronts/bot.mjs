import {cardById} from './cards.mjs?v=5';
import {applyAction,legalActions} from './engine.mjs?v=5';

function value(state,side) {
  const player = state.players[side];
  const exposed = !Object.keys(state.players[1-side].board).length;
  return player.hp*1.4 + player.hand.length*.7 + Object.values(player.board).reduce((sum,unit) => {
    const card = cardById[unit.card];
    const shield = (unit.shield || 0)+(unit.temporaryShield || 0);
    return sum+1+card.attack*.85+unit.hp*.51+shield*.38+(exposed ? card.attack*.3 : 0)
      -(unit.poison ? .35 : 0)-(unit.freezeUntil > state.turn ? .8 : 0);
  },0) + (player.trapped ? 1.35 : 0)+(player.thornsUntil > state.turn ? .75 : 0);
}

export function botMove(state,side,now,random=Math.random) {
  if (state.players[side].pendingDraw) return {type:'draw'};
  const score = match => value(match,side)-value(match,1-side);
  const baseline = score(state);
  let best = {type:'end'};
  let max = .12;
  for (const action of legalActions(state,side)) {
    if (action.type === 'end') continue;
    const result = applyAction(state,side,action,now);
    if (!result) continue;
    const cost = state.players[side].energy-result.players[side].energy;
    const rank = result.phase === 'finished' ? result.winner === side ? 100 : -100 :
      score(result)-baseline-cost*.43+random()*.2+(action.type === 'attack' ? .25 : 0);
    if (rank > max) {
      max = rank;
      best = action;
    }
  }
  return best;
}
