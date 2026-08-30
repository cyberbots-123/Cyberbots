const express = require("express");
const router = express.Router();
const { razorpayWebhook } = require("../controllers/zoneRegistrationController");

// ────────────────────────────────────────────────────────────────────────────
//  IMPORTANT: this route's req.body must be the RAW request bytes (a
//  Buffer), not JSON-parsed — razorpayWebhook needs it untouched to verify
//  Razorpay's signature. That means:
//    1. This router must be mounted in server.js with express.raw(), and
//    2. That mounting must happen BEFORE the global app.use(express.json())
//       call, since Express only runs body-parsing once per request — if
//       express.json() gets to it first, the raw bytes are gone by the
//       time this route sees the request.
//  See the mounting block in server.js for exactly where this goes.
// ────────────────────────────────────────────────────────────────────────────
router.post("/", razorpayWebhook);

module.exports = router;