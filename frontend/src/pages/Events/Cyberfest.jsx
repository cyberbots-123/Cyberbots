import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import assets from "../../assets/assets";

/* ═══════════════════════════════════════════════════════════════
   CYBERFEST 2K26 — "Enter the Wizarding World of Technology"

   REDESIGN: "Celestial Observatory"
   A modern, glassmorphic take on the royal-blue & bronze theme:
   aurora-lit night sky, floating glass surfaces, bento-style
   info tiles, poster-style zone cards, a sticky-rail FAQ and a
   side-rail zone briefing dialog. All content is unchanged.
═══════════════════════════════════════════════════════════════ */

/* ── DISPLAY FONT ────────────────────────────────────────────
   The "Harry Potter" logotype is Warner Bros.' trademarked artwork
   and can't be bundled. If you own a licensed "wizarding" display
   font, drop it in, uncomment the import + @font-face below and
   'HP Display' will take over every heading automatically.      */
// import hpDisplayFont from "./assets/fonts/hp-display.woff2";

/* ── TOKENS ──────────────────────────────────────────────────── */
const INK = "#050914";
const INK_2 = "#0a1226";
const INK_3 = "#0f1a36";
const INK_4 = "#16244a";
const PARCH = "#e6ecf7";
const ARC = "#3a62d6";
const ARC_HI = "#9db8f5";
const CYAN = "#c98a4b";
const CYAN_HI = "#e6b27a";
const GOLD = "#d6a35c";
const IRON = "#5a6580";
const IRON_HI = "#8b97b3";
const WINE = "#1e3a8a";
const MUTED = "#9aa6c0";
const DIM = "#7f8ba6";

const ADDRESS = "Door No. 71 & 73, Second Floor, CIT Nagar 1st Main Road, CIT Nagar, Nandanam, Chennai";
const SITE = "www.cyberbots.in";
// TODO: point this at your real registration form/page. Every "Register Now"
// button uses this link UNLESS the zone has its own route below.
const REGISTER_URL = "https://www.cyberbots.in/register";

// Per-zone registration routes (shared form: src/pages/ZoneRegistrationForm.jsx,
// configs in src/pages/zoneRegistrationConfigs.js).
const ZONE_REGISTER_ROUTES = {
  "1a": "/register/zone-1a",
  "1b": "/register/zone-1b",
  "2a": "/register/zone-2a",
  "2b": "/register/zone-2b",
  "3a": "/register/zone-3a",
  "3b": "/register/zone-3b",
};

/* ── THE SIX ZONES ───────────────────────────────────────────── */
const ZONES = [
  {
    id: "1a",
    code: "ZONE 1A",
    name: "Chamber of Circuits",
    tagline: "Discover. Build. Collaborate.",
    glyph: "scroll",
    photo: assets.Zone1A,
    handbook: assets.ZONE1A,
    a: "#8a6d1f",
    ab: "#e3c766",
    glow: "rgba(138,109,31,0.3)",
    border: "rgba(138,109,31,0.4)",
    category: 1,
    meta: ["Grades 3–5", "Team of 2", "10 Min Prelims", "8 Min Mains"],
    blurb:
      "The Four Wizarding Houses have sent out a secret call for help. Follow the clues in your Spell Scroll, find the right components, and bring your creation to life.",
  },
  {
    id: "1b",
    code: "ZONE 1B",
    name: "The Triwizard Quest",
    tagline: "Navigate. Observe. Strategize.",
    glyph: "maze",
    photo: assets.Zone1B,
    handbook: assets.ZONE1B,
    a: "#2f7d4f",
    ab: "#7fd6a2",
    glow: "rgba(47,125,79,0.32)",
    border: "rgba(47,125,79,0.42)",
    category: 1,
    meta: ["Grades 3–5", "Individual", "10 Minutes", "Robot Navigation"],
    blurb:
      "Guide a robotic companion through an enchanted maze of interactive challenges, all the way to the legendary Wizard's Cup.",
  },
  {
    id: "2a",
    code: "ZONE 2A",
    name: "The Founder's Vault",
    tagline: "Solve. Collect. Unlock.",
    glyph: "crystal",
    photo: assets.Zone2A,
    handbook: assets.ZONE2A,
    a: "#5b3fa8",
    ab: "#b49bf0",
    glow: "rgba(91,63,168,0.32)",
    border: "rgba(91,63,168,0.42)",
    category: 2,
    meta: ["Grades 6–8", "Team of 2", "10 Min Prelims", "8 Min Mains"],
    blurb:
      "Four House Crystals lie hidden across an enchanted STEM maze of logic, electronics, mechanisms and robotics. Collect them all to restore the vault.",
  },
  {
    id: "2b",
    code: "ZONE 2B",
    name: "Wizard's Rally",
    tagline: "Drive. Balance. Conquer.",
    glyph: "wheel",
    photo: assets.Zone2B,
    handbook: assets.ZONE2B,
    a: "#8c5220",
    ab: "#e0a06a",
    glow: "rgba(140,82,32,0.3)",
    border: "rgba(140,82,32,0.4)",
    category: 2,
    meta: ["Grades 6–8", "Individual", "Bot-to-Bot", "Off-Road Track"],
    blurb:
      "Take the wheel of a wireless off-road bot and face an opponent in a Bot-to-Bot test of speed, precision and control.",
  },
  {
    id: "3a",
    code: "ZONE 3A",
    name: "Clash of Wizards",
    tagline: "Build. Battle. Champion.",
    glyph: "sword",
    photo: assets.Zone3A,
    handbook: assets.ZONE3A,
    a: "#8f2f34",
    ab: "#e08a80",
    glow: "rgba(143,47,52,0.3)",
    border: "rgba(143,47,52,0.4)",
    category: 3,
    meta: ["Grades 9–12", "Team of 2", "Bot-to-Bot", "Combat Bot"],
    blurb:
      "Design and build your own Combat Bot, pass technical inspection, and battle your way through the elimination rounds to the championship.",
  },
  {
    id: "3b",
    code: "ZONE 3B",
    name: "The Next Big Idea — Venture X",
    tagline: "Research. Innovate. Inspire.",
    glyph: "bulb",
    photo: assets.Zone3B,
    handbook: assets.ZONE3B,
    a: "#1f7a6e",
    ab: "#6fd8c6",
    glow: "rgba(31,122,110,0.3)",
    border: "rgba(31,122,110,0.4)",
    category: 3,
    meta: ["Grades 9–12", "Team of 2", "Research Poster", "Prototype Optional", "Council Q&A"],
    blurb:
      "Identify a real-world problem, design a technology-driven solution and present it to the Research Council — like an entrepreneur pitching to investors.",
  },
];

/* ── GRADE CATEGORIES ───────────────────────────────────────── */
const GRADE_CATEGORIES = [
  { id: 1, range: "Grades 3–5", label: "Category 1 · Junior Wizards", color: "#7fd6a2" },
  { id: 2, range: "Grades 6–8", label: "Category 2 · Apprentice Wizards", color: "#8fe3f2" },
  { id: 3, range: "Grades 9–12", label: "Category 3 · Master Wizards", color: "#e79a90" },
];

/* ── INTERACTIVE EXPERIENCE ZONES ───────────────────────────── */
const EXPERIENCE_ZONES = [
  {
    id: "theatre",
    name: "Simulation Theatre",
    glyph: "theatre",
    hex: "#5b3fa8",
    hi: "#b49bf0",
    blurb:
      "An immersive simulation experience featuring realistic visuals, motion effects and surround sound to create an engaging and educational environment.",
  },
  {
    id: "drone",
    name: "Drone Show",
    glyph: "drone",
    hex: "#1f7a6e",
    hi: "#6fd8c6",
    blurb:
      "A live aerial demonstration showcasing precision flying and synchronized drone performances.",
  },
  {
    id: "robot",
    name: "Robot Interaction Zone",
    glyph: "bot",
    hex: "#2f7d4f",
    hi: "#7fd6a2",
    blurb:
      "An interactive exhibition where students can explore intelligent robots through live demonstrations and hands-on experiences.",
  },
];

