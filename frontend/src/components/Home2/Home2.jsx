import React, { useEffect, useRef, useState, useCallback } from "react";
import assets from "../../assets/assets";

const approaches = [
  {
    label: "Student",
    title: "Student-Centric Approach",
    desc: "Every concept is experienced through hands-on systems, ensuring students don't just learn technology — they learn how to think, create, and solve with it.",
    img: assets.Home4,
    accent: "#38bdf8",
  },
  {
    label: "Parent",
    title: "Parent-Centric Approach",
    desc: "Parents gain clarity, transparency, and confidence as their children progress with structured skill development aligned to real-world demands.",
    img: assets.Home5,
    accent: "#a78bfa",
  },
  {
    label: "School",
    title: "School Client-Centric Approach",
    desc: "We act as an academic and execution partner, strengthening institutional credibility through advanced technology education and consistent student outcomes.",
    img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80&fit=crop",
    accent: "#34d399",
  },
];

const SLIDE_DURATION = 5000;

export default function Home2Enhanced() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const timerRef    = useRef(null);
  const rafRef      = useRef(null);
  const startRef    = useRef(null);
  const isHovered   = useRef(false);
  const sectionRef  = useRef(null);

  const slides = [
    { id: "quote",    label: "Founder's Vision" },
    { id: "approach", label: "Our Approach" },
  ];

  // Entrance visibility
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Progress via rAF — no setInterval
  const tickProgress = useCallback(() => {
    if (isHovered.current || !startRef.current) { rafRef.current = requestAnimationFrame(tickProgress); return; }
    const elapsed = Date.now() - startRef.current;
    const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
    setProgress(pct);
    if (pct < 100) {
      rafRef.current = requestAnimationFrame(tickProgress);
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tickProgress);

    timerRef.current = setTimeout(() => {
      if (!isHovered.current) {
        setActiveSlide(prev => (prev + 1) % slides.length);
      }
    }, SLIDE_DURATION);
  }, [tickProgress]);

  useEffect(() => {
    startTimer();
    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [activeSlide]);

  const goToSlide = useCallback((next) => {
    setActiveSlide(next);
  }, []);

  const accentColor = activeSlide === 0 ? "#38bdf8" : "#34d399";

  return (
    <section ref={sectionRef} style={S.root}>
      <style>{CSS}</style>

      {/* subtle static grid bg — no animation */}
      <div style={S.grid} aria-hidden />

      {/* ══ HEADING ══ */}
      <div style={{ ...S.headSection, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
        <div style={S.eyebrow}>
          <span style={{ ...S.pip, background: accentColor }} />
          South India's Benchmark for Skill Education
        </div>
        <h2 style={S.mainTitle} className="cb-title-grad">Welcome to Cyberbots</h2>
        <div style={{ ...S.divider, background: `linear-gradient(90deg, transparent, ${accentColor}, #a78bfa, transparent)` }} />
      </div>

      {/* ══ SLIDER ══ */}
      <div
        style={{ ...S.sliderSection, opacity: visible ? 1 : 0, transition: "opacity 0.7s ease 0.2s" }}
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={() => { isHovered.current = false; }}
      >
        {/* TAB NAV */}
        <div style={S.tabNav}>
          {slides.map((sl, i) => (
            <button
              key={sl.id}
              onClick={() => goToSlide(i)}
              style={{
                ...S.tabBtn,
                borderColor: activeSlide === i ? accentColor : "rgba(255,255,255,0.08)",
                color: activeSlide === i ? accentColor : "#4a6580",
                background: activeSlide === i ? "rgba(13,28,46,0.95)" : "rgba(13,28,46,0.7)",
              }}
              aria-pressed={activeSlide === i}
            >
              <span style={{ ...S.tabDot, background: activeSlide === i ? accentColor : "#4a6580" }} />
              {sl.label}
              {activeSlide === i && (
                <span style={{ ...S.tabProgress, background: accentColor, width: `${progress}%` }} />
              )}
            </button>
          ))}
          <span style={S.slideCounter}>
            <span style={{ color: accentColor, fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 }}>0{activeSlide + 1}</span>
            <span style={{ color: "#2a3a50", margin: "0 4px" }}>/</span>
            <span style={{ color: "#2a3a50", fontFamily: "'Bebas Neue', sans-serif", fontSize: 14 }}>0{slides.length}</span>
          </span>
        </div>

        {/* SLIDE VIEWPORT — CSS grid overlap: both slides sit in cell 1/1,
             inactive slide is opacity:0 + pointer-events:none but still in flow
             so the container naturally hugs the taller of the two.             */}
        <div style={S.slideViewport}>

          {/* SLIDE 0: QUOTE */}
          <div style={{ gridArea: "1/1", opacity: activeSlide === 0 ? 1 : 0, pointerEvents: activeSlide === 0 ? "auto" : "none", transition: "opacity 0.5s ease", width: "100%" }} className="cb-quote-slide">
            {/* Photo */}
            <div style={S.photoWrap}>
              <div style={S.photoFrame}>
                <span style={{ ...S.hudCorner, top: -6, left: -6, borderTop: "1.5px solid #38bdf8", borderLeft: "1.5px solid #38bdf8" }} />
                <span style={{ ...S.hudCorner, bottom: -6, right: -6, borderBottom: "1.5px solid #a78bfa", borderRight: "1.5px solid #a78bfa" }} />
                <img src={assets.MD} alt="Vignesh Kumar Pillai" style={S.mdPhoto} loading="lazy" />
                <div style={S.photoGrad} />
                <div style={S.photoNameWrap}>
                  <span style={S.photoName}>Mr. Vignesh Kumar Pillai</span>
                  <span style={S.photoRole}>Founder · Cyberbots</span>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div style={S.quoteWrap}>
              <div style={S.quoteTagRow}>
                <span style={{ width: 28, height: 1, background: "#a78bfa", opacity: 0.5, display: "block" }} />
                <span style={S.quoteTagText}>Founder's Vision</span>
              </div>
              <span style={S.quoteMark}>"</span>
              <p style={S.quoteText}>
                Skill Development of this generation is a national need fostering a culture of
                lifelong learning — ensuring that our workforce adapts to rapidly changing technologies.
                Cultivating Responsibility in Technology to Build a Digitally Conscious Nation.
              </p>
              <div style={S.quoteAuthor}>
                <span style={S.authorName}>Mr. Vignesh Kumar Pillai</span>
                <span style={S.authorRole}>Founder, Cyberbots</span>
              </div>
            </div>
          </div>

          {/* SLIDE 1: APPROACH */}
          <div style={{ gridArea: "1/1", opacity: activeSlide === 1 ? 1 : 0, pointerEvents: activeSlide === 1 ? "auto" : "none", transition: "opacity 0.5s ease", width: "100%", padding: "40px 0" }}>
            <div style={S.approachHeader}>
              <div style={S.s2Tag}>
                <span style={{ width: 20, height: 1, background: "#34d399", opacity: 0.5, display: "inline-block" }} />
                How We Work
                <span style={{ width: 20, height: 1, background: "#34d399", opacity: 0.5, display: "inline-block" }} />
              </div>
              <h3 style={S.approachTitle}>Only Institution from TamilNadu with highest standard in Skill Education</h3>
              <p style={S.approachSub}>Three pillars that define every engagement we make</p>
            </div>
            <div style={S.cardsRow} className="cb-cards-row">
              {approaches.map((ap, i) => (
                <div key={i} style={S.approachCard} className="cb-card">
                  <div style={{ ...S.cardTopAccent, background: ap.accent }} />
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img src={ap.img} alt={ap.title} style={S.cardImg} loading="lazy" />
                    <div style={S.cardImgGrad} />
                    <div style={{ ...S.cardNum, color: ap.accent }}>0{i + 1}</div>
                  </div>
                  <div style={S.cardBody}>
                    <div style={{ ...S.cardBar, background: ap.accent }} />
                    <span style={{ ...S.cardLabel, color: ap.accent }}>{ap.label} Centric</span>
                    <h4 style={S.cardTitle}>{ap.title}</h4>
                    <p style={S.cardDesc}>{ap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* DOT NAV */}
        <div style={S.dotNav}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                ...S.dot,
                width: activeSlide === i ? 28 : 8,
                background: activeSlide === i ? accentColor : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const S = {
  root: {
    position: "relative",
    background: "transparent",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  grid: {
    position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
    opacity: 0.022,
    backgroundImage: "linear-gradient(rgba(56,189,248,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.6) 1px,transparent 1px)",
    backgroundSize: "80px 80px",
  },

  headSection: {
    position: "relative", zIndex: 2,
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "90px 24px 60px",
  },
  eyebrow: {
    fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.22em",
    textTransform: "uppercase", color: "#38bdf8",
    marginBottom: 18, display: "flex", alignItems: "center", gap: 8,
  },
  pip: {
    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
  },
  mainTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(48px, 9vw, 120px)",
    lineHeight: 0.94, letterSpacing: "0.03em", textAlign: "center",
    margin: "0 0 20px",
  },
  divider: {
    width: 80, height: 3, borderRadius: 2,
  },

  sliderSection: {
    position: "relative", zIndex: 2,
    padding: "0 5vw 80px",
  },

  tabNav: {
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
    paddingBottom: 28, paddingTop: 8,
    maxWidth: 1180, margin: "0 auto",
  },
  tabBtn: {
    position: "relative", display: "flex", alignItems: "center", gap: 8,
    padding: "9px 20px 9px 14px",
    border: "1px solid",
    borderRadius: 8, cursor: "pointer", outline: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
    transition: "border-color 0.25s, color 0.25s, background 0.25s",
    overflow: "hidden",
  },
  tabDot: {
    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
    transition: "background 0.25s",
  },
  tabProgress: {
    position: "absolute", bottom: 0, left: 0, height: 2,
    borderRadius: 1,
    // Width driven by inline style — no transition here to keep it snappy
  },
  slideCounter: {
    marginLeft: "auto", display: "flex", alignItems: "baseline",
  },

  slideViewport: {
    display: "grid",
    position: "relative", zIndex: 2,
    maxWidth: 1180, margin: "0 auto",
  },

  /* Quote slide */
  photoWrap: { display: "flex", justifyContent: "center" },
  photoFrame: {
    position: "relative", width: "100%", maxWidth: 280, aspectRatio: "0.77",
    borderRadius: 16, overflow: "hidden",
    border: "1px solid rgba(56,189,248,0.2)",
    boxShadow: "0 20px 48px rgba(0,0,0,0.35)",
  },
  hudCorner: { position: "absolute", width: 18, height: 18, zIndex: 10 },
  mdPhoto: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  photoGrad: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom, transparent 50%, rgba(7,17,31,0.88) 100%)",
  },
  photoNameWrap: { position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center" },
  photoName: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: "0.08em",
    color: "#eef2f8", display: "block", lineHeight: 1,
  },
  photoRole: {
    fontSize: 8.5, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#38bdf8", display: "block", marginTop: 4,
  },
  quoteWrap: { display: "flex", flexDirection: "column", gap: 18 },
  quoteTagRow: { display: "flex", alignItems: "center", gap: 10 },
  quoteTagText: {
    fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em",
    textTransform: "uppercase", color: "#a78bfa",
  },
  quoteMark: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 90, lineHeight: 0.7,
    color: "rgba(56,189,248,0.1)", userSelect: "none", display: "block",
  },
  quoteText: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "clamp(14px, 1.4vw, 19px)", fontWeight: 300,
    lineHeight: 1.85, color: "#c8d8e8", fontStyle: "italic",
    borderLeft: "2px solid rgba(56,189,248,0.2)", paddingLeft: 22, margin: 0,
  },
  quoteAuthor: { display: "flex", flexDirection: "column", gap: 4, paddingLeft: 22 },
  authorName: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: "#eef2f8",
  },
  authorRole: {
    fontSize: 9.5, fontWeight: 600, letterSpacing: "0.15em",
    textTransform: "uppercase", color: "#38bdf8",
  },

  /* Approach slide */
  approachHeader: {
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", marginBottom: 40,
  },
  s2Tag: {
    fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
    color: "#34d399", marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
  },
  approachTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(36px, 5vw, 68px)", letterSpacing: "0.04em",
    color: "#eef2f8", lineHeight: 1.05, marginBottom: 10, marginTop: 0,
  },
  approachSub: {
    fontSize: 13, fontWeight: 300, color: "#7a95b0",
    letterSpacing: "0.04em", margin: 0,
  },
  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 18,
  },
  approachCard: {
    position: "relative", borderRadius: 14, overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(13,28,46,0.7)",
    display: "flex", flexDirection: "column",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },
  cardTopAccent: {
    position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 2,
  },
  cardImg: { width: "100%", height: 170, objectFit: "cover", display: "block" },
  cardImgGrad: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom, transparent 40%, rgba(7,17,31,0.85) 100%)",
  },
  cardNum: {
    position: "absolute", top: 10, right: 12,
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, lineHeight: 1, opacity: 0.18,
  },
  cardBody: { padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  cardBar: { width: 26, height: 2.5, borderRadius: 2, marginBottom: 2 },
  cardLabel: { fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" },
  cardTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 21, letterSpacing: "0.04em",
    lineHeight: 1, color: "#eef2f8", margin: 0,
  },
  cardDesc: { fontSize: "12px", fontWeight: 300, lineHeight: 1.7, color: "#7a95b0", margin: 0 },

  dotNav: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    paddingTop: 36, position: "relative", zIndex: 3,
  },
  dot: {
    height: 8, borderRadius: 4, border: "none",
    cursor: "pointer", outline: "none", padding: 0,
    transition: "width 0.35s ease, background 0.35s ease",
  },
};

/* Only static CSS — no looping keyframe animations */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  .cb-title-grad {
    background: linear-gradient(120deg,#eef2f8 0%,#38bdf8 30%,#a78bfa 60%,#34d399 85%,#eef2f8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cb-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 36px rgba(0,0,0,0.35);
  }

  /* ── QUOTE SLIDE LAYOUT ── */
  .cb-quote-slide {
    display: grid !important;
    grid-template-columns: 300px 1fr;
    gap: 60px;
    align-items: center;
    padding: 40px 0;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .cb-cards-row {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 860px) {
    .cb-quote-slide {
      grid-template-columns: 1fr !important;
      gap: 32px !important;
    }
    .cb-quote-slide > div:first-child {
      max-width: 260px;
      margin: 0 auto;
    }
    .cb-cards-row {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 600px) {
    .cb-cards-row {
      grid-template-columns: 1fr 1fr !important;
      gap: 12px !important;
    }
  }

  @media (max-width: 420px) {
    .cb-cards-row {
      grid-template-columns: 1fr !important;
    }
  }
`;