const { body, validationResult } = require("express-validator");

// AdminPanel sends the entire school object (13 flexible content sections)
// on save, so we only strictly validate the one field that must always be
// present and well-formed — the rest is intentionally schema-flexible
// (Mixed types on the model) to match AdminPanel's generic table/JSON editors.

// ────────────────────────────────────────────────────────────────────────────
//  Create rules — POST /api/schools
//  name is REQUIRED here: a new school must have one.
// ────────────────────────────────────────────────────────────────────────────
const schoolValidationRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("School name is required")
    .isLength({ max: 150 }).withMessage("School name must be at most 150 characters"),
];

// ────────────────────────────────────────────────────────────────────────────
//  Update rules — PATCH /api/schools/:id
//
//  name is OPTIONAL: absent → fine, untouched. But if it IS present it must
//  still be non-empty and within length, so a save can never blank out a
//  school's name.
// ────────────────────────────────────────────────────────────────────────────
const schoolUpdateValidationRules = [
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("School name cannot be empty")
    .isLength({ max: 150 }).withMessage("School name must be at most 150 characters"),
];

// ────────────────────────────────────────────────────────────────────────────
//  Deliverable status rules — PATCH /api/schools/:id/deliverables
//
//  FIX: list expanded to match AdminPanel's STATUS_OPTS and the School
//  model's enum exactly. It was missing "INPROGRESS" and "NOT DELIVERED",
//  so this endpoint 422'd on values the admin UI legitimately offers.
//  Keep this list, the model enum, and STATUS_OPTS in sync — all three
//  must agree or saves fail with "Validation failed".
// ────────────────────────────────────────────────────────────────────────────
const deliverableValidationRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Deliverable name is required"),

  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn([
      "NIL",
      "IN PROGRESS",
      "INPROGRESS",
      "REPORTING MONTHLY",
      "DELIVERED",
      "NOT DELIVERED",
      "COMPLETED",
      "Not Applicable",
    ])
    .withMessage("Invalid status value"),
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

module.exports = {
  schoolValidationRules,
  schoolUpdateValidationRules,
  deliverableValidationRules,
  handleValidationErrors,
};