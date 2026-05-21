import React, {
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  startTransition,
} from "react";
import "./Home1.css";
import gsap from "gsap";
import assets from "../../assets/assets";

const slides = [
  {
    tag: "Learn what you can do in future",
    title: ["CYBERBOTS →"],
    sub: ["Structured Experimentation . Industry Relevant Execution . A Disciplined framework for Learning"],
    body: "Cyberbots is built on the premise that students should not just learn technology — they should demonstrate functional capability aligned with industry expectations.",
    cta: "View Courses",
    stat: [{ n: "10+", l: "Years" }, { n: "100+", l: "Schools" }, { n: "1 Lakh+", l: "Graduates" }],
    accent: "#38bdf8",
    image: assets.Home1,
    imageAlt: "Advanced humanoid robot",
  },
  {
    tag: "Robotics lab is not a room. It is an academic system",
    title: ["Transform Learning with our", "Turnkey Solutions"],
    sub: "Learn. Solder. Deploy.",
    body: "Complete turnkey solution for Robotics, Coding & STEM labs. Trusted by 100+ schools across South India. Setup in just 15 days.",
    cta: "Get free Lab Consultation",
    stat: [{ n: "10+", l: "Courses" }, { n: "98%", l: "Placement" }, { n: "4.9★", l: "Rating" }],
    accent: "#a78bfa",
    image: assets.Home2,
    imageAlt: "Student programming a robot",
  },
  {
    tag: "Maker Culture",
    title: ["Robots,", "Drones & IoT"],
    sub: "Real Kits. Real Projects.",
    body: "Premium hardware kits — Arduino, ESP32, servo motors, drones — shipped to your door. Build something that actually moves.",
    cta: "Shop Kits",
    stat: [{ n: "300+", l: "Kit Types" }, { n: "48hr", l: "Delivery" }, { n: "ISO", l: "Certified" }],
    accent: "#34d399",
    image: assets.Home3,
    imageAlt: "Drone technology and IoT devices",
  },
];

const DURATION = 5000;

