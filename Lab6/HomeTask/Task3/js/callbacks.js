// js/callbacks.js
// MODULE BOUNDARY: simulated back-end SERVICES written with callbacks. No DOM code here.
// Every service follows the ERROR-FIRST convention:  callback(error, result)
//   success -> callback(null, result)
//   failure -> callback(new Error("..."))   and then RETURN so nothing else runs
import { getWorkshop, availableSpaces, isFull } from "./workshops.js";
import { DELAYS, scaled } from "./config.js";

// Delayed capacity check. `context` is { ids: [...] } (the selected workshop IDs).
export function checkCapacity(context, callback) {
  const { ids } = context; // destructuring

  // setTimeout simulates a slow server. The code INSIDE runs later; the code after it runs now.
  setTimeout(() => {
    if (ids.length === 0) {
      callback(new Error("No workshop selected."));
      return; // stop: never fall through to the success callback
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

    callback(null, { checked }); // success: error is null, result is the second argument
  }, scaled(DELAYS.capacity));
}
