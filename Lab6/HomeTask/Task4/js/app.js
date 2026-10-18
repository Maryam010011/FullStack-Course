// js/app.js
// MODULE BOUNDARY: the "controller". Holds the selection state and wires events.
// It decides WHEN to call services and WHAT to show; the services decide nothing about the page.
import { workshops, recordRegistration, resetState } from "./workshops.js";
import { addWorkshop, removeWorkshop, addMany } from "./selection.js";
import { checkCapacity, registerWithCallbacks } from "./callbacks.js";
import { renderWorkshops, renderSummary, setStatus, renderConfirmation, hideConfirmation } from "./ui.js";
import { createProgress } from "./progress.js";

const el = id => document.getElementById(id);
const listEl = el("workshop-list");
const statusEl = el("status");
const messageEl = el("capacity-message");
const nameEl = el("student-name");
const scenarioEl = el("scenario");
const registerBtn = el("register-btn");
const checkBtn = el("check-btn");
const confirmationEl = el("confirmation");
const summaryRefs = { listEl: el("selection-list"), countEl: el("selection-count"), totalEl: el("selection-total") };
const progress = createProgress({ stagesEl: el("stages"), logEl: el("log") });

let selection = [];
let busy = false; // true while a registration or check is running

function render() {
  renderWorkshops(listEl, workshops, selection);
  renderSummary(summaryRefs, selection);
}

function setBusy(value) {
  busy = value;
  registerBtn.disabled = value;
  checkBtn.disabled = value;
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

// ----- Task 3 (kept): check availability only --------------------------------------------
function checkAvailability() {
  if (selection.length === 0) return setStatus(messageEl, "Select at least one workshop first.", "error");

  setBusy(true);
  setStatus(messageEl, "Checking availability...", "info");

  checkCapacity({ ids: [...selection] }, (error, result) => {
    setBusy(false);
    if (error) return setStatus(messageEl, `Cannot register: ${error.message}`, "error");
    const names = result.checked.map(({ name, spacesLeft }) => `${name} (${spacesLeft} left)`).join(", ");
    setStatus(messageEl, `Space available: ${names}.`, "ok");
  });
}

// ----- Task 4: full registration with nested callbacks ------------------------------------
function startRegistration() {
  const studentName = nameEl.value.trim();
  if (selection.length === 0) return setStatus(messageEl, "Select at least one workshop first.", "error");
  if (studentName === "") return setStatus(messageEl, "Please enter your name.", "error");

  setBusy(true);
  hideConfirmation(confirmationEl);
  progress.reset();
  setStatus(messageEl, "Registration in progress...", "info");

  // Snapshot of the inputs. Spread copies the array so later clicks cannot change this run.
  const context = { ids: [...selection], studentName, simulate: scenarioEl.value };

  progress.log("Registration submitted. Synchronous code is finished; timers are now pending.");

  // The callback `done` is called exactly once: with an error, or with the confirmation.
  registerWithCallbacks(context, progress, (error, confirmation) => {
    if (error) {
      // FAILURE: nothing is recorded. Counts and records stay exactly as they were.
      progress.log("Flow stopped. No registration was recorded.");
      setStatus(messageEl, `Registration failed: ${error.message}`, "error");
      return setBusy(false);
    }

    // SUCCESS: this is the only place a registration is recorded.
    recordRegistration(confirmation);
    progress.log(`Registration recorded: ${confirmation.reference}`);
    selection = [];
    render();
    renderConfirmation(confirmationEl, confirmation);
    setStatus(messageEl, `Registration confirmed: ${confirmation.reference}`, "ok");
    setBusy(false);
  });
}

// Selection changes are ignored while a run is in progress so the on-screen state stays consistent.
const SELECTION_ACTIONS = ["toggle", "quick-valid", "clear"];

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;

  if (busy && SELECTION_ACTIONS.includes(action)) {
    return setStatus(statusEl, "Please wait for the current registration to finish.", "info");
  }

  if (action === "toggle") toggle(id);

  if (action === "quick-valid") {
    const result = addMany(selection, ...["W1", "W2"]);
    selection = result.selection;
    setStatus(statusEl, result.problems.length ? result.problems.join(" ") : "Quick pick added.", result.problems.length ? "error" : "ok");
    render();
  }

  if (action === "clear") {
    selection = [];
    setStatus(statusEl, "Selection cleared.", "info");
    render();
  }

  if (action === "check") checkAvailability();
  if (action === "register") startRegistration();

  if (action === "reset" && !busy) {
    resetState();
    selection = [];
    progress.reset();
    hideConfirmation(confirmationEl);
    setStatus(messageEl, "Demo data reset.", "info");
    render();
  }
});

// Heartbeat: a timer that keeps ticking while the registration waits. If the page were blocked,
// this number would freeze. It does not, because setTimeout does not block the browser.
let beats = 0;
setInterval(() => { el("heartbeat").textContent = ++beats; }, 250);

render();
