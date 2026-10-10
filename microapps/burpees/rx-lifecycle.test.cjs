'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('./rx-lifecycle.cjs');
const { createPersonalRecord, applyRxAction, summarizeUser } = api;
const today = '2026-10-10';
const input = { id: 'r1', userId: 'owner', quantity: 50, activityDate: today };
const personal = () => createPersonalRecord(input, today);
const act = (record, type, actorId = 'owner', date = today, extra = {}) =>
  applyRxAction(record, { type, ...extra }, { actorId, today: date });
const request = (record = personal(), witnessId = 'witness', date = today) =>
  act(record, 'REQUEST', 'owner', date, { witnessId });
const code = (fn, expected) => assert.throws(fn, (err) => err instanceof Error && err.code === expected);

test('exports exactly the three contracted functions', () => {
  assert.deepEqual(Object.keys(api).sort(), ['applyRxAction', 'createPersonalRecord', 'summarizeUser']);
});

test('creates the exact personal shape without altering input', () => {
  const frozen = Object.freeze({ ...input, ignored: true });
  assert.deepEqual(createPersonalRecord(frozen, today), {
    ...input, createdDate: today, status: 'PERSONAL', validatorId: null, validatedBy: null,
  });
});

for (const quantity of [0, -1, 1.5, NaN, Infinity, '50', null, undefined]) {
  test(`invalid quantity ${String(quantity)} carries the required code`, () => {
    code(() => createPersonalRecord({ ...input, quantity }, today), 'INVALID_QUANTITY');
  });
}

test('positive quantities have no arbitrary cap', () => {
  for (const quantity of [1, 10000, 1000000000]) {
    assert.equal(createPersonalRecord({ ...input, quantity }, today).quantity, quantity);
  }
});

for (const [activityDate, date] of [
  ['2026-10-10', '2026-10-10'], ['2026-10-09', '2026-10-10'],
  ['2025-12-31', '2026-01-01'], ['2024-02-29', '2024-03-01'],
  ['2026-02-28', '2026-03-01'], ['0099-12-31', '0100-01-01'],
]) {
  test(`accepts civil activity ${activityDate} relative to ${date}`, () => {
    assert.equal(createPersonalRecord({ ...input, activityDate }, date).activityDate, activityDate);
  });
}

for (const activityDate of ['2026-10-08', '2026-10-11', '2026-02-30', '2026-13-01',
  '2026-1-1', '2026-10-10T00:00:00Z', '', null, undefined]) {
  test(`rejects invalid activity ${String(activityDate)}`, () => {
    code(() => createPersonalRecord({ ...input, activityDate }, today), 'INVALID_ACTIVITY_DATE');
  });
}

test('rejects a normalized invalid date even when it could match today', () => {
  code(() => createPersonalRecord({ ...input, activityDate: '2026-02-30' }, '2026-03-02'), 'INVALID_ACTIVITY_DATE');
  code(() => createPersonalRecord(input, 'bad'), 'INVALID_ACTIVITY_DATE');
});

test('request assigns exactly one active witness and remains personal progress', () => {
  const pending = request();
  assert.deepEqual(pending, { ...personal(), status: 'VERIFICATION_PENDING', validatorId: 'witness' });
  assert.deepEqual(summarizeUser([pending], 'owner'), { total: 50, rx: 0, rxIndex: 0 });
});

test('request permits each day 0 through 7 inclusive', () => {
  for (let day = 10; day <= 17; day++) {
    assert.equal(request(personal(), 'witness', `2026-10-${day}`).status, 'VERIFICATION_PENDING');
  }
});

test('request window begins at creation, not activity, across a year boundary', () => {
  const r = createPersonalRecord({ ...input, activityDate: '2025-12-31' }, '2026-01-01');
  assert.equal(request(r, 'witness', '2026-01-08').status, 'VERIFICATION_PENDING');
  code(() => request(r, 'witness', '2026-01-09'), 'WINDOW_EXPIRED');
});

