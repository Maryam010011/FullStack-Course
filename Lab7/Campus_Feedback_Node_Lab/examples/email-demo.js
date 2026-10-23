// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   jsonTransport: true
// });

// async function sendEmail() {
//   const info = await transporter.sendMail({
//     from: "campus@example.com",
//     to: "teacher@example.com",
//     subject: "New Student Feedback",
//     text: "Ali has submitted feedback for Web Development."
//   });

//   console.log("Email generated successfully!");
//   console.log(JSON.parse(info.message));
// }

// sendEmail().catch(console.error);

//TESTING EMAIL


 const nodemailer = require("nodemailer");
const { SMTPServer } = require("smtp-server");

// 1. Local SMTP server with Auth Disabled
const server = new SMTPServer({
  disabledCommands: ['STARTTLS'],
  authOptional: true,
  onData(stream, session, callback) {
    console.log("\n===============================================");
    console.log(" [LAB SERVER]: NEW EMAIL RECEIVED SUCCESSFULLY!");
    console.log("===============================================");
    stream.pipe(process.stdout); 
    stream.on("end", callback);
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log(" Local SMTP Server running on port 3000...");
  sendTestEmail();
});

// 2. Nodemailer configuration
async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    host: "127.0.0.1",
    port: 3000,
    secure: false,
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.sendMail({
      from: '"Lab Student" <student@university.edu>',
      to: "teacher@example.com",
      subject: "Nodemailer Demonstration",
      text: "Respected Professor,\n\nThis is a successful live demo of Nodemailer running completely offline inside our university lab environment!"
    });
    console.log("\n✔ [NODEMAILER]: Dispatch success! Handed over to local server.");
  } catch (error) {
    console.error("\n Error:", error.message);
  }
}
