// Brevo HTTP API — uses port 443 (HTTPS), works on Render free tier
// All SMTP ports (587, 465, 25) are blocked on Render.
//
// Required env vars:
//   BREVO_API_KEY  = your Brevo API key (starts with xkeysib-)
//                   Get it: brevo.com → top-right menu → SMTP & API → API Keys → Generate
//   BREVO_USER     = your Brevo sender email (must be verified in Brevo)
//   CLIENT_URL     = https://your-frontend.vercel.app

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

export const sendVerificationEmail = async (toEmail, username, token) => {
    const apiKey    = (process.env.BREVO_API_KEY || '').trim();
    const fromEmail = (process.env.BREVO_USER    || '').trim();
    const clientUrl = (process.env.CLIENT_URL    || 'http://localhost:5173').trim();

    if (!apiKey)    throw new Error('BREVO_API_KEY is not set. Get it from brevo.com → SMTP & API → API Keys.');
    if (!fromEmail) throw new Error('BREVO_USER is not set.');

    const verificationUrl = `${clientUrl}/verify-email/${token}`;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method:  'POST',
        headers: {
            'accept':       'application/json',
            'api-key':      apiKey,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender:      { name: 'AI Learning Assistant', email: fromEmail },
            to:          [{ email: toEmail }],
            subject:     '✅ Verify your email — AI Learning Assistant',
            htmlContent: verificationEmailTemplate(username, verificationUrl),
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('[BREVO] API error response:', JSON.stringify(data));
        throw new Error(data.message || `Brevo API error: ${response.status}`);
    }

    console.log('[BREVO] Email sent successfully to:', toEmail, '| messageId:', data.messageId);
};
