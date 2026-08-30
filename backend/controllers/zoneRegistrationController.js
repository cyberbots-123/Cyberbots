const crypto = require("crypto");
const ZoneRegistration = require("../models/ZoneRegistration");
const { normalizeZoneId, computeFee, ZONE_RULES } = require("../config/zoneRegistrationRules");
const { razorpay, verifyPaymentSignature, verifyWebhookSignature } = require("../config/razorpay");

const GENDER_OPTIONS = ["Female", "Male", "Other"];

// ── Per-field validation — mirrors ZoneRegistrationForm.jsx's
//    validateField() exactly, so a submission that passed client-side
//    validation always passes here too, and one that was tampered with
//    (or sent straight to the API) gets caught the same way. ──────────────
function validateStudent(s, index) {
  const errors = {};
  const name = (s.fullName || "").trim();
  if (!name) errors.fullName = "Enter the participant's full name.";
  else if (name.length < 2) errors.fullName = "That name looks too short.";

  if (!GENDER_OPTIONS.includes(s.gender)) errors.gender = "Select a valid gender.";

  const guardianName = (s.guardianName || "").trim();
  if (!guardianName) errors.guardianName = "Enter a parent or guardian's name.";

  const phoneDigits = String(s.guardianPhone || "").replace(/\D/g, "");
  if (phoneDigits.slice(-10).length !== 10 || phoneDigits.length > 12) {
    errors.guardianPhone = "Enter a valid 10-digit WhatsApp number.";
  }

  const email = (s.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  const address = (s.address || "").trim();
  if (!address || address.length < 8) errors.address = "Enter a complete home address.";

  if (!(s.schoolName || "").trim()) errors.schoolName = "Enter the participant's school.";
  if (!(s.gradeClass || "").trim()) errors.gradeClass = "Enter the grade and class, e.g. Grade 4 - A.";

  return { index, errors, hasError: Object.keys(errors).length > 0 };
}

// CF26-1A-7K3P9Q — short, zone-tagged, easy to read back over the phone.
// Also used as the Razorpay order's `receipt` — Razorpay requires receipts
// to be unique, and this already is.
function generateReferenceNumber(zoneId) {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `CF26-${zoneId.toUpperCase()}-${random}`;
}

// ── POST /api/zone-registration ────────────────────────────────────────────
// What ZoneRegistrationForm.jsx submits to. Validates, recomputes the fee,
// saves the registration as "pending", creates a matching Razorpay order,
// and returns everything the frontend needs to open Razorpay Checkout.
const registerForZone = async (req, res) => {
  try {
    const { zone, students, photoVideoConsent, botPurchase: wantsBotPurchaseRaw } = req.body;
    console.log(`📨 zone-registration request — zone="${zone}", students=${Array.isArray(students) ? students.length : "n/a"}`);

    // ── Zone lookup — the only place team size / fees ever come from ────
    const zoneId = normalizeZoneId(zone);
    if (!zoneId) {
      console.warn(`⚠️  zone-registration rejected — unknown zone "${zone}"`);
      return res.status(400).json({ success: false, message: `Unknown zone "${zone}".` });
    }
    const rule = ZONE_RULES[zoneId];

    // ── Shape checks ──────────────────────────────────────────────────
    if (!Array.isArray(students) || students.length !== rule.teamSize) {
      console.warn(`⚠️  zone-registration rejected — expected ${rule.teamSize} student(s), got ${Array.isArray(students) ? students.length : typeof students}`);
      return res.status(400).json({
        success: false,
        message: `${rule.code} requires exactly ${rule.teamSize} participant${rule.teamSize > 1 ? "s" : ""}.`,
      });
    }
    if (photoVideoConsent !== true) {
      console.warn("⚠️  zone-registration rejected — photoVideoConsent was not true:", photoVideoConsent);
      return res.status(400).json({ success: false, message: "Photo/video consent is required to register." });
    }

    // ── Per-student validation ───────────────────────────────────────
    const results = students.map(validateStudent);
    const failed = results.filter((r) => r.hasError);
    if (failed.length > 0) {
      console.warn("⚠️  zone-registration rejected — field errors:", JSON.stringify(failed));
      return res.status(400).json({
        success: false,
        message: "Please fix the highlighted fields.",
        fieldErrors: failed.map((f) => ({ student: f.index, errors: f.errors })),
      });
    }

    // ── Fee — recomputed server-side; the client's numbers are ignored ──
    const wantsBot = !!(rule.botPurchase && wantsBotPurchaseRaw === true);
    const fee = computeFee(zoneId, wantsBot);

    const cleanStudents = students.map((s) => ({
      fullName: s.fullName.trim(),
      gender: s.gender,
      age: (s.age || "").toString().trim(),
      guardianName: s.guardianName.trim(),
      guardianPhone: String(s.guardianPhone).replace(/\D/g, "").slice(-10),
      email: s.email.trim().toLowerCase(),
      address: s.address.trim(),
      schoolName: s.schoolName.trim(),
      gradeClass: s.gradeClass.trim(),
    }));

    // Retry on the (astronomically unlikely) chance of a reference number
    // collision, rather than failing the whole registration. The Razorpay
    // order is created fresh inside each attempt too, so a retried
    // referenceNumber and its order.receipt always match.
    let registration;
    for (let attempt = 0; attempt < 3; attempt++) {
      const referenceNumber = generateReferenceNumber(zoneId);

      let order;
      try {
        order = await razorpay.orders.create({
          amount: fee.totalFee * 100, // Razorpay wants paise
          currency: "INR",
          receipt: referenceNumber,
          notes: { zoneId, zoneCode: rule.code, referenceNumber },
        });
      } catch (err) {
        console.error("🔥 razorpay order creation failed:", err.error?.description || err.message);
        return res.status(502).json({ success: false, message: "Could not start the payment. Please try again." });
      }

      try {
        registration = await ZoneRegistration.create({
          referenceNumber,
          zoneId,
          zoneCode: rule.code,
          zoneName: rule.name,
          teamSize: rule.teamSize,
          students: cleanStudents,
          baseFee: fee.baseFee,
          botPurchase: { opted: fee.botOpted, label: fee.botLabel, price: fee.botFee },
          totalFee: fee.totalFee,
          payment: { razorpayOrderId: order.id, status: "created", amount: order.amount },
          photoVideoConsent: true,
        });
        console.log(`✅  saved ZoneRegistration _id=${registration._id} ref=${registration.referenceNumber} order=${order.id} db="${registration.db?.name}"`);
        return res.status(201).json({
          success: true,
          referenceNumber: registration.referenceNumber,
          totalFee: registration.totalFee,
          razorpay: {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
          },
        });
      } catch (err) {
        if (err.code === 11000 && attempt < 2) continue; // duplicate referenceNumber — retry with a fresh one + order
        throw err;
      }
    }
    throw new Error("Could not generate a unique reference number after 3 attempts.");
  } catch (err) {
    console.error("🔥 registerForZone error:", err.message);
    return res.status(500).json({ success: false, message: "Something went wrong saving your registration." });
  }
};

// ── POST /api/zone-registration/verify-payment ─────────────────────────────
// Called by the frontend's Razorpay Checkout success handler with
// { razorpay_order_id, razorpay_payment_id, razorpay_signature }.
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details." });
    }

    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      console.warn(`⚠️  payment signature mismatch for order ${razorpay_order_id} — possible tampering`);
      return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    const registration = await ZoneRegistration.findOne({ "payment.razorpayOrderId": razorpay_order_id });
    if (!registration) {
      console.warn(`⚠️  verifyPayment: no registration found for order ${razorpay_order_id}`);
      return res.status(404).json({ success: false, message: "Registration not found for this payment." });
    }

    // Idempotent — the webhook may already have processed this exact
    // payment by the time this call lands, or vice versa.
    if (registration.payment.status !== "paid") {
      registration.payment.status = "paid";
      registration.payment.razorpayPaymentId = razorpay_payment_id;
      registration.payment.razorpaySignature = razorpay_signature;
      registration.payment.paidAt = new Date();
      registration.status = "confirmed";
      await registration.save();
      console.log(`✅  payment verified ref=${registration.referenceNumber} payment=${razorpay_payment_id}`);
    }

    return res.status(200).json({
      success: true,
      referenceNumber: registration.referenceNumber,
      totalFee: registration.totalFee,
    });
  } catch (err) {
    console.error("🔥 verifyPayment error:", err.message);
    return res.status(500).json({ success: false, message: "Something went wrong verifying your payment." });
  }
};

