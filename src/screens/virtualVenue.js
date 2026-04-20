// src/screens/virtualVenue.js - Interactive Virtual Stadium & Ground module
// This module provides a visual representation of the venue, replacing static
// maps with an interactive SVG layout.

// Internal state of the virtual venue component
const vsState = {
  layout: 'concert', // concert, cricket, football
  showFacilities: true,
  showHeatmap: true,
  selectedElement: null, // { type: 'gate'|'zone'|'facility', id: '...' }
  selectedElementObj: null,
  data: {
    currentZone: 'north',
    gates: [],
    zones: [],
    facilities: [],
    alerts: [],
    recommendedGate: null
  }
};

/**
 * Initializes and renders the Virtual Venue component
 * @param {Object} options Options payload from attendeeScreen
 */
window.renderVirtualVenue = function(options) {
  // Update internal state with latest data
  vsState.data = options;
  
  // If the user hasn't selected anything, default to their current zone or recommended gate
  if (!vsState.selectedElement) {
    if (options.recommendedGate && options.recommendedGate.gateId) {
      vsState.selectedElement = { type: 'gate', id: options.recommendedGate.gateId };
      vsState.selectedElementObj = options.gates.find(g => g.id === options.recommendedGate.gateId);
    } else {
      vsState.selectedElement = { type: 'zone', id: options.currentZone };
      vsState.selectedElementObj = options.zones.find(z => z.id === options.currentZone);
    }
  }

  const container = document.getElementById('virtualVenueContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="virtual-stadium-wrapper">
      <div class="virtual-stadium-controls">
        <div class="vs-control-group">
          <button class="vs-btn ${vsState.layout === 'concert' ? 'active' : ''}" onclick="window.vsChangeLayout('concert')">Concert</button>
          <button class="vs-btn ${vsState.layout === 'cricket' ? 'active' : ''}" onclick="window.vsChangeLayout('cricket')">Cricket</button>
          <button class="vs-btn ${vsState.layout === 'football' ? 'active' : ''}" onclick="window.vsChangeLayout('football')">Football</button>
        </div>
        <div class="vs-control-group">
          <button class="vs-btn ${vsState.showFacilities ? 'active' : ''}" onclick="window.vsToggleFacilities()">Facilities</button>
          <button class="vs-btn ${vsState.showHeatmap ? 'active' : ''}" onclick="window.vsToggleHeatmap()">Heatmap</button>
        </div>
      </div>
      <div class="virtual-stadium-layout">
        <div class="virtual-stadium-map-container" id="vsMapArea">
          ${renderSvgMap()}
        </div>
        <div class="virtual-stadium-info" id="vsInfoArea">
          ${renderInfoPanel()}
        </div>
      </div>
    </div>
  `;
};

// Global handlers for UI events
window.vsChangeLayout = function(layout) {
  vsState.layout = layout;
  window.renderVirtualVenue(vsState.data);
};

window.vsToggleFacilities = function() {
  vsState.showFacilities = !vsState.showFacilities;
  window.renderVirtualVenue(vsState.data);
};

window.vsToggleHeatmap = function() {
  vsState.showHeatmap = !vsState.showHeatmap;
  window.renderVirtualVenue(vsState.data);
};

window.vsSelectElement = function(type, id) {
  vsState.selectedElement = { type, id };
  
  if (type === 'gate') {
    vsState.selectedElementObj = vsState.data.gates.find(g => g.id === id);
    // Add specific behavior for clicks on gate if needed
  } else if (type === 'zone') {
    vsState.selectedElementObj = vsState.data.zones.find(z => z.id === id) || { id, label: id.charAt(0).toUpperCase() + id.slice(1) };
  } else if (type === 'facility') {
    vsState.selectedElementObj = vsState.data.facilities.find(f => f.id === id);
  }
  
  window.renderVirtualVenue(vsState.data);
};

window.vsRouteToRecommended = function() {
  if (vsState.data.recommendedGate && vsState.data.recommendedGate.gateId) {
    window.vsSelectElement('gate', vsState.data.recommendedGate.gateId);
  }
};

/**
 * Renders the SVG Map based on current layout and data
 */
function renderSvgMap() {
  const { currentZone, gates, zones, facilities, recommendedGate } = vsState.data;
  
  // Base coordinates mapping for the visualization
  const positions = {
    // Zones/Stands
    zones: {
      north: { cx: 250, cy: 60, path: "M 100 80 Q 250 20 400 80 L 350 120 Q 250 80 150 120 Z" },
      east:  { cx: 440, cy: 250, path: "M 420 100 Q 480 250 420 400 L 380 350 Q 420 250 380 150 Z" },
      south: { cx: 250, cy: 440, path: "M 100 420 Q 250 480 400 420 L 350 380 Q 250 420 150 380 Z" },
      west:  { cx: 60, cy: 250, path: "M 80 100 Q 20 250 80 400 L 120 350 Q 80 250 120 150 Z" }
    },
    // Gates
    gates: {
      'g-north': { cx: 250, cy: 40 },
      'g-east':  { cx: 460, cy: 250 },
      'g-south': { cx: 250, cy: 460 },
      'g-west':  { cx: 40, cy: 250 }
    },
    // User position based on current zone
    user: {
      north: { cx: 250, cy: 90 },
      east:  { cx: 410, cy: 250 },
      south: { cx: 250, cy: 410 },
      west:  { cx: 90, cy: 250 },
      central: { cx: 250, cy: 250 }
    },
    // Generic layout boundaries
    fieldRect: { x: 120, y: 120, width: 260, height: 260, rx: 60 }
  };

  // Determine user location
  const userPos = positions.user[currentZone] || positions.user.north;

  // Determine target gate/route
  let routePath = '';
  if (vsState.selectedElement && vsState.selectedElement.type === 'gate') {
    const gatePos = positions.gates[vsState.selectedElement.id];
    if (gatePos) {
      // Create a smooth curve from user to gate
      routePath = `<path class="st-route" d="M ${userPos.cx} ${userPos.cy} Q 250 250 ${gatePos.cx} ${gatePos.cy}" />`;
    }
  } else if (recommendedGate && recommendedGate.gateId) {
    const gatePos = positions.gates[recommendedGate.gateId];
    if (gatePos) {
      routePath = `<path class="st-route" d="M ${userPos.cx} ${userPos.cy} Q 250 250 ${gatePos.cx} ${gatePos.cy}" />`;
    }
  }

  // Draw Heatmap circles if enabled
  let heatmapHtml = '';
  if (vsState.showHeatmap) {
    zones.forEach(z => {
      if (z.congestion === 'high' && positions.zones[z.id]) {
        const p = positions.zones[z.id];
        heatmapHtml += `<circle cx="${p.cx}" cy="${p.cy}" r="60" class="st-heatmap" style="opacity: 0.3;" />`;
      } else if (z.congestion === 'medium' && positions.zones[z.id]) {
        const p = positions.zones[z.id];
        heatmapHtml += `<circle cx="${p.cx}" cy="${p.cy}" r="40" class="st-heatmap" style="fill: var(--color-yellow); opacity: 0.2;" />`;
      }
    });
  }

  // Generate Field Layout
  let layoutHtml = '';
  if (vsState.layout === 'concert') {
    layoutHtml = `
      <rect x="180" y="140" width="140" height="60" rx="4" class="st-stage" />
      <text x="250" y="170" class="st-text" style="font-size: 12px; fill: #fff;">STAGE</text>
      <rect x="170" y="210" width="160" height="80" rx="10" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="rgba(45, 108, 223, 0.1)" />
      <text x="250" y="250" class="st-text" style="font-size: 10px;">FAN PIT</text>
    `;
  } else if (vsState.layout === 'cricket') {
    layoutHtml = `
      <ellipse cx="250" cy="250" rx="110" ry="110" class="st-pitch" />
      <rect x="235" y="200" width="30" height="100" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
      <line x1="235" y1="220" x2="265" y2="220" class="st-pitch" />
      <line x1="235" y1="280" x2="265" y2="280" class="st-pitch" />
    `;
  } else if (vsState.layout === 'football') {
    layoutHtml = `
      <rect x="140" y="130" width="220" height="240" class="st-pitch" stroke-width="2" />
      <line x1="140" y1="250" x2="360" y2="250" class="st-pitch" stroke-width="2" />
      <circle cx="250" cy="250" r="30" class="st-pitch" />
      <rect x="200" y="130" width="100" height="40" class="st-pitch" />
      <rect x="200" y="330" width="100" height="40" class="st-pitch" />
    `;
  }

  // Draw facilities
  let facilitiesHtml = '';
  if (vsState.showFacilities) {
    const facIcons = { washroom: 'WC', food: '🍔', merch: '🛒', medical: '🏥', atm: '🏧' };
    facilities.forEach((fac, idx) => {
      // Mock positions for facilities
      const facPositions = [
        { x: 180, y: 70 }, { x: 320, y: 70 }, 
        { x: 420, y: 180 }, { x: 420, y: 320 },
        { x: 180, y: 430 }, { x: 320, y: 430 },
        { x: 80, y: 180 }, { x: 80, y: 320 }
      ];
      
      const pos = facPositions[idx % facPositions.length];
      const isSelected = vsState.selectedElement && vsState.selectedElement.id === fac.id;
      
      facilitiesHtml += `
        <g onclick="window.vsSelectElement('facility', '${fac.id}')">
          <circle cx="${pos.x}" cy="${pos.y}" r="14" class="st-facility ${isSelected ? 'active' : ''}" />
          <text x="${pos.x}" y="${pos.y+1}" class="st-fac-icon">${facIcons[fac.type] || '📌'}</text>
        </g>
      `;
    });
  }

  // Draw Gates
  const gateMapHtml = gates.map(g => {
    const pos = positions.gates[g.id];
    if (!pos) return '';
    
    // Status visual
    const statusClass = g.status === 'open' ? 'gate-open' : (g.status === 'busy' ? 'gate-busy' : 'gate-closed');
    const isSelected = vsState.selectedElement && vsState.selectedElement.id === g.id;
    const isRecommended = recommendedGate && recommendedGate.gateId === g.id;
    
    // Add pulsing effect for recommended gate if not currently selected
    const pulseHtml = (isRecommended && !isSelected) ? 
      `<circle cx="${pos.cx}" cy="${pos.cy}" r="12" fill="var(--accent-light)" opacity="0.4" animation="st-pulse 2s infinite" style="pointer-events:none"/>` : '';

    return `
      <g onclick="window.vsSelectElement('gate', '${g.id}')">
        ${pulseHtml}
        <circle cx="${pos.cx}" cy="${pos.cy}" r="${isSelected ? 12 : 9}" class="st-gate ${statusClass} ${isSelected ? 'active' : ''}" />
        <text x="${pos.cx + (pos.cx>250 ? 18 : -18)}" y="${pos.cy + 4}" style="fill:#fff; font-size:10px; font-weight:bold; pointer-events:none;" text-anchor="${pos.cx>250 ? 'start' : 'end'}">${g.label}</text>
      </g>
    `;
  }).join('');

  // Assemble the SVG
  return `
    <svg class="stadium-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer boundary -->
      <circle cx="250" cy="250" r="230" class="st-bowl" />
      
      <!-- Central Field Surface -->
      <rect x="${positions.fieldRect.x}" y="${positions.fieldRect.y}" width="${positions.fieldRect.width}" height="${positions.fieldRect.height}" rx="${positions.fieldRect.rx}" class="st-field" />
      
      <!-- Heatmap (beneath stands and layout) -->
      ${heatmapHtml}
      
      <!-- Event Layout -->
      ${layoutHtml}
      
      <!-- Stands / Zones -->
      ${Object.keys(positions.zones).map(zId => {
        const isSelected = vsState.selectedElement && vsState.selectedElement.id === zId;
        const isUserZone = currentZone === zId;
        return `
          <path 
            d="${positions.zones[zId].path}" 
            class="st-stand ${isSelected ? 'active' : ''}" 
            onclick="window.vsSelectElement('zone', '${zId}')"
          />
          <text x="${positions.zones[zId].cx}" y="${positions.zones[zId].cy}" class="st-text">${zId.toUpperCase()}</text>
          ${isUserZone ? `<text x="${positions.zones[zId].cx}" y="${positions.zones[zId].cy + 16}" style="fill: var(--accent-light); font-size: 10px; font-weight: bold; text-anchor: middle;">YOU ARE HERE</text>` : ''}
        `;
      }).join('')}
      
      <!-- Routing Path -->
      ${routePath}
      
      <!-- User Indicator -->
      <g transform="translate(${userPos.cx}, ${userPos.cy})">
        <circle cx="0" cy="0" r="6" class="st-user-pulse" />
        <circle cx="0" cy="0" r="5" class="st-user" />
      </g>
      
      <!-- Facilities -->
      ${facilitiesHtml}
      
      <!-- Gates -->
      ${gateMapHtml}
    </svg>
  `;
}

/**
 * Renders the Info Panel on the right side
 */
function renderInfoPanel() {
  const { recommendedGate, currentZone } = vsState.data;
  
  if (!vsState.selectedElement || !vsState.selectedElementObj) {
    return `<div class="vsi-header">Map Information</div>
            <div class="reason-text">Select an element on the map to see details.</div>`;
  }

  const type = vsState.selectedElement.type;
  const obj = vsState.selectedElementObj;
  
  let content = '';

  if (type === 'gate') {
    const isRecommended = recommendedGate && recommendedGate.gateId === obj.id;
    const badgeHtml = obj.status === 'open' ? `<span class="badge badge-green">OPEN</span>` : 
                     (obj.status === 'busy' ? `<span class="badge badge-yellow">BUSY</span>` : `<span class="badge badge-red">CLOSED</span>`);
    
    content = `
      <div class="vsi-header">Gate Selected</div>
      <div class="vsi-card">
        <div class="vsi-title">${obj.label} ${badgeHtml}</div>
        <div class="vsi-detail">Queue Time: <strong>${obj.queueTime} min</strong></div>
        <div class="vsi-detail">Zone: <strong>${obj.zone}</strong></div>
        ${isRecommended ? `<div class="badge badge-outline" style="margin-top:8px; border-color:var(--accent-light); color:var(--accent-light);">⭐ Recommended for you</div>` : ''}
      </div>
      ${!isRecommended && obj.status !== 'closed' ? `
        <button class="action-btn" style="width:100%; margin-top:8px;" onclick="alert('Routing to ${obj.label}...')">Route to this gate</button>
      ` : ''}
      <button class="action-btn solid-btn" style="width:100%; margin-top:10px;" onclick="window.vsRouteToRecommended()">Show Recommended Gate Route</button>
    `;
  } else if (type === 'zone') {
    // For zone, display congestion
    const zoneData = vsState.data.zones.find(z => z.id === obj.id) || { congestion: 'low', crowdCount: 0 };
    const badgeHtml = zoneData.congestion === 'low' ? `<span class="badge badge-green">LOW TRAFFIC</span>` : 
                     (zoneData.congestion === 'medium' ? `<span class="badge badge-yellow">MODERATE Traffic</span>` : `<span class="badge badge-red">HEAVY TRAFFIC</span>`);
                     
    content = `
      <div class="vsi-header">Zone Selected</div>
      <div class="vsi-card">
        <div class="vsi-title">${obj.label || obj.id.toUpperCase()} Stand</div>
        <div style="margin-bottom: 8px;">${badgeHtml}</div>
        <div class="vsi-detail">Current Load: <strong>${zoneData.crowdCount} people</strong></div>
        ${obj.id === currentZone ? `<div class="badge badge-outline" style="margin-top:8px;">📍 Your Current Zone</div>` : ''}
      </div>
    `;
  } else if (type === 'facility') {
    const icons = { washroom: '🚹', food: '🍔', merch: '🛒', medical: '🏥', atm: '🏧' };
    content = `
      <div class="vsi-header">Facility Selected</div>
      <div class="vsi-card">
        <div class="vsi-title">${icons[obj.type] || '📌'} ${obj.label}</div>
        <div class="vsi-detail">Type: <strong>${obj.type.toUpperCase()}</strong></div>
        <div class="vsi-detail">Zone: <strong>${obj.zone}</strong></div>
        <div class="vsi-detail">Wait Time: <strong>${obj.queueTime || 0} min</strong></div>
      </div>
    `;
  }

  // Include general map tips
  content += `
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
      <div class="vsi-header" style="margin-bottom: 8px;">Map Legend</div>
      <div class="vsi-detail" style="display:flex; align-items:center; gap:6px;"><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--color-green);"></span> Open Gate</div>
      <div class="vsi-detail" style="display:flex; align-items:center; gap:6px;"><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--color-yellow);"></span> Busy Gate</div>
      <div class="vsi-detail" style="display:flex; align-items:center; gap:6px;"><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--color-red);"></span> Closed Gate</div>
      <div class="vsi-detail" style="display:flex; align-items:center; gap:6px; margin-top:8px;"><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--accent);"></span> You are here</div>
    </div>
  `;

  return content;
}
