const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── Schema ─────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
      maxlength: [254, "Email is too long"],
    },

    // Stored as a bcrypt hash — never plaintext.
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // excluded from queries by default — must opt in with .select("+password")
    },

    role: {
      type: String,
      required: true,
      enum: { values: ["admin", "client"], message: "{VALUE} is not a valid role" },
      default: "client",
    },

    // Only client accounts are tied to a school. Admin accounts see everything.
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: function () {
        return this.role === "client";
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Pre-save hook: hash the password whenever it's set or changed ─────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method used at login ──────────────────────────────────────────
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);