// ── POST /api/payments/webhook ──────────────────────────────────────────────
// Server-to-server confirmation from Razorpay — catches payments that
// succeeded even if the browser never got back to verifyPayment (closed
// tab, network drop, etc). Mounted in server.js with express.raw() so
// req.body here is the untouched Buffer verifyWebhookSignature needs.
const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!verifyWebhookSignature(req.body, signature)) {
      console.warn("⚠️  razorpay webhook signature mismatch — rejected");
      return res.status(400).json({ success: false });
    }

    const event = JSON.parse(req.body.toString("utf8"));
    console.log(`📩 razorpay webhook received: ${event.event}`);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload.payment.entity;
      const registration = await ZoneRegistration.findOne({ "payment.razorpayOrderId": payment.order_id });
      if (!registration) {
        console.warn(`⚠️  webhook: no registration found for order ${payment.order_id}`);
      } else if (registration.payment.status !== "paid") {
        registration.payment.status = "paid";
        registration.payment.razorpayPaymentId = payment.id;
        registration.payment.paidAt = new Date();
        registration.status = "confirmed";
        await registration.save();
        console.log(`✅  webhook confirmed payment ref=${registration.referenceNumber} payment=${payment.id}`);
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const result = await ZoneRegistration.updateOne(
        { "payment.razorpayOrderId": payment.order_id, "payment.status": { $ne: "paid" } },
        { $set: { "payment.status": "failed" } }
      );
      if (result.modifiedCount) console.log(`⚠️  webhook: marked payment failed for order ${payment.order_id}`);
    }

    // Razorpay expects a fast 2xx ack regardless of what we did with the
    // event, or it will keep retrying the same delivery.
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🔥 razorpayWebhook error:", err.message);
    return res.status(200).json({ success: false }); // still ack — logged above for manual follow-up
  }
};

