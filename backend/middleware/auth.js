const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ────────────────────────────────────────────────────────────────────────────
//  protect  (with temporary [BE:protect] debug logs)
//
//  Verifies the JWT on protected routes and attaches the payload to
//  req.user. Also loads the account and confirms it still exists and is
//  active. Role and schoolId are taken from the DB, not the token.
// ────────────────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[BE:protect] NO TOKEN on", req.method, req.originalUrl);
    return res.status(401).json({ success: false, message: "Not authorized — no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id, role, schoolId, iat, exp }

    // [DEBUG] What the TOKEN claims…
    console.log("[BE:protect]", req.method, req.originalUrl, "| token payload =", { id: decoded.id, role: decoded.role });

    const user = await User.findById(decoded.id).select("role schoolId isActive");

    // [DEBUG] …versus what the DATABASE says right now.
    console.log("[BE:protect] DB says =", user ? { role: user.role, isActive: user.isActive } : "NOT FOUND");

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Account not found or inactive" });
    }

    req.user = {
      id: decoded.id,
      role: user.role,
      schoolId: user.schoolId || null,
    };
    next();
  } catch (error) {
    // jwt.verify throws on invalid/expired tokens; a DB failure lands here
    // too, and 401 is the safe default for an auth check we couldn't complete.
    console.log("[BE:protect] verify FAILED:", error.name, "-", error.message);
    return res.status(401).json({ success: false, message: "Not authorized — invalid or expired token" });
  }
};

// ── Restricts a route to admin accounts only. Use AFTER `protect`. ─────────
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    // [DEBUG] This is the ONLY place "Admin access required" comes from.
    // It prints exactly which request tripped it and what role it carried.
    console.log("[BE:requireAdmin] BLOCKED —", req.method, req.originalUrl, "| req.user =", req.user);
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

module.exports = { protect, requireAdmin };