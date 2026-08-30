import { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } from "react";
import { Link } from "react-router-dom";
import assets from "../../assets/assets"

/* ── PHOTO ASSETS ────────────────────────────────────────────
   Imported from local project assets. Swap these paths/files
   for your own images — the filenames below are just a
   suggested naming convention matching each usage below.      */
// import castleNight from "./assets/castle-night.jpg";
// import castleCliff from "./assets/castle-cliff.jpg";
// import greatHall from "./assets/great-hall.jpg";
// import slytherinCrest from "./assets/slytherin-crest.jpg";
// import potionsShelf from "./assets/potions-shelf.jpg";
// import relicsDark from "./assets/relics-dark.jpg";
// import marauderMap from "./assets/marauder-map.jpg";
// import platformTicket from "./assets/platform-ticket.jpg";

/* ── DISPLAY FONT ────────────────────────────────────────────
   The "Harry Potter" logotype itself is Warner Bros.' trademarked
   artwork, not a distributable typeface, so it can't be bundled
   here — and most "Harry Potter font" .ttf/.otf files circulating
   online are unlicensed fan reproductions of that trademark.

   If you own the rights to a "wizarding"-style display font
   (something you've licensed for commercial use, e.g. from a type
   foundry or marketplace), drop the font file in and uncomment
   both lines below — the CSS var picks it up automatically.
   Until then, headings render in MedievalSharp, a free, similarly
   whimsical Google Font, so nothing looks broken in the meantime. */
// import hpDisplayFont from "./assets/fonts/hp-display.woff2";

/* ═══════════════════════════════════════════════════════════════
   CYBERFLIX 2026
   "Enter the Wizarding World of Technology"

   Six zones — Chamber of Circuits, The Triwizard Quest, The
   Founder's Vault, Wizard's Rally, Clash of Wizards and The Next
   Big Idea: Venture X — rendered inside the layered-parallax
   gothic design: fixed multi-plane hero, per-scene depth layers,
   drifting wisps, rune drift, scroll-driven props.
═══════════════════════════════════════════════════════════════ */

/* ── TOKENS ──────────────────────────────────────────────────── */
const INK = "#05060d";
const INK_2 = "#090b16";
const INK_3 = "#0f1122";
const INK_4 = "#161a2e";
const PARCH = "#e4e6f2";      // moonlight text
const ARC = "#6d4bd0";        // arcane violet (primary)
const ARC_HI = "#b9a6f5";
const CYAN = "#3fb9d4";       // circuit cyan (secondary)
const CYAN_HI = "#8fe3f2";
const GOLD = "#d9b45f";
const IRON = "#5a6270";
const IRON_HI = "#8b95a3";
const BONE = "#cec7b2";
const BONE_D = "#9e9678";
const WINE = "#5c2029";
const MUTED = "#98a0b4";
const DIM = "#7d8598";

const ADDRESS = "Door No. 71 & 73, Second Floor, CIT Nagar 1st Main Road, CIT Nagar, Nandanam, Chennai";
const SITE = "www.cyberbots.in";
// TODO: point this at your real registration form/page (Google Form, payment
// gateway, etc). Every "Register Now" button in the modal uses this one link
// UNLESS the zone has its own internal route in ZONE_REGISTER_ROUTES below.
const REGISTER_URL = "https://www.cyberbots.in/register";

// Per-zone registration routes: zones listed here have their own in-app
// registration page, so "Register Now" navigates there via React Router
// instead of the generic REGISTER_URL above. All zones route through the
// same shared form (src/pages/ZoneRegistrationForm.jsx) via one dynamic
// route — add a zone's id here once its config entry in
// src/pages/zoneRegistrationConfigs.js is confirmed and ready to go live.
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
    meta: ["Grades 9–12", "Research Poster", "Prototype Optional", "Council Q&A"],
    blurb:
      "Identify a real-world problem, design a technology-driven solution, and present it to the Research Council — like an entrepreneur pitching to investors.",
  },
];

/* ── GRADE CATEGORIES ─────────────────────────────────────────
   Zones 1A/1B, 2A/2B and 3A/3B each belong to one grade band.
   Used to group the zone map into three labelled tiers and to
   colour each card's grade badge consistently within a tier.  */
const GRADE_CATEGORIES = [
  { id: 1, range: "Grades 3–5", label: "Category 1 · Junior Wizards", color: "#7fd6a2" },
  { id: 2, range: "Grades 6–8", label: "Category 2 · Apprentice Wizards", color: "#8fe3f2" },
  { id: 3, range: "Grades 9–12", label: "Category 3 · Master Wizards", color: "#e79a90" },
];

/* ── INTERACTIVE EXPERIENCE ZONES ───────────────────────────────
   The three carnival attractions that sit outside the six
   competition zones — drawn from the event's experience table.  */
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

/* ── FREQUENTLY ASKED QUESTIONS ─────────────────────────────────
   Sourced from the CyberFlix 2K26 event FAQ, grouped the way a
   wizard-in-training would want to browse them: About, Zones,
   Registration, and the wider Event Experience.               */
const FAQ_CATEGORIES = [
  {
    id: "about",
    label: "About the Event",
    items: [
      {
        q: "What is CYBERFLIX 2K26?",
        a: "CYBERFLIX 2K26 is a Regional Level Robotics Premier League presented by Cyberbots — a Harry Potter–themed robotics championship designed to encourage creativity, innovation, critical thinking, teamwork and problem-solving through hands-on challenges.",
      },
      {
        q: "When and where will CYBERFLIX 2K26 be held?",
        a: "The event will be held on 31 October 2026 at Vani Vidyalaya Senior Secondary & Junior College, K. K. Nagar, Chennai.",
      },
      {
        q: "Who can participate in CYBERFLIX 2K26?",
        a: "Students from Grades 3 to 12 can participate, depending on their eligible zone or category.",
      },
      {
        q: "How many zones are there in CYBERFLIX 2K26?",
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
        a: "The registration fee is ₹850 per student for Zones 1A, 1B, 2A & 2B. For Zone 3A the fee is ₹750 per student, and for Zone 3B the fee is ₹850 per team.",
      },
      {
        q: "When does registration start?",
        a: "Registration opens on 26 August 2026.",
      },
      {
        q: "What is the last date for registration?",
        a: "Registration closes on 20 October 2026.",
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
        a: "Individual: The Triwizard Quest & The Next Big Idea. Team of 2: Chamber of Circuits, The Founder's Vault, Wizard's Rally and Clash of Wizards.",
      },
    ],
  },
  {
    id: "experience",
    label: "Event Experience",
    items: [
      {
        q: "What other experiences will be available at the event?",
        a: "CYBERFLIX 2K26 also features interactive experiences such as a 4D Simulation Theatre, a Drone Show and a Robot Interaction Zone.",
      },
      {
        q: "What can students gain from participating?",
        a: "Students gain practical exposure to robotics, electronics, coding and engineering, while developing teamwork, communication, collaboration, innovation and creative problem-solving skills.",
      },
      {
        q: "Is CYBERFLIX 2K26 only about robotics?",
        a: "No. The championship combines robotics, electronics, coding, STEM applications, innovation, research, engineering and teamwork across its different zones.",
      },
      {
        q: "Will the detailed event schedule be provided?",
        a: "Yes. The detailed event schedule will be shared one week prior to the competition.",
      },
    ],
  },
];

/* ── SKINS: the same components render on night stone or on paper ──
   Every primitive reads its ink from context, so a single provider
   flips the whole document from the dark carnival palette to the
   aged-parchment palette used inside the detail modal.          */
const DARK_SKIN = {
  paper: false,
  text: PARCH,
  body: "#a5adc0",
  muted: MUTED,
  dim: DIM,
  line: "rgba(120,128,150,0.22)",
  lineSoft: "rgba(120,128,150,0.14)",
  surface: "rgba(0,0,0,0.26)",
  surfaceHi: "rgba(255,255,255,0.025)",
  card: `linear-gradient(170deg, ${INK_4} 0%, ${INK_3} 100%)`,
  bar: "rgba(255,255,255,0.05)",
};

const PAPER_SKIN = {
  paper: true,
  text: "#2f2419",
  body: "#4c3b2a",
  muted: "#5c4934",
  dim: "#7c6850",
  line: "rgba(94,68,40,0.34)",
  lineSoft: "rgba(94,68,40,0.2)",
  surface: "rgba(255,250,238,0.42)",
  surfaceHi: "rgba(120,86,50,0.08)",
  card: "linear-gradient(170deg, rgba(255,252,244,0.66) 0%, rgba(226,206,172,0.42) 100%)",
  bar: "rgba(94,68,40,0.16)",
};

/* Convert a luminous carnival accent into an ink that reads on paper. */
function paperInk(c) {
  if (typeof c !== "string" || c[0] !== "#") return c;
  let h = c.slice(1);
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  if (h.length < 6) return c;
  const n = parseInt(h.slice(0, 6), 16);
  const base = [47, 36, 25];
  const out = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v, i) =>
    Math.max(0, Math.min(255, Math.round(v * 0.38 + base[i] * 0.26)))
  );
  return `rgb(${out.join(",")})`;
}

const SkinCtx = createContext(DARK_SKIN);
function useSkin() {
  return useContext(SkinCtx) || DARK_SKIN;
}
function useInk() {
  const skin = useSkin();
  return useCallback((c) => (skin.paper ? paperInk(c) : c), [skin.paper]);
}

function SkinProvider({ skin, children, style, className }) {
  const vars = {
    "--ink-text": skin.text,
    "--ink-body": skin.body,
    "--ink-muted": skin.muted,
    "--ink-dim": skin.dim,
    "--ink-line": skin.line,
    "--ink-line-soft": skin.lineSoft,
    "--ink-surface": skin.surface,
    "--ink-surface-hi": skin.surfaceHi,
    "--ink-card": skin.card,
    "--ink-bar": skin.bar,
  };
  return (
    <SkinCtx.Provider value={skin}>
      <div className={className} style={{ ...vars, ...style }}>{children}</div>
    </SkinCtx.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOTION CORE
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

/* ── STATIC SCENE WRAPPERS ───────────────────────────────────────
   The old build tied every backdrop layer to scroll position
   (per-plane parallax speeds, pointer tracking, a pinned/fading
   hero). That whole scroll-linked engine has been removed — every
   scene is now a plain, static section. Layer/Scene stay as thin
   layout wrappers so the rest of the file doesn't need to change
   shape, but they no longer register anything with a scroll loop. */
function Scene({ children, style, className, id, tag: Tag = "section" }) {
  return (
    <Tag
      id={id}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        contentVisibility: "auto",
        containIntrinsicSize: "1100px",
        scrollMarginTop: "0px",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

function Layer({ children, style, z = 0 }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: "-12% 0",
        pointerEvents: "none",
        zIndex: z,
        ...style,
      }}
    >
      {children}
    </div>
  );
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

/* ═══════════════════════════════════════════════════════════════
   HAND-DRAWN WORLD — every prop is original SVG/CSS.
═══════════════════════════════════════════════════════════════ */
function Stars({ count = 80, bright = false }) {
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
    <div style={{ position: "absolute", inset: 0 }}>
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute", top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, borderRadius: "50%",
            background: bright ? "#f0eaff" : "#cdd2e6",
            boxShadow: `0 0 ${bright ? 5 : 3}px 1px rgba(185,166,245,0.45)`,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* Circuit creep — the signature motif: solder-trace veins that
   branch along a scene's edge and tie every zone together. */
function CircuitCreep({ side = "top", reach = 34, opacity = 0.5, hue = CYAN_HI }) {
  const branches = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ x: 4 + i * 11 + ((i * 17) % 6), len: 10 + ((i * 29) % reach), a: -35 + ((i * 41) % 70) })),
    [reach]
  );
  const flip = side === "bottom";
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: "absolute", [side]: 0, left: 0, width: "100%", height: 70, opacity, transform: flip ? "scaleY(-1)" : "none", pointerEvents: "none" }}>
      {branches.map((b, i) => {
        const rad = (b.a * Math.PI) / 180;
        const x2 = b.x + Math.sin(rad) * b.len * 0.3;
        const y2 = b.len * 0.55;
        return (
          <g key={i} stroke={hue} strokeWidth="0.35" strokeLinecap="round" opacity={0.5 + (i % 3) * 0.15}>
            <line x1={b.x} y1="0" x2={x2} y2={y2} />
            <line x1={(b.x + x2) / 2} y1={y2 * 0.4} x2={x2 - 3} y2={y2 * 0.4 + 3} />
            <line x1={(b.x + x2) / 2} y1={y2 * 0.4} x2={x2 + 3} y2={y2 * 0.4 - 2} />
            <circle cx={x2} cy={y2} r="0.7" fill={hue} stroke="none" />
          </g>
        );
      })}
    </svg>
  );
}

