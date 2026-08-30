const { body, validationResult } = require("express-validator");

// ── Validation rules for POST /api/auth/login ───────────────────────────────
const loginValidationRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

// ── Middleware that short-circuits on validation failure ──────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = {};
    errors.array().forEach(({ path, msg }) => {
      if (!formatted[path]) formatted[path] = msg;
    });

    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: formatted,
    });
  }

  next();
};

module.exports = { loginValidationRules, handleValidationErrors };