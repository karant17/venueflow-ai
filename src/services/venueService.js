// src/services/venueService.js
// Service layer: fetches live data from Google Apps Script Web App
// Falls back to mock data if the API is unavailable

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXlEL_WzVsyb5OCzLvO7BlWGrAx3NR32k1CwEzQ4HdSuxK1DEAkqR0tBGbSmWn_Fgz/exec';

window.venueService = (function () {
  let cache = null;

  async function fetchAllRemoteData() {
    if (cache) return cache;
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getData`);
      if (!res.ok) throw new Error('Network response not ok');
      const json = await res.json();

      cache = {
        gates: json.gates || json.Gates,
        zones: json.zones || json.Zones,
        facilities: json.facilities || json.Facilities,
        alerts: json.alerts || json.Alerts
      };
      return cache;
    } catch (e) {
      console.warn('[venueService] Falling back to mock data:', e);
      return null;
    }
  }

  async function getGates() {
    const data = await fetchAllRemoteData();
    return (data && data.gates) ? data.gates : (typeof GATES !== 'undefined' ? GATES : []);
  }

  async function getZones() {
    const data = await fetchAllRemoteData();
    return (data && data.zones) ? data.zones : (typeof ZONES !== 'undefined' ? ZONES : []);
  }

  async function getFacilities() {
    const data = await fetchAllRemoteData();
    return (data && data.facilities) ? data.facilities : (typeof FACILITIES !== 'undefined' ? FACILITIES : []);
  }

  async function getAlerts() {
    const data = await fetchAllRemoteData();
    return (data && data.alerts) ? data.alerts : (typeof ALERTS !== 'undefined' ? ALERTS : []);
  }

  async function getAllData() {
    // 1. Check if LocalStorage overrides exist
    const local = localStorage.getItem('venueData');
    if (local) {
      return JSON.parse(local);
    }

    // 2. Fallback to API / Mock Data
    return {
      gates: await getGates(),
      zones: await getZones(),
      facilities: await getFacilities(),
      alerts: await getAlerts(),
      events: typeof EVENT_TYPES !== 'undefined' ? EVENT_TYPES : []
    };
  }

  async function saveData(newData) {
    localStorage.setItem('venueData', JSON.stringify(newData));
    cache = null; // force clear to avoid stale data 
  }

  async function updateGate(gateId, queueTime, status) {
    const data = await getAllData();
    const idx = data.gates.findIndex(g => g.id === gateId);
    if (idx > -1) {
      data.gates[idx].queueTime = parseInt(queueTime, 10);
      data.gates[idx].status = status;
      await saveData(data);
    }
  }

  async function updateFacility(facId, queueTime, available) {
    const data = await getAllData();
    const idx = data.facilities.findIndex(f => f.id === facId);
    if (idx > -1) {
      data.facilities[idx].queueTime = parseInt(queueTime, 10);
      data.facilities[idx].available = available;
      await saveData(data);
    }
  }

  async function resetData() {
    localStorage.removeItem('venueData');
    cache = null;
  }

  // Alias getAllData to getData to maintain compatibility with attendeeScreen.js and opsScreen.js
  async function getData() {
    return await getAllData();
  }

  async function postAlert(alertData) {
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ sheet: 'Alerts', data: alertData })
      });
      return await res.json();
    } catch (e) {
      console.error('[venueService] Failed to post alert:', e);
      return { error: e.message };
    }
  }

  return { 
    getGates, 
    getZones, 
    getFacilities, 
    getAlerts, 
    getAllData, 
    getData, 
    postAlert,
    updateGate,
    updateFacility,
    resetData 
  };
})();
