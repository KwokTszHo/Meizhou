import {test} from 'node:test';import assert from 'node:assert/strict';
import {calculate,defaults,forceBreakdown,stabilityState} from '../dist/model.js';
test('reproduces every reported original-paper stage at two decimals',()=>{
  assert.deepEqual([0,1,2,3].map(s=>calculate(s).fs.toFixed(2)),['1.76','1.25','0.92','0.38']);
});
test('zero vehicle load in high-traffic stage recovers low-traffic stage',()=>assert.ok(Math.abs(calculate(2,{load:0}).fs-calculate(1).fs)<1e-12));
test('seepage expression reduces to high-traffic expression when water unit weight is zero',()=>assert.ok(Math.abs(calculate(3,{gammaWater:0}).fs-calculate(2).fs)<1e-12));
test('cohesion acts only in original construction stage',()=>{assert.ok(calculate(0,{cohesion:35}).fs>calculate(0).fs);assert.equal(calculate(2,{cohesion:35}).fs,calculate(2).fs);});
test('resistance and driving components reproduce Fs and reject invalid geometry',()=>{for(let s=0;s<4;s++)assert.equal(calculate(s).fs,calculate(s).resistance/calculate(s).driving);assert.throws(()=>calculate(0,{beta:0}),RangeError);assert.throws(()=>calculate(4),RangeError);assert.throws(()=>calculate(0,{load:NaN}),TypeError);});
test('displayed force terms sum to the exact resistance for every stage and changed inputs',()=>{for(let s=0;s<4;s++)for(const p of[{}, {phi:35,beta:30,load:3000,cohesion:32}]){const b=forceBreakdown(s,p);assert.ok(Math.abs(b.cohesion+b.friction-b.resistance)<1e-9);assert.ok(Math.abs((b.cohesion+b.friction)/b.driving-b.fs)<1e-12);}});
test('stability messages distinguish equilibrium from stable and unstable models',()=>{assert.equal(stabilityState(calculate(1,{phi:29.6,beta:29.6}).fs).level,'critical');assert.equal(stabilityState(.9998).level,'danger');assert.equal(stabilityState(1.76).level,'stable');});
