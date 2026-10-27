'use strict';

// Small command-line tool to prove NDJSON persistence without the HTTP server.
//   node cli.js add "Black wallet" lost
//   node cli.js list
const path = require('node:path');
const { createStore } = require('./modules/itemStore');
const { validateItem } = require('./modules/validator');

async function main() {
  const store = createStore(path.join(process.env.DATA_DIR || path.join(__dirname, 'data'), 'items.ndjson'));
  const [command, title, status] = process.argv.slice(2);

  if (command === 'add') {
    const result = validateItem({
      title,
      category: 'General',
      location: 'Main Library',
      status,
      contactName: 'Demo Student',
    });
    if (result.error) {
      console.error('Rejected:', result.error);
      process.exitCode = 1;
      return;
    }
    console.log('Saved:', await store.add(result.value));
  }

  const items = await store.list();
  console.log(items.length === 0 ? 'No items yet.' : `${items.length} item(s):`);
  for (const item of items) console.log(` - [${item.status}] ${item.title}  (${item.id})`);
}

main().catch(console.error);
