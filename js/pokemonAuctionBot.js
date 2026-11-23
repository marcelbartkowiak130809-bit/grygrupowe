import { advancedAttack, auctionBattleDamage, auctionBattlePokemon, auctionDuelTactics } from "./pokemonAuctionBattle.js?v=20261123-10";

const approaches = {
  easy: { matchup:0, coverage:0, noise:.38, reserve:.12 },
  normal: { matchup:.34, coverage:.22, noise:.20, reserve:.19 },
  hard: { matchup:.56, coverage:.45, noise:.09, reserve:.26 },
  expert: { matchup:.72, coverage:.67, noise:.045, reserve:.32 },
};
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const average = values => values.reduce((total,value)=>total+value,0)/Math.max(1,values.length);
const roster = (game,uid) => (game.teams?.[uid] || []).map(auctionBattlePokemon).filter(Boolean);

function lotPreference(game,uid,id) {
  let hash = 2166136261;
  for (const char of `${game.siteGameId || game.startedAt || ""}:${game.auctionIndex}:${uid}:${id}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0),16777619);
  }
  return (hash>>>0)/2147483648-1;
}

function attackPressure(from,to,advanced) {
  if (advanced) {
    const maxHp = species => species.id===292 ? 1 : species.stats.hp+75;
    const unit = species => ({id:species.id,hp:maxHp(species),maxHp:maxHp(species)});
    const attacker=unit(from), target=unit(to);
    const hit = move => advancedAttack(attacker,target,move,{duel:true,turn:1},true).damage;
    const best = Math.max(hit("signature"),...auctionDuelTactics(attacker).filter(Boolean).map(hit),hit("basic"));
    return best/target.maxHp;
  }
  const attacker={id:from.id}, target={id:to.id,hp:Infinity};
  const basic = auctionBattleDamage(attacker,target,"basic").damage;
  const signature = auctionBattleDamage(attacker,target,"signature").damage;
  return (.23*basic+.77*Math.max(basic,signature))/(to.stats.hp+44);
}

export function auctionBotBidLimit(game,uid,players,difficulty) {
  const candidate = auctionBattlePokemon(game.items?.[game.auctionIndex]);
  const budget = Math.floor(Number(game.budgets?.[uid]) || 0);
  const own = roster(game,uid);
  const slots = Math.max(0,(Number(game.teamSize) || 6)-own.length);
  if (!candidate || !budget || !slots) return 0;

  const profile = approaches[difficulty] || approaches.normal;
  const upcoming = Math.max(1,game.items.length-game.auctionIndex);
  const urgency = clamp(slots/upcoming,0,1);
  const worth = .66+(candidate.bst-400)/340;
  let fit = 0;
  if (game.battleAfterAuction && profile.matchup) {
    const opponents = players.filter(player=>player!==uid).flatMap(player=>roster(game,player));
    const advanced = game.battleRules?.advancedAbilities === true;
    const matchups = opponents.map(target=>{
      const against = attackPressure(candidate,target,advanced);
      const threat = attackPressure(target,candidate,advanced);
      const covered = Math.max(0,...own.map(member=>attackPressure(member,target,advanced)));
      return {
        matchup:clamp((against-threat)*2.1,-.7,.85),
        coverage:clamp((against-Math.max(.25,covered))*1.5,-.18,.68),
      };
    });
    const repeatsType = own.some(member=>member.signature[1]===candidate.signature[1]);
    const variety = own.length ? (repeatsType ? -.16 : .15) : 0;
    fit = profile.matchup*average(matchups.map(item=>item.matchup))+
      profile.coverage*(average(matchups.map(item=>item.coverage))+variety);
  }
  const preference = lotPreference(game,uid,candidate.id)*profile.noise;
  const fundsPerSlot = budget/slots;
  const reserve = Math.min(budget-1,(slots-1)*Math.max(1,Math.floor(fundsPerSlot*profile.reserve*(1-urgency))));
  const value = worth+fit+preference;
  if (urgency<.6 && value < (game.battleAfterAuction ? .37 : .29)) return 0;
  const offer = Math.max(1,Math.floor(fundsPerSlot*(value+urgency*.27)));
  return Math.max(0,Math.min(budget-reserve,offer));
}
