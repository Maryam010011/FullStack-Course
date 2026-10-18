// js/workshops.js
// MODULE BOUNDARY: this file owns the DATA and the registration STATE only.
// It never touches the DOM, so it can be reused by any UI or test.

// Starting data. Never modified; resetState() copies from it.
const SEED = [
  { id: "W1", name: "UI Design",               fee: 1500, capacity: 3,  registered: 1  },
  { id: "W2", name: "Frontend Basics",         fee: 0,    capacity: 30, registered: 12 },
  { id: "W3", name: "Python Foundations",      fee: 2000, capacity: 2,  registered: 2  }, // already full
  { id: "W4", name: "Git & GitHub Essentials", fee: 500,  capacity: 20, registered: 5  },
];

// Live state (in browser memory only). Always changed IN PLACE so other modules keep the same reference.
export const workshops = SEED.map(workshop => ({ ...workshop }));
export const registrations = []; // confirmed registrations only

export function getWorkshop(id) {
  return workshops.find(workshop => workshop.id === id);
}

export function availableSpaces({ capacity, registered }) {
  return capacity - registered;
}

export function isFull(workshop) {
  return availableSpaces(workshop) <= 0;
}

export function formatFee({ fee }) {
  return fee === 0 ? "Free" : `Rs ${fee.toLocaleString("en-US")}`;
}

// ----- Task 4: registration state ---------------------------------------------------------

// Next confirmation reference, e.g. WS-0001. It only advances when a registration is RECORDED,
// so a failed attempt never uses up a number.
export function nextReference() {
  return `WS-${String(registrations.length + 1).padStart(4, "0")}`;
}

// The ONE place a registration becomes "confirmed": spaces go down, a record is stored.
// It is called only from a success path.
export function recordRegistration({ reference, ids, studentName, total }) {
  ids.forEach(id => { getWorkshop(id).registered += 1; });
  registrations.push({ reference, ids: [...ids], studentName, total });
}

// Put everything back to the starting data (used by the Reset button and by tests).
export function resetState() {
  workshops.splice(0, workshops.length, ...SEED.map(workshop => ({ ...workshop })));
  registrations.length = 0;
}
