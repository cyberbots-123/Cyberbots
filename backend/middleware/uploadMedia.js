const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

// ────────────────────────────────────────────────────────────────────────────
//  uploadMedia — multer config for "Practical class media" photo uploads.
//
//  Storage: local disk, under uploads/media/<schoolId>/. This ONLY works if
//  the server has a persistent volume — on ephemeral hosts (Render/Railway
//  free tiers, plain Heroku dynos, etc.) these files disappear on every
//  redeploy or restart. If you move to one of those platforms later, swap
//  this module out for GridFS or S3 — the controller only calls two things
//  from here (the multer instance + UPLOAD_ROOT for building/removing paths),
//  so the rest of the code barely has to change.
//
//  Filenames are never trusted from the client: we generate a random name
//  and keep only a whitelisted extension, so there's no path traversal and
//  no collisions between schools or uploads.
// ────────────────────────────────────────────────────────────────────────────

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "media");

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per photo
const MAX_FILES = 10; // per upload request

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // req.params.id is the school's Mongo _id from the route (:id) — each
    // school's photos live in their own folder.
    const dir = path.join(UPLOAD_ROOT, req.params.id);
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : "";
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExt}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    cb(new Error("Only JPG, PNG, WEBP, or GIF images are allowed"));
    return;
  }
  cb(null, true);
};

const uploadMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
});

module.exports = { uploadMedia, UPLOAD_ROOT, MAX_FILES, MAX_FILE_BYTES };