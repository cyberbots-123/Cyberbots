import { useState, useEffect, useRef, useCallback } from "react";
import assets from "../../assets/assets";

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════ */
const T = {
  navy:   "#051C3F",
  blue:   "#1354A8",
  sky:    "#2B7FE0",
  accent: "#3DA9FC",
  light:  "#E8F2FF",
  pale:   "#F4F8FF",
  white:  "#FFFFFF",
  text:   "#0A1628",
  muted:  "#5A7399",
  border: "#C5D9F0",
};

/* ═══════════════════════════════════════════════════════
   RESPONSIVE HOOK — debounced resize, no scroll listener
═══════════════════════════════════════════════════════ */
function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, width: w };
  });
  useEffect(() => {
    let timer;
    const update = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const w = window.innerWidth;
        setBp({ isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, width: w });
      }, 120);
    };
    window.addEventListener("resize", update, { passive: true });
    return () => { window.removeEventListener("resize", update); clearTimeout(timer); };
  }, []);
  return bp;
}

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  "System-Driven Learning", "McKinsey Frameworks", "IBM Methodologies",
  "Measurable Outcomes", "Real-World Projects", "Applied Intelligence",
  "100+ Schools", "STEM Excellence", "India-First",
];

const PHIL_ITEMS = [
  { word: "Knowledge",   sub: "introduces possibilities", body: "We expose students to the latest technologies and frameworks shaping the modern world — creating the foundation for genuine capability.", img: assets.Abt1 },
  { word: "Application", sub: "builds confidence",        body: "Every concept is immediately applied in hands-on labs, projects, and real-world challenges — never left abstract or theoretical.",         img: assets.Abt2 },
  { word: "Execution",   sub: "creates capability",       body: "Students deliver measurable outcomes that prove readiness for the real professional world — tangible, portfolio-worthy deliverables.",     img: assets.Abt3 },
];

const STATS = [
  { label: "Schools Trusted",   val: 100,    sfx: "+", sub: "Across India" },
  { label: "Students Impacted", val: 100000, sfx: "+", sub: "And growing" },
  { label: "Projects Executed", val: 8500,   sfx: "+", sub: "Real deliverables" },
  { label: "Awards Won",        val: 18,     sfx: "",  sub: "Nationally recognised" },
];

const PILLARS = [
  { n: "01", title: "System-Driven Learning",           desc: "A structured, outcome-oriented system where every concept leads to application and measurable progress — not isolated activities.", img: assets.Abt4 },
  { n: "02", title: "From Exposure to Capability",      desc: "Many programs provide exposure to technology. Cyberbots ensures students gain the genuine ability to use it effectively.",              img: assets.Abt5 },
  { n: "03", title: "Classroom to Real-World",          desc: "Programs simulate real-world problem-solving environments where students build, test, iterate and develop analytical thinking.",        img: assets.Abt6 },
  { n: "04", title: "Measurable Outcomes",              desc: "Every student's journey is structured, tracked, and evaluated. If it cannot be measured, it is not considered learning.",                img: assets.Abt7 },
  { n: "05", title: "Local Insight. Global Relevance.", desc: "We understand India's academic ecosystem deeply while aligning students with global expectations of technology and innovation.",         img: assets.Abt8 },
];

const AWARDS = [
  { name: "Best EdTech Innovation Award",     year: "2024", from: "National Education Summit, New Delhi", img: assets.Abt9  },
  { name: "Excellence in STEM Education",     year: "2023", from: "FICCI Education Excellence Awards",    img: assets.Abt10 },
  { name: "Top 10 EdTech Startups India",     year: "2023", from: "Inc42 Future of Work Summit",          img: assets.Abt11 },
  { name: "Best School Partnership Program",  year: "2022", from: "CII Education Innovation Awards",      img: assets.Abt12 },
  { name: "Most Impactful Learning Platform", year: "2022", from: "Times Education Icons",                img: assets.Abt13 },
  { name: "Digital Skilling Excellence",      year: "2021", from: "India Tech & AI Summit",               img: assets.Abt14 },
];

