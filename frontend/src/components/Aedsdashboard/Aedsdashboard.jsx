// src/components/Aedsdashboard/Aedsdashboard.jsx
//
// Read-only dashboard for CLIENT accounts — fully redesigned.
//
// Data model now mirrors the AEDS workbook sheet-for-sheet, field-for-field:
//
//   AEDS ................. logo (image URL or data-URL), year, name, faculty,
//                          grades, totalStudents,
//                          workingDays, lastUpdatedOn, lastUpdatedBy,
//                          lastReviewedOn, lastReviewedBy, deliverables[]
//   WORKBOOKS ............ workbooks { applicable, note } + workbookRows[]
//                          (grade, count, dateIssued, damage,
//                          replacementDetails, remarks) + workbookCompletionData
//   WORKSHEETS ........... worksheets { applicable, note } +
//                          worksheetCompletionData — the grade-wise activity
//                          completion grid: { "Grade 4": [{ name, sections:
//                          [{grade,section,date,status}] }], ... }. This is
//                          where the register workbook's WORKSHEETS sheet
//                          actually keeps its data (Activity Name / Grade /
//                          Section / Completion Date / Status, one row per
//                          class section, laid out as side-by-side grade
//                          blocks).
//   KITS ................. kitsMeta (noOfKitBoxes, issuedDate, refilledDate,
//                          lastUpdatedOn) + kitsRows[] (component, damagedQty,
//                          workingQty, totalQty, refillQty) — flat inventory,
//                          exactly like the sheet's main table.
//                          Legacy grouped kitsData{} still renders if present.
//   ATAL LAB ............. atalLabRows[] (component, componentsQty, workingQty,
//                          damagedQty) — the KITS sheet's second table
//                          ("SCHOOL ATAL LAB STOCK LIST"), its own register.
//   STEM ................. stem { applicable, note } + stemRows[] (gradeLevel,
//                          term, totalCount, dateIssued, damage,
//                          replacementDetails, remarks)
//   WORKDONE ............. workdoneRows[] (month, date, status, link, remedial)
//   MEDIA ................ mediaRows[] (month, grades, photos, videos,
//                          dateShared, link, status, remarks, files[] —
//                          actual uploaded photos, see PhotoThumbs below)
//   ASSESSMENTS .......... assessmentRows[] (assessmentNo, date, sections,
//                          attended, absent, status, remarks)
//   REPORT CARDS ......... reportCardRows[] (grade, sections, issuedDate,
//                          assessmentNo, status, remarks)
//   FACULTY OBSERVATION .. facultyObservationRows[] (observationDate,
//                          issueNoted, resolutionTaken, nextReviewDate,
//                          status, remarks)
//   EXPO ................. expoRows[] (name, date, grades, projects,
//                          projectCount, status, review, remarks)
//   EVENT ................ eventRows[] (name, description, date, involvement,
//                          studentCount, status, remarks)
//   WORK ACCOMPLISHMENT .. workAccomplishmentRows[] (academicYear, date,
//                          preparedBy, status, link)
//   FACULTY PROFILE ...... facultyProfile { name, title, photo, topBadge,
//                          bottomSeal, tagline, quote, contactPhone,
//                          contactEmail, contactWebsite, contactLocation,
//                          signatoryName, signatoryTitle, signatoryCompany }
//                          + facultyStatsRows[] (label, value) +
//                          facultyExpertiseRows[] (skill, percent) +
//                          facultyTeachingRows[] (item) + facultyToolsRows[]
//                          (name) + facultyStrengthsRows[] (label) — the
//                          infographic-style faculty bio card. See
//                          FacultyProfileSection below.
//
//   enabledSections ...... { <sheet key>: boolean } — set from AdminPanel's
//                          Overview tab checkboxes. A sheet whose key reads
//                          false here is skipped entirely below (missing
//                          key = enabled, for schools saved before this
//                          field existed).
//
// Design: light "register" look — the workbook's sheets become color-coded
// index tabs down the left rail; each sheet opens with a tinted hero band
// carrying a perfboard dot-grid (a nod to the breadboards in the kit boxes).
//
// CHANGE LOG (this pass): the register workbook keeps its grade-wise
// activity-completion grid on the WORKSHEETS sheet, not WORKBOOKS — and
// WORKBOOKS itself carries an applicability flag it never had before
// ("NOT APPLICABLE" for schools running the worksheet track instead of
// physical workbooks). Both sections below were rebuilt around that:
//   • Worksheets now renders its own grade-by-grade completion table,
//     reading `school.worksheetCompletionData` — laid out to match the
//     sheet exactly (Activity Name / Grade / Section / Completion Date /
//     Status, with the activity name shown once per group, mirroring the
//     sheet's merged cells).
//   • Workbooks leads with an applicability card (`school.workbooks`) and
//     only shows the register + completion tables underneath when they
//     have something to show, so a NOT APPLICABLE school doesn't render
//     two empty tables under its note.
//   • The same grade-completion renderer is shared by both sections
//     (GradeCompletionTable / CompletionByGrade) — Workbooks keeps reading
//     `workbookCompletionData` for any school still using that track.
//
// GRADE / SECTION SPLIT + DATE FORMATTING (this pass): the completion
// grid's class column ("4A", "4B") is now stored as separate `grade` and
// `section` fields (see CompletionEditor in the admin panel) — the table
// here renders them as two columns instead of one. All dates across the
// dashboard (admin now saves ISO YYYY-MM-DD via a calendar picker) are
// rendered through a shared `fmtDate` / `DateText` helper so every date
// column shows a readable "12 Jun 2026" instead of a raw ISO string;
// legacy free-text values that aren't ISO dates are shown exactly as saved.
//
// FACULTY PROFILE (this pass): a new "Faculty Profile" sheet — an
// infographic-style bio card for the faculty member assigned to this
// school (photo, headline stats, skill bars, a teaching-expertise
// checklist, a tools & technologies grid, a key-strengths grid, and a
// footer with a quote, contact details, and a signatory/certification
// block). It's a deliberately different visual register from the rest of
// the dashboard (poster-style rather than spreadsheet-style) since that's
// what the source card looks like — see FacultyProfileSection and the
// "fp-" prefixed styles near the end of the stylesheet below. Brand marks
// (the CyberBots wordmark, the certification ribbon/seal) are recreated
// with CSS rather than reproducing external logo artwork; tool icons are
// simple monogram/emoji glyphs chosen by keyword match against the tool
// name, with a letter-monogram fallback for anything unrecognised.

import { useState, useMemo, useEffect } from "react";
import { BASE_URL } from "../../api/http";

// ─── NAV — one entry per workbook sheet, in workbook order ─────────────────
// `key` is the sheet's toggle id in school.enabledSections. "aeds" has no
// key (the overview always shows — there's nowhere else to land if it's
// hidden), everything else is gated.

const SECTIONS = [
  { id: "aeds", key: null, label: "AEDS", title: "Programme Overview", note: "Register summary", color: "#5457D6" },
  // NEW — Faculty Profile. Uses a DIFFERENT enabledSections key
  // ("facultyProfile") from the existing Faculty Observation sheet
  // ("faculty") — they're unrelated sheets that happen to share a word.
  { id: "facultyProfile", key: "facultyProfile", label: "Faculty Profile", title: "Faculty Profile", note: "Meet the faculty", color: "#F7941D" },
  { id: "workbooks", key: "workbooks", label: "Workbooks", title: "Books & Learning Materials", note: "Issued per grade", color: "#0779D3" },
  { id: "worksheets", key: "worksheets", label: "Worksheets", title: "Worksheets (Activity-Based)", note: "Activity completion", color: "#0D9488" },
  { id: "kits", key: "kits", label: "Kits", title: "Kits — Inventory Details", note: "Component stock", color: "#D97706" },
  { id: "atallab", key: "atallab", label: "Atal Lab", title: "School Atal Lab Stock List", note: "Tinkering lab stock", color: "#9333EA" },
  { id: "stem", key: "stem", label: "STEM", title: "STEM Kits (If Opted)", note: "Optional deliverable", color: "#EA580C" },
  { id: "workdone", key: "workdone", label: "Workdone", title: "Monthly Work Done Report", note: "Submissions", color: "#16A34A" },
  { id: "media", key: "media", label: "Media", title: "Practical Class Media", note: "Drive links", color: "#DB2777" },
  { id: "assessments", key: "assessments", label: "Assessments", title: "Assessments", note: "Attendance & status", color: "#7C3AED" },
  { id: "reportcards", key: "reportcards", label: "Report Cards", title: "Skill-Set Report Cards", note: "Issued per grade", color: "#0891B2" },
  { id: "faculty", key: "faculty", label: "Faculty Observation", title: "Faculty Observations & Resolutions", note: "Review log", color: "#E11D48" },
  { id: "expo", key: "expo", label: "Expo", title: "Expo / Competitions Participation", note: "Showcases", color: "#C026D3" },
  { id: "event", key: "event", label: "Event", title: "Annual Event / Participation", note: "School events", color: "#65A30D" },
  { id: "accomplishment", key: "accomplishment", label: "Work Accomplishment", title: "Annual Work Accomplishment Report", note: "Year-end report", color: "#2563EB" },
];

// A section shows when it has no toggle key (AEDS overview), the school
// has no enabledSections yet (older schools — default everything on), or
// its key isn't explicitly set to false.
function isSectionVisible(school, section) {
  if (!section.key) return true;
  if (!school?.enabledSections) return true;
  return school.enabledSections[section.key] !== false;
}

// ─── SMALL HELPERS ──────────────────────────────────────────────────────────

const dash = <span className="rb-dim">—</span>;

function isBlank(v) {
  return v === undefined || v === null || String(v).trim() === "" || String(v).trim() === "—";
}

// Parse "188", "10 BOXES", "-", "NIL" → number (0 for non-numeric)
function num(v) {
  if (v === undefined || v === null) return 0;
  const m = String(v).match(/\d+/);
  return m ? Number(m[0]) : 0;
}

