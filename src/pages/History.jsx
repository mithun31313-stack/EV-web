import React, { useEffect, useState } from 'react';
import { sessionApi } from '../api/client';

function statusColor(status) {
  if (status === 'charging') return 'var(--accent)';
  if (status === 'completed') return 'var(--info)';
  if (status === 'stopped') return 'var(--warning)';
  return 'var(--text-muted)';
}

export default function History() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    sessionApi.mine().then((res) => setSessions(res.data)).catch(() => {});
  }, []);

  return (
    <div className="container">
      <h2>Session History</h2>
      {sessions.length === 0 ? (
        <p className="muted">No sessions yet</p>
      ) : (
        sessions.map((item) => (
          <div className="card" key={item.id}>
            <div className="row-between">
              <strong>{item.station_name || `Station #${item.station_id}`}</strong>
              <span style={{ color: statusColor(item.status), fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>
                {item.status}
              </span>
            </div>
            <p className="muted small" style={{ margin: '6px 0 0' }}>
              ₹{item.amount_paid} · {item.duration_minutes} min
            </p>
            <p className="muted small" style={{ margin: '2px 0 0' }}>
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
