'use strict';

// Offline, localhost-only SMTP receiver. It prints every raw email it receives.
// No authentication and no TLS on purpose: never expose this port to a network.
const { SMTPServer } = require('smtp-server');

const server = new SMTPServer({
  authOptional: true,
  disabledCommands: ['STARTTLS', 'AUTH'],
  onData(stream, session, callback) {
    let raw = '';
    stream.on('data', (chunk) => { raw += chunk.toString('utf8'); });
    stream.on('end', () => {
      console.log('\n===== EMAIL RECEIVED =====');
      console.log(`From: ${session.envelope.mailFrom.address}`);
      console.log(`To  : ${session.envelope.rcptTo.map((r) => r.address).join(', ')}`);
      console.log('--------------------------');
      console.log(raw);
      console.log('===== END OF EMAIL =====\n');
      callback();
    });
  },
});

server.on('error', (error) => console.error('[SMTP ERROR]', error.message));

server.listen(2525, '127.0.0.1', () => {
  console.log('Local SMTP inbox listening on 127.0.0.1:2525 (offline demo only)');
});
