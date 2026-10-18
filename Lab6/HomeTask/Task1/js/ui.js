// js/ui.js
// MODULE BOUNDARY: this file owns DOM RENDERING only.
// It receives data as arguments and returns/places HTML. It never changes the data.
import { availableSpaces, isFull, formatFee } from "./workshops.js";

export function renderWorkshops(container, workshops) {
  container.innerHTML = workshops.map(createCardHTML).join("");
}

function createCardHTML(workshop) {
  // Object destructuring: take the fields we need out of the workshop object.
  const { id, name, capacity, registered } = workshop;
  const spaces = availableSpaces(workshop);
  const full = isFull(workshop);

  // Template literals: build the card with ${...} placeholders.
  return `
    <article class="card ${full ? "is-full" : ""}" data-id="${id}">
      <header class="card-head">
        <span class="tag">${id}</span>
        <h3>${name}</h3>
      </header>
      <p class="fee">${formatFee(workshop)}</p>
      <p class="spaces ${full ? "spaces-none" : ""}">
        ${full ? "Full" : `${spaces} of ${capacity} spaces left`}
      </p>
      <progress max="${capacity}" value="${registered}"
                aria-label="${registered} of ${capacity} spaces taken"></progress>
    </article>`;
}