const STEPS = [
  { n: "01", title: "Concept Clarity",        desc: "Strong foundational understanding before application — no student proceeds without proven clarity.",                                   img: assets.Abt15, flip: false },
  { n: "02", title: "Hands-on Application",   desc: "Learning through building and doing. Every concept is applied in labs and projects, never memorised for an exam.",                    img: assets.Abt16, flip: true  },
  { n: "03", title: "Project Execution",      desc: "Real-world problem solving with tangible, portfolio-worthy deliverables that prove the student's capability.",                        img: assets.Abt17, flip: false },
  { n: "04", title: "Performance Evaluation", desc: "Measurable skill tracking and fully transparent progress reports shared with students, parents, and schools alike.",                   img: assets.Abt18, flip: true  },
];

const VM_CARDS = [
  { label: "Our Vision",     img: assets.Abt19, text: "To redefine how students learn technology — by making application the core of education, not a supplement to it." },
  { label: "Our Mission",    img: assets.Abt20, text: "To build a generation of students who are not just academically qualified, but capable of applying knowledge in real-world scenarios with clarity and confidence." },
  { label: "Our Commitment", img: assets.Abt21, text: "Structured delivery, industry-aligned skill development, measurable outcomes, and long-term student growth — without compromise." },
];

const GALLERY = [
  { src: assets.Abt22, span: 2 },
  { src: assets.Abt23, span: 1 },
  { src: assets.Abt24, span: 1 },
  { src: assets.Abt25, span: 2 },
  { src: assets.Abt26, span: 1 },
  { src: assets.Abt27, span: 1 },
];

/* ═══════════════════════════════════════════════════════
   HOOKS
   — useInView: CSS class-based reveal (no inline style thrashing)
   — useCountUp: rAF loop only while counting, cleanup on unmount
═══════════════════════════════════════════════════════ */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function useCountUp(target, active) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let rafId;
    const dur = 2000;
    const start = performance.now();
    const run = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(eased * target));
      if (p < 1) rafId = requestAnimationFrame(run);
    };
    rafId = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafId);
  }, [active, target]);
  return v;
}

/* ═══════════════════════════════════════════════════════
   PRIMITIVES — CSS class-based, no per-render inline style objects
═══════════════════════════════════════════════════════ */
function FadeUp({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div
      ref={ref}
      className={vis ? "reveal-in" : "reveal-out"}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}

function SlideIn({ children, from = "left", delay = 0, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div
      ref={ref}
      className={vis ? "reveal-in" : `slide-out-${from}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}

function Label({ n, text, light }) {
  const col    = light ? "rgba(255,255,255,.4)"  : T.muted;
  const lineClr = light ? "rgba(255,255,255,.2)" : T.border;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: col, letterSpacing: ".1em" }}>{n}</span>
      <div style={{ width: 22, height: 1, background: lineClr }} />
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: col }}>{text}</span>
    </div>
  );
}

const H2 = {
  fontFamily: "'Fraunces', serif",
  fontSize: "clamp(26px, 3.8vw, 54px)",
  fontWeight: 700, lineHeight: 1.1,
  letterSpacing: "-.02em", color: T.text, marginBottom: 20,
};
const BODY = { fontSize: 14, color: T.muted, lineHeight: 1.9, marginBottom: 14 };

/* ═══════════════════════════════════════════════════════
   PROGRESS BAR — passive scroll, transform only (compositor)
═══════════════════════════════════════════════════════ */
function ProgressBar() {
  const barRef = useRef(null);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct / 100})`;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, zIndex: 1000,
      height: 3, width: "100%",
      transformOrigin: "left center",
      background: `linear-gradient(90deg,${T.sky},${T.accent})`,
      transform: "scaleX(0)",
      willChange: "transform",
    }} ref={barRef} />
  );
}

