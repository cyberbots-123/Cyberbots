const rateLimit = require("express-rate-limit");

// ────────────────────────────────────────────────────────────────────────────
//  Shared rate limiters
//
//  NOTE: all limiters key by client IP, which is only accurate because
//  server.js sets app.set("trust proxy", 1). Don't remove that line.
// ────────────────────────────────────────────────────────────────────────────

// Strict limit for public form submissions (prevents spam bots).
// Attach this directly on POST routes: router.post("/", submitLimiter, ...)
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // max 10 submissions per IP per window
  message: {
    success: false,
    message: "Too many submissions from this IP. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// NEW: strict limit for login attempts. The general apiLimiter alone
// allowed 300 password guesses per IP per 15 minutes — this caps
// credential brute-forcing at 10. Attach directly on POST /api/auth/login
// (see routes/authRoutes.js). skipSuccessfulRequests means a legitimate
// user who logs in correctly doesn't burn attempts — only FAILED logins
// count toward the limit.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // max 10 failed logins per IP per window
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts from this IP. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter, applied to all /api/ routes in server.js.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: {
    success: false,
    message: "Too many requests from this IP. Please slow down and try again shortly.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { submitLimiter, apiLimiter, loginLimiter };