// ─── DATE FORMATTING ─────────────────────────────────────────────────────
//
// The admin panel now saves every date as ISO YYYY-MM-DD (native calendar
// picker). Render those as "12 Jun 2026" everywhere on the dashboard.
// Legacy free-text values the admin never re-saved through the picker
// (e.g. "Nil", "-", or an old "12/06/2026") aren't ISO, so they're shown
// exactly as stored rather than guessed at.

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(value) {
  if (isBlank(value)) return "";
  const v = String(value).trim();
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return v;
  const [, y, mo, d] = m;
  const monthIdx = Number(mo) - 1;
  if (monthIdx < 0 || monthIdx > 11) return v;
  return `${Number(d)} ${MONTH_ABBR[monthIdx]} ${y}`;
}

function DateText({ value }) {
  const text = fmtDate(value);
  return text ? <span className="rb-date">{text}</span> : dash;
}

// Column shorthand for any date field rendered through DataTable.
const dateCol = (key, label) => ({ key, label, render: (v) => <DateText value={v} /> });

function statusTone(status) {
  const s = String(status || "").toUpperCase().replace(/\s+/g, " ").trim();
  if (["DELIVERED", "COMPLETED", "SUBMITTED", "CLOSED", "DONE"].includes(s)) return "green";
  if (["NOT DELIVERED", "PENDING", "OPEN", "OVERDUE"].includes(s)) return "rose";
  if (["IN PROGRESS", "INPROGRESS", "REPORTING MONTHLY", "UPCOMING", "PARTICIPATED", "ONGOING"].includes(s)) return "amber";
  return "slate";
}

function Badge({ status }) {
  if (isBlank(status)) return dash;
  return <span className={`rb-badge rb-badge-${statusTone(status)}`}>{String(status)}</span>;
}

function LinkCell({ href, label }) {
  if (isBlank(href)) return dash;
  return (
    <a className="rb-link" href={href} target="_blank" rel="noreferrer">
      {label || "View"} ↗
    </a>
  );
}

// Uploaded photo thumbnails (real files stored on the backend, distinct from
// the Drive `link` field). Each entry in `files` is
// { filename, originalName, url, size, uploadedAt } — `url` is a
// server-relative path (e.g. "/uploads/media/<schoolId>/<file>"), so it's
// joined with BASE_URL to build the actual <img src>.
function PhotoThumbs({ files }) {
  if (!files || files.length === 0) return dash;
  return (
    <div className="rb-photo-strip">
      {files.map((f) => (
        <a
          key={f.filename}
          className="rb-photo-thumb"
          href={`${BASE_URL}${f.url}`}
          target="_blank"
          rel="noreferrer"
          title={f.originalName || "View full size"}
        >
          <img src={`${BASE_URL}${f.url}`} alt={f.originalName || "Uploaded class photo"} />
        </a>
      ))}
    </div>
  );
}

// Uploaded logos are stored as server-relative paths ("/uploads/logos/…")
// and need BASE_URL prefixed; pasted external URLs (https://…) or legacy
// base64 data-URLs are used as-is. Also reused by the faculty profile
// photo below, since faculty photos live under "/uploads/faculty/…" and
// this check only looks at the "/uploads/" prefix.
function resolveLogoSrc(logo) {
  if (!logo) return "";
  return logo.startsWith("/uploads/") ? `${BASE_URL}${logo}` : logo;
}

