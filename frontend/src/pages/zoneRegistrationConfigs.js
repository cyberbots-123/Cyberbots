/* ═══════════════════════════════════════════════════════════════
   CYBERFLIX 2K26 — PER-ZONE REGISTRATION CONFIG

   One entry per zone, keyed by the same id used throughout
   CyberFlixCarnival.jsx's ZONES array ("1a", "1b", "2a", "2b", "3a",
   "3b"). ZoneRegister.jsx looks a zone up here by its URL segment and
   hands the matching config to the shared <ZoneRegistrationForm>.

   Field reference:
   - code / name / tagline / glyph / grade / color / colorHi / border
       Decorative — color/colorHi/border and glyph are carried over
       exactly from CyberFlixCarnival.jsx's ZONES table so this page
       reads as the same zone, not a generic template wearing its name.
   - teamSize: 1 = individual entry, 2 = team of 2 (StudentFields is
       rendered once per teamSize; the "Student N" numbered heading
       only shows when teamSize > 1).
   - feeModel: "per-student" (fee = feePerStudent × teamSize) or
       "flat" (fee = flatFee regardless of teamSize).
   - missionNote: the "Prepare your mission" line on the success
       screen's next-steps checklist.
   - handbookKey: the assets.js export name for that zone's handbook
       PDF (matches the `handbook:` field already used in
       CyberFlixCarnival.jsx's ZONES array) — leave "" if none.
   - submitEndpoint: where this zone's registrations should POST to.
       Empty string = simulate the round trip (no backend wired yet).

       Currently set to your LOCAL backend (http://localhost:5000,
       matching PORT=5000 in your .env) so you can test end-to-end
       while developing. Before deploying, swap this for your
       production API's URL, e.g.:
         "https://api.yourdomain.com/api/zone-registration"
       All six zones share the same backend endpoint — the zone id
       travels inside the request body, not the URL — so if you ever
       need a per-zone override you can still set individual values
       here, but there's no need to right now.
   - botPurchase: optional add-on shown as its own highlighted, gold-
       accented card (visually distinct from the rest of the form) with
       a checkbox to opt in. When checked, `price` is added on top of
       the base registration fee in the fee badge, the success screen,
       and the submit payload. Shape: { price: number, label: string }.
       Leave the whole field out (or null) for zones with no bot to sell.
═══════════════════════════════════════════════════════════════ */

// Single source of truth for the endpoint — change this one line when
// you deploy, instead of editing all six entries below.
const SUBMIT_ENDPOINT = "http://localhost:5000/api/zone-registration";

export const ZONE_REGISTRATION_CONFIGS = {
  "1a": {
    id: "1a",
    code: "ZONE 1A",
    name: "Chamber of Circuits",
    tagline: "Discover. Build. Collaborate.",
    glyph: "scroll",
    grade: "Grades 3–5",
    color: "#8a6d1f",
    colorHi: "#e3c766",
    border: "rgba(138,109,31,0.4)",
    teamSize: 2,
    feeModel: "per-student",
    feePerStudent: 850,
    flatFee: null,
    missionNote: "Study your Spell Scroll clues and start planning your build strategy.",
    handbookKey: "Zone1AHandbook",
    submitEndpoint: SUBMIT_ENDPOINT,
  },

  "1b": {
    id: "1b",
    code: "ZONE 1B",
    name: "The Triwizard Quest",
    tagline: "Navigate. Observe. Strategize.",
    glyph: "maze",
    grade: "Grades 3–5",
    color: "#2f7d4f",
    colorHi: "#7fd6a2",
    border: "rgba(47,125,79,0.42)",
    teamSize: 1,
    feeModel: "per-student",
    feePerStudent: 850,
    flatFee: null,
    missionNote: "Get familiar with the remote controller before you take on the maze.",
    handbookKey: "Zone1BHandbook",
    submitEndpoint: SUBMIT_ENDPOINT,
  },

  "2a": {
    id: "2a",
    code: "ZONE 2A",
    name: "The Founder's Vault",
    tagline: "Solve. Collect. Unlock.",
    glyph: "crystal",
    grade: "Grades 6–8",
    color: "#5b3fa8",
    colorHi: "#b49bf0",
    border: "rgba(91,63,168,0.42)",
    teamSize: 2, // confirmed: Team of 2, like Zone 1A
    feeModel: "per-student",
    feePerStudent: 850, // confirmed: ₹850 × 2 = ₹1,700 total
    flatFee: null,
    missionNote: "Review the four House Crystal challenges before mission day.",
    handbookKey: "Zone2AHandbook",
    submitEndpoint: SUBMIT_ENDPOINT,
  },

  "2b": {
    id: "2b",
    code: "ZONE 2B",
    name: "Wizard's Rally",
    tagline: "Drive. Balance. Conquer.",
    glyph: "wheel",
    grade: "Grades 6–8",
    color: "#8c5220",
    colorHi: "#e0a06a",
    border: "rgba(140,82,32,0.4)",
    teamSize: 1, // confirmed: single-player / Individual
    feeModel: "per-student",
    feePerStudent: 850, // confirmed: ₹850
    flatFee: null,
    botPurchase: {
      price: 1799,
      label: "Official Bot",
    },
    missionNote: "Get comfortable with the remote controller before race day.",
    handbookKey: "Zone2BHandbook",
    submitEndpoint: SUBMIT_ENDPOINT,
  },

  "3a": {
    id: "3a",
    code: "ZONE 3A",
    name: "Clash of Wizards",
    tagline: "Build. Battle. Champion.",
    glyph: "sword",
    grade: "Grades 9–12",
    color: "#8f2f34",
    colorHi: "#e08a80",
    border: "rgba(143,47,52,0.4)",
    teamSize: 2, // confirmed: 2 participants
    feeModel: "flat", // confirmed: flat ₹850 for the whole team, NOT per-student
    feePerStudent: null,
    flatFee: 850,
    missionNote: "Have your Combat Bot ready for technical inspection.",
    handbookKey: "Zone3AHandbook",
    submitEndpoint: SUBMIT_ENDPOINT,
  },

  "3b": {
    id: "3b",
    code: "ZONE 3B",
    name: "The Next Big Idea — Venture X",
    tagline: "Research. Innovate. Inspire.",
    glyph: "bulb",
    grade: "Grades 9–12",
    color: "#1f7a6e",
    colorHi: "#6fd8c6",
    border: "rgba(31,122,110,0.3)",
    teamSize: 1, // confirmed: single participant
    feeModel: "per-student", // confirmed: ₹750 per participant, not a flat team fee
    feePerStudent: 750,
    flatFee: null,
    missionNote: "Prepare your A1 research poster and abstract.",
    handbookKey: "Zone3BHandbook",
    submitEndpoint: SUBMIT_ENDPOINT,
  },
};