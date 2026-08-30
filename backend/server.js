// ── Load environment variables first ──────────────────────────────────────
require("dotenv").config();

// ────────────────────────────────────────────────────────────────────────────
//  FIX: fail fast on missing critical env. Without this, a missing
//  JWT_SECRET only surfaces at the first login/verify — as a confusing
//  runtime 401/500 — instead of an obvious startup error.
// ────────────────────────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error("❌  FATAL: JWT_SECRET is not set. Add it to your .env file and restart.");
  process.exit(1);
}

// ────────────────────────────────────────────────────────────────────────────
//  FIX: same fail-fast treatment for the school-deletion password.
//  controllers/schoolController.js's deleteSchool() checks incoming
//  requests against this value — if it's missing, isCorrectDeletePassword()
//  would silently compare against an empty string, which is a much worse
//  failure mode (a blank password would "work") than refusing to boot.
// ────────────────────────────────────────────────────────────────────────────
if (!process.env.SCHOOL_DELETE_PASSWORD) {
  console.error("❌  FATAL: SCHOOL_DELETE_PASSWORD is not set. Add it to your .env file and restart.");
  process.exit(1);
}

// ────────────────────────────────────────────────────────────────────────────
//  FIX: same treatment for Razorpay. RAZORPAY_KEY_ID/SECRET are needed to
//  create orders at all (config/razorpay.js would otherwise throw on the
//  very first registration attempt, not at boot). RAZORPAY_WEBHOOK_SECRET
//  is separate — set in Razorpay Dashboard → Webhooks when you create the
//  webhook (see the setup notes further down this file) — and is required
//  for the webhook signature check in zoneRegistrationController.js.
// ────────────────────────────────────────────────────────────────────────────
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌  FATAL: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is not set. Add them to your .env file and restart.");
  process.exit(1);
}
if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.error("❌  FATAL: RAZORPAY_WEBHOOK_SECRET is not set. Add it to your .env file and restart.");
  process.exit(1);
}

const fs        = require("fs");
const path      = require("path");
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiters");

// ── Connect to MongoDB ─────────────────────────────────────────────────────
connectDB();

const app = express();

// Proxy awareness — required for correct req.ip / rate-limit keying behind
// Nginx / Heroku / Render.
app.set("trust proxy", 1);

// ────────────────────────────────────────────────────────────────────────────
//  Security middleware
// ────────────────────────────────────────────────────────────────────────────

// Set security HTTP headers
app.use(helmet());

// Enable CORS for the React frontend origin(s)
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ────────────────────────────────────────────────────────────────────────────
//  Razorpay webhook — MUST be mounted with a RAW body parser, and MUST be
//  mounted BEFORE the global express.json() call below. Express only
//  parses the request body once; if express.json() gets to this request
//  first, the raw bytes razorpayWebhook needs for signature verification
//  are gone by the time the route handler runs. Every other route in this
//  app is unaffected — express.json() below still parses everything else
//  normally.
//
//  Give Razorpay Dashboard → Settings → Webhooks this exact URL:
//    https://your-api-domain.com/api/payments/webhook
//  (or http://localhost:5000/api/payments/webhook while testing with a
//  tunnel like ngrok, since Razorpay can't reach your laptop directly).
//  Subscribe to at least: payment.captured, payment.failed, order.paid.
//  Whatever "Secret" you set there is RAZORPAY_WEBHOOK_SECRET below.
// ────────────────────────────────────────────────────────────────────────────
const paymentWebhookRoutes = require("./routes/paymentWebhookRoutes");
app.use("/api/payments/webhook", express.raw({ type: "application/json" }), paymentWebhookRoutes);

// Parse JSON bodies (limit keeps payload abuse in check) — everything
// EXCEPT the webhook route above, which is already spoken for.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ────────────────────────────────────────────────────────────────────────────
//  Uploaded media (photos, etc.)
//
//  Local-disk storage: only correct on a host with a PERSISTENT volume. On
//  ephemeral platforms this directory is wiped on every redeploy/restart —
//  swap middleware/uploadMedia.js for GridFS or S3 if you land on one.
//
//  NOTE (conscious trade-off): /uploads is served WITHOUT auth. Anyone
//  holding a full URL can view a photo/logo. Filenames are
//  crypto-random so they can't be enumerated, but URLs do circulate to
//  client dashboards — if these photos ever become sensitive, move this
//  behind an authenticated streaming route instead of express.static.
// ────────────────────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

// helmet() sets "Cross-Origin-Resource-Policy: same-origin" by default,
// which makes browsers refuse to RENDER images from here when the frontend
// runs on a different origin. Explicitly mark this one route cross-origin.
app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// ────────────────────────────────────────────────────────────────────────────
//  Rate limiting — apiLimiter covers every /api route. submitLimiter is
//  attached inside contactRoutes / enrollmentRoutes / zoneRegistrationRoutes
//  on their public POST handlers only; loginLimiter is attached in
//  authRoutes on POST /login.
// ────────────────────────────────────────────────────────────────────────────
app.use("/api/", apiLimiter);

// ────────────────────────────────────────────────────────────────────────────
//  Routes
//
//  Every route mount MUST happen here, before the 404 handler below.
//  Express matches middleware in registration order — the 404 handler has
//  no path, so it's a catch-all that matches (and responds to) every
//  request that reaches it. Anything mounted AFTER it is unreachable.
// ────────────────────────────────────────────────────────────────────────────
const contactRoutes          = require("./routes/contactRoutes");
const enrollmentRoutes       = require("./routes/enrollmentRoutes");
const authRoutes             = require("./routes/authRoutes");
const schoolRoutes           = require("./routes/schoolRoutes");
const zoneRegistrationRoutes = require("./routes/zoneRegistrationRoutes");

app.use("/api/contact", contactRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/zone-registration", zoneRegistrationRoutes);

// ── Health check (useful for uptime monitors & CI pipelines) ──────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cyberbots API is running 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler — MUST be the last route-like middleware ──────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err.message);

  if (err.message?.startsWith("CORS")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ────────────────────────────────────────────────────────────────────────────
//  Start server
// ────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`);
});