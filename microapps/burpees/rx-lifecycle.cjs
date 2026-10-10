'use strict';

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

// Parse civil dates strictly, then compare whole UTC days to avoid DST effects.
function civilDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return NaN;
  return date.getTime() / 86400000;
}

function createPersonalRecord(input, today) {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) fail('INVALID_QUANTITY');
  const elapsed = civilDay(today) - civilDay(input.activityDate);
  if (elapsed !== 0 && elapsed !== 1) fail('INVALID_ACTIVITY_DATE');
  return {
    id: input.id, userId: input.userId, quantity: input.quantity,
    activityDate: input.activityDate, createdDate: today,
    status: 'PERSONAL', validatorId: null, validatedBy: null,
  };
}

function applyRxAction(record, action, context) {
  const { type } = action;
  if (record.status === 'VOIDED') fail('INVALID_STATE');
  const allowedFrom = {
    REQUEST: 'PERSONAL', APPROVE: 'VERIFICATION_PENDING',
    REJECT: 'VERIFICATION_PENDING', CANCEL: 'VERIFICATION_PENDING',
  };
  if (type !== 'VOID' && (!Object.hasOwn(allowedFrom, type) || record.status !== allowedFrom[type])) {
    fail('INVALID_STATE');
  }
  const responder = type === 'APPROVE' || type === 'REJECT';
  if (context.actorId !== (responder ? record.validatorId : record.userId)) fail('FORBIDDEN');

  switch (type) {
    case 'REQUEST': {
      if (typeof action.witnessId !== 'string' || !action.witnessId.trim()) fail('INVALID_WITNESS');
      if (action.witnessId === record.userId) fail('SELF_VERIFICATION');
      const elapsed = civilDay(context.today) - civilDay(record.createdDate);
      if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > 7) fail('WINDOW_EXPIRED');
      return { ...record, status: 'VERIFICATION_PENDING', validatorId: action.witnessId };
    }
    case 'APPROVE':
      return { ...record, status: 'RX_VERIFIED', validatedBy: context.actorId };
    case 'REJECT':
      return { ...record, status: 'REJECTED' };
    case 'CANCEL':
      return { ...record, status: 'PERSONAL', validatorId: null };
    case 'VOID':
      return { ...record, status: 'VOIDED' };
  }
}

function summarizeUser(records, userId) {
  const seen = new Set();
  let total = 0;
  let rx = 0;
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
