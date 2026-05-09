import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════ */
const T = {
  navy:    "#051C3F",
  blue:    "#1354A8",
  sky:     "#2B7FE0",
  accent:  "#3DA9FC",
  light:   "#E8F2FF",
  pale:    "#F4F8FF",
  white:   "#FFFFFF",
  text:    "#0A1628",
  muted:   "#5A7399",
  border:  "#C5D9F0",
};

/* ═══════════════════════════════════════════════════════
   RESPONSIVE HOOK
═══════════════════════════════════════════════════════ */
function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false, isDesktop: true, width: 1200 });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp({
        isMobile:  w < 640,
        isTablet:  w >= 640 && w < 1024,
        isDesktop: w >= 1024,
        width: w,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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
  { word: "Knowledge",   sub: "introduces possibilities", body: "We expose students to the latest technologies and frameworks shaping the modern world — creating the foundation for genuine capability.", img: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=700&q=80" },
  { word: "Application", sub: "builds confidence",        body: "Every concept is immediately applied in hands-on labs, projects, and real-world challenges — never left abstract or theoretical.",         img: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=700&q=80" },
  { word: "Execution",   sub: "creates capability",       body: "Students deliver measurable outcomes that prove readiness for the real professional world — tangible, portfolio-worthy deliverables.",     img: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=700&q=80" },
];

const STATS = [
  { label: "Schools Trusted",   val: 120,   sfx: "+", sub: "Across India" },
  { label: "Students Impacted", val: 25000, sfx: "+", sub: "And growing" },
  { label: "Projects Executed", val: 8500,  sfx: "+", sub: "Real deliverables" },
  { label: "Awards Won",        val: 18,    sfx: "",  sub: "Nationally recognised" },
];

const PILLARS = [
  { n: "01", title: "System-Driven Learning",           desc: "A structured, outcome-oriented system where every concept leads to application and measurable progress — not isolated activities.", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=80" },
  { n: "02", title: "From Exposure to Capability",      desc: "Many programs provide exposure to technology. Cyberbots ensures students gain the genuine ability to use it effectively.",              img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80" },
  { n: "03", title: "Classroom to Real-World",          desc: "Programs simulate real-world problem-solving environments where students build, test, iterate and develop analytical thinking.",        img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80" },
  { n: "04", title: "Measurable Outcomes",              desc: "Every student's journey is structured, tracked, and evaluated. If it cannot be measured, it is not considered learning.",                img: "https://images.unsplash.com/photo-1560785496-3c9d2c4bda1f?w=500&q=80" },
  { n: "05", title: "Local Insight. Global Relevance.", desc: "We understand India's academic ecosystem deeply while aligning students with global expectations of technology and innovation.",         img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80" },
];

const AWARDS = [
  { name: "Best EdTech Innovation Award",     year: "2024", from: "National Education Summit, New Delhi", img: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=500&q=80" },
  { name: "Excellence in STEM Education",     year: "2023", from: "FICCI Education Excellence Awards",    img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&q=80" },
  { name: "Top 10 EdTech Startups India",     year: "2023", from: "Inc42 Future of Work Summit",          img: "https://images.unsplash.com/photo-1496469888073-80de7e952517?w=500&q=80" },
  { name: "Best School Partnership Program",  year: "2022", from: "CII Education Innovation Awards",      img: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80" },
  { name: "Most Impactful Learning Platform", year: "2022", from: "Times Education Icons",                img: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=500&q=80" },
  { name: "Digital Skilling Excellence",      year: "2021", from: "India Tech & AI Summit",               img: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=500&q=80" },
];

const STEPS = [
  { n: "01", title: "Concept Clarity",         desc: "Strong foundational understanding before application — no student proceeds without proven clarity.",                                     img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&q=80", flip: false },
  { n: "02", title: "Hands-on Application",    desc: "Learning through building and doing. Every concept is applied in labs and projects, never memorised for an exam.",                      img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&q=80", flip: true  },
  { n: "03", title: "Project Execution",       desc: "Real-world problem solving with tangible, portfolio-worthy deliverables that prove the student's capability.",                          img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80", flip: false },
  { n: "04", title: "Performance Evaluation",  desc: "Measurable skill tracking and fully transparent progress reports shared with students, parents, and schools alike.",                     img: "https://images.unsplash.com/photo-1560785496-3c9d2c4bda1f?w=700&q=80", flip: true  },
];

const VM_CARDS = [
  { label: "Our Vision",     img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&q=80", text: "To redefine how students learn technology — by making application the core of education, not a supplement to it." },
  { label: "Our Mission",    img: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=700&q=80",    text: "To build a generation of students who are not just academically qualified, but capable of applying knowledge in real-world scenarios with clarity and confidence." },
  { label: "Our Commitment", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&q=80", text: "Structured delivery, industry-aligned skill development, measurable outcomes, and long-term student growth — without compromise." },
];

const GALLERY = [
  { src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=700&q=80", span: 2 },
  { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80", span: 1 },
  { src: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=500&q=80", span: 1 },
  { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&q=80", span: 1 },
  { src: "https://images.unsplash.com/photo-1560785496-3c9d2c4bda1f?w=700&q=80",   span: 2 },
  { src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&q=80", span: 1 },
];

/* ═══════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════ */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function useCountUp(target, active) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s = null;
    const dur = 2200;
    const run = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [active, target]);
  return v;
}

/* ═══════════════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════════════ */
function FadeUp({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(32px)",
      transition: `opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s, transform .75s cubic-bezier(.22,1,.36,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SlideIn({ children, from = "left", delay = 0, style = {} }) {
  const [ref, vis] = useInView();
  const { isMobile } = useBreakpoint();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : isMobile ? "translateY(32px)" : `translateX(${from === "left" ? -40 : 40}px)`,
      transition: `opacity .85s cubic-bezier(.22,1,.36,1) ${delay}s, transform .85s cubic-bezier(.22,1,.36,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Label({ n, text, light }) {
  const col = light ? "rgba(255,255,255,.4)" : T.muted;
  const ln  = light ? "rgba(255,255,255,.2)" : T.border;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <span style={{ fontSize:10, fontWeight:700, color:col, letterSpacing:".1em" }}>{n}</span>
      <div style={{ width:22, height:1, background:ln }} />
      <span style={{ fontSize:10, fontWeight:600, letterSpacing:".2em", textTransform:"uppercase", color:col }}>{text}</span>
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
   PROGRESS BAR
═══════════════════════════════════════════════════════ */
function ProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <div style={{ position:"fixed", top:0, left:0, zIndex:1000, height:3, width:`${pct}%`, background:`linear-gradient(90deg,${T.sky},${T.accent})`, transition:"width .1s linear" }} />;
}

/* ═══════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════ */
function HeroSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  const pb = isMobile ? "60px" : "80px";

  return (
    <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"flex-end", padding:`0 ${px} ${pb}`, overflow:"hidden", background:T.navy }}>

      {/* Geometric layers */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, right:"-5%", width:isMobile?"90%":"55%", height:"100%", background:T.blue, clipPath:"polygon(18% 0,100% 0,100% 100%,0% 100%)", opacity:.35 }} />
        <div style={{ position:"absolute", top:0, right:"-5%", width:isMobile?"90%":"55%", height:"100%", background:`linear-gradient(135deg,${T.sky} 0%,${T.navy} 70%)`, clipPath:"polygon(22% 0,100% 0,100% 100%,4% 100%)", opacity:.25 }} />
        <svg style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", opacity:.07 }}>
          <defs>
            <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill={T.accent} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <div style={{ position:"absolute", top:"10%", right:"18%", width:isMobile?200:420, height:isMobile?200:420, borderRadius:"50%", background:`radial-gradient(circle,${T.sky}40 0%,transparent 70%)` }} />
      </div>

      {/* Right image collage — hidden on mobile, visible on tablet+ */}
      {!isMobile && (
        <div style={{
          position:"absolute",
          right: isTablet ? "24px" : "72px",
          top:"50%", transform:"translateY(-50%)",
          display:"flex", flexDirection:"column", gap:10,
          width: isTablet ? 200 : 300,
          animation:"fadeRight 1s cubic-bezier(.22,1,.36,1) .7s both"
        }}>
          <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&q=80" alt=""
            style={{ width:"100%", height: isTablet ? 140 : 200, objectFit:"cover", borderRadius:3, border:"1.5px solid rgba(255,255,255,.12)", display:"block" }} />
          <div style={{ display:"flex", gap:10 }}>
            <img src="https://images.unsplash.com/photo-1560785496-3c9d2c4bda1f?w=400&q=80" alt=""
              style={{ flex:1, height: isTablet ? 90 : 130, objectFit:"cover", borderRadius:3, border:"1.5px solid rgba(255,255,255,.12)", display:"block" }} />
            <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80" alt=""
              style={{ flex:1, height: isTablet ? 90 : 130, objectFit:"cover", borderRadius:3, border:"1.5px solid rgba(255,255,255,.12)", display:"block" }} />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ position:"relative", zIndex:2, maxWidth: isMobile ? "100%" : isTablet ? 420 : 600 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:isMobile?20:32, animation:"fadeUp .6s ease .1s both" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:T.accent }} />
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:".22em", textTransform:"uppercase", color:"rgba(255,255,255,.45)" }}>Cyberbots · About Us</span>
        </div>

        {[
          { t:"Where Learning Is", w:400, c:"rgba(255,255,255,.5)", i:true,  d:.18 },
          { t:"Validated By",      w:700, c:"#fff",                 i:false, d:.32 },
          { t:"What You Can Do.",  w:700, c:T.accent,               i:true,  d:.46 },
        ].map((line, i) => (
          <div key={i} style={{ overflow:"hidden" }}>
            <h1 style={{
              fontFamily:"'Fraunces',serif",
              fontSize: isMobile ? "clamp(32px,10vw,48px)" : isTablet ? "clamp(36px,6vw,60px)" : "clamp(42px,6vw,80px)",
              fontWeight:line.w, lineHeight:1.05,
              letterSpacing:"-.025em", color:line.c,
              fontStyle:line.i ? "italic" : "normal", margin:0,
              animation:`slideUp .8s cubic-bezier(.22,1,.36,1) ${line.d}s both`,
            }}>{line.t}</h1>
          </div>
        ))}

        <p style={{ fontSize:14, color:"rgba(255,255,255,.45)", lineHeight:1.85, maxWidth:380, margin:`${isMobile?18:28}px 0 ${isMobile?24:36}px`, animation:"fadeUp .7s ease .65s both" }}>
          Not just an edutech company — a structured learning system built at the intersection of McKinsey frameworks and IBM methodologies.
        </p>

        <div style={{ display:"flex", gap: isMobile ? 24 : 40, animation:"fadeUp .7s ease .8s both", flexWrap:"wrap" }}>
          {[["100+","Schools"],["25K+","Students"],["18","Awards"]].map(([n,l]) => (
            <div key={l}>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize: isMobile ? 28 : 36, fontWeight:700, color:"#fff", lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.35)", letterSpacing:".14em", textTransform:"uppercase", marginTop:5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TICKER
═══════════════════════════════════════════════════════ */
function Ticker() {
  const items = [...TICKER_ITEMS,...TICKER_ITEMS,...TICKER_ITEMS];
  return (
    <div style={{ background:T.blue, padding:"13px 0", overflow:"hidden" }}>
      <div style={{ display:"flex", animation:"ticker 26s linear infinite", width:"max-content" }}>
        {items.map((t, i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:16, padding:"0 28px", fontSize:10, fontWeight:700, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.5)", whiteSpace:"nowrap" }}>
            <span style={{ width:3, height:3, borderRadius:"50%", background:T.accent, display:"inline-block" }} />
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
    <section style={{ padding:`80px ${px}`, background:T.white }}>
      <div style={{ maxWidth:1120, margin:"0 auto", display:"grid", gridTemplateColumns: isMobile||isTablet ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 88, alignItems:"center" }}>
        <SlideIn from="left">
          <Label n="01" text="Who We Are" />
          <h2 style={H2}>Academic Learning<br />Meets<br /><em style={{ color:T.sky, fontStyle:"italic" }}>Practical Execution</em></h2>
          <p style={BODY}>Cyberbots is not an edutech company. It is a structured learning system designed to build real-world capability in students — operating at the intersection of academic learning and practical execution.</p>
          <p style={BODY}>Our approach integrates globally benchmarked frameworks inspired by McKinsey & Company and IBM, adapted to the realities of school education in India.</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:24 }}>
            {["McKinsey Frameworks","IBM Methodologies","India-First"].map(t => (
              <span key={t} style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", border:`1.5px solid ${T.sky}`, color:T.blue, padding:"5px 14px", borderRadius:2 }}>{t}</span>
            ))}
          </div>
        </SlideIn>

        <SlideIn from={isMobile ? "left" : "right"} delay={isMobile ? 0 : .15}>
          <div style={{ position:"relative" }}>
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80" alt=""
              style={{ width:"100%", height: isMobile ? 260 : 440, objectFit:"cover", borderRadius:4, display:"block" }} />
            <div style={{ position:"absolute", inset:0, borderRadius:4, background:`linear-gradient(135deg,${T.navy}44,transparent)` }} />
            <div style={{
              position:"absolute",
              top:24,
              right: isMobile ? 12 : -22,
              background:T.blue, color:"#fff",
              padding:"16px 20px", borderRadius:3, textAlign:"center",
              boxShadow:`0 12px 40px ${T.navy}55`
            }}>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:isMobile?30:40, fontWeight:700, lineHeight:1 }}>100+</div>
              <div style={{ fontSize:9, letterSpacing:".14em", textTransform:"uppercase", opacity:.7, marginTop:4 }}>Schools</div>
            </div>
            <div style={{ position:"absolute", bottom:-16, left:32, right:32, height:4, borderRadius:2, background:`linear-gradient(90deg,${T.sky},${T.accent})` }} />
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
    <section style={{ background:T.navy, padding:`80px ${px}` }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <FadeUp>
          <Label n="02" text="Our Philosophy" light />
          <h2 style={{ ...H2, color:"#fff" }}>
            Learning Is Not Complete<br /><em style={{ color:T.accent, fontStyle:"italic" }}>Until It Is Applied</em>
          </h2>
        </FadeUp>
        <FadeUp delay={.15}>
          <div style={{
            display:"grid",
            gridTemplateColumns: isMobile||isTablet ? "1fr" : "1fr 1fr",
            gap:3, marginTop:48
          }}>
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              {PHIL_ITEMS.map((item, i) => (
                <div key={i} onClick={() => setActive(i)}
                  style={{
                    padding: isMobile ? "24px 20px" : "38px 40px", cursor:"pointer",
                    background: active===i ? T.blue : "rgba(255,255,255,.03)",
                    borderLeft: active===i ? `3px solid ${T.accent}` : "3px solid transparent",
                    transition:"all .3s ease",
                  }}>
                  <div style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:700, color: active===i ? "#fff" : "rgba(255,255,255,.38)", marginBottom:5, transition:"color .3s" }}>{item.word}</div>
                  <div style={{ fontSize:10, letterSpacing:".15em", textTransform:"uppercase", color: active===i ? T.accent : "rgba(255,255,255,.2)" }}>{item.sub}</div>
                  {active===i && <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", lineHeight:1.8, marginTop:14 }}>{item.body}</p>}
                </div>
              ))}
            </div>
            {/* Image panel hidden on mobile */}
            {!isMobile && (
              <div style={{ position:"relative", overflow:"hidden", minHeight: isTablet ? 280 : 400 }}>
                {PHIL_ITEMS.map((item, i) => (
                  <div key={i} style={{ position:"absolute", inset:0, opacity:active===i?1:0, transform:active===i?"scale(1)":"scale(1.05)", transition:"opacity .55s ease, transform .55s ease", pointerEvents:"none" }}>
                    <img src={item.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg,${T.navy}66,transparent 60%)` }} />
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
   STATS
═══════════════════════════════════════════════════════ */
function StatBlock({ stat, delay }) {
  const [ref, vis] = useInView(.35);
  const count = useCountUp(stat.val, vis);
  const [hov, setHov] = useState(false);
  const { isMobile } = useBreakpoint();
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onTouchStart={() => setHov(true)} onTouchEnd={() => setHov(false)}
      style={{
        borderRight:`1px solid ${T.border}`, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`,
        padding: isMobile ? "32px 20px" : "52px 36px",
        position:"relative", overflow:"hidden",
        background: hov ? T.light : T.white,
        transition:`background .3s, opacity .8s cubic-bezier(.22,1,.36,1) ${delay}s, transform .8s ${delay}s`,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(24px)",
      }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background: hov ? `linear-gradient(90deg,${T.sky},${T.accent})` : "transparent", transition:"background .3s" }} />
      <div style={{ fontFamily:"'Fraunces',serif", fontSize: isMobile ? "clamp(32px,8vw,52px)" : "clamp(40px,4vw,64px)", fontWeight:700, color:T.blue, lineHeight:1, letterSpacing:"-.03em" }}>
        {count.toLocaleString()}{stat.sfx}
      </div>
      <div style={{ fontSize:isMobile?11:13, fontWeight:600, color:T.text, marginTop:10 }}>{stat.label}</div>
      <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>{stat.sub}</div>
    </div>
  );
}

function StatsSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  return (
    <section style={{ padding:`0 ${px}`, background:T.white }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
          borderLeft:`1px solid ${T.border}`
        }}>
          {STATS.map((s, i) => <StatBlock key={i} stat={s} delay={i*.1} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PILLARS
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
          display:"grid",
          gridTemplateColumns: isSmall
            ? "48px 1fr"
            : hov ? "64px 1fr 1fr 108px" : "64px 1fr 1fr 0px",
          gap: isSmall ? 16 : 24,
          alignItems:"center",
          padding: isMobile ? "20px 16px" : isTablet ? "22px 24px" : "26px 32px",
          border:`1px solid ${T.border}`,
          borderBottom: last ? `1px solid ${T.border}` : "none",
          background: hov ? T.light : T.white,
          transition:"all .32s ease", cursor:"default", overflow:"hidden",
        }}>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize: isMobile ? 24 : 32, fontWeight:700, color: hov ? T.sky : T.border, transition:"color .3s" }}>{item.n}</div>
        {isSmall ? (
          <div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize: isMobile ? 16 : 18, fontWeight:700, color:T.text, marginBottom:4 }}>{item.title}</div>
            <div style={{ fontSize:13, color:T.muted, lineHeight:1.75 }}>{item.desc}</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:19, fontWeight:700, color:T.text }}>{item.title}</div>
            <div style={{ fontSize:13, color:T.muted, lineHeight:1.75 }}>{item.desc}</div>
            <div style={{ width: hov ? 108 : 0, height:68, borderRadius:3, overflow:"hidden", opacity: hov ? 1 : 0, transition:"all .32s ease" }}>
              <img src={item.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
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
    <section style={{ padding:`80px ${px}`, background:T.pale }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <FadeUp>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40, flexWrap:"wrap", gap:20 }}>
            <div>
              <Label n="03" text="What Makes Us Different" />
              <h2 style={{ ...H2, margin:0 }}>Five Pillars of<br />the Cyberbots <em style={{ color:T.sky, fontStyle:"italic" }}>System</em></h2>
            </div>
            {!isMobile && (
              <p style={{ ...BODY, maxWidth:270, margin:0 }}>Each pillar reinforces the others — forming a system that consistently produces measurable, real-world capability.</p>
            )}
          </div>
        </FadeUp>
        {PILLARS.map((p, i) => <PillarRow key={i} item={p} delay={i*.07} last={i===PILLARS.length-1} />)}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   AWARDS
═══════════════════════════════════════════════════════ */
function AwardCard({ award, delay, idx }) {
  const [flipped, setFlipped] = useState(false);
  const { isMobile } = useBreakpoint();
  const cols = [T.navy, T.blue, T.sky, "#0D3B7E", "#1A5FAD", "#0A2A60"];
  const col = cols[idx % cols.length];
  return (
    <FadeUp delay={delay}>
      <div
        onMouseEnter={() => !isMobile && setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onClick={() => isMobile && setFlipped(f => !f)}
        style={{ height:255, perspective:900, cursor:"pointer" }}>
        <div style={{ position:"relative", width:"100%", height:"100%", transformStyle:"preserve-3d", transition:"transform .65s cubic-bezier(.22,1,.36,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}>
          <div style={{ position:"absolute", inset:0, backfaceVisibility:"hidden", borderRadius:3, overflow:"hidden" }}>
            <img src={award.img} alt={award.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            <div style={{ position:"absolute", inset:0, background:`linear-gradient(to top,${T.navy}CC 0%,transparent 55%)` }} />
            <div style={{ position:"absolute", top:12, right:12, background:col, color:"#fff", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:1 }}>{award.year}</div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"18px 20px" }}>
              <div style={{ width:22, height:2, background:T.accent, marginBottom:8 }} />
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:700, color:"#fff", lineHeight:1.3 }}>{award.name}</div>
            </div>
          </div>
          <div style={{ position:"absolute", inset:0, backfaceVisibility:"hidden", transform:"rotateY(180deg)", background:col, borderRadius:3, display:"flex", flexDirection:"column", justifyContent:"center", padding:"26px 22px" }}>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:52, fontWeight:700, color:"rgba(255,255,255,.1)", lineHeight:1, marginBottom:8 }}>{award.year}</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:17, fontWeight:700, color:"#fff", lineHeight:1.3, marginBottom:14 }}>{award.name}</div>
            <div style={{ width:24, height:1.5, background:"rgba(255,255,255,.3)", marginBottom:12 }} />
            <div style={{ fontSize:12, color:"rgba(255,255,255,.6)", lineHeight:1.65 }}>{award.from}</div>
            {isMobile && <div style={{ marginTop:12, fontSize:10, color:"rgba(255,255,255,.35)", letterSpacing:".1em" }}>TAP TO FLIP BACK</div>}
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
    <section style={{ background:T.light, padding:`80px ${px}` }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <FadeUp style={{ marginBottom:48 }}>
          <Label n="04" text="Award Recognition" />
          <h2 style={H2}>Recognised for <em style={{ color:T.sky, fontStyle:"italic" }}>Excellence</em><br />in Education</h2>
          {isMobile && <p style={{ ...BODY, marginTop:8, marginBottom:0 }}>Tap any card to see details.</p>}
        </FadeUp>
        <div style={{ display:"grid", gridTemplateColumns:cols, gap:14 }}>
          {AWARDS.map((a, i) => <AwardCard key={i} award={a} delay={i*.08} idx={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   GALLERY
═══════════════════════════════════════════════════════ */
function GalleryCell({ src, span }) {
  const [hov, setHov] = useState(false);
  const { isMobile } = useBreakpoint();
  const realSpan = isMobile ? 2 : span; // all full-width on mobile (2-col grid)
  return (
    <div style={{ gridColumn:`span ${realSpan}`, overflow:"hidden", borderRadius:3 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <img src={src} alt="" style={{
        width:"100%", height:"100%", objectFit:"cover", display:"block",
        transform: hov ? "scale(1.07)" : "scale(1)",
        filter: hov ? "brightness(1) saturate(1.1)" : "brightness(.85) saturate(.9)",
        transition:"transform .55s cubic-bezier(.22,1,.36,1), filter .4s",
      }} />
    </div>
  );
}

function GallerySection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  return (
    <section style={{ padding:`80px ${px}`, background:T.white }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <FadeUp style={{ marginBottom:48 }}>
          <Label n="05" text="Life at Cyberbots" />
          <h2 style={H2}>Where Every Classroom<br /><em style={{ color:T.sky, fontStyle:"italic" }}>Becomes a Lab</em></h2>
        </FadeUp>
        <FadeUp delay={.12}>
          <div style={{
            display:"grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gridAutoRows: isMobile ? 140 : 176,
            gap:10
          }}>
            {GALLERY.map((g, i) => <GalleryCell key={i} src={g.src} span={g.span} />)}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   APPROACH
═══════════════════════════════════════════════════════ */
function ApproachRow({ step, delay, last }) {
  const [hov, setHov] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;

  const textCol = (
    <div style={{ padding: isMobile ? "32px 24px" : isTablet ? "40px 36px" : "56px 52px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize: isMobile ? 48 : 68, fontWeight:700, lineHeight:1, marginBottom:6, color: hov ? T.blue : T.border, transition:"color .35s" }}>{step.n}</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(18px,2.2vw,29px)", fontWeight:700, color:T.text, marginBottom:12, letterSpacing:"-.015em" }}>{step.title}</div>
      <p style={{ fontSize:14, color:T.muted, lineHeight:1.85, marginBottom:18 }}>{step.desc}</p>
      <div style={{ height:2.5, borderRadius:2, background:`linear-gradient(90deg,${T.sky},${T.accent})`, width: hov ? 56 : 24, transition:"width .4s cubic-bezier(.22,1,.36,1)" }} />
    </div>
  );

  const imgCol = (
    <div style={{ position:"relative", overflow:"hidden", minHeight: isMobile ? 200 : 290 }}>
      <img src={step.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transform: hov ? "scale(1.04)" : "scale(1)", transition:"transform .65s cubic-bezier(.22,1,.36,1)" }} />
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg,${T.navy}33,transparent)` }} />
    </div>
  );

  return (
    <FadeUp delay={delay}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          display:"grid",
          gridTemplateColumns: isSmall ? "1fr" : "1fr 1fr",
          border:`1px solid ${T.border}`,
          borderBottom: last ? `1px solid ${T.border}` : "none",
          overflow:"hidden",
          background: hov ? T.light : T.white,
          transition:"background .35s"
        }}>
        {/* On mobile always show text first, then image */}
        {isSmall ? <>{textCol}{imgCol}</> : step.flip ? <>{imgCol}{textCol}</> : <>{textCol}{imgCol}</>}
      </div>
    </FadeUp>
  );
}

function ApproachSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "20px" : isTablet ? "40px" : "72px";
  return (
    <section style={{ padding:`80px ${px}`, background:T.pale }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <FadeUp style={{ marginBottom:48 }}>
          <Label n="06" text="Our Approach" />
          <h2 style={H2}>Structured Thinking →<br />Applied Learning →<br /><em style={{ color:T.sky, fontStyle:"italic" }}>Proven Outcomes</em></h2>
        </FadeUp>
        {STEPS.map((s, i) => <ApproachRow key={i} step={s} delay={i*.08} last={i===STEPS.length-1} />)}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   VISION / MISSION / COMMITMENT
═══════════════════════════════════════════════════════ */
function VMCard({ card, delay, idx }) {
  const [hov, setHov] = useState(false);
  const { isMobile } = useBreakpoint();
  const accents = [T.navy, T.blue, T.sky];
  const col = accents[idx];
  return (
    <FadeUp delay={delay}>
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ borderRadius:3, overflow:"hidden", boxShadow: hov ? `0 22px 55px ${T.navy}22` : `0 4px 18px ${T.navy}11`, transform: hov ? "translateY(-6px)" : "none", transition:"all .4s cubic-bezier(.22,1,.36,1)" }}>
        <div style={{ height: isMobile ? 160 : 200, overflow:"hidden", position:"relative" }}>
          <img src={card.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transform: hov ? "scale(1.05)" : "scale(1)", transition:"transform .6s ease" }} />
          <div style={{ position:"absolute", inset:0, background:`linear-gradient(to bottom,transparent 35%,${col}CC)` }} />
          <div style={{ position:"absolute", bottom:16, left:18, fontSize:9, fontWeight:700, letterSpacing:".18em", textTransform:"uppercase", color:"#fff", background:"rgba(255,255,255,.18)", backdropFilter:"blur(6px)", padding:"5px 13px", borderRadius:2, border:"1px solid rgba(255,255,255,.25)" }}>{card.label}</div>
        </div>
        <div style={{ padding:"22px 24px 28px", background:T.white, borderTop:`3px solid ${col}` }}>
          <p style={{ fontSize:14, color:"#3A506B", lineHeight:1.85, margin:0 }}>{card.text}</p>
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
    <section style={{ padding:`80px ${px}`, background:T.white }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <FadeUp style={{ marginBottom:44 }}>
          <Label n="07" text="Vision · Mission · Commitment" />
        </FadeUp>
        <div style={{ display:"grid", gridTemplateColumns:cols, gap:16 }}>
          {VM_CARDS.map((c, i) => <VMCard key={i} card={c} delay={i*.1} idx={i} />)}
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
    <section style={{ position:"relative", padding:`80px ${px}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", background:T.navy }}>
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.06 }}>
          <defs>
            <pattern id="cdots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill={T.accent} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cdots)" />
        </svg>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width: isMobile ? 320 : 700, height: isMobile ? 320 : 700, borderRadius:"50%", background:`radial-gradient(circle,${T.blue}55 0%,transparent 70%)` }} />
      </div>
      <FadeUp>
        <div style={{ position:"relative", zIndex:2, textAlign:"center", maxWidth: isMobile ? "100%" : 740 }}>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize: isMobile ? 72 : 110, color:"rgba(255,255,255,.05)", lineHeight:.75, fontWeight:700, marginBottom:-18 }}>"</div>
          <blockquote style={{ fontFamily:"'Fraunces',serif", fontSize: isMobile ? "clamp(18px,5vw,26px)" : "clamp(20px,2.8vw,42px)", fontWeight:600, fontStyle:"italic", color:"#fff", lineHeight:1.48, letterSpacing:"-.02em", margin:"0 0 32px" }}>
            Cyberbots is where learning is validated not by what a student knows, but by what a student can do.
          </blockquote>
          <div style={{ width:44, height:2.5, background:`linear-gradient(90deg,${T.sky},${T.accent})`, margin:"0 auto 18px", borderRadius:2 }} />
          <p style={{ fontSize:10, color:"rgba(255,255,255,.3)", letterSpacing:".22em", textTransform:"uppercase", fontWeight:700, margin:0 }}>— Cyberbots</p>
        </div>
      </FadeUp>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600;1,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; }
  img  { display: block; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeRight {
    from { opacity:0; transform:translateY(-50%) translateX(24px); }
    to   { opacity:1; transform:translateY(-50%) translateX(0); }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(110%); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ticker {
    from { transform:translateX(0); }
    to   { transform:translateX(-33.333%); }
  }

  /* Prevent horizontal overflow on small screens */
  @media (max-width: 639px) {
    section { overflow-x: hidden; }
  }

  /* Touch devices: disable hover-only interactions */
  @media (hover: none) {
    * { -webkit-tap-highlight-color: transparent; }
  }
`;

/* ═══════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════ */
export default function CyberbotsAboutBlue() {
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:T.white, color:T.text, overflowX:"hidden" }}>
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