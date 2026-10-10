'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateWeeklyRanking: calc } = require('./weekly-ranking.cjs');

function record(id, userId, quantity, date = '2026-10-09', status = 'RX_VERIFIED') {
  return { id, userId, quantity, activityDate: date, status };
}

test('counts verified Rx and calculates next rival correctly', () => {
  assert.deepEqual(calc([
    record('1', 'ana', 50), record('2', 'bob', 40),
    record('3', 'bob', 200, '2026-10-09', 'PERSONAL'),
  ], ['ana', 'bob'], 'bob', '2026-10-05'), {
    ranking: [{ userId: 'ana', rx: 50 }, { userId: 'bob', rx: 40 }],
    position: 2, rival: { userId: 'ana', rx: 50 }, rxToOvertake: 11,
  });
});

test('counts once per record, ignores other weeks and shows zero members', () => {
  const rows = [record('1', 'ana', 40), record('1', 'ana', 40), record('2', 'ana', 90, '2026-10-12')];
  assert.deepEqual(calc(rows, ['ana', 'bob'], 'ana', '2026-10-05').ranking,
    [{ userId: 'ana', rx: 40 }, { userId: 'bob', rx: 0 }]);
});

test('handles week crossing a year', () => {
  const rows = [record('1', 'ana', 11, '2026-12-28'), record('2', 'ana', 22, '2027-01-03')];
  assert.equal(calc(rows, ['ana'], 'ana', '2026-12-28').ranking[0].rx, 33);
});
