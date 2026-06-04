const { body, validationResult } = require("express-validator");

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

const TIERS = ["Beginner", "Intermediate", "Advanced", ""];

const TIME_SLOTS = ["10-12", "12-2", "2-4", "4-6"];

// ── Validation rules array ─────────────────────────────────────────────────
const enrollmentValidationRules = [
  // ── Student ──────────────────────────────────────────────────────────────
  body("studentName")
    .trim()
    .notEmpty().withMessage("Student name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Student name must be 2–100 characters")
    .matches(/^[a-zA-Z\s'.,-]+$/).withMessage("Student name contains invalid characters"),

  body("dob")
    .notEmpty().withMessage("Date of birth is required")
    .isISO8601().withMessage("Date of birth must be a valid date")
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      if (dob >= now) throw new Error("Date of birth must be in the past");
      const age = (now - dob) / (1000 * 60 * 60 * 24 * 365.25);
      if (age > 25) throw new Error("Age seems too high — please check the date");
      return true;
    }),

  body("gender")
    .notEmpty().withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"]).withMessage("Invalid gender value"),

  body("grade")
    .trim()
    .notEmpty().withMessage("Grade is required")
    .isLength({ max: 30 }).withMessage("Grade must be at most 30 characters"),

  body("institution")
    .trim()
    .notEmpty().withMessage("Institution is required")
    .isLength({ max: 150 }).withMessage("Institution name must be at most 150 characters"),

  body("learningMode")
    .notEmpty().withMessage("Learning mode is required")
    .isIn(["Online", "Offline"]).withMessage("Learning mode must be Online or Offline"),

  // ── Parent / Guardian ────────────────────────────────────────────────────
  body("parentName")
    .trim()
    .notEmpty().withMessage("Parent name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Parent name must be 2–100 characters")
    .matches(/^[a-zA-Z\s'.,-]+$/).withMessage("Parent name contains invalid characters"),

  body("relationship")
    .trim()
    .notEmpty().withMessage("Relationship is required")
    .isLength({ max: 50 }).withMessage("Relationship must be at most 50 characters"),

  body("mobile")
    .trim()
    .notEmpty().withMessage("Mobile number is required")
    .customSanitizer((v) => v.replace(/\s+/g, "").replace(/^\+91/, ""))
    .matches(/^\d{10}$/).withMessage("Mobile must be exactly 10 digits"),

  body("altMobile")
    .optional({ checkFalsy: true })
    .trim()
    .customSanitizer((v) => (v ? v.replace(/\s+/g, "").replace(/^\+91/, "") : ""))
    .custom((v) => {
      if (v && !/^\d{10}$/.test(v)) throw new Error("Alt mobile must be exactly 10 digits");
      return true;
    }),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage("Email is too long"),

  body("address")
    .trim()
    .notEmpty().withMessage("Address is required")
    .isLength({ min: 10, max: 500 }).withMessage("Address must be 10–500 characters"),

  // ── Course ───────────────────────────────────────────────────────────────
  body("course")
    .notEmpty().withMessage("Course is required")
    .isIn(COURSES).withMessage("Invalid course selected"),

  body("tier")
    .optional({ checkFalsy: true })
    .isIn(TIERS).withMessage("Invalid tier selected"),

  body("levelName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage("Level name must be at most 100 characters"),

  body("timeSlot")
    .notEmpty().withMessage("Preferred time slot is required")
    .isIn(TIME_SLOTS).withMessage("Invalid time slot selected"),
];

// ── Middleware that short-circuits on validation failure ──────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = {};
    errors.array().forEach(({ path, msg }) => {
      if (!formatted[path]) formatted[path] = msg; // keep first error per field
    });

    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: formatted,
    });
  }

  next();
};

module.exports = { enrollmentValidationRules, handleValidationErrors };