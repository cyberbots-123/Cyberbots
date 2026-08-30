// backend/scripts/migrate-media-row-ids.js
//
// PHASE 1 — one-time migration: stamp a stable `rowId` onto every existing
// mediaRows entry that doesn't have one yet. After this runs, photo uploads
// and deletes are addressed by rowId instead of array position, so deleting
// or reordering media rows can never misattach another month's photos.
//
// Safe to re-run: rows that already have a rowId are left untouched, and a
// second run reports "0 rows stamped". Soft-deleted schools are migrated
// too (they can be restored later and must not carry the old bug with them).
//
// Usage:
//   node scripts/migrate-media-row-ids.js          # apply
//   node scripts/migrate-media-row-ids.js --dry    # report only, write nothing
//
// Notes:
//   • save({ timestamps: false }) so updatedAt is NOT bumped — this is a
//     mechanical stamp, not an edit, and Phase 1's optimistic-concurrency
//     check compares updatedAt. Admins mid-edit during the migration won't
//     get a spurious 409.
//   • validateBeforeSave: false so a legacy document with (say) an old
//     deliverable status the current enum rejects doesn't block the stamp.

require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");

const School = require(path.join(__dirname, "..", "models", "School"));

// Match whichever env var name your config/db.js uses.
const MONGO_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

const DRY_RUN = process.argv.includes("--dry");

async function run() {
  if (!MONGO_URI) {
    console.error("❌  Set MONGO_URI (or MONGODB_URI) in your environment / .env first.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log(`Connected. ${DRY_RUN ? "DRY RUN — nothing will be written." : "Applying migration…"}`);

  // Only schools that actually have media rows; includes soft-deleted ones.
  const cursor = School.find({ "mediaRows.0": { $exists: true } }).cursor();

  let scanned = 0;
  let updatedSchools = 0;
  let rowsStamped = 0;

  for await (const school of cursor) {
    scanned++;

    let changed = false;
    const next = (school.mediaRows || []).map((row) => {
      if (row && typeof row === "object" && !row.rowId) {
        changed = true;
        rowsStamped++;
        return { ...row, rowId: crypto.randomUUID() };
      }
      return row;
    });

    if (!changed) continue;
    updatedSchools++;

    if (DRY_RUN) {
      console.log(`  (dry) would stamp ${school.name} (${school._id})`);
      continue;
    }

    school.mediaRows = next;
    school.markModified("mediaRows"); // Mixed type — Mongoose can't see the change otherwise
    await school.save({ timestamps: false, validateBeforeSave: false });
    console.log(`  ✓ stamped ${school.name} (${school._id})`);
  }

  console.log("─".repeat(50));
  console.log(`Schools scanned:  ${scanned}`);
  console.log(`Schools updated:  ${updatedSchools}${DRY_RUN ? " (dry run)" : ""}`);
  console.log(`Rows stamped:     ${rowsStamped}${DRY_RUN ? " (dry run)" : ""}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});