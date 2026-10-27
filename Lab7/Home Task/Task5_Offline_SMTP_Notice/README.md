# Lab Task 5 - Offline Notice for Found Items

## What changed
- `modules/emailService.js`: Nodemailer client that connects **only to `127.0.0.1:2525`** (no TLS, no auth; local demo).
- `local-smtp.js`: localhost-only SMTP receiver that prints each raw email.
- `server.js`: third `item:created` listener sends a notice **only when `status === "found"`**. Failures are caught: `[MAIL WARNING] Item still saved: ...`.

## Run (two terminals)
```bash
npm install
# Terminal 1
npm run smtp
# Terminal 2
npm start
```
Submit a **found** item (see Task 3 curl examples with `"status":"found"`). Terminal 1 prints the raw email; Terminal 2 prints `[MAIL] local notice sent`.

| Action | Expected |
|---|---|
| POST a `lost` item | 201, no email |
| POST a `found` item | 201, email appears in the SMTP terminal |
| Stop the SMTP terminal, POST a `found` item | 201 and item saved; `[MAIL WARNING]` in API terminal |

## Safety
The mail never leaves your computer. Do not expose port 2525 to a network and do not reuse this no-auth/no-TLS setup for real email.
