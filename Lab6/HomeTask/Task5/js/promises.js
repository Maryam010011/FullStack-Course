// js/promises.js
// MODULE BOUNDARY: the Promise version of the SAME three stages. No DOM code here.
// The business logic is not copied: each Promise stage wraps the error-first service from callbacks.js.
import { checkCapacity, obtainApproval, generateConfirmation } from "./callbacks.js";

// Turn any error-first callback service into a Promise.
//   callback(error)        -> reject(error)
//   callback(null, value)  -> resolve(value)
export function promisify(service, context) {
  return new Promise((resolve, reject) => {
    service(context, (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
}

// The three stages as Promise-returning functions.
export const checkCapacityPromise = context => promisify(checkCapacity, context);
export const obtainApprovalPromise = context => promisify(obtainApproval, context);
export const generateConfirmationPromise = context => promisify(generateConfirmation, context);

// Wrap ONE stage so the progress panel is updated whatever happens.
//   success: mark done and pass the value on
//   failure: mark failed and RE-THROW so the chain keeps rejecting
export function tracked(stage, work, hooks) {
  hooks.stageStart(stage);
  return work().then(
    value => { hooks.stageDone(stage); return value; },
    error => { hooks.stageFail(stage, error); throw error; }
  );
}

// The Promise chain. Each .then() RETURNS the next Promise, so the next stage waits for it.
// If any stage rejects, every later .then() is skipped and the caller's .catch() receives the error.
export function registerWithPromises(context, hooks) {
  return tracked("capacity", () => checkCapacityPromise(context), hooks)
    .then(() => tracked("approval", () => obtainApprovalPromise(context), hooks))
    .then(() => tracked("confirmation", () => generateConfirmationPromise(context), hooks));
}
