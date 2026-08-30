const mongoose = require("mongoose");

// Matches AdminPanel's blankSchool() shape — used as defaults for new schools.
// (The Mongoose schema also has its own defaults, so passing name alone
// works too; this just makes the "new school" response friendlier.)
//
// Deliverables stay a structured sub-document (used for status badges and
// the admin directory's at-a-glance LED row) — everything else uses Mixed
// so it can hold whatever shape AdminPanel's generic table/JSON editors
// produce, without a rigid schema fighting the UI that already exists.
const deliverableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    applicable: { type: Boolean, default: true },
    grades: { type: String, default: "—", trim: true },
    status: {
      type: String,
      // FIX: this enum was missing "INPROGRESS" and "NOT DELIVERED", which
      // BOTH exist in AdminPanel's STATUS_OPTS and in validateSchool.js's
      // deliverableValidationRules. Worse, AdminPanel's empty deliverable
      // row defaults to status: "INPROGRESS" — so the moment an admin added
      // a deliverable row and clicked Save, findByIdAndUpdate with
      // runValidators: true rejected the ENTIRE school update with
      // '"INPROGRESS" is not a valid status'. All three lists (this enum,
      // deliverableValidationRules' isIn list, and AdminPanel's
      // STATUS_OPTS) now agree — keep them in sync.
      enum: {
        values: [
          "NIL",
          "IN PROGRESS",
          "INPROGRESS",
          "REPORTING MONTHLY",
          "DELIVERED",
          "NOT DELIVERED",
          "COMPLETED",
          "Not Applicable",
        ],
        message: "{VALUE} is not a valid status",
      },
      default: "NIL",
    },
  },
  { _id: false }
);

// ────────────────────────────────────────────────────────────────────────────
//  enabledSections — one boolean per workbook "sheet" (13 keys, see
//  ADMIN_SECTION_KEYS in Aedsadminpanel.jsx / SECTION_KEYS in
//  Aedsdashboard.jsx). Ticked in AdminPanel's Overview tab.
//
//    true  → the section's admin tab(s) are available for data entry AND
//            the section shows up in the client-facing AEDSDashboard.
//    false → the admin tab(s) are hidden (can't be opened to enter data)
//            and the section is hidden from the dashboard entirely.
//
//  Kept as Mixed (not a rigid sub-schema) so new sheet keys can be added on
//  the frontend without a migration — an absent key is treated as "true"
//  (opt-out model) by both AdminPanel and AEDSDashboard, so existing
//  schools created before this field existed keep showing everything.
// ────────────────────────────────────────────────────────────────────────────
const DEFAULT_ENABLED_SECTIONS = {
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
};

