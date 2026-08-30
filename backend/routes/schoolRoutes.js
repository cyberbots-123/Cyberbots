const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const router = express.Router();

const {
  createSchool,
  getAllSchools,
  getMySchool,
  getSchoolById,
  updateSchool,
  updateDeliverableStatus,
  deleteSchool,
  uploadMediaPhotos,
  deleteMediaPhoto,
  uploadSchoolLogo,
  deleteSchoolLogo,
  uploadFacultyPhoto,
  deleteFacultyPhoto,
  uploadSignaturePhoto,
  deleteSignaturePhoto,
} = require("../controllers/schoolController");

const {
  schoolValidationRules,        // create: name required
  schoolUpdateValidationRules,  // update: name optional, but non-empty if present
  deliverableValidationRules,
  handleValidationErrors,
} = require("../middleware/validateSchool");

const { protect, requireAdmin } = require("../middleware/auth");
const { uploadMedia, MAX_FILES } = require("../middleware/uploadMedia");
const { uploadLogo } = require("../middleware/uploadLogo");
const { uploadFacultyPhoto: uploadFacultyPhotoMw } = require("../middleware/uploadFacultyPhoto");
const { uploadSignature: uploadSignatureMw } = require("../middleware/uploadSignature");

// Every route below requires a valid token. protect is async and re-checks
// the account is active on each request (see middleware/auth.js).
router.use(protect);

// ── Client route — MUST be declared before "/:id" or Express will try to
//    treat "me" as an :id parameter and 400 with a CastError. ─────────────
// GET /api/schools/me
router.get("/me", getMySchool);

// ── Admin-only routes ────────────────────────────────────────────────────
router.post("/", requireAdmin, schoolValidationRules, handleValidationErrors, createSchool);
router.get("/", requireAdmin, getAllSchools);
router.get("/:id", requireAdmin, getSchoolById);

router.patch("/:id", requireAdmin, schoolUpdateValidationRules, handleValidationErrors, updateSchool);

router.patch("/:id/deliverables", requireAdmin, deliverableValidationRules, handleValidationErrors, updateDeliverableStatus);
router.delete("/:id", requireAdmin, deleteSchool);

// ────────────────────────────────────────────────────────────────────────────
//  FIX: validObjectId — guards :id BEFORE multer runs on upload routes.
//
//  multer's diskStorage builds its destination directory from req.params.id
//  and writes files to disk before the controller ever checks the school
//  exists. Two problems with that:
//    1. Uploads to a nonexistent/garbage id 404'd in the controller but
//       still left orphan files (and a junk directory) on disk.
//    2. req.params.id arrives URL-DECODED, so an encoded traversal
//       sequence (%2E%2E%2F → ../) could survive into path.join and land
//       files outside UPLOAD_ROOT.
//  Requiring a syntactically valid Mongo ObjectId up front eliminates
//  both: nothing touches the filesystem unless the id is 24 hex chars.
// ────────────────────────────────────────────────────────────────────────────
const validObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid school ID format" });
  }
  next();
};

// ────────────────────────────────────────────────────────────────────────────
//  Media photo uploads (admin only)
//
//  uploadMedia.array("files", MAX_FILES) is wrapped manually instead of
//  passed straight into the route: multer reports problems like "file too
//  big" or "too many files" via a callback error rather than a thrown
//  exception, so it needs to be caught here and turned into a normal JSON
//  422 instead of falling through to the generic 500 handler in server.js.
// ────────────────────────────────────────────────────────────────────────────
const runMediaUpload = (req, res, next) => {
  uploadMedia.array("files", MAX_FILES)(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "Each photo must be 8MB or smaller" :
        err.code === "LIMIT_FILE_COUNT" ? `You can upload at most ${MAX_FILES} photos at a time` :
        err.message;
      return res.status(422).json({ success: false, message });
    }

    // Anything else (e.g. the fileFilter's "only images allowed" error)
    return res.status(422).json({ success: false, message: err.message || "Upload failed" });
  });
};

router.post("/:id/media/upload", requireAdmin, validObjectId, runMediaUpload, uploadMediaPhotos);
router.delete("/:id/media/upload", requireAdmin, validObjectId, deleteMediaPhoto);

// ────────────────────────────────────────────────────────────────────────────
//  School logo upload (admin only) — same wrap-multer-manually pattern as
//  media uploads above, and the same validObjectId guard before multer.
// ────────────────────────────────────────────────────────────────────────────
const runLogoUpload = (req, res, next) => {
  uploadLogo.single("logo")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "Logo image must be 3MB or smaller" :
        err.message;
      return res.status(422).json({ success: false, message });
    }

    return res.status(422).json({ success: false, message: err.message || "Upload failed" });
  });
};

router.post("/:id/logo", requireAdmin, validObjectId, runLogoUpload, uploadSchoolLogo);
router.delete("/:id/logo", requireAdmin, validObjectId, deleteSchoolLogo);

// ────────────────────────────────────────────────────────────────────────────
//  Faculty Profile photo upload (admin only) — same wrap-multer-manually
//  pattern as the logo route above, field name "photo".
// ────────────────────────────────────────────────────────────────────────────
const runFacultyPhotoUpload = (req, res, next) => {
  uploadFacultyPhotoMw.single("photo")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "Faculty photo must be 4MB or smaller" :
        err.message;
      return res.status(422).json({ success: false, message });
    }

    return res.status(422).json({ success: false, message: err.message || "Upload failed" });
  });
};

router.post("/:id/faculty-photo", requireAdmin, validObjectId, runFacultyPhotoUpload, uploadFacultyPhoto);
router.delete("/:id/faculty-photo", requireAdmin, validObjectId, deleteFacultyPhoto);

// ────────────────────────────────────────────────────────────────────────────
//  Faculty Profile signature image upload (admin only) — the signatory's
//  (e.g. Managing Director's) signature shown in the card footer. Same
//  wrap-multer-manually pattern as the routes above, field name "signature".
// ────────────────────────────────────────────────────────────────────────────
const runSignatureUpload = (req, res, next) => {
  uploadSignatureMw.single("signature")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "Signature image must be 2MB or smaller" :
        err.message;
      return res.status(422).json({ success: false, message });
    }

    return res.status(422).json({ success: false, message: err.message || "Upload failed" });
  });
};

router.post("/:id/signature-photo", requireAdmin, validObjectId, runSignatureUpload, uploadSignaturePhoto);
router.delete("/:id/signature-photo", requireAdmin, validObjectId, deleteSignaturePhoto);

module.exports = router;