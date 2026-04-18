import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import assets from "../../assets/assets";

const approaches = [
  {
    label: "Student",
    title: "Student-Centric Approach",
    desc: "Every concept is experienced through hands-on systems, ensuring students don't just learn technology — they learn how to think, create, and solve with it.",
    img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&fit=crop",
    accent: "#38bdf8",
  },
  {
    label: "Parent",
    title: "Parent-Centric Approach",
    desc: "Parents gain clarity, transparency, and confidence as their children progress with structured skill development aligned to real-world demands.",
    img: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80&fit=crop",
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
  const [prevSlide,   setPrevSlide]   = useState(null);
  const [progress,    setProgress]    = useState(0);
  const [slideIn,     setSlideIn]     = useState(true);

  const timerRef    = useRef(null);
  const progressRef = useRef(null);
  const isHovered   = useRef(false);

  const slides = [
    { id: "quote",    label: "Founder's Vision" },
    { id: "approach", label: "Our Approach" },
  ];

  const pts = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return [];
    return Array.from({ length: 8 }).map((_, i) => ({
      left: `${(i / 8) * 100 + Math.random() * 6}%`,
      delay: `${Math.random() * 12}s`,
      dur:   `${10 + Math.random() * 14}s`,
      sz:    `${2 + Math.random() * 3}px`,
      op:    0.06 + Math.random() * 0.15,
    }));
  }, []);

  const goToSlide = useCallback((next) => {
    setActiveSlide(prev => { setPrevSlide(prev); return next; });
    setProgress(0);
    setSlideIn(false);
    setTimeout(() => setSlideIn(true), 50);
  }, []);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(progressRef.current);
    setProgress(0);

    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      if (isHovered.current) return;
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
    }, 30);

    timerRef.current = setTimeout(() => {
      if (!isHovered.current) {
        setActiveSlide(prev => {
          const next = (prev + 1) % slides.length;
          setPrevSlide(prev);
          setProgress(0);
          setSlideIn(false);
          setTimeout(() => setSlideIn(true), 50);
          return next;
        });
      }
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { clearTimeout(timerRef.current); clearInterval(progressRef.current); };
  }, [activeSlide]);

  const accentColor = activeSlide === 0 ? "#38bdf8" : "#34d399";

  return (
    <section style={S.root}>
      <style>{KEYFRAMES}</style>

      {/* circuit */}
      <div style={S.circuit} aria-hidden />

      {/* particles */}
      {pts.length > 0 && (
        <div style={S.ptsWrap} aria-hidden>
          {pts.map((p, i) => (
            <span key={i} style={{
              position: "absolute", bottom: -6, left: p.left,
              width: p.sz, height: p.sz, borderRadius: "50%",
              background: ["#38bdf8","#a78bfa","#34d399"][i % 3],
              opacity: p.op,
              animation: `cbFloat ${p.dur} ${p.delay} linear infinite`,
            }} />
          ))}
        </div>
      )}

      {/* ══ HEADING ══ */}
      <div style={S.headSection}>
        <div style={S.headOrb} aria-hidden />
        <div style={S.headContent}>
          <div style={S.eyebrow}>
            <span style={S.eyebrowPip} />
            South India's Benchmark for Skill Education
          </div>
          <h2 style={S.mainTitle}>Welcome to Cyberbots</h2>
          <div style={S.divider} />
        </div>
      </div>

      {/* ══ SLIDER SECTION ══ */}
      <div
        style={S.sliderSection}
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={() => { isHovered.current = false; }}
      >
        <div style={S.sliderOrb(accentColor)} aria-hidden />

        {/* TAB NAV */}
        <div style={S.tabNav}>
          {slides.map((sl, i) => (
            <button
              key={sl.id}
              onClick={() => goToSlide(i)}
              style={{
                ...S.tabBtn,
                ...(activeSlide === i ? S.tabBtnActive : {}),
                borderColor: activeSlide === i ? accentColor : "rgba(255,255,255,0.08)",
                color: activeSlide === i ? accentColor : "#4a6580",
              }}
            >
              <span style={{ ...S.tabDot, background: activeSlide === i ? accentColor : "#4a6580", boxShadow: activeSlide === i ? `0 0 8px ${accentColor}` : "none" }} />
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

        {/* SLIDE VIEWPORT */}
        <div style={S.slideViewport}>

          {/* SLIDE 0: MD QUOTE */}
          <div style={{
            ...S.slide,
            opacity: activeSlide === 0 ? 1 : 0,
            pointerEvents: activeSlide === 0 ? "auto" : "none",
            transform: activeSlide === 0 ? (slideIn ? "translateY(0)" : "translateY(30px)") : "translateY(0)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            <div style={S.quoteSlideInner}>
              {/* Photo */}
              <div style={S.photoWrap}>
                <div style={S.photoFrame}>
                  <div style={S.hudTL} /><div style={S.hudBR} />
                  <img
                    src={assets.MD}
                    alt="Vignesh Kumar Pillai"
                    style={S.mdPhoto}
                  />
                  <div style={S.photoGrad} />
                  <div style={S.scanLine} aria-hidden />
                  <div style={S.photoNameWrap}>
                    <span style={S.photoName}>Vignesh Kumar Pillai</span>
                    <span style={S.photoRole}>Founder of · Cyberbots</span>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div style={S.quoteWrap}>
                <div style={S.quoteTagRow}>
                  <span style={S.quoteTagLine} />
                  <span style={S.quoteTagText}>Founder's Vision</span>
                </div>
                <span style={S.quoteMark}>"</span>
                <p style={S.quoteText}>
                  Skill Development of this generation is a national need fostering a culture of
                  lifelong learning — ensuring that our workforce adapts to rapidly changing technologies. Cultivating Responsibility in Technology to Build a Digitally Conscious Nation.
                </p>
                <div style={S.quoteAuthor}>
                  <span style={S.authorName}>Vignesh Kumar Pillai</span>
                  <span style={S.authorRole}>Founder of, Cyberbots</span>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 1: OUR APPROACH */}
          <div style={{
            ...S.slide,
            ...S.slideAbsolute,
            opacity: activeSlide === 1 ? 1 : 0,
            pointerEvents: activeSlide === 1 ? "auto" : "none",
            transform: activeSlide === 1 ? (slideIn ? "translateY(0)" : "translateY(30px)") : "translateY(0)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            <div style={S.approachSlideInner}>
              {/* Header */}
              <div style={S.approachHeader}>
                <div style={S.s2Tag}>
                  <span style={{ width: 24, height: 1, background: "#34d399", opacity: 0.5 }} />
                  How We Work
                  <span style={{ width: 24, height: 1, background: "#34d399", opacity: 0.5 }} />
                </div>
                <h3 style={S.approachTitle}>Only Institution from TamilNadu with highest standard in Skill Education</h3>
                <p style={S.approachSub}>Three pillars that define every engagement we make</p>
              </div>

              {/* Cards */}
              <div style={S.cardsRow}>
                {approaches.map((ap, i) => (
                  <div key={i} style={S.approachCard}>
                    <div style={{ ...S.cardTopAccent, background: ap.accent }} />
                    <div style={{ position: "relative", overflow: "hidden" }}>
                      <img src={ap.img} alt={ap.title} style={S.cardImg} />
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

        </div>

        {/* DOT NAV */}
        <div style={S.dotNav}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                ...S.dot,
                width: activeSlide === i ? 28 : 8,
                background: activeSlide === i ? accentColor : "rgba(255,255,255,0.15)",
                boxShadow: activeSlide === i ? `0 0 10px ${accentColor}` : "none",
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
    position: "relative", background: "transparent",
    overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  circuit: {
    position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.022,
    backgroundImage: "linear-gradient(rgba(56,189,248,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.6) 1px,transparent 1px)",
    backgroundSize: "80px 80px",
  },
  ptsWrap: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" },

  headSection: {
    position: "relative", minHeight: "55vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "100px 32px 70px", overflow: "hidden", zIndex: 2,
  },
  headOrb: {
    position: "absolute", width: "70vw", height: "70vw", maxWidth: 800, maxHeight: 800,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
    top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    pointerEvents: "none", zIndex: 0,
  },
  headContent: {
    position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column", alignItems: "center",
  },
  eyebrow: {
    fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.22em",
    textTransform: "uppercase", color: "#38bdf8",
    marginBottom: 18, display: "flex", alignItems: "center", gap: 8,
  },
  eyebrowPip: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#38bdf8", boxShadow: "0 0 10px #38bdf8", flexShrink: 0,
  },
  mainTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(56px, 9vw, 124px)",
    lineHeight: 0.94, letterSpacing: "0.03em", textAlign: "center",
    marginBottom: 20, marginTop: 0,
    background: "linear-gradient(120deg,#eef2f8 0%,#38bdf8 30%,#a78bfa 60%,#34d399 85%,#eef2f8 100%)",
    backgroundSize: "250% auto",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
    animation: "cbGrad 8s linear infinite",
  },
  divider: {
    width: 80, height: 3, borderRadius: 2,
    background: "linear-gradient(90deg,transparent,#38bdf8,#a78bfa,transparent)",
    margin: "0 auto",
  },

  sliderSection: {
    position: "relative", zIndex: 2,
    padding: "0 5vw 80px",
    minHeight: "85vh",
  },
  sliderOrb: (accent) => ({
    position: "absolute", width: "60vw", height: "60vw", maxWidth: 700, maxHeight: 700,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${accent}18 0%, transparent 65%)`,
    top: "10%", right: "-10%",
    pointerEvents: "none", zIndex: 0,
    transition: "background 0.8s ease",
  }),

  tabNav: {
    position: "relative", zIndex: 3,
    display: "flex", alignItems: "center", gap: 8,
    paddingBottom: 32, paddingTop: 8,
    maxWidth: 1180, margin: "0 auto",
  },
  tabBtn: {
    position: "relative", display: "flex", alignItems: "center", gap: 8,
    padding: "9px 20px 9px 14px",
    background: "rgba(13,28,46,0.7)", border: "1px solid",
    borderRadius: 8, cursor: "pointer", outline: "none",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
    transition: "border-color 0.3s, color 0.3s, background 0.3s",
    overflow: "hidden",
  },
  tabBtnActive: { background: "rgba(13,28,46,0.95)" },
  tabDot: {
    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
    transition: "background 0.3s, box-shadow 0.3s",
  },
  tabProgress: {
    position: "absolute", bottom: 0, left: 0, height: 2,
    transition: "width 0.03s linear", borderRadius: 1,
  },
  slideCounter: {
    marginLeft: "auto", display: "flex", alignItems: "baseline",
    fontFamily: "'Bebas Neue', sans-serif",
  },

  slideViewport: {
    position: "relative", zIndex: 2,
    maxWidth: 1180, margin: "0 auto",
    minHeight: 560,
  },
  slide: { position: "relative", width: "100%" },
  slideAbsolute: { position: "absolute", top: 0, left: 0, right: 0 },

  quoteSlideInner: {
    display: "grid", gridTemplateColumns: "340px 1fr", gap: 72,
    alignItems: "center",
  },
  photoWrap: { display: "flex", justifyContent: "center" },
  photoFrame: {
    position: "relative", width: 300, height: 390, borderRadius: 18, overflow: "hidden",
    border: "1px solid rgba(56,189,248,0.2)",
    boxShadow: "0 0 60px rgba(56,189,248,0.08), 0 24px 56px rgba(0,0,0,0.45)",
  },
  hudTL: {
    position: "absolute", top: -8, left: -8, width: 20, height: 20, zIndex: 10,
    borderTop: "1.5px solid #38bdf8", borderLeft: "1.5px solid #38bdf8", opacity: 0.7,
  },
  hudBR: {
    position: "absolute", bottom: -8, right: -8, width: 20, height: 20, zIndex: 10,
    borderBottom: "1.5px solid #a78bfa", borderRight: "1.5px solid #a78bfa", opacity: 0.7,
  },
  mdPhoto: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  photoGrad: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom, transparent 50%, rgba(7,17,31,0.9) 100%)",
  },
  scanLine: {
    position: "absolute", left: 0, right: 0, height: "1.5px",
    background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.6), transparent)",
    opacity: 0.5, animation: "cbScan 4s linear infinite",
  },
  photoNameWrap: { position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center" },
  photoName: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 21, letterSpacing: "0.08em",
    color: "#eef2f8", display: "block", lineHeight: 1,
  },
  photoRole: {
    fontSize: 8.5, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
    color: "#38bdf8", display: "block", marginTop: 4,
  },
  quoteWrap: { display: "flex", flexDirection: "column", gap: 20 },
  quoteTagRow: { display: "flex", alignItems: "center", gap: 10 },
  quoteTagLine: { width: 28, height: 1, background: "#a78bfa", opacity: 0.5 },
  quoteTagText: {
    fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em",
    textTransform: "uppercase", color: "#a78bfa",
  },
  quoteMark: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 100, lineHeight: 0.7,
    color: "rgba(56,189,248,0.1)", userSelect: "none", display: "block", marginBottom: -12,
  },
  quoteText: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "clamp(15px, 1.4vw, 20px)", fontWeight: 300,
    lineHeight: 1.9, color: "#c8d8e8", fontStyle: "italic",
    borderLeft: "2px solid rgba(56,189,248,0.2)", paddingLeft: 24, margin: 0,
  },
  quoteAuthor: { display: "flex", flexDirection: "column", gap: 4, paddingLeft: 24 },
  authorName: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: "#eef2f8",
  },
  authorRole: {
    fontSize: 9.5, fontWeight: 600, letterSpacing: "0.15em",
    textTransform: "uppercase", color: "#38bdf8",
  },

  approachSlideInner: { display: "flex", flexDirection: "column", gap: 48 },
  approachHeader: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  s2Tag: {
    fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
    color: "#34d399", marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
  },
  approachTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(42px, 5.5vw, 72px)", letterSpacing: "0.04em",
    color: "#eef2f8", lineHeight: 1, marginBottom: 10, marginTop: 0,
  },
  approachSub: {
    fontSize: 13.5, fontWeight: 300, color: "#7a95b0",
    letterSpacing: "0.04em", margin: 0,
  },
  cardsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  approachCard: {
    position: "relative", borderRadius: 16, overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(13,28,46,0.7)",
    display: "flex", flexDirection: "column",
    transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
    cursor: "default",
  },
  cardTopAccent: {
    position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 2,
  },
  cardImg: { width: "100%", height: 180, objectFit: "cover", display: "block", transition: "transform 0.5s ease" },
  cardImgGrad: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom, transparent 40%, rgba(7,17,31,0.88) 100%)",
  },
  cardNum: {
    position: "absolute", top: 10, right: 12,
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, lineHeight: 1, opacity: 0.18,
  },
  cardBody: { padding: "18px 20px 22px", display: "flex", flexDirection: "column", gap: 7, flex: 1 },
  cardBar: { width: 28, height: 2.5, borderRadius: 2, marginBottom: 3 },
  cardLabel: { fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" },
  cardTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 23, letterSpacing: "0.04em",
    lineHeight: 1, color: "#eef2f8", margin: 0,
  },
  cardDesc: { fontSize: "12.5px", fontWeight: 300, lineHeight: 1.75, color: "#7a95b0", margin: 0 },

  dotNav: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    paddingTop: 40, position: "relative", zIndex: 3,
  },
  dot: {
    height: 8, borderRadius: 4, border: "none",
    cursor: "pointer", outline: "none", padding: 0,
    transition: "width 0.4s ease, background 0.4s ease, box-shadow 0.4s ease",
  },
};

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  @keyframes cbFloat {
    0%   { transform: translateY(0); opacity: 0; }
    6%   { opacity: 1; }
    50%  { transform: translateY(-50vh); }
    94%  { opacity: 0.2; }
    100% { transform: translateY(-105vh); opacity: 0; }
  }
  @keyframes cbGrad {
    0%   { background-position: 0% center; }
    100% { background-position: 250% center; }
  }
  @keyframes cbScan {
    0%   { top: 0%;   opacity: 0.6; }
    100% { top: 100%; opacity: 0; }
  }

  @media (max-width: 900px) {
    .cb-quote-slide { grid-template-columns: 1fr !important; }
    .cb-cards-row   { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 600px) {
    .cb-cards-row { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
  }
`;