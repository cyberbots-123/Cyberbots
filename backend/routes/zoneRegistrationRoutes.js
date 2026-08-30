const express = require("express");
const router = express.Router();

const { submitLimiter } = require("../middleware/rateLimiters");
const adminKeyAuth = require("../middleware/adminKeyAuth");
const {
  registerForZone,
  verifyPayment,
  listRegistrations,
  exportRegistrationsCsv,
} = require("../controllers/zoneRegistrationController");

// Public — what ZoneRegistrationForm.jsx's submitEndpoint POSTs to. Creates
// the pending registration + a matching Razorpay order in one call.
router.post("/", submitLimiter, registerForZone);

// Public — called by the frontend's Razorpay Checkout success handler.
router.post("/verify-payment", submitLimiter, verifyPayment);

// Admin — list / export, gated by adminKeyAuth (see middleware/adminKeyAuth.js).
router.get("/", adminKeyAuth, listRegistrations);
router.get("/export.csv", adminKeyAuth, exportRegistrationsCsv);

module.exports = router;