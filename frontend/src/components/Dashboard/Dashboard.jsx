import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  Bell,
  Package,
  Settings,
  LogOut,
  User,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  Star,
  Check,
  X,
  Menu,
  Zap,
  Target,
  BarChart2,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import "./Dashboard.css";

/* ─── Static mock data ───────────────────────────────────── */
const USER = {
  name: "Alex Johnson",
  email: "alex@cyberbots.in",
  plan: "Pro Member",
  avatar: "AJ",
  joined: "Jan 2024",
  streak: 14,
};

const STATS = [
  { label: "Courses enrolled", value: "8",   icon: BookOpen,   color: "blue"  },
  { label: "Hours learned",    value: "124",  icon: Clock,      color: "teal"  },
  { label: "Certificates",     value: "3",    icon: Award,      color: "amber" },
  { label: "Current streak",   value: "14d",  icon: Zap,        color: "purple"},
];

const COURSES = [
  { title: "Robotics Fundamentals",   progress: 82, category: "Robotics",   active: true  },
  { title: "Python for Automation",   progress: 55, category: "Programming",active: true  },
  { title: "IoT & Embedded Systems",  progress: 30, category: "IoT",        active: true  },
  { title: "AI & Machine Learning",   progress: 10, category: "AI/ML",      active: false },
];

const ORDERS = [
  { id: "#CB-4821", item: "Robotics Kit Pro",      date: "12 Jun 2025", status: "delivered", amount: "₹4,299" },
  { id: "#CB-4790", item: "Sensor Pack x12",       date: "3 Jun 2025",  status: "shipped",   amount: "₹1,499" },
  { id: "#CB-4755", item: "Arduino Mega Bundle",   date: "22 May 2025", status: "delivered", amount: "₹2,899" },
  { id: "#CB-4710", item: "Pro Course Access",     date: "10 May 2025", status: "delivered", amount: "₹999"   },
];

const CART_ITEMS = [
  { name: "ESP32 Dev Board",       qty: 2, price: "₹899"  },
  { name: "Ultrasonic Sensor Kit", qty: 1, price: "₹349"  },
  { name: "Servo Motor Pack",      qty: 1, price: "₹649"  },
];

const NOTIFS = [
  { dot: "blue",  text: "New course dropped: Advanced Drone Programming", time: "2h ago",  unread: true  },
  { dot: "green", text: "Your order #CB-4790 has shipped",                time: "5h ago",  unread: true  },
  { dot: "amber", text: "Flash sale ending tonight — 40% off all kits",   time: "1d ago",  unread: true  },
  { dot: "teal",  text: "You earned the 'Fast Learner' badge!",           time: "2d ago",  unread: false },
  { dot: "gray",  text: "Robotics Fundamentals: new module unlocked",     time: "3d ago",  unread: false },
];

const NAV_ITEMS = [
  { id: "overview",       label: "Overview",      icon: LayoutDashboard },
  { id: "courses",        label: "My Courses",    icon: BookOpen        },
  { id: "orders",         label: "Orders",        icon: Package         },
  { id: "cart",           label: "Cart",          icon: ShoppingCart, badge: 3 },
  { id: "notifications",  label: "Notifications", icon: Bell,         badge: 3 },
  { id: "achievements",   label: "Achievements",  icon: Award           },
  { id: "settings",       label: "Settings",      icon: Settings        },
];

/* ─── Sub-components ──────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className={`db-stat-card db-stat-card--${color}`}>
      <div className="db-stat-icon">
        <Icon size={18} />
      </div>
      <div className="db-stat-val">{value}</div>
      <div className="db-stat-label">{label}</div>
    </div>
  );
}

function ProgressBar({ pct, color = "blue" }) {
  return (
    <div className="db-prog-track">
      <div
        className={`db-prog-fill db-prog-fill--${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`db-pill db-pill--${status}`}>
      {status === "delivered" && <Check size={10} />}
      {status === "shipped"   && <TrendingUp size={10} />}
      {status === "pending"   && <Clock size={10} />}
      {status}
    </span>
  );
}

/* ─── Section views ───────────────────────────────────────── */

