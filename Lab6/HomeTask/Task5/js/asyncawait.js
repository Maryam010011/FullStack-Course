// js/asyncawait.js
// MODULE BOUNDARY: the async/await version of the SAME three stages. No DOM code here.
import { tracked, checkCapacityPromise, obtainApprovalPromise, generateConfirmationPromise } from "./promises.js";

// An async function ALWAYS returns a Promise.
//   - `return value`  -> the Promise resolves with value
//   - `throw error`   -> the Promise rejects with error
// `await` pauses THIS function only (not the browser) until the Promise settles.
export async function registerWithAsyncAwait(context, hooks) {
  try {
    await tracked("capacity", () => checkCapacityPromise(context), hooks);
    await tracked("approval", () => obtainApprovalPromise(context), hooks);
    const confirmation = await tracked("confirmation", () => generateConfirmationPromise(context), hooks);
    return confirmation;
  } catch (error) {
    // Reached when ANY awaited Promise rejects. Log, then re-throw so the caller can show the error.
    hooks.log(`async/await caught: ${error.message}`);
    throw error;
  } finally {
    // Runs on success AND failure. Only logging here; never record a booking in finally.
    hooks.log("async/await attempt finished (finally).");
  }
}
