import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
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

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-bg">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Course />} />

            {/* Under Construction Pages */}
            <Route path="/shop" element={<CyberMart />} />
            <Route path="/events" element={<CyberBotsShowcase />} />
            <Route path="/about" element={<CyberbotsAboutBlue />} />
            <Route path="/careers" element={<UnderConstruction />} />
            <Route path="/blog" element={<UnderConstruction />} />

            {/* Keep contact normal if needed */}
            <Route path="/contact" element={<Contact />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}