const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

// ────────────────────────────────────────────────────────────────────────────
//  uploadLogo — multer config for school logo uploads.
//
//  Same local-disk caveat as uploadMedia.js: only correct on a host with a
//  persistent volume. Stored under uploads/logos/<schoolId>/ so logos and
//  media photos never collide even though they share the same uploads root.
//
//  SVGs are allowed here (logos are commonly vector) — that's the one
//  difference from uploadMedia.js's image whitelist, which sticks to raster
//  formats only.
// ────────────────────────────────────────────────────────────────────────────

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "logos");

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);
const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB — logos are small, no reason to allow more

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, req.params.id);
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : "";
    const unique = `logo-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    cb(new Error("Only JPG, PNG, WEBP, or SVG images are allowed"));
    return;
  }
  cb(null, true);
};

const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
});

module.exports = { uploadLogo, UPLOAD_ROOT, MAX_FILE_BYTES };