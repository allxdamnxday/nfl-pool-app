// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

/**
 * Sends an email using nodemailer.
 * @async
 * @function sendEmail
 * @param {Object} options - The email options
 * @param {string} options.email - The recipient's email address
 * @param {string} options.subject - The email subject
 * @param {string} [options.text] - The plain text content of the email
 * @param {string} [options.html] - The HTML content of the email
 * @returns {Promise<Object>} The info object from nodemailer
 * @throws {Error} If there's an error sending the email
 */
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.text || options.html.replace(/<[^>]*>/g, ''), // Fallback plain text
    html: options.html
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;