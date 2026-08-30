// src/pages/Portal.jsx — DEBUG-INSTRUMENTED VERSION
// The role router for the protected /portal route.
// admin -> AdminPanel (full CRUD over all schools)
// client -> AEDSDashboard, scoped to their own school via /api/schools/me
// Remove all [DEBUG] blocks before deploying.

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getMySchool } from "../api/schoolApi";
import AdminPanel from "../components/Aedsadminpanel/Aedsadminpanel";
import AEDSDashboard from "../components/Aedsdashboard/Aedsdashboard";

export default function Portal() {
  const { user, logout } = useAuth();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(user.role === "client");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // [DEBUG] THE decision point. Whatever role prints here is what decides
  // which console renders. If this says "client" and you still see
  // AdminPanel, AdminPanel was mounted by something OTHER than this file.
  console.log("[FE:Portal] deciding — user =", user);

  // Pulled out of the mount effect so AEDSDashboard's Refresh button can
  // call the exact same fetch — this is the fix for "I unticked a section
  // in AdminPanel and saved, but the dashboard still shows it": the
  // dashboard only ever fetched school data once, on mount, so a change
  // made afterwards in another tab/session had no way to reach it short of
  // a full page reload. Now there's a button for that.
  const refreshSchool = useCallback(async ({ silent } = {}) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await getMySchool();
      // [DEBUG] This is the value AEDSDashboard's nav filters on. If a
      // section you unticked in AdminPanel still shows here as true (or
      // missing) after you've definitely clicked "Save changes" there,
      // the problem is upstream of this fetch — check the server's
      // [BE:getMySchool] log for the same request.
      console.log("[FE:Portal] getMySchool OK — school =", res.data?.name, "| enabledSections =", res.data?.enabledSections);
      setSchool(res.data);
      setError("");
      return res.data;
    } catch (e) {
      console.log("[FE:Portal] getMySchool FAILED — status =", e.status, "message =", e.message);
      setError(e.message || "Failed to load your school");
      return null;
    } finally {
      setLoading(false);
      if (!silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user.role !== "client") return;
    let cancelled = false;
    (async () => {
      const data = await refreshSchool();
      if (cancelled) return; // refreshSchool already set state; nothing further to do
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  if (user.role === "admin") {
    // [DEBUG]
    console.log("[FE:Portal] → rendering AdminPanel");
    return <AdminPanel userEmail={user.email} onLogout={logout} />;
  }

  // [DEBUG]
  console.log("[FE:Portal] → rendering AEDSDashboard branch (loading =", loading, ", error =", error || "none", ")");

  if (loading) {
    return <div style={{ padding: 40, fontFamily: "system-ui" }}>Loading your dashboard…</div>;
  }

  if (error) {
    return <div style={{ padding: 40, fontFamily: "system-ui", color: "#dc2626" }}>{error}</div>;
  }

  return (
    <AEDSDashboard
      school={school}
      userEmail={user.email}
      onLogout={logout}
      onRefresh={refreshSchool}
      refreshing={refreshing}
    />
  );
}