const fs = require('node:fs/promises');
const path = require('node:path');
async function main() {
  const file = path.join(__dirname, 'demo-note.txt');
  await fs.writeFile(file, 'First student note\n', 'utf8');
  await fs.appendFile(file, 'Second student note\n', 'utf8');
  const content = await fs.readFile(file, 'utf8');
  console.log('File contents:\n' + content);
}
main().catch(console.error);
