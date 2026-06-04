const Enrollment = require("../models/Enrollment");
const {
  sendEnrollmentAdminNotification,
  sendEnrollmentConfirmation,
} = require("../config/enrollmentMailer");

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/enrollment
//  Submit a new course enrollment
// ────────────────────────────────────────────────────────────────────────────
const createEnrollment = async (req, res) => {
  try {
    const {
      // Student
      studentName, dob, gender, grade, institution, learningMode,
      // Parent
      parentName, relationship, mobile, altMobile, email, address,
      // Course
      course, tier, levelName, timeSlot,
    } = req.body;

    const enrollment = new Enrollment({
      studentName, dob, gender, grade, institution, learningMode,
      parentName, relationship,
      mobile: (mobile || "").replace(/\s+/g, "").replace(/^\+91/, ""),
      altMobile: altMobile
        ? (altMobile).replace(/\s+/g, "").replace(/^\+91/, "")
        : "",
      email, address,
      course,
      tier: tier || "",
      levelName: levelName || "",
      timeSlot,
      ipAddress:
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.socket.remoteAddress ||
        "",
    });

    await enrollment.save();

    // ── Send emails (non-blocking) ─────────────────────────────────────────
    if (process.env.SEND_EMAIL === "true") {
      Promise.all([
        sendEnrollmentAdminNotification(enrollment),
        sendEnrollmentConfirmation(enrollment),
      ]).catch((err) => {
        console.error("⚠️  Enrollment email failed (non-fatal):", err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: "Enrollment submitted successfully",
      data: {
        referenceNumber: enrollment.referenceNumber,
        studentName: enrollment.studentName,
        parentName: enrollment.parentName,
        email: enrollment.email,
        course: enrollment.course,
        tier: enrollment.tier,
        levelName: enrollment.levelName,
        timeSlot: enrollment.timeSlot,
        createdAt: enrollment.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate submission detected. Please try again.",
      });
    }

    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((field) => {
        errors[field] = error.errors[field].message;
      });
      return res.status(422).json({ success: false, message: "Validation failed", errors });
    }

    console.error("❌  createEnrollment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/enrollment
//  List all enrollments with optional filters (admin)
// ────────────────────────────────────────────────────────────────────────────
const getAllEnrollments = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;

    // Optional filters
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.course) filter.course = req.query.course;
    if (req.query.tier)   filter.tier   = req.query.tier;
    if (req.query.learningMode) filter.learningMode = req.query.learningMode;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-ipAddress -__v"),
      Enrollment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: enrollments,
    });
  } catch (error) {
    console.error("❌  getAllEnrollments error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/enrollment/:id
//  Get a single enrollment by MongoDB _id
// ────────────────────────────────────────────────────────────────────────────
const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).select("-ipAddress -__v");

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    return res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    console.error("❌  getEnrollmentById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  PATCH /api/enrollment/:id/status
//  Update enrollment status (admin)
// ────────────────────────────────────────────────────────────────────────────
const updateEnrollmentStatus = async (req, res) => {
  try {
    const allowed = ["new", "confirmed", "in-progress", "completed", "cancelled"];
    const { status } = req.body;

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-ipAddress -__v");

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    return res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    console.error("❌  updateEnrollmentStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  DELETE /api/enrollment/:id
//  Hard-delete an enrollment (admin)
// ────────────────────────────────────────────────────────────────────────────
const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Enrollment ${enrollment.referenceNumber} deleted`,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    console.error("❌  deleteEnrollment error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollmentStatus,
  deleteEnrollment,
};