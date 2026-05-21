import { useState } from "react";
import assets from "../../assets/assets";

/* ══════════════════════════════════════════════════════════
   DATA — 10 courses, each with tiers (Beginner/Intermediate/Advanced)
   and levels within each tier
══════════════════════════════════════════════════════════ */
const COURSES = [
  {
    id: 1,
    category: "Robotics",
    icon: "🤖",
    color: "#e85d2f",
    accent: "#fff3ee",
    image: assets.Robotics,
    tiers: [
      {
        tier: "Beginner", ageGroup: "Age 8–11", hours: "20 Hours", schedule: "2 hrs/day",
        levels: [
          { level: "Level 1", name: "Robot Spark ", desc: "Circuits, motors, sensors. Build a remote-controlled car and a line-following bot.", tags: ["Circuits","Motors","Sensors","Line Bot"] },
          { level: "Level 2", name: "Robot Explorer", desc: "Multi-sensor builds, relay logic and feedback systems with real hardware kits.", tags: ["Relay","Feedback","Sensors","Teamwork"] },
        ]
      },
      {
        tier: "Intermediate", ageGroup: "Age 12–14", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "Robot Inventor", desc: "Arduino on TinkerCAD, dual-motor bots and obstacle-avoiding systems.", tags: ["Arduino","TinkerCAD","Servo Motor","Obstacle Bot"] },
          { level: "Level 2", name: "Robot Innovator", desc: "Flame detection, autonomous line-following and sensor fusion projects.", tags: ["Flame Detection","Line Follow","Sensor Fusion"] },
        ]
      },
      {
        tier: "Advanced", ageGroup: "Age 15–18", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "Robot Master", desc: "Real-time robotics with advanced sensors, RFID, and gesture control.", tags: ["RFID","Gesture Control","Radar","Real-Time"] },
          { level: "Level 2", name: "Robot Champ", desc: "Autonomous delivery systems, swarm logic and competitive robotics.", tags: ["Swarm","Autonomous Bot","Competition","ROS"] },
        ]
      },
    ]
  },
  {
    id: 2,
    category: "STEM Education",
    icon: "🔬",
    color: "#0f9d6b",
    accent: "#edfaf4",
    image: assets.Stem,
    tiers: [
      {
        tier: "Beginner", ageGroup: "Below 8 Years", hours: "Project-Based", schedule: "Flexible",
        levels: [
          { level: "Level 1", name: "STEM Junior I", desc: "12 projects: solar cars, magnetic vehicles and simple mechanisms.", tags: ["Solar","Magnetic","Mechanics"] },
          { level: "Level 2", name: "STEM Junior II", desc: "Hydraulic systems, pneumatic builds and introductory electronics.", tags: ["Hydraulics","Pneumatics","Electronics"] },
          { level: "Level 3", name: "STEM Junior III", desc: "Sensor-based builds: light trackers and water-level monitors.", tags: ["Sensors","Light Tracker","Monitor"] },
          { level: "Level 4", name: "STEM Junior IV", desc: "Simple robots, pulleys and gear-train machines.", tags: ["Robots","Pulleys","Gears"] },
          { level: "Level 5", name: "STEM Junior V", desc: "Mini wind turbines, bridge stress tests and showcase projects.", tags: ["Wind","Bridge","Showcase"] },
        ]
      },
    ]
  },
  {
    id: 3,
    category: "Internet of Things",
    icon: "📡",
    color: "#0095c2",
    accent: "#e8f6fb",
    image: assets.Iot,
    tiers: [
      {
        tier: "Intermediate", ageGroup: "Age 12–14", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "Smart IoT I", desc: "ESP8266 fundamentals — Google Sheets and IFTTT automation projects.", tags: ["ESP8266","IFTTT","Google Sheets"] },
          { level: "Level 2", name: "Smart IoT II", desc: "Voice control with Google Assistant and advanced sensor dashboards.", tags: ["Google Assistant","Dashboard","Automation"] },
        ]
      },
      {
        tier: "Advanced", ageGroup: "Age 15–18", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "Advanced IoT I", desc: "ESP32 with GPS, biometrics and cloud connectivity.", tags: ["ESP32","GPS","Biometrics","Cloud"] },
          { level: "Level 2", name: "Advanced IoT II", desc: "Face recognition, AI integration and production IoT pipelines.", tags: ["Face Recognition","AI","Pipeline"] },
        ]
      },
    ]
  },
  {
    id: 4,
    category: "Web Development",
    icon: "🌐",
    color: "#6d35d9",
    accent: "#f3eeff",
    image: assets.Web_Develolpment,
    tiers: [
      {
        tier: "Advanced", ageGroup: "Age 15–18", hours: "40 Hours", schedule: "2 hrs/day",
        levels: [
          { level: "Level 1", name: "Web Wizardry I", desc: "HTML/CSS fundamentals, Flexbox, Grid and responsive layouts.", tags: ["HTML/CSS","Flexbox","Grid","Responsive"] },
          { level: "Level 2", name: "Web Wizardry II", desc: "Figma design, animations and a fully responsive portfolio project.", tags: ["Figma","Animations","Portfolio"] },
        ]
      },
    ]
  },
  {
    id: 5,
    category: "3D Printing",
    icon: "🖨️",
    color: "#c97a0c",
    accent: "#fef7e8",
    image: assets.Printing,
    tiers: [
      {
        tier: "Intermediate", ageGroup: "Age 12–14", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "NextGen Makers I", desc: "Blender basics — puzzles, fidget toys and simple mechanical models.", tags: ["Blender","FDM Print","Boolean Ops"] },
          { level: "Level 2", name: "NextGen Makers II", desc: "Fusion 360 design, slicing software and flying dragon prints.", tags: ["Fusion 360","Slicing","Mechanical Dice"] },
        ]
      },
      {
        tier: "Advanced", ageGroup: "Age 15–18", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "Design Impossible I", desc: "FreeCAD professional CAD, assemblies and G-code fundamentals.", tags: ["FreeCAD","G-Code","Assemblies"] },
          { level: "Level 2", name: "Design Impossible II", desc: "SolidWorks, mesh conversion and production-grade part design.", tags: ["SolidWorks","Mesh","Production"] },
        ]
      },
    ]
  },
  {
    id: 6,
    category: "Artificial Intelligence",
    icon: "🧠",
    color: "#d43c8a",
    accent: "#fde9f4",
    image: assets.AI,
    tiers: [
      {
        tier: "Beginner", ageGroup: "Age 8–11", hours: "20 Hours", schedule: "2 hrs/day",
        levels: [
          { level: "Level 1", name: "AI Sparks I", desc: "Scratch block coding — talking robots and smart traffic lights.", tags: ["Scratch","Block Coding","Voice"] },
          { level: "Level 2", name: "AI Sparks II", desc: "Emotion recognizers, interactive stories and visual AI games.", tags: ["Scratch Jr","Blockly","Emotions"] },
        ]
      },
      {
        tier: "Intermediate", ageGroup: "Age 12–14", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "AI Explorers I", desc: "Python AI transition — logic, NLP and sentiment detection.", tags: ["Python","NLP","Sentiment","PIL"] },
          { level: "Level 2", name: "AI Explorers II", desc: "OpenCV computer vision and rule-based AI projects.", tags: ["OpenCV","Computer Vision","Rule AI"] },
        ]
      },
      {
        tier: "Advanced", ageGroup: "Age 15–18", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "Code Genius I", desc: "Full ML pipeline — neural networks, CNNs and data preprocessing.", tags: ["TensorFlow","CNN","Neural Net"] },
          { level: "Level 2", name: "Code Genius II", desc: "LLM integration, ChatGPT API and deploying AI-powered apps.", tags: ["ChatGPT API","LLM","NLP","Deploy"] },
        ]
      },
    ]
  },
  {
    id: 7,
    category: "Drone Technology",
    icon: "🚁",
    color: "#4f46d1",
    accent: "#eeeeff",
    image: assets.Drone,
    tiers: [
      {
        tier: "Intermediate", ageGroup: "Age 12–14", hours: "20 Hours", schedule: "2 hrs/day",
        levels: [
          { level: "Level 1", name: "Sky Lab I", desc: "UAV mechanics, quadcopter assembly and ESC configuration.", tags: ["Quadcopter","ESC","UAV"] },
          { level: "Level 2", name: "Sky Lab II", desc: "Flight controllers, GPS setup and Mission Planner basics.", tags: ["Flight Controller","GPS","Mission Planner"] },
        ]
      },
      {
        tier: "Advanced", ageGroup: "Age 15–18", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "Beyond Hover I", desc: "FPV racing, PID tuning and autonomous mission planning.", tags: ["FPV","PID Tuning","Autonomous"] },
          { level: "Level 2", name: "Beyond Hover II", desc: "AI obstacle avoidance, swarm logic and drone-to-cloud comms.", tags: ["OpenCV","ROS","Swarm","Cloud"] },
        ]
      },
    ]
  },
  {
    id: 8,
    category: "Data Science",
    icon: "📊",
    color: "#0f9d6b",
    accent: "#edfaf4",
    image: assets.DataScience,
    tiers: [
      {
        tier: "Intermediate", ageGroup: "Age 12–14", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "DataXplore I", desc: "Clean and analyze data using Pandas and NumPy with real CSV datasets.", tags: ["Pandas","NumPy","EDA","CSV"] },
          { level: "Level 2", name: "DataXplore II", desc: "Matplotlib, Seaborn visualizations — Titanic and COVID-19 datasets.", tags: ["Matplotlib","Seaborn","Visualization"] },
        ]
      },
      {
        tier: "Advanced", ageGroup: "Age 15–18", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "Data to Decisions I", desc: "Build data pipelines, deploy ML models and NLP text analysis.", tags: ["NLP","ML Models","Pipeline","Scraping"] },
          { level: "Level 2", name: "Data to Decisions II", desc: "Streamlit web apps, Power BI dashboards and deep learning intro.", tags: ["Streamlit","Power BI","Deep Learning"] },
        ]
      },
    ]
  },
  {
    id: 9,
    category: "App Development",
    icon: "📱",
    color: "#e85d2f",
    accent: "#fff3ee",
    image: assets.AppDevelopement,
    tiers: [
      {
        tier: "Intermediate", ageGroup: "Age 12–14", hours: "20 Hours", schedule: "2 hrs/day",
        levels: [
          { level: "Level 1", name: "Tap Swipe Create I", desc: "First interactive mobile apps — emoji changer and photo diary.", tags: ["Mobile UI","Camera","Counter"] },
          { level: "Level 2", name: "Tap Swipe Create II", desc: "Navigation, menu apps and basic API integration.", tags: ["Navigation","APIs","Menu App"] },
        ]
      },
      {
        tier: "Advanced", ageGroup: "Age 15–18", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1", name: "App Innovators I", desc: "Live APIs, OpenWeather integration and GPS maps.", tags: ["GPS Maps","OpenWeather API","Live Data"] },
          { level: "Level 2", name: "App Innovators II", desc: "Authentication, dark mode and production-quality deployment.", tags: ["Auth","Dark Mode","Production"] },
        ]
      },
    ]
  },
  {
    id: 10,
    category: "Programming",
    icon: "💻",
    color: "#0095c2",
    accent: "#e8f6fb",
    image: assets.Programming,
    languages: ["C#","C++","HTML","Python"],
    tiers: [
      {
        tier: "Intermediate", ageGroup: "Age 12–14", hours: "20 Hours", schedule: "2 hrs/day",
        levels: [
          { level: "Level 1 (C#)", name: "CodeCraft C# I", desc: "Arrays, OOP, inheritance and polymorphism with WinForms GUI.", tags: ["C#","OOP","WinForms","Arrays"] },
          { level: "Level 2 (C#)", name: "CodeCraft C# II", desc: "JSON handling, file I/O and building interactive desktop apps.", tags: ["C#","JSON","File I/O"] },
          { level: "Level 1 (C++)", name: "C++ Level Up I", desc: "Control flow, loops, functions and array manipulation.", tags: ["C++","Loops","Arrays","Functions"] },
          { level: "Level 2 (C++)", name: "C++ Level Up II", desc: "Recursion, pointers and pattern programs.", tags: ["C++","Recursion","Pointers"] },
          { level: "Level 1 (HTML)", name: "HTML BuildZone I", desc: "HTML5 tags, tables, forms and semantic structure.", tags: ["HTML5","Forms","Tables","Semantic"] },
          { level: "Level 2 (HTML)", name: "HTML BuildZone II", desc: "Embeds, iframes and building real web pages.", tags: ["HTML5","Embeds","Iframes"] },
          { level: "Level 1 (Python)", name: "Python Pulse I", desc: "Python OOP, file handling and JSON/CSV data manipulation.", tags: ["Python","OOP","JSON","CSV"] },
          { level: "Level 2 (Python)", name: "Python Pulse II", desc: "Tkinter GUI apps, REST API calls and contact book project.", tags: ["Tkinter","REST API","GUI"] },
        ]
      },
      {
        tier: "Advanced", ageGroup: "Age 15–18", hours: "30 Hours", schedule: "3 hrs/day",
        levels: [
          { level: "Level 1 (C#)", name: "SharpEdge C# I", desc: "ASP.NET Core web apps, API connections and Azure deployment.", tags: ["ASP.NET Core","Azure","Firebase"] },
          { level: "Level 2 (C#)", name: "SharpEdge C# II", desc: "Docker containers, encryption and cloud-native architecture.", tags: ["Docker","Encryption","Cloud"] },
          { level: "Level 1 (C++)", name: "C++ Mastery I", desc: "Templates, STL and lambda functions.", tags: ["C++","STL","Templates","Lambdas"] },
          { level: "Level 2 (C++)", name: "C++ Mastery II", desc: "SFML/Qt GUI, multithreading and GDB debugging.", tags: ["SFML/Qt","Multithreading","GDB"] },
          { level: "Level 1 (HTML)", name: "HTML Masterclass I", desc: "Canvas drawing, SVG embedding and drag & drop interfaces.", tags: ["Canvas","SVG","Drag & Drop"] },
          { level: "Level 2 (HTML)", name: "HTML Masterclass II", desc: "Viewport responsiveness and file upload interactions.", tags: ["Viewport","File Upload","Responsive"] },
          { level: "Level 1 (Python)", name: "Python Pro I", desc: "Flask web apps, SQLite databases and file automation.", tags: ["Flask","SQLite","Automation"] },
          { level: "Level 2 (Python)", name: "Python Pro II", desc: "PyPDF2, openpyxl and machine learning with scikit-learn.", tags: ["PyPDF2","openpyxl","scikit-learn"] },
        ]
      },
    ]
  },
];

