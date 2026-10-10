'use strict';

/** Calcula el ranking Rx de una semana de calendario para un grupo. */
function calculateWeeklyRanking(records, groupMemberIds, userId, weekStartDate) {
  const start = weekStartDate;
  const end = new Date(Date.parse(start + 'T00:00:00.000Z') + 6 * 86400000)
    .toISOString().slice(0, 10);
  const totals = new Map([...new Set(groupMemberIds)].map(id => [id, 0]));
  const seen = new Set();

  for (const record of records) {
    if (seen.has(record.id)) continue;
    seen.add(record.id);
    if (record.status !== 'RX_VERIFIED') continue;
    if (!totals.has(record.userId)) continue;
    if (record.activityDate < start || record.activityDate > end) continue;
    totals.set(record.userId, totals.get(record.userId) + record.quantity);
  }

  const ranking = [...totals].map(([id, rx]) => ({ userId: id, rx }))
    .sort((a, b) => b.rx - a.rx || (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0));
  const index = ranking.findIndex(entry => entry.userId === userId);
  const position = index >= 0 ? index + 1 : null;
  const rival = index > 0 ? { ...ranking[index - 1] } : null;
  return {
    ranking,
    position,
    rival,
    rxToOvertake: rival ? rival.rx - ranking[index].rx + 1 : null,
  };
}

module.exports = { calculateWeeklyRanking };
