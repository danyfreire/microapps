'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateWeeklyRanking } = require('./weekly-ranking.cjs');
const rec = (id, userId, quantity, activityDate = '2026-10-09', status = 'RX_VERIFIED') =>
  ({ id, userId, quantity, activityDate, status });
const run = (records, members, current = 'ana', week = '2026-10-05') =>
  calculateWeeklyRanking(records, members, current, week);

test('empty group returns no position and no rival', () => {
  assert.deepEqual(run([], []), {
    ranking: [], position: null, rival: null, rxToOvertake: null,
  });
});

test('only verified records scored; includes zero-Rx group members', () => {
  const rows = [rec('1', 'ana', 50), rec('2', 'bob', 30),
    rec('3', 'bob', 40, '2026-10-09', 'PERSONAL'),
    rec('4', 'ana', 700, '2026-10-09', 'VOIDED')];
  assert.deepEqual(run(rows, ['ana', 'bob', 'zoe', 'bob'], 'bob'), {
    ranking: [{userId:'ana',rx:50},{userId:'bob',rx:30},{userId:'zoe',rx:0}],
    position:2, rival:{userId:'ana',rx:50}, rxToOvertake:21,
  });
});

test('week includes Monday and Sunday, not outside days', () => {
  const rows = [rec('a', 'ana', 11, '2026-10-05'), rec('b', 'ana', 22, '2026-10-11'),
    rec('c', 'ana', 300, '2026-10-04'), rec('d', 'ana', 400, '2026-10-12')];
  assert.equal(run(rows, ['ana']).ranking[0].rx, 33);
});

test('crosses December-January without timezone shift', () => {
  const rows = [rec('1','ana',10,'2026-12-28'),rec('2','ana',25,'2027-01-03')];
  assert.equal(run(rows,['ana'],'ana','2026-12-28').ranking[0].rx,35);
});

test('same record ID never counted twice and outside group excluded', () => {
  const rows = [rec('1','ana',5),rec('1','ana',5),rec('2','outsider',1000)];
  assert.deepEqual(run(rows,['ana','bob']).ranking,[{userId:'ana',rx:5},{userId:'bob',rx:0}]);
});

test('ties use ascending user ID; overtaking requires one more Rx', () => {
  const rows = [rec('1','zoe',50),rec('2','ana',50)];
  assert.deepEqual(run(rows,['zoe','ana'],'zoe'),{
    ranking:[{userId:'ana',rx:50},{userId:'zoe',rx:50}],position:2,
    rival:{userId:'ana',rx:50},rxToOvertake:1,
  });
});

test('no rival for first place or member outside group', () => {
  const rows = [rec('1','ana',80)];
  assert.equal(run(rows,['ana','bob']).rival,null);
  assert.deepEqual(run(rows,['ana','bob'],'guest'),{
    ranking:[{userId:'ana',rx:80},{userId:'bob',rx:0}],
    position:null,rival:null,rxToOvertake:null,
  });
});

test('does not mutate frozen input arrays or records', () => {
  const records = Object.freeze([Object.freeze(rec('1','ana',12))]);
  const members = Object.freeze(['ana','bob']);
  assert.equal(run(records,members,'bob').rxToOvertake,13);
});
