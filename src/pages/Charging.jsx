import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import CircularTimer from '../components/CircularTimer';

function formatTime(totalSeconds) {
  if (totalSeconds == null) return '--:--';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Charging() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { setActiveSessionId } = useAuth();
  const [session, setSession] = useState(null);
  const [stopping, setStopping] = useState(false);
  const pollRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await sessionApi.status(sessionId);
      setSession(res.data);
      if (res.data.status === 'completed' || res.data.status === 'stopped') {
        clearInterval(pollRef.current);
        // Session's over — remove the "Charging" tab from the nav bar
        setActiveSessionId(null);
      }
    } catch (err) {
      // retry on next poll
    }
  };

  useEffect(() => {
    // If someone lands on this page directly (e.g. refresh), make sure the
    // nav bar knows about this session too, in case it wasn't set yet.
    setActiveSessionId(sessionId);
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
  // progress: 1 = just started (full ring), 0 = time's up (ring emptied)
  const progress = session?.duration_minutes
    ? (session.secondsRemaining || 0) / (session.duration_minutes * 60)
    : 0;

  const ringColor = isDone ? '#2563eb' : '#00c853';

  return (
    <div className="center-screen">
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center', padding: 20 }}>
        <p className="muted small" style={{ letterSpacing: 2, marginBottom: 20 }}>
          {isDone ? 'CHARGING COMPLETE' : 'CHARGING'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <CircularTimer
            progress={progress}
            label={isDone ? '✓' : formatTime(session?.secondsRemaining)}
            sublabel={isDone ? 'DONE' : 'TIME REMAINING'}
            color={ringColor}
          />
        </div>

        {isDone && (
          <>
            <p style={{ marginBottom: session?.end_reason === 'full_charge' ? 4 : 20 }}>
              {session?.end_reason === 'full_charge'
                ? '🔋 Your vehicle reached full charge — we stopped automatically.'
                : 'You can collect your vehicle now.'}
            </p>
            {session?.refund_amount > 0 && (
              <p style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 20 }}>
                ₹{session.refund_amount} refunded for unused time
              </p>
            )}
          </>
        )}

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
