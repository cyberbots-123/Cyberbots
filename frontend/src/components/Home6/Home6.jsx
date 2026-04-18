import React, { useEffect, useRef, useState } from "react";
import "./Home6.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote:
      "The robotics program transformed our students completely. Kids who struggled to stay engaged are now building autonomous robots and winning inter-school competitions. The hands-on approach is unlike anything we've seen.",
    role: "Principal",
    institution: "CBSE School, Chennai",
    type: "School",
    rating: 5,
    accent: "#38bdf8",
    tag: "Robotics Program",
  },
  {
    quote:
      "Our students won first place at the state-level STEM expo after just one semester with Cyberbots. The curriculum is rigorous, practical, and the instructors genuinely care about each child's progress.",
    role: "STEM Coordinator",
    institution: "International School, Bangalore",
    type: "School",
    rating: 5,
    accent: "#a78bfa",
    tag: "STEM Excellence",
  },
  {
    quote:
      "We've partnered with several EdTech providers. Cyberbots stands apart — real hardware, real projects, real outcomes. Our students left with soldering skills, working IoT devices, and a love for engineering.",
    role: "Academic Director",
    institution: "Tech-Focused School, Hyderabad",
    type: "School",
    rating: 5,
    accent: "#34d399",
    tag: "IoT & Electronics",
  },
  {
    quote:
      "Within three months of introducing Cyberbots' drone program, we had students designing flight paths and programming autonomous navigation. Parents couldn't believe what their 13-year-olds were achieving.",
    role: "Deputy Principal",
    institution: "Matriculation School, Coimbatore",
    type: "School",
    rating: 5,
    accent: "#fb923c",
    tag: "Drone Technology",
  },
  {
    quote:
      "The AI and Python curriculum is exceptionally well-structured. Our Class 10 students built working machine learning models. The Cyberbots team made complex concepts genuinely accessible.",
    role: "Computer Science HOD",
    institution: "ICSE School, Mumbai",
    type: "School",
    rating: 5,
    accent: "#38bdf8",
    tag: "AI & Python",
  },
  {
    quote:
      "My son went from zero interest in technology to winning a national robotics championship in one year. Cyberbots didn't just teach him skills — they gave him a purpose and direction in life.",
    role: "Parent",
    institution: "Class 9 Student's Parent",
    type: "Parent",
    rating: 5,
    accent: "#f472b6",
    tag: "Parent Review",
  },
  {
    quote:
      "We integrated Cyberbots into our after-school program and the results were immediate. Attendance shot up, students started collaborating naturally, and three of our kids have already filed for patents.",
    role: "Programme Head",
    institution: "Community Learning Centre, Pune",
    type: "Partner",
    rating: 5,
    accent: "#a78bfa",
    tag: "After-School Program",
  },
  {
    quote:
      "Exceptional curriculum, exceptional trainers. The 3D printing and CAD module was a revelation for our design students. We've now embedded Cyberbots into our core curriculum for all science streams.",
    role: "Vice Principal",
    institution: "Senior Secondary School, Delhi",
    type: "School",
    rating: 5,
    accent: "#34d399",
    tag: "3D Printing & CAD",
  },
];

const partnerStats = [
  { n: "50+",  l: "Partner Schools"     },
  { n: "100+", l: "Cities Reached"      },
  { n: "5K+",  l: "Students Impacted"   },
  { n: "98%",  l: "Renewal Rate"        },
];

const partnerTypes = [
  { label: "CBSE Schools",          count: "22+"  },
  { label: "ICSE Schools",          count: "12+"  },
  { label: "International Schools", count: "8+"   },
  { label: "State Board Schools",   count: "10+"  },
  { label: "Learning Centres",      count: "6+"   },
];

