import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionApi } from '../api/client';

function formatTime(totalSeconds) {
  if (totalSeconds == null) return '--:--';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Charging() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [stopping, setStopping] = useState(false);
  const pollRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await sessionApi.status(sessionId);
      setSession(res.data);
      if (res.data.status === 'completed' || res.data.status === 'stopped') {
        clearInterval(pollRef.current);
      }
    } catch (err) {
      // retry on next poll
    }
  };

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 4000);
    return () => clearInterval(pollRef.current);
  }, [sessionId]);

  const handleStop = async () => {
    if (!window.confirm('Stop charging now? This will end your session early.')) return;
    setStopping(true);
    try {
      await sessionApi.stop(sessionId);
      fetchStatus();
    } catch (err) {
      alert('Could not stop the session');
    } finally {
      setStopping(false);
    }
  };

  const isDone = session?.status === 'completed' || session?.status === 'stopped';
  const progress = session?.duration_minutes
    ? 1 - (session.secondsRemaining || 0) / (session.duration_minutes * 60)
    : 0;

  return (
    <div className="center-screen">
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center', padding: 20 }}>
        <p className="muted small" style={{ letterSpacing: 2 }}>
          {isDone ? 'CHARGING COMPLETE' : 'CHARGING'}
        </p>

        <div className="timer">{formatTime(session?.secondsRemaining)}</div>
        <p className="muted small" style={{ letterSpacing: 1.5 }}>
          {isDone ? 'You can collect your vehicle' : 'TIME REMAINING'}
        </p>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="muted small" style={{ margin: 0 }}>POWER</p>
            <p style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 0' }}>
              {session?.latest_power ?? 0} W
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="muted small" style={{ margin: 0 }}>PAID</p>
            <p style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 0' }}>
              ₹{session?.amount_paid ?? 0}
            </p>
          </div>
        </div>

        {!isDone && (
          <button className="btn btn-danger" onClick={handleStop} disabled={stopping}>
            {stopping ? 'Stopping…' : 'Stop Charging'}
          </button>
        )}
        {isDone && (
          <button className="btn" onClick={() => navigate('/')}>
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}
