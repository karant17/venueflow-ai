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

  function getData() {
    // Lazy-load from mock globals (defined in data files)
    if (!store.gates) store.gates = GATES;
    if (!store.zones) store.zones = ZONES;
    if (!store.facilities) store.facilities = FACILITIES;
    if (!store.alerts) store.alerts = ALERTS;
    if (!store.events) store.events = EVENT_TYPES;
    return store;
  }

  // Future: replace this with fetch to Apps Script endpoint
  // async function fetchFromSheets() {
  //   const res = await fetch('YOUR_APPS_SCRIPT_URL?action=getData');
  //   return res.json();
  // }

  return { getData };
})();
