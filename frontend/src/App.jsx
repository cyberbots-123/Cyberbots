import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Course from "./pages/Course/Course";
import Contact from "./pages/Contact/Contact";
import Events from "./pages/Events/Events";
import UnderConstruction from "./components/Underconstruction/Underconstruction";
import CyberbotsAboutBlue from "./components/Cyberbotsaboutus/Cyberbotsaboutus";
import CyberMart from "./components/Cybermart/Cybermart";
import CyberBotsShowcase from "./components/Cyberbotsshowcase/Cyberbotsshowcase";
import Login from "./components/Login/Login";
import Signup from "./components/Login/Signup";

import PortalLogin from "./pages/PortalLogin";
import Portal from "./pages/Portal";
import ProtectedRoute from "./components/ProtectedRoute";

import ZoneRegister from "./pages/ZoneRegister";

import useVisitTracker from "./hooks/useVisitTracker";

import VisitStats from './components/VisitStats/VisitStats';
import Cyberfest from "./pages/Events/Cyberfest";

export default function App() {
  // Fires the one-time-per-tab visit tracking call and keeps the
  // Socket.IO connection alive for live todayCount / activeUsers updates.
  useVisitTracker();

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes: no Navbar / Footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Portal routes: no Navbar / Footer, login-gated */}
            <Route path="/portal/login" element={<PortalLogin />} />
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <Portal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/stats"
              element={
                <ProtectedRoute>
                  <VisitStats />
                </ProtectedRoute>
              }
            />

            {/* Zone registration pages: full themed pages, no Navbar / Footer.
                One dynamic route serves every zone — ZoneRegister.jsx strips
                the "zone-" prefix and looks the rest up in
                zoneRegistrationConfigs.js. NOTE: this must be a plain
                ":zoneSlug" segment, not "zone-:zoneId" — React Router v6
                only treats a segment as dynamic when the ":" comes right
                after a "/", so mixing literal text with a param in the same
                segment silently never matches (this was the bug behind the
                blank page — see ZoneRegister.jsx for the prefix-stripping). */}
            <Route path="/register/:zoneSlug" element={<ZoneRegister />} />

            {/* Main app routes: with Navbar / Footer */}
            <Route
              path="/*"
              element={
                <div className="app-bg">
                  <Navbar />

                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/courses" element={<Course />} />
                    <Route path="/shop" element={<CyberMart />} />

                    {/* Events: /events is the listing page (Events.jsx) with a
                        card for every event. Each card links to its own page
                        below. */}
                    <Route path="/events" element={<UnderConstruction />} />
                    {/* Cyberflix keeps the existing page that used to live at
                        /events. */}
                    <Route path="/events/cyberflix" element={<CyberBotsShowcase />} />
                    {/* Placeholders until these two event pages are built.
                        Swap UnderConstruction for the real component later. */}
                    <Route path="/events/cyberfest" element={<Cyberfest />} />
                    <Route path="/events/sv-cybertron" element={<UnderConstruction />} />

                    <Route path="/about" element={<CyberbotsAboutBlue />} />
                    <Route path="/careers" element={<UnderConstruction />} />
                    <Route path="/blog" element={<UnderConstruction />} />
                    <Route path="/contact" element={<Contact />} />
                    {/* FIX: /our-partners previously rendered <AEDSDashboard />
                        with no school prop and no auth gate — a public page
                        showing the "No school data found" error screen. The
                        dashboard is only ever meant to render inside /portal
                        (which supplies the logged-in client's school via
                        /api/schools/me). Parked on UnderConstruction until a
                        real partners page exists; if you actually want a
                        public partner showcase, build a separate component —
                        don't reuse the auth-scoped dashboard. */}
                    <Route path="/our-partners" element={<UnderConstruction />} />
                  </Routes>

                  <Footer />
                </div>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}