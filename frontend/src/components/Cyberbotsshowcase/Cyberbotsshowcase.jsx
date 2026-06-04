import { useState, useEffect, useRef, useCallback } from "react";
import assets from "../../assets/assets";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const EVENTS = [
  {
    id: 1,
    date: "November 8, 2025",
    tag: "NOV 2025",
    name: "CyberFlix 2025",
    subtitle: "The Robotics Premier League",
    venue: "Vani Vidyalaya Senior Secondary & Junior College",
    location: "Chennai",
    desc: "Over 500 young innovators from 15+ schools competed across junior, middle, and senior categories in a spectacular debut event that ignited Chennai's STEM community.",
    accent: "#0ea5e9",
    accentGlow: "rgba(14,165,233,0.25)",
    accentBg: "rgba(14,165,233,0.08)",
    accentBorder: "rgba(14,165,233,0.25)",
    img: assets.bee1,
    imgAlt: "Students competing in CyberFlix 2025 robotics championship",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
    chips: ["Battlegrounds", "Dragon Vault", "Collect Fast Snatch Smart", "Clear the Islands", "Crack the Scroll", "Devil Fruits"],
    stats: [{ num: "500+", lbl: "Students" }, { num: "15+", lbl: "Schools" }, { num: "₹1L", lbl: "Prize Pool" }],
    modalImages: [
      { src: assets.bee1, cap: "Opening Ceremony" },
      { src: assets.bee2, cap: "Junior Battlegrounds" },
      { src: assets.bee3, cap: "Robot Design Phase" },
      { src: assets.bee4, cap: "Dragon Vault Challenge" },
      { src: assets.bee5, cap: "Coding in Action" },
      { src: assets.bee6, cap: "Team Collaboration" },
      { src: assets.bee7, cap: "Championship Finals" },
      { src: assets.bee8, cap: "Award Ceremony" },
    ],
    sections: [
      {
        heading: "Inspiring the Next Generation",
        body: "CyberFlix 2025 brought together more than 500 young innovators from Grades 3 to 12 for an unforgettable day of robotics competitions, STEM challenges, and hands-on learning. Participating schools included Vani Vidyalaya, Devi Academy, Montfort School, SKPD, Arulmighu Meenakshi Amman Public School, The Hindu Senior Secondary School, and several others. The event united aspiring engineers, programmers, and innovators under one roof, creating an atmosphere of excitement and healthy competition.",
      },
      {
        heading: "Exciting Challenges Across Categories",
        body: "Junior participants competed in Battlegrounds, where robots navigated obstacle-filled arenas, and Dragon Vault, a challenge focused on collecting and transporting valuable objects. Middle-school students showcased strategic thinking in Collect Fast, Snatch Smart, while senior participants tackled Clear the Islands, Crack the Scroll, and The Devil Fruits. Each competition demanded creativity, precision, programming knowledge, and teamwork.",
      },
      {
        heading: "Rewarding Excellence",
        body: "CyberFlix 2025 featured more than 50 prize categories, with winners competing for a total prize pool of ₹1,00,000. The award ceremony was one of the most anticipated moments of the day — students, parents, and teachers gathered to celebrate the achievements of winning teams as trophies, medals, certificates, and cash prizes were presented by distinguished guests.",
      },
      {
        heading: "A Day Packed with Action",
        body: "Registration began at 7:30 AM, followed by an inaugural session at 8:30 AM. Preliminary rounds commenced at 9:00 AM, with students competing across multiple challenge zones until noon. Following the preliminary stages, finalists advanced to the main rounds and championship matches held after lunch. The competition culminated in the final selection rounds, after which winners were honored during the closing ceremony.",
      },
    ],
    quote: { text: "Watching students collaborate to solve problems was incredibly rewarding.", attr: "Event Coach, CyberFlix 2025" },
    highlights: ["500+ students from Grades 3–12", "15+ schools across Chennai", "50+ prize categories, ₹1,00,000 prize pool", "Junior, Middle, and Senior age categories"],
  },
  {
    id: 2,
    date: "January 3, 2026",
    tag: "JAN 2026",
    name: "CyberFlix 2K26",
    subtitle: "National Level Robotics Premier League",
    venue: "Rudrappasamy School, Ambattur",
    location: "Chennai",
    desc: "Schools from Chennai and neighboring regions competed across four themed zones in prelims, knockout stages, and grand finals — a true national-level spectacle.",
    accent: "#f97316",
    accentGlow: "rgba(249,115,22,0.25)",
    accentBg: "rgba(249,115,22,0.08)",
    accentBorder: "rgba(249,115,22,0.25)",
    img: assets.eve1,
    imgAlt: "CyberFlix 2K26 national robotics event",
    gradient: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
    chips: ["Lumina Forge", "Dragon Vault", "Nautica Quest", "Nexathon"],
    stats: [{ num: "50+", lbl: "Categories" }, { num: "4", lbl: "Themed Zones" }, { num: "₹1L", lbl: "Prize Pool" }],
    modalImages: [
      { src: assets.eve1, cap: "Grand Arena" },
      { src: assets.eve2, cap: "Team Strategy Session" },
      { src: assets.eve3, cap: "Lumina Forge Zone" },
      { src: assets.eve4, cap: "Nautica Quest" },
      { src: assets.eve5, cap: "Knockout Rounds" },
      { src: assets.eve6, cap: "Nexathon Finals" },
      { src: assets.eve7, cap: "Dragon Vault Challenge" },
      { src: assets.eve8, cap: "Award Ceremony" },
    ],
    sections: [
      {
        heading: "A National-Level Celebration",
        body: "On January 3, 2026, the campus of Rudrappasamy School, Ambattur, Chennai, transformed into a vibrant hub of technology, creativity, and innovation. Organized by CYBERBOTS in association with Rudrappasamy School, the event brought together hundreds of young innovators from Grades 3 to 12 with active participation from schools across Chennai and neighboring regions.",
      },
      {
        heading: "Innovation in Action",
        body: "The competition was divided into four exciting themed zones: Lumina Forge, Dragon Vault, Nautica Quest, and Nexathon. Each zone offered unique challenges testing participants' abilities in robot design, programming, navigation, strategy, and teamwork. From guiding robots through complex obstacle courses to completing mission-based tasks under time constraints, students demonstrated remarkable technical knowledge and innovation.",
      },
      {
        heading: "Excitement, Recognition & Rewards",
        body: "The event featured a cash prize pool of up to ₹1,00,000 and more than 50 prize categories, rewarding excellence across multiple competitions and age groups. The competition featured preliminary rounds, knockout stages, and grand finals, keeping participants engaged throughout the day. The award ceremony became a proud moment for students, teachers, and parents.",
      },
      {
        heading: "Shaping Future-Ready Learners",
        body: "More than a competition, CYBERFLIX 2K26 reflected a shared vision of preparing students for the future. Through robotics, coding, and technology-based challenges, participants developed essential 21st-century skills such as problem-solving, creativity, communication, and teamwork. Students left with trophies, certificates, new friendships, and a renewed passion for innovation.",
      },
    ],
    quote: { text: "CYBERFLIX 2K26 was not just a tech fest — it was a glimpse into the future of education.", attr: "Event Organizer, CyberBots" },
    highlights: ["National-level, schools from across Tamil Nadu", "4 themed zones: Lumina Forge, Dragon Vault, Nautica Quest, Nexathon", "Prelims → Knockout → Grand Finals format", "₹1,00,000 prize pool across 50+ categories"],
  },
  {
    id: 3,
    date: "January 10, 2026",
    tag: "JAN 2026",
    name: "Cyberfest 2K26",
    subtitle: "The Grand Island Quest",
    venue: "Maharishi Vidya Mandir Senior Secondary School, Chetpet",
    location: "Chennai",
    desc: "Exclusively designed for Grades 6–8, this adventure-themed robotics event featured pirate bots, wild track balancing, and logic puzzle challenges in a unique island quest format.",
    accent: "#8b5cf6",
    accentGlow: "rgba(139,92,246,0.25)",
    accentBg: "rgba(139,92,246,0.08)",
    accentBorder: "rgba(139,92,246,0.25)",
    img: assets.bee5,
    imgAlt: "Cyberfest 2K26 Grand Island Quest",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
    chips: ["Control the Pirate Bot", "Wild Track", "Logic Puzzles", "Island Quest"],
    stats: [{ num: "6–8", lbl: "Grades" }, { num: "3", lbl: "Challenge Zones" }, { num: "🏆", lbl: "Awards" }],
    modalImages: [
      { src: assets.bee8, cap: "Island Quest Arena" },
      { src: assets.bee7, cap: "Pirate Bot Challenge" },
      { src: assets.bee6, cap: "Wild Track Runs" },
      { src: assets.bee5, cap: "Logic Puzzle Zone" },
      { src: assets.bee4, cap: "Team Collaboration" },
      { src: assets.bee3, cap: "Prize Distribution" },
      { src: assets.bee2, cap: "STEM Learning" },
      { src: assets.bee1, cap: "Strategy Planning" },
    ],
    sections: [
      {
        heading: "An Exciting Robotics Adventure",
        body: "On January 10, 2026, the campus of Maharishi Vidya Mandir Senior Secondary School, Chetpet, Chennai, buzzed with excitement. Designed exclusively for students of Grades 6 to 8, Cyberfest 2K26 brought together young innovators for a day filled with technology, teamwork, and hands-on STEM learning through a series of adventure-themed challenges.",
      },
      {
        heading: "The Grand Island Quest Challenges",
        body: "The highlight was The Grand Island Quest — a specially designed challenge zone combining robotics with adventure-themed missions. Control the Pirate Bot tested participants' ability to maneuver robots through mission objectives with accuracy. The Balance & Rotate on the Wild Track challenge pushed students to think critically as they guided robots across complex balancing and rotational obstacles — one of the most thrilling segments of the event.",
      },
      {
        heading: "Logic & Sequence Puzzles",
        body: "Adding another layer of excitement were the Logic & Sequence Puzzles, where students combined analytical thinking with problem-solving skills to overcome challenges beyond robotics. These activities encouraged participants to apply both technical and logical reasoning in a competitive environment, developing essential skills for their STEM journey.",
      },
      {
        heading: "Celebrating Young Talent",
        body: "As the competition progressed through various rounds, participants displayed exceptional enthusiasm and innovation. The event concluded with an award ceremony recognizing outstanding performances across multiple categories. Students left with certificates, memorable experiences, and a deeper appreciation for technology — and most importantly, confidence to continue exploring STEM.",
      },
    ],
    quote: { text: "When students are given opportunities to innovate and experiment, they can achieve remarkable things.", attr: "Teacher, Maharishi Vidya Mandir" },
    highlights: ["Exclusively for Grades 6–8 students", "Adventure-narrative island quest format", "3 zones: Pirate Bot, Wild Track, Logic Puzzles", "Organized by Team CyberBots at MVM Chetpet"],
  },
  {
    id: 4,
    date: "2026",
    tag: "2026",
    name: "Cybertron 2K26",
    subtitle: "National Innovation Championship",
    venue: "Sudharsanam Vidyaashram, Poonamallee",
    location: "Chennai",
    desc: "600+ students competed in robotics, coding, and automation. The electrifying Electro Nova challenge became the event's showstopper, with standout performers earning national recognition.",
    accent: "#10b981",
    accentGlow: "rgba(16,185,129,0.25)",
    accentBg: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.25)",
    img: assets.eve6,
    imgAlt: "Cybertron 2K26 national innovation championship",
    gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
    chips: ["Electro Nova", "Automation Models", "Coding Challenges", "Engineering"],
    stats: [{ num: "600+", lbl: "Students" }, { num: "National", lbl: "Level" }, { num: "⚡", lbl: "Electro Nova" }],
    modalImages: [
      { src: assets.eve6, cap: "Electro Nova Arena" },
      { src: assets.eve7, cap: "Automation Models" },
      { src: assets.eve8, cap: "Coding Challenge Zone" },
      { src: assets.eve5, cap: "Engineering Workshop" },
      { src: assets.eve4, cap: "National Finals" },
      { src: assets.eve3, cap: "Robot Build Phase" },
      { src: assets.eve2, cap: "Team Presentations" },
      { src: assets.eve1, cap: "Champions Celebration" },
    ],
    sections: [
      {
        heading: "Robots, Challenges, and Non-Stop Action",
        body: "Cybertron 2K26 transformed Sudharsanam Vidyaashram, Poonamallee into a hub of technology, excitement, and future-ready learning. With over 600 enthusiastic students participating from schools across Chennai and beyond, it was more than a competition — it was a celebration of innovation, teamwork, and imagination. Students got a chance to showcase their talents in robotics, coding, automation, and engineering.",
      },
      {
        heading: "The Electro Nova Showstopper",
        body: "One of the most exciting attractions was The Electro Nova, a high-energy competition that pushed participants to think fast, adapt quickly, and perform with precision. The challenge brought out the best in students, leading to some truly impressive performances. Participants worked on hands-on robotics projects and automation models, demonstrating their ability to solve problems and innovate under pressure.",
      },
      {
        heading: "Celebrating Young Achievers",
        body: "Cybertron 2K26 was filled with inspiring success stories. Among the standout performers was SVian Mitansh Mehta, who secured top honors and became one of the stars of the competition. The event wasn't just about winning trophies — it was about gaining confidence, building friendships, and discovering the joy of creating something innovative.",
      },
      {
        heading: "The Future Starts Here",
        body: "Cybertron 2K26 showcased how robotics and technology can inspire the next generation of engineers, scientists, and entrepreneurs. The event brought together students from across the Sudharsanam Vidyaashram network and other schools, creating a community united by innovation and a passion for STEM. Students left inspired to dream bigger, build smarter, and continue exploring the limitless possibilities of technology.",
      },
    ],
    quote: { text: "Cybertron 2K26 wasn't just a robotics competition — it was a glimpse into the future, powered by the creativity and determination of young innovators.", attr: "CyberBots Team" },
    highlights: ["600+ students from schools across Chennai", "Robotics + Coding + Automation disciplines", "Electro Nova — the high-energy showstopper", "National recognition & standout performances"],
  },
];

