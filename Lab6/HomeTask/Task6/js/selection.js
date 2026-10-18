// js/selection.js
// MODULE BOUNDARY: selection RULES only (pure functions, no DOM, no global state).
// Every function takes the current selection array and returns a NEW result.
import { getWorkshop } from "./workshops.js";

export const MAX_SELECTION = 2; // limit chosen for this portal: at most 2 workshops per student

// Small helper so every rejection has the same shape.
function reject(selection, message) {
  return { ok: false, selection, message };
}

// Add ONE workshop ID. Returns { ok, selection, message }.
export function addWorkshop(selection, id) {
  const workshop = getWorkshop(id);

  if (!workshop) return reject(selection, `"${id}" is not a valid workshop.`);                  // invalid ID
  if (selection.includes(id)) return reject(selection, `${workshop.name} is already selected.`); // duplicate
  if (selection.length >= MAX_SELECTION) {
    return reject(selection, `You can select at most ${MAX_SELECTION} workshops.`);               // limit
  }

  // SPREAD: copy the old items into a brand-new array and add the new one.
  // The original `selection` array is NOT modified (no push).
  return { ok: true, selection: [...selection, id], message: `${workshop.name} added.` };
}

export function removeWorkshop(selection, id) {
  return selection.filter(selectedId => selectedId !== id); // filter also returns a new array
}

// REST PARAMETER: `...ids` collects any number of arguments into one array.
//   addMany(selection, "W1", "W2")  ->  ids = ["W1", "W2"]
export function addMany(selection, ...ids) {
  let next = selection;
  const problems = [];

  for (const id of ids) {
    const result = addWorkshop(next, id);
    if (result.ok) next = result.selection;
    else problems.push(result.message);
  }
  return { selection: next, problems };
}

// Total fee for the selected IDs. Destructuring in the reduce callback.
export function totalFee(selection) {
  return selection
    .map(getWorkshop)
    .reduce((sum, { fee }) => sum + fee, 0);
}
