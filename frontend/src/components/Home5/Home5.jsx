import React, { useEffect, useRef } from "react";
import "./Home5.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const galleryItems = [
  {
    src: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&q=80&fit=crop",
    alt: "Industrial robot arm",
    label: "Industrial Robotics",
    sub: "Precision automation",
    size: "large",
    accent: "#38bdf8",
  },
  {
    src: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=600&q=80&fit=crop",
    alt: "Drone in flight",
    label: "Drone Technology",
    sub: "Aerial systems",
    size: "small",
    accent: "#a78bfa",
  },
  {
    src: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80&fit=crop",
    alt: "Circuit board close-up",
    label: "Electronics & PCB",
    sub: "Precision engineering",
    size: "small",
    accent: "#34d399",
  },
  {
    src: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=700&q=80&fit=crop",
    alt: "Student with robot",
    label: "Student Projects",
    sub: "Real builds, real learning",
    size: "medium",
    accent: "#fb923c",
  },
  {
    src: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&q=80&fit=crop",
    alt: "AI and machine learning",
    label: "Artificial Intelligence",
    sub: "Neural networks & ML",
    size: "medium",
    accent: "#38bdf8",
  },
  {
    src: "https://images.unsplash.com/photo-1615286922420-c6b348ffbd62?w=600&q=80&fit=crop",
    alt: "3D printing in action",
    label: "3D Printing",
    sub: "Rapid prototyping",
    size: "small",
    accent: "#f472b6",
  },
];

