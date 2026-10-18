// js/tests.js
// MODULE BOUNDARY: demonstrations + automated acceptance tests. No DOM code here.
// It drives the SAME flows the page uses (all three styles) and checks the final state.
import { workshops, registrations, resetState, recordRegistration, getWorkshop, availableSpaces } from "./workshops.js";
import { timing, scaled, DELAYS } from "./config.js";
import { addMany } from "./selection.js";
import { registerWithCallbacks } from "./callbacks.js";
import { registerWithPromises } from "./promises.js";
import { registerWithAsyncAwait } from "./asyncawait.js";

export const STYLES = ["callbacks", "promises", "async"];

// The four required demonstrations (used by the demo buttons and by the tests).
export const DEMOS = [
  { id: "success",  label: "1. Successful registration", ids: ["W1"], simulate: "none" },
  { id: "full",     label: "2. Full workshop",           ids: ["W3"], simulate: "none" },
  { id: "approval", label: "3. Approval failure",        ids: ["W1"], simulate: "approval" },
  { id: "delayed",  label: "4. Delayed confirmation",    ids: ["W2"], simulate: "slow" },
];

// A "hooks" object that only records which stages started/finished (no DOM).
function makeRecorder() {
  const events = [];
  return {
    events,
    log() {},
    stageStart: name => events.push(`start:${name}`),
    stageDone: name => events.push(`done:${name}`),
    stageFail: name => events.push(`fail:${name}`),
  };
}

// Run ONE registration in the chosen style against the current state.
// Always resolves with an outcome object, and records a registration ONLY on success
// (the same rule the page uses).
function runRegistration(style, context) {
  const hooks = makeRecorder();

  return new Promise(resolve => {
    const finish = (error, confirmation) => {
      if (error) return resolve({ ok: false, error: error.message, events: hooks.events });
      recordRegistration(confirmation);
      resolve({ ok: true, reference: confirmation.reference, events: hooks.events });
    };

    if (style === "callbacks") registerWithCallbacks(context, hooks, finish);
    else if (style === "promises") registerWithPromises(context, hooks).then(c => finish(null, c)).catch(e => finish(e));
    else registerWithAsyncAwait(context, hooks).then(c => finish(null, c)).catch(e => finish(e));
  });
}

// A compact picture of the whole state, used to compare "before / after" and "style A / style B".
function snapshot() {
  return JSON.stringify({
    counts: workshops.map(({ id, registered }) => `${id}:${registered}`),
    records: registrations.map(({ reference, ids, studentName }) => `${reference}|${ids.join("+")}|${studentName}`),
  });
}

// Reset, run one scenario in one style, and measure what happened.
async function runScenario(style, { ids, simulate }) {
  resetState();
  const before = snapshot();
  const spacesBefore = ids.map(id => availableSpaces(getWorkshop(id)));

  // Heartbeat: if a timer keeps firing while we wait, the page was NOT blocked.
  let ticks = 0;
  const heartbeat = setInterval(() => { ticks += 1; }, 5);
  const started = performance.now();

  const outcome = await runRegistration(style, { ids: [...ids], studentName: "Test Student", simulate });

  const elapsed = performance.now() - started;
  clearInterval(heartbeat);

  const spacesAfter = ids.map(id => availableSpaces(getWorkshop(id)));
  return { outcome, before, after: snapshot(), spacesBefore, spacesAfter, ticks, elapsed };
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const check = (name, style, passed, detail) => ({ name, style, passed, detail });

// ----- The acceptance tests ---------------------------------------------------------------
// speed < 1 shortens every delay so the whole suite takes about a second.
export async function runAcceptanceTests({ speed = 0.02 } = {}) {
  const previousSpeed = timing.speed;
  timing.speed = speed;
  const results = [];

  try {
    const [success, full, approval, delayed] = DEMOS;

    for (const style of STYLES) {
      // 1. Available workshop: progress completes, confirmation, spaces decrease.
      let r = await runScenario(style, success);
      results.push(check("Available workshop", style,
        r.outcome.ok
          && same(r.outcome.events, ["start:capacity", "done:capacity", "start:approval", "done:approval", "start:confirmation", "done:confirmation"])
          && r.spacesAfter[0] === r.spacesBefore[0] - 1
          && registrations.length === 1,
        `ok=${r.outcome.ok}, ref=${r.outcome.reference}, spaces ${r.spacesBefore[0]} -> ${r.spacesAfter[0]}`));

      // 2. Full workshop: rejected at capacity; approval and confirmation never start.
      r = await runScenario(style, full);
      results.push(check("Full workshop", style,
        !r.outcome.ok
          && same(r.outcome.events, ["start:capacity", "fail:capacity"])
          && r.before === r.after,
        `ok=${r.outcome.ok}, "${r.outcome.error}", stages: ${r.outcome.events.join(" > ")}`));

      // 3. Approval failure: capacity succeeds, approval fails, no confirmation, nothing recorded.
      r = await runScenario(style, approval);
      results.push(check("Approval failure", style,
        !r.outcome.ok
          && same(r.outcome.events, ["start:capacity", "done:capacity", "start:approval", "fail:approval"])
          && r.before === r.after,
        `ok=${r.outcome.ok}, "${r.outcome.error}", stages: ${r.outcome.events.join(" > ")}`));

      // 4. Delayed confirmation: the slow stage really takes longer AND timers kept firing meanwhile.
      r = await runScenario(style, delayed);
      const slowStage = scaled(DELAYS.slowConfirmation);
      results.push(check("Delayed confirmation", style,
        r.outcome.ok && r.elapsed >= slowStage && r.ticks >= 3,
        `ok=${r.outcome.ok}, took ${Math.round(r.elapsed)} ms (slow stage alone is ${slowStage} ms), heartbeat ticks=${r.ticks}`));
    }

    // 5. Duplicate / invalid selection: reported, and no inconsistent state.
    resetState();
    const stateBefore = snapshot();
    const picked = addMany([], "W1", "W1", "W9", "W2", "W4");
    results.push(check("Duplicate/invalid selection", "-",
      same(picked.selection, ["W1", "W2"]) && picked.problems.length === 3 && snapshot() === stateBefore,
      `kept ${picked.selection.join("+")}; reported ${picked.problems.length} problems; workshop state unchanged`));

    // Empty selection is also invalid: it must fail at the capacity stage and record nothing.
    for (const style of STYLES) {
      const r = await runScenario(style, { ids: [], simulate: "none" });
      results.push(check("Empty selection", style,
        !r.outcome.ok && r.before === r.after,
        `ok=${r.outcome.ok}, "${r.outcome.error}"`));
    }

    // 6. Promise vs async/await (and callbacks): identical input -> identical final state.
    for (const demo of DEMOS) {
      const finals = [];
      for (const style of STYLES) {
        const r = await runScenario(style, demo);
        finals.push({ ok: r.outcome.ok, error: r.outcome.error ?? null, after: r.after });
      }
      const [cb, pr, aa] = finals;
      results.push(check("Promise vs async/await", demo.label,
        same(pr, aa) && same(cb, pr),
        same(pr, aa) ? `same final state (ok=${pr.ok})` : "final states differ"));
    }
  } finally {
    timing.speed = previousSpeed; // always restore real-time delays
    resetState();                 // and leave the demo data clean
  }

  return results;
}
