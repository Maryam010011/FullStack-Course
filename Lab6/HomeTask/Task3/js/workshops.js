// js/workshops.js
// MODULE BOUNDARY: this file owns the DATA and the registration STATE only.
// It never touches the DOM, so it can be reused by any UI or test.

// Each workshop: id, name, fee (0 = free), capacity, registered (current count).
export const workshops = [
  { id: "W1", name: "UI Design",               fee: 1500, capacity: 3,  registered: 1  },
  { id: "W2", name: "Frontend Basics",         fee: 0,    capacity: 30, registered: 12 },
  { id: "W3", name: "Python Foundations",      fee: 2000, capacity: 2,  registered: 2  }, // already full
  { id: "W4", name: "Git & GitHub Essentials", fee: 500,  capacity: 20, registered: 5  },
];

// Find one workshop by its ID (returns undefined if the ID is unknown).
export function getWorkshop(id) {
  return workshops.find(workshop => workshop.id === id);
}

// Destructuring in the parameter list: pull capacity and registered out of the object.
export function availableSpaces({ capacity, registered }) {
  return capacity - registered;
}

export function isFull(workshop) {
  return availableSpaces(workshop) <= 0;
}

// Display helper: "Free" or "Rs 1,500".
export function formatFee({ fee }) {
  return fee === 0 ? "Free" : `Rs ${fee.toLocaleString("en-US")}`;
}
