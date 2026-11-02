import React, { useEffect, useState } from 'react';
import useVisitTracker from '../../hooks/useVisitTracker';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function VisitStats() {
  const { todayCount, activeUsers } = useVisitTracker();
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/visits/daily-stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDailyStats(data.stats);
        } else {
          setError('Failed to load daily stats');
        }
      })
      .catch(() => setError('Failed to load daily stats'))
      .finally(() => setLoading(false));
  }, []);

  // Keep today's row in the table in sync with the live socket count,
  // in case today's date isn't in dailyStats yet (first visitor of the day)
  useEffect(() => {
    const todayString = new Date().toISOString().split('T')[0];
    setDailyStats((prev) => {
      const exists = prev.find((s) => s.date === todayString);
      if (exists) {
        return prev.map((s) =>
          s.date === todayString ? { ...s, count: todayCount } : s
        );
      }
      if (todayCount > 0) {
        return [{ date: todayString, count: todayCount }, ...prev];
      }
      return prev;
    });
  }, [todayCount]);

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px' }}>Website Traffic</h2>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>🟢 Live users online</div>
          <div style={statValueStyle}>{activeUsers}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>📊 Today's visitors</div>
          <div style={statValueStyle}>{todayCount}</div>
        </div>
      </div>

      <h3 style={{ marginBottom: '8px' }}>Day-by-day history</h3>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Unique Visitors</th>
            </tr>
          </thead>
          <tbody>
            {dailyStats.length === 0 && (
              <tr>
                <td colSpan={2} style={tdStyle}>No data yet</td>
              </tr>
            )}
            {dailyStats.map((stat) => (
              <tr key={stat.date}>
                <td style={tdStyle}>{stat.date}</td>
                <td style={tdStyle}>{stat.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const statCardStyle = {
  flex: 1,
  padding: '16px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  textAlign: 'center'
};

const statLabelStyle = {
  fontSize: '13px',
  color: '#666',
  marginBottom: '4px'
};

const statValueStyle = {
  fontSize: '28px',
  fontWeight: 'bold'
};

const thStyle = {
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
  padding: '8px'
};

const tdStyle = {
  borderBottom: '1px solid #eee',
  padding: '8px'
};