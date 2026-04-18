import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import assets from "../../assets/assets";
import "./Navbar.css";
import { Search, ShoppingCart, Bell, User } from "lucide-react";
// import ThemeToggle from "./../ThemeToggle/ThemeToggle";

/* ─── PortalDropdown ─────────────────────────────────────── */
const PortalDropdown = ({ triggerRef, open, children, minWidth = 220 }) => {
  const [pos, setPos] = useState({});

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({
      position: "fixed",
      top:      r.bottom + 10,
      right:    window.innerWidth - r.right,
      minWidth: Math.max(minWidth, r.width),
      zIndex:   9999,
    });
  }, [open, triggerRef, minWidth]);

  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="pd-menu" style={pos}>{children}</div>,
    document.body
  );
};

/* ─── Navbar ─────────────────────────────────────────────── */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden,   setHidden]   = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [active,   setActive]   = useState("home");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const lastY   = useRef(0);
  const whyRef  = useRef(null);
  const bellRef = useRef(null);
  const userRef = useRef(null);

  const CART  = 3;
  const NOTIF = 2;
  const LINKS = ["Home","Courses","Shop","Events"];

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      setHidden(y > lastY.current && y > 100);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => setDropdown(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!isMobile) { setMenuOpen(false); document.body.classList.remove("menu-open"); }
  }, [isMobile]);

  const toggle = useCallback((name, e) => {
    e.stopPropagation();
    setDropdown(p => p === name ? null : name);
  }, []);

  const open  = () => { setMenuOpen(true);  document.body.classList.add("menu-open"); };
  const close = useCallback(() => {
    setMenuOpen(false); setDropdown(null);
    document.body.classList.remove("menu-open");
  }, []);

  return (
    <>
      {/* ── Bar ── */}
      <nav className={`cb-navbar${scrolled?" scrolled":""}${hidden?" hidden":""}`}>
        <div className="cb-glow-line" />

        {/* ── Inner row — all spacing defined here in JSX ── */}
        <div style={{
          width:"92%", maxWidth:1320, margin:"0 auto",
          height:80, display:"flex", alignItems:"center",
          justifyContent:"space-between"
        }}>

          {/* Logo */}
          <a href="#home" className="cb-logo-link" onClick={() => setActive("home")}>
            <img src={assets.Logo_2} alt="Cyberbots" className="cb-logo" />
          </a>

          {/* Desktop nav */}
          {!isMobile && (
            <div style={{ display:"flex", alignItems:"center", gap:0 }}>

              {/* Page links */}
              <nav style={{ display:"flex", alignItems:"center", gap:4 }}>
                {LINKS.map(lk => (
                  <a
                    key={lk}
                    href={`#${lk.toLowerCase()}`}
                    className={`cb-link${active===lk.toLowerCase()?" active":""}`}
                    onClick={() => setActive(lk.toLowerCase())}
                  >
                    {lk}
                    <span className="cb-link-dot"/>
                  </a>
                ))}

                {/* Why Cyberbots */}
                <div style={{ position:"relative" }} onClick={e=>e.stopPropagation()}>
                  <span
                    ref={whyRef}
                    className={`cb-link cb-trigger${dropdown==="why"?" open":""}`}
                    onClick={e=>toggle("why",e)}
                  >
                    Why Cyberbots
                    <svg width="10" height="7" viewBox="0 0 12 8" fill="none" className="cb-chevron">
                      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <PortalDropdown triggerRef={whyRef} open={dropdown==="why"}>
                    <p className="pd-label">Company</p>
                    <button onClick={close}>About Us</button>
                    <button onClick={close}>Careers</button>
                    <button onClick={close}>Contact</button>
                    <button onClick={close}>Blog</button>
                  </PortalDropdown>
                </div>
              </nav>

              {/* Divider */}
              <div style={{
                width:1, height:26,
                background:"rgba(255,255,255,0.12)",
                margin:"0 28px", flexShrink:0
              }}/>

              {/* Icon buttons */}
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>

                <button className="cb-icon">
                  <Search size={18}/>
                </button>

                <button className="cb-icon cb-badge-btn" data-n={CART}>
                  <ShoppingCart size={18}/>
                </button>

                <div style={{ position:"relative" }} onClick={e=>e.stopPropagation()}>
                  <button
                    ref={bellRef}
                    className="cb-icon cb-badge-btn"
                    data-n={NOTIF}
                    onClick={e=>toggle("notify",e)}
                  >
                    <Bell size={18}/>
                  </button>
                  <PortalDropdown triggerRef={bellRef} open={dropdown==="notify"} minWidth={240}>
                    <p className="pd-label">Notifications</p>
                    <button onClick={close}><span className="pd-dot blue"/>New Course Available</button>
                    <button onClick={close}><span className="pd-dot green"/>Your order shipped</button>
                    <button onClick={close}><span className="pd-dot amber"/>Offer ends tonight</button>
                  </PortalDropdown>
                </div>

                {/* Theme toggle */}
                {/* <ThemeToggle /> */}

                <div style={{ position:"relative" }} onClick={e=>e.stopPropagation()}>
                  <button
                    ref={userRef}
                    className="cb-avatar"
                    onClick={e=>toggle("profile",e)}
                  >
                    <User size={16}/>
                  </button>
                  <PortalDropdown triggerRef={userRef} open={dropdown==="profile"} minWidth={200}>
                    <div className="pd-profile-head">
                      <div className="pd-av"><User size={15}/></div>
                      <div>
                        <div className="pd-name">My Account</div>
                        <div className="pd-sub">Cyberbots Member</div>
                      </div>
                    </div>
                    <div className="pd-sep"/>
                    <button onClick={close}>Dashboard</button>
                    <button onClick={close}>My Courses</button>
                    <button onClick={close}>Orders</button>
                    <button onClick={close}>Settings</button>
                    <div className="pd-sep"/>
                    <button className="logout" onClick={close}>Logout</button>
                  </PortalDropdown>
                </div>

              </div>
            </div>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <button className="cb-hamburger" onClick={open} aria-label="Menu">
              <span/><span/><span/>
            </button>
          )}

        </div>
      </nav>

      {/* ── Mobile sidebar portal ── */}
      {isMobile && ReactDOM.createPortal(
        <>
          <div className={`cb-overlay${menuOpen?" show":""}`} onClick={close}/>
          <aside className="cb-sidebar" style={{ transform: menuOpen?"translateX(0)":"translateX(100%)" }}>

            <div className="cb-sb-head">
              <img src={assets.Logo_2} alt="Cyberbots" style={{ height:44 }}/>
              <button className="cb-sb-close" onClick={close}>
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="2" y1="2" x2="16" y2="16"/>
                  <line x1="16" y1="2" x2="2" y2="16"/>
                </svg>
              </button>
            </div>

            <div className="cb-sb-body">
              {LINKS.map(lk => (
                <a
                  key={lk}
                  href={`#${lk.toLowerCase()}`}
                  className={`cb-sb-link${active===lk.toLowerCase()?" active":""}`}
                  onClick={() => { setActive(lk.toLowerCase()); close(); }}
                >
                  {lk}
                </a>
              ))}

              <button
                className={`cb-sb-link cb-sb-trig${dropdown==="why"?" open":""}`}
                onClick={e=>toggle("why",e)}
              >
                Why Cyberbots
                <svg width="10" height="7" viewBox="0 0 12 8" fill="none" className="cb-chevron">
                  <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
              {dropdown==="why" && (
                <div className="cb-sb-sub">
                  {["About Us","Careers","Contact","Blog"].map(i=>(
                    <button key={i} onClick={close}>{i}</button>
                  ))}
                </div>
              )}

              <div className="cb-sb-divider"/>

              {[
                { icon:<Search size={17}/>,       label:"Search",        key:null  },
                { icon:<ShoppingCart size={17}/>,  label:"Cart",          key:null,  badge:CART   },
              ].map(r => (
                <button key={r.label} className="cb-sb-row">
                  <span className="cb-sb-icon">{r.icon}</span>
                  <span>{r.label}</span>
                  {r.badge && <span className="cb-sb-badge">{r.badge}</span>}
                </button>
              ))}

              <button
                className={`cb-sb-row cb-sb-trig${dropdown==="notify"?" open":""}`}
                onClick={e=>toggle("notify",e)}
              >
                <span className="cb-sb-icon"><Bell size={17}/></span>
                <span>Notifications</span>
                <span className="cb-sb-badge">{NOTIF}</span>
              </button>
              {dropdown==="notify" && (
                <div className="cb-sb-sub">
                  {["New Course Available","Your order shipped","Offer ends tonight"].map(i=>(
                    <button key={i} onClick={close}>{i}</button>
                  ))}
                </div>
              )}

              <button
                className={`cb-sb-row cb-sb-trig${dropdown==="profile"?" open":""}`}
                onClick={e=>toggle("profile",e)}
              >
                <span className="cb-sb-icon"><User size={17}/></span>
                <span>Profile</span>
                <svg width="10" height="7" viewBox="0 0 12 8" fill="none" className="cb-chevron" style={{marginLeft:"auto"}}>
                  <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
              {dropdown==="profile" && (
                <div className="cb-sb-sub">
                  {["Dashboard","My Courses","Orders","Settings"].map(i=>(
                    <button key={i} onClick={close}>{i}</button>
                  ))}
                  <button className="logout" onClick={close}>Logout</button>
                </div>
              )}
            </div>

            <div className="cb-sb-foot">© 2025 Cyberbots</div>
          </aside>
        </>,
        document.body
      )}
    </>
  );
}