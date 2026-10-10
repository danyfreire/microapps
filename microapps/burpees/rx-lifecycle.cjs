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

module.exports = { createPersonalRecord };
