// src/screens/attendeeScreen.js - Attendee UI rendering

window.changeZone = async function(newZone) {
  ATTENDEE_CONTEXT.currentZone = newZone;
  await renderAttendeeScreen();
};

async function renderAttendeeScreen() {
  const data = await window.venueService.getData();
  const ctx = ATTENDEE_CONTEXT;

  // 1. Render Zone Selector
  const zoneEl = document.getElementById('zoneSelectorContainer');
  if (zoneEl) {
    const zones = ['north', 'east', 'south', 'west', 'central'];
    zoneEl.innerHTML = `
      <div class="segmented-tabs">
        ${zones.map(z => `
          <button class="tab-btn ${ctx.currentZone === z ? 'active' : ''}" 
                  onclick="window.changeZone('${z}')">
            ${z}
          </button>
        `).join('')}
      </div>
    `;
  }

  // 2. Render Gate recommendation (Hero Card)
  const gate = getBestGate(ctx.currentZone, data.gates);
  const gateEl = document.getElementById('gateCard');
  if (gateEl) {
    const statusColor = gate.status === 'open' ? 'color-green' : (gate.status === 'busy' ? 'color-yellow' : 'color-red');
    const badgeHtml = `<span class="badge ${gate.status === 'closed' ? 'badge-red' : (gate.status === 'busy' ? 'badge-yellow' : 'badge-green')}">${gate.status ? gate.status.toUpperCase() : 'OPEN'}</span>`;
    
    gateEl.innerHTML = `
      <div class="hero-split">
        <div class="hero-left">
          <div class="hero-label">Recommended Entry</div>
          <div class="hero-title ${statusColor}">${gate.label}</div>
          <div class="reason-text">${gate.reason}</div>
        </div>
        <div class="hero-right">
          <div class="hero-time">${gate.queueTime} <span style="font-size:1rem; font-weight:normal; color:#888;">min</span></div>
          ${badgeHtml}
          <button class="action-btn solid-btn" style="margin-top:12px; width:100%;" onclick="alert('Routing activated! Opening map directions to ${gate.label}...')">Route Me</button>
        </div>
      </div>
    `;
  }

  // 3. Render Alerts (Grouped by Severity, with Empty States)
  const alertEl = document.getElementById('alertCards');
  if (alertEl) {
    const activeAlerts = data.alerts.filter(a => !a.handled);
    
    if (activeAlerts.length === 0) {
      alertEl.innerHTML = `
        <div class="empty-state">
          <div style="font-size:2rem; margin-bottom:10px;">✅</div>
          <div class="card-title">All Systems Normal</div>
          <div class="reason-text">There are no active closures or severe delays right now. Enjoy the event!</div>
        </div>
      `;
    } else {
      // Sort by severity (high first)
      activeAlerts.sort((a, b) => {
        const priority = { 'high': 3, 'medium': 2, 'low': 1 };
        return priority[b.severity] - priority[a.severity];
      });

      alertEl.innerHTML = activeAlerts.map(a => {
        const sevClass = a.severity === 'high' ? 'alert-critical' : a.severity === 'medium' ? 'alert-warning' : 'alert-info';
        // Mock a timestamp relative to now for realism string
        return `
          <div class="card alert-card ${sevClass}">
            <div class="alert-header">
              <span class="badge badge-outline">${a.severity.toUpperCase()}</span>
              <span class="timestamp-badge">Just now</span>
            </div>
            <div class="card-title" style="margin-top:8px;">${a.message}</div>
            <div class="reason-text" style="color:#e0e0e0; font-weight:500;">➔ ${a.routeAdvice}</div>
          </div>
        `;
      }).join('');
    }
  }

  // 4. Render Nearby Facilities
  const facilities = getBestFacility(ctx.currentZone, data.facilities);
  const facEl = document.getElementById('facilitiesCards');
  if (facEl) {
    if (facilities.length === 0) {
      facEl.innerHTML = `<div class="empty-state">No facilities tracked in this zone.</div>`;
    } else {
      const icons = { washroom: '🚹', food: '🍔', merch: '🛒', medical: '🏥', atm: '🏧' };
      facEl.innerHTML = facilities.map(f => `
        <div class="card fac-card">
          <div class="fac-header">
            <div class="card-title" style="margin:0;">${icons[f.type] || '📌'} ${f.label}</div>
            <span class="badge badge-muted">${f.type.toUpperCase()}</span>
          </div>
          <div class="fac-body">
            <div>Wait: <span style="font-weight:700; color:#fff;">${f.queueTime} min</span></div>
            <div class="reason-text" style="margin:0;">${f.reason}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // 5. Render Interactive Virtual Stadium & Ground
  if (typeof window.renderVirtualVenue === 'function') {
    window.renderVirtualVenue({
      currentZone: ctx.currentZone,
      gates: data.gates,
      zones: data.zones,
      facilities: data.facilities,
      alerts: data.alerts,
      recommendedGate: gate
    });
  }
}

// Global mode selector (moved to Ops logic in opsScreen for Admin view, but kept here for fallback)
window.selectMode = function(mode) {
  const modeData = EVENT_TYPES.find(e => e.id === mode);
  const descEl = document.getElementById('modeDesc');
  if (descEl && modeData) descEl.textContent = modeData.description;
};
