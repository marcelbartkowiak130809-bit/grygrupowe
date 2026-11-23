const profiles = {
  easy: { deviation:.63, time:[.26,.65] },
  normal: { deviation:.28, time:[.32,.69] },
  hard: { deviation:.105, time:[.36,.73] },
  expert: { deviation:.048, time:[.42,.77] },
};
const profileFor = difficulty => profiles[difficulty] || profiles.normal;
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const average = values => values.reduce((sum,value) => sum+value,0)/values.length;

function randomStream(key) {
  let state = 2166136261;
  for (const character of key) state = Math.imul(state ^ character.charCodeAt(0),16777619);
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ state>>>15,state | 1);
    value ^= value + Math.imul(value ^ value>>>7,value | 61);
    return ((value ^ value>>>14)>>>0)/4294967296;
  };
}

export function chartForecastBotDueAt(game,uid,difficulty) {
  const duration = (game.chartTime || 45)*1000;
  const [early,late] = profileFor(difficulty).time;
  const jitter = randomStream(`${game.siteGameId || game.phaseEndsAt}:${game.round}:${uid}:timing`)();
  return Math.round(game.phaseEndsAt-duration+duration*(early+(late-early)*jitter));
}

function slope(history,span) {
  const width = Math.min(span,history.length-1);
  return (history.at(-1)-history.at(-1-width))/width;
}

const models = [
  history => history.at(-1),
  (history,step) => history.at(-1)+(average(history.slice(-4))-history.at(-1))*(1-.68**step),
  (history,step) => history.at(-1)+slope(history,3)*Math.min(step,1.9+step*.37),
  (history,step) => history.at(-1)+slope(history,history.length)*step,
];

function validatedWeights(history) {
  const errors = models.map(() => 0);
  let tests = 0;
  for (let end=Math.max(3,history.length-8);end<history.length;end++) {
    const past=history.slice(0,end);
    for (let step=1;step<=Math.min(3,history.length-end);step++) {
      models.forEach((model,index) => { errors[index]+=Math.abs(model(past,step)-history[end+step-1]); });
      tests++;
    }
  }
  const weights = errors.map(error => 1/(.035+error/Math.max(1,tests))**2);
  const total = weights.reduce((sum,value) => sum+value,0);
  return weights.map(value => value/total);
}

// Models receive the visible history and axis limits only.
export function chartForecastBotLine({history,horizon,scale,unit=""},difficulty,key) {
  const [min,max] = scale, span = max-min;
  const visible = history.map(value => (value-min)/span);
  const random = randomStream(key);
  const signed = () => random()*2-1;
  const {deviation} = profileFor(difficulty);
  const easyTrend = signed();
  const bias = signed()*deviation;
  const bend = signed()*deviation*.68;
  const phase = signed()*1.35;
  const weights = difficulty==="expert" ? validatedWeights(visible) : null;
  const last = visible.at(-1), peak = Math.max(...visible);
  const popularity = unit.includes("odsłon");
  const pastSpike = popularity && peak>.61 && (
    last<peak*.8 || (visible.at(-2)<last*.69 && visible[0]<peak*.43)
  );
  const floor = Math.min(...visible)*.7;
  const spikeTime = .48+signed()*.25;
  let wander = 0;
  return Array.from({length:horizon},(_,index) => {
    const step=index+1, progress=step/horizon;
    let baseline = difficulty==="easy" ? last+slope(visible,2)*step*easyTrend
      : difficulty==="hard" ? models[0](visible)*.22+models[2](visible,step)*.5+models[3](visible,step)*.28
      : weights ? models.reduce((sum,model,modelIndex) => sum+weights[modelIndex]*model(visible,step),0)
      : models[0](visible)*.56+models[2](visible,step)*.44;
    if (weights && pastSpike) baseline=floor+(last-floor)*.59**step;
    else if (weights && popularity && peak<.22) {
      const bump = Math.exp(-((progress-spikeTime)**2)/.055);
      baseline = last + bump*(.24+.1*easyTrend) + .05*progress;
    } else if (difficulty==="hard" && pastSpike) {
      baseline = baseline*.3+(floor+(last-floor)*.70**step)*.7;
    }
    wander=.63*wander+signed()*deviation*.26;
    const drift = Math.sqrt(progress)*(bias + bend*Math.sin(Math.PI*progress+phase) + wander);
    return min+span*clamp(baseline+drift,.0001,.9999);
  });
}
