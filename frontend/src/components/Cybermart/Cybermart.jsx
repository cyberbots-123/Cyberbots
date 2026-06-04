import { useState, useMemo, useEffect, useCallback } from "react";
import assets from "../../assets/assets";

/* ─────────────────────────────────────────────
   PRODUCTS DATA (from documents)
───────────────────────────────────────────── */
const PRODUCTS = [
  // ROBOTICS
  {
    id: 1, name: "Robotic Arm", cat: "Robotics", image:assets.roboticarm,
    price: 12499, was: 15999, rating: 4.5, reviews: 847, prime: true, tag: "Best Seller",
    desc: "High-precision intelligent robotic arm with servo-based multi-axis movement, app/joystick control and programmable functionality.",
    specs: "Microcontroller: ESP32 | Structure: Custom 3D-Printed Body | Control Modes: App / Joystick / Programmable | Power: Rechargeable battery",
    projects: [],
    components: ["ESP32 Development Board", "SG90/MG996R Servo Motors", "3D Printed Arm Structure", "Joystick Module", "Servo Driver Module", "Rechargeable Battery Pack", "Power Switch", "Connecting Wires & Accessories"],
  },
  {
    id: 2, name: "Gesture Controlled Bot", cat: "Robotics", image:assets.gesturecontrolbot,
    price: 7499, was: 9999, rating: 4.3, reviews: 523, prime: false, tag: "",
    desc: "Advanced hand-gesture controlled robot with wireless gesture technology and premium black acrylic casing for immersive control.",
    specs: "Microcontroller: ESP32 | Body: Premium Black Acrylic | Control: Wireless Hand Gesture | Connectivity: Bluetooth / Wi-Fi",
    projects: [],
    components: ["ESP32 Development Board", "MPU6050 Motion Sensor", "Wireless Communication Module", "Motor Driver Module", "BO Motors", "Wheels", "Acrylic Chassis", "Rechargeable Battery Pack", "Connecting Wires"],
  },
  {
    id: 3, name: "Cyber Cart", cat: "Robotics", image:assets.cybercart,
    price: 8999, was: null, rating: 4.4, reviews: 312, prime: true, tag: "New",
    desc: "Futuristic autonomous-style robotic platform with sleek black acrylic chassis, 4-wheel differential drive and Bluetooth & Wi-Fi connectivity.",
    specs: "Microcontroller: ESP32 | Body: Premium Black Acrylic | Drive: 4-Wheel Differential | Connectivity: Bluetooth & Wi-Fi",
    projects: [],
    components: ["ESP32 Development Board", "Motor Driver Module", "4 BO Motors", "4 Wheels", "Premium Acrylic Chassis", "Battery Pack", "Switch", "Jumper Wires"],
  },
  {
    id: 4, name: "QuadX Bot", cat: "Robotics", image :assets.quadx,
    price: 14999, was: 17999, rating: 4.4, reviews: 428, prime: false, tag: "",
    desc: "Futuristic 3D-printed omni-directional robot with 360° multi-directional navigation and spider-like mobility.",
    specs: "Microcontroller: Arduino Uno | Drive: Omni-Directional | Mobility: 360° Navigation | Actuation: Precision Servo Motors",
    projects: [],
    components: ["Arduino Uno", "Omni Wheels", "Servo Motors", "Motor Driver", "3D Printed Body", "Wireless Control Module", "Rechargeable Battery", "Mounting Hardware"],
  },
  {
    id: 5, name: "Cyber Prosthetic Hand", cat: "Robotics", image:assets.cyberhand,
    price: 24999, was: null, rating: 4.8, reviews: 1204, prime: true, tag: "Top Rated",
    desc: "3D-printed robotic prosthetic hand with servo-driven finger articulation, joystick control and independent multi-finger movement.",
    specs: "Microcontroller: Arduino Uno | Movement: Servo-Driven Fingers | Control: Joystick & Programmable | Expansion: AI Integration Ready",
    projects: [],
    components: ["Arduino Uno", "SG90 Servo Motors", "Joystick Module", "3D Printed Prosthetic Hand Parts", "Battery Pack", "Jumper Wires", "Fasteners & Accessories"],
  },
  {
    id: 6, name: "Vacu Rover Bot", cat: "Robotics", image:assets.vaccum,
    price: 9999, was: 12999, rating: 4.2, reviews: 689, prime: false, tag: "",
    desc: "Compact autonomous cleaning robot with integrated vacuum, rotating brush mechanism and smart obstacle detection.",
    specs: "Microcontroller: Arduino Uno | Cleaning: Vacuum & Rotating Brush | Navigation: Obstacle Detection | Drive: Differential",
    projects: [],
    components: ["Arduino Uno", "Ultrasonic Sensor", "Motor Driver Module", "BO Motors", "Wheels", "Vacuum Motor", "Rotating Brush Assembly", "Acrylic Chassis", "Rechargeable Battery"],
  },
  {
    id: 7, name: "3-in-1 Bot", cat: "Robotics", image:assets.line,
    price: 5999, was: 7499, rating: 4.3, reviews: 534, prime: true, tag: "3 in 1",
    desc: "Multi-functional robot performing line following, light tracking and obstacle avoidance in one programmable platform.",
    specs: "Microcontroller: Arduino Uno | Modes: Line Following, Light Following, Obstacle Avoidance | Sensors: IR, LDR, Ultrasonic",
    projects: ["Line Following Robot", "Light Following Robot", "Obstacle Avoidance Robot"],
    components: ["Arduino Uno", "HC-SR04 Ultrasonic Sensor", "IR Sensor", "LDR Sensor", "L298N Motor Driver", "BO DC Gear Motors (x2)", "Robot Wheels (x2)", "Caster Wheel", "Robot Chassis", "Jumper Wires", "USB Cable"],
  },
  {
    id: 8, name: "Surveillance Bot", cat: "Robotics", image:assets.survive,
    price: 11499, was: null, rating: 4.6, reviews: 389, prime: true, tag: "IoT",
    desc: "IoT-enabled mobile robot with PIR motion sensing, ultrasonic detection and optional live video streaming via ESP32-CAM.",
    specs: "Controller: Arduino Uno & ESP32 | Sensors: Ultrasonic & PIR | Monitoring: ESP32-CAM Video Streaming | Alert: Buzzer & LED",
    projects: [],
    components: ["Arduino Uno", "ESP32 Module", "ESP32-CAM", "PIR Motion Sensor", "Ultrasonic Sensor", "Buzzer", "LEDs", "Motor Driver Module", "BO Motors", "Wheels", "Battery Pack"],
  },
  {
    id: 9, name: "Cyber Bin", cat: "Robotics", image:assets.bin,
    price: 7999, was: null, rating: 4.1, reviews: 245, prime: false, tag: "Smart",
    desc: "Smart autonomous waste management robot with intelligent navigation, obstacle detection and eco-friendly automation.",
    specs: "Controller: Arduino Uno & ESP32 | Drive: Differential Navigation | Sensors: Ultrasonic | Expansion: IoT & AI Compatible",
    projects: [],
    components: ["Arduino Uno", "ESP32 Module", "Ultrasonic Sensor", "Motor Driver", "BO Motors", "Wheels", "Smart Bin Structure", "Rechargeable Battery"],
  },
  {
    id: 10, name: "Humanoid Serving Bot", cat: "Robotics", image:assets.serving,
    price: 18999, was: 22999, rating: 4.7, reviews: 312, prime: true, tag: "New",
    desc: "Modular robotic platform supporting up to 7 robot configurations including delivery bot, obstacle avoider and parking bot.",
    specs: "Compatible: Arduino Uno/Nano/Mega & Raspberry Pi | Configs: 7 Robot Designs | Drive: 4-Wheel Differential | Age: 7–14 Years",
    projects: ["Catch Me If You Can Bot", "Robo Car", "Follow Me Bot", "Delivery Bot", "Edge Detector", "Obstacle Avoidance Bot", "Parking Bot"],
    components: ["Arduino Uno / ESP32", "Servo Motors", "Acrylic / 3D Printed Body", "Wheels", "Motor Driver Module", "Ultrasonic Sensor", "Battery Pack"],
  },
  // ELECTRONICS
  {
    id: 11, name: "Soldering Kit 4-in-1", cat: "Electronics", image:assets.ek1,
    price: 1299, was: null, rating: 4.6, reviews: 2341, prime: true, tag: "Best Seller",
    desc: "Compact 4-in-1 soldering kit with fast-heating iron, flux paste, desoldering wick — perfect for PCB soldering and circuit repairs.",
    specs: "Contents: Soldering Iron, Soldering Wire, Flux Paste, Desoldering Wick | Fast-heating iron | Compact portable design",
    projects: [],
    components: ["Soldering Iron", "Soldering Wire", "Flux Paste", "Desoldering Wick"],
  },
  {
    id: 12, name: "Soldering Kit 15-Piece", cat: "Electronics", image:assets.ek2,
    price: 2799, was: 3499, rating: 4.5, reviews: 1876, prime: true, tag: "Pro Kit",
    desc: "Professional 15-piece electronics repair kit with multimeter, precision tools and everything for soldering, testing and circuit maintenance.",
    specs: "Contents: Soldering Iron, Hot Glue Gun, Multimeter, Wire Stripper, Tweezers, Screwdrivers, Flux, Desolder Pump + more",
    projects: [],
    components: ["Soldering Iron", "Hot Glue Gun with Glue Sticks", "Solder Wire", "Desoldering Wire (Wick)", "Electrical Insulation Tape", "Precision Screwdrivers", "Tweezers", "Wire Stripper/Cutter", "Digital Multimeter", "Multimeter Test Probes", "Soldering Iron Stand", "Precision Repair Tool Set", "Flux Container", "Desolder Pump"],
  },
  {
    id: 13, name: "Soldering Kit 5-in-1", cat: "Electronics", image:assets.ek3,
    price: 1799, was: 2299, rating: 4.3, reviews: 934, prime: false, tag: "5 in 1",
    desc: "Beginner-friendly 5-in-1 basic soldering toolkit for students and STEM learners. Compact, fast-heating and easy to use.",
    specs: "Contents: Soldering Iron, Wire Stripper/Cutter, Soldering Iron Stand, Flux Paste, Solder Wire",
    projects: [],
    components: ["Soldering Iron", "Wire Stripper/Cutter", "Soldering Iron Stand", "Flux Paste", "Solder Wire"],
  },
  {
    id: 14, name: "Basic Electronics Kit", cat: "Electronics", image:assets.ek4,
    price: 1999, was: null, rating: 4.4, reviews: 1567, prime: true, tag: "Beginner",
    desc: "Complete beginner kit with Arduino, sensors, motors and components — 7 hands-on projects covering circuit fundamentals.",
    specs: "Microcontroller: Arduino UNO | Includes: Sensors, Motors, LEDs, Bluetooth Module and more",
    projects: ["Automatic Night Lamp", "Touch-Controlled Light", "Smart Traffic Signal", "Motion Detection Alarm", "Automated Gate System", "Smart Lighting System", "Mini Robot Models"],
    components: ["Arduino Board", "USB Cable", "Bread Board", "Jumper Wires", "LED", "Resistors", "Rain Drop Sensor", "Servo Motor SG90", "3S Battery Holder", "BO Motor", "L298N Motor Driver Module", "Ultrasonic Sensor", "IR Sensor Module", "Soil Moisture Sensor", "Float Switch", "Relay Module 5V", "Water Pump DC", "HC-05 Bluetooth Module", "Battery Charger", "Li-ion Battery", "2S Battery Holder", "Chassis Kit", "Screw Driver"],
  },
  {
    id: 15, name: "Intermediate Electronics Kit", cat: "Electronics", image:assets.ek5,
    price: 3499, was: 4299, rating: 4.3, reviews: 789, prime: false, tag: "Intermediate",
    desc: "Intermediate electronics kit with 7 projects covering obstacle detection, Bluetooth robots, home automation and more.",
    specs: "Microcontroller: Arduino UNO | Sensors: LDR, IR, Touch | Components: NE555 Timer, Motor Driver, RGB LED and more",
    projects: ["Obstacle Detection System", "Line Following Robot", "Bluetooth-Controlled Robot", "Smart Plant Watering System", "Rain Detection Alarm", "Automatic Temperature Monitoring", "Home Automation Models"],
    components: ["Push Button", "RGB LED", "220 Ohm Resistor", "1K Ohm Resistor", "Bread Board", "Jumper Wires (M-M, F-M, F-F)", "9V Battery", "BO Motor", "Diode", "DPDT Switch", "LED Strip", "Relay Module", "Arduino UNO", "LDR Sensor", "Motor Driver", "Chassis Set", "NE555 Timer IC", "IR Sensor", "Transistor", "Water Pump", "Touch Sensor", "Fan"],
  },
  {
    id: 16, name: "Advanced Electronics Kit", cat: "Electronics", image:assets.ek6,
    price: 4999, was: null, rating: 4.5, reviews: 567, prime: true, tag: "Advanced",
    desc: "Advanced kit with 8 projects including RFID attendance, smart security, GPS tracking and autonomous robotics.",
    specs: "Microcontroller: Arduino UNO | Sensors: PIR, Bluetooth, Servo, Ultrasonic, LCD | Projects: 8 comprehensive builds",
    projects: ["RFID Attendance System", "Smart Security System", "Gas Leakage Detection System", "GPS Tracking System", "IoT Monitoring Dashboard", "Robotic Arm", "Autonomous Robot", "Final Innovation Project"],
    components: ["Arduino Uno", "USB Cable", "Push Button", "Ultrasonic Sensor", "Motor Driver", "Chassis Set (2 Wheel)", "Lithium-Ion Battery", "2S Battery Holder", "Battery Charger", "LCD (16x2)", "Potentiometer", "IR Sensor", "Buzzer", "Servo Motor", "Bluetooth Module", "PIR Sensor"],
  },
  // ANIMATRONICS
  {
    id: 17, name: "Spider Bot", cat: "Animatronics", image:assets.spider,
    price: 10999, was: 13999, rating: 4.6, reviews: 731, prime: false, tag: "",
    desc: "Multi-legged hexapod robot mimicking spider movement with servo-driven walking, turning and obstacle navigation.",
    specs: "Design: Multi-Leg Spider | Drive: Servo Motor | Motion: Forward, Backward & Turning | Power: Rechargeable Battery",
    projects: [],
    components: ["Arduino Nano", "Servo Motors", "Servo Driver", "3D Printed Spider Body", "Battery Pack"],
  },
  {
    id: 18, name: "Ninja Otto Bot", cat: "Animatronics", image:assets.notto,
    price: 5999, was: null, rating: 4.4, reviews: 892, prime: true, tag: "",
    desc: "Compact humanoid robot that walks, dances, turns and performs interactive actions. Ideal for STEM and beginner robotics.",
    specs: "Design: Humanoid | Drive: Servo Motor | Actions: Walking, Turning, Dancing | Power: Rechargeable Battery",
    projects: [],
    components: ["Arduino Nano", "SG90 Servo Motors", "Ultrasonic Sensor", "Buzzer", "3D Printed Body", "Battery Pack"],
  },
  {
    id: 19, name: "Otto Bot", cat: "Animatronics", image:assets.otto,
    price: 4999, was: null, rating: 4.3, reviews: 678, prime: true, tag: "",
    desc: "Beginner-friendly open-source humanoid with walking, turning and dancing functions plus programmable control.",
    specs: "Design: Humanoid | Drive: Servo Motor | Functions: Walk, Turn, Dance | Power: Rechargeable Battery",
    projects: [],
    components: ["Arduino Nano", "SG90 Servo Motors", "Ultrasonic Sensor", "Buzzer", "Battery Pack", "3D Printed Structure"],
  },
  {
    id: 20, name: "DIY Dog Bot", cat: "Animatronics",image:assets.dog,
    price: 8999, was: null, rating: 4.8, reviews: 1567, prime: true, tag: "Top Rated",
    desc: "Four-legged robotic dog with servo-driven legs, interactive walking and modular design for STEM learning.",
    specs: "Design: Four-Legged Robotic Dog | Drive: Servo Motor | Actions: Walking, Turning, Interactive | Power: Rechargeable",
    projects: [],
    components: ["Arduino Nano", "Servo Motors", "Servo Driver", "Battery Pack", "3D Printed Body"],
  },
  {
    id: 21, name: "DIY Cat Bot", cat: "Animatronics", image:assets.cat,
    price: 7499, was: 8999, rating: 4.5, reviews: 445, prime: false, tag: "New",
    desc: "Interactive robotic cat combining mechanical design, electronics and programming to simulate realistic cat-like movements.",
    specs: "Design: Cat-Inspired Robotic | Drive: Servo Motor | Features: DIY Assembly, Programmable | Suitable for STEM",
    projects: [],
    components: ["Arduino Nano", "Servo Motors", "Servo Driver", "Battery Pack", "3D Printed Body"],
  },
  {
    id: 22, name: "DIY Snake Bot", cat: "Animatronics", image:assets.snake ,
    price: 6499, was: null, rating: 4.2, reviews: 287, prime: false, tag: "",
    desc: "Sleek robotic snake with realistic serpentine locomotion across complex terrain. Intro to motion mechanics and robotics.",
    specs: "Design: Flexible Snake Body Segments | Drive: Multiple Servo Motors | Motion: Undulating Segments | DIY Kit",
    projects: [],
    components: ["Arduino Nano", "Multiple Servo Motors", "Flexible Body Segments", "Battery Pack", "Connecting Accessories"],
  },
  {
    id: 23, name: "DIY WALL-E Bot", cat: "Animatronics", image:assets.wall,
    price: 9999, was: 12999, rating: 4.9, reviews: 2103, prime: true, tag: "Fan Fav",
    desc: "Creative WALL-E inspired robot with expressive eyes, sound effects, autonomous movement and full DIY assembly.",
    specs: "Controller: Arduino Uno/Nano | Drive: BO Motors + Wheels/Tracks | Sensors: Ultrasonic | Features: 3D Printed WALL-E Structure",
    projects: [],
    components: ["Arduino Uno / Nano", "Servo Motors", "BO Motors", "Wheels / Tracks", "Ultrasonic Sensor", "3D Printed WALL-E Structure", "Battery Pack"],
  },
  // STEM
  {
    id: 24, name: "STEM Kit — Grade 1 Term 1", cat: "STEM", image:assets.stem1,
    price: 3999, was: null, rating: 4.5, reviews: 512, prime: true, tag: "4 in 1",
    desc: "4 hands-on STEM projects exploring magnetism, motors, electrical circuits and force through creative building.",
    specs: "Grade: 1 | Projects: 4 | Skills: Magnetism, Motors, Circuits, Force & Energy | Age: 6–7 Years",
    projects: ["Magnetic Car", "Motorized Crane", "Cross Wire (Buzz-Wire)", "Shooting Machine"],
    components: ["Components for 4 Projects", "Motors, Magnets, Wires, and Connectors", "Illustrated Assembly Guides"],
  },
  {
    id: 25, name: "STEM Kit — Grade 1 Term 3", cat: "STEM", image:assets.stem2,
    price: 3999, was: null, rating: 4.3, reviews: 378, prime: false, tag: "4 in 1",
    desc: "4 air and water STEM projects — air-powered car, floating boat, water dispenser and wind car for young learners.",
    specs: "Grade: 1 | Projects: 4 | Skills: Aerodynamics, Buoyancy, Water Flow, Wind Power | Age: 6–7 Years",
    projects: ["Aero Dynamic Car", "Water Boat", "Water Dispenser", "Wind Car"],
    components: ["Components for 4 Projects", "Motors, Wheels, Propellers, and Connectors", "Illustrated Assembly Guides"],
  },
  {
    id: 26, name: "STEM Kit — Grade 2 Term 1", cat: "STEM", image:assets.stem3,
    price: 4299, was: null, rating: 4.4, reviews: 423, prime: true, tag: "4 in 1",
    desc: "Explore earthquakes, robotics, traffic systems and cable transport in 4 exciting engineering projects.",
    specs: "Grade: 2 | Projects: 4 | Skills: Vibration Sensing, Robotics, Automation, Transportation | Age: 7–8 Years",
    projects: ["Earthquake Alarm", "Insect Bot", "Traffic Light", "Mini Rope Car"],
    components: ["Components for 4 Projects", "Motors, LEDs, Wires, Buzzer, and Connectors", "Illustrated Assembly Guides"],
  },
  {
    id: 27, name: "STEM Kit — Grade 2 Term 2", cat: "STEM", image:assets.stem4,
    price: 4299, was: 4999, rating: 4.2, reviews: 356, prime: false, tag: "4 in 1",
    desc: "Build a compass, disk brake, belt generator and tanker cannon to explore magnetics, mechanics and power generation.",
    specs: "Grade: 2 | Projects: 4 | Skills: Magnetism, Friction, Energy Transfer, Mechanics | Age: 7–8 Years",
    projects: ["Toy Compass", "Disk Brake System", "Belt Generator", "Tanker Cannon"],
    components: ["Components for 4 Projects", "Motors, Magnets, Pulleys, Wires, and Connectors", "Illustrated Assembly Guides"],
  },
  {
    id: 28, name: "STEM Kit — Grade 3 Term 1", cat: "STEM", image:assets.stem5,
    price: 4599, was: null, rating: 4.5, reviews: 489, prime: true, tag: "4 in 1",
    desc: "Solar system, solar energy, water level indicator and crawling robot — four projects covering astronomy and renewable energy.",
    specs: "Grade: 3 | Projects: 4 | Skills: Astronomy, Solar Energy, Electronics, Robotics | Age: 8–9 Years",
    projects: ["Solar System", "Solar Light & Fan", "Water Level Indicator", "Worm Crawling Robot"],
    components: ["Components for 4 Projects", "Motors, Solar Panels, LEDs, Wires, and Connectors", "Illustrated Assembly Guides"],
  },
  {
    id: 29, name: "STEM Kit — Grade 3 Term 2", cat: "STEM", image:assets.stem6,
    price: 4599, was: 5499, rating: 4.4, reviews: 312, prime: false, tag: "4 in 1",
    desc: "Lucky spin wheel, solar rover, hand crank generator and password box — mechanics, solar energy and engineering.",
    specs: "Grade: 3 | Projects: 4 | Skills: Rotation, Solar Energy, Electricity Generation, Engineering | Age: 8–9 Years",
    projects: ["Lucky Spin Wheel", "Solar Moon Rover", "Hand Crank Power Generator", "Password Box"],
    components: ["Components for 4 Projects", "Motors, Solar Panels, Gears, Wires, and Connectors", "Illustrated Assembly Guides"],
  },
  {
    id: 30, name: "STEM Kit — Solar & Hydraulic", cat: "STEM", image:assets.stem7,
    price: 4799, was: null, rating: 4.6, reviews: 445, prime: true, tag: "4 in 1",
    desc: "Solar rocking chair, solar fan, ball pitching machine and hydraulic arm — clean energy and robotics mechanics.",
    specs: "Projects: 4 | Skills: Renewable Energy, Mechanical Motion, Hydraulics | Components: Motors, Solar Panels, Syringes",
    projects: ["Solar Rocking Chair", "Solar Fan", "Ball Pitching Machine", "Hydraulic Arm"],
    components: ["Components for 4 Projects", "Motors, Solar Panels, Syringes, Connectors, and Mechanical Parts", "Illustrated Assembly Guides"],
  },
  {
    id: 31, name: "STEM Kit — Scribble & Solar", cat: "STEM", image:assets.stem8,
    price: 4499, was: 5299, rating: 4.3, reviews: 398, prime: false, tag: "4 in 1",
    desc: "Build a scribbling bot, solar helicopter, solar car and hydraulic bridge in four creative engineering challenges.",
    specs: "Projects: 4 | Skills: Vibration, Solar Energy, Vehicle Design, Hydraulics | Child-Friendly Materials",
    projects: ["Scribbling Bot", "Solar Helicopter", "Solar Car", "Hydraulic Bridge"],
    components: ["Components for 4 Projects", "Motors, Solar Panels, Hydraulic Syringes, Wires, and Connectors", "Illustrated Assembly Guides"],
  },
  {
    id: 32, name: "STEM Kit — Transport & Machines", cat: "STEM",image:assets.stem9,
    price: 4499, was: null, rating: 4.4, reviews: 367, prime: true, tag: "4 in 1",
    desc: "Pulley crane, sweeper, merry-go-round and passenger train — four mechanical engineering projects with motors and gears.",
    specs: "Projects: 4 | Skills: Pulleys, Mechanical Motion, Rotation, Transportation | Components: Motors, Wheels, Pulleys, Gears",
    projects: ["Pulley Block Crane", "Sweeper", "Merry Go Round", "Passenger Train"],
    components: ["Components for 4 Projects", "Motors, Wheels, Pulleys, Gears, Wires, and Connectors", "Illustrated Assembly Guides"],
  },
];

