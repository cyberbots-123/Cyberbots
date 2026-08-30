const express = require("express");
const router = express.Router();

const { login, getMe, createOrUpdateClientLogin, getLoginForSchool } = require("../controllers/authController");
const { loginValidationRules, handleValidationErrors } = require("../middleware/validateAuth");
const { protect, requireAdmin } = require("../middleware/auth");
const { loginLimiter } = require("../middleware/rateLimiters");

// ── Public route ─────────────────────────────────────────────────────────
// FIX: loginLimiter added — caps FAILED login attempts at 10 per IP per
// 15 minutes (successful logins don't count). Before this, only the
// general apiLimiter applied, which allowed 300 password guesses per
// window.
router.post("/login", loginLimiter, loginValidationRules, handleValidationErrors, login);

// ── Protected routes ─────────────────────────────────────────────────────
router.get("/me", protect, getMe);

// ── Admin-only routes (managing school client logins) ──────────────────
router.post("/create-login", protect, requireAdmin, createOrUpdateClientLogin);
router.get("/login-for-school/:schoolId", protect, requireAdmin, getLoginForSchool);

module.exports = router;