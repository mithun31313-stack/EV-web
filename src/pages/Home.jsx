import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi, RAZORPAY_KEY_ID } from '../api/client';
import { useAuth } from '../context/AuthContext';

const QUICK_AMOUNTS = [20, 50, 100, 200];
const STATION_ID = 1; // TODO: replace with a real station picker

export default function Home() {
  const { user, activeSessionId, setActiveSessionId } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startCharging = async () => {
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Please enter how much you want to pay');
      return;
    }
    setLoading(true);
    try {
      const createRes = await sessionApi.create(STATION_ID, amt);
      const { sessionId, razorpayOrderId, amount: orderAmount } = createRes.data;

      if (!window.Razorpay) {
        setError('Razorpay script did not load — check your internet connection or ad blocker.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: Math.round(orderAmount * 100),
        currency: 'INR',
        name: 'Techno Project Hub',
        description: 'EV Wireless Charging Session',
        order_id: razorpayOrderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#00c853' },
        handler: async function (response) {
          try {
            await sessionApi.verifyPayment({
              sessionId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Remember this session so the nav bar can get back to it from anywhere
            setActiveSessionId(sessionId);
            navigate(`/charging/${sessionId}`);
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      });

      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not start session');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 540 }}>
      <h2 style={{ marginBottom: 2 }}>Hi, {user?.name?.split(' ')[0] || 'there'} 👋</h2>
      <p className="muted" style={{ marginTop: 0 }}>Ready to charge your vehicle?</p>

      {activeSessionId && (
        <div className="card" style={{ borderColor: 'var(--accent)' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>⚡ You have a charging session in progress</p>
          <p className="muted small" style={{ margin: '4px 0 12px' }}>
            Pick up where you left off.
          </p>
          <button className="btn" onClick={() => navigate(`/charging/${activeSessionId}`)}>
            View Live Charging
          </button>
        </div>
      )}

      <div className="card">
        <p className="muted small" style={{ margin: 0 }}>STATION</p>
        <h3 style={{ margin: '6px 0 4px' }}>Techno Hub — Station #1</h3>
        <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, margin: 0 }}>● Available</p>
      </div>

      <h4 style={{ marginBottom: 10 }}>How much do you want to pay?</h4>

      <div>
        {QUICK_AMOUNTS.map((val) => (
          <span
            key={val}
            className={`chip ${amount === String(val) ? 'active' : ''}`}
            onClick={() => setAmount(String(val))}
          >
            ₹{val}
          </span>
        ))}
      </div>

      <input
        className="input"
        placeholder="Or enter custom amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
      />

      {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

      <button className="btn" onClick={startCharging} disabled={loading}>
        {loading ? 'Opening payment…' : 'Pay & Start Charging'}
      </button>

      <p className="muted small" style={{ textAlign: 'center', fontStyle: 'italic' }}>
        Test mode — card 4386 2894 0766 0153, any future expiry, any CVV
      </p>

      <button className="btn btn-outline" onClick={() => navigate('/history')}>
        View Session History
      </button>
    </div>
  );
}
