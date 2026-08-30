// ─────────────────────────────────────────────────────────────────
//  src/api/http.js  — DEBUG-INSTRUMENTED VERSION
//
//  Same behavior as before, plus FormData support (needed for photo
//  uploads — see the isFormData note below). Added: [FE:http] logs on
//  every request, every response, and every session write/clear — with
//  console.trace on writes so any unexpected caller identifies itself
//  by file + line. Remove all [DEBUG] blocks before deploying.
// ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TOKEN_KEY = "cb_token";
const USER_KEY = "cb_user";

// Exported so components can build absolute URLs for server-hosted files
// (e.g. uploaded media photos, which come back as relative "/uploads/…"
// paths) without duplicating the base-URL fallback logic.
export { BASE_URL };

// ── Session storage helpers ──────────────────────────────────────
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setSession = (token, user) => {
  // [DEBUG] Every legitimate session write in the app goes through here.
  console.log("[FE:http] setSession — role =", user?.role, "| email =", user?.email);
  console.trace("[FE:http] setSession called from:");
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  // [DEBUG]
  console.log("[FE:http] clearSession");
  console.trace("[FE:http] clearSession called from:");
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Corrupt JSON in storage no longer crashes the app at import time.
    return null;
  }
};

// ── The one fetch wrapper everything uses ────────────────────────
//
//  apiFetch(path, options)
//    path    — e.g. "/api/schools/me"
//    options — standard fetch options, plus:
//      auth: true  → attach the Bearer token and treat 401 as
//                    "session dead" (clear it, throw status 401)
//
//  If options.body is a FormData instance (photo uploads), we deliberately
//  do NOT set Content-Type — the browser sets its own
//  "multipart/form-data; boundary=…" header, and setting it manually here
//  would strip the boundary and break the upload.
//
//  Returns the parsed JSON body on success.
//  Throws { message, errors, status } on any failure.
//
export async function apiFetch(path, { auth = false, ...options } = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // [DEBUG] One line per outgoing request: method, path, auth mode, body
  // kind, and a fingerprint of the token being sent (first 12 chars —
  // enough to tell two tokens apart without dumping the whole JWT).
  const t = auth ? getToken() : null;
  console.log(
    "[FE:http] →", (options.method || "GET"), path,
    "| auth:", auth,
    "| body:", isFormData ? "FormData" : "json",
    "| token:", auth ? (t ? t.slice(0, 12) + "…" : "NONE") : "n/a"
  );

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    // Network-level failure (server down, DNS, offline)
    console.log("[FE:http] ✗ NETWORK FAILURE on", path);
    throw { message: "Network error. Please check your connection and try again.", errors: {}, status: 0 };
  }

  // [DEBUG] One line per response.
  console.log("[FE:http] ←", response.status, path);

  if (auth && response.status === 401) {
    // [DEBUG] The "session dead" branch — clears storage.
    console.log("[FE:http] 401 on authed request → clearing session");
    clearSession();
    throw {
      message:
        "Session expired. Please log in again — your unsaved work is still on screen, so copy anything important (e.g. from the Export tab) before leaving the page.",
      errors: {},
      status: 401,
    };
  }

  let json = {};
  try {
    json = await response.json();
  } catch {
    // Empty or non-JSON body — fall through with {}
  }

  if (!response.ok) {
    console.log("[FE:http] request FAILED", response.status, path, "message =", json.message);
    throw {
      message: json.message || `Request failed (${response.status})`,
      errors: json.errors || {},
      status: response.status,
    };
  }

  return json;
}