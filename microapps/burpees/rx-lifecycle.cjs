'use strict';

function fail(code) {
  throw Object.assign(new Error(code), { code });
}

const dayNumber = date => Date.parse(`${date}T00:00:00Z`) / 86400000;

function createPersonalRecord(input, today) {
  if (!Number.isSafeInteger(input.quantity) || input.quantity <= 0) fail('INVALID_QUANTITY');
  const age = dayNumber(today) - dayNumber(input.activityDate);
  if (age !== 0 && age !== 1) fail('INVALID_ACTIVITY_DATE');
  return {
    id: input.id, userId: input.userId, quantity: input.quantity,
    activityDate: input.activityDate, createdDate: today,
    status: 'PERSONAL', validatorId: null, validatedBy: null,
  };
}

function applyRxAction(record, action, context) {
  const { type, witnessId } = action;
  const { actorId, today } = context;
  if (record.status === 'VOIDED') fail('INVALID_STATE');
  if (type === 'REQUEST') {
    if (actorId !== record.userId) fail('FORBIDDEN');
    if (record.status !== 'PERSONAL') fail('INVALID_STATE');
    if (typeof witnessId !== 'string' || witnessId.trim() === '') fail('INVALID_WITNESS');
    if (witnessId === record.userId) fail('SELF_VERIFICATION');
    const age = dayNumber(today) - dayNumber(record.createdDate);
    if (age < 0 || age > 7) fail('WINDOW_EXPIRED');
    return { ...record, status: 'VERIFICATION_PENDING', validatorId: witnessId };
  }
  if (type === 'APPROVE' || type === 'REJECT') {
    if (record.status !== 'VERIFICATION_PENDING') fail('INVALID_STATE');
    if (actorId !== record.validatorId) fail('FORBIDDEN');
    return type === 'APPROVE'
      ? { ...record, status: 'RX_VERIFIED', validatedBy: actorId }
      : { ...record, status: 'REJECTED' };
  }
  if (type === 'CANCEL') {
    if (actorId !== record.userId) fail('FORBIDDEN');
    if (record.status !== 'VERIFICATION_PENDING') fail('INVALID_STATE');
    return { ...record, status: 'PERSONAL', validatorId: null };
  }
  if (type === 'VOID') {
    if (actorId !== record.userId) fail('FORBIDDEN');
    return { ...record, status: 'VOIDED' };
  }
  fail('INVALID_STATE');
}

function summarizeUser(records, userId) {
  const totals = { total: 0, rx: 0, rxIndex: 0 };
  const seen = new Set();
  for (const record of records) {
    if (record.userId !== userId || seen.has(record.id)) continue;
    seen.add(record.id);
    if (record.status === 'VOIDED') continue;
    totals.total += record.quantity;
    if (record.status === 'RX_VERIFIED') totals.rx += record.quantity;
  }
  if (totals.total > 0) totals.rxIndex = 100 * totals.rx / totals.total;
  return totals;
}

module.exports = { createPersonalRecord, applyRxAction, summarizeUser };
