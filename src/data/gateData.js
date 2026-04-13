// src/data/gateData.js - Gate mock data
const GATES = [
  { id: 'G1', label: 'Gate 1 - North Entry', zone: 'north', status: 'open', queueTime: 5, capacity: 'normal' },
  { id: 'G2', label: 'Gate 2 - North Fast Track', zone: 'north', status: 'open', queueTime: 3, capacity: 'low' },
  { id: 'G3', label: 'Gate 3 - East Entry', zone: 'east', status: 'busy', queueTime: 18, capacity: 'high' },
  { id: 'G4', label: 'Gate 4 - East VIP', zone: 'east', status: 'open', queueTime: 2, capacity: 'low' },
  { id: 'G5', label: 'Gate 5 - South Main', zone: 'south', status: 'busy', queueTime: 22, capacity: 'high' },
  { id: 'G6', label: 'Gate 6 - South Express', zone: 'south', status: 'open', queueTime: 8, capacity: 'normal' },
  { id: 'G7', label: 'Gate 7 - West Entry', zone: 'west', status: 'closed', queueTime: 0, capacity: 'none' },
  { id: 'G8', label: 'Gate 8 - West Accessible', zone: 'west', status: 'open', queueTime: 4, capacity: 'low' }
];
