import assert from "node:assert/strict";
import test from "node:test";
import { applyChartForecastAction, chartForecastSettings, createChartForecastGame, currentForecastChart, scoreChartForecast } from "../js/chartForecast.js";
import { drawForecastSegment } from "../js/chartForecastCanvas.js";
import { chartForecastData } from "../js/chartForecastData.js";

const players=["a","b"];
const start=10_000;
const make = () => createChartForecastGame(players,{rounds:3,chartTime:30},start);

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