/* ═══════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════ */
function HeroSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  const pb = isMobile ? "60px" : "80px";

  return (
    <section style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "flex-end",
      padding: `0 ${px} ${pb}`, overflow: "hidden", background: T.navy,
    }}>
      {/* Geometric layers — static, no animation */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: "-5%", width: isMobile ? "90%" : "55%", height: "100%", background: T.blue, clipPath: "polygon(18% 0,100% 0,100% 100%,0% 100%)", opacity: .35 }} />
        <div style={{ position: "absolute", top: 0, right: "-5%", width: isMobile ? "90%" : "55%", height: "100%", background: `linear-gradient(135deg,${T.sky} 0%,${T.navy} 70%)`, clipPath: "polygon(22% 0,100% 0,100% 100%,4% 100%)", opacity: .25 }} />
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: .07 }} aria-hidden="true">
          <defs>
            <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill={T.accent} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <div style={{ position: "absolute", top: "10%", right: "18%", width: isMobile ? 200 : 420, height: isMobile ? 200 : 420, borderRadius: "50%", background: `radial-gradient(circle,${T.sky}40 0%,transparent 70%)` }} />
      </div>

      {/* Right image collage */}
      {!isMobile && (
        <div className="hero-collage" style={{
          position: "absolute",
          right: isTablet ? "24px" : "72px",
          top: "50%", transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 10,
          width: isTablet ? 200 : 320,
        }}>
          <div style={{ width: "100%", height: isTablet ? 120 : 170, borderRadius: 3, overflow: "hidden", border: "1.5px solid rgba(255,255,255,.12)" }}>
            <img src={assets.Abt1} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="eager" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, height: isTablet ? 90 : 130, borderRadius: 3, overflow: "hidden", border: "1.5px solid rgba(255,255,255,.12)" }}>
              <img src={assets.Abt2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="eager" />
            </div>
            <div style={{ flex: 1, height: isTablet ? 90 : 130, borderRadius: 3, overflow: "hidden", border: "1.5px solid rgba(255,255,255,.12)" }}>
              <img src={assets.Abt3} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="eager" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: isMobile ? "100%" : isTablet ? 420 : 600 }}>
        <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: isMobile ? 20 : 32 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.45)" }}>Cyberbots · About Us</span>
        </div>

        {[
          { t: "Where Learning Is", w: 400, c: "rgba(255,255,255,.5)", i: true,  d: 1 },
          { t: "Validated By",      w: 700, c: "#fff",                i: false, d: 2 },
          { t: "What You Can Do.",  w: 700, c: T.accent,              i: true,  d: 3 },
        ].map((line, i) => (
          <div key={i} style={{ overflow: "hidden" }}>
            <h1
              className={`hero-line hero-line-${line.d}`}
              style={{
                fontFamily: "'Fraunces',serif",
                fontSize: isMobile ? "clamp(32px,10vw,48px)" : isTablet ? "clamp(36px,6vw,60px)" : "clamp(42px,6vw,80px)",
                fontWeight: line.w, lineHeight: 1.05,
                letterSpacing: "-.025em", color: line.c,
                fontStyle: line.i ? "italic" : "normal", margin: 0,
              }}
            >{line.t}</h1>
          </div>
        ))}

        <p className="hero-body" style={{ fontSize: 14, color: "rgba(255,255,255,.45)", lineHeight: 1.85, maxWidth: 380, margin: `${isMobile ? 18 : 28}px 0 ${isMobile ? 24 : 36}px` }}>
          Benchmark in Project Based Learning recognized for industry grade execution within classrooms by transforming conventional schooling systems to professional schools aligned with global standards.
        </p>

        <div className="hero-stats" style={{ display: "flex", gap: isMobile ? 24 : 40, flexWrap: "wrap" }}>
          {[["100+", "Schools"], ["1 Lakh+", "Students"], ["18+", "Awards"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 28 : 36, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TICKER — CSS only, no JS
═══════════════════════════════════════════════════════ */
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ background: T.blue, padding: "13px 0", overflow: "hidden" }}>
      <div className="ticker-track">
        {items.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "0 28px", fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", whiteSpace: "nowrap" }}>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: T.accent, display: "inline-block" }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WHO WE ARE
═══════════════════════════════════════════════════════ */
function WhoSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  return (
    <section style={{ padding: `80px ${px}`, background: T.white }}>
      <div style={{
        maxWidth: 1120, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr",
        gap: isMobile ? 48 : 88, alignItems: "center",
      }}>
        <SlideIn from="left">
          <Label n="01" text="Who We Are" />
          <h2 style={H2}>Academic Learning<br />Meets<br /><em style={{ color: T.sky, fontStyle: "italic" }}>Practical Execution</em></h2>
          <p style={BODY}>Cyberbots is not an edutech company. It is a structured learning system designed to build real-world capability in students — operating at the intersection of academic learning and practical execution.</p>
          <p style={BODY}>Our approach integrates globally benchmarked frameworks inspired by McKinsey & Company and IBM, adapted to the realities of school education in India.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
            {["McKinsey Frameworks", "IBM Methodologies", "India-First"].map(t => (
              <span key={t} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", border: `1.5px solid ${T.sky}`, color: T.blue, padding: "5px 14px", borderRadius: 2 }}>{t}</span>
            ))}
          </div>
        </SlideIn>

        <SlideIn from={isMobile ? "left" : "right"} delay={isMobile ? 0 : .15}>
          <div style={{ position: "relative" }}>
            <div style={{ width: "100%", height: isMobile ? 220 : 400, borderRadius: 4, overflow: "hidden" }}>
              <img src={assets.Abt4} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} loading="lazy" />
            </div>
            <div style={{ position: "absolute", inset: 0, borderRadius: 4, background: `linear-gradient(135deg,${T.navy}44,transparent)`, pointerEvents: "none" }} />
            <div style={{
              position: "absolute", top: 24,
              right: isMobile ? 12 : -22,
              background: T.blue, color: "#fff",
              padding: "16px 20px", borderRadius: 3, textAlign: "center",
              boxShadow: `0 12px 40px ${T.navy}55`,
            }}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 30 : 40, fontWeight: 700, lineHeight: 1 }}>100+</div>
              <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", opacity: .7, marginTop: 4 }}>Schools</div>
            </div>
            <div style={{ position: "absolute", bottom: -16, left: 32, right: 32, height: 4, borderRadius: 2, background: `linear-gradient(90deg,${T.sky},${T.accent})` }} />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PHILOSOPHY
