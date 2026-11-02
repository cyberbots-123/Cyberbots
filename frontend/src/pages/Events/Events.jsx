import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import assets from "../../assets/assets";
import { PAST_EVENTS, PAST_PHOTOS } from "./pastEventPhotos";
import "./Events.css";

/* ------------------------------------------------------------------ */
/*  CONTENT YOU CAN EDIT                                               */
/*  Dates use YYYY-MM-DD. Images live in public/images/events/.        */
/*  To add another event, add one more object to EVENTS.               */
/*  Past event photos are edited in pastEventPhotos.js.                */
/* ------------------------------------------------------------------ */
const EVENTS = [
  {
    id: "cyberfest",
    name: "Cyberfest",
    tagline: "The Most Responsible Robotics Event",
    description:
      "Description",
    image: assets.Cyberfest,
    venue: "Maharishi Vidya Mandir Senior Secondary School,",
    address: "No. 28, Dr Gurusamy Rd, inside Maharishi Gardens, Chetpet, Chennai, Tamil Nadu 600031",
    registrationOpens: "2026-10-22",
    registrationCloses: "2026-11-25",
    eventDate: "2026-12-05",
    link: "/events/cyberfest",
    cta: "View event",
  },
  {
    id: "sv-cybertron",
    name: "SV - Cybertron",
    tagline: "Rise Of Robots",
    description:
      "Description",
    image: assets.Cybertron,
    venue: "Sudharsanam Vidyaashram",
    address: "Poonamallee - Avadi High Rd, Thiruverkadu, Avadi, Senneerkuppam, Tamil Nadu 600077",
    registrationOpens: "2026-12-07",
    registrationCloses: "2027-01-20",
    eventDate: "2027-01-30",
    link: "/events/sv-cybertron",
    cta: "View event",
  },
];

// Placeholder numbers: replace with your real figures.
const STATS = [
  { value: String(EVENTS.length), label: "Events this season" },
  { value: "50+", label: "Partner schools" },
  { value: "5,000+", label: "Students reached" },
];

// Placeholder contact details: replace with your real ones.
const CONTACT = {
  phone: "+91 73581 74761",
  email: "events@cyberbots.in",
};

const AUDIENCE = [
  {
    icon: "trophy",
    title: "For students",
    text: "Hands-on challenges where you build, test and compete with robots alongside students from other schools.",
  },
  {
    icon: "shield",
    title: "For parents",
    text: "Venue, dates and schedule are shared clearly in advance, so you always know where your child will be and when.",
  },
  {
    icon: "book",
    title: "For teachers",
    text: "Register your school team in a few minutes and get a confirmation from our events team.",
  },
];

const STEPS = [
  { title: "Choose an event", text: "Check the dates and registration window below." },
  { title: "Fill in the form", text: "Add your school, team and contact details." },
  { title: "Get your confirmation", text: "Our events team confirms your spot." },
];

const FILTERS = [
  { id: "all", label: "All events" },
  { id: "open", label: "Registration open" },
  { id: "soon", label: "Coming soon" },
];

// How many gallery photos show before "Show more photos" is pressed.
const PHOTOS_PER_PAGE = 8;

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */
const DAY = 86400000;
const HOUR = 3600000;
const MINUTE = 60000;

const toDate = (iso) => new Date(`${iso}T00:00:00`);

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysUntil = (iso) => Math.ceil((toDate(iso) - startOfToday()) / DAY);

