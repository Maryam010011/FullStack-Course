const EventEmitter = require("node:events");

const emitter = new EventEmitter();

// Event listener
emitter.on("studentRegistered", (name) => {
  console.log(`Welcome ${name}!`);
});

emitter.on("studentRegistered", (name) => {
  console.log(`Email notification prepared for ${name}`);
});

// Trigger event
console.log("Registration started");

emitter.emit("studentRegistered", "Ali");

console.log("Registration completed");