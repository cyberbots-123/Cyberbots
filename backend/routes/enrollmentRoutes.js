const express = require("express");
const router  = express.Router();

const {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollmentStatus,
  deleteEnrollment,
} = require("../controllers/enrollmentController");

const {
  enrollmentValidationRules,
  handleValidationErrors,
} = require("../middleware/validateEnrollment");

const { protect, requireAdmin } = require("../middleware/auth");
const { submitLimiter } = require("../middleware/rateLimiters");

// ────────────────────────────────────────────────────────────────────────────
//  Public route (called by the React enrollment modal)
//  POST /api/enrollment
//
//  FIX #2: submitLimiter attached here on the POST only, same reasoning as
//  contactRoutes — the old app.use() in server.js throttled the admin
//  routes below too. Note the spread on the validation rules array.
// ────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  submitLimiter,                // 1. throttle public submissions
  ...enrollmentValidationRules, // 2. validate & sanitize (spread array of rules)
  handleValidationErrors,       // 3. short-circuit if invalid
  createEnrollment              // 4. save to DB + send emails
);

// ────────────────────────────────────────────────────────────────────────────
//  Admin routes  (FIX #1: now actually protected)
//  This is the most sensitive dataset in the app — children's full names,
//  dates of birth, home addresses, and parents' contact details — and it
//  was previously listable and hard-deletable by anyone. Every route below
//  requires a valid JWT AND the admin role.
//
//  GET    /api/enrollment                → paginated list
//                                          (supports ?status=&course=&tier=&learningMode=)
//  GET    /api/enrollment/:id            → single record
//  PATCH  /api/enrollment/:id/status     → update status
//  DELETE /api/enrollment/:id            → hard-delete record
// ────────────────────────────────────────────────────────────────────────────
router.get("/",             protect, requireAdmin, getAllEnrollments);
router.get("/:id",          protect, requireAdmin, getEnrollmentById);
router.patch("/:id/status", protect, requireAdmin, updateEnrollmentStatus);
router.delete("/:id",       protect, requireAdmin, deleteEnrollment);

module.exports = router;