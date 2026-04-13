// src/main.js - App entry point: initialises both interfaces

let currentRole = 'attendee';

function switchRole(role) {
  currentRole = role;

  // Toggle views
  document.getElementById('attendeeView').classList.toggle('active', role === 'attendee');
  document.getElementById('opsView').classList.toggle('active', role === 'ops');

  // Toggle header buttons
  document.getElementById('btnAttendee').classList.toggle('active', role === 'attendee');
  document.getElementById('btnOps').classList.toggle('active', role === 'ops');

  // Render the correct screen
  if (role === 'attendee') renderAttendeeScreen();
  if (role === 'ops') renderOpsScreen();
}

// Initialise app on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  // Render attendee screen by default
  renderAttendeeScreen();

  console.log('%cVenueFlow AI loaded', 'color:#4f9dff;font-size:14px;font-weight:bold');
  console.log('Role: Attendee | Zone:', ATTENDEE_CONTEXT.currentZone);
});
