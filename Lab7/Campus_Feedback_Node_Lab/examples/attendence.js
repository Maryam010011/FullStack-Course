const fs = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline/promises');
async function attendance() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    try {
        const name = (await rl.question('Enter student name: ')).trim();
        if (!name) {
            console.log('Please enter a valid name.');
            return;
        }
        const file = path.join(__dirname, 'attendance.txt');
        await fs.appendFile(file, name + '\n', 'utf8');
        const content = await fs.readFile(file, 'utf8');
        const students = content.split(/\r?\n/).filter(Boolean);

        console.log('\nStudent List:');
        students.forEach((student, index) => {
            console.log(`${index + 1}. ${student}`);
        });
    } finally {
        rl.close();
    }
}
attendance().catch(console.error);
