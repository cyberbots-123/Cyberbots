import React, { useEffect, useRef, useState } from "react";
import "./Home3.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const courses = [
  {
    id: "01",
    title: "Robotics",
    desc: "Design, build and program autonomous robots using servo motors, sensors, and embedded controllers.",
    tags: ["Arduino", "Motors", "Sensors"],
    accent: "#38bdf8",
    image: "https://plus.unsplash.com/premium_photo-1738614647383-0435fcb26a55?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "02",
    title: "STEM Education",
    desc: "Master UAV mechanics, flight controllers, GPS navigation and aerial photography principles.",
    tags: ["UAV", "Flight Control", "GPS"],
    accent: "#a78bfa",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&q=80&fit=crop",
  },
  {
    id: "03",
    title: "Internet of Things",
    desc: "Connect physical devices to the cloud — build smart environments and automate real-world systems.",
    tags: ["ESP32", "Sensors", "Cloud"],
    accent: "#34d399",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80&fit=crop",
  },
  {
    id: "04",
    title: "Web Development",
    desc: "Learn circuit design, PCB layout, soldering techniques and component testing with real hardware.",
    tags: ["Circuits", "Soldering", "PCB"],
    accent: "#fb923c",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80&fit=crop",
  },
  {
    id: "05",
    title: "3D Printing",
    desc: "Design custom enclosures and parts in CAD, then manufacture them on professional FDM printers.",
    tags: ["CAD", "FDM", "Prototyping"],
    accent: "#f472b6",
    image: "https://images.unsplash.com/photo-1615286922420-c6b348ffbd62?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "06",
    title: "Artificial Intelligence",
    desc: "Train models, build neural networks, and deploy real AI apps using Python and TensorFlow.",
    tags: ["Python", "ML", "Neural Nets"],
    accent: "#38bdf8",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=500&q=80&fit=crop",
  },
  {
    id: "07",
    title: "Drone Technology",
    desc: "Integrated science, technology, engineering and mathematics with project-based real-world learning.",
    tags: ["Science", "Engineering", "Maths"],
    accent: "#a78bfa",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80&fit=crop",
  },
  {
    id: "08",
    title: "Data Science",
    desc: "Build dashboards and control interfaces for your hardware projects using modern web frameworks.",
    tags: ["React", "APIs", "Dashboard"],
    accent: "#34d399",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80&fit=crop",
  },
  {
    id: "09",
    title: "App Development",
    desc: "Build mobile apps that connect to your IoT devices and robots over Bluetooth and Wi-Fi.",
    tags: ["Flutter", "BLE", "APIs"],
    accent: "#fb923c",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&q=80&fit=crop",
  },
  {
    id: "10",
    title: "Programming Languages",
    desc: "Master Python, C++, and MicroPython — the core languages powering every robot and embedded system.",
    tags: ["Python", "C++", "MicroPython"],
    accent: "#f472b6",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&q=80&fit=crop",
  },
];

export default function Home3() {
  const rootRef  = useRef();
  const headRef  = useRef();
  const gridRef  = useRef();
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const el = rootRef.current;

    // ── PERFORMANCE FIX: IntersectionObserver to pause CSS animations when off-screen ──
    const obs = new IntersectionObserver(
      ([entry]) => {
        el.style.setProperty("--play", entry.isIntersecting ? "running" : "paused");
      },
      { threshold: 0.05 }
    );
    obs.observe(el);

    const ctx = gsap.context(() => {
      gsap.fromTo(".h3-tag",
        { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true }});
      gsap.fromTo(".h3-line",
        { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true }});
      gsap.fromTo(".h3-title-row",
        { opacity: 0, y: 50, rotateX: -10 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.65, stagger: 0.1, ease: "expo.out",
          scrollTrigger: { trigger: headRef.current, start: "top 80%", once: true }});
      gsap.fromTo(".h3-sub",
        { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: headRef.current, start: "top 78%", once: true }});
      // ── PERFORMANCE FIX: Use batch for card animations ──
      ScrollTrigger.batch(".h3-card", {
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" }),
        start: "top 82%",
        once: true,
      });
    }, rootRef);

    return () => {
      obs.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="h3" ref={rootRef}>
      <div className="h3-circuit" aria-hidden />
      <div className="h3-noise" aria-hidden />
      <div className="h3-ghost" aria-hidden>10</div>

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

        <div className="h3-grid" ref={gridRef}>
          {courses.map((c) => (
            <div
              key={c.id}
              className={`h3-card${hovered === c.id ? " h3-card--hovered" : ""}`}
              style={{ "--card-accent": c.accent }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="h3-card-img-wrap">
                <img src={c.image} alt={c.title} className="h3-card-img" />
                <div className="h3-card-img-overlay" />
                {hovered === c.id && <div className="h3-card-scan" />}
              </div>

              <div className="h3-card-body">
                <div className="h3-card-top">
                  <span className="h3-card-num">{c.id}</span>
                </div>
                <h3 className="h3-card-title">{c.title}</h3>
                <p className="h3-card-desc">{c.desc}</p>
                <div className="h3-card-tags">
                  {c.tags.map(t => <span key={t} className="h3-card-tag">{t}</span>)}
                </div>
                <div className="h3-card-arrow">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}