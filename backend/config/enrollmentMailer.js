const nodemailer = require("nodemailer");

// ── Reusable transporter (same config as your contact mailer) ─────────────
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
//  esc  (FIX #3 from review: HTML injection in emails)
//
//  Same escaper as config/mailer.js. The enrollment form has MORE free-text
//  fields than the contact form — address, institution, grade, relationship,
//  levelName — none of which are regex-restricted, so without this a
//  submitter could inject links, tracking pixels, or layout-breaking markup
//  into the email your admin opens. Every user-supplied interpolation below
//  goes through it.
// ────────────────────────────────────────────────────────────────────────────
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ── Helper: human-readable time slot ─────────────────────────────────────
const TIME_SLOT_LABELS = {
  "10-12": "🌤️ 10:00 AM – 12:00 PM",
  "12-2":  "☀️ 12:00 PM – 2:00 PM",
  "2-4":   "🌇 2:00 PM – 4:00 PM",
  "4-6":   "🌆 4:00 PM – 6:00 PM",
};

// ── Admin notification ────────────────────────────────────────────────────
const sendEnrollmentAdminNotification = async (enrollment) => {
  // The label normally comes from our own constant, but the fallback is the
  // raw (enum-validated) timeSlot — escaped anyway for defense in depth.
  const slotLabel = esc(TIME_SLOT_LABELS[enrollment.timeSlot] || enrollment.timeSlot);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #7c3aed; padding: 24px 28px;">
        <h2 style="color: white; margin: 0; font-size: 18px;">🚀 New Enrollment — ${esc(enrollment.referenceNumber)}</h2>
      </div>

      <div style="padding: 24px 28px; background: #f8f9fc;">
        <h3 style="color: #7c3aed; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 12px;">🎒 Student</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 5px 0; color: #64748b; width: 140px;">Name</td>
              <td style="padding: 5px 0; font-weight: 600;">${esc(enrollment.studentName)}</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Date of Birth</td>
              <td style="padding: 5px 0;">${new Date(enrollment.dob).toLocaleDateString("en-IN")}</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Gender</td>
              <td style="padding: 5px 0;">${esc(enrollment.gender)}</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Grade</td>
              <td style="padding: 5px 0;">${esc(enrollment.grade)}</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Institution</td>
              <td style="padding: 5px 0;">${esc(enrollment.institution)}</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Learning Mode</td>
              <td style="padding: 5px 0;">${esc(enrollment.learningMode)}</td></tr>
        </table>

        <h3 style="color: #7c3aed; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 12px;">👨‍👩‍👧 Parent / Guardian</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 5px 0; color: #64748b; width: 140px;">Name</td>
              <td style="padding: 5px 0; font-weight: 600;">${esc(enrollment.parentName)} (${esc(enrollment.relationship)})</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Mobile</td>
              <td style="padding: 5px 0;">+91 ${esc(enrollment.mobile)}</td></tr>
          ${enrollment.altMobile ? `<tr><td style="padding: 5px 0; color: #64748b;">Alt Mobile</td>
              <td style="padding: 5px 0;">+91 ${esc(enrollment.altMobile)}</td></tr>` : ""}
          <tr><td style="padding: 5px 0; color: #64748b;">Email</td>
              <td style="padding: 5px 0;"><a href="mailto:${esc(enrollment.email)}">${esc(enrollment.email)}</a></td></tr>
          <tr><td style="padding: 5px 0; color: #64748b; vertical-align: top;">Address</td>
              <td style="padding: 5px 0;">${esc(enrollment.address)}</td></tr>
        </table>

        <h3 style="color: #7c3aed; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 12px;">🎓 Course</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 5px 0; color: #64748b; width: 140px;">Program</td>
              <td style="padding: 5px 0; font-weight: 700; color: #7c3aed;">${esc(enrollment.course)}</td></tr>
          ${enrollment.tier ? `<tr><td style="padding: 5px 0; color: #64748b;">Tier</td>
              <td style="padding: 5px 0;">${esc(enrollment.tier)}</td></tr>` : ""}
          ${enrollment.levelName ? `<tr><td style="padding: 5px 0; color: #64748b;">Level</td>
              <td style="padding: 5px 0;">${esc(enrollment.levelName)}</td></tr>` : ""}
          <tr><td style="padding: 5px 0; color: #64748b;">Time Slot</td>
              <td style="padding: 5px 0;">${slotLabel}</td></tr>
          <tr><td style="padding: 5px 0; color: #64748b;">Submitted</td>
              <td style="padding: 5px 0;">${new Date(enrollment.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td></tr>
        </table>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"LearnX Enrollment" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    // Subject is plain text (not HTML) — nodemailer encodes it, no esc needed.
    subject: `[${enrollment.referenceNumber}] New Enrollment — ${enrollment.studentName} (${enrollment.course})`,
    html,
  });
};

