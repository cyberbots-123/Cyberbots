const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    gender: { type: String, required: true, enum: ["Female", "Male", "Other"] },
    // Intentionally unvalidated / optional — matches the frontend, which
    // collects age but never requires or checks it.
    age: { type: String, trim: true, maxlength: 4, default: "" },
    guardianName: { type: String, required: true, trim: true, maxlength: 120 },
    guardianPhone: { type: String, required: true, trim: true, match: /^\d{10}$/ },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    address: { type: String, required: true, trim: true, minlength: 8, maxlength: 400 },
    schoolName: { type: String, required: true, trim: true, maxlength: 160 },
    gradeClass: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { _id: false }
);

const zoneRegistrationSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },

    zoneId: { type: String, required: true, index: true }, // "1a".."3b"
    zoneCode: { type: String, required: true }, // "ZONE 1A"
    zoneName: { type: String, required: true }, // "Chamber of Circuits"

    teamSize: { type: Number, required: true, min: 1, max: 4 },
    students: {
      type: [studentSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one student is required.",
      },
    },

    // Fee fields are ALWAYS server-computed (see
    // config/zoneRegistrationRules.js) — never copied from the request
    // body's own totals. Both are in RUPEES (display units).
    baseFee: { type: Number, required: true, min: 0 },
    botPurchase: {
      opted: { type: Boolean, default: false },
      label: { type: String, default: null },
      price: { type: Number, default: 0 },
    },
    totalFee: { type: Number, required: true, min: 0 },

    // ── Razorpay payment ────────────────────────────────────────────
    // A registration is created the moment the form is submitted, with
    // payment.status "created" and top-level status "pending" — it only
    // becomes "confirmed" once verifyPayment or the webhook confirms a
    // signed success. amount is in PAISE (Razorpay's unit), unlike
    // baseFee/totalFee above which are in rupees — kept separate and
    // clearly labeled so the two are never accidentally mixed up.
    payment: {
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: { type: String, default: null },
      razorpaySignature: { type: String, default: null },
      status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
      amount: { type: Number }, // paise
      paidAt: { type: Date, default: null },
    },

    photoVideoConsent: {
      type: Boolean,
      required: true,
      validate: { validator: (v) => v === true, message: "Photo/video consent must be accepted." },
    },

    // "confirmed" now specifically means "payment received" — set only
    // by verifyPayment / the webhook, never at initial creation.
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

zoneRegistrationSchema.index({ zoneId: 1, createdAt: -1 });

module.exports = mongoose.model("ZoneRegistration", zoneRegistrationSchema);