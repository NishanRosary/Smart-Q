const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const hasSmtpConfig = () => Boolean(SMTP_USER && SMTP_PASS && SMTP_FROM);

const isValidEmail = (value) => {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
};

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }
  return transporter;
};

const buildHtmlTemplate = ({ userName, tokenNumber, serviceName, estimatedWaitTime }) => {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
      <h2 style="margin:0 0 16px;color:#111827;">Queue Registration Confirmation - Smart'Q</h2>
      <p style="margin:0 0 14px;color:#374151;">Dear ${userName},</p>
      <p style="margin:0 0 16px;color:#374151;">This email confirms your successful registration in the queue.</p>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
        <p style="margin:0 0 8px;color:#111827;"><strong>Token Number:</strong> ${tokenNumber}</p>
        <p style="margin:0 0 8px;color:#111827;"><strong>Service Type:</strong> ${serviceName}</p>
        <p style="margin:0;color:#111827;"><strong>Estimated Waiting Time:</strong> ${estimatedWaitTime} minutes</p>
      </div>
      <p style="margin:16px 0 0;color:#374151;">Kindly be available near the service counter before your turn.</p>
      <p style="margin:16px 0 0;color:#374151;">Thank you for using Smart'Q.</p>
      <p style="margin:16px 0 0;color:#374151;">Sincerely,<br/>Smart'Q Support Team</p>
    </div>
  `;
};

const sendQueueRegistrationEmail = async ({
  toEmail,
  userName,
  tokenNumber,
  serviceName,
  estimatedWaitTime
}) => {
  if (!isValidEmail(toEmail)) return { sent: false, reason: "invalid-recipient" };
  if (!hasSmtpConfig()) return { sent: false, reason: "smtp-not-configured" };

  const transporterInstance = getTransporter();
  const mailOptions = {
    from: SMTP_FROM,
    to: toEmail,
    subject: "Queue Registration Confirmation - Smart'Q",
    text:
      `Dear ${userName},\n\n` +
      "This email confirms your successful registration in the queue.\n\n" +
      `Token Number: ${tokenNumber}\n` +
      `Service Type: ${serviceName}\n` +
      `Estimated Waiting Time: ${estimatedWaitTime} minutes\n\n` +
      "Kindly be available near the service counter before your turn.\n\n" +
      "Thank you for using Smart'Q.\n\n" +
      "Sincerely,\nSmart'Q Support Team",
    html: buildHtmlTemplate({ userName, tokenNumber, serviceName, estimatedWaitTime })
  };

  await transporterInstance.sendMail(mailOptions);
  return { sent: true };
};

module.exports = {
  sendQueueRegistrationEmail
};
