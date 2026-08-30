const jwt = require("jsonwebtoken");
const User = require("../models/User");
const School = require("../models/School");

// ── Helper: sign a JWT for a given user ─────────────────────────────────────
const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      schoolId: user.schoolId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/login
//  Single email + password field. Role (admin vs client) is looked up from
//  the user's record — the frontend never chooses which dashboard to show.
// ────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // [DEBUG] ──────────────────────────────────────────────────────────────
    console.log("[BE:login] attempt email =", email && email.toLowerCase());

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    // [DEBUG] What did the DB actually find for this email?
    console.log(
      "[BE:login] found user =",
      user
        ? { id: user._id.toString(), role: user.role, schoolId: user.schoolId ? user.schoolId.toString() : null, isActive: user.isActive }
        : null
    );

    if (!user || !user.isActive) {
      console.log("[BE:login] REJECTED — no user or inactive");
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("[BE:login] REJECTED — wrong password");
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user);

    // [DEBUG] This is the role the token will carry for the next 7 days.
    console.log("[BE:login] SUCCESS — issuing token for role =", user.role, "schoolId =", user.schoolId ? user.schoolId.toString() : null);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId || null,
        },
      },
    });
  } catch (error) {
    console.error("❌  login error:", error);
    return res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/me
// ────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Account not found or inactive" });
    }

    // [DEBUG]
    console.log("[BE:getMe] returning role =", user.role, "for", user.email);

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId || null,
      },
    });
  } catch (error) {
    console.error("❌  getMe error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/create-login   (admin only)
//  Creates or resets the client login tied to a school. Used by AdminPanel's
//  "Login Credentials" tab. One client account per school — if one already
//  exists for this schoolId, this resets its email/password instead of
//  creating a duplicate.
// ────────────────────────────────────────────────────────────────────────────
const createOrUpdateClientLogin = async (req, res) => {
  try {
    const { schoolId, email, password } = req.body;

    if (!schoolId || !email || !password) {
      return res.status(400).json({ success: false, message: "schoolId, email, and password are all required" });
    }
    if (password.length < 6) {
      return res.status(422).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    let user = await User.findOne({ schoolId, role: "client" });
    if (user) {
      user.email = email.toLowerCase();
      user.password = password; // re-hashed by the pre-save hook
      user.isActive = true;
      await user.save();
    } else {
      user = await User.create({ email, password, role: "client", schoolId });
    }

    // [DEBUG] Confirm the role that actually got written.
    console.log("[BE:create-login] saved login:", { email: user.email, role: user.role, schoolId: user.schoolId.toString(), isActive: user.isActive });

    return res.status(200).json({
      success: true,
      message: "Login saved",
      data: { email: user.email, schoolId: user.schoolId, isActive: user.isActive },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "That email is already used by another account" });
    }
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((field) => {
        errors[field] = error.errors[field].message;
      });
      return res.status(422).json({ success: false, message: "Validation failed", errors });
    }
    console.error("❌  createOrUpdateClientLogin error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/login-for-school/:schoolId   (admin only)
//  Returns the email (never the password — it's hashed and one-way) tied to
//  a school's client login, or null if none exists yet.
// ────────────────────────────────────────────────────────────────────────────
const getLoginForSchool = async (req, res) => {
  try {
    const user = await User.findOne({ schoolId: req.params.schoolId, role: "client" });
    return res.status(200).json({
      success: true,
      data: user ? { email: user.email, isActive: user.isActive } : null,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid school ID format" });
    }
    console.error("❌  getLoginForSchool error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { login, getMe, createOrUpdateClientLogin, getLoginForSchool };