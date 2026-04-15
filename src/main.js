// src/main.js - App entry point: initialises both interfaces

let currentRole = 'attendee';

async function switchRole(role) {
  currentRole = role;

  // Toggle views
  document.getElementById('attendeeView').classList.toggle('active', role === 'attendee');
  document.getElementById('opsView').classList.toggle('active', role === 'ops');
  document.getElementById('adminView').classList.toggle('active', role === 'admin');

  // Toggle header buttons
  document.getElementById('btnAttendee').classList.toggle('active', role === 'attendee');
  document.getElementById('btnOps').classList.toggle('active', role === 'ops');
  document.getElementById('btnAdmin').classList.toggle('active', role === 'admin');

  // Render the correct screen
  if (role === 'attendee') await renderAttendeeScreen();
  if (role === 'ops') await renderOpsScreen();
  if (role === 'admin') await renderAdminScreen();
}

// Initialise app on DOM ready
document.addEventListener('DOMContentLoaded', async function () {
  // Render attendee screen by default
  await renderAttendeeScreen();

  console.log('%cVenueFlow AI loaded', 'color:#4f9dff;font-size:14px;font-weight:bold');
  console.log('Role: Attendee | Zone:', ATTENDEE_CONTEXT.currentZone);

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed', err));
  }
});
