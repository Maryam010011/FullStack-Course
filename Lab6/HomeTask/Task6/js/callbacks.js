// js/callbacks.js
// MODULE BOUNDARY: simulated back-end SERVICES + the nested-callback flow. No DOM code here.
// Every service follows the ERROR-FIRST convention:  callback(error, result)
//   success -> callback(null, result)
//   failure -> callback(new Error("..."))   and then RETURN so nothing else runs
import { getWorkshop, availableSpaces, isFull, nextReference } from "./workshops.js";
import { DELAYS, scaled } from "./config.js";

// ---------- Stage 1: capacity (from Task 3) -----------------------------------------------
export function checkCapacity(context, callback) {
  const { ids } = context;

  setTimeout(() => {
    if (ids.length === 0) {
      callback(new Error("No workshop selected."));
      return;
    }

    const checked = [];
    for (const id of ids) {
      const workshop = getWorkshop(id);

      if (!workshop) {
        callback(new Error(`Unknown workshop "${id}".`));
        return;
      }
      if (isFull(workshop)) {
        callback(new Error(`${workshop.name} is full (${workshop.registered} of ${workshop.capacity} places taken).`));
        return;
      }
      checked.push({ id, name: workshop.name, spacesLeft: availableSpaces(workshop) });
    }

    callback(null, { checked });
  }, scaled(DELAYS.capacity));
}

// ---------- Stage 2: simulated approval ---------------------------------------------------
// context.simulate === "approval" forces a failure so we can test it.
export function obtainApproval(context, callback) {
  const { simulate } = context;

  setTimeout(() => {
    if (simulate === "approval") {
      callback(new Error("Approval denied by the registration office."));
      return;
    }
    callback(null, { approved: true, approvedBy: "Registration Office" });
  }, scaled(DELAYS.approval));
}

// ---------- Stage 3: confirmation reference -----------------------------------------------
// context.simulate === "slow" makes this stage take much longer (delayed confirmation).
// NOTE: this only PREPARES the confirmation. It does not change any workshop counts.
// Recording happens later, once, in the caller's success path.
export function generateConfirmation(context, callback) {
  const { ids, studentName, simulate } = context;
  const delay = simulate === "slow" ? DELAYS.slowConfirmation : DELAYS.confirmation;

  setTimeout(() => {
    const total = ids.reduce((sum, id) => sum + getWorkshop(id).fee, 0);
    callback(null, { reference: nextReference(), ids: [...ids], studentName, total });
  }, scaled(delay));
}

// ---------- The nested-callback flow (Task 4) ---------------------------------------------
// capacity -> approval -> confirmation. Each next stage starts INSIDE the previous success callback,
// so it can never start early. Each error branch reports the failure and RETURNS: the flow stops.
//
// hooks = { stageStart(name), stageDone(name), stageFail(name, error), log(text) }  (progress panel)
// done  = (error, confirmation) => void   (called exactly once)
export function registerWithCallbacks(context, hooks, done) {
  hooks.stageStart("capacity");
  checkCapacity(context, (capacityError) => {
    if (capacityError) {
      hooks.stageFail("capacity", capacityError);
      return done(capacityError);                 // STOP: approval never starts
    }
    hooks.stageDone("capacity");

    hooks.stageStart("approval");
    obtainApproval(context, (approvalError) => {
      if (approvalError) {
        hooks.stageFail("approval", approvalError);
        return done(approvalError);               // STOP: confirmation never starts
      }
      hooks.stageDone("approval");

      hooks.stageStart("confirmation");
      generateConfirmation(context, (confirmationError, confirmation) => {
        if (confirmationError) {
          hooks.stageFail("confirmation", confirmationError);
          return done(confirmationError);
        }
        hooks.stageDone("confirmation");
        done(null, confirmation);                 // all three stages succeeded
      });
    });
  });
}
