'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPersonalRecord, applyRxAction, summarizeUser } = require('./rx-lifecycle.cjs');

const input = (overrides = {}) => ({ id: 'r1', userId: 'owner', quantity: 50, activityDate: '2026-01-01', ...overrides });
const code = (fn, expected) => assert.throws(fn, error => error instanceof Error && error.code === expected);
const personal = () => createPersonalRecord(input(), '2026-01-01');
const act = (record, type, actorId = 'owner', today = '2026-01-01', extra = {}) => applyRxAction(record, { type, ...extra }, { actorId, today });
const pending = () => act(personal(), 'REQUEST', 'owner', '2026-01-01', { witnessId: 'witness' });

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

for (const today of ['2026-01-01', '2026-01-08']) {
  test(`allows request at inclusive window boundary ${today}`, () => {
    assert.deepEqual(act(personal(), 'REQUEST', 'owner', today, { witnessId: 'witness' }), {
      ...personal(), status: 'VERIFICATION_PENDING', validatorId: 'witness',
    });
  });
}
for (const today of ['2025-12-31', '2026-01-09', 'bad-date', '2026-02-30']) {
  test(`denies request outside civil window ${today}`, () => {
    code(() => act(personal(), 'REQUEST', 'owner', today, { witnessId: 'witness' }), 'WINDOW_EXPIRED');
  });
}
test('uses creation date rather than activity date for the request window', () => {
  const record = createPersonalRecord(input({ activityDate: '2025-12-31' }), '2026-01-01');
  assert.equal(act(record, 'REQUEST', 'owner', '2026-01-08', { witnessId: 'witness' }).status, 'VERIFICATION_PENDING');
});
test('request window crosses leap day and year boundary', () => {
  for (const [createdDate, today] of [['2024-02-25', '2024-03-03'], ['2025-12-28', '2026-01-04']]) {
    assert.equal(act({ ...personal(), createdDate }, 'REQUEST', 'owner', today, { witnessId: 'witness' }).status, 'VERIFICATION_PENDING');
  }
});
for (const witnessId of ['', '   ', null, undefined, 42]) {
  test(`requires a nonblank string witness ${String(witnessId)}`, () => {
    code(() => act(personal(), 'REQUEST', 'owner', '2026-01-01', { witnessId }), 'INVALID_WITNESS');
  });
}
test('disallows self verification', () => {
  code(() => act(personal(), 'REQUEST', 'owner', '2026-01-01', { witnessId: 'owner' }), 'SELF_VERIFICATION');
});
for (const type of ['REQUEST', 'CANCEL', 'VOID']) {
  test(`${type} requires the owner`, () => {
    code(() => act(type === 'CANCEL' ? pending() : personal(), type, 'stranger', '2026-01-01', { witnessId: 'witness' }), 'FORBIDDEN');
  });
}
for (const type of ['APPROVE', 'REJECT']) {
  for (const actorId of ['owner', 'stranger']) {
    test(`${type} denies ${actorId} instead of active witness`, () => {
      code(() => act(pending(), type, actorId), 'FORBIDDEN');
    });
  }
  test(`${type} permits a late response after day seven`, () => {
    const result = act(pending(), type, 'witness', '2026-02-01');
    assert.deepEqual(result, { ...pending(), status: type === 'APPROVE' ? 'RX_VERIFIED' : 'REJECTED', validatedBy: type === 'APPROVE' ? 'witness' : null });
  });
}
test('cancel clears active witness and permits a different one', () => {
  const cancelled = act(pending(), 'CANCEL');
  assert.deepEqual(cancelled, personal());
  const replacement = act(cancelled, 'REQUEST', 'owner', '2026-01-08', { witnessId: 'replacement' });
  code(() => act(replacement, 'APPROVE', 'witness'), 'FORBIDDEN');
  assert.equal(act(replacement, 'APPROVE', 'replacement').validatedBy, 'replacement');
});
test('cancel does not restart the seven-day window', () => {
  code(() => act(act(pending(), 'CANCEL'), 'REQUEST', 'owner', '2026-01-09', { witnessId: 'replacement' }), 'WINDOW_EXPIRED');
});
for (const status of ['PERSONAL', 'VERIFICATION_PENDING', 'RX_VERIFIED', 'REJECTED']) {
  test(`voids ${status} while preserving audit fields`, () => {
    const record = { ...personal(), status, validatorId: 'witness', validatedBy: status === 'RX_VERIFIED' ? 'witness' : null };
    assert.deepEqual(act(record, 'VOID'), { ...record, status: 'VOIDED' });
  });
}
for (const status of ['PERSONAL', 'VERIFICATION_PENDING', 'RX_VERIFIED', 'REJECTED', 'VOIDED']) {
  for (const type of ['REQUEST', 'APPROVE', 'REJECT', 'CANCEL', 'VOID', 'EDIT', 'UNKNOWN']) {
    const allowed = status === 'PERSONAL' ? ['REQUEST', 'VOID'] : status === 'VERIFICATION_PENDING' ? ['APPROVE', 'REJECT', 'CANCEL', 'VOID'] : status === 'VOIDED' ? [] : ['VOID'];
    if (allowed.includes(type)) continue;
    test(`rejects invalid transition ${status} -> ${type}`, () => {
      code(() => act({ ...personal(), status, validatorId: 'witness' }, type, type === 'APPROVE' || type === 'REJECT' ? 'witness' : 'owner', '2026-01-01', { witnessId: 'witness' }), 'INVALID_STATE');
    });
  }
}
test('all successful actions produce new objects and leave inputs untouched', () => {
  const cases = [['REQUEST', personal(), 'owner'], ['APPROVE', pending(), 'witness'], ['REJECT', pending(), 'witness'], ['CANCEL', pending(), 'owner'], ['VOID', act(pending(), 'APPROVE', 'witness'), 'owner']];
  for (const [type, source, actorId] of cases) {
    const record = Object.freeze(source);
    const action = Object.freeze({ type, witnessId: 'witness' });
    const context = Object.freeze({ actorId, today: '2026-01-01' });
    const snapshot = structuredClone({ record, action, context });
    assert.notStrictEqual(applyRxAction(record, action, context), record);
    assert.deepEqual({ record, action, context }, snapshot);
  }
});
