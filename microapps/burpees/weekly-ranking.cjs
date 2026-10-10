'use strict';

/**
 * Calcula la clasificación semanal Rx para un grupo. Las fechas de actividad
 * son fechas de calendario (YYYY-MM-DD), no instantes con zona horaria.
 * @param {Array<{id:string,userId:string,quantity:number,activityDate:string,status:string}>} records
 * @param {string[]} groupMemberIds
 * @param {string} userId
 * @param {string} weekStartDate Fecha de lunes YYYY-MM-DD.
 * @returns {{ranking:Array<{userId:string,rx:number}>,position:number|null,rival:{userId:string,rx:number}|null,rxToOvertake:number|null}}
 */
function calculateWeeklyRanking(records, groupMemberIds, userId, weekStartDate) {
  // Convertir solo el lunes a UTC para calcular la fecha civil del domingo.
  // Comparar strings ISO permite conservar el día de actividad original.
  const [year, month, day] = weekStartDate.split('-').map(Number);
  const sunday = new Date(Date.UTC(year, month - 1, day + 6))
    .toISOString().slice(0, 10);

  const rxByUser = new Map();
  for (const memberId of groupMemberIds) rxByUser.set(memberId, 0);

  const processedIds = new Set();
  for (const entry of records) {
    if (processedIds.has(entry.id)) continue;
    processedIds.add(entry.id);

    if (!rxByUser.has(entry.userId) || entry.status !== 'RX_VERIFIED') continue;
    if (entry.activityDate < weekStartDate || entry.activityDate > sunday) continue;
    rxByUser.set(entry.userId, rxByUser.get(entry.userId) + entry.quantity);
  }

  const ranking = Array.from(rxByUser, ([memberId, rx]) => ({userId: memberId, rx}));
  ranking.sort((a, b) => b.rx - a.rx || compareIds(a.userId, b.userId));

  const index = ranking.findIndex(row => row.userId === userId);
  const rival = index > 0 ? { ...ranking[index - 1] } : null;
  return {
    ranking,
    position: index === -1 ? null : index + 1,
    rival,
    rxToOvertake: rival === null ? null : rival.rx - ranking[index].rx + 1,
  };
}

function compareIds(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

module.exports = { calculateWeeklyRanking };
