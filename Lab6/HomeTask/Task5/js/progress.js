// js/progress.js
// MODULE BOUNDARY: the progress panel (stage tracker + execution log). DOM only.
// createProgress() returns the "hooks" object that the registration flow calls.
const LABELS = {
  capacity: "Check capacity",
  approval: "Get approval",
  confirmation: "Generate confirmation",
};
const ORDER = ["capacity", "approval", "confirmation"];
const STATE_TEXT = { pending: "Waiting", running: "Running...", done: "Done", failed: "Failed", skipped: "Skipped" };

export function createProgress({ stagesEl, logEl }) {
  let startedAt = performance.now();

  const stageEl = name => stagesEl.querySelector(`[data-stage="${name}"]`);

  function setState(name, state) {
    const el = stageEl(name);
    el.className = `stage is-${state}`;
    el.querySelector(".stage-state").textContent = STATE_TEXT[state];
  }

  // One log line per event, prefixed with seconds since the run started, so ORDER is visible.
  function log(message) {
    const seconds = ((performance.now() - startedAt) / 1000).toFixed(2);
    const item = document.createElement("li");
    item.textContent = `[+${seconds}s] ${message}`;
    logEl.append(item);
  }

  return {
    reset() {
      startedAt = performance.now();
      logEl.innerHTML = "";
      ORDER.forEach(name => setState(name, "pending"));
    },
    log,
    stageStart(name) {
      setState(name, "running");
      log(`${LABELS[name]} started`);
    },
    stageDone(name) {
      setState(name, "done");
      log(`${LABELS[name]} completed`);
    },
    stageFail(name, error) {
      setState(name, "failed");
      log(`${LABELS[name]} FAILED: ${error.message}`);
      // Every stage after the failed one never starts.
      ORDER.slice(ORDER.indexOf(name) + 1).forEach(later => setState(later, "skipped"));
    },
  };
}
