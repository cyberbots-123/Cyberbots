import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Github, CheckCircle2 } from "lucide-react";
import "./Auth.css";

/* ── password strength helper ───────────────────────────── */
const getStrength = pwd => {
  let score = 0;
  if (pwd.length >= 8)            score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  return score; // 0-4
};

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#ef4444", "#f59e0b", "#38bdf8", "#34d399"];

export default function Signup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [mounted, setMounted]         = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(form.password);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleChange = e => {
    setError("");
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match."); return;
    }
    if (strength < 2) {
      setError("Please choose a stronger password."); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1300));
    setLoading(false);
    navigate("/dashboard");
  };

  /* Requirements checklist */
  const reqs = [
    { label: "8+ characters",          ok: form.password.length >= 8 },
    { label: "Uppercase letter",        ok: /[A-Z]/.test(form.password) },
    { label: "Number",                  ok: /[0-9]/.test(form.password) },
    { label: "Special character",       ok: /[^A-Za-z0-9]/.test(form.password) },
  ];

  return (
    <div className="auth-root">
      {/* Ambient orbs */}
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />
      <div className="auth-orb auth-orb--3" />

      <div className={`auth-card auth-card--wide${mounted ? " auth-card--in" : ""}`}>
        <div className="auth-glow-bar" />

        {/* Logo */}
        <Link to="/" className="auth-logo-link">
          <span className="auth-logo-text">Cyberbots</span>
        </Link>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-sub">Join thousands of learners on Cyberbots.</p>

        {/* Social */}
        <div className="auth-social-row">
          <button className="auth-social-btn" type="button" aria-label="Continue with Google">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button className="auth-social-btn" type="button" aria-label="Continue with GitHub">
            <Github size={17} />
            GitHub
          </button>
        </div>

        <div className="auth-divider"><span>or sign up with email</span></div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-error" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12" y2="16.01"/>
              </svg>
              {error}
            </div>
          )}

          {/* Two-column grid for name + email */}
          <div className="auth-grid-2">
            {/* Full name */}
            <div className="auth-field">
              <label htmlFor="signup-name" className="auth-label">Full name</label>
              <div className="auth-input-wrap">
                <User size={15} className="auth-input-icon" aria-hidden="true" />
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Johnson"
                  className="auth-input"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="signup-email" className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" aria-hidden="true" />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="auth-input"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="signup-password" className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" aria-hidden="true" />
              <input
                id="signup-password"
                name="password"
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
                className="auth-input"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength meter */}
            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength-bars">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="auth-strength-bar"
                      style={{
                        background: i <= strength
                          ? STRENGTH_COLORS[strength]
                          : "rgba(255,255,255,0.08)",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <span
                  className="auth-strength-label"
                  style={{ color: STRENGTH_COLORS[strength] }}
                >
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}

            {/* Requirements */}
            {form.password && (
              <ul className="auth-reqs">
                {reqs.map(r => (
                  <li key={r.label} className={`auth-req${r.ok ? " ok" : ""}`}>
                    <CheckCircle2 size={12} className="auth-req-icon" aria-hidden="true" />
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm password */}
          <div className="auth-field">
            <label htmlFor="signup-confirm" className="auth-label">Confirm password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" aria-hidden="true" />
              <input
                id="signup-confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat password"
                className={`auth-input${
                  form.confirm && form.confirm !== form.password ? " auth-input--err" : ""
                }${
                  form.confirm && form.confirm === form.password && form.password ? " auth-input--ok" : ""
                }`}
                value={form.confirm}
                onChange={handleChange}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowConfirm(p => !p)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.confirm && form.confirm !== form.password && (
              <p className="auth-field-err">Passwords don't match</p>
            )}
          </div>

          {/* Terms */}
          <p className="auth-terms">
            By creating an account you agree to our{" "}
            <Link to="/terms" className="auth-switch-link">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="auth-switch-link">Privacy Policy</Link>.
          </p>

          <button
            type="submit"
            className={`auth-submit${loading ? " loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" aria-label="Creating account…" />
            ) : (
              <>
                Create account
                <ArrowRight size={16} className="auth-submit-arrow" />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}