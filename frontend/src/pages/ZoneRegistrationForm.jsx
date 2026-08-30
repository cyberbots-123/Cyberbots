import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import assets from "../assets/assets";

/* ═══════════════════════════════════════════════════════════════
   CYBERFLIX 2K26 — ZONE REGISTRATION (shared engine, all 6 zones)

   This one component renders the registration form for ANY of the
   six zones. What differs per zone — name, tagline, accent color,
   icon, team size, fee, age range — comes in through the `config` prop
   (see zoneRegistrationConfigs.js for the actual per-zone data table,
   and ZoneRegister.jsx for the route wrapper that looks a zone up by
   URL and passes its config in here).

   Visually this continues CyberFlixCarnival.jsx's language (parchment,
   wax seals, drifting wisps, candlelight) but the file is fully
   self-contained — nothing here imports from that file's internals —
   so you can drop it in as its own route, or open it inside a modal.

   BACKGROUND IMAGE
   Add `Zone1ARegisterBg` (or a per-zone key, if you want a different
   photo per zone — just extend this to read `assets[config.bgKey]`)
   to your assets index (assets/assets.js) pointing at an atmospheric
   night image. The page still renders correctly without it.

   SUBMISSION
   Each zone config carries its own `submitEndpoint` — point it at
   wherever that zone's registrations should go (a Google Apps Script
   Web App bound to a Sheet, a serverless function, Formspree, etc).
   Until it's set, submitting simulates a short round trip so every
   animation below is fully demonstrable out of the box.
═══════════════════════════════════════════════════════════════ */

/* ── TOKENS — universal across every zone ──────────────────────
   The zone's own accent (color / colorHi / border) is no longer
   fixed here — it comes from the `config` prop this component
   receives, and is applied as CSS custom properties (--zone-a,
   --zone-ab, --zone-border) on the page root below, so the exact
   same stylesheet renders correctly for all six zones.          */
const INK = "#05060d";
const INK_2 = "#090b16";
const INK_3 = "#0f1122";
const PARCH = "#e4e6f2";
const GOLD = "#d9b45f";
const WINE = "#7a2d36";
const MUTED = "#98a0b4";

const GENDER_OPTIONS = ["Female", "Male", "Other"];

function emptyStudent() {
  return {
    fullName: "",
    gender: "",
    age: "",
    guardianName: "",
    guardianPhone: "",
    email: "",
    address: "",
    schoolName: "",
    gradeClass: "",
  };
}

function makeInitialForm(teamSize) {
  return { students: Array.from({ length: teamSize }, emptyStudent) };
}

/* ═══════════════════════════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════════════════════════ */
function digitsOnly(v) {
  return (v || "").replace(/\D/g, "");
}

function validateField(name, value) {
  const v = (value || "").trim();
  switch (name) {
    case "fullName":
      if (!v) return "Enter the participant's full name.";
      if (v.length < 2) return "That name looks too short.";
      return "";
    case "gender":
      if (!v) return "Select a gender.";
      return "";
    // "age" intentionally has no validation — the field is still collected
    // (see StudentFields below) but nothing is checked or required about it.
    case "guardianName":
      if (!v) return "Enter a parent or guardian's name.";
      return "";
    case "guardianPhone": {
      const d = digitsOnly(v);
      if (!d) return "Enter a WhatsApp contact number.";
      if (d.slice(-10).length !== 10 || d.length > 12) return "Enter a valid 10-digit WhatsApp number.";
      return "";
    }
    case "email":
      if (!v) return "Enter an email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
      return "";
    case "address":
      if (!v) return "Enter a home address.";
      if (v.length < 8) return "That address looks incomplete.";
      return "";
    case "schoolName":
      if (!v) return "Enter the participant's school.";
      return "";
    case "gradeClass":
      if (!v) return "Enter the grade and class, e.g. Grade 4 - A.";
      return "";
    default:
      return "";
  }
}

function validateStudent(student) {
  const errs = {};
  Object.keys(emptyStudent()).forEach((key) => {
    const msg = validateField(key, student[key]);
    if (msg) errs[key] = msg;
  });
  return errs;
}

function validateAll(students) {
  return students.map((s) => validateStudent(s));
}

function hasAnyError(errsArray) {
  return errsArray.some((e) => Object.keys(e).length > 0);
}


/* ═══════════════════════════════════════════════════════════════
   AMBIENT / DECORATIVE PIECES — original SVG & CSS, no licensed art
═══════════════════════════════════════════════════════════════ */
function Stars({ count = 40 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.6 + 0.5,
        delay: Math.random() * 6,
        dur: Math.random() * 3 + 2.4,
      })),
    [count]
  );
  return (
    <div className="zreg-stars" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#cdd2e6",
            boxShadow: "0 0 3px 1px rgba(227,199,102,0.4)",
            animation: `zregTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Wisp({ x, y, s = 1, delay = 0, hi, base }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${s})`,
        animation: `zregWispFloat ${5.6 + (delay % 3)}s ease-in-out ${delay}s infinite`,
      }}
    >
      <div style={{ width: 40, height: 40, margin: "0 auto", borderRadius: "50%", background: `radial-gradient(circle, ${hi}55, transparent 70%)` }} />
      <div
        style={{
          width: 12,
          height: 12,
          margin: "-28px auto 0",
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 32%, #ffffff, ${hi} 55%, ${base} 92%)`,
          boxShadow: `0 0 14px 4px ${hi}66`,
          animation: "zregWispPulse 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function WaxSeal({ size = 78, ringColor = "#e3c766" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill={WINE} />
      <circle cx="32" cy="32" r="30" fill="none" stroke={ringColor} strokeWidth="1" opacity="0.55" />
      <circle cx="32" cy="32" r="23" fill="none" stroke={ringColor} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.6" />
      <path d="M32,14 L37,26 L50,27 L40,36 L43,49 L32,42 L21,49 L24,36 L14,27 L27,26 Z" fill="#e8dfc0" opacity="0.92" />
      <circle cx="32" cy="32" r="4" fill={WINE} />
    </svg>
  );
}

/* One original icon per zone glyph — reproduced here (rather than
   imported from CyberFlixCarnival.jsx) so this page stays fully
   self-contained. Covers every glyph used across all six zones. */
