import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../api/client';

const STATUS = {
  idle: { color: 'var(--info)', label: 'Idle' },
  charging: { color: 'var(--accent)', label: 'Charging' },
  offline: { color: 'var(--text-muted)', label: 'Offline' },
};

export default function Stations() {
  const [stations, setStations] = useState([]);

  const load = useCallback(() => {
    adminApi.stations().then((res) => setStations(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="container">
      <h2>Live Stations</h2>
      {stations.length === 0 ? (
        <p className="muted">No stations added yet</p>
      ) : (
        stations.map((s) => {
          const st = STATUS[s.status] || STATUS.offline;
          return (
            <div className="card" key={s.id}>
              <div className="row-between">
                <div>
                  <strong>{s.name}</strong>
                  <p className="muted small" style={{ margin: '2px 0 0' }}>{s.location || 'No location set'}</p>
                </div>
                <span className="badge" style={{ borderColor: st.color, color: st.color }}>
                  <span className="dot" style={{ background: st.color }} />
                  {st.label}
                </span>
              </div>
              <p className="muted small" style={{ marginBottom: 0 }}>₹{s.rate_per_minute}/min</p>
            </div>
          );
        })
      )}
    </div>
  );
}
