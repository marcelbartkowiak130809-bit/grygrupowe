import { chartForecastData } from "./chartForecastData.js?v=20261121-15";

export const chartForecastMode = "dorysuj-wykres";
export const chartForecastDefaults = { rounds:5, chartTime:45 };
export const chartRoundOptions = [3,5,7];
export const chartTimeOptions = [30,45,60];
const charts = new Map(chartForecastData.map(chart => [chart.id,chart]));

export function chartForecastSettings(raw = {}) {
  const rounds = Number(raw.rounds), chartTime = Number(raw.chartTime);
  return {
    rounds:chartRoundOptions.includes(rounds) ? rounds : chartForecastDefaults.rounds,
    chartTime:chartTimeOptions.includes(chartTime) ? chartTime : chartForecastDefaults.chartTime,
  };
}

export const currentForecastChart = game => charts.get(game.chartIds?.[game.round-1]);
export const forecastPlayers = (game, roomPlayers) => game.players.filter(uid => roomPlayers.includes(uid));

export function createChartForecastGame(players, settings, now) {
  const {rounds,chartTime}=chartForecastSettings(settings);
  const chartIds=[...charts.keys()];
  for (let index=0; index<rounds; index++) {
    const swap=index+Math.floor(Math.random()*(chartIds.length-index));
    [chartIds[swap],chartIds[index]]=[chartIds[index],chartIds[swap]];
  }
  return {
    mode:chartForecastMode, phase:"chart-draw", players:[...new Set(players)], round:1, chartTime,
    chartIds:chartIds.slice(0,rounds), phaseEndsAt:now+chartTime*1000, forecasts:{},
    chartRounds:[], scores:Object.fromEntries(players.map(uid=>[uid,0])),
  };
}

const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const rounded = (value,places) => Math.round(value*10**places)/10**places;

export function scoreChartForecast(chart, forecast) {
  const actual=chart.values.slice(chart.cut+1);
  if (!Array.isArray(forecast) || forecast.length!==actual.length || !forecast.every(Number.isFinite)) {
    return { accuracy:0, miss:null };
  }
  const miss=actual.reduce((sum,value,index)=>sum+Math.abs(value-forecast[index]),0)/actual.length;
  const accuracy=100*clamp(1-miss/((chart.scale[1]-chart.scale[0])*.4),0,1);
  return { accuracy:rounded(accuracy,1), miss:rounded(miss,3) };
}

function revealForecasts(game, now) {
  const chart=currentForecastChart(game);
  const rows=Object.fromEntries(game.players.map(uid=>{
    const forecast=game.forecasts?.[uid];
    return [uid,{...scoreChartForecast(chart,forecast), ...(forecast?{forecast}:{})}];
  }));
  const previous=Array.isArray(game.chartRounds)?game.chartRounds:[];
  game.chartRounds=[...previous,{chartId:chart.id,rows}];
  game.scores=Object.fromEntries(game.players.map(uid=>[
    uid,rounded(game.chartRounds.reduce((sum,round)=>sum+(round.rows?.[uid]?.accuracy||0),0)/game.chartRounds.length,1),
  ]));
  game.phase="chart-reveal";
  game.phaseEndsAt=now+18_000;
}

export function applyChartForecastAction(game, uid, action, payload, roomPlayers, now) {
  const active=forecastPlayers(game,roomPlayers);
  if (!active.includes(uid)) return "Nie bierzesz udziału w tej partii.";
  if (action==="submit") {
    if(game.phase!=="chart-draw" || now>=game.phaseEndsAt) return "Czas na prognozę już minął.";
    game.forecasts ||= {};
    if(Object.hasOwn(game.forecasts,uid)) return "Twoja prognoza jest już zapisana.";
    const chart=currentForecastChart(game), [min,max]=chart.scale;
    const count=chart.values.length-chart.cut-1;
    if (!Array.isArray(payload) || payload.length!==count || !payload.every(value=>Number.isFinite(value)&&value>=min&&value<=max)) {
      return "Dorysuj wykres do końca osi.";
    }
    game.forecasts[uid]=payload.map(value=>rounded(value,4));
    if(active.every(player=>Object.hasOwn(game.forecasts,player))) revealForecasts(game,now);
    return;
  }
  if (action==="timeout") {
    if(game.phase==="chart-draw" && (now>=game.phaseEndsAt || active.every(player=>Object.hasOwn(game.forecasts||{},player)))) {
      revealForecasts(game,now);
    }
    return;
  }
  if (action!=="next" || game.phase!=="chart-reveal") return "Ta runda już się zmieniła.";
  if(game.round>=game.chartIds.length) {
    const best=Math.max(0,...active.map(id=>game.scores[id]||0));
    const submitted=game.chartRounds.some(round=>active.some(id=>Array.isArray(round.rows?.[id]?.forecast)));
    game.winners=submitted?active.filter(id=>game.scores[id]===best):[];
    game.finished=true;
    game.phase="result";
    game.phaseEndsAt=0;
    return;
  }
  game.round+=1;
  game.forecasts={};
  game.phase="chart-draw";
  game.phaseEndsAt=now+game.chartTime*1000;
}
