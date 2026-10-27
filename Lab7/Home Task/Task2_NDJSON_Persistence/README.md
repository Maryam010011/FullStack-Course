# Lab Task 2 - NDJSON Persistence

## What changed
`modules/itemStore.js` now stores items in `data/items.ndjson`: **one JSON object per line**.
- `add()` creates the folder if needed and uses `fs.appendFile`, so older lines are never overwritten.
- `list()` / `count()` read the file and parse each line.
- **Missing file:** `readFile` throws `ENOENT` on a fresh install. The store catches exactly that error and returns an empty list instead of crashing. Other errors are still thrown.
- A damaged line is skipped with a warning instead of breaking the whole list.

## Prove persistence (each command is a separate Node.js process = a "restart")
```bash
node cli.js list                        # No items yet.   (file does not exist, no crash)
node cli.js add "Black wallet" lost     # Saved + list shows 1 item
node cli.js add "Blue umbrella" found
node cli.js list                        # both items are still there
cat data/items.ndjson                   # two lines, one JSON object each
```
Delete the `data/` folder and run `node cli.js list` again: `No items yet.`
