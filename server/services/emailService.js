import { SendMailClient } from 'zeptomail';

const ZEPTOMAIL_URL = 'https://api.zeptomail.in/v1.1/email';

/**
 * Sends a 6-digit Login OTP email to the user via ZeptoMail.
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP string
 */
export async function sendLoginOtpEmail(email, otp) {
  const token = process.env.ZEPTOMAIL_SEND_MAIL_TOKEN;

  if (!token) {
    console.error('[EmailService] ERROR: ZEPTOMAIL_SEND_MAIL_TOKEN is not configured in environment variables.');
    throw new Error('Email service configuration missing.');
  }

  const client = new SendMailClient({ url: ZEPTOMAIL_URL, token });

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Verification Code</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #09090b; padding: 28px 20px; text-align: center; }
        .header-title { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
        .header-subtitle { color: #edffa7; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
        .content { padding: 36px 32px; text-align: center; }
        .greeting { font-size: 16px; font-weight: 600; color: #27272a; margin-bottom: 8px; }
        .subtitle { font-size: 14px; color: #71717a; margin-bottom: 24px; line-height: 1.5; }
        .otp-box { background: #f4f4f5; border: 2px dashed #09090b; border-radius: 10px; padding: 20px; margin: 0 auto 24px auto; display: inline-block; width: 80%; }
        .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #09090b; font-family: 'Courier New', Courier, monospace; }
        .expiry-note { font-size: 13px; font-weight: 600; color: #dc2626; margin-bottom: 24px; }
        .security-box { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 14px; text-align: left; font-size: 12px; color: #71717a; line-height: 1.5; }
        .security-box strong { color: #18181b; }
        .footer { background: #fafafa; border-top: 1px solid #f4f4f5; padding: 18px 20px; text-align: center; font-size: 12px; color: #a1a1aa; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="header-title">GOOD LUCK SOCIETY</h1>
          <div class="header-subtitle">Official Verification</div>
        </div>
        <div class="content">
          <div class="greeting">Login Verification Code</div>
          <div class="subtitle">Please use the following single-use verification code to complete your sign in:</div>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="expiry-note">⏰ This code will expire in 10 minutes.</div>
          
          <div class="security-box">
            <strong>🔒 Security Notice:</strong><br>
            • Do not share this verification code with anyone.<br>
            • Good Luck Society staff will never ask for your verification code.<br>
            • If you did not attempt to log in, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Good Luck Society. All rights reserved.<br>
          https://www.goodlucksociety.in
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await client.sendMail({
      from: {
        address: 'noreply@goodlucksociety.in',
        name: 'Good Luck Society'
      },
      to: [
        {
          email_address: {
            address: email,
            name: email.split('@')[0]
          }
        }
      ],
      subject: 'Your Good Luck Society Login Verification Code',
      htmlbody: htmlBody
    });

    return response;
  } catch (err) {
    console.error('[EmailService] ZeptoMail dispatch error for email:', email, err?.message || err);
    throw new Error('Failed to send verification email. Please try again.');
  }
}
