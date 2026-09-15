const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const School = require("../models/School");
const User = require("../models/User");
const { UPLOAD_ROOT: MEDIA_UPLOAD_ROOT } = require("../middleware/uploadMedia");
const { UPLOAD_ROOT: LOGO_UPLOAD_ROOT } = require("../middleware/uploadLogo");
const { UPLOAD_ROOT: FACULTY_UPLOAD_ROOT } = require("../middleware/uploadFacultyPhoto");
const { UPLOAD_ROOT: SIGNATURE_UPLOAD_ROOT } = require("../middleware/uploadSignature");

// Matches AdminPanel's blankSchool() shape — used as defaults for new schools.
function defaultContent(name, grades) {
  return {
    lastUpdatedOn: "",
    lastUpdatedBy: "",
    lastReviewedOn: "",
    // NEW — Workbooks gains its own applicability flag, same shape as
    // worksheets/stem below. The register workbook this app mirrors marks
    // "WORKBOOK · NOT APPLICABLE" for schools running the worksheet track
    // instead of physical books.
    workbooks: { applicable: true, note: "" },
    worksheets: { applicable: false, note: "This school's AEDS programme does not include activity-based worksheets." },
    stem: { applicable: false, note: "STEM Kits are an optional deliverable and were not opted for this school." },
    kitsMeta: { noOfKitBoxes: 0, issuedDate: "-", refilledDate: "-", lastUpdatedOn: "-" },
    deliverables: [],
    gradeData: [],
    workbookRows: [],
    workbookCompletionData: {},
    // NEW — the grade-wise activity completion grid that actually belongs
    // to the WORKSHEETS sheet in the register workbook (Grades 4-9, one
    // row per class section). Same nested shape as workbookCompletionData.
    worksheetCompletionData: {},
    kitsRows: [],
    kitsData: {},
    // "SCHOOL ATAL LAB STOCK LIST", its own register, split out of KITS.
    atalLabRows: [],
    stemRows: [],
    workdoneRows: [],
    mediaRows: [],
    assessmentRows: [],
    reportCardRows: [],
    eventRows: [],
    expoRows: [],
    facultyObservationRows: [],
    workAccomplishmentRows: [],
    // CHANGED — Faculty Profile now supports MULTIPLE faculty members.
    // Was a single `facultyProfile` object + five school-level flat row
    // arrays; now an ARRAY, blank on purpose — an admin adds one card per
    // faculty member from AdminPanel's Faculty Profile tab, exactly like
    // every other repeating sheet in this app (deliverables, workbookRows,
    // etc. all start empty too). See models/School.js for the field
    // comment and the entry shape.
    facultyProfiles: [],
    // Every sheet on by default for a fresh school; the admin can untick
    // any of them from the Overview tab once real data tells them a sheet
    // doesn't apply to this school.
    enabledSections: {
      workbooks: true,
      worksheets: true,
      kits: true,
      atallab: true,
      stem: true,
      workdone: true,
      media: true,
      assessments: true,
      reportcards: true,
      faculty: true,
      expo: true,
      event: true,
      accomplishment: true,
      facultyProfile: true,
    },
  };
}

// Whitelist of fields AdminPanel is allowed to write.
// NOTE (Phase 1): updatedAt is deliberately NOT here — updateSchool reads it
// from req.body as a concurrency check, but it can never be written.
//
// NOTE (worksheets/workbooks realignment): "workbooks" and
// "worksheetCompletionData" MUST be in this list. pickWritable() below only
// copies keys present here — leaving either out means AdminPanel's save
// call returns 200 and the admin sees "Saved", but the school's
// Workbooks-applicability flag or its entire Worksheet Completion grid is
// silently dropped and never reaches the database.
//
// NOTE (Faculty Profile / MULTI-FACULTY): "facultyProfiles" MUST be in
// this list — same silent-drop trap as above. This used to be six separate
// fields ("facultyProfile" plus five *Rows arrays); they've been replaced
// by this one array field, since each faculty member now carries its own
// copy of those five row arrays instead of the school carrying one shared
// copy. If you're mid-rollout and some clients may still send the OLD six
// fields, you can list them here too (pickWritable only copies keys that
// are actually present in the request body, so harmless either way) — but
// nothing in this backend reads them anymore.
const WRITABLE_FIELDS = [
  "name", "logo", "faculty", "year", "grades", "totalStudents",
  "lastUpdatedOn", "lastUpdatedBy", "lastReviewedOn", "lastReviewedBy",
  "workingDays",
  "deliverables", "kitsMeta", "workbooks", "worksheets", "stem", "gradeData",
  "workbookRows", "workbookCompletionData", "worksheetCompletionData",
  "kitsRows", "kitsData",
  "atalLabRows",
  "stemRows", "workdoneRows",
  "mediaRows", "assessmentRows", "reportCardRows", "eventRows",
  "expoRows", "facultyObservationRows", "workAccomplishmentRows",
  "facultyProfiles",
  "enabledSections",
];

