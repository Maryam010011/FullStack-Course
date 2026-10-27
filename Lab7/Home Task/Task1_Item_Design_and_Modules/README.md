# Lab Task 1 - Item Design and Reusable Modules

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

Example:
```json
{
  "id": "6f1c...",
  "title": "Black wallet",
  "category": "Accessories",
  "location": "Main Library",
  "status": "lost",
  "contactName": "Ayesha",
  "createdAt": "2026-10-27T18:00:00.000Z"
}
```

## Modules and their responsibilities
| File | Responsibility |
|---|---|
| `modules/validator.js` | **Request validation.** Checks that the body is an object, required text fields exist and are not oversized, and `status` is `lost` or `found`. Returns `{ value }` (cleaned data) or `{ error, status }`. It knows nothing about files or HTTP. |
| `modules/itemStore.js` | **Store.** `buildItem()` creates the final item (id + createdAt). `createStore()` offers `add`, `list({status})`, `count({status})`. In this task it keeps items in memory; Task 2 swaps the inside for an NDJSON file without changing the API. |
| `demo.js` | Runs the modules without a server so you can see valid and invalid input. |

Why separate modules? Each file has one job, so validation rules can change without touching storage, and later tasks (HTTP server, tests) reuse the same code.

## Run
```bash
node demo.js
```
Expected: one accepted item, four rejected inputs with clear error messages, then the stored list.
