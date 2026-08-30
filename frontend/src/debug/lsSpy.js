// ─────────────────────────────────────────────────────────────────
//  src/debug/lsSpy.js  — TEMPORARY DEBUG FILE. DELETE BEFORE DEPLOY.
//
//  Monkey-patches localStorage so that EVERY write or delete — from any
//  file, including legacy code that bypasses http.js entirely — prints
//  the key, a preview of the value, and a stack trace naming the exact
//  file and line that did it.
//
//  Install: make this the VERY FIRST import in src/main.jsx:
//
//      import "./debug/lsSpy";     // ← line 1, before everything else
//      import React from "react";
//      ...
//
//  What to look for in the console:
//    • Any key other than cb_token / cb_user  → a second auth system.
//    • cb_token / cb_user written from a file other than http.js
//      (check the stack trace)                → a rogue writer.
// ─────────────────────────────────────────────────────────────────

const origSet = localStorage.setItem.bind(localStorage);
localStorage.setItem = (key, value) => {
  console.log("[FE:LS-SPY] setItem key =", key, "| value =", String(value).slice(0, 80));
  console.trace("[FE:LS-SPY] written from:");
  origSet(key, value);
};

const origRemove = localStorage.removeItem.bind(localStorage);
localStorage.removeItem = (key) => {
  console.log("[FE:LS-SPY] removeItem key =", key);
  console.trace("[FE:LS-SPY] removed from:");
  origRemove(key);
};

const origClear = localStorage.clear.bind(localStorage);
localStorage.clear = () => {
  console.log("[FE:LS-SPY] CLEAR — entire localStorage wiped");
  console.trace("[FE:LS-SPY] cleared from:");
  origClear();
};

export {};