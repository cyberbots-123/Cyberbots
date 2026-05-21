const { body, validationResult } = require("express-validator");

// ── Validation rules array ─────────────────────────────────────────────────
const contactValidationRules = [
  body("firstName")
  .trim()
  .notEmpty().withMessage("First name is required")
  .isLength({ min: 1, max: 50 }).withMessage("First name must be at most 50 characters")
  .matches(/^[a-zA-Z\s'.,-]+$/).withMessage("First name contains invalid characters"),

  body("lastName")
  .trim()
  .notEmpty().withMessage("Last name is required")
  .isLength({ min: 1, max: 50 }).withMessage("Last name must be at most 50 characters")
  .matches(/^[a-zA-Z\s'.,-]+$/).withMessage("Last name contains invalid characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage("Email is too long"),

  body("phone")
  .trim()
  .notEmpty().withMessage("Phone number is required")
  .customSanitizer((value) => value.replace(/\s+/g, ""))
  .matches(/^\d{10}$/).withMessage("Phone must be exactly 10 digits"),

  body("organisation")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage("Organisation name must be at most 100 characters"),

  body("enquiryType")
    .notEmpty().withMessage("Enquiry type is required")
    .isIn([
      "General Enquiry",
      "Course Information",
      "Pricing & Packages",
      "Workshop Booking",
      "Technical Support",
      "Feedback & Suggestions",
    ]).withMessage("Invalid enquiry type"),

  body("hearAboutUs")
    .optional({ checkFalsy: true })
    .isIn([
      "",
      "Google Search",
      "Social Media",
      "Word of Mouth",
      "School Recommendation",
      "Advertisement",
      "Events / Workshops",
      "Other",
    ]).withMessage("Invalid source option"),

  body("message")
    .trim()
    .notEmpty().withMessage("Message is required")
    .isLength({ min: 20 }).withMessage("Message must be at least 20 characters")
    .isLength({ max: 2000 }).withMessage("Message must be at most 2000 characters"),

  body("consent")
    .isBoolean().withMessage("Consent must be a boolean")
    .custom((value) => {
      if (value !== true) throw new Error("You must accept the privacy policy");
      return true;
    }),
];

// ── Middleware that runs after the rules and returns errors if any ─────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors as { field: message } for easy frontend consumption
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

module.exports = { contactValidationRules, handleValidationErrors };