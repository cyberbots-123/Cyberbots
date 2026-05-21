const Contact = require("../models/Contact");
const { sendAdminNotification, sendUserConfirmation } = require("../config/mailer");

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/contact
//  Submit a new contact form enquiry
// ────────────────────────────────────────────────────────────────────────────
const createContact = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone,
      organisation, enquiryType, hearAboutUs,
      message, consent,
    } = req.body;

    // Build and save the document
    const contact = new Contact({
  firstName, lastName, email,
  phone: (phone || "").replace(/\s+/g, ""),
      organisation: organisation || "",
      enquiryType,
      hearAboutUs: hearAboutUs || "",
      message,
      consent,
      // Capture IP (respects proxies via X-Forwarded-For when behind Nginx/Heroku)
      ipAddress: req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "",
    });

    await contact.save();

    // ── Send emails (non-blocking — don't fail the request if email fails) ──
    if (process.env.SEND_EMAIL === "true") {
      Promise.all([
        sendAdminNotification(contact),
        sendUserConfirmation(contact),
      ]).catch((emailErr) => {
        console.error("⚠️  Email sending failed (non-fatal):", emailErr.message);
      });
    }

    // Return only the fields the frontend needs
    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: {
        referenceNumber: contact.referenceNumber,
        firstName: contact.firstName,
        email: contact.email,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    // Mongoose duplicate key (very rare with random ref numbers)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate submission detected. Please try again.",
      });
    }

    // Mongoose validation errors (second layer of defence after express-validator)
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((field) => {
        errors[field] = error.errors[field].message;
      });
      return res.status(422).json({ success: false, message: "Validation failed", errors });
    }

    console.error("❌  createContact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/contact
//  List all enquiries (admin use — protect this route in production!)
// ────────────────────────────────────────────────────────────────────────────
const getAllContacts = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;
    const status = req.query.status; // optional filter

    const filter = {};
    if (status) filter.status = status;

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-ipAddress -__v"), // exclude sensitive / internal fields
      Contact.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: contacts,
    });
  } catch (error) {
    console.error("❌  getAllContacts error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/contact/:id
//  Get a single enquiry by MongoDB _id
// ────────────────────────────────────────────────────────────────────────────
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).select("-ipAddress -__v");

    if (!contact) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    // Invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    console.error("❌  getContactById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  PATCH /api/contact/:id/status
//  Update the status of an enquiry (admin use)
// ────────────────────────────────────────────────────────────────────────────
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["new", "in-progress", "resolved", "closed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-ipAddress -__v");

    if (!contact) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    console.error("❌  updateContactStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  DELETE /api/contact/:id
//  Hard-delete an enquiry (admin use)
// ────────────────────────────────────────────────────────────────────────────
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Enquiry ${contact.referenceNumber} deleted`,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    console.error("❌  deleteContact error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};