/* A drifting wisp — the carnival's floating arcane light. */
function Wisp({ x, y, s = 1, delay = 0, dim = false, hue = CYAN_HI }) {
  return (
    <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: `scale(${s})`, animation: `wispFloat ${5.4 + (delay % 3)}s ease-in-out ${delay}s infinite`, opacity: dim ? 0.5 : 1 }}>
      <div style={{ width: 40, height: 40, margin: "0 auto", borderRadius: "50%", background: `radial-gradient(circle, ${hue}55, transparent 70%)` }} />
      <div
        style={{
          width: 13, height: 13, margin: "-30px auto 0", borderRadius: "50%",
          background: `radial-gradient(circle at 40% 32%, #ffffff, ${hue} 55%, ${ARC} 92%)`,
          boxShadow: `0 0 16px 5px ${hue}66`,
          animation: "wispPulse 1.8s ease-in-out infinite",
        }}
      />
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

function RuneDrift({ count = 9 }) {
  const RUNES = ["ᚠ", "ᚱ", "ᛗ", "ᛟ", "ᚹ", "ᛉ", "ᛞ", "ᚨ", "ᛏ"];
  const runes = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ id: i, r: RUNES[i % RUNES.length], left: 4 + ((i * 113) % 90), top: 8 + ((i * 61) % 78), delay: i * 1.7, dur: 9 + (i % 4) * 3, size: 16 + (i % 3) * 8 })),
    [count]
  );
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {runes.map((r) => (
        <span key={r.id} style={{ position: "absolute", left: `${r.left}%`, top: `${r.top}%`, fontSize: r.size, color: ARC_HI, opacity: 0, fontFamily: "serif", animation: `runeGlow ${r.dur}s ease-in-out ${r.delay}s infinite` }}>
          {r.r}
        </span>
      ))}
    </div>
  );
}

function SparkDust({ count = 16 }) {
  const dots = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ id: i, top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 2 + 1, delay: Math.random() * 7, dur: Math.random() * 5 + 6 })),
    [count]
  );
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {dots.map((m) => (
        <span key={m.id} style={{ position: "absolute", top: `${m.top}%`, left: `${m.left}%`, width: m.size, height: m.size, borderRadius: "50%", background: "rgba(143,227,242,0.5)", animation: `moteDrift ${m.dur}s ease-in-out ${m.delay}s infinite` }} />
      ))}
    </div>
  );
}

function Snowfall({ count = 40 }) {
  const flakes = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ id: i, left: Math.random() * 100, size: Math.random() * 2.6 + 1.2, delay: Math.random() * 8, dur: Math.random() * 6 + 7, drift: (Math.random() - 0.5) * 60 })),
    [count]
  );
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {flakes.map((f) => (
        <span
          key={f.id}
          style={{
            position: "absolute", top: "-4%", left: `${f.left}%`, width: f.size, height: f.size, borderRadius: "50%",
            background: "rgba(226,222,245,0.85)", "--dx": `${f.drift}px`,
            animation: `snowFall ${f.dur}s linear ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function WaxSeal({ size = 66 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ animation: "sealPulse 3.2s ease-in-out infinite" }}>
      <circle cx="32" cy="32" r="30" fill={WINE} />
      <circle cx="32" cy="32" r="30" fill="none" stroke={ARC_HI} strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="32" r="23" fill="none" stroke={ARC_HI} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.6" />
      <path d="M32,14 L37,26 L50,27 L40,36 L43,49 L32,42 L21,49 L24,36 L14,27 L27,26 Z" fill="#e8dfc0" opacity="0.9" />
      <circle cx="32" cy="32" r="4" fill={WINE} />
    </svg>
  );
}

/* Register Now — routes to this zone's own registration page when one
   exists (see ZONE_REGISTER_ROUTES above); otherwise falls back to the
   shared external REGISTER_URL. Used by both Register Now buttons in
   the parchment modal (title leaf + top runner bar) so they always
   agree on where a given zone should send participants. */
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

/* Download Handbook — pulls the zone's PDF straight from assets.js and
   forces a real "save to disk" instead of letting the browser just
   navigate to / preview the file. A plain <a href download> is enough
   for same-origin, bundler-imported assets in most browsers, but some
   setups (older Safari, PDFs served from a CDN, servers that don't
   send a download-friendly Content-Disposition) quietly ignore the
   `download` attribute and open the PDF inline instead. Fetching the
   asset ourselves and handing the browser a Blob URL sidesteps all of
   that, and also lets us give the file a clean, readable name instead
   of the bundler's hashed filename. */
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
    // Fall back to a plain navigation if the fetch/Blob path fails for
    // any reason (e.g. offline) — better a new tab than nothing at all.
    window.open(url, "_blank", "noopener");
  }
}

/* A single House Crystal — original faceted gem. */
function CrystalArt({ color, size = 54, delay = 0 }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 40 60" fill="none" style={{ animation: `wispFloat ${5 + delay}s ease-in-out ${delay}s infinite` }}>
      <path d="M20,2 L36,20 L20,58 L4,20 Z" fill={color} opacity="0.42" />
      <path d="M20,2 L36,20 L20,58 L4,20 Z" stroke={color} strokeWidth="1.6" />
      <path d="M4,20 h32 M20,2 v56 M20,20 L36,20 M20,20 L4,20" stroke={color} strokeWidth="0.9" opacity="0.8" />
      <path d="M20,2 L20,20 L4,20 Z" fill={color} opacity="0.65" />
      <ellipse cx="20" cy="58" rx="14" ry="3" fill={color} opacity="0.25" style={{ filter: "blur(3px)" }} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTENT PRIMITIVES
═══════════════════════════════════════════════════════════════ */
function Eyebrow({ children, color = IRON_HI }) {
  return <div style={{ fontFamily: "'Cormorant SC',serif", fontSize: 14, fontWeight: 600, letterSpacing: 4, color, marginBottom: 12 }}>{children}</div>;
}

function Heading({ children, size = "clamp(30px,5vw,52px)", color }) {
  const skin = useSkin();
  return <h2 style={{ fontFamily: "var(--font-nabla)", fontWeight: 600, fontSize: size, color: color || skin.text, lineHeight: 1.12, letterSpacing: 1 }}>{children}</h2>;
}

function SectionHead({ eyebrow, title, desc, center = true, color }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ textAlign: center ? "center" : "left", marginBottom: 52, position: "relative", zIndex: 5 }}>
      <div style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(14px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
        <Eyebrow color={color}>{eyebrow}</Eyebrow>
      </div>
      <div style={{ clipPath: inView ? "inset(0 0 0 0)" : "inset(0 100% 0 0)", transition: "clip-path 0.9s cubic-bezier(0.6,0.04,0.3,1) 0.12s" }}>
        <Heading>{title}</Heading>
      </div>
      {desc && (
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17.5, color: MUTED, maxWidth: 620, lineHeight: 1.75, margin: center ? "16px auto 0" : "16px 0 0", opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(12px)", transition: "opacity 0.6s 0.3s ease, transform 0.6s 0.3s ease" }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* A titled content block inside a zone. */
function Block({ title, sub, color = CYAN_HI, children, id }) {
  const [ref, inView] = useInView(0.04, "60px");
  const c = useInk()(color);
  return (
    <div ref={ref} id={id} style={{ marginTop: 52, opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(18px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(21px,3vw,28px)", color: c, letterSpacing: 0.6 }}>{title}</h3>
        <span style={{ flex: 1, minWidth: 40, height: 1, background: `linear-gradient(90deg, ${c}, transparent)`, opacity: 0.45 }} />
      </div>
      {sub && <p className="blk-sub">{sub}</p>}
      <div style={{ marginTop: 18 }}>{children}</div>
    </div>
  );
}

function Prose({ children, style }) {
  const skin = useSkin();
  return <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, lineHeight: 1.85, color: skin.body, margin: "0 0 14px", ...style }}>{children}</p>;
}

function Bullets({ items, color = CYAN_HI, cols = 1, numbered = false }) {
  const Tag = numbered ? "ol" : "ul";
  const skin = useSkin();
  color = useInk()(color);
  return (
    <Tag
      className={numbered ? "num-list" : "dot-list"}
      style={cols > 1 ? { "--mk": color, display: "block", columnCount: cols, columnGap: 34 } : { "--mk": color }}
    >
      {items.map((it, i) => (
        <li key={i} style={cols > 1 ? { marginBottom: 11 } : undefined}>
          {typeof it === "string" ? it : (
            <>
              <strong style={{ color: skin.text, fontWeight: 600 }}>{it.t}</strong>
              {it.d ? <> — {it.d}</> : null}
            </>
          )}
        </li>
      ))}
    </Tag>
  );
}

function DataTable({ head, rows, color = CYAN_HI, numeric = [] }) {
  const skin = useSkin();
  color = useInk()(color);
  return (
    <div className="tbl-wrap" style={{ "--acc": color }}>
      <table className="tbl">
        <thead>
          <tr>{head.map((h, i) => <th key={i} style={{ textAlign: numeric.includes(i) ? "right" : "left" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={{ textAlign: numeric.includes(j) ? "right" : "left", color: j === 0 ? skin.text : skin.body, fontWeight: j === 0 ? 600 : 400 }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Score sheets: criteria + description + animated mark bar. */
function ScoreSheet({ rows, total = 100, color = CYAN_HI, accent = ARC }) {
  const [ref, inView] = useInView(0.2);
  const skin = useSkin();
  const ink = useInk();
  color = ink(color);
  accent = ink(accent);
  const max = Math.max(...rows.map((r) => r.m));
  return (
    <div ref={ref} style={{ background: skin.surface, border: `1px solid ${skin.line}`, borderRadius: 14, padding: "10px 22px 18px" }}>
      {rows.map((r, i) => (
        <ScoreRow key={i} row={r} idx={i} max={max} inView={inView} color={color} accent={accent} />
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 16, marginTop: 6, borderTop: `1px solid ${skin.line}` }}>
        <span style={{ fontFamily: "'Cormorant SC',serif", fontSize: 13, letterSpacing: 3, color }}>TOTAL</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: skin.text }}>{total}</span>
      </div>
    </div>
  );
}

function ScoreRow({ row, idx, max, inView, color, accent }) {
  const skin = useSkin();
  const value = useCountUp(row.m, inView, 1100 + idx * 140);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 62px", gap: 14, alignItems: "center", padding: "15px 0", borderTop: idx > 0 ? `1px solid ${skin.lineSoft}` : "none" }}>
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16.5, color: skin.body, marginBottom: 8, lineHeight: 1.55 }}>
          <strong style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: skin.text, letterSpacing: 0.3 }}>{row.c}</strong>
          {row.d ? <> — {row.d}</> : null}
        </div>
        <div style={{ height: 7, borderRadius: 100, background: skin.bar, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 100, width: inView ? `${(row.m / max) * 100}%` : "0%", background: `linear-gradient(90deg, ${accent}, ${color})`, boxShadow: `0 0 12px ${color}44`, transition: `width 1.2s cubic-bezier(0.3,0.7,0.3,1) ${idx * 0.12 + 0.15}s` }} />
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color, textAlign: "right" }}>{value}</div>
    </div>
  );
}

/* Vertical arrow flow — event flows and system flows. */
function Flow({ steps, color = CYAN_HI, compact = false }) {
  const [ref, inView] = useInView(0.08, "40px");
  const skin = useSkin();
  color = useInk()(color);
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: compact ? 4 : 6, padding: compact ? "6px 0" : "10px 0" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "contents" }}>
          <div
            style={{
              fontFamily: "'Cormorant SC',serif", fontSize: compact ? 12.5 : 14, letterSpacing: 2.4, color: s.hi ? color : skin.body,
              background: s.hi ? skin.surfaceHi : "transparent", border: `1px solid ${s.hi ? color : skin.line}`,
              borderRadius: 100, padding: compact ? "6px 18px" : "9px 24px", textAlign: "center",
              opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(10px)",
              transition: `opacity .5s ease ${i * 0.06}s, transform .5s ease ${i * 0.06}s`,
            }}
          >
            {s.t || s}
          </div>
          {i < steps.length - 1 && <span style={{ color, opacity: 0.6, fontSize: 15, lineHeight: 1, opacity: inView ? 1 : 0, transition: `opacity .5s ease ${i * 0.06 + 0.05}s` }}>↓</span>}
        </div>
      ))}
    </div>
  );
}

function Chips({ items, color = CYAN_HI }) {
  color = useInk()(color);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 4 }}>
      {items.map((c, i) => (
        <span key={i} className="chip" style={{ "--c": color }}>{c}</span>
      ))}
    </div>
  );
}

/* A bordered panel for grouped lists. */
function Panel({ title, items, color = CYAN_HI, note }) {
  const skin = useSkin();
  color = useInk()(color);
  return (
    <div className="panel" style={{ "--c": color }}>
      {title && <div className="panel-title">{title}</div>}
      {items && <Bullets items={items} color={color} />}
      {note && <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 15, color: skin.dim, marginTop: 10 }}>{note}</p>}
    </div>
  );
}

function PanelGrid({ children, min = 260 }) {
  return <div className="auto-grid" style={{ "--min": `${min}px` }}>{children}</div>;
}

/* Checkpoint / obstacle card with steps + technical column. */
function DetailCard({ index, title, sub, color, blocks }) {
  const [ref, inView] = useInView(0.08, "40px");
  const skin = useSkin();
  color = useInk()(color);
  return (
    <div
      ref={ref}
      className="detail-card"
      style={{
        "--c": color,
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(22px)",
        transition: "opacity .65s ease, transform .65s ease, border-color .3s, box-shadow .3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
        {index != null && (
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color, opacity: 0.75, minWidth: 40 }}>
            {String(index).padStart(2, "0")}
          </span>
        )}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 23, color: skin.text, letterSpacing: 0.4 }}>{title}</h4>
          {sub && <div style={{ fontFamily: "'Cormorant SC',serif", fontSize: 11.5, letterSpacing: 2.4, color, marginTop: 3 }}>{sub}</div>}
        </div>
      </div>
      <div className="auto-grid" style={{ "--min": "230px", marginTop: 14 }}>
        {blocks.map((b, i) => (
          <div key={i}>
            <div className="mini-label" style={{ color }}>{b.label}</div>
            {b.text && <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15.5, lineHeight: 1.7, color: skin.body }}>{b.text}</p>}
            {b.items && <Bullets items={b.items} color={color} />}
            {b.flow && <Flow steps={b.flow} color={color} compact />}
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkList({ links, color = CYAN_HI }) {
  color = useInk()(color);
  return (
    <ul className="link-list" style={{ "--c": color }}>
      {links.map((l, i) => (
        <li key={i}>
          <a href={l} target="_blank" rel="noreferrer">{l}</a>
        </li>
      ))}
    </ul>
  );
}

function Callout({ children, color = GOLD }) {
  const skin = useSkin();
  color = useInk()(color);
  return (
    <div style={{ borderLeft: `2px solid ${color}`, background: skin.surfaceHi, borderRadius: "0 8px 8px 0", padding: "14px 18px", margin: "18px 0 0" }}>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16.5, lineHeight: 1.7, color: skin.body, margin: 0 }}>{children}</p>
    </div>
  );
}

/* A centred, italic closing line — used for the little motivational
   flourishes that close out most zone briefings. */
function Motto({ children, color = GOLD }) {
  const ink = useInk();
  return (
    <p
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "clamp(19px,3.2vw,28px)",
        color: ink(color),
        textAlign: "center",
        lineHeight: 1.5,
        marginTop: 30,
      }}
    >
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT CONTENT — the six CyberFlix 2026 zone briefings
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
  mode: "Individual",
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
};

/* ═══════════════════════════════════════════════════════════════
   HERO — ARRIVAL AT THE CARNIVAL
   A single static, full-bleed photograph of the castle at night
   with the title card centred on top. No scroll-linked motion.
═══════════════════════════════════════════════════════════════ */
function Hero() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 140);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", minHeight: 560, overflow: "hidden", background: `linear-gradient(180deg, #04030c 0%, ${INK} 45%, #080716 100%)` }}>
      <img
        src={assets.Event2}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 30%",
        }}
      />
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}><Stars count={60} /></div>
      <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "linear-gradient(180deg, rgba(5,6,13,0.55) 0%, rgba(5,6,13,0.15) 30%, rgba(5,6,13,0.35) 58%, rgba(4,4,12,0.86) 88%, #04030c 100%)", pointerEvents: "none" }} />

      <div className="hero-inner" style={{ position: "relative", zIndex: 3, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {/* <div style={{ display: "inline-flex", alignItems: "center", gap: 10, border: `1px solid ${IRON}99`, background: "rgba(109,75,208,0.14)", borderRadius: 100, padding: "8px 22px", fontFamily: "'Cormorant SC',serif", fontSize: 13, fontWeight: 600, letterSpacing: 3, color: CYAN_HI, marginBottom: 26, opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(-14px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
          ✶ Six Zones · Grades 3–12 · Chennai ✶
        </div> */}
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(46px,10vw,116px)", lineHeight: 0.95, color: PARCH, textShadow: "0 6px 40px rgba(0,0,0,0.75), 0 0 60px rgba(109,75,208,0.25)", letterSpacing: 2, opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(-14px)", transition: "opacity 0.9s 0.12s ease, transform 0.9s 0.12s ease" }}>
          CYBERFLIX
        </h1>
        <div style={{ fontFamily: "'Cormorant SC',serif", fontSize: "clamp(13px,2.4vw,21px)", letterSpacing: 7, color: ARC_HI, marginTop: 10, opacity: ready ? 1 : 0, transition: "opacity 0.9s 0.3s ease" }}>
          2K26
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(20px,4.4vw,44px)",
            marginTop: 26,
            flexWrap: "wrap",
            opacity: ready ? 1 : 0,
            transform: ready ? "none" : "translateY(-10px)",
            transition: "opacity 0.9s 0.35s ease, transform 0.9s 0.35s ease",
          }}
        >
          <img
            src={assets.Meenakshi}
            alt="Meenakshi Group of Institutions"
            style={{ height: "clamp(58px,9.4vw,104px)", width: "auto", filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.55))" }}
          />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant SC',serif", fontSize: "clamp(13px,2vw,17px)", fontWeight: 600, letterSpacing: 3, color: MUTED, textTransform: "uppercase" }}>
              In Association with
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(21px,3.6vw,32px)", color: PARCH, marginTop: 6, letterSpacing: 0.4 }}>
              Meenakshi Group of Institutions
            </div>
            <div style={{ fontFamily: "'Cormorant SC',serif", fontSize: "clamp(14px,2.4vw,19px)", fontWeight: 600, letterSpacing: 1.6, color: GOLD, marginTop: 6 }}>
              VANI VIDYALAYA SENIOR SECONDARY & JUNIOR COLLEGE
            </div>
          </div>
          <img
            src={assets.Vani}
            alt="Vani Vidyalaya Senior Secondary & Junior College"
            style={{ height: "clamp(58px,9.4vw,104px)", width: "auto", filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.55))" }}
          />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3.4vw,32px)", color: GOLD, marginTop: 18, letterSpacing: 1, opacity: ready ? 1 : 0, transition: "opacity 0.9s 0.4s ease" }}>
          Enter the Wizarding World of Technology
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "clamp(15px,2vw,20px)", color: MUTED, maxWidth: 560, lineHeight: 1.8, marginTop: 14, textShadow: "0 2px 12px rgba(0,0,0,0.75)", opacity: ready ? 1 : 0, transition: "opacity 0.9s 0.5s ease" }}>
          Where technology meets imagination, strategy meets adventure, and every participant becomes part of an extraordinary journey — across six zones inspired by the Wizarding World.
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: "'Cormorant SC',serif", fontSize: 12, letterSpacing: 3, color: MUTED, marginTop: 40, opacity: ready ? 1 : 0, transition: "opacity 1s 1s ease" }}>
          <span>SCROLL · YOUR JOURNEY BEGINS</span>
          <div style={{ width: 18, height: 18, borderRight: "1.5px solid #9aa0b6", borderBottom: "1.5px solid #9aa0b6", transform: "rotate(45deg)", animation: "hintDip 1.8s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE — THE OWL POST
   Straight out of the hero: the essentials of the quest — when,
   where, how to enrol — followed by the two numbers that make
   the championship worth entering. A ticket, then a ledger.
═══════════════════════════════════════════════════════════════ */
const BRIEF_FACTS = [
  { label: "Date", value: "31 October 2026 (Saturday)" },
  { label: "Venue", value: "Vani Vidyalaya Sr. Sec. & Jr. College, K. K. Nagar, Chennai" },
  { label: "Registration Opens", value: "26 August 2026" },
  { label: "Registration Closes", value: "20 October 2026" },
];

function BriefFact({ label, value, idx }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div
      ref={ref}
      className="brief-fact"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(12px)",
        transition: `opacity .6s ease ${idx * 0.08}s, transform .6s ease ${idx * 0.08}s`,
      }}
    >
      <div className="brief-fact-label">{label}</div>
      <div className="brief-fact-value">{value}</div>
    </div>
  );
}

