'use strict';

// Domain-only model: all clock inputs are injected, in civil YYYY-MM-DD form.
const MS_PER_DAY = 86_400_000;

function domainError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function civilDay(value) {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function createPersonalRecord(input, today) {
  if (!Number.isSafeInteger(input.quantity) || input.quantity <= 0) {
    throw domainError('INVALID_QUANTITY');
  }
  const daysSinceActivity = civilDay(today) - civilDay(input.activityDate);
  if (daysSinceActivity !== 0 && daysSinceActivity !== 1) {
    throw domainError('INVALID_ACTIVITY_DATE');
  }

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
  if (record.status === 'VOIDED') throw domainError('INVALID_STATE');
  const isOwner = context.actorId === record.userId;

  switch (action.type) {
    case 'REQUEST': {
      if (!isOwner) throw domainError('FORBIDDEN');
      if (record.status !== 'PERSONAL') throw domainError('INVALID_STATE');
      if (typeof action.witnessId !== 'string' || action.witnessId.trim().length === 0) {
        throw domainError('INVALID_WITNESS');
      }
      if (action.witnessId === record.userId) throw domainError('SELF_VERIFICATION');
      const elapsedDays = civilDay(context.today) - civilDay(record.createdDate);
      if (elapsedDays < 0 || elapsedDays > 7) throw domainError('WINDOW_EXPIRED');
      return {...record, status: 'VERIFICATION_PENDING', validatorId: action.witnessId};
    }
    case 'APPROVE':
    case 'REJECT': {
      if (record.status !== 'VERIFICATION_PENDING') throw domainError('INVALID_STATE');
      if (context.actorId !== record.validatorId) throw domainError('FORBIDDEN');
      return action.type === 'APPROVE'
        ? {...record, status: 'RX_VERIFIED', validatedBy: context.actorId}
        : {...record, status: 'REJECTED'};
    }
    case 'CANCEL': {
      if (!isOwner) throw domainError('FORBIDDEN');
      if (record.status !== 'VERIFICATION_PENDING') throw domainError('INVALID_STATE');
      return {...record, status: 'PERSONAL', validatorId: null};
    }
    case 'VOID': {
      if (!isOwner) throw domainError('FORBIDDEN');
      return {...record, status: 'VOIDED'};
    }
    default:
      throw domainError('INVALID_STATE');
  }
}

function summarizeUser(records, userId) {
  let total = 0;
  let rx = 0;
  const observed = new Set();

  for (const record of records) {
    if (record.userId !== userId || observed.has(record.id)) continue;
    observed.add(record.id);
    if (record.status === 'VOIDED') continue;
    total += record.quantity;
    if (record.status === 'RX_VERIFIED') rx += record.quantity;
  }

  return { total, rx, rxIndex: total === 0 ? 0 : (rx / total) * 100 };
}

module.exports = {createPersonalRecord, applyRxAction, summarizeUser};
