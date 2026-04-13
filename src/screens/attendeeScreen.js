// src/screens/attendeeScreen.js - Attendee UI rendering
// Uses service layer for data, logic layer for decisions

function renderAttendeeScreen() {
  const data = window.venueService.getData();
  const ctx = ATTENDEE_CONTEXT;

  // Gate recommendation
  const gate = getBestGate(ctx.currentZone, data.gates);
  const gateEl = document.getElementById('gateCard');
  if (gateEl) {
    const statusBadge = gate.status === 'busy' ? 'badge-yellow' : 'badge-green';
    gateEl.innerHTML = `
      <div class="card-title">${gate.label}</div>
      <div>Wait time: <strong>${gate.queueTime} min</strong></div>
      <span class="badge ${statusBadge}">${gate.status ? gate.status.toUpperCase() : 'OPEN'}</span>
      <div class="reason-text">${gate.reason}</div>
    `;
  }

  // Facilities
  const facilities = getBestFacility(ctx.currentZone, data.facilities);
  const facEl = document.getElementById('facilitiesCards');
  if (facEl) {
    const icons = { washroom: '🚹', food: '🍔', merch: '🛒', medical: '🏥', atm: '🏧' };
    facEl.innerHTML = facilities.map(f => `
      <div class="card">
        <div class="card-title">${icons[f.type] || '📌'} ${f.label}</div>
        <div>Wait: <strong>${f.queueTime} min</strong></div>
        <span class="badge badge-blue">${f.type.toUpperCase()}</span>
        <div class="reason-text">${f.reason}</div>
      </div>
    `).join('');
  }

  // Alerts
  const activeAlerts = data.alerts.filter(a => !a.handled);
  const alertEl = document.getElementById('alertCards');
  if (alertEl) {
    if (!activeAlerts.length) {
      alertEl.innerHTML = '<div class="card"><div class="card-title">No active alerts</div><p>Enjoy the event!</p></div>';
    } else {
      alertEl.innerHTML = activeAlerts.map(a => {
        const sevClass = a.severity === 'high' ? 'badge-red' : a.severity === 'medium' ? 'badge-yellow' : 'badge-green';
        return `
          <div class="card">
            <div class="card-title">${a.message}</div>
            <span class="badge ${sevClass}">${a.severity.toUpperCase()}</span>
            <div class="reason-text">Route advice: ${a.routeAdvice}</div>
            <div style="font-size:0.75rem;color:#666;margin-top:4px">${a.timestamp}</div>
          </div>
        `;
      }).join('');
    }
  }
}

function selectMode(mode) {
  // Update mode buttons
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  // Update mode description
  const modeData = EVENT_TYPES.find(e => e.id === mode);
  const descEl = document.getElementById('modeDesc');
  if (descEl && modeData) descEl.textContent = modeData.description;
}
