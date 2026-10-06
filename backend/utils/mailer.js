import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────────────────────────────────
// Unit III: Application Layer — Email (SMTP, MIME)
//
// SMTP (Simple Mail Transfer Protocol) works on TCP port 587 (STARTTLS) or
// port 465 (SSL). nodemailer handles the full SMTP handshake:
//   1. Client connects to SMTP server (TCP connection)
//   2. EHLO handshake
//   3. AUTH LOGIN (credentials)
//   4. MAIL FROM / RCPT TO / DATA (RFC 5321)
//   5. MIME-encoded message body (RFC 2045)
//   6. QUIT
// ─────────────────────────────────────────────────────────────────────────────

const createTransporter = async () => {
  // If real Gmail credentials exist in .env → use Gmail SMTP (real delivery)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('[SMTP] Using Gmail SMTP (real delivery mode)');
    return nodemailer.createTransport({
      service: 'gmail',         // Gmail SMTP: smtp.gmail.com:587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App Password (not your Gmail password)
      },
    });
  }

  // Fallback → Ethereal fake SMTP (dev/test mode — no real delivery)
  console.log('[SMTP] SMTP_USER not set → using Ethereal test account (no real delivery)');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,          // STARTTLS port (Unit III: Transport Layer - TCP)
    secure: false,      // Upgrades to TLS via STARTTLS
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"Wildlife Sanctuary System" <${process.env.SMTP_USER || 'admin@wildlife.org'}>`,
      to,
      subject,
      text,
    });

    console.log('[SMTP] Message ID :', info.messageId);

    // Ethereal preview URL (only works in test mode)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('[SMTP] Preview URL :', previewUrl);
      console.log('[SMTP] ↑ Open this URL in your browser to see the email');
    } else {
      console.log(`[SMTP] Email delivered to real inbox: ${to}`);
    }

    return info;
  } catch (error) {
    console.error('[SMTP Error]', error.message);
  }
};
