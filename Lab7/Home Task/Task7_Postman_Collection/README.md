# Lab Task 7 - Postman Collection

**File:** `postman/Lost_and_Found.postman_collection.json` (Postman v2.1). Sample files for upload requests are in `postman/sample-files/`.

## Steps
1. `npm install`, then `npm start`.
2. Postman > **Import** > select the collection. Variable `baseUrl` = `http://localhost:3000`.
3. For the three upload requests, open **Body > form-data** and (re)select the file from `postman/sample-files/` if Postman shows the file as missing.
4. Run the collection (Runner). Take a screenshot of the passing assertions and **Export** the collection for submission.

## Requests
| # | Request | Expected |
|---|---|---|
| 1 | GET health | 200 |
| 2 | POST valid lost item | 201, `item.id` string (id saved to a variable) |
| 3 | POST valid found item | 201 |
| 4 | GET `?status=lost` (filtered) | 200, every item is `lost` |
| 5 | GET all items | 200 |
| 6 | GET count | 200, `count` is a number |
| 7 | GET `?status=stolen` | 400 |
| 8 | POST missing title | 400 |
| 9 | POST invalid status | 400 |
| 10 | POST oversized title | 400 |
| 11 | POST malformed JSON | 400 |
| 12 | GET unknown path | 404 |
| 13 | Upload valid PNG | 201, id saved to variable `attachmentId` |
| 14 | POST item with `{{attachmentId}}` | 201 |
| 15 | Upload text file | 400 |
| 16 | Upload with no file field | 400 |
| 17 | Upload JSON instead of multipart | 415 |
| 18 | GET attachment metadata | 200 |
| 19 | GET unknown attachment | 404 |

(The >2 MB case, 413, is covered by `npm test`.) There are far more than three automated assertions (`pm.test(...)` in every request).

The same behaviour is also checked from the command line with `npm test`.

## How to run
```bash
npm install      # once (installs formidable, nodemailer, smtp-server)
npm start        # http://localhost:3000
```
