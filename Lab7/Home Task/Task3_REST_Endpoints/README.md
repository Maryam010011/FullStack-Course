# Lab Task 3 - REST Endpoints

## Endpoints
| Method and path | Success | Errors |
|---|---|---|
| `GET /api/health` | 200 | - |
| `GET /api/items` | 200 `{ items: [...] }` | - |
| `GET /api/items?status=lost` | 200 (only lost) | 400 if status is not `lost`/`found` |
| `GET /api/items/count[?status=]` | 200 `{ status, count }` | 400 for a bad status |
| `POST /api/items` | **201** `{ message, item }` | 400 missing title / invalid status / oversized text / malformed JSON |
| any other path | - | **404** `{ error: "Not found" }` |

`/api/items/count` is checked **before** `/api/items` in `server.js`. Each response sets its status inside its own branch; the 404 is the last line.

## Run and test
```bash
npm start
curl -i localhost:3000/api/items
curl -i -X POST localhost:3000/api/items -H "Content-Type: application/json" \
  -d '{"title":"Black wallet","category":"Accessories","location":"Main Library","status":"lost","contactName":"Ayesha"}'
curl -i "localhost:3000/api/items?status=lost"
curl -i localhost:3000/api/items/count
curl -i -X POST localhost:3000/api/items -H "Content-Type: application/json" -d '{ bad json'     # 400
curl -i localhost:3000/api/nothing                                                               # 404
```

## How to run
```bash
npm install      # once
npm start        # http://localhost:3000
```
