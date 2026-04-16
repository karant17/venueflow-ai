// src/screens/opsScreen.js - Unified Operations & Admin Console

window.changeOpsMode = async function(mode) {
  window.currentOpsMode = mode;
  await renderOpsScreen();
};

async function renderOpsScreen() {
  const data = await window.venueService.getData();
  if (!window.currentOpsMode) window.currentOpsMode = 'sports';

  const isSimulated = true; // Use for demo badges

  // 1. Render Mode Switcher in the Header
  const opsModeSelector = document.getElementById('opsModeSelectorWrapper');
  if (opsModeSelector) {
    const modes = ['sports', 'concert', 'expo'];
    opsModeSelector.innerHTML = `
      <div class="segmented-tabs inline-tabs">
        ${modes.map(m => `
          <button class="tab-btn ${window.currentOpsMode === m ? 'active' : ''}" 
                  onclick="window.changeOpsMode('${m}')">
            ${m} Mode Thresholds
          </button>
        `).join('')}
      </div>
    `;
  }

  // 2. Render Overview KPIs
  const overviewEl = document.getElementById('overviewCards');
  if (overviewEl) {
    const openGates = data.gates.filter(g => g.status === 'open').length;
    const busyGates = data.gates.filter(g => g.status === 'busy').length;
    const closedGates = data.gates.filter(g => g.status === 'closed').length;
    const activeAlerts = data.alerts.filter(a => !a.handled).length;
    const highZones = data.zones.filter(z => z.congestion === 'high').length;

    overviewEl.innerHTML = `
      <div class="card kpi-card">
        <div class="kpi-title">Total Gates</div>
        <div class="kpi-value">${data.gates.length}</div>
        <div class="kpi-subtext">
          <span class="color-green">${openGates} Open</span> &bull; 
          <span class="color-yellow">${busyGates} Busy</span> &bull; 
          <span class="color-red">${closedGates} Closed</span>
        </div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-title">Active AI Alerts</div>
        <div class="kpi-value ${activeAlerts > 0 ? 'color-red' : 'color-green'}">${activeAlerts}</div>
        <div class="kpi-subtext">${activeAlerts > 0 ? 'Requires Immediate Action' : 'All Clear'}</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-title">High Congestion Zones</div>
        <div class="kpi-value ${highZones > 0 ? 'color-yellow' : 'color-green'}">${highZones}</div>
        <div class="kpi-subtext">${highZones > 0 ? 'Manual route diversion recommended' : 'Flow is optimal'}</div>
      </div>
      <div class="card kpi-card">
        <div class="kpi-title">Facilities Online</div>
        <div class="kpi-value">${data.facilities.filter(f=>f.available).length} <span style="font-size:1rem;color:#888;">/ ${data.facilities.length}</span></div>
        <div class="kpi-subtext">All essential services operational</div>
      </div>
    `;
  }

  // 3. Zone Congestion Map
  const zoneEl = document.getElementById('zoneCards');
  if (zoneEl) {
    zoneEl.innerHTML = data.zones.map(z => {
      const badgeClass = z.congestion === 'high' ? 'badge-red' : z.congestion === 'medium' ? 'badge-yellow' : 'badge-green';
      const trendIcon = z.trend === 'rising' ? '↗' : z.trend === 'falling' ? '↘' : '→';
      return `
        <div class="card list-card">
          <div class="list-card-left">
            <div class="card-title">${z.label}</div>
            <div class="reason-text">Vol: <span style="color:#fff;">${z.crowdCount.toLocaleString()}</span> &nbsp;|&nbsp; Trend: <span style="color:#fff;">${trendIcon} ${z.trend}</span></div>
          </div>
          <div class="list-card-right">
            <span class="badge ${badgeClass}">${z.congestion.toUpperCase()}</span>
          </div>
        </div>`;
    }).join('');
  }

  // 4. Live Queue Board
  const queueEl = document.getElementById('queueCards');
  if (queueEl) {
    let redThreshold = window.currentOpsMode === 'sports' ? 20 : (window.currentOpsMode === 'expo' ? 10 : 15);
    let yellowThreshold = window.currentOpsMode === 'sports' ? 10 : (window.currentOpsMode === 'expo' ? 5 : 7);

    const sorted = [...data.gates].sort((a,b) => b.queueTime - a.queueTime);
    queueEl.innerHTML = sorted.map((g, i) => {
      const isCritical = g.queueTime >= redThreshold;
      const isWarning = g.queueTime >= yellowThreshold;
      const badgeClass = g.status === 'closed' ? 'badge-red' : (isCritical ? 'badge-red' : isWarning ? 'badge-yellow' : 'badge-green');
      
      return `
        <div class="card queue-card ${isCritical ? 'queue-critical' : ''}">
          <div class="queue-left">
            <div class="queue-rank">#${i+1}</div>
            <div class="card-title" style="margin:0;">${g.label}</div>
          </div>
          <div class="queue-right">
            <div class="queue-time">${g.queueTime} <span>min</span></div>
            <span class="badge ${badgeClass}" style="width:60px; text-align:center;">${g.status.toUpperCase()}</span>
          </div>
        </div>`;
    }).join('');
  }

  // 5. Ops Alerts
  const opsAlertEl = document.getElementById('opsAlertCards');
  if (opsAlertEl) {
    const activeAlerts = data.alerts.filter(a => !a.handled);
    
    if (activeAlerts.length === 0) {
      opsAlertEl.innerHTML = `
        <div class="empty-state" style="padding: 20px;">
          <div class="card-title">No Active Alerts</div>
        </div>
      `;
    } else {
      opsAlertEl.innerHTML = activeAlerts.map(a => {
        const sevClass = a.severity === 'high' ? 'alert-critical' : a.severity === 'medium' ? 'alert-warning' : 'alert-info';
        return `
          <div class="card alert-card ${sevClass}">
            <div class="alert-header">
              <span class="badge badge-outline">${a.severity.toUpperCase()}</span>
              <span>SYSTEM EVENT</span>
            </div>
            <div class="card-title" style="margin-top:8px;">${a.message}</div>
            <div class="reason-text" style="color:#e0e0e0; margin-bottom:12px;">➔ Advice: ${a.routeAdvice}</div>
            <button class="action-btn" onclick="handleAlert('${a.id}')">Acknowledge & Resolve</button>
          </div>`;
      }).join('');
    }
  }

  // 6. Local Overrides Console (Merged from adminScreen)
  const gatesConsole = document.getElementById('adminGatesCards');
  if (gatesConsole) {
    gatesConsole.innerHTML = data.gates.map(g => `
      <div class="card console-card">
        <div class="card-title" style="margin-bottom:12px;">${g.label}</div>
        <div class="console-row">
          <label>Wait Time:</label>
          <input type="number" id="override-gate-time-${g.id}" value="${g.queueTime}" class="console-input" />
        </div>
        <div class="console-row">
          <label>Status:</label>
          <select id="override-gate-status-${g.id}" class="console-input">
            <option value="open" ${g.status === 'open' ? 'selected' : ''}>Open</option>
            <option value="busy" ${g.status === 'busy' ? 'selected' : ''}>Busy</option>
            <option value="closed" ${g.status === 'closed' ? 'selected' : ''}>Closed</option>
          </select>
        </div>
        <button class="action-btn solid-btn" onclick="saveGateAdmin('${g.id}')">Apply</button>
      </div>
    `).join('');
  }

  const facConsole = document.getElementById('adminFacCards');
  if (facConsole) {
    facConsole.innerHTML = data.facilities.map(f => `
      <div class="card console-card">
        <div class="card-title" style="margin-bottom:12px;">${f.label}</div>
        <div class="console-row">
          <label>Wait Time:</label>
          <input type="number" id="override-fac-time-${f.id}" value="${f.queueTime}" class="console-input" />
        </div>
        <div class="console-row">
          <label>Availability:</label>
          <select id="override-fac-avail-${f.id}" class="console-input">
            <option value="true" ${f.available ? 'selected' : ''}>Online</option>
            <option value="false" ${!f.available ? 'selected' : ''}>Offline</option>
          </select>
        </div>
        <button class="action-btn solid-btn" onclick="saveFacilityAdmin('${f.id}')">Apply</button>
      </div>
    `).join('');
  }
}

// Ops Alert Handlers
window.handleAlert = async function(alertId) {
  const data = await window.venueService.getData();
  const alert = data.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.handled = true;
    await window.venueService.saveData(data); // Sync local override so it stays acknowledged
    await renderOpsScreen();
  }
}

// Unified Admin Overrides Triggers
window.saveGateAdmin = async function(gateId) {
  const timeInput = document.getElementById(`override-gate-time-${gateId}`).value;
  const statusInput = document.getElementById(`override-gate-status-${gateId}`).value;
  
  await window.venueService.updateGate(gateId, timeInput, statusInput);
  await renderOpsScreen(); // instant visual refresh
};

window.saveFacilityAdmin = async function(facId) {
  const timeInput = document.getElementById(`override-fac-time-${facId}`).value;
  const availInput = document.getElementById(`override-fac-avail-${facId}`).value === 'true';
  
  await window.venueService.updateFacility(facId, timeInput, availInput);
  await renderOpsScreen(); // instant visual refresh
};

window.resetAdminData = async function() {
  if (confirm("Are you sure you want to clear all offline overrides and sync back to defaults?")) {
    await window.venueService.resetData();
    await renderOpsScreen();
  }
};
