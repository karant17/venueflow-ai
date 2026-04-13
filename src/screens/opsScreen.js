// src/screens/opsScreen.js - Operations Console UI rendering

function renderOpsScreen() {
  const data = window.venueService.getData();

  // Overview Dashboard
  const overviewEl = document.getElementById('overviewCards');
  if (overviewEl) {
    const openGates = data.gates.filter(g => g.status === 'open').length;
    const busyGates = data.gates.filter(g => g.status === 'busy').length;
    const closedGates = data.gates.filter(g => g.status === 'closed').length;
    const activeAlerts = data.alerts.filter(a => !a.handled).length;
    const highZones = data.zones.filter(z => z.congestion === 'high').length;

    overviewEl.innerHTML = `
      <div class="card"><div class="card-title">Total Gates</div><div style="font-size:1.8rem;font-weight:700">${data.gates.length}</div>
        <span class="badge badge-green">${openGates} Open</span>
        <span class="badge badge-yellow" style="margin-left:6px">${busyGates} Busy</span>
        <span class="badge badge-red" style="margin-left:6px">${closedGates} Closed</span></div>
      <div class="card"><div class="card-title">Active Alerts</div><div style="font-size:1.8rem;font-weight:700;color:${activeAlerts > 0 ? '#ef5350' : '#4caf80'}">${activeAlerts}</div>
        <span class="badge ${activeAlerts > 0 ? 'badge-red' : 'badge-green'}">${activeAlerts > 0 ? 'Requires Attention' : 'All Clear'}</span></div>
      <div class="card"><div class="card-title">High Congestion Zones</div><div style="font-size:1.8rem;font-weight:700;color:${highZones > 0 ? '#ffc107' : '#4caf80'}">${highZones}</div>
        <span class="badge ${highZones > 0 ? 'badge-yellow' : 'badge-green'}">${highZones > 0 ? 'Monitor Now' : 'Normal'}</span></div>
      <div class="card"><div class="card-title">Total Facilities</div><div style="font-size:1.8rem;font-weight:700">${data.facilities.length}</div>
        <span class="badge badge-blue">${data.facilities.filter(f=>f.available).length} Available</span></div>
    `;
  }

  // Zone Congestion
  const zoneEl = document.getElementById('zoneCards');
  if (zoneEl) {
    zoneEl.innerHTML = data.zones.map(z => {
      const badgeClass = z.congestion === 'high' ? 'badge-red' : z.congestion === 'medium' ? 'badge-yellow' : 'badge-green';
      const trendIcon = z.trend === 'rising' ? '↗️' : z.trend === 'falling' ? '↘️' : '➡️';
      return `
        <div class="card">
          <div class="card-title">${z.label}</div>
          <div>Crowd: <strong>${z.crowdCount.toLocaleString()}</strong></div>
          <div>Trend: ${trendIcon} ${z.trend}</div>
          <span class="badge ${badgeClass}">${z.congestion.toUpperCase()}</span>
        </div>`;
    }).join('');
  }

  // Queue Status Board
  const queueEl = document.getElementById('queueCards');
  if (queueEl) {
    const sorted = [...data.gates].sort((a,b) => b.queueTime - a.queueTime);
    queueEl.innerHTML = sorted.map((g, i) => {
      const badgeClass = g.queueTime > 15 ? 'badge-red' : g.queueTime > 7 ? 'badge-yellow' : 'badge-green';
      const topBadge = i < 3 && g.queueTime > 0 ? '<span class="badge badge-red" style="margin-right:4px">TOP CONGESTED</span>' : '';
      return `
        <div class="card">
          <div class="card-title">${g.label}</div>
          ${topBadge}
          <div>Wait: <strong>${g.queueTime} min</strong></div>
          <span class="badge ${badgeClass}">${g.status.toUpperCase()}</span>
        </div>`;
    }).join('');
  }

  // Ops Alert Panel
  const opsRec = getOpsRecommendation(data.zones, data.gates);
  const opsAlertEl = document.getElementById('opsAlertCards');
  if (opsAlertEl) {
    opsAlertEl.innerHTML = `
      <div class="card" style="border-color:${opsRec.severity === 'high' ? '#ef5350' : '#ffc107'}">
        <div class="card-title">AI Recommendation</div>
        <div><strong>Action:</strong> ${opsRec.action}</div>
        <div class="reason-text">${opsRec.reason}</div>
        <span class="badge ${opsRec.severity === 'high' ? 'badge-red' : 'badge-yellow'}">${opsRec.severity.toUpperCase()} PRIORITY</span>
      </div>
    ` + data.alerts.map(a => {
      const sevClass = a.severity === 'high' ? 'badge-red' : a.severity === 'medium' ? 'badge-yellow' : 'badge-green';
      return `
        <div class="card" id="alert-${a.id}">
          <div class="card-title">${a.message}</div>
          <span class="badge ${sevClass}">${a.severity.toUpperCase()}</span>
          <div class="reason-text">${a.routeAdvice}</div>
          <button class="action-btn ${a.handled ? 'handled' : ''}" onclick="handleAlert('${a.id}')" ${a.handled ? 'disabled' : ''}>
            ${a.handled ? 'Handled' : 'Mark as Handled'}
          </button>
        </div>`;
    }).join('');
  }
}

function handleAlert(alertId) {
  const data = window.venueService.getData();
  const alert = data.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.handled = true;
    const btn = document.querySelector(`#alert-${alertId} .action-btn`);
    if (btn) { btn.textContent = 'Handled'; btn.classList.add('handled'); btn.disabled = true; }
  }
}
