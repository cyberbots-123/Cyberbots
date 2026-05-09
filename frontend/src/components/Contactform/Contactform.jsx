import { useState, useRef } from "react";

/* ── Icons as tiny SVG components ── */
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
  </svg>
);
const IconPhone = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z" />
  </svg>
);
const IconMessage = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconBriefcase = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);
const IconChevron = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconHeadphone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const ENQUIRY_TYPES = [
  "General Enquiry",
  "Course Information",
  "Admissions & Enrollment",
  "Pricing & Packages",
  "School / Institutional Partnership",
  "Workshop Booking",
  "Technical Support",
  "Feedback & Suggestions",
];

const HOW_DID_YOU_HEAR = [
  "Google Search",
  "Social Media",
  "Word of Mouth",
  "School Recommendation",
  "Advertisement",
  "Events / Workshops",
  "Other",
];

/* ── Field wrapper ── */
function Field({ label, required, icon, error, children, half = false }) {
  return (
    <div style={{ gridColumn: half ? "span 1" : "span 2", display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
        textTransform: "uppercase", color: "var(--cf-label)",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ color: "var(--cf-accent)", opacity: 0.7 }}>{icon}</span>
        {label}
        {required && <span style={{ color: "var(--cf-accent)", fontSize: 11, fontWeight: 700, marginLeft: 1 }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 11, color: "var(--cf-error)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity=".15"/><path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
          {error}
        </span>
      )}
    </div>
  );
}

/* ── Styled Input ── */
function StyledInput({ id, type = "text", placeholder, value, onChange, onBlur, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id} type={type} placeholder={placeholder}
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur && onBlur(); }}
        style={{
          width: "100%", height: 46,
          padding: "0 14px",
          background: focused ? "var(--cf-input-focus-bg)" : "var(--cf-input-bg)",
          border: `1.5px solid ${hasError ? "var(--cf-error)" : focused ? "var(--cf-accent)" : "var(--cf-border)"}`,
          borderRadius: 10,
          fontSize: 14, color: "var(--cf-text)", fontFamily: "inherit",
          outline: "none",
          transition: "all 0.2s ease",
          boxShadow: focused ? "0 0 0 3px var(--cf-accent-ring)" : "none",
        }}
      />
    </div>
  );
}

/* ── Styled Select ── */
function StyledSelect({ value, onChange, children, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 46,
          padding: "0 36px 0 14px",
          appearance: "none", WebkitAppearance: "none",
          background: focused ? "var(--cf-input-focus-bg)" : "var(--cf-input-bg)",
          border: `1.5px solid ${hasError ? "var(--cf-error)" : focused ? "var(--cf-accent)" : "var(--cf-border)"}`,
          borderRadius: 10,
          fontSize: 14, color: value ? "var(--cf-text)" : "var(--cf-placeholder)",
          fontFamily: "inherit", cursor: "pointer",
          outline: "none",
          transition: "all 0.2s ease",
          boxShadow: focused ? "0 0 0 3px var(--cf-accent-ring)" : "none",
        }}
      >
        {children}
      </select>
      <div style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        color: "var(--cf-placeholder)", pointerEvents: "none",
      }}>
        <IconChevron />
      </div>
    </div>
  );
}

/* ── Phone input with country code ── */
function PhoneInput({ value, onChange, onBlur, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", height: 46,
      border: `1.5px solid ${hasError ? "var(--cf-error)" : focused ? "var(--cf-accent)" : "var(--cf-border)"}`,
      borderRadius: 10, overflow: "hidden",
      background: focused ? "var(--cf-input-focus-bg)" : "var(--cf-input-bg)",
      boxShadow: focused ? "0 0 0 3px var(--cf-accent-ring)" : "none",
      transition: "all 0.2s ease",
    }}>
      <div style={{
        display: "flex", alignItems: "center", padding: "0 12px",
        borderRight: "1.5px solid var(--cf-border)",
        fontSize: 13, fontWeight: 600, color: "var(--cf-text)",
        background: "var(--cf-input-section-bg)",
        gap: 5, whiteSpace: "nowrap", flexShrink: 0,
      }}>
        <span style={{ fontSize: 15 }}>🇮🇳</span>
        <span style={{ color: "var(--cf-placeholder)", fontSize: 12 }}>+91</span>
      </div>
      <input
        type="tel" placeholder="98765 43210" value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur && onBlur(); }}
        style={{
          flex: 1, height: "100%", padding: "0 14px",
          background: "transparent", border: "none", outline: "none",
          fontSize: 14, color: "var(--cf-text)", fontFamily: "inherit",
        }}
      />
    </div>
  );
}

