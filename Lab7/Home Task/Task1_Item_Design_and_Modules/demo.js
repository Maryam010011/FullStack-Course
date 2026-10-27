'use strict';

// Task 1 demo: use the validator and store modules without any server.
const { validateItem } = require('./modules/validator');
const { createStore } = require('./modules/itemStore');

async function main() {
  const store = createStore();

  const good = {
    title: 'Black wallet',
    category: 'Accessories',
    location: 'Main Library',
    status: 'lost',
    contactName: 'Ayesha',
  };

  const accepted = validateItem(good);
  console.log('Valid input ->', accepted.value ? 'accepted' : accepted.error);
  const saved = await store.add(accepted.value);
  console.log('\nItem object created by the store:\n', saved);

  const badInputs = {
    'missing title': { ...good, title: '' },
    'invalid status': { ...good, status: 'stolen' },
    'oversized title': { ...good, title: 'x'.repeat(101) },
    'body is not an object': 'just text',
  };
  console.log('\nRejected inputs:');
  for (const [label, input] of Object.entries(badInputs)) {
    const result = validateItem(input);
    console.log(` - ${label}: ${result.error} (status ${result.status})`);
  }

  console.log('\nStored items:', await store.list());
}

main().catch(console.error);
