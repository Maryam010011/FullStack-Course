# Lab Task 4 - Event: `item:created`

## What changed
`server.js` creates an `EventEmitter`. After an item is saved, it calls `events.emit('item:created', item)`. Two independent listeners react:
1. **Console message:** `[EVENT] item:created id=... status=... title="..."`
2. **Audit record (optional):** appends a line to `data/audit.log` with `fs.appendFile`; errors are caught and logged as `[AUDIT WARNING]`.

```js
const item = await store.add(validation.value); // 1) persist FIRST
events.emit('item:created', item);              // 2) then announce
return sendJson(res, 201, { message: 'Item saved', item });
```

## Why must required persistence come before `emit()`?
- **Truth:** `emit()` announces "this item exists". If saving fails *after* announcing, listeners (audit, email) would report an item that was never stored.
- **No waiting:** `emit()` calls listeners synchronously and does **not** await any async work they start. It cannot guarantee that a listener finished (or even succeeded), so mandatory work must not live in a listener.
- **Isolation:** because the record is already saved, a failing or slow listener (disk error, mail down) cannot lose the item or change the 201 response.

## Test
Start the server, POST an item, then check the terminal for `[EVENT]` and `data/audit.log` for the audit line. A rejected POST (400) emits **no** event.

## How to run
```bash
npm install      # once
npm start        # http://localhost:3000
```
