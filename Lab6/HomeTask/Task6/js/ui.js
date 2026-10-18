// js/ui.js
// MODULE BOUNDARY: this file owns DOM RENDERING only.
// It receives data as arguments and places HTML. It never changes the data.
import { availableSpaces, isFull, formatFee, getWorkshop } from "./workshops.js";
import { MAX_SELECTION, totalFee } from "./selection.js";

export function renderWorkshops(container, workshops, selection) {
  container.innerHTML = workshops.map(w => createCardHTML(w, selection.includes(w.id))).join("");
}

function createCardHTML(workshop, selected) {
  const { id, name, capacity, registered } = workshop;   // destructuring
  const spaces = availableSpaces(workshop);
  const full = isFull(workshop);

  return `
    <article class="card ${full ? "is-full" : ""} ${selected ? "is-selected" : ""}" data-id="${id}">
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
      <button type="button" class="btn ${selected ? "secondary" : ""}"
              data-action="toggle" data-id="${id}" aria-pressed="${selected}">
        ${selected ? "Remove" : "Select"}
      </button>
    </article>`;
}

// Live summary: list of chosen workshops, counter and total fee.
export function renderSummary(refs, selection) {
  const { listEl, countEl, totalEl } = refs;               // destructuring the refs object
  countEl.textContent = `${selection.length} of ${MAX_SELECTION} workshops selected`;

  listEl.innerHTML = selection.length === 0
    ? `<li class="muted">Nothing selected yet.</li>`
    : selection.map(id => {
        const workshop = getWorkshop(id);
        const warning = isFull(workshop)
          ? `<span class="inline-warn">Full: will be rejected at the capacity check</span>` : "";
        return `
          <li>
            <span><strong>${workshop.name}</strong> <span class="muted">(${formatFee(workshop)})</span>${warning}</span>
            <button type="button" class="link-btn" data-action="toggle" data-id="${id}"
                    aria-label="Remove ${workshop.name}">&times;</button>
          </li>`;
      }).join("");

  totalEl.textContent = totalFee(selection) === 0
    ? (selection.length ? "Free" : "Rs 0")
    : `Rs ${totalFee(selection).toLocaleString("en-US")}`;
}

// Show a message in the status area. type: "ok" | "error" | "info"
export function setStatus(el, message, type = "info") {
  el.textContent = message;
  el.className = `status status-${type}`;
}

// ----- Task 4: confirmation card ---------------------------------------------------------
// The student name is typed by the user, so escape it before putting it inside innerHTML.
function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

export function renderConfirmation(el, { reference, studentName, ids, total }) {
  const items = ids.map(getWorkshop).map(({ name }) => `<li>${name}</li>`).join("");
  el.hidden = false;
  el.innerHTML = `
    <h3>Registration confirmed</h3>
    <p class="reference">${reference}</p>
    <p><strong>${escapeHTML(studentName)}</strong> is registered for:</p>
    <ul>${items}</ul>
    <p>Total fee: <strong>${total === 0 ? "Free" : `Rs ${total.toLocaleString("en-US")}`}</strong></p>`;
}

export function hideConfirmation(el) {
  el.hidden = true;
  el.innerHTML = "";
}

// ----- Task 6: acceptance-test results table ----------------------------------------------
export function renderTestResults(el, results) {
  const passed = results.filter(({ passed }) => passed).length;
  const rows = results.map(({ name, style, passed, detail }) => `
    <tr class="${passed ? "row-pass" : "row-fail"}">
      <td>${name}</td>
      <td>${style}</td>
      <td><strong>${passed ? "PASS" : "FAIL"}</strong></td>
      <td>${escapeHTML(detail)}</td>
    </tr>`).join("");

  el.innerHTML = `
    <p class="test-summary ${passed === results.length ? "status-ok" : "status-error"}">
      ${passed} of ${results.length} checks passed
    </p>
    <div class="table-wrap">
      <table class="test-table">
        <thead><tr><th>Scenario</th><th>Style</th><th>Result</th><th>Detail</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
