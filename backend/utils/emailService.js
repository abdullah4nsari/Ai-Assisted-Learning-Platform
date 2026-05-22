import { Resend } from 'resend';

// ── Resend client (uses HTTPS API — works on Render, no SMTP port needed) ─────
const getResend = () => {
    const apiKey = (process.env.RESEND_API_KEY || '').trim();
    if (!apiKey) {
        throw new Error(
            'RESEND_API_KEY is not set.\n' +
            'Get a free API key at https://resend.com (100 emails/day free)\n' +
            'Then add RESEND_API_KEY to your Render environment variables.'
        );
    }
    return new Resend(apiKey);
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

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                🧠 AI Learning Assistant
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                Verify your email address
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">
                Hi ${username} 👋
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Thanks for signing up! Please verify your email address to activate your account and start learning.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${verificationUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#10b981,#14b8a6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
                      ✅ Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 28px;font-size:12px;color:#10b981;word-break:break-all;">
                ${verificationUrl}
              </p>

              <!-- Expiry notice -->
              <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#854d0e;">
                  ⏰ This link expires in <strong>24 hours</strong>. If it expires, you can request a new one from the login page.
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#94a3b8;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © ${new Date().getFullYear()} AI Learning Assistant · All rights reserved
              </p>
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
    const resend          = getResend();

    const { error } = await resend.emails.send({
        from:    'AI Learning Assistant <onboarding@resend.dev>',
        to:      toEmail,
        subject: '✅ Verify your email — AI Learning Assistant',
        html:    verificationEmailTemplate(username, verificationUrl),
    });

    if (error) throw new Error(error.message || 'Failed to send email via Resend');
};
