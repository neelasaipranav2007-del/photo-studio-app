const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (options) => {
  const emailDir = path.resolve(__dirname, '../../sent_emails');
  const timestamp = Date.now();
  const sanitizedSubject = options.subject.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
  const emailFolder = path.join(emailDir, `email_${timestamp}_${sanitizedSubject}`);

  // Helper to save email and PDF attachments locally to disk
  const saveLocally = () => {
    try {
      fs.mkdirSync(emailFolder, { recursive: true });
      
      let emailContent = `Date: ${new Date().toLocaleString()}\n`;
      emailContent += `To: ${options.to}\n`;
      emailContent += `Subject: ${options.subject}\n`;
      emailContent += `\nBody:\n${options.text}\n`;

      fs.writeFileSync(path.join(emailFolder, 'message.txt'), emailContent);

      if (options.attachments && options.attachments.length > 0) {
        options.attachments.forEach(att => {
          fs.writeFileSync(path.join(emailFolder, att.filename), att.content);
        });
      }

      console.log(`\n========================================`);
      console.log(`💾 [Local Backup] Email saved locally!`);
      console.log(`Path: ${emailFolder}`);
      console.log(`========================================\n`);
    } catch (err) {
      console.error('Failed to save email backup locally:', err.message);
    }
  };

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 4000, // 4 seconds timeout to fail fast on blocked networks
      greetingTimeout: 4000
    });

    await transporter.sendMail({
      from: `"By Jonathan Studio" <${process.env.EMAIL_USER}>`,
      to: options.to,
      replyTo: options.replyTo || process.env.EMAIL_USER,
      subject: options.subject,
      text: options.text,
      attachments: options.attachments || [],
    });

    console.log(`\n========================================`);
    console.log(`✉️ EMAIL SENT SUCCESSFULLY!`);
    console.log(`To: ${options.to}`);
    console.log(`========================================\n`);
  } catch (error) {
    console.error("SMTP Delivery Failed:", error.message);
    console.log("Saving email copy locally...");
    saveLocally();
    throw new Error(`SMTP Connection Timeout. A copy has been saved locally at 'server/sent_emails'.`);
  }
};

module.exports = { sendEmail };
