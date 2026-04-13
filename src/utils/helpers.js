// src/utils/helpers.js - Shared utility functions

function formatWaitTime(minutes) {
  if (minutes === 0) return 'No wait';
  if (minutes < 5) return `~${minutes} min (Fast)`;
  if (minutes < 15) return `~${minutes} min`;
  return `~${minutes} min (Busy)`;
}

function getCongestionColor(level) {
  return { low: '#4caf80', medium: '#ffc107', high: '#ef5350' }[level] || '#aaa';
}

function getSeverityLabel(severity) {
  return { high: 'CRITICAL', medium: 'WARNING', low: 'INFO' }[severity] || severity.toUpperCase();
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
