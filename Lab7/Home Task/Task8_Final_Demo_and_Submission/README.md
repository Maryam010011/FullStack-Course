# Campus Lost & Found API

Small Node.js backend for the campus student affairs office, built with the **core `http` and `fs` modules** (no Express, no database). Items are stored in an NDJSON file. Optional extras: an offline SMTP notice for found items and private evidence uploads.

## Requirements
Node.js 20 or later and npm (internet needed once for `npm install`).

## Setup and run
```bash
npm install
npm test             # automated checks (all must pass)
npm start            # API on http://localhost:3000
npm run smtp         # OPTIONAL, second terminal: offline inbox on 127.0.0.1:2525
npm run demo         # scripted end-to-end demonstration (Task 8)
```

## Project structure
| Path | Responsibility |
|---|---|
| `server.js` | HTTP routing, status codes, event listeners |
| `modules/validator.js` | request validation rules |
| `modules/itemStore.js` | NDJSON file store (`add`, `list`, `count`); handles a missing file |
| `modules/httpHelpers.js` | `sendJson`, `readJson` (400 on malformed JSON) |
| `modules/emailService.js` | Nodemailer client for the **local** SMTP receiver only |
| `modules/attachmentService.js` | Formidable upload, size/type/content checks, metadata |
| `local-smtp.js` | offline receiver printing raw emails |
| `data/` | `items.ndjson`, `attachments.ndjson`, `audit.log` |
| `uploads/` | private evidence files (no public route) |
| `postman/` | collection + sample upload files |
| `tests/` | automated integration checks |

## Item object
| Field | Type | Rule |
|---|---|---|
| `id` | string | generated (`crypto.randomUUID()`) |
| `title` | string | required, max 100 characters |
| `category` | string | required, max 50 characters |
| `location` | string | required, max 100 characters |
| `status` | string | required, exactly `lost` or `found` |
| `contactName` | string | required, max 60 characters |
| `description` | string | optional, max 500 characters |
| `createdAt` | string | generated ISO timestamp |

## Endpoints
| Method and path | Success | Errors |
|---|---|---|
| `GET /api/health` | 200 | - |
| `GET /api/items` , `?status=lost\|found` | 200 | 400 invalid status |
| `GET /api/items/count[?status=]` | 200 | 400 invalid status |
| `POST /api/items` | 201 | 400 missing title, invalid status, oversized text, malformed JSON; 404 unknown `attachmentId` |
| `POST /api/attachments` | 201 metadata | 400 no file / bad type or content, 413 over 2 MB, 415 not multipart |
| `GET /api/attachments/:id` | 200 metadata | 404 unknown id |
| any other path | - | 404 |

## Design notes
- **Persist first, then `emit()`.** `item:created` is emitted only after the item is on disk, because `emit()` does not wait for listeners. Console, audit and mail listeners are optional extras; their failure never affects the saved item or the 201 response.
- **Offline mail.** Found items trigger a notice to `127.0.0.1:2525` only. It is never delivered to a real inbox, and the SMTP listener must not be exposed to a network.
- **Private uploads.** Files are stored under generated names outside any public route; responses contain metadata only. An item refers to evidence through `attachmentId`.

## Demonstration (Task 8)
Fast way: `npm run demo` runs the whole flow and prints every step. Manual way, with the server running:

1. `POST /api/items` with a valid item -> **201**.
2. `cat data/items.ndjson` (Windows: `type data\items.ndjson`) -> a new line appeared.
3. `GET /api/items` -> the item is listed.
4. Stop the server (`Ctrl+C`), run `npm start` again, `GET /api/items` -> **the item is still there**.
5. `POST /api/items` with no title -> **400** and an error message.
6. Optional: start `npm run smtp`, POST a `found` item -> raw email appears in the SMTP terminal; or upload a PNG to `/api/attachments` -> 201 metadata.

### Screenshots to capture and annotate
1. Terminal: `npm test` all passing.
2. Postman: valid POST 201 (response body visible).
3. Editor or terminal: the new line in `data/items.ndjson`.
4. Postman: GET `/api/items` showing the item.
5. Terminal after restart + GET showing the item remains.
6. Postman: validation failure 400.
7. Optional: SMTP terminal with the raw email, or upload 201 metadata.
8. Postman runner: all assertions passed.

## Submission checklist
Source files (without `node_modules`), this README, `postman/Lost_and_Found.postman_collection.json`, annotated screenshots.
