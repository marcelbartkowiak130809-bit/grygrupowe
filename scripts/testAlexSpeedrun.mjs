import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ALEX_COOLDOWN,alexClock,alexSpeedrunUpdate} from '../js/alexSpeedrunState.js';

const id = 'one-valid-run-identifier';
const another = 'second-valid-run-identifier';
const epoch = 1_795_000_000_000;
const action = (record,type,chapter,now,runId=id) =>
  alexSpeedrunUpdate(record,{type,id:runId,chapter},now,now,'AlexFan');

test('cooldown is per player from reservation, even if no chapter is started',()=>{
  const initial = action(null,'reserve',1,epoch);
  assert.ok(initial);
  assert.equal(action(initial,'reserve',1,epoch+ALEX_COOLDOWN-1,another),undefined);
  assert.equal(action(initial,'reserve',1,epoch+ALEX_COOLDOWN,id),undefined);
  assert.equal(action(initial,'reserve',1,epoch+ALEX_COOLDOWN,another).run.id,another);
});

test('the clocks run in order and the total comes from one attempt',()=>{
  function finishRun(record, stamp, runId, times) {
    record = action(record,'reserve',1,stamp,runId);
    assert.equal(action(record,'begin',2,stamp,runId),undefined);
    for (const [index,time] of times.entries()) {
      const chapter = index+1;
      const start = stamp+(index+1)*36_000;
      record = action(record,'begin',chapter,start,runId);
      assert.equal(action(record,'publish',chapter,start,runId),undefined);
      record = action(record,'finish',chapter,start+time,runId);
      record = action(record,'publish',chapter,start+time+999,runId);
      assert.equal(record.run.step,chapter*3);
    }
    return record;
  }
  const first = finishRun(null,epoch,id,[12_500,19_000,6_000]);
  assert.deepEqual(first.best,{chapter1:12_500,chapter2:19_000,chapter3:6_000,total:37_500});
  const second = finishRun(first,epoch+ALEX_COOLDOWN,another,[18_000,11_000,9_000]);
  assert.deepEqual(second.best,{chapter1:12_500,chapter2:11_000,chapter3:6_000,total:37_500});
  assert.equal(action(second,'finish',3,epoch+ALEX_COOLDOWN+200000),undefined);
  assert.equal(alexClock(37_510),'0:37,51');
});
