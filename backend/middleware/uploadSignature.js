const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

// ────────────────────────────────────────────────────────────────────────────
//  uploadSignature — multer config for the Faculty Profile signatory's
//  signature image (e.g. the Managing Director's signature shown in the
//  card footer).
//
//  Same local-disk caveat as uploadLogo.js / uploadFacultyPhoto.js. Stored
//  under uploads/signature/<schoolId>/ so signature images never collide
//  with logos, faculty photos, or media photos even though they share the
//  same uploads root.
//
//  SVG is allowed (a vectorised signature scan is common) — same exception
//  uploadLogo.js makes.
// ────────────────────────────────────────────────────────────────────────────

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "signature");

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB — a signature scan doesn't need more

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, req.params.id);
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : "";
    const unique = `signature-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
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

const uploadSignature = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
});

module.exports = { uploadSignature, UPLOAD_ROOT, MAX_FILE_BYTES };