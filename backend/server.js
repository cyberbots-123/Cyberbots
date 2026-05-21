// ── Load environment variables first ──────────────────────────────────────
require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const connectDB  = require("./config/db");

// ── Connect to MongoDB ─────────────────────────────────────────────────────
connectDB();

const app = express();

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

// Parse JSON bodies (limit keeps payload abuse in check)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Rate limiting ──────────────────────────────────────────────────────────
// Strict limit for form submissions (prevents spam bots)
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 submissions per IP per window
  message: {
    success: false,
    message: "Too many submissions from this IP. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);
app.use("/api/contact", submitLimiter); // applied only on POST by convention

// ────────────────────────────────────────────────────────────────────────────
//  Routes
// ────────────────────────────────────────────────────────────────────────────
const contactRoutes = require("./routes/contactRoutes");

app.use("/api/contact", contactRoutes);

// ── Health check (useful for uptime monitors & CI pipelines) ──────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cyberbots API is running 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────
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