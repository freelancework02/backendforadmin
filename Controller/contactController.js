// controllers/contactController.js
const nodemailer = require("nodemailer");

// Simple HTML escaping to avoid broken markup / XSS
const escapeHtml = (unsafe = "") => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const sendContactForm = async (req, res) => {
  try {
    const { name, email, msg } = req.body;

    // Basic validation
    if (!name || !email || !msg) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g. "smtp.weplanfuture.com"
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMsg = escapeHtml(msg);
    const msgHtml = safeMsg.replace(/\n/g, "<br>");

    // Text-only version (for spam filters + basic mail clients)
    const textBody = `
New enquiry from WePlanFuture.com

Name   : ${name}
Email  : ${email}
Message:
${msg}
    `.trim();

    // === HTML TEMPLATE ===
    // Colors chosen to match a modern financial/consulting brand:
    // - Dark navy background/header
    // - Teal / cyan accents
    // - Light neutral surfaces
    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Website Enquiry - We Plan Future</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    /* Some clients ignore <style>, but many mobile apps respect basic rules */
    @media (max-width: 600px) {
      .wpf-container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .wpf-inner {
        padding: 18px !important;
      }
      .wpf-header,
      .wpf-footer {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .wpf-cta-btn {
        width: 100% !important;
        text-align: center !important;
        display: block !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#020617;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#020617;padding:24px 0;">
    <tr>
      <td align="center" style="padding:0 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="wpf-container" style="max-width:640px;background:#0b1120;border-radius:18px;overflow:hidden;box-shadow:0 18px 40px rgba(15,23,42,0.8);">
          
          <!-- HEADER -->
          <tr>
            <td class="wpf-header" style="background:linear-gradient(135deg,#020617,#0b1120 35%,#00bcd4 120%);padding:20px 28px 18px 28px;color:#e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <div style="font-size:22px;font-weight:700;color:#f9fafb;letter-spacing:0.03em;">
                      We Plan Future
                    </div>
                    <div style="margin-top:4px;font-size:12px;color:#cbd5f5;text-transform:uppercase;letter-spacing:0.16em;">
                      Financial Planning & Protection
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SUB HEADER STRIP -->
          <tr>
            <td style="background:#020617;padding:10px 28px;color:#9ca3af;font-size:12px;border-bottom:1px solid rgba(148,163,184,0.25);">
              <span style="color:#38bdf8;font-weight:600;">New enquiry received</span>
              from the contact form on 
              <a href="https://weplanfuture.com" style="color:#e5e7eb;text-decoration:none;">weplanfuture.com</a>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="wpf-inner" style="padding:22px 28px 24px 28px;background:#020617;">
              <!-- Intro card -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-radius:14px;background:#020617;border:1px solid rgba(148,163,184,0.35);margin-bottom:16px;">
                <tr>
                  <td style="padding:16px 18px 14px 18px;">
                    <div style="font-size:13px;color:#9ca3af;margin-bottom:8px;">
                      A visitor has shared their details and a message. Review the summary below and reply when convenient.
                    </div>
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#6b7280;">
                      Website Contact Form • We Plan Future
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Details card -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-radius:14px;background:#020617;border:1px solid rgba(148,163,184,0.35);margin-bottom:16px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(148,163,184,0.35);">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6b7280;margin-bottom:4px;">
                      Name
                    </div>
                    <div style="font-size:16px;color:#f9fafb;font-weight:600;">
                      ${safeName}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(148,163,184,0.35);">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6b7280;margin-bottom:4px;">
                      Email
                    </div>
                    <div style="font-size:15px;">
                      <a href="mailto:${safeEmail}" style="color:#38bdf8;text-decoration:none;">${safeEmail}</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6b7280;margin-bottom:6px;">
                      Message
                    </div>
                    <div style="font-size:15px;line-height:1.7;color:#e5e7eb;">
                      ${msgHtml}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA / Quick actions -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:4px;">
                <tr>
                  <td>
                    <a href="mailto:${safeEmail}" class="wpf-cta-btn"
                       style="display:inline-block;padding:10px 20px;border-radius:999px;background:#06b6d4;color:#0f172a;font-size:14px;font-weight:600;text-decoration:none;">
                      Reply to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding-top:10px;font-size:11px;color:#6b7280;line-height:1.6;">
                    <div>
                      Tip: When you reply, keep the subject line clear and include a short summary of their goal
                      (e.g. “Retirement planning question” or “Family protection plan”).
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="wpf-footer" style="background:#020617;padding:14px 28px 18px 28px;border-top:1px solid rgba(148,163,184,0.35);">
              <div style="font-size:11px;color:#6b7280;line-height:1.6;">
                <div>
                  This email was generated automatically from the contact form on
                  <a href="https://weplanfuture.com" style="color:#38bdf8;text-decoration:none;">weplanfuture.com</a>.
                </div>
                <div style="margin-top:4px;">
                  © ${new Date().getFullYear()} We Plan Future. All rights reserved.
                </div>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const mailOptions = {
      from: `"We Plan Future Contact Form" <${process.env.SMTP_USER}>`, // fixed, branded sender
      replyTo: email, // user who filled the form
      to: process.env.CONTACT_TO_EMAIL,
      subject: `New website enquiry from ${name}`,
      text: textBody,
      html: htmlBody,
      headers: {
        "X-Mailer": "WePlanFuture-ContactForm",
        "List-Unsubscribe": `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
      },
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Error sending contact form email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

module.exports = {
  sendContactForm,
};