═══════════════════════════════════════════════════════ */
function PhilosophySection() {
  const [active, setActive] = useState(0);
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  return (
    <section style={{ background: T.navy, padding: `80px ${px}` }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <FadeUp>
          <Label n="02" text="Our Philosophy" light />
          <h2 style={{ ...H2, color: "#fff" }}>
            Learning Is Not Complete<br /><em style={{ color: T.accent, fontStyle: "italic" }}>Until It Is Applied</em>
          </h2>
        </FadeUp>
        <FadeUp delay={.15}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr",
            gap: 3, marginTop: 48,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {PHIL_ITEMS.map((item, i) => (
                <div key={i} onClick={() => setActive(i)}
                  style={{
                    padding: isMobile ? "24px 20px" : "38px 40px", cursor: "pointer",
                    background: active === i ? T.blue : "rgba(255,255,255,.03)",
                    borderLeft: active === i ? `3px solid ${T.accent}` : "3px solid transparent",
                    transition: "background .25s, border-color .25s",
                  }}>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, color: active === i ? "#fff" : "rgba(255,255,255,.38)", marginBottom: 5, transition: "color .25s" }}>{item.word}</div>
                  <div style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: active === i ? T.accent : "rgba(255,255,255,.2)", transition: "color .25s" }}>{item.sub}</div>
                  {active === i && <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.8, marginTop: 14 }}>{item.body}</p>}
                </div>
              ))}
            </div>

            {!isMobile && (
              <div style={{ position: "relative", overflow: "hidden", minHeight: isTablet ? 300 : 440 }}>
                {PHIL_ITEMS.map((item, i) => (
                  <div key={i} style={{
                    position: "absolute", inset: 0,
                    opacity: active === i ? 1 : 0,
                    transition: "opacity .4s ease",
                    pointerEvents: "none",
                    willChange: "opacity",
                  }}>
                    <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${T.navy}66,transparent 60%)`, pointerEvents: "none" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   STATS — count-up only, no hover layer promotion
═══════════════════════════════════════════════════════ */
function StatBlock({ stat, delay }) {
  const [ref, vis] = useInView(.35);
  const count = useCountUp(stat.val, vis);
  const [hov, setHov] = useState(false);
  const { isMobile } = useBreakpoint();
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRight: `1px solid ${T.border}`, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
        padding: isMobile ? "32px 20px" : "52px 36px",
        position: "relative", overflow: "hidden",
        background: hov ? T.light : T.white,
        transition: `background .25s, opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(20px)",
      }}>
      {/* Top accent bar — opacity toggle avoids layout */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${T.sky},${T.accent})`, opacity: hov ? 1 : 0, transition: "opacity .25s" }} />
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? "clamp(32px,8vw,52px)" : "clamp(40px,4vw,64px)", fontWeight: 700, color: T.blue, lineHeight: 1, letterSpacing: "-.03em" }}>
        {count.toLocaleString()}{stat.sfx}
      </div>
      <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600, color: T.text, marginTop: 10 }}>{stat.label}</div>
      <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{stat.sub}</div>
    </div>
  );
}

function StatsSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  return (
    <section style={{ padding: `0 ${px}`, background: T.white }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
          borderLeft: `1px solid ${T.border}`,
        }}>
          {STATS.map((s, i) => <StatBlock key={i} stat={s} delay={i * .1} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PILLARS — thumbnail reveal uses opacity + width (no scale)
═══════════════════════════════════════════════════════ */
function PillarRow({ item, delay, last }) {
  const [hov, setHov] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  return (
    <FadeUp delay={delay}>
      <div
        onMouseEnter={() => !isSmall && setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "grid",
          gridTemplateColumns: isSmall ? "48px 1fr" : hov ? "64px 1fr 1fr 140px" : "64px 1fr 1fr 0px",
          gap: isSmall ? 16 : 24,
          alignItems: "center",
          padding: isMobile ? "20px 16px" : isTablet ? "22px 24px" : "26px 32px",
          border: `1px solid ${T.border}`,
          borderBottom: last ? `1px solid ${T.border}` : "none",
          background: hov ? T.light : T.white,
          transition: "background .25s, grid-template-columns .28s ease",
          cursor: "default", overflow: "hidden",
        }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 24 : 32, fontWeight: 700, color: hov ? T.sky : T.border, transition: "color .25s" }}>{item.n}</div>
        {isSmall ? (
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 16 : 18, fontWeight: 700, color: T.text, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.75 }}>{item.desc}</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 19, fontWeight: 700, color: T.text }}>{item.title}</div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.75 }}>{item.desc}</div>
            <div style={{
              width: hov ? 140 : 0,
              height: 82,
              borderRadius: 3, overflow: "hidden",
              opacity: hov ? 1 : 0,
              transition: "opacity .28s ease, width .28s ease",
            }}>
              <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
            </div>
          </>
        )}
      </div>
    </FadeUp>
  );
}

function PillarsSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  return (
    <section style={{ padding: `80px ${px}`, background: T.pale }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
            <div>
              <Label n="03" text="What Makes Us Different" />
              <h2 style={{ ...H2, margin: 0 }}>Five Pillars of<br />the Cyberbots <em style={{ color: T.sky, fontStyle: "italic" }}>System</em></h2>
            </div>
            {!isMobile && (
              <p style={{ ...BODY, maxWidth: 270, margin: 0 }}>Each pillar reinforces the others — forming a system that consistently produces measurable, real-world capability.</p>
            )}
          </div>
        </FadeUp>
        {PILLARS.map((p, i) => <PillarRow key={i} item={p} delay={i * .07} last={i === PILLARS.length - 1} />)}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   AWARDS — 3D flip removed on mobile; opacity fade instead
   Desktop keeps flip but uses will-change only while hovered
═══════════════════════════════════════════════════════ */
function AwardCard({ award, delay, idx }) {
  const [flipped, setFlipped] = useState(false);
  const { isMobile } = useBreakpoint();
  const cols = [T.navy, T.blue, T.sky, "#0D3B7E", "#1A5FAD", "#0A2A60"];
  const col = cols[idx % cols.length];
  const cardH = isMobile ? 230 : 270;

  if (isMobile) {
    // Lightweight fade-flip on mobile — no 3D perspective
    return (
      <FadeUp delay={delay}>
        <div onClick={() => setFlipped(f => !f)}
          style={{ height: cardH, position: "relative", cursor: "pointer", borderRadius: 3, overflow: "hidden" }}>
          {/* Front */}
          <div style={{ position: "absolute", inset: 0, opacity: flipped ? 0 : 1, transition: "opacity .3s ease", pointerEvents: flipped ? "none" : "auto" }}>
            <img src={award.img} alt={award.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top,${T.navy}CC 0%,transparent 55%)` }} />
            <div style={{ position: "absolute", top: 12, right: 12, background: col, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 1 }}>{award.year}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 20px" }}>
              <div style={{ width: 22, height: 2, background: T.accent, marginBottom: 8 }} />
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{award.name}</div>
            </div>
          </div>
          {/* Back */}
          <div style={{
            position: "absolute", inset: 0, opacity: flipped ? 1 : 0,
            transition: "opacity .3s ease", background: col,
            display: "flex", flexDirection: "column", justifyContent: "center", padding: "26px 22px",
            pointerEvents: flipped ? "auto" : "none",
          }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 48, fontWeight: 700, color: "rgba(255,255,255,.1)", lineHeight: 1, marginBottom: 8 }}>{award.year}</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 14 }}>{award.name}</div>
            <div style={{ width: 24, height: 1.5, background: "rgba(255,255,255,.3)", marginBottom: 12 }} />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.65 }}>{award.from}</div>
            <div style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: ".1em" }}>TAP TO FLIP BACK</div>
          </div>
        </div>
      </FadeUp>
    );
  }

  return (
    <FadeUp delay={delay}>
      <div
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        style={{ height: cardH, perspective: 900, cursor: "pointer" }}>
        <div style={{
          position: "relative", width: "100%", height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform .55s cubic-bezier(.22,1,.36,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          willChange: flipped ? "transform" : "auto",
        }}>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 3, overflow: "hidden" }}>
            <img src={award.img} alt={award.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top,${T.navy}CC 0%,transparent 55%)` }} />
            <div style={{ position: "absolute", top: 12, right: 12, background: col, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 1 }}>{award.year}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 20px" }}>
              <div style={{ width: 22, height: 2, background: T.accent, marginBottom: 8 }} />
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{award.name}</div>
            </div>
          </div>
          <div style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: col, borderRadius: 3,
            display: "flex", flexDirection: "column", justifyContent: "center", padding: "26px 22px",
          }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 48, fontWeight: 700, color: "rgba(255,255,255,.1)", lineHeight: 1, marginBottom: 8 }}>{award.year}</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 14 }}>{award.name}</div>
            <div style={{ width: 24, height: 1.5, background: "rgba(255,255,255,.3)", marginBottom: 12 }} />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.65 }}>{award.from}</div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

function AwardsSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  const cols = isMobile ? "repeat(1,1fr)" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)";
  return (
    <section style={{ background: T.light, padding: `80px ${px}` }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <FadeUp style={{ marginBottom: 48 }}>
          <Label n="04" text="Award Recognition" />
          <h2 style={H2}>Recognised for <em style={{ color: T.sky, fontStyle: "italic" }}>Excellence</em><br />in Education</h2>
          {isMobile && <p style={{ ...BODY, marginTop: 8, marginBottom: 0 }}>Tap any card to see details.</p>}
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 14 }}>
          {AWARDS.map((a, i) => <AwardCard key={i} award={a} delay={i * .08} idx={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   GALLERY — scale only (no filter), contain paint layer
═══════════════════════════════════════════════════════ */
function GalleryCell({ src, span }) {
  const [hov, setHov] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const realSpan = isMobile ? 3 : isTablet ? 3 : span;
  return (
    <div
      style={{ gridColumn: `span ${realSpan}`, overflow: "hidden", borderRadius: 4, cursor: "zoom-in", contain: "paint" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <img src={src} alt=""
        style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
          transform: hov ? "scale(1.05)" : "scale(1)",
          transition: "transform .5s cubic-bezier(.22,1,.36,1)",
          willChange: hov ? "transform" : "auto",
        }} />
    </div>
  );
}

function GallerySection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  const rowH = isMobile ? 190 : isTablet ? 230 : 240;
  const gridCols = isMobile || isTablet ? "1fr" : "repeat(3,1fr)";
  return (
    <section style={{ padding: `80px ${px}`, background: T.white }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <FadeUp style={{ marginBottom: 48 }}>
          <Label n="05" text="Life at Cyberbots" />
          <h2 style={H2}>Where Every Classroom<br /><em style={{ color: T.sky, fontStyle: "italic" }}>Becomes a Lab</em></h2>
        </FadeUp>
        <FadeUp delay={.12}>
          <div style={{ display: "grid", gridTemplateColumns: gridCols, gridAutoRows: rowH, gap: 10 }}>
            {GALLERY.map((g, i) => <GalleryCell key={i} src={g.src} span={g.span} />)}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   APPROACH — image scale on hover (compositor only)
═══════════════════════════════════════════════════════ */
function ApproachRow({ step, delay, last }) {
  const [hov, setHov] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;

  const textCol = (
    <div style={{ padding: isMobile ? "32px 24px" : isTablet ? "40px 36px" : "56px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 48 : 68, fontWeight: 700, lineHeight: 1, marginBottom: 6, color: hov ? T.blue : T.border, transition: "color .3s" }}>{step.n}</div>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(18px,2.2vw,29px)", fontWeight: 700, color: T.text, marginBottom: 12, letterSpacing: "-.015em" }}>{step.title}</div>
      <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.85, marginBottom: 18 }}>{step.desc}</p>
      <div style={{ height: 2.5, borderRadius: 2, background: `linear-gradient(90deg,${T.sky},${T.accent})`, width: hov ? 56 : 24, transition: "width .35s cubic-bezier(.22,1,.36,1)" }} />
    </div>
  );

  const imgH = isMobile ? 210 : isTablet ? 260 : "100%";
  const imgCol = (
    <div style={{ position: "relative", overflow: "hidden", minHeight: isMobile ? 210 : isTablet ? 260 : 300, contain: "paint" }}>
      <img src={step.img} alt=""
        style={{
          width: "100%", height: imgH, objectFit: "cover",
          display: "block",
          transform: hov ? "scale(1.04)" : "scale(1)",
          transition: "transform .55s cubic-bezier(.22,1,.36,1)",
          willChange: hov ? "transform" : "auto",
        }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${T.navy}33,transparent)`, pointerEvents: "none" }} />
    </div>
  );

  return (
    <FadeUp delay={delay}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          display: "grid",
          gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr",
          border: `1px solid ${T.border}`,
          borderBottom: last ? `1px solid ${T.border}` : "none",
          overflow: "hidden",
          background: hov ? T.light : T.white,
          transition: "background .25s",
        }}>
        {isSmall ? <>{textCol}{imgCol}</> : step.flip ? <>{imgCol}{textCol}</> : <>{textCol}{imgCol}</>}
      </div>
    </FadeUp>
  );
}

function ApproachSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  return (
    <section style={{ padding: `80px ${px}`, background: T.pale }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <FadeUp style={{ marginBottom: 48 }}>
          <Label n="06" text="Our Approach" />
          <h2 style={H2}>Structured Thinking →<br />Applied Learning →<br /><em style={{ color: T.sky, fontStyle: "italic" }}>Proven Outcomes</em></h2>
        </FadeUp>
        {STEPS.map((s, i) => <ApproachRow key={i} step={s} delay={i * .08} last={i === STEPS.length - 1} />)}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   VISION / MISSION / COMMITMENT — backdrop-filter removed
═══════════════════════════════════════════════════════ */
function VMCard({ card, delay, idx }) {
  const [hov, setHov] = useState(false);
  const { isMobile } = useBreakpoint();
  const accents = [T.navy, T.blue, T.sky];
  const col = accents[idx];
  const imgH = isMobile ? 180 : 210;

  return (
    <FadeUp delay={delay}>
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 3, overflow: "hidden",
          boxShadow: hov ? `0 18px 44px ${T.navy}22` : `0 4px 18px ${T.navy}11`,
          transform: hov ? "translateY(-5px)" : "translateY(0)",
          transition: "box-shadow .35s, transform .35s cubic-bezier(.22,1,.36,1)",
          willChange: hov ? "transform" : "auto",
        }}>
        <div style={{ height: imgH, overflow: "hidden", position: "relative", contain: "paint" }}>
          <img src={card.img} alt=""
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              display: "block",
              transform: hov ? "scale(1.05)" : "scale(1)",
              transition: "transform .5s ease",
              willChange: hov ? "transform" : "auto",
            }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom,transparent 35%,${col}CC)`, pointerEvents: "none" }} />
          {/* Label: replaced backdrop-filter blur with solid semi-transparent bg */}
          <div style={{
            position: "absolute", bottom: 16, left: 18,
            fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase",
            color: "#fff", background: "rgba(0,0,0,.38)",
            padding: "5px 13px", borderRadius: 2, border: "1px solid rgba(255,255,255,.2)",
          }}>{card.label}</div>
        </div>
        <div style={{ padding: "22px 24px 28px", background: T.white, borderTop: `3px solid ${col}` }}>
          <p style={{ fontSize: 14, color: "#3A506B", lineHeight: 1.85, margin: 0 }}>{card.text}</p>
        </div>
      </div>
    </FadeUp>
  );
}

function VisionSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  const cols = isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)";
  return (
    <section style={{ padding: `80px ${px}`, background: T.white }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <FadeUp style={{ marginBottom: 44 }}>
          <Label n="07" text="Vision · Mission · Commitment" />
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 16 }}>
          {VM_CARDS.map((c, i) => <VMCard key={i} card={c} delay={i * .1} idx={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CLOSING
═══════════════════════════════════════════════════════ */
function ClosingSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "24px" : isTablet ? "40px" : "72px";
  return (
    <section style={{ position: "relative", padding: `80px ${px}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: T.navy }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .06 }} aria-hidden="true">
          <defs>
            <pattern id="cdots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill={T.accent} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cdots)" />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: isMobile ? 320 : 700, height: isMobile ? 320 : 700, borderRadius: "50%", background: `radial-gradient(circle,${T.blue}55 0%,transparent 70%)` }} />
      </div>
      <FadeUp>
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: isMobile ? "100%" : 740 }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 72 : 110, color: "rgba(255,255,255,.05)", lineHeight: .75, fontWeight: 700, marginBottom: -18 }}>"</div>
          <blockquote style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? "clamp(18px,5vw,26px)" : "clamp(20px,2.8vw,42px)", fontWeight: 600, fontStyle: "italic", color: "#fff", lineHeight: 1.48, letterSpacing: "-.02em", margin: "0 0 32px" }}>
            Cyberbots is where learning is validated not by what a student knows, but by what a student can do.
          </blockquote>
          <div style={{ width: 44, height: 2.5, background: `linear-gradient(90deg,${T.sky},${T.accent})`, margin: "0 auto 18px", borderRadius: 2 }} />
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>— Cyberbots</p>
        </div>
      </FadeUp>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   GLOBAL CSS
   — reveal classes keep transitions off the main thread
   — will-change used sparingly and only on active elements
   — prefers-reduced-motion respected