const CHALLENGES = [
  { icon: "⚔️", name: "Battlegrounds", desc: "Robots navigate obstacle-filled arenas in tactical head-to-head combat.", level: "Junior", lc: "#10b981", lb: "rgba(16,185,129,0.12)" },
  { icon: "🐉", name: "Dragon Vault", desc: "Collect and transport valuable objects with speed and precision.", level: "Junior", lc: "#10b981", lb: "rgba(16,185,129,0.12)" },
  { icon: "🏃", name: "Collect Fast Snatch Smart", desc: "Strategic collection challenge demanding speed and smart planning.", level: "Middle School", lc: "#0ea5e9", lb: "rgba(14,165,233,0.12)" },
  { icon: "🏝️", name: "Clear the Islands", desc: "Advanced clearing missions across multi-zone island obstacle courses.", level: "Senior", lc: "#f97316", lb: "rgba(249,115,22,0.12)" },
  { icon: "📜", name: "Crack the Scroll", desc: "Decode mission parameters and execute robot tasks with precision.", level: "Senior", lc: "#f97316", lb: "rgba(249,115,22,0.12)" },
  { icon: "🌊", name: "Nautica Quest", desc: "Navigate maritime-themed challenges requiring fluid robot control.", level: "Middle School", lc: "#0ea5e9", lb: "rgba(14,165,233,0.12)" },
  { icon: "💡", name: "Lumina Forge", desc: "Build, light up, and forge connections across illuminated challenge grids.", level: "Middle School", lc: "#0ea5e9", lb: "rgba(14,165,233,0.12)" },
  { icon: "⚡", name: "Electro Nova", desc: "High-energy precision challenge testing adaptability under intense pressure.", level: "Senior", lc: "#f97316", lb: "rgba(249,115,22,0.12)" },
  { icon: "🏴‍☠️", name: "Pirate Bot", desc: "Navigate pirate-themed missions with accuracy and creative control.", level: "Grades 6–8", lc: "#8b5cf6", lb: "rgba(139,92,246,0.12)" },
  { icon: "🧩", name: "Logic Puzzles", desc: "Combine analytical thinking with robotics for multi-step challenges.", level: "All Levels", lc: "#fbbf24", lb: "rgba(251,191,36,0.12)" },
  { icon: "🔮", name: "Nexathon", desc: "The grand innovation relay combining coding, design, and automation.", level: "Senior", lc: "#f97316", lb: "rgba(249,115,22,0.12)" },
  { icon: "🍎", name: "Devil Fruits", desc: "Collect, sort and deploy strategic objects across a dynamic game field.", level: "Senior", lc: "#f97316", lb: "rgba(249,115,22,0.12)" },
];

