// scripts/migrateFacultyProfiles.js
//
// One-time data migration: converts any school still holding the OLD
// Faculty Profile shape —
//   facultyProfile: { name, title, photo, ... }               (object)
//   facultyStatsRows / facultyExpertiseRows / facultyTeachingRows /
//   facultyToolsRows / facultyStrengthsRows                    (5 arrays)
// — into the new shape:
//   facultyProfiles: [{ id, name, title, photo, ..., statsRows,
//                        expertiseRows, teachingRows, toolsRows,
//                        strengthsRows }]                       (1 array)
//
// This is NOT required for the app to keep working — AdminPanel's
// migrateFacultyProfile() and AEDSDashboard's legacyFacultyProfileToEntry()
// already convert the old shape on the fly, every time it's read. Run this
// script when you'd rather have every document in Mongo actually stored in
// the new shape (e.g. before writing a report/export that reads the raw
// collection directly, or just to tidy up). Safe to run more than once —
// any school that already has a `facultyProfiles` array is left untouched.
//
// Usage:
//   node scripts/migrateFacultyProfiles.js
//
// NOTE: this connects to Mongo directly with its own mongoose.connect call
// rather than reusing config/db.js, since that module's connectDB() wasn't
// shown here and this needs to run once from the command line, not as part
// of the Express app. Point MONGODB_URI at the same database your server
// uses — swap the env var name below if your app calls it something else
// (e.g. MONGO_URI).
require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const School = require("../models/School");

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URI;

function hasLegacyFacultyData(doc) {
  const fp = doc.facultyProfile;
  const stats = doc.facultyStatsRows || [];
  const expertise = doc.facultyExpertiseRows || [];
  const teaching = doc.facultyTeachingRows || [];
  const tools = doc.facultyToolsRows || [];
  const strengths = doc.facultyStrengthsRows || [];
  return !!(
    fp &&
    (fp.name || fp.title || fp.photo || fp.quote ||
      stats.length || expertise.length || teaching.length || tools.length || strengths.length)
  );
}

function buildMigratedEntry(doc) {
  const fp = doc.facultyProfile || {};
  return {
    id: crypto.randomUUID(),
    name: fp.name || "",
    title: fp.title || "",
    photo: fp.photo || "",
    topBadge: fp.topBadge || "CYBERBOTS CERTIFIED FACULTY",
    bottomSeal: fp.bottomSeal || "CYBERBOTS CERTIFIED EXPERT FACULTY",
    tagline: fp.tagline || "EMPOWERING STUDENTS THROUGH ROBOTICS  •  AI  •  INNOVATION  •  SKILLS",
    quote: fp.quote || "",
    contactPhone: fp.contactPhone || "",
    contactEmail: fp.contactEmail || "",
    contactWebsite: fp.contactWebsite || "",
    contactLocation: fp.contactLocation || "",
    signatoryName: fp.signatoryName || "",
    signatoryTitle: fp.signatoryTitle || "",
    signatoryCompany: fp.signatoryCompany || "",
    signaturePhoto: fp.signaturePhoto || "",
    statsRows: doc.facultyStatsRows || [],
    expertiseRows: doc.facultyExpertiseRows || [],
    teachingRows: doc.facultyTeachingRows || [],
    toolsRows: doc.facultyToolsRows || [],
    strengthsRows: doc.facultyStrengthsRows || [],
  };
}

async function run() {
  if (!MONGO_URL) {
    console.error("❌  Set MONGODB_URI (or MONGO_URI) before running this script.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URL);
  console.log("✅  Connected to MongoDB");

  // Raw collection access (not School.find()) so we see facultyProfile /
  // facultyStatsRows etc. even though they're no longer in the Mongoose
  // schema — Mongoose would otherwise strip unknown-to-the-schema data
  // from the hydrated documents before we ever get to look at it.
  const collection = mongoose.connection.collection("schools");
  const cursor = collection.find({});

  let scanned = 0;
  let migrated = 0;
  let alreadyDone = 0;
  let skippedEmpty = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    scanned++;

    if (Array.isArray(doc.facultyProfiles)) {
      alreadyDone++;
      continue;
    }

    if (!hasLegacyFacultyData(doc)) {
      // No real data on the old fields either — just set an empty array so
      // this document doesn't get re-scanned as "not yet migrated" forever.
      await collection.updateOne({ _id: doc._id }, { $set: { facultyProfiles: [] } });
      skippedEmpty++;
      continue;
    }

    const entry = buildMigratedEntry(doc);
    await collection.updateOne({ _id: doc._id }, { $set: { facultyProfiles: [entry] } });
    migrated++;
    console.log(`  → migrated "${doc.name}" (${doc._id}) — 1 faculty member carried forward`);
  }

  console.log("──────────────────────────────────────────");
  console.log(`Scanned:            ${scanned}`);
  console.log(`Migrated (1 entry): ${migrated}`);
  console.log(`Already migrated:   ${alreadyDone}`);
  console.log(`Set to [] (blank):  ${skippedEmpty}`);
  console.log("Done.");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});