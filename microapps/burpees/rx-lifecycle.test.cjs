'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPersonalRecord, applyRxAction, summarizeUser } = require('./rx-lifecycle.cjs');

const input = (overrides = {}) => ({ id: 'r1', userId: 'owner', quantity: 50, activityDate: '2026-01-01', ...overrides });
const code = (fn, expected) => assert.throws(fn, error => error instanceof Error && error.code === expected);

test('creates the exact personal record without changing frozen input', () => {
  const data = Object.freeze(input());
  const result = createPersonalRecord(data, '2026-01-01');
  assert.deepEqual(result, { ...data, createdDate: '2026-01-01', status: 'PERSONAL', validatorId: null, validatedBy: null });
  assert.notStrictEqual(result, data);
});

for (const [today, yesterday] of [['2026-01-01', '2025-12-31'], ['2024-03-01', '2024-02-29'], ['2026-03-01', '2026-02-28']]) {
  test(`accepts yesterday ${yesterday} relative to ${today}`, () => {
    assert.equal(createPersonalRecord(input({ activityDate: yesterday }), today).activityDate, yesterday);
  });
}

for (const quantity of [0, -1, 1.5, '50', null, undefined, NaN, Infinity]) {
  test(`rejects invalid quantity ${String(quantity)} (${typeof quantity})`, () => {
    code(() => createPersonalRecord(input({ quantity }), '2026-01-01'), 'INVALID_QUANTITY');
  });
}

test('accepts a large integer without an arbitrary daily cap', () => {
  assert.equal(createPersonalRecord(input({ quantity: 1000000000 }), '2026-01-01').quantity, 1000000000);
});

for (const activityDate of ['2025-12-30', '2026-01-02', '2026-02-30', '2026-1-1', '2026-01-01T00:00:00Z', '', null]) {
  test(`rejects invalid or out-of-range activity date ${String(activityDate)}`, () => {
    code(() => createPersonalRecord(input({ activityDate }), '2026-01-01'), 'INVALID_ACTIVITY_DATE');
  });
}

for (const today of ['2026-02-30', 'not-a-date', undefined]) {
  test(`rejects invalid injected today ${String(today)}`, () => {
    code(() => createPersonalRecord(input(), today), 'INVALID_ACTIVITY_DATE');
  });
}