// ── GET /api/zone-registration — admin listing (see adminKeyAuth) ─────────
const listRegistrations = async (req, res) => {
  const { zone } = req.query;
  const filter = zone ? { zoneId: normalizeZoneId(zone) } : {};
  const registrations = await ZoneRegistration.find(filter).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, count: registrations.length, registrations });
};

// ── GET /api/zone-registration/export.csv — admin CSV export ──────────────
const exportRegistrationsCsv = async (req, res) => {
  const { zone } = req.query;
  const filter = zone ? { zoneId: normalizeZoneId(zone) } : {};
  const registrations = await ZoneRegistration.find(filter).sort({ createdAt: -1 }).lean();

  const header = [
    "Reference",
    "Zone",
    "Payment Status",
    "Razorpay Payment ID",
    "Student Name",
    "Gender",
    "Age",
    "School",
    "Grade/Class",
    "Guardian Name",
    "Guardian Phone",
    "Email",
    "Address",
    "Base Fee",
    "Bot Add-on",
    "Total Fee",
    "Submitted",
  ];
  const csvEscape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [header.join(",")];

  registrations.forEach((r) => {
    r.students.forEach((s) => {
      rows.push(
        [
          r.referenceNumber,
          r.zoneCode,
          r.payment?.status || "created",
          r.payment?.razorpayPaymentId || "",
          s.fullName,
          s.gender,
          s.age,
          s.schoolName,
          s.gradeClass,
          s.guardianName,
          s.guardianPhone,
          s.email,
          s.address,
          r.baseFee,
          r.botPurchase?.opted ? r.botPurchase.price : 0,
          r.totalFee,
          new Date(r.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        ]
          .map(csvEscape)
          .join(",")
      );
    });
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="cyberflix-registrations${zone ? "-" + zone : ""}.csv"`);
  res.status(200).send(rows.join("\n"));
};

module.exports = {
  registerForZone,
  verifyPayment,
  razorpayWebhook,
  listRegistrations,
  exportRegistrationsCsv,
};