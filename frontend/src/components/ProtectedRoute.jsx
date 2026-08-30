// src/components/ProtectedRoute.jsx — DEBUG-INSTRUMENTED VERSION
// Remove all [DEBUG] blocks before deploying.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap any route element with this to require login.
 * Optional `role` prop restricts it further (e.g. role="admin").
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // [DEBUG] One line per render — shows exactly what the gate saw.
  console.log(
    "[FE:ProtectedRoute] loading =", loading,
    "| user.role =", user?.role ?? "none",
    "| required =", role || "any"
  );

  if (loading) {
    return <div style={{ padding: 40, fontFamily: "system-ui" }}>Loading…</div>;
  }

  if (!user) {
    console.log("[FE:ProtectedRoute] → redirect to /portal/login (no user)");
    return <Navigate to="/portal/login" replace />;
  }

  if (role && user.role !== role) {
    // Logged in, but wrong role for this specific route.
    console.log("[FE:ProtectedRoute] → redirect to /portal (role mismatch)");
    return <Navigate to="/portal" replace />;
  }

  console.log("[FE:ProtectedRoute] → PASS, rendering children");
  return children;
}