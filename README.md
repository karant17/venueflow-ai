# VenueFlow AI

**Dual-Interface Venue Experience Intelligence Platform**

VenueFlow AI guides attendees in real-time and helps operations teams monitor congestion, queues, and alerts — all in one lightweight, web-first application.

---

## What It Does

| Role | What They See |
|---|---|
| **Attendee** | Best gate recommendation, nearby facilities with wait times, live alerts & route guidance |
| **Operations** | Zone congestion map, queue status board, AI action recommendations, alert management |

The app supports three event modes: **Sports**, **Concert**, and **Expo**.

---

## How To Run

1. Clone the repository:
   ```bash
   git clone https://github.com/karant17/venueflow-ai.git
   cd venueflow-ai
   ```
2. Open `index.html` directly in your browser — no build step, no server needed.
3. Use the **Attendee / Operations** toggle at the top to switch roles.
4. Use the **Sports / Concert / Expo** buttons to switch event mode.

---

## Project Structure

```
/src
  /components    - styles.css (global responsive stylesheet)
  /data          - mock data: gates, zones, facilities, alerts, events
  /logic         - recommendationLogic.js (pure AI decision functions)
  /screens       - attendeeScreen.js, opsScreen.js (UI rendering)
  /services      - venueService.js (data access layer, ready for Sheets integration)
  /utils         - helpers.js (formatting and display helpers)
  main.js        - app entry point, role switching
index.html       - single page app shell
```

---

## AI Logic (Explainable Decisions)

All decisions return a `reason` field so every recommendation is transparent:

| Function | What It Does |
|---|---|
| `getBestGate(zone, gates)` | Finds nearest open gate with shortest queue |
| `getBestFacility(zone, facilities)` | Finds closest washroom, food, merch by zone |
| `getAttendeeAlert(mode, zones, alerts)` | Returns highest-priority unhandled alert |
| `getOpsRecommendation(zones, gates)` | Flags critical zones and suggests crowd redirection |

---

## Google Integration (Future)

The `venueService.js` file is pre-wired for Google Sheets + Apps Script. To connect real data:

1. Create a Google Sheet with tabs: Gates, Zones, Facilities, Alerts.
2. Deploy a Google Apps Script as a Web App that returns JSON.
3. Replace the `getData()` function in `venueService.js` with a `fetch()` call to your Apps Script URL.

---

## Tech Stack

- Pure HTML / CSS / JavaScript — no frameworks, no build tools
- Responsive and mobile-ready (PWA-friendly layout)
- Modular layered architecture: UI → Logic → Service → Data
- Under 1 MB total (submission-safe)
- Single branch: `main`

---

## License

MIT — see [LICENSE](LICENSE)