function pickWritable(body) {
  const updates = {};
  for (const key of WRITABLE_FIELDS) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  return updates;
}

// Shared ValidationError → 422 formatter (was duplicated inline everywhere).
function sendValidationError(res, error) {
  const errors = {};
  Object.keys(error.errors).forEach((field) => {
    errors[field] = error.errors[field].message;
  });
  return res.status(422).json({ success: false, message: "Validation failed", errors });
}

// ────────────────────────────────────────────────────────────────────────────
//  Deletion password check — used only by deleteSchool below.
//
//  This is a SEPARATE, SHARED secret (SCHOOL_DELETE_PASSWORD env var) — it
//  is intentionally NOT tied to any individual admin's own login password,
//  and nothing about it is ever sent to or checked in the browser. server.js
//  fails fast at startup if this env var isn't set.
//
//  crypto.timingSafeEqual requires equal-length buffers, so lengths are
//  compared first as a quick guard; a wrong-length guess still returns
//  false, it just skips straight there instead of throwing.
// ────────────────────────────────────────────────────────────────────────────
function isCorrectDeletePassword(candidate) {
  const expected = Buffer.from(process.env.SCHOOL_DELETE_PASSWORD || "");
  const given = Buffer.from(String(candidate || ""));
  if (given.length !== expected.length) return false;
  return crypto.timingSafeEqual(given, expected);
}

// ────────────────────────────────────────────────────────────────────────────
//  PHASE 1: resolve which mediaRows entry an upload/delete refers to.
//
//  Prefers the stable `rowId`. When a rowId IS supplied it must match — we
//  never fall back to position in that case, because a stale index pointing
//  at the wrong month's row is exactly the bug rowIds exist to prevent.
//  The numeric rowIndex path only runs when no rowId was sent at all
//  (legacy rows saved before the migration, older clients).
// ────────────────────────────────────────────────────────────────────────────
function findMediaRowIndex(school, body = {}) {
  const rows = Array.isArray(school.mediaRows) ? school.mediaRows : [];
  if (body.rowId) {
    return rows.findIndex((r) => r && r.rowId === body.rowId);
  }
  const idx = Number(body.rowIndex);
  return Number.isInteger(idx) && rows[idx] ? idx : -1;
}

