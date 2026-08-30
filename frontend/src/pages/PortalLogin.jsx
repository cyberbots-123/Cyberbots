// src/pages/PortalLogin.jsx — DEBUG-INSTRUMENTED VERSION
// Dedicated login for the Cyberbots multi-school portal — intentionally
// separate from components/Login/Login.jsx, which handles a different
// part of the site.
// Remove all [DEBUG] blocks before deploying.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PortalLogin() {
  const { login } = useAuth();
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

    // [DEBUG] If you log in and this line does NOT print, a DIFFERENT
    // login page handled your submit (e.g. components/Login/Login.jsx
    // at /login) — which is a major clue by itself.
    console.log("[FE:PortalLogin] submitting for", email);

    setError("");
    setSubmitting(true);
    try {
      const u = await login(email, password);
      // [DEBUG]
      console.log("[FE:PortalLogin] login OK — role =", u.role, "→ navigating to /portal");
      navigate("/portal");
    } catch (err) {
      // [DEBUG]
      console.log("[FE:PortalLogin] login FAILED — status =", err.status, "message =", err.message);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cbp-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

        * { box-sizing: border-box; }

        .cbp-shell {
          min-height: 100vh;
          display: flex;
          background: #F7F8FA;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .cbp-panel {
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

        .cbp-wordmark {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 22px;
          letter-spacing: 0.04em;
          color: #FFFFFF;
          position: relative;
          z-index: 2;
        }

        .cbp-wordmark span { color: #F2A900; }

        .cbp-tagline {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6E8CB3;
          margin-top: 6px;
          position: relative;
          z-index: 2;
        }

        .cbp-badge {
          display: inline-block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2DD4BF;
          border: 1px solid rgba(45, 212, 191, 0.4);
          border-radius: 5px;
          padding: 3px 8px;
          margin-top: 14px;
          position: relative;
          z-index: 2;
        }

        .cbp-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 30px;
          line-height: 1.25;
          max-width: 380px;
          color: #F2F5FA;
          position: relative;
          z-index: 2;
        }

        .cbp-headline em {
          font-style: normal;
          color: #2DD4BF;
        }

        .cbp-stats {
          display: flex;
          gap: 32px;
          position: relative;
          z-index: 2;
        }

        .cbp-stat-num {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: #FFFFFF;
        }

        .cbp-stat-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6E8CB3;
          margin-top: 2px;
        }

        .cbp-circuit-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .cbp-trace {
          fill: none;
          stroke: #1E3352;
          stroke-width: 1.5;
          transition: stroke 0.6s ease, filter 0.6s ease;
        }

        .cbp-trace.lit {
          stroke: #2DD4BF;
          filter: drop-shadow(0 0 4px rgba(45, 212, 191, 0.8));
        }

        .cbp-trace.lit.gold {
          stroke: #F2A900;
          filter: drop-shadow(0 0 6px rgba(242, 169, 0, 0.9));
        }

        .cbp-node {
          transition: fill 0.6s ease, filter 0.6s ease;
          fill: #1E3352;
        }

        .cbp-node.lit {
          fill: #2DD4BF;
          filter: drop-shadow(0 0 5px rgba(45, 212, 191, 0.9));
        }

        .cbp-node.lit.gold {
          fill: #F2A900;
          filter: drop-shadow(0 0 7px rgba(242, 169, 0, 1));
        }

        .cbp-form-panel {
          flex: 1 1 54%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .cbp-card {
          width: 100%;
          max-width: 380px;
        }

        .cbp-card-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94A3B8;
          margin-bottom: 8px;
        }

        .cbp-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: #12233D;
          margin-bottom: 28px;
        }

        .cbp-field {
          margin-bottom: 20px;
        }

        .cbp-label {
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

        .cbp-label-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #CBD5E1;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .cbp-label-dot.on {
          background: #2DD4BF;
          box-shadow: 0 0 6px rgba(45, 212, 191, 0.8);
        }

        .cbp-input {
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

        .cbp-input:focus {
          border-color: #2DD4BF;
          box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.14);
        }

        .cbp-error {
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

        .cbp-button {
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

        .cbp-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cbp-button.ready:not(:disabled) {
          background: #F2A900;
          color: #12233D;
        }

        .cbp-button:not(:disabled):active {
          transform: scale(0.99);
        }

        .cbp-footnote {
          margin-top: 20px;
          font-size: 12px;
          color: #94A3B8;
          text-align: center;
        }

        @media (max-width: 860px) {
          .cbp-panel { display: none; }
          .cbp-form-panel { flex: 1 1 100%; }
        }
      `}</style>

      {/* Left identity panel */}
      <div className="cbp-panel">
        <svg className="cbp-circuit-svg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
          <path className={`cbp-trace ${emailFilled ? "lit" : ""}`} d="M -10 180 H 120 V 260 H 260" />
          <path className={`cbp-trace ${passwordFilled ? "lit" : ""}`} d="M -10 340 H 90 V 420 H 260" />
          <path className={`cbp-trace ${circuitComplete ? "lit gold" : ""}`} d="M 260 260 V 420 H 410" />
          <circle className={`cbp-node ${emailFilled ? "lit" : ""}`} cx="260" cy="260" r="5" />
          <circle className={`cbp-node ${passwordFilled ? "lit" : ""}`} cx="260" cy="420" r="5" />
          <circle className={`cbp-node ${circuitComplete ? "lit gold" : ""}`} cx="260" cy="340" r="5" />
          <path className="cbp-trace" d="M -10 500 H 60 V 560 H 200 V 500 H 340" />
          <circle className="cbp-node" cx="200" cy="500" r="4" />
          <circle className="cbp-node" cx="340" cy="500" r="4" />
        </svg>

        <div>
          <div className="cbp-wordmark">CYBER<span>BOTS</span></div>
          <div className="cbp-tagline">Academic Enrichment Delivery System</div>
          {/* <div className="cbp-badge">School Portal</div> */}
        </div>

        <div className="cbp-headline">
          Every school's program, <em>wired into one dashboard.</em>
        </div>

        <div className="cbp-stats">
          <div>
            <div className="cbp-stat-num">100+</div>
            <div className="cbp-stat-label">Schools</div>
          </div>
          <div>
            <div className="cbp-stat-num">13</div>
            <div className="cbp-stat-label">Program modules</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="cbp-form-panel">
        <form onSubmit={handleSubmit} className="cbp-card">
          {/* <div className="cbp-card-eyebrow">Faculty &amp; admin access</div> */}
          <div className="cbp-card-title">Sign in to your portal</div>

          <div className="cbp-field">
            <label className="cbp-label">
              <span className={`cbp-label-dot ${emailFilled ? "on" : ""}`} />
              Email
            </label>
            <input
              className="cbp-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="cbp-field">
            <label className="cbp-label">
              <span className={`cbp-label-dot ${passwordFilled ? "on" : ""}`} />
              Password
            </label>
            <input
              className="cbp-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="cbp-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            className={`cbp-button ${circuitComplete ? "ready" : ""}`}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          {/* <div className="cbp-footnote">Access is scoped to your school by your admin.</div> */}
        </form>
      </div>
    </div>
  );
}