const CATS = ["All", "Robotics", "Electronics", "Animatronics", "STEM"];

const CAT_META = {
  All:          { color: "#1a1a2e", accent: "#6366f1" },
  Robotics:     { color: "#0d47a1", accent: "#3b82f6" },
  Electronics:  { color: "#bf360c", accent: "#f97316" },
  Animatronics: { color: "#4a148c", accent: "#a855f7" },
  STEM:         { color: "#e65100", accent: "#f59e0b" },
};

const PALETTES = [
  ["#667eea","#764ba2"],["#f093fb","#f5576c"],
  ["#4facfe","#00f2fe"],["#43e97b","#38f9d7"],
  ["#fa709a","#fee140"],["#a18cd1","#fbc2eb"],
  ["#fda085","#f6d365"],["#84fab0","#8fd3f4"],
  ["#d299c2","#fef9d7"],["#89f7fe","#66a6ff"],
  ["#f6d365","#fda085"],["#96fbc4","#f9f586"],
  ["#fccb90","#d57eeb"],["#a1c4fd","#c2e9fb"],
];

const SORTS = [
  { v: "featured",   l: "Featured" },
  { v: "price_asc",  l: "Price ↑" },
  { v: "price_desc", l: "Price ↓" },
  { v: "rating",     l: "Top Rated" },
  { v: "reviews",    l: "Most Reviewed" },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function Stars({ rating, sz = 12 }) {
  return (
    <span style={{ position: "relative", display: "inline-block", fontSize: sz, lineHeight: 1, userSelect: "none" }}>
      <span style={{ color: "#ddd", letterSpacing: "1px" }}>{"★★★★★"}</span>
      <span style={{ position: "absolute", left: 0, top: 0, overflow: "hidden", width: `${(rating / 5) * 100}%`, color: "#f59e0b", letterSpacing: "1px" }}>{"★★★★★"}</span>
    </span>
  );
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ name, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, background: "#111827", color: "#fff",
      padding: "12px 20px 12px 14px", borderRadius: 14,
      boxShadow: "0 12px 48px rgba(0,0,0,0.28)",
      display: "flex", alignItems: "center", gap: 12,
      animation: "toastPop .4s cubic-bezier(.34,1.56,.64,1)",
      fontFamily: "'Outfit',sans-serif", minWidth: 260, maxWidth: "90vw",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✓</div>
      <div>
        <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Added to cart</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb" }}>{name}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT MODAL
───────────────────────────────────────────── */
function ProductModal({ product: p, onClose, onAdd, wish, onWish }) {
  const [done, setDone] = useState(false);
  const [tab, setTab] = useState("overview");
  const [c1, c2] = PALETTES[p.id % PALETTES.length];
  const disc = p.was ? Math.round((1 - p.price / p.was) * 100) : null;
  const w = wish.includes(p.id);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, []);

  function add() {
    onAdd(p); setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "specs", label: "Specs" },
    { id: "components", label: "Components" },
    ...(p.projects.length > 0 ? [{ id: "projects", label: `Projects (${p.projects.length})` }] : []),
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 500, backdropFilter: "blur(8px)", animation: "fadeIn .2s ease" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 501, background: "#fff", borderRadius: 24,
        width: "min(780px, 95vw)", maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        fontFamily: "'Outfit',sans-serif",
        boxShadow: "0 32px 100px rgba(0,0,0,0.3)",
        animation: "modalPop .35s cubic-bezier(.34,1.56,.64,1)",
        overflow: "hidden",
      }}>
        {/* HEADER */}
        {/* <div style={{ position: "relative", height: 220, background: `linear-gradient(145deg,${c1},${c2})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.1)", borderRadius: "0 0 50% 50%/0 0 30% 30%" }} />
          <span style={{ fontSize: 96, filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.25))", zIndex: 1 }}>{p.image}</span> */}
          {/* HEADER */}
