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

// ── Public route (called by the React form) ────────────────────────────────
// POST /api/contact
router.post(
  "/",
  contactValidationRules,      // 1. validate & sanitize
  handleValidationErrors,      // 2. short-circuit if invalid
  createContact                // 3. save to DB + send emails
);

// ── Admin routes (add auth middleware before going to production) ──────────
// GET  /api/contact              → paginated list
// GET  /api/contact/:id          → single record
// PATCH /api/contact/:id/status  → update status
// DELETE /api/contact/:id        → delete record

router.get("/",              getAllContacts);
router.get("/:id",           getContactById);
router.patch("/:id/status",  updateContactStatus);
router.delete("/:id",        deleteContact);

module.exports = router;