// src/api/authApi.js — DEBUG-INSTRUMENTED VERSION
//
// Thin wrappers over http.js — no raw fetches, no direct localStorage
// access, no duplicate TOKEN_KEY constants. Session helpers are
// re-exported so existing imports (AuthContext, etc.) keep working.
// Remove all [DEBUG] blocks before deploying.

import { apiFetch, setSession, clearSession, getToken, getStoredUser } from "./http";

export { getToken, getStoredUser };

// ── Public ─────────────────────────────────────────────────────────────────
export const login = async (email, password) => {
  // auth stays false (the default) on purpose: a wrong-password 401 here
  // must NOT clear an existing session or read as "session expired".
  const json = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // [DEBUG] What the server handed back — this role and the token were
  // minted together and MUST match everywhere downstream.
  console.log("[FE:authApi] login response user =", json.data.user);

  setSession(json.data.token, json.data.user);
  return json.data;
};

export const logout = () => {
  // [DEBUG]
  console.log("[FE:authApi] logout()");
  clearSession();
};

// ── Session bootstrap ──────────────────────────────────────────────────────
//  Never throws. AuthContext awaits this on first load.
export const fetchMe = async () => {
  const token = getToken();

  // [DEBUG]
  console.log("[FE:authApi] fetchMe — stored token:", token ? token.slice(0, 12) + "…" : "NONE");

  if (!token) return null;

  try {
    const json = await apiFetch("/api/auth/me", { auth: true });

    // [DEBUG] The server's live verdict on who this token belongs to.
    console.log("[FE:authApi] fetchMe → server says role =", json.data.role, "| email =", json.data.email);

    setSession(token, json.data); // refresh the cached user
    return json.data;
  } catch (err) {
    if (err.status === 401) {
      console.log("[FE:authApi] fetchMe → 401, session cleared, returning null");
      return null; // apiFetch already cleared the session
    }
    // Network / server error — don't log the user out over a blip; trust
    // the cached user until the server is reachable again.
    // [DEBUG] ⚠ THIS is the path where a STALE cached role could leak into
    // routing. If you see this line during the bug, the cached user below
    // is what Portal branched on — not anything the server said.
    const cached = getStoredUser();
    console.log("[FE:authApi] fetchMe FAILED status =", err.status, "→ FALLING BACK to cached user =", cached);
    return cached;
  }
};

// ── Admin: manage a school's client login ──────────────────────────────────
export const adminCreateLogin = async (schoolId, email, password) => {
  const json = await apiFetch("/api/auth/create-login", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ schoolId, email, password }),
  });
  return json.data; // { email, schoolId, isActive }
};

export const adminGetLoginForSchool = async (schoolId) => {
  const json = await apiFetch(`/api/auth/login-for-school/${schoolId}`, { auth: true });
  return json.data; // { email, isActive } | null
};