test('civil request window includes leap day', () => {
  const r = createPersonalRecord({ ...input, activityDate: '2024-02-28' }, '2024-02-28');
  assert.equal(request(r, 'witness', '2024-03-06').status, 'VERIFICATION_PENDING');
  code(() => request(r, 'witness', '2024-03-07'), 'WINDOW_EXPIRED');
});

for (const date of ['2026-10-09', '2026-10-18', 'bad', '2026-02-30']) {
  test(`request rejects out-of-window or invalid date ${date}`, () => {
    code(() => request(personal(), 'witness', date), 'WINDOW_EXPIRED');
  });
}

for (const witnessId of [undefined, null, '', '   ', 50, {}]) {
  test(`request rejects missing/non-string witness ${JSON.stringify(witnessId)}`, () => {
    code(() => act(personal(), 'REQUEST', 'owner', today, { witnessId }), 'INVALID_WITNESS');
  });
}

test('self verification and unauthorized owner actions fail', () => {
  code(() => request(personal(), 'owner'), 'SELF_VERIFICATION');
  code(() => act(personal(), 'REQUEST', 'intruder', today, { witnessId: 'witness' }), 'FORBIDDEN');
  code(() => act(request(), 'CANCEL', 'witness'), 'FORBIDDEN');
  code(() => act(personal(), 'VOID', 'intruder'), 'FORBIDDEN');
});

for (const type of ['APPROVE', 'REJECT']) {
  test(`${type} requires active witness, allowing responses after day seven`, () => {
    const pending = request();
    for (const actor of ['owner', 'intruder']) code(() => act(pending, type, actor), 'FORBIDDEN');
    const result = act(pending, type, 'witness', '2027-03-01');
    assert.equal(result.status, type === 'APPROVE' ? 'RX_VERIFIED' : 'REJECTED');
    assert.equal(result.validatedBy, type === 'APPROVE' ? 'witness' : null);
    assert.equal(result.validatorId, 'witness');
    assert.deepEqual(summarizeUser([result], 'owner'), {
      total: 50, rx: type === 'APPROVE' ? 50 : 0, rxIndex: type === 'APPROVE' ? 100 : 0,
    });
    code(() => act(result, type, 'witness'), 'INVALID_STATE');
  });
}

test('cancel resets validator; old witness cannot approve a replacement request', () => {
  const canceled = act(request(), 'CANCEL');
  assert.deepEqual(canceled, personal());
  const pending = request(canceled, 'new-witness', '2026-10-17');
  code(() => act(pending, 'APPROVE', 'witness'), 'FORBIDDEN');
  assert.equal(act(pending, 'APPROVE', 'new-witness').validatedBy, 'new-witness');
});

test('cancel remains allowed after window; does not extend the request window', () => {
  const canceled = act(request(), 'CANCEL', 'owner', '2026-10-18');
  assert.equal(canceled.createdDate, today);
  code(() => request(canceled, 'other', '2026-10-18'), 'WINDOW_EXPIRED');
});

const statuses = ['PERSONAL', 'VERIFICATION_PENDING', 'RX_VERIFIED', 'REJECTED', 'VOIDED'];
const allowed = {
  REQUEST: ['PERSONAL'], APPROVE: ['VERIFICATION_PENDING'], REJECT: ['VERIFICATION_PENDING'],
  CANCEL: ['VERIFICATION_PENDING'], VOID: statuses.filter(s => s !== 'VOIDED'),
};
for (const status of statuses) {
  for (const type of Object.keys(allowed)) {
    if (allowed[type].includes(status)) continue;
    test(`${type} is invalid from ${status}`, () => {
      const r = { ...personal(), status, validatorId: 'witness' };
      code(() => act(r, type, ['APPROVE', 'REJECT'].includes(type) ? 'witness' : 'owner', today,
        { witnessId: 'other' }), 'INVALID_STATE');
    });
  }
}

