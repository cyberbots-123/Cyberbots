import { useNavigate, useParams } from "react-router-dom";
import ZoneRegistrationForm from "./ZoneRegistrationForm";
import { ZONE_REGISTRATION_CONFIGS } from "./zoneRegistrationConfigs";

/* Route wrapper for /register/:zoneSlug (e.g. /register/zone-1a) — strips
   the "zone-" prefix, looks the rest up in ZONE_REGISTRATION_CONFIGS, and
   hands the matching config to the shared form. This one file now serves
   all six zones; there's no per-zone route file anymore (this replaces the
   old Zone1ARegister.jsx).

   The route itself is "/register/:zoneSlug", NOT "/register/zone-:zoneId" —
   React Router v6 only treats a URL segment as dynamic when the ":" comes
   immediately after a "/", so a mixed segment like "zone-:zoneId" silently
   never matches. Capturing the whole segment and stripping the prefix here
   is what actually works while keeping the existing /register/zone-1a URLs. */
export default function ZoneRegister() {
  const { zoneSlug } = useParams();
  const navigate = useNavigate();
  const zoneId = zoneSlug ? zoneSlug.replace(/^zone-/, "") : "";
  const config = ZONE_REGISTRATION_CONFIGS[zoneId];

  if (!config) {
    // Unknown/not-yet-configured zone id in the URL — send them back
    // rather than showing a broken form.
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#05060d", color: "#e4e6f2", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <p style={{ marginBottom: 16 }}>We couldn't find a registration form for "{zoneId}".</p>
          <button
            type="button"
            onClick={() => navigate("/events")}
            style={{ padding: "10px 20px", borderRadius: 100, border: "1px solid #8fe3f2", background: "transparent", color: "#8fe3f2", cursor: "pointer" }}
          >
            ‹ Back to CyberFlix 2K26
          </button>
        </div>
      </div>
    );
  }

  // navigate(-1) sends visitors back to wherever they opened this form
  // from (typically the CyberFlix carnival page's zone modal). If
  // you'd rather the "Back" button always land on a fixed page instead,
  // replace this with: () => navigate("/events")
  return <ZoneRegistrationForm config={config} onBack={() => navigate(-1)} />;
}