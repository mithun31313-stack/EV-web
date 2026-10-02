import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/client';

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);

  const load = useCallback(() => {
    adminApi.activeSessions().then((res) => setSessions(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, [load]);

  const forceStop = async (id) => {
    if (!window.confirm('End this session immediately?')) return;
    try {
      await adminApi.forceStop(id);
      load();
    } catch (err) {
      alert('Could not stop session');
    }
  };

  return (
    <div className="container">
      <h2>Active Sessions</h2>
      {sessions.length === 0 ? (
        <p className="muted">No active sessions right now</p>
      ) : (
        sessions.map((s) => (
          <div className="card" key={s.id}>
            <div className="row-between">
              <strong>{s.user_name}</strong>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{s.latest_power ?? 0} W</span>
            </div>
            <p className="muted small">
              {s.station_name} · ₹{s.amount_paid} · {s.duration_minutes} min
            </p>
            <button className="btn btn-danger" onClick={() => forceStop(s.id)}>
              Force Stop
            </button>
          </div>
        ))
      )}
    </div>
  );
}
