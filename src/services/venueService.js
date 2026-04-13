// src/services/venueService.js
// Service layer: fetches live data from Google Apps Script Web App
// Falls back to mock data if the API is unavailable

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyM4Pz6U_ul0aZUKylfbLSd5fKDiYNphmfGxD8KExV9ySsBbmxgdQhjl2Gf-Eti4K6L/exec';

window.venueService = (function () {
  const cache = {};

  async function fetchSheet(sheet) {
    if (cache[sheet]) return cache[sheet];
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?sheet=${sheet}`);
      if (!res.ok) throw new Error('Network response not ok');
      const json = await res.json();
      cache[sheet] = json.data || json;
      return cache[sheet];
    } catch (e) {
      console.warn(`[venueService] Falling back to mock for ${sheet}:`, e);
      return null;
    }
  }

  async function getGates() {
    const data = await fetchSheet('Gates');
    return data || (window.GATES || []);
  }

  async function getZones() {
    const data = await fetchSheet('Zones');
    return data || (window.ZONES || []);
  }

  async function getFacilities() {
    const data = await fetchSheet('Facilities');
    return data || (window.FACILITIES || []);
  }

  async function getAlerts() {
    const data = await fetchSheet('Alerts');
    return data || (window.ALERTS || []);
  }

  async function getAllData() {
    const [gates, zones, facilities, alerts] = await Promise.all([
      getGates(), getZones(), getFacilities(), getAlerts()
    ]);
    return { gates, zones, facilities, alerts };
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

  return { getGates, getZones, getFacilities, getAlerts, getAllData, postAlert };
})();