// ── Confirmation email to parent ──────────────────────────────────────────
const sendEnrollmentConfirmation = async (enrollment) => {
  const slotLabel = esc(TIME_SLOT_LABELS[enrollment.timeSlot] || enrollment.timeSlot);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 28px;">
        <h2 style="color: white; margin: 0; font-size: 20px;">🎉 Enrollment Received!</h2>
        <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 6px 0 0;">LearnX Skill Program</p>
      </div>

      <div style="padding: 28px;">
        <p style="color: #0f172a; font-size: 15px;">Hi <strong>${esc(enrollment.parentName)}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.7;">
          Thank you for enrolling <strong>${esc(enrollment.studentName)}</strong> in the
          <strong style="color: #7c3aed;">${esc(enrollment.course)}</strong>${enrollment.tier ? ` (${esc(enrollment.tier)})` : ""}${enrollment.levelName ? ` — ${esc(enrollment.levelName)}` : ""} program.
          Our team will review the application and contact you shortly to confirm the spot.
        </p>

        <div style="margin: 20px 0; padding: 16px 20px; background: #f8f4ff; border-radius: 10px; border: 1.5px dashed #c4b5fd;">
          <p style="margin: 0; font-size: 12px; color: #7c3aed; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Your Reference Number</p>
          <p style="margin: 6px 0 0; font-size: 24px; font-weight: 800; font-family: monospace; color: #7c3aed;">${esc(enrollment.referenceNumber)}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0;">
          <tr style="background: #f8f9fc;">
            <td style="padding: 8px 12px; color: #64748b; border-radius: 6px 0 0 6px;">Student</td>
            <td style="padding: 8px 12px; font-weight: 600;">${esc(enrollment.studentName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #64748b;">Program</td>
            <td style="padding: 8px 12px; font-weight: 600; color: #7c3aed;">${esc(enrollment.course)}${enrollment.tier ? ` · ${esc(enrollment.tier)}` : ""}</td>
          </tr>
          <tr style="background: #f8f9fc;">
            <td style="padding: 8px 12px; color: #64748b;">Preferred Slot</td>
            <td style="padding: 8px 12px; font-weight: 600;">${slotLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #64748b;">Mode</td>
            <td style="padding: 8px 12px; font-weight: 600;">${esc(enrollment.learningMode)}</td>
          </tr>
        </table>

        <p style="color: #475569; font-size: 13px; line-height: 1.7;">
          For any queries, reach us at <strong>+91 73580 39311</strong> or visit us at
          CIT Nagar, Nandhanam, Chennai – 600035.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          This is an automated confirmation. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"LearnX — Cyberbots" <${process.env.SMTP_USER}>`,
    to: enrollment.email,
    subject: `[${enrollment.referenceNumber}] 🎉 Enrollment Received — ${enrollment.studentName}`,
    html,
  });
};

module.exports = { sendEnrollmentAdminNotification, sendEnrollmentConfirmation };