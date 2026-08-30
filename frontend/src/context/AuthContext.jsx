// src/context/AuthContext.jsx — DEBUG-INSTRUMENTED VERSION
// Remove all [DEBUG] blocks before deploying.

import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, logout as logoutApi, getStoredUser, fetchMe } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // [DEBUG] Lazy initializer so the "what was in storage at first render"
  // log fires exactly once per provider instance.
  const [user, setUser] = useState(() => {
    const stored = getStoredUser();
    console.log("[FE:AuthCtx] INITIAL user from storage =", stored);
    return stored;
  });
  const [loading, setLoading] = useState(true);

  // On first load, verify the stored token is still valid against the
  // server (handles expired tokens, deactivated accounts, etc.).
  useEffect(() => {
    // [DEBUG] If this prints from two DIFFERENT provider instances (i.e.
    // not just React 18 StrictMode's immediate dev-only double-invoke),
    // you have two AuthProviders and two independent `user` states —
    // which is exactly how login-as-client can still render AdminPanel.
    console.log("[FE:AuthCtx] provider MOUNTED");

    (async () => {
      const me = await fetchMe();
      console.log("[FE:AuthCtx] fetchMe resolved →", me);
      setUser(me);
      setLoading(false);
    })();
  }, []);

  async function login(email, password) {
    const data = await loginApi(email, password);
    // [DEBUG] The role React state will now hold — Portal branches on this.
    console.log("[FE:AuthCtx] login() setting user =", data.user);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    console.log("[FE:AuthCtx] logout()");
    logoutApi();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}