/* ── FREQUENTLY ASKED QUESTIONS ─────────────────────────────── */
const FAQ_CATEGORIES = [
  {
    id: "about",
    label: "About the Event",
    items: [
      {
        q: "What is CYBERFEST 2K26?",
        a: "CYBERFEST 2K26 is a Regional Level Robotics Premier League presented by Cyberbots — a Harry Potter–themed robotics championship designed to encourage creativity, innovation, critical thinking, teamwork and problem-solving through hands-on challenges.",
      },
      {
        q: "When and where will CYBERFEST 2K26 be held?",
        a: "The event will be held on 05 December 2026 at Maharishi Vidya Mandir Senior Secondary School, Chetpet, Chennai.",
      },
      {
        q: "Who can participate in CYBERFEST 2K26?",
        a: "Students from Grades 3 to 12 can participate, depending on their eligible zone or category.",
      },
      {
        q: "How many zones are there in CYBERFEST 2K26?",
        a: "There are six competition zones, divided into three grade categories — Category 1 (Grades 3–5): Zone 1A & Zone 1B. Category 2 (Grades 6–8): Zone 2A & Zone 2B. Category 3 (Grades 9–12): Zone 3A & Zone 3B.",
      },
    ],
  },
  {
    id: "zones",
    label: "Zone-Wise FAQs",
    items: [
      {
        q: "Zone 1A — What is the Chamber of Circuits?",
        a: "The Chamber of Circuits is an electronics and robotics assembly challenge where participants discover hidden electronic components and build their bot as part of the challenge.",
      },
      {
        q: "Zone 1A — How many students can participate?",
        a: "Zone 1A is designed for 2 participants.",
      },
      {
        q: "Zone 1A — What is the main challenge?",
        a: "Participants take part in a components hunt, an electronics and robotics assembly challenge, and complete the given mission using their bot.",
      },
      {
        q: "Zone 1B — What is The Triwizard Quest?",
        a: "The Triwizard Quest is a robotics challenge where participants navigate a maze using a remote-controlled bot and complete magical challenges along the way.",
      },
      {
        q: "Zone 1B — How many students can participate?",
        a: "Zone 1B is a single-player challenge.",
      },
      {
        q: "Zone 1B — What type of bot is used?",
        a: "Participants use a remote-controlled bot to navigate the maze — it doesn't need to be purchased.",
      },
      {
        q: "Zone 2A — What is The Founder's Vault?",
        a: "The Founder's Vault is a magical STEM challenge involving the four wizarding houses. Participants solve challenges, collect the required crystals and work towards unlocking the vault.",
      },
      {
        q: "Zone 2A — How many students can participate?",
        a: "Zone 2A is a 2-participant team challenge.",
      },
      {
        q: "Zone 2A — What skills are tested?",
        a: "The challenge focuses on problem-solving, STEM concepts, teamwork and the ability to work through interactive challenges.",
      },
      {
        q: "Zone 2B — What is Wizard's Rally?",
        a: "Wizard's Rally is an off-road wireless bot racing challenge where participants race their robot through an action-packed adventure track.",
      },
      {
        q: "Zone 2B — How many students can participate?",
        a: "It is a single-player game, contested as a Bot-to-Bot race.",
      },
      {
        q: "Zone 2B — What determines the winner?",
        a: "Participants need to demonstrate precision driving and control, navigate the extreme off-road track, and aim for the fastest finish.",
      },
      {
        q: "Zone 3A — What is Clash of Wizards?",
        a: "Clash of Wizards is a Combat Bot Championship featuring  Bot-to-Bot battles, where participants design and build their own combat bot and compete against an opponent.",
      },
      {
        q: "Zone 3A — How many students can participate?",
        a: "Zone 3A is designed for 2 participants.",
      },
      {
        q: "Zone 3A — Do participants need to build their own bot?",
        a: "Yes. Participants are expected to design and build their own combat bot according to the event requirements. Every bot undergoes technical inspection before the battle.",
      },
      {
        q: "Zone 3A — What skills are tested?",
        a: "The event focuses on bot design, engineering, strategy, technical preparation and combat-bot performance.",
      },
      {
        q: "Zone 3B — What is The Next Big Idea — Venture X?",
        a: "The Next Big Idea is a Research & Innovation Showcase where students present ideas that aim to address real-world problems.",
      },
      {
        q: "Zone 3B — How many students can participate?",
        a: "Zone 3B is a team challenge designed for 2 participants from Grades 9–12. Both teammates are registered together in a single registration for a flat fee of ₹750 per team.",
      },
      {
        q: "Zone 3B — What can participants present?",
        a: "Participants can present a research poster and technical presentation, with a working prototype demonstration as an optional component.",
      },
      {
        q: "Zone 3B — What does the evaluation involve?",
        a: "The zone includes a research and innovation showcase, pitching your solution, a technical presentation and an interactive Q&A session. Students are expected to identify a real-world problem and present their innovative solution.",
      },
    ],
  },
  {
    id: "registration",
    label: "Registration & Participation",
    items: [
      {
        q: "What is the registration fee?",
        a: "The registration fee is ₹850 per student for Zones 1A, 1B, 2A & 2B. For Zone 3A the fee is ₹750 per student, and for Zone 3B the fee is ₹750 per team (Team of 2).",
      },
      {
        q: "When does registration start?",
        a: "Registration opens on 22 October 2026.",
      },
      {
        q: "What is the last date for registration?",
        a: "Registration closes on 25 November 2026.",
      },
      {
        q: "Can students use their own robots?",
        a: "Yes. Students may use their own eligible bots, or purchase the official kit through Cyberbots where applicable. Official kits offer technical support, eligibility assurance and pre-verified components.",
      },
      {
        q: "Is purchasing the official bot mandatory?",
        a: "No. Purchasing the official kit is optional for the zones where a bot purchase is offered.",
      },
      {
        q: "What are the team formats?",
        a: "Individual: The Triwizard Quest. Team of 2: Chamber of Circuits, The Founder's Vault, Wizard's Rally, Clash of Wizards and The Next Big Idea.",
      },
    ],
  },
  {
    id: "experience",
    label: "Event Experience",
    items: [
      {
        q: "What other experiences will be available at the event?",
        a: "CYBERFEST 2K26 also features interactive experiences such as a 4D Simulation Theatre, a Drone Show and a Robot Interaction Zone.",
      },
      {
        q: "What can students gain from participating?",
        a: "Students gain practical exposure to robotics, electronics, coding and engineering, while developing teamwork, communication, collaboration, innovation and creative problem-solving skills.",
      },
      {
        q: "Is CYBERFEST 2K26 only about robotics?",
        a: "No. The championship combines robotics, electronics, coding, STEM applications, innovation, research, engineering and teamwork across its different zones.",
      },
      {
        q: "Will the detailed event schedule be provided?",
        a: "Yes. The detailed event schedule will be shared one week prior to the competition.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   MOTION HELPERS
═══════════════════════════════════════════════════════════════ */
function useInView(threshold = 0.12, rootMargin = "0px") {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);
  return [ref, inView];
}

function useCountUp(target, inView, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
      else setVal(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return val;
}

/* Scroll-reveal wrapper: fades + lifts its children in once. */
function Reveal({ children, delay = 0, y = 22, style, className }) {
  const [ref, inView] = useInView(0.08, "40px");
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : `translateY(${y}px)`,
        transition: `opacity .8s cubic-bezier(.2,.7,.2,1) ${delay}s, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Section shell: static section wrapper with an aurora backdrop. */
function Section({ id, children, style, className = "", glow }) {
  return (
    <section id={id} className={`cf-section ${className}`} style={style}>
      {glow && <div className="cf-section-glow" style={{ "--g": glow }} aria-hidden="true" />}
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ORIGINAL ARTWORK — all SVG / CSS
═══════════════════════════════════════════════════════════════ */
function Stars({ count = 80 }) {
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
    <div className="cf-fill" aria-hidden="true">
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
            background: "#dbe6ff",
            boxShadow: "0 0 4px 1px rgba(157,184,245,0.45)",
            animation: `cfTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Snowfall({ count = 28 }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 2.6 + 1.2,
        delay: Math.random() * 8,
        dur: Math.random() * 6 + 7,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count]
  );
  return (
    <div className="cf-fill" aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.id}
          style={{
            position: "absolute",
            top: "-4%",
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            borderRadius: "50%",
            background: "rgba(222,230,248,0.8)",
            "--dx": `${f.drift}px`,
            animation: `cfSnow ${f.dur}s linear ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function RuneDrift({ count = 8 }) {
  const RUNES = ["ᚠ", "ᚱ", "ᛗ", "ᛟ", "ᚹ", "ᛉ", "ᛞ", "ᚨ", "ᛏ"];
  const runes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        r: RUNES[i % RUNES.length],
        left: 4 + ((i * 113) % 90),
        top: 8 + ((i * 61) % 78),
        delay: i * 1.7,
        dur: 9 + (i % 4) * 3,
        size: 16 + (i % 3) * 10,
      })),
    [count]
  );
  return (
    <div className="cf-fill" aria-hidden="true">
      {runes.map((r) => (
        <span
          key={r.id}
          style={{
            position: "absolute",
            left: `${r.left}%`,
            top: `${r.top}%`,
            fontSize: r.size,
            color: ARC_HI,
            opacity: 0,
            fontFamily: "serif",
            animation: `cfRune ${r.dur}s ease-in-out ${r.delay}s infinite`,
          }}
        >
          {r.r}
        </span>
      ))}
    </div>
  );
}

/* Zone glyphs — one original mark per zone. */
function Glyph({ type, color, size = 40 }) {
  const c = color || CYAN_HI;
  if (type === "maze")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="5" y="5" width="38" height="38" rx="3" stroke={c} strokeWidth="2.4" />
        <path d="M13,5 v22 h10 v-14 h12 v22 h-22" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="24" r="2.6" fill={c} />
      </svg>
    );
  if (type === "scroll")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M11,9 h26 v30 h-26 z" fill={c} opacity="0.2" />
        <path d="M11,9 h26 v30 h-26 z" stroke={c} strokeWidth="2.2" />
        <path d="M7,9 a4,4 0 0 1 4,4 v22 a4,4 0 0 1 -4,4" stroke={c} strokeWidth="2" fill="none" />
        <path d="M41,9 a4,4 0 0 0 -4,4 v22 a4,4 0 0 0 4,4" stroke={c} strokeWidth="2" fill="none" />
        <path d="M17,18 h14 M17,24 h14 M17,30 h9" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  if (type === "crystal")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M24,4 L38,18 L24,44 L10,18 Z" fill={c} opacity="0.35" />
        <path d="M24,4 L38,18 L24,44 L10,18 Z" stroke={c} strokeWidth="2" />
        <path d="M10,18 h28 M24,4 v40" stroke={c} strokeWidth="1.4" opacity="0.8" />
      </svg>
    );
  if (type === "wheel")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" stroke={c} strokeWidth="2.4" />
        <circle cx="24" cy="24" r="7" stroke={c} strokeWidth="2" />
        <path d="M24,6 v10 M24,32 v10 M6,24 h10 M32,24 h10 M11,11 l7,7 M30,30 l7,7 M37,11 l-7,7 M18,30 l-7,7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  if (type === "sword")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M9,39 L30,18 L36,12 L36,20 L14,42 Z" fill={c} opacity="0.3" />
        <path d="M9,39 L36,12 M36,12 v8 L14,42" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M39,37 L18,16 L12,10 L12,18 L34,40 Z" fill={c} opacity="0.3" />
        <path d="M39,37 L12,10 M12,10 v8 L34,40" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
    );
  if (type === "theatre")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="36" height="24" rx="2.5" stroke={c} strokeWidth="2.2" />
        <path d="M6,16 h36" stroke={c} strokeWidth="1.4" opacity="0.7" />
        <path d="M14,34 l-4,8 M34,34 l4,8" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="23" r="5.5" stroke={c} strokeWidth="1.8" fill="none" />
        <path d="M20,23 h8 M24,19 v8" stroke={c} strokeWidth="1.2" opacity="0.8" />
      </svg>
    );
  if (type === "drone")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M24,18 L10,10 M24,18 L38,10 M24,30 L10,38 M24,30 L38,38" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <rect x="19" y="19" width="10" height="10" rx="2.5" stroke={c} strokeWidth="2.2" />
        <circle cx="10" cy="10" r="5" stroke={c} strokeWidth="1.8" />
        <circle cx="38" cy="10" r="5" stroke={c} strokeWidth="1.8" />
        <circle cx="10" cy="38" r="5" stroke={c} strokeWidth="1.8" />
        <circle cx="38" cy="38" r="5" stroke={c} strokeWidth="1.8" />
      </svg>
    );
  if (type === "bot")
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="12" y="16" width="24" height="20" rx="5" stroke={c} strokeWidth="2.2" />
        <circle cx="19" cy="26" r="2.6" fill={c} />
        <circle cx="29" cy="26" r="2.6" fill={c} />
        <path d="M18,32 h12" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M24,16 v-6" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="8" r="2.4" fill={c} />
        <path d="M6,22 v8 M42,22 v8" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24,6 a13,13 0 0 1 8,23 v5 h-16 v-5 a13,13 0 0 1 8,-23 z" fill={c} opacity="0.28" stroke={c} strokeWidth="2" />
      <path d="M18,38 h12 M20,42 h8" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M24,16 v12" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function WaxSeal({ size = 66 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ animation: "cfSealPulse 3.2s ease-in-out infinite" }}>
      <circle cx="32" cy="32" r="30" fill={WINE} />
      <circle cx="32" cy="32" r="30" fill="none" stroke={ARC_HI} strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="32" r="23" fill="none" stroke={ARC_HI} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.6" />
      <path d="M32,14 L37,26 L50,27 L40,36 L43,49 L32,42 L21,49 L24,36 L14,27 L27,26 Z" fill="#e8dfc0" opacity="0.9" />
      <circle cx="32" cy="32" r="4" fill={WINE} />
    </svg>
  );
}

function CrystalArt({ color, size = 54, delay = 0 }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 40 60" fill="none" style={{ animation: `cfFloat ${5 + delay}s ease-in-out ${delay}s infinite` }}>
      <path d="M20,2 L36,20 L20,58 L4,20 Z" fill={color} opacity="0.42" />
      <path d="M20,2 L36,20 L20,58 L4,20 Z" stroke={color} strokeWidth="1.6" />
      <path d="M4,20 h32 M20,2 v56 M20,20 L36,20 M20,20 L4,20" stroke={color} strokeWidth="0.9" opacity="0.8" />
      <path d="M20,2 L20,20 L4,20 Z" fill={color} opacity="0.65" />
      <ellipse cx="20" cy="58" rx="14" ry="3" fill={color} opacity="0.25" style={{ filter: "blur(3px)" }} />
    </svg>
  );
}

/* ── Register Now ─────────────────────────────────────────────
   Routes to the zone's own registration page when one exists
   (ZONE_REGISTER_ROUTES); otherwise falls back to REGISTER_URL. */
function RegisterButton({ zone, className, children }) {
  const internalPath = ZONE_REGISTER_ROUTES[zone.id];
  if (internalPath) {
    return (
      <Link to={internalPath} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={REGISTER_URL} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

/* Download Handbook — fetches the PDF and hands the browser a Blob URL
   so it always saves to disk (with a clean filename) instead of just
   previewing inline. Falls back to a new tab if fetch/Blob fails. */
async function downloadHandbook(url, filename) {
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Handbook fetch failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

/* ═══════════════════════════════════════════════════════════════
   CONTENT PRIMITIVES (used inside the zone dialog)
═══════════════════════════════════════════════════════════════ */
function Eyebrow({ children, color = CYAN_HI }) {
  return (
    <div className="cf-eyebrow" style={{ color }}>
      <span className="cf-eyebrow-dash" style={{ background: color }} />
      {children}
      <span className="cf-eyebrow-dash" style={{ background: color }} />
    </div>
  );
}

function SectionHead({ eyebrow, title, desc, color }) {
  return (
    <Reveal className="cf-head">
      <Eyebrow color={color}>{eyebrow}</Eyebrow>
      <h2 className="cf-h2">{title}</h2>
      {desc && <p className="cf-head-desc">{desc}</p>}
    </Reveal>
  );
}

function Block({ title, sub, color = CYAN_HI, children }) {
  return (
    <div className="cf-block" style={{ "--c": color }}>
      <div className="cf-block-head">
        <h3>{title}</h3>
        <span className="cf-block-line" />
      </div>
      {sub && <p className="cf-block-sub">{sub}</p>}
      <div className="cf-block-body">{children}</div>
    </div>
  );
}

function Prose({ children, style }) {
  return <p className="cf-prose" style={style}>{children}</p>;
}

function Bullets({ items, color = CYAN_HI, cols = 1, numbered = false }) {
  const Tag = numbered ? "ol" : "ul";
  return (
    <Tag
      className={numbered ? "cf-num-list" : "cf-dot-list"}
      style={cols > 1 ? { "--mk": color, display: "block", columnCount: cols, columnGap: 34 } : { "--mk": color }}
    >
      {items.map((it, i) => (
        <li key={i} style={cols > 1 ? { marginBottom: 11 } : undefined}>
          {typeof it === "string" ? (
            it
          ) : (
            <>
              <strong>{it.t}</strong>
              {it.d ? <> — {it.d}</> : null}
            </>
          )}
        </li>
      ))}
    </Tag>
  );
}

function DataTable({ head, rows, color = CYAN_HI, numeric = [] }) {
  return (
    <div className="cf-tbl-wrap" style={{ "--acc": color }}>
      <table className="cf-tbl">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ textAlign: numeric.includes(i) ? "right" : "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={{ textAlign: numeric.includes(j) ? "right" : "left", fontWeight: j === 0 ? 600 : 400, color: j === 0 ? PARCH : undefined }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Flow({ steps, color = CYAN_HI }) {
  return (
    <div className="cf-flow" style={{ "--c": color }}>
      {steps.map((s, i) => (
        <div key={i} className="cf-flow-step-wrap">
          <div className={`cf-flow-step${s.hi ? " hi" : ""}`} style={{ animationDelay: `${i * 0.07}s` }}>
            <span className="cf-flow-n">{String(i + 1).padStart(2, "0")}</span>
            {s.t || s}
          </div>
          {i < steps.length - 1 && <span className="cf-flow-arrow" aria-hidden="true">→</span>}
        </div>
      ))}
    </div>
  );
}

function Chips({ items, color = CYAN_HI }) {
  return (
    <div className="cf-chips">
      {items.map((c, i) => (
        <span key={i} className="cf-chip" style={{ "--c": color }}>{c}</span>
      ))}
    </div>
  );
}

function Callout({ children, color = GOLD }) {
  return (
    <div className="cf-callout" style={{ "--c": color }}>
      <p>{children}</p>
    </div>
  );
}

function Motto({ children, color = GOLD }) {
  return <p className="cf-motto" style={{ "--c": color }}>{children}</p>;
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT CONTENT — the six CyberFest 2026 zone briefings
═══════════════════════════════════════════════════════════════ */

/* ── ZONE 1A · CHAMBER OF CIRCUITS ──────────────────────────── */
const Z1A = {
  grade: "Grades 3–5",
  mode: "Team of 2",
  missionTime: "10 Minutes — Prelims · 8 Minutes — Mains",
  story: [
    "The Four Wizarding Houses have sent out a secret call for help.",
    "Somewhere within the Chamber of Circuits lies a magical challenge waiting to be solved.",
    "But no wizard can complete this quest alone.",
    "You and your teammate must work together, follow the clues hidden within your Spell Scroll, discover the components required for your mission, and bring your creation to life.",
    "Your House is counting on you.",
  ],
  mission: [
    "Begin your journey inside one of the Four Wizarding Houses.",
    "Your team will receive a Spell Scroll containing clues that will guide you towards the components needed for your assigned challenge.",
    "Your task is to understand the clues, identify the correct components, assemble your project and make it work.",
  ],
  howToPlay: [
    "Work together with your teammate throughout the mission.",
    "Study the clues provided in your Spell Scroll.",
    "Search for and identify the required electronic components.",
    "Assemble your assigned electronics or robotics project.",
    "Test your creation.",
    "Complete the mission successfully before time runs out.",
  ],
  housesIntro:
    "Every team begins its journey in one of the Four Wizarding Houses. Each House unlocks a different electronics or robotics experience, making every team's quest unique.",
  housesClose: ["Your Spell Scroll is your guide.", "Your teamwork is your strength.", "Your creation is your key to completing the quest."],
  question: "Roll the Dice. Unlock the Magic. Build the Bot",
};

/* ── ZONE 1B · THE TRIWIZARD QUEST ──────────────────────────── */
const Z1B = {
  grade: "Grades 3–5",
  mode: "Individual",
  missionTime: "10 Minutes",
  story: [
    "Deep within the Wizarding World lies the mysterious Triwizard Quest.",
    "Its paths are enchanted. Its secrets are hidden. And somewhere beyond the maze waits the legendary Wizard's Cup.",
    "You have been chosen as the wizard who must guide a robotic companion through this mysterious world.",
    "But finding the way forward will not be enough.",
    "You must observe carefully, make smart decisions, respond to the challenges around you, and guide your robot safely through the enchanted path.",
    "Only when you reach the Wizard's Cup will your mission be complete.",
  ],
  mission: [
    "Take control of the bot and begin your journey through the Triwizard Quest.",
    "Follow the correct path, overcome the interactive challenges placed throughout the arena, and make your way towards the final destination.",
    "Every movement matters. Every decision matters. And every second counts.",
  ],
  howToPlay: [
    "Take control of the provided robot using the remote controller.",
    "Navigate through the enchanted maze.",
    "Discover and follow the correct path.",
    "Respond to the interactive challenges along your journey.",
    "Use observation and strategic thinking to make your decisions.",
    "Reach the Wizard's Cup to complete the mission.",
  ],
  finalMoment: [
    "Every participant represents one of the Four Wizarding Houses.",
    "Reach the Wizard's Cup and successfully activate your assigned House.",
    "When your House awakens, the arena transforms into a magical celebration with illuminated House colours and the iconic Harry Potter theme music.",
  ],
  question: "Navigate the Maze. Master the Circuits. Win the Cup",
};

/* ── ZONE 2A · THE FOUNDER'S VAULT ──────────────────────────── */
const HOUSES_2A = [
  { house: "", master: "Logic", hex: "#d64545" },
  { house: "", master: "Mechanisms", hex: "#37a86a" },
  { house: "", master: "Electronics", hex: "#4a8fe0" },
  { house: "", master: "Robotics", hex: "#e0bb45" },
];

const Z2A = {
  grade: "Grades 6–8",
  mode: "Team of 2",
  missionTime: "10 Minutes — Prelims · 15 Minutes — Mains",
  story: [
    "The legendary Founder's Vault has been sealed.",
    "Its ancient protection can only be broken by collecting the four magical House Crystals hidden across an enchanted STEM maze.",
    "The crystals belong to the Four Wizarding Houses — Gryphor, Ravenor, Huffmont, Slyvera.",
    "But the path to each crystal is protected by a different challenge.",
    "You and your teammate must work together, think logically, understand the technology around you and complete every stage of the quest.",
    "Only when all four crystals are collected, the Founder's Vault can be restored.",
  ],
  mission: [
    "Enter the enchanted STEM maze and begin your search for the Four House Crystals.",
    "Along the way, you will encounter challenges involving Logic, Electronics, Mechanisms, Robotics and interactive STEM activities.",
    "Complete each mission successfully to earn a House Crystal. Collect all four. Then unlock the Founder's Vault.",
  ],
  domains: ["Logic", "Electronics", "Mechanisms", "Robotics", "Interactive STEM Activities"],
  crystalsIntro:
    "Your journey will lead you to four powerful crystals — Logic, Electronics, Mechanisms and Robotics. Every crystal represents progress. Every challenge tests a different skill. And every decision can affect your final House Points.",
  housePoints: [
    "Your team begins the challenge with 100 House Points.",
    "How you manage those points throughout your journey matters.",
    "Think before you act. Choose your strategy wisely. Work together.",
  ],
  howToPlay: [
    "Work together through every stage.",
    "Identify electronic components.",
    "Solve interactive STEM challenges.",
    "Complete logic, electronics, mechanism and robotics missions.",
    "Collect each House Crystal.",
    "Manage your House Points strategically.",
    "Unlock the Founder's Vault.",
  ],
  motto: "Spin Your Fate. Solve the Challenge. Claim the Gem",
};

/* ── ZONE 2B · WIZARD'S RALLY ───────────────────────────────── */
const Z2B = {
  grade: "Grades 6–8",
  mode: "Individual",
  format: "Bot-to-Bot Challenge",
  story: [
    "The Wizarding World has discovered a new kind of racing arena.",
    "Forget smooth roads. Forget predictable tracks. This is the Wizard's Rally.",
    "You will take control of a powerful wireless bot and face an opponent in a Bot-to-Bot battle of speed, precision and control.",
    "The track will test your ability to remain calm, maintain balance and make the right driving decisions.",
    "One mistake can cost valuable seconds. One perfect move can win the race.",
  ],
  mission: [
    "Take control of your Off-Road bot and conquer the adventure track.",
    "Your goal is not simply to drive fast.",
    "You must complete every stage correctly while maintaining control, precision and stability.",
  ],
  howToPlay: [
    "Control your wireless bot using the remote controller.",
    "Navigate through the off-road track.",
    "Complete every challenge in sequence.",
    "Maintain balance and precision while driving.",
    "Manage your speed according to the terrain.",
    "Complete the course without manual intervention.",
    "Cross the finish line in the shortest possible time.",
  ],
  testFactors: ["Control", "Stability", "Navigation", "Precision", "Decision-Making", "Speed Management"],
  testClose: ["Your opponent is beside you.", "The clock is running.", "The finish line is waiting."],
  question: "Master the terrain. Unleash the magic.",
};

/* ── ZONE 3A · CLASH OF WIZARDS (COMBAT BOT CHAMPIONSHIP) ───── */
const Z3A = {
  grade: "Grades 9–12",
  mode: "Team of 2",
  format: "Bot-to-Bot Battle",
  story: [
    "Welcome to the Clash of Wizards.",
    "This is where engineering meets competition. Where ideas become machines. And where machines become champions.",
    "You and your teammate must design and build your own Combat Bot, prepare it for battle and take it into a Bot-to-Bot competition against another team.",
    "This is not simply a robotics challenge. It is a test of engineering. A test of strategy. A test of driving. And a test of teamwork.",
  ],
  mission: [
    "Build your own Combat Bot and prepare it for the ultimate robotics showdown.",
    "Before every match, your robot must pass the mandatory technical inspection.",
    "Once approved, your team enters the arena. Battle your opponent. Advance through the elimination rounds. And fight your way towards the championship.",
  ],
  journeyFlow: ["Design", "Build", "Inspection", "Battle", "Elimination", { t: "Championship", hi: true }],
  specs: [
    ["Motors", "4 × 12V DC Metal Gear Motors"],
    ["Speed", "300 RPM"],
    ["Torque", "20 kg-cm"],
    ["Battery", "12V, 5000 mAh Li-ion Battery"],
    ["Chassis", "3 mm Aluminium Sheet"],
    ["Maximum Size", "30 cm × 25 cm"],
    ["Wheels", "4 × 100 mm Rubber Wheels"],
    ["Controller", "ESP32"],
    ["Motor Driver", "BTS7960 or L298N"],
  ],
  advantage: ["High-Torque Motors", "Suspension Systems", "Front Wedges", "Push Bars", "Rubber Bumpers", "LED Indicators"],
  advantageNote: "Innovation must always work within the official safety rules.",
  arenaTests: ["Engineering", "Innovation", "Build Quality", "Robot Performance", "Driving Strategy", "Teamwork"],
  closing: ["Design your machine.", "Trust your teammate.", "Control your robot."],
  motto: "Build Your Bot. Enter the Battle. Survive the Clash.",
};

/* ── ZONE 3B · THE NEXT BIG IDEA — VENTURE X ────────────────── */
const Z3B = {
  grade: "Grades 9–12",
  mode: "Team of 2",
  story: [
    "Beyond the classrooms and laboratories of the Wizarding World lies a secret institution dedicated to solving the problems of tomorrow.",
    "The Ministry of Magic Research Council has summoned young innovators from across the realm.",
    "\u201CYour team has been invited to present an idea that could change the world.\u201D",
    "But this is not just a presentation.",
    "You must identify a real-world problem, develop a technology-driven solution and convince the Research Council that your idea deserves recognition.",
    "Welcome to The Next Big Idea — Venture X.",
  ],
  mission: [
    "Choose a real-world problem.",
    "Think beyond the obvious. Research it.",
    "Design an innovative solution using technology.",
    "Then present your idea to the Research Council.",
  ],
  domains: ["Robotics", "Artificial Intelligence", "IoT", "Automation", "Smart Technologies"],
  howToPlay: [
    "Identify a real-world problem.",
    "Develop an innovative technology-based solution.",
    "Submit your abstract.",
    "Prepare your A1 research poster.",
    "Explain the idea clearly to the judges, like an entrepreneur.",
    "Demonstrate your prototype, if available.",
    "Answer technical questions from the Research Council.",
    "Showcase the innovation behind your solution.",
  ],
  stationIntro:
    "Transform your presentation space into a Wizard Research Station. Your station should communicate your idea, technical knowledge and creativity.",
  posterContents: [
    "Project Title", "Problem Statement", "Objectives", "Proposed Solution", "Technologies Used",
    "Working Principle", "Block Diagram / Flowchart", "Applications", "Future Scope", "Conclusion",
  ],
  finalTest: [
    "Is your idea innovative?",
    "Do you understand the technology?",
    "Can your solution solve a real problem?",
    "Can you explain it confidently?",
    "Can you defend your idea when questioned?",
  ],
  finalNote: "A working prototype is optional — but encouraged. Both team members must actively participate in the presentation and Q&A.",
  closing: ["Where Student Ideas Become Tomorrow’s Innovations."],

  /* Official Zone 3B handbook content */
  handbook: {
    general: [
      ["1", "Team Size: 2 participants from Grades 9–12."],
      ["2", "Present an innovative project based on Robotics, AI, IoT, Automation, or Smart Technologies."],
      ["3", "A1 Research Poster is mandatory for every team."],
      ["4", "Working prototype/model is optional but recommended."],
      ["5", "All team members must actively participate in the presentation."],
      ["6", "Teams should report 30 minutes before their allotted time."],
    ],
    prelims: [
      ["1", "Set up the research poster and prototype at the assigned station."],
      ["2", "Introduce the team and project to the judges."],
      ["3", "Explain the problem statement, objectives, and proposed solution."],
      ["4", "Describe the technologies used and the working principle."],
      ["5", "Demonstrate the prototype, if available."],
      ["6", "Answer the judges' technical questions confidently."],
      ["7", "Top-performing teams qualify for the Finals."],
    ],
    finals: [
      ["1", "Present an improved version of the project."],
      ["2", "Explain the complete working, applications, and future scope."],
      ["3", "Demonstrate the working prototype (if available)."],
      ["4", "Answer advanced technical and application-based questions."],
      ["5", "Final evaluation is based on innovation, feasibility, technical knowledge, and presentation."],
    ],
    gamePlay: [
      ["Step 1", "Report at the registration desk and collect the allotted presentation station."],
      ["Step 2", "Arrange the research poster, prototype, and supporting materials."],
      ["Step 3", "Introduce the team and explain the project concept."],
      ["Step 4", "Present the problem statement, objectives, solution, and technology used."],
      ["Step 5", "Demonstrate the prototype (if available)."],
      ["Step 6", "Answer the judges' questions confidently."],
      ["Step 7", "Judges evaluate the presentation and announce the shortlisted finalists."],
    ],
    rules: [
      ["1", "Teams must report on time and occupy the allotted presentation station."],
      ["2", "An A1 Research Poster is mandatory."],
      ["3", "Every participant should contribute during the presentation."],
      ["4", "Projects must be original and free from plagiarism."],
      ["5", "Mobile phones are not permitted during judging."],
      ["6", "Participants must maintain discipline and respect judges and volunteers."],
      ["7", "Presentations must be completed within the allotted time."],
      ["8", "The decision of the judges will be final."],
    ],
    scoring: [
      ["Innovation & Creativity", "20"],
      ["Technical Knowledge", "20"],
      ["Problem Identification", "10"],
      ["Working Principle", "10"],
      ["Technology Implementation", "10"],
      ["Practical Applications", "10"],
      ["Presentation Skills", "10"],
      ["Prototype Demonstration", "5"],
      ["Question & Answer", "5"],
      ["Total", "100 Marks"],
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   HERO — a full-bleed night castle under a drifting aurora
═══════════════════════════════════════════════════════════════ */
function Hero() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 140);
    return () => clearTimeout(t);
  }, []);
  const on = ready ? " on" : "";

  return (
    <header className="cf-hero">
      <img src={assets.Event2} alt="" aria-hidden="true" className="cf-hero-img" />
      <div className="cf-hero-aurora" aria-hidden="true">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>
      <Stars count={60} />
      <div className="cf-hero-scrim" aria-hidden="true" />
      <div className="cf-hero-grid" aria-hidden="true" />

      <div className="cf-hero-inner">
        <div className={`cf-rise${on}`} style={{ "--d": "0s" }}>
          <h1 className="cf-hero-title">CYBERFEST</h1>
        </div>
        <div className={`cf-hero-year cf-rise${on}`} style={{ "--d": ".15s" }}>
          <span /> 2K26 <span />
        </div>

        <div className={`cf-hero-assoc cf-rise${on}`} style={{ "--d": ".3s" }}>
          <img src={assets.Mvm} alt="Mvm" />
          <div className="cf-hero-assoc-text">
            <div className="cf-hero-assoc-label">In Association with</div>
            <div className="cf-hero-assoc-name">MAHARISHI VIDYA MANDIR SENIOR SECONDARY SCHOOL, CHETPET</div>
          </div>
          <img src={assets.Fest} alt="Fest" />
        </div>

        <div className={`cf-hero-tag cf-rise${on}`} style={{ "--d": ".42s" }}>
          Enter the Wizarding World of Technology
        </div>
        <p className={`cf-hero-lead cf-rise${on}`} style={{ "--d": ".54s" }}>
          Where technology meets imagination, strategy meets adventure, and every participant becomes part of an extraordinary journey — across six zones inspired by the Wizarding World.
        </p>

        <div className={`cf-hero-scroll cf-rise${on}`} style={{ "--d": "1s" }}>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BEFORE YOU BEGIN — floating glass ticket + prize stakes
═══════════════════════════════════════════════════════════════ */
const BRIEF_FACTS = [
  { label: "Date", value: "05 December 2026 (Saturday)" },
  { label: "Venue", value: "Maharishi Vidya Mandir Senior Secondary School, Chetpet" },
  { label: "Registration Opens", value: "22 October 2026" },
  { label: "Registration Closes", value: "25 November 2026" },
];

function BriefFact({ label, value, idx }) {
  return (
    <Reveal delay={idx * 0.08} y={14} className="cf-fact">
      <div className="cf-fact-n">{String(idx + 1).padStart(2, "0")}</div>
      <div className="cf-fact-label">{label}</div>
      <div className="cf-fact-value">{value}</div>
    </Reveal>
  );
}

function StakeCard({ tag, prefix = "", value, suffix = "", line, color, rune, delay = 0 }) {
  const [ref, inView] = useInView(0.3);
  const count = useCountUp(value, inView, 1500);
  return (
    <div
      ref={ref}
      className="cf-stake"
      style={{
        "--c": color,
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(20px)",
        transition: `opacity .8s ease ${delay}s, transform .8s ease ${delay}s`,
      }}
    >
      <span className="cf-stake-rune" aria-hidden="true">{rune}</span>
      <div className="cf-stake-glow" />
      <div className="cf-stake-tag">{tag}</div>
      <div className="cf-stake-num">
        {prefix}
        {count.toLocaleString("en-IN")}
        {suffix}
      </div>
      <div className="cf-stake-line">{line}</div>
    </div>
  );
}

function EventBriefScene() {
  return (
    <Section className="cf-brief" glow={ARC}>
      <div className="cf-wrap cf-wrap-md">
        <Reveal style={{ textAlign: "center" }}>
          <Eyebrow color={GOLD}>✶ Before You Begin ✶</Eyebrow>
        </Reveal>

        <div className="cf-ticket">
          {BRIEF_FACTS.map((f, i) => (
            <BriefFact key={f.label} label={f.label} value={f.value} idx={i} />
          ))}
        </div>

        <div className="cf-stake-row">
          <StakeCard tag="One Stage" prefix="₹" value={100000} line="At Stake" color={GOLD} rune="ᛟ" delay={0.08} />
          <StakeCard tag="One Event" value={50} suffix="+" line="Winning Stories" color={CYAN_HI} rune="ᚱ" delay={0.2} />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THE ZONE MAP
═══════════════════════════════════════════════════════════════ */
function ZoneCard({ z, idx, cat, onOpen }) {
  const [ref, inView] = useInView();
  return (
    <article
      ref={ref}
      className="cf-zone"
      style={{
        "--hc": z.a,
        "--ac": z.ab,
        "--glow": z.glow,
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(30px)",
        transition: `opacity .8s ease ${idx * 0.1}s, transform .8s cubic-bezier(.2,.7,.2,1) ${idx * 0.1}s, box-shadow .35s, border-color .35s`,
      }}
    >
      <div className="cf-zone-bg" aria-hidden="true">
        {z.photo && <img src={z.photo} alt="" />}
        <div className="cf-zone-scrim" />
      </div>

      <div className="cf-zone-top">
        {cat && (
          <div className="cf-grade" style={{ "--gc": cat.color }}>
            {cat.range}
          </div>
        )}
        <div className="cf-zone-dot" />
      </div>

      <div className="cf-zone-body">
        <div className="cf-zone-glyph">
          <Glyph type={z.glyph} color={z.ab} size={30} />
        </div>
        <div className="cf-zone-code">{z.code}</div>
        <h3 className="cf-zone-name">{z.name}</h3>
        <div className="cf-zone-tag">{z.tagline}</div>
        <p className="cf-zone-blurb">{z.blurb}</p>
        <div className="cf-zone-meta">
          {z.meta.slice(1).map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        <div className="cf-zone-actions">
          <button type="button" className="cf-btn cf-btn-solid" onClick={() => onOpen(z)}>
            More details <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="cf-btn cf-btn-ghost"
            onClick={(e) => {
              e.stopPropagation();
              downloadHandbook(z.handbook, `CyberFest-${z.code.replace(/\s+/g, "")}-Handbook.pdf`);
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.5v9M8 10.5 4.5 7M8 10.5 11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12.5v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download Handbook
          </button>
        </div>
      </div>
    </article>
  );
}

function GradeTier({ cat, zones, onOpen }) {
  return (
    <Reveal className="cf-tier" style={{ "--gc": cat.color }}>
      <div className="cf-tier-head">
        <span className="cf-tier-num">{String(cat.id).padStart(2, "0")}</span>
        <div className="cf-tier-text">
          <div className="cf-tier-label">{cat.label}</div>
          <div className="cf-tier-range">{cat.range}</div>
        </div>
        <span className="cf-tier-line" />
      </div>
      <div className="cf-tier-grid">
        {zones.map((z, i) => (
          <ZoneCard key={z.id} z={z} idx={i} cat={cat} onOpen={onOpen} />
        ))}
      </div>
    </Reveal>
  );
}

function ZoneIndexScene({ onOpen }) {
  return (
    <Section id="zones" className="cf-zones" glow="#5b3fa8">
      <RuneDrift count={7} />
      <div className="cf-wrap">
        <SectionHead
          eyebrow="✶ The Zone Map"
          title="Six Zones, One Journey"
          desc="Three grade tiers, six unique missions, one world of innovation. Open More details for the complete zone briefing — the story, your mission, and how to play."
        />
        <div className="cf-tier-stack">
          {GRADE_CATEGORIES.map((cat) => (
            <GradeTier key={cat.id} cat={cat} zones={ZONES.filter((z) => z.category === cat.id)} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THE INVITATION — break the wax seal to reveal the letter
═══════════════════════════════════════════════════════════════ */
function InviteScene() {
  const [sceneRef, sceneIn] = useInView(0.25);
  const [opened, setOpened] = useState(false);
  const openLetter = useCallback(() => setOpened(true), []);

  return (
    <Section className="cf-invite" glow={GOLD}>
      <Snowfall count={22} />
      <div className="cf-wrap cf-wrap-md">
        <SectionHead
          eyebrow="✶ The Invitation"
          title="Choose Your Mission"
          desc="Across six unique zones, you will face missions inspired by the Wizarding World — from enchanted mazes and mysterious house quests to robotics battles and futuristic research."
        />

        <div ref={sceneRef} className="cf-env-stage" style={{ opacity: sceneIn ? 1 : 0, transition: "opacity .7s ease" }}>
          {/* sealed envelope — collapses away once opened */}
          <div className={`cf-env-cover${opened ? " collapsed" : ""}`}>
            <div className="cf-env-cover-inner">
              {!opened && (
                <div className="cf-env-hint" aria-hidden="true">
                  ✦ Tap to Open ✦
                </div>
              )}

              <div
                className={`cf-env${opened ? " is-open" : ""}`}
                role="button"
                tabIndex={opened ? -1 : 0}
                aria-label={opened ? "Your invitation has been opened" : "Break the seal to open your invitation"}
                aria-pressed={opened}
                onClick={openLetter}
                onKeyDown={(e) => {
                  if (!opened && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    openLetter();
                  }
                }}
              >
                <div className="cf-env-halo" aria-hidden="true" />
                <div className="cf-env-card">
                  <span className="cf-env-shine" aria-hidden="true" />
                  <div className="cf-env-flap" aria-hidden="true" />
                  <div className="cf-env-stamp" aria-hidden="true">✶</div>
                  <div className="cf-env-address">
                    <div className="cf-env-kicker">✦ Delivered by Owl Post ✦</div>
                    <div className="cf-env-to">To Every Aspiring</div>
                    <div className="cf-env-name">Wizard of Technology</div>
                    <div className="cf-env-loc">— Standing Before This Very Screen —</div>
                  </div>
                  <div className="cf-env-seal" aria-hidden="true">
                    <WaxSeal size={64} />
                  </div>
                </div>
              </div>

              {!opened && (
                <button type="button" className="cf-btn cf-btn-gold cf-env-cta" onClick={openLetter}>
                  Break the Seal ✶
                </button>
              )}
            </div>
          </div>

          {/* the letter */}
          <div className={`cf-letter-wrap${opened ? " show" : ""}`}>
            <div className="cf-letter-collapse">
              <div className={`cf-letter${opened ? " show" : ""}`}>
                <div className="cf-letter-inner">
                  <p className="cf-letter-title">YOU HAVE BEEN INVITED TO CYBERFEST 2K26</p>
                  <p className="cf-letter-tagline">A realm where magic meets technology…</p>
                  <div className="cf-letter-rule" />
                  <div className="cf-letter-verses">
                    <p>Your quest awaits.</p>
                    <p>Decode the mysteries.</p>
                    <p>Build the impossible.</p>
                    <p>Create the magic.</p>
                  </div>
                  <div className="cf-letter-rule" />
                  <p className="cf-letter-close">THE MAGIC IS CALLING. WILL YOU ANSWER?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ZONE DOCUMENTS, SPLIT INTO PAGES
═══════════════════════════════════════════════════════════════ */
function zone1APages(z) {
  return [
    {
      t: "The Story",
      el: (
        <Block title="The Story" color={z.ab} sub={`${Z1A.grade} · ${Z1A.mode} · ${Z1A.missionTime}`}>
          {Z1A.story.map((p, i) => <Prose key={i}>{p}</Prose>)}
        </Block>
      ),
    },
    {
      t: "How to Play",
      el: (
        <Block title="How to Play" color={z.ab}>
          <Bullets items={Z1A.howToPlay} color={z.ab} numbered />
        </Block>
      ),
    },
    {
      t: "The Four Houses",
      el: (
        <Block title="The Four Houses" color={z.ab}>
          <Prose style={{ fontSize: 18 }}>{Z1A.housesIntro}</Prose>
          <Callout color={z.ab}>{Z1A.housesClose.join("  ·  ")}</Callout>
          <Motto color={GOLD}>{Z1A.question}</Motto>
        </Block>
      ),
    },
  ];
}

function zone1BPages(z) {
  return [
    {
      t: "The Story",
      el: (
        <Block title="The Story" color={z.ab} sub={`${Z1B.grade} · ${Z1B.mode} · ${Z1B.missionTime}`}>
          {Z1B.story.map((p, i) => <Prose key={i}>{p}</Prose>)}
        </Block>
      ),
    },
    {
      t: "How to Play",
      el: (
        <Block title="How to Play" color={z.ab}>
          <Bullets items={Z1B.howToPlay} color={z.ab} numbered />
        </Block>
      ),
    },
    {
      t: "The Final Moment — The Wizard's Cup",
      el: (
        <Block title="The Final Moment — The Wizard's Cup" color={z.ab}>
          <Bullets items={Z1B.finalMoment} color={z.ab} />
          <Motto color={GOLD}>{Z1B.question}</Motto>
        </Block>
      ),
    },
  ];
}

function zone2APages(z) {
  return [
    {
      t: "The Story",
      el: (
        <Block title="The Story" color={z.ab} sub={`${Z2A.grade} · ${Z2A.mode} · ${Z2A.missionTime}`}>
          {Z2A.story.map((p, i) => <Prose key={i}>{p}</Prose>)}
        </Block>
      ),
    },
    {
      t: "The House Crystals",
      el: (
        <Block title="The House Crystals" color={z.ab} sub={Z2A.crystalsIntro}>
          <div className="cf-crystal-row">
            {HOUSES_2A.map((c, i) => (
              <div key={c.master} className="cf-crystal" style={{ "--c": c.hex, animationDelay: `${i * 0.09}s` }}>
                <CrystalArt color={c.hex} delay={i * 0.4} />
                <div className="cf-crystal-name">{c.house}</div>
                <div className="cf-crystal-meta">Champion of {c.master}</div>
              </div>
            ))}
          </div>
        </Block>
      ),
    },
    {
      t: "House Points",
      el: (
        <Block title="House Points" color={z.ab}>
          {Z2A.housePoints.map((p, i) => <Prose key={i}>{p}</Prose>)}
        </Block>
      ),
    },
    {
      t: "How to Play",
      el: (
        <Block title="How to Play" color={z.ab}>
          <Bullets items={Z2A.howToPlay} color={z.ab} numbered />
          <Motto color={z.ab}>{Z2A.motto}</Motto>
        </Block>
      ),
    },
  ];
}

function zone2BPages(z) {
  return [
    {
      t: "The Story",
      el: (
        <Block title="The Story" color={z.ab} sub={`${Z2B.grade} · ${Z2B.mode} · ${Z2B.format}`}>
          {Z2B.story.map((p, i) => <Prose key={i}>{p}</Prose>)}
        </Block>
      ),
    },
    {
      t: "How to Play",
      el: (
        <Block title="How to Play" color={z.ab}>
          <Bullets items={Z2B.howToPlay} color={z.ab} numbered />
        </Block>
      ),
    },
    {
      t: "The Ultimate Test",
      el: (
        <Block title="The Ultimate Test" color={z.ab} sub="The track is designed to challenge:">
          <Chips items={Z2B.testFactors} color={z.ab} />
          <Callout color={z.ab}>{Z2B.testClose.join("  ·  ")}</Callout>
          <Motto color={GOLD}>{Z2B.question}</Motto>
        </Block>
      ),
    },
  ];
}

function zone3APages(z) {
  return [
    {
      t: "The Story",
      el: (
        <Block title="The Story" color={z.ab} sub={`${Z3A.grade} · ${Z3A.mode} · ${Z3A.format}`}>
          {Z3A.story.map((p, i) => <Prose key={i}>{p}</Prose>)}
        </Block>
      ),
    },
    {
      t: "The Championship Journey",
      el: (
        <Block title="The Championship Journey" color={z.ab} sub="Every match will challenge the strength, performance and strategy of your robot.">
          <Flow steps={Z3A.journeyFlow} color={z.ab} />
        </Block>
      ),
    },
    {
      t: "Build Your Champion",
      el: (
        <Block title="Build Your Champion" color={z.ab} sub="Core specifications">
          <DataTable head={["Specification", "Requirement"]} rows={Z3A.specs} color={z.ab} />
        </Block>
      ),
    },
    {
      t: "Engineering Advantage",
      el: (
        <Block title="Engineering Advantage" color={z.ab} sub="Participants are encouraged to explore features such as:">
          <Chips items={Z3A.advantage} color={z.ab} />
          <Callout color={z.ab}>{Z3A.advantageNote}</Callout>
        </Block>
      ),
    },
    {
      t: "The Arena Awaits",
      el: (
        <Block title="The Arena Awaits" color={z.ab} sub="Every battle tests:">
          <Chips items={Z3A.arenaTests} color={z.ab} />
          <Callout color={z.ab}>{Z3A.closing.join("  ·  ")}</Callout>
          <Motto color={z.ab}>{Z3A.motto}</Motto>
        </Block>
      ),
    },
  ];
}

function zone3BPages(z) {
  return [
    {
      t: "The Story",
      el: (
        <Block title="The Story" color={z.ab} sub={`${Z3B.grade} · ${Z3B.mode}`}>
          {Z3B.story.map((p, i) => <Prose key={i}>{p}</Prose>)}
        </Block>
      ),
    },
    {
      t: "How to Play",
      el: (
        <Block title="How to Play" color={z.ab}>
          <Bullets items={Z3B.howToPlay} color={z.ab} numbered />
        </Block>
      ),
    },
    {
      t: "Your Research Station",
      el: (
        <Block title="Your Research Station" color={z.ab} sub={Z3B.stationIntro}>
          <div className="cf-mini-label" style={{ color: z.ab }}>Your A1 Research Poster Must Include</div>
          <Bullets items={Z3B.posterContents} color={z.ab} numbered cols={2} />
        </Block>
      ),
    },
    {
      t: "The Final Test",
      el: (
        <Block title="The Final Test" color={z.ab} sub="The Research Council will look beyond appearance. They want to understand:">
          <Bullets items={Z3B.finalTest} color={z.ab} />
          <Callout color={z.ab}>{Z3B.finalNote}</Callout>
          <Motto color={z.ab}>{Z3B.closing.join(" · ")}</Motto>
        </Block>
      ),
    },
    {
      t: "General Instructions",
      el: (
        <Block title="General Instructions" color={z.ab}>
          <DataTable head={["S. No.", "Instruction"]} rows={Z3B.handbook.general} color={z.ab} />
        </Block>
      ),
    },
    {
      t: "Prelims",
      el: (
        <Block title="Prelims" color={z.ab}>
          <DataTable head={["S. No.", "Instruction"]} rows={Z3B.handbook.prelims} color={z.ab} />
        </Block>
      ),
    },
    {
      t: "Finals",
      el: (
        <Block title="Finals" color={z.ab}>
          <DataTable head={["S. No.", "Instruction"]} rows={Z3B.handbook.finals} color={z.ab} />
        </Block>
      ),
    },
    {
      t: "Game Play",
      el: (
        <Block title="Game Play" color={z.ab}>
          <DataTable head={["Step", "Activity"]} rows={Z3B.handbook.gamePlay} color={z.ab} />
        </Block>
      ),
    },
    {
      t: "Rules & Regulations",
      el: (
        <Block title="Rules & Regulations" color={z.ab}>
          <DataTable head={["S. No.", "Rule"]} rows={Z3B.handbook.rules} color={z.ab} />
        </Block>
      ),
    },
    {
      t: "Scoring System",
      el: (
        <Block title="Scoring System" color={z.ab}>
          <DataTable head={["Evaluation Criteria", "Marks"]} rows={Z3B.handbook.scoring} color={z.ab} numeric={[1]} />
        </Block>
      ),
    },
  ];
}

const ZONE_PAGES = {
  "1a": zone1APages,
  "1b": zone1BPages,
  "2a": zone2APages,
  "2b": zone2BPages,
  "3a": zone3APages,
  "3b": zone3BPages,
};

/* ═══════════════════════════════════════════════════════════════
   THE ZONE DIALOG
   A dark glass sheet with a side rail of chapters, a scrollable
   reading pane, and a progress bar along the bottom.
═══════════════════════════════════════════════════════════════ */
function ZoneBook({ zone, onClose }) {
  const pages = useMemo(() => ZONE_PAGES[zone.id](zone), [zone]);
  const total = pages.length + 1; // +1 for the title page
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const leafRef = useRef(null);

  const goTo = useCallback(
    (next) => {
      const target = Math.max(0, Math.min(total - 1, next));
      if (target === page) return;
      setDir(target > page ? 1 : -1);
      setPage(target);
    },
    [total, page]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(page + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(page - 1); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [goTo, page]);

  useEffect(() => {
    if (leafRef.current) leafRef.current.scrollTop = 0;
  }, [page]);

  const labelFor = (i) => (i === 0 ? "Title Page" : pages[i - 1].t);

  const cover = (
    <div className="cf-cover">
      <div className="cf-cover-kicker">CyberFest 2K26 · Enter the Wizarding World of Technology</div>
      <div className="cf-cover-glyph"><Glyph type={zone.glyph} color={zone.ab} size={46} /></div>
      <div className="cf-cover-code">{zone.code}</div>
      <h2 className="cf-cover-title">{zone.name}</h2>
      <div className="cf-cover-meta">
        {zone.meta.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <p className="cf-cover-blurb">{zone.blurb}</p>
      <div className="cf-cover-cta">
        <RegisterButton zone={zone} className="cf-btn cf-btn-gold cf-btn-lg">
          Register Now
        </RegisterButton>
      </div>
      <div className="cf-contents">
        <div className="cf-contents-label">Contents</div>
        <ol>
          {pages.map((pg, i) => (
            <li key={i}>
              <button type="button" onClick={() => goTo(i + 1)}>
                <span className="cf-c-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="cf-c-title">{pg.t}</span>
                <span className="cf-c-dots" />
                <span className="cf-c-go" aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );

  const leafFor = (i) => (i === 0 ? cover : pages[i - 1].el);

  return (
    <>
      <div className="cf-dlg-head">
        <div className="cf-dlg-id">
          <span className="cf-dlg-glyph"><Glyph type={zone.glyph} color={zone.ab} size={22} /></span>
          <span className="cf-dlg-code">{zone.code}</span>
          <span className="cf-dlg-sep" />
          <span className="cf-dlg-page">{labelFor(page)}</span>
        </div>
        <RegisterButton zone={zone} className="cf-btn cf-btn-gold cf-btn-sm">
          Register Now
        </RegisterButton>
      </div>

      <div className="cf-dlg-main">
        <aside className="cf-rail" aria-label="Chapters">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`cf-rail-item${i === page ? " on" : ""}`}
              onClick={() => goTo(i)}
              aria-current={i === page ? "page" : undefined}
            >
              <span className="cf-rail-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="cf-rail-t">{labelFor(i)}</span>
            </button>
          ))}
        </aside>

        <div ref={leafRef} className="cf-leaf" key={page} data-dir={dir}>
          {leafFor(page)}
        </div>
      </div>

      <nav className="cf-dlg-nav">
        <button type="button" className="cf-btn cf-btn-ghost cf-btn-sm" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Previous page">
          ← <span>Previous</span>
        </button>

        <div className="cf-progress" aria-hidden="true">
          <i style={{ width: `${(page / (total - 1)) * 100}%` }} />
        </div>

        <div className="cf-folio">{page + 1} / {total}</div>

        <button type="button" className="cf-btn cf-btn-ghost cf-btn-sm" onClick={() => goTo(page + 1)} disabled={page === total - 1} aria-label="Next page">
          <span>Next</span> →
        </button>
      </nav>
    </>
  );
}

function ParchmentModal({ zone, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!zone) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zone, onClose]);

  if (!zone) return null;

  return (
    <div className="cf-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${zone.code} — ${zone.name}`}>
      <div className="cf-dlg" style={{ "--acc": zone.ab, "--acc-deep": zone.a, "--acc-glow": zone.glow }} onClick={(e) => e.stopPropagation()}>
        <div className="cf-dlg-aura" aria-hidden="true" />
        <button ref={closeRef} type="button" className="cf-dlg-close" onClick={onClose} aria-label="Close the document">✕</button>
        <div className="cf-dlg-body">
          <ZoneBook key={zone.id} zone={zone} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE EXPERIENCE ZONES
═══════════════════════════════════════════════════════════════ */
function ExperienceCard({ z, idx, photo }) {
  return (
    <Reveal delay={idx * 0.1} className="cf-exp" style={{ "--c": z.hi, "--hx": z.hex }}>
      <div className="cf-exp-photo">
        {photo && <img src={photo} alt="" />}
        <div className="cf-exp-photo-scrim" />
        <div className="cf-exp-glyph">
          <Glyph type={z.glyph} color={z.hi} size={26} />
        </div>
      </div>
      <h3 className="cf-exp-name">{z.name}</h3>
      <p className="cf-exp-blurb">{z.blurb}</p>
    </Reveal>
  );
}

function ExperienceZonesScene() {
  const photos = [assets.Theatre, assets.Edrone, assets.Roboshow];
  return (
    <Section id="experiences" className="cf-exps" glow={ARC}>
      <div className="cf-wrap">
        <SectionHead
          eyebrow="✶ Beyond the Zones"
          title="Interactive Experience Zones"
          desc="Between missions, step outside the competition arenas and into a trio of immersive experiences built for every visitor to CyberFest 2K26."
        />
        <div className="cf-exp-grid">
          {EXPERIENCE_ZONES.map((z, i) => (
            <ExperienceCard key={z.id} z={z} idx={i} photo={photos[i]} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FREQUENTLY ASKED QUESTIONS — sticky tab rail + accordion
═══════════════════════════════════════════════════════════════ */
function FAQAccordionItem({ item, index, isOpen, onToggle }) {
  return (
    <div className={`cf-faq-item${isOpen ? " open" : ""}`}>
      <button type="button" className="cf-faq-q" onClick={onToggle} aria-expanded={isOpen}>
        <span className="cf-faq-idx">{String(index + 1).padStart(2, "0")}</span>
        <span className="cf-faq-qt">{item.q}</span>
        <span className="cf-faq-plus" aria-hidden="true" />
      </button>
      <div className="cf-faq-a-wrap">
        <div className="cf-faq-a-clip">
          <p className="cf-faq-a">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

function FAQScene() {
  const [active, setActive] = useState("about");
  const [openIdx, setOpenIdx] = useState(0);
  const cat = FAQ_CATEGORIES.find((c) => c.id === active) || FAQ_CATEGORIES[0];

  return (
    <Section id="faq" className="cf-faq" glow="#1f7a6e">
      <RuneDrift count={6} />
      <div className="cf-wrap cf-wrap-lg">
        <SectionHead
          eyebrow="✶ Ancient Scrolls of Knowledge"
          title="Frequently Asked Questions"
          desc="Everything a wizard-in-training needs to know before entering the arena."
        />
        <div className="cf-faq-layout">
          <div className="cf-faq-tabs" role="tablist" aria-label="FAQ categories">
            {FAQ_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={active === c.id}
                className={`cf-faq-tab${active === c.id ? " on" : ""}`}
                onClick={() => { setActive(c.id); setOpenIdx(0); }}
              >
                <span>{c.label}</span>
                <em>{c.items.length}</em>
              </button>
            ))}
          </div>
          <div className="cf-faq-list">
            {cat.items.map((item, i) => (
              <FAQAccordionItem
                key={`${active}-${i}`}
                item={item}
                index={i}
                isOpen={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CLOSING — THE MASTER OF INNOVATION AWAITS
═══════════════════════════════════════════════════════════════ */
function ClosingScene() {
  return (
    <section className="cf-closing">
      <img src={assets.Event1} alt="" aria-hidden="true" className="cf-closing-img" />
      <div className="cf-closing-scrim" aria-hidden="true" />
      <Stars count={44} />
      <Reveal className="cf-closing-card">
        <SectionHead
          eyebrow="✶ The Master of Innovation Awaits"
          title="Are You Ready to Enter the Wizarding World?"
          desc="CyberFest is more than a competition. It is a journey through robotics, electronics, engineering, creativity, problem-solving, teamwork and innovation. Every zone tells a different story. Every mission demands a different skill. Every participant has a chance to become the Master of Innovation."
        />
        <p className="cf-closing-line">
          Choose your zone. Prepare your strategy. Master your technology. Complete your mission.
        </p>
        <div className="cf-closing-seal"><WaxSeal size={58} /></div>
        <div className="cf-closing-brand">CYBERFEST 2K26</div>
        <div className="cf-closing-sub">THE MOST RESPONSIBLE ROBOTICS LEAGUE</div>
      </Reveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AMBIENT SCORE
   Plays the theme on load and loops it. Browsers block unmuted
   autoplay until the visitor interacts, so it retries on the first
   tap / click / keypress. A toggle (bottom-right) mutes at any time.
═══════════════════════════════════════════════════════════════ */
function AmbientScore({ src }) {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    audio.volume = 0.4;

    const attemptPlay = () => {
      audio.play().catch(() => {
        /* Autoplay blocked — wait for the visitor's first interaction. */
      });
    };
    attemptPlay();

    const onFirstInteraction = () => {
      attemptPlay();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
    window.addEventListener("pointerdown", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, [src]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !audio.muted;
    audio.muted = next;
    setMuted(next);
    if (!next) audio.play().catch(() => {});
  }, []);

  if (!src) return null;

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        className="cf-score"
        onClick={toggleMute}
        aria-label={muted ? "Unmute background music" : "Mute background music"}
        aria-pressed={muted}
        title={muted ? "Unmute music" : "Mute music"}
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
            <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor" />
            <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Tangerine:wght@700&family=MedievalSharp&display=swap');

*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
::selection{background:rgba(58,98,214,0.5);}
a{color:inherit;}
:focus-visible{outline:2px solid ${CYAN_HI};outline-offset:3px;border-radius:6px;}

/* Self-hosted wizarding-style font slot (see import at top of file).
@font-face{
  font-family:'HP Display';
  src:url('./assets/fonts/hp-display.woff2') format('woff2');
  font-display:swap;
}
*/

.cf-root{
  --f-display:'HP Display','Cinzel','MedievalSharp',serif;
  --f-body:'Plus Jakarta Sans',system-ui,sans-serif;
  --f-serif:'Cormorant Garamond',serif;
  --glass:rgba(255,255,255,0.045);
  --glass-hi:rgba(255,255,255,0.08);
  --stroke:rgba(157,184,245,0.16);
  --stroke-hi:rgba(157,184,245,0.34);
  font-family:var(--f-body);
  background:${INK};color:${PARCH};overflow-x:hidden;position:relative;
  -webkit-font-smoothing:antialiased;
}
.cf-fill{position:absolute;inset:0;pointer-events:none;overflow:hidden;}

@keyframes cfTwinkle{0%,100%{opacity:.2;transform:scale(1);}50%{opacity:1;transform:scale(1.5);}}
@keyframes cfFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
@keyframes cfRune{0%,100%{opacity:0;transform:translateY(0);}50%{opacity:.3;transform:translateY(-16px);}}
@keyframes cfSnow{0%{transform:translate(0,0);opacity:0;}10%{opacity:.9;}100%{transform:translate(var(--dx,20px),115vh);opacity:.3;}}
@keyframes cfSealPulse{0%,100%{filter:drop-shadow(0 0 0 rgba(58,98,214,0));}50%{filter:drop-shadow(0 0 14px rgba(90,130,240,.65));}}
@keyframes cfPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.35);opacity:.65;}}
@keyframes cfAurora{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(4%,-5%,0) scale(1.15);}}
@keyframes cfKen{from{transform:scale(1.04);}to{transform:scale(1.14);}}
@keyframes cfShine{0%{left:-60%;opacity:0;}10%{opacity:.9;}40%{left:130%;opacity:0;}100%{left:130%;opacity:0;}}
@keyframes cfHalo{0%,100%{opacity:.5;transform:scale(.94);}50%{opacity:1;transform:scale(1.08);}}
@keyframes cfHint{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
@keyframes cfWheel{0%{transform:translateY(0);opacity:1;}100%{transform:translateY(14px);opacity:0;}}
@keyframes cfIn{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
@keyframes cfSlideF{from{opacity:0;transform:translateX(28px);}to{opacity:1;transform:none;}}
@keyframes cfSlideB{from{opacity:0;transform:translateX(-28px);}to{opacity:1;transform:none;}}
@keyframes cfFade{from{opacity:0;}to{opacity:1;}}
@keyframes cfPop{from{opacity:0;transform:translateY(24px) scale(.97);}to{opacity:1;transform:none;}}
@keyframes cfShimmer{to{background-position:200% center;}}

/* ── Layout ───────────────────────────────────────── */
.cf-section{position:relative;overflow:hidden;padding:120px 24px;background:${INK};}
.cf-section-glow{position:absolute;top:-18%;left:50%;width:min(1100px,120%);height:60%;transform:translateX(-50%);border-radius:50%;
  background:radial-gradient(closest-side,var(--g),transparent);opacity:.16;filter:blur(40px);pointer-events:none;}
.cf-wrap{position:relative;z-index:4;max-width:1180px;margin:0 auto;}
.cf-wrap-lg{max-width:1040px;}
.cf-wrap-md{max-width:960px;}

.cf-eyebrow{display:inline-flex;align-items:center;gap:14px;font-family:var(--f-display);font-size:12.5px;font-weight:700;letter-spacing:5px;text-transform:uppercase;margin-bottom:16px;}
.cf-eyebrow-dash{display:inline-block;width:26px;height:1px;opacity:.6;}
.cf-head{text-align:center;margin-bottom:64px;position:relative;z-index:5;}
.cf-h2{font-family:var(--f-display);font-weight:800;font-size:clamp(30px,5vw,56px);line-height:1.1;letter-spacing:.5px;
  background:linear-gradient(100deg,#fff 0%,${ARC_HI} 38%,${CYAN_HI} 72%,#fff 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:cfShimmer 9s linear infinite;}
.cf-head-desc{font-family:var(--f-serif);font-size:19px;color:${MUTED};max-width:660px;line-height:1.75;margin:18px auto 0;}

/* ── Buttons ──────────────────────────────────────── */
.cf-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--f-body);font-weight:700;font-size:12.5px;letter-spacing:.6px;border-radius:100px;padding:12px 22px;cursor:pointer;text-decoration:none;border:1px solid transparent;white-space:nowrap;transition:transform .25s ease,box-shadow .25s ease,background .25s ease,color .25s ease,opacity .25s ease,filter .25s ease;}
.cf-btn:disabled{opacity:.3;cursor:default;pointer-events:none;}
.cf-btn:active{transform:translateY(0) !important;}
.cf-btn-solid{color:${INK};background:var(--ac,${CYAN_HI});}
.cf-btn-solid:hover{transform:translateY(-2px);box-shadow:0 12px 28px -10px var(--ac,${CYAN_HI});filter:brightness(1.08);}
.cf-btn-ghost{color:var(--ac,${PARCH});background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.18);backdrop-filter:blur(6px);}
.cf-btn-ghost:hover{background:rgba(255,255,255,0.12);border-color:var(--ac,${CYAN_HI});transform:translateY(-2px);}
.cf-btn-gold{color:#1a1204;background:linear-gradient(110deg,#f3d49c 0%,${GOLD} 45%,#b87a33 100%);box-shadow:0 10px 28px -12px rgba(214,163,92,.7), inset 0 1px 0 rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:2px;}
.cf-btn-gold:hover{transform:translateY(-2px);filter:brightness(1.08);box-shadow:0 16px 34px -12px rgba(214,163,92,.85), inset 0 1px 0 rgba(255,255,255,.5);}
.cf-btn-lg{padding:16px 42px;font-size:13.5px;}
.cf-btn-sm{padding:9px 18px;font-size:11px;}

/* ═════ HERO ═════ */
.cf-hero{position:relative;height:100vh;min-height:620px;overflow:hidden;background:linear-gradient(180deg,#030611,${INK});}
.cf-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;animation:cfKen 24s ease-in-out infinite alternate;}
.cf-hero-aurora span{position:absolute;border-radius:50%;filter:blur(70px);mix-blend-mode:screen;animation:cfAurora 14s ease-in-out infinite;pointer-events:none;}
.cf-hero-aurora .a1{width:56vw;height:42vh;left:-10%;top:-8%;background:radial-gradient(closest-side,rgba(58,98,214,.55),transparent);}
.cf-hero-aurora .a2{width:46vw;height:38vh;right:-8%;top:6%;background:radial-gradient(closest-side,rgba(214,163,92,.35),transparent);animation-delay:-5s;}
.cf-hero-aurora .a3{width:60vw;height:34vh;left:20%;bottom:-6%;background:radial-gradient(closest-side,rgba(90,60,200,.35),transparent);animation-delay:-9s;}
.cf-hero-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.62) 0%,rgba(5,9,20,.2) 32%,rgba(5,9,20,.45) 62%,rgba(3,6,17,.92) 90%,${INK} 100%);}
.cf-hero-grid{position:absolute;inset:0;opacity:.07;pointer-events:none;
  background-image:linear-gradient(rgba(157,184,245,1) 1px,transparent 1px),linear-gradient(90deg,rgba(157,184,245,1) 1px,transparent 1px);background-size:64px 64px;
  -webkit-mask-image:radial-gradient(ellipse at 50% 40%,#000 10%,transparent 70%);mask-image:radial-gradient(ellipse at 50% 40%,#000 10%,transparent 70%);}
.cf-hero-inner{position:relative;z-index:3;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:clamp(72px,11vh,130px) 24px 70px;}
.cf-rise{opacity:0;transform:translateY(22px);transition:opacity 1s ease var(--d,0s),transform 1s cubic-bezier(.2,.7,.2,1) var(--d,0s);}
.cf-rise.on{opacity:1;transform:none;}
.cf-hero-title{font-family:var(--f-display);font-weight:900;font-size:clamp(46px,10.5vw,128px);line-height:.95;letter-spacing:clamp(2px,.8vw,10px);
  background:linear-gradient(180deg,#fff 12%,${ARC_HI} 55%,${CYAN_HI} 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 8px 40px rgba(0,0,0,.6)) drop-shadow(0 0 40px rgba(58,98,214,.35));}
.cf-hero-year{display:flex;align-items:center;justify-content:center;gap:18px;font-family:var(--f-display);font-weight:700;font-size:clamp(14px,2.4vw,22px);letter-spacing:9px;color:${CYAN_HI};margin-top:14px;}
.cf-hero-year span{width:clamp(30px,8vw,90px);height:1px;background:linear-gradient(90deg,transparent,${CYAN_HI});}
.cf-hero-year span:last-child{background:linear-gradient(270deg,transparent,${CYAN_HI});}
.cf-hero-assoc{display:flex;align-items:center;justify-content:center;gap:clamp(16px,3.6vw,38px);flex-wrap:wrap;margin-top:30px;padding:14px clamp(18px,3vw,34px);border-radius:24px;
  background:rgba(8,14,32,.5);border:1px solid var(--stroke);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 20px 50px -24px rgba(0,0,0,.8);}
.cf-hero-assoc img{height:clamp(52px,8.4vw,92px);width:auto;filter:drop-shadow(0 4px 14px rgba(0,0,0,.55));}
.cf-hero-assoc-label{font-family:var(--f-display);font-size:clamp(11px,1.6vw,14px);font-weight:600;letter-spacing:4px;color:${MUTED};text-transform:uppercase;}
.cf-hero-assoc-name{font-family:var(--f-display);font-size:clamp(14px,2vw,22px);font-weight:800;letter-spacing:1.4px;color:${GOLD};margin-top:7px;max-width:540px;line-height:1.35;}
.cf-hero-tag{font-family:var(--f-display);font-weight:600;font-size:clamp(14px,3vw,30px);color:#fff;margin-top:26px;letter-spacing:1.5px;text-shadow:0 4px 24px rgba(0,0,0,.7);}
.cf-hero-lead{font-family:var(--f-serif);font-style:italic;font-size:clamp(16px,2vw,21px);color:#b3bed6;max-width:600px;line-height:1.8;margin-top:14px;text-shadow:0 2px 12px rgba(0,0,0,.8);}
.cf-hero-scroll{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;font-family:var(--f-display);font-size:11px;letter-spacing:4px;color:${MUTED};}
.cf-hero-scroll.cf-rise{transform:translate(-50%,22px);}
.cf-hero-scroll.cf-rise.on{transform:translate(-50%,0);}
.cf-mouse{width:22px;height:36px;border-radius:14px;border:1.5px solid rgba(154,166,192,.7);display:flex;justify-content:center;padding-top:6px;}
.cf-mouse i{width:3px;height:7px;border-radius:3px;background:${CYAN_HI};animation:cfWheel 1.8s ease-in-out infinite;}
@media (max-width:700px){
  .cf-hero{height:auto;min-height:100vh;}
  .cf-hero-inner{justify-content:flex-start;padding:104px 20px 110px;}
  .cf-hero-year{letter-spacing:6px;}
}

/* ═════ BRIEF ═════ */
.cf-brief{padding:0 24px 110px;margin-top:-60px;z-index:6;background:linear-gradient(180deg,transparent 0,${INK} 90px);padding-top:70px;}
.cf-ticket{display:grid;grid-template-columns:repeat(4,1fr);margin:24px 0 36px;border-radius:22px;overflow:hidden;position:relative;
  background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1px solid rgba(214,163,92,.3);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 30px 70px -34px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.02) inset;}
.cf-ticket::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,${GOLD},${ARC_HI},transparent);}
.cf-fact{position:relative;padding:28px 22px 26px;text-align:left;}
.cf-fact + .cf-fact::before{content:"";position:absolute;left:0;top:18px;bottom:18px;border-left:1px dashed rgba(214,163,92,.3);}
.cf-fact-n{font-family:var(--f-display);font-weight:800;font-size:30px;color:rgba(214,163,92,.28);line-height:1;margin-bottom:12px;}
.cf-fact-label{font-family:var(--f-display);font-size:11.5px;font-weight:700;letter-spacing:3px;color:${CYAN_HI};text-transform:uppercase;margin-bottom:8px;}
.cf-fact-value{font-family:var(--f-body);font-size:15.5px;font-weight:500;line-height:1.55;color:${PARCH};}
@media (max-width:820px){.cf-ticket{grid-template-columns:repeat(2,1fr);}.cf-fact:nth-child(3)::before{display:none;}.cf-fact:nth-child(n+3){border-top:1px dashed rgba(214,163,92,.3);}}
@media (max-width:480px){.cf-ticket{grid-template-columns:1fr;}.cf-fact::before{display:none !important;}.cf-fact + .cf-fact{border-top:1px dashed rgba(214,163,92,.3);}}

.cf-stake-row{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;}
@media (max-width:700px){.cf-stake-row{grid-template-columns:1fr;}}
.cf-stake{position:relative;overflow:hidden;text-align:center;padding:40px 26px 34px;border-radius:24px;
  background:linear-gradient(165deg,${INK_4},${INK_3} 70%);border:1px solid color-mix(in srgb,var(--c) 38%,transparent);box-shadow:0 30px 60px -34px rgba(0,0,0,.9);}
@supports not (color:color-mix(in srgb,red,blue)){.cf-stake{border-color:rgba(214,163,92,.32);}}
.cf-stake-rune{position:absolute;top:-10px;right:10px;font-family:serif;font-size:110px;line-height:1;color:var(--c);opacity:.07;}
.cf-stake-glow{position:absolute;top:-50%;left:50%;transform:translateX(-50%);width:80%;height:80%;border-radius:50%;background:radial-gradient(circle,var(--c),transparent 70%);opacity:.22;filter:blur(30px);}
.cf-stake-tag{position:relative;font-family:var(--f-display);font-size:11.5px;font-weight:700;letter-spacing:4px;color:${MUTED};text-transform:uppercase;}
.cf-stake-num{position:relative;font-family:var(--f-display);font-weight:900;font-size:clamp(38px,6vw,64px);margin-top:10px;letter-spacing:.5px;
  background:linear-gradient(180deg,#fff,var(--c));-webkit-background-clip:text;background-clip:text;color:transparent;}
.cf-stake-line{position:relative;font-family:var(--f-display);font-size:12.5px;font-weight:700;letter-spacing:3px;color:var(--c);text-transform:uppercase;margin-top:10px;}

/* ═════ ZONES ═════ */
.cf-zones{background:linear-gradient(180deg,${INK} 0,${INK_2} 50%,${INK} 100%);}
.cf-tier-stack{display:flex;flex-direction:column;gap:76px;}
.cf-tier-head{display:flex;align-items:center;gap:20px;margin-bottom:28px;}
.cf-tier-num{font-family:var(--f-display);font-weight:900;font-size:clamp(46px,7vw,72px);line-height:.9;color:transparent;-webkit-text-stroke:1.5px var(--gc);opacity:.85;}
.cf-tier-text{display:flex;flex-direction:column;gap:4px;}
.cf-tier-label{font-family:var(--f-display);font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--gc);}
.cf-tier-range{font-family:var(--f-display);font-weight:700;font-size:clamp(22px,3vw,30px);color:${PARCH};}
.cf-tier-line{flex:1;height:1px;background:linear-gradient(90deg,var(--gc),transparent);opacity:.5;}
.cf-tier-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;}
@media (max-width:820px){.cf-tier-grid{grid-template-columns:1fr;}}

.cf-zone{position:relative;border-radius:26px;overflow:hidden;min-height:580px;isolation:isolate;display:flex;flex-direction:column;
  border:1px solid color-mix(in srgb,var(--ac) 28%,transparent);background:${INK_3};box-shadow:0 30px 60px -36px rgba(0,0,0,.9);}
@supports not (color:color-mix(in srgb,red,blue)){.cf-zone{border-color:rgba(157,184,245,.22);}}
.cf-zone:hover{border-color:var(--ac);box-shadow:0 30px 70px -22px var(--hc), 0 0 0 1px var(--ac);transform:translateY(-6px) !important;}
.cf-zone-bg{position:absolute;inset:0;z-index:0;}
.cf-zone-bg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.7,.2,1);}
.cf-zone:hover .cf-zone-bg img{transform:scale(1.07);}
.cf-zone-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,20,.25) 0%,rgba(5,9,20,.2) 22%,rgba(7,12,28,.82) 52%,${INK_2} 100%);}
.cf-zone-top{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:20px 22px 0;}
.cf-grade{font-family:var(--f-display);font-size:10.5px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:var(--gc);border:1px solid color-mix(in srgb,var(--gc) 55%,transparent);background:rgba(5,9,20,.55);backdrop-filter:blur(8px);border-radius:100px;padding:6px 14px;}
@supports not (color:color-mix(in srgb,red,blue)){.cf-grade{border-color:rgba(230,178,122,.4);}}
.cf-zone-dot{width:11px;height:11px;border-radius:50%;background:radial-gradient(circle at 40% 32%,#fff 0%,var(--ac) 45%,var(--hc) 92%);box-shadow:0 0 14px 4px var(--glow);animation:cfPulse 1.8s ease-in-out infinite;}
.cf-zone-body{position:relative;z-index:2;margin-top:auto;padding:150px 26px 26px;display:flex;flex-direction:column;}
.cf-zone-glyph{width:54px;height:54px;border-radius:16px;border:1px solid color-mix(in srgb,var(--ac) 45%,transparent);background:rgba(5,9,20,.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;margin-bottom:16px;}
.cf-zone-code{font-family:var(--f-display);font-size:12px;font-weight:700;letter-spacing:4px;color:var(--ac);margin-bottom:6px;}
.cf-zone-name{font-family:var(--f-display);font-weight:800;font-size:clamp(23px,2.6vw,30px);line-height:1.15;color:#fff;margin-bottom:8px;}
.cf-zone-tag{font-family:var(--f-serif);font-style:italic;font-size:17px;color:var(--ac);margin-bottom:12px;}
.cf-zone-blurb{font-family:var(--f-body);font-size:14.5px;line-height:1.7;color:#b3bed6;margin-bottom:16px;}
.cf-zone-meta{display:flex;flex-wrap:wrap;gap:7px;}
.cf-zone-meta span{font-family:var(--f-body);font-size:11px;font-weight:600;letter-spacing:.4px;color:#cdd7ee;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:100px;padding:5px 12px;}
.cf-zone-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;}
.cf-zone-actions .cf-btn{--ac:inherit;}
.cf-zone .cf-btn-solid{background:var(--ac);}
.cf-zone .cf-btn-ghost{color:var(--ac);}

/* ═════ INVITATION ═════ */
.cf-invite{background:linear-gradient(180deg,${INK} 0,${INK_3} 100%);}
.cf-env-stage{display:flex;flex-direction:column;align-items:center;width:100%;}
.cf-env-cover{display:grid;grid-template-rows:1fr;width:100%;transition:grid-template-rows .6s ease .9s;}
.cf-env-cover.collapsed{grid-template-rows:0fr;}
.cf-env-cover-inner{overflow:hidden;min-height:0;display:flex;flex-direction:column;align-items:center;padding:10px 0 20px;}
.cf-env-hint{font-family:var(--f-display);font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${GOLD};margin-bottom:22px;animation:cfHint 2s ease-in-out infinite;}
.cf-env{position:relative;width:min(520px,92vw);cursor:pointer;animation:cfFloat 6s ease-in-out infinite;transition:transform .4s ease,opacity .6s ease .35s;}
.cf-env:not(.is-open):hover{transform:translateY(-6px) rotate(-1deg) scale(1.02);}
.cf-env.is-open{opacity:0;transform:translateY(-16px) scale(.96);pointer-events:none;}
.cf-env-halo{position:absolute;inset:-12% -10%;border-radius:40px;background:radial-gradient(ellipse at center,rgba(214,163,92,.35),rgba(58,98,214,.3) 50%,transparent 75%);filter:blur(26px);animation:cfHalo 3.6s ease-in-out infinite;}
.cf-env-card{position:relative;height:300px;border-radius:20px;overflow:hidden;
  background:linear-gradient(155deg,#18285a 0%,#0e1a3d 55%,#0a1226 100%);border:1px solid rgba(214,163,92,.5);
  box-shadow:0 34px 70px -26px rgba(0,0,0,.85), inset 0 0 0 6px rgba(255,255,255,.015), inset 0 0 60px rgba(58,98,214,.18);}
.cf-env-card::before{content:"";position:absolute;inset:12px;border-radius:12px;border:1px dashed rgba(214,163,92,.35);pointer-events:none;}
.cf-env-flap{position:absolute;top:0;left:0;right:0;height:56%;clip-path:polygon(0 0,100% 0,50% 100%);background:linear-gradient(170deg,#243b7d 0%,#162a5e 70%,#10204a 100%);opacity:.9;filter:drop-shadow(0 8px 10px rgba(0,0,0,.4));}
.cf-env-shine{position:absolute;top:-40%;left:-60%;width:36%;height:180%;transform:rotate(18deg);pointer-events:none;z-index:3;background:linear-gradient(115deg,transparent,rgba(255,255,255,.4) 45%,rgba(255,255,255,.1) 55%,transparent);animation:cfShine 4.8s ease-in-out infinite;}
.cf-env-stamp{position:absolute;top:18px;right:20px;z-index:2;width:42px;height:52px;border-radius:4px;border:1px dashed rgba(214,163,92,.6);display:flex;align-items:center;justify-content:center;font-family:var(--f-display);font-size:16px;color:${GOLD};background:rgba(255,255,255,.04);}
.cf-env-seal{position:absolute;top:calc(56% - 34px);left:50%;transform:translateX(-50%);z-index:4;filter:drop-shadow(0 8px 16px rgba(0,0,0,.55));}
.cf-env-seal::before{content:"";position:absolute;inset:-16px;border-radius:50%;background:radial-gradient(circle,rgba(214,163,92,.4),rgba(58,98,214,.3) 55%,transparent 75%);filter:blur(8px);z-index:-1;animation:cfHalo 3.2s ease-in-out infinite;}
.cf-env-address{position:absolute;left:0;right:0;bottom:22px;text-align:center;padding:0 28px;z-index:2;}
.cf-env-kicker{font-family:var(--f-display);font-size:10px;letter-spacing:3px;color:${CYAN_HI};opacity:.85;margin-bottom:6px;}
.cf-env-to{font-family:'Tangerine',cursive;font-weight:700;font-size:clamp(24px,4vw,30px);line-height:1;color:#cdd8f2;}
.cf-env-name{font-family:'Tangerine',cursive;font-weight:700;font-size:clamp(30px,5vw,40px);line-height:1.1;color:#fff;}
.cf-env-loc{font-family:var(--f-serif);font-style:italic;font-size:13px;color:${MUTED};margin-top:3px;}
.cf-env-cta{margin:30px auto 0;}

.cf-letter-wrap{display:grid;grid-template-rows:0fr;width:100%;transition:grid-template-rows 1s cubic-bezier(.22,.68,.24,1) .45s;}
.cf-letter-wrap.show{grid-template-rows:1fr;}
.cf-letter-collapse{overflow:hidden;min-height:0;}
.cf-letter{max-width:660px;margin:0 auto;position:relative;opacity:0;transform:translateY(30px) scale(.94);transition:opacity .9s ease .7s,transform .9s cubic-bezier(.22,.68,.24,1) .7s;}
.cf-letter.show{opacity:1;transform:none;}
.cf-letter::before{content:"";position:absolute;inset:-1px;border-radius:26px;padding:1px;background:linear-gradient(135deg,${GOLD},rgba(58,98,214,.6),${CYAN_HI});-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;}
.cf-letter-inner{position:relative;border-radius:26px;text-align:center;padding:50px clamp(24px,6vw,64px) 44px;
  background:radial-gradient(ellipse at 50% 0%,rgba(58,98,214,.28),transparent 60%),linear-gradient(170deg,${INK_4},${INK_2});box-shadow:0 40px 80px -30px rgba(0,0,0,.9);}
.cf-letter-title{font-family:var(--f-display);font-weight:800;font-size:clamp(21px,3.6vw,32px);color:#fff;letter-spacing:1px;line-height:1.3;}
.cf-letter-tagline{font-family:var(--f-serif);font-style:italic;font-size:clamp(16px,2.1vw,20px);color:${CYAN_HI};margin-top:12px;}
.cf-letter-rule{width:140px;height:1px;margin:24px auto;background:linear-gradient(90deg,transparent,${GOLD},transparent);}
.cf-letter-verses p{font-family:'Tangerine',cursive;font-size:clamp(28px,4.4vw,40px);line-height:1.4;color:${PARCH};}
.cf-letter-close{font-family:var(--f-display);font-weight:800;font-size:clamp(17px,2.8vw,25px);letter-spacing:1.5px;background:linear-gradient(100deg,${ARC_HI},${CYAN_HI});-webkit-background-clip:text;background-clip:text;color:transparent;}

/* ═════ EXPERIENCES ═════ */
.cf-exps{background:linear-gradient(180deg,${INK},${INK_3} 55%,${INK_2});}
.cf-exp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
@media (max-width:900px){.cf-exp-grid{grid-template-columns:1fr;}}
.cf-exp{border-radius:24px;overflow:hidden;background:linear-gradient(170deg,${INK_4},${INK_3});border:1px solid color-mix(in srgb,var(--hx) 45%,transparent);transition:transform .4s ease,box-shadow .4s ease,border-color .4s ease !important;}
@supports not (color:color-mix(in srgb,red,blue)){.cf-exp{border-color:rgba(157,184,245,.22);}}
.cf-exp:hover{transform:translateY(-8px) !important;border-color:var(--c);box-shadow:0 30px 60px -26px var(--c);}
.cf-exp-photo{position:relative;height:210px;overflow:hidden;}
.cf-exp-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s ease;}
.cf-exp:hover .cf-exp-photo img{transform:scale(1.08);}
.cf-exp-photo-scrim{position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,${INK_3} 100%);}
.cf-exp-glyph{position:absolute;left:22px;bottom:-1px;width:54px;height:54px;border-radius:16px 16px 0 0;background:${INK_3};display:flex;align-items:center;justify-content:center;border:1px solid rgba(157,184,245,.14);border-bottom:none;}
.cf-exp-name{font-family:var(--f-display);font-weight:800;font-size:22px;color:#fff;margin:18px 24px 10px;}
.cf-exp-blurb{font-family:var(--f-body);font-size:14.5px;line-height:1.75;color:${MUTED};padding:0 24px 30px;}

/* ═════ FAQ ═════ */
.cf-faq{background:linear-gradient(180deg,${INK_2},${INK});}
.cf-faq-layout{display:grid;grid-template-columns:260px 1fr;gap:40px;align-items:start;}
@media (max-width:860px){.cf-faq-layout{grid-template-columns:1fr;gap:24px;}}
.cf-faq-tabs{position:sticky;top:96px;display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:20px;background:var(--glass);border:1px solid var(--stroke);backdrop-filter:blur(10px);}
@media (max-width:860px){.cf-faq-tabs{position:static;flex-direction:row;overflow-x:auto;padding:8px;border-radius:100px;scrollbar-width:none;}.cf-faq-tabs::-webkit-scrollbar{display:none;}}
.cf-faq-tab{display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;font-family:var(--f-body);font-size:13.5px;font-weight:600;color:${MUTED};background:transparent;border:1px solid transparent;border-radius:14px;padding:13px 16px;cursor:pointer;transition:all .25s ease;}
.cf-faq-tab em{font-style:normal;font-size:11px;font-weight:700;border-radius:100px;padding:2px 9px;background:rgba(255,255,255,.07);}
.cf-faq-tab:hover{color:${PARCH};background:rgba(255,255,255,.05);}
.cf-faq-tab.on{color:${INK};background:linear-gradient(110deg,#f3d49c,${GOLD});box-shadow:0 10px 24px -12px rgba(214,163,92,.7);}
.cf-faq-tab.on em{background:rgba(0,0,0,.15);}
@media (max-width:860px){.cf-faq-tab{white-space:nowrap;border-radius:100px;}}
.cf-faq-list{display:flex;flex-direction:column;gap:12px;}
.cf-faq-item{border-radius:18px;background:var(--glass);border:1px solid var(--stroke);overflow:hidden;transition:border-color .3s ease,background .3s ease;}
.cf-faq-item:hover{border-color:var(--stroke-hi);}
.cf-faq-item.open{border-color:rgba(214,163,92,.5);background:linear-gradient(160deg,rgba(214,163,92,.07),rgba(58,98,214,.06));}
.cf-faq-q{width:100%;display:flex;align-items:center;gap:16px;text-align:left;background:none;border:none;cursor:pointer;padding:20px 22px;color:${PARCH};}
.cf-faq-idx{font-family:var(--f-display);font-weight:800;font-size:13px;color:${GOLD};opacity:.7;flex:none;}
.cf-faq-qt{flex:1;font-family:var(--f-body);font-weight:600;font-size:15.5px;line-height:1.5;}
.cf-faq-plus{position:relative;flex:none;width:28px;height:28px;border-radius:50%;border:1px solid var(--stroke-hi);transition:transform .35s ease,background .3s ease;}
.cf-faq-plus::before,.cf-faq-plus::after{content:"";position:absolute;left:50%;top:50%;width:11px;height:1.6px;background:${ARC_HI};transform:translate(-50%,-50%);transition:transform .35s ease,opacity .3s;}
.cf-faq-plus::after{transform:translate(-50%,-50%) rotate(90deg);}
.cf-faq-item.open .cf-faq-plus{background:${GOLD};border-color:${GOLD};transform:rotate(180deg);}
.cf-faq-item.open .cf-faq-plus::before,.cf-faq-item.open .cf-faq-plus::after{background:${INK};}
.cf-faq-item.open .cf-faq-plus::after{transform:translate(-50%,-50%) rotate(0deg);opacity:0;}
.cf-faq-a-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s ease;}
.cf-faq-item.open .cf-faq-a-wrap{grid-template-rows:1fr;}
.cf-faq-a-clip{overflow:hidden;min-height:0;}
.cf-faq-a{font-family:var(--f-body);font-size:14.5px;line-height:1.8;color:#b3bed6;padding:0 22px 22px 56px;}
@media (max-width:560px){.cf-faq-a{padding-left:22px;}.cf-faq-idx{display:none;}}

/* ═════ CLOSING ═════ */
.cf-closing{position:relative;overflow:hidden;padding:140px 24px;display:flex;justify-content:center;}
.cf-closing-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%;}
.cf-closing-scrim{position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 50% 0%,rgba(58,98,214,.25),transparent 60%),linear-gradient(180deg,${INK} 0%,rgba(10,18,38,.72) 22%,rgba(3,6,16,.9) 70%,#030610 100%);}
.cf-closing-card{position:relative;z-index:4;max-width:820px;text-align:center;padding:60px clamp(22px,5vw,60px) 54px;border-radius:32px;
  background:rgba(8,14,32,.55);border:1px solid var(--stroke);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 40px 90px -40px rgba(0,0,0,.9);}
.cf-closing-card .cf-head{margin-bottom:34px;}
.cf-closing-line{font-family:var(--f-serif);font-style:italic;font-size:20px;color:#b3bed6;line-height:1.8;}
.cf-closing-seal{display:flex;justify-content:center;margin:28px 0 18px;}
.cf-closing-brand{font-family:var(--f-display);font-weight:900;font-size:clamp(24px,4.2vw,40px);letter-spacing:4px;background:linear-gradient(100deg,${GOLD},#f3d49c,${GOLD});-webkit-background-clip:text;background-clip:text;color:transparent;}
.cf-closing-sub{font-family:var(--f-display);font-size:13px;letter-spacing:6px;color:${CYAN_HI};margin-top:8px;}

/* ═════ AMBIENT SCORE ═════ */
.cf-score{position:fixed;right:20px;bottom:20px;z-index:950;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${PARCH};
  background:rgba(10,18,38,.7);border:1px solid rgba(157,184,245,.4);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);cursor:pointer;box-shadow:0 12px 30px -12px rgba(0,0,0,.8);transition:transform .2s ease,border-color .2s ease,background .2s ease;}
.cf-score:hover{transform:translateY(-2px) scale(1.05);border-color:${CYAN_HI};background:rgba(15,26,54,.9);}
@media (max-width:700px){.cf-score{right:14px;bottom:14px;width:42px;height:42px;}}

/* ═════ ZONE DIALOG ═════ */
.cf-backdrop{position:fixed;inset:0;z-index:900;display:flex;align-items:center;justify-content:center;padding:clamp(10px,3vw,36px);background:rgba(2,5,14,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:cfFade .3s ease;}
.cf-dlg{position:relative;width:min(1060px,100%);height:min(800px,92vh);border-radius:28px;overflow:hidden;display:flex;animation:cfPop .5s cubic-bezier(.2,.8,.3,1);
  background:linear-gradient(165deg,#0e1836 0%,#080f24 60%,#060b1a 100%);border:1px solid color-mix(in srgb,var(--acc) 40%,transparent);box-shadow:0 50px 120px -30px rgba(0,0,0,.95), 0 0 80px -30px var(--acc-glow);}
@supports not (color:color-mix(in srgb,red,blue)){.cf-dlg{border-color:rgba(157,184,245,.3);}}
.cf-dlg-aura{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 90% 0%,var(--acc-glow),transparent 70%),radial-gradient(ellipse 50% 40% at 0% 100%,rgba(58,98,214,.18),transparent 70%);opacity:.9;}
.cf-dlg-close{position:absolute;top:14px;right:14px;z-index:6;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:14px;color:${PARCH};background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);transition:transform .25s ease,background .25s ease;}
.cf-dlg-close:hover{transform:rotate(90deg);background:rgba(255,255,255,.18);}
.cf-dlg-body{position:relative;z-index:2;display:flex;flex-direction:column;width:100%;height:100%;}
.cf-dlg-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 70px 16px 28px;border-bottom:1px solid rgba(157,184,245,.12);}
.cf-dlg-id{display:flex;align-items:center;gap:12px;min-width:0;}
.cf-dlg-glyph{display:flex;flex:none;}
.cf-dlg-code{font-family:var(--f-display);font-size:12px;font-weight:800;letter-spacing:3.5px;color:var(--acc);flex:none;}
.cf-dlg-sep{width:1px;height:16px;background:rgba(157,184,245,.3);flex:none;}
.cf-dlg-page{font-family:var(--f-body);font-size:13.5px;font-weight:500;color:${MUTED};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cf-dlg-main{flex:1;min-height:0;display:flex;}
.cf-rail{flex:none;width:230px;padding:22px 14px;border-right:1px solid rgba(157,184,245,.1);display:flex;flex-direction:column;gap:4px;overflow-y:auto;}
.cf-rail-item{display:flex;align-items:center;gap:12px;text-align:left;padding:11px 12px;border-radius:12px;background:transparent;border:1px solid transparent;cursor:pointer;color:${MUTED};transition:all .2s ease;}
.cf-rail-item:hover{background:rgba(255,255,255,.05);color:${PARCH};}
.cf-rail-item.on{background:rgba(255,255,255,.07);border-color:color-mix(in srgb,var(--acc) 45%,transparent);color:#fff;}
@supports not (color:color-mix(in srgb,red,blue)){.cf-rail-item.on{border-color:rgba(157,184,245,.35);}}
.cf-rail-n{font-family:var(--f-display);font-size:11.5px;font-weight:800;color:var(--acc);opacity:.7;flex:none;}
.cf-rail-item.on .cf-rail-n{opacity:1;}
.cf-rail-t{font-family:var(--f-body);font-size:13px;font-weight:600;line-height:1.35;}
@media (max-width:820px){.cf-rail{display:none;}}
.cf-leaf{flex:1;min-width:0;overflow-y:auto;overscroll-behavior:contain;padding:clamp(22px,3vw,40px) clamp(20px,4vw,52px) 28px;animation:cfSlideF .5s cubic-bezier(.2,.7,.2,1) both;scrollbar-color:rgba(157,184,245,.3) transparent;}
.cf-leaf[data-dir="-1"]{animation-name:cfSlideB;}
.cf-leaf::-webkit-scrollbar{width:8px;}
.cf-leaf::-webkit-scrollbar-thumb{background:rgba(157,184,245,.25);border-radius:100px;}
.cf-dlg-nav{display:flex;align-items:center;gap:18px;padding:14px 28px;border-top:1px solid rgba(157,184,245,.12);background:rgba(3,6,16,.4);}
.cf-progress{flex:1;height:4px;border-radius:100px;background:rgba(255,255,255,.08);overflow:hidden;}
.cf-progress i{display:block;height:100%;border-radius:100px;background:linear-gradient(90deg,var(--acc-deep),var(--acc));box-shadow:0 0 12px var(--acc);transition:width .5s cubic-bezier(.2,.7,.2,1);}
.cf-folio{font-family:var(--f-display);font-size:12px;font-weight:700;letter-spacing:2px;color:${MUTED};white-space:nowrap;}
.cf-dlg-nav .cf-btn-ghost{--ac:${PARCH};}
@media (max-width:700px){
  .cf-dlg{height:94vh;border-radius:22px;}
  .cf-dlg-head{padding:14px 58px 12px 16px;}
  .cf-dlg-page,.cf-dlg-sep{display:none;}
  .cf-dlg-nav{padding:12px 14px;gap:12px;}
  .cf-dlg-nav .cf-btn span{display:none;}
  .cf-btn-sm{padding:9px 14px;}
}

/* cover page */
.cf-cover{text-align:center;padding-top:clamp(0px,2vh,20px);}
.cf-cover-kicker{font-family:var(--f-display);font-size:10.5px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;}
.cf-cover-glyph{width:84px;height:84px;margin:22px auto 14px;border-radius:26px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);border:1px solid color-mix(in srgb,var(--acc) 50%,transparent);box-shadow:0 0 50px -10px var(--acc-glow);}
@supports not (color:color-mix(in srgb,red,blue)){.cf-cover-glyph{border-color:rgba(157,184,245,.35);}}
.cf-cover-code{font-family:var(--f-display);font-size:12.5px;font-weight:800;letter-spacing:6px;color:var(--acc);}
.cf-cover-title{font-family:var(--f-display);font-weight:900;font-size:clamp(28px,5.2vw,52px);line-height:1.1;margin-top:8px;background:linear-gradient(180deg,#fff,var(--acc));-webkit-background-clip:text;background-clip:text;color:transparent;}
.cf-cover-meta{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:18px;}
.cf-cover-meta span{font-size:11.5px;font-weight:600;color:#cdd7ee;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:100px;padding:6px 14px;}
.cf-cover-blurb{font-family:var(--f-serif);font-style:italic;font-size:19px;line-height:1.75;color:#b9c4dc;max-width:620px;margin:20px auto 0;}
.cf-cover-cta{display:flex;justify-content:center;margin-top:26px;}
.cf-contents{margin:34px auto 0;max-width:560px;text-align:left;padding:18px 20px 10px;border-radius:18px;background:rgba(255,255,255,.035);border:1px solid rgba(157,184,245,.14);}
.cf-contents-label{font-family:var(--f-display);font-size:11px;letter-spacing:4px;color:${MUTED};text-transform:uppercase;margin-bottom:6px;}
.cf-contents ol{list-style:none;}
.cf-contents li + li{border-top:1px dashed rgba(157,184,245,.16);}
.cf-contents button{display:flex;align-items:center;gap:12px;width:100%;background:none;border:none;cursor:pointer;padding:13px 4px;text-align:left;font-family:var(--f-body);font-size:15px;font-weight:500;color:${PARCH};transition:color .2s ease,padding .2s ease;}
.cf-contents button:hover{color:var(--acc);padding-left:10px;}
.cf-c-num{font-family:var(--f-display);font-size:11.5px;font-weight:800;color:var(--acc);}
.cf-c-dots{flex:1;}
.cf-c-go{opacity:0;transform:translateX(-6px);transition:all .2s ease;}
.cf-contents button:hover .cf-c-go{opacity:1;transform:none;}

/* content primitives */
.cf-block{animation:cfIn .6s ease both;}
.cf-block-head{display:flex;align-items:center;gap:16px;}
.cf-block-head h3{font-family:var(--f-display);font-weight:800;font-size:clamp(22px,3vw,32px);color:var(--c);letter-spacing:.4px;line-height:1.2;}
.cf-block-line{flex:1;min-width:30px;height:1px;background:linear-gradient(90deg,var(--c),transparent);opacity:.5;}
.cf-block-sub{font-family:var(--f-serif);font-style:italic;font-size:18px;color:${MUTED};margin-top:10px;max-width:760px;line-height:1.7;}
.cf-block-body{margin-top:22px;}
.cf-prose{font-family:var(--f-serif);font-size:19px;line-height:1.85;color:#c6d0e6;margin:0 0 14px;}
.cf-mini-label{font-family:var(--f-display);font-size:11.5px;font-weight:700;letter-spacing:3px;margin-bottom:12px;text-transform:uppercase;}

.cf-dot-list,.cf-num-list{list-style:none;display:flex;flex-direction:column;gap:12px;}
.cf-dot-list li,.cf-num-list li{font-family:var(--f-serif);font-size:18.5px;line-height:1.65;color:#c6d0e6;padding:12px 16px 12px 46px;position:relative;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(157,184,245,.1);break-inside:avoid;-webkit-column-break-inside:avoid;transition:border-color .25s ease,background .25s ease,transform .25s ease;}
.cf-dot-list li:hover,.cf-num-list li:hover{background:rgba(255,255,255,.06);border-color:color-mix(in srgb,var(--mk) 45%,transparent);transform:translateX(3px);}
.cf-dot-list li strong,.cf-num-list li strong{color:#fff;font-weight:600;}
.cf-dot-list li::before{content:"";position:absolute;left:19px;top:20px;width:7px;height:7px;border-radius:50%;background:var(--mk);box-shadow:0 0 10px var(--mk);}
.cf-num-list{counter-reset:n;}
.cf-num-list li::before{counter-increment:n;content:counter(n,decimal-leading-zero);position:absolute;left:14px;top:14px;font-family:var(--f-display);font-size:12.5px;font-weight:800;color:var(--mk);}

.cf-tbl-wrap{overflow-x:auto;border:1px solid rgba(157,184,245,.18);border-radius:16px;background:rgba(255,255,255,.03);}
.cf-tbl{width:100%;border-collapse:collapse;min-width:420px;}
.cf-tbl th{font-family:var(--f-display);font-size:11.5px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--acc);padding:16px 18px;border-bottom:1px solid rgba(157,184,245,.2);white-space:nowrap;background:rgba(255,255,255,.04);}
.cf-tbl td{font-family:var(--f-body);font-size:14.5px;line-height:1.6;padding:13px 18px;border-top:1px solid rgba(157,184,245,.1);vertical-align:top;color:#c6d0e6;}
.cf-tbl tbody tr:hover td{background:rgba(255,255,255,.04);}

.cf-chips{display:flex;flex-wrap:wrap;gap:10px;}
.cf-chip{font-family:var(--f-body);font-size:12.5px;font-weight:600;letter-spacing:.4px;color:var(--c);border:1px solid color-mix(in srgb,var(--c) 42%,transparent);background:color-mix(in srgb,var(--c) 10%,transparent);border-radius:100px;padding:9px 18px;white-space:nowrap;}
@supports not (color:color-mix(in srgb,red,blue)){.cf-chip{border-color:rgba(230,178,122,.35);background:rgba(230,178,122,.08);}}

.cf-callout{border-left:3px solid var(--c);background:linear-gradient(90deg,rgba(255,255,255,.06),transparent);border-radius:0 14px 14px 0;padding:16px 20px;margin:22px 0 0;}
.cf-callout p{font-family:var(--f-serif);font-size:18.5px;line-height:1.7;color:#d3dbee;margin:0;}
.cf-motto{font-family:var(--f-display);font-weight:800;font-size:clamp(19px,3vw,28px);line-height:1.5;text-align:center;margin-top:34px;
  background:linear-gradient(100deg,var(--c),#fff 50%,var(--c));background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:cfShimmer 7s linear infinite;}

.cf-flow{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 6px;padding:10px 0;}
.cf-flow-step-wrap{display:flex;align-items:center;gap:6px;}
.cf-flow-step{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:112px;padding:14px 18px;border-radius:16px;font-family:var(--f-display);font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d3dbee;background:rgba(255,255,255,.04);border:1px solid rgba(157,184,245,.2);text-align:center;animation:cfIn .6s ease both;}
.cf-flow-step.hi{color:${INK};background:linear-gradient(110deg,#f3d49c,var(--c));border-color:transparent;box-shadow:0 12px 28px -12px var(--c);}
.cf-flow-n{font-size:10px;letter-spacing:2px;opacity:.55;}
.cf-flow-arrow{color:var(--c);font-size:20px;opacity:.7;}
@media (max-width:640px){.cf-flow{flex-direction:column;}.cf-flow-step-wrap{flex-direction:column;}.cf-flow-arrow{transform:rotate(90deg);}}

.cf-crystal-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
@media (max-width:720px){.cf-crystal-row{grid-template-columns:repeat(2,1fr);}}
.cf-crystal{text-align:center;border:1px solid rgba(157,184,245,.18);border-radius:20px;background:rgba(255,255,255,.035);padding:24px 12px 18px;box-shadow:inset 0 0 50px color-mix(in srgb,var(--c) 14%,transparent);animation:cfIn .6s ease both;min-height:150px;}
.cf-crystal-name{font-family:var(--f-display);font-size:20px;color:#fff;margin-top:10px;}
.cf-crystal-meta{font-family:var(--f-display);font-size:10.5px;letter-spacing:2px;color:var(--c);margin-top:6px;text-transform:uppercase;}

@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto;}
  *{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;}
}
`;

/* ═══════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════ */
export default function Cyberfest() {
  const [openZone, setOpenZone] = useState(null);
  const closeZone = useCallback(() => setOpenZone(null), []);

  return (
    <div className="cf-root">
      <style>{CSS}</style>

      <AmbientScore src={assets.ThemeMusic} />

      <Hero />

      <main style={{ position: "relative", zIndex: 10 }}>
        <EventBriefScene />
        <InviteScene />
        <ZoneIndexScene onOpen={setOpenZone} />
        <ExperienceZonesScene />
        <FAQScene />
        <ClosingScene />
      </main>

      <ParchmentModal zone={openZone} onClose={closeZone} />
    </div>
  );
}