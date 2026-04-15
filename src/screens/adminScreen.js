// src/screens/adminScreen.js - Local Data Management UI

async function renderAdminScreen() {
  const data = await window.venueService.getData();

  const adminEl = document.getElementById('adminPanelCards');
  if (adminEl) {
    adminEl.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; display:flex; justify-content:space-between; align-items:center; background:#162040;">
        <div class="card-title" style="margin:0;">Local Data Override Panel</div>
        <button class="action-btn" style="margin:0; background:#ef5350;" onclick="resetAdminData()">Reset to Defaults / Cloud</button>
      </div>
      
      <!-- Gates Management -->
      <div style="grid-column: 1 / -1;"><h3 style="color:#8ab4f8; margin-top: 10px;">Manage Gates</h3></div>
      ${data.gates.map(g => `
        <div class="card">
          <div class="card-title">${g.label}</div>
          <div style="margin: 10px 0;">
            <label style="display:inline-block; width:110px;">Wait Time (min):</label>
            <input type="number" id="gate-time-${g.id}" value="${g.queueTime}" style="width: 70px; padding: 4px; background:#1a1d27; color:#fff; border:1px solid #444; border-radius:4px;" />
          </div>
          <div style="margin-bottom: 10px;">
            <label style="display:inline-block; width:110px;">Status:</label>
            <select id="gate-status-${g.id}" style="width: 70px; padding: 4px; background:#1a1d27; color:#fff; border:1px solid #444; border-radius:4px;">
              <option value="open" ${g.status === 'open' ? 'selected' : ''}>Open</option>
              <option value="busy" ${g.status === 'busy' ? 'selected' : ''}>Busy</option>
              <option value="closed" ${g.status === 'closed' ? 'selected' : ''}>Closed</option>
            </select>
          </div>
          <button class="action-btn" onclick="saveGateAdmin('${g.id}')">Save Overrides</button>
        </div>
      `).join('')}

      <!-- Facilities Management -->
      <div style="grid-column: 1 / -1;"><h3 style="color:#8ab4f8; margin-top: 20px;">Manage Facilities</h3></div>
      ${data.facilities.map(f => `
        <div class="card">
          <div class="card-title">${f.label}</div>
          <div style="margin: 10px 0;">
            <label style="display:inline-block; width:110px;">Wait Time (min):</label>
            <input type="number" id="fac-time-${f.id}" value="${f.queueTime}" style="width: 70px; padding: 4px; background:#1a1d27; color:#fff; border:1px solid #444; border-radius:4px;" />
          </div>
          <div style="margin-bottom: 10px;">
            <label style="display:inline-block; width:110px;">Available:</label>
            <select id="fac-avail-${f.id}" style="width: 70px; padding: 4px; background:#1a1d27; color:#fff; border:1px solid #444; border-radius:4px;">
              <option value="true" ${f.available ? 'selected' : ''}>Yes</option>
              <option value="false" ${!f.available ? 'selected' : ''}>No</option>
            </select>
          </div>
          <button class="action-btn" onclick="saveFacilityAdmin('${f.id}')">Save Overrides</button>
        </div>
      `).join('')}
    `;
  }
}

window.saveGateAdmin = async function(gateId) {
  const timeInput = document.getElementById(`gate-time-${gateId}`).value;
  const statusInput = document.getElementById(`gate-status-${gateId}`).value;
  
  await window.venueService.updateGate(gateId, timeInput, statusInput);
  
  alert('Gate Updated Locally! Other tabs will now reflect this change.');
  await renderAdminScreen();
};

window.saveFacilityAdmin = async function(facId) {
  const timeInput = document.getElementById(`fac-time-${facId}`).value;
  const availInput = document.getElementById(`fac-avail-${facId}`).value === 'true';
  
  await window.venueService.updateFacility(facId, timeInput, availInput);
  
  alert('Facility Updated Locally! Other tabs will now reflect this change.');
  await renderAdminScreen();
};

window.resetAdminData = async function() {
  if (confirm("Are you sure you want to clear all offline overrides and reload from the cloud/defaults?")) {
    await window.venueService.resetData();
    alert("Reset successful.");
    await renderAdminScreen();
  }
};
