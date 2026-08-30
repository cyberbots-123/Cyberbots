const express = require("express");
const router  = express.Router();

const {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} = require("../controllers/contactController");

const {
  contactValidationRules,
  handleValidationErrors,
} = require("../middleware/validateContact");

const { protect, requireAdmin } = require("../middleware/auth");
const { submitLimiter } = require("../middleware/rateLimiters");

// ────────────────────────────────────────────────────────────────────────────
//  Public route (called by the React contact form)
//  POST /api/contact
//
//  FIX #2: submitLimiter is now attached HERE, on the POST handler only.
//  Previously server.js did app.use("/api/contact", submitLimiter), which
//  applied the 10-per-15-min cap to every method on the path — including
//  the admin GET/PATCH/DELETE below.
// ────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  submitLimiter,               // 1. throttle public submissions
  contactValidationRules,      // 2. validate & sanitize
  handleValidationErrors,      // 3. short-circuit if invalid
  createContact                // 4. save to DB + send emails
);

// ────────────────────────────────────────────────────────────────────────────
//  Admin routes  (FIX #1: now actually protected)
//  These records contain PII — names, phone numbers, emails, messages —
//  and were previously readable/deletable by anyone who found the URL.
//  Every route below requires a valid JWT AND the admin role.
//
//  GET    /api/contact              → paginated list
//  GET    /api/contact/:id          → single record
//  PATCH  /api/contact/:id/status   → update status
//  DELETE /api/contact/:id          → hard-delete record
// ────────────────────────────────────────────────────────────────────────────
router.get("/",             protect, requireAdmin, getAllContacts);
router.get("/:id",          protect, requireAdmin, getContactById);
router.patch("/:id/status", protect, requireAdmin, updateContactStatus);
router.delete("/:id",       protect, requireAdmin, deleteContact);

module.exports = router;