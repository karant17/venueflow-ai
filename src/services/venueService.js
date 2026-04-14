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
    return {
      gates: await getGates(),
      zones: await getZones(),
      facilities: await getFacilities(),
      alerts: await getAlerts(),
      events: typeof EVENT_TYPES !== 'undefined' ? EVENT_TYPES : []
    };
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

  return { getGates, getZones, getFacilities, getAlerts, getAllData, getData, postAlert };
})();
