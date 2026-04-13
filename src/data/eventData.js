// src/data/eventData.js - Event types and mode descriptions
const EVENT_TYPES = [
  {
    id: 'sports',
    label: 'Sports',
    description: 'Stadium sports event with multiple entry gates and high crowd density.',
    icon: '🏟️',
    peakHours: ['18:00', '19:00', '20:00'],
    expectedAttendance: 45000
  },
  {
    id: 'concert',
    label: 'Concert',
    description: 'Live music concert with general admission and reserved seating zones.',
    icon: '🎵',
    peakHours: ['19:30', '20:00', '20:30'],
    expectedAttendance: 30000
  },
  {
    id: 'expo',
    label: 'Expo',
    description: 'Multi-hall exhibition with staggered entry and booth-based navigation.',
    icon: '🏢',
    peakHours: ['10:00', '11:00', '14:00'],
    expectedAttendance: 15000
  }
];

// Default attendee context (simulates user location/zone)
const ATTENDEE_CONTEXT = {
  currentZone: 'north',
  nearestGate: 'G2',
  ticketType: 'general',
  hasMobility: false
};
