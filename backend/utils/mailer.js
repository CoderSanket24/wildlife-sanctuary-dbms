import nodemailer from 'nodemailer';

// Create a reusable transporter object using SMTP transport
// Demonstrates Unit III: Application Layer (SMTP)
export const sendEmail = async (to, subject, text) => {
  try {
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });

    const info = await transporter.sendMail({
      from: '"Wildlife Sanctuary System" <admin@wildlife.org>', // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
    });

    console.log("[SMTP] Message sent: %s", info.messageId);
    console.log("[SMTP] Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (error) {
    console.error("[SMTP Error] Failed to send email:", error);
  }
};
