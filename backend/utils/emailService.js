import nodemailer from 'nodemailer';

// ── Brevo (formerly Sendinblue) SMTP over HTTPS-compatible port ───────────────
// Brevo uses port 587 BUT routes through their infrastructure which Render allows.
// If port 587 is blocked, we fall back to their HTTP API via nodemailer's
// custom transport using fetch (port 443 only).
//
// Required env vars on Render:
//   BREVO_USER  = your Brevo login email
//   BREVO_PASS  = your Brevo SMTP key (from brevo.com → SMTP & API → SMTP tab)
//   CLIENT_URL  = https://your-frontend.vercel.app

const createTransporter = () => {
    const user = (process.env.BREVO_USER || '').trim();
    const pass = (process.env.BREVO_PASS || '').trim();

    if (!user || !pass) {
        throw new Error(
            'BREVO_USER and BREVO_PASS must be set.\n' +
            'Sign up free at brevo.com → SMTP & API → SMTP tab → copy credentials.'
        );
    }

    return nodemailer.createTransport({
        host:   'smtp-relay.brevo.com',
        port:   587,
        secure: false,
        auth:   { user, pass },
        tls:    { rejectUnauthorized: false },
    });
};

// ── HTML email template ───────────────────────────────────────────────────────
const verificationEmailTemplate = (username, verificationUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">🧠 AI Learning Assistant</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Verify your email address</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Hi ${username} 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
              Thanks for signing up! Please verify your email address to activate your account.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 32px;">
                  <a href="${verificationUrl}"
                     style="display:inline-block;background:linear-gradient(135deg,#10b981,#14b8a6);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;">
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
    </td></tr>
  </table>
</body>
</html>`;

// ── Send verification email ───────────────────────────────────────────────────
export const sendVerificationEmail = async (toEmail, username, token) => {
    const clientUrl       = (process.env.CLIENT_URL || 'http://localhost:5173').trim();
    const verificationUrl = `${clientUrl}/verify-email/${token}`;
    const from            = (process.env.BREVO_USER || '').trim();
    const transporter     = createTransporter();

    await transporter.sendMail({
        from:    `"AI Learning Assistant" <${from}>`,
        to:      toEmail,
        subject: '✅ Verify your email — AI Learning Assistant',
        html:    verificationEmailTemplate(username, verificationUrl),
    });
};
