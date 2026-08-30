/* ═══════════════════════════════════════════════════════════════
   CYBERFLIX 2K26 — SERVER-SIDE ZONE REGISTRATION RULES

   Deliberately duplicated (not imported) from the frontend's
   src/pages/zoneRegistrationConfigs.js. The two files must be kept
   in sync by hand whenever a fee, team size, or bot price changes.

   WHY DUPLICATE INSTEAD OF TRUSTING THE CLIENT:
   ZoneRegistrationForm.jsx computes its own teamFee / totalFee /
   botPurchaseFee and POSTs them — those numbers are for display
   only. Anyone can edit them in devtools before hitting submit.
   This file is what the controller uses to recompute the *real*
   fee from just the zone id + team size + bot opt-in, so nothing
   about money is ever taken on the client's word.
═══════════════════════════════════════════════════════════════ */

const ZONE_RULES = {
  "1a": {
    code: "ZONE 1A",
    name: "Chamber of Circuits",
    teamSize: 2,
    feeModel: "per-student",
    feePerStudent: 850,
    flatFee: null,
    botPurchase: null,
  },
  "1b": {
    code: "ZONE 1B",
    name: "The Triwizard Quest",
    teamSize: 1,
    feeModel: "per-student",
    feePerStudent: 850,
    flatFee: null,
    botPurchase: null,
  },
  "2a": {
    code: "ZONE 2A",
    name: "The Founder's Vault",
    teamSize: 2,
    feeModel: "per-student",
    feePerStudent: 850,
    flatFee: null,
    botPurchase: null,
  },
  "2b": {
    code: "ZONE 2B",
    name: "Wizard's Rally",
    teamSize: 1,
    feeModel: "per-student",
    feePerStudent: 850,
    flatFee: null,
    botPurchase: { price: 1799, label: "Official Bot" },
  },
  "3a": {
    code: "ZONE 3A",
    name: "Clash of Wizards",
    teamSize: 2,
    feeModel: "flat", // flat ₹850 for the whole team, NOT per-student
    feePerStudent: null,
    flatFee: 850,
    botPurchase: null,
  },
  "3b": {
    code: "ZONE 3B",
    name: "The Next Big Idea — Venture X",
    teamSize: 1,
    feeModel: "per-student",
    feePerStudent: 750,
    flatFee: null,
    botPurchase: null,
  },
};

/**
 * Accepts "1a", "ZONE 1A", "zone-1a", etc. Returns the canonical
 * zoneId ("1a") or null if it doesn't match anything in the table.
 */
function normalizeZoneId(raw) {
  const id = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^zone[\s-]*/, "");
  return ZONE_RULES[id] ? id : null;
}

/**
 * Recomputes base + total fee from ZONE_RULES — the only fee numbers
 * the controller should ever trust. Returns null for an unknown zoneId.
 */
function computeFee(zoneId, wantsBot) {
  const rule = ZONE_RULES[zoneId];
  if (!rule) return null;

  const baseFee = rule.feeModel === "flat" ? rule.flatFee : rule.feePerStudent * rule.teamSize;
  const botOpted = !!(rule.botPurchase && wantsBot);
  const botFee = botOpted ? rule.botPurchase.price : 0;

  return {
    baseFee,
    botOpted,
    botLabel: botOpted ? rule.botPurchase.label : null,
    botFee,
    totalFee: baseFee + botFee,
  };
}

module.exports = { ZONE_RULES, normalizeZoneId, computeFee };