const nodemailer = require("nodemailer");

// ── Create reusable transporter ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ────────────────────────────────────────────────────────────────────────────
//  esc  (FIX #3 from review: HTML injection in emails)
//
//  Every user-supplied value interpolated into the HTML below MUST go
//  through this. Names are regex-restricted by the validators, but fields
//  like message and organisation accept arbitrary characters — without
//  escaping, a submitter could put <a href="https://phish...">, an <img>
//  tracking pixel, or layout-breaking markup straight into the email your
//  admin opens. Escaping the five HTML-significant characters turns any
//  such payload into inert visible text.
//
//  Server-generated values (referenceNumber, dates) don't strictly need
//  it, but it's applied to user fields consistently so nothing slips
//  through when the template is edited later.
// ────────────────────────────────────────────────────────────────────────────
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ── Email sent to ADMIN when a new enquiry arrives ─────────────────────────
const sendAdminNotification = async (contact) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0f172a; padding: 24px 28px;">
        <h2 style="color: white; margin: 0; font-size: 18px;">📬 New Enquiry — ${esc(contact.referenceNumber)}</h2>
      </div>
      <div style="padding: 24px 28px; background: #f8f9fc;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Name</td>
              <td style="padding: 6px 0; font-weight: 600;">${esc(contact.firstName)} ${esc(contact.lastName)}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Email</td>
              <td style="padding: 6px 0;"><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Phone</td>
              <td style="padding: 6px 0;">+91 ${esc(contact.phone)}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Organisation</td>
              <td style="padding: 6px 0;">${esc(contact.organisation || "—")}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Enquiry Type</td>
              <td style="padding: 6px 0;">${esc(contact.enquiryType)}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Source</td>
              <td style="padding: 6px 0;">${esc(contact.hearAboutUs || "—")}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b; vertical-align: top;">Message</td>
              <td style="padding: 6px 0; white-space: pre-line;">${esc(contact.message)}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Submitted</td>
              <td style="padding: 6px 0;">${new Date(contact.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td></tr>
        </table>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Cyberbots Contact Form" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    // Subject is plain text (not HTML) — nodemailer encodes it, no esc needed.
    subject: `[${contact.referenceNumber}] New ${contact.enquiryType} from ${contact.firstName} ${contact.lastName}`,
    html,
  });
};

// ── Confirmation email sent to the USER ───────────────────────────────────
const sendUserConfirmation = async (contact) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: #1a56db; padding: 24px 28px;">
        <h2 style="color: white; margin: 0; font-size: 18px;">✅ We've received your message!</h2>
      </div>
      <div style="padding: 24px 28px;">
        <p style="color: #0f172a; font-size: 15px;">Hi <strong>${esc(contact.firstName)}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.7;">
          Thank you for reaching out to <strong>Cyberbots</strong>. We've received your enquiry
          (<strong>${esc(contact.enquiryType)}</strong>) and will get back to you within one business day.
        </p>
        <div style="margin: 20px 0; padding: 14px 18px; background: #f8f9fc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">Your reference number</p>
          <p style="margin: 4px 0 0; font-size: 20px; font-weight: 700; font-family: monospace; color: #1a56db;">${esc(contact.referenceNumber)}</p>
        </div>
        <p style="color: #475569; font-size: 13px; line-height: 1.7;">
          If you have any urgent queries, you can reach us at <strong>+91 73580 39311</strong>
          or visit us at CIT Nagar, Nandhanam, Chennai – 600035.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          This is an automated confirmation. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Cyberbots" <${process.env.SMTP_USER}>`,
    to: contact.email,
    subject: `[${contact.referenceNumber}] We've received your enquiry`,
    html,
  });
};

module.exports = { sendAdminNotification, sendUserConfirmation };