const formatDate = (iso) =>
  toDate(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

const pad = (n) => String(n).padStart(2, "0");

const getStatus = (event) => {
  if (daysUntil(event.registrationOpens) > 0) {
    return {
      tone: "soon",
      label: "Coming soon",
      note: `Registration opens in ${plural(daysUntil(event.registrationOpens), "day")}`,
    };
  }
  const left = daysUntil(event.registrationCloses);
  if (left >= 0) {
    return {
      tone: "open",
      label: "Registration open",
      note:
        left === 0
          ? "Registration closes today"
          : left === 1
          ? "Registration closes tomorrow"
          : `Registration closes in ${left} days`,
    };
  }
  return { tone: "closed", label: "Registration closed", note: "Registration closed" };
};

/* ------------------------------------------------------------------ */
/*  HOOKS AND SMALL COMPONENTS                                         */
/* ------------------------------------------------------------------ */

// Becomes true once the element scrolls into view.
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// Fades and slides its content in once on scroll.
function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`rv ${inView ? "is-in" : ""} ${className}`.trim()}
      style={{ "--rv-delay": `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Current time, refreshed on an interval.
function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

// Live days / hours / minutes / seconds until the event starts.
function Countdown({ iso }) {
  const now = useNow(1000);
  const diff = Math.max(0, toDate(iso).getTime() - now);
  const days = Math.floor(diff / DAY);
  const units = [
    { label: "Days", value: String(days) },
    { label: "Hours", value: pad(Math.floor((diff % DAY) / HOUR)) },
    { label: "Minutes", value: pad(Math.floor((diff % HOUR) / MINUTE)) },
    { label: "Seconds", value: pad(Math.floor((diff % MINUTE) / 1000)) },
  ];

  return (
    <div className="ev-countdown" role="group" aria-label={`${plural(days, "day")} to go`}>
      {units.map((u) => (
        <div className="ev-countdown__unit" key={u.label} aria-hidden="true">
          <strong>{u.value}</strong>
          <span>{u.label}</span>
        </div>
      ))}
    </div>
  );
}

// Counts up to a number like "5,000+" when it scrolls into view.
function CountUp({ value }) {
  const [ref, inView] = useInView(0.5);
  const match = String(value).match(/^([\d,]+)(.*)$/);
  const target = match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
  const suffix = match ? match[2] : "";
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || target === null) return undefined;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(target);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  if (target === null) return <strong ref={ref}>{value}</strong>;
  return (
    <strong ref={ref}>
      {n.toLocaleString("en-IN")}
      {suffix}
    </strong>
  );
}

/* ------------------------------------------------------------------ */
/*  ICONS (inline SVG, no extra packages needed)                       */
/* ------------------------------------------------------------------ */
const ICON_PATHS = {
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H19v14H6a2 2 0 0 0-2 2z" />
      <path d="M19 18v3H6" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10.5" r="1.6" />
      <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  left: <path d="M15 5l-7 7 7 7" />,
  right: <path d="M9 5l7 7-7 7" />,
};

function Icon({ name, size = 18, className = "" }) {
  return (
    <svg
      className={`ev-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO: NEXT EVENT PANEL                                             */
/* ------------------------------------------------------------------ */
function NextEventPanel({ event }) {
  if (!event) {
    return (
      <aside className="ev-panel" aria-label="Next event">
        <p className="ev-panel__label">Next event</p>
        <h2 className="ev-panel__name">New dates coming soon</h2>
        <p className="ev-panel__meta">Check back shortly for the next season's events.</p>
      </aside>
    );
  }

  const status = getStatus(event);

  return (
    <aside className="ev-panel" aria-label="Next event">
      <div className="ev-panel__top">
        <p className="ev-panel__label">Next event</p>
        <span className={`ev-status ev-status--${status.tone}`}>{status.label}</span>
      </div>

      <h2 className="ev-panel__name">{event.name}</h2>
      <p className="ev-panel__tagline">{event.tagline}</p>

      <Countdown iso={event.eventDate} />

      <ul className="ev-panel__meta">
        <li>
          <Icon name="calendar" size={16} />
          <span>{formatDate(event.eventDate)}</span>
        </li>
        <li>
          <Icon name="pin" size={16} />
          <span>
            {event.venue}
            {event.address && <small className="ev-address">{event.address}</small>}
          </span>
        </li>
      </ul>

      <p className={`ev-panel__note ev-panel__note--${status.tone}`}>{status.note}</p>

      <Link to={event.link} className="ev-btn ev-btn--primary ev-panel__cta">
        {event.cta}
        <Icon name="arrow" />
      </Link>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  EVENT CARD (one row of the timeline)                               */
/* ------------------------------------------------------------------ */
function EventCard({ event, index }) {
  const [imageFailed, setImageFailed] = useState(false);
  const status = getStatus(event);
  const eventDay = toDate(event.eventDate);
  const month = eventDay.toLocaleDateString("en-IN", { month: "short" });
  const day = eventDay.getDate();

  const details = [
    { icon: "pin", label: "Venue", value: event.venue, extra: event.address },
    { icon: "calendar", label: "Registration opens", value: formatDate(event.registrationOpens) },
    { icon: "calendar", label: "Registration closes", value: formatDate(event.registrationCloses) },
    { icon: "clock", label: "Event date", value: formatDate(event.eventDate) },
  ];

  return (
    <Reveal as="li" className="ev-tl__item" delay={index * 90}>
      <div className="ev-tl__date" aria-hidden="true">
        <span>{month}</span>
        <strong>{day}</strong>
      </div>
      <span className="ev-tl__dot" aria-hidden="true" />

      <Link
        to={event.link}
        className="ev-card"
        aria-label={`${event.name}, ${formatDate(event.eventDate)}. ${event.cta}`}
      >
        <div className="ev-card__media">
          {imageFailed || !event.image ? (
            <div className="ev-card__fallback" aria-hidden="true">
              {event.name.charAt(0)}
            </div>
          ) : (
            <img
              src={event.image}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div className="ev-card__body">
          <div className="ev-card__head">
            <h3 className="ev-card__title">{event.name}</h3>
            <span className={`ev-status ev-status--${status.tone}`}>{status.label}</span>
          </div>
          <p className="ev-card__tagline">{event.tagline}</p>
          {/* <p className="ev-card__description">{event.description}</p> */}

          <dl className="ev-card__details">
            {details.map((item) => (
              <div className="ev-card__row" key={item.label}>
                <dt>
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </dt>
                <dd>
                  {item.value}
                  {item.extra && <small className="ev-address">{item.extra}</small>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="ev-card__foot">
            <p className={`ev-card__note ev-card__note--${status.tone}`}>{status.note}</p>
            <span className="ev-btn ev-btn--primary ev-card__cta">
              {event.cta}
              <Icon name="arrow" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  GALLERY: PHOTO TILE                                                */
/* ------------------------------------------------------------------ */
function GalleryTile({ photo, eventLabel, onOpen }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <li className="ev-gallery__item">
      <button
        type="button"
        className="ev-tile"
        onClick={onOpen}
        aria-label={`Open photo: ${photo.caption}`}
      >
        {imageFailed ? (
          <span className="ev-tile__fallback" aria-hidden="true">
            <Icon name="image" size={30} />
          </span>
        ) : (
          <img
            src={photo.src}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        <span className="ev-tile__caption">
          <strong>{eventLabel}</strong>
          <span>{photo.caption}</span>
        </span>
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  GALLERY: FULL-SCREEN VIEWER                                        */
/* ------------------------------------------------------------------ */
function LightboxImage({ photo }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <div className="ev-lightbox__fallback">
        <Icon name="image" size={36} />
        <span>This photo couldn't be loaded.</span>
      </div>
    );
  }

  return (
    <img
      className="ev-lightbox__img"
      src={photo.src}
      alt={photo.caption}
      onError={() => setImageFailed(true)}
    />
  );
}

function Lightbox({ photos, index, eventLabels, onClose, onPrev, onNext }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const photo = photos[index];

  // Keyboard: Esc closes, arrows move, Tab stays inside the viewer.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "Tab" && dialogRef.current) {
        const buttons = dialogRef.current.querySelectorAll("button");
        if (buttons.length === 0) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, onPrev, onNext]);

  // Lock page scroll while open, and give focus back to the photo that was clicked.
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus && previousFocus.focus) previousFocus.focus();
    };
  }, []);

  if (!photo) return null;

  return (
    <div
      className="ev-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      ref={dialogRef}
      onClick={onClose}
    >
      <button
        type="button"
        ref={closeRef}
        className="ev-lightbox__btn ev-lightbox__close"
        aria-label="Close photo viewer"
        onClick={onClose}
      >
        <Icon name="close" size={20} />
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          className="ev-lightbox__btn ev-lightbox__prev"
          aria-label="Previous photo"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <Icon name="left" size={22} />
        </button>
      )}

      <figure
        key={photo.src}
        className="ev-lightbox__figure"
        onClick={(e) => e.stopPropagation()}
      >
        <LightboxImage photo={photo} />
        <figcaption className="ev-lightbox__caption">
          <strong>{eventLabels[photo.eventId] || ""}</strong>
          <span>{photo.caption}</span>
          <em>
            {index + 1} of {photos.length}
          </em>
        </figcaption>
      </figure>

      {photos.length > 1 && (
        <button
          type="button"
          className="ev-lightbox__btn ev-lightbox__next"
          aria-label="Next photo"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <Icon name="right" size={22} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function Events() {
  const [filter, setFilter] = useState("all");

  // Gallery state
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PHOTOS_PER_PAGE);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const nextEvent = useMemo(
    () =>
      [...EVENTS]
        .filter((e) => daysUntil(e.eventDate) >= 0)
        .sort((a, b) => toDate(a.eventDate) - toDate(b.eventDate))[0],
    []
  );

  const visibleEvents = useMemo(
    () =>
      EVENTS.filter((e) => (filter === "all" ? true : getStatus(e).tone === filter)),
    [filter]
  );

  const eventLabels = useMemo(
    () => Object.fromEntries(PAST_EVENTS.map((e) => [e.id, e.label])),
    []
  );

  const galleryFilters = useMemo(
    () => [{ id: "all", label: "All photos" }, ...PAST_EVENTS],
    []
  );

  const filteredPhotos = useMemo(
    () =>
      PAST_PHOTOS.filter((p) => galleryFilter === "all" || p.eventId === galleryFilter),
    [galleryFilter]
  );

  const shownPhotos = filteredPhotos.slice(0, visibleCount);
  const remainingPhotos = filteredPhotos.length - shownPhotos.length;

  const chooseGalleryFilter = (id) => {
    setGalleryFilter(id);
    setVisibleCount(PHOTOS_PER_PAGE);
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? i : (i - 1 + filteredPhotos.length) % filteredPhotos.length
      ),
    [filteredPhotos.length]
  );

  const showNext = useCallback(
    () =>
      setLightboxIndex((i) => (i === null ? i : (i + 1) % filteredPhotos.length)),
    [filteredPhotos.length]
  );

  return (
    <main className="ev-page">
      {/* ---------- Hero ---------- */}
      <section className="ev-hero">
        <div className="ev-container ev-hero__grid">
          <div className="ev-hero__copy">
            <p className="ev-hero__kicker">Events for schools across Chennai</p>
            <h1>Robotics events students remember.</h1>
            <p className="ev-hero__lead">
              Competitions, carnivals and challenges for schools across Chennai.
              Pick an event, register your school and we take care of the rest.
            </p>
            <div className="ev-hero__actions">
              <a href="#all-events" className="ev-btn ev-btn--primary">
                Explore events
                <Icon name="arrow" />
              </a>
              <a href="#how-to-register" className="ev-btn ev-btn--ghost">
                How to register
              </a>
            </div>

            <ul className="ev-stats">
              {STATS.map((stat) => (
                <li key={stat.label} className="ev-stat">
                  <CountUp value={stat.value} />
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <NextEventPanel event={nextEvent} />
        </div>
      </section>

      {/* ---------- All events ---------- */}
      <section id="all-events" className="ev-container ev-section">
        <div className="ev-section__head">
          <h2>All events</h2>
          <div className="ev-filters" role="group" aria-label="Filter events">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="ev-chip"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {visibleEvents.length > 0 ? (
          <ul className="ev-timeline" key={filter}>
            {visibleEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </ul>
        ) : (
          <Reveal className="ev-empty">
            <h3>No events in this group yet</h3>
            <p>New events are added regularly. Show all events to see what's coming.</p>
            <button type="button" className="ev-btn ev-btn--primary" onClick={() => setFilter("all")}>
              Show all events
            </button>
          </Reveal>
        )}
      </section>

      {/* ---------- Past event photos ---------- */}
      {PAST_PHOTOS.length > 0 && (
        <section id="gallery" className="ev-container ev-section">
          <div className="ev-section__head">
            <h2>Moments from our past events</h2>
            {PAST_EVENTS.length > 1 && (
              <div className="ev-filters" role="group" aria-label="Filter photos by event">
                {galleryFilters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="ev-chip"
                    aria-pressed={galleryFilter === item.id}
                    onClick={() => chooseGalleryFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ul className="ev-gallery">
            {shownPhotos.map((photo, i) => (
              <GalleryTile
                key={photo.src}
                photo={photo}
                eventLabel={eventLabels[photo.eventId] || ""}
                onOpen={() => setLightboxIndex(i)}
              />
            ))}
          </ul>

          {remainingPhotos > 0 && (
            <div className="ev-gallery__more">
              <button
                type="button"
                className="ev-btn ev-btn--outline"
                onClick={() => setVisibleCount((n) => n + PHOTOS_PER_PAGE)}
              >
                Show more photos ({remainingPhotos})
              </button>
            </div>
          )}
        </section>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          photos={filteredPhotos}
          index={lightboxIndex}
          eventLabels={eventLabels}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}

      {/* ---------- Made for everyone ---------- */}
      <section className="ev-container ev-section">
        <div className="ev-section__head">
          <h2>Made for students, parents and teachers</h2>
        </div>
        <ul className="ev-audience">
          {AUDIENCE.map((item) => (
            <li key={item.title} className="ev-audience__item">
              <span className="ev-audience__icon">
                <Icon name={item.icon} size={24} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- How to register ---------- */}
      <section id="how-to-register" className="ev-container ev-section">
        <div className="ev-section__head">
          <h2>How to register</h2>
        </div>
        <ol className="ev-steps">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} className="ev-step" delay={i * 90}>
              <span className="ev-step__num">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------- Contact ---------- */}
      <section className="ev-container ev-contact-wrap">
        <div className="ev-contact">
          <div>
            <h2>Questions? Talk to our team</h2>
            <p>We're happy to help schools, parents and teachers with registration and event details.</p>
          </div>
          <div className="ev-contact__actions">
            <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="ev-btn ev-btn--ghost">
              <Icon name="phone" />
              {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="ev-btn ev-btn--primary">
              <Icon name="mail" />
              {CONTACT.email}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}