const valueProps = [
  {
    num: "01",
    tag: "Proven Expertise",
    accent: "#38bdf8",
    accentRgb: "56,189,248",
    stat: "25+",
    statLabel: "Labs Delivered",
    headline: ["Fully Operational", "Technology Labs"],
    body: "Every lab we build is precision-engineered for real-world outcomes — fully operational, rigorously tested, and handed over without compromise.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    num: "02",
    tag: "Continuity Guaranteed",
    accent: "#c084fc",
    accentRgb: "192,132,252",
    stat: "0",
    statLabel: "Institutional Overhead",
    headline: ["End-to-End", "Lab Maintenance"],
    body: "We shoulder the full operational burden — so your institution stays focused on education, not equipment. Zero overhead, uninterrupted uptime.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    num: "03",
    tag: "Future-Proof Infrastructure",
    accent: "#34d399",
    accentRgb: "52,211,153",
    stat: "∞",
    statLabel: "Free Upgrades",
    headline: ["Lifetime Equipment", "Upgrades Ensured"],
    body: "Components evolve. Your lab shouldn't fall behind. We guarantee free lifetime upgrades on all equipment — keeping you at the cutting edge, always.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

export default function Home5() {
  const rootRef = useRef();
  const headRef = useRef();

  useEffect(() => {
    const el = rootRef.current;

    const obs = new IntersectionObserver(
      ([entry]) => {
        el.style.setProperty("--play", entry.isIntersecting ? "running" : "paused");
      },
      { threshold: 0.05 }
    );
    obs.observe(el);

    const ctx = gsap.context(() => {
      gsap.fromTo(".h5-tag",       { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out",   scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true }});
      gsap.fromTo(".h5-line",      { scaleX: 0 },          { scaleX: 1, duration: 0.6, ease: "power3.out",            scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true }});
      gsap.fromTo(".h5-title-row", { opacity: 0, y: 50 },  { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: headRef.current, start: "top 80%", once: true }});
      ScrollTrigger.batch(".h5-gallery-item", {
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08, ease: "power3.out" }),
        start: "top 84%",
        once: true,
      });
      ScrollTrigger.batch(".h5-vp-card", {
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }),
        start: "top 86%",
        once: true,
      });
    }, rootRef);

    return () => {
      obs.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="h5" ref={rootRef}>
      <div className="h5-circuit" aria-hidden />
      <div className="h5-noise"   aria-hidden />
      <div className="h5-ghost"   aria-hidden>LAB</div>

      <div className="h5-inner">

        <div className="h5-head" ref={headRef}>
          <aside className="h5-aside">
            <div className="h5-aside-line" />
            <span className="h5-aside-label">Gallery</span>
          </aside>
          <div className="h5-head-content">
            <div className="h5-tag">
              <span className="h5-tag-pip" />
              Inside the Lab
            </div>
            <div className="h5-line" />
            <h2 className="h5-title">
              <span className="h5-title-row">Build.</span>
              <span className="h5-title-row h5-title-accent">Innovate.</span>
            </h2>
          </div>
        </div>

        <div className="h5-gallery">
          <div className="h5-gallery-row h5-row-1">
            <div className="h5-gallery-item h5-item-large" style={{ "--g-accent": galleryItems[0].accent }}>
              <img src={galleryItems[0].src} alt={galleryItems[0].alt} className="h5-gallery-img" />
              <div className="h5-gallery-overlay" />
              <div className="h5-gallery-scan" />
              <div className="h5-gallery-info">
                <span className="h5-gallery-label">{galleryItems[0].label}</span>
                <span className="h5-gallery-sub">{galleryItems[0].sub}</span>
              </div>
              <div className="h5-gallery-corner h5-corner-tl" />
              <div className="h5-gallery-corner h5-corner-br" />
            </div>
            <div className="h5-gallery-col">
              {galleryItems.slice(1, 3).map((item, i) => (
                <div key={i} className="h5-gallery-item h5-item-small" style={{ "--g-accent": item.accent }}>
                  <img src={item.src} alt={item.alt} className="h5-gallery-img" />
                  <div className="h5-gallery-overlay" />
                  <div className="h5-gallery-info">
                    <span className="h5-gallery-label">{item.label}</span>
                    <span className="h5-gallery-sub">{item.sub}</span>
                  </div>
                  <div className="h5-gallery-corner h5-corner-tl" />
                  <div className="h5-gallery-corner h5-corner-br" />
                </div>
              ))}
            </div>
          </div>

          <div className="h5-gallery-row h5-row-2">
            {galleryItems.slice(3, 5).map((item, i) => (
              <div key={i} className="h5-gallery-item h5-item-medium" style={{ "--g-accent": item.accent }}>
                <img src={item.src} alt={item.alt} className="h5-gallery-img" />
                <div className="h5-gallery-overlay" />
                <div className="h5-gallery-scan" />
                <div className="h5-gallery-info">
                  <span className="h5-gallery-label">{item.label}</span>
                  <span className="h5-gallery-sub">{item.sub}</span>
                </div>
                <div className="h5-gallery-corner h5-corner-tl" />
                <div className="h5-gallery-corner h5-corner-br" />
              </div>
            ))}
            <div className="h5-gallery-item h5-item-small h5-item-stat" style={{ "--g-accent": "#34d399" }}>
              <div className="h5-stat-card">
                <div className="h5-stat-ring" />
                <div className="h5-stat-row">
                  <span className="h5-stat-n">10+</span>
                  <span className="h5-stat-l">Years Training</span>
                </div>
                <div className="h5-stat-div" />
                <div className="h5-stat-row">
                  <span className="h5-stat-n">200+</span>
                  <span className="h5-stat-l">Hardware Kits</span>
                </div>
                <div className="h5-stat-div" />
                <div className="h5-stat-row">
                  <span className="h5-stat-n">48hr</span>
                  <span className="h5-stat-l">Kit Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── VALUE PROPOSITIONS ── */}
        <div className="h5-vp">
          <div className="h5-vp-eyebrow">
            <span className="h5-vp-eyebrow-pip" />
            <span className="h5-vp-eyebrow-text">More Than a Lab — A Professional School for Future Generations</span>
            <div className="h5-vp-eyebrow-rule" />
          </div>

          <div className="h5-vp-grid">
            {valueProps.map((vp, i) => (
              <div
                key={i}
                className="h5-vp-card"
                style={{
                  "--vp-accent": vp.accent,
                  "--vp-rgb": vp.accentRgb,
                }}
              >
                {/* Large ghost number watermark */}
                <span className="h5-vp-ghost">{vp.num}</span>

                {/* Scan line */}
                <div className="h5-vp-scan" />

                {/* Corner brackets */}
                <div className="h5-vp-corner h5-vp-tl" />
                <div className="h5-vp-corner h5-vp-br" />

                {/* Top row: icon + tag + stat */}
                <div className="h5-vp-top">
                  <div className="h5-vp-icon">
                    {vp.icon}
                  </div>
                  <div className="h5-vp-meta">
                    <span className="h5-vp-tag">{vp.tag}</span>
                    <div className="h5-vp-stat-inline">
                      <span className="h5-vp-stat-n">{vp.stat}</span>
                      <span className="h5-vp-stat-l">{vp.statLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h5-vp-div" />

                {/* Headline */}
                <h3 className="h5-vp-headline">
                  {vp.headline.map((line, li) => (
                    <span key={li} className="h5-vp-hline">{line}</span>
                  ))}
                </h3>

                {/* Body */}
                <p className="h5-vp-body">{vp.body}</p>

                {/* Bottom accent bar */}
                <div className="h5-vp-bar" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}