const nodemailer = require("nodemailer");

// ── Reusable transporter (same config as your other mailers) ──────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ────────────────────────────────────────────────────────────────────────────
//  esc — same HTML-injection guard as config/mailer.js and the enrollment
//  mailer. Zone registration has just as many free-text fields (address,
//  schoolName, gradeClass, guardianName…) as enrollment, so every
//  user-supplied interpolation below goes through it.
// ────────────────────────────────────────────────────────────────────────────
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const studentRows = (students) =>
  students
    .map(
      (s, i) => `
        <tr style="background:${i % 2 ? "#f8f9fc" : "#ffffff"};">
          <td style="padding:6px 10px;color:#64748b;">${i + 1}</td>
          <td style="padding:6px 10px;font-weight:600;">${esc(s.fullName)}</td>
          <td style="padding:6px 10px;">${esc(s.gender)}${s.age ? `, age ${esc(s.age)}` : ""}</td>
          <td style="padding:6px 10px;">${esc(s.schoolName)} — ${esc(s.gradeClass)}</td>
          <td style="padding:6px 10px;">${esc(s.guardianName)}<br/>+91 ${esc(s.guardianPhone)}</td>
          <td style="padding:6px 10px;"><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></td>
        </tr>`
    )
    .join("");

// ── Admin notification — now only sent once payment has actually cleared ──
const sendZoneRegistrationAdminNotification = async (reg) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a7f4b; padding: 24px 28px;">
        <h2 style="color: white; margin: 0; font-size: 18px;">💰 Payment Received — ${esc(reg.referenceNumber)}</h2>
        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">${esc(reg.zoneCode)} · ${esc(reg.zoneName)}</p>
      </div>

      <div style="padding: 24px 28px; background: #f8f9fc;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 5px 0; color: #64748b; width: 160px;">Team Size</td>
              <td style="padding: 5px 0; font-weight: 600;">${reg.teamSize}</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Base Fee</td>
              <td style="padding: 5px 0;">₹${reg.baseFee.toLocaleString("en-IN")}</td></tr>
          ${
            reg.botPurchase?.opted
              ? `<tr><td style="padding: 5px 0; color: #64748b;">Add-on</td>
                <td style="padding: 5px 0;">${esc(reg.botPurchase.label)} — ₹${reg.botPurchase.price.toLocaleString("en-IN")}</td></tr>`
              : ""
          }
          <tr><td style="padding: 5px 0; color: #64748b;">Amount Paid</td>
              <td style="padding: 5px 0; font-weight: 700; color: #1a7f4b;">₹${reg.totalFee.toLocaleString("en-IN")}</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Razorpay Payment ID</td>
              <td style="padding: 5px 0; font-family: monospace;">${esc(reg.payment?.razorpayPaymentId || "—")}</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Paid At</td>
              <td style="padding: 5px 0;">${reg.payment?.paidAt ? new Date(reg.payment.paidAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"} IST</td></tr>
        </table>

        <h3 style="color: #1a7f4b; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 12px;">Participants</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="text-align:left; color:#64748b;">
              <th style="padding:6px 10px;">#</th>
              <th style="padding:6px 10px;">Name</th>
              <th style="padding:6px 10px;">Gender</th>
              <th style="padding:6px 10px;">School / Grade</th>
              <th style="padding:6px 10px;">Guardian</th>
              <th style="padding:6px 10px;">Email</th>
            </tr>
          </thead>
          <tbody>${studentRows(reg.students)}</tbody>
        </table>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"CyberFlix 2K26" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `[${reg.referenceNumber}] 💰 Paid — ${reg.zoneCode} (${reg.teamSize} participant${reg.teamSize > 1 ? "s" : ""})`,
    html,
  });
};

// ── Confirmation email to the first student's guardian ─────────────────────
const sendZoneRegistrationConfirmation = async (reg) => {
  const lead = reg.students[0];
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #5b3fa8, #3fb9d4); padding: 28px;">
        <h2 style="color: white; margin: 0; font-size: 20px;">✶ Registration Sealed — Payment Received!</h2>
        <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 6px 0 0;">CyberFlix 2K26 · ${esc(reg.zoneCode)} — ${esc(reg.zoneName)}</p>
      </div>

      <div style="padding: 28px;">
        <p style="color: #0f172a; font-size: 15px;">Hi <strong>${esc(lead.guardianName)}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.7;">
          Your journey begins! We've received both the registration and payment for
          <strong>${esc(reg.students.map((s) => s.fullName).join(" & "))}</strong>
          in <strong style="color:#5b3fa8;">${esc(reg.zoneName)}</strong> (${esc(reg.zoneCode)}).
        </p>

        <div style="margin: 20px 0; padding: 16px 20px; background: #f8f4ff; border-radius: 10px; border: 1.5px dashed #c4b5fd;">
          <p style="margin: 0; font-size: 12px; color: #5b3fa8; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Your Reference Number</p>
          <p style="margin: 6px 0 0; font-size: 24px; font-weight: 800; font-family: monospace; color: #5b3fa8;">${esc(reg.referenceNumber)}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0;">
          <tr style="background: #f8f9fc;">
            <td style="padding: 8px 12px; color: #64748b; border-radius: 6px 0 0 6px;">Zone</td>
            <td style="padding: 8px 12px; font-weight: 600;">${esc(reg.zoneCode)} — ${esc(reg.zoneName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #64748b;">Team Size</td>
            <td style="padding: 8px 12px; font-weight: 600;">${reg.teamSize}</td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 8px 12px; color: #64748b;">Amount Paid</td>
            <td style="padding: 8px 12px; font-weight: 700; color: #1a7f4b;">✓ ₹${reg.totalFee.toLocaleString("en-IN")}${
    reg.botPurchase?.opted ? ` (incl. ${esc(reg.botPurchase.label)})` : ""
  }</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #64748b;">Payment ID</td>
            <td style="padding: 8px 12px; font-family: monospace; font-size: 12px;">${esc(reg.payment?.razorpayPaymentId || "—")}</td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 8px 12px; color: #64748b;">Event Date</td>
            <td style="padding: 8px 12px; font-weight: 600;">31 October 2026</td>
          </tr>
        </table>

        <p style="color: #475569; font-size: 13px; line-height: 1.7;">
          Nothing more to pay — you're fully registered. We'll be in touch on WhatsApp at
          <strong>+91 ${esc(lead.guardianPhone)}</strong> with event-day details closer to the date.
          For urgent queries, call <strong>+91 73580 39311</strong>.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          This is an automated confirmation. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"CyberFlix 2K26" <${process.env.SMTP_USER}>`,
    to: lead.email,
    subject: `[${reg.referenceNumber}] ✶ Registration Sealed — ${reg.zoneCode}`,
    html,
  });
};

module.exports = { sendZoneRegistrationAdminNotification, sendZoneRegistrationConfirmation };