const TIER_CONFIG = {
  Beginner:     { bg:"#dcfce7", color:"#14532d", dot:"#16a34a" },
  Intermediate: { bg:"#dbeafe", color:"#1e3a8a", dot:"#2563eb" },
  Advanced:     { bg:"#fce7f3", color:"#831843", dot:"#db2777" },
};

const CATEGORIES = ["All", ...COURSES.map(c => c.category)];

/* ══════════════════════════════════════════════════════════
   ENROLLMENT MODAL (compact 3-step)
══════════════════════════════════════════════════════════ */
const COURSE_OPTIONS = COURSES.map(c => c.category);
const STEPS = [
  { id:1, icon:"🎒", label:"Student" },
  { id:2, icon:"👨‍👩‍👧", label:"Parent" },
  { id:3, icon:"🚀", label:"Course" },
];
const EMPTY_FORM = {
  studentName:"", dob:"", gender:"", grade:"", institution:"", learningMode:"",
  parentName:"", relationship:"", mobile:"", altMobile:"", email:"", address:"",
  course:"", tier:"", levelName:"",
  c1:false, c2:false, c3:false,
};

function EnrollModal({ course, selectedTier, selectedLevel, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    course: course?.category || "",
    tier: selectedTier || "",
    levelName: selectedLevel?.name || "",
  });
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));
  const err = k => errors[k] ? "2.5px solid #ef4444" : "2px solid #e8eaf0";

  const validate = () => {
    const e = {};
    if (step===1) {
      if (!form.studentName.trim()) e.studentName=true;
      if (!form.dob) e.dob=true;
      if (!form.gender) e.gender=true;
      if (!form.grade.trim()) e.grade=true;
      if (!form.institution.trim()) e.institution=true;
      if (!form.learningMode) e.learningMode=true;
    }
    if (step===2) {
      if (!form.parentName.trim()) e.parentName=true;
      if (!form.relationship.trim()) e.relationship=true;
      if (!form.mobile.trim()) e.mobile=true;
      if (!form.email.trim()) e.email=true;
      if (!form.address.trim()) e.address=true;
    }
    if (step===3) {
      if (!form.course) e.course=true;
      if (!form.c1) e.c1=true;
      if (!form.c2) e.c2=true;
      if (!form.c3) e.c3=true;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s=>s+1); };
  const prev = () => setStep(s=>s-1);
  const submit = () => { if (validate()) setDone(true); };

  const fld = (extra={}) => ({
    width:"100%", padding:"10px 13px", borderRadius:12, outline:"none",
    fontFamily:"'Nunito',sans-serif", fontSize:13, color:"#1a2340", background:"#fff",
    transition:"border-color .2s", ...extra,
  });
  const lbl = { fontSize:11, fontWeight:800, color:"#6b7a99", marginBottom:3, display:"block", letterSpacing:.3 };

  if (done) return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign:"center", padding:"2.5rem 2rem" }}>
        <div style={{ fontSize:72 }}>🎉</div>
        <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.8rem", color:"#7c3aed", margin:".75rem 0 .4rem" }}>You're Enrolled!</h2>
        <p style={{ fontSize:13, color:"#6b7a99", lineHeight:1.7, marginBottom:"1.25rem" }}>
          Awesome, <strong>{form.studentName}</strong>! 🚀<br/>
          We'll contact <strong>{form.parentName}</strong> at <strong>{form.mobile}</strong><br/>
          to confirm your spot in <span style={{ color:"#ff6b2b", fontWeight:800 }}>{form.course}{form.tier ? ` · ${form.tier}` : ""}{form.levelName ? ` · ${form.levelName}` : ""}</span>!
        </p>
        <button onClick={onClose} style={{ padding:"10px 28px", borderRadius:100, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#ff6b2b,#ec4899)", color:"#fff", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800 }}>
          Back to Courses 🎒
        </button>
      </div>
    </Overlay>
  );

  return (
    <Overlay onClose={onClose}>
      <div style={{ display:"flex", flexDirection:"column", maxHeight:"90vh", width:"100%" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#7c3aed,#ec4899)", padding:"1.1rem 1.4rem .9rem", borderRadius:"22px 22px 0 0", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,.7)", letterSpacing:2, textTransform:"uppercase", marginBottom:2 }}>LearnX Enrollment</div>
              <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.3rem", color:"#fff", margin:0 }}>
                {course ? `✨ ${course.category}` : "✨ Join LearnX!"}
              </h2>
              {form.levelName && <p style={{ fontSize:11, color:"rgba(255,255,255,.75)", margin:"2px 0 0", fontWeight:600 }}>{form.tier} · {form.levelName}</p>}
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.2)", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", color:"#fff", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
          {/* Steps */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginTop:"1rem" }}>
            {STEPS.map((s,i) => {
              const active = step===s.id, doneSt = step>s.id;
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:doneSt?"rgba(255,255,255,.95)":active?"#fff":"rgba(255,255,255,.22)", border:active?"3px solid #fff":doneSt?"3px solid rgba(255,255,255,.5)":"2px solid rgba(255,255,255,.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:doneSt?14:16, boxShadow:active?"0 0 0 3px rgba(255,255,255,.22)":"none", transition:"all .3s" }}>
                      {doneSt?"✅":s.icon}
                    </div>
                    <span style={{ fontSize:9, fontWeight:800, color:active?"#fff":"rgba(255,255,255,.55)", letterSpacing:.4 }}>{s.label}</span>
                  </div>
                  {i<STEPS.length-1 && <div style={{ width:44, height:2, margin:"0 5px 16px", background:step>s.id?"rgba(255,255,255,.75)":"rgba(255,255,255,.22)", borderRadius:2, transition:"background .3s" }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY:"auto", flex:1, padding:"1.25rem", scrollbarWidth:"thin" }}>
          {step===1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:".85rem" }}>
              <SH icon="🎒" title="Student Information" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".75rem" }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>👦 Student Name *</label>
                  <input style={{ ...fld(), border:err("studentName") }} placeholder="Full name" value={form.studentName} onChange={e=>set("studentName",e.target.value)} />
                  {errors.studentName && <EM msg="Name is required" />}
                </div>
                <div>
                  <label style={lbl}>🎂 Date of Birth *</label>
                  <input type="date" style={{ ...fld(), border:err("dob") }} value={form.dob} onChange={e=>set("dob",e.target.value)} />
                  {errors.dob && <EM msg="Required" />}
                </div>
                <div>
                  <label style={lbl}>🙋 Gender *</label>
                  <select style={{ ...fld(), border:err("gender"), color:form.gender?"#1a2340":"#9ca3af" }} value={form.gender} onChange={e=>set("gender",e.target.value)}>
                    <option value="">Select</option>
                    {["Male","Female","Other"].map(g=><option key={g}>{g}</option>)}
                  </select>
                  {errors.gender && <EM msg="Required" />}
                </div>
                <div>
                  <label style={lbl}>📚 Grade *</label>
                  <input style={{ ...fld(), border:err("grade") }} placeholder="e.g. Grade 7" value={form.grade} onChange={e=>set("grade",e.target.value)} />
                  {errors.grade && <EM msg="Required" />}
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>🏫 Institution *</label>
                  <input style={{ ...fld(), border:err("institution") }} placeholder="School or college" value={form.institution} onChange={e=>set("institution",e.target.value)} />
                  {errors.institution && <EM msg="Required" />}
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>💻 Learning Mode *</label>
                  <div style={{ display:"flex", gap:8 }}>
                    {["Online","Offline"].map(m=>(
                      <button key={m} onClick={()=>set("learningMode",m)} style={{ flex:1, padding:"10px 0", borderRadius:12, border:`2px solid ${form.learningMode===m?"#7c3aed":"#e8eaf0"}`, background:form.learningMode===m?"rgba(124,58,237,.08)":"#fff", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, color:form.learningMode===m?"#7c3aed":"#6b7a99", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                        {m==="Online"?"🌐":"🏫"} {m}
                      </button>
                    ))}
                  </div>
                  {errors.learningMode && <EM msg="Please pick a mode" />}
                </div>
              </div>
            </div>
          )}

          {step===2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:".85rem" }}>
              <SH icon="👨‍👩‍👧" title="Parent / Guardian" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".75rem" }}>
                <div>
                  <label style={lbl}>👤 Parent Name *</label>
                  <input style={{ ...fld(), border:err("parentName") }} placeholder="Full name" value={form.parentName} onChange={e=>set("parentName",e.target.value)} />
                  {errors.parentName && <EM msg="Required" />}
                </div>
                <div>
                  <label style={lbl}>🤝 Relationship *</label>
                  <input style={{ ...fld(), border:err("relationship") }} placeholder="Father / Mother" value={form.relationship} onChange={e=>set("relationship",e.target.value)} />
                  {errors.relationship && <EM msg="Required" />}
                </div>
                <div>
                  <label style={lbl}>📱 Mobile *</label>
                  <input type="tel" style={{ ...fld(), border:err("mobile") }} placeholder="+91 00000 00000" value={form.mobile} onChange={e=>set("mobile",e.target.value)} />
                  {errors.mobile && <EM msg="Required" />}
                </div>
                <div>
                  <label style={lbl}>📞 Alt Mobile</label>
                  <input type="tel" style={fld()} placeholder="Optional" value={form.altMobile} onChange={e=>set("altMobile",e.target.value)} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>✉️ Email *</label>
                  <input type="email" style={{ ...fld(), border:err("email") }} placeholder="parent@email.com" value={form.email} onChange={e=>set("email",e.target.value)} />
                  {errors.email && <EM msg="Required" />}
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>🏠 Address *</label>
                  <textarea rows={3} style={{ ...fld(), resize:"none", lineHeight:1.65, border:err("address") }} placeholder="Street, City, State, PIN" value={form.address} onChange={e=>set("address",e.target.value)} />
                  {errors.address && <EM msg="Required" />}
                </div>
              </div>
            </div>
          )}

          {step===3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:".85rem" }}>
              <SH icon="🚀" title="Course Selection" />
              <div>
                <label style={lbl}>🎓 Program *</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                  {COURSE_OPTIONS.map(c=>{
                    const course_ = COURSES.find(x=>x.category===c);
                    return (
                      <button key={c} onClick={()=>set("course",c)} style={{ padding:"9px 10px", borderRadius:12, cursor:"pointer", textAlign:"left", fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:700, border:`2px solid ${form.course===c?"#7c3aed":"#e8eaf0"}`, background:form.course===c?"rgba(124,58,237,.07)":"#fff", color:form.course===c?"#7c3aed":"#6b7a99", transition:"all .2s", display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ fontSize:14 }}>{course_?.icon||"⭐"}</span> {c}
                      </button>
                    );
                  })}
                </div>
                {errors.course && <EM msg="Please select a program" />}
              </div>
              <div style={{ background:"#f8f4ff", borderRadius:16, padding:"1rem", border:"1.5px dashed #c4b5fd", marginTop:4 }}>
                <p style={{ fontSize:10, fontWeight:800, color:"#7c3aed", letterSpacing:1.5, textTransform:"uppercase", marginBottom:".65rem" }}>📋 Declaration</p>
                <p style={{ fontSize:12, color:"#6b7a99", marginBottom:".75rem", lineHeight:1.6 }}>I, <strong style={{ color:"#1a2340" }}>{form.parentName||"(Parent/Guardian)"}</strong>, hereby:</p>
                {[
                  { key:"c1", text:"Declare all information provided is accurate and correct." },
                  { key:"c2", text:"Consent to my ward's participation in the LearnX Skill Program." },
                  { key:"c3", text:"Agree to abide by all terms and conditions set by LearnX." },
                ].map(({key,text})=>(
                  <label key={key} style={{ display:"flex", gap:9, alignItems:"flex-start", cursor:"pointer", marginBottom:".55rem" }}>
                    <div onClick={()=>{ set(key,!form[key]); setErrors(e=>({...e,[key]:false})); }} style={{ width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1, border:`2px solid ${errors[key]?"#ef4444":form[key]?"#7c3aed":"#c4b5fd"}`, background:form[key]?"#7c3aed":"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", transition:"all .2s", cursor:"pointer" }}>
                      {form[key]?"✓":""}
                    </div>
                    <span style={{ fontSize:12, color:"#4b5563", lineHeight:1.6 }}>{text}</span>
                  </label>
                ))}
                {(errors.c1||errors.c2||errors.c3) && <EM msg="Please accept all required declarations" />}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:".9rem 1.25rem", borderTop:"1.5px dashed rgba(0,0,0,.07)", display:"flex", justifyContent:"space-between", flexShrink:0 }}>
          {step>1 ? <button onClick={prev} style={{ padding:"9px 20px", borderRadius:100, border:"2px solid #e8eaf0", background:"#fff", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, color:"#6b7a99" }}>← Back</button> : <div/>}
          {step<3 ? (
            <button onClick={next} style={{ padding:"9px 24px", borderRadius:100, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#7c3aed,#ec4899)", color:"#fff", fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, boxShadow:"0 4px 12px rgba(124,58,237,.35)" }}>
              Next Step →
            </button>
          ) : (
            <button onClick={submit} style={{ padding:"9px 24px", borderRadius:100, border:"none", cursor:"pointer", background:"linear-gradient(135deg,#ff6b2b,#ec4899)", color:"#fff", fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, boxShadow:"0 4px 12px rgba(255,107,43,.38)" }}>
              🚀 Submit Enrollment
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ onClose, children }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(10,10,30,.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", overflowY:"auto" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:22, width:"100%", maxWidth:500, boxShadow:"0 20px 56px rgba(0,0,0,.22)", animation:"modalIn .3s cubic-bezier(.175,.885,.32,1.2) both" }}>
        {children}
      </div>
    </div>
  );
}
function SH({ icon, title }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.05rem", color:"#1a2340" }}>{title}</span>
    </div>
  );
}
function EM({ msg }) {
  return <p style={{ fontSize:11, color:"#ef4444", fontWeight:700, marginTop:3 }}>⚠ {msg}</p>;
}

/* ══════════════════════════════════════════════════════════
   COURSE CARD — with inline tier + level picker
══════════════════════════════════════════════════════════ */
function CourseCard({ course, index, onEnroll }) {
  const [hovered, setHovered] = useState(false);
  // Which tier is selected (default to first)
  const [selTierIdx, setSelTierIdx] = useState(0);
  // Which level is selected (default to first of that tier)
  const [selLvlIdx, setSelLvlIdx] = useState(0);

  const tier = course.tiers[selTierIdx];
  const level = tier?.levels[selLvlIdx];
  const tierCfg = TIER_CONFIG[tier?.tier] || TIER_CONFIG.Beginner;

  const handleTierChange = (idx) => {
    setSelTierIdx(idx);
    setSelLvlIdx(0);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:"#ffffff", borderRadius:22, overflow:"hidden", cursor:"default",
        position:"relative", display:"flex", flexDirection:"column",
        transition:"transform .28s ease, box-shadow .28s ease",
        boxShadow: hovered ? `0 20px 44px rgba(0,0,0,.13)` : "0 2px 14px rgba(0,0,0,.07)",
        border:`2px solid ${hovered ? course.color+"55" : "transparent"}`,
        transform: hovered ? "translateY(-5px)" : "none",
        animation:`fadeUp .5s ease ${(index%4)*.08}s both`,
        fontFamily:"'Nunito',sans-serif",
      }}
    >
      {/* Image */}
      <div style={{ position:"relative", height:140, overflow:"hidden", flexShrink:0 }}>
        <img src={course.image} alt={course.category} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform .4s", transform:hovered?"scale(1.06)":"scale(1)" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 55%)" }} />
        <div style={{ position:"absolute", bottom:10, left:12, display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:22 }}>{course.icon}</span>
          <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.15rem", color:"#fff", lineHeight:1.1, textShadow:"0 1px 4px rgba(0,0,0,.5)" }}>{course.category}</span>
        </div>
        {course.languages && (
          <div style={{ position:"absolute", top:10, right:10, display:"flex", gap:4, flexWrap:"wrap", justifyContent:"flex-end" }}>
            {course.languages.map(l => (
              <span key={l} style={{ fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:100, background:"rgba(255,255,255,.9)", color:course.color, border:`1.5px solid ${course.color}55` }}>{l}</span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding:"1rem", flex:1, display:"flex", flexDirection:"column", gap:".75rem" }}>

        {/* ── Tier selector ── */}
        <div>
          <div style={{ fontSize:10, fontWeight:800, color:"#9ca3af", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Select Level</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {course.tiers.map((t, ti) => {
              const tc = TIER_CONFIG[t.tier];
              const active = ti === selTierIdx;
              return (
                <button
                  key={t.tier}
                  onClick={() => handleTierChange(ti)}
                  style={{
                    padding:"5px 12px", borderRadius:100, border:`2px solid ${active ? course.color : "#e5e7eb"}`,
                    background: active ? course.color : "#fff",
                    color: active ? "#fff" : "#6b7a99",
                    fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:800,
                    cursor:"pointer", transition:"all .2s", display:"flex", alignItems:"center", gap:5,
                    boxShadow: active ? `0 3px 10px ${course.color}44` : "none",
                  }}
                >
                  <span style={{ width:7, height:7, borderRadius:"50%", background: active ? "rgba(255,255,255,.8)" : tc.dot, display:"inline-block", flexShrink:0 }} />
                  {t.tier}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Info strip for selected tier ── */}
        <div style={{ background: course.accent, borderRadius:12, padding:"8px 12px", display:"flex", gap:"1.25rem", flexWrap:"wrap" }}>
          {[
            { icon:"👦", label: tier.ageGroup },
            { icon:"⏱", label: tier.hours },
            { icon:"📅", label: tier.schedule },
          ].map(m => (
            <span key={m.label} style={{ fontSize:11, fontWeight:700, color:course.color, display:"flex", alignItems:"center", gap:4 }}>
              <span>{m.icon}</span> {m.label}
            </span>
          ))}
        </div>

        {/* ── Level selector ── */}
        <div>
          <div style={{ fontSize:10, fontWeight:800, color:"#9ca3af", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>
            Pick a Level <span style={{ color:course.color }}>({tier.levels.length} available)</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {tier.levels.map((lv, li) => {
              const active = li === selLvlIdx;
              return (
                <button
                  key={li}
                  onClick={() => setSelLvlIdx(li)}
                  style={{
                    padding:"9px 12px", borderRadius:12, textAlign:"left", cursor:"pointer",
                    border:`2px solid ${active ? course.color+"88" : "#e5e7eb"}`,
                    background: active ? course.accent : "#fff",
                    fontFamily:"'Nunito',sans-serif", transition:"all .18s",
                    display:"flex", alignItems:"center", gap:10,
                  }}
                >
                  <div style={{ width:28, height:28, borderRadius:8, background: active ? course.color : "#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background .2s" }}>
                    <span style={{ fontSize:10, fontWeight:900, color: active ? "#fff" : "#9ca3af" }}>{li+1}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800, color: active ? "#1a2340" : "#6b7a99", lineHeight:1.1 }}>{lv.level}</div>
                    <div style={{ fontSize:11, color: active ? course.color : "#9ca3af", fontWeight:700, marginTop:1 }}>{lv.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Selected level detail ── */}
        {level && (
          <div style={{ background:"#f9fafb", borderRadius:12, padding:"10px 12px", flex:1, display:"flex", flexDirection:"column", gap:8 }}>
            <p style={{ fontSize:12, color:"#4b5563", lineHeight:1.65, margin:0, flex:1, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {level.desc}
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {level.tags.map(t => (
                <span key={t} style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:700, background:`${course.color}14`, color:course.color, border:`1.5px solid ${course.color}22` }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Enroll button ── */}
        <button
          onClick={() => onEnroll({ course, tier, level })}
          style={{
            width:"100%", padding:"11px 0", borderRadius:14, border:"none", cursor:"pointer",
            fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, letterSpacing:.5, color:"#fff",
            background:`linear-gradient(135deg,${course.color},${course.color}cc)`,
            boxShadow:`0 4px 14px ${course.color}44`, transition:"transform .15s, box-shadow .15s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="scale(1.03)"; e.currentTarget.style.boxShadow=`0 6px 20px ${course.color}55`; }}
          onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow=`0 4px 14px ${course.color}44`; }}
        >
          Enroll in {level?.level || tier?.tier} 🚀
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BG SHAPES
══════════════════════════════════════════════════════════ */
function BgShapes() {
  const colors = ["#7c3aed","#ff6b2b","#00b8d9","#10b981","#ec4899","#f59e0b"];
  const shapes = Array.from({ length: 14 }, (_, i) => ({
    id:i, size:24+Math.random()*70, left:Math.random()*100, top:100+Math.random()*100,
    color:colors[i%colors.length], duration:14+Math.random()*18, delay:-(Math.random()*18),
    borderRadius:`${22+Math.random()*38}%`,
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {shapes.map(s => (
        <div key={s.id} style={{ position:"absolute", width:s.size, height:s.size, left:`${s.left}%`, top:`${s.top}%`, background:s.color, borderRadius:s.borderRadius, opacity:.06, animation:`floatShape ${s.duration}s linear ${s.delay}s infinite` }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CyberbotsCoursesPage() {
  const [selCat, setSelCat] = useState("All");
  const [search, setSearch] = useState("");
  const [enrollData, setEnrollData] = useState(null);

  const filtered = COURSES.filter(c => {
    const catOk = selCat === "All" || c.category === selCat;
    const q = search.toLowerCase();
    const srchOk = !q || c.category.toLowerCase().includes(q) ||
      c.tiers.some(t => t.levels.some(l => l.name.toLowerCase().includes(q) || l.tags.some(tag => tag.toLowerCase().includes(q))));
    return catOk && srchOk;
  });

  const stats = [
    { num:"10",  label:"Courses",  color:"#7c3aed" },
    { num:"1L+", label:"Students", color:"#ff6b2b" },
    { num:"100+", label:"Schools",  color:"#00b8d9" },
    { num:"10+",  label:"Years",    color:"#10b981" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f0f7ff;}
        @keyframes floatShape{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(-120vh) rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.88) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes bounceIn{0%{opacity:0;transform:scale(.8) translateY(18px)}70%{transform:scale(1.04)}100%{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>

      <div style={{ background:"#f0f7ff", minHeight:"100vh", fontFamily:"'Nunito',sans-serif", color:"#1a2340", overflowX:"hidden", position:"relative", paddingBottom:"4rem" }}>
        <BgShapes />

        {/* Hero */}
        <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"3rem 1.5rem 2rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(124,58,237,.1)", border:"1.5px solid rgba(124,58,237,.28)", color:"#7c3aed", borderRadius:100, padding:"5px 16px", fontSize:11, fontWeight:800, letterSpacing:2, textTransform:"uppercase", marginBottom:"1rem", animation:"bounceIn .6s ease both" }}>
            ⭐ LearnX Series ⭐
          </div>
          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(2.4rem,7vw,4.8rem)", lineHeight:1.05, marginBottom:".75rem", animation:"bounceIn .7s ease .1s both" }}>
            <span style={{ display:"block", color:"#1a2340" }}>Explore Amazing</span>
            <span style={{ display:"block", background:"linear-gradient(135deg,#ff6b2b,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Courses!</span>
          </h1>
          <p style={{ fontSize:14, color:"#6b7a99", maxWidth:480, margin:"0 auto 2rem", lineHeight:1.8, animation:"fadeUp .6s ease .25s both" }}>
            10 awesome programs across Robotics, AI, Drones, IoT, 3D Printing & more — with real kits, expert teachers, and certificates for every hero! 🏆
          </p>

          {/* Stats */}
          <div style={{ display:"flex", justifyContent:"center", gap:"2.5rem", flexWrap:"wrap", marginBottom:"2.5rem", animation:"fadeUp .6s ease .35s both" }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:"2.2rem", lineHeight:1, color:s.color }}>{s.num}</div>
                <div style={{ fontSize:11, fontWeight:700, color:"#6b7a99", letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ position:"relative", zIndex:1, padding:"0 1.5rem 1.5rem" }}>
          <div style={{ maxWidth:420, margin:"0 auto 1.25rem", position:"relative" }}>
            <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:15, height:15, stroke:"#6b7a99", fill:"none" }} viewBox="0 0 24 24" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" placeholder="Search courses, skills, topics..."
              value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:"100%", padding:"11px 12px 11px 36px", background:"#fff", border:"2px solid rgba(0,0,0,.08)", borderRadius:100, fontFamily:"'Nunito',sans-serif", fontSize:13, color:"#1a2340", outline:"none" }}
            />
          </div>

          {/* Category pills */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, justifyContent:"center", marginBottom:"1rem" }}>
            {CATEGORIES.map(c => {
              const course_ = COURSES.find(x=>x.category===c);
              const active = selCat===c;
              return (
                <button key={c} onClick={()=>setSelCat(c)} style={{
                  display:"inline-flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:100,
                  border:`2px solid ${active ? (course_?.color||"#7c3aed") : "transparent"}`,
                  background: active ? (course_?.color||"#7c3aed") : "#fff",
                  fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700,
                  color: active ? "#fff" : "#6b7a99",
                  cursor:"pointer", transition:"all .2s", whiteSpace:"nowrap",
                  boxShadow: active ? `0 3px 12px ${course_?.color||"#7c3aed"}44` : "none",
                }}>
                  {course_?.icon||"⭐"} {c}
                </button>
              );
            })}
          </div>

          <p style={{ textAlign:"center", fontSize:12, fontWeight:700, color:"#6b7a99" }}>
            Showing <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:15, color:"#00b8d9" }}>{filtered.length}</span> of <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:15, color:"#ff6b2b" }}>{COURSES.length}</span> programs
          </p>
        </div>

        {/* Grid */}
        <div style={{ position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1.4rem", padding:"0 1.5rem 2rem", maxWidth:1400, margin:"0 auto" }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"4rem 1rem" }}>
              <div style={{ fontSize:52, marginBottom:"1rem" }}>🔭</div>
              <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:"1.4rem", color:"#1a2340" }}>No courses found!</p>
              <p style={{ fontSize:13, color:"#6b7a99", marginTop:".5rem" }}>Try a different search or filter</p>
              <button onClick={()=>{ setSelCat("All"); setSearch(""); }} style={{ marginTop:"1rem", padding:"10px 24px", borderRadius:100, border:"2px solid #ff6b2b", background:"transparent", color:"#ff6b2b", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800, cursor:"pointer" }}>Reset Filters</button>
            </div>
          ) : filtered.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} onEnroll={({ course, tier, level }) => setEnrollData({ course, tier, level })} />
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"2rem 1.5rem 3rem" }}>
          <p style={{ fontFamily:"'Fredoka One',cursive", fontSize:"clamp(1.5rem,4vw,2.4rem)", color:"#1a2340" }}>
            Ready to start your<br/><span style={{ color:"#7c3aed" }}>skill adventure?</span> 🚀
          </p>
          <p style={{ fontSize:13, color:"#6b7a99", marginTop:".5rem" }}>Real kits · Expert instructors · Certificates for every hero</p>
          <button onClick={()=>setEnrollData({ course:null, tier:null, level:null })} style={{ display:"inline-block", marginTop:"1rem", padding:"13px 38px", borderRadius:100, border:"none", background:"linear-gradient(135deg,#ff6b2b,#ec4899)", color:"#fff", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:800, cursor:"pointer", boxShadow:"0 6px 20px rgba(255,107,43,.35)" }}>
            Enroll Now! →
          </button>
        </div>
      </div>

      {enrollData && (
        <EnrollModal
          course={enrollData.course}
          selectedTier={enrollData.tier?.tier}
          selectedLevel={enrollData.level}
          onClose={()=>setEnrollData(null)}
        />
      )}
    </>
  );
}