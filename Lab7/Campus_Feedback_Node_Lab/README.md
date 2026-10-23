# Campus Feedback Hub — Node.js Week 7 Lab

A guided project for **Node.js Modules, File I/O, REST APIs and Postman**. Uses core Node.js only: **no Express, database, or npm downloads**.

## Requirements
Node.js 20+; VS Code; browser; Postman desktop app recommended.

## Start
```bash
node --version
npm --version
npm start
```
Visit **http://localhost:3000**. Stop with `Ctrl+C`. The browser displays a real API-backed feedback dashboard.

## Mini-experiments
Run these separately from the project root:
```bash
node examples/01-hello.js
node examples/02-module-usage.js
node examples/03-file-operations.js
node examples/04-first-server.js
```
The last example runs its own server at http://localhost:3001; stop with Ctrl+C.

## API endpoints
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Confirm server is running |
| GET | `/api/courses` | List allowed courses |
| GET | `/api/feedback` | List feedback records |
| GET | `/api/feedback?course=WEB` | Filter feedback |
| POST | `/api/feedback` | Validate and save a review |
| GET | `/api/summary` | Ratings by course |

### Valid POST request body
```json
{"courseId":"WEB","student":"Ayesha","rating":5,"message":"The practical exercises helped me understand Node.js."}
```
Set `Content-Type: application/json`. Success is `201 Created` with the new record and a UUID.

### Student challenges
- Reject rating outside 1–5; observe HTTP 400.
- Send courseId `UNKNOWN`; observe HTTP 404.
- Send invalid JSON; observe HTTP 400.
- Add an allowed course in `data/courses.json`, reload, and select it on the dashboard.
- Send feedback via Postman, then refresh the browser: it appears in Recent Feedback.
- Restart the server: records remain because `data/feedback.ndjson` stores them.

### Reset the practice data
Stop server. Empty the contents of `data/feedback.ndjson` (keep the file). Restart.

### Test
Run `npm test` — uses Node's built-in test runner. Test data is isolated in a temporary folder; it will not overwrite the main feedback file.

## Safety and limitations
Educational localhost-only example; no user accounts, authentication, or real database. Do not put real personal information in the feedback. Do not expose this server publicly. File-based persistence is appropriate for a lab, not concurrent production workloads.