<div style={{ position: "relative", height: 260, flexShrink: 0, overflow: "hidden" }}>
  <img
    src={p.image}
    alt={p.name}
    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
  />
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />

          {disc && <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(239,68,68,0.92)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "5px 11px", borderRadius: 8 }}>−{disc}%</div>}
          {p.tag && !disc && <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>{p.tag}</div>}
          {p.prime && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px", background: "linear-gradient(to top,rgba(0,0,0,0.5),transparent)", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", background: "#38bdf8", color: "#0c4a6e", padding: "2px 7px", borderRadius: 4 }}>PRIME</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Free delivery tomorrow</span>
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>✕</button>
          <button onClick={() => onWish(p.id)} style={{ position: "absolute", top: 14, right: 58, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>{w ? "❤️" : "🤍"}</button>
        </div>

        {/* SCROLLABLE BODY */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* title + price */}
          <div style={{ padding: "20px 24px 0" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: CAT_META[p.cat]?.accent || "#374151", marginBottom: 4, display: "block" }}>{p.cat}</span>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.2 }}>{p.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                  <Stars rating={p.rating} sz={13} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{p.rating}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>({p.reviews >= 1000 ? (p.reviews / 1000).toFixed(1) + "k" : p.reviews} reviews)</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1 }}>{formatINR(p.price)}</div>
                {p.was && <div style={{ fontSize: 13, color: "#d1d5db", textDecoration: "line-through" }}>{formatINR(p.was)}</div>}
                {disc && <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>Save {formatINR(p.was - p.price)}</div>}
              </div>
            </div>
          </div>

          {/* tabs */}
          <div style={{ padding: "16px 24px 0", display: "flex", gap: 4, borderBottom: "1px solid #f3f4f6", marginTop: 16, overflowX: "auto" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "8px 14px", border: "none", borderRadius: "8px 8px 0 0",
                background: tab === t.id ? "#111827" : "transparent",
                color: tab === t.id ? "#fff" : "#6b7280",
                fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap",
                fontFamily: "'Outfit',sans-serif",
              }}>{t.label}</button>
            ))}
          </div>

          {/* tab content */}
          <div style={{ padding: "20px 24px 28px" }}>
            {tab === "overview" && (
              <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
            )}
            {tab === "specs" && (
              <div style={{ display: "grid", gap: 10 }}>
                {p.specs.split("|").map((s, i) => {
                  const [label, val] = s.split(":").map(x => x.trim());
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 14px", background: i % 2 === 0 ? "#f9fafb" : "#fff", borderRadius: 10, border: "1px solid #f3f4f6" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", minWidth: 130, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: 1 }}>{label}</span>
                      <span style={{ fontSize: 13, color: "#111827", fontWeight: 500, lineHeight: 1.5 }}>{val || "—"}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {tab === "components" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
                {p.components.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #f3f4f6" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: `linear-gradient(135deg,${c1},${c2})`, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, lineHeight: 1.4 }}>{c}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "projects" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
                {p.projects.map((proj, i) => (
                  <div key={i} style={{ padding: "12px 16px", background: `linear-gradient(135deg,${c1}18,${c2}18)`, border: `1px solid ${c1}30`, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${c1},${c2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 13, color: "#111827", fontWeight: 600, lineHeight: 1.4 }}>{proj}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER CTA */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6", background: "#fff", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={() => onWish(p.id)} style={{ width: 46, height: 46, borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>{w ? "❤️" : "🤍"}</button>
          <button onClick={add} style={{
            flex: 1, padding: "13px", border: "none", borderRadius: 12,
            background: done ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#111827,#1f2937)",
            color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
            transition: "all .25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "'Outfit',sans-serif",
          }}>
            {done ? <><span>✓</span> Added to Cart!</> : <><span style={{ fontSize: 17 }}>+</span> Add to Cart — {formatINR(p.price)}</>}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   CART PANEL
───────────────────────────────────────────── */
function CartPanel({ cart, onClose, onQty, onRemove }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const pal = (id) => PALETTES[id % PALETTES.length];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, backdropFilter: "blur(6px)" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 440, maxWidth: "100vw",
        background: "#fafafa", zIndex: 301, display: "flex", flexDirection: "column",
        fontFamily: "'Outfit',sans-serif", boxShadow: "-20px 0 80px rgba(0,0,0,0.15)",
        animation: "slideIn .3s ease",
      }}>
        <div style={{ padding: "24px 24px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", margin: 0 }}>Your Cart</h2>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{count} item{count !== 1 ? "s" : ""} · {formatINR(total)}</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, paddingBottom: 60 }}>
              <div style={{ fontSize: 56, opacity: 0.2 }}>🛒</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#9ca3af" }}>Nothing here yet</p>
              <p style={{ fontSize: 13, color: "#d1d5db" }}>Add some products to get started</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cart.map(item => {
                const [c1, c2] = pal(item.id);
                const disc = item.was ? Math.round((1 - item.price / item.was) * 100) : null;
                return (
                  <div key={item.id} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", display: "flex", gap: 12, border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    {/* <div style={{ width: 56, height: 56, borderRadius: 10, background: `linear-gradient(135deg,${c1},${c2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{item.emoji}</div> */}
                    <div
  style={{
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: "hidden",
    background: "#fff",
    border: "1px solid #e5e7eb",
    flexShrink: 0
  }}
>
  <img
    src={item.image}
    alt={item.name}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }}
  />
</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 2px", lineHeight: 1.3 }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>{item.cat}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                          <button onClick={() => onQty(item.id, item.qty - 1)} style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 700 }}>−</button>
                          <span style={{ width: 26, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#111827" }}>{item.qty}</span>
                          <button onClick={() => onQty(item.id, item.qty + 1)} style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 700 }}>+</button>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>{formatINR(item.price * item.qty)}</span>
                          {disc && <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>−{disc}%</div>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => onRemove(item.id)} style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", color: "#d1d5db", fontSize: 15, lineHeight: 1, padding: 0, marginTop: 2, transition: "color .15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "#d1d5db"}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: "16px 24px 24px", borderTop: "1px solid #f0f0f0", background: "#fff" }}>
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                <span>Subtotal ({count} items)</span><span>{formatINR(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
                <span>Shipping</span><span style={{ color: "#16a34a", fontWeight: 600 }}>Free</span>
              </div>
              <div style={{ borderTop: "1.5px dashed #e5e7eb", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#111827" }}>
                <span>Total</span><span>{formatINR(total)}</span>
              </div>
            </div>
            <button style={{ width: "100%", padding: "14px", background: "#111827", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.01em", fontFamily: "'Outfit',sans-serif" }}>
              Checkout · {formatINR(total)} →
            </button>
            <button onClick={onClose} style={{ width: "100%", padding: "10px", background: "none", border: "none", color: "#9ca3af", fontSize: 12, cursor: "pointer", marginTop: 4, fontFamily: "'Outfit',sans-serif" }}>← Continue Shopping</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
function Card({ p, onAdd, wish, onWish, onView }) {
  const [hot, setHot] = useState(false);
  const [done, setDone] = useState(false);
  const disc = p.was ? Math.round((1 - p.price / p.was) * 100) : null;
  const [c1, c2] = PALETTES[p.id % PALETTES.length];
  const w = wish.includes(p.id);

  function add(e) {
    e.stopPropagation();
    onAdd(p); setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  return (
    <article
      onClick={() => onView(p)}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      style={{
        background: "#fff", borderRadius: 20, overflow: "hidden",
        border: `1.5px solid ${hot ? "#e5e7eb" : "#f3f4f6"}`,
        boxShadow: hot ? "0 24px 64px rgba(0,0,0,0.11)" : "0 2px 10px rgba(0,0,0,0.04)",
        transform: hot ? "translateY(-5px)" : "none",
        transition: "all .3s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
        fontFamily: "'Outfit',sans-serif",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative", height: 190, background: `linear-gradient(145deg,${c1},${c2})`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.1)", borderRadius: "0 0 60% 60%/0 0 30% 30%" }} />
        {/* <span style={{ fontSize: 74, lineHeight: 1, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.18))", transform: hot ? "scale(1.1) translateY(-4px)" : "scale(1)", transition: "transform .35s cubic-bezier(.34,1.56,.64,1)", display: "block", position: "relative" }}>{p.emoji}</span> */}
        <img
  src={p.image}
  alt={p.name}
  style={{
    width: "85%",
    height: "85%",
    objectFit: "contain",
    transform: hot ? "scale(1.08)" : "scale(1)",
    transition: "transform .35s cubic-bezier(.34,1.56,.64,1)",
    position: "relative",
    zIndex: 1
  }}
/>
        <button onClick={e => { e.stopPropagation(); onWish(p.id); }} style={{ position: "absolute", top: 10, right: 10, width: 34, height: 34, borderRadius: "50%", background: w ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)", border: "none", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", transform: w ? "scale(1.1)" : "scale(1)", transition: "all .2s" }}>{w ? "❤️" : "🤍"}</button>
        {disc && <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(239,68,68,0.9)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 9px", borderRadius: 7 }}>−{disc}%</div>}
        {p.tag && !disc && <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.62)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 7, textTransform: "uppercase", letterSpacing: "0.07em" }}>{p.tag}</div>}
        {p.prime && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px 8px", background: "linear-gradient(to top,rgba(0,0,0,0.52),transparent)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", background: "#38bdf8", color: "#0c4a6e", padding: "1px 6px", borderRadius: 3 }}>PRIME</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Free delivery tomorrow</span>
          </div>
        )}
        {p.projects.length > 0 && (
          <div style={{ position: "absolute", bottom: p.prime ? 36 : 10, right: 10, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, backdropFilter: "blur(4px)" }}>{p.projects.length} projects</div>
        )}
      </div>
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: CAT_META[p.cat]?.accent || "#374151" }}>{p.cat}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Stars rating={p.rating} sz={10} />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>({p.reviews >= 1000 ? (p.reviews / 1000).toFixed(1) + "k" : p.reviews})</span>
          </div>
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1.3, margin: "0 0 6px" }}>{p.name}</h3>
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, flex: 1, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1 }}>{formatINR(p.price)}</span>
          {p.was && <span style={{ fontSize: 12, color: "#d1d5db", textDecoration: "line-through" }}>{formatINR(p.was)}</span>}
          {disc && <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginLeft: "auto" }}>Save {formatINR(p.was - p.price)}</span>}
        </div>
        <button onClick={add} style={{
          width: "100%", padding: "11px 0",
          background: done ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#111827,#1f2937)",
          color: "#fff", border: "none", borderRadius: 11,
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          transition: "all .25s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          fontFamily: "'Outfit',sans-serif",
        }}>
          {done ? <><span>✓</span> Added!</> : <><span style={{ fontSize: 14 }}>+</span> Add to Cart</>}
        </button>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   RANGE SLIDER
───────────────────────────────────────────── */
function Slider({ min, max, value, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position: "relative", padding: "4px 0" }}>
      <div style={{ height: 4, borderRadius: 4, background: "#f3f4f6", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: "#111827", borderRadius: 4 }} />
      </div>
      <input type="range" min={min} max={max} step={500} value={value} onChange={e => onChange(+e.target.value)}
        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", margin: 0, padding: 0 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function CyberMart() {
  const [cat,    setCat]    = useState("All");
  const [sort,   setSort]   = useState("featured");
  const [minR,   setMinR]   = useState(0);
  const [maxP,   setMaxP]   = useState(30000);
  const [prime,  setPrime]  = useState(false);
  const [q,      setQ]      = useState("");
  const [cart,   setCart]   = useState([]);
  const [wish,   setWish]   = useState([]);
  const [panel,  setPanel]  = useState(false);
  const [toast,  setToast]  = useState(null);
  const [modal,  setModal]  = useState(null);
  const [view,   setView]   = useState("grid");
  const [sidebar, setSidebar] = useState(false);

  const cartN = cart.reduce((s, i) => s + i.qty, 0);
  const cartT = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const items = useMemo(() => {
    let r = PRODUCTS.filter(p => {
      if (cat !== "All" && p.cat !== cat) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.desc.toLowerCase().includes(q.toLowerCase())) return false;
      if (p.price > maxP) return false;
      if (p.rating < minR) return false;
      if (prime && !p.prime) return false;
      return true;
    });
    if (sort === "price_asc")  r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "rating")     r = [...r].sort((a, b) => b.rating - a.rating);
    if (sort === "reviews")    r = [...r].sort((a, b) => b.reviews - a.reviews);
    return r;
  }, [cat, sort, minR, maxP, prime, q]);

  function addCart(p) {
    setCart(prev => { const e = prev.find(i => i.id === p.id); return e ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]; });
    setToast(p.name);
  }
  function setQty(id, qty) { if (qty < 1) return remCart(id); setCart(p => p.map(i => i.id === id ? { ...i, qty } : i)); }
  function remCart(id) { setCart(p => p.filter(i => i.id !== id)); }
  function togWish(id) { setWish(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }
  function reset() { setCat("All"); setSort("featured"); setMinR(0); setMaxP(30000); setPrime(false); setQ(""); setSidebar(false); }

  const FilterContent = () => (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #f3f4f6", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>Filters</span>
        <button onClick={reset} style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Reset</button>
      </div>
      {/* Search in sidebar on mobile */}
      <div style={{ padding: "14px 14px 0" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…"
            style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10, border: "1.5px solid #f3f4f6", fontSize: 13, color: "#111827", outline: "none", background: "#f9fafb", fontFamily: "'Outfit',sans-serif", boxSizing: "border-box", transition: "border-color .15s" }}
            onFocus={e => e.target.style.borderColor = "#111827"}
            onBlur={e => e.target.style.borderColor = "#f3f4f6"}
          />
        </div>
      </div>
      {/* categories */}
      <div style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb" }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10, padding: "0 4px" }}>Category</p>
        {CATS.map(c => {
          const n = c === "All" ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c).length;
          const active = cat === c;
          return (
            <button key={c} onClick={() => { setCat(c); setSidebar(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 10px", borderRadius: 10, border: "none",
              background: active ? "#111827" : "transparent",
              color: active ? "#fff" : "#374151", cursor: "pointer", marginBottom: 2,
              fontFamily: "'Outfit',sans-serif", transition: "all .15s",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{c}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 8, background: active ? "rgba(255,255,255,0.15)" : "#f3f4f6", color: active ? "#fff" : "#6b7280" }}>{n}</span>
            </button>
          );
        })}
      </div>
      {/* price */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f9fafb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase" }}>Max Price</p>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{formatINR(maxP)}</span>
        </div>
        <Slider min={1000} max={30000} value={maxP} onChange={setMaxP} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "#d1d5db" }}>₹1,000</span>
          <span style={{ fontSize: 11, color: "#d1d5db" }}>₹30,000</span>
        </div>
      </div>
      {/* rating */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f9fafb" }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Min Rating</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[{ v: 4.5, l: "4.5" }, { v: 4.0, l: "4.0" }, { v: 3.5, l: "3.5" }, { v: 0, l: "Any" }].map(({ v, l }) => (
            <button key={v} onClick={() => setMinR(v)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 9, border: `1.5px solid ${minR === v ? "#111827" : "transparent"}`, background: minR === v ? "#f9fafb" : "transparent", cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .15s" }}>
              {v > 0 ? <><Stars rating={v} sz={10} /><span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{l} & up</span></> : <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Any rating</span>}
              {minR === v && <span style={{ marginLeft: "auto", fontSize: 14, color: "#111827" }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      {/* prime */}
      <div style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
              <span style={{ background: "#38bdf8", color: "#0c4a6e", fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.1em", marginRight: 6 }}>PRIME</span>
              Eligible
            </p>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Free delivery items only</p>
          </div>
          <div onClick={() => setPrime(p => !p)} style={{ width: 42, height: 24, borderRadius: 12, background: prime ? "#111827" : "#e5e7eb", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 2, left: prime ? 19 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#f5f5f7", minHeight: "100vh", color: "#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes toastPop{from{opacity:0;transform:translateX(-50%) scale(.88) translateY(10px)}to{opacity:1;transform:translateX(-50%) scale(1) translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes modalPop{from{opacity:0;transform:translate(-50%,-48%) scale(.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#f9fafb}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
        input[type=range]{-webkit-appearance:none;appearance:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#111827;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.25)}
        @media(max-width:640px){
          .grid-layout{grid-template-columns:repeat(2,1fr) !important;}
        }
        @media(max-width:400px){
          .grid-layout{grid-template-columns:1fr !important;}
        }
      `}</style>

      {/* ── NAV ── */}
      <div style={{ background: "#111827", padding: "0 16px", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {/* logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>cyber<span style={{ color: "#f59e0b" }}>mart</span></span>
          </div>
          {/* search — hidden on mobile */}
          <div style={{ flex: 1, maxWidth: 420, position: "relative", display: "none" }} className="search-desktop">
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…"
              style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.1)", fontSize: 13, color: "#fff", outline: "none", background: "rgba(255,255,255,0.08)", fontFamily: "'Outfit',sans-serif", transition: "border-color .15s" }}
              onFocus={e => e.target.style.borderColor = "#f59e0b"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>
          {/* actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* mobile filter btn */}
            <button onClick={() => setSidebar(v => !v)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
              <span>⚙</span><span style={{ display: "none" }}>Filters</span>
            </button>
            {wish.length > 0 && (
              <button style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                ❤️
                <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{wish.length}</span>
              </button>
            )}
            <button onClick={() => setPanel(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", background: "#f59e0b", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .15s", position: "relative" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fbbf24"}
              onMouseLeave={e => e.currentTarget.style.background = "#f59e0b"}>
              <span style={{ fontSize: 16 }}>🛒</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{formatINR(cartT)}</span>
              {cartN > 0 && <span style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartN}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", padding: "0 16px" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", display: "flex", gap: 0, overflowX: "auto" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "13px 16px", border: "none", background: "none",
              borderBottom: `3px solid ${cat === c ? "#111827" : "transparent"}`,
              fontSize: 13, fontWeight: cat === c ? 800 : 500,
              color: cat === c ? "#111827" : "#6b7280",
              cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s",
              fontFamily: "'Outfit',sans-serif",
            }}>
              {c}
              {cat === c && <span style={{ fontSize: 10, marginLeft: 5, background: "#111827", color: "#fff", borderRadius: 7, padding: "1px 6px" }}>{items.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── MOBILE SEARCH BAR ── */}
      <div style={{ background: "#fff", padding: "10px 16px 0", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", paddingBottom: 10 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…"
              style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 12, border: "1.5px solid #f3f4f6", fontSize: 13, color: "#111827", outline: "none", background: "#f9fafb", fontFamily: "'Outfit',sans-serif", transition: "border-color .15s" }}
              onFocus={e => e.target.style.borderColor = "#111827"}
              onBlur={e => e.target.style.borderColor = "#f3f4f6"}
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebar && (
        <>
          <div onClick={() => setSidebar(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 250, backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 300, background: "#f5f5f7", zIndex: 251, overflowY: "auto", padding: "16px", animation: "slideLeft .3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>Filters</span>
              <button onClick={() => setSidebar(false)} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</button>
            </div>
            <FilterContent />
          </div>
        </>
      )}

      {/* ── PAGE BODY ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 16px", display: "flex", gap: 22 }}>

        {/* ── SIDEBAR (desktop) ── */}
        <aside style={{ width: 240, flexShrink: 0, display: "none" }} className="sidebar-desktop">
          <div style={{ position: "sticky", top: 80 }}>
            <FilterContent />
            <div style={{ marginTop: 14, borderRadius: 16, background: "linear-gradient(135deg,#111827,#1f2937)", padding: "18px 16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b", letterSpacing: "-0.02em", marginBottom: 5 }}>Flash Deals</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 14 }}>Limited-time offers on top kits.</p>
              <button onClick={() => { setSort("price_asc"); setMaxP(8000); }} style={{ width: "100%", padding: "9px", background: "#f59e0b", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#111827", fontFamily: "'Outfit',sans-serif" }}>View Deals →</button>
            </div>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {cat === "All" ? "All Products" : cat}
              </h1>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
                {items.length} result{items.length !== 1 ? "s" : ""}
                {q && <> · <span style={{ color: "#6366f1", fontWeight: 600 }}>"{q}"</span></>}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", background: "#fff", border: "1px solid #f3f4f6", borderRadius: 9, overflow: "hidden" }}>
                {["grid", "list"].map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ padding: "7px 11px", border: "none", background: view === v ? "#111827" : "transparent", color: view === v ? "#fff" : "#9ca3af", cursor: "pointer", fontSize: 14, transition: "all .15s" }}>
                    {v === "grid" ? "⊞" : "☰"}
                  </button>
                ))}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "8px 12px", background: "#fff", border: "1px solid #f3f4f6", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#111827", cursor: "pointer", outline: "none", fontFamily: "'Outfit',sans-serif" }}>
                {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>

          {/* empty */}
          {items.length === 0 && (
            <div style={{ background: "#fff", borderRadius: 20, padding: "60px 24px", textAlign: "center", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.3 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 8 }}>No products found</h3>
              <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 20 }}>Try adjusting your filters or search.</p>
              <button onClick={reset} style={{ padding: "10px 24px", background: "#111827", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Clear all filters</button>
            </div>
          )}

          {/* grid */}
          {view === "grid" && items.length > 0 && (
            <div className="grid-layout" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
              {items.map((p, i) => (
                <div key={p.id} style={{ animation: `fadeUp .38s ease ${(i % 12) * 35}ms both` }}>
                  <Card p={p} onAdd={addCart} wish={wish} onWish={togWish} onView={setModal} />
                </div>
              ))}
            </div>
          )}

          {/* list */}
          {view === "list" && items.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((p, i) => {
                const [c1, c2] = PALETTES[p.id % PALETTES.length];
                const disc = p.was ? Math.round((1 - p.price / p.was) * 100) : null;
                const w = wish.includes(p.id);
                return (
                  <div key={p.id} onClick={() => setModal(p)} style={{ animation: `fadeUp .3s ease ${i * 28}ms both`, background: "#fff", borderRadius: 14, border: "1px solid #f3f4f6", padding: "14px 16px", display: "flex", gap: 14, alignItems: "center", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateX(2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                    {/* <div style={{ width: 64, height: 64, borderRadius: 12, background: `linear-gradient(135deg,${c1},${c2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{p.emoji}</div> */}
                    <div
  style={{
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "#fff",
    flexShrink: 0
  }}
>
  <img
    src={p.image}
    alt={p.name}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }}
  />
</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: CAT_META[p.cat]?.accent || "#374151" }}>{p.cat}</span>
                        {p.prime && <span style={{ fontSize: 9, fontWeight: 900, background: "#38bdf8", color: "#0c4a6e", padding: "1px 6px", borderRadius: 3 }}>PRIME</span>}
                        {p.projects.length > 0 && <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280" }}>{p.projects.length} projects</span>}
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", marginBottom: 3 }}>{p.name}</h3>
                      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
                        <Stars rating={p.rating} sz={10} />
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>({p.reviews >= 1000 ? (p.reviews / 1000).toFixed(1) + "k" : p.reviews})</span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1 }}>{formatINR(p.price)}</div>
                        {p.was && <div style={{ fontSize: 11, color: "#d1d5db", textDecoration: "line-through" }}>{formatINR(p.was)}</div>}
                        {disc && <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>−{disc}%</div>}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={e => { e.stopPropagation(); togWish(p.id); }} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #f3f4f6", background: "#fff", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>{w ? "❤️" : "🤍"}</button>
                        <button onClick={e => { e.stopPropagation(); addCart(p); }} style={{ padding: "7px 14px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}>Add to Cart</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* modals & toasts */}
      {modal && <ProductModal product={modal} onClose={() => setModal(null)} onAdd={addCart} wish={wish} onWish={togWish} />}
      {panel && <CartPanel cart={cart} onClose={() => setPanel(false)} onQty={setQty} onRemove={remCart} />}
      {toast && <Toast name={toast} onDone={() => setToast(null)} />}
    </div>
  );
}