// School logo — renders school.logo (URL, data-URL, or server-uploaded
// path); falls back to the school's initials if no logo is set or the
// image fails to load.
function SchoolLogo({ school, size = 46, radius = 12 }) {
  const [broken, setBroken] = useState(false);
  const src = resolveLogoSrc(school?.logo);
  const initials =
    (school?.name || "")
      .replace(/[^A-Za-z ]/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";
  const base = { width: size, height: size, borderRadius: radius };
  if (src && !broken) {
    return (
      <img
        className="rb-logo"
        style={base}
        src={src}
        alt={`${school?.name || "School"} logo`}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div className="rb-logo rb-logo-fallback" style={{ ...base, fontSize: Math.round(size * 0.34) }} aria-hidden="true">
      {initials}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rb-empty">
      <div className="rb-empty-dots" aria-hidden="true">
        <span /><span /><span />
      </div>
      <p>Nothing has been logged under {label} yet.</p>
      <p className="rb-empty-sub">Entries appear here as soon as your programme faculty records them.</p>
    </div>
  );
}

function DataTable({ columns, rows, emptyLabel }) {
  if (!rows || rows.length === 0) return <EmptyState label={emptyLabel} />;
  return (
    <div className="rb-table-wrap">
      <table className="rb-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={c.align === "right" ? { textAlign: "right" } : undefined}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => {
                const raw = r[c.key];
                const content = c.render ? c.render(raw, r) : (isBlank(raw) ? dash : String(raw));
                return (
                  <td key={c.key} style={c.align === "right" ? { textAlign: "right" } : undefined}>
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Hero({ index, total, section, meta, subtitle, title, leading, children }) {
  const c = section.color;
  return (
    <header
      className="rb-hero"
      style={{
        background: `linear-gradient(115deg, ${c}22 0%, ${c}0d 55%, ${c}05 100%)`,
        borderColor: `${c}40`,
        "--hero-dot": `${c}`,
      }}
    >
      <div className="rb-hero-body">
        {leading && <div className="rb-hero-lead">{leading}</div>}
        <div className="rb-hero-text">
          <div className="rb-hero-eyebrow" style={{ color: c }}>
            Sheet {String(index + 1).padStart(2, "0")} / {total} · AEDS Register
          </div>
          <h1 className="rb-hero-title">{title || section.title}</h1>
          {subtitle && <p className="rb-hero-subtitle" style={{ color: c }}>{subtitle}</p>}
          {meta && <p className="rb-hero-meta">{meta}</p>}
          {children}
        </div>
      </div>
      <div className="rb-hero-num" style={{ color: c }} aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </div>
    </header>
  );
}

function Panel({ color, title, chip, children }) {
  return (
    <section className="rb-panel">
      {title && (
        <div className="rb-panel-head">
          <span className="rb-panel-mark" style={{ background: color }} aria-hidden="true" />
          <h2 className="rb-panel-title">{title}</h2>
          {chip !== undefined && chip !== null && <span className="rb-panel-chip">{chip}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

function Stat({ label, value, hint, color }) {
  return (
    <div className="rb-stat">
      <span className="rb-stat-dot" style={{ background: `${color}1f`, borderColor: `${color}55` }}>
        <span style={{ background: color }} />
      </span>
      <div>
        <div className="rb-stat-label">{label}</div>
        <div className="rb-stat-value">{isBlank(value) ? "—" : value}</div>
        {hint && <div className="rb-stat-hint">{hint}</div>}
      </div>
    </div>
  );
}

const CHART_PALETTE = ["#5457D6", "#0779D3", "#0D9488", "#D97706", "#DB2777", "#7C3AED", "#0891B2", "#65A30D"];

function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.max(3, Math.round((value / max) * 100)) : 3;
  return (
    <div className="rb-bar-row">
      <div className="rb-bar-label">{label}</div>
      <div className="rb-bar-track">
        <div className="rb-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}b3)` }} />
      </div>
      <div className="rb-bar-value">{value}</div>
    </div>
  );
}

function ApplicabilityCard({ data, sheetLabel, color }) {
  const applicable = !!data?.applicable;
  return (
    <div
      className="rb-applic"
      style={applicable ? { background: `${color}12`, borderColor: `${color}50` } : undefined}
    >
      <span
        className={`rb-badge ${applicable ? "" : "rb-badge-slate"}`}
        style={applicable ? { background: `${color}22`, color } : undefined}
      >
        {applicable ? "APPLICABLE" : "NOT APPLICABLE"}
      </span>
      <p className="rb-applic-note">
        {data?.note || `No note has been recorded for ${sheetLabel} at this school.`}
      </p>
    </div>
  );
}

// ─── GRADE-WISE ACTIVITY COMPLETION — shared by Worksheets & Workbooks ────
//
// Renders one grade exactly as the register sheet reads: five columns
// (Activity Name / Grade / Section / Completion Date / Status), one row per
// class section, with the activity name shown once and left blank on its
// repeat rows — mirroring the sheet's merged cell over each activity's
// section rows (e.g. A52:A53, F56:F57). Grade and Section are separate
// columns because the register's class value ("4A", "4B") is itself
// grade + section combined.

function GradeCompletionTable({ grade, activities, color }) {
  const rows = [];
  (activities || []).forEach((act, ai) => {
    const sections = act.sections && act.sections.length > 0 ? act.sections : [{}];
    sections.forEach((sec, si) => {
      rows.push({
        key: `${ai}-${si}`,
        name: si === 0 ? act.name : "",
        first: si === 0,
        grade: sec.grade || "",
        section: sec.section || "",
        date: sec.date || "",
        status: sec.status || "",
      });
    });
  });

  const done = rows.filter((r) => statusTone(r.status) === "green").length;

  return (
    <div className="rb-gct">
      <div className="rb-gct-head">
        <span className="rb-gct-grade" style={{ color }}>{grade}</span>
        <span className="rb-gct-count">
          {done} / {rows.length} section entries completed
        </span>
      </div>
      <div className="rb-table-wrap">
        <table className="rb-table rb-gct-table">
          <thead>
            <tr>
              <th>Activity Name</th>
              <th>Grade</th>
              <th>Section</th>
              <th>Completion Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="rb-gct-empty">No activities recorded for {grade} yet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.key} className={r.first ? "rb-gct-first" : undefined}>
                <td className="rb-gct-name">{r.name}</td>
                <td className="rb-gct-section">{isBlank(r.grade) ? dash : r.grade}</td>
                <td className="rb-gct-section">{isBlank(r.section) ? dash : r.section}</td>
                <td><DateText value={r.date} /></td>
                <td>{isBlank(r.status) ? dash : <Badge status={r.status} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Shared by both pages — Worksheets reads worksheetCompletionData, Workbooks
// keeps reading workbookCompletionData for any school still on that track.
function CompletionByGrade({ data, color, emptyLabel }) {
  const grades = Object.keys(data || {});
  if (grades.length === 0) return <EmptyState label={emptyLabel} />;
  return (
    <>
      {grades.map((g) => (
        <GradeCompletionTable key={g} grade={g} activities={data[g]} color={color} />
      ))}
    </>
  );
}

// ─── FACULTY PROFILE — icon lookups + card ─────────────────────────────
//
// Keyword-matched glyphs for each repeating part of the card, with a
// letter-monogram fallback so a custom stat/skill/tool/strength the admin
// types in always renders something sensible instead of a blank icon.

const FP_STAT_ICONS = [
  { match: /experience/i, icon: "👤" },
  { match: /project/i, icon: "💼" },
  { match: /student/i, icon: "🎓" },
  { match: /school|institution/i, icon: "🏫" },
  { match: /competition/i, icon: "🏆" },
];
const FP_EXPERTISE_ICONS = [
  { match: /robot/i, icon: "🤖" },
  { match: /artificial|\bai\b|machine learning/i, icon: "🧠" },
  { match: /3d|design|model/i, icon: "📐" },
  { match: /program|cod/i, icon: "💻" },
  { match: /data/i, icon: "📊" },
];
const FP_TOOL_ICONS = [
  { match: /python/i, icon: "🐍" },
  { match: /arduino/i, icon: "♾️" },
  { match: /matlab/i, icon: "Ⓜ️" },
  { match: /solidworks/i, icon: "🛠️" },
  { match: /tensorflow/i, icon: "🔶" },
  { match: /opencv/i, icon: "👁️" },
  { match: /excel|power ?bi/i, icon: "📊" },
  { match: /3d print/i, icon: "🖨️" },
  { match: /git/i, icon: "🐙" },
];
const FP_STRENGTH_ICONS = [
  { match: /technical/i, icon: "🧠" },
  { match: /engagement/i, icon: "🤝" },
  { match: /hands.?on|training/i, icon: "🖥️" },
  { match: /innovation|creativ/i, icon: "💡" },
  { match: /problem/i, icon: "🧩" },
  { match: /leadership|teamwork/i, icon: "🤝" },
];

function fpIcon(list, text) {
  const hit = list.find((e) => e.match.test(text || ""));
  if (hit) return hit.icon;
  return (text || "?").trim()[0]?.toUpperCase() || "?";
}

// Faculty headshot — same resolveLogoSrc() as the school logo (it only
// checks the "/uploads/" prefix, so it works for either upload path), with
// an initials fallback.
function FacultyPhoto({ src, name }) {
  const [broken, setBroken] = useState(false);
  const resolved = resolveLogoSrc(src);
  const initials =
    (name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";
  if (resolved && !broken) {
    return <img className="fp-photo" src={resolved} alt={`${name || "Faculty"} photo`} onError={() => setBroken(true)} />;
  }
  return (
    <div className="fp-photo fp-photo-fallback" aria-hidden="true">
      {initials}
    </div>
  );
}

// Signature block — an uploaded image (e.g. the Managing Director's
// signature) when facultyProfile.signaturePhoto is set, falling back to
// the styled-script rendering of the signatory's name otherwise — INCLUDING
// if the uploaded image fails to load, so a broken/removed file never
// leaves the footer with a blank gap where a signature should be.
function SignatureBlock({ src, name }) {
  const [broken, setBroken] = useState(false);
  const resolved = resolveLogoSrc(src);
  if (resolved && !broken) {
    return (
      <div className="fp-sign-img-wrap">
        <img className="fp-sign-img" src={resolved} alt={`${name || "Signatory"}'s signature`} onError={() => setBroken(true)} />
      </div>
    );
  }
  return <div className="fp-sign-script">{name}</div>;
}

// The faculty profile card itself — an infographic-style bio, deliberately
// styled apart from the rest of the dashboard's spreadsheet-register look
// (see the "fp-" prefixed CSS block further down). Reads
// school.facultyProfile (scalar fields) plus the five row arrays; renders
// nothing for any part that has no data yet, and falls back to a single
// EmptyState if the whole card is still blank.
function FacultyProfileSection({ school, color }) {
  const fp = school.facultyProfile || {};
  const stats = school.facultyStatsRows || [];
  const expertise = school.facultyExpertiseRows || [];
  const teaching = school.facultyTeachingRows || [];
  const tools = school.facultyToolsRows || [];
  const strengths = school.facultyStrengthsRows || [];

  const hasAnything =
    fp.name || fp.title || fp.photo || fp.quote ||
    stats.length || expertise.length || teaching.length || tools.length || strengths.length;

  if (!hasAnything) {
    return (
      <Panel color={color} title="Faculty Profile">
        <EmptyState label="the faculty profile" />
      </Panel>
    );
  }

  const hasFooter =
    fp.quote || fp.contactPhone || fp.contactEmail || fp.contactWebsite ||
    fp.contactLocation || fp.signatoryName || fp.bottomSeal;

  return (
    <div className="fp-card">
      {/* header */}
      <div className="fp-header">
        <div className="fp-brand">
          <span className="fp-brand-mark" aria-hidden="true">CB</span>
          <div>
            <div className="fp-brand-name">CYBER<span>BOTS</span></div>
            <div className="fp-brand-tag">Think | Build | Transform</div>
          </div>
        </div>

        {fp.topBadge && (
          <div className="fp-ribbon">
            {fp.topBadge.split(" ").map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
        )}

        <div className="fp-header-body">
          <div className="fp-header-text">
            <div className="fp-eyebrow">
              FACULTY <span>PROFILE</span>
            </div>
            <div className="fp-eyebrow-rule" />
            <h2 className="fp-name">{fp.name || "—"}</h2>
            {fp.title && <div className="fp-title">{fp.title}</div>}
          </div>
          <div className="fp-photo-wrap">
            <FacultyPhoto src={fp.photo} name={fp.name} />
          </div>
        </div>
      </div>

      {/* stats */}
      {stats.length > 0 && (
        <div className="fp-stats">
          {stats.map((s, i) => (
            <div className="fp-stat" key={i}>
              <div className="fp-stat-icon">{fpIcon(FP_STAT_ICONS, s.label)}</div>
              <div className="fp-stat-value">{isBlank(s.value) ? dash : s.value}</div>
              <div className="fp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {(expertise.length > 0 || teaching.length > 0) && (
        <div className="fp-grid">
          {expertise.length > 0 && (
            <div className="fp-panel">
              <div className="fp-panel-head">
                <span className="fp-panel-icon" aria-hidden="true">⚙️</span> Expertise
              </div>
              <div className="fp-bars">
                {expertise.map((e, i) => {
                  const pct = Math.max(0, Math.min(100, num(e.percent)));
                  return (
                    <div className="fp-bar-row" key={i}>
                      <span className="fp-bar-icon" aria-hidden="true">{fpIcon(FP_EXPERTISE_ICONS, e.skill)}</span>
                      <span className="fp-bar-label">{e.skill}</span>
                      <div className="fp-bar-track">
                        <div className="fp-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="fp-bar-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {teaching.length > 0 && (
            <div className="fp-panel">
              <div className="fp-panel-head">
                <span className="fp-panel-icon" aria-hidden="true">🧑‍🏫</span> Teaching Expertise
              </div>
              <ul className="fp-checklist">
                {teaching.map((t, i) => (
                  <li key={i}>
                    <span className="fp-check" aria-hidden="true">✓</span>
                    {t.item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {(tools.length > 0 || strengths.length > 0) && (
        <div className="fp-grid">
          {tools.length > 0 && (
            <div className="fp-panel">
              <div className="fp-panel-head">
                <span className="fp-panel-icon" aria-hidden="true">🛠️</span> Tools &amp; Technologies
              </div>
              <div className="fp-tools">
                {tools.map((t, i) => (
                  <div className="fp-tool" key={i}>
                    <span className="fp-tool-icon" aria-hidden="true">{fpIcon(FP_TOOL_ICONS, t.name)}</span>
                    {t.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          {strengths.length > 0 && (
            <div className="fp-panel">
              <div className="fp-panel-head">
                <span className="fp-panel-icon" aria-hidden="true">🛡️</span> Key Strengths
              </div>
              <div className="fp-strengths">
                {strengths.map((s, i) => (
                  <div className="fp-strength" key={i}>
                    <span className="fp-strength-icon" aria-hidden="true">{fpIcon(FP_STRENGTH_ICONS, s.label)}</span>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasFooter && (
        <div className="fp-footer">
          {fp.quote && (
            <div className="fp-quote">
              <span className="fp-quote-mark" aria-hidden="true">“</span>
              {fp.quote}
              <span className="fp-quote-mark" aria-hidden="true">”</span>
            </div>
          )}
          {(fp.contactPhone || fp.contactEmail || fp.contactWebsite || fp.contactLocation) && (
            <div className="fp-contact">
              {fp.contactPhone && <div><span aria-hidden="true">📞</span> {fp.contactPhone}</div>}
              {fp.contactEmail && <div><span aria-hidden="true">✉️</span> {fp.contactEmail}</div>}
              {fp.contactWebsite && <div><span aria-hidden="true">🌐</span> {fp.contactWebsite}</div>}
              {fp.contactLocation && <div><span aria-hidden="true">📍</span> {fp.contactLocation}</div>}
            </div>
          )}
          {(fp.signatoryName || fp.bottomSeal) && (
            <div className="fp-sign">
              {fp.signatoryName && (
                <div className="fp-sign-block">
                  <SignatureBlock src={fp.signaturePhoto} name={fp.signatoryName} />
                  <div className="fp-sign-name">{fp.signatoryName}</div>
                  {fp.signatoryTitle && <div className="fp-sign-title">{fp.signatoryTitle}</div>}
                  {fp.signatoryCompany && <div className="fp-sign-title">{fp.signatoryCompany}</div>}
                </div>
              )}
              {fp.bottomSeal && (
                <div className="fp-seal">
                  <div className="fp-seal-inner">{fp.bottomSeal}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {fp.tagline && <div className="fp-tagline">{fp.tagline}</div>}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────

export default function AEDSDashboard({ school, userEmail, onLogout, onRefresh, refreshing }) {
  const [navOpen, setNavOpen] = useState(false);

  // Only sections this school's admin has ticked on (plus AEDS, always on).
  const visibleSections = useMemo(
    () => SECTIONS.filter((s) => isSectionVisible(school, s)),
    [school]
  );

  // [DEBUG] Whenever a fresh `school` prop arrives (mount, or after
  // Refresh below), log exactly what it's filtering on. If a section you
  // unticked in AdminPanel is still in this "visible" list, `enabledSections`
  // itself is the stale part — that points back to Portal's fetch (see its
  // [FE:Portal] log) or the server ([BE:getMySchool]), not this component.
  useEffect(() => {
    console.log("[FE:AEDSDashboard] school =", school?.name, "| enabledSections =", school?.enabledSections);
    console.log("[FE:AEDSDashboard] visible section ids =", SECTIONS.filter((s) => isSectionVisible(school, s)).map((s) => s.id));
  }, [school]);

  const [activeId, setActiveId] = useState("aeds");
  const activeIndex = Math.max(0, visibleSections.findIndex((s) => s.id === activeId));
  const active = visibleSections[activeIndex] || SECTIONS[0];

  // Students-per-grade chart: prefer gradeData, else derive from workbook counts.
  const gradeSeries = useMemo(() => {
    if (school?.gradeData?.length) {
      return school.gradeData.map((g) => ({ label: g.grade, value: num(g.students) }));
    }
    if (school?.workbookRows?.length) {
      return school.workbookRows.map((r) => ({ label: `Grade ${r.grade}`, value: num(r.count) }));
    }
    return [];
  }, [school]);
  const gradeMax = useMemo(() => Math.max(0, ...gradeSeries.map((g) => g.value)), [gradeSeries]);

  // Deliverables roll-up for the overview hero.
  const delivSummary = useMemo(() => {
    const rows = school?.deliverables || [];
    const out = { delivered: 0, progress: 0, pending: 0, na: 0, total: rows.length };
    rows.forEach((d) => {
      if (!d.applicable) return void out.na++;
      const tone = statusTone(d.status);
      if (tone === "green") out.delivered++;
      else if (tone === "rose") out.pending++;
      else out.progress++;
    });
    return out;
  }, [school]);

  // Kits inventory roll-up. Reads the current (totalQty/damagedQty) shape
  // and falls back to the older (quantity/damaged) shape so schools saved
  // before the KITS/Atal-Lab split still total up correctly.
  const kitTotals = useMemo(() => {
    const rows = school?.kitsRows || [];
    return {
      types: rows.length,
      units: rows.reduce((a, r) => a + num(r.totalQty ?? r.quantity), 0),
      damaged: rows.reduce((a, r) => a + num(r.damagedQty ?? r.damaged), 0),
    };
  }, [school]);

  // Atal Lab stock roll-up.
  const atalTotals = useMemo(() => {
    const rows = school?.atalLabRows || [];
    return {
      types: rows.length,
      units: rows.reduce((a, r) => a + num(r.componentsQty), 0),
      damaged: rows.reduce((a, r) => a + num(r.damagedQty), 0),
    };
  }, [school]);

  // Worksheets completion roll-up — used for the Hero's meta line.
  const worksheetsTotals = useMemo(() => {
    const data = school?.worksheetCompletionData || {};
    const gradeCount = Object.keys(data).length;
    const entries = Object.values(data).flatMap((acts) =>
      (acts || []).flatMap((a) => (a.sections?.length ? a.sections : [{}]))
    );
    const done = entries.filter((s) => statusTone(s.status) === "green").length;
    return { gradeCount, total: entries.length, done };
  }, [school]);

  if (!school) {
    return (
      <div className="rb-noschool">
        <div>
          <h2>No school data found</h2>
          <p>This account isn't linked to a school record yet. Contact your programme coordinator.</p>
        </div>
      </div>
    );
  }

  const goTo = (id) => {
    setActiveId(id);
    setNavOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  // Workbooks: older schools have no `workbooks` field at all — absent
  // means applicable, matching how enabledSections treats a missing key.
  const workbooksFlag = school.workbooks || { applicable: true };
  const hasWorkbookRows = (school.workbookRows || []).length > 0;
  const hasWorkbookCompletion = Object.keys(school.workbookCompletionData || {}).length > 0;
  const showWorkbooksData = workbooksFlag.applicable !== false || hasWorkbookRows || hasWorkbookCompletion;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rb-shell {
          --paper: #f3f5f9;
          --card: #ffffff;
          --line: #e6e9f0;
          --line-soft: #eef0f6;
          --text: #141728;
          --mute: #666b85;
          --dim: #c3c6d6;
          --green: #16803c; --green-bg: #e3f6ea;
          --amber: #b45309; --amber-bg: #fdeed3;
          --rose: #be123c;  --rose-bg: #fde5eb;
          --slate: #5b6478; --slate-bg: #eceef4;
          --display: 'Bricolage Grotesque', sans-serif;
          --body: 'Inter', system-ui, sans-serif;
          --mono: 'JetBrains Mono', monospace;

          min-height: 100vh; display: flex;
          background: var(--paper); color: var(--text); font-family: var(--body);
        }
        .rb-shell a { color: inherit; }
        .rb-dim { color: var(--dim); }

        /* ── LEFT RAIL — register index tabs ─────────────────────── */
        .rb-rail {
          width: 268px; flex-shrink: 0; background: var(--card);
          border-right: 1px solid var(--line);
          display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0;
        }
        .rb-rail-head { padding: 20px 18px 16px; border-bottom: 1px solid var(--line-soft); }
        .rb-rail-brand {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--mono); font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
          color: #5457D6; background: #5457D614; border: 1px solid #5457D63a;
          padding: 4px 9px; border-radius: 999px; text-transform: uppercase; margin-bottom: 10px;
        }
        .rb-rail-brand::before { content: ""; width: 6px; height: 6px; border-radius: 2px; background: #5457D6; }
        .rb-rail-school { font-family: var(--display); font-size: 16px; font-weight: 700; line-height: 1.3; }
        .rb-rail-sub { font-family: var(--mono); font-size: 10.5px; color: var(--mute); margin-top: 6px; }
        .rb-rail-id { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; min-width: 0; }

        /* School logo */
        .rb-logo { flex-shrink: 0; object-fit: contain; background: #fff; border: 1px solid var(--line); padding: 5px; box-shadow: 0 1px 3px rgba(20,23,40,0.08); }
        .rb-logo-fallback {
          display: flex; align-items: center; justify-content: center; padding: 0;
          font-family: var(--display); font-weight: 800; letter-spacing: 0.02em;
          color: #5457D6; background: #5457D610; border: 1px solid #5457D63a; user-select: none;
        }

        .rb-tabs { flex: 1; overflow-y: auto; padding: 10px; }
        .rb-tab {
          width: 100%; display: flex; align-items: center; gap: 10px; text-align: left;
          padding: 9px 10px; border: none; background: none; cursor: pointer; border-radius: 10px;
          margin-bottom: 2px; font-family: var(--body); position: relative;
        }
        .rb-tab:hover { background: var(--paper); }
        .rb-tab:focus-visible { outline: 2px solid #5457D6; outline-offset: 2px; }
        .rb-tab-idx {
          font-family: var(--mono); font-size: 10px; font-weight: 700; width: 22px; height: 22px;
          border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rb-tab-text { min-width: 0; }
        .rb-tab-label { font-size: 13px; font-weight: 600; color: #3a3f58; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rb-tab-note { font-size: 10.5px; color: var(--mute); }
        .rb-tab.active .rb-tab-label { color: var(--text); }
        .rb-tab.active::before {
          content: ""; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 3px;
          background: var(--tab-color);
        }

        .rb-rail-foot { padding: 12px 18px; border-top: 1px solid var(--line-soft); font-family: var(--mono); font-size: 10px; color: var(--mute); line-height: 1.5; }

        .rb-rail-toggle { display: none; }

        /* ── MAIN ───────────────────────────────────────────────── */
        .rb-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .rb-topbar {
          height: 58px; background: var(--card); border-bottom: 1px solid var(--line);
          display: flex; align-items: center; gap: 12px; padding: 0 28px; position: sticky; top: 0; z-index: 20;
        }
        .rb-crumb { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 11.5px; color: var(--mute); min-width: 0; }
        .rb-crumb b { color: var(--text); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rb-crumb-dot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
        .rb-top-actions { margin-left: auto; display: flex; align-items: center; gap: 10px; }
        .rb-user { display: flex; align-items: center; gap: 10px; background: var(--paper); border: 1px solid var(--line); border-radius: 999px; padding: 4px 5px 4px 12px; font-size: 12px; color: var(--mute); }
        .rb-user-email { max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rb-refresh {
          display: inline-flex; align-items: center; gap: 6px; background: var(--paper); border: 1px solid var(--line);
          color: var(--text); border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: var(--body);
        }
        .rb-refresh:hover { background: #eef0f6; }
        .rb-refresh:disabled { opacity: 0.6; cursor: default; }
        .rb-refresh-icon { display: inline-block; font-size: 13px; line-height: 1; }
        .rb-refresh-icon.spinning { animation: rb-spin 0.8s linear infinite; }
        @keyframes rb-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .rb-refresh-icon.spinning { animation: none; } }
        .rb-logout { background: var(--text); color: #fff; border: none; border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--body); }
        .rb-logout:hover { background: #2a2f4a; }

        .rb-content { flex: 1; width: 100%; max-width: 1060px; margin: 0 auto; padding: 26px 32px 80px; }

        /* ── HERO BAND ──────────────────────────────────────────── */
        .rb-hero {
          position: relative; overflow: hidden; border: 1px solid; border-radius: 18px;
          padding: 26px 30px; margin-bottom: 22px; background: var(--card);
        }
        .rb-hero::after {
          content: ""; position: absolute; inset: 0;
          background-image: radial-gradient(circle, var(--hero-dot) 1.1px, transparent 1.4px);
          background-size: 17px 17px; opacity: 0.10; pointer-events: none;
          -webkit-mask-image: linear-gradient(100deg, transparent 45%, #000 100%);
          mask-image: linear-gradient(100deg, transparent 45%, #000 100%);
        }
        .rb-hero-body { position: relative; z-index: 1; max-width: 680px; display: flex; align-items: flex-start; gap: 18px; }
        .rb-hero-lead { flex-shrink: 0; margin-top: 3px; }
        .rb-hero-text { flex: 1; min-width: 0; }
        .rb-hero-eyebrow { font-family: var(--mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
        .rb-hero-title { font-family: var(--display); font-size: 27px; font-weight: 800; letter-spacing: -0.01em; line-height: 1.15; }
        .rb-hero-subtitle { font-family: var(--body); font-size: 13.5px; font-weight: 600; font-style: italic; margin-top: 6px; letter-spacing: 0.01em; }
        .rb-hero-meta { font-size: 13px; color: var(--mute); margin-top: 8px; max-width: 520px; }
        .rb-hero-num {
          position: absolute; right: 22px; top: 50%; transform: translateY(-50%);
          font-family: var(--display); font-weight: 800; font-size: 96px; opacity: 0.12; line-height: 1; z-index: 0;
          user-select: none;
        }

        /* Delivery roll-up inside overview hero */
        .rb-rollup { margin-top: 18px; }
        .rb-rollup-bar { display: flex; height: 12px; border-radius: 999px; overflow: hidden; background: #ffffffa0; border: 1px solid #00000010; }
        .rb-rollup-bar span { display: block; height: 100%; }
        .rb-rollup-legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 10px; font-size: 11.5px; color: var(--mute); }
        .rb-rollup-legend i { display: inline-block; width: 9px; height: 9px; border-radius: 3px; margin-right: 6px; font-style: normal; }
        .rb-rollup-legend b { color: var(--text); }

        /* ── PANELS ─────────────────────────────────────────────── */
        .rb-panel {
          background: var(--card); border: 1px solid var(--line); border-radius: 16px;
          padding: 22px 24px; margin-bottom: 18px; box-shadow: 0 1px 2px rgba(20,23,40,0.04);
        }
        .rb-panel-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .rb-panel-mark { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
        .rb-panel-title { font-family: var(--display); font-size: 15.5px; font-weight: 700; }
        .rb-panel-chip { margin-left: auto; font-family: var(--mono); font-size: 10.5px; font-weight: 700; color: var(--mute); background: var(--paper); border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; white-space: nowrap; }

        .rb-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
        .rb-stat { display: flex; gap: 11px; align-items: flex-start; background: var(--paper); border: 1px solid var(--line-soft); border-radius: 12px; padding: 13px 14px; }
        .rb-stat-dot { width: 24px; height: 24px; border-radius: 8px; border: 1px solid; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .rb-stat-dot span { width: 8px; height: 8px; border-radius: 3px; display: block; }
        .rb-stat-label { font-family: var(--mono); font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--mute); }
        .rb-stat-value { font-family: var(--display); font-size: 18px; font-weight: 700; margin-top: 3px; line-height: 1.25; word-break: break-word; }
        .rb-stat-hint { font-size: 11px; color: var(--mute); margin-top: 2px; }

        .rb-updated { font-family: var(--mono); font-size: 11px; color: var(--mute); margin-top: 14px; }

        /* Bars */
        .rb-bars { display: flex; flex-direction: column; gap: 10px; }
        .rb-bar-row { display: grid; grid-template-columns: 84px 1fr 48px; align-items: center; gap: 12px; }
        .rb-bar-label { font-size: 12.5px; font-weight: 600; }
        .rb-bar-track { height: 12px; background: var(--slate-bg); border-radius: 999px; overflow: hidden; }
        .rb-bar-fill { height: 100%; border-radius: 999px; }
        .rb-bar-value { font-family: var(--mono); font-size: 12px; font-weight: 600; text-align: right; color: var(--mute); }

        /* Applicability */
        .rb-applic { border: 1px dashed var(--line); border-radius: 14px; padding: 20px 22px; background: var(--paper); }
        .rb-applic-note { font-size: 13.5px; line-height: 1.6; margin-top: 10px; color: #3a3f58; max-width: 620px; }

        /* Tables */
        .rb-table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 12px; }
        .rb-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 620px; }
        .rb-table th {
          position: sticky; top: 0; background: #f8f9fc; text-align: left; padding: 10px 12px;
          font-family: var(--mono); font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
          color: var(--mute); border-bottom: 1px solid var(--line); white-space: nowrap;
        }
        .rb-table td { padding: 10px 12px; border-top: 1px solid var(--line-soft); vertical-align: top; }
        .rb-table tbody tr:first-child td { border-top: none; }
        .rb-table tbody tr:hover td { background: #fafbfe; }
        .rb-num { font-family: var(--mono); font-weight: 600; }
        .rb-dmg { font-family: var(--mono); font-weight: 700; color: var(--rose); background: var(--rose-bg); border-radius: 6px; padding: 1px 8px; }
        .rb-date { font-family: var(--mono); font-size: 12px; white-space: nowrap; }

        .rb-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.03em; white-space: nowrap; font-family: var(--mono); }
        .rb-badge-green { background: var(--green-bg); color: var(--green); }
        .rb-badge-amber { background: var(--amber-bg); color: var(--amber); }
        .rb-badge-rose  { background: var(--rose-bg);  color: var(--rose); }
        .rb-badge-slate { background: var(--slate-bg); color: var(--slate); }

        .rb-link { font-weight: 600; font-size: 12.5px; color: #4649c9 !important; text-decoration: none; white-space: nowrap; }
        .rb-link:hover { text-decoration: underline; }

        /* Uploaded photo thumbnails (Media section) */
        .rb-photo-strip { display: flex; flex-wrap: wrap; gap: 6px; max-width: 240px; }
        .rb-photo-thumb { display: block; width: 46px; height: 46px; border-radius: 7px; overflow: hidden; border: 1px solid var(--line); flex-shrink: 0; }
        .rb-photo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .rb-empty { text-align: center; padding: 38px 20px; border: 1px dashed var(--line); border-radius: 12px; background: var(--paper); }
        .rb-empty-dots { display: inline-flex; gap: 5px; margin-bottom: 12px; }
        .rb-empty-dots span { width: 8px; height: 8px; border-radius: 3px; background: var(--dim); }
        .rb-empty p { font-size: 13px; color: #3a3f58; font-weight: 500; }
        .rb-empty-sub { font-size: 11.5px !important; color: var(--mute) !important; font-weight: 400 !important; margin-top: 4px; }

        /* Grade-wise activity completion — shared by Worksheets & Workbooks */
        .rb-gct { margin-bottom: 22px; }
        .rb-gct:last-child { margin-bottom: 0; }
        .rb-gct-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
        .rb-gct-grade { font-family: var(--display); font-size: 14px; font-weight: 800; letter-spacing: 0.01em; }
        .rb-gct-count { font-family: var(--mono); font-size: 10.5px; color: var(--mute); }
        .rb-gct-table { min-width: 560px; }
        .rb-gct-table td { padding: 7px 12px; }
        .rb-gct-first td { border-top: 1px solid var(--line); }
        .rb-gct-table tbody tr:first-child td { border-top: none; }
        .rb-gct-name { font-size: 12.5px; font-weight: 600; }
        .rb-gct-section { font-family: var(--mono); font-size: 12px; font-weight: 600; }
        .rb-gct-empty { text-align: center; color: var(--mute); font-size: 12.5px; padding: 18px; }

        /* Legacy grouped kits */
        .rb-kit-group { margin-bottom: 20px; }
        .rb-kit-group-title { font-family: var(--mono); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--mute); margin-bottom: 10px; }

        .rb-noschool { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f5f9; font-family: 'Inter', sans-serif; text-align: center; padding: 40px; }
        .rb-noschool h2 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; margin-bottom: 8px; }
        .rb-noschool p { color: #666b85; font-size: 14px; }

        /* ═══════════════════════════════════════════════════════════════
           FACULTY PROFILE — poster-style card, recreated from the source
           faculty-profile design. Deliberately its own visual register
           (navy/orange, ribbon, seal) rather than the spreadsheet look
           used elsewhere on this dashboard — see the top-of-file note.
           ═══════════════════════════════════════════════════════════════ */
        .fp-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; overflow: hidden; }

        .fp-header {
          position: relative; padding: 26px 30px 22px;
          background: linear-gradient(160deg, #fdfdfd 0%, #f3f5f9 100%);
          border-bottom: 3px solid #0f172a;
        }
        .fp-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .fp-brand-mark {
          width: 34px; height: 34px; border-radius: 8px; background: #0f172a; color: #F7941D;
          font-family: var(--display); font-weight: 800; font-size: 13px;
          display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .fp-brand-name { font-family: var(--display); font-weight: 800; font-size: 15px; color: #0f172a; letter-spacing: 0.01em; }
        .fp-brand-name span { color: #F7941D; }
        .fp-brand-tag { font-family: var(--mono); font-size: 9.5px; color: var(--mute); letter-spacing: 0.06em; }

        .fp-ribbon {
          position: absolute; top: 0; right: 26px; background: #0f172a; color: #fff;
          font-family: var(--mono); font-size: 9.5px; font-weight: 700; letter-spacing: 0.05em;
          padding: 10px 16px 24px; text-align: center; line-height: 1.6;
          clip-path: polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%);
          max-width: 150px;
        }
        .fp-ribbon span { display: block; }

        .fp-header-body { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; }
        .fp-header-text { flex: 1; min-width: 220px; }
        .fp-eyebrow { font-family: var(--display); font-weight: 800; font-size: 25px; color: #0f172a; letter-spacing: -0.01em; }
        .fp-eyebrow span { color: #F7941D; }
        .fp-eyebrow-rule { width: 60px; height: 4px; background: #F7941D; border-radius: 2px; margin: 8px 0 14px; }
        .fp-name { font-family: var(--display); font-size: 23px; font-weight: 800; color: #0f172a; line-height: 1.2; }
        .fp-title { font-family: var(--body); font-size: 13.5px; font-weight: 700; color: #F7941D; margin-top: 4px; }

        .fp-photo-wrap { flex-shrink: 0; }
        .fp-photo { width: 106px; height: 106px; border-radius: 999px; object-fit: cover; border: 3px solid #0f172a; padding: 3px; background: #fff; }
        .fp-photo-fallback {
          display: flex; align-items: center; justify-content: center;
          font-family: var(--display); font-weight: 800; font-size: 30px; color: #0f172a; background: #eef0f6;
        }

        .fp-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 20px 26px; border-bottom: 1px solid var(--line); }
        .fp-stat { text-align: center; }
        .fp-stat-icon {
          width: 38px; height: 38px; border-radius: 999px; background: #0f172a; color: #fff;
          display: inline-flex; align-items: center; justify-content: center; font-size: 16px; margin-bottom: 8px;
        }
        .fp-stat-value { font-family: var(--display); font-weight: 800; font-size: 18px; color: #0f172a; }
        .fp-stat-label { font-size: 10px; color: var(--mute); margin-top: 3px; line-height: 1.3; }

        .fp-grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--line); }
        .fp-panel { padding: 20px 26px; }
        .fp-panel:first-child { border-right: 1px solid var(--line); }
        .fp-panel-head { display: flex; align-items: center; gap: 8px; font-family: var(--display); font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 14px; }
        .fp-panel-icon { font-size: 14px; }

        .fp-bars { display: flex; flex-direction: column; gap: 12px; }
        .fp-bar-row { display: grid; grid-template-columns: 18px 128px 1fr 34px; align-items: center; gap: 8px; }
        .fp-bar-icon { font-size: 13px; }
        .fp-bar-label { font-size: 11.5px; font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fp-bar-track { height: 8px; background: #eef0f6; border-radius: 999px; overflow: hidden; }
        .fp-bar-fill { height: 100%; background: #0f172a; border-radius: 999px; }
        .fp-bar-pct { font-family: var(--mono); font-size: 11px; font-weight: 700; color: #0f172a; text-align: right; }

        .fp-checklist { list-style: none; display: flex; flex-direction: column; gap: 9px; }
        .fp-checklist li { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #334155; line-height: 1.4; }
        .fp-check {
          width: 17px; height: 17px; border-radius: 5px; background: #0f172a; color: #fff;
          display: inline-flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; margin-top: 1px;
        }

        .fp-tools { display: grid; grid-template-columns: 1fr 1fr; gap: 11px 16px; }
        .fp-tool { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: #334155; }
        .fp-tool-icon { width: 20px; text-align: center; flex-shrink: 0; }

        .fp-strengths { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .fp-strength {
          display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
          background: #f8f9fc; border: 1px solid var(--line-soft); border-radius: 10px; padding: 12px 8px;
          font-size: 10.5px; font-weight: 600; color: #334155;
        }
        .fp-strength-icon { font-size: 16px; }

        .fp-footer {
          background: #0f172a; color: #e2e8f0; padding: 22px 26px;
          display: grid; grid-template-columns: 1.1fr 0.9fr 1fr; gap: 22px; align-items: center;
        }
        .fp-quote { font-size: 12px; line-height: 1.6; font-style: italic; color: #f1f5f9; }
        .fp-quote-mark { color: #F7941D; font-size: 17px; font-weight: 800; font-style: normal; }
        .fp-contact { display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; }
        .fp-sign { display: flex; align-items: center; gap: 14px; justify-content: flex-end; }
        .fp-sign-block { text-align: right; }
        .fp-sign-script { font-family: var(--display); font-size: 15px; color: #F7941D; font-style: italic; font-weight: 700; }
        /* Uploaded signature image sits on a small white card so it stays
           legible over the dark footer regardless of the image's own
           background (transparent PNGs and opaque scans both work). */
        .fp-sign-img-wrap { display: inline-block; background: #fff; border-radius: 8px; padding: 5px 12px; }
        .fp-sign-img { display: block; height: 30px; width: auto; max-width: 150px; object-fit: contain; }
        .fp-sign-name { font-size: 12px; font-weight: 700; color: #F7941D; margin-top: 4px; }
        .fp-sign-title { font-size: 10px; color: #94a3b8; }
        .fp-seal {
          width: 58px; height: 58px; border-radius: 999px; border: 2px solid #caa227; flex-shrink: 0;
          background: radial-gradient(circle, #1a2540, #0f172a);
          display: flex; align-items: center; justify-content: center; padding: 6px;
        }
        .fp-seal-inner { font-family: var(--mono); font-size: 6.5px; font-weight: 700; color: #d9b74a; text-align: center; line-height: 1.3; letter-spacing: 0.02em; }

        .fp-tagline {
          background: #F7941D; color: #0f172a; text-align: center; font-family: var(--mono);
          font-size: 10px; font-weight: 700; letter-spacing: 0.07em; padding: 10px; text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .rb-shell { flex-direction: column; }
          .rb-rail { position: sticky; top: 0; z-index: 40; width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--line); }
          .rb-rail-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px; border-bottom: none; }
          .rb-rail-id { flex-direction: row; align-items: center; }
          .rb-rail-id .rb-logo { width: 40px !important; height: 40px !important; border-radius: 10px !important; }
          .rb-rail-brand { display: none; }
          .rb-rail-school { font-size: 14px; }
          .rb-rail-sub { display: none; }
          .rb-hero-lead .rb-logo { width: 60px !important; height: 60px !important; border-radius: 14px !important; }
          .rb-rail-toggle { display: inline-flex; background: var(--paper); border: 1px solid var(--line); color: var(--text); border-radius: 8px; padding: 7px 12px; font-family: var(--mono); font-size: 11px; font-weight: 700; cursor: pointer; }
          .rb-tabs { display: none; padding: 4px 10px 12px; }
          .rb-rail.open .rb-tabs { display: block; max-height: 60vh; }
          .rb-rail-foot { display: none; }
          .rb-topbar { padding: 0 16px; }
          .rb-user-email { display: none; }
          .rb-content { padding: 18px 14px 60px; }
          .rb-hero { padding: 20px; }
          .rb-hero-title { font-size: 21px; }
          .rb-hero-num { display: none; }
          .rb-panel { padding: 16px; }

          .fp-header { padding: 20px; }
          .fp-ribbon { position: static; margin-bottom: 14px; max-width: none; clip-path: none; border-radius: 8px; padding: 8px 12px; }
          .fp-ribbon span { display: inline; }
          .fp-ribbon span + span::before { content: " "; }
          .fp-header-body { flex-direction: column; align-items: flex-start; }
          .fp-stats { grid-template-columns: repeat(3, 1fr); gap: 14px 8px; padding: 18px; }
          .fp-grid { grid-template-columns: 1fr; }
          .fp-panel:first-child { border-right: none; border-bottom: 1px solid var(--line); }
          .fp-panel { padding: 18px; }
          .fp-tools, .fp-strengths { grid-template-columns: 1fr 1fr; }
          .fp-footer { grid-template-columns: 1fr; text-align: left; padding: 20px; }
          .fp-sign { justify-content: flex-start; }
        }
      `}</style>

      <div className="rb-shell">
        {/* ── Left rail: register index tabs ─────────────────────── */}
        <aside className={`rb-rail ${navOpen ? "open" : ""}`}>
          <div className="rb-rail-head">
            <div className="rb-rail-id">
              <SchoolLogo school={school} size={72} radius={16} />
              <div style={{ minWidth: 0 }}>
                <div className="rb-rail-brand">Cyberbots AEDS</div>
                <div className="rb-rail-school">{school.name}</div>
                <div className="rb-rail-sub">
                  AY {school.year} · Grades {school.grades}
                </div>
              </div>
            </div>
            <button className="rb-rail-toggle" onClick={() => setNavOpen((o) => !o)}>
              {navOpen ? "Close" : "Sheets"}
            </button>
          </div>

          <nav className="rb-tabs" aria-label="Register sheets">
            {visibleSections.map((s, i) => {
              const isActive = activeId === s.id;
              return (
                <button
                  key={s.id}
                  className={`rb-tab${isActive ? " active" : ""}`}
                  style={{ "--tab-color": s.color, background: isActive ? `${s.color}12` : undefined }}
                  onClick={() => goTo(s.id)}
                >
                  <span
                    className="rb-tab-idx"
                    style={isActive
                      ? { background: s.color, color: "#fff" }
                      : { background: `${s.color}16`, color: s.color }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="rb-tab-text">
                    <span className="rb-tab-label">{s.label}</span><br />
                    <span className="rb-tab-note">{s.note}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="rb-rail-foot">
            Cyberbots · Academic Enrichment<br />Delivery System
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────────── */}
        <div className="rb-main">
          <div className="rb-topbar">
            <div className="rb-crumb">
              <span className="rb-crumb-dot" style={{ background: active.color }} />
              AEDS / <b>{active.label}</b>
            </div>
            <div className="rb-top-actions">
              {onRefresh && (
                <button
                  className="rb-refresh"
                  onClick={() => onRefresh()}
                  disabled={refreshing}
                  title="Reload this school's data — use this after your admin ticks/unticks a section"
                >
                  <span className={`rb-refresh-icon${refreshing ? " spinning" : ""}`} aria-hidden="true">⟳</span>
                  {refreshing ? "Refreshing…" : "Refresh"}
                </button>
              )}
              {onLogout && (
                <div className="rb-user">
                  {userEmail && <span className="rb-user-email">{userEmail}</span>}
                  <button className="rb-logout" onClick={onLogout}>Log out</button>
                </div>
              )}
            </div>
          </div>

          <main className="rb-content">
            {/* ═══ 01 · AEDS OVERVIEW ═══════════════════════════════ */}
            {activeId === "aeds" && (
              <>
                <Hero
                  index={activeIndex}
                  total={visibleSections.length}
                  section={active}
                  leading={<SchoolLogo school={school} size={88} radius={18} />}
                  title={school.name}
                  subtitle="Our Crown Jewel Institution"
                  meta={`Academic year ${school.year || "—"} · ${school.workingDays || "—"}`}
                >
                  {delivSummary.total > 0 && (
                    <div className="rb-rollup">
                      <div className="rb-rollup-bar" role="img" aria-label="Deliverables status breakdown">
                        {delivSummary.delivered > 0 && <span style={{ flex: delivSummary.delivered, background: "#16A34A" }} />}
                        {delivSummary.progress > 0 && <span style={{ flex: delivSummary.progress, background: "#D97706" }} />}
                        {delivSummary.pending > 0 && <span style={{ flex: delivSummary.pending, background: "#E11D48" }} />}
                        {delivSummary.na > 0 && <span style={{ flex: delivSummary.na, background: "#c3c6d6" }} />}
                      </div>
                      <div className="rb-rollup-legend">
                        <span><i style={{ background: "#16A34A" }} /><b>{delivSummary.delivered}</b> delivered</span>
                        <span><i style={{ background: "#D97706" }} /><b>{delivSummary.progress}</b> in progress</span>
                        <span><i style={{ background: "#E11D48" }} /><b>{delivSummary.pending}</b> not delivered</span>
                        <span><i style={{ background: "#c3c6d6" }} /><b>{delivSummary.na}</b> not applicable</span>
                      </div>
                    </div>
                  )}
                </Hero>

                <Panel color={active.color} title="Programme details">
                  <div className="rb-stat-grid">
                    <Stat label="Academic year" value={school.year} color={active.color} />
                    <Stat label="School name" value={school.name} color={active.color} />
                    <Stat label="Faculty name" value={school.faculty} color={active.color} />
                    <Stat label="Grades" value={school.grades} color={active.color} />
                    <Stat label="Total student count" value={school.totalStudents} color={active.color} />
                    <Stat label="Working days" value={school.workingDays} color={active.color} />
                    <Stat label="Last updated on" value={fmtDate(school.lastUpdatedOn) || undefined} hint={school.lastUpdatedBy ? `by ${school.lastUpdatedBy}` : undefined} color={active.color} />
                    <Stat label="Last reviewed on" value={fmtDate(school.lastReviewedOn) || undefined} hint={school.lastReviewedBy ? `by ${school.lastReviewedBy}` : undefined} color={active.color} />
                  </div>
                  {school.updatedAt && (
                    <div className="rb-updated">Record last synced {new Date(school.updatedAt).toLocaleString()}</div>
                  )}
                </Panel>

                <Panel color={active.color} title="Students per grade" chip={`${gradeSeries.reduce((a, g) => a + g.value, 0)} students`}>
                  {gradeSeries.length === 0 ? (
                    <EmptyState label="the grade-wise student count" />
                  ) : (
                    <div className="rb-bars">
                      {gradeSeries.map((g, i) => (
                        <BarRow key={i} label={g.label} value={g.value} max={gradeMax} color={CHART_PALETTE[i % CHART_PALETTE.length]} />
                      ))}
                    </div>
                  )}
                </Panel>

                <Panel color={active.color} title="Deliverables" chip={delivSummary.total ? `${delivSummary.total} items` : null}>
                  <DataTable
                    emptyLabel="deliverables"
                    rows={school.deliverables}
                    columns={[
                      { key: "name", label: "Deliverable" },
                      { key: "applicable", label: "Applicable / Not Applicable", render: (v) => <Badge status={v ? "APPLICABLE" : "NOT APPLICABLE"} /> },
                      { key: "grades", label: "Grade" },
                      { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
                    ]}
                  />
                </Panel>
              </>
            )}

            {/* ═══ FACULTY PROFILE ═══════════════════════════════════
                An infographic-style bio card for this school's faculty
                member — photo, headline stats, expertise bars, teaching
                checklist, tools & technologies, key strengths, and a
                footer with quote / contact / signatory / certification
                seal. See FacultyProfileSection above. */}
            {activeId === "facultyProfile" && (
              <>
                <Hero
                  index={activeIndex}
                  total={visibleSections.length}
                  section={active}
                  meta="The faculty member assigned to this school — background, expertise, and the tools they teach with."
                />
                <FacultyProfileSection school={school} color={active.color} />
              </>
            )}

            {/* ═══ WORKBOOKS ═════════════════════════════════════════
                Leads with the applicability card (school.workbooks — the
                register marks Blessings CBSE's Books & Learning Materials
                as NOT APPLICABLE). The register table and any completion
                grid only render underneath when there's something to
                show, so a NOT APPLICABLE school isn't followed by two
                empty tables saying nothing has been logged. */}
            {activeId === "workbooks" && (
              <>
                <Hero
                  index={activeIndex}
                  total={visibleSections.length}
                  section={active}
                  meta="Books and learning materials issued per grade, with damage and replacement records."
                />

                <Panel color={active.color} title="Applicability">
                  <ApplicabilityCard data={workbooksFlag} sheetLabel="workbooks" color={active.color} />
                </Panel>

                {showWorkbooksData && (
                  <>
                    <Panel
                      color={active.color}
                      title="Workbooks register"
                      chip={hasWorkbookRows ? `${school.workbookRows.reduce((a, r) => a + num(r.count), 0)} books issued` : null}
                    >
                      <DataTable
                        emptyLabel="the workbooks register"
                        rows={school.workbookRows}
                        columns={[
                          { key: "grade", label: "Grade" },
                          { key: "count", label: "Total Count", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                          dateCol("dateIssued", "Date Issued"),
                          { key: "damage", label: "Damage / Replacements", render: (v) => (isBlank(v) ? dash : <Badge status={String(v).toUpperCase() === "NO" ? "CLOSED" : "OPEN"} />) },
                          { key: "replacementDetails", label: "Replacement Details (Count)" },
                          { key: "remarks", label: "Remarks / Justification" },
                        ]}
                      />
                    </Panel>

                    {hasWorkbookCompletion && (
                      <Panel color={active.color} title="Activity completion, by grade">
                        <CompletionByGrade
                          data={school.workbookCompletionData}
                          color={active.color}
                          emptyLabel="workbook activity completion"
                        />
                      </Panel>
                    )}
                  </>
                )}
              </>
            )}

            {/* ═══ WORKSHEETS ════════════════════════════════════════
                The register workbook keeps its grade-wise activity grid
                here, not on Workbooks — Grades 4-9, ACTIVITY NAME /
                GRADE / SECTION / COMPLETION DATE / STATUS, one row per
                class section. Reads school.worksheetCompletionData. */}
            {activeId === "worksheets" && (
              <>
                <Hero
                  index={activeIndex}
                  total={visibleSections.length}
                  section={active}
                  meta={
                    worksheetsTotals.gradeCount
                      ? `Activity-based worksheets across ${worksheetsTotals.gradeCount} grade${worksheetsTotals.gradeCount === 1 ? "" : "s"} — ${worksheetsTotals.done} of ${worksheetsTotals.total} section entries completed.`
                      : "Activity-based worksheets, tracked per grade and per class section."
                  }
                />

                <Panel color={active.color} title="Applicability">
                  <ApplicabilityCard data={school.worksheets} sheetLabel="worksheets" color={active.color} />
                </Panel>

                {(school.worksheets?.applicable || worksheetsTotals.gradeCount > 0) && (
                  <Panel
                    color={active.color}
                    title="Activity completion, by grade"
                    chip={worksheetsTotals.gradeCount ? `${worksheetsTotals.gradeCount} grades` : null}
                  >
                    <CompletionByGrade
                      data={school.worksheetCompletionData}
                      color={active.color}
                      emptyLabel="worksheet activity completion"
                    />
                  </Panel>
                )}
              </>
            )}

            {/* ═══ KITS ═══════════════════════════════════════════════ */}
            {activeId === "kits" && (
              <>
                <Hero
                  index={activeIndex}
                  total={visibleSections.length}
                  section={active}
                  meta={
                    kitTotals.types
                      ? `${kitTotals.types} component types · ${kitTotals.units} units in stock · ${kitTotals.damaged} damaged or missing`
                      : "Robotics & AI kit boxes and component-level inventory."
                  }
                />

                <Panel color={active.color} title="Inventory details">
                  <div className="rb-stat-grid">
                    <Stat label="No. of kit boxes" value={school.kitsMeta?.noOfKitBoxes} color={active.color} />
                    <Stat label="Issued date" value={fmtDate(school.kitsMeta?.issuedDate) || undefined} color={active.color} />
                    <Stat label="Refilled date" value={fmtDate(school.kitsMeta?.refilledDate) || undefined} color={active.color} />
                    <Stat label="Last updated on" value={fmtDate(school.kitsMeta?.lastUpdatedOn) || undefined} color={active.color} />
                  </div>
                </Panel>

                <Panel color={active.color} title="Component inventory" chip={kitTotals.types ? `${kitTotals.types} components` : null}>
                  <DataTable
                    emptyLabel="the kit component inventory"
                    rows={school.kitsRows}
                    columns={[
                      { key: "component", label: "Components Name" },
                      {
                        key: "damagedQty", label: "Damaged Qty", align: "right",
                        render: (v, r) => {
                          const val = v ?? r.damaged;
                          return isBlank(val) || val === "-" || num(val) === 0 ? dash : <span className="rb-dmg">{val}</span>;
                        },
                      },
                      {
                        key: "workingQty", label: "Working Qty", align: "right",
                        render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>),
                      },
                      {
                        key: "totalQty", label: "Total Qty", align: "right",
                        render: (v, r) => {
                          const val = v ?? r.quantity;
                          return isBlank(val) || val === "-" ? dash : <span className="rb-num">{val}</span>;
                        },
                      },
                      {
                        key: "refillQty", label: "Refill / Required Qty", align: "right",
                        render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>),
                      },
                    ]}
                  />
                </Panel>

                {/* Legacy grouped per-box data, if this school still has it */}
                {school.kitsData && Object.keys(school.kitsData).length > 0 && (
                  <Panel color={active.color} title="Per-box breakdown">
                    {Object.entries(school.kitsData).map(([group, components]) => (
                      <div className="rb-kit-group" key={group}>
                        <div className="rb-kit-group-title">{group}</div>
                        <DataTable
                          emptyLabel={group}
                          rows={components}
                          columns={[
                            { key: "component", label: "Component" },
                            { key: "box1", label: "Box 1" }, { key: "box2", label: "Box 2" },
                            { key: "box3", label: "Box 3" }, { key: "box4", label: "Box 4" },
                            { key: "box5", label: "Box 5" }, { key: "damaged", label: "Damaged" },
                            { key: "total", label: "Total" },
                          ]}
                        />
                      </div>
                    ))}
                  </Panel>
                )}
              </>
            )}

            {/* ═══ ATAL LAB ═══════════════════════════════════════════ */}
            {activeId === "atallab" && (
              <>
                <Hero
                  index={activeIndex}
                  total={visibleSections.length}
                  section={active}
                  meta={
                    atalTotals.types
                      ? `${atalTotals.types} component types tracked in the school's own Atal Tinkering Lab stock.`
                      : "School Atal Lab stock — its own register, separate from the Robotics & AI kit boxes."
                  }
                />

                <Panel color={active.color} title="Atal Lab stock list" chip={atalTotals.types ? `${atalTotals.types} components` : null}>
                  <DataTable
                    emptyLabel="the Atal Lab stock list"
                    rows={school.atalLabRows}
                    columns={[
                      { key: "component", label: "Name of the Component" },
                      { key: "componentsQty", label: "Components Qty", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      { key: "workingQty", label: "Working Qty", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      {
                        key: "damagedQty", label: "Damaged Qty", align: "right",
                        render: (v) => {
                          const s = String(v ?? "").trim().toUpperCase();
                          return isBlank(v) || s === "NIL" || s === "-" || num(v) === 0 ? dash : <span className="rb-dmg">{v}</span>;
                        },
                      },
                    ]}
                  />
                </Panel>
              </>
            )}

            {/* ═══ STEM ═══════════════════════════════════════════════ */}
            {activeId === "stem" && (
              <>
                <Hero index={activeIndex} total={visibleSections.length} section={active} meta="STEM kits are an optional deliverable, issued per grade level and term where opted." />
                <Panel color={active.color} title="Applicability">
                  <ApplicabilityCard data={school.stem} sheetLabel="STEM kits" color={active.color} />
                </Panel>
                {(school.stem?.applicable || (school.stemRows && school.stemRows.length > 0)) && (
                  <Panel color={active.color} title="STEM kits register">
                    <DataTable
                      emptyLabel="the STEM kits register"
                      rows={school.stemRows}
                      columns={[
                        { key: "gradeLevel", label: "Grade Level" },
                        { key: "term", label: "Term" },
                        { key: "totalCount", label: "Total Count Issued", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                        dateCol("dateIssued", "Date Issued"),
                        { key: "damage", label: "Damage / Replacements" },
                        { key: "replacementDetails", label: "Replacement Details (Count)" },
                        { key: "remarks", label: "Remarks / Justification" },
                      ]}
                    />
                  </Panel>
                )}
              </>
            )}

            {/* ═══ WORKDONE ═══════════════════════════════════════════ */}
            {activeId === "workdone" && (
              <>
                <Hero index={activeIndex} total={visibleSections.length} section={active} meta={`Monthly work done report — ${school.year || "current academic year"}.`} />
                <Panel color={active.color} title="Monthly submissions" chip={school.workdoneRows?.length ? `${school.workdoneRows.length} months` : null}>
                  <DataTable
                    emptyLabel="the monthly work done report"
                    rows={school.workdoneRows}
                    columns={[
                      { key: "month", label: "Month" },
                      dateCol("date", "Submission Date"),
                      { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
                      { key: "link", label: "Link", render: (v, r) => <LinkCell href={v} label={r.linkLabel} /> },
                      { key: "remedial", label: "Remedial Measures (if applicable)" },
                    ]}
                  />
                </Panel>
              </>
            )}

            {/* ═══ MEDIA ══════════════════════════════════════════════ */}
            {activeId === "media" && (
              <>
                <Hero index={activeIndex} total={visibleSections.length} section={active} meta="Practical class photos and videos, shared month by month via Drive — plus any photos uploaded directly." />
                <Panel color={active.color} title="Media sharing log">
                  <DataTable
                    emptyLabel="the practical class media log"
                    rows={school.mediaRows}
                    columns={[
                      { key: "month", label: "Month", render: (v, r) => (isBlank(v) ? (isBlank(r.period) ? dash : String(r.period)) : String(v)) },
                      { key: "grades", label: "Grades" },
                      { key: "photos", label: "Photos Shared (Count)", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      { key: "videos", label: "Videos Shared (Count)", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      dateCol("dateShared", "Date Shared"),
                      { key: "link", label: "Drive Link", render: (v) => <LinkCell href={v} label="Open Drive" /> },
                      { key: "files", label: "Uploaded Photos", render: (v) => <PhotoThumbs files={v} /> },
                      { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
                      { key: "remarks", label: "Remarks / Justification" },
                    ]}
                  />
                </Panel>
              </>
            )}

            {/* ═══ ASSESSMENTS ════════════════════════════════════════ */}
            {activeId === "assessments" && (
              <>
                <Hero index={activeIndex} total={visibleSections.length} section={active} meta={`Assessment register — academic year ${school.year || "—"}, with attendance per cycle.`} />
                <Panel color={active.color} title="Assessment register">
                  <DataTable
                    emptyLabel="the assessment register"
                    rows={school.assessmentRows}
                    columns={[
                      { key: "assessmentNo", label: "Assessment No", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      dateCol("date", "Date Conducted"),
                      { key: "sections", label: "Grade / Sections", render: (v) => (Array.isArray(v) ? (v.join(", ") || dash) : (isBlank(v) ? dash : String(v))) },
                      { key: "attended", label: "Students Attended", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      { key: "absent", label: "Students Absent", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
                      { key: "remarks", label: "Remarks / Justification" },
                    ]}
                  />
                </Panel>
              </>
            )}

            {/* ═══ REPORT CARDS ═══════════════════════════════════════ */}
            {activeId === "reportcards" && (
              <>
                <Hero index={activeIndex} total={visibleSections.length} section={active} meta={`Skill-set report cards issued per grade — ${school.year || "current academic year"}.`} />
                <Panel color={active.color} title="Report cards register">
                  <DataTable
                    emptyLabel="skill-set report cards"
                    rows={school.reportCardRows}
                    columns={[
                      { key: "grade", label: "Grade" },
                      { key: "sections", label: "Sections" },
                      dateCol("issuedDate", "Issued Date"),
                      { key: "assessmentNo", label: "Assessment No", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
                      { key: "remarks", label: "Remarks / Justification" },
                    ]}
                  />
                </Panel>
              </>
            )}

            {/* ═══ FACULTY OBSERVATION ════════════════════════════════ */}
            {activeId === "faculty" && (
              <>
                <Hero index={activeIndex} total={visibleSections.length} section={active} meta="Observations logged for this school's faculty, with resolutions and review dates." />
                <Panel color={active.color} title="Observations & resolutions">
                  <DataTable
                    emptyLabel="faculty observations"
                    rows={school.facultyObservationRows}
                    columns={[
                      dateCol("observationDate", "Observation Date"),
                      { key: "issueNoted", label: "Issue Noted" },
                      { key: "resolutionTaken", label: "Resolution Taken" },
                      dateCol("nextReviewDate", "Next Review Date"),
                      { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
                      { key: "remarks", label: "Remarks / Justification" },
                    ]}
                  />
                </Panel>
              </>
            )}

            {/* ═══ EXPO ═══════════════════════════════════════════════ */}
            {activeId === "expo" && (
              <>
                <Hero index={activeIndex} total={visibleSections.length} section={active} meta={`Expo and competitions participation — ${school.year || "current academic year"}.`} />
                <Panel color={active.color} title="Expo / competitions register">
                  <DataTable
                    emptyLabel="expo participation records"
                    rows={school.expoRows}
                    columns={[
                      { key: "name", label: "Expo Name" },
                      dateCol("date", "Date"),
                      { key: "grades", label: "Grades Involved" },
                      { key: "projects", label: "Projects Involved" },
                      { key: "projectCount", label: "Project Count", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
                      { key: "review", label: "Reviews from School Management" },
                      { key: "remarks", label: "Remarks / Justification" },
                    ]}
                  />
                </Panel>
              </>
            )}

            {/* ═══ EVENT ══════════════════════════════════════════════ */}
            {activeId === "event" && (
              <>
                <Hero index={activeIndex} total={visibleSections.length} section={active} meta="Annual events and participation — competitions, activities and school involvement." />
                <Panel color={active.color} title="Event register">
                  <DataTable
                    emptyLabel="event participation records"
                    rows={school.eventRows}
                    columns={[
                      { key: "name", label: "Event Name" },
                      { key: "description", label: "Description" },
                      dateCol("date", "Date"),
                      { key: "involvement", label: "School Involvement" },
                      { key: "studentCount", label: "Student Count", align: "right", render: (v) => (isBlank(v) ? dash : <span className="rb-num">{v}</span>) },
                      { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
                      { key: "remarks", label: "Remarks / Justification" },
                    ]}
                  />
                </Panel>
              </>
            )}

            {/* ═══ WORK ACCOMPLISHMENT ════════════════════════════════ */}
            {activeId === "accomplishment" && (
              <>
                <Hero index={activeIndex} total={visibleSections.length} section={active} meta={`Annual work accomplishment report — ${school.year || "current academic year"}.`} />
                <Panel color={active.color} title="Annual report">
                  <DataTable
                    emptyLabel="the annual work accomplishment report"
                    rows={school.workAccomplishmentRows}
                    columns={[
                      { key: "academicYear", label: "Academic Year" },
                      dateCol("date", "Submission Date"),
                      { key: "preparedBy", label: "Prepared By" },
                      { key: "status", label: "Status", render: (v) => <Badge status={v} /> },
                      { key: "link", label: "Link", render: (v) => <LinkCell href={v} label="View report" /> },
                    ]}
                  />
                </Panel>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}