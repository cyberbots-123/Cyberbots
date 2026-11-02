import React, { useState, useEffect } from "react";
import "./EventPosterPopup.css";

export default function EventPosterPopup({
  posterUrl,
  storageKey = "eventPosterSeen", // change per event/campaign
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once per browser (remove this check if you want it every visit)
    if (sessionStorage.getItem(storageKey)) return;

    const timer = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem(storageKey, "true");
    }, 5000);

    return () => clearTimeout(timer);
  }, [storageKey]);

  if (!show) return null;

  return (
    <div className="poster-overlay" onClick={() => setShow(false)}>
      <div className="poster-box" onClick={(e) => e.stopPropagation()}>
        <button className="poster-close" onClick={() => setShow(false)}>
          ✕
        </button>
        <img src={posterUrl} alt="Event Poster" className="poster-img" />
      </div>
    </div>
  );
}