import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.stats().then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="container">
      <h2>Overview</h2>
      <div className="grid-2">
        <div className="card">
          <p className="muted small" style={{ margin: 0 }}>TOTAL ENERGY SUPPLIED</p>
          <p style={{ fontSize: 24, fontWeight: 700, margin: '6px 0 0' }}>{stats?.total_energy_kwh ?? '0'} kWh</p>
        </div>
        <div className="card">
          <p className="muted small" style={{ margin: 0 }}>TOTAL REVENUE</p>
          <p style={{ fontSize: 24, fontWeight: 700, margin: '6px 0 0' }}>₹{stats?.total_revenue ?? '0'}</p>
        </div>
        <div className="card">
          <p className="muted small" style={{ margin: 0 }}>TOTAL SESSIONS</p>
          <p style={{ fontSize: 24, fontWeight: 700, margin: '6px 0 0' }}>{stats?.total_sessions ?? '0'}</p>
        </div>
        <div className="card">
          <p className="muted small" style={{ margin: 0 }}>TODAY'S REVENUE</p>
          <p style={{ fontSize: 24, fontWeight: 700, margin: '6px 0 0' }}>₹{stats?.today_revenue ?? '0'}</p>
        </div>
      </div>
      <div className="card">
        <p className="muted small" style={{ margin: 0 }}>TODAY'S ENERGY SUPPLIED</p>
        <p style={{ fontSize: 24, fontWeight: 700, margin: '6px 0 0' }}>{stats?.today_energy_kwh ?? '0'} kWh</p>
      </div>
    </div>
  );
}