// ────────────────────────────────────────────────────────────────────────────
//  MULTI-FACULTY: resolve which entry in school.facultyProfiles an
//  upload/delete refers to, by its stable `id` (stamped client-side in
//  AdminPanel's blankFacultyProfile(), auto-healed server-side in
//  updateSchool below for anything that somehow arrives without one).
//
//  Unlike findMediaRowIndex above there's no positional fallback — a
//  faculty member's id is always present once they've been added and
//  saved at least once, and falling back to array position would risk
//  attaching a photo to the wrong person's card if two admins are editing
//  the same school's faculty list at once.
// ────────────────────────────────────────────────────────────────────────────
function findFacultyIndex(school, facultyId) {
  const list = Array.isArray(school.facultyProfiles) ? school.facultyProfiles : [];
  if (!facultyId) return -1;
  return list.findIndex((f) => f && f.id === facultyId);
}

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/schools   (admin only)
// ────────────────────────────────────────────────────────────────────────────
const createSchool = async (req, res) => {
  try {
    const { name, faculty, year, grades, totalStudents } = req.body;

    const school = await School.create({
      name,
      faculty: faculty || "",
      year: year || "2025-2026",
      grades: grades || "",
      totalStudents: totalStudents || 0,
      ...defaultContent(name, grades),
    });

    return res.status(201).json({ success: true, message: "School created", data: school });
  } catch (error) {
    if (error.name === "ValidationError") return sendValidationError(res, error);
    console.error("❌  createSchool error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/schools   (admin only) — lightweight list for the AdminPanel
//  sidebar directory. Optional ?search= filters by name.
// ────────────────────────────────────────────────────────────────────────────
const getAllSchools = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    const schools = await School.find(filter).select("_id name").sort({ name: 1 });

    return res.status(200).json({ success: true, total: schools.length, data: schools });
  } catch (error) {
    console.error("❌  getAllSchools error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/schools/me   (client only)
// ────────────────────────────────────────────────────────────────────────────
const getMySchool = async (req, res) => {
  try {
    if (req.user.role !== "client" || !req.user.schoolId) {
      return res.status(403).json({ success: false, message: "This route is for school accounts only" });
    }

    const school = await School.findById(req.user.schoolId);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    // [DEBUG] This is the exact value AEDSDashboard filters its nav on.
    console.log("[BE:getMySchool] enabledSections for", school.name, "=", school.enabledSections);

    return res.status(200).json({ success: true, data: school });
  } catch (error) {
    console.error("❌  getMySchool error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/schools/:id   (admin only) — full document, for editing
//
//  FIX (kept): 404s soft-deleted schools too, so the admin can't open (and
//  edit) a school that no longer appears in the directory list.
// ────────────────────────────────────────────────────────────────────────────
const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }
    return res.status(200).json({ success: true, data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  getSchoolById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  PATCH /api/schools/:id   (admin only)
//
//  FIX (kept): filter includes isActive: true so a soft-deleted school can't
//  be silently edited/resurrected through a stale tab.
//
//  PHASE 1 — optimistic concurrency: AdminPanel sends the whole school
//  object, which includes the `updatedAt` it originally loaded. That value
//  is folded into the query filter — if someone else saved this school
//  since, the filter misses and we answer 409 instead of silently
//  overwriting their work. `updatedAt` is NOT in WRITABLE_FIELDS, so it can
//  only ever be compared, never written. Older clients that omit it simply
//  skip the check (backward compatible). 409 does NOT trip apiFetch's
//  session-clear branch (only 401 does) — same reasoning as the
//  deletion-password 403 fix below.
//
//  PHASE 1 — rowId auto-heal: any incoming mediaRows entry missing a rowId
//  gets one stamped here. The migration script covers existing documents;
//  this covers documents touched by older clients afterwards, so every
//  SAVED media row is always addressable by rowId.
//
//  MULTI-FACULTY — same auto-heal for facultyProfiles: any incoming entry
//  missing an `id` gets one stamped here, so every SAVED faculty member is
//  always addressable by id (the same guarantee findFacultyIndex above
//  relies on for photo/signature uploads).
// ────────────────────────────────────────────────────────────────────────────
const updateSchool = async (req, res) => {
  try {
    const updates = pickWritable(req.body);

    if (Array.isArray(updates.mediaRows)) {
      updates.mediaRows = updates.mediaRows.map((row) =>
        row && typeof row === "object" && !row.rowId
          ? { ...row, rowId: crypto.randomUUID() }
          : row
      );
    }

    if (Array.isArray(updates.facultyProfiles)) {
      updates.facultyProfiles = updates.facultyProfiles.map((person) =>
        person && typeof person === "object" && !person.id
          ? { ...person, id: crypto.randomUUID() }
          : person
      );
    }

    // [DEBUG] Traces enabledSections specifically through the save path —
    // remove once the "untick doesn't hide it on the dashboard" issue is
    // confirmed fixed.
    console.log("[BE:updateSchool] req.body.enabledSections  =", req.body.enabledSections);
    console.log("[BE:updateSchool] updates.enabledSections   =", updates.enabledSections);

    // [DEBUG] Same trace for the worksheets/workbooks realignment — remove
    // once confirmed the Worksheet Completion tab actually persists.
    console.log("[BE:updateSchool] req.body.workbooks                =", req.body.workbooks);
    console.log("[BE:updateSchool] req.body.worksheetCompletionData  keys =", req.body.worksheetCompletionData ? Object.keys(req.body.worksheetCompletionData) : req.body.worksheetCompletionData);
    console.log("[BE:updateSchool] updates.workbooks                 =", updates.workbooks);
    console.log("[BE:updateSchool] updates.worksheetCompletionData keys =", updates.worksheetCompletionData ? Object.keys(updates.worksheetCompletionData) : updates.worksheetCompletionData);

    // [DEBUG] Same trace for the multi-faculty-profile change — remove
    // once confirmed the Faculty Profile tab persists more than one entry.
    console.log("[BE:updateSchool] req.body.facultyProfiles length =", Array.isArray(req.body.facultyProfiles) ? req.body.facultyProfiles.length : req.body.facultyProfiles);
    console.log("[BE:updateSchool] updates.facultyProfiles length   =", Array.isArray(updates.facultyProfiles) ? updates.facultyProfiles.length : updates.facultyProfiles);

    const filter = { _id: req.params.id, isActive: true };
    const expected = req.body.updatedAt ? new Date(req.body.updatedAt) : null;
    if (expected && !Number.isNaN(expected.getTime())) {
      filter.updatedAt = expected;
    }

    const school = await School.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });

    if (!school) {
      // Distinguish "gone" from "changed underneath you".
      const current = await School.findOne({ _id: req.params.id, isActive: true }).select("updatedAt");
      if (current) {
        return res.status(409).json({
          success: false,
          message:
            "This school was changed by someone else since you opened it. Copy any edits you need (Export tab), then reload the school and re-apply them.",
          serverUpdatedAt: current.updatedAt,
        });
      }
      console.log("[BE:updateSchool] no matching active school for id", req.params.id);
      return res.status(404).json({ success: false, message: "School not found" });
    }

    console.log("[BE:updateSchool] saved doc enabledSections  =", school.enabledSections);
    console.log("[BE:updateSchool] saved doc workbooks                =", school.workbooks);
    console.log("[BE:updateSchool] saved doc worksheetCompletionData keys =", school.worksheetCompletionData ? Object.keys(school.worksheetCompletionData) : school.worksheetCompletionData);
    console.log("[BE:updateSchool] saved doc facultyProfiles length =", Array.isArray(school.facultyProfiles) ? school.facultyProfiles.length : school.facultyProfiles);

    return res.status(200).json({ success: true, message: "School updated", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    if (error.name === "ValidationError") return sendValidationError(res, error);
    console.error("❌  updateSchool error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  PATCH /api/schools/:id/deliverables   (admin only)
//  Body: { name: "WORKBOOK", status: "DELIVERED" }
//
//  FIX (kept): ValidationError is caught and returned as a 422 with field
//  details.
// ────────────────────────────────────────────────────────────────────────────
const updateDeliverableStatus = async (req, res) => {
  try {
    const { name, status } = req.body;

    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const deliverable = school.deliverables.find((d) => d.name === name);
    if (!deliverable) {
      return res.status(404).json({ success: false, message: `Deliverable "${name}" not found on this school` });
    }

    deliverable.status = status;
    await school.save();

    return res.status(200).json({ success: true, message: "Deliverable updated", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    if (error.name === "ValidationError") return sendValidationError(res, error);
    console.error("❌  updateDeliverableStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  DELETE /api/schools/:id   (admin only)
//  Soft-deletes (isActive: false) and deactivates the linked client login.
//
//  FIX (kept): requires a separate DELETION PASSWORD in the request body,
//  checked against process.env.SCHOOL_DELETE_PASSWORD via a constant-time
//  comparison (see isCorrectDeletePassword above). The request must still
//  pass `protect` + `requireAdmin` first, so an admin session is required
//  either way.
//
//  FIX (kept): wrong deletion password returns 403, not 401 — apiFetch
//  treats ANY 401 on an authed request as "session dead" and clears the
//  admin's real login token. 403 (forbidden action) doesn't trip that
//  branch, so a wrong deletion password just shows "Incorrect deletion
//  password" and the admin stays logged in and can retry immediately.
// ────────────────────────────────────────────────────────────────────────────
const deleteSchool = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Deletion password is required" });
    }

    if (!isCorrectDeletePassword(password)) {
      return res.status(403).json({ success: false, message: "Incorrect deletion password" });
    }

    const school = await School.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    await User.updateMany({ schoolId: school._id }, { isActive: false });

    return res.status(200).json({ success: true, message: `${school.name} removed` });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  deleteSchool error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/schools/:id/media/upload   (admin only)
//
//  PHASE 1: the target row is resolved via findMediaRowIndex — stable rowId
//  first, numeric rowIndex only as a legacy fallback when no rowId is sent.
//  (Multer parses the multipart fields, so req.body.rowId / rowIndex arrive
//  as strings — the helper handles both.)
// ────────────────────────────────────────────────────────────────────────────
const uploadMediaPhotos = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const rowIndex = findMediaRowIndex(school, req.body);
    if (rowIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Media row not found — save the media row before attaching photos to it",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files were uploaded" });
    }

    const newFiles = req.files.map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      url: `/uploads/media/${school._id}/${f.filename}`,
      size: f.size,
      uploadedAt: new Date().toISOString(),
    }));

    const row = { ...school.mediaRows[rowIndex] };
    row.files = [...(row.files || []), ...newFiles];
    school.mediaRows[rowIndex] = row;
    school.markModified("mediaRows"); // Mixed type — Mongoose can't see into it otherwise

    await school.save();

    return res.status(200).json({ success: true, message: "Photos uploaded", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  uploadMediaPhotos error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  DELETE /api/schools/:id/media/upload   (admin only)
//  PHASE 1: same rowId-first lookup as uploads.
// ────────────────────────────────────────────────────────────────────────────
const deleteMediaPhoto = async (req, res) => {
  try {
    const { filename } = req.body;

    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const rowIndex = findMediaRowIndex(school, req.body);
    const row = rowIndex === -1 ? null : school.mediaRows[rowIndex];
    if (!row || !Array.isArray(row.files)) {
      return res.status(404).json({ success: false, message: "No files found for this row" });
    }

    const target = row.files.find((f) => f.filename === filename);
    if (!target) {
      return res.status(404).json({ success: false, message: "File not found on this row" });
    }

    // Remove from disk. ENOENT (already gone) is fine — we still want the
    // DB reference cleaned up either way. path.basename() strips any
    // directory components as defense-in-depth even though filenames are
    // matched against the stored list above.
    const filePath = path.join(MEDIA_UPLOAD_ROOT, school._id.toString(), path.basename(filename));
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("❌  deleteMediaPhoto — failed to remove file from disk:", err);
      }
    });

    const nextRow = { ...row, files: row.files.filter((f) => f.filename !== filename) };
    school.mediaRows[rowIndex] = nextRow;
    school.markModified("mediaRows");

    await school.save();

    return res.status(200).json({ success: true, message: "Photo removed", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  deleteMediaPhoto error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Only ever unlink a logo file we actually own — a pasted external URL
// (https://...) must never be touched by fs.unlink.
function isLocalLogoPath(logo, schoolId) {
  return typeof logo === "string" && logo.startsWith(`/uploads/logos/${schoolId}/`);
}

// Same guard as isLocalLogoPath, for the faculty profile photo.
function isLocalFacultyPhotoPath(photo, schoolId) {
  return typeof photo === "string" && photo.startsWith(`/uploads/faculty/${schoolId}/`);
}

// Same guard as isLocalLogoPath, for the signatory's signature image.
function isLocalSignaturePath(photo, schoolId) {
  return typeof photo === "string" && photo.startsWith(`/uploads/signature/${schoolId}/`);
}

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/schools/:id/logo   (admin only)
// ────────────────────────────────────────────────────────────────────────────
const uploadSchoolLogo = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo file was uploaded" });
    }

    if (isLocalLogoPath(school.logo, school._id)) {
      const oldPath = path.join(LOGO_UPLOAD_ROOT, school._id.toString(), path.basename(school.logo));
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("❌  uploadSchoolLogo — failed to remove previous logo:", err);
        }
      });
    }

    school.logo = `/uploads/logos/${school._id}/${req.file.filename}`;
    await school.save();

    return res.status(200).json({ success: true, message: "Logo uploaded", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  uploadSchoolLogo error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  DELETE /api/schools/:id/logo   (admin only)
// ────────────────────────────────────────────────────────────────────────────
const deleteSchoolLogo = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    if (isLocalLogoPath(school.logo, school._id)) {
      const oldPath = path.join(LOGO_UPLOAD_ROOT, school._id.toString(), path.basename(school.logo));
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("❌  deleteSchoolLogo — failed to remove file from disk:", err);
        }
      });
    }

    school.logo = "";
    await school.save();

    return res.status(200).json({ success: true, message: "Logo removed", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  deleteSchoolLogo error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/schools/:id/faculty-photo   (admin only)
//
//  MULTI-FACULTY: writes to ONE entry of school.facultyProfiles — which
//  entry is resolved via findFacultyIndex(school, req.body.facultyId).
//  `facultyId` is a plain form field alongside the uploaded file (multer
//  parses it into req.body same as it already does for media's
//  rowId/rowIndex), sent by AdminPanel's FacultyPhotoEditor as
//  `entry.id` — see uploadFacultyPhoto in api/schoolApi.js on the
//  frontend. facultyProfiles is a Mixed field, so markModified is
//  required — Mongoose can't see into an array-element mutation on a
//  Mixed field on its own.
// ────────────────────────────────────────────────────────────────────────────
const uploadFacultyPhoto = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No photo file was uploaded" });
    }

    const index = findFacultyIndex(school, req.body.facultyId);
    if (index === -1) {
      return res.status(400).json({
        success: false,
        message: "Faculty member not found — save this faculty member before uploading a photo",
      });
    }

    const list = (Array.isArray(school.facultyProfiles) ? school.facultyProfiles : []).slice();
    const current = list[index] || {};

    if (isLocalFacultyPhotoPath(current.photo, school._id)) {
      const oldPath = path.join(FACULTY_UPLOAD_ROOT, school._id.toString(), path.basename(current.photo));
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("❌  uploadFacultyPhoto — failed to remove previous photo:", err);
        }
      });
    }

    list[index] = { ...current, photo: `/uploads/faculty/${school._id}/${req.file.filename}` };
    school.facultyProfiles = list;
    school.markModified("facultyProfiles");
    await school.save();

    return res.status(200).json({ success: true, message: "Faculty photo uploaded", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  uploadFacultyPhoto error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  DELETE /api/schools/:id/faculty-photo   (admin only)
//  MULTI-FACULTY: same facultyId-based lookup as the upload route above.
//  `facultyId` arrives in the JSON body here (no file, so no multer
//  involved — express.json() parses it same as `filename` for media).
// ────────────────────────────────────────────────────────────────────────────
const deleteFacultyPhoto = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const index = findFacultyIndex(school, req.body.facultyId);
    if (index === -1) {
      return res.status(400).json({ success: false, message: "Faculty member not found" });
    }

    const list = (Array.isArray(school.facultyProfiles) ? school.facultyProfiles : []).slice();
    const current = list[index] || {};

    if (isLocalFacultyPhotoPath(current.photo, school._id)) {
      const oldPath = path.join(FACULTY_UPLOAD_ROOT, school._id.toString(), path.basename(current.photo));
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("❌  deleteFacultyPhoto — failed to remove file from disk:", err);
        }
      });
    }

    list[index] = { ...current, photo: "" };
    school.facultyProfiles = list;
    school.markModified("facultyProfiles");
    await school.save();

    return res.status(200).json({ success: true, message: "Faculty photo removed", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  deleteFacultyPhoto error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/schools/:id/signature-photo   (admin only)
//  MULTI-FACULTY: same shape as uploadFacultyPhoto above, writing to one
//  entry's `signaturePhoto` instead of `photo`.
// ────────────────────────────────────────────────────────────────────────────
const uploadSignaturePhoto = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No signature file was uploaded" });
    }

    const index = findFacultyIndex(school, req.body.facultyId);
    if (index === -1) {
      return res.status(400).json({
        success: false,
        message: "Faculty member not found — save this faculty member before uploading a signature",
      });
    }

    const list = (Array.isArray(school.facultyProfiles) ? school.facultyProfiles : []).slice();
    const current = list[index] || {};

    if (isLocalSignaturePath(current.signaturePhoto, school._id)) {
      const oldPath = path.join(SIGNATURE_UPLOAD_ROOT, school._id.toString(), path.basename(current.signaturePhoto));
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("❌  uploadSignaturePhoto — failed to remove previous signature:", err);
        }
      });
    }

    list[index] = { ...current, signaturePhoto: `/uploads/signature/${school._id}/${req.file.filename}` };
    school.facultyProfiles = list;
    school.markModified("facultyProfiles");
    await school.save();

    return res.status(200).json({ success: true, message: "Signature image uploaded", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  uploadSignaturePhoto error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  DELETE /api/schools/:id/signature-photo   (admin only)
//  MULTI-FACULTY: same facultyId-based lookup as deleteFacultyPhoto above.
// ────────────────────────────────────────────────────────────────────────────
const deleteSignaturePhoto = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school || !school.isActive) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const index = findFacultyIndex(school, req.body.facultyId);
    if (index === -1) {
      return res.status(400).json({ success: false, message: "Faculty member not found" });
    }

    const list = (Array.isArray(school.facultyProfiles) ? school.facultyProfiles : []).slice();
    const current = list[index] || {};

    if (isLocalSignaturePath(current.signaturePhoto, school._id)) {
      const oldPath = path.join(SIGNATURE_UPLOAD_ROOT, school._id.toString(), path.basename(current.signaturePhoto));
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("❌  deleteSignaturePhoto — failed to remove file from disk:", err);
        }
      });
    }

    list[index] = { ...current, signaturePhoto: "" };
    school.facultyProfiles = list;
    school.markModified("facultyProfiles");
    await school.save();

    return res.status(200).json({ success: true, message: "Signature image removed", data: school });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  deleteSignaturePhoto error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
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
};