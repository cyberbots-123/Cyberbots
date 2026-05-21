const mongoose = require("mongoose");

// ── Allowed values (kept in sync with the frontend constants) ──────────────
const ENQUIRY_TYPES = [
  "General Enquiry",
  "Course Information",
  "Pricing & Packages",
  "Workshop Booking",
  "Technical Support",
  "Feedback & Suggestions",
];

const HOW_DID_YOU_HEAR = [
  "Google Search",
  "Social Media",
  "Word of Mouth",
  "School Recommendation",
  "Advertisement",
  "Events / Workshops",
  "Other",
];

// ── Schema ─────────────────────────────────────────────────────────────────
const contactSchema = new mongoose.Schema(
  {
    // Personal details
    firstName: {
  type: String,
  required: [true, "First name is required"],
  trim: true,
  minlength: [1, "First name is required"],
  maxlength: [50, "First name must be at most 50 characters"],
},
    lastName: {
  type: String,
  required: [true, "Last name is required"],
  trim: true,
  minlength: [1, "Last name is required"],
  maxlength: [50, "Last name must be at most 50 characters"],
},
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
      maxlength: [254, "Email is too long"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone must be a 10-digit number"],
    },

    // Optional
    organisation: {
      type: String,
      trim: true,
      maxlength: [100, "Organisation name is too long"],
      default: "",
    },
    hearAboutUs: {
      type: String,
      enum: {
        values: ["", ...HOW_DID_YOU_HEAR],
        message: "{VALUE} is not a valid option",
      },
      default: "",
    },

    // Required selects / text
    enquiryType: {
      type: String,
      required: [true, "Enquiry type is required"],
      enum: {
        values: ENQUIRY_TYPES,
        message: "{VALUE} is not a valid enquiry type",
      },
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [20, "Message must be at least 20 characters"],
      maxlength: [2000, "Message must be at most 2000 characters"],
    },

    // Consent must be true
    consent: {
      type: Boolean,
      required: [true, "Consent is required"],
      validate: {
        validator: (v) => v === true,
        message: "You must accept the privacy policy to submit",
      },
    },

    // Auto-generated reference number shown to the user after submit
    referenceNumber: {
      type: String,
      unique: true,
    },

    // Status for admin use
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed"],
      default: "new",
    },

    // IP address (for basic abuse tracking — store responsibly)
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// ── Pre-save hook: generate a human-readable reference number ─────────────
contactSchema.pre("save", async function () {
  if (!this.referenceNumber) {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.referenceNumber = `CB-${random}`;
  }
});

// ── Virtual: full name ────────────────────────────────────────────────────
contactSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── Indexes ───────────────────────────────────────────────────────────────
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });

module.exports = mongoose.model("Contact", contactSchema);