// src/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  // FIX: this page previously relied on "App.jsx reacts to that and routes
  // to the admin console" — but App.jsx has no such logic. A successful
  // login set the user in context and then just… sat on the form. It now
  // navigates to /portal exactly like PortalLogin does, and Portal's role
  // router takes it from there (admin → AdminPanel, client → dashboard).
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailFilled = email.trim().length > 0;
  const passwordFilled = password.trim().length > 0;
  const circuitComplete = emailFilled && passwordFilled;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/portal"); // FIX: actually go somewhere on success
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cb-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

        * { box-sizing: border-box; }

        .cb-shell {
          min-height: 100vh;
          display: flex;
          background: #F7F8FA;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .cb-panel {
          flex: 1 1 46%;
          position: relative;
          background: linear-gradient(160deg, #0B1526 0%, #12233D 65%, #0E1B30 100%);
          color: #E7ECF5;
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }

        .cb-wordmark {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 22px;
          letter-spacing: 0.04em;
          color: #FFFFFF;
          position: relative;
          z-index: 2;
        }

        .cb-wordmark span { color: #F2A900; }

        .cb-tagline {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6E8CB3;
          margin-top: 6px;
          position: relative;
          z-index: 2;
        }

        .cb-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 30px;
          line-height: 1.25;
          max-width: 380px;
          color: #F2F5FA;
          position: relative;
          z-index: 2;
        }

        .cb-headline em {
          font-style: normal;
          color: #2DD4BF;
        }

        .cb-stats {
          display: flex;
          gap: 32px;
          position: relative;
          z-index: 2;
        }

        .cb-stat-num {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: #FFFFFF;
        }

        .cb-stat-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6E8CB3;
          margin-top: 2px;
        }

        .cb-circuit-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .cb-trace {
          fill: none;
          stroke: #1E3352;
          stroke-width: 1.5;
          transition: stroke 0.6s ease, filter 0.6s ease;
        }

        .cb-trace.lit {
          stroke: #2DD4BF;
          filter: drop-shadow(0 0 4px rgba(45, 212, 191, 0.8));
        }

        .cb-trace.lit.gold {
          stroke: #F2A900;
          filter: drop-shadow(0 0 6px rgba(242, 169, 0, 0.9));
        }

        .cb-node {
          transition: fill 0.6s ease, filter 0.6s ease;
          fill: #1E3352;
        }

        .cb-node.lit {
          fill: #2DD4BF;
          filter: drop-shadow(0 0 5px rgba(45, 212, 191, 0.9));
        }

        .cb-node.lit.gold {
          fill: #F2A900;
          filter: drop-shadow(0 0 7px rgba(242, 169, 0, 1));
        }

        .cb-form-panel {
          flex: 1 1 54%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .cb-card {
          width: 100%;
          max-width: 380px;
        }

        .cb-card-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94A3B8;
          margin-bottom: 8px;
        }

        .cb-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: #12233D;
          margin-bottom: 28px;
        }

        .cb-field {
          margin-bottom: 20px;
        }

        .cb-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #64748B;
          margin-bottom: 8px;
        }

        .cb-label-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #CBD5E1;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .cb-label-dot.on {
          background: #2DD4BF;
          box-shadow: 0 0 6px rgba(45, 212, 191, 0.8);
        }

        .cb-input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #DCE1E8;
          border-radius: 10px;
          font-size: 14.5px;
          font-family: 'Inter', sans-serif;
          outline: none;
          background: #FFFFFF;
          color: #12233D;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .cb-input:focus {
          border-color: #2DD4BF;
          box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.14);
        }

        .cb-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #FFF1EC;
          border: 1px solid #FFD4C4;
          border-radius: 8px;
          padding: 10px 12px;
          color: #C4432B;
          font-size: 12.5px;
          margin-top: 4px;
          margin-bottom: 4px;
        }

        .cb-button {
          width: 100%;
          margin-top: 24px;
          padding: 13px;
          border: none;
          border-radius: 10px;
          background: #12233D;
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.1s ease;
        }

        .cb-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cb-button.ready:not(:disabled) {
          background: #F2A900;
          color: #12233D;
        }

        .cb-button:not(:disabled):active {
          transform: scale(0.99);
        }

        .cb-footnote {
          margin-top: 20px;
          font-size: 12px;
          color: #94A3B8;
          text-align: center;
        }

        @media (max-width: 860px) {
          .cb-panel { display: none; }
          .cb-form-panel { flex: 1 1 100%; }
        }
      `}</style>

      {/* Left identity panel */}
      <div className="cb-panel">
        <svg className="cb-circuit-svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
          <path className={`cb-trace ${emailFilled ? "lit" : ""}`} d="M -10 180 H 120 V 260 H 260" />
          <path className={`cb-trace ${passwordFilled ? "lit" : ""}`} d="M -10 340 H 90 V 420 H 260" />
          <path className={`cb-trace ${circuitComplete ? "lit gold" : ""}`} d="M 260 260 V 420 H 410" />
          <circle className={`cb-node ${emailFilled ? "lit" : ""}`} cx="260" cy="260" r="5" />
          <circle className={`cb-node ${passwordFilled ? "lit" : ""}`} cx="260" cy="420" r="5" />
          <circle className={`cb-node ${circuitComplete ? "lit gold" : ""}`} cx="260" cy="340" r="5" />
          <path className="cb-trace" d="M -10 500 H 60 V 560 H 200 V 500 H 340" />
          <circle className="cb-node" cx="200" cy="500" r="4" />
          <circle className="cb-node" cx="340" cy="500" r="4" />
        </svg>

        <div>
          <div className="cb-wordmark">CYBER<span>BOTS</span></div>
          <div className="cb-tagline">Academic Enrichment Delivery System</div>
        </div>

        <div className="cb-headline">
          Every school's program, <em>wired into one dashboard.</em>
        </div>

        <div className="cb-stats">
          <div>
            <div className="cb-stat-num">50+</div>
            <div className="cb-stat-label">Schools live</div>
          </div>
          <div>
            <div className="cb-stat-num">13</div>
            <div className="cb-stat-label">Program modules</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="cb-form-panel">
        <form onSubmit={handleSubmit} className="cb-card">
          <div className="cb-card-eyebrow">Faculty &amp; admin access</div>
          <div className="cb-card-title">Sign in to your dashboard</div>

          <div className="cb-field">
            <label className="cb-label">
              <span className={`cb-label-dot ${emailFilled ? "on" : ""}`} />
              Email
            </label>
            <input
              className="cb-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="cb-field">
            <label className="cb-label">
              <span className={`cb-label-dot ${passwordFilled ? "on" : ""}`} />
              Password
            </label>
            <input
              className="cb-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="cb-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            className={`cb-button ${circuitComplete ? "ready" : ""}`}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <div className="cb-footnote">Access is scoped to your school by your admin.</div>
        </form>
      </div>
    </div>
  );
}