test('unknown action is not an edit API', () => {
  code(() => act(personal(), 'EDIT'), 'INVALID_STATE');
});

for (const status of statuses.filter(s => s !== 'VOIDED')) {
  test(`void ${status} preserves audit, excludes sums, and is irreversible`, () => {
    const r = { ...personal(), status, validatorId: 'witness', validatedBy: status === 'RX_VERIFIED' ? 'witness' : null };
    code(() => act(r, 'VOID', 'witness'), 'FORBIDDEN');
    const voided = act(r, 'VOID');
    assert.deepEqual(voided, { ...r, status: 'VOIDED' });
    assert.deepEqual(summarizeUser([voided], 'owner'), { total: 0, rx: 0, rxIndex: 0 });
    code(() => act(voided, 'VOID'), 'INVALID_STATE');
  });
}

test('every successful action returns a new object and leaves all arguments intact', () => {
  const cases = [
    [personal(), { type: 'REQUEST', witnessId: 'witness' }, 'owner'],
    [request(), { type: 'APPROVE' }, 'witness'],
    [request(), { type: 'REJECT' }, 'witness'],
    [request(), { type: 'CANCEL' }, 'owner'],
    [act(request(), 'APPROVE', 'witness'), { type: 'VOID' }, 'owner'],
  ];
  for (const [r, action, actorId] of cases) {
    const context = { actorId, today };
    const before = structuredClone([r, action, context]);
    const result = applyRxAction(Object.freeze(r), Object.freeze(action), Object.freeze(context));
    assert.notEqual(result, r);
    assert.deepEqual([r, action, context], before);
  }
});

test('failed action leaves arguments intact', () => {
  const r = Object.freeze(personal());
  const action = Object.freeze({ type: 'REQUEST', witnessId: 'owner' });
  const context = Object.freeze({ actorId: 'owner', today });
  const before = structuredClone([r, action, context]);
  code(() => applyRxAction(r, action, context), 'SELF_VERIFICATION');
  assert.deepEqual([r, action, context], before);
});

test('summary includes personal/pending/rejected and counts Rx once without weights', () => {
  const records = statuses.map((status, index) => ({ ...personal(), id: `r${index}`, quantity: (index + 1) * 10, status }));
  records.push({ ...personal(), userId: 'other', quantity: 999 });
  const before = structuredClone(records);
  records.forEach(Object.freeze);
  assert.deepEqual(summarizeUser(Object.freeze(records), 'owner'), { total: 100, rx: 30, rxIndex: 30 });
  assert.deepEqual(records, before);
});

test('first occurrence wins even when voided or in a different state', () => {
  const r = personal();
  assert.deepEqual(summarizeUser([r, { ...r, status: 'RX_VERIFIED', quantity: 500 }], 'owner'), { total: 50, rx: 0, rxIndex: 0 });
  assert.deepEqual(summarizeUser([{ ...r, status: 'VOIDED' }, r], 'owner'), { total: 0, rx: 0, rxIndex: 0 });
  assert.deepEqual(summarizeUser([{ ...r, status: 'RX_VERIFIED' }, r], 'owner'), { total: 50, rx: 50, rxIndex: 100 });
});

test('other users do not consume ids for the requested user', () => {
  assert.deepEqual(summarizeUser([{ ...personal(), userId: 'other' }, personal()], 'owner'), { total: 50, rx: 0, rxIndex: 0 });
});

test('summary supports zero and fractional percentages', () => {
  assert.deepEqual(summarizeUser([], 'owner'), { total: 0, rx: 0, rxIndex: 0 });
  assert.deepEqual(summarizeUser([personal()], 'absent'), { total: 0, rx: 0, rxIndex: 0 });
  assert.deepEqual(summarizeUser([
    { ...personal(), id: 'a', quantity: 1, status: 'RX_VERIFIED' },
    { ...personal(), id: 'b', quantity: 2 },
  ], 'owner'), { total: 3, rx: 1, rxIndex: 1 / 3 * 100 });
});