═══════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600;1,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; }
  img  { display: block; }

  /* ── Reveal system ── */
  .reveal-out {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1);
  }
  .reveal-in {
    opacity: 1;
    transform: none;
    transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1);
  }
  .slide-out-left {
    opacity: 0;
    transform: translateX(-32px);
    transition: opacity .75s cubic-bezier(.22,1,.36,1), transform .75s cubic-bezier(.22,1,.36,1);
  }
  .slide-out-right {
    opacity: 0;
    transform: translateX(32px);
    transition: opacity .75s cubic-bezier(.22,1,.36,1), transform .75s cubic-bezier(.22,1,.36,1);
  }

  /* ── Hero entry animations (CSS-only, no JS) ── */
  .hero-badge  { animation: fadeUp .55s ease .1s both; }
  .hero-line-1 { animation: slideUp .7s cubic-bezier(.22,1,.36,1) .18s both; }
  .hero-line-2 { animation: slideUp .7s cubic-bezier(.22,1,.36,1) .30s both; }
  .hero-line-3 { animation: slideUp .7s cubic-bezier(.22,1,.36,1) .42s both; }
  .hero-body   { animation: fadeUp .6s ease .58s both; }
  .hero-stats  { animation: fadeUp .6s ease .72s both; }
  .hero-collage{ animation: fadeRight .85s cubic-bezier(.22,1,.36,1) .6s both; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeRight {
    from { opacity: 0; transform: translateY(-50%) translateX(20px); }
    to   { opacity: 1; transform: translateY(-50%) translateX(0); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(100%); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Ticker ── */
  .ticker-track {
    display: flex;
    width: max-content;
    animation: ticker 26s linear infinite;
    will-change: transform;
  }
  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-33.333%); }
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
    .reveal-out { opacity: 1; transform: none; }
    .ticker-track { animation: none; }
  }

  @media (max-width: 639px) {
    section { overflow-x: hidden; }
  }
  @media (hover: none) {
    * { -webkit-tap-highlight-color: transparent; }
  }
`;

/* ═══════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════ */
export default function CyberbotsAboutBlue() {
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: T.white, color: T.text, overflowX: "hidden" }}>
      <style>{CSS}</style>
      <ProgressBar />
      <HeroSection />
      <Ticker />
      <WhoSection />
      <PhilosophySection />
      <StatsSection />
      <PillarsSection />
      <AwardsSection />
      <GallerySection />
      <ApproachSection />
      <VisionSection />
      <ClosingSection />
    </div>
  );
}