function ZoneIcon({ type, color = "#e3c766", size = 40 }) {
  const c = color;
  if (type === "maze")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="3" stroke={c} strokeWidth="2.4" />
        <path d="M13,5 v22 h10 v-14 h12 v22 h-22" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="24" r="2.6" fill={c} />
      </svg>
    );
  if (type === "crystal")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24,4 L38,18 L24,44 L10,18 Z" fill={c} opacity="0.35" />
        <path d="M24,4 L38,18 L24,44 L10,18 Z" stroke={c} strokeWidth="2" />
        <path d="M10,18 h28 M24,4 v40" stroke={c} strokeWidth="1.4" opacity="0.8" />
      </svg>
    );
  if (type === "wheel")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="18" stroke={c} strokeWidth="2.4" />
        <circle cx="24" cy="24" r="7" stroke={c} strokeWidth="2" />
        <path d="M24,6 v10 M24,32 v10 M6,24 h10 M32,24 h10 M11,11 l7,7 M30,30 l7,7 M37,11 l-7,7 M18,30 l-7,7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  if (type === "sword")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M9,39 L30,18 L36,12 L36,20 L14,42 Z" fill={c} opacity="0.3" />
        <path d="M9,39 L36,12 M36,12 v8 L14,42" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M39,37 L18,16 L12,10 L12,18 L34,40 Z" fill={c} opacity="0.3" />
        <path d="M39,37 L12,10 M12,10 v8 L34,40" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
    );
  if (type === "bulb")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24,6 a13,13 0 0 1 8,23 v5 h-16 v-5 a13,13 0 0 1 8,-23 z" fill={c} opacity="0.28" stroke={c} strokeWidth="2" />
        <path d="M18,38 h12 M20,42 h8" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <path d="M24,16 v12" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  // "scroll" (default)
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M11,9 h26 v30 h-26 z" fill={c} opacity="0.2" />
      <path d="M11,9 h26 v30 h-26 z" stroke={c} strokeWidth="2.2" />
      <path d="M7,9 a4,4 0 0 1 4,4 v22 a4,4 0 0 1 -4,4" stroke={c} strokeWidth="2" fill="none" />
      <path d="M41,9 a4,4 0 0 0 -4,4 v22 a4,4 0 0 0 4,4" stroke={c} strokeWidth="2" fill="none" />
      <path d="M17,18 h14 M17,24 h14 M17,30 h9" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* A handful of candles drifting in place, the way the Great Hall's
   ceiling candles hang in the air — original shapes, gentle bob +
   flicker, kept subtle so it reads as atmosphere, not decoration. */
function FloatingCandles() {
  const candles = useMemo(
    () => [
      { left: "7%", top: "9%", h: 44, delay: 0 },
      { left: "89%", top: "14%", h: 36, delay: 1.1 },
      { left: "16%", top: "64%", h: 32, delay: 2.3 },
      { left: "80%", top: "72%", h: 40, delay: 0.6 },
    ],
    []
  );
  return (
    <div className="zreg-candles" aria-hidden="true">
      {candles.map((c, i) => (
        <div key={i} className="zreg-candle" style={{ left: c.left, top: c.top, animationDelay: `${c.delay}s` }}>
          <span className="zreg-candle-flame" style={{ animationDelay: `${c.delay}s` }} />
          <span className="zreg-candle-stick" style={{ height: c.h }} />
        </div>
      ))}
    </div>
  );
}

/* The registration "sent by owl" moment — a single original silhouette
   that swoops across on success, tying into the site's Owl Post theme. */
function OwlSwoop({ active }) {
  if (!active) return null;
  return (
    <svg className="zreg-owl" width="54" height="40" viewBox="0 0 54 40" aria-hidden="true">
      <path
        d="M27,6 C18,2 4,10 2,20 C10,17 16,20 20,26 C22,18 24,14 27,12 C30,14 32,18 34,26 C38,20 44,17 52,20 C50,10 36,2 27,6 Z"
        fill="#f3ecdd"
        opacity="0.92"
      />
      <circle cx="24" cy="14" r="1.6" fill="#2f2419" />
      <circle cx="30" cy="14" r="1.6" fill="#2f2419" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ONE TEAMMATE'S FIELD SET — rendered twice (Student 1 / Student 2)
═══════════════════════════════════════════════════════════════ */
function StudentFields({ studentKey, index, label, values, errors, touched, onChange, onBlur, onGenderSelect }) {
  const fieldId = (name) => `${studentKey}-${name}`;
  const showError = (name) => touched[name] && errors[name];

  return (
    <div className="zreg-student-group">
      <div className="zreg-student-heading">
        {index != null && <span className="zreg-student-badge">{index}</span>}
        <span className="zreg-student-index">{label}</span>
        <span className="zreg-student-line" />
      </div>

      {/* Full Name */}
      <div className="zreg-field">
        <label className="zreg-label" htmlFor={fieldId("fullName")}>Full Name *</label>
        <input
          id={fieldId("fullName")}
          name="fullName"
          type="text"
          className="zreg-input"
          placeholder="Participant's full name"
          value={values.fullName}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={!!showError("fullName")}
          aria-describedby={showError("fullName") ? `err-${fieldId("fullName")}` : undefined}
        />
        {showError("fullName") && <p className="zreg-error" id={`err-${fieldId("fullName")}`}>{errors.fullName}</p>}
      </div>

      {/* Gender + Age */}
      <div className="zreg-row">
        <div className="zreg-field">
          <label className="zreg-label">Gender *</label>
          <div className="zreg-gender-group" role="radiogroup" aria-label={`Gender — ${label}`}>
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={values.gender === g}
                className={`zreg-gender-pill${values.gender === g ? " on" : ""}`}
                onClick={() => onGenderSelect(g)}
              >
                {g}
              </button>
            ))}
          </div>
          {showError("gender") && <p className="zreg-error">{errors.gender}</p>}
        </div>
        <div className="zreg-field">
          <label className="zreg-label" htmlFor={fieldId("age")}>Age</label>
          <input
            id={fieldId("age")}
            name="age"
            type="number"
            inputMode="numeric"
            className="zreg-input"
            placeholder="9"
            value={values.age}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!showError("age")}
            aria-describedby={showError("age") ? `err-${fieldId("age")}` : undefined}
          />
          {showError("age") && <p className="zreg-error" id={`err-${fieldId("age")}`}>{errors.age}</p>}
        </div>
      </div>

      {/* Parent / Guardian Name */}
      <div className="zreg-field">
        <label className="zreg-label" htmlFor={fieldId("guardianName")}>Parent / Guardian Name *</label>
        <input
          id={fieldId("guardianName")}
          name="guardianName"
          type="text"
          className="zreg-input"
          placeholder="Parent or guardian's full name"
          value={values.guardianName}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={!!showError("guardianName")}
          aria-describedby={showError("guardianName") ? `err-${fieldId("guardianName")}` : undefined}
        />
        {showError("guardianName") && <p className="zreg-error" id={`err-${fieldId("guardianName")}`}>{errors.guardianName}</p>}
      </div>

      {/* Guardian Contact + Email */}
      <div className="zreg-row">
        <div className="zreg-field">
          <label className="zreg-label" htmlFor={fieldId("guardianPhone")}>Parent / Guardian Contact (WhatsApp) *</label>
          <input
            id={fieldId("guardianPhone")}
            name="guardianPhone"
            type="tel"
            inputMode="tel"
            className="zreg-input"
            placeholder="10-digit mobile number"
            value={values.guardianPhone}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!showError("guardianPhone")}
            aria-describedby={showError("guardianPhone") ? `err-${fieldId("guardianPhone")}` : undefined}
          />
          {showError("guardianPhone") && <p className="zreg-error" id={`err-${fieldId("guardianPhone")}`}>{errors.guardianPhone}</p>}
        </div>
        <div className="zreg-field">
          <label className="zreg-label" htmlFor={fieldId("email")}>Email ID (Parent / Student) *</label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            className="zreg-input"
            placeholder="you@example.com"
            value={values.email}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!showError("email")}
            aria-describedby={showError("email") ? `err-${fieldId("email")}` : undefined}
          />
          {showError("email") && <p className="zreg-error" id={`err-${fieldId("email")}`}>{errors.email}</p>}
        </div>
      </div>

      {/* Address */}
      <div className="zreg-field">
        <label className="zreg-label" htmlFor={fieldId("address")}>Address *</label>
        <textarea
          id={fieldId("address")}
          name="address"
          className="zreg-textarea"
          rows={3}
          placeholder="House no., street, area, city, PIN"
          value={values.address}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={!!showError("address")}
          aria-describedby={showError("address") ? `err-${fieldId("address")}` : undefined}
        />
        {showError("address") && <p className="zreg-error" id={`err-${fieldId("address")}`}>{errors.address}</p>}
      </div>

      {/* School Name + Grade & Class */}
      <div className="zreg-row">
        <div className="zreg-field">
          <label className="zreg-label" htmlFor={fieldId("schoolName")}>School Name *</label>
          <input
            id={fieldId("schoolName")}
            name="schoolName"
            type="text"
            className="zreg-input"
            placeholder="e.g., Vani Vidyalaya Sr. Sec. School"
            value={values.schoolName}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!showError("schoolName")}
            aria-describedby={showError("schoolName") ? `err-${fieldId("schoolName")}` : undefined}
          />
          {showError("schoolName") && <p className="zreg-error" id={`err-${fieldId("schoolName")}`}>{errors.schoolName}</p>}
        </div>
        <div className="zreg-field">
          <label className="zreg-label" htmlFor={fieldId("gradeClass")}>Grade & Class *</label>
          <input
            id={fieldId("gradeClass")}
            name="gradeClass"
            type="text"
            className="zreg-input"
            placeholder="e.g., Grade 4 - A"
            value={values.gradeClass}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!showError("gradeClass")}
            aria-describedby={showError("gradeClass") ? `err-${fieldId("gradeClass")}` : undefined}
          />
          {showError("gradeClass") && <p className="zreg-error" id={`err-${fieldId("gradeClass")}`}>{errors.gradeClass}</p>}
        </div>
      </div>
    </div>
  );
}

/* Loads Razorpay's Checkout script once, if it isn't already present —
   keeps this file self-contained (no need to touch index.html). Safe to
   call from multiple mounted instances; the `id` guard prevents duplicate
   <script> tags, and callers await the returned promise before opening
   checkout so window.Razorpay is guaranteed to exist by then. */
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  const existing = document.getElementById("razorpay-checkout-js");
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
    });
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ═══════════════════════════════════════════════════════════════
   ROOT
   `config` is one entry from ZONE_REGISTRATION_CONFIGS (see
   zoneRegistrationConfigs.js) — everything zone-specific comes from it.
═══════════════════════════════════════════════════════════════ */
export default function ZoneRegistrationForm({ config, onBack } = {}) {
  const {
    code,
    name,
    tagline,
    glyph,
    grade,
    color,
    colorHi,
    border,
    teamSize,
    feeModel,
    feePerStudent,
    flatFee,
    missionNote,
    handbookKey,
    submitEndpoint,
    botPurchase: botPurchaseOffer, // { price, label } — undefined/null if this zone doesn't sell one
  } = config;

  const teamFee = feeModel === "flat" ? flatFee : feePerStudent * teamSize;
  const entryWord = teamSize > 1 ? "team" : "entry";
  const hasBotOffer = !!botPurchaseOffer;

  const [formData, setFormData] = useState(() => makeInitialForm(teamSize));
  const [errors, setErrors] = useState(() => Array.from({ length: teamSize }, () => ({})));
  const [touched, setTouched] = useState(() => Array.from({ length: teamSize }, () => ({})));
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [revealed, setRevealed] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [photoConsentTouched, setPhotoConsentTouched] = useState(false);
  const [wantsBot, setWantsBot] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [submitError, setSubmitError] = useState("");
  const cardRef = useRef(null);

  // Total fee due: base registration + the optional bot, only if this zone
  // sells one AND the visitor has ticked the box for it.
  const totalFee = teamFee + (hasBotOffer && wantsBot ? botPurchaseOffer.price : 0);


  // The wax seal "breaks open" shortly after mount, revealing the form —
  // the one orchestrated moment on this page; everything else stays quiet.
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 650);
    return () => clearTimeout(t);
  }, []);

  // Warm up Razorpay's Checkout script in the background so it's already
  // loaded by the time someone finishes the form and hits submit, instead
  // of making them wait for it right at the moment they're paying.
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleChange = useCallback((idx, e) => {
    const { name, value } = e.target;
    setFormData((f) => {
      const students = f.students.slice();
      students[idx] = { ...students[idx], [name]: value };
      return { students };
    });
    setErrors((er) => {
      if (er[idx] && er[idx][name]) {
        const next = er.slice();
        next[idx] = { ...next[idx], [name]: "" };
        return next;
      }
      return er;
    });
  }, []);

  const handleBlur = useCallback((idx, e) => {
    const { name, value } = e.target;
    setTouched((t) => {
      const next = t.slice();
      next[idx] = { ...next[idx], [name]: true };
      return next;
    });
    setErrors((er) => {
      const next = er.slice();
      next[idx] = { ...next[idx], [name]: validateField(name, value) };
      return next;
    });
  }, []);

  const handleSelectGender = useCallback((idx, g) => {
    setFormData((f) => {
      const students = f.students.slice();
      students[idx] = { ...students[idx], gender: g };
      return { students };
    });
    setTouched((t) => {
      const next = t.slice();
      next[idx] = { ...next[idx], gender: true };
      return next;
    });
    setErrors((er) => {
      const next = er.slice();
      next[idx] = { ...next[idx], gender: "" };
      return next;
    });
  }, []);

  const touchAllFields = useCallback(() => {
    const allTouched = Object.keys(emptyStudent()).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    return Array.from({ length: teamSize }, () => ({ ...allTouched }));
  }, [teamSize]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const nextErrors = validateAll(formData.students);
      setErrors(nextErrors);
      setTouched(touchAllFields());
      setPhotoConsentTouched(true);
      if (hasAnyError(nextErrors) || !photoConsent) {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      setStatus("submitting");
      setSubmitError("");
      try {
        if (submitEndpoint) {
          const res = await fetch(submitEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              zone: code,
              event: "CyberFlix 2K26",
              baseFee: teamFee,
              botPurchase: hasBotOffer ? wantsBot : false,
              botPurchaseFee: hasBotOffer && wantsBot ? botPurchaseOffer.price : 0,
              teamFee: totalFee,
              photoVideoConsent: true,
              students: formData.students,
            }),
          });
          // The backend saves the registration as "pending" and creates a
          // matching Razorpay order in the same call — read both out of
          // the response instead of only checking res.ok.
          const data = await res.json().catch(() => null);
          if (!res.ok) throw new Error(data?.message || "Request failed");
          if (!data?.razorpay?.orderId) throw new Error("Payment could not be started. Please try again.");

          const scriptReady = await loadRazorpayScript();
          if (!scriptReady || !window.Razorpay) {
            throw new Error("Could not load the payment window. Check your connection and try again.");
          }

          const lead = formData.students[0];
          await new Promise((resolve, reject) => {
            const rzp = new window.Razorpay({
              key: data.razorpay.keyId,
              amount: data.razorpay.amount,
              currency: data.razorpay.currency,
              order_id: data.razorpay.orderId,
              name: "CyberFlix 2K26",
              description: `${code} — ${name}`,
              prefill: {
                name: lead?.guardianName,
                email: lead?.email,
                contact: lead?.guardianPhone,
              },
              theme: { color },
              // Fires after Razorpay itself confirms the payment — we
              // still verify the signature server-side before trusting it.
              handler: async (response) => {
                try {
                  const verifyRes = await fetch(`${submitEndpoint}/verify-payment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(response),
                  });
                  const verifyData = await verifyRes.json().catch(() => null);
                  if (!verifyRes.ok) throw new Error(verifyData?.message || "Payment verification failed.");
                  setReferenceNumber(verifyData.referenceNumber || data.referenceNumber);
                  resolve();
                } catch (err) {
                  reject(err);
                }
              },
              modal: {
                // Closing the checkout window without paying — not a
                // hard error, just back to the form so they can retry.
                ondismiss: () => reject(new Error("__dismissed__")),
              },
            });
            rzp.on("payment.failed", (resp) => {
              reject(new Error(resp?.error?.description || "Payment failed. Please try again."));
            });
            rzp.open();
          });
        } else {
          // No endpoint configured yet — simulate the whole round trip,
          // registration AND payment, so the success moment below is
          // fully demonstrable out of the box.
          await new Promise((resolve) => setTimeout(resolve, 900));
          setReferenceNumber(`CF26-${code.replace(/^ZONE\s*/i, "")}-DEMO01`);
        }
        setStatus("success");
      } catch (err) {
        if (err.message === "__dismissed__") {
          // They closed the payment window — quietly return to the form,
          // no scary error text for what was probably just a change of mind.
          setStatus("idle");
        } else {
          setSubmitError(err.message || "");
          setStatus("error");
        }
      }
    },
    [
      formData,
      touchAllFields,
      submitEndpoint,
      teamFee,
      totalFee,
      code,
      photoConsent,
      hasBotOffer,
      wantsBot,
      botPurchaseOffer,
    ]
  );

  const handleReset = useCallback(() => {
    setFormData(makeInitialForm(teamSize));
    setErrors(Array.from({ length: teamSize }, () => ({})));
    setTouched(Array.from({ length: teamSize }, () => ({})));
    setStatus("idle");
    setPhotoConsent(false);
    setPhotoConsentTouched(false);
    setWantsBot(false);
    setReferenceNumber("");
    setSubmitError("");
    setRevealed(false);
    setTimeout(() => setRevealed(true), 500);
  }, [teamSize]);

  const handbookHref = handbookKey ? assets[handbookKey] : null;
  const zoneShortCode = code.replace(/^ZONE\s*/i, "");

  return (
    <div className="zreg-page" style={{ "--zone-a": color, "--zone-ab": colorHi, "--zone-border": border }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display+SC:ital,wght@0,700;0,900&family=MedievalSharp&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=Cormorant+SC:wght@500;600;700&display=swap');

        .zreg-page{position:relative;min-height:100vh;overflow:hidden;background:linear-gradient(180deg, ${INK} 0%, ${INK_2} 55%, ${INK_3} 100%);font-family:'Cormorant Garamond',serif;color:${PARCH};}
        .zreg-page *{box-sizing:border-box;}
        .zreg-page :focus-visible{outline:2px solid var(--zone-ab);outline-offset:3px;border-radius:6px;}

        .zreg-bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;opacity:0.55;}
        .zreg-scrim{position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 6%, rgba(227,199,102,0.1), transparent 60%), linear-gradient(180deg, rgba(5,6,13,0.35) 0%, rgba(5,6,13,0.6) 42%, rgba(4,4,12,0.94) 100%);}
        .zreg-stars{position:absolute;inset:0;}

        .zreg-candles{position:absolute;inset:0;pointer-events:none;z-index:1;}
        .zreg-candle{position:absolute;display:flex;flex-direction:column;align-items:center;animation:zregCandleFloat 6s ease-in-out infinite;}
        .zreg-candle-flame{width:6px;height:10px;border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;background:radial-gradient(circle at 50% 30%, #fff6d8, ${GOLD} 55%, #a5701f 100%);box-shadow:0 0 10px 3px rgba(217,180,95,0.5);animation:zregFlicker 1.6s ease-in-out infinite;transform-origin:bottom center;}
        .zreg-candle-stick{width:5px;background:linear-gradient(180deg, #f3ecdd, #cdbf9b);border-radius:2px;margin-top:2px;}

        @keyframes zregCandleFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        @keyframes zregFlicker{0%,100%{transform:scaleY(1) scaleX(1);opacity:1;}50%{transform:scaleY(1.15) scaleX(0.9);opacity:0.85;}}
        @keyframes zregTwinkle{0%,100%{opacity:0.22;transform:scale(1);}50%{opacity:1;transform:scale(1.4);}}
        @keyframes zregWispFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes zregWispPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.15);opacity:0.8;}}
        @keyframes zregSealPulse{0%,100%{filter:drop-shadow(0 0 0 rgba(227,199,102,0));}50%{filter:drop-shadow(0 0 14px rgba(227,199,102,0.6));}}
        @keyframes zregOwlSwoop{0%{transform:translate(-10vw,40px) rotate(-6deg);opacity:0;}12%{opacity:1;}50%{transform:translate(40vw,-30px) rotate(2deg);}100%{transform:translate(112vw,-70px) rotate(8deg);opacity:0;}}
        @keyframes zregFeeShimmer{0%{background-position:-60px 0;}100%{background-position:120px 0;}}
        @keyframes zregLeafSettle{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}

        .zreg-content{position:relative;z-index:4;max-width:760px;margin:0 auto;padding:clamp(48px,8vh,96px) 22px 90px;display:flex;flex-direction:column;align-items:center;text-align:center;}
        .zreg-back{align-self:flex-start;background:none;border:none;color:${MUTED};font-family:'Cormorant SC',serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;margin-bottom:18px;padding:6px 0;transition:color .2s ease;}
        .zreg-back:hover{color:var(--zone-ab);}
        .zreg-kicker{font-family:'Cormorant SC',serif;font-size:13px;letter-spacing:5px;color:${MUTED};text-transform:uppercase;}
        .zreg-zone-chip{display:inline-block;margin-top:10px;font-family:'Cormorant SC',serif;font-size:11.5px;font-weight:700;letter-spacing:3px;color:var(--zone-ab);border:1px solid var(--zone-border);background:rgba(227,199,102,0.1);border-radius:100px;padding:6px 18px;}
        .zreg-title-row{display:flex;align-items:center;gap:14px;margin-top:18px;}
        .zreg-title{font-family:'Playfair Display SC','MedievalSharp',serif;font-weight:700;font-size:clamp(32px,6vw,54px);color:${PARCH};letter-spacing:0.5px;}
        .zreg-tagline{font-style:italic;color:var(--zone-ab);font-size:16px;margin-top:8px;}
        .zreg-meta-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:22px;}
        .zreg-meta-pill{font-family:'Cormorant SC',serif;font-size:11.5px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};border:1px solid rgba(152,160,180,0.3);border-radius:100px;padding:7px 15px;}
        .zreg-meta-pill.fee{color:var(--zone-ab);border-color:var(--zone-border);background:rgba(227,199,102,0.08);}

        .zreg-card{position:relative;width:100%;margin-top:40px;border-radius:18px;overflow:hidden;box-shadow:0 40px 90px -30px rgba(0,0,0,0.75);}
        .zreg-card-paper{position:absolute;inset:0;z-index:0;background:
            radial-gradient(ellipse 50% 40% at 50% 0%, rgba(255,253,247,0.5), transparent 60%),
            linear-gradient(165deg, #c9a06c 0%, #e6d6ba 20%, #f3ecdd 46%, #e6d6ba 74%, #bf9663 100%);}
        .zreg-card-paper::after{content:"";position:absolute;inset:0;opacity:0.4;mix-blend-mode:multiply;background:repeating-linear-gradient(0deg, rgba(122,88,52,0.06) 0 1px, transparent 1px 4px),repeating-linear-gradient(90deg, rgba(122,88,52,0.06) 0 1px, transparent 1px 4px);}

        .zreg-seal-gate{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(47,36,25,0.05);transition:opacity .6s ease, transform .6s ease;}
        .zreg-seal-gate svg{animation:zregSealPulse 2.6s ease-in-out infinite;}
        .zreg-seal-label{font-family:'Cormorant SC',serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#5b4526;}
        .zreg-seal-gate.open{opacity:0;transform:scale(0.5) rotate(20deg) translateY(-30px);pointer-events:none;}

        .zreg-form{position:relative;z-index:1;padding:clamp(26px,4vw,44px);opacity:0;transform:scale(0.97) translateY(8px);transition:opacity .55s ease .1s, transform .55s ease .1s;}
        .zreg-form.revealed{opacity:1;transform:none;}
        .zreg-form-note{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14.5px;color:#5c4934;text-align:left;margin-bottom:8px;}

        .zreg-student-group{margin-bottom:8px;}
        .zreg-student-group + .zreg-student-group{margin-top:14px;padding-top:28px;border-top:1px dashed rgba(94,68,40,0.32);}
        .zreg-student-heading{display:flex;align-items:center;gap:12px;margin-bottom:20px;}
        .zreg-student-badge{width:30px;height:30px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display SC',serif;font-weight:700;font-size:14px;color:#3a2a08;background:linear-gradient(135deg, #fbe6b8, var(--zone-ab) 45%, var(--zone-a) 100%);box-shadow:inset 0 0 4px rgba(0,0,0,0.3);}
        .zreg-student-index{font-family:'Cormorant SC',serif;font-size:13px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:#5b4526;}
        .zreg-student-line{flex:1;height:1px;background:linear-gradient(90deg, rgba(94,68,40,0.4), transparent);}

        .zreg-field{text-align:left;margin-bottom:18px;}
        .zreg-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media (max-width:560px){.zreg-row{grid-template-columns:1fr;}}
        .zreg-label{display:block;font-family:'Cormorant SC',serif;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#5b4526;margin-bottom:7px;}
        .zreg-input,.zreg-textarea{width:100%;font-family:'Cormorant Garamond',serif;font-size:16px;color:#2f2419;background:rgba(255,250,238,0.55);border:1px solid rgba(94,68,40,0.35);border-radius:10px;padding:11px 14px;transition:border-color .2s ease, box-shadow .2s ease, background .2s ease;}
        .zreg-textarea{resize:vertical;min-height:76px;}
        .zreg-input::placeholder,.zreg-textarea::placeholder{color:rgba(76,59,42,0.45);}
        .zreg-input:focus,.zreg-textarea:focus{outline:none;border-color:var(--zone-a);background:rgba(255,250,238,0.85);box-shadow:0 0 0 3px rgba(227,199,102,0.35), 0 0 18px rgba(227,199,102,0.25);}
        .zreg-input[aria-invalid="true"],.zreg-textarea[aria-invalid="true"]{border-color:${WINE};}
        .zreg-error{margin-top:6px;font-family:'Cormorant Garamond',serif;font-size:13.5px;color:${WINE};}

        .zreg-gender-group{display:flex;gap:8px;flex-wrap:wrap;}
        .zreg-gender-pill{font-family:'Cormorant SC',serif;font-size:12px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:#5b4526;background:rgba(255,250,238,0.5);border:1px solid rgba(94,68,40,0.32);border-radius:100px;padding:9px 18px;cursor:pointer;transition:all .2s ease;}
        .zreg-gender-pill.on{color:#2f2419;background:var(--zone-ab);border-color:var(--zone-a);box-shadow:0 0 14px rgba(227,199,102,0.5);}

        .zreg-fee-badge{display:flex;align-items:center;gap:12px;margin:20px 0 24px;padding:12px 16px;border-radius:12px;border:1px dashed var(--zone-border);background:rgba(227,199,102,0.08);}
        .zreg-fee-coin{width:34px;height:34px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display SC',serif;font-weight:700;font-size:16px;color:#3a2a08;background:linear-gradient(135deg, #fbe6b8, var(--zone-ab) 45%, var(--zone-a) 100%);background-size:200% 100%;box-shadow:inset 0 0 4px rgba(0,0,0,0.3);animation:zregFeeShimmer 3.4s linear infinite;}
        .zreg-fee-text{font-family:'Cormorant Garamond',serif;font-size:15px;color:#4c3b2a;text-align:left;}
        .zreg-fee-text strong{font-family:'Playfair Display SC',serif;font-size:18px;color:#2f2419;}
        .zreg-fee-text span{display:block;font-size:12.5px;color:#7c6850;margin-top:2px;}

        /* Optional bot purchase — a deliberately different treatment (gold,
           not the zone's own accent) so it reads as a distinct shop add-on
           rather than just another form field. */
        .zreg-bot-offer{position:relative;overflow:hidden;margin:4px 0 20px;padding:18px 20px 16px;border-radius:14px;border:1.5px solid ${GOLD};background:linear-gradient(165deg, rgba(217,180,95,0.18), rgba(217,180,95,0.05));box-shadow:0 0 0 1px rgba(217,180,95,0.22), 0 16px 36px -20px rgba(217,180,95,0.6);}
        .zreg-bot-offer::before{content:"";position:absolute;inset:0;opacity:0.5;pointer-events:none;background:repeating-linear-gradient(77deg, rgba(255,246,224,0.2) 0 2px, transparent 2px 8px, rgba(50,32,14,0.06) 8px 10px, transparent 10px 16px);}
        .zreg-bot-badge{position:relative;z-index:1;display:inline-block;font-family:'Cormorant SC',serif;font-size:10.5px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:#3a2a08;background:linear-gradient(135deg, #fbe6b8, ${GOLD} 60%, #a5701f 100%);border-radius:100px;padding:5px 14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,0.22);}
        .zreg-bot-check{position:relative;z-index:1;display:flex;align-items:flex-start;gap:12px;cursor:pointer;}
        .zreg-bot-check input{margin-top:4px;width:18px;height:18px;flex:none;cursor:pointer;accent-color:${GOLD};}
        .zreg-bot-text{display:flex;flex-direction:column;gap:4px;}
        .zreg-bot-text strong{font-family:'Playfair Display SC',serif;font-weight:700;font-size:16px;color:#2f2419;}
        .zreg-bot-text span{font-family:'Cormorant Garamond',serif;font-size:14px;line-height:1.6;color:#5c4934;}

        .zreg-consent-block{text-align:left;margin-bottom:20px;}
        .zreg-consent-note{font-family:'Cormorant Garamond',serif;font-size:14px;line-height:1.7;color:#5c4934;background:rgba(94,68,40,0.06);border-left:2px solid rgba(94,68,40,0.35);border-radius:0 8px 8px 0;padding:12px 16px;margin:0 0 14px;}
        .zreg-consent-note strong{color:#2f2419;}
        .zreg-consent-check{display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-family:'Cormorant Garamond',serif;font-size:14px;line-height:1.65;color:#4c3b2a;}
        .zreg-consent-check input{margin-top:3px;width:16px;height:16px;flex:none;cursor:pointer;accent-color:var(--zone-a);}
        .zreg-consent-check strong{color:#2f2419;}

        .zreg-submit{position:relative;width:100%;display:inline-flex;align-items:center;justify-content:center;font-family:'Cormorant SC',serif;font-weight:700;font-size:14px;letter-spacing:3px;text-transform:uppercase;color:#f8ecd2;text-shadow:0 1px 1px rgba(0,0,0,0.4);border:none;border-radius:100px;padding:16px 24px;cursor:pointer;overflow:hidden;
          background:linear-gradient(90deg, rgba(43,27,12,0.5) 0, rgba(43,27,12,0) 22px, rgba(43,27,12,0) calc(100% - 22px), rgba(43,27,12,0.5) 100%), linear-gradient(180deg,#f0d7a2 0%,#d1a55c 30%,#a97c3e 56%,#7a5527 80%,#4f3319 100%);
          box-shadow:inset 0 2px 3px rgba(255,244,220,0.6), inset 0 -4px 5px rgba(0,0,0,0.4), 0 12px 28px -14px rgba(0,0,0,0.65);
          transition:transform .2s ease, box-shadow .2s ease, filter .2s ease, opacity .2s ease;}
        .zreg-submit::before{content:"";position:absolute;inset:0;opacity:0.5;mix-blend-mode:overlay;pointer-events:none;background:repeating-linear-gradient(77deg, rgba(255,246,224,0.22) 0 2px, transparent 2px 8px, rgba(50,32,14,0.2) 8px 10px, transparent 10px 16px);}
        .zreg-submit:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.07);}
        .zreg-submit:active:not(:disabled){transform:translateY(0);}
        .zreg-submit:disabled{opacity:0.75;cursor:default;}
        .zreg-submit-ghost{background:transparent;box-shadow:none;border:1px solid rgba(227,199,102,0.5);color:var(--zone-ab);text-shadow:none;margin-top:22px;}
        .zreg-submit-ghost::before{display:none;}
        .zreg-submit-ghost:hover{background:rgba(227,199,102,0.1);transform:translateY(-2px);}
        .zreg-submit-error{font-family:'Cormorant Garamond',serif;font-size:14px;color:${WINE};text-align:center;margin-bottom:14px;}

        .zreg-success{position:relative;z-index:1;padding:clamp(36px,6vw,56px) clamp(26px,4vw,44px) clamp(30px,4vw,40px);text-align:center;display:flex;flex-direction:column;align-items:center;animation:zregLeafSettle .6s ease both;}
        .zreg-success-eyebrow{font-family:'Cormorant SC',serif;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${GOLD};}
        .zreg-success-title{font-family:'Playfair Display SC',serif;font-weight:700;font-size:clamp(26px,4.6vw,36px);color:#2f2419;margin-top:8px;}
        .zreg-success-flavor{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14.5px;color:#7c6850;margin-top:6px;}
        .zreg-ref-box{margin:18px 0 4px;padding:14px 22px;border-radius:12px;border:1.5px dashed var(--zone-a);background:rgba(227,199,102,0.1);display:flex;flex-direction:column;align-items:center;gap:4px;}
        .zreg-ref-label{font-family:'Cormorant SC',serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#5b4526;}
        .zreg-ref-code{font-family:monospace;font-size:22px;font-weight:800;color:#2f2419;letter-spacing:1px;}
        .zreg-success-text{font-family:'Cormorant Garamond',serif;font-size:16px;line-height:1.75;color:#4c3b2a;max-width:460px;margin-top:6px;}

        /* what happens next */
        .zreg-next-steps{list-style:none;display:flex;flex-direction:column;gap:16px;width:100%;text-align:left;margin-top:28px;padding-top:24px;border-top:1px dashed rgba(94,68,40,0.3);}
        .zreg-next-steps li{display:flex;gap:14px;align-items:flex-start;}
        .zreg-next-num{flex:none;width:26px;height:26px;margin-top:2px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display SC',serif;font-weight:700;font-size:13px;color:#3a2a08;background:linear-gradient(135deg,#fbe6b8,var(--zone-ab) 45%,var(--zone-a) 100%);box-shadow:inset 0 0 4px rgba(0,0,0,0.3);}
        .zreg-next-steps strong{font-family:'Playfair Display SC',serif;font-size:15.5px;color:#2f2419;display:block;margin-bottom:2px;}
        .zreg-next-steps p{font-family:'Cormorant Garamond',serif;font-size:14.5px;line-height:1.65;color:#5c4934;margin:0;}
        .zreg-handbook-link{display:inline-block;margin-top:6px;font-family:'Cormorant SC',serif;font-size:11.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--zone-a);border-bottom:1px dotted var(--zone-a);text-decoration:none;}
        .zreg-handbook-link:hover{color:#2f2419;}
        .zreg-owl{position:absolute;top:8%;left:0;animation:zregOwlSwoop 2.2s ease-out forwards;}

        @media (prefers-reduced-motion: reduce){
          .zreg-page *{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.001ms !important;}
        }
      `}</style>

      {assets.Zone1ARegisterBg && (
        <img src={assets.Zone1ARegisterBg} alt="" aria-hidden="true" className="zreg-bg-img" />
      )}
      <div className="zreg-scrim" aria-hidden="true" />
      <Stars count={40} />
      <Wisp x={6} y={16} s={0.8} delay={0.3} hi={colorHi} base={color} />
      <Wisp x={92} y={64} s={0.65} delay={1.6} hi={colorHi} base={color} />
      <FloatingCandles />

      <div className="zreg-content">
        {onBack && (
          <button type="button" className="zreg-back" onClick={onBack}>
            ‹ Back to CyberFlix 2K26
          </button>
        )}

        <div className="zreg-kicker">CYBERFLIX 2K26</div>
        <div className="zreg-zone-chip">{code}</div>
        <div className="zreg-title-row">
          <ZoneIcon type={glyph} color={colorHi} size={34} />
          <h1 className="zreg-title">{name}</h1>
        </div>
        <p className="zreg-tagline">{tagline}</p>

        <div className="zreg-meta-row">
          <span className="zreg-meta-pill">{grade}</span>
          <span className="zreg-meta-pill">{teamSize > 1 ? `Team of ${teamSize}` : "Individual"}</span>
          <span className="zreg-meta-pill fee">
            Fee · ₹{totalFee.toLocaleString("en-IN")} / {entryWord}
          </span>
        </div>

        <div className="zreg-card" ref={cardRef}>
          <div className="zreg-card-paper" aria-hidden="true" />

          <div className={`zreg-seal-gate${revealed ? " open" : ""}`} aria-hidden="true">
            <WaxSeal size={84} ringColor={colorHi} />
            <div className="zreg-seal-label">Breaking the Seal…</div>
          </div>

          {status !== "success" ? (
            <form className={`zreg-form${revealed ? " revealed" : ""}`} onSubmit={handleSubmit} noValidate>
              <p className="zreg-form-note">
                {teamSize > 1
                  ? `${code} is a Team of ${teamSize} — register all teammates together below. All fields are required for each participant.`
                  : `${code} is an individual entry — register the participant's details below.`}
              </p>

              {formData.students.map((student, i) => (
                <StudentFields
                  key={i}
                  studentKey={`s${i}`}
                  index={teamSize > 1 ? i + 1 : null}
                  label={teamSize > 1 ? `Student ${i + 1}` : "Participant Details"}
                  values={student}
                  errors={errors[i]}
                  touched={touched[i]}
                  onChange={(e) => handleChange(i, e)}
                  onBlur={(e) => handleBlur(i, e)}
                  onGenderSelect={(g) => handleSelectGender(i, g)}
                />
              ))}

              {hasBotOffer && (
                <div className="zreg-bot-offer">
                  <span className="zreg-bot-badge">✶ {botPurchaseOffer.label} ✶</span>
                  <label className="zreg-bot-check">
                    <input
                      type="checkbox"
                      checked={wantsBot}
                      onChange={(e) => setWantsBot(e.target.checked)}
                    />
                    <span className="zreg-bot-text">
                      <strong>
                        Optional Bot Purchase — ₹{botPurchaseOffer.price.toLocaleString("en-IN")}
                      </strong>
                      <span>
                        Official bots are available at ₹{botPurchaseOffer.price.toLocaleString("en-IN")}, optional
                        bot purchase available from us. Tick this box to add it to your registration.
                      </span>
                    </span>
                  </label>
                </div>
              )}

              <div className="zreg-fee-badge">
                <span className="zreg-fee-coin">₹</span>
                <span className="zreg-fee-text">
                  <strong>{totalFee.toLocaleString("en-IN")}</strong> total registration fee for this {entryWord}
                  {feeModel === "per-student" && (
                    <span>
                      ₹{feePerStudent} × {teamSize} participant{teamSize > 1 ? "s" : ""}
                    </span>
                  )}
                  {hasBotOffer && wantsBot && (
                    <span>+ ₹{botPurchaseOffer.price.toLocaleString("en-IN")} official bot purchase</span>
                  )}
                </span>
              </div>

              <div className="zreg-consent-block">
                <p className="zreg-consent-note">
                  <strong>Emergency Contact Statement.</strong> I understand that guardian details provided
                  will be used only for emergency communication during the event.
                </p>

                <label className="zreg-consent-check">
                  <input
                    type="checkbox"
                    checked={photoConsent}
                    onChange={(e) => {
                      setPhotoConsent(e.target.checked);
                      setPhotoConsentTouched(true);
                    }}
                    aria-invalid={photoConsentTouched && !photoConsent}
                  />
                  <span>
                    <strong>Photo/Video Consent.</strong> I consent to the organizers capturing and using
                    event photos/videos of my child for documentation and promotional purposes. *
                  </span>
                </label>
                {photoConsentTouched && !photoConsent && (
                  <p className="zreg-error">You must agree to the photo/video consent to complete registration.</p>
                )}
              </div>

              {status === "error" && (
                <p className="zreg-submit-error">
                  {submitError || "Something went wrong sending your registration. Please try again, or reach us on WhatsApp."}
                </p>
              )}

              <button type="submit" className="zreg-submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Opening secure payment…" : `Pay ₹${totalFee.toLocaleString("en-IN")} & Seal Registration`}
              </button>
            </form>
          ) : (
            <div className="zreg-success">
              <OwlSwoop active={status === "success"} />
              <WaxSeal size={60} ringColor={colorHi} />
              <span className="zreg-success-eyebrow">✶ Registration Sealed ✶</span>
              <h2 className="zreg-success-title">Your Journey Begins!</h2>
              <p className="zreg-success-flavor">Your owl has departed to deliver the news.</p>

              {referenceNumber && (
                <div className="zreg-ref-box">
                  <span className="zreg-ref-label">Your Reference Number</span>
                  <span className="zreg-ref-code">{referenceNumber}</span>
                </div>
              )}

              <p className="zreg-success-text">
                Registration for <strong>{formData.students.map((s) => s.fullName).join(" & ")}</strong> is
                complete and paid for {code} — {name}
                {hasBotOffer && wantsBot ? ", including your official bot purchase" : ""}.
              </p>

              <ol className="zreg-next-steps">
                <li>
                  <span className="zreg-next-num">1</span>
                  <div>
                    <strong>Payment received</strong>
                    <p>
                      ₹{totalFee.toLocaleString("en-IN")} has been received in full
                      {hasBotOffer && wantsBot ? " (including the official bot)" : ""} — nothing more to pay.
                      A payment receipt has also gone to <strong>{formData.students[0]?.email}</strong>.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="zreg-next-num">2</span>
                  <div>
                    <strong>Watch WhatsApp</strong>
                    <p>We'll message <strong>{formData.students[0]?.guardianPhone}</strong> with event-day details closer to the date.</p>
                  </div>
                </li>
                <li>
                  <span className="zreg-next-num">3</span>
                  <div>
                    <strong>Mark the date</strong>
                    <p>31 October 2026 · Vani Vidyalaya Sr. Sec. & Jr. College, K. K. Nagar, Chennai.</p>
                  </div>
                </li>
                <li>
                  <span className="zreg-next-num">4</span>
                  <div>
                    <strong>Prepare your mission</strong>
                    <p>{missionNote}</p>
                    {handbookHref && (
                      <a href={handbookHref} download className="zreg-handbook-link">
                        Download Handbook ↓
                      </a>
                    )}
                  </div>
                </li>
              </ol>

              <button type="button" className="zreg-submit zreg-submit-ghost" onClick={handleReset}>
                Register Another Team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}