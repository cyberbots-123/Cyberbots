import { useState } from "react";

export default function UnderConstruction({ pageName = "" }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Animated gradient orbs */}
      <div style={{
        position: "absolute", top: "-10%", left: "-5%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        animation: "float 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-5%",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        animation: "float 10s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      {/* Subtle dot grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      {/* Main content */}
      <div style={{
        position: "relative", zIndex: 1,
        textAlign: "center",
        padding: "48px 32px",
        maxWidth: "560px",
        width: "100%",
      }}>

        {/* Icon
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "80px", height: "80px", borderRadius: "20px",
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.25)",
          marginBottom: "32px",
          animation: "pulse 3s ease-in-out infinite",
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div> */}

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "999px",
          padding: "4px 14px",
          marginBottom: "24px",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#6366f1",
            animation: "blink 1.5s ease-in-out infinite",
            display: "inline-block",
          }} />
          <span style={{
            fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em",
            color: "#818cf8", textTransform: "uppercase",
          }}>
            {pageName} · Coming Soon
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 52px)",
          fontWeight: 700,
          color: "#f1f5f9",
          lineHeight: 1.15,
          margin: "0 0 16px",
          letterSpacing: "-0.03em",
        }}>
          We're building<br />
          <span style={{
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            something great
          </span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: "16px",
          color: "rgba(148,163,184,0.8)",
          lineHeight: 1.75,
          margin: "0 0 40px",
        }}>
          This page is currently under construction.<br />
          We'll be back shortly with an improved experience.
        </p>

        {/* Progress */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "32px",
          textAlign: "left",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginBottom: "10px",
          }}>
            <span style={{ fontSize: "13px", color: "rgba(148,163,184,0.7)", fontWeight: 500 }}>
              Development Progress
            </span>
            <span style={{ fontSize: "13px", color: "#818cf8", fontWeight: 600 }}>72%</span>
          </div>
          <div style={{
            height: "5px", background: "rgba(255,255,255,0.06)",
            borderRadius: "999px", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: "72%",
              background: "linear-gradient(90deg, #4f46e5, #8b5cf6, #a78bfa)",
              borderRadius: "999px",
              animation: "shimmer 2s ease-in-out infinite",
            }} />
          </div>
        </div>

        {/* Email notify */}
        {!submitted ? (
          <div style={{
            display: "flex", gap: "10px",
            flexWrap: "wrap", justifyContent: "center",
          }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                flex: "1", minWidth: "200px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "13px 18px",
                fontSize: "14px",
                color: "#f1f5f9",
                outline: "none",
              }}
            />
            <button
              onClick={handleSubmit}
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                border: "none",
                borderRadius: "10px",
                padding: "13px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
              }}
            >
              Notify Me
            </button>
          </div>
        ) : (
          <div style={{
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "10px",
            padding: "14px 24px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: "14px", color: "#4ade80", fontWeight: 500 }}>
              You're on the list! We'll notify you.
            </span>
          </div>
        )}

        {/* Footer note */}
        {/* <p style={{
          marginTop: "36px",
          fontSize: "12px",
          color: "rgba(100,116,139,0.6)",
          letterSpacing: "0.02em",
        }}>
          Expected launch · Q3 2025
        </p> */}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        input::placeholder { color: rgba(100,116,139,0.6); }
        input:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        button:hover { filter: brightness(1.1); transform: translateY(-1px); transition: all 0.2s; }
      `}</style>
    </div>
  );
}