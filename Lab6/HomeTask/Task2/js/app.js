// js/app.js
// MODULE BOUNDARY: the "controller". Holds the selection state and wires events.
import { workshops } from "./workshops.js";
import { addWorkshop, removeWorkshop, addMany } from "./selection.js";
import { renderWorkshops, renderSummary, setStatus } from "./ui.js";

const listEl = document.getElementById("workshop-list");
const statusEl = document.getElementById("status");
const summaryRefs = {
  listEl: document.getElementById("selection-list"),
  countEl: document.getElementById("selection-count"),
  totalEl: document.getElementById("selection-total"),
};

// The ONLY place the selection lives. We always REPLACE it with a new array (never push into it).
let selection = [];

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

// Event delegation: one click listener on the whole document, routed by data-action.
document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;     // destructuring dataset

  if (action === "toggle") toggle(id);

  if (action === "quick-valid") {
    // Spread in the CALL: addMany(selection, ...["W1", "W2"]) is the same as addMany(selection, "W1", "W2").
    const ids = ["W1", "W2"];
    const result = addMany(selection, ...ids);
    selection = result.selection;
    setStatus(statusEl, result.problems.length ? result.problems.join(" ") : "Quick pick added.", result.problems.length ? "error" : "ok");
    render();
  }

  if (action === "quick-bad") {
    // Duplicate (W1 twice), invalid (W9) and over-limit (W4) are rejected; valid ones still get in.
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
});

render();
