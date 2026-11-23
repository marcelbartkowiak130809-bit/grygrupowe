import assert from "node:assert/strict";
import test from "node:test";
import { applyChartForecastAction, chartForecastSettings, createChartForecastGame, currentForecastChart, scoreChartForecast } from "../js/chartForecast.js";
import { drawForecastSegment, forecastPointer } from "../js/chartForecastCanvas.js";
import { chartForecastData } from "../js/chartForecastData.js";
import { chartForecastBotDueAt, chartForecastBotLine } from "../js/chartForecastBot.js";
import { botActor, scheduleBot } from "../js/botController.js";

const players=["a","b"];
const start=10_000;
const make = () => createChartForecastGame(players,{rounds:3,chartTime:30},start);
const levels = ["easy","normal","hard","expert"];

test("forecast bots produce valid, distinct lines from visible information and get stronger by level", () => {
  const means=levels.map(difficulty=>{
    const scores=chartForecastData.flatMap(chart=>Array.from({length:12},(_,index)=>{
      const input={history:chart.values.slice(0,chart.cut+1),horizon:chart.labels.length-chart.cut-1,scale:chart.scale,unit:chart.unit};
      const key=`${chart.id}:${index}`;
      const line=chartForecastBotLine(input,difficulty,key);
      assert.deepEqual(line,chartForecastBotLine(input,difficulty,key));
      const result=scoreChartForecast(chart,line);
      assert.notEqual(result.miss,null);
      assert.ok(result.accuracy<100);
      return result.accuracy;
    }));
    return scores.reduce((sum,value)=>sum+value,0)/scores.length;
  });
  assert.ok(means[0]<40);
  means.slice(1).forEach((value,index)=>assert.ok(value>means[index]+2));
});

test("chart bot deadlines survive room updates and every bot submits once before reveal", async t => {
  let now=100_000;
  t.mock.method(Date,"now",()=>now);
  const bots=levels.map(level=>`bot:${level}`);
  const roomPlayers=["host",...bots];
  const game=createChartForecastGame(roomPlayers,{rounds:3,chartTime:30},now);
  const room={roomId:"CHART",updatedAt:now,hostUid:"host",gameMode:game.mode,game,players:roomPlayers,
    playerProfiles:Object.fromEntries(bots.map((uid,index)=>[uid,{botDifficulty:levels[index]}]))};
  const first=botActor(room);
  const muted=()=>{};
  const options={mutate:mutation=>mutation(game,room),onDone:muted};
  const firstPlan=scheduleBot(room,options);
  assert.ok(firstPlan.delay>=7800);
  const expertDue=chartForecastBotDueAt(game,bots[3],"expert");
  assert.ok(expertDue-now>=12600 && expertDue-now<=23100);
  const chart=currentForecastChart(game);
  applyChartForecastAction(game,"host","submit",chart.values.slice(chart.cut+1),roomPlayers,now+1);
  room.updatedAt+=200;
  assert.equal(scheduleBot(room,options).key,firstPlan.key);
  for (let count=0;count<bots.length;count++){
    const actor=botActor(room);
    const plan=scheduleBot(room,options);
    if(!count) assert.equal(actor,first);
    now+=plan.delay;
    await plan.run();
    assert.ok(Object.hasOwn(game.forecasts,actor));
    assert.equal(Object.keys(game.forecasts).length,count+2);
  }
  assert.equal(game.phase,"chart-reveal");
  assert.equal(scheduleBot(room,options),false);
});

test("verified snapshots are well formed and matches draw distinct charts",()=>{
  assert.equal(new Set(chartForecastData.map(chart=>chart.id)).size,chartForecastData.length);
  assert.ok(chartForecastData.some(chart=>chart.labels[0]==="sty" && chart.labels.at(-1)==="gru"));
  for(const chart of chartForecastData) {
    assert.equal(chart.labels.length,chart.values.length);
    assert.ok(chart.cut>0&&chart.cut<chart.values.length-1);
    assert.ok(chart.values.every(value=>value>=chart.scale[0]&&value<=chart.scale[1]));
    assert.equal(scoreChartForecast(chart,chart.values.slice(chart.cut+1)).accuracy,100);
  }
  assert.deepEqual(chartForecastSettings({rounds:"7",chartTime:"60"}),{rounds:7,chartTime:60});
  assert.equal(new Set(make().chartIds).size,3);
});