export default function Home6() {
  const rootRef   = useRef();
  const headRef   = useRef();
  const trackRef  = useRef();
  const [active, setActive]       = useState(0);
  const [paused, setPaused]       = useState(false);
  const autoRef   = useRef(null);
  const COLS = 3;

  const next = () => setActive(p => (p + 1) % testimonials.length);
  const prev = () => setActive(p => (p - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (paused) return;
    autoRef.current = setInterval(next, 4500);
    return () => clearInterval(autoRef.current);
  }, [paused]);

  // ── PERFORMANCE FIX: Pause carousel when tab is hidden ──
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(autoRef.current);
        autoRef.current = null;
      } else if (!paused) {
        autoRef.current = setInterval(next, 4500);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [paused]);

  useEffect(() => {
    const el = rootRef.current;

    // ── PERFORMANCE FIX: IntersectionObserver to pause CSS animations when off-screen ──
    const obs = new IntersectionObserver(
      ([entry]) => {
        el.style.setProperty("--play", entry.isIntersecting ? "running" : "paused");
        // Also pause/resume carousel
        if (!entry.isIntersecting) {
          clearInterval(autoRef.current);
          autoRef.current = null;
        } else if (!paused && !autoRef.current) {
          autoRef.current = setInterval(next, 4500);
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);

    const ctx = gsap.context(() => {
      gsap.fromTo(".h6-tag",        { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out",   scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true }});
      gsap.fromTo(".h6-line",       { scaleX: 0 },           { scaleX: 1, duration: 0.55, ease: "power3.out",          scrollTrigger: { trigger: headRef.current, start: "top 82%", once: true }});
      gsap.fromTo(".h6-title-row",  { opacity: 0, y: 48 },   { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: headRef.current, start: "top 80%", once: true }});
      gsap.fromTo(".h6-sub",        { opacity: 0, y: 18 },   { opacity: 1, y: 0, duration: 0.5, ease: "power2.out",   scrollTrigger: { trigger: headRef.current, start: "top 78%", once: true }});
      ScrollTrigger.batch(".h6-stat", {
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" }),
        start: "top 86%",
        once: true,
      });
      ScrollTrigger.batch(".h6-pt-item", {
        onEnter: (batch) => gsap.to(batch, { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" }),
        start: "top 88%",
        once: true,
      });
    }, rootRef);

    return () => {
      obs.disconnect();
      ctx.revert();
    };
  }, []);

  const visible = Array.from({ length: COLS }, (_, i) =>
    testimonials[(active + i) % testimonials.length]
  );

  return (
    <section className="h6" ref={rootRef}>
      <div className="h6-circuit" aria-hidden />
      <div className="h6-noise"   aria-hidden />
      <div className="h6-ghost"   aria-hidden>50+</div>

      <div className="h6-inner">

        <div className="h6-head" ref={headRef}>
          <aside className="h6-aside">
            <div className="h6-aside-line" />
            <span className="h6-aside-label">Reviews</span>
          </aside>
          <div className="h6-head-content">
            <div className="h6-tag">
              <span className="h6-tag-pip" />
              The First Institution to Introduce Industrial Project-Based Learning for School Students.
            </div>
            <div className="h6-line" />
            <h2 className="h6-title">
              <span className="h6-title-row">What Schools</span>
              <span className="h6-title-row h6-title-accent">Say About Us</span>
            </h2>
            <p className="h6-sub">
              Over 100 schools, learning centres, and educators trust Cyberbots to deliver
              world-class robotics and STEM education — with results that speak for themselves.
            </p>
          </div>
        </div>

        {/* <div className="h6-stats">
          {partnerStats.map((s, i) => (
            <div key={i} className="h6-stat">
              <span className="h6-stat-n">{s.n}</span>
              <span className="h6-stat-l">{s.l}</span>
            </div>
          ))}
        </div> */}

        <div
          className="h6-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="h6-hud h6-hud-tl" />
          <div className="h6-hud h6-hud-br" />

          <div className="h6-track" ref={trackRef}>
            {visible.map((t, i) => (
              <div
                key={`${active}-${i}`}
                className={`h6-card${i === 0 ? " h6-card--featured" : ""}`}
                style={{ "--c-accent": t.accent }}
              >
                <div className="h6-card-top">
                  <span className="h6-card-tag">{t.tag}</span>
                  <div className="h6-stars">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <span key={j} className="h6-star">★</span>
                    ))}
                  </div>
                </div>

                <div className="h6-quote-mark" aria-hidden>"</div>
                <p className="h6-quote">{t.quote}</p>

                <div className="h6-card-foot">
                  <div className="h6-avatar">
                    <svg viewBox="0 0 32 32" fill="none" width="18" height="18">
                      <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="1.6"/>
                      <path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="h6-card-meta">
                    <span className="h6-role">{t.role}</span>
                    <span className="h6-institution">{t.institution}</span>
                  </div>
                  <div className="h6-type-badge">{t.type}</div>
                </div>

                <div className="h6-card-glow" />
              </div>
            ))}
          </div>

          <div className="h6-nav">
            <button className="h6-nav-btn" onClick={prev} aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="h6-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`h6-dot${i === active ? " on" : ""}`}
                  onClick={() => { setPaused(true); setActive(i); setTimeout(() => setPaused(false), 3000); }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button className="h6-nav-btn" onClick={next} aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="h6-partner-types">
          <p className="h6-pt-label">Schools We Work With</p>
          <div className="h6-pt-strip">
            {partnerTypes.map((pt, i) => (
              <div key={i} className="h6-pt-item">
                <span className="h6-pt-count">{pt.count}</span>
                <span className="h6-pt-name">{pt.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h6-cta-banner">
          <div className="h6-cta-left">
            <div className="h6-cta-pip" />
            <div>
              <p className="h6-cta-title">Ready to bring robotics to your school?</p>
              <p className="h6-cta-sub">Join 50+ schools already transforming their STEM curriculum with Cyberbots.</p>
            </div>
          </div>
          <div className="h6-cta-right">
            <button className="h6-cta-btn h6-cta-primary">
              Partner With Us
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="h6-cta-btn h6-cta-ghost">View Brochure</button>
          </div>
        </div>

      </div>
    </section>
  );
}