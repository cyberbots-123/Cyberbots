const mongoose = require("mongoose");

// ── Allowed values (kept in sync with the frontend COURSES data) ──────────
const TIERS = ["Beginner", "Intermediate", "Advanced"];

const COURSES = [
  "Robotics",
  "STEM Education",
  "Internet of Things",
  "Web Development",
  "3D Printing",
  "Artificial Intelligence",
  "Drone Technology",
  "Data Science",
  "App Development",
  "Programming",
];

const LEARNING_MODES = ["Online", "Offline"];

const GENDERS = ["Male", "Female", "Other"];

const TIME_SLOTS = ["10-12", "12-2", "2-4", "4-6"];

// ── Schema ─────────────────────────────────────────────────────────────────
const enrollmentSchema = new mongoose.Schema(
  {
    // ── Student details ──────────────────────────────────────────────────
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [2, "Student name must be at least 2 characters"],
      maxlength: [100, "Student name must be at most 100 characters"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: { values: GENDERS, message: "{VALUE} is not a valid gender" },
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
      trim: true,
      maxlength: [30, "Grade must be at most 30 characters"],
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
      maxlength: [150, "Institution name must be at most 150 characters"],
    },
    learningMode: {
      type: String,
      required: [true, "Learning mode is required"],
      enum: { values: LEARNING_MODES, message: "{VALUE} is not a valid learning mode" },
    },

    // ── Parent / Guardian details ────────────────────────────────────────
    parentName: {
      type: String,
      required: [true, "Parent name is required"],
      trim: true,
      minlength: [2, "Parent name must be at least 2 characters"],
      maxlength: [100, "Parent name must be at most 100 characters"],
    },
    relationship: {
      type: String,
      required: [true, "Relationship is required"],
      trim: true,
      maxlength: [50, "Relationship must be at most 50 characters"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^\d{10}$/, "Mobile must be a 10-digit number"],
    },
    altMobile: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v) => v === "" || /^\d{10}$/.test(v),
        message: "Alt mobile must be a 10-digit number",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
      maxlength: [254, "Email is too long"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters"],
      maxlength: [500, "Address must be at most 500 characters"],
    },

    // ── Course selection ──────────────────────────────────────────────────
    course: {
      type: String,
      required: [true, "Course is required"],
      enum: { values: COURSES, message: "{VALUE} is not a valid course" },
    },
    tier: {
      type: String,
      trim: true,
      enum: { values: [...TIERS, ""], message: "{VALUE} is not a valid tier" },
      default: "",
    },
    levelName: {
      type: String,
      trim: true,
      maxlength: [100, "Level name must be at most 100 characters"],
      default: "",
    },
    timeSlot: {
      type: String,
      required: [true, "Preferred time slot is required"],
      enum: { values: TIME_SLOTS, message: "{VALUE} is not a valid time slot" },
    },

    // ── Auto-generated reference number ──────────────────────────────────
    referenceNumber: {
      type: String,
      unique: true,
    },

    // ── Admin status ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["new", "confirmed", "in-progress", "completed", "cancelled"],
      default: "new",
    },

    // ── IP (basic abuse tracking) ─────────────────────────────────────────
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ── Pre-save hook: generate reference number ──────────────────────────────
enrollmentSchema.pre("save", function () {
  if (!this.referenceNumber) {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.referenceNumber = `LX-${random}`;
  }
});

// ── Virtual: student age ──────────────────────────────────────────────────
enrollmentSchema.virtual("age").get(function () {
  if (!this.dob) return null;
  const diff = Date.now() - new Date(this.dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

// ── Indexes ────────────────────────────────────────────────────────────────
enrollmentSchema.index({ email: 1 });
enrollmentSchema.index({ createdAt: -1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ course: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);