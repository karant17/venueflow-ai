// src/data/alertData.js - Live alert and route guidance data
const ALERTS = [
  {
    id: 'A1', severity: 'high', zone: 'south',
    message: 'Zone B congestion critical - South Gate 5 queue exceeds 20 min',
    routeAdvice: 'Redirect to Gate 6 or Gate 8 for faster entry',
    handled: false, timestamp: '19:45'
  },
  {
    id: 'A2', severity: 'high', zone: 'east',
    message: 'Gate 3 delay - Queue building at East Entry',
    routeAdvice: 'Use Gate 4 (East VIP) - only 2 min wait currently',
    handled: false, timestamp: '19:42'
  },
  {
    id: 'A3', severity: 'medium', zone: 'central',
    message: 'Food Court queue rising - 8 min wait',
    routeAdvice: 'Try Snack Bar North - only 3 min wait',
    handled: false, timestamp: '19:38'
  },
  {
    id: 'A4', severity: 'low', zone: 'west',
    message: 'Gate 7 - West Entry closed for maintenance',
    routeAdvice: 'Use Gate 8 (West Accessible) as alternative',
    handled: true, timestamp: '19:20'
  },
  {
    id: 'A5', severity: 'medium', zone: 'north',
    message: 'North Zone crowd count rising - approaching capacity',
    routeAdvice: 'No action needed yet - monitor for next 10 minutes',
    handled: false, timestamp: '19:50'
  }
];
