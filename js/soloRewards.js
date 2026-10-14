export const SOLO_DAILY_COINS=120;
export function soloRewardOffer(mode,state){
  if(mode==='playlista-cup'){
    if(state?.status!=='done'||!state.session||!state.winnerId||state.history?.length!==state.tracks?.length-1)return null;
    const amount=Math.min(30,Math.floor(Math.max(0,Number(state.listenedSeconds)||0)/30));
    return amount?{key:`cup:${state.session}`,amount}:null;
  }
  const result=state?.lastResult;if(!result?.correct||!['reveal','over'].includes(state.status))return null;
  if(mode==='songspot'&&result.trackId)return {key:`songspot:${result.trackId}`,amount:state.rankedRun?2:1};
  if(mode==='popularnosc-solo'&&result.pair?.length===2)return {key:`popularity:${result.metric}:${result.pair.map(t=>t.id).sort().join(':')}`,amount:1};
  if(mode==='dokoncz-tekst'&&state.lyricId)return {key:`lyrics:${state.lyricId}`,amount:2};
  return null;
}
export function claimSoloReward(storage,uid,mode,state,now=Date.now()){
  const offer=soloRewardOffer(mode,state);if(!uid||!offer)return 0;
  const key=`grygrupowe-solo-coins-v1:${uid}`,day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw'}).format(new Date(now));
  let record={day,total:0,claims:{},cups:{},lastAt:0};
  try{const saved=JSON.parse(storage.getItem(key)||'null');if(saved?.day===day)record=saved;else if(saved?.cups)record.cups=saved.cups;}catch{}
  if(mode==='playlista-cup'&&record.cups?.[offer.key])return 0;
  if(record.claims?.[offer.key]||now-Number(record.lastAt||0)<2000)return 0;
  const amount=Math.min(offer.amount,Math.max(0,SOLO_DAILY_COINS-(Number(record.total)||0)));if(!amount)return 0;
  record={...record,total:(Number(record.total)||0)+amount,lastAt:now,claims:{...record.claims,[offer.key]:amount},cups:mode==='playlista-cup'?{...record.cups,[offer.key]:amount}:record.cups||{}};
  // Record before payout: repeated clicks/renders and reloads cannot claim twice.
  try{storage.setItem(key,JSON.stringify(record));}catch{return 0;}
  return amount;
}