function StakeCard({ tag, prefix = "", value, suffix = "", line, color, rune, delay = 0 }) {
  const [ref, inView] = useInView(0.3);
  const count = useCountUp(value, inView, 1500);
  return (
    <div
      ref={ref}
      className="stake-card"
      style={{
        "--c": color,
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(18px)",
        transition: `opacity .7s ease ${delay}s, transform .7s ease ${delay}s`,
      }}
    >
      <span className="stake-rune" aria-hidden="true">{rune}</span>
      <div className="stake-glow" />
      <div className="stake-tag">{tag}</div>
      <div className="stake-num">
        {prefix}
        {count.toLocaleString("en-IN")}
        {suffix}
      </div>
      <div className="stake-line">{line}</div>
    </div>
  );
}

function EventBriefScene() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        contentVisibility: "auto",
        containIntrinsicSize: "520px",
        background: `linear-gradient(180deg, ${INK} 0%, ${INK_2} 100%)`,
        padding: "68px 24px 84px",
      }}
    >
      <Layer z={0}><Stars count={18} /></Layer>
      <Layer z={1}>
        <Wisp x={4} y={26} s={0.55} delay={0.4} hue={GOLD} dim />
        <Wisp x={95} y={58} s={0.5} delay={1.9} hue={CYAN_HI} dim />
      </Layer>
      <CircuitCreep side="top" reach={18} opacity={0.38} />

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 4 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Eyebrow color={GOLD}>✶ Before You Begin ✶</Eyebrow>
        </div>

        <div className="brief-ticket">
          {BRIEF_FACTS.map((f, i) => <BriefFact key={f.label} label={f.label} value={f.value} idx={i} />)}
        </div>

        <div className="stake-row">
          <StakeCard
            tag="One Stage"
            prefix="₹"
            value={100000}
            line="At Stake"
            color={GOLD}
            rune="ᛟ"
            delay={0.08}
          />
          <StakeCard
            tag="One Event"
            value={50}
            suffix="+"
            line="Winning Stories"
            color={CYAN_HI}
            rune="ᚱ"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE — THE ZONE INDEX
═══════════════════════════════════════════════════════════════ */

