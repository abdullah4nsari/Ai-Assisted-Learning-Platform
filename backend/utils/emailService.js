import nodemailer from 'nodemailer';

// ── Transporter ───────────────────────────────────────────────────────────────
// Supports any SMTP provider via environment variables:
//
// Brevo (free 300/day):
//   SMTP_HOST=smtp-relay.brevo.com  SMTP_PORT=587
//   SMTP_USER=your_brevo_login_email  SMTP_PASS=your_brevo_smtp_key
//
// Mailgun:
//   SMTP_HOST=smtp.mailgun.org  SMTP_PORT=587
//   SMTP_USER=postmaster@yourdomain  SMTP_PASS=your_mailgun_smtp_password
//
// Gmail (local dev only — blocked on Render):
//   SMTP_HOST=smtp.gmail.com  SMTP_PORT=587
//   SMTP_USER=your@gmail.com  SMTP_PASS=your_app_password

const createTransporter = () => {
    const host = (process.env.SMTP_HOST || '').trim();
    const port =  parseInt(process.env.SMTP_PORT || '587', 10);
    const user = (process.env.SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASS || '').trim();

    if (!host || !user || !pass) {
        throw new Error(
            'SMTP_HOST, SMTP_USER and SMTP_PASS must be set in environment variables.\n' +
            'Recommended: use Brevo (free 300 emails/day) — smtp-relay.brevo.com:587'
        );
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,   // true for 465, false for 587
        auth: { user, pass },
        tls:  { rejectUnauthorized: false },
    });
};

// ── HTML email template ───────────────────────────────────────────────────────
const verificationEmailTemplate = (username, verificationUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🧠 AI Learning Assistant</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Verify your email address</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Hi ${username} 👋</p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Thanks for signing up! Please verify your email address to activate your account and start learning.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${verificationUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#10b981,#14b8a6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;">
                      ✅ Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Or copy this link into your browser:</p>
              <p style="margin:0 0 28px;font-size:12px;color:#10b981;word-break:break-all;">${verificationUrl}</p>
              <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#854d0e;">⏰ This link expires in <strong>24 hours</strong>.</p>
              </div>
              <p style="margin:0;font-size:13px;color:#94a3b8;">If you didn't create an account, ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} AI Learning Assistant</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Send verification email ───────────────────────────────────────────────────
export const sendVerificationEmail = async (toEmail, username, token) => {
    const clientUrl       = (process.env.CLIENT_URL || 'http://localhost:5173').trim();
    const verificationUrl = `${clientUrl}/verify-email/${token}`;
    const fromEmail       = (process.env.SMTP_USER || '').trim();
    const transporter     = createTransporter();

    await transporter.sendMail({
        from:    `"AI Learning Assistant" <${fromEmail}>`,
        to:      toEmail,
        subject: '✅ Verify your email — AI Learning Assistant',
        html:    verificationEmailTemplate(username, verificationUrl),
    });
};
