// Run with: node scripts/seedUsers.js
// Creates one super admin account, one demo school, and one client account
// tied to that school. Safe to re-run — it clears previous seed data first.

require("dotenv").config();
const connectDB = require("../config/db");
const School = require("../models/School");
const User = require("../models/User");

async function seed() {
  await connectDB();

  await User.deleteMany({});
  await School.deleteMany({});

  const school = await School.create({
    name: "The Hindu Senior Secondary School",
    faculty: "Logeshwari.S",
    year: "2025-2026",
    grades: "3 TO 8",
    totalStudents: 740,
    deliverables: [
      { name: "WORKBOOK", grades: "3 TO 8", status: "DELIVERED" },
      { name: "ROBOTICS & AI (KITS & MATERIALS)", grades: "3 TO 8", status: "DELIVERED" },
      { name: "WORKDONE REPORT", grades: "3 TO 8", status: "REPORTING MONTHLY" },
      { name: "ASSESSMENTS", grades: "3 TO 8", status: "IN PROGRESS" },
    ],
  });

  await User.create({
    email: "admin@cyberbots.com",
    password: "admin123",
    role: "admin",
  });

  await User.create({
    email: "principal@hindu.edu",
    password: "cyber1234",
    role: "client",
    schoolId: school._id,
  });

  console.log("✅  Seed complete:");
  console.log("   School:", school.name, `(${school._id})`);
  console.log("   Admin login:  admin@cyberbots.com / admin123");
  console.log("   Client login: principal@hindu.edu / cyber1234");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});