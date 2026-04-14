// src/services/venueService.js
// Service layer: fetches live data from Google Apps Script Web App
// Falls back to mock data if the API is unavailable

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyM4Pz6U_ul0aZUKylfbLSd5fKDiYNphmfGxD8KExV9ySsBbmxgdQhjl2Gf-Eti4K6L/exec';

window.venueService = (function () {
  const cache = {};

<<<<<<< HEAD
  // Replace with actual Google Apps Script Web App URL
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_REPLACE_WITH_YOUR_ID/exec';

  async function getData() {
    try {
      // Add a cache buster or use no-cache to ensure fresh data
      const response = await fetch(APPS_SCRIPT_URL + '?action=getData', { cache: 'no-store' });
      const fetchedData = await response.json();
      
      store.gates = fetchedData.gates || store.gates || GATES;
      store.zones = fetchedData.zones || store.zones || ZONES;
      store.facilities = fetchedData.facilities || store.facilities || FACILITIES;
      store.alerts = fetchedData.alerts || store.alerts || ALERTS;
      store.events = fetchedData.events || store.events || EVENT_TYPES;
      
      return store;
    } catch (e) {
      console.warn("Fetch from Google Apps Script failed, falling back to mock data.", e);
      // Fallback
      if (!store.gates) store.gates = GATES;
      if (!store.zones) store.zones = ZONES;
      if (!store.facilities) store.facilities = FACILITIES;
      if (!store.alerts) store.alerts = ALERTS;
      if (!store.events) store.events = EVENT_TYPES;
      return store;
    }
=======
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
>>>>>>> 44a98751f0bcc3fe61c5c1a1d5d20b3c25173cc7
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
