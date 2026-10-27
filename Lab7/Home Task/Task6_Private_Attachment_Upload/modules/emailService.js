'use strict';

const nodemailer = require('nodemailer');

// Offline notifier: talks ONLY to a local SMTP receiver on 127.0.0.1:2525.
// Messages are NOT delivered to a real inbox on the internet.
function createNotifier({ host = '127.0.0.1', port = 2525 } = {}) {
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: false,
    ignoreTLS: true,
    connectionTimeout: 2000,
    greetingTimeout: 2000,
    socketTimeout: 3000,
  });

  async function notifyFound(item) {
    return transport.sendMail({
      from: 'lost-and-found@campus.test',
      to: 'student-affairs@campus.test',
      subject: `Found item reported: ${item.title}`,
      text: [
        'A found item was submitted.',
        `Title   : ${item.title}`,
        `Category: ${item.category}`,
        `Location: ${item.location}`,
        `Contact : ${item.contactName}`,
        `Item ID : ${item.id}`,
      ].join('\n'),
    });
  }

  return { notifyFound };
}

module.exports = { createNotifier };
