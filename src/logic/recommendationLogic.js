// src/logic/recommendationLogic.js
// Pure functions - NO DOM access. All functions take data in, return objects out.

/**
 * Returns the best gate for an attendee based on their zone.
 * Rule: prefer gates in same/nearby zone, lowest queueTime, exclude 'closed'.
 */
function getBestGate(userZone, gates) {
  const zoneOrder = { north: ['north','west','central','east','south'], east: ['east','central','north','south','west'], south: ['south','central','east','west','north'], west: ['west','north','central','south','east'], central: ['central','north','east','south','west'] };
  const priority = zoneOrder[userZone] || zoneOrder['north'];

  const eligible = gates.filter(g => g.status !== 'closed');
  if (!eligible.length) return { gateId: null, label: 'No gates available', reason: 'All gates are currently closed.' };

  eligible.sort((a, b) => {
    const aIdx = priority.indexOf(a.zone);
    const bIdx = priority.indexOf(b.zone);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.queueTime - b.queueTime;
  });

  const best = eligible[0];
  return {
    gateId: best.id,
    label: best.label,
    status: best.status,
    queueTime: best.queueTime,
    reason: `Recommended because it is in ${best.zone} zone (closest to you) with only ${best.queueTime} min wait.`
  };
}

/**
 * Returns best facility of each type near the user's zone.
 * Rule: same zone first, then lowest queueTime.
 */
function getBestFacility(userZone, facilities) {
  const types = ['washroom', 'food', 'merch'];
  const results = [];

  types.forEach(type => {
    const ofType = facilities.filter(f => f.type === type && f.available);
    if (!ofType.length) return;

    const sameZone = ofType.filter(f => f.zone === userZone);
    const pool = sameZone.length ? sameZone : ofType;
    pool.sort((a, b) => a.queueTime - b.queueTime);
    const best = pool[0];

    results.push({
      facilityId: best.id,
      type: best.type,
      label: best.label,
      queueTime: best.queueTime,
      zone: best.zone,
      reason: sameZone.length
        ? `Nearest ${type} in your zone with ${best.queueTime} min wait.`
        : `No ${type} in your zone - nearest is ${best.label} with ${best.queueTime} min wait.`
    });
  });

  return results;
}

/**
 * Returns attendee alert based on event mode and zone status.
 */
function getAttendeeAlert(eventMode, zones, alerts) {
  const active = alerts.filter(a => !a.handled);
  if (!active.length) return { message: 'No active alerts. Enjoy the event!', severity: 'low' };

  active.sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 };
    return sev[a.severity] - sev[b.severity];
  });

  return active[0];
}

/**
 * Returns operational recommendation for the ops team.
 * Rule: flag zones with high congestion and rising trend.
 */
function getOpsRecommendation(zones, gates) {
  const critical = zones.filter(z => z.congestion === 'high' && z.trend === 'rising');
  if (!critical.length) {
    return { action: 'All zones stable', reason: 'No critical congestion detected at this time.', severity: 'low' };
  }

  const zone = critical[0];
  const busyGates = gates.filter(g => g.zone === zone.id && g.status === 'busy');
  const openAlternatives = gates.filter(g => g.zone !== zone.id && g.status === 'open').sort((a,b) => a.queueTime - b.queueTime);
  const alt = openAlternatives[0];

  return {
    zone: zone.label,
    action: alt ? `Redirect crowds to ${alt.label}` : 'Deploy additional staff to manage entry flow',
    reason: `${zone.label} has ${zone.crowdCount} people with a rising trend. ${busyGates.length} gate(s) are currently at capacity.`,
    severity: 'high'
  };
}