/* ── Textarea ── */
function StyledTextarea({ placeholder, value, onChange, onBlur, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      placeholder={placeholder} value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); onBlur && onBlur(); }}
      rows={5}
      style={{
        width: "100%", padding: "12px 14px", resize: "vertical", minHeight: 120,
        background: focused ? "var(--cf-input-focus-bg)" : "var(--cf-input-bg)",
        border: `1.5px solid ${hasError ? "var(--cf-error)" : focused ? "var(--cf-accent)" : "var(--cf-border)"}`,
        borderRadius: 10, fontSize: 14, lineHeight: 1.65,
        color: "var(--cf-text)", fontFamily: "inherit", outline: "none",
        transition: "all 0.2s ease",
        boxShadow: focused ? "0 0 0 3px var(--cf-accent-ring)" : "none",
      }}
    />
  );
}

/* ── Checkbox ── */
function StyledCheckbox({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", userSelect: "none" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
          border: `1.5px solid ${checked ? "var(--cf-accent)" : "var(--cf-border)"}`,
          background: checked ? "var(--cf-accent)" : "var(--cf-input-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s ease", cursor: "pointer",
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 13, color: "var(--cf-muted)", lineHeight: 1.5 }}>{label}</span>
    </label>
  );
}

/* ── Contact Info Card ── */
function ContactInfoItem({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: "rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.9)",
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    organisation: "", enquiryType: "", hearAboutUs: "",
    message: "", consent: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target ? e.target.value : e }));
  const touch = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  const validate = (data) => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = "First name is required";
    if (!data.lastName.trim()) e.lastName = "Last name is required";
    if (!data.email.trim()) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Please enter a valid email";
    if (!data.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(data.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit number";
    if (!data.enquiryType) e.enquiryType = "Please select an enquiry type";
    if (!data.message.trim()) e.message = "Message is required";
    else if (data.message.trim().length < 20) e.message = "Please write at least 20 characters";
    if (!data.consent) e.consent = "Please accept to proceed";
    return e;
  };

  const handleSubmit = async () => {
    const allTouched = Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  };

  /* Live validation on touched fields */
  const liveErrors = { ...errors };
  if (touched.firstName && !form.firstName.trim()) liveErrors.firstName = "First name is required";
  else delete liveErrors.firstName;
  if (touched.lastName && !form.lastName.trim()) liveErrors.lastName = "Last name is required";
  else delete liveErrors.lastName;
  if (touched.email) {
    if (!form.email.trim()) liveErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) liveErrors.email = "Please enter a valid email";
    else delete liveErrors.email;
  }
  if (touched.phone) {
    if (!form.phone.trim()) liveErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) liveErrors.phone = "Enter a valid 10-digit number";
    else delete liveErrors.phone;
  }
  if (touched.enquiryType && !form.enquiryType) liveErrors.enquiryType = "Please select an enquiry type";
  else if (form.enquiryType) delete liveErrors.enquiryType;
  if (touched.message) {
    if (!form.message.trim()) liveErrors.message = "Message is required";
    else if (form.message.trim().length < 20) liveErrors.message = "Please write at least 20 characters";
    else delete liveErrors.message;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Playfair+Display:wght@500;600&display=swap');

        :root {
          --cf-accent: #1a56db;
          --cf-accent-dark: #1547c0;
          --cf-accent-ring: rgba(26,86,219,0.14);
          --cf-bg: #f8f9fc;
          --cf-card: #ffffff;
          --cf-panel: #0f172a;
          --cf-panel-mid: #1e293b;
          --cf-text: #0f172a;
          --cf-muted: #64748b;
          --cf-label: #475569;
          --cf-placeholder: #94a3b8;
          --cf-border: #e2e8f0;
          --cf-input-bg: #f8fafc;
          --cf-input-focus-bg: #ffffff;
          --cf-input-section-bg: #f1f5f9;
          --cf-error: #dc2626;
          --cf-success: #059669;
          --cf-divider: #f1f5f9;
          --cf-tag-bg: rgba(26,86,219,0.07);
          --cf-tag-text: #1a56db;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --cf-accent: #4f8ef7;
            --cf-accent-dark: #6fa3fa;
            --cf-accent-ring: rgba(79,142,247,0.18);
            --cf-bg: #0a0f1e;
            --cf-card: #111827;
            --cf-panel: #1e3a5f;
            --cf-panel-mid: #1a3354;
            --cf-text: #f1f5f9;
            --cf-muted: #94a3b8;
            --cf-label: #94a3b8;
            --cf-placeholder: #4b5563;
            --cf-border: #1e293b;
            --cf-input-bg: #0d1424;
            --cf-input-focus-bg: #111827;
            --cf-input-section-bg: #1e293b;
            --cf-error: #f87171;
            --cf-success: #34d399;
            --cf-divider: #1e293b;
            --cf-tag-bg: rgba(79,142,247,0.12);
            --cf-tag-text: #6fa3fa;
          }
        }

        .cf-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .cf-root { font-family: 'DM Sans', sans-serif; background: var(--cf-bg); padding: 2rem 1rem; }

        .cf-wrapper {
          max-width: 960px; margin: 0 auto;
          display: grid; grid-template-columns: 340px 1fr;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.8);
        }

        @media (max-width: 720px) {
          .cf-wrapper { grid-template-columns: 1fr; }
          .cf-panel { display: none; }
          .cf-form-section { border-radius: 20px !important; }
        }

        /* Decorative orb */
        .cf-orb {
          position: absolute; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }

        /* Submit button */
        .cf-submit {
          height: 50px; border-radius: 12px; border: none; cursor: pointer;
          background: var(--cf-accent); color: white;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
          letter-spacing: 0.01em;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(26,86,219,0.35);
          width: 100%;
          position: relative; overflow: hidden;
        }
        .cf-submit:hover:not(:disabled) {
          background: var(--cf-accent-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(26,86,219,0.45);
        }
        .cf-submit:active:not(:disabled) { transform: translateY(0); }
        .cf-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Spinner */
        .cf-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: cfSpin 0.7s linear infinite;
        }
        @keyframes cfSpin { to { transform: rotate(360deg); } }

        /* Success */
        @keyframes cfSuccessIn {
          0%  { opacity: 0; transform: scale(0.85) translateY(20px); }
          100%{ opacity: 1; transform: scale(1) translateY(0); }
        }
        .cf-success-anim { animation: cfSuccessIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

        @keyframes cfCheckDraw {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        .cf-check-path {
          stroke-dasharray: 40; stroke-dashoffset: 40;
          animation: cfCheckDraw 0.6s ease 0.3s forwards;
        }

        /* Field fade in stagger */
        @keyframes cfFieldIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cf-field-0 { animation: cfFieldIn 0.35s ease 0.05s both; }
        .cf-field-1 { animation: cfFieldIn 0.35s ease 0.1s both; }
        .cf-field-2 { animation: cfFieldIn 0.35s ease 0.15s both; }
        .cf-field-3 { animation: cfFieldIn 0.35s ease 0.2s both; }
        .cf-field-4 { animation: cfFieldIn 0.35s ease 0.25s both; }
        .cf-field-5 { animation: cfFieldIn 0.35s ease 0.3s both; }
        .cf-field-6 { animation: cfFieldIn 0.35s ease 0.35s both; }
        .cf-field-7 { animation: cfFieldIn 0.35s ease 0.4s both; }
        .cf-field-8 { animation: cfFieldIn 0.35s ease 0.45s both; }

        input::placeholder, textarea::placeholder, select option:first-child { color: var(--cf-placeholder); }

        .cf-divider-line {
          height: 1px; background: var(--cf-divider); margin: 4px 0 20px;
        }

        .cf-progress-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transition: background 0.3s, transform 0.3s;
        }
        .cf-progress-dot.active {
          background: white;
          transform: scale(1.3);
        }
      `}</style>

      <div className="cf-root">
        <div className="cf-wrapper">

          {/* ── LEFT PANEL ── */}
          <div className="cf-panel" style={{
            background: "var(--cf-panel)",
            padding: "2.5rem 2rem",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative orbs */}
            <div className="cf-orb" style={{ width: 200, height: 200, top: -60, right: -60 }} />
            <div className="cf-orb" style={{ width: 140, height: 140, bottom: 80, left: -50, background: "rgba(255,255,255,0.04)" }} />
            <div className="cf-orb" style={{ width: 80, height: 80, bottom: 200, right: 30, background: "rgba(79,142,247,0.15)" }} />

            {/* Top content */}
            <div style={{ position: "relative" }}>
              {/* Logo / Brand mark */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "var(--cf-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.01em" }}>
                  Cyberbots
                </span>
              </div>

              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
                Get in touch
              </p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28, fontWeight: 600, lineHeight: 1.25,
                color: "rgba(255,255,255,0.95)", marginBottom: 14,
              }}>
                We'd love to hear from you.
              </h2>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "2rem" }}>
                Have a question about our courses or programmes? Fill in the form and our team will get back to you within one business day.
              </p>

              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: "2rem" }} />

              {/* Contact info items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <ContactInfoItem
                  icon={<IconMapPin />}
                  label="Visit us"
                  value="CIT Nagar, Nandanam, Chennai – 600035"
                />
                <ContactInfoItem
                  icon={<IconClock />}
                  label="Office hours"
                  value="Mon – Sat, 9:00 AM – 6:00 PM"
                />
                <ContactInfoItem
                  icon={<IconHeadphone />}
                  label="Call us"
                  value="+91 73580 39311"
                />
              </div>
            </div>

            {/* Bottom — response time badge */}
            <div style={{ position: "relative", marginTop: "2.5rem" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 100, padding: "8px 14px",
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  Avg. response time under 24 hrs
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT FORM ── */}
          <div className="cf-form-section" style={{
            background: "var(--cf-card)",
            padding: "2.5rem 2.2rem",
          }}>

            {submitted ? (
              /* ── SUCCESS STATE ── */
              <div className="cf-success-anim" style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", minHeight: 400,
                textAlign: "center", padding: "2rem",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "rgba(5,150,105,0.1)",
                  border: "2px solid rgba(5,150,105,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1.5rem",
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline className="cf-check-path" points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24, fontWeight: 600, color: "var(--cf-text)", marginBottom: 10,
                }}>
                  Message received!
                </h3>
                <p style={{ fontSize: 14, color: "var(--cf-muted)", lineHeight: 1.7, maxWidth: 320 }}>
                  Thank you, <strong style={{ color: "var(--cf-text)", fontWeight: 600 }}>{form.firstName}</strong>. We've received your enquiry and will respond to{" "}
                  <span style={{ color: "var(--cf-accent)" }}>{form.email}</span> within one business day.
                </p>
                <div style={{
                  marginTop: "2rem", padding: "14px 20px",
                  background: "var(--cf-input-bg)",
                  border: "1px solid var(--cf-border)", borderRadius: 12,
                  fontSize: 13, color: "var(--cf-muted)",
                }}>
                  Reference: <span style={{ fontWeight: 600, color: "var(--cf-text)", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    CB-{Math.floor(100000 + Math.random() * 900000)}
                  </span>
                </div>
                <button
                  onClick={() => { setSubmitted(false); setForm({ firstName:"",lastName:"",email:"",phone:"",organisation:"",enquiryType:"",hearAboutUs:"",message:"",consent:false }); setTouched({}); setErrors({}); }}
                  style={{
                    marginTop: "1.5rem", padding: "10px 24px", borderRadius: 10,
                    border: "1.5px solid var(--cf-border)", background: "transparent",
                    fontSize: 13, fontWeight: 600, color: "var(--cf-muted)",
                    cursor: "pointer", transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--cf-accent)"; e.currentTarget.style.color = "var(--cf-accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--cf-border)"; e.currentTarget.style.color = "var(--cf-muted)"; }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                {/* Form header */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 21, fontWeight: 600, color: "var(--cf-text)",
                    }}>
                      General enquiry
                    </h3>
                    <span style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                      padding: "3px 10px", borderRadius: 100,
                      background: "var(--cf-tag-bg)", color: "var(--cf-tag-text)",
                    }}>
                      Free
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--cf-muted)" }}>
                    All fields marked <span style={{ color: "var(--cf-accent)", fontWeight: 600 }}>*</span> are required.
                  </p>
                </div>

                <div className="cf-divider-line" />

                {/* FORM GRID */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 16px" }}>

                  {/* First Name */}
                  <div className="cf-field-0" style={{ gridColumn: "span 1" }}>
                    <Field label="First name" required icon={<IconUser />} error={liveErrors.firstName} half>
                      <StyledInput
                        placeholder="e.g. Arjun" value={form.firstName}
                        onChange={set("firstName")} onBlur={touch("firstName")}
                        hasError={!!liveErrors.firstName}
                      />
                    </Field>
                  </div>

                  {/* Last Name */}
                  <div className="cf-field-0" style={{ gridColumn: "span 1" }}>
                    <Field label="Last name" required icon={<IconUser />} error={liveErrors.lastName} half>
                      <StyledInput
                        placeholder="e.g. Kumar" value={form.lastName}
                        onChange={set("lastName")} onBlur={touch("lastName")}
                        hasError={!!liveErrors.lastName}
                      />
                    </Field>
                  </div>

                  {/* Email */}
                  <div className="cf-field-1" style={{ gridColumn: "span 2" }}>
                    <Field label="Email address" required icon={<IconMail />} error={liveErrors.email}>
                      <StyledInput
                        type="email" placeholder="arjun@example.com" value={form.email}
                        onChange={set("email")} onBlur={touch("email")}
                        hasError={!!liveErrors.email}
                      />
                    </Field>
                  </div>

                  {/* Phone */}
                  <div className="cf-field-2" style={{ gridColumn: "span 2" }}>
                    <Field label="Phone number" required icon={<IconPhone />} error={liveErrors.phone}>
                      <PhoneInput
                        value={form.phone} onChange={set("phone")}
                        onBlur={touch("phone")} hasError={!!liveErrors.phone}
                      />
                    </Field>
                  </div>

                  {/* Organisation */}
                  <div className="cf-field-3" style={{ gridColumn: "span 2" }}>
                    <Field label="School / Organisation" icon={<IconBriefcase />}>
                      <StyledInput
                        placeholder="e.g. Vivekananda Vidyalaya (optional)"
                        value={form.organisation} onChange={set("organisation")}
                      />
                    </Field>
                  </div>

                  {/* Enquiry Type */}
                  <div className="cf-field-4" style={{ gridColumn: "span 2" }}>
                    <Field label="Enquiry type" required icon={<IconBriefcase />} error={liveErrors.enquiryType}>
                      <StyledSelect value={form.enquiryType} onChange={(e) => { set("enquiryType")(e); touch("enquiryType")(); }} hasError={!!liveErrors.enquiryType}>
                        <option value="">Select enquiry type…</option>
                        {ENQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </StyledSelect>
                    </Field>
                  </div>

                  {/* How did you hear */}
                  <div className="cf-field-5" style={{ gridColumn: "span 2" }}>
                    <Field label="How did you hear about us?" icon={<IconMessage />}>
                      <StyledSelect value={form.hearAboutUs} onChange={set("hearAboutUs")}>
                        <option value="">Select an option (optional)…</option>
                        {HOW_DID_YOU_HEAR.map((h) => <option key={h} value={h}>{h}</option>)}
                      </StyledSelect>
                    </Field>
                  </div>

                  {/* Message */}
                  <div className="cf-field-6" style={{ gridColumn: "span 2" }}>
                    <Field label="Your message" required icon={<IconMessage />} error={liveErrors.message}>
                      <StyledTextarea
                        placeholder="Tell us how we can help you. Please include any relevant details like the course name, age of the student, or specific questions…"
                        value={form.message} onChange={set("message")} onBlur={touch("message")}
                        hasError={!!liveErrors.message}
                      />
                      <div style={{
                        fontSize: 11, color: form.message.length < 20 && form.message.length > 0 ? "var(--cf-error)" : "var(--cf-placeholder)",
                        textAlign: "right", marginTop: -2,
                        transition: "color 0.2s",
                      }}>
                        {form.message.length} / 500
                      </div>
                    </Field>
                  </div>

                  {/* Consent */}
                  <div className="cf-field-7" style={{ gridColumn: "span 2" }}>
                    <StyledCheckbox
                      checked={form.consent}
                      onChange={(v) => setForm((f) => ({ ...f, consent: v }))}
                      label={
                        <>
                          I agree to be contacted by the Cyberbots team regarding my enquiry. I understand my data will be handled as per the{" "}
                          <span style={{ color: "var(--cf-accent)", fontWeight: 500, cursor: "pointer" }}>Privacy Policy</span>.
                        </>
                      }
                    />
                    {liveErrors.consent && touched.consent && (
                      <span style={{ fontSize: 11, color: "var(--cf-error)", fontWeight: 500, marginTop: 4, display: "block" }}>
                        {liveErrors.consent}
                      </span>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="cf-field-8" style={{ gridColumn: "span 2" }}>
                    <button
                      className="cf-submit"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="cf-spinner" />
                          Sending your message…
                        </>
                      ) : (
                        <>
                          <IconSend />
                          Send message
                        </>
                      )}
                    </button>

                    <p style={{ fontSize: 11.5, color: "var(--cf-placeholder)", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
                      By submitting you agree to our Terms of Service. We never share your data with third parties.
                    </p>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}