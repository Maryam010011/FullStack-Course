// js/config.js
// MODULE BOUNDARY: timing settings only. Change a delay here and every service follows.

// Simulated service delays in milliseconds.
export const DELAYS = {
  capacity: 800,
  approval: 1000,
  confirmation: 700,
  slowConfirmation: 3500, // used by the "Delayed confirmation" scenario
};

// speed = 1 means real time. Tests can set a small number (e.g. 0.02) to run fast.
export const timing = { speed: 1 };

export function scaled(ms) {
  return Math.round(ms * timing.speed);
}
