'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const input = process.argv[2];
if (!input) throw new Error('Pass path to the target weekly-ranking.cjs');
const { calculateWeeklyRanking: calc } = require(path.resolve(input));
const record = (id, userId, quantity, activityDate = '2026-10-09', status = 'RX_VERIFIED') =>
  ({ id, userId, quantity, activityDate, status });
const monday = '2026-10-05';

test('01 empty group', () => {
  assert.deepEqual(calc([], [], 'ana', monday), {
    ranking:[], position:null, rival:null, rxToOvertake:null,
  });
});

test('02 zero members included, input group IDs deduplicated', () => {
  assert.deepEqual(calc([], ['zoe','ana','ana'], 'ana', monday), {
    ranking:[{userId:'ana',rx:0},{userId:'zoe',rx:0}],
    position:1, rival:null, rxToOvertake:null,
  });
});

test('03 verified Rx only, exact next-rival gap', () => {
  const rows=[record('1','ana',50),record('2','bob',40),record('3','bob',20,'2026-10-09','PERSONAL'),record('4','ana',200,'2026-10-09','VOIDED')];
  assert.deepEqual(calc(rows,['ana','bob'],'bob',monday),{
    ranking:[{userId:'ana',rx:50},{userId:'bob',rx:40}],
    position:2,rival:{userId:'ana',rx:50},rxToOvertake:11,
  });
});

test('04 duplicate record ID counted once', () => {
  assert.deepEqual(calc([record('1','ana',50),record('1','ana',50)],['ana'],'ana',monday).ranking,
    [{userId:'ana',rx:50}]);
});

test('05 nonmember records ignored', () => {
  assert.deepEqual(calc([record('1','outsider',800),record('2','ana',5)],['ana'],'ana',monday).ranking,
    [{userId:'ana',rx:5}]);
});

test('06 calendar Monday and Sunday included, adjacent days excluded', () => {
  const rows=[record('1','ana',10,'2026-10-05'),record('2','ana',20,'2026-10-11'),record('3','ana',100,'2026-10-04'),record('4','ana',100,'2026-10-12')];
  assert.equal(calc(rows,['ana'],'ana',monday).ranking[0].rx,30);
});

test('07 cross-year local week 2026-12-28 to 2027-01-03', () => {
  const rows=[record('1','ana',11,'2026-12-28'),record('2','ana',22,'2027-01-03'),record('3','ana',77,'2027-01-04')];
  assert.equal(calc(rows,['ana'],'ana','2026-12-28').ranking[0].rx,33);
});

test('08 ignore non-Rx states', () => {
  const rows=['PERSONAL','VERIFICATION_PENDING','REJECTED','UNVERIFIED','VOIDED'].map((s,i)=>record('x'+i,'ana',10,'2026-10-09',s));
  assert.equal(calc(rows,['ana'],'ana',monday).ranking[0].rx,0);
});

test('09 ties sorted by userId; overtaking requires 1 Rx', () => {
  assert.deepEqual(calc([record('1','bob',50),record('2','ana',50)],['bob','ana'],'bob',monday),{
    ranking:[{userId:'ana',rx:50},{userId:'bob',rx:50}],
    position:2,rival:{userId:'ana',rx:50},rxToOvertake:1,
  });
});

test('10 group leader does not have rival', () => {
  const v=calc([record('1','ana',80),record('2','bob',70)],['ana','bob'],'ana',monday);
  assert.equal(v.position,1); assert.equal(v.rival,null); assert.equal(v.rxToOvertake,null);
});

test('11 unknown user has null position, rival and gap', () => {
  assert.deepEqual(calc([record('1','ana',20)],['ana'],'outsider',monday),{
    ranking:[{userId:'ana',rx:20}],position:null,rival:null,rxToOvertake:null,
  });
});

test('12 no mutations of frozen records or group member IDs', () => {
  const rows=Object.freeze([Object.freeze(record('1','ana',12))]);
  const members=Object.freeze(['ana','bob']);
  assert.equal(calc(rows,members,'bob',monday).rxToOvertake,13);
});
