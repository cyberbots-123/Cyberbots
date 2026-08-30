import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Course from "./pages/Course/Course";
import Contact from "./pages/Contact/Contact";
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

export default function App() {
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
                    <Route path="/events" element={<CyberBotsShowcase />} />
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