function OverviewView() {
  return (
    <div className="db-view">
      {/* Welcome hero */}
      <div className="db-hero">
        <div className="db-hero-orb db-hero-orb--1" />
        <div className="db-hero-orb db-hero-orb--2" />
        <div className="db-hero-content">
          <div className="db-hero-eyebrow">
            <Zap size={13} /> Day {USER.streak} streak
          </div>
          <h1 className="db-hero-title">Welcome back, {USER.name.split(" ")[0]}.</h1>
          <p className="db-hero-sub">You have 3 active courses and 2 unread notifications.</p>
        </div>
        <div className="db-hero-badge">
          <Target size={22} />
          <span>14d</span>
          <small>streak</small>
        </div>
      </div>

      {/* Stats row */}
      <div className="db-stats-grid">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Active courses */}
      <div className="db-section-head">
        <h2 className="db-section-title">Active courses</h2>
        <button className="db-text-btn">View all <ChevronRight size={14} /></button>
      </div>
      <div className="db-courses-list">
        {COURSES.filter(c => c.active).map(c => (
          <div className="db-course-row" key={c.title}>
            <div className="db-course-icon">
              <BookOpen size={15} />
            </div>
            <div className="db-course-info">
              <div className="db-course-name">{c.title}</div>
              <div className="db-course-meta">{c.category} · {c.progress}% complete</div>
              <ProgressBar pct={c.progress} color="blue" />
            </div>
            <button className="db-resume-btn">Resume <ChevronRight size={13} /></button>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="db-section-head">
        <h2 className="db-section-title">Recent orders</h2>
        <button className="db-text-btn">View all <ChevronRight size={14} /></button>
      </div>
      <div className="db-table-wrap">
        <table className="db-table">
          <thead>
            <tr>
              <th>Order</th><th>Item</th><th>Date</th><th>Status</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.slice(0, 3).map(o => (
              <tr key={o.id}>
                <td className="db-order-id">{o.id}</td>
                <td>{o.item}</td>
                <td className="db-muted">{o.date}</td>
                <td><StatusPill status={o.status} /></td>
                <td className="db-amount">{o.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoursesView() {
  return (
    <div className="db-view">
      <div className="db-section-head">
        <h2 className="db-section-title">My courses</h2>
        <button className="db-cta-btn"><BookOpen size={14} /> Browse more</button>
      </div>
      <div className="db-courses-grid">
        {COURSES.map(c => (
          <div className={`db-course-card${!c.active ? " db-course-card--dim" : ""}`} key={c.title}>
            <div className="db-course-card-top">
              <span className="db-course-chip">{c.category}</span>
              {!c.active && <span className="db-course-chip db-course-chip--gray">Not started</span>}
            </div>
            <h3 className="db-course-card-title">{c.title}</h3>
            <div className="db-course-card-prog">
              <div className="db-prog-label">
                <span>{c.progress}% complete</span>
                <span className="db-muted">{Math.round((c.progress / 100) * 12)}/12 lessons</span>
              </div>
              <ProgressBar pct={c.progress} color={c.active ? "blue" : "gray"} />
            </div>
            <button className={`db-card-btn${!c.active ? " db-card-btn--ghost" : ""}`}>
              {c.progress === 0 ? "Start course" : "Continue"} <ChevronRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersView() {
  return (
    <div className="db-view">
      <div className="db-section-head">
        <h2 className="db-section-title">Orders</h2>
        <span className="db-count-badge">{ORDERS.length}</span>
      </div>
      <div className="db-table-wrap">
        <table className="db-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Item</th><th>Date</th><th>Status</th><th>Amount</th><th></th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map(o => (
              <tr key={o.id}>
                <td className="db-order-id">{o.id}</td>
                <td>{o.item}</td>
                <td className="db-muted">{o.date}</td>
                <td><StatusPill status={o.status} /></td>
                <td className="db-amount">{o.amount}</td>
                <td>
                  <button className="db-icon-btn" aria-label="View order details">
                    <ChevronRight size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CartView() {
  const [items, setItems] = useState(CART_ITEMS);
  const remove = name => setItems(p => p.filter(i => i.name !== name));
  const total  = "₹" + [899*2, 349, 649].reduce((a, b) => a + b, 0).toLocaleString("en-IN");

  return (
    <div className="db-view">
      <div className="db-section-head">
        <h2 className="db-section-title">Cart</h2>
        <span className="db-count-badge">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="db-empty">
          <ShoppingCart size={40} />
          <p>Your cart is empty.</p>
          <button className="db-cta-btn">Browse the shop</button>
        </div>
      ) : (
        <>
          <div className="db-cart-list">
            {items.map(item => (
              <div className="db-cart-row" key={item.name}>
                <div className="db-cart-icon"><Package size={16} /></div>
                <div className="db-cart-info">
                  <div className="db-cart-name">{item.name}</div>
                  <div className="db-muted">Qty: {item.qty}</div>
                </div>
                <div className="db-cart-price">{item.price}</div>
                <button
                  className="db-remove-btn"
                  onClick={() => remove(item.name)}
                  aria-label={`Remove ${item.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="db-cart-footer">
            <div className="db-cart-total">
              <span className="db-muted">Total</span>
              <span className="db-total-val">{total}</span>
            </div>
            <button className="db-cta-btn db-cta-btn--full">
              <CreditCard size={15} /> Proceed to checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationsView() {
  const [notifs, setNotifs] = useState(NOTIFS);
  const markAll = () => setNotifs(p => p.map(n => ({ ...n, unread: false })));

  return (
    <div className="db-view">
      <div className="db-section-head">
        <h2 className="db-section-title">Notifications</h2>
        <button className="db-text-btn" onClick={markAll}>Mark all read</button>
      </div>
      <div className="db-notif-list">
        {notifs.map((n, i) => (
          <div
            className={`db-notif-row${n.unread ? " db-notif-row--unread" : ""}`}
            key={i}
          >
            <span className={`db-notif-dot db-notif-dot--${n.dot}`} />
            <div className="db-notif-body">
              <p className="db-notif-text">{n.text}</p>
              <span className="db-notif-time">{n.time}</span>
            </div>
            {n.unread && <span className="db-unread-pip" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function AchievementsView() {
  const badges = [
    { name: "Fast Learner",    desc: "Completed 3 lessons in one day",    icon: Zap,       earned: true  },
    { name: "Streak Master",   desc: "14-day learning streak",            icon: Target,    earned: true  },
    { name: "First Build",     desc: "Completed your first robotics kit", icon: Award,     earned: true  },
    { name: "Top Scorer",      desc: "Score 90%+ on a quiz",              icon: Star,      earned: false },
    { name: "Course Champion", desc: "Complete 5 courses",                icon: BarChart2, earned: false },
    { name: "Community Star",  desc: "Help 10 learners in forums",        icon: User,      earned: false },
  ];

  return (
    <div className="db-view">
      <div className="db-section-head">
        <h2 className="db-section-title">Achievements</h2>
        <span className="db-count-badge">{badges.filter(b => b.earned).length}/{badges.length}</span>
      </div>
      <div className="db-badges-grid">
        {badges.map(b => {
          const Icon = b.icon;
          return (
            <div className={`db-badge-card${b.earned ? " db-badge-card--earned" : ""}`} key={b.name}>
              <div className="db-badge-icon">
                <Icon size={22} />
              </div>
              <div className="db-badge-name">{b.name}</div>
              <div className="db-badge-desc">{b.desc}</div>
              {b.earned && <div className="db-badge-earned-tag"><Check size={10} /> Earned</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsView() {
  const [name,    setName]    = useState(USER.name);
  const [email,   setEmail]   = useState(USER.email);
  const [notifOn, setNotifOn] = useState(true);
  const [darkOn,  setDarkOn]  = useState(true);
  const [saved,   setSaved]   = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="db-view">
      <h2 className="db-section-title" style={{ marginBottom: "24px" }}>Settings</h2>

      {/* Profile settings */}
      <div className="db-settings-card">
        <div className="db-settings-head">
          <User size={15} /> Profile
        </div>
        <div className="db-settings-body">
          <div className="db-field-row">
            <label className="db-field-label">Display name</label>
            <input
              className="db-field-input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="db-field-row">
            <label className="db-field-label">Email address</label>
            <input
              className="db-field-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="db-field-row">
            <label className="db-field-label">Member since</label>
            <span className="db-field-static">{USER.joined}</span>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="db-settings-card">
        <div className="db-settings-head">
          <Settings size={15} /> Preferences
        </div>
        <div className="db-settings-body">
          <div className="db-toggle-row">
            <div>
              <div className="db-toggle-label">Push notifications</div>
              <div className="db-toggle-sub">Course updates, order alerts</div>
            </div>
            <button
              className={`db-toggle${notifOn ? " on" : ""}`}
              onClick={() => setNotifOn(p => !p)}
              aria-label="Toggle notifications"
            >
              <span className="db-toggle-thumb" />
            </button>
          </div>
          <div className="db-toggle-row">
            <div>
              <div className="db-toggle-label">Dark mode</div>
              <div className="db-toggle-sub">Use dark theme across the app</div>
            </div>
            <button
              className={`db-toggle${darkOn ? " on" : ""}`}
              onClick={() => setDarkOn(p => !p)}
              aria-label="Toggle dark mode"
            >
              <span className="db-toggle-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="db-settings-card db-settings-card--plan">
        <div className="db-plan-row">
          <div>
            <div className="db-plan-label">Current plan</div>
            <div className="db-plan-name">Pro Member</div>
          </div>
          <button className="db-cta-btn">Manage plan</button>
        </div>
      </div>

      <div className="db-settings-actions">
        <button className="db-cta-btn" onClick={save}>
          {saved ? <><Check size={14} /> Saved!</> : "Save changes"}
        </button>
        <button className="db-ghost-btn db-ghost-btn--danger">
          Delete account
        </button>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────── */
export default function Dashboard() {
  const [active,      setActive]      = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const VIEWS = {
    overview:      <OverviewView />,
    courses:       <CoursesView />,
    orders:        <OrdersView />,
    cart:          <CartView />,
    notifications: <NotificationsView />,
    achievements:  <AchievementsView />,
    settings:      <SettingsView />,
  };

  const navigate = id => {
    setActive(id);
    setSidebarOpen(false);
  };

  return (
    <div className="db-root">
      {/* ── Sidebar ── */}
      <>
        {/* Mobile overlay */}
        <div
          className={`db-sb-overlay${sidebarOpen ? " show" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={`db-sidebar${sidebarOpen ? " db-sidebar--open" : ""}`}>
          {/* Sidebar top: user info */}
          <div className="db-sb-profile">
            <div className="db-sb-avatar">{USER.avatar}</div>
            <div className="db-sb-user-info">
              <div className="db-sb-name">{USER.name}</div>
              <div className="db-sb-plan">{USER.plan}</div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="db-sb-nav">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`db-sb-item${active === item.id ? " active" : ""}`}
                  onClick={() => navigate(item.id)}
                >
                  <Icon size={17} className="db-sb-item-icon" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="db-sb-badge">{item.badge}</span>
                  )}
                  {active === item.id && <span className="db-sb-active-bar" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="db-sb-footer">
            <button className="db-sb-item db-sb-item--help">
              <HelpCircle size={17} />
              <span>Help center</span>
            </button>
            <button className="db-sb-item db-sb-item--logout">
              <LogOut size={17} />
              <span>Log out</span>
            </button>
          </div>
        </aside>
      </>

      {/* ── Main content ── */}
      <div className="db-main">
        {/* Mobile top bar */}
        <header className="db-topbar">
          <button
            className="db-topbar-menu"
            onClick={() => setSidebarOpen(p => !p)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <span className="db-topbar-title">
            {NAV_ITEMS.find(n => n.id === active)?.label ?? "Dashboard"}
          </span>
          <div className="db-topbar-avatar">{USER.avatar}</div>
        </header>

        {/* Page content */}
        <div className="db-content">
          {VIEWS[active]}
        </div>
      </div>
    </div>
  );
}