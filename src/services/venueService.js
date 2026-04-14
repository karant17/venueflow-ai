// src/services/venueService.js
// Service layer: currently uses mock data.
// To connect Google Sheets/Apps Script, replace getData() with a fetch to your Apps Script web app URL.

window.venueService = (function () {
  // In-memory data store (swap with real API calls later)
  const store = {
    gates: null,
    zones: null,
    facilities: null,
    alerts: null,
    events: null
  };

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
  }

  return { getData };
})();
