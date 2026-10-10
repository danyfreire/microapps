'use strict';

// Disposable benchmark implementation; see experiments/rx-ab2/CONTRACT.md.
const DAY_MS = 86400000;

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

// UTC is used only to count civil days, never to obtain the current date.
// Round-tripping rejects normalized dates such as February 30.
function civilDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return NaN;
  return date.getTime() / DAY_MS;
}

function createPersonalRecord(input, today) {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) fail('INVALID_QUANTITY');
  const age = civilDay(today) - civilDay(input.activityDate);
  if (age !== 0 && age !== 1) fail('INVALID_ACTIVITY_DATE');
  return {
    id: input.id,
    userId: input.userId,
    quantity: input.quantity,
    activityDate: input.activityDate,
    createdDate: today,
    status: 'PERSONAL',
    validatorId: null,
    validatedBy: null,
  };
}

function applyRxAction(record, action, context) {
  if (record.status === 'VOIDED') fail('INVALID_STATE');
  const requireOwner = () => {
    if (context.actorId !== record.userId) fail('FORBIDDEN');
  };
  const requireState = (status) => {
    if (record.status !== status) fail('INVALID_STATE');
  };

  switch (action.type) {
    case 'REQUEST': {
      requireState('PERSONAL');
      requireOwner();
      if (typeof action.witnessId !== 'string' || !action.witnessId.trim()) fail('INVALID_WITNESS');
      if (action.witnessId === record.userId) fail('SELF_VERIFICATION');
      const age = civilDay(context.today) - civilDay(record.createdDate);
      if (!Number.isFinite(age) || age < 0 || age > 7) fail('WINDOW_EXPIRED');
      return { ...record, status: 'VERIFICATION_PENDING', validatorId: action.witnessId };
    }
    case 'APPROVE':
    case 'REJECT':
      requireState('VERIFICATION_PENDING');
      if (context.actorId !== record.validatorId) fail('FORBIDDEN');
      return {
        ...record,
        status: action.type === 'APPROVE' ? 'RX_VERIFIED' : 'REJECTED',
        validatedBy: action.type === 'APPROVE' ? context.actorId : null,
      };
    case 'CANCEL':
      requireState('VERIFICATION_PENDING');
      requireOwner();
      return { ...record, status: 'PERSONAL', validatorId: null };
    case 'VOID':
      requireOwner();
      // Preserve validator and approval fields for audit, including verified Rx.
      return { ...record, status: 'VOIDED' };
    default:
      fail('INVALID_STATE');
  }
}

function summarizeUser(records, userId) {
  let total = 0;
  let rx = 0;
  const seen = new Set();
  for (const record of records) {
    if (record.userId !== userId || seen.has(record.id)) continue;
    seen.add(record.id);
    if (record.status === 'VOIDED') continue;
    total += record.quantity;
    if (record.status === 'RX_VERIFIED') rx += record.quantity;
  }
  return { total, rx, rxIndex: total === 0 ? 0 : rx / total * 100 };
}

module.exports = { createPersonalRecord, applyRxAction, summarizeUser };
