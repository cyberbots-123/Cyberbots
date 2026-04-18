import React, { useEffect, useRef } from "react";
import "./Home4.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Real Hardware Only",
    desc: "No simulations. Students solder, wire, and program actual components from their very first session.",
    accent: "#38bdf8",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80&fit=crop",
    imageAlt: "Electronic components and soldering",
  },
  {
    title: "Industry- Grade educators",
    desc: "50+ certified robotics engineers and STEM educators with proven real-world industry experience.",
    accent: "#a78bfa",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80&fit=crop",
    imageAlt: "Expert robotics instructor",
  },
  {
    title: "Kits Delivered to You",
    desc: "Premium robotics kits — Arduino, Raspberry Pi, servo motors, sensors — shipped within 48 hours.",
    accent: "#34d399",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&q=80&fit=crop",
    imageAlt: "Robotics kit components",
  },
  {
    title: "Flexible Schedule",
    desc: "Self-paced video lessons plus weekly live build sessions — learn anytime, from anywhere.",
    accent: "#fb923c",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&q=80&fit=crop",
    imageAlt: "Online learning flexibility",
  },
];

const stats = [
  {
    value: "1 Lakh+", label: "Students Trained", accent: "#38bdf8",
    icon: (<svg viewBox="0 0 32 32" fill="none"><path d="M16 4l2 6h6l-5 3.6 1.9 6L16 16l-4.9 3.6 1.9-6L8 10h6L16 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 26c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>),
  },
  {
    value: "300+", label: "Kit Types", accent: "#a78bfa",
    icon: (<svg viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M4 11h24" stroke="currentColor" strokeWidth="1.3"/><path d="M10 17h12M10 21h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>),
  },
  {
    value: "98%", label: "Satisfaction Rate", accent: "#34d399",
    icon: (<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5"/><path d="M11 17c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/><circle cx="20" cy="13" r="1.5" fill="currentColor"/></svg>),
  },
  {
    value: "100+", label: "Partner Schools", accent: "#fb923c",
    icon: (<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5"/><path d="M5 16h22M16 5c-3 3-5 6.8-5 11s2 8 5 11M16 5c3 3 5 6.8 5 11s-2 8-5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>),
  },
];

export default function Home4() {
  const rootRef = useRef();
  const headRef = useRef();

  useEffect(() => {
    const el = rootRef.current;

    // Pause CSS animations when section is off-screen
    const obs = new IntersectionObserver(
      ([entry]) => {
        el.style.setProperty("--play", entry.isIntersecting ? "running" : "paused");
      },
      { threshold: 0.05 }
    );
    obs.observe(el);

    const ctx = gsap.context(() => {
      // Use a single timeline with shared ScrollTrigger — fewer triggers = less overhead
      const headTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true },
      });
      headTl
        .fromTo(".h4-tag",       { opacity: 0, x: -16 },              { opacity: 1, x: 0, duration: 0.4 })
        .fromTo(".h4-line",      { scaleX: 0 },                        { scaleX: 1, duration: 0.5 }, 0.05)
        .fromTo(".h4-title-row", { opacity: 0, y: 44 },                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.12)
        .fromTo(".h4-sub",       { opacity: 0, y: 16 },                { opacity: 1, y: 0, duration: 0.45 }, 0.32)
        .fromTo(".h4-body",      { opacity: 0, y: 14 },                { opacity: 1, y: 0, duration: 0.45 }, 0.42);

      // Single shared trigger for all features
      gsap.fromTo(".h4-feature",
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: "power3.out",
          scrollTrigger: { trigger: ".h4-features", start: "top 84%", once: true },
        }
      );

      // Single shared trigger for all stats
      gsap.fromTo(".h4-stat",
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: ".h4-stats", start: "top 88%", once: true },
        }
      );
    }, rootRef);

    return () => {
      obs.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="h4" ref={rootRef}>
      {/* Circuit uses translate (GPU) instead of background-position */}
      <div className="h4-circuit" aria-hidden />
      <div className="h4-noise" aria-hidden />
      {/* Ghost text: opacity-only animation, no scale (avoids repaint) */}
      <div className="h4-ghost" aria-hidden>BUILD</div>

      <div className="h4-inner">

        <div className="h4-head" ref={headRef}>
          <aside className="h4-aside">
            <div className="h4-aside-line" />
            <span className="h4-aside-label">Why Us</span>
          </aside>
          <div className="h4-head-content">
            <div className="h4-tag">
              <span className="h4-tag-pip" />
              Why Choose Us
            </div>
            <div className="h4-line" />
            <h2 className="h4-title">
              <span className="h4-title-row">Trusted by</span>
              <span className="h4-title-row h4-title-accent">Top Schools in Tamilnadu</span>
              <span className="h4-title-row">for Delivering Future-Ready Tech Training</span>
            </h2>
            <p className="h4-sub">Our Singular Philosophy - Equipping your ward with future-ready skills</p>
            <p className="h4-body">
             Students should not wait until college or employment to understand real-world technology.
They should experience it early, systematically, and meaningfully—so their future is not uncertain, but engineered.
            </p>
          </div>
        </div>

        <div className="h4-features">
          {features.map((f, i) => (
            <div key={i} className="h4-feature" style={{ "--f-accent": f.accent }}>
              <div className="h4-feature-img-wrap">
                <img src={f.image} alt={f.imageAlt} className="h4-feature-img" loading="lazy" />
                <div className="h4-feature-img-overlay" />
              </div>
              <div className="h4-feature-body">
                <div className="h4-feature-top">
                  <span className="h4-feature-num">0{i + 1}</span>
                </div>
                <h3 className="h4-feature-title">{f.title}</h3>
                <p className="h4-feature-desc">{f.desc}</p>
              </div>
              {/* Bottom glow line — GPU transform only */}
              <div className="h4-feature-glow" />
            </div>
          ))}
        </div>

        <div className="h4-stats">
          {stats.map((s, i) => (
            <div key={i} className="h4-stat" style={{ "--s-accent": s.accent }}>
              <div className="h4-stat-icon">{s.icon}</div>
              <div className="h4-stat-content">
                <span className="h4-stat-value">{s.value}</span>
                <span className="h4-stat-label">{s.label}</span>
              </div>
              <div className="h4-stat-glow" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}