export default function Home1() {
  const rootRef      = useRef();
  const contentRef   = useRef();
  const imgFrameRef  = useRef();
  const barTweenRef  = useRef(null); // FIX: store GSAP tween for the bar
  const intervalRef  = useRef(null);
  const isVisible    = useRef(true);
  const gsapCtxRef   = useRef(null); // FIX: single persistent context ref

  const [idx, setIdx] = useState(0);
  const slide = slides[idx];

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      // FIX: wrap auto-slide in startTransition — it's non-urgent UI work
      startTransition(() => {
        setIdx(p => (p + 1) % slides.length);
      });
    }, DURATION);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  // Mount / unmount timer
  useLayoutEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  // Pause when tab hidden
  useLayoutEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) stopTimer();
      else if (isVisible.current) startTimer();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [startTimer, stopTimer]);

  // Pause when scrolled out of view
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting) startTimer(); else stopTimer();
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startTimer, stopTimer]);

  // FIX: useLayoutEffect instead of useEffect for GSAP
  // Runs synchronously after DOM mutations — no single-frame flash of un-animated state
  useLayoutEffect(() => {
    // ── Image animations ──────────────────────────────────────
    if (imgFrameRef.current) {
      gsap.killTweensOf(imgFrameRef.current);
      gsap.fromTo(
        imgFrameRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }

    const el = contentRef.current;
    if (!el) return;

    // FIX: revert previous context before creating a new one —
    // ctx.revert() already kills all its tweens, so no need for
    // the separate gsap.killTweensOf(querySelectorAll(...)) call
    if (gsapCtxRef.current) gsapCtxRef.current.revert();

    gsapCtxRef.current = gsap.context(() => {
      const tl = gsap.timeline();
      tl.set(
        ".h1-tag,.h1-line,.h1-title-row,.h1-sub,.h1-body,.h1-cta,.h1-stat",
        { opacity: 0, y: 30 }
      )
        .to(".h1-tag",       { opacity: 1, y: 0, duration: 0.4,  ease: "power2.out" },           0.1)
        .to(".h1-line",      { opacity: 1, y: 0, scaleX: 1, duration: 0.5, ease: "power3.out" }, 0.15)
        .to(".h1-title-row", { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "expo.out" }, 0.2)
        .to(".h1-sub",       { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },           0.38)
        .to(".h1-body",      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },           0.46)
        .to(".h1-cta",       { opacity: 1, y: 0, duration: 0.4,  ease: "back.out(1.4)" },        0.54)
        .to(".h1-stat",      { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" }, 0.6);
    }, el);

    // FIX: Use a GSAP tween for the progress bar instead of the
    // double-rAF CSS-transition-reset hack. Cleaner and jank-free.
    if (barTweenRef.current) barTweenRef.current.kill();
    if (contentRef.current) { // use contentRef as a guard that DOM is ready
      const barEl = document.querySelector(".h1-bar-fill");
      if (barEl) {
        barTweenRef.current = gsap.fromTo(
          barEl,
          { scaleX: 0 },
          { scaleX: 1, duration: DURATION / 1000, ease: "none" }
        );
      }
    }

    return () => {
      if (gsapCtxRef.current) {
        gsapCtxRef.current.revert();
        gsapCtxRef.current = null;
      }
    };
  }, [idx]);

  const goTo = i => {
    stopTimer();
    setIdx(i);
    setTimeout(startTimer, 80);
  };

  return (
    <section
      className="h1"
      ref={rootRef}
      style={{ "--accent": slide.accent }}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      <div className="h1-circuit" aria-hidden />
      <div className="h1-ghost" aria-hidden>0{idx + 1}</div>



      <div className="h1-grid">

        <aside className="h1-aside">
          <div className="h1-aside-line" />
          {slides.map((_, i) => (
            <button
              key={i}
              className={`h1-aside-num${i === idx ? " on" : ""}`}
              onClick={() => goTo(i)}
            >
              0{i + 1}
            </button>
          ))}
        </aside>

        <div className="h1-content" ref={contentRef}>
          <div className="h1-tag">
            <span className="h1-tag-pip" />
            {slide.tag}
          </div>
          <div className="h1-line" />
          <h1 className="h1-title">
            {slide.title.map((t, i) => (
              <span key={i} className="h1-title-row">{t}</span>
            ))}
          </h1>
          <p className="h1-sub">{slide.sub}</p>
          <p className="h1-body">{slide.body}</p>
          <div className="h1-cta">
            <button className="h1-btn-fill">
              {slide.cta}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M7.5 3l4 4-4 4"
                  stroke="currentColor" strokeWidth="1.75"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="h1-btn-line">Contact Us</button>
          </div>
          <div className="h1-stats">
            {slide.stat.map((s, i) => (
              <div key={i} className="h1-stat">
                <span className="h1-stat-n">{s.n}</span>
                <span className="h1-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── DESKTOP RIGHT PANEL ── */}
        <div className="h1-panel">
          <div className="h1-hud h1-hud-tl" aria-hidden />
          <div className="h1-hud h1-hud-tr" aria-hidden />
          <div className="h1-hud h1-hud-bl" aria-hidden />
          <div className="h1-hud h1-hud-br" aria-hidden />

          <div className="h1-img-frame" ref={imgFrameRef}>
            <img src={slide.image} alt={slide.imageAlt} className="h1-img" />
            <div className="h1-img-overlay" />
            <div className="h1-badge">
              <span className="h1-badge-dot" />
              <span className="h1-badge-text">LIVE TRAINING</span>
            </div>
            <div className="h1-img-stat">
              <span className="h1-img-stat-n">{slide.stat[0].n}</span>
              <span className="h1-img-stat-l">{slide.stat[0].l}</span>
            </div>
          </div>

          <div className="h1-panel-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`h1-panel-dot${i === idx ? " on" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* FIX: bar-fill is now driven by GSAP (no CSS transition needed) */}
      <div className="h1-bar">
        <div className="h1-bar-fill" />
      </div>
    </section>
  );
}