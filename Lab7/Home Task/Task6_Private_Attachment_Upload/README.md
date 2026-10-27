# Lab Task 6 - Private Evidence Upload

## What changed
- `modules/attachmentService.js` (Formidable): `POST /api/attachments` with multipart field **`attachment`**.
- Checks: max **2 MB**, one file, allowed extension **and** MIME type (`.pdf`, `.png`, `.jpg/.jpeg`), plus **magic bytes** (a text file renamed to `.png` is rejected). Rejected temp files are deleted.
- Files are saved in `uploads/` under a generated name (`<uuid>.<ext>`), never the client's name.
- The API returns **metadata only**: `id`, `originalName`, `mimeType`, `size`, `uploadedAt`. There is no public download route and no filesystem path in any response. Server-side metadata lives in `data/attachments.ndjson`.
- `GET /api/attachments/:id` returns the same safe metadata (404 for an unknown id).

| Case | Status |
|---|---|
| PDF / PNG / JPEG up to 2 MB | 201 |
| No file in field `attachment` | 400 |
| Wrong type or fake content | 400 |
| Larger than 2 MB | 413 |
| JSON instead of multipart | 415 |

## How does an item refer to an attachment?
1. Client uploads evidence: `POST /api/attachments` -> `{ "attachment": { "id": "3f0c..." } }`.
2. Client creates the item with that id: `POST /api/items` with `"attachmentId": "3f0c..."`.
3. The validator checks the id format, the server checks it exists in `attachments.ndjson` (unknown id -> 404), and the saved item stores only `attachmentId`.
4. Staff-only code could later map `attachmentId` -> file in `uploads/`; the id never exposes a path.

## Run
```bash
npm install
npm start
# Postman: POST /api/attachments > Body > form-data > key "attachment" (type File)
```
