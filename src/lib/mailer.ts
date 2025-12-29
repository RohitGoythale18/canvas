import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmailNotification(
    to: string,
    designTitle: string
) {
    try {
        await transporter.sendMail({
            from: `"Canvas App" <${process.env.SMTP_FROM}>`,
            to,
            subject: 'A design was shared with you',
            html: `
      <h2>Design Shared</h2>
      <p>The design <b>${designTitle}</b> was shared with you.</p>
      <p>Please login to view it.</p>
    `,
        });
        console.log('Email notification sent successfully');
    } catch (error) {
        console.error('Failed to send email notification:', error);
        throw error; // Re-throw to allow caller to handle
    }
}