const schoolSchema = new mongoose.Schema(
  {
    // ── Core identity fields (structured, used for the admin directory) ──
    name: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
      maxlength: [150, "School name must be at most 150 characters"],
    },

    // Stores either a server-relative uploaded path ("/uploads/logos/…"),
    // a data-URL (legacy), or a plain image URL the admin pasted in.
    logo: { type: String, default: "" },

    faculty: { type: String, trim: true, default: "" },
    year: { type: String, trim: true, default: "2025-2026" },
    grades: { type: String, trim: true, default: "" },
    totalStudents: { type: Number, default: 0, min: 0 },
    workingDays: { type: String, trim: true, default: "5 DAYS PER WEEK" },

    // Audit-trail fields — must stay declared here or strict mode silently
    // drops them on save (see the fix note in the original file).
    lastUpdatedOn: { type: String, trim: true, default: "" },
    lastUpdatedBy: { type: String, trim: true, default: "" },
    lastReviewedOn: { type: String, trim: true, default: "" },
    lastReviewedBy: { type: String, trim: true, default: "" },

    deliverables: { type: [deliverableSchema], default: [] },

    // NEW — see comment block above.
    enabledSections: { type: mongoose.Schema.Types.Mixed, default: DEFAULT_ENABLED_SECTIONS },

    // ── Flexible content sections — mirror AdminPanel's blankSchool() shape ──
    kitsMeta: { type: mongoose.Schema.Types.Mixed, default: {} },

    // NEW — Workbooks gains its own applicability flag, same shape as
    // worksheets/stem below. The register workbook this app mirrors marks
    // "WORKBOOK · NOT APPLICABLE" for schools running the worksheet track
    // instead of physical books, so Workbooks needs the same
    // { applicable, note } shape those two already have.
    workbooks: { type: mongoose.Schema.Types.Mixed, default: { applicable: true, note: "" } },

    worksheets: { type: mongoose.Schema.Types.Mixed, default: { applicable: false, note: "" } },
    stem: { type: mongoose.Schema.Types.Mixed, default: { applicable: false, note: "" } },
    gradeData: { type: mongoose.Schema.Types.Mixed, default: [] },
    workbookRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    workbookCompletionData: { type: mongoose.Schema.Types.Mixed, default: {} },

    // NEW — the grade-wise activity completion grid actually belongs to
    // the WORKSHEETS sheet in the register workbook (Grades 4-9, one row
    // per class section), not Workbooks. Same nested shape as
    // workbookCompletionData: { "Grade X": [{ name, sections: [...] }] }.
    // AdminPanel's CompletionEditor writes here when the "Worksheet
    // Completion" tab is open; AEDSDashboard reads it for the Worksheets
    // section's grade-by-grade table.
    worksheetCompletionData: { type: mongoose.Schema.Types.Mixed, default: {} },

    kitsRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    kitsData: { type: mongoose.Schema.Types.Mixed, default: {} },
    // "SCHOOL ATAL LAB STOCK LIST", split out of the KITS sheet into
    // its own register: component, componentsQty, workingQty, damagedQty.
    atalLabRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    stemRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    workdoneRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    mediaRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    assessmentRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    reportCardRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    eventRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    expoRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    facultyObservationRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    workAccomplishmentRows: { type: mongoose.Schema.Types.Mixed, default: [] },

    // ── FACULTY PROFILE (NEW) — the infographic-style faculty card shown
    // on the client dashboard's "Faculty Profile" sheet, and edited from
    // AdminPanel's "Faculty Profile" tab. `facultyProfile` holds the
    // scalar fields (name, title, photo, quote, contact, signatory,
    // certification text); the five list-shaped parts of the card each
    // get their own row array so they can reuse the same generic
    // EditableTable the rest of the app already uses.
    facultyProfile: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        name: "",
        title: "",
        photo: "",
        topBadge: "CYBERBOTS CERTIFIED FACULTY",
        bottomSeal: "CYBERBOTS CERTIFIED EXPERT FACULTY",
        tagline: "EMPOWERING STUDENTS THROUGH ROBOTICS  •  AI  •  INNOVATION  •  SKILLS",
        quote: "",
        contactPhone: "",
        contactEmail: "",
        contactWebsite: "",
        contactLocation: "",
        signatoryName: "",
        signatoryTitle: "",
        signatoryCompany: "",
        // Managing Director's (or whoever signs) signature image, shown in
        // the card footer in place of the styled-text signature when set.
        // Same "/uploads/…" server-relative-path-or-pasted-URL shape as
        // `logo` and `photo` above.
        signaturePhoto: "",
      },
    },
    facultyStatsRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    facultyExpertiseRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    facultyTeachingRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    facultyToolsRows: { type: mongoose.Schema.Types.Mixed, default: [] },
    facultyStrengthsRows: { type: mongoose.Schema.Types.Mixed, default: [] },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // updatedAt doubles as "last updated"
  }
);

schoolSchema.index({ name: 1 });

module.exports = mongoose.model("School", schoolSchema);
module.exports.DEFAULT_ENABLED_SECTIONS = DEFAULT_ENABLED_SECTIONS;