function ZoneCard({ z, idx, cat, onOpen }) {
  const [ref, inView] = useInView();

  return (
    <article
      ref={ref}
      className="zone-card"
      style={{
        "--hc": z.a,
        border: `1px solid ${z.border}`,
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(28px)",
        transition: `opacity 0.7s ease ${idx * 0.09}s, transform 0.5s ease ${idx * 0.09}s, border-color .3s, box-shadow .3s`,
      }}
    >
      <div className="zone-card-bg" aria-hidden="true">
        {z.photo && <img src={z.photo} alt="" className="zone-card-photo" />}
        <div className="zone-card-scrim" />
      </div>

      <div style={{ position: "absolute", top: 20, right: 22, zIndex: 2 }}>
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: `radial-gradient(circle at 40% 32%, #fff 0%, ${z.ab} 45%, ${z.a} 92%)`, boxShadow: `0 0 12px 4px ${z.glow}`, animation: "wispPulse 1.6s ease-in-out infinite" }} />
      </div>

      <div className="zone-card-body">
        {cat && (
          <div className="grade-badge" style={{ "--gc": cat.color }}>
            {cat.range}
          </div>
        )}
        <div style={{ width: 58, height: 58, borderRadius: "50%", border: `1.5px solid ${z.border}`, background: "rgba(5,6,13,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, marginTop: cat ? 8 : 0 }}>
          <Glyph type={z.glyph} color={z.ab} size={32} />
        </div>
        <div style={{ fontFamily: "'Cormorant SC',serif", fontSize: 12, fontWeight: 700, letterSpacing: 3, color: z.ab, marginBottom: 6 }}>{z.code}</div>
        <h3 style={{ fontFamily: "var(--font-nabla)", fontWeight: 600, fontSize: 26, color: PARCH, marginBottom: 8, letterSpacing: 0.5 }}>{z.name}</h3>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 14.5, color: z.ab, marginBottom: 12 }}>{z.tagline}</div>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15.5, lineHeight: 1.7, color: MUTED, marginBottom: 14 }}>{z.blurb}</p>
        <div style={{ fontFamily: "'Cormorant SC',serif", fontSize: 11, letterSpacing: 2, color: DIM }}>{z.meta.slice(1).join(" · ")}</div>

        <div className="card-actions">
          <button type="button" className="card-btn" style={{ "--c": z.ab }} onClick={() => onOpen(z)}>
            More details
          </button>
          <button
            type="button"
            className="card-btn-outline"
            style={{ "--c": z.ab }}
            onClick={(e) => {
              e.stopPropagation();
              downloadHandbook(z.handbook, `CyberFlix-${z.code.replace(/\s+/g, "")}-Handbook.pdf`);
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

/* One grade-band tier: a labelled divider followed by its two
   zone cards, so the 3-5 / 6-8 / 9-12 split reads at a glance. */
function GradeTier({ cat, zones, onOpen }) {
  const [ref, inView] = useInView(0.1, "60px");
  return (
    <div ref={ref} className="grade-tier" style={{ "--gc": cat.color, opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(16px)", transition: "opacity .6s ease, transform .6s ease" }}>
      <div className="tier-head">
        <span className="tier-num">{String(cat.id).padStart(2, "0")}</span>
        <div className="tier-text">
          <div className="tier-label">{cat.label}</div>
          <div className="tier-range">{cat.range}</div>
        </div>
        <span className="tier-line" />
      </div>
      <div className="tier-grid">
        {zones.map((z, i) => <ZoneCard key={z.id} z={z} idx={i} cat={cat} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

function ZoneIndexScene({ onOpen }) {
  return (
    <Scene id="zones" style={{ background: INK_3, padding: "110px 24px" }}>
      <Layer z={0}><Stars count={30} /></Layer>
      <Layer z={0}><RuneDrift count={7} /></Layer>
      <Layer z={1}>
        <Wisp x={5} y={16} s={0.85} delay={0.3} hue={ARC_HI} />
        <Wisp x={93} y={64} s={0.7} delay={1.5} hue={CYAN_HI} dim />
      </Layer>
      <CircuitCreep side="top" reach={26} />
      <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 4 }}>
        <SectionHead
          eyebrow="✶ The Zone Map"
          title="Six Zones, One Journey"
          desc="Three grade tiers, six unique missions, one world of innovation. Open More details for the complete zone briefing — the story, your mission, and how to play."
        />
        <div className="tier-stack">
          {GRADE_CATEGORIES.map((cat) => (
            <GradeTier key={cat.id} cat={cat} zones={ZONES.filter((z) => z.category === cat.id)} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </Scene>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE — THE OWL DELIVERS (interlude)
   A sealed envelope arrives first. Click (or tap) the wax seal to
   break it open — the flap folds back and the envelope falls away,
   revealing the invitation printed straight onto a single folded
   letter, right where the envelope used to be.
═══════════════════════════════════════════════════════════════ */
function InviteScene() {
  const [sceneRef, sceneIn] = useInView(0.3);
  const [opened, setOpened] = useState(false);
  const [settled, setSettled] = useState(false);

  const openLetter = useCallback(() => setOpened(true), []);

  return (
    <section style={{ position: "relative", overflow: "hidden", contentVisibility: "auto", containIntrinsicSize: "820px", background: `linear-gradient(180deg, ${INK_2} 0%, ${INK_3} 100%)`, padding: "120px 24px 120px" }}>
      <Layer z={0}><Stars count={36} /></Layer>
      <Layer z={0}><SparkDust count={12} /></Layer>
      <Layer z={0}><Snowfall count={22} /></Layer>
      <CircuitCreep side="top" />

      <div style={{ maxWidth: 1040, margin: "0 auto", position: "relative", zIndex: 4 }}>
        <SectionHead
          eyebrow="✶ The Invitation"
          title="Choose Your Mission"
          desc="Across six unique zones, you will face missions inspired by the Wizarding World — from enchanted mazes and mysterious house quests to robotics battles and futuristic research."
        />

        <div ref={sceneRef} className="env-stage" style={{ opacity: sceneIn ? 1 : 0, transition: "opacity 0.6s ease" }}>
          {/* ── The sealed envelope — collapses away once opened, so the
                 letter below rises up into the space it leaves behind ── */}
          <div className={`env-cover${opened ? " collapsed" : ""}`}>
            <div className="env-cover-inner">
              {!opened && (
                <div className="env-hint" aria-hidden="true">
                  <span>✦ Tap to Open ✦</span>
                </div>
              )}

              <div className="envelope-idle">
                <div className="env-halo" aria-hidden="true" />
                <div
                  className={`envelope${opened ? " is-open" : ""}`}
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
                  <div className="env-pocket">
                    <span className="env-shine" aria-hidden="true" />
                  </div>
                  <div className="env-stamp" aria-hidden="true">✶</div>
                  <div className="env-address">
                    <div className="env-kicker">✦ Delivered by Owl Post ✦</div>
                    <div className="env-to">To Every Aspiring</div>
                    <div className="env-name">Wizard of Technology</div>
                    <div className="env-loc">— Standing Before This Very Screen —</div>
                  </div>
                  <div className="env-flap"><span className="env-flap-sheen" aria-hidden="true" /></div>
                  <div className="env-seal" aria-hidden="true">
                    <WaxSeal size={60} />
                    {!opened && (
                      <>
                        <span className="env-spark env-spark-a" />
                        <span className="env-spark env-spark-b" />
                        <span className="env-spark env-spark-c" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!opened && (
                <button type="button" className="cta-btn env-cta" onClick={openLetter}>
                  Break the Seal ✶
                </button>
              )}
            </div>
          </div>

          {/* ── The letter itself, revealed the instant the seal breaks ── */}
          <div className={`env-letter-wrap${opened ? " show" : ""}`}>
            <div className="letter-collapse">
              <div
                className={`letter-card${opened ? " show" : ""}${settled ? " settled" : ""}`}
                onTransitionEnd={(e) => {
                  if (e.propertyName === "transform" && opened) setSettled(true);
                }}
              >
                <div className="letter-paper">
                  <span className="letter-fold" style={{ top: "33.333%" }} aria-hidden="true" />
                  <span className="letter-fold" style={{ top: "66.666%" }} aria-hidden="true" />
                  <div className="letter-inner">
                    <p className="letter-title">YOU HAVE BEEN INVITED TO CYBERFLIX 2K26</p>
                    <p className="letter-tagline">A realm where magic meets technology…</p>
                    <div className="letter-rule" />
                    <div className="letter-verses">
                      <p className="letter-line">Your quest awaits.</p>
                      <p className="letter-line">Decode the mysteries.</p>
                      <p className="letter-line">Build the impossible.</p>
                      <p className="letter-line">Create the magic.</p>
                    </div>
                    <div className="letter-rule" />
                    <p className="letter-close" style={{ color: paperInk(ARC) }}>THE MAGIC IS CALLING. WILL YOU ANSWER?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THE ZONE DOCUMENTS, SPLIT INTO LEAVES
   Each zone's document is an ordered array of pages. The book in
   the parchment modal turns one leaf at a time; nothing from these
   documents appears on the front page.
═══════════════════════════════════════════════════════════════ */
function zone1APages(z, ink) {
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

function zone1BPages(z, ink) {
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

function zone2APages(z, ink) {
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
          <div className="crystal-row">
            {HOUSES_2A.map((c, i) => (
              <div key={c.house} className="crystal-cell" style={{ "--c": c.hex, animation: `pmLift .6s cubic-bezier(0.2,0.8,0.3,1) ${i * 0.09}s both` }}>
                <CrystalArt color={c.hex} delay={i * 0.4} />
                <div className="crystal-name">{c.house}</div>
                <div className="crystal-meta">Champion of {c.master}</div>
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

function zone2BPages(z, ink) {
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

function zone3APages(z, ink) {
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

function zone3BPages(z, ink) {
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
          <div className="mini-label" style={{ color: ink(z.ab) }}>Your A1 Research Poster Must Include</div>
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
   THE PARCHMENT MODAL
   The full zone document, re-inked onto a torn watercolour sheet.
   The paper is drawn entirely in CSS: aged wash gradients, a linen
   weave, foxing stains, and a turbulence-displaced edge so no two
   sides tear the same way.
═══════════════════════════════════════════════════════════════ */
function TornPaperDefs() {
  return (
    <svg className="pm-defs" aria-hidden="true" focusable="false">
      <filter id="cb-torn-edge" x="-8%" y="-4%" width="116%" height="108%">
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.021" numOctaves="4" seed="17" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="17" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

function ZoneBook({ zone, onClose }) {
  const ink = useInk();
  const pages = useMemo(() => ZONE_PAGES[zone.id](zone, ink), [zone, ink]);
  const total = pages.length + 1;               // +1 for the title leaf
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState(null);       // { from, dir }
  const leafRef = useRef(null);
  const busy = useRef(false);

  const goTo = useCallback(
    (next) => {
      if (busy.current) return;
      const target = Math.max(0, Math.min(total - 1, next));
      setPage((cur) => {
        if (target === cur) return cur;
        busy.current = true;
        setTurn({ from: cur, dir: target > cur ? 1 : -1 });
        window.setTimeout(() => {
          setTurn(null);
          busy.current = false;
        }, 640);
        return target;
      });
    },
    [total]
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

  const cover = (
    <div className="pm-cover">
      <div className="pm-kicker">CyberFlix 2K26 · Enter the Wizarding World of Technology</div>
      <div className="pm-glyph"><Glyph type={zone.glyph} color={paperInk(zone.a)} size={44} /></div>
      <div className="pm-code">{zone.code}</div>
      <h2 className="pm-title">{zone.name}</h2>
      <div className="pm-meta">{zone.meta.join("  ·  ")}</div>
      <p className="pm-blurb">{zone.blurb}</p>
      <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
        <RegisterButton zone={zone} className="wood-btn wood-btn-lg">
          Register Now
        </RegisterButton>
      </div>
      <div className="pm-rule" />
      <div className="pm-contents">
        <div className="pm-contents-label">Contents</div>
        <ol>
          {pages.map((pg, i) => (
            <li key={i}>
              <button type="button" onClick={() => goTo(i + 1)}>
                <span className="pm-c-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="pm-c-title">{pg.t}</span>
                <span className="pm-c-dots" />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );

  const leafFor = (i) => (i === 0 ? cover : pages[i - 1].el);
  const labelFor = (i) => (i === 0 ? "Title Page" : pages[i - 1].t);

  return (
    <>
      <div className="pm-runner">
        <span>{zone.code}</span>
        <span className="pm-runner-title">{labelFor(page)}</span>
        <RegisterButton zone={zone} className="wood-btn wood-btn-sm">
          Register Now
        </RegisterButton>
      </div>

      <div className="pm-stage">
        <div ref={leafRef} className="pm-leaf" key={page} data-dir={turn ? turn.dir : 0}>
          {leafFor(page)}
        </div>

        {turn && (
          <div className={`pm-leaf pm-turning ${turn.dir > 0 ? "fwd" : "back"}`} aria-hidden="true">
            <div className="pm-turning-face">{leafFor(turn.from)}</div>
            <div className="pm-turning-shade" />
          </div>
        )}
      </div>

      <nav className="pm-nav">
        <button type="button" className="pm-arrow" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Previous page">
          ‹ <span>Previous</span>
        </button>

        <div className="pm-pips" role="group" aria-label="Go to page">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`pm-pip${i === page ? " on" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Page ${i + 1}: ${labelFor(i)}`}
              aria-current={i === page ? "page" : undefined}
            />
          ))}
        </div>

        <div className="pm-folio">{page + 1} / {total}</div>

        <button type="button" className="pm-arrow" onClick={() => goTo(page + 1)} disabled={page === total - 1} aria-label="Next page">
          <span>Next</span> ›
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
    <div className="pm-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${zone.code} — ${zone.name}`}>
      <TornPaperDefs />
      <div className="pm-shell" onClick={(e) => e.stopPropagation()}>
        <div className="pm-paper" aria-hidden="true" />
        <button ref={closeRef} type="button" className="pm-close" onClick={onClose} aria-label="Close the document">✕</button>
        <SkinProvider skin={PAPER_SKIN} className="pm-body">
          <ZoneBook key={zone.id} zone={zone} onClose={onClose} />
        </SkinProvider>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CLOSING — THE MASTER OF INNOVATION AWAITS
═══════════════════════════════════════════════════════════════ */
function ClosingScene() {
  const [ref, inView] = useInView(0.25);
  return (
    <section style={{ position: "relative", overflow: "hidden", contentVisibility: "auto", containIntrinsicSize: "900px", padding: "130px 24px 140px", textAlign: "center" }}>
      <img
        src={assets.Event1}
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}
      />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 70% at 50% 0%, rgba(109,75,208,0.14), transparent 60%), linear-gradient(180deg, rgba(9,11,22,0.72) 0%, rgba(4,3,10,0.88) 55%, #04030a 100%)` }} />
      <Layer z={0}><Stars count={44} /></Layer>
      <Layer z={0}><SparkDust count={18} /></Layer>
      <CircuitCreep side="top" reach={30} opacity={0.6} />
      <div ref={ref} style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 4, opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(20px)", transition: "opacity .9s ease, transform .9s ease" }}>
        <SectionHead
          eyebrow="✶ The Master of Innovation Awaits"
          title="Are You Ready to Enter the Wizarding World?"
          desc="CyberFlix is more than a competition. It is a journey through robotics, electronics, engineering, creativity, problem-solving, teamwork and innovation. Every zone tells a different story. Every mission demands a different skill. Every participant has a chance to become the Master of Innovation."
        />
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 18, color: MUTED, lineHeight: 1.8, marginBottom: 8 }}>
          Choose your zone. Prepare your strategy. Master your technology. Complete your mission.
        </p>
        <div style={{ display: "flex", justifyContent: "center", margin: "26px 0 18px" }}><WaxSeal size={58} /></div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(22px,4vw,34px)", color: GOLD, letterSpacing: 1 }}>
          CYBERFLIX 2K26
        </div>
        <div style={{ fontFamily: "'Cormorant SC',serif", fontSize: 13, letterSpacing: 4, color: CYAN_HI, marginTop: 8 }}>
          MASTER OF INNOVATION
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE — INTERACTIVE EXPERIENCE ZONES
   The three carnival attractions that live outside the six
   competition zones — the Simulation Theatre, the Drone Show and
   the Robot Interaction Zone.
═══════════════════════════════════════════════════════════════ */
function ExperienceCard({ z, idx, photo }) {
  const [ref, inView] = useInView();
  const ink = useInk();
  const hi = ink(z.hi);
  return (
    <div
      ref={ref}
      className="exp-card"
      style={{
        "--c": hi,
        border: `1px solid ${z.hex}55`,
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(24px)",
        transition: `opacity .65s ease ${idx * 0.1}s, transform .65s ease ${idx * 0.1}s, border-color .3s, box-shadow .3s`,
      }}
    >
      {photo && (
        <div className="exp-photo">
          <img src={photo} alt="" />
        </div>
      )}
      <h3 className="exp-name">{z.name}</h3>
      <p className="exp-blurb">{z.blurb}</p>
    </div>
  );
}

function ExperienceZonesScene() {
  const photos = [assets.Theatre, assets.Edrone, assets.Roboshow];
  return (
    <Scene id="experiences" style={{ background: INK_3, padding: "110px 24px" }}>
      <Layer z={0}><Stars count={26} /></Layer>
      <Layer z={1}>
        <Wisp x={7} y={22} s={0.7} delay={0.6} hue={CYAN_HI} />
        <Wisp x={92} y={68} s={0.6} delay={2.1} hue={ARC_HI} dim />
      </Layer>
      <CircuitCreep side="bottom" reach={26} />
      <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 4 }}>
        <SectionHead
          eyebrow="✶ Beyond the Zones"
          title="Interactive Experience Zones"
          desc="Between missions, step outside the competition arenas and into a trio of immersive experiences built for every visitor to CyberFlix 2K26."
        />
        <div className="exp-grid">
          {EXPERIENCE_ZONES.map((z, i) => <ExperienceCard key={z.id} z={z} idx={i} photo={photos[i]} />)}
        </div>
      </div>
    </Scene>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE — FREQUENTLY ASKED QUESTIONS
   A tabbed, accordion scroll of scrolls: four categories, each
   opening one question at a time.
═══════════════════════════════════════════════════════════════ */
function FAQAccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className={`faq-item${isOpen ? " open" : ""}`}>
      <button type="button" className="faq-q" onClick={onToggle} aria-expanded={isOpen}>
        <span>{item.q}</span>
        <span className="faq-plus" aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      <div className="faq-a-wrap">
        <p className="faq-a">{item.a}</p>
      </div>
    </div>
  );
}

function FAQScene() {
  const [active, setActive] = useState("about");
  const [openIdx, setOpenIdx] = useState(0);
  const cat = FAQ_CATEGORIES.find((c) => c.id === active) || FAQ_CATEGORIES[0];

  return (
    <Scene id="faq" style={{ background: INK_2, padding: "110px 24px 120px" }}>
      <Layer z={0}><Stars count={24} /></Layer>
      <Layer z={0}><RuneDrift count={6} /></Layer>
      <CircuitCreep side="top" reach={24} />
      <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 4 }}>
        <SectionHead
          eyebrow="✶ Ancient Scrolls of Knowledge"
          title="Frequently Asked Questions"
          desc="Everything a wizard-in-training needs to know before entering the arena."
        />
        <div className="faq-tabs" role="tablist" aria-label="FAQ categories">
          {FAQ_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active === c.id}
              className={`faq-tab${active === c.id ? " on" : ""}`}
              onClick={() => { setActive(c.id); setOpenIdx(0); }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="faq-list">
          {cat.items.map((item, i) => (
            <FAQAccordionItem
              key={`${active}-${i}`}
              item={item}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </Scene>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AMBIENT SCORE
   Plays the theme on load and loops it for the whole visit. Most
   browsers block unmuted autoplay until the visitor has interacted
   with the page at least once — so this tries immediately, and if
   that's blocked, quietly retries on the visitor's first tap, click
   or keypress. A small toggle (bottom-right, above everything else)
   lets them mute at any time; the choice isn't otherwise persisted.
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
        className="score-toggle"
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
   ROOT
═══════════════════════════════════════════════════════════════ */
export default function CyberFlixCarnival() {
  const [openZone, setOpenZone] = useState(null);
  const closeZone = useCallback(() => setOpenZone(null), []);
  return (
    <SkinProvider skin={DARK_SKIN} style={{ fontFamily: "'Cormorant Garamond',serif", background: INK, color: PARCH, overflowX: "hidden", position: "relative" }}>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nabla&family=Playfair+Display+SC:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=MedievalSharp&family=Grenze+Gotisch:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+SC:wght@500;600;700&family=Tangerine:wght@700&display=swap');
          *{margin:0;padding:0;box-sizing:border-box;}
          html{scroll-behavior:smooth;}
          ::selection{background:rgba(109,75,208,0.4);}
          a{color:inherit;}
          :focus-visible{outline:2px solid ${CYAN_HI};outline-offset:3px;border-radius:4px;}

          /* Self-hosted wizarding-style font slot — see the commented
             import near the top of the file. Once that import is live,
             uncomment this @font-face too (point src at the same file)
             and 'HP Display' will take over every heading automatically.
          @font-face{
            font-family:'HP Display';
            src:url('./assets/fonts/hp-display.woff2') format('woff2');
            font-display:swap;
          }
          */
          :root{
            --font-display:'Playfair Display SC','HP Display','MedievalSharp','Grenze Gotisch',serif;
            --font-nabla:'Nabla', var(--font-display);
          }

          /* ── Hero content: guaranteed clearance below the site navbar ──
             Desktop keeps the balanced vertical centering (a centered flex
             box only shifts down by HALF of whatever top padding you give
             it). Mobile switches to a fixed top offset instead — with
             justify-content:flex-start the padding is the exact distance
             from the top, so "CYBERFLIX" can never slide back up under a
             fixed navbar the way it could with pure centering. If content
             runs long on a short phone screen, this section scrolls
             internally rather than clipping. */
          .hero-inner{
            padding: clamp(72px,11vh,130px) 24px 0;
            justify-content: center;
          }
          @media (max-width:700px){
            .hero-inner{
              padding-top: 104px;
              padding-bottom: 28px;
              justify-content: flex-start;
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
            }
          }

          @keyframes twinkle{0%,100%{opacity:0.22;transform:scale(1);}50%{opacity:1;transform:scale(1.45);}}
          @keyframes moteDrift{0%,100%{transform:translate(0,0);opacity:0.18;}50%{transform:translate(7px,-11px);opacity:0.6;}}
          @keyframes wispPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.16);opacity:0.8;}}
          @keyframes wispFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-13px);}}
          @keyframes hintDip{0%,100%{transform:rotate(45deg) translate(0,0);}50%{transform:rotate(45deg) translate(4px,4px);}}
          @keyframes runeGlow{0%,100%{opacity:0;transform:translateY(0);}50%{opacity:0.3;transform:translateY(-16px);}}
          @keyframes sealPulse{0%,100%{filter:drop-shadow(0 0 0 rgba(109,75,208,0));}50%{filter:drop-shadow(0 0 12px rgba(109,75,208,0.55));}}
          @keyframes snowFall{0%{transform:translate(0,0);opacity:0;}10%{opacity:0.9;}100%{transform:translate(var(--dx,20px),115vh);opacity:0.3;}}
          @keyframes sealHalo{0%,100%{opacity:0.55;transform:scale(0.94);}50%{opacity:1;transform:scale(1.08);}}
          @keyframes envShine{0%{left:-60%;opacity:0;}8%{opacity:0.9;}35%{left:130%;opacity:0;}100%{left:130%;opacity:0;}}
          @keyframes hintFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}

          /* ── Zone index: grouped by grade tier ────────────── */
          .tier-stack{display:flex;flex-direction:column;gap:56px;}
          .tier-head{display:flex;align-items:center;gap:18px;margin-bottom:22px;}
          .tier-num{font-family:var(--font-display);font-weight:700;font-size:34px;color:var(--gc);opacity:0.85;line-height:1;}
          .tier-text{display:flex;flex-direction:column;gap:2px;}
          .tier-label{font-family:'Cormorant SC',serif;font-size:12px;font-weight:700;letter-spacing:2.6px;text-transform:uppercase;color:var(--gc);}
          .tier-range{font-family:var(--font-display);font-weight:600;font-size:22px;color:${PARCH};letter-spacing:0.4px;}
          .tier-line{flex:1;height:1px;background:linear-gradient(90deg,var(--gc),transparent);opacity:0.5;}
          .tier-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;}
          @media (max-width:760px){.tier-grid{grid-template-columns:1fr !important;}}
          .grade-badge{align-self:flex-start;font-family:'Cormorant SC',serif;font-size:10.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gc);border:1px solid color-mix(in srgb,var(--gc) 55%,transparent);background:color-mix(in srgb,var(--gc) 12%,transparent);border-radius:100px;padding:5px 13px;margin-bottom:14px;}
          @supports not (color:color-mix(in srgb,red,blue)){.grade-badge{border-color:rgba(143,227,242,0.4);background:rgba(143,227,242,0.1);}}
          .zone-card{position:relative;border-radius:14px;overflow:hidden;min-height:500px;isolation:isolate;}
          .zone-card-bg{position:absolute;inset:0;z-index:0;}
          .zone-card-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease;}
          .zone-card:hover .zone-card-photo{transform:scale(1.04);}
          .zone-card-scrim{position:absolute;inset:0;background:linear-gradient(180deg, rgba(5,6,13,0.5) 0%, rgba(5,6,13,0.58) 38%, rgba(10,11,22,0.86) 72%, ${INK_3} 100%);}
          .zone-card-body{position:relative;z-index:2;display:flex;flex-direction:column;height:100%;padding:30px 26px 24px;}
          .zone-card:hover{border-color:var(--hc) !important;box-shadow:0 16px 52px -12px var(--hc);}
          .card-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:auto;padding-top:20px;}
          .card-btn{font-family:'Cormorant SC',serif;font-size:11.5px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:${INK};background:var(--c);border:none;border-radius:100px;padding:11px 20px;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease,filter .2s ease;}
          .card-btn:hover{transform:translateY(-1px);filter:brightness(1.08);box-shadow:0 8px 22px -8px var(--c);}
          .card-btn:active{transform:translateY(0);}
          .card-btn-outline{display:inline-flex;align-items:center;gap:7px;font-family:'Cormorant SC',serif;font-size:11.5px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:var(--c);background:transparent;border:1px solid color-mix(in srgb,var(--c) 55%,transparent);border-radius:100px;padding:10px 19px;cursor:pointer;text-decoration:none;transition:transform .2s ease,background .2s ease,color .2s ease,box-shadow .2s ease;}
          @supports not (color:color-mix(in srgb,red,blue)){.card-btn-outline{border-color:rgba(143,227,242,0.5);}}
          .card-btn-outline:hover{background:var(--c);color:${INK};transform:translateY(-1px);box-shadow:0 8px 22px -8px var(--c);}
          .card-btn-outline:active{transform:translateY(0);}
          .card-hint{font-family:'Cormorant SC',serif;font-size:10.5px;letter-spacing:2.2px;color:${DIM};}

          /* ── Invitation section: the sealed envelope ──────── */
          .env-stage{display:flex;flex-direction:column;align-items:center;width:100%;}
          .env-cover{display:grid;grid-template-rows:1fr;width:100%;transition:grid-template-rows .55s ease 1.05s;}
          .env-cover.collapsed{grid-template-rows:0fr;}
          .env-cover-inner{overflow:hidden;min-height:0;display:flex;flex-direction:column;align-items:center;}
          .envelope{position:relative;width:min(480px,92vw);height:288px;margin:0 auto;cursor:pointer;perspective:1400px;
            transition:transform .4s ease, opacity .6s ease .5s;}
          .envelope:not(.is-open):hover{transform:translateY(-6px) rotate(-1.2deg) scale(1.015);}
          .envelope:not(.is-open):active{transform:translateY(-1px);}
          .envelope.is-open{opacity:0;transform:translateY(-14px) scale(0.97);pointer-events:none;}
          .env-pocket{position:absolute;inset:0;border-radius:10px;z-index:1;overflow:hidden;
            background:linear-gradient(160deg,#e6d6ac 0%,#cdb480 45%,#a68a58 100%);
            box-shadow:0 26px 60px -22px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(94,68,40,0.35);}
          .env-pocket::before{content:"";position:absolute;inset:0;opacity:0.5;mix-blend-mode:multiply;pointer-events:none;
            background:repeating-linear-gradient(0deg,rgba(122,88,52,0.06) 0 1px,transparent 1px 4px),
                       repeating-linear-gradient(90deg,rgba(122,88,52,0.06) 0 1px,transparent 1px 4px);}
          .env-pocket::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0.65;
            background:linear-gradient(115deg, transparent 47%, rgba(94,68,40,0.2) 49%, transparent 52%),
                       linear-gradient(245deg, transparent 47%, rgba(94,68,40,0.2) 49%, transparent 52%);}
          .env-stamp{position:absolute;top:14px;right:16px;z-index:5;width:42px;height:52px;border-radius:3px;
            border:1px dashed rgba(47,74,51,0.55);background:rgba(255,250,238,0.32);
            display:flex;align-items:center;justify-content:center;
            font-family:'Cormorant SC',serif;font-size:16px;color:${GOLD};}
          .env-address{position:absolute;left:0;right:0;top:60%;z-index:2;text-align:center;padding:0 32px;
            transition:opacity .35s ease;}
          .envelope.is-open .env-address{opacity:0;}
          .env-kicker{font-family:'Cormorant SC',serif;font-size:10.5px;letter-spacing:2.6px;color:#3f5c3f;opacity:0.8;margin-bottom:7px;}
          .env-to{font-family:'Tangerine',cursive;font-weight:700;font-size:clamp(24px,4.2vw,32px);line-height:1;color:#26401f;}
          .env-name{font-family:'Tangerine',cursive;font-weight:700;font-size:clamp(29px,5.2vw,39px);line-height:1.18;color:#1c331a;}
          .env-loc{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12.5px;color:#4c3b2a;opacity:0.75;margin-top:5px;}
          .env-flap{position:absolute;top:0;left:0;right:0;height:58%;z-index:3;
            clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:50% 0%;transform:rotateX(0deg);
            transform-style:preserve-3d;backface-visibility:hidden;
            background:linear-gradient(160deg,#f0e0b8 0%,#d8bf90 55%,#a98a55 100%);
            box-shadow:inset 0 -16px 22px -16px rgba(94,68,40,0.4);
            transition:transform .7s cubic-bezier(0.45,0.05,0.25,1) .2s;}
          .env-flap-sheen{position:absolute;inset:0;opacity:0.5;mix-blend-mode:overlay;pointer-events:none;
            background:repeating-linear-gradient(77deg, rgba(255,246,224,0.22) 0 2px, transparent 2px 8px, rgba(50,32,14,0.16) 8px 10px, transparent 10px 16px);}
          .envelope.is-open .env-flap{transform:rotateX(-160deg);}
          .env-seal{position:absolute;top:calc(58% - 32px);left:50%;z-index:4;
            transform:translate(-50%,0) scale(1) rotate(0deg);
            filter:drop-shadow(0 8px 14px rgba(0,0,0,0.4));
            transition:transform .5s cubic-bezier(0.4,0,0.2,1), opacity .45s ease;}
          .envelope.is-open .env-seal{transform:translate(-50%,-10px) scale(0.35) rotate(35deg);opacity:0;}
          .env-cta{display:block;margin:26px auto 0;}

          /* Sit up and beg to be opened: a bouncing hint, a pulsing glow
             halo, a slow idle float, a shimmer that sweeps the paper, and
             a few sparks winking around the wax seal. All idle motion —
             none of it fires once the letter has been opened. */
          .env-hint{font-family:'Cormorant SC',serif;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${GOLD};margin-bottom:16px;opacity:0.92;animation:hintFloat 2s ease-in-out infinite;}
          .envelope-idle{position:relative;animation:wispFloat 6s ease-in-out infinite;}
          .env-halo{position:absolute;inset:-9% -8%;border-radius:26px;background:radial-gradient(ellipse at center, rgba(217,180,95,0.32) 0%, rgba(109,75,208,0.24) 48%, transparent 76%);filter:blur(20px);animation:sealHalo 3.6s ease-in-out infinite;pointer-events:none;z-index:0;}
          .env-shine{position:absolute;top:-40%;left:-60%;width:38%;height:180%;background:linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.16) 55%, transparent 100%);transform:rotate(18deg);animation:envShine 4.6s ease-in-out infinite;pointer-events:none;}
          .env-seal .env-spark{position:absolute;width:5px;height:5px;border-radius:50%;background:#fff8e6;box-shadow:0 0 7px 2px rgba(255,244,214,0.85);pointer-events:none;animation:twinkle 2.4s ease-in-out infinite;}
          .env-spark-a{top:-6px;left:6px;animation-delay:0s;}
          .env-spark-b{top:16px;left:56px;animation-delay:0.8s;}
          .env-spark-c{top:50px;left:2px;animation-delay:1.5s;}
          .env-seal::before{content:"";position:absolute;inset:-14px;border-radius:50%;background:radial-gradient(circle, rgba(217,180,95,0.38), rgba(109,75,208,0.26) 55%, transparent 75%);filter:blur(6px);z-index:-1;animation:sealHalo 3.2s ease-in-out infinite;}

          .env-letter-wrap{display:grid;grid-template-rows:0fr;width:100%;margin-top:0;
            transition:grid-template-rows 1s cubic-bezier(0.22,0.68,0.24,1) .55s, margin-top .7s ease .4s;}
          .env-letter-wrap.show{grid-template-rows:1fr;margin-top:38px;}
          .env-letter-wrap > .letter-collapse{overflow:hidden;min-height:0;}

          /* ── Invitation section: the letter card ──────────── */
          /* No dowels, no unrolling — the message is printed straight onto
             a flat folded sheet that appears the instant the seal breaks,
             as if it had been read the moment it was pulled from the
             envelope. Two crease lines are all that hint it was folded. */
          .letter-card{max-width:620px;margin:0 auto;position:relative;
            opacity:0;transform:translateY(26px) scale(0.94) rotateX(-6deg);transform-origin:top center;
            filter:drop-shadow(0 26px 56px rgba(0,0,0,0.5));
            transition:opacity .85s cubic-bezier(0.22,0.68,0.24,1) .7s, transform .85s cubic-bezier(0.22,0.68,0.24,1) .7s;}
          .letter-card.show{opacity:1;transform:translateY(0) scale(1) rotateX(0deg);}
          .letter-card.settled{animation:letterSettle .6s cubic-bezier(0.3,1.2,0.4,1) both;}
          .letter-paper{position:relative;border-radius:9px;overflow:hidden;
            background:linear-gradient(165deg, ${BONE} 0%, ${BONE_D} 100%);}
          .letter-paper::before{content:"";position:absolute;inset:0;opacity:0.45;mix-blend-mode:multiply;pointer-events:none;
            background:repeating-linear-gradient(0deg, rgba(122,88,52,0.06) 0 1px, transparent 1px 4px),
                       repeating-linear-gradient(90deg, rgba(122,88,52,0.06) 0 1px, transparent 1px 4px);}
          .letter-paper::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 50px rgba(58,38,18,0.24);}
          .letter-fold{position:absolute;left:0;right:0;height:1px;pointer-events:none;
            background:linear-gradient(90deg,transparent 4%,rgba(94,68,40,0.3) 50%,transparent 96%);}
          .letter-inner{position:relative;padding:44px clamp(26px,6vw,58px) 40px;text-align:center;}
          .letter-title{font-family:var(--font-display);font-weight:700;font-size:clamp(22px,3.8vw,33px);color:#2f2419;letter-spacing:0.6px;line-height:1.28;}
          .letter-tagline{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(15.5px,2.1vw,18.5px);color:#4c3b2a;margin-top:10px;}
          .letter-rule{width:130px;height:1px;margin:20px auto;background:linear-gradient(90deg,transparent,rgba(94,68,40,0.55),transparent);}
          .letter-verses{display:flex;flex-direction:column;gap:2px;}
          .letter-line{font-family:'Tangerine',cursive;font-size:clamp(27px,4.4vw,38px);line-height:1.4;color:#2f2419;}
          .letter-close{font-family:var(--font-display);font-weight:700;font-size:clamp(19px,3.2vw,28px);letter-spacing:1.2px;margin-top:6px;}
          @keyframes letterSettle{
            0%{transform:translateY(-5px) scale(0.994);}
            50%{transform:translateY(3px) scale(1.006);}
            100%{transform:translateY(0) scale(1);}
          }
          .relic-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:920px;margin:44px auto 0;}
          @media (max-width:700px){.relic-strip{grid-template-columns:1fr;max-width:420px;}}
          .relic-card{border-radius:12px;overflow:hidden;border:1px solid rgba(120,128,150,0.28);background:${INK_3};box-shadow:0 20px 46px -18px rgba(0,0,0,0.7);transition:transform .3s ease,border-color .3s ease;}
          .relic-card:hover{transform:translateY(-4px);border-color:rgba(185,166,245,0.5);}
          .relic-card img{width:100%;height:190px;object-fit:cover;display:block;}
          .relic-card figcaption{font-family:'Cormorant SC',serif;font-size:11px;letter-spacing:2.2px;text-transform:uppercase;color:${ARC_HI};text-align:center;padding:12px 10px;}

          /* ── Interactive experience zones ─────────────────── */
          .exp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
          @media (max-width:860px){.exp-grid{grid-template-columns:1fr !important;}}
          .exp-card{border-radius:14px;overflow:hidden;text-align:center;transition:border-color .3s ease,box-shadow .3s ease,transform .3s ease;background:linear-gradient(170deg, ${INK_4} 0%, ${INK_3} 100%);}
          .exp-card:hover{transform:translateY(-4px);box-shadow:0 18px 48px -18px var(--c);}
          .exp-photo{width:100%;height:150px;overflow:hidden;}
          .exp-photo img{width:100%;height:100%;object-fit:cover;display:block;}
          .exp-name{font-family:var(--font-display);font-weight:600;font-size:22px;color:${PARCH};margin:24px 0 10px;letter-spacing:0.4px;padding:0 22px;}
          .exp-blurb{font-family:'Cormorant Garamond',serif;font-size:15.5px;line-height:1.75;color:${MUTED};padding:0 26px 28px;}

          /* ── Owl Post: event brief ticket + prize stakes ──── */
          .brief-ticket{position:relative;display:grid;grid-template-columns:repeat(4,1fr);background:${INK_3};border:1px solid rgba(217,180,95,0.3);border-radius:14px;overflow:hidden;margin:0 auto 34px;box-shadow:0 24px 60px -30px rgba(0,0,0,0.8);}
          @media (max-width:760px){.brief-ticket{grid-template-columns:repeat(2,1fr);}}
          .brief-fact{position:relative;padding:22px 20px;text-align:center;}
          .brief-fact + .brief-fact::before{content:"";position:absolute;left:0;top:14px;bottom:14px;border-left:1px dashed rgba(217,180,95,0.3);}
          .brief-fact-label{font-family:'Cormorant SC',serif;font-size:12px;font-weight:700;letter-spacing:2.6px;color:${CYAN_HI};text-transform:uppercase;margin-bottom:9px;}
          .brief-fact-value{font-family:'Cormorant Garamond',serif;font-size:18px;line-height:1.5;color:${PARCH};}
          .stake-row{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;max-width:760px;margin:0 auto;}
          @media (max-width:700px){.stake-row{grid-template-columns:1fr;}}
          .stake-card{position:relative;overflow:hidden;text-align:center;border:1px solid color-mix(in srgb,var(--c) 38%,transparent);border-radius:16px;background:linear-gradient(170deg, ${INK_4} 0%, ${INK_3} 100%);padding:32px 26px 28px;}
          @supports not (color:color-mix(in srgb,red,blue)){.stake-card{border-color:rgba(217,180,95,0.32);}}
          .stake-rune{position:absolute;top:-6px;right:6px;font-family:serif;font-size:70px;line-height:1;color:var(--c);opacity:0.08;pointer-events:none;}
          .stake-glow{position:absolute;top:-46%;left:50%;transform:translateX(-50%);width:78%;height:78%;border-radius:50%;background:radial-gradient(circle, var(--c), transparent 72%);opacity:0.2;filter:blur(28px);pointer-events:none;}
          .stake-tag{position:relative;font-family:'Cormorant SC',serif;font-size:11.5px;font-weight:700;letter-spacing:3px;color:${MUTED};text-transform:uppercase;}
          .stake-num{position:relative;font-family:var(--font-display);font-weight:800;font-size:clamp(32px,5.4vw,50px);color:var(--c);letter-spacing:0.5px;margin-top:8px;text-shadow:0 0 28px color-mix(in srgb,var(--c) 45%,transparent);}
          @supports not (color:color-mix(in srgb,red,blue)){.stake-num{text-shadow:0 0 28px rgba(217,180,95,0.4);}}
          .stake-line{position:relative;font-family:'Cormorant SC',serif;font-size:12.5px;font-weight:700;letter-spacing:2.6px;color:var(--c);text-transform:uppercase;margin-top:10px;}

          /* ── FAQ accordion ─────────────────────────────────── */
          .faq-tabs{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:32px;}
          .faq-tab{font-family:'Cormorant SC',serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED};background:transparent;border:1px solid rgba(120,128,150,0.32);border-radius:100px;padding:10px 20px;cursor:pointer;transition:color .2s ease,border-color .2s ease,background .2s ease,transform .2s ease;}
          .faq-tab:hover{color:${PARCH};border-color:${CYAN_HI}99;transform:translateY(-1px);}
          .faq-tab.on{color:${INK};background:${CYAN_HI};border-color:${CYAN_HI};}
          .faq-list{display:flex;flex-direction:column;gap:12px;}
          .faq-item{border:1px solid rgba(120,128,150,0.22);border-radius:12px;background:rgba(0,0,0,0.24);overflow:hidden;transition:border-color .25s ease;}
          .faq-item.open{border-color:${ARC_HI}77;}
          .faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;text-align:left;background:none;border:none;cursor:pointer;padding:18px 22px;font-family:var(--font-display);font-weight:500;font-size:16.5px;color:${PARCH};}
          .faq-plus{flex:none;font-family:'Cormorant Garamond',serif;font-size:22px;color:${ARC_HI};line-height:1;}
          .faq-a-wrap{max-height:0;overflow:hidden;transition:max-height .4s ease;}
          .faq-item.open .faq-a-wrap{max-height:600px;}
          .faq-a{font-family:'Cormorant Garamond',serif;font-size:15.5px;line-height:1.75;color:${MUTED};padding:0 22px 20px;}

          /* ── Blocks & text ───────────────────────────────── */
          .blk-sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16.5px;color:var(--ink-dim);margin-top:8px;max-width:760px;line-height:1.7;}
          .mini-label{font-family:'Cormorant SC',serif;font-size:11.5px;font-weight:700;letter-spacing:2.6px;margin-bottom:10px;}

          .dot-list,.num-list{list-style:none;display:flex;flex-direction:column;gap:11px;}
          .dot-list li,.num-list li{font-family:'Cormorant Garamond',serif;font-size:16.5px;line-height:1.7;color:var(--ink-body);padding-left:22px;position:relative;break-inside:avoid;-webkit-column-break-inside:avoid;}
          .dot-list li::before{content:"";position:absolute;left:4px;top:11px;width:6px;height:6px;border-radius:50%;background:var(--mk);box-shadow:0 0 8px var(--mk);}
          .num-list{counter-reset:n;}
          .num-list li{padding-left:32px;}
          .num-list li::before{counter-increment:n;content:counter(n,decimal-leading-zero);position:absolute;left:0;top:2px;font-family:'Cormorant SC',serif;font-size:12px;letter-spacing:1px;color:var(--mk);opacity:0.85;}

          /* ── Tables ──────────────────────────────────────── */
          .tbl-wrap{overflow-x:auto;border:1px solid var(--ink-line);border-radius:12px;background:var(--ink-surface);}
          .tbl{width:100%;border-collapse:collapse;min-width:420px;}
          .tbl th{font-family:'Cormorant SC',serif;font-size:11.5px;font-weight:700;letter-spacing:2.4px;color:var(--acc);padding:14px 16px;border-bottom:1px solid var(--ink-line);white-space:nowrap;background:var(--ink-surface-hi);}
          .tbl td{font-family:'Cormorant Garamond',serif;font-size:16px;line-height:1.6;padding:12px 16px;border-top:1px solid var(--ink-line-soft);vertical-align:top;}
          .tbl tbody tr:hover td{background:var(--ink-surface-hi);}

          /* ── Chips, panels, cards ────────────────────────── */
          .chip{font-family:'Cormorant SC',serif;font-size:11.5px;font-weight:600;letter-spacing:2px;color:var(--c);border:1px solid color-mix(in srgb,var(--c) 42%,transparent);background:color-mix(in srgb,var(--c) 9%,transparent);border-radius:100px;padding:7px 15px;white-space:nowrap;}
          @supports not (color:color-mix(in srgb,red,blue)){.chip{border-color:rgba(143,227,242,0.35);background:rgba(143,227,242,0.08);}}

          .auto-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(var(--min,260px),1fr));gap:20px;}
          .panel{border:1px solid var(--ink-line);border-left:2px solid var(--c);border-radius:0 12px 12px 0;background:var(--ink-surface);padding:20px 22px;}
          .panel-title{font-family:var(--font-display);font-size:19px;color:var(--ink-text);margin-bottom:12px;letter-spacing:0.4px;}

          .detail-card{border:1px solid var(--ink-line);border-radius:14px;background:var(--ink-card);padding:24px 24px 22px;position:relative;overflow:hidden;}
          .detail-card:hover{border-color:color-mix(in srgb,var(--c) 55%,transparent);box-shadow:0 14px 44px -18px var(--c);}
          @supports not (color:color-mix(in srgb,red,blue)){.detail-card:hover{border-color:rgba(143,227,242,0.4);}}

          .link-list{list-style:none;display:flex;flex-direction:column;gap:9px;}
          .link-list a{font-family:'Cormorant Garamond',serif;font-size:15.5px;color:var(--c);text-decoration:none;border-bottom:1px dotted color-mix(in srgb,var(--c) 50%,transparent);word-break:break-all;}
          .link-list a:hover{color:var(--ink-text);}

          /* ── Zone-specific pieces ────────────────────────── */
          .crystal-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
          @media (max-width:720px){.crystal-row{grid-template-columns:repeat(2,1fr) !important;}}
          .crystal-cell{text-align:center;border:1px solid var(--ink-line);border-radius:14px;background:var(--ink-surface);padding:22px 12px 18px;box-shadow:inset 0 0 44px color-mix(in srgb,var(--c) 10%,transparent);}
          .crystal-name{font-family:var(--font-display);font-size:20px;color:var(--ink-text);margin-top:10px;}
          .crystal-meta{font-family:'Cormorant SC',serif;font-size:10.5px;letter-spacing:2px;color:var(--c);margin-top:5px;}

          .pit-swatch{display:inline-flex;align-items:center;gap:9px;font-family:'Cormorant SC',serif;font-size:12px;letter-spacing:2px;color:var(--ink-body);border:1px solid var(--ink-line);border-radius:100px;padding:8px 16px;}
          .pit-dot{width:12px;height:12px;border-radius:50%;background:var(--c);box-shadow:0 0 12px var(--c);}

          .toc{list-style:none;counter-reset:t;display:grid;grid-template-columns:repeat(2,1fr);gap:10px 26px;}
          @media (max-width:640px){.toc{grid-template-columns:1fr !important;}}
          .toc li{font-family:'Cormorant Garamond',serif;font-size:16.5px;color:var(--ink-body);display:flex;gap:12px;align-items:baseline;border-bottom:1px dotted var(--ink-line);padding-bottom:8px;}
          .toc li span{font-family:'Cormorant SC',serif;font-size:12px;letter-spacing:1px;}

          .check-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;}
          .check-item{display:flex;align-items:center;gap:11px;font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--ink-body);border:1px solid var(--ink-line);border-radius:10px;padding:12px 15px;background:var(--ink-surface);}
          .check-box{width:13px;height:13px;border:1.5px solid var(--c);border-radius:3px;flex:none;}
          .check-pf{margin-left:auto;font-family:'Cormorant SC',serif;font-size:10px;letter-spacing:1.6px;color:var(--ink-dim);white-space:nowrap;}

          .award-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;}
          .award{display:flex;align-items:center;gap:12px;font-family:var(--font-display);font-size:19px;color:var(--ink-text);border:1px solid var(--ink-line);border-left:2px solid var(--c);border-radius:0 10px 10px 0;padding:12px 16px;background:var(--ink-surface);}

          .banned-grid{display:flex;flex-wrap:wrap;gap:9px;}
          .banned{font-family:'Cormorant SC',serif;font-size:11.5px;letter-spacing:1.8px;color:#e08a80;border:1px solid rgba(224,138,128,0.35);background:rgba(224,138,128,0.07);border-radius:6px;padding:8px 14px;text-decoration:line-through;text-decoration-color:rgba(224,138,128,0.55);}

          .cta-btn{display:inline-block;font-family:'Cormorant SC',serif;font-size:14px;font-weight:700;letter-spacing:3px;color:#0a0812;background:linear-gradient(100deg,${GOLD} 0%,${CYAN_HI} 100%);border:none;border-radius:100px;padding:16px 40px;cursor:pointer;text-decoration:none;transition:transform 0.25s ease;animation:sealPulse 2.8s ease-in-out infinite;}
          .cta-btn:hover{transform:translateY(-2px) scale(1.02);}

          /* ── Register Now: a hand-turned wood-grain button, matching the
             timber tone used throughout the carnival's wooden fixtures ── */
          .wood-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;
            font-family:'Cormorant SC',serif;font-weight:700;text-transform:uppercase;color:#f8ecd2;
            text-shadow:0 1px 1px rgba(0,0,0,0.4);text-decoration:none;cursor:pointer;border:none;
            border-radius:100px;overflow:hidden;white-space:nowrap;
            background:
              linear-gradient(90deg, rgba(43,27,12,0.5) 0, rgba(43,27,12,0) 22px, rgba(43,27,12,0) calc(100% - 22px), rgba(43,27,12,0.5) 100%),
              linear-gradient(180deg,#f0d7a2 0%,#d1a55c 30%,#a97c3e 56%,#7a5527 80%,#4f3319 100%);
            box-shadow:inset 0 2px 3px rgba(255,244,220,0.6), inset 0 -4px 5px rgba(0,0,0,0.4), 0 10px 26px -14px rgba(0,0,0,0.65);
            transition:transform .2s ease, box-shadow .2s ease, filter .2s ease;}
          .wood-btn::before{content:"";position:absolute;inset:0;opacity:0.55;mix-blend-mode:overlay;pointer-events:none;
            background:repeating-linear-gradient(77deg, rgba(255,246,224,0.22) 0 2px, transparent 2px 8px, rgba(50,32,14,0.2) 8px 10px, transparent 10px 16px);}
          .wood-btn:hover{transform:translateY(-2px);filter:brightness(1.07);
            box-shadow:inset 0 2px 3px rgba(255,244,220,0.65), inset 0 -4px 5px rgba(0,0,0,0.4), 0 14px 32px -14px rgba(0,0,0,0.7);}
          .wood-btn:active{transform:translateY(0);}
          .wood-btn-lg{padding:16px 40px;font-size:14px;letter-spacing:3px;}
          .wood-btn-sm{margin-left:14px;padding:8px 16px;font-size:10.5px;letter-spacing:2px;}

          /* ── The parchment book ──────────────────────────── */
          .pm-defs{position:absolute;width:0;height:0;overflow:hidden;}
          .pm-backdrop{position:fixed;inset:0;z-index:900;display:flex;align-items:center;justify-content:center;padding:clamp(10px,3vw,40px);background:rgba(4,4,10,0.85);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:pmFade .3s ease;}
          .pm-shell{position:relative;width:min(920px,100%);height:min(880px,92vh);display:flex;animation:pmOpen .55s cubic-bezier(0.2,0.8,0.3,1);}
          .pm-paper{position:absolute;inset:-10px;z-index:0;filter:url(#cb-torn-edge) drop-shadow(0 26px 60px rgba(0,0,0,0.62));
            background:
              radial-gradient(ellipse 52% 42% at 48% 42%, rgba(255,253,247,0.96), rgba(250,241,224,0.55) 55%, rgba(250,241,224,0) 78%),
              radial-gradient(ellipse 34% 30% at 6% 8%, rgba(139,96,52,0.42), transparent 62%),
              radial-gradient(ellipse 30% 26% at 96% 12%, rgba(126,86,48,0.4), transparent 60%),
              radial-gradient(ellipse 32% 28% at 4% 94%, rgba(126,86,48,0.38), transparent 60%),
              radial-gradient(ellipse 36% 30% at 94% 92%, rgba(146,101,56,0.42), transparent 62%),
              radial-gradient(circle at 68% 34%, rgba(150,106,58,0.16), transparent 26%),
              radial-gradient(circle at 26% 66%, rgba(150,106,58,0.14), transparent 24%),
              linear-gradient(158deg, #c39a68 0%, #e3d3b5 22%, #f3ecdd 48%, #e6d6ba 72%, #bf9663 100%);}
          .pm-paper::after{content:"";position:absolute;inset:0;opacity:0.5;mix-blend-mode:multiply;
            background:repeating-linear-gradient(0deg, rgba(122,88,52,0.07) 0 1px, transparent 1px 4px),
                       repeating-linear-gradient(90deg, rgba(122,88,52,0.07) 0 1px, transparent 1px 4px);}
          .pm-close{position:absolute;top:8px;right:8px;z-index:5;width:40px;height:40px;border-radius:50%;cursor:pointer;
            font-size:15px;color:#f3ecdd;background:#3a2b1c;border:1px solid rgba(255,244,224,0.3);
            box-shadow:0 6px 18px rgba(0,0,0,0.45);transition:transform .25s ease,background .25s ease;}

          /* ── Ambient score toggle ─────────────────────────── */
          .score-toggle{position:fixed;right:20px;bottom:20px;z-index:950;width:46px;height:46px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;color:${PARCH};background:rgba(9,11,22,0.72);
            border:1px solid rgba(185,166,245,0.4);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
            cursor:pointer;box-shadow:0 10px 28px -12px rgba(0,0,0,0.7);
            transition:transform .2s ease,border-color .2s ease,background .2s ease;}
          .score-toggle:hover{transform:translateY(-2px);border-color:${CYAN_HI};background:rgba(15,17,34,0.85);}
          .score-toggle:active{transform:translateY(0);}
          @media (max-width:700px){.score-toggle{right:14px;bottom:14px;width:42px;height:42px;}}
          .pm-close:hover{transform:rotate(90deg);background:#543821;}

          .pm-body{position:relative;z-index:1;display:flex;flex-direction:column;width:100%;height:100%;
            padding:clamp(18px,3vw,30px) clamp(14px,3.4vw,42px) clamp(12px,2vw,20px);}
          .pm-runner{display:flex;align-items:baseline;gap:12px;font-family:'Cormorant SC',serif;font-size:10.5px;
            letter-spacing:2.8px;text-transform:uppercase;color:#7c6850;padding:0 4px 12px;border-bottom:1px solid rgba(94,68,40,0.24);}
          .pm-runner-title{margin-left:auto;color:#5b4526;text-align:right;}

          /* the turning stage */
          .pm-stage{position:relative;flex:1;min-height:0;perspective:2400px;perspective-origin:0% 50%;}
          .pm-leaf{position:absolute;inset:0;overflow-y:auto;overscroll-behavior:contain;padding:clamp(16px,2.6vw,30px) clamp(4px,1.6vw,18px) 6px;
            backface-visibility:hidden;scrollbar-color:rgba(94,68,40,0.45) transparent;animation:leafSettle .5s ease both;}
          .pm-leaf::-webkit-scrollbar{width:8px;}
          .pm-leaf::-webkit-scrollbar-thumb{background:rgba(94,68,40,0.35);border-radius:100px;}
          .pm-turning{overflow:hidden;pointer-events:none;z-index:4;transform-style:preserve-3d;
            box-shadow:0 18px 40px rgba(60,40,18,0.35);}
          .pm-turning.fwd{transform-origin:left center;animation:leafFwd .64s cubic-bezier(0.55,0.03,0.3,0.98) forwards;}
          .pm-turning.back{transform-origin:right center;animation:leafBack .64s cubic-bezier(0.55,0.03,0.3,0.98) forwards;}
          .pm-turning-face{position:absolute;inset:0;overflow:hidden;padding:clamp(16px,2.6vw,30px) clamp(4px,1.6vw,18px) 6px;
            background:linear-gradient(158deg, rgba(243,236,221,0.96), rgba(230,214,186,0.96));}
          .pm-turning-shade{position:absolute;inset:0;pointer-events:none;}
          .pm-turning.fwd .pm-turning-shade{background:linear-gradient(90deg, rgba(74,50,22,0.42), rgba(74,50,22,0) 42%);animation:shadeFwd .64s ease forwards;}
          .pm-turning.back .pm-turning-shade{background:linear-gradient(270deg, rgba(74,50,22,0.42), rgba(74,50,22,0) 42%);animation:shadeFwd .64s ease forwards;}

          @keyframes leafFwd{from{transform:rotateY(0deg);}to{transform:rotateY(-172deg);}}
          @keyframes leafBack{from{transform:rotateY(0deg);}to{transform:rotateY(172deg);}}
          @keyframes shadeFwd{0%{opacity:0.15;}45%{opacity:0.85;}100%{opacity:0.1;}}
          @keyframes leafSettle{from{opacity:0.25;transform:translateY(6px) scale(0.995);}to{opacity:1;transform:none;}}
          @keyframes pmFade{from{opacity:0;}to{opacity:1;}}
          @keyframes pmOpen{from{opacity:0;transform:translateY(26px) scale(0.975) rotate(-0.5deg);}to{opacity:1;transform:none;}}
          @keyframes pmLift{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:none;}}

          /* title leaf */
          .pm-cover{text-align:center;padding-top:clamp(6px,3vh,34px);}
          .pm-kicker{font-family:'Cormorant SC',serif;font-size:10.5px;letter-spacing:3px;color:#7c6850;text-transform:uppercase;}
          .pm-glyph{display:flex;justify-content:center;margin:20px 0 12px;opacity:0.85;}
          .pm-code{font-family:'Cormorant SC',serif;font-size:12px;font-weight:700;letter-spacing:5px;color:#6b4a24;}
          .pm-title{font-family:var(--font-display);font-weight:700;font-size:clamp(30px,5.6vw,54px);color:#2f2419;line-height:1.06;letter-spacing:0.5px;margin-top:4px;}
          .pm-meta{font-family:'Cormorant SC',serif;font-size:11px;letter-spacing:2.4px;color:#7c6850;margin-top:12px;}
          .pm-blurb{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:17px;line-height:1.8;color:#4c3b2a;max-width:600px;margin:16px auto 0;}
          .pm-rule{height:1px;margin:26px auto 0;max-width:340px;background:linear-gradient(90deg,transparent,rgba(94,68,40,0.55),transparent);}
          .pm-contents{margin:26px auto 0;max-width:560px;text-align:left;}
          .pm-contents-label{font-family:'Cormorant SC',serif;font-size:11px;letter-spacing:3px;color:#7c6850;text-transform:uppercase;margin-bottom:10px;}
          .pm-contents ol{list-style:none;counter-reset:none;}
          .pm-contents li{border-bottom:1px dotted rgba(94,68,40,0.28);}
          .pm-contents button{display:flex;align-items:baseline;gap:12px;width:100%;background:none;border:none;cursor:pointer;
            padding:9px 4px;text-align:left;font-family:'Cormorant Garamond',serif;font-size:16.5px;color:#4c3b2a;transition:color .2s ease,padding .2s ease;}
          .pm-contents button:hover{color:#2f2419;padding-left:9px;}
          .pm-c-num{font-family:'Cormorant SC',serif;font-size:11px;letter-spacing:1.5px;color:#8a6a3f;}
          .pm-c-dots{flex:1;border-bottom:1px dotted rgba(94,68,40,0.35);transform:translateY(-4px);}

          /* footer + navigation */
          .pm-foot{margin-top:42px;padding-top:18px;border-top:1px solid rgba(94,68,40,0.28);text-align:center;
            font-family:'Cormorant Garamond',serif;font-size:13.5px;line-height:1.75;color:#6b5741;}
          .pm-foot-mark{font-family:'Cormorant SC',serif;font-size:10px;letter-spacing:2.6px;color:#8a755b;margin-top:5px;}
          .pm-nav{display:flex;align-items:center;gap:14px;padding-top:12px;margin-top:6px;border-top:1px solid rgba(94,68,40,0.24);}
          .pm-arrow{display:inline-flex;align-items:center;gap:7px;font-family:'Cormorant SC',serif;font-size:11px;font-weight:700;
            letter-spacing:2.4px;text-transform:uppercase;color:#3f2f1d;background:rgba(255,250,238,0.55);border:1px solid rgba(94,68,40,0.35);
            border-radius:100px;padding:10px 18px;cursor:pointer;transition:transform .2s ease,background .2s ease,opacity .2s ease;}
          .pm-arrow:hover:not(:disabled){background:rgba(255,250,238,0.9);transform:translateY(-1px);}
          .pm-arrow:disabled{opacity:0.32;cursor:default;}
          .pm-pips{display:flex;align-items:center;gap:7px;margin:0 auto;flex-wrap:wrap;justify-content:center;}
          .pm-pip{width:8px;height:8px;border-radius:50%;border:1px solid rgba(94,68,40,0.5);background:transparent;padding:0;cursor:pointer;transition:transform .2s ease,background .2s ease;}
          .pm-pip:hover{transform:scale(1.35);}
          .pm-pip.on{background:#5b4526;border-color:#5b4526;transform:scale(1.2);}
          .pm-folio{font-family:'Cormorant SC',serif;font-size:11px;letter-spacing:2.4px;color:#7c6850;white-space:nowrap;}
          .pm-body .detail-card:hover{box-shadow:none;}
          .pm-body .blk-sub{margin-top:6px;}

          @media (max-width:700px){
            .pm-shell{height:94vh;}
            .pm-paper{inset:-6px;}
            .pm-close{top:2px;right:2px;width:34px;height:34px;}
            .pm-pips{display:none;}
            .pm-arrow span{display:none;}
            .pm-arrow{padding:10px 16px;font-size:15px;}
            .pm-runner-title{max-width:38%;}
            .wood-btn-sm{font-size:9.5px;padding:7px 12px;}
          }

          @media (prefers-reduced-motion: reduce){
            html{scroll-behavior:auto;}
            *{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.001ms !important;}
          }
        `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 500, opacity: 0.05,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><circle cx='12' cy='18' r='0.6' fill='%23ffffff' opacity='0.5'/><circle cx='47' cy='6' r='0.5' fill='%23ffffff' opacity='0.4'/><circle cx='70' cy='40' r='0.7' fill='%23ffffff' opacity='0.45'/><circle cx='28' cy='55' r='0.5' fill='%23ffffff' opacity='0.4'/><circle cx='60' cy='75' r='0.6' fill='%23ffffff' opacity='0.5'/><circle cx='84' cy='20' r='0.5' fill='%23ffffff' opacity='0.35'/></svg>\")",
          backgroundRepeat: "repeat",
        }}
      />

      <AmbientScore src={assets.ThemeMusic} />

      <Hero />

      <main style={{ position: "relative", zIndex: 10, background: INK, boxShadow: `0 -50px 90px ${INK}` }}>
        <EventBriefScene />
        <InviteScene />
        <ZoneIndexScene onOpen={setOpenZone} />
        <ExperienceZonesScene />
        <FAQScene />
        <ClosingScene />
      </main>

      <ParchmentModal zone={openZone} onClose={closeZone} />
    </SkinProvider>
  );
}