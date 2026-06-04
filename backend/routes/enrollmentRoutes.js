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

// ── Public route (called by the React enrollment modal) ───────────────────
// POST /api/enrollment
router.post(
  "/",
  ...enrollmentValidationRules, // 1. validate & sanitize (spread array of rules)
  handleValidationErrors,       // 2. short-circuit if invalid
  createEnrollment              // 3. save to DB + send emails
);

// ── Admin routes (add auth middleware before going to production) ──────────
// GET    /api/enrollment                   → paginated list (supports ?status=&course=&tier=&learningMode=)
// GET    /api/enrollment/:id              → single record
// PATCH  /api/enrollment/:id/status       → update status
// DELETE /api/enrollment/:id             → delete record

router.get("/",              getAllEnrollments);
router.get("/:id",           getEnrollmentById);
router.patch("/:id/status",  updateEnrollmentStatus);
router.delete("/:id",        deleteEnrollment);

module.exports = router;