test("redrawing interpolates only the covered portion in either direction",()=>{
  const draft=[2];
  drawForecastSegment(draft,{index:0,value:2},{index:5,value:7});
  assert.deepEqual(draft,[2,3,4,5,6,7]);
  drawForecastSegment(draft,{index:3,value:10},{index:1,value:6});
  assert.deepEqual(draft,[2,6,8,10,6,7]);
  drawForecastSegment(draft,{index:1,value:10},{index:0,value:2});
  assert.deepEqual(draft,[2,10,8,10,6,7]);
});

test("submission, expiry, snapshots, three-round average and winner",()=>{
  let game=make();
  const own=(uid,action,data,now=start+1)=>applyChartForecastAction(game,uid,action,data,players,now);
  const truth=()=>{const chart=currentForecastChart(game);return chart.values.slice(chart.cut+1);};
  assert.match(own("a","submit",[]),/końca/);
  assert.match(own("guest","submit",truth()),/udziału/);
  own("a","submit",truth());
  assert.equal(game.phase,"chart-draw");
  assert.match(own("a","submit",truth()),/zapisana/);
  assert.match(own("b","submit",truth(),game.phaseEndsAt),/minął/);
  game=JSON.parse(JSON.stringify(game));
  own("a","timeout",null,game.phaseEndsAt);
  assert.equal(game.phase,"chart-reveal");
  assert.equal(game.chartRounds[0].rows.a.accuracy,100);
  assert.equal(game.chartRounds[0].rows.b.miss,null);
  own("a","next",null,game.phaseEndsAt);
  const nextStart=game.phaseEndsAt-30_000;
  own("a","submit",truth(),nextStart+1);
  own("b","submit",truth(),nextStart+2);
  assert.deepEqual(game.scores,{a:100,b:50});
  own("a","next",null,game.phaseEndsAt);
  own("a","timeout",null,game.phaseEndsAt);
  own("a","next",null,game.phaseEndsAt);
  assert.deepEqual(game.scores,{a:66.7,b:33.3});
  assert.equal(game.finished,true);
  assert.deepEqual(game.winners,["a"]);
});

test("a player who never submitted a forecast cannot share a win on zero points",()=>{
  const game=make();
  const chart=currentForecastChart(game);
  const wrong=chart.values.slice(chart.cut+1).map(value=>
    value>(chart.scale[0]+chart.scale[1])/2?chart.scale[0]:chart.scale[1]);
  assert.equal(scoreChartForecast(chart,wrong).accuracy,0);
  assert.match(applyChartForecastAction(game,"a","submit",new Array(wrong.length),players,start+1),/końca/);
  applyChartForecastAction(game,"a","submit",wrong,players,start+1);
  for(let round=0;round<3;round++){
    applyChartForecastAction(game,"a","timeout",null,players,game.phaseEndsAt);
    applyChartForecastAction(game,"a","next",null,players,game.phaseEndsAt);
  }
  assert.deepEqual(game.scores,{a:0,b:0});
  assert.deepEqual(game.chartRanking,["a"]);
  assert.deepEqual(game.winners,["a"]);
});

test("leaving the room unblocks a round once the remaining players are ready",()=>{
  const group=["a","b","c"];
  const game=createChartForecastGame(group,{rounds:3,chartTime:30},start);
  const chart=currentForecastChart(game);
  for(const uid of players) applyChartForecastAction(game,uid,"submit",chart.values.slice(chart.cut+1),group,start+1);
  applyChartForecastAction(game,"a","timeout",null,group,start+2);
  assert.equal(game.phase,"chart-draw");
  applyChartForecastAction(game,"a","timeout",null,players,start+3);
  assert.equal(game.phase,"chart-reveal");
});

test("the axes and historical data do not accept a new stroke",()=>{
  const chart={values:[2,4,6,8],cut:1,scale:[0,10]};
  const canvas={getBoundingClientRect:()=>({left:0,top:0,width:320,height:300})};
  const point=(clientX,clientY)=>forecastPointer(canvas,chart,{clientX,clientY},4);
  assert.equal(point(50,150).canStart,false);
  assert.equal(point(290,288).canStart,false);
  assert.equal(point(132,140).canStart,true);
  assert.equal(point(132,140).value,4);
  assert.deepEqual(point(450,-50),{index:2,canStart:false,value:10});
});
