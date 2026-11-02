import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Vite exposes env vars via import.meta.env, and only ones prefixed VITE_
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let socket; // shared single socket connection across the app

function getSessionId() {
  let id = localStorage.getItem('visitorSessionId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('visitorSessionId', id);
  }
  return id;
}

export default function useVisitTracker() {
  const [todayCount, setTodayCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    // 1. Connect socket once
    if (!socket) {
      socket = io(BACKEND_URL);
    }

    socket.on('todayCount', setTodayCount);
    socket.on('activeUsers', setActiveUsers);

    // 2. Fetch today's count immediately on load (before any new visit updates it)
    fetch(`${BACKEND_URL}/api/visits/today`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTodayCount(data.todayCount);
      })
      .catch(() => {});

    // 3. Track this visit (only once per browser tab load, not on every re-render)
    const alreadyTrackedThisTab = sessionStorage.getItem('trackedThisTab');
    if (!alreadyTrackedThisTab) {
      fetch(`${BACKEND_URL}/api/visits/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: window.location.pathname,
          sessionId: getSessionId(),
          referrer: document.referrer
        })
      }).catch(() => {});

      sessionStorage.setItem('trackedThisTab', 'true');
    }

    return () => {
      socket.off('todayCount', setTodayCount);
      socket.off('activeUsers', setActiveUsers);
    };
  }, []);

  return { todayCount, activeUsers };
}