const GALLERY = [
  { src: assets.eve5, caption: "Robot Design Phase", tall: true },
  { src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=700&q=80", caption: "Competition Arena" },
  { src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=700&q=80", caption: "Coding in Action" },
  { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&q=80", caption: "Team Strategy" },
  { src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&q=80", caption: "STEM Excellence", tall: true },
  { src: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=700&q=80", caption: "Award Ceremony" },
];

/* ─────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ─────────────────────────────────────────────
   EVENT MODAL
───────────────────────────────────────────── */
function EventModal({ ev, onClose }) {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const prevImg = useCallback(() => setActiveImg(i => (i - 1 + ev.modalImages.length) % ev.modalImages.length), [ev.modalImages.length]);
  const nextImg = useCallback(() => setActiveImg(i => (i + 1) % ev.modalImages.length), [ev.modalImages.length]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(2,4,12,0.94)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(24px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .modal-thumb { cursor:pointer; border-radius:6px; overflow:hidden; border:2px solid transparent; transition:border-color 0.2s, transform 0.2s, opacity 0.2s; opacity:0.6; }
        .modal-thumb:hover { opacity:1; transform:scale(1.05); }
        .modal-thumb.mta { border-color:${ev.accent}; opacity:1; }
        .modal-nav { background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.18); border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; font-size:20px; transition:background 0.2s; flex-shrink:0; }
        .modal-nav:hover { background:rgba(255,255,255,0.18); }
        .modal-close { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:8px; width:36px; height:36px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:16px; flex-shrink:0; transition:background 0.2s, color 0.2s; }
        .modal-close:hover { background:rgba(255,255,255,0.14); color:#f0f4ff; }
        .modal-scroll::-webkit-scrollbar { width:3px; }
        .modal-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:4px; }
        .modal-thumb-scroll::-webkit-scrollbar { height:3px; }
        .modal-thumb-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:4px; }
        .hl-dot { width:6px; height:6px; border-radius:50%; background:${ev.accent}; flex-shrink:0; margin-top:6px; }
        @media (max-width:680px) {
          .modal-body { flex-direction:column !important; }
          .modal-photo-col { border-right:none !important; border-bottom:1px solid rgba(255,255,255,0.07) !important; }
          .modal-main-img { min-height:220px !important; max-height:280px !important; }
        }
      `}</style>

      <div style={{
        background: "#0a0f1e",
        border: `1px solid ${ev.accentBorder}`,
        borderRadius: 20,
        width: "100%", maxWidth: 980,
        display: "flex", flexDirection: "column",
        animation: "modalIn 0.38s cubic-bezier(0.34,1.4,0.64,1) both",
        marginTop: "auto", marginBottom: "auto",
        minHeight: 0,
      }}>
        {/* Top gradient bar */}
        <div style={{ height: 3, background: ev.gradient, borderRadius: "20px 20px 0 0", flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 2, color: ev.accent, background: ev.accentBg, border: `1px solid ${ev.accentBorder}`, borderRadius: 100, padding: "3px 10px" }}>{ev.tag}</span>
              <span style={{ fontSize: 12, color: "#475569" }}>{ev.date}</span>
              <span style={{ fontSize: 12, color: "#334155" }}>·</span>
              <span style={{ fontSize: 12, color: "#475569" }}>📍 {ev.venue}</span>
            </div>
            <h2 style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(16px,3vw,24px)", fontWeight: 800, color: "#f0f4ff", lineHeight: 1.2, marginBottom: 3 }}>{ev.name}</h2>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: ev.accent }}>{ev.subtitle}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

          {/* LEFT: Gallery */}
          <div className="modal-photo-col" style={{ flex: "0 0 50%", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Main image */}
            <div className="modal-main-img" style={{ position: "relative", flex: 1, minHeight: 300, maxHeight: 400, overflow: "hidden" }}>
              <img
                key={activeImg}
                src={ev.modalImages[activeImg].src}
                alt={ev.modalImages[activeImg].cap}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.25s" }}
                loading="lazy"
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 55%,rgba(4,7,18,0.82) 100%)" }} />
              {/* Arrows */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", pointerEvents: "none" }}>
                <button className="modal-nav" onClick={prevImg} style={{ pointerEvents: "all" }}>‹</button>
                <button className="modal-nav" onClick={nextImg} style={{ pointerEvents: "all" }}>›</button>
              </div>
              {/* Caption + counter */}
              <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{ev.modalImages[activeImg].cap}</span>
                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#94a3b8" }}>{activeImg + 1}/{ev.modalImages.length}</span>
              </div>
            </div>
            {/* Thumbnail strip */}
            <div className="modal-thumb-scroll" style={{ display: "flex", gap: 7, padding: "10px 14px", background: "rgba(0,0,0,0.4)", overflowX: "auto", flexShrink: 0 }}>
              {ev.modalImages.map((img, i) => (
                <div key={i} className={`modal-thumb${i === activeImg ? " mta" : ""}`} onClick={() => setActiveImg(i)} style={{ flexShrink: 0, width: 60, height: 42 }}>
                  <img src={img.src} alt={img.cap} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="modal-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {ev.stats.map(s => (
                <div key={s.lbl} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, color: ev.accent, lineHeight: 1, marginBottom: 4 }}>{s.num}</div>
                  <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase" }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ev.accent, marginBottom: 10 }}>Highlights</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ev.highlights.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div className="hl-dot" />
                    <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.55 }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections from blog */}
            {ev.sections.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6, fontFamily: "'Orbitron',monospace", letterSpacing: 0.5 }}>{s.heading}</div>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.75 }}>{s.body}</p>
              </div>
            ))}

            {/* Quote */}
            <div style={{ borderLeft: `3px solid ${ev.accent}`, paddingLeft: 14, marginTop: 4 }}>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "#94a3b8", lineHeight: 1.7, marginBottom: 6 }}>"{ev.quote.text}"</p>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>{ev.quote.attr}</div>
            </div>

            {/* Chips */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#334155", marginBottom: 8 }}>Competition Zones</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ev.chips.map(c => (
                  <span key={c} style={{ fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 100, background: ev.accentBg, border: `1px solid ${ev.accentBorder}`, color: ev.accent }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EVENT CARD
───────────────────────────────────────────── */
function EventCard({ ev, idx, onClick }) {
  const [ref, inView] = useInView();
  const isEven = idx % 2 === 0;
  return (
    <div
      ref={ref}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderRadius: 24,
        overflow: "hidden",
        background: "#0a0f1e",
        border: `1px solid ${ev.accentBorder}`,
        marginBottom: 32,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.7s ease, transform 0.7s ease, border-color 0.3s, box-shadow 0.3s",
        transitionDelay: `${idx * 0.08}s`,
        position: "relative",
        cursor: "pointer",
      }}
      className="ev-card"
    >
      <style>{`
        .ev-card:hover { border-color:${ev.accent} !important; box-shadow:0 8px 48px ${ev.accentGlow} !important; transform:translateY(-5px) !important; }
        .ev-card:hover .ev-hint { opacity:1 !important; }
        .ev-card .ev-img img { transition:transform 0.55s ease; }
        .ev-card:hover .ev-img img { transform:scale(1.07); }
        @media (max-width:680px) {
          .ev-card { grid-template-columns:1fr !important; }
          .ev-img { min-height:200px !important; order:-1 !important; }
          .ev-content { padding:24px 20px !important; }
        }
        @media (max-width:400px) {
          .ev-content { padding:18px 16px !important; }
        }
      `}</style>
      {/* Gradient top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: ev.gradient, zIndex: 2 }} />
      {/* View hint */}
      <div className="ev-hint" style={{ position: "absolute", top: 16, right: 16, zIndex: 3, opacity: 0, transition: "opacity 0.25s", background: ev.accentBg, border: `1px solid ${ev.accentBorder}`, borderRadius: 100, padding: "5px 13px", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: ev.accent, fontFamily: "'Orbitron',monospace" }}>VIEW DETAILS</div>

      {isEven ? (
        <><EvImgCol ev={ev} /><EvContentCol ev={ev} /></>
      ) : (
        <><EvContentCol ev={ev} /><EvImgCol ev={ev} /></>
      )}
    </div>
  );
}

function EvImgCol({ ev }) {
  return (
    <div className="ev-img" style={{ position: "relative", minHeight: 300, overflow: "hidden" }}>
      <img src={ev.img} alt={ev.imgAlt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(5,8,16,0.22),transparent)" }} />
      <div style={{ position: "absolute", top: 20, left: 20, background: ev.accentBg, border: `1px solid ${ev.accentBorder}`, borderRadius: 100, padding: "6px 16px", fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: ev.accent }}>{ev.tag}</div>
    </div>
  );
}

function EvContentCol({ ev }) {
  return (
    <div className="ev-content" style={{ padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, fontSize: 12, color: "#64748b", flexWrap: "wrap" }}>
        <span>{ev.venue}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#334155", flexShrink: 0 }} />
        <span>{ev.location}</span>
      </div>
      <h3 style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(16px,2.5vw,24px)", fontWeight: 800, color: "#f0f4ff", lineHeight: 1.2, marginBottom: 6 }}>{ev.name}</h3>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: ev.accent, marginBottom: 14 }}>{ev.subtitle}</div>
      <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.75, marginBottom: 20 }}>{ev.desc}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
        {ev.chips.map(c => (
          <span key={c} style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: ev.accentBg, border: `1px solid ${ev.accentBorder}`, color: ev.accent }}>{c}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {ev.stats.map(s => (
          <div key={s.lbl} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: ev.accent, lineHeight: 1, marginBottom: 4 }}>{s.num}</div>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 0.5 }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   OTHER COMPONENTS
───────────────────────────────────────────── */
function ChallengeCard({ c, idx }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref}
      style={{ background: "#0d1535", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 20px", opacity: inView ? 1 : 0, transform: inView ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)", transition: "opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, background 0.3s", transitionDelay: `${(idx % 6) * 0.06}s`, cursor: "default" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = c.lc; e.currentTarget.style.background = c.lb; e.currentTarget.style.transform = "translateY(-5px) scale(1.02)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "#0d1535"; e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
    >
      <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, color: "#f0f4ff", marginBottom: 8, lineHeight: 1.4 }}>{c.name}</div>
      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65, marginBottom: 14 }}>{c.desc}</div>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px", borderRadius: 100, background: c.lb, border: `1px solid ${c.lc}30`, color: c.lc }}>{c.level}</span>
    </div>
  );
}

function NumBox({ n }) {
  const [ref, inView] = useInView(0.3);
  const [val, setVal] = useState(0);
  const target = parseInt(n.t, 10);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const dur = 1800;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(32px,6vw,58px)", fontWeight: 900, lineHeight: 1, color: n.c, textShadow: n.glow, marginBottom: 10 }}>
        {n.pre || ""}{val}{n.suffix}
      </div>
      <div style={{ fontSize: 12, color: "#475569", letterSpacing: 1 }}>{n.lbl}</div>
    </div>
  );
}

function GalleryItem({ g, idx }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref}
      style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", gridRow: g.tall ? "span 2" : "span 1", minHeight: g.tall ? 380 : 180, opacity: inView ? 1 : 0, transform: inView ? "scale(1)" : "scale(0.95)", transition: "opacity 0.5s ease, transform 0.5s ease, border-color 0.3s", transitionDelay: `${idx * 0.07}s`, cursor: "pointer", borderColor: hovered ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.06)" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <img src={g.src} alt={g.caption} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease", transform: hovered ? "scale(1.07)" : "scale(1)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 45%,rgba(5,8,16,0.88) 100%)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s", display: "flex", alignItems: "flex-end", padding: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{g.caption}</span>
      </div>
    </div>
  );
}

function QuoteBlock() {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ maxWidth: 740, margin: "0 auto", textAlign: "center", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 72, lineHeight: 0.8, color: "rgba(14,165,233,0.18)", marginBottom: 20 }}>"</div>
      <p style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 300, lineHeight: 1.65, color: "#cbd5e1", fontStyle: "italic", marginBottom: 24 }}>
        Watching students collaborate to solve problems was incredibly rewarding. CyberBots shows that learning can be both educational and genuinely exciting.
      </p>
      <div style={{ fontSize: 12, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase" }}>Event Coach · CyberFlix 2025</div>
    </div>
  );
}

function SectionHead({ label, title, desc }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ marginBottom: 56, opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(22px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#f97316", marginBottom: 12 }}>{label}</div>
      <h2 style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(22px,4vw,38px)", fontWeight: 800, color: "#f0f4ff", lineHeight: 1.2, marginBottom: 14 }}>{title}</h2>
      {desc && <p style={{ fontSize: 15, color: "#64748b", maxWidth: 520, lineHeight: 1.75 }}>{desc}</p>}
    </div>
  );
}

function SectionHeadCenter({ label, title, desc }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ textAlign: "center", marginBottom: 60, opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(22px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#f97316", marginBottom: 12 }}>{label}</div>
      <h2 style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(22px,4vw,38px)", fontWeight: 800, color: "#f0f4ff", lineHeight: 1.2, marginBottom: desc ? 14 : 0 }}>{title}</h2>
      {desc && <p style={{ fontSize: 15, color: "#64748b", maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>{desc}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function CyberBotsShowcase() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ fontFamily: "'Exo 2',sans-serif", background: "#050810", color: "#f0f4ff", overflowX: "hidden", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Exo+2:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        ::selection{background:rgba(14,165,233,0.3);}
        @keyframes gridScroll{from{transform:translateY(0)}to{transform:translateY(60px)}}
        @keyframes floatOrb1{0%,100%{transform:translate(0,0)}33%{transform:translate(40px,-25px)}66%{transform:translate(-25px,20px)}}
        @keyframes floatOrb2{0%,100%{transform:translate(0,0)}33%{transform:translate(-35px,20px)}66%{transform:translate(30px,-15px)}}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.65)}}
        @keyframes scrollBounce{0%,100%{transform:rotate(45deg) translateY(0)}50%{transform:rotate(45deg) translateY(8px)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .stat-divider{width:1px;height:52px;background:rgba(255,255,255,0.1);align-self:center;}
        @media(max-width:600px){.stat-divider{display:none!important}.hero-stats{gap:20px!important;justify-content:space-around!important}}
        @media(max-width:480px){.sec-pad{padding:56px 16px!important}}
        .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
        @media(max-width:700px){.gallery-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:440px){.gallery-grid{grid-template-columns:1fr!important}}
        .ch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;}
        @media(max-width:480px){.ch-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:340px){.ch-grid{grid-template-columns:1fr!important}}
        .num-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:32px;}
        @media(max-width:800px){.num-grid{grid-template-columns:repeat(3,1fr)!important;gap:24px!important}}
        @media(max-width:480px){.num-grid{grid-template-columns:repeat(2,1fr)!important;gap:20px!important}}
      `}</style>

      {activeModal && <EventModal ev={activeModal} onClose={() => setActiveModal(null)} />}

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "90px 24px 80px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 55% at 50% 25%,rgba(14,165,233,0.11) 0%,transparent 68%),radial-gradient(ellipse 55% 45% at 15% 85%,rgba(139,92,246,0.08) 0%,transparent 60%),radial-gradient(ellipse 45% 50% at 85% 70%,rgba(249,115,22,0.06) 0%,transparent 60%),linear-gradient(180deg,#050810 0%,#0a0f1e 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(14,165,233,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.035) 1px,transparent 1px)", backgroundSize: "60px 60px", animation: "gridScroll 22s linear infinite" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "rgba(14,165,233,0.06)", filter: "blur(80px)", top: -120, left: -120, animation: "floatOrb1 10s ease-in-out infinite", zIndex: 0 }} />
        <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", background: "rgba(139,92,246,0.07)", filter: "blur(70px)", bottom: -60, right: -80, animation: "floatOrb2 12s ease-in-out infinite", zIndex: 0 }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1, background: "rgba(14,165,233,0.09)", border: "1px solid rgba(14,165,233,0.3)", borderRadius: 100, padding: "9px 22px", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#06b6d4", marginBottom: 30, opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(-18px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4", animation: "pulseDot 2s ease-in-out infinite" }} />
          CyberBots Championship Series
        </div>

        <div style={{ position: "relative", zIndex: 1, opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(-18px)", transition: "opacity 0.7s 0.12s ease, transform 0.7s 0.12s ease" }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(40px,11vw,100px)", fontWeight: 900, lineHeight: 1, letterSpacing: -2, color: "#f0f4ff" }}>CYBERBOTS</div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(40px,11vw,100px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, background: "linear-gradient(135deg,#0ea5e9 0%,#06b6d4 40%,#f97316 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 4s linear infinite" }}>PREMIER LEAGUE</div>
        </div>

        <p style={{ fontSize: "clamp(14px,2.2vw,18px)", fontWeight: 300, color: "#64748b", maxWidth: 540, lineHeight: 1.75, margin: "26px auto 52px", position: "relative", zIndex: 1, opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(-18px)", transition: "opacity 0.7s 0.24s ease, transform 0.7s 0.24s ease" }}>
          Where young innovators build, compete, and ignite a lifelong passion for robotics, technology, and STEM excellence.
        </p>

        <div className="hero-stats" style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 1, opacity: heroVisible ? 1 : 0, transition: "opacity 0.7s 0.36s ease" }}>
          {[{ num: "4", lbl: "Major Events" }, null, { num: "5000+", lbl: "Students" }, null, { num: "₹4L", lbl: "Total Prizes" }, null, { num: "200+", lbl: "Prize Categories" }].map((s, i) =>
            s === null ? <div key={i} className="stat-divider" /> :
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(24px,5vw,40px)", fontWeight: 700, color: "#0ea5e9", lineHeight: 1, textShadow: "0 0 20px rgba(14,165,233,0.45)" }}>{s.num}</div>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 6 }}>{s.lbl}</div>
            </div>
          )}
        </div>

        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#334155", zIndex: 1, opacity: heroVisible ? 1 : 0, transition: "opacity 1s 1s ease" }}>
          <span>Explore</span>
          <div style={{ width: 22, height: 22, borderRight: "1.5px solid #334155", borderBottom: "1.5px solid #334155", transform: "rotate(45deg)", animation: "scrollBounce 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* EVENTS */}
      <section className="sec-pad" style={{ padding: "90px 24px", background: "#080c1a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHead label="⚡ Event Highlights" title="Championship Events" desc="Click any event card to explore full details, photos, and the complete story from each championship." />
          {EVENTS.map((ev, i) => <EventCard key={ev.id} ev={ev} idx={i} onClick={() => setActiveModal(ev)} />)}
        </div>
      </section>

      {/* NUMBERS */}
      <section className="sec-pad" style={{ padding: "90px 24px", background: "#050810", borderTop: "1px solid rgba(14,165,233,0.1)", borderBottom: "1px solid rgba(14,165,233,0.1)" }}>
        <SectionHeadCenter label="📊 By The Numbers" title="Impact at Scale" />
        <div className="num-grid" style={{ maxWidth: 900, margin: "0 auto" }}>
          {[
            { t: "10000", suffix: "+", lbl: "Young Innovators", c: "#0ea5e9", glow: "0 0 20px rgba(14,165,233,0.4)" },
            { t: "20", suffix: "", lbl: "Championship Events", c: "#f97316", glow: "0 0 20px rgba(249,115,22,0.4)" },
            { t: "10", suffix: "L+", pre: "₹", lbl: "Total Prize Pool", c: "#fbbf24", glow: "0 0 20px rgba(251,191,36,0.4)" },
            { t: "1000", suffix: "+", lbl: "Prize Categories", c: "#8b5cf6", glow: "0 0 20px rgba(139,92,246,0.35)" },
            { t: "100", suffix: "+", lbl: "Schools Engaged", c: "#10b981", glow: "0 0 20px rgba(16,185,129,0.35)" },
          ].map((n, i) => <NumBox key={i} n={n} />)}
        </div>
      </section>

      {/* CHALLENGES */}
      <section className="sec-pad" style={{ padding: "90px 24px", background: "#080c1a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHead label="🤖 Competition Zones" title="Challenge Arenas" desc="Diverse missions designed to test creativity, precision, programming, and teamwork across all age groups." />
          <div className="ch-grid">
            {CHALLENGES.map((c, i) => <ChallengeCard key={c.name} c={c} idx={i} />)}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {/* <section className="sec-pad" style={{ padding: "90px 24px", background: "#050810" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHead label="📸 Event Gallery" title="Moments of Innovation" desc="Snapshots of determination, teamwork, and breakthrough moments from our championship floor." />
          <div className="gallery-grid">
            {GALLERY.map((g, i) => <GalleryItem key={i} g={g} idx={i} />)}
          </div>
        </div>
      </section> */}

      {/* QUOTE */}
      {/* <section className="sec-pad" style={{ padding: "90px 24px", background: "#0a0f1e", borderTop: "1px solid rgba(14,165,233,0.08)" }}>
        <QuoteBlock />
      </section> */}
    </div>
  );
}