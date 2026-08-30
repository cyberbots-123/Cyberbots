const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

// ────────────────────────────────────────────────────────────────────────────
//  uploadFacultyPhoto — multer config for the Faculty Profile photo.
//
//  Mirrors uploadLogo.js exactly (same local-disk caveat: only correct on a
//  host with a persistent volume). Stored under uploads/faculty/<schoolId>/
//  so faculty photos never collide with logos or media photos even though
//  they share the same uploads root.
// ────────────────────────────────────────────────────────────────────────────

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "faculty");

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4MB — a headshot doesn't need more

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, req.params.id);
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : "";
    const unique = `faculty-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
    return;
  }
  cb(null, true);
};

const uploadFacultyPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
});

module.exports = { uploadFacultyPhoto, UPLOAD_ROOT, MAX_FILE_BYTES };