import React, { useState } from "react";
import "./Footer.css";
import assets from "../../assets/assets";
import {
  FaFacebookF, FaInstagram, FaLinkedinIn,
  FaYoutube, FaTwitter
} from "react-icons/fa";

const links = [
  { label: "About",    href: "#about"    },
  { label: "Courses",  href: "#courses"  },
  { label: "Products", href: "#products" },
  { label: "Events",   href: "#events"   },
  { label: "Contact",  href: "#contact"  },
];

const socials = [
  { icon: <FaFacebookF />,  href: "#", label: "Facebook"  },
  { icon: <FaInstagram />,  href: "#", label: "Instagram" },
  { icon: <FaLinkedinIn />, href: "#", label: "LinkedIn"  },
  { icon: <FaYoutube />,    href: "#", label: "YouTube"   },
  { icon: <FaTwitter />,    href: "#", label: "Twitter"   },
];

const contacts = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    text: "info@cyberbots.in",
    href: "mailto:info@cyberbots.in",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    text: "+91 73580 39311",
    href: "tel:+917358039311",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    text: "No.62, Ravi Colony 1st Street,\nSt Thomas Mount, Chennai – 600016",
    href: "#",
    multi: true,
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);

  const handleSub = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmail("");
  };

  return (
    <footer className="ft">

      <div className="ft-noise"   aria-hidden />
      <div className="ft-glow-a"  aria-hidden />
      <div className="ft-glow-b"  aria-hidden />
      <div className="ft-ghost"   aria-hidden>CB</div>
      <div className="ft-top-line" />

      <div className="ft-inner">

        {/* ════ BRAND ════ */}
        <div className="ft-brand">
          <a href="#home" className="ft-logo-link">
            <img src={assets.Logo_2} alt="Cyberbots" className="ft-logo" />
          </a>
          <p className="ft-brand-desc">
            The original and most trusted EDU-Tech provider for kids and teens.
            Build, learn, and launch with Cyberbots.
          </p>
          <div className="ft-socials">
            {socials.map(s => (
              <a key={s.label} href={s.href} aria-label={s.label} className="ft-social">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ════ QUICK LINKS ════ */}
        <div className="ft-col">
          <h4 className="ft-col-title">
            <span className="ft-col-pip" />
            Quick Links
          </h4>
          <ul className="ft-links">
            {links.map(l => (
              <li key={l.label}>
                <a href={l.href} className="ft-link">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M5 2l3 3-3 3"
                      stroke="currentColor" strokeWidth="1.4"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ════ CONTACT ════ */}
        <div className="ft-col">
          <h4 className="ft-col-title">
            <span className="ft-col-pip" />
            Contact
          </h4>
          <ul className="ft-contact-list">
            {contacts.map((c, i) => (
              <li key={i}>
                <a href={c.href} className="ft-contact-row">
                  <span className="ft-contact-icon">{c.icon}</span>
                  <span className="ft-contact-text">
                    {c.multi
                      ? c.text.split("\n").map((ln, j) => (
                          <React.Fragment key={j}>
                            {ln}{j === 0 && <br />}
                          </React.Fragment>
                        ))
                      : c.text}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ════ NEWSLETTER ════ */}
        <div className="ft-col">
          <h4 className="ft-col-title">
            <span className="ft-col-pip" />
            Newsletter
          </h4>
          <p className="ft-nl-desc">
            Stay updated with new courses, kits, and events.
          </p>
          <form className="ft-nl-form" onSubmit={handleSub}>
            <div className="ft-nl-input-wrap">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="ft-nl-input"
                required
              />
            </div>
            <button type="submit" className={`ft-nl-btn${sent ? " sent" : ""}`}>
              {sent ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6"
                      stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Done
                </>
              ) : (
                <>
                  Subscribe
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M6 2l4 4-4 4"
                      stroke="currentColor" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>
          <div className="ft-mini-stats">
            <div className="ft-mini-stat">
              <span className="ft-mini-n">5K+</span>
              <span className="ft-mini-l">Subscribers</span>
            </div>
            <div className="ft-mini-stat-div" />
            <div className="ft-mini-stat">
              <span className="ft-mini-n">Weekly</span>
              <span className="ft-mini-l">Updates</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── bottom bar ── */}
      <div className="ft-bottom">
        <div className="ft-bottom-line" />
        <div className="ft-bottom-inner">
          <span className="ft-copy">
            © {new Date().getFullYear()} Cyberbots. All Rights Reserved.
          </span>
          <div className="ft-bottom-links">
            <a href="#">Privacy Policy</a>
            <span className="ft-bottom-dot" />
            <a href="#">Terms of Use</a>
            <span className="ft-bottom-dot" />
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>

    </footer>
  );
}