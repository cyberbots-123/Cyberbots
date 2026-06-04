import React, { useEffect, useRef } from "react";
import "./Home3.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import assets from "../../assets/assets";

gsap.registerPlugin(ScrollTrigger);

// FIX: Enable GSAP force3D globally so all animated elements get translateZ(0)
// This avoids per-element GPU promotion delays during scroll
gsap.config({ force3D: true });

const courses = [
  {
    id: "01", title: "Robotics",
    desc: "Design, build and program autonomous robots using servo motors, sensors, and embedded controllers.",
    tags: ["Arduino", "Motors", "Sensors"], accent: "#38bdf8", image: assets.RoboticsH,
  },
  {
    id: "02", title: "STEM Education",
    desc: "Master UAV mechanics, flight controllers, GPS navigation and aerial photography principles.",
    tags: ["UAV", "Flight Control", "GPS"], accent: "#a78bfa", image: assets.STEMH,
  },
  {
    id: "03", title: "Internet of Things",
    desc: "Connect physical devices to the cloud — build smart environments and automate real-world systems.",
    tags: ["ESP32", "Sensors", "Cloud"], accent: "#34d399", image: assets.IOTH,
  },
  {
    id: "04", title: "Web Development",
    desc: "Learn circuit design, PCB layout, soldering techniques and component testing with real hardware.",
    tags: ["Circuits", "Soldering", "PCB"], accent: "#fb923c", image: assets.WebH,
  },
  {
    id: "05", title: "3D Printing",
    desc: "Design custom enclosures and parts in CAD, then manufacture them on professional FDM printers.",
    tags: ["CAD", "FDM", "Prototyping"], accent: "#f472b6", image: assets.PrintingH,
  },
  {
    id: "06", title: "Artificial Intelligence",
    desc: "Train models, build neural networks, and deploy real AI apps using Python and TensorFlow.",
    tags: ["Python", "ML", "Neural Nets"], accent: "#38bdf8", image: assets.AIH,
  },
  {
    id: "07", title: "Drone Technology",
    desc: "Integrated science, technology, engineering and mathematics with project-based real-world learning.",
    tags: ["Science", "Engineering", "Maths"], accent: "#a78bfa", image: assets.DroneH,
  },
  {
    id: "08", title: "Data Science",
    desc: "Build dashboards and control interfaces for your hardware projects using modern web frameworks.",
    tags: ["React", "APIs", "Dashboard"], accent: "#34d399", image: assets.DataH,
  },
  {
    id: "09", title: "App Development",
    desc: "Build mobile apps that connect to your IoT devices and robots over Bluetooth and Wi-Fi.",
    tags: ["Flutter", "BLE", "APIs"], accent: "#fb923c", image: assets.AppH,
  },
  {
    id: "10", title: "Programming Languages",
    desc: "Master Python, C++, and MicroPython — the core languages powering every robot and embedded system.",
    tags: ["Python", "C++", "MicroPython"], accent: "#f472b6", image: assets.ProgrammingH,
  },
];

export default function Home3() {
  const rootRef = useRef();
  const headRef = useRef();

  // FIX: Removed useState(hovered) entirely.
  // Previously every onMouseEnter / onMouseLeave called setHovered(), which triggered
  // a full React re-render of ALL 10 cards on every hover event — including during scroll.
  // Hover styles are now handled 100% via CSS :hover pseudo-class — zero JS, zero re-renders.

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".h3-tag",
        { opacity: 0, x: -14 },
        {
          opacity: 1, x: 0, duration: 0.45, ease: "power2.out",
          scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true },
        });

      gsap.fromTo(".h3-line",
        { scaleX: 0 },
        {
          scaleX: 1, duration: 0.5, ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true },
        });

      gsap.fromTo(".h3-title-row",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "expo.out",
          scrollTrigger: { trigger: headRef.current, start: "top 80%", once: true },
        });

      gsap.fromTo(".h3-sub",
        { opacity: 0, y: 16 },
        {
          opacity: 1, y: 0, duration: 0.45, ease: "power2.out",
          scrollTrigger: { trigger: headRef.current, start: "top 78%", once: true },
        });

      // FIX: Release will-change after entrance animation so GPU layers aren't held indefinitely
      ScrollTrigger.batch(".h3-card", {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.45, stagger: 0.05, ease: "power3.out",
            onComplete: () => {
              batch.forEach((el) => (el.style.willChange = "auto"));
            },
          }),
        start: "top 85%",
        once: true,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="h3" ref={rootRef}>
      <div className="h3-circuit" aria-hidden />

      <div className="h3-inner">
        <div className="h3-head" ref={headRef}>
          <aside className="h3-aside">
            <div className="h3-aside-line" />
            <span className="h3-aside-label">Courses</span>
          </aside>
          <div className="h3-head-content">
            <div className="h3-tag">
              <span className="h3-tag-pip" />
              Explore, learn, Get your skill
            </div>
            <div className="h3-line" />
            <h2 className="h3-title">
              <span className="h3-title-row">Our</span>
              <span className="h3-title-row h3-title-accent">Courses</span>
            </h2>
            <p className="h3-sub">
              10+ hands-on programs — from your first circuit board to a fully autonomous robot,
              taught by expert engineers with real hardware.
            </p>
          </div>
        </div>

        <div className="h3-grid">
          {courses.map((c) => (
            // FIX: Removed onMouseEnter / onMouseLeave handlers — no more React events on hover.
            // CSS :hover handles all visual changes. --card-accent is set once at render time.
            <div
              key={c.id}
              className="h3-card"
              style={{ "--card-accent": c.accent }}
            >
              <div className="h3-card-img-wrap">
                <img
                  src={c.image}
                  alt={c.title}
                  className="h3-card-img"
                  loading="lazy"
                  // FIX: Explicit width/height prevent layout shift during image load
                  width="300"
                  height="140"
                />
                <div className="h3-card-img-overlay" />
              </div>

              <div className="h3-card-body">
                <div className="h3-card-top">
                  <span className="h3-card-num">{c.id}</span>
                </div>
                <h3 className="h3-card-title">{c.title}</h3>
                <p className="h3-card-desc">{c.desc}</p>
                <div className="h3-card-tags">
                  {c.tags.map((t) => (
                    <span key={t} className="h3-card-tag">{t}</span>
                  ))}
                </div>
                <div className="h3-card-arrow">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="h3-card-glow" />
            </div>
          ))}
        </div>

        <div className="h3-cta">
          <button className="h3-cta-btn">
            View All Courses
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}