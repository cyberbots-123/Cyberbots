import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import assets from "../assets/assets";

/* ═══════════════════════════════════════════════════════════════
   CYBERFEST 2K26 — ZONE REGISTRATION (shared engine, all 6 zones)
   REDESIGN: "Celestial Observatory"

   Same royal-blue & bronze glassmorphic language as the main page:
   aurora-lit night sky, drifting runes, floating glass form card,
   a live completion meter, per-field validity ticks, a glowing
   fee ticket and an animated "sealed" success moment.

   Logic is unchanged: `config` still drives everything zone-specific
   (see zoneRegistrationConfigs.js), validation, Razorpay checkout and
   the simulated flow when no `submitEndpoint` is set are all intact.

   Team zones (teamSize 2 — including Zone 3B) render one field set
   per teammate ("Student 1", "Student 2"). Flat-fee zones (3A, 3B)
   charge one fee for the whole team.
═══════════════════════════════════════════════════════════════ */

/* ── TOKENS (shared with Cyberfest.jsx) ─────────────────────── */
const INK = "#050914";
const INK_2 = "#0a1226";
const INK_3 = "#0f1a36";
const INK_4 = "#16244a";
const PARCH = "#e6ecf7";
const ARC = "#3a62d6";
const ARC_HI = "#9db8f5";
const BRONZE = "#c98a4b";
const BRONZE_HI = "#e6b27a";
const GOLD = "#d6a35c";
const WINE = "#1e3a8a";
const MUTED = "#9aa6c0";
const ERR = "#ff8f8f";

const GENDER_OPTIONS = ["Female", "Male", "Other"];

function emptyStudent() {
  return { fullName: "", gender: "", age: "", guardianName: "", guardianPhone: "", email: "", address: "", schoolName: "", gradeClass: "" };
}
function makeInitialForm(teamSize) {
  return { students: Array.from({ length: teamSize }, emptyStudent) };
}

/* Fields that count toward the completion meter (age is optional). */
const REQUIRED_KEYS = ["fullName", "gender", "guardianName", "guardianPhone", "email", "address", "schoolName", "gradeClass"];

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
    // "age" intentionally has no validation — collected, never required.
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
   MOTION HELPERS
═══════════════════════════════════════════════════════════════ */
function useCountUp(target, duration = 600) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    if (from === target) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else prev.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* Soft pointer-follow spotlight on the glass card. */
function useSpotlight() {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
  return [ref, onMove];
}

/* ═══════════════════════════════════════════════════════════════
   AMBIENT ARTWORK — original SVG / CSS
═══════════════════════════════════════════════════════════════ */
function Stars({ count = 60 }) {
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
    <div className="zreg-fill" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute", top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, borderRadius: "50%",
            background: "#dbe6ff", boxShadow: "0 0 4px 1px rgba(157,184,245,0.45)",
            animation: `zregTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Snowfall({ count = 18 }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i, left: Math.random() * 100, size: Math.random() * 2.4 + 1.1,
        delay: Math.random() * 9, dur: Math.random() * 6 + 8, drift: (Math.random() - 0.5) * 60,
      })),
    [count]
  );
  return (
    <div className="zreg-fill" aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.id}
          style={{
            position: "absolute", top: "-4%", left: `${f.left}%`, width: f.size, height: f.size, borderRadius: "50%",
            background: "rgba(222,230,248,0.75)", "--dx": `${f.drift}px`,
            animation: `zregSnow ${f.dur}s linear ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

const RUNES = ["ᚠ", "ᚱ", "ᛗ", "ᛟ", "ᚹ", "ᛉ", "ᛞ", "ᚨ", "ᛏ"];
function RuneDrift({ count = 8 }) {
  const runes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i, r: RUNES[i % RUNES.length], left: 4 + ((i * 113) % 90), top: 8 + ((i * 61) % 78),
        delay: i * 1.7, dur: 9 + (i % 4) * 3, size: 16 + (i % 3) * 10,
      })),
    [count]
  );
  return (
    <div className="zreg-fill" aria-hidden="true">
      {runes.map((r) => (
        <span
          key={r.id}
          style={{
            position: "absolute", left: `${r.left}%`, top: `${r.top}%`, fontSize: r.size, color: ARC_HI, opacity: 0,
            fontFamily: "serif", animation: `zregRune ${r.dur}s ease-in-out ${r.delay}s infinite`,
          }}
        >
          {r.r}
        </span>
      ))}
    </div>
  );
}

function WaxSeal({ size = 78, ringColor = ARC_HI, pulse = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={pulse ? { animation: "zregSealPulse 3.2s ease-in-out infinite" } : undefined}>
      <circle cx="32" cy="32" r="30" fill={WINE} />
      <circle cx="32" cy="32" r="30" fill="none" stroke={ringColor} strokeWidth="1" opacity="0.55" />
      <circle cx="32" cy="32" r="23" fill="none" stroke={ringColor} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.6" style={{ transformOrigin: "32px 32px", animation: "zregSpin 24s linear infinite" }} />
      <path d="M32,14 L37,26 L50,27 L40,36 L43,49 L32,42 L21,49 L24,36 L14,27 L27,26 Z" fill="#e8dfc0" opacity="0.92" />
      <circle cx="32" cy="32" r="4" fill={WINE} />
    </svg>
  );
}

function ZoneIcon({ type, color = BRONZE_HI, size = 40 }) {
  const c = color;
  const p = { width: size, height: size, viewBox: "0 0 48 48", fill: "none", "aria-hidden": "true" };
  if (type === "maze")
    return (
      <svg {...p}>
        <rect x="5" y="5" width="38" height="38" rx="3" stroke={c} strokeWidth="2.4" />
        <path d="M13,5 v22 h10 v-14 h12 v22 h-22" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="24" r="2.6" fill={c} />
      </svg>
    );
  if (type === "crystal")
    return (
      <svg {...p}>
        <path d="M24,4 L38,18 L24,44 L10,18 Z" fill={c} opacity="0.35" />
        <path d="M24,4 L38,18 L24,44 L10,18 Z" stroke={c} strokeWidth="2" />
        <path d="M10,18 h28 M24,4 v40" stroke={c} strokeWidth="1.4" opacity="0.8" />
      </svg>
    );
  if (type === "wheel")
    return (
      <svg {...p}>
        <circle cx="24" cy="24" r="18" stroke={c} strokeWidth="2.4" />
        <circle cx="24" cy="24" r="7" stroke={c} strokeWidth="2" />
        <path d="M24,6 v10 M24,32 v10 M6,24 h10 M32,24 h10 M11,11 l7,7 M30,30 l7,7 M37,11 l-7,7 M18,30 l-7,7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  if (type === "sword")
    return (
      <svg {...p}>
        <path d="M9,39 L30,18 L36,12 L36,20 L14,42 Z" fill={c} opacity="0.3" />
        <path d="M9,39 L36,12 M36,12 v8 L14,42" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M39,37 L18,16 L12,10 L12,18 L34,40 Z" fill={c} opacity="0.3" />
        <path d="M39,37 L12,10 M12,10 v8 L34,40" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
    );
  if (type === "bulb")
    return (
      <svg {...p}>
        <path d="M24,6 a13,13 0 0 1 8,23 v5 h-16 v-5 a13,13 0 0 1 8,-23 z" fill={c} opacity="0.28" stroke={c} strokeWidth="2" />
        <path d="M18,38 h12 M20,42 h8" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <path d="M24,16 v12" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M11,9 h26 v30 h-26 z" fill={c} opacity="0.2" />
      <path d="M11,9 h26 v30 h-26 z" stroke={c} strokeWidth="2.2" />
      <path d="M7,9 a4,4 0 0 1 4,4 v22 a4,4 0 0 1 -4,4" stroke={c} strokeWidth="2" fill="none" />
      <path d="M41,9 a4,4 0 0 0 -4,4 v22 a4,4 0 0 0 4,4" stroke={c} strokeWidth="2" fill="none" />
      <path d="M17,18 h14 M17,24 h14 M17,30 h9" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* Floating candles, recoloured to the moonlit palette. */
function FloatingCandles() {
  const candles = useMemo(
    () => [
      { left: "6%", top: "10%", h: 44, delay: 0 },
      { left: "91%", top: "15%", h: 36, delay: 1.1 },
      { left: "14%", top: "66%", h: 32, delay: 2.3 },
      { left: "84%", top: "74%", h: 40, delay: 0.6 },
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

/* Owl swooping across on success. */
function OwlSwoop({ active }) {
  if (!active) return null;
  return (
    <svg className="zreg-owl" width="54" height="40" viewBox="0 0 54 40" aria-hidden="true">
      <path d="M27,6 C18,2 4,10 2,20 C10,17 16,20 20,26 C22,18 24,14 27,12 C30,14 32,18 34,26 C38,20 44,17 52,20 C50,10 36,2 27,6 Z" fill="#e6ecf7" opacity="0.94" />
      <circle cx="24" cy="14" r="1.6" fill="#0a1226" />
      <circle cx="30" cy="14" r="1.6" fill="#0a1226" />
    </svg>
  );
}

/* Burst of sparks radiating from the success seal. */
function SparkBurst({ color }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + Math.random() * 0.3;
        const d = 70 + Math.random() * 90;
        return { id: i, x: Math.cos(a) * d, y: Math.sin(a) * d, s: Math.random() * 4 + 2, delay: Math.random() * 0.25, hue: i % 3 };
      }),
    []
  );
  const cols = [GOLD, color, ARC_HI];
  return (
    <div className="zreg-burst" aria-hidden="true">
      {sparks.map((s) => (
        <i key={s.id} style={{ "--x": `${s.x}px`, "--y": `${s.y}px`, width: s.s, height: s.s, background: cols[s.hue], boxShadow: `0 0 8px ${cols[s.hue]}`, animationDelay: `${s.delay}s` }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FIELD WRAPPER — label, glass input, validity tick, error
═══════════════════════════════════════════════════════════════ */
function Tick() {
  return (
    <svg className="zreg-tick" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
      <path d="M5.5 10.4 8.6 13.4 14.5 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ONE TEAMMATE'S FIELD SET
═══════════════════════════════════════════════════════════════ */
function StudentFields({ studentKey, index, label, values, errors, touched, onChange, onBlur, onGenderSelect }) {
  const fieldId = (name) => `${studentKey}-${name}`;
  const showError = (name) => touched[name] && errors[name];
  const isValid = (name) => touched[name] && !errors[name] && !!(values[name] || "").toString().trim();
  const done = REQUIRED_KEYS.filter((k) => !validateField(k, values[k])).length;
  const pct = Math.round((done / REQUIRED_KEYS.length) * 100);

  const input = (name, labelText, props = {}, Tag = "input") => (
    <div className={`zreg-field${showError(name) ? " bad" : ""}${isValid(name) ? " ok" : ""}`}>
      <label className="zreg-label" htmlFor={fieldId(name)}>{labelText}</label>
      <div className="zreg-control">
        <Tag
          id={fieldId(name)}
          name={name}
          className={Tag === "textarea" ? "zreg-textarea" : "zreg-input"}
          value={values[name]}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={!!showError(name)}
          aria-describedby={showError(name) ? `err-${fieldId(name)}` : undefined}
          {...props}
        />
        <span className="zreg-glowline" aria-hidden="true" />
        {isValid(name) && <Tick />}
      </div>
      {showError(name) && <p className="zreg-error" id={`err-${fieldId(name)}`}>{errors[name]}</p>}
    </div>
  );

  return (
    <div className="zreg-student-group">
      <div className="zreg-student-heading">
        {index != null && <span className="zreg-student-badge">{index}</span>}
        <span className="zreg-student-index">{label}</span>
        <span className="zreg-student-line" />
        <span className="zreg-student-pct" style={{ "--p": pct }}>
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="15" className="trk" />
            <circle cx="18" cy="18" r="15" className="bar" style={{ strokeDashoffset: 94.25 - (94.25 * pct) / 100 }} />
          </svg>
          <b>{pct}%</b>
        </span>
      </div>

      {input("fullName", "Full Name *", { type: "text", placeholder: "Participant's full name" })}

      <div className="zreg-row">
        <div className={`zreg-field${showError("gender") ? " bad" : ""}`}>
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
        {input("age", "Age", { type: "number", inputMode: "numeric", placeholder: "9" })}
      </div>

      {input("guardianName", "Parent / Guardian Name *", { type: "text", placeholder: "Parent or guardian's full name" })}

      <div className="zreg-row">
        {input("guardianPhone", "Parent / Guardian Contact (WhatsApp) *", { type: "tel", inputMode: "tel", placeholder: "10-digit mobile number" })}
        {input("email", "Email ID (Parent / Student) *", { type: "email", placeholder: "you@example.com" })}
      </div>

      {input("address", "Address *", { rows: 3, placeholder: "House no., street, area, city, PIN" }, "textarea")}

      <div className="zreg-row">
        {input("schoolName", "School Name *", { type: "text", placeholder: "e.g., Maharishi Vidya Mandir" })}
        {input("gradeClass", "Grade & Class *", { type: "text", placeholder: "e.g., Grade 4 - A" })}
      </div>
    </div>
  );
}

/* Loads Razorpay's Checkout script once. */
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
═══════════════════════════════════════════════════════════════ */
export default function ZoneRegistrationForm({ config, onBack } = {}) {
  const {
    code, name, tagline, glyph, grade, color, colorHi, border, teamSize, feeModel, feePerStudent, flatFee,
    missionNote, handbookKey, submitEndpoint,
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
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);
  const [spotRef, onSpotMove] = useSpotlight();

  const totalFee = teamFee + (hasBotOffer && wantsBot ? botPurchaseOffer.price : 0);
  const shownFee = useCountUp(totalFee);

  // Overall completion across every teammate + consent.
  const overall = useMemo(() => {
    const per = REQUIRED_KEYS.length * teamSize + 1;
    let done = photoConsent ? 1 : 0;
    formData.students.forEach((s) => REQUIRED_KEYS.forEach((k) => { if (!validateField(k, s[k])) done += 1; }));
    return Math.round((done / per) * 100);
  }, [formData, photoConsent, teamSize]);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 900);
    return () => clearTimeout(t);
  }, []);

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
              event: "CyberFest 2K26",
              baseFee: teamFee,
              botPurchase: hasBotOffer ? wantsBot : false,
              botPurchaseFee: hasBotOffer && wantsBot ? botPurchaseOffer.price : 0,
              teamFee: totalFee,
              photoVideoConsent: true,
              students: formData.students,
            }),
          });
          // Backend saves the registration as "pending" and creates a
          // matching Razorpay order in the same call.
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
              name: "CyberFest 2K26",
              description: `${code} — ${name}`,
              prefill: { name: lead?.guardianName, email: lead?.email, contact: lead?.guardianPhone },
              theme: { color },
              // Signature is still verified server-side before it is trusted.
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
              modal: { ondismiss: () => reject(new Error("__dismissed__")) },
            });
            rzp.on("payment.failed", (resp) => {
              reject(new Error(resp?.error?.description || "Payment failed. Please try again."));
            });
            rzp.open();
          });
        } else {
          // No endpoint configured — simulate the round trip so the success moment is demonstrable.
          await new Promise((resolve) => setTimeout(resolve, 900));
          setReferenceNumber(`CF26-${code.replace(/^ZONE\s*/i, "")}-DEMO01`);
        }
        setStatus("success");
      } catch (err) {
        if (err.message === "__dismissed__") {
          setStatus("idle");
        } else {
          setSubmitError(err.message || "");
          setStatus("error");
        }
      }
    },
    [formData, touchAllFields, submitEndpoint, teamFee, totalFee, code, name, color, photoConsent, hasBotOffer, wantsBot, botPurchaseOffer]
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
    setCopied(false);
    setRevealed(false);
    setTimeout(() => setRevealed(true), 500);
  }, [teamSize]);

  const copyRef = useCallback(() => {
    if (!referenceNumber) return;
    navigator.clipboard?.writeText(referenceNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }, [referenceNumber]);

  const handbookHref = handbookKey ? assets[handbookKey] : null;

  return (
    <div className="zreg-page" style={{ "--zone-a": color, "--zone-ab": colorHi, "--zone-border": border }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .zreg-page{
          --f-display:'HP Display','Cinzel','MedievalSharp',serif;
          --f-body:'Plus Jakarta Sans',system-ui,sans-serif;
          --f-serif:'Cormorant Garamond',serif;
          --glass:rgba(255,255,255,0.045);
          --stroke:rgba(157,184,245,0.16);
          --stroke-hi:rgba(157,184,245,0.36);
          position:relative;min-height:100vh;overflow:hidden;font-family:var(--f-body);color:${PARCH};
          background:linear-gradient(180deg,#030611 0%,${INK} 40%,${INK_2} 100%);-webkit-font-smoothing:antialiased;
        }
        .zreg-page *{box-sizing:border-box;}
        .zreg-page ::selection{background:rgba(58,98,214,0.5);}
        .zreg-page :focus-visible{outline:2px solid ${BRONZE_HI};outline-offset:3px;border-radius:6px;}
        .zreg-fill{position:absolute;inset:0;pointer-events:none;overflow:hidden;}

        /* backdrop */
        .zreg-bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;opacity:.4;animation:zregKen 26s ease-in-out infinite alternate;}
        .zreg-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.55) 0%,rgba(5,9,20,.72) 40%,rgba(3,6,17,.96) 100%);}
        .zreg-aurora span{position:absolute;border-radius:50%;filter:blur(80px);mix-blend-mode:screen;animation:zregAurora 15s ease-in-out infinite;pointer-events:none;}
        .zreg-aurora .a1{width:58vw;height:42vh;left:-12%;top:-8%;background:radial-gradient(closest-side,rgba(58,98,214,.5),transparent);}
        .zreg-aurora .a2{width:44vw;height:36vh;right:-10%;top:12%;background:radial-gradient(closest-side,rgba(214,163,92,.3),transparent);animation-delay:-5s;}
        .zreg-aurora .a3{width:60vw;height:34vh;left:18%;bottom:-8%;background:radial-gradient(closest-side,rgba(90,60,200,.32),transparent);animation-delay:-9s;}
        .zreg-grid{position:absolute;inset:0;opacity:.06;pointer-events:none;background-image:linear-gradient(rgba(157,184,245,1) 1px,transparent 1px),linear-gradient(90deg,rgba(157,184,245,1) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(ellipse at 50% 30%,#000 10%,transparent 70%);mask-image:radial-gradient(ellipse at 50% 30%,#000 10%,transparent 70%);}

        .zreg-candles{position:absolute;inset:0;pointer-events:none;z-index:1;}
        .zreg-candle{position:absolute;display:flex;flex-direction:column;align-items:center;animation:zregCandleFloat 6s ease-in-out infinite;}
        .zreg-candle-flame{width:6px;height:10px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 30%,#fff6d8,${BRONZE_HI} 55%,${BRONZE} 100%);box-shadow:0 0 12px 3px rgba(230,178,122,.5);animation:zregFlicker 1.6s ease-in-out infinite;transform-origin:bottom center;}
        .zreg-candle-stick{width:5px;background:linear-gradient(180deg,#dbe6ff,#7f8ba6);border-radius:2px;margin-top:2px;opacity:.85;}

        @keyframes zregTwinkle{0%,100%{opacity:.2;transform:scale(1);}50%{opacity:1;transform:scale(1.5);}}
        @keyframes zregSnow{0%{transform:translate(0,0);opacity:0;}10%{opacity:.9;}100%{transform:translate(var(--dx,20px),115vh);opacity:.3;}}
        @keyframes zregRune{0%,100%{opacity:0;transform:translateY(0);}50%{opacity:.3;transform:translateY(-16px);}}
        @keyframes zregAurora{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(4%,-5%,0) scale(1.15);}}
        @keyframes zregKen{from{transform:scale(1.04);}to{transform:scale(1.14);}}
        @keyframes zregCandleFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        @keyframes zregFlicker{0%,100%{transform:scaleY(1) scaleX(1);opacity:1;}50%{transform:scaleY(1.15) scaleX(.9);opacity:.85;}}
        @keyframes zregSealPulse{0%,100%{filter:drop-shadow(0 0 0 rgba(58,98,214,0));}50%{filter:drop-shadow(0 0 16px rgba(90,130,240,.7));}}
        @keyframes zregSpin{to{transform:rotate(360deg);}}
        @keyframes zregRise{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:none;}}
        @keyframes zregShimmer{to{background-position:200% center;}}
        @keyframes zregRing{0%{transform:scale(.6);opacity:.9;}100%{transform:scale(2.6);opacity:0;}}
        @keyframes zregBorder{to{transform:rotate(360deg);}}
        @keyframes zregShake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-5px);}40%,80%{transform:translateX(5px);}}
        @keyframes zregPop{0%{transform:scale(.4);opacity:0;}60%{transform:scale(1.15);}100%{transform:scale(1);opacity:1;}}
        @keyframes zregDraw{from{stroke-dashoffset:1;}to{stroke-dashoffset:0;}}
        @keyframes zregSweep{0%{transform:translateX(-120%);}100%{transform:translateX(320%);}}
        @keyframes zregOwlSwoop{0%{transform:translate(-10vw,40px) rotate(-6deg);opacity:0;}12%{opacity:1;}50%{transform:translate(40vw,-30px) rotate(2deg);}100%{transform:translate(112vw,-70px) rotate(8deg);opacity:0;}}
        @keyframes zregSpark{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(var(--x),var(--y)) scale(0);opacity:0;}}
        @keyframes zregBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}

        /* page content */
        .zreg-content{position:relative;z-index:4;max-width:820px;margin:0 auto;padding:clamp(48px,8vh,96px) 22px 100px;display:flex;flex-direction:column;align-items:center;text-align:center;}
        .zreg-rise{opacity:0;animation:zregRise .9s cubic-bezier(.2,.7,.2,1) forwards;animation-delay:var(--d,0s);}
        .zreg-back{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;background:var(--glass);border:1px solid var(--stroke);color:${MUTED};font-family:var(--f-body);font-size:12px;font-weight:600;letter-spacing:.6px;border-radius:100px;padding:8px 16px;cursor:pointer;margin-bottom:26px;backdrop-filter:blur(8px);transition:all .25s ease;}
        .zreg-back:hover{color:#fff;border-color:var(--zone-ab);transform:translateX(-3px);}
        .zreg-kicker{display:inline-flex;align-items:center;gap:14px;font-family:var(--f-display);font-size:12.5px;font-weight:700;letter-spacing:5px;color:${BRONZE_HI};}
        .zreg-kicker i{display:inline-block;width:26px;height:1px;background:${BRONZE_HI};opacity:.6;}
        .zreg-zone-chip{position:relative;display:inline-block;margin-top:14px;font-family:var(--f-display);font-size:11.5px;font-weight:800;letter-spacing:3.5px;color:var(--zone-ab);border:1px solid var(--zone-border);background:rgba(5,9,20,.55);border-radius:100px;padding:7px 20px;backdrop-filter:blur(8px);}
        .zreg-title-row{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:22px;flex-wrap:wrap;}
        .zreg-title-glyph{display:flex;align-items:center;justify-content:center;width:62px;height:62px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid var(--zone-border);box-shadow:0 0 50px -10px var(--zone-a);animation:zregBob 5s ease-in-out infinite;}
        .zreg-title{font-family:var(--f-display);font-weight:900;font-size:clamp(30px,5.6vw,52px);line-height:1.1;letter-spacing:.5px;background:linear-gradient(100deg,#fff 0%,var(--zone-ab) 45%,#fff 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:zregShimmer 8s linear infinite;}
        .zreg-tagline{font-family:var(--f-serif);font-style:italic;color:var(--zone-ab);font-size:20px;margin-top:10px;}
        .zreg-meta-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:24px;}
        .zreg-meta-pill{font-size:12px;font-weight:600;letter-spacing:.4px;color:#cdd7ee;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:100px;padding:7px 16px;backdrop-filter:blur(8px);}
        .zreg-meta-pill.fee{color:${INK};background:linear-gradient(110deg,#f3d49c,${GOLD});border-color:transparent;box-shadow:0 10px 24px -12px rgba(214,163,92,.8);}

        /* overall completion meter */
        .zreg-meter{position:sticky;top:12px;z-index:20;width:100%;margin-top:34px;display:flex;align-items:center;gap:14px;padding:11px 18px;border-radius:100px;background:rgba(8,14,32,.72);border:1px solid var(--stroke);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 18px 40px -22px rgba(0,0,0,.9);}
        .zreg-meter-label{font-family:var(--f-display);font-size:10.5px;font-weight:700;letter-spacing:2.6px;color:${MUTED};text-transform:uppercase;white-space:nowrap;}
        .zreg-meter-track{flex:1;height:6px;border-radius:100px;background:rgba(255,255,255,.08);overflow:hidden;position:relative;}
        .zreg-meter-track i{position:absolute;left:0;top:0;bottom:0;border-radius:100px;background:linear-gradient(90deg,${ARC},var(--zone-ab),${BRONZE_HI});box-shadow:0 0 14px var(--zone-ab);transition:width .6s cubic-bezier(.2,.7,.2,1);overflow:hidden;}
        .zreg-meter-track i::after{content:"";position:absolute;top:0;bottom:0;width:30%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);animation:zregSweep 2.4s ease-in-out infinite;}
        .zreg-meter-pct{font-family:var(--f-display);font-size:13px;font-weight:800;color:#fff;min-width:42px;text-align:right;}

        /* glass card */
        .zreg-card-wrap{position:relative;width:100%;margin-top:22px;border-radius:30px;padding:1.5px;overflow:hidden;box-shadow:0 50px 110px -40px rgba(0,0,0,.95);}
        .zreg-card-wrap::before{content:"";position:absolute;inset:-60%;background:conic-gradient(from 0deg,transparent 0 62%,var(--zone-ab) 78%,${GOLD} 88%,transparent 100%);animation:zregBorder 9s linear infinite;opacity:.8;}
        .zreg-card{--mx:50%;--my:0%;position:relative;border-radius:29px;overflow:hidden;text-align:left;background:linear-gradient(165deg,#0e1836 0%,#0a1226 55%,#070d1d 100%);}
        .zreg-card::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(420px circle at var(--mx) var(--my),rgba(157,184,245,.14),transparent 60%),radial-gradient(ellipse 60% 35% at 92% 0%,var(--zone-border),transparent 70%),radial-gradient(ellipse 50% 40% at 0% 100%,rgba(58,98,214,.2),transparent 70%);}
        .zreg-card-top{position:relative;z-index:1;height:2px;background:linear-gradient(90deg,transparent,${GOLD},${ARC_HI},transparent);}

        /* seal gate */
        .zreg-seal-gate{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(5,9,20,.82);backdrop-filter:blur(8px);transition:opacity .7s ease .1s,transform .7s ease .1s;}
        .zreg-seal-gate.open{opacity:0;transform:scale(1.08);pointer-events:none;}
        .zreg-seal-wrap{position:relative;display:flex;align-items:center;justify-content:center;}
        .zreg-seal-wrap::before,.zreg-seal-wrap::after{content:"";position:absolute;inset:0;border-radius:50%;border:1.5px solid ${BRONZE_HI};opacity:0;animation:zregRing 2.2s ease-out infinite;}
        .zreg-seal-wrap::after{animation-delay:1.1s;}
        .zreg-seal-gate.open .zreg-seal-wrap{animation:zregPop .6s ease reverse forwards;}
        .zreg-seal-label{font-family:var(--f-display);font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${BRONZE_HI};}

        /* form */
        .zreg-form{position:relative;z-index:1;padding:clamp(26px,4vw,46px);opacity:0;transform:scale(.98) translateY(10px);transition:opacity .7s ease .15s,transform .7s ease .15s;}
        .zreg-form.revealed{opacity:1;transform:none;}
        .zreg-form-note{font-family:var(--f-serif);font-style:italic;font-size:18px;line-height:1.7;color:${MUTED};margin-bottom:22px;}

        .zreg-student-group{position:relative;}
        .zreg-student-group + .zreg-student-group{margin-top:30px;padding-top:30px;border-top:1px dashed rgba(157,184,245,.22);}
        .zreg-form.revealed .zreg-student-group{animation:zregRise .8s cubic-bezier(.2,.7,.2,1) both;}
        .zreg-form.revealed .zreg-student-group:nth-of-type(2){animation-delay:.12s;}
        .zreg-form.revealed .zreg-student-group:nth-of-type(3){animation-delay:.24s;}
        .zreg-student-heading{display:flex;align-items:center;gap:14px;margin-bottom:24px;}
        .zreg-student-badge{width:34px;height:34px;flex:none;border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:var(--f-display);font-weight:900;font-size:15px;color:${INK};background:linear-gradient(135deg,#f3d49c,var(--zone-ab) 55%,var(--zone-a));box-shadow:0 8px 20px -8px var(--zone-a);}
        .zreg-student-index{font-family:var(--f-display);font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#fff;}
        .zreg-student-line{flex:1;height:1px;background:linear-gradient(90deg,var(--zone-ab),transparent);opacity:.5;}
        .zreg-student-pct{position:relative;width:42px;height:42px;flex:none;}
        .zreg-student-pct svg{width:100%;height:100%;transform:rotate(-90deg);}
        .zreg-student-pct circle{fill:none;stroke-width:3;}
        .zreg-student-pct .trk{stroke:rgba(255,255,255,.09);}
        .zreg-student-pct .bar{stroke:var(--zone-ab);stroke-linecap:round;stroke-dasharray:94.25;transition:stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1);filter:drop-shadow(0 0 4px var(--zone-ab));}
        .zreg-student-pct b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--f-display);font-size:9.5px;font-weight:800;color:#dbe6ff;}

        .zreg-field{text-align:left;margin-bottom:20px;}
        .zreg-row{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
        @media (max-width:600px){.zreg-row{grid-template-columns:1fr;gap:0;}.zreg-meter-label{display:none;}}
        .zreg-label{display:block;font-size:11.5px;font-weight:700;letter-spacing:.9px;color:${MUTED};margin-bottom:8px;transition:color .25s ease;}
        .zreg-field:focus-within .zreg-label{color:var(--zone-ab);}
        .zreg-control{position:relative;}
        .zreg-input,.zreg-textarea{width:100%;font-family:var(--f-body);font-size:15px;font-weight:500;color:#fff;background:rgba(255,255,255,.045);border:1px solid var(--stroke);border-radius:14px;padding:13px 44px 13px 16px;transition:border-color .25s ease,box-shadow .25s ease,background .25s ease;}
        .zreg-textarea{resize:vertical;min-height:88px;}
        .zreg-input::placeholder,.zreg-textarea::placeholder{color:rgba(154,166,192,.5);}
        .zreg-input:hover,.zreg-textarea:hover{border-color:var(--stroke-hi);}
        .zreg-input:focus,.zreg-textarea:focus{outline:none;border-color:var(--zone-ab);background:rgba(255,255,255,.08);box-shadow:0 0 0 4px color-mix(in srgb,var(--zone-a) 28%,transparent),0 12px 30px -16px var(--zone-a);}
        .zreg-glowline{position:absolute;left:14px;right:14px;bottom:0;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,var(--zone-ab),${BRONZE_HI},transparent);transform:scaleX(0);transition:transform .45s cubic-bezier(.2,.7,.2,1);pointer-events:none;}
        .zreg-control:focus-within .zreg-glowline{transform:scaleX(1);}
        .zreg-field.ok .zreg-input,.zreg-field.ok .zreg-textarea{border-color:rgba(127,214,162,.45);}
        .zreg-field.bad .zreg-input,.zreg-field.bad .zreg-textarea{border-color:${ERR};background:rgba(255,120,120,.06);animation:zregShake .4s ease;}
        .zreg-tick{position:absolute;right:14px;top:14px;color:#7fd6a2;pointer-events:none;animation:zregPop .45s ease both;}
        .zreg-tick path{stroke-dasharray:1;stroke-dashoffset:1;animation:zregDraw .5s ease .1s forwards;}
        .zreg-field .zreg-textarea + .zreg-glowline + .zreg-tick{top:14px;}
        .zreg-error{display:flex;align-items:center;gap:6px;margin-top:7px;font-size:12.5px;font-weight:500;color:${ERR};animation:zregRise .3s ease both;}
        .zreg-error::before{content:"!";display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:${ERR};color:${INK};font-size:10px;font-weight:800;flex:none;}

        .zreg-gender-group{display:flex;gap:8px;flex-wrap:wrap;}
        .zreg-gender-pill{font-family:var(--f-body);font-size:13px;font-weight:600;color:#cdd7ee;background:rgba(255,255,255,.045);border:1px solid var(--stroke);border-radius:100px;padding:11px 20px;cursor:pointer;transition:all .25s ease;}
        .zreg-gender-pill:hover{border-color:var(--zone-ab);transform:translateY(-2px);}
        .zreg-gender-pill.on{color:${INK};background:var(--zone-ab);border-color:var(--zone-ab);box-shadow:0 10px 24px -10px var(--zone-a);animation:zregPop .35s ease;}

        /* bot offer */
        .zreg-bot-offer{position:relative;overflow:hidden;margin:26px 0 6px;padding:20px 22px 18px;border-radius:20px;border:1px solid rgba(214,163,92,.55);background:linear-gradient(165deg,rgba(214,163,92,.16),rgba(58,98,214,.07));box-shadow:0 18px 40px -24px rgba(214,163,92,.7);transition:box-shadow .3s ease,border-color .3s ease;}
        .zreg-bot-offer.on{border-color:${GOLD};box-shadow:0 0 0 1px ${GOLD},0 22px 50px -20px rgba(214,163,92,.9);}
        .zreg-bot-offer::after{content:"";position:absolute;top:0;bottom:0;width:30%;background:linear-gradient(100deg,transparent,rgba(255,236,200,.18),transparent);animation:zregSweep 5s ease-in-out infinite;pointer-events:none;}
        .zreg-bot-badge{position:relative;z-index:1;display:inline-block;font-family:var(--f-display);font-size:10.5px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:${INK};background:linear-gradient(110deg,#f3d49c,${GOLD} 60%,#b87a33);border-radius:100px;padding:5px 14px;margin-bottom:12px;}
        .zreg-bot-check,.zreg-consent-check{position:relative;z-index:1;display:flex;align-items:flex-start;gap:14px;cursor:pointer;}
        .zreg-box{position:relative;flex:none;width:22px;height:22px;margin-top:2px;}
        .zreg-box input{position:absolute;inset:0;opacity:0;cursor:pointer;margin:0;}
        .zreg-box span{position:absolute;inset:0;border-radius:7px;border:1.5px solid var(--stroke-hi);background:rgba(255,255,255,.04);transition:all .25s ease;}
        .zreg-box svg{position:absolute;inset:3px;color:${INK};opacity:0;}
        .zreg-box svg path{stroke-dasharray:1;stroke-dashoffset:1;}
        .zreg-box input:checked ~ span{background:linear-gradient(135deg,#f3d49c,${GOLD});border-color:${GOLD};box-shadow:0 0 16px rgba(214,163,92,.6);}
        .zreg-box input:checked ~ svg{opacity:1;}
        .zreg-box input:checked ~ svg path{animation:zregDraw .35s ease .05s forwards;}
        .zreg-box input:focus-visible ~ span{outline:2px solid ${BRONZE_HI};outline-offset:3px;}
        .zreg-bot-text{display:flex;flex-direction:column;gap:5px;}
        .zreg-bot-text strong{font-family:var(--f-display);font-weight:800;font-size:16px;color:#fff;letter-spacing:.3px;}
        .zreg-bot-text span{font-size:13.5px;line-height:1.7;color:#b3bed6;}

        /* fee ticket */
        .zreg-fee-badge{position:relative;display:flex;align-items:center;gap:16px;margin:24px 0;padding:18px 22px;border-radius:20px;border:1px solid rgba(214,163,92,.34);background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));overflow:hidden;}
        .zreg-fee-badge::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,${GOLD},${ARC_HI},transparent);}
        .zreg-fee-coin{position:relative;width:46px;height:46px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--f-display);font-weight:900;font-size:20px;color:${INK};background:linear-gradient(135deg,#f3d49c,${GOLD} 55%,#b87a33);box-shadow:0 0 26px -4px rgba(214,163,92,.8),inset 0 1px 0 rgba(255,255,255,.5);}
        .zreg-fee-coin::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:1px dashed rgba(214,163,92,.6);animation:zregSpin 14s linear infinite;}
        .zreg-fee-text{font-size:14px;color:#b3bed6;line-height:1.5;}
        .zreg-fee-text strong{font-family:var(--f-display);font-size:30px;font-weight:900;line-height:1.1;margin-right:6px;background:linear-gradient(180deg,#fff,${BRONZE_HI});-webkit-background-clip:text;background-clip:text;color:transparent;}
        .zreg-fee-text span{display:block;font-size:12.5px;color:${MUTED};margin-top:2px;}

        .zreg-consent-block{margin-bottom:22px;}
        .zreg-consent-note{font-family:var(--f-serif);font-size:17px;line-height:1.7;color:#b9c4dc;background:rgba(255,255,255,.035);border-left:3px solid var(--zone-ab);border-radius:0 14px 14px 0;padding:14px 18px;margin:0 0 16px;}
        .zreg-consent-note strong{color:#fff;font-weight:600;}
        .zreg-consent-check{font-size:14px;line-height:1.7;color:#b3bed6;}
        .zreg-consent-check strong{color:#fff;}

        /* submit */
        .zreg-submit{position:relative;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:var(--f-display);font-weight:800;font-size:14px;letter-spacing:2.4px;text-transform:uppercase;color:#1a1204;border:none;border-radius:100px;padding:18px 26px;cursor:pointer;overflow:hidden;
          background:linear-gradient(110deg,#f3d49c 0%,${GOLD} 45%,#b87a33 100%);box-shadow:0 16px 36px -14px rgba(214,163,92,.8),inset 0 1px 0 rgba(255,255,255,.55);transition:transform .25s ease,box-shadow .25s ease,filter .25s ease,opacity .25s ease;}
        .zreg-submit::after{content:"";position:absolute;top:0;bottom:0;width:26%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);animation:zregSweep 3.4s ease-in-out infinite;}
        .zreg-submit:hover:not(:disabled){transform:translateY(-3px);filter:brightness(1.08);box-shadow:0 22px 44px -14px rgba(214,163,92,.95),inset 0 1px 0 rgba(255,255,255,.55);}
        .zreg-submit:active:not(:disabled){transform:translateY(0);}
        .zreg-submit:disabled{opacity:.8;cursor:default;}
        .zreg-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(26,18,4,.3);border-top-color:#1a1204;animation:zregSpin .8s linear infinite;}
        .zreg-submit-ghost{margin-top:26px;color:var(--zone-ab);background:rgba(255,255,255,.04);border:1px solid var(--zone-border);box-shadow:none;}
        .zreg-submit-ghost::after{display:none;}
        .zreg-submit-ghost:hover:not(:disabled){background:rgba(255,255,255,.12);box-shadow:none;}
        .zreg-submit-error{display:flex;gap:10px;align-items:center;font-size:13.5px;color:${ERR};background:rgba(255,120,120,.08);border:1px solid rgba(255,143,143,.35);border-radius:14px;padding:12px 16px;margin-bottom:16px;animation:zregShake .4s ease;}
        .zreg-secure{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;font-size:11.5px;color:${MUTED};}

        /* success */
        .zreg-success{position:relative;z-index:1;padding:clamp(40px,6vw,60px) clamp(24px,4vw,46px) clamp(30px,4vw,42px);text-align:center;display:flex;flex-direction:column;align-items:center;}
        .zreg-success-seal{position:relative;display:flex;align-items:center;justify-content:center;animation:zregPop .7s cubic-bezier(.2,.8,.3,1) both;}
        .zreg-success-seal::before{content:"";position:absolute;inset:-18px;border-radius:50%;background:radial-gradient(circle,rgba(214,163,92,.45),rgba(58,98,214,.3) 55%,transparent 75%);filter:blur(10px);}
        .zreg-burst{position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none;}
        .zreg-burst i{position:absolute;left:0;top:0;border-radius:50%;animation:zregSpark 1.3s ease-out both;}
        .zreg-success-eyebrow{margin-top:22px;font-family:var(--f-display);font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${BRONZE_HI};}
        .zreg-success-title{font-family:var(--f-display);font-weight:900;font-size:clamp(28px,4.8vw,40px);margin-top:8px;background:linear-gradient(100deg,#fff,var(--zone-ab),${BRONZE_HI});-webkit-background-clip:text;background-clip:text;color:transparent;}
        .zreg-success-flavor{font-family:var(--f-serif);font-style:italic;font-size:18px;color:${MUTED};margin-top:6px;}
        .zreg-ref-box{position:relative;margin:24px 0 6px;padding:16px 26px;border-radius:18px;border:1.5px dashed var(--zone-ab);background:rgba(255,255,255,.045);display:flex;flex-direction:column;align-items:center;gap:6px;}
        .zreg-ref-label{font-family:var(--f-display);font-size:10.5px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${MUTED};}
        .zreg-ref-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:23px;font-weight:800;color:#fff;letter-spacing:1.5px;}
        .zreg-copy{font-family:var(--f-body);font-size:11.5px;font-weight:700;color:var(--zone-ab);background:none;border:1px solid var(--zone-border);border-radius:100px;padding:5px 14px;cursor:pointer;transition:all .2s ease;}
        .zreg-copy:hover{background:rgba(255,255,255,.1);}
        .zreg-success-text{font-size:14.5px;line-height:1.8;color:#b3bed6;max-width:480px;margin-top:10px;}
        .zreg-success-text strong{color:#fff;}

        .zreg-next-steps{list-style:none;display:flex;flex-direction:column;gap:14px;width:100%;text-align:left;margin-top:30px;padding:0;}
        .zreg-next-steps li{position:relative;display:flex;gap:16px;align-items:flex-start;padding:16px 18px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid var(--stroke);animation:zregRise .7s cubic-bezier(.2,.7,.2,1) both;transition:border-color .25s ease,transform .25s ease;}
        .zreg-next-steps li:nth-child(1){animation-delay:.5s;}.zreg-next-steps li:nth-child(2){animation-delay:.65s;}.zreg-next-steps li:nth-child(3){animation-delay:.8s;}.zreg-next-steps li:nth-child(4){animation-delay:.95s;}
        .zreg-next-steps li:hover{border-color:var(--zone-ab);transform:translateX(4px);}
        .zreg-next-num{flex:none;width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:var(--f-display);font-weight:900;font-size:13px;color:${INK};background:linear-gradient(135deg,#f3d49c,var(--zone-ab) 55%,var(--zone-a));}
        .zreg-next-steps strong{font-family:var(--f-display);font-size:14.5px;font-weight:800;letter-spacing:.4px;color:#fff;display:block;margin-bottom:3px;}
        .zreg-next-steps p{font-size:13.5px;line-height:1.7;color:#b3bed6;margin:0;}
        .zreg-next-steps p strong{display:inline;font-family:var(--f-body);font-size:inherit;letter-spacing:0;color:#fff;}
        .zreg-handbook-link{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:12px;font-weight:700;color:var(--zone-ab);border:1px solid var(--zone-border);border-radius:100px;padding:6px 14px;text-decoration:none;transition:all .2s ease;}
        .zreg-handbook-link:hover{background:rgba(255,255,255,.1);color:#fff;transform:translateY(-2px);}
        .zreg-owl{position:absolute;top:6%;left:0;z-index:3;animation:zregOwlSwoop 2.4s ease-out forwards;}

        @media (prefers-reduced-motion: reduce){
          .zreg-page *,.zreg-page *::before,.zreg-page *::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;}
        }
      `}</style>

      {assets.Zone1ARegisterBg && <img src={assets.Zone1ARegisterBg} alt="" aria-hidden="true" className="zreg-bg-img" />}
      <div className="zreg-scrim" aria-hidden="true" />
      <div className="zreg-aurora zreg-fill" aria-hidden="true">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>
      <div className="zreg-grid" aria-hidden="true" />
      <Stars count={60} />
      <Snowfall count={16} />
      <RuneDrift count={7} />
      <FloatingCandles />

      <div className="zreg-content">
        {onBack && (
          <button type="button" className="zreg-back zreg-rise" onClick={onBack}>
            <span aria-hidden="true">‹</span> Back to CyberFest 2K26
          </button>
        )}

        <div className="zreg-kicker zreg-rise" style={{ "--d": ".05s" }}>
          <i /> CYBERFEST 2K26 <i />
        </div>
        <div className="zreg-zone-chip zreg-rise" style={{ "--d": ".15s" }}>{code}</div>
        <div className="zreg-title-row zreg-rise" style={{ "--d": ".25s" }}>
          <span className="zreg-title-glyph"><ZoneIcon type={glyph} color={colorHi} size={34} /></span>
          <h1 className="zreg-title">{name}</h1>
        </div>
        <p className="zreg-tagline zreg-rise" style={{ "--d": ".35s" }}>{tagline}</p>

        <div className="zreg-meta-row zreg-rise" style={{ "--d": ".45s" }}>
          <span className="zreg-meta-pill">{grade}</span>
          <span className="zreg-meta-pill">{teamSize > 1 ? `Team of ${teamSize}` : "Individual"}</span>
          <span className="zreg-meta-pill fee">Fee · ₹{totalFee.toLocaleString("en-IN")} / {entryWord}</span>
        </div>

        {status !== "success" && (
          <div className="zreg-meter zreg-rise" style={{ "--d": ".55s" }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall} aria-label="Registration completion">
            <span className="zreg-meter-label">Seal Progress</span>
            <span className="zreg-meter-track"><i style={{ width: `${overall}%` }} /></span>
            <span className="zreg-meter-pct">{overall}%</span>
          </div>
        )}

        <div className="zreg-card-wrap zreg-rise" style={{ "--d": ".65s" }} ref={cardRef}>
          <div className="zreg-card" ref={spotRef} onMouseMove={onSpotMove}>
            <div className="zreg-card-top" aria-hidden="true" />

            <div className={`zreg-seal-gate${revealed ? " open" : ""}`} aria-hidden="true">
              <div className="zreg-seal-wrap"><WaxSeal size={86} ringColor={colorHi} /></div>
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
                  <div className={`zreg-bot-offer${wantsBot ? " on" : ""}`}>
                    <span className="zreg-bot-badge">✶ {botPurchaseOffer.label} ✶</span>
                    <label className="zreg-bot-check">
                      <span className="zreg-box">
                        <input type="checkbox" checked={wantsBot} onChange={(e) => setWantsBot(e.target.checked)} />
                        <span />
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.4 6.4 11.6 13 4.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" /></svg>
                      </span>
                      <span className="zreg-bot-text">
                        <strong>Optional Bot Purchase — ₹{botPurchaseOffer.price.toLocaleString("en-IN")}</strong>
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
                    <strong>{shownFee.toLocaleString("en-IN")}</strong> total registration fee for this {entryWord}
                    {feeModel === "per-student" && (
                      <span>₹{feePerStudent} × {teamSize} participant{teamSize > 1 ? "s" : ""}</span>
                    )}
                    {feeModel === "flat" && (
                      <span>
                        Flat fee of ₹{flatFee.toLocaleString("en-IN")} for the whole {entryWord}
                        {teamSize > 1 ? ` of ${teamSize}` : ""}
                      </span>
                    )}
                    {hasBotOffer && wantsBot && <span>+ ₹{botPurchaseOffer.price.toLocaleString("en-IN")} official bot purchase</span>}
                  </span>
                </div>

                <div className="zreg-consent-block">
                  <p className="zreg-consent-note">
                    <strong>Emergency Contact Statement.</strong> I understand that guardian details provided
                    will be used only for emergency communication during the event.
                  </p>

                  <label className="zreg-consent-check">
                    <span className="zreg-box">
                      <input
                        type="checkbox"
                        checked={photoConsent}
                        onChange={(e) => {
                          setPhotoConsent(e.target.checked);
                          setPhotoConsentTouched(true);
                        }}
                        aria-invalid={photoConsentTouched && !photoConsent}
                      />
                      <span />
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.4 6.4 11.6 13 4.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" /></svg>
                    </span>
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
                  {status === "submitting" && <span className="zreg-spinner" aria-hidden="true" />}
                  {status === "submitting" ? "Opening secure payment…" : `Pay ₹${totalFee.toLocaleString("en-IN")} & Seal Registration`}
                </button>
                <div className="zreg-secure">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.5" /></svg>
                  Payments are processed securely by Razorpay
                </div>
              </form>
            ) : (
              <div className="zreg-success">
                <OwlSwoop active={status === "success"} />
                <div className="zreg-success-seal">
                  <WaxSeal size={72} ringColor={colorHi} />
                  <SparkBurst color={colorHi} />
                </div>
                <span className="zreg-success-eyebrow">✶ Registration Sealed ✶</span>
                <h2 className="zreg-success-title">Your Journey Begins!</h2>
                <p className="zreg-success-flavor">Your owl has departed to deliver the news.</p>

                {referenceNumber && (
                  <div className="zreg-ref-box">
                    <span className="zreg-ref-label">Your Reference Number</span>
                    <span className="zreg-ref-code">{referenceNumber}</span>
                    <button type="button" className="zreg-copy" onClick={copyRef}>{copied ? "Copied ✓" : "Copy"}</button>
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
                      <p>05 December 2026 · Maharishi Vidya Mandir Senior Secondary School, Chetpet.</p>
                    </div>
                  </li>
                  <li>
                    <span className="zreg-next-num">4</span>
                    <div>
                      <strong>Prepare your mission</strong>
                      <p>{missionNote}</p>
                      {handbookHref && (
                        <a href={handbookHref} download className="zreg-handbook-link">Download Handbook ↓</a>
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
    </div>
  );
}