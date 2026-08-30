import { useState, useEffect, useCallback, useMemo, useRef, useId } from "react";
import {
  getAllSchools,
  getSchoolById,
  createSchool as apiCreateSchool,
  updateSchool as apiUpdateSchool,
  deleteSchool as apiDeleteSchool,
  uploadMediaPhotos,
  deleteMediaPhoto,
  uploadSchoolLogo,
  deleteSchoolLogo,
  uploadFacultyPhoto,
  deleteFacultyPhoto,
  uploadSignaturePhoto,
  deleteSignaturePhoto,
} from "../../api/schoolApi";
import { adminCreateLogin, adminGetLoginForSchool } from "../../api/authApi";
import { BASE_URL } from "../../api/http";
// Static reference data only — no backend/DB behind this. Feeds the
// Activity dropdown on the Workbook Completion AND Worksheet Completion
// tabs below (see curriculumOptionsForGrade); nothing else reads it.
import AEDS_CURRICULUM from "../../data/aedsCurriculum";

// ────────────────────────────────────────────────────────────────────────────
//  WORKSHEETS / WORKBOOKS REALIGNMENT (this file's newest change):
//
//  The register workbook keeps its grade-wise activity-completion grid on
//  the WORKSHEETS sheet (Grades 4-9, ACTIVITY NAME / SECTION / COMPLETION
//  DATE / STATUS, one row per class section) — and marks WORKBOOKS itself
//  as an applicability flag ("NOT APPLICABLE" for a school running the
//  worksheet track instead of physical books). This file previously had it
//  backwards: the completion grid lived under Workbooks and Worksheets was
//  a bare note with nowhere to enter data. Four things changed to match:
//
//    • blankSchool() gains `workbooks: { applicable, note }` (mirroring
//      worksheets/stem) and `worksheetCompletionData: {}`.
//    • SECTION_TOGGLES: the "worksheets" toggle now owns a real tab
//      (worksheetCompletionData) instead of tabs: [].
//    • TAB_LIST gets a new "Worksheet Completion" tab, right after
//      "Workbook Completion".
//    • WorkbookCompletionEditor is renamed CompletionEditor and takes a
//      `dataKey` prop, so the exact same grade-tabs / curriculum-dropdown /
//      quick-fill editor drives BOTH school.workbookCompletionData and
//      school.worksheetCompletionData — only the field it writes to
//      differs between the two tabs that render it.
//    • OverviewTab's "Worksheets & STEM" applicability block becomes a
//      three-way "Workbooks / Worksheets / STEM" block, since Workbooks
//      now carries the same { applicable, note } shape.
//
//  See models/School.js + controllers/schoolController.js for the matching
//  backend change: `workbooks` and `worksheetCompletionData` must be added
//  to the schema AND to WRITABLE_FIELDS, or a save silently drops them.
//
//  GRADE / SECTION SPLIT (this pass): the WORKSHEETS sheet's SECTION
//  column actually carries the class ("4A", "4B") — grade and section
//  combined. CompletionEditor now edits those as two separate columns
//  (Grade, Section) instead of one, both on the Workbook Completion tab
//  and the Worksheet Completion tab (they share this editor via `dataKey`).
//  Legacy rows saved before this split store only `section` on the wire —
//  nestedToRows() splits that combined string on read (see
//  splitGradeSection); the split is written back the next time that
//  grade's rows are saved.
//
//  FACULTY PROFILE (this pass): a new "Faculty Profile" tab drives the
//  infographic-style faculty card shown on the client dashboard. Scalar
//  fields (name, title, photo, quote, contact, signatory, certification
//  text) live on `school.facultyProfile`; the five list-shaped parts of
//  the card (stats / expertise / teaching expertise / tools / key
//  strengths) each get their own row array, reusing the same generic
//  EditableTable every other sheet already uses. See FacultyProfileTab
//  near the bottom of this file.
// ────────────────────────────────────────────────────────────────────────────

// ─── DEFAULTS FOR A NEW SCHOOL ──────────────────────────────────────────────
function blankSchool(name) {
  return {
    name: name || "New School",
    logo: "",
    faculty: "",
    year: "2026-2027",
    grades: "V TO VIII",
    totalStudents: 0,
    workingDays: "5 DAYS PER WEEK",
    lastUpdatedOn: "",
    lastUpdatedBy: "",
    lastReviewedOn: "",
    lastReviewedBy: "",
    kitsMeta: { noOfKitBoxes: "", issuedDate: "-", refilledDate: "-", lastUpdatedOn: "-" },
    // NEW — Workbooks gains its own applicability flag, same shape as
    // worksheets/stem. The register marks WORKBOOK "NOT APPLICABLE" for
    // schools running the worksheet track instead of physical books.
    workbooks: { applicable: true, note: "" },
    worksheets: { applicable: false, note: "This school's AEDS programme does not include activity-based worksheets." },
    stem: { applicable: false, note: "STEM Kits are an optional deliverable and were not opted for this school." },
    deliverables: [],
    gradeData: [],
    workbookRows: [],
    workbookCompletionData: {},
    // NEW — the grade-wise activity completion grid actually lives on the
    // WORKSHEETS sheet in the register workbook. Same nested shape as
    // workbookCompletionData: { "Grade 4": [{ name, sections: [...] }] }.
    worksheetCompletionData: {},
    kitsRows: [],
    kitsData: {},
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
    // NEW — Faculty Profile: the infographic-style faculty card. Blank on
    // purpose — every field is edited from the new Faculty Profile tab.
    facultyProfile: {
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
    },
    facultyStatsRows: [],
    facultyExpertiseRows: [],
    facultyTeachingRows: [],
    facultyToolsRows: [],
    facultyStrengthsRows: [],
    enabledSections: { ...DEFAULT_ENABLED_SECTIONS },
  };
}

// ─── SECTION VISIBILITY (checkbox toggles on the Overview tab) ─────────────
//
// One entry per workbook "sheet". Ticking a box in OverviewTab's "Sections
// shown to this school" panel does two things at once:
//   1. reveals that sheet's admin tab(s) here, so data can be entered
//   2. reveals the matching section in the client-facing AEDSDashboard
// Unticking hides both. `tabs` lists which TAB_LIST id(s) belong to this
// sheet.
const SECTION_TOGGLES = [
  { key: "workbooks", label: "Workbooks", hint: "Books & learning materials issued per grade (+ legacy activity completion, if this school still uses it).", tabs: ["workbookRows", "workbookCompletionData"] },
  // CHANGED — Worksheets now owns a real data tab (its grade-wise activity
  // completion grid), matching the WORKSHEETS sheet in the register.
  { key: "worksheets", label: "Worksheets", hint: "Activity-based worksheets — grade-wise activity completion, one row per class section.", tabs: ["worksheetCompletionData"] },
  { key: "kits", label: "Kits", hint: "Robotics & AI core kit component inventory.", tabs: ["kitsRows", "kitsData"] },
  { key: "atallab", label: "Atal Lab Stock", hint: "School Atal Tinkering Lab stock list — its own register, separate from Kits.", tabs: ["atalLabRows"] },
  { key: "stem", label: "STEM", hint: "STEM take-home kits (Grades 1–3), if opted.", tabs: ["stemRows"] },
  { key: "workdone", label: "Workdone", hint: "Monthly work done report.", tabs: ["workdoneRows"] },
  { key: "media", label: "Media", hint: "Practical class photos/videos — drive links.", tabs: ["mediaRows"] },
  { key: "assessments", label: "Assessments", hint: "Assessment register & attendance.", tabs: ["assessmentRows"] },
  { key: "reportcards", label: "Report Cards", hint: "Skill-set report cards.", tabs: ["reportCardRows"] },
  { key: "faculty", label: "Faculty Observation", hint: "Faculty observations & resolutions.", tabs: ["facultyObservationRows"] },
  { key: "expo", label: "Expo", hint: "Expo / competitions participation.", tabs: ["expoRows"] },
  { key: "event", label: "Event", hint: "Annual event / participation.", tabs: ["eventRows"] },
  { key: "accomplishment", label: "Work Accomplishment", hint: "Annual work accomplishment report.", tabs: ["workAccomplishmentRows"] },
  // NEW — Faculty Profile. Deliberately a DIFFERENT toggle key ("facultyProfile")
  // from the existing "faculty" key above (Faculty Observation) — they are
  // two unrelated sheets that happen to share the word "faculty".
  { key: "facultyProfile", label: "Faculty Profile", hint: "Infographic-style faculty bio card — photo, stats, expertise, tools & key strengths.", tabs: ["facultyProfile"] },
];

const DEFAULT_ENABLED_SECTIONS = SECTION_TOGGLES.reduce((acc, s) => {
  acc[s.key] = true;
  return acc;
}, {});

// Reverse lookup: TAB_LIST id → the SECTION_TOGGLES key that gates it.
// Tabs not present here (overview, deliverables, gradeData, credentials,
// export) are always shown — they're either the overview itself or
// admin-only utility tabs with no dashboard-facing equivalent.
const TAB_TO_SECTION = SECTION_TOGGLES.reduce((acc, s) => {
  s.tabs.forEach((tabId) => { acc[tabId] = s.key; });
  return acc;
}, {});

// A section is visible when its key is missing from enabledSections
// (older schools saved before this feature existed) or explicitly true.
const isSectionEnabled = (school, key) => !school?.enabledSections || school.enabledSections[key] !== false;

// ─── A11Y: shared dialog focus management ──────────────────────────────────
//
// One hook for every modal in this file. While `open` is true it:
//   1. remembers what had focus, then puts focus on `initialFocusRef`
//      (falling back to the dialog node) as the dialog opens;
//   2. traps Tab / Shift+Tab inside the dialog, so keyboard users can't
//      tab into the inert page behind the overlay;
//   3. on close, returns focus to the element that had it before the
//      dialog opened (if it's still in the document — e.g. NOT a just-
//      deleted school's ✕ button).
// Escape handling deliberately stays with each dialog — the delete modal,
// for example, must NOT close while a request is in flight.
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useDialogFocus(open, dialogRef, initialFocusRef) {
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const node = dialogRef.current;

    (initialFocusRef?.current || node)?.focus?.();

    const onKeyDown = (e) => {
      if (e.key !== "Tab" || !node) return;
      const focusables = Array.from(node.querySelectorAll(FOCUSABLE));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node?.addEventListener("keydown", onKeyDown);
    return () => {
      node?.removeEventListener("keydown", onKeyDown);
      if (
        previouslyFocused &&
        typeof previouslyFocused.focus === "function" &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

// ─── FIELD DEFS FOR GENERIC TABLES ─────────────────────────────────────────

const STATUS_OPTS = [
  "DELIVERED",
  "NOT DELIVERED",
  "INPROGRESS",
  "IN PROGRESS",
  "COMPLETED",
  "REPORTING MONTHLY",
  "NIL",
  "Not Applicable",
];
const YESNO = ["Yes", "No"];

const TABLES = {
  deliverables: {
    label: "Deliverables",
    hint: "The AEDS overview table — one row per deliverable, matching the workbook's AEDS sheet.",
    empty: { name: "", applicable: true, grades: "V TO VIII", status: "INPROGRESS" },
    columns: [
      { key: "name", label: "Deliverable", type: "text" },
      { key: "applicable", label: "Applicable", type: "select", options: [true, false], labels: ["Yes", "No"] },
      { key: "grades", label: "Grade", type: "text" },
      { key: "status", label: "Status", type: "select", options: STATUS_OPTS },
    ],
  },
  gradeData: {
    label: "Students per grade",
    hint: "Used for the student-count chart. If left empty, the dashboard derives it from the workbook counts.",
    empty: { grade: "", students: 0 },
    columns: [
      { key: "grade", label: "Grade", type: "text" },
      { key: "students", label: "Students", type: "number" },
    ],
  },
  workbookRows: {
    label: "Workbooks — Books & Learning Materials",
    hint: "One row per grade: total count, date issued, damage / replacements, replacement details (count), remarks.",
    empty: { grade: "", count: 0, dateIssued: "", damage: "No", replacementDetails: "NIL", remarks: "NIL" },
    columns: [
      { key: "grade", label: "Grade", type: "text" },
      { key: "count", label: "Total Count", type: "number" },
      { key: "dateIssued", label: "Date Issued", type: "date" },
      { key: "damage", label: "Damage / Replacements", type: "select", options: YESNO },
      { key: "replacementDetails", label: "Replacement Details (Count)", type: "textarea" },
      { key: "remarks", label: "Remarks / Justification", type: "textarea" },
    ],
  },
  kitsRows: {
    label: "KITS — Component inventory",
    hint: "Flat component list from the KITS sheet's main inventory table (Robotics & AI core kit). Use '0' or '-' for none.",
    empty: { component: "", damagedQty: "0", workingQty: "0", totalQty: "0", refillQty: "0" },
    columns: [
      { key: "component", label: "Components Name", type: "text" },
      { key: "damagedQty", label: "Damaged Qty", type: "qty" },
      { key: "workingQty", label: "Working Qty", type: "qty" },
      { key: "totalQty", label: "Total Qty", type: "qty" },
      { key: "refillQty", label: "Refill / Required Qty", type: "qty" },
    ],
  },
  atalLabRows: {
    label: "School Atal Lab Stock List",
    hint: "The KITS sheet's second table — \"SCHOOL ATAL LAB STOCK LIST\" — kept as its own register/tab so it doesn't get lost inside Kits.",
    empty: { component: "", componentsQty: "", workingQty: "", damagedQty: "NIL" },
    columns: [
      { key: "component", label: "Name of the Component", type: "text" },
      { key: "componentsQty", label: "Components Qty", type: "qty" },
      { key: "workingQty", label: "Working Qty", type: "qty" },
      { key: "damagedQty", label: "Damaged Qty", type: "qty" },
    ],
  },
  stemRows: {
    label: "STEM kits register",
    hint: "Only used when STEM is marked applicable on the Overview tab.",
    empty: { gradeLevel: "", term: "", totalCount: 0, dateIssued: "", damage: "No", replacementDetails: "NIL", remarks: "NIL" },
    columns: [
      { key: "gradeLevel", label: "Grade Level", type: "text" },
      { key: "term", label: "Term", type: "text" },
      { key: "totalCount", label: "Total Count Issued", type: "number" },
      { key: "dateIssued", label: "Date Issued", type: "date" },
      { key: "damage", label: "Damage / Replacements", type: "select", options: YESNO },
      { key: "replacementDetails", label: "Replacement Details (Count)", type: "textarea" },
      { key: "remarks", label: "Remarks / Justification", type: "textarea" },
    ],
  },
  workdoneRows: {
    label: "Monthly work done report",
    hint: "One row per month: submission date, status, drive link, remedial measures (if applicable).",
    empty: { month: "", date: "", status: "Submitted", link: "", linkLabel: "Drive folder", remedial: "Nil" },
    columns: [
      { key: "month", label: "Month", type: "text" },
      { key: "date", label: "Submission Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Submitted", "Pending"] },
      { key: "link", label: "Link URL", type: "text" },
      { key: "linkLabel", label: "Link Label", type: "text" },
      { key: "remedial", label: "Remedial Measures", type: "text" },
    ],
  },
  mediaRows: {
    label: "Practical class media — drive links",
    hint: "Photos / videos shared per month with the drive link.",
    // PHASE 1: every new row gets a stable rowId (stamped in addRow) —
    // uploaded photos attach to the row by this id, so deleting or
    // reordering rows can never misattach another month's photos.
    stampRowId: true,
    empty: { month: "", grades: "V TO VIII", photos: 0, videos: 0, dateShared: "", link: "", status: "COMPLETED", remarks: "NIL" },
    columns: [
      { key: "month", label: "Month", type: "text" },
      { key: "grades", label: "Grades", type: "text" },
      { key: "photos", label: "Photos Shared (Count)", type: "number" },
      { key: "videos", label: "Videos Shared (Count)", type: "number" },
      { key: "dateShared", label: "Date Shared", type: "date" },
      { key: "link", label: "Drive Link URL", type: "text" },
      { key: "status", label: "Status", type: "select", options: STATUS_OPTS },
      { key: "remarks", label: "Remarks / Justification", type: "text" },
    ],
  },
  assessmentRows: {
    label: "Assessment register",
    hint: "Sections is a comma-separated list, e.g. 5A, 5B, 6C. Attendance counts come from the ASSESSMENTS sheet.",
    empty: { assessmentNo: 1, date: "", sections: [], attended: 0, absent: 0, status: "Completed", remarks: "Nil" },
    columns: [
      { key: "assessmentNo", label: "Assessment No", type: "number", min: 1 },
      { key: "date", label: "Date Conducted", type: "date" },
      { key: "sections", label: "Grade / Sections", type: "tags" },
      { key: "attended", label: "Students Attended", type: "number" },
      { key: "absent", label: "Students Absent", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["Completed", "Pending"] },
      { key: "remarks", label: "Remarks / Justification", type: "text" },
    ],
  },
  reportCardRows: {
    label: "Skill-set report cards",
    hint: "Issued per grade per assessment cycle.",
    empty: { grade: "", sections: "A-D", issuedDate: "", assessmentNo: 1, status: "Completed", remarks: "Nil" },
    columns: [
      { key: "grade", label: "Grade", type: "text" },
      { key: "sections", label: "Sections", type: "text" },
      { key: "issuedDate", label: "Issued Date", type: "date" },
      { key: "assessmentNo", label: "Assessment No", type: "number", min: 1 },
      { key: "status", label: "Status", type: "select", options: ["Completed", "Pending"] },
      { key: "remarks", label: "Remarks / Justification", type: "text" },
    ],
  },
  eventRows: {
    label: "Annual event / participation",
    hint: "External events, competitions, and activities.",
    empty: { name: "", description: "", date: "", involvement: "Participation", studentCount: 0, status: "Completed", remarks: "" },
    columns: [
      { key: "name", label: "Event Name", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "date", label: "Date", type: "date" },
      { key: "involvement", label: "School Involvement", type: "text" },
      { key: "studentCount", label: "Student Count", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["Completed", "Upcoming"] },
      { key: "remarks", label: "Remarks / Justification", type: "textarea" },
    ],
  },
  expoRows: {
    label: "Expo / competitions participation",
    hint: "Larger showcase events with reviews from school management.",
    empty: { name: "", date: "", grades: "V TO VIII", projects: "", projectCount: 0, status: "Participated", review: "", remarks: "" },
    columns: [
      { key: "name", label: "Expo Name", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "grades", label: "Grades Involved", type: "text" },
      { key: "projects", label: "Projects Involved", type: "textarea" },
      { key: "projectCount", label: "Project Count", type: "number" },
      { key: "status", label: "Status", type: "text" },
      { key: "review", label: "Reviews from School Management", type: "textarea" },
      { key: "remarks", label: "Remarks / Justification", type: "textarea" },
    ],
  },
  facultyObservationRows: {
    label: "Faculty observations & resolutions",
    hint: "Observations logged for this school's faculty.",
    empty: { observationDate: "", issueNoted: "Nil", resolutionTaken: "Nil", nextReviewDate: "", status: "Closed", remarks: "" },
    columns: [
      { key: "observationDate", label: "Observation Date", type: "date" },
      { key: "issueNoted", label: "Issue Noted", type: "text" },
      { key: "resolutionTaken", label: "Resolution Taken", type: "text" },
      { key: "nextReviewDate", label: "Next Review Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Open", "Closed"] },
      { key: "remarks", label: "Remarks / Justification", type: "textarea" },
    ],
  },
  workAccomplishmentRows: {
    label: "Annual work accomplishment report",
    hint: "Year-end report: academic year, submission date, prepared by, status, link.",
    empty: { academicYear: "2026-2027", date: "", preparedBy: "", status: "Pending", link: "" },
    columns: [
      { key: "academicYear", label: "Academic Year", type: "text" },
      { key: "date", label: "Submission Date", type: "date" },
      { key: "preparedBy", label: "Prepared By", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Completed", "Submitted", "Pending"] },
      { key: "link", label: "Link URL", type: "text" },
    ],
  },
  // NEW — Faculty Profile list sections. Each mirrors one repeating part of
  // the faculty card (see FacultyProfileTab below, which renders these five
  // EditableTables together with the scalar form). Field NAMES here match
  // what's printed on the faculty profile image (Stat Label / Value,
  // Skill / Percent, checklist Item, tool Name, strength Label), per the
  // request to keep the admin-facing field names matching the source image.
  facultyStatsRows: {
    label: "Faculty Profile — Stats",
    hint: "The stat cards under the faculty photo (e.g. \"Years of Experience\" → \"3+\"). The icon is chosen automatically from the label text.",
    empty: { label: "", value: "" },
    columns: [
      { key: "label", label: "Stat Label", type: "text" },
      { key: "value", label: "Value", type: "text" },
    ],
  },
  facultyExpertiseRows: {
    label: "Faculty Profile — Expertise",
    hint: "The skill bars in the Expertise panel. Percent should be 0–100.",
    empty: { skill: "", percent: 80 },
    columns: [
      { key: "skill", label: "Skill", type: "text" },
      { key: "percent", label: "Percent", type: "number", min: 0 },
    ],
  },
  facultyTeachingRows: {
    label: "Faculty Profile — Teaching Expertise",
    hint: "Checklist items in the Teaching Expertise panel, one per row (e.g. \"Grades Handled: 4 to 12\").",
    empty: { item: "" },
    columns: [{ key: "item", label: "Item", type: "text" }],
  },
  facultyToolsRows: {
    label: "Faculty Profile — Tools & Technologies",
    hint: "Tools shown in the Tools & Technologies grid. The icon is chosen automatically from the tool name.",
    empty: { name: "" },
    columns: [{ key: "name", label: "Tool / Technology Name", type: "text" }],
  },
  facultyStrengthsRows: {
    label: "Faculty Profile — Key Strengths",
    hint: "Strength cards shown in the Key Strengths grid.",
    empty: { label: "" },
    columns: [{ key: "label", label: "Strength", type: "text" }],
  },
};

const KITS_EXAMPLE = `{
  "KIT BOX 5 TO 8": [
    { "component": "LED", "box1": "10", "box2": "10", "box3": "10", "box4": "10", "box5": "10", "damaged": "10", "total": "40" }
  ]
}`;

// ACCESS: keys used to remember where the admin was, per browser tab.
const LAST_SCHOOL_KEY = "aeds:lastSchoolId";
const LAST_TAB_KEY = "aeds:lastTab";

// ─── PHASE 1: crash-recovery drafts + stable media row IDs ─────────────────

// Per-school sessionStorage slot for the unsaved-edits draft. sessionStorage
// on purpose (matching the session-memory keys above): per browser tab,
// survives reload/crash, gone when the tab closes — two tabs never fight
// over one draft.
const draftKey = (schoolId) => `aeds:draft:${schoolId}`;

// Stable per-row id for tables that need one (media rows — uploaded photos
// attach to rows by this id, never by array position). crypto.randomUUID
// needs a secure context; the fallback covers plain-http dev setups.
const newRowId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// ─── VALIDATION & CALENDAR-DATE HELPERS ─────────────────────────────────────
//
// Number rules (checked live in every numeric cell AND re-swept at save):
//   • type:"number" columns store real numbers → whole number, not below
//     the column's `min` (0 unless the column says otherwise).
//   • type:"qty" columns keep their legacy STRING storage → whole number,
//     blank, or NIL.
// Dates: every date column/field is a native calendar picker storing ISO
// YYYY-MM-DD. Existing values in other formats are converted for display
// (day-first for slash/dash dates, per Indian convention); a value the
// parser can't read (e.g. "Nil") is left untouched in the data and shown
// as an amber note beside the empty picker until a real date is chosen.

const pad2 = (n) => String(n).padStart(2, "0");

// → "YYYY-MM-DD" | "" (empty) | null (unrecognisable — keep the raw value)
function toISODate(value) {
  if (value == null) return "";
  const v = String(value).trim();
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const dmy = v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/); // 12/06/2026, 12-06-2026 — day first
  if (dmy) {
    const d = +dmy[1], mo = +dmy[2], y = +dmy[3];
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${y}-${pad2(mo)}-${pad2(d)}`;
    return null;
  }
  const t = Date.parse(v); // month-name formats: "12 Jun 2026", "Jun 12, 2026"
  if (!Number.isNaN(t)) {
    const dt = new Date(t);
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
  }
  return null;
}

function numberProblem(value, min = 0) {
  if (value == null || value === "") return null; // blank allowed (treated as 0)
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "Enter a number";
  if (!Number.isInteger(n)) return "Whole numbers only";
  if (n < min) return `Must be ${min} or more`;
  return null;
}

function qtyProblem(value) {
  const t = String(value ?? "").trim();
  if (!t || /^nil$/i.test(t)) return null;
  if (!/^\d+$/.test(t)) return "Whole number or NIL";
  return null;
}

// Calendar picker that tolerates legacy free-text dates (see note above).
function DateInput({ value, onChange, ...rest }) {
  const noteId = useId();
  const iso = toISODate(value);
  const unrecognised = iso === null;
  return (
    <>
      <input
        type="date"
        value={iso || ""}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={unrecognised ? noteId : undefined}
        {...rest}
      />
      {unrecognised && (
        <span className="date-note" id={noteId}>
          Saved as “{String(value)}” — pick a date to replace it
        </span>
      )}
    </>
  );
}

// Table cell for type:"number" columns — flags problems as you type, with
// the message tied to the input (aria-invalid + aria-describedby).
function NumberCellInput({ label, value, min = 0, onChange }) {
  const errId = useId();
  const problem = numberProblem(value, min);
  return (
    <>
      <input
        type="number"
        min={min}
        step={1}
        inputMode="numeric"
        aria-label={label}
        aria-invalid={problem ? "true" : undefined}
        aria-describedby={problem ? errId : undefined}
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {problem && <span className="cell-error" id={errId} role="alert">{problem}</span>}
    </>
  );
}

// Table cell for type:"qty" columns — legacy string quantities ("10" / "NIL").
function QtyCellInput({ label, value, onChange }) {
  const errId = useId();
  const problem = qtyProblem(value);
  return (
    <>
      <input
        type="text"
        aria-label={label}
        placeholder="0 or NIL"
        aria-invalid={problem ? "true" : undefined}
        aria-describedby={problem ? errId : undefined}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {problem && <span className="cell-error" id={errId} role="alert">{problem}</span>}
    </>
  );
}

// Every numeric column, per tab — built once from TABLES, reused by the
// save-time sweep below.
const NUMBER_RULES = {};
for (const [ruleTabId, ruleDef] of Object.entries(TABLES)) {
  const cols = ruleDef.columns.filter((c) => c.type === "number" || c.type === "qty");
  if (cols.length > 0) NUMBER_RULES[ruleTabId] = cols;
}

// Save-time sweep: same rules as the live cell checks, across the WHOLE
// school — catches invalid values sitting on tabs that aren't open.
function collectNumberIssues(school) {
  const issues = [];
  const overviewProblem = numberProblem(school?.totalStudents);
  if (overviewProblem) {
    issues.push({ tab: "overview", tabLabel: "Overview", row: null, label: "Total student count", message: overviewProblem });
  }
  for (const [tabId, cols] of Object.entries(NUMBER_RULES)) {
    const rows = school?.[tabId];
    if (!Array.isArray(rows)) continue;
    rows.forEach((row, i) => {
      for (const c of cols) {
        const problem = c.type === "qty" ? qtyProblem(row[c.key]) : numberProblem(row[c.key], c.min ?? 0);
        if (problem) {
          issues.push({ tab: tabId, tabLabel: TABLES[tabId].label, row: i + 1, label: c.label, message: problem });
        }
      }
    });
  }
  return issues;
}

// ─── GENERIC EDITABLE TABLE ─────────────────────────────────────────────────

function EditableTable({ def, rows, onChange }) {
  const safeRows = rows || [];

  // A11Y: after "+ Add row", focus jumps into the new row's first field;
  // after removing a row, focus lands back on "+ Add row" instead of
  // being dropped on <body> (which strands keyboard and screen-reader
  // users mid-table).
  const wrapRef = useRef(null);
  const addBtnRef = useRef(null);
  const pendingFocusRef = useRef(null); // "new-row" | "add-btn" | null

  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    pendingFocusRef.current = null;
    if (pending === "new-row") {
      wrapRef.current
        ?.querySelector("tbody tr:last-child input, tbody tr:last-child select, tbody tr:last-child textarea")
        ?.focus();
    } else if (pending === "add-btn") {
      addBtnRef.current?.focus();
    }
  }, [safeRows.length]);

  const addRow = () => {
    pendingFocusRef.current = "new-row";
    const fresh = { ...def.empty };
    if (def.stampRowId) fresh.rowId = newRowId(); // PHASE 1
    onChange([...safeRows, fresh]);
  };
  const removeRow = (i) => {
    pendingFocusRef.current = "add-btn";
    onChange(safeRows.filter((_, idx) => idx !== i));
  };
  const updateCell = (i, key, value) => {
    const next = safeRows.slice();
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };

  return (
    <div>
      <div className="table-hint">{def.hint}</div>
      <div className="etable-wrap" ref={wrapRef}>
        <table className="etable">
          <caption className="sr-only">{def.label}</caption>
          <thead>
            <tr>
              {def.columns.map((c) => (
                <th key={c.key} scope="col">{c.label}</th>
              ))}
              <th scope="col"><span className="sr-only">Remove row</span></th>
            </tr>
          </thead>
          <tbody>
            {safeRows.length === 0 && (
              <tr>
                <td colSpan={def.columns.length + 1} className="etable-empty">
                  No rows yet — click "Add row" to start.
                </td>
              </tr>
            )}
            {safeRows.map((row, i) => (
              <tr key={i}>
                {def.columns.map((c) => (
                  <td key={c.key}>
                    {c.type === "select" && c.options[0] === true ? (
                      <select
                        aria-label={`${c.label}, row ${i + 1}`}
                        value={row[c.key] ? "true" : "false"}
                        onChange={(e) => updateCell(i, c.key, e.target.value === "true")}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : c.type === "select" ? (
                      <select aria-label={`${c.label}, row ${i + 1}`} value={row[c.key] ?? ""} onChange={(e) => updateCell(i, c.key, e.target.value)}>
                        {c.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : c.type === "textarea" ? (
                      <textarea
                        aria-label={`${c.label}, row ${i + 1}`}
                        rows={2}
                        value={row[c.key] ?? ""}
                        onChange={(e) => updateCell(i, c.key, e.target.value)}
                      />
                    ) : c.type === "tags" ? (
                      <input
                        type="text"
                        aria-label={`${c.label}, row ${i + 1}`}
                        placeholder="5A, 5B, 6C"
                        value={(row[c.key] || []).join(", ")}
                        onChange={(e) =>
                          updateCell(
                            i,
                            c.key,
                            e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                          )
                        }
                      />
                    ) : c.type === "number" ? (
                      <NumberCellInput
                        label={`${c.label}, row ${i + 1}`}
                        value={row[c.key]}
                        min={c.min ?? 0}
                        onChange={(v) => updateCell(i, c.key, v)}
                      />
                    ) : c.type === "qty" ? (
                      <QtyCellInput
                        label={`${c.label}, row ${i + 1}`}
                        value={row[c.key]}
                        onChange={(v) => updateCell(i, c.key, v)}
                      />
                    ) : c.type === "date" ? (
                      <DateInput
                        aria-label={`${c.label}, row ${i + 1}`}
                        value={row[c.key]}
                        onChange={(v) => updateCell(i, c.key, v)}
                      />
                    ) : (
                      <input
                        type="text"
                        aria-label={`${c.label}, row ${i + 1}`}
                        value={row[c.key] ?? ""}
                        onChange={(e) => updateCell(i, c.key, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td>
                  <button className="row-del" onClick={() => removeRow(i)} aria-label={`Remove row ${i + 1}`} title="Remove row">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="add-row-btn" ref={addBtnRef} onClick={addRow}>
        + Add row
      </button>
    </div>
  );
}

// ─── MEDIA PHOTOS — real file upload, per media row ─────────────────────────

function MediaPhotosCell({ school, rowIndex, dirty, onSchoolUpdated, flashToast }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const row = school.mediaRows?.[rowIndex] || {};
  const files = row.files || [];

  const handleUpload = async (e) => {
    const picked = e.target.files;
    e.target.value = "";
    if (!picked || picked.length === 0) return;
    setBusy(true);
    setError("");
    try {
      // PHASE 1: rowId is the real address; rowIndex rides along only as a
      // fallback for rows saved before the rowId migration ran.
      const res = await uploadMediaPhotos(school._id, { rowId: row.rowId, rowIndex }, picked);
      onSchoolUpdated(res.data);
      flashToast("Photos uploaded");
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm("Remove this photo? This cannot be undone.")) return;
    try {
      const res = await deleteMediaPhoto(school._id, { rowId: row.rowId, rowIndex }, filename);
      onSchoolUpdated(res.data);
      flashToast("Photo removed");
    } catch (err) {
      flashToast(err.message || "Delete failed");
    }
  };

  return (
    <div className="media-photos-cell">
      {files.length > 0 && (
        <div className="media-thumb-strip">
          {files.map((f) => (
            <div className="media-thumb" key={f.filename}>
              <img src={`${BASE_URL}${f.url}`} alt={f.originalName || "Uploaded photo"} />
              <button
                className="media-thumb-del"
                onClick={() => handleDelete(f.filename)}
                aria-label={`Remove photo ${f.originalName || f.filename}`}
                title="Remove photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      {dirty ? (
        <div className="media-upload-hint" role="note">Save changes above first, then come back to upload photos to this row.</div>
      ) : (
        <label className="btn-ghost-sm media-upload-btn">
          {busy ? "Uploading…" : "+ Add photos"}
          <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={busy} aria-label={`Add photos to ${row.month || `row ${rowIndex + 1}`}`} />
        </label>
      )}
      {error && <div className="json-error" role="alert" style={{ marginTop: 6 }}>{error}</div>}
    </div>
  );
}

function MediaRowsSection({ school, dirty, update, onSchoolUpdated, flashToast }) {
  const def = TABLES.mediaRows;
  const rows = school.mediaRows || [];

  return (
    <div>
      <EditableTable def={def} rows={rows} onChange={(next) => update({ ...school, mediaRows: next })} />

      <h3 className="subhead">Uploaded photos, by month</h3>
      <div className="table-hint">
        Actual photo files live here, attached to the matching row above. New rows must
        be saved (click "Save changes" at the top) before photos can be attached to them.
      </div>

      {rows.length === 0 ? (
        <div className="etable-empty" style={{ border: "1px dashed #e2e8f0", borderRadius: 10, padding: 20 }}>
          Add a row above first, then upload its photos here.
        </div>
      ) : (
        rows.map((row, i) => (
          <div className="media-photo-row" key={row.rowId || i}>
            <div className="media-photo-row-label">{row.month || `Row ${i + 1}`}</div>
            <MediaPhotosCell
              school={school}
              rowIndex={i}
              dirty={dirty}
              onSchoolUpdated={onSchoolUpdated}
              flashToast={flashToast}
            />
          </div>
        ))
      )}
    </div>
  );
}

// ─── JSON EDITOR (for deeply nested sections) ───────────────────────────────

function JsonEditor({ hint, value, onChange, example }) {
  const [text, setText] = useState(JSON.stringify(value || {}, null, 2));
  const [error, setError] = useState("");
  const [showExample, setShowExample] = useState(false);

  useEffect(() => {
    setText(JSON.stringify(value || {}, null, 2));
    setError("");
  }, [value]);

  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setError("");
    } catch (e) {
      setError("Invalid JSON: " + e.message);
    }
  };

  return (
    <div>
      <div className="table-hint">{hint}</div>
      <textarea className="json-box" aria-label="JSON editor" aria-invalid={error ? "true" : undefined} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      <div className="json-actions">
        <button className="btn-primary-sm" onClick={apply}>
          Apply JSON
        </button>
        <button className="btn-ghost-sm" onClick={() => setShowExample((s) => !s)} aria-expanded={showExample}>
          {showExample ? "Hide example" : "Show example structure"}
        </button>
        {error && <span className="json-error" role="alert">{error}</span>}
      </div>
      {showExample && <pre className="json-example">{example}</pre>}
    </div>
  );
}

// ─── SECTION: BASIC INFO ────────────────────────────────────────────────────

// A11Y: optional `error` is announced WITH the field — aria-invalid flags
// the input and aria-describedby ties the message to it, so a screen
// reader reads "School name, invalid entry, School name cannot be empty"
// instead of the error being a disconnected div somewhere below the grid.
// VALIDATION: numeric fields also self-check (whole number, not below
// `min`) so a bad value is flagged as it's typed, not only when the save
// bounces. type="date" renders the shared calendar picker.
function TextField({ label, value, onChange, type = "text", error, min = 0 }) {
  const errorId = useId();
  const autoError = type === "number" ? numberProblem(value, min) : null;
  const shownError = error || autoError;
  const a11y = shownError ? { "aria-invalid": "true", "aria-describedby": errorId } : {};
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {type === "textarea" ? (
        <textarea rows={2} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...a11y} />
      ) : type === "date" ? (
        <DateInput value={value} onChange={onChange} {...a11y} />
      ) : (
        <input
          type={type}
          {...(type === "number" ? { min, step: 1, inputMode: "numeric" } : {})}
          value={value ?? ""}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          {...a11y}
        />
      )}
      {shownError && (
        <span className="json-error" id={errorId} role="alert">
          {shownError}
        </span>
      )}
    </label>
  );
}

function resolveLogoSrc(logo) {
  if (!logo) return "";
  return logo.startsWith("/uploads/") ? `${BASE_URL}${logo}` : logo;
}

// FIX: LogoEditor takes `dirty` and mirrors MediaPhotosCell's guard —
// the upload/remove controls (both of which save to the server IMMEDIATELY,
// unlike every other field on this form) are replaced with a "save first"
// hint whenever there are unsaved edits elsewhere on the page. Without this,
// uploading or removing a logo mid-edit would call onSchoolUpdated(), which
// replaces the entire local `school` object with the server's copy — silently
// wiping out any unsaved edits in other fields.
function LogoEditor({ school, update, onSchoolUpdated, flashToast, dirty }) {
  const [urlText, setUrlText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // Defensive guard — the upload control itself is hidden while dirty,
    // but this keeps the immediate-save path from ever running on stale
    // local state even if that changes later.
    if (dirty) return;
    setBusy(true);
    setError("");
    try {
      const res = await uploadSchoolLogo(school._id, file);
      onSchoolUpdated(res.data);
      flashToast("Logo uploaded");
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (dirty) return; // defensive guard — button is hidden while dirty
    if (!window.confirm("Remove this logo? This cannot be undone.")) return;
    try {
      const res = await deleteSchoolLogo(school._id);
      onSchoolUpdated(res.data);
      flashToast("Logo removed");
    } catch (err) {
      flashToast(err.message || "Failed to remove logo");
    }
  };

  const applyUrl = () => {
    const v = urlText.trim();
    if (!v) return;
    update({ ...school, logo: v });
    setUrlText("");
    setError("");
  };

  const logoSrc = resolveLogoSrc(school.logo);

  return (
    <div className="logo-row">
      {logoSrc ? (
        <img className="logo-preview" src={logoSrc} alt="School logo preview" onError={() => setError("The current logo failed to load — replace it below.")} />
      ) : (
        <div className="logo-preview logo-none">No logo</div>
      )}
      <div className="logo-controls">
        {dirty ? (
          <div className="media-upload-hint" role="note">
            Save changes above first, then come back to upload or remove the logo.
          </div>
        ) : (
          <div className="logo-btn-row">
            <label className="btn-primary-sm logo-upload">
              {busy ? "Uploading…" : school.logo ? "Replace image" : "Upload image"}
              <input type="file" accept="image/*" onChange={handleFile} disabled={busy} aria-label="Upload school logo" />
            </label>
            {school.logo && (
              <button className="btn-ghost-sm" onClick={handleRemove}>Remove logo</button>
            )}
          </div>
        )}
        <div className="logo-url-row">
          <input
            type="text"
            aria-label="Logo image URL"
            placeholder="…or paste an image URL (https://…)"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyUrl()}
          />
          <button className="btn-ghost-sm" onClick={applyUrl} disabled={!urlText.trim()}>Use URL</button>
        </div>
        <div className="table-hint" style={{ margin: "8px 0 0" }}>
          Uploaded images save immediately to the server. Pasting a URL instead stays in this form until you click
          "Save changes" above. If no logo is set, the school's initials are shown instead.
        </div>
        {error && <div className="json-error" role="alert" style={{ marginTop: 6 }}>{error}</div>}
      </div>
    </div>
  );
}

// ─── FACULTY PHOTO EDITOR — same pattern as LogoEditor, writes to
// school.facultyProfile.photo via uploadFacultyPhoto / deleteFacultyPhoto.
function FacultyPhotoEditor({ school, update, onSchoolUpdated, flashToast, dirty }) {
  const [urlText, setUrlText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fp = school.facultyProfile || {};

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (dirty) return;
    setBusy(true);
    setError("");
    try {
      const res = await uploadFacultyPhoto(school._id, file);
      onSchoolUpdated(res.data);
      flashToast("Faculty photo uploaded");
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (dirty) return;
    if (!window.confirm("Remove this photo? This cannot be undone.")) return;
    try {
      const res = await deleteFacultyPhoto(school._id);
      onSchoolUpdated(res.data);
      flashToast("Faculty photo removed");
    } catch (err) {
      flashToast(err.message || "Failed to remove photo");
    }
  };

  const applyUrl = () => {
    const v = urlText.trim();
    if (!v) return;
    update({ ...school, facultyProfile: { ...fp, photo: v } });
    setUrlText("");
    setError("");
  };

  const photoSrc = resolveLogoSrc(fp.photo);

  return (
    <div className="logo-row">
      {photoSrc ? (
        <img className="logo-preview" style={{ borderRadius: "50%" }} src={photoSrc} alt="Faculty photo preview" onError={() => setError("The current photo failed to load — replace it below.")} />
      ) : (
        <div className="logo-preview logo-none" style={{ borderRadius: "50%" }}>No photo</div>
      )}
      <div className="logo-controls">
        {dirty ? (
          <div className="media-upload-hint" role="note">
            Save changes above first, then come back to upload or remove the photo.
          </div>
        ) : (
          <div className="logo-btn-row">
            <label className="btn-primary-sm logo-upload">
              {busy ? "Uploading…" : fp.photo ? "Replace image" : "Upload image"}
              <input type="file" accept="image/*" onChange={handleFile} disabled={busy} aria-label="Upload faculty photo" />
            </label>
            {fp.photo && (
              <button className="btn-ghost-sm" onClick={handleRemove}>Remove photo</button>
            )}
          </div>
        )}
        <div className="logo-url-row">
          <input
            type="text"
            aria-label="Faculty photo URL"
            placeholder="…or paste an image URL (https://…)"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyUrl()}
          />
          <button className="btn-ghost-sm" onClick={applyUrl} disabled={!urlText.trim()}>Use URL</button>
        </div>
        <div className="table-hint" style={{ margin: "8px 0 0" }}>
          Uploaded images save immediately to the server. Pasting a URL instead stays in this form until you click
          "Save changes" above. If no photo is set, the faculty member's initials are shown instead.
        </div>
        {error && <div className="json-error" role="alert" style={{ marginTop: 6 }}>{error}</div>}
      </div>
    </div>
  );
}

// ─── SIGNATURE IMAGE EDITOR — same pattern as FacultyPhotoEditor, writes to
// school.facultyProfile.signaturePhoto via uploadSignaturePhoto /
// deleteSignaturePhoto. Shown as a small preview rather than a circular
// photo, since a signature isn't a headshot.
function SignaturePhotoEditor({ school, update, onSchoolUpdated, flashToast, dirty }) {
  const [urlText, setUrlText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fp = school.facultyProfile || {};

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (dirty) return;
    setBusy(true);
    setError("");
    try {
      const res = await uploadSignaturePhoto(school._id, file);
      onSchoolUpdated(res.data);
      flashToast("Signature image uploaded");
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (dirty) return;
    if (!window.confirm("Remove this signature image? This cannot be undone.")) return;
    try {
      const res = await deleteSignaturePhoto(school._id);
      onSchoolUpdated(res.data);
      flashToast("Signature image removed");
    } catch (err) {
      flashToast(err.message || "Failed to remove signature image");
    }
  };

  const applyUrl = () => {
    const v = urlText.trim();
    if (!v) return;
    update({ ...school, facultyProfile: { ...fp, signaturePhoto: v } });
    setUrlText("");
    setError("");
  };

  const sigSrc = resolveLogoSrc(fp.signaturePhoto);

  return (
    <div className="logo-row">
      {sigSrc ? (
        <img
          className="logo-preview"
          style={{ objectFit: "contain", background: "#fff" }}
          src={sigSrc}
          alt="Signature preview"
          onError={() => setError("The current signature image failed to load — replace it below.")}
        />
      ) : (
        <div className="logo-preview logo-none">No signature</div>
      )}
      <div className="logo-controls">
        {dirty ? (
          <div className="media-upload-hint" role="note">
            Save changes above first, then come back to upload or remove the signature image.
          </div>
        ) : (
          <div className="logo-btn-row">
            <label className="btn-primary-sm logo-upload">
              {busy ? "Uploading…" : fp.signaturePhoto ? "Replace image" : "Upload image"}
              <input type="file" accept="image/*" onChange={handleFile} disabled={busy} aria-label="Upload signature image" />
            </label>
            {fp.signaturePhoto && (
              <button className="btn-ghost-sm" onClick={handleRemove}>Remove signature</button>
            )}
          </div>
        )}
        <div className="logo-url-row">
          <input
            type="text"
            aria-label="Signature image URL"
            placeholder="…or paste an image URL (https://…)"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyUrl()}
          />
          <button className="btn-ghost-sm" onClick={applyUrl} disabled={!urlText.trim()}>Use URL</button>
        </div>
        <div className="table-hint" style={{ margin: "8px 0 0" }}>
          A transparent-background PNG (or SVG) of the signature works best — it's shown on a small white card in
          the dashboard footer so it stays legible over the dark background either way. If no image is set, the
          signatory's name is shown in a styled script instead.
        </div>
        {error && <div className="json-error" role="alert" style={{ marginTop: 6 }}>{error}</div>}
      </div>
    </div>
  );
}

function SectionToggles({ school, update }) {
  const enabled = school.enabledSections || {};

  const toggle = (key, checked) => {
    update({ ...school, enabledSections: { ...enabled, [key]: checked } });
  };

  const setAll = (checked) => {
    const next = {};
    SECTION_TOGGLES.forEach((s) => { next[s.key] = checked; });
    update({ ...school, enabledSections: { ...enabled, ...next } });
  };

  return (
    <div>
      <div className="table-hint" style={{ marginBottom: 10 }}>
        Tick a sheet to open its tab(s) above for data entry and show it on this school's dashboard. Untick a sheet
        that doesn't apply to this school — its tab(s) disappear from here and the section disappears from the
        dashboard. (Nothing is deleted — re-tick any time to bring it back.)
      </div>
      <div className="table-hint" style={{ marginBottom: 10, color: "#a16207", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px" }}>
        Ticking/unticking here only changes this form — click <strong>Save changes</strong> (top right) to actually
        persist it. And since the dashboard loads a school's data once per session, the school won't see the change
        until they refresh their dashboard (or use the Refresh button there) after you've saved.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" className="btn-ghost-sm" onClick={() => setAll(true)}>Select all</button>
        <button type="button" className="btn-ghost-sm" onClick={() => setAll(false)}>Clear all</button>
      </div>
      <div className="section-toggle-grid">
        {SECTION_TOGGLES.map((s) => {
          const checked = isSectionEnabled(school, s.key);
          return (
            <label className={`section-toggle${checked ? " on" : ""}`} key={s.key}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => toggle(s.key, e.target.checked)}
              />
              <span className="section-toggle-text">
                <span className="section-toggle-label">{s.label}</span>
                <span className="section-toggle-hint">{s.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// FIX: OverviewTab accepts `dirty` and forwards it to LogoEditor.
// CHANGED: the applicability block is now three-way — Workbooks joins
// Worksheets and STEM, since the register marks Workbooks as its own
// { applicable, note } deliverable too (see blankSchool() above).
function OverviewTab({ school, update, onSchoolUpdated, flashToast, fieldErrors, dirty }) {
  const set = (key, val) => update({ ...school, [key]: val });
  const err = (key) => fieldErrors && fieldErrors[key];

  const APPLICABILITY_FIELDS = [
    { key: "workbooks", label: "Workbooks applicable" },
    { key: "worksheets", label: "Worksheets applicable" },
    { key: "stem", label: "STEM kits applicable" },
  ];

  return (
    <div>
      <h3 className="subhead" style={{ marginTop: 0 }}>Sections shown to this school</h3>
      <SectionToggles school={school} update={update} />

      <h3 className="subhead">School logo</h3>
      <LogoEditor school={school} update={update} onSchoolUpdated={onSchoolUpdated} flashToast={flashToast} dirty={dirty} />

      <h3 className="subhead">School details</h3>
      <div className="form-grid">
        <TextField label="School name" value={school.name} onChange={(v) => set("name", v)} error={err("name")} />
        <TextField label="Faculty name" value={school.faculty} onChange={(v) => set("faculty", v)} />
        <TextField label="Academic year" value={school.year} onChange={(v) => set("year", v)} />
        <TextField label="Grades covered" value={school.grades} onChange={(v) => set("grades", v)} />
        <TextField label="Total student count" type="number" value={school.totalStudents} onChange={(v) => set("totalStudents", v)} />
        <TextField label="No. of working days" value={school.workingDays} onChange={(v) => set("workingDays", v)} />
      </div>

      <h3 className="subhead">Register audit trail (AEDS sheet)</h3>
      <div className="form-grid">
        <TextField label="Last updated on" type="date" value={school.lastUpdatedOn} onChange={(v) => set("lastUpdatedOn", v)} />
        <TextField label="Last updated by" value={school.lastUpdatedBy} onChange={(v) => set("lastUpdatedBy", v)} />
        <TextField label="Last reviewed on" type="date" value={school.lastReviewedOn} onChange={(v) => set("lastReviewedOn", v)} />
        <TextField label="Last reviewed by" value={school.lastReviewedBy} onChange={(v) => set("lastReviewedBy", v)} />
      </div>
      {school.updatedAt && (
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 10 }}>
          Last saved: {new Date(school.updatedAt).toLocaleString()}
        </div>
      )}

      <h3 className="subhead">Kits meta (KITS sheet header)</h3>
      <div className="form-grid">
        <TextField
          label="No. of kit boxes (e.g. 10 BOXES)"
          value={school.kitsMeta?.noOfKitBoxes}
          onChange={(v) => update({ ...school, kitsMeta: { ...school.kitsMeta, noOfKitBoxes: v } })}
        />
        <TextField
          label="Issued date"
          value={school.kitsMeta?.issuedDate}
          onChange={(v) => update({ ...school, kitsMeta: { ...school.kitsMeta, issuedDate: v } })}
        />
        <TextField
          label="Refilled date"
          value={school.kitsMeta?.refilledDate}
          onChange={(v) => update({ ...school, kitsMeta: { ...school.kitsMeta, refilledDate: v } })}
        />
        <TextField
          label="Last updated on"
          value={school.kitsMeta?.lastUpdatedOn}
          onChange={(v) => update({ ...school, kitsMeta: { ...school.kitsMeta, lastUpdatedOn: v } })}
        />
      </div>

      <h3 className="subhead">Applicability — Workbooks / Worksheets / STEM</h3>
      <div className="table-hint" style={{ marginBottom: 12 }}>
        Untick a deliverable this school doesn't receive and write why in its note — the dashboard shows that note
        in place of an empty register. This is separate from "Sections shown to this school" above: unticking there
        hides the section entirely; unticking here keeps the section visible and explains why it's empty.
      </div>
      <div className="three-col">
        {APPLICABILITY_FIELDS.map(({ key, label }) => (
          <div className="opt-card" key={key}>
            <label className="check-row">
              <input
                type="checkbox"
                checked={!!school[key]?.applicable}
                onChange={(e) => update({ ...school, [key]: { ...school[key], applicable: e.target.checked } })}
              />
              <span>{label}</span>
            </label>
            <textarea
              rows={3}
              aria-label={`${label} — not-applicable note`}
              placeholder="Note shown when not applicable"
              value={school[key]?.note || ""}
              onChange={(e) => update({ ...school, [key]: { ...school[key], note: e.target.value } })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CREDENTIALS TAB — backed by real accounts ─────────────────────────────

function CredentialsTab({ school, flashToast }) {
  const [existing, setExisting] = useState(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setExisting(undefined);
    adminGetLoginForSchool(school._id)
      .then((data) => {
        if (cancelled) return;
        setExisting(data);
        setEmail(data?.email || "");
      })
      .catch(() => !cancelled && setExisting(null));
    return () => {
      cancelled = true;
    };
  }, [school._id]);

  const handleSave = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Both email and password are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = await adminCreateLogin(school._id, email.trim(), password.trim());
      setExisting(data);
      setPassword("");
      flashToast(existing ? "Login updated" : "Login created");
    } catch (e) {
      setError(e.message || "Failed to save login");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="table-hint">
        This creates a real login account for {school.name}. The school signs in with this email and
        password at <code>/portal/login</code> and sees only their own data — this is real authentication,
        not a storage-level gate.
      </div>

      {existing === undefined && <div style={{ fontSize: 13, color: "#64748b" }} role="status">Checking existing login…</div>}
      {existing && (
        <div role="status" style={{ fontSize: 13, color: "#15803d", marginBottom: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 12px" }}>
          Active login exists for <strong>{existing.email}</strong>. Saving below will reset its password.
        </div>
      )}
      {existing === null && (
        <div role="status" style={{ fontSize: 13, color: "#a16207", marginBottom: 14, background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px" }}>
          No login exists yet for this school — create one below.
        </div>
      )}

      <div className="form-grid">
        <TextField label="Login email" value={email} onChange={setEmail} />
        {/* FIX (kept): masked credential input. */}
        <TextField label={existing ? "New password" : "Password"} type="password" value={password} onChange={setPassword} />
      </div>

      {error && <div role="alert" style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>{error}</div>}

      <button className="btn-primary-sm" style={{ marginTop: 14 }} onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : existing ? "Reset login" : "Create login"}
      </button>
    </div>
  );
}

// ─── FACULTY PROFILE TAB ─────────────────────────────────────────────────
//
// Drives school.facultyProfile (scalar bio/contact/certification fields,
// via a form + FacultyPhotoEditor) plus the five list-shaped sections of
// the card, each rendered with the same generic EditableTable every other
// sheet in this file already uses. Field labels below intentionally match
// what's printed on the source faculty-profile image, per the request to
// keep admin-facing field names aligned with it.
function FacultyProfileTab({ school, update, onSchoolUpdated, flashToast, dirty }) {
  const fp = school.facultyProfile || {};
  const setFp = (key, val) => update({ ...school, facultyProfile: { ...fp, [key]: val } });

  return (
    <div>
      <div className="table-hint">
        This drives the faculty profile card shown on this school's dashboard. Field names below match the source
        profile layout — stat labels, expertise skills, teaching-expertise checklist items, tools & technologies,
        and key strengths are each their own row so they're easy to reorder, add to, or remove.
      </div>

      <h3 className="subhead" style={{ marginTop: 0 }}>Photo</h3>
      <FacultyPhotoEditor school={school} update={update} onSchoolUpdated={onSchoolUpdated} flashToast={flashToast} dirty={dirty} />

      <h3 className="subhead">Identity</h3>
      <div className="form-grid">
        <TextField label="Name" value={fp.name} onChange={(v) => setFp("name", v)} />
        <TextField label="Title / Role (e.g. Senior Research Analyst)" value={fp.title} onChange={(v) => setFp("title", v)} />
      </div>

      <h3 className="subhead">Stats</h3>
      <EditableTable
        def={TABLES.facultyStatsRows}
        rows={school.facultyStatsRows}
        onChange={(rows) => update({ ...school, facultyStatsRows: rows })}
      />

      <h3 className="subhead">Expertise</h3>
      <EditableTable
        def={TABLES.facultyExpertiseRows}
        rows={school.facultyExpertiseRows}
        onChange={(rows) => update({ ...school, facultyExpertiseRows: rows })}
      />

      <h3 className="subhead">Teaching Expertise</h3>
      <EditableTable
        def={TABLES.facultyTeachingRows}
        rows={school.facultyTeachingRows}
        onChange={(rows) => update({ ...school, facultyTeachingRows: rows })}
      />

      <h3 className="subhead">Tools & Technologies</h3>
      <EditableTable
        def={TABLES.facultyToolsRows}
        rows={school.facultyToolsRows}
        onChange={(rows) => update({ ...school, facultyToolsRows: rows })}
      />

      <h3 className="subhead">Key Strengths</h3>
      <EditableTable
        def={TABLES.facultyStrengthsRows}
        rows={school.facultyStrengthsRows}
        onChange={(rows) => update({ ...school, facultyStrengthsRows: rows })}
      />

      <h3 className="subhead">Quote</h3>
      <div className="form-grid">
        <TextField label="Quote" type="textarea" value={fp.quote} onChange={(v) => setFp("quote", v)} />
      </div>

      <h3 className="subhead">Contact</h3>
      <div className="form-grid">
        <TextField label="Phone" value={fp.contactPhone} onChange={(v) => setFp("contactPhone", v)} />
        <TextField label="Email" value={fp.contactEmail} onChange={(v) => setFp("contactEmail", v)} />
        <TextField label="Website" value={fp.contactWebsite} onChange={(v) => setFp("contactWebsite", v)} />
        <TextField label="Location" value={fp.contactLocation} onChange={(v) => setFp("contactLocation", v)} />
      </div>

      <h3 className="subhead">Signatory</h3>
      <div className="form-grid">
        <TextField label="Signatory name (e.g. R. Karthik)" value={fp.signatoryName} onChange={(v) => setFp("signatoryName", v)} />
        <TextField label="Signatory title (e.g. Managing Director)" value={fp.signatoryTitle} onChange={(v) => setFp("signatoryTitle", v)} />
        <TextField label="Signatory company" value={fp.signatoryCompany} onChange={(v) => setFp("signatoryCompany", v)} />
      </div>

      <h3 className="subhead">Signature image</h3>
      <SignaturePhotoEditor school={school} update={update} onSchoolUpdated={onSchoolUpdated} flashToast={flashToast} dirty={dirty} />

      <h3 className="subhead">Certification text</h3>
      <div className="form-grid">
        <TextField label="Top ribbon badge" value={fp.topBadge} onChange={(v) => setFp("topBadge", v)} />
        <TextField label="Bottom seal text" value={fp.bottomSeal} onChange={(v) => setFp("bottomSeal", v)} />
        <TextField label="Footer tagline" value={fp.tagline} onChange={(v) => setFp("tagline", v)} />
      </div>
    </div>
  );
}

// ─── COMPLETION EDITOR — grade-wise activity tracking, no JSON required ────
//
// Drives BOTH the "Workbook Completion" tab (school.workbookCompletionData)
// and the "Worksheet Completion" tab (school.worksheetCompletionData) —
// which field it reads/writes is the `dataKey` prop, everything else is
// identical. The stored shape on the wire, and on the dashboard, is the
// same nested shape either way:
//   { "Grade X": [{ name, sections: [{grade,section,date,status}] }] }
// Each grade's activities are flattened here to one row per (activity,
// section) pair — matching how the source register reads, one row per
// class section — and the Activity cell is a dropdown built from the
// static AEDS_CURRICULUM data, with a "Custom" option for anything not on
// the predefined list.
//
// GRADE / SECTION SPLIT: the register's SECTION column actually carries
// the class ("4A", "4B") — grade and section combined. That's now edited
// as two separate columns here (Grade, Section) rather than one. Legacy
// rows saved before this split only have `section` on the wire —
// nestedToRows() below splits that combined string on read (see
// splitGradeSection), and the split is written back the next time that
// grade's rows are saved via rowsToNested().

// Builds this grade's activity option strings from the static curriculum
// data. Combines "topic — activity" when a topic line exists (Grades 10-12
// in the source data), falls back to whichever of the two is non-empty.
function curriculumOptionsForGrade(grade) {
  const items = AEDS_CURRICULUM[grade];
  if (!items) return [];
  return items
    .map((it) => {
      const topic = (it.topic || "").trim();
      const activity = (it.activity || "").trim();
      if (topic && activity) return `${topic} — ${activity}`;
      return activity || topic || "";
    })
    .filter(Boolean);
}

function naturalGradeSort(a, b) {
  const numA = parseInt((String(a).match(/\d+/) || ["0"])[0], 10);
  const numB = parseInt((String(b).match(/\d+/) || ["0"])[0], 10);
  if (numA !== numB) return numA - numB;
  return String(a).localeCompare(String(b));
}

const CUSTOM_SENTINEL = "__custom__";

// A <select> of predefined options plus a "Custom / type your own…" choice
// that reveals a free-text input. This is the "pick from a list, but allow
// a custom value too" pattern the completion editor needs for its Activity
// cell (and reused below for adding a grade).
function ComboBox({ value, options, onChange, placeholder, selectAriaLabel, inputAriaLabel }) {
  const isCustom = value !== "" && !options.includes(value);

  return (
    <div className="combo-cell">
      <select
        aria-label={selectAriaLabel}
        value={isCustom ? CUSTOM_SENTINEL : value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === CUSTOM_SENTINEL ? (isCustom ? value : "") : v);
        }}
      >
        <option value="">— Select —</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value={CUSTOM_SENTINEL}>✏️ Custom / type your own…</option>
      </select>
      {isCustom && (
        <input
          type="text"
          aria-label={inputAriaLabel}
          className="combo-custom-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// GRADE / SECTION SPLIT: legacy rows stored the class as one combined
// string in `section` ("4A", "4B", or occasionally just "A" with the grade
// implied by which grade-tab it lived under). Split that into { grade,
// section } for display in the two-column editor. Anything that doesn't
// start with digits is kept whole in `section` with an empty `grade`,
// rather than guessing.
function splitGradeSection(raw) {
  const v = String(raw ?? "").trim();
  if (!v) return { grade: "", section: "" };
  const m = v.match(/^(\d+)\s*([A-Za-z].*)?$/);
  return m ? { grade: m[1], section: (m[2] || "").trim() } : { grade: "", section: v };
}

// "Grade 4" / "GRADE 4" → "4" — used to prefill the Grade column from
// whichever grade-tab is currently selected.
const gradeNumber = (g) => (String(g || "").match(/\d+/) || [""])[0];

// Nested storage shape → one flat row per (activity, section) pair, in the
// order they already appear — this is what the table below actually edits.
function nestedToRows(activities) {
  const rows = [];
  (activities || []).forEach((act) => {
    if (act.sections && act.sections.length > 0) {
      act.sections.forEach((sec) => {
        // Rows saved before the grade/section split have no `grade` key at
        // all — derive both columns from the old combined string until
        // this row is next saved, at which point rowsToNested() below
        // writes the split shape back.
        const legacy = sec.grade == null ? splitGradeSection(sec.section) : null;
        rows.push({
          activity: act.name || "",
          grade: sec.grade != null ? sec.grade : legacy.grade,
          section: legacy ? legacy.section : sec.section || "",
          date: sec.date || "",
          status: sec.status || "",
        });
      });
    } else {
      rows.push({ activity: act.name || "", grade: "", section: "", date: "", status: "" });
    }
  });
  return rows;
}

// Flat rows → back to the nested { name, sections: [...] } shape the
// dashboard reads, grouping rows under one activity entry by name.
function rowsToNested(rows) {
  const grouped = [];
  const byName = new Map();
  rows.forEach((r) => {
    const name = (r.activity || "").trim();
    if (!name && !r.grade && !r.section && !r.date && !r.status) return; // skip fully-empty rows
    let group = byName.get(name);
    if (!group) {
      group = { name, sections: [] };
      byName.set(name, group);
      grouped.push(group);
    }
    group.sections.push({ grade: r.grade || "", section: r.section || "", date: r.date || "", status: r.status || "" });
  });
  return grouped;
}

// CHANGED — was WorkbookCompletionEditor, hard-coded to
// school.workbookCompletionData. Now takes `dataKey` + `label` so the exact
// same editor drives both the Workbook Completion and Worksheet Completion
// tabs; only the field name it reads/writes differs.
function CompletionEditor({ school, update, dataKey, label }) {
  const data = school[dataKey] || {};
  const gradeNames = useMemo(() => Object.keys(data).sort(naturalGradeSort), [data]);
  const curriculumGradeNames = useMemo(() => Object.keys(AEDS_CURRICULUM).sort(naturalGradeSort), []);

  const [selectedGrade, setSelectedGrade] = useState(() => gradeNames[0] || null);
  const [newGradeChoice, setNewGradeChoice] = useState("");
  const [newGradeCustom, setNewGradeCustom] = useState("");

  // Keep a valid selection if the current grade gets deleted, or select the
  // first grade once data shows up (e.g. right after switching schools).
  useEffect(() => {
    if (selectedGrade && gradeNames.includes(selectedGrade)) return;
    setSelectedGrade(gradeNames[0] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeNames.join("|")]);

  // Switching between the Workbook Completion and Worksheet Completion tabs
  // reuses this same mounted component with a different `dataKey` — reset
  // the grade selection when that happens, or the newly-opened tab can land
  // on a grade name that only exists in the OTHER field's data.
  useEffect(() => {
    setSelectedGrade(Object.keys(school[dataKey] || {}).sort(naturalGradeSort)[0] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  const rows = useMemo(
    () => (selectedGrade ? nestedToRows(data[selectedGrade]) : []),
    [data, selectedGrade]
  );

  const activityOptions = useMemo(
    () => (selectedGrade ? curriculumOptionsForGrade(selectedGrade) : []),
    [selectedGrade]
  );

  // Prefills the Grade column of a freshly added row with the number from
  // whichever grade-tab is currently open ("Grade 4" tab → "4"), since
  // that's almost always what the admin means — they can still overwrite
  // it for a mixed-grade entry.
  const defaultGrade = gradeNumber(selectedGrade);

  const setGradeRows = (nextRows) => {
    update({
      ...school,
      [dataKey]: { ...data, [selectedGrade]: rowsToNested(nextRows) },
    });
  };

  const updateRow = (i, patch) => {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    setGradeRows(next);
  };

  const addRow = () => setGradeRows([...rows, { activity: "", grade: defaultGrade, section: "", date: "", status: "" }]);
  const removeRow = (i) => setGradeRows(rows.filter((_, idx) => idx !== i));

  // Adds one blank-section row per curriculum activity for this grade that
  // isn't already used, so the admin isn't picking each activity from the
  // dropdown one at a time.
  const quickFillFromCurriculum = () => {
    const used = new Set(rows.map((r) => r.activity));
    const additions = activityOptions
      .filter((a) => !used.has(a))
      .map((a) => ({ activity: a, grade: defaultGrade, section: "", date: "", status: "" }));
    if (additions.length === 0) return;
    setGradeRows([...rows, ...additions]);
  };

  const addGrade = () => {
    const name = (newGradeChoice === CUSTOM_SENTINEL ? newGradeCustom : newGradeChoice).trim();
    if (!name) return;
    if (!data[name]) {
      update({ ...school, [dataKey]: { ...data, [name]: [] } });
    }
    setSelectedGrade(name);
    setNewGradeChoice("");
    setNewGradeCustom("");
  };

  const removeGrade = (grade) => {
    if (!window.confirm(`Remove all ${label} data for "${grade}"? This cannot be undone.`)) return;
    const next = { ...data };
    delete next[grade];
    update({ ...school, [dataKey]: next });
  };

  const unusedCurriculumGrades = curriculumGradeNames.filter((g) => !gradeNames.includes(g));
  const addDisabled = !newGradeChoice || (newGradeChoice === CUSTOM_SENTINEL && !newGradeCustom.trim());

  return (
    <div>
      <div className="table-hint">
        Grade-wise activity completion — one row per class section, matching how the register sheet reads. Pick the
        Activity from the curriculum list, or choose "Custom / type your own…" to enter one that isn't predefined.
        Grade and Section are separate columns — Grade is prefilled from the grade tab you're on, but you can
        override it for a mixed-grade entry. Add a grade below if this school needs one that isn't already listed.
      </div>

      <div className="wbc-grade-tabs">
        {gradeNames.length === 0 && <span className="wbc-empty-note">No grades added yet — add one below.</span>}
        {gradeNames.map((g) => (
          <button
            key={g}
            type="button"
            className={`wbc-grade-tab${selectedGrade === g ? " active" : ""}`}
            onClick={() => setSelectedGrade(g)}
          >
            {g}
            <span className="wbc-grade-tab-count">
              {(data[g] || []).reduce((a, act) => a + (act.sections?.length || 1), 0)}
            </span>
          </button>
        ))}
      </div>

      <div className="wbc-add-grade">
        <select aria-label="Add a grade" value={newGradeChoice} onChange={(e) => setNewGradeChoice(e.target.value)}>
          <option value="">+ Add a grade…</option>
          {unusedCurriculumGrades.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
          <option value={CUSTOM_SENTINEL}>✏️ Custom grade name…</option>
        </select>
        {newGradeChoice === CUSTOM_SENTINEL && (
          <input
            type="text"
            aria-label="Custom grade name"
            placeholder='e.g. "Grade 10"'
            value={newGradeCustom}
            onChange={(e) => setNewGradeCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGrade()}
          />
        )}
        <button type="button" className="btn-ghost-sm" onClick={addGrade} disabled={addDisabled}>
          Add
        </button>
      </div>

      {selectedGrade && (
        <>
          <h3 className="subhead" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {selectedGrade}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {activityOptions.length > 0 && (
                <button type="button" className="btn-ghost-sm" onClick={quickFillFromCurriculum}>
                  + Add all curriculum activities
                </button>
              )}
              <button type="button" className="btn-ghost-sm" onClick={() => removeGrade(selectedGrade)}>
                Delete grade
              </button>
            </div>
          </h3>

          <div className="etable-wrap">
            <table className="etable">
              <caption className="sr-only">{label} — {selectedGrade}</caption>
              <thead>
                <tr>
                  <th scope="col">Activity Name</th>
                  <th scope="col">Grade</th>
                  <th scope="col">Section</th>
                  <th scope="col">Completion Date</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Remove row</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="etable-empty">No rows yet — click "Add row" to start.</td>
                  </tr>
                )}
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <ComboBox
                        value={row.activity}
                        options={activityOptions}
                        onChange={(v) => updateRow(i, { activity: v })}
                        placeholder="Type activity name"
                        selectAriaLabel={`Activity, row ${i + 1}`}
                        inputAriaLabel={`Custom activity name, row ${i + 1}`}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        aria-label={`Grade, row ${i + 1}`}
                        value={row.grade ?? ""}
                        onChange={(e) => updateRow(i, { grade: e.target.value })}
                        placeholder="4"
                        style={{ minWidth: 70 }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        aria-label={`Section, row ${i + 1}`}
                        value={row.section}
                        onChange={(e) => updateRow(i, { section: e.target.value })}
                        placeholder="A"
                        style={{ minWidth: 70 }}
                      />
                    </td>
                    <td>
                      <DateInput
                        aria-label={`Completion date, row ${i + 1}`}
                        value={row.date}
                        onChange={(v) => updateRow(i, { date: v })}
                      />
                    </td>
                    <td>
                      <select
                        aria-label={`Status, row ${i + 1}`}
                        value={row.status}
                        onChange={(e) => updateRow(i, { status: e.target.value })}
                      >
                        <option value="">—</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="IN PROGRESS">IN PROGRESS</option>
                        <option value="PENDING">PENDING</option>
                        <option value="-">-</option>
                      </select>
                    </td>
                    <td>
                      <button className="row-del" onClick={() => removeRow(i)} aria-label={`Remove row ${i + 1}`} title="Remove row">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="add-row-btn" onClick={addRow}>
            + Add row
          </button>
        </>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

const TAB_LIST = [
  { id: "overview", label: "Overview" },
  { id: "deliverables", label: "Deliverables" },
  { id: "gradeData", label: "Students / Grade" },
  // NEW — Faculty Profile tab, placed right after the overview / basics
  // since it's an identity/bio sheet, not a data-tracking register.
  { id: "facultyProfile", label: "Faculty Profile" },
  { id: "workbookRows", label: "Workbooks" },
  { id: "workbookCompletionData", label: "Workbook Completion" },
  // NEW — the tab that was missing. This is where the register's
  // WORKSHEETS sheet data (Grades 4-9 activity completion) actually goes.
  { id: "worksheetCompletionData", label: "Worksheet Completion" },
  { id: "kitsRows", label: "KITS Inventory" },
  { id: "kitsData", label: "KITS (legacy per-box)" },
  { id: "atalLabRows", label: "Atal Lab Stock" },
  { id: "stemRows", label: "STEM Register" },
  { id: "workdoneRows", label: "Workdone" },
  { id: "mediaRows", label: "Media" },
  { id: "assessmentRows", label: "Assessments" },
  { id: "reportCardRows", label: "Report Cards" },
  { id: "eventRows", label: "Events" },
  { id: "expoRows", label: "Expo" },
  { id: "facultyObservationRows", label: "Faculty Observation" },
  { id: "workAccomplishmentRows", label: "Work Accomplishment" },
  { id: "credentials", label: "Login Credentials" },
  { id: "export", label: "Export / Import" },
];

export default function AdminPanel({ userEmail, onLogout }) {
  const [index, setIndex] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [school, setSchool] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [toast, setToast] = useState("");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveErrorBanner, setSaveErrorBanner] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── School deletion — requires a separate DELETION PASSWORD, checked
  // server-side against SCHOOL_DELETE_PASSWORD (not any admin's login
  // password). See requestDeleteSchool / confirmDeleteSchool below.
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ACCESS: Ctrl+K quick switcher state.
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIdx, setPaletteIdx] = useState(0);
  const paletteInputRef = useRef(null);

  const tabRefs = useRef({});
  const modalInputRef = useRef(null);
  const newModalRef = useRef(null);
  const deletePasswordInputRef = useRef(null);
  const deleteModalRef = useRef(null);
  const paletteRef = useRef(null);
  const sidebarCloseRef = useRef(null);
  const menuBtnRef = useRef(null);
  const saveErrorRef = useRef(null);

  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const savingRef = useRef(saving);
  savingRef.current = saving;
  const schoolRef = useRef(school);
  schoolRef.current = school;

  const flashToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const refreshIndex = useCallback(async () => {
    try {
      const res = await getAllSchools(search ? `?search=${encodeURIComponent(search)}` : "");
      setIndex(res.data || []);
      setLoadError("");
    } catch (e) {
      setLoadError(e.message || "Failed to load schools");
    }
  }, [search]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshIndex();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FIX (kept): skip the debounce effect's first run so the index isn't
  // fetched twice on mount.
  const firstIndexRun = useRef(true);
  useEffect(() => {
    if (firstIndexRun.current) {
      firstIndexRun.current = false;
      return;
    }
    const t = setTimeout(() => refreshIndex(), 250);
    return () => clearTimeout(t);
  }, [refreshIndex]);

  // UX (kept): warn on browser close/refresh with unsaved edits. The Phase 1
  // draft autosave below is the safety net if they leave anyway.
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // PHASE 1 — DRAFT AUTOSAVE (crash recovery): while there are unsaved
  // edits, keep a debounced snapshot of the whole school in sessionStorage.
  // Cleared the moment the school is saved (dirty flips false) or the edits
  // are explicitly discarded. Restore is offered in selectSchool below.
  useEffect(() => {
    if (!school?._id) return;
    if (!dirty) {
      try {
        sessionStorage.removeItem(draftKey(school._id));
      } catch { /* ignore */ }
      return;
    }
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(
          draftKey(school._id),
          JSON.stringify({ savedAt: Date.now(), school })
        );
      } catch { /* quota exceeded / private mode — autosave is best-effort */ }
    }, 800);
    return () => clearTimeout(t);
  }, [school, dirty]);

  const selectSchool = useCallback(async (id, { restoreTab } = {}) => {
    if (dirtyRef.current) {
      if (!window.confirm("You have unsaved changes. Discard them and open the other school?")) {
        return;
      }
      // PHASE 1: the user explicitly discarded — clear the crash-recovery
      // draft too, so they aren't re-offered edits they just threw away.
      if (schoolRef.current?._id) {
        try {
          sessionStorage.removeItem(draftKey(schoolRef.current._id));
        } catch { /* ignore */ }
      }
    }
    setSchoolLoading(true);
    setSidebarOpen(false);
    try {
      const res = await getSchoolById(id);
      const restoreSectionKey = restoreTab ? TAB_TO_SECTION[restoreTab] : null;
      const restoreOk =
        restoreTab &&
        TAB_LIST.some((t) => t.id === restoreTab) &&
        (!restoreSectionKey || isSectionEnabled(res.data, restoreSectionKey));

      // PHASE 1 — DRAFT RESTORE: a crash/reload with unsaved edits leaves a
      // draft in sessionStorage (see the autosave effect). Offer it back
      // before showing the server copy. The draft keeps ITS OWN updatedAt on
      // purpose: if the server copy moved on since the draft was taken, the
      // save will 409 instead of silently overwriting someone else's work.
      let draft = null;
      try {
        const raw = sessionStorage.getItem(draftKey(id));
        if (raw) draft = JSON.parse(raw);
      } catch {
        draft = null;
      }

      if (draft?.school && draft.school._id === id) {
        const when = draft.savedAt
          ? new Date(draft.savedAt).toLocaleString()
          : "an earlier point in this session";
        const restore = window.confirm(
          `Unsaved edits for this school (from ${when}) were found.\n\n` +
            "OK — restore the unsaved edits\n" +
            "Cancel — discard them and load the saved version"
        );
        if (restore) {
          setSchool(draft.school);
          setSelectedId(id);
          setDirty(true);
          setTab(restoreOk ? restoreTab : "overview");
          setFieldErrors({});
          setSaveErrorBanner("");
          return;
        }
        try {
          sessionStorage.removeItem(draftKey(id));
        } catch { /* ignore */ }
      }

      setSchool(res.data);
      setSelectedId(id);
      setDirty(false);
      setTab(restoreOk ? restoreTab : "overview");
      setFieldErrors({});
      setSaveErrorBanner("");
    } catch (e) {
      flashToast(e.message || "Failed to load school");
    } finally {
      setSchoolLoading(false);
    }
  }, []);

  // ACCESS: restore the last opened school + tab after a reload, so the
  // admin lands back where they were instead of on the empty screen.
  // Runs once, only after the index has loaded and only if nothing is
  // selected yet. sessionStorage (not localStorage) on purpose: memory is
  // per browser tab and clears when the tab closes — two tabs editing two
  // schools don't fight over one saved slot.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current || loading || selectedId || index.length === 0) return;
    restoredRef.current = true;
    let lastId = null;
    let lastTab = null;
    try {
      lastId = sessionStorage.getItem(LAST_SCHOOL_KEY);
      lastTab = sessionStorage.getItem(LAST_TAB_KEY);
    } catch {
      /* storage unavailable (private mode etc.) — just skip restore */
    }
    if (lastId && index.some((s) => s._id === lastId)) {
      selectSchool(lastId, { restoreTab: lastTab });
    }
  }, [loading, index, selectedId, selectSchool]);

  // ACCESS: remember selection + tab as they change.
  useEffect(() => {
    try {
      if (selectedId) sessionStorage.setItem(LAST_SCHOOL_KEY, selectedId);
      else sessionStorage.removeItem(LAST_SCHOOL_KEY);
    } catch { /* ignore */ }
  }, [selectedId]);
  useEffect(() => {
    try {
      sessionStorage.setItem(LAST_TAB_KEY, tab);
    } catch { /* ignore */ }
  }, [tab]);

  const update = (next) => {
    setSchool(next);
    setDirty(true);
  };

  const applyServerUpdate = (updatedSchool) => {
    setSchool(updatedSchool);
    setIndex((idx) => idx.map((s) => (s._id === updatedSchool._id ? { _id: updatedSchool._id, name: updatedSchool.name } : s)));
  };

  const handleSave = useCallback(async () => {
    if (!schoolRef.current || savingRef.current || !dirtyRef.current) return;
    const current = schoolRef.current;

    // VALIDATION: sweep every numeric value in the whole school before
    // touching the server. If anything is invalid, block the save, jump to
    // the first offending tab, and put tab · row · column · problem in the
    // error banner (which grabs focus and is announced as an alert).
    const numberIssues = collectNumberIssues(current);
    if (numberIssues.length > 0) {
      const first = numberIssues[0];
      setTab(first.tab);
      const detail = numberIssues
        .slice(0, 4)
        .map((iss) => `${iss.tabLabel}${iss.row ? ` · row ${iss.row}` : ""} · ${iss.label}: ${iss.message}`)
        .join(" · ");
      setSaveErrorBanner(
        `${numberIssues.length} invalid number value${numberIssues.length === 1 ? "" : "s"} — ${detail}${numberIssues.length > 4 ? " · …" : ""}`
      );
      flashToast("Fix the flagged number fields, then save");
      return;
    }

    setSaving(true);
    setFieldErrors({});
    setSaveErrorBanner("");
    try {
      // PHASE 1 note: `current` carries the `updatedAt` this school was
      // loaded with — the server compares it and answers 409 if someone
      // else saved the school in the meantime (handled in the catch below).
      const res = await apiUpdateSchool(current._id, current);
      setSchool(res.data);
      setIndex((idx) => idx.map((s) => (s._id === current._id ? { _id: current._id, name: res.data.name } : s)));
      setDirty(false);
      flashToast("Saved");
    } catch (e) {
      if (e.status === 409) {
        // PHASE 1 — optimistic-concurrency conflict: someone else saved this
        // school after we loaded it. Never overwrite their work silently.
        setSaveErrorBanner(
          e.message ||
            "This school was changed by someone else since you opened it. Copy any edits you need (Export tab), then reload the school and re-apply them."
        );
        flashToast("Save blocked — school changed elsewhere");
      } else if (e.errors && Object.keys(e.errors).length > 0) {
        setFieldErrors(e.errors);
        if (e.errors.name) setTab("overview");
        const detail = Object.entries(e.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(" · ");
        setSaveErrorBanner(detail);
        flashToast("Save failed — see details below");
      } else {
        setSaveErrorBanner(e.message || "Save failed");
        flashToast(e.message || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }, []);

  // ACCESS: global shortcuts — Ctrl+S saves, Ctrl+K opens the switcher.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

  const createSchool = async () => {
    const name = newName.trim() || "New School";
    try {
      const res = await apiCreateSchool({ name });
      setIndex((idx) => [...idx, { _id: res.data._id, name: res.data.name }]);
      setShowNewModal(false);
      setNewName("");
      setSelectedId(res.data._id);
      setSchool(res.data);
      setDirty(false);
      setTab("overview");
      flashToast("School created");
    } catch (e) {
      flashToast(e.message || "Failed to create school");
    }
  };

  // Opens the deletion-password modal instead of deleting directly — the
  // actual delete only fires from confirmDeleteSchool below, once the
  // server has verified the separate deletion password.
  const requestDeleteSchool = (id, name) => {
    setDeleteTarget({ id, name });
    setDeletePassword("");
    setDeleteError("");
  };

  const confirmDeleteSchool = async () => {
    if (!deleteTarget || deleting) return;
    if (!deletePassword.trim()) {
      setDeleteError("Enter the deletion password to confirm.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await apiDeleteSchool(deleteTarget.id, deletePassword);
      setIndex((idx) => idx.filter((s) => s._id !== deleteTarget.id));
      try {
        sessionStorage.removeItem(draftKey(deleteTarget.id)); // PHASE 1
      } catch { /* ignore */ }
      if (selectedId === deleteTarget.id) {
        setSelectedId(null);
        setSchool(null);
      }
      flashToast(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      setDeletePassword("");
    } catch (e) {
      setDeleteError(e.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);

      // FIX (kept): strip cross-school uploaded assets on import.
      const sanitized = { ...parsed };
      if (Array.isArray(sanitized.mediaRows)) {
        // PHASE 1: strip cross-school uploaded photos AND re-stamp fresh
        // rowIds, so an imported row can never carry another school's row
        // identity.
        sanitized.mediaRows = sanitized.mediaRows.map(({ files, ...row }) => ({
          ...row,
          rowId: newRowId(),
        }));
      }
      if (typeof sanitized.logo === "string" && sanitized.logo.startsWith("/uploads/")) {
        sanitized.logo = "";
      }
      // Uploaded faculty photos (and the signature image) are per-school
      // too, same rule as the logo.
      if (sanitized.facultyProfile) {
        const fpPatch = {};
        if (typeof sanitized.facultyProfile.photo === "string" && sanitized.facultyProfile.photo.startsWith("/uploads/")) {
          fpPatch.photo = "";
        }
        if (typeof sanitized.facultyProfile.signaturePhoto === "string" && sanitized.facultyProfile.signaturePhoto.startsWith("/uploads/")) {
          fpPatch.signaturePhoto = "";
        }
        if (Object.keys(fpPatch).length > 0) {
          sanitized.facultyProfile = { ...sanitized.facultyProfile, ...fpPatch };
        }
      }

      const merged = {
        ...blankSchool(sanitized.name || school.name),
        ...sanitized,
        _id: school._id,
      };
      update(merged);
      setImportError("");
      setImportText("");
      flashToast("Imported into form — review, then Save (uploaded photos/logo don't transfer between schools)");
    } catch (e) {
      setImportError("Invalid JSON: " + e.message);
    }
  };

  // Tabs actually shown in the tab strip: everything not gated by a
  // section toggle, plus every toggled tab whose section is enabled for
  // the currently open school. Recomputes whenever the school (or its
  // enabledSections) changes.
  const visibleTabs = useMemo(() => {
    return TAB_LIST.filter((t) => {
      const sectionKey = TAB_TO_SECTION[t.id];
      if (!sectionKey) return true; // not gated — always shown
      return isSectionEnabled(school, sectionKey);
    });
  }, [school]);

  // If the tab currently open gets unticked (or a freshly-loaded school
  // just doesn't have it enabled), fall back to Overview instead of
  // leaving the admin on a tab that no longer has a button in the strip.
  useEffect(() => {
    if (!school) return;
    if (!visibleTabs.some((t) => t.id === tab)) {
      setTab("overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTabs, school]);

  // A11Y (kept): arrow-key navigation for the tab strip — cycles through
  // whatever's currently visible, since hidden (unticked) tabs have no
  // button to land focus on.
  const onTabKeyDown = (e, i) => {
    let target = null;
    if (e.key === "ArrowRight") target = (i + 1) % visibleTabs.length;
    else if (e.key === "ArrowLeft") target = (i - 1 + visibleTabs.length) % visibleTabs.length;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = visibleTabs.length - 1;
    if (target === null) return;
    e.preventDefault();
    const t = visibleTabs[target];
    setTab(t.id);
    tabRefs.current[t.id]?.focus();
  };

  // A11Y: New-school modal — Escape-to-close lives here; initial focus,
  // the Tab trap, and focus restore (back to whichever "+ New school"
  // button opened it, sidebar or empty-state) come from useDialogFocus.
  useEffect(() => {
    if (!showNewModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowNewModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showNewModal]);

  useDialogFocus(showNewModal, newModalRef, modalInputRef);

  // A11Y: deletion-password modal — Escape (and Cancel, and the overlay
  // click) stay blocked while a delete request is in flight. Focus trap +
  // restore come from useDialogFocus. If the school row that opened this
  // modal was just deleted, the hook skips restoring to the removed ✕.
  useEffect(() => {
    if (!deleteTarget) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !deleting) setDeleteTarget(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteTarget, deleting]);

  useDialogFocus(!!deleteTarget, deleteModalRef, deletePasswordInputRef);

  // A11Y: mobile off-canvas sidebar — Escape closes it, focus lands on its
  // Close button when it opens and returns to the ☰ menu button when it
  // closes, so keyboard users aren't stranded behind the backdrop.
  useEffect(() => {
    if (!sidebarOpen) return;
    sidebarCloseRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      menuBtnRef.current?.focus();
    };
  }, [sidebarOpen]);

  // A11Y: a failed save moves focus onto the error banner so it's read out
  // immediately — role="alert" alone is easy to miss when focus sits in a
  // table far below the banner.
  useEffect(() => {
    if (saveErrorBanner) saveErrorRef.current?.focus();
  }, [saveErrorBanner]);

  // ── ACCESS: quick switcher (Ctrl+K) ────────────────────────────────────
  // Searches schools and sections together. Sections only appear when a
  // school is open (there's nowhere to jump otherwise).
  const paletteResults = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    const schools = index
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map((s) => ({ type: "school", id: s._id, label: s.name, sub: "School" }));
    const tabs = school
      ? visibleTabs
          .filter((t) => !q || t.label.toLowerCase().includes(q))
          .slice(0, 6)
          .map((t) => ({ type: "tab", id: t.id, label: t.label, sub: `Section · ${school.name}` }))
      : [];
    // With no query, lead with sections (fast in-school jumps); with a
    // query, lead with schools (cross-school jumps are the harder task).
    return q ? [...schools, ...tabs] : [...tabs, ...schools];
  }, [paletteQuery, index, school, visibleTabs]);

  useEffect(() => {
    setPaletteIdx(0);
  }, [paletteQuery, paletteOpen]);

  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen]);

  useDialogFocus(paletteOpen, paletteRef, paletteInputRef);

  const runPaletteItem = (item) => {
    setPaletteOpen(false);
    setPaletteQuery("");
    if (!item) return;
    if (item.type === "school") selectSchool(item.id);
    else setTab(item.id);
  };

  const onPaletteKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setPaletteIdx((i) => Math.min(i + 1, paletteResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setPaletteIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runPaletteItem(paletteResults[paletteIdx]);
    }
  };

  // ACCESS: per-tab data badge — how many entries each section holds.
  const tabCount = (id) => {
    if (!school) return null;
    const v = school[id];
    if (Array.isArray(v)) return v.length;
    // CHANGED — worksheetCompletionData counts by grade, same as
    // workbookCompletionData / kitsData.
    if (id === "workbookCompletionData" || id === "worksheetCompletionData" || id === "kitsData") {
      return v && typeof v === "object" ? Object.keys(v).length : 0;
    }
    return null; // overview / credentials / export have no row count
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { font-family: 'Inter', sans-serif; background: #f0f4f8; }

        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
        }

        .admin-app button:focus-visible,
        .admin-app input:focus-visible,
        .admin-app select:focus-visible,
        .admin-app textarea:focus-visible,
        .admin-app [tabindex]:focus-visible {
          outline: 2px solid #4f46e5; outline-offset: 2px;
        }
        .a-sidebar button:focus-visible { outline-color: #a5b4fc; }

        .admin-app { display: flex; height: 100vh; overflow: hidden; }

        .a-skip-link {
          position: absolute; left: -9999px; top: 8px; z-index: 300;
          background: #4f46e5; color: #fff; padding: 8px 14px; border-radius: 8px;
          font-size: 13px; font-weight: 600; text-decoration: none;
        }
        .a-skip-link:focus { left: 8px; }

        .a-sidebar { width: 260px; flex-shrink: 0; background: #0f172a; display: flex; flex-direction: column; height: 100vh; }
        .a-sidebar-head { padding: 18px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .a-sidebar-title { font-size: 14px; font-weight: 700; color: #f1f5f9; }
        .a-sidebar-sub { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }  /* A11Y: was 3.7:1 on the dark rail */
        .a-search { margin: 12px 14px 6px; }
        .a-search input {
          width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 7px 10px; font-size: 12.5px; color: #e2e8f0; outline: none;
        }
        .a-search input::placeholder { color: #64748b; }
        .a-school-list { flex: 1; overflow-y: auto; padding: 6px 10px; }
        /* A11Y: each row is a plain flex wrapper holding two REAL sibling
           buttons (open + delete) — replaces the old nested role="button"
           span inside a button, which is invalid ARIA. */
        .a-school-item {
          display: flex; align-items: center; gap: 2px;
          border-radius: 8px; margin-bottom: 2px; color: #94a3b8;
        }
        .a-school-item:hover, .a-school-item:focus-within { background: rgba(255,255,255,0.06); color: #cbd5e1; }
        .a-school-item.active { background: rgba(99,102,241,0.18); color: #a5b4fc; }
        .a-school-item-btn {
          flex: 1; min-width: 0; display: block; text-align: left;
          padding: 9px 10px; background: none; border: none; border-radius: 8px;
          color: inherit; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit;
        }
        .a-school-item-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .a-school-del {
          opacity: 0; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 13px;
          min-width: 32px; min-height: 32px; padding: 4px 6px; border-radius: 6px; margin-right: 4px;
          font-family: inherit;
        }
        .a-school-item:hover .a-school-del,
        .a-school-item:focus-within .a-school-del,
        .a-school-del:focus-visible { opacity: 1; }
        .a-school-del:hover { color: #f87171; background: rgba(248,113,113,0.1); }
        /* Touch screens have no hover — keep the delete button visible. */
        @media (hover: none) { .a-school-del { opacity: 1; } }
        .a-empty-list { color: #94a3b8; font-size: 12px; padding: 16px 10px; text-align: center; }
        .a-new-btn {
          margin: 10px 14px 14px; padding: 9px 12px; border-radius: 8px; border: 1px dashed rgba(255,255,255,0.18);
          background: transparent; color: #a5b4fc; font-size: 12.5px; font-weight: 600; cursor: pointer;
          font-family: inherit;
        }
        .a-new-btn:hover { background: rgba(99,102,241,0.1); }

        .combo-cell { display: flex; flex-direction: column; gap: 4px; min-width: 200px; }
        .combo-custom-input { width: 100%; }
        .wbc-grade-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .wbc-grade-tab {
          display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 999px;
          border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-size: 12.5px; font-weight: 600;
          cursor: pointer; font-family: inherit;
        }
        .wbc-grade-tab:hover { border-color: #c7d2fe; }
        .wbc-grade-tab.active { background: #eef2ff; border-color: #a5b4fc; color: #4f46e5; }
        .wbc-grade-tab-count { font-size: 11px; font-weight: 700; color: #64748b; background: #fff; border-radius: 999px; padding: 1px 7px; }  /* A11Y: #94a3b8 on #fff was 2.6:1 */
        .wbc-grade-tab.active .wbc-grade-tab-count { background: #e0e7ff; color: #4f46e5; }
        .wbc-empty-note { font-size: 12.5px; color: #64748b; }
        .wbc-add-grade { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .wbc-add-grade select, .wbc-add-grade input[type=text] {
          border: 1px solid #e2e8f0; border-radius: 7px; padding: 7px 10px; font-size: 12.5px; font-family: inherit; outline: none;
        }
        .wbc-add-grade select:focus, .wbc-add-grade input:focus { border-color: #818cf8; }
        .a-count-badge { font-size: 11.5px; color: #94a3b8; padding: 0 14px 10px; }
        .a-kbd-hint {
          padding: 0 14px 12px; font-size: 11px; color: #94a3b8;  /* A11Y: was 3.7:1 on the dark rail */
        }
        .a-kbd-hint kbd {
          font-family: inherit; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
          border-radius: 4px; padding: 1px 5px; font-size: 10px;
        }
        .a-sidebar-close { display: none; }

        .a-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .a-topbar {
          height: 56px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center;
          padding: 0 24px; gap: 14px; flex-shrink: 0;
        }
        .a-topbar-name { font-size: 15px; font-weight: 700; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .a-topbar-sub { font-size: 12px; color: #64748b; }
        .a-topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 10px; }
        .a-menu-btn {
          display: none; background: #f1f5f9; border: 1px solid #e2e8f0; color: #0f172a; border-radius: 8px;
          padding: 7px 12px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit;
          white-space: nowrap;
        }
        .a-quick-btn {
          background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; border-radius: 8px;
          padding: 7px 12px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
          white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;
        }
        .a-quick-btn kbd {
          font-family: inherit; background: #fff; border: 1px solid #e2e8f0; border-radius: 4px;
          padding: 0 4px; font-size: 10px; color: #64748b;
        }
        .a-save-btn {
          padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; background: #4f46e5; color: #fff;
          display: flex; align-items: center; gap: 6px; font-family: inherit;
        }
        .a-save-btn:disabled { opacity: 0.5; cursor: default; }
        .a-dirty-dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; display: inline-block; margin-right: 6px; }
        .a-user-pill {
          display: flex; align-items: center; gap: 10px; background: #f1f5f9; border-radius: 999px;
          padding: 5px 6px 5px 12px; font-size: 12px; color: #475569;
        }
        .a-user-email { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .a-logout-btn {
          background: #0f172a; color: #f1f5f9; border: none; border-radius: 999px; padding: 6px 14px;
          font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: inherit;
        }
        .a-logout-btn:hover { background: #1e293b; }

        .a-tabs { display: flex; gap: 4px; overflow-x: auto; padding: 10px 24px 0; background: #fff; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }
        .a-tab {
          padding: 8px 14px; font-size: 12.5px; font-weight: 600; color: #64748b; cursor: pointer;
          border: none; background: none; border-bottom: 2px solid transparent; white-space: nowrap;
          font-family: inherit; display: inline-flex; align-items: center; gap: 6px;
        }
        .a-tab:hover { color: #334155; }
        .a-tab.active { color: #4f46e5; border-bottom-color: #4f46e5; }
        /* ACCESS: data badge — shows which tabs actually hold entries. */
        .a-tab-count {
          font-size: 10px; font-weight: 700; background: #eef2ff; color: #4f46e5;
          border-radius: 999px; padding: 1px 7px; line-height: 1.5;
        }
        .a-tab:not(.active) .a-tab-count { background: #f1f5f9; color: #475569; }

        .a-content { flex: 1; overflow-y: auto; padding: 26px 28px 60px; }
        .a-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px 24px; max-width: 1000px; }
        .a-panel-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }

        .a-save-error-banner {
          background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; border-radius: 10px;
          padding: 10px 14px; font-size: 12.5px; font-weight: 500; margin-bottom: 16px; max-width: 1000px;
        }
        .a-save-error-banner:focus-visible { outline-color: #b91c1c; }

        .a-school-loading { display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 13px; padding: 30px; }
        .a-spinner {
          width: 16px; height: 16px; border-radius: 50%; border: 2px solid #e2e8f0; border-top-color: #4f46e5;
          animation: a-spin 0.8s linear infinite;
        }
        @keyframes a-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .a-spinner { animation: none; } }

        .table-hint { font-size: 12px; color: #64748b; margin-bottom: 14px; }
        .subhead { font-size: 12.5px; font-weight: 700; color: #334155; margin: 24px 0 10px; text-transform: uppercase; letter-spacing: 0.04em; }

        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field-label { font-size: 11.5px; font-weight: 600; color: #475569; }
        .field input, .field textarea, .a-panel input[type=text], .a-panel input[type=number], .a-panel input[type=password] {
          border: 1px solid #e2e8f0; border-radius: 7px; padding: 8px 10px; font-size: 13px; color: #1e293b; outline: none; font-family: inherit;
        }
        .field input:focus, .field textarea:focus { border-color: #818cf8; }

        /* VALIDATION: invalid numeric values get a red border + message;
           unreadable legacy dates get an amber "kept as typed" note. */
        .etable input[aria-invalid="true"], .field input[aria-invalid="true"],
        .field textarea[aria-invalid="true"], .a-modal input[aria-invalid="true"] {
          border-color: #dc2626; background: #fef2f2;
        }
        .cell-error {
          display: block; margin-top: 3px; font-size: 11px; font-weight: 600;
          color: #b91c1c; max-width: 190px; white-space: normal;
        }
        .date-note {
          display: block; margin-top: 3px; font-size: 11px; font-weight: 600;
          color: #92400e; background: #fef3c7; border: 1px solid #fde68a;
          border-radius: 5px; padding: 2px 6px; max-width: 210px; white-space: normal;
        }
        .etable input[type=date] { min-width: 150px; }

        .logo-row { display: flex; gap: 18px; align-items: flex-start; flex-wrap: wrap; }
        .logo-preview { width: 84px; height: 84px; border-radius: 14px; object-fit: contain; border: 1px solid #e2e8f0; background: #f8fafc; padding: 8px; flex-shrink: 0; }
        .logo-none { display: flex; align-items: center; justify-content: center; font-size: 11px; color: #64748b; padding: 0; }
        .logo-controls { flex: 1; min-width: 260px; }
        .logo-btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .logo-upload { display: inline-flex; align-items: center; cursor: pointer; }
        .logo-upload input[type=file] { position: absolute; width: 1px; height: 1px; opacity: 0; }
        .logo-url-row { display: flex; gap: 8px; margin-top: 10px; }
        .logo-url-row input { flex: 1; border: 1px solid #e2e8f0; border-radius: 7px; padding: 8px 10px; font-size: 13px; outline: none; font-family: inherit; }
        .logo-url-row input:focus { border-color: #818cf8; }
        .logo-url-row .btn-ghost-sm:disabled { opacity: 0.5; cursor: default; }

        .section-toggle-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin-bottom: 6px; }
        .section-toggle {
          display: flex; align-items: flex-start; gap: 10px; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 11px 12px; cursor: pointer; background: #f8fafc; transition: border-color 0.15s ease, background 0.15s ease;
        }
        .section-toggle:hover { border-color: #c7d2fe; }
        .section-toggle.on { background: #eef2ff; border-color: #a5b4fc; }
        .section-toggle input[type=checkbox] { margin-top: 2px; width: 15px; height: 15px; accent-color: #4f46e5; flex-shrink: 0; }
        .section-toggle-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .section-toggle-label { font-size: 12.5px; font-weight: 700; color: #1e293b; }
        .section-toggle-hint { font-size: 11px; color: #64748b; line-height: 1.4; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        /* NEW — three-way applicability grid (Workbooks / Worksheets / STEM). */
        .three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .opt-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
        .check-row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #334155; }
        .opt-card textarea { border: 1px solid #e2e8f0; border-radius: 7px; padding: 8px 10px; font-size: 12.5px; font-family: inherit; }

        .etable-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; }
        .etable { width: 100%; border-collapse: collapse; font-size: 12.5px; min-width: 700px; }
        .etable th { background: #f8fafc; text-align: left; padding: 8px 10px; color: #475569; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
        .etable td { padding: 6px 8px; border-top: 1px solid #f1f5f9; vertical-align: top; }
        .etable input, .etable select, .etable textarea {
          width: 100%; min-width: 90px; border: 1px solid transparent; border-radius: 6px; padding: 6px 7px; font-size: 12.5px;
          font-family: inherit; background: #f8fafc; outline: none;
        }
        .etable input:focus, .etable select:focus, .etable textarea:focus { border-color: #818cf8; background: #fff; }
        .etable-empty { text-align: center; color: #64748b; padding: 20px; font-size: 12.5px; }
        .row-del {
          background: none; border: none; color: #64748b; cursor: pointer; font-size: 15px;
          min-width: 32px; min-height: 32px; padding: 4px 8px; border-radius: 6px; line-height: 1;
        }  /* A11Y: 32px hit area, darker default */
        .row-del:hover { color: #ef4444; }
        .add-row-btn {
          margin-top: 10px; padding: 7px 14px; border-radius: 7px; border: 1px dashed #c7d2fe; background: #eef2ff;
          color: #4f46e5; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit;
        }
        .add-row-btn:hover { background: #e0e7ff; }

        .json-box { width: 100%; min-height: 320px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-family: 'SF Mono', Menlo, monospace; font-size: 12px; color: #1e293b; outline: none; resize: vertical; }
        .json-box:focus { border-color: #818cf8; }
        .json-actions { display: flex; align-items: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
        .btn-primary-sm { background: #4f46e5; color: #fff; border: none; border-radius: 7px; padding: 7px 14px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-ghost-sm { background: #f1f5f9; color: #475569; border: none; border-radius: 7px; padding: 7px 14px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .json-error { color: #dc2626; font-size: 12px; font-weight: 500; }
        .json-example { background: #0f172a; color: #a5b4fc; padding: 14px; border-radius: 8px; font-size: 11.5px; margin-top: 10px; overflow-x: auto; }

        .media-photo-row { display: flex; gap: 18px; align-items: flex-start; padding: 14px 0; border-top: 1px solid #f1f5f9; }
        .media-photo-row:first-of-type { border-top: none; }
        .media-photo-row-label { width: 140px; flex-shrink: 0; font-size: 12.5px; font-weight: 700; color: #334155; padding-top: 8px; }
        .media-photos-cell { flex: 1; min-width: 0; }
        .media-thumb-strip { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
        .media-thumb { position: relative; width: 76px; height: 76px; border-radius: 9px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; }
        .media-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .media-thumb-del {
          position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; border: none;
          background: rgba(15,23,42,0.78); color: #fff; font-size: 12px; line-height: 1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .media-thumb-del:hover { background: #dc2626; }
        .media-upload-btn { display: inline-flex; align-items: center; cursor: pointer; }
        .media-upload-btn input[type=file] { position: absolute; width: 1px; height: 1px; opacity: 0; }
        .media-upload-hint { font-size: 11.5px; color: #a16207; background: #fef9c3; border: 1px solid #fde68a; border-radius: 7px; padding: 7px 10px; display: inline-block; }

        .a-empty-state { display: flex; flex-direction: column; height: 100%; }
        .a-empty-inner { flex: 1; display: flex; align-items: center; justify-content: center; }
        .a-empty-inner-card { text-align: center; max-width: 340px; padding: 0 16px; }
        .a-empty-inner-card h2 { font-size: 16px; color: #1e293b; margin-bottom: 6px; }
        .a-empty-inner-card p { font-size: 13px; color: #64748b; margin-bottom: 16px; }

        .a-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .a-modal { background: #fff; border-radius: 14px; padding: 24px; width: 340px; max-width: calc(100vw - 32px); }
        .a-modal h3 { font-size: 15px; color: #0f172a; margin-bottom: 14px; }
        .a-modal input { width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 11px; font-size: 13px; margin-bottom: 16px; outline: none; }
        .a-modal input:focus { border-color: #818cf8; }
        .a-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .a-btn-cancel { background: #f1f5f9; color: #475569; border: none; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .a-btn-create { background: #4f46e5; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .a-btn-create:disabled, .a-btn-cancel:disabled { opacity: 0.6; cursor: default; }

        /* ── ACCESS: quick switcher (Ctrl+K) ─────────────────────────────── */
        .a-palette-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex;
          align-items: flex-start; justify-content: center; padding-top: 12vh; z-index: 110;
        }
        .a-palette {
          background: #fff; border-radius: 14px; width: 480px; max-width: calc(100vw - 32px);
          box-shadow: 0 16px 48px rgba(15,23,42,0.3); overflow: hidden;
        }
        .a-palette input {
          width: 100%; border: none; border-bottom: 1px solid #e2e8f0; padding: 14px 16px;
          font-size: 14px; outline: none; font-family: inherit;
        }
        .a-palette-list { max-height: 320px; overflow-y: auto; padding: 6px; }
        .a-palette-item {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 9px 12px; border-radius: 9px; border: none; background: none; cursor: pointer;
          font-family: inherit; font-size: 13px; color: #1e293b; text-align: left;
        }
        .a-palette-item.selected, .a-palette-item:hover { background: #eef2ff; }
        .a-palette-item-sub { font-size: 11px; color: #64748b; white-space: nowrap; }
        .a-palette-empty { padding: 18px; text-align: center; font-size: 12.5px; color: #64748b; }
        .a-palette-foot {
          border-top: 1px solid #f1f5f9; padding: 8px 14px; font-size: 11px; color: #64748b;
          display: flex; gap: 14px;
        }
        .a-palette-foot kbd {
          font-family: inherit; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px;
          padding: 0 4px; font-size: 10px;
        }

        .a-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: #0f172a; color: #f1f5f9; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; z-index: 200;
          max-width: 80vw; text-align: center;
        }

        .export-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-family: 'SF Mono', Menlo, monospace; font-size: 11.5px; max-height: 300px; overflow: auto; background: #f8fafc; white-space: pre-wrap; word-break: break-all; }

        @media (max-width: 860px) {
          .a-sidebar {
            position: fixed; left: 0; top: 0; bottom: 0; z-index: 150;
            transform: translateX(-100%); transition: transform 0.2s ease;
            width: min(300px, 85vw); box-shadow: 4px 0 24px rgba(15,23,42,0.35);
          }
          .a-sidebar.open { transform: translateX(0); }
          @media (prefers-reduced-motion: reduce) { .a-sidebar { transition: none; } }
          .a-sidebar-backdrop {
            position: fixed; inset: 0; background: rgba(15,23,42,0.45); z-index: 140; border: none; padding: 0;
          }
          .a-sidebar-close {
            display: inline-flex; margin: 10px 14px 0; align-self: flex-end;
            background: rgba(255,255,255,0.08); color: #cbd5e1; border: none; border-radius: 8px;
            padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
          }
          .a-menu-btn { display: inline-flex; }
          .a-quick-btn kbd { display: none; }
          .a-topbar { padding: 0 14px; gap: 8px; }
          .a-topbar-actions { gap: 6px; }
          .a-user-email { display: none; }
          .a-tabs { padding: 10px 14px 0; }
          .a-content { padding: 16px 12px 60px; }
          .a-panel { padding: 16px; }
          .two-col { grid-template-columns: 1fr; }
          .three-col { grid-template-columns: 1fr; }
          .media-photo-row { flex-direction: column; gap: 8px; }
          .media-photo-row-label { width: auto; padding-top: 0; }
        }
      `}</style>

      <div className="admin-app">
        <a className="a-skip-link" href="#a-main-content">Skip to editor</a>

        {sidebarOpen && (
          <button className="a-sidebar-backdrop" aria-label="Close school list" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside id="a-school-sidebar" className={`a-sidebar${sidebarOpen ? " open" : ""}`} aria-label="School directory">
          <button className="a-sidebar-close" ref={sidebarCloseRef} onClick={() => setSidebarOpen(false)}>Close ✕</button>
          <div className="a-sidebar-head">
            <div className="a-sidebar-title">AEDS Admin</div>
            <div className="a-sidebar-sub">School data management</div>
          </div>
          <div className="a-search">
            <input
              type="search"
              aria-label="Search schools"
              placeholder="Search schools…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="a-count-badge" aria-live="polite">{index.length} school{index.length === 1 ? "" : "s"}</div>
          <nav className="a-school-list" aria-label="Schools">
            {loading && <div className="a-empty-list" role="status">Loading schools…</div>}
            {!loading && loadError && <div className="a-empty-list" style={{ color: "#f87171" }} role="alert">{loadError}</div>}
            {!loading && !loadError && index.length === 0 && <div className="a-empty-list">No schools yet.</div>}
            {/* A11Y FIX: each row is a plain flex wrapper with two real
                sibling buttons: open + delete. */}
            {index.map((s) => (
              <div key={s._id} className={`a-school-item${selectedId === s._id ? " active" : ""}`}>
                <button
                  type="button"
                  className="a-school-item-btn"
                  onClick={() => selectSchool(s._id)}
                  aria-current={selectedId === s._id ? "true" : undefined}
                >
                  <span className="a-school-item-name">{s.name}</span>
                </button>
                <button
                  type="button"
                  className="a-school-del"
                  aria-label={`Delete ${s.name}`}
                  onClick={() => requestDeleteSchool(s._id, s.name)}
                >
                  ✕
                </button>
              </div>
            ))}
          </nav>
          <button className="a-new-btn" onClick={() => setShowNewModal(true)}>+ New school</button>
          <div className="a-kbd-hint">
            <kbd>Ctrl</kbd>+<kbd>K</kbd> jump anywhere · <kbd>Ctrl</kbd>+<kbd>S</kbd> save
          </div>
        </aside>

        {/* Main */}
        <div className="a-main">
          {!school ? (
            <div className="a-empty-state">
              <div className="a-topbar">
                <button className="a-menu-btn" ref={menuBtnRef} aria-controls="a-school-sidebar" onClick={() => setSidebarOpen(true)} aria-expanded={sidebarOpen}>
                  ☰ Schools
                </button>
                <h1 className="a-topbar-name">AEDS Admin</h1>
                <div className="a-topbar-actions">
                  <button className="a-quick-btn" onClick={() => setPaletteOpen(true)} title="Quick jump (Ctrl+K)" aria-keyshortcuts="Control+K">
                    🔍 Jump to… <kbd>Ctrl K</kbd>
                  </button>
                  {onLogout && (
                    <div className="a-user-pill">
                      {userEmail && <span className="a-user-email">{userEmail}</span>}
                      <button className="a-logout-btn" onClick={onLogout}>Log out</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="a-empty-inner" id="a-main-content">
                {schoolLoading ? (
                  <div className="a-school-loading" role="status">
                    <span className="a-spinner" aria-hidden="true" /> Loading school…
                  </div>
                ) : (
                  <div className="a-empty-inner-card">
                    <h2>Select or create a school</h2>
                    <p>Pick a school from the list, press Ctrl+K to jump straight to one, or add a new school.</p>
                    <button className="a-btn-create" onClick={() => setShowNewModal(true)}>+ New school</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="a-topbar">
                <button className="a-menu-btn" ref={menuBtnRef} aria-controls="a-school-sidebar" onClick={() => setSidebarOpen(true)} aria-expanded={sidebarOpen}>
                  ☰ Schools
                </button>
                <div style={{ minWidth: 0 }}>
                  <h1 className="a-topbar-name">{school.name}</h1>
                  <div className="a-topbar-sub">{school.year} · Grades {school.grades}</div>
                </div>
                <div className="a-topbar-actions">
                  <button className="a-quick-btn" onClick={() => setPaletteOpen(true)} title="Quick jump (Ctrl+K)" aria-keyshortcuts="Control+K">
                    🔍 Jump to… <kbd>Ctrl K</kbd>
                  </button>
                  <button
                    className="a-save-btn"
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    title="Save changes (Ctrl+S)"
                    aria-keyshortcuts="Control+S"
                    aria-label={saving ? "Saving" : dirty ? "Save changes — you have unsaved edits" : "All changes saved"}
                  >
                    {dirty && <span className="a-dirty-dot" aria-hidden="true" />}
                    {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
                  </button>
                  {onLogout && (
                    <div className="a-user-pill">
                      {userEmail && <span className="a-user-email">{userEmail}</span>}
                      <button className="a-logout-btn" onClick={onLogout}>Log out</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="a-tabs" role="tablist" aria-label="School data sections">
                {visibleTabs.map((t, i) => {
                  const count = tabCount(t.id);
                  return (
                    <button
                      key={t.id}
                      ref={(el) => (tabRefs.current[t.id] = el)}
                      role="tab"
                      id={`a-tab-${t.id}`}
                      aria-selected={tab === t.id}
                      aria-controls="a-tabpanel"
                      tabIndex={tab === t.id ? 0 : -1}
                      className={`a-tab${tab === t.id ? " active" : ""}`}
                      onClick={() => setTab(t.id)}
                      onKeyDown={(e) => onTabKeyDown(e, i)}
                    >
                      {t.label}
                      {/* ACCESS: entry count so data-bearing tabs stand out. */}
                      {count != null && count > 0 && (
                        <>
                          <span className="a-tab-count" aria-hidden="true">{count}</span>
                          <span className="sr-only">, {count} entries</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="a-content" id="a-main-content">
                {saveErrorBanner && (
                  <div className="a-save-error-banner" role="alert" tabIndex={-1} ref={saveErrorRef}>
                    <strong>Save failed:</strong> {saveErrorBanner}
                  </div>
                )}
                <div className="a-panel" role="tabpanel" id="a-tabpanel" aria-labelledby={`a-tab-${tab}`}>
                  <h2 className="a-panel-title">{TAB_LIST.find((t) => t.id === tab)?.label}</h2>

                  {tab === "overview" && (
                    <OverviewTab
                      school={school}
                      update={update}
                      onSchoolUpdated={applyServerUpdate}
                      flashToast={flashToast}
                      fieldErrors={fieldErrors}
                      dirty={dirty}
                    />
                  )}
                  {tab === "credentials" && <CredentialsTab school={school} flashToast={flashToast} />}

                  {tab === "facultyProfile" && (
                    <FacultyProfileTab
                      school={school}
                      update={update}
                      onSchoolUpdated={applyServerUpdate}
                      flashToast={flashToast}
                      dirty={dirty}
                    />
                  )}

                  {tab === "mediaRows" && (
                    <MediaRowsSection
                      school={school}
                      dirty={dirty}
                      update={update}
                      onSchoolUpdated={applyServerUpdate}
                      flashToast={flashToast}
                    />
                  )}

                  {tab !== "mediaRows" && TABLES[tab] && (
                    <EditableTable
                      def={TABLES[tab]}
                      rows={school[tab]}
                      onChange={(rows) => update({ ...school, [tab]: rows })}
                    />
                  )}

                  {/* CHANGED — CompletionEditor now takes a dataKey, so the
                      exact same editor drives both tabs below. */}
                  {tab === "workbookCompletionData" && (
                    <CompletionEditor
                      school={school}
                      update={update}
                      dataKey="workbookCompletionData"
                      label="Workbook Completion"
                    />
                  )}
                  {tab === "worksheetCompletionData" && (
                    <CompletionEditor
                      school={school}
                      update={update}
                      dataKey="worksheetCompletionData"
                      label="Worksheet Completion"
                    />
                  )}

                  {tab === "kitsData" && (
                    <JsonEditor
                      hint="Legacy grouped per-box inventory (kit-box group → components with per-box quantities). New data should use the KITS Inventory tab instead — this only renders on the dashboard if non-empty."
                      value={school.kitsData}
                      onChange={(v) => update({ ...school, kitsData: v })}
                      example={KITS_EXAMPLE}
                    />
                  )}

                  {tab === "export" && (
                    <div>
                      <div className="table-hint">Full JSON for this school — copy it out as a backup, or paste another school's JSON below to load it into this one (its ID stays the same). Note: uploaded photos and uploaded logos belong to the school they were uploaded to and are stripped on import.</div>
                      <h3 className="subhead">Export</h3>
                      <div className="export-box" tabIndex={0} aria-label="School JSON export">{JSON.stringify(school, null, 2)}</div>
                      <h3 className="subhead">Import</h3>
                      <textarea className="json-box" style={{ minHeight: 160 }} aria-label="Paste school JSON to import" placeholder="Paste JSON here" value={importText} onChange={(e) => setImportText(e.target.value)} spellCheck={false} />
                      <div className="json-actions">
                        <button className="btn-primary-sm" onClick={doImport}>Load into form</button>
                        {importError && <span className="json-error" role="alert">{importError}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ACCESS: Ctrl+K quick switcher — jump to any school or section. */}
      {paletteOpen && (
        <div className="a-palette-overlay" onClick={() => setPaletteOpen(false)}>
          <div
            ref={paletteRef}
            className="a-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Quick jump"
            onClick={(e) => e.stopPropagation()}
          >
            {/* A11Y: real combobox pattern — focus stays on the input while
                aria-activedescendant tracks the highlighted option, so a
                screen reader announces each result as you arrow through. */}
            <input
              ref={paletteInputRef}
              role="combobox"
              aria-expanded="true"
              aria-controls="a-palette-listbox"
              aria-autocomplete="list"
              aria-activedescendant={
                paletteResults[paletteIdx]
                  ? `a-palette-opt-${paletteResults[paletteIdx].type}-${paletteResults[paletteIdx].id}`
                  : undefined
              }
              aria-label="Search schools and sections"
              placeholder="Jump to a school or section…"
              value={paletteQuery}
              onChange={(e) => setPaletteQuery(e.target.value)}
              onKeyDown={onPaletteKeyDown}
            />
            <div className="sr-only" role="status">
              {paletteResults.length} result{paletteResults.length === 1 ? "" : "s"}
            </div>
            <div className="a-palette-list" id="a-palette-listbox" role="listbox" aria-label="Results">
              {paletteResults.length === 0 && (
                <div className="a-palette-empty">No matches — try a school name or a section like "Kits".</div>
              )}
              {paletteResults.map((item, i) => (
                <div
                  key={`${item.type}-${item.id}`}
                  id={`a-palette-opt-${item.type}-${item.id}`}
                  role="option"
                  aria-selected={i === paletteIdx}
                  className={`a-palette-item${i === paletteIdx ? " selected" : ""}`}
                  onMouseEnter={() => setPaletteIdx(i)}
                  onClick={() => runPaletteItem(item)}
                >
                  <span>{item.label}</span>
                  <span className="a-palette-item-sub">{item.sub}</span>
                </div>
              ))}
            </div>
            <div className="a-palette-foot">
              <span><kbd>↑↓</kbd> navigate</span>
              <span><kbd>Enter</kbd> open</span>
              <span><kbd>Esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="a-modal-overlay" onClick={() => setShowNewModal(false)}>
          <div ref={newModalRef} className="a-modal" role="dialog" aria-modal="true" aria-labelledby="a-new-school-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="a-new-school-title">New school</h3>
            <input
              ref={modalInputRef}
              aria-label="School name"
              placeholder="School name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createSchool()}
            />
            <div className="a-modal-actions">
              <button className="a-btn-cancel" onClick={() => setShowNewModal(false)}>Cancel</button>
              <button className="a-btn-create" onClick={createSchool}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion-password modal — the ONLY path that can trigger
          DELETE /api/schools/:id. Requires the separate deletion
          password (verified server-side), not any admin's own login
          credentials. */}
      {deleteTarget && (
        <div className="a-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div
            ref={deleteModalRef}
            className="a-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a-delete-school-title"
            aria-describedby="a-delete-school-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="a-delete-school-title">Delete "{deleteTarget.name}"?</h3>
            <p id="a-delete-school-desc" style={{ fontSize: 12.5, color: "#64748b", marginBottom: 14 }}>
              This removes the school and deactivates its login. Enter the deletion password to confirm.
            </p>
            <input
              ref={deletePasswordInputRef}
              type="password"
              aria-label="Deletion password"
              aria-invalid={deleteError ? "true" : undefined}
              aria-describedby={deleteError ? "a-delete-school-error" : undefined}
              placeholder="Deletion password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmDeleteSchool()}
              disabled={deleting}
            />
            {deleteError && (
              <div className="json-error" id="a-delete-school-error" role="alert" style={{ marginBottom: 10 }}>
                {deleteError}
              </div>
            )}
            <div className="a-modal-actions">
              <button className="a-btn-cancel" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button
                className="a-btn-create"
                style={{ background: "#dc2626" }}
                onClick={confirmDeleteSchool}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete school"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div aria-live="polite" aria-atomic="true" role="status">
        {toast && <div className="a-toast">{toast}</div>}
      </div>
    </>
  );
}