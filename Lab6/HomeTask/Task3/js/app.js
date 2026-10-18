// js/app.js
// MODULE BOUNDARY: the "controller". Holds the selection state and wires events.
import { workshops } from "./workshops.js";
import { addWorkshop, removeWorkshop, addMany } from "./selection.js";
import { checkCapacity } from "./callbacks.js";
import { renderWorkshops, renderSummary, setStatus } from "./ui.js";

const listEl = document.getElementById("workshop-list");
const statusEl = document.getElementById("status");
const capacityMsgEl = document.getElementById("capacity-message");
const checkBtn = document.getElementById("check-btn");
const summaryRefs = {
  listEl: document.getElementById("selection-list"),
  countEl: document.getElementById("selection-count"),
  totalEl: document.getElementById("selection-total"),
};

let selection = [];
let checking = false; // stops a second click while a check is still running

function render() {
  renderWorkshops(listEl, workshops, selection);
  renderSummary(summaryRefs, selection);
}

function toggle(id) {
  if (selection.includes(id)) {
    selection = removeWorkshop(selection, id);
    setStatus(statusEl, "Workshop removed.", "info");
  } else {
    const result = addWorkshop(selection, id);
    selection = result.selection;
    setStatus(statusEl, result.message, result.ok ? "ok" : "error");
  }
  render();
}

// ----- Task 3: use the error-first callback ----------------------------------------------
function checkAvailability() {
  if (checking) return;

  if (selection.length === 0) {
    setStatus(capacityMsgEl, "Select at least one workshop first.", "error");
    return;
  }

  checking = true;
  checkBtn.disabled = true;
  setStatus(capacityMsgEl, "Checking availability...", "info");

  // Copy the selection with spread so later clicks cannot change what we are checking.
  const context = { ids: [...selection] };

  // The code after checkCapacity() keeps running immediately; the callback fires ~800 ms later.
  checkCapacity(context, (error, result) => {
    checking = false;
    checkBtn.disabled = false;

    // Error-first: ALWAYS look at `error` first.
    if (error) {
      setStatus(capacityMsgEl, `Cannot register: ${error.message}`, "error");
      return; // approval must NOT start after a failure
    }

    const names = result.checked.map(({ name, spacesLeft }) => `${name} (${spacesLeft} left)`).join(", ");
    setStatus(capacityMsgEl, `Space available: ${names}.`, "ok");
    startApprovalPlaceholder(context);
  });
}

// Placeholder only. Task 4 replaces this with the real approval stage.
// It is reachable ONLY from the success branch above.
function startApprovalPlaceholder(context) {
  console.log("Capacity OK. Approval stage would start now for:", context.ids);
}
// -----------------------------------------------------------------------------------------

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;

  if (action === "toggle") toggle(id);

  if (action === "quick-valid") {
    const ids = ["W1", "W2"];
    const result = addMany(selection, ...ids); // spread in the call
    selection = result.selection;
    setStatus(statusEl, result.problems.length ? result.problems.join(" ") : "Quick pick added.", result.problems.length ? "error" : "ok");
    render();
  }

  if (action === "quick-bad") {
    const result = addMany(selection, "W1", "W1", "W9", "W2", "W4");
    selection = result.selection;
    setStatus(statusEl, `Rejected: ${result.problems.join(" ")}`, "error");
    render();
  }

  if (action === "clear") {
    selection = [];
    setStatus(statusEl, "Selection cleared.", "info");
    render();
  }

  if (action === "check") checkAvailability();
});

render();
