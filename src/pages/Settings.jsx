import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

// Small reusable block: request an OTP, then enter it + the new value to confirm.
function OtpChangeBlock({ title, description, purpose, extraField }) {
  const [step, setStep] = useState('idle'); // idle -> sent -> done
  const [extraValue, setExtraValue] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestOtp = async () => {
    setError('');
    setMessage('');
    if (extraField && !extraValue) {
      setError(`Please enter ${extraField.label.toLowerCase()}`);
      return;
    }
    setLoading(true);
    try {
      const payload = { purpose };
      if (purpose === 'change_email') payload.newEmail = extraValue;
      const res = await api.post('/auth/request-otp', payload);
      setMessage(res.data.message);
      setStep('sent');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    if (!otp) {
      setError('Please enter the OTP code');
      return;
    }
    if (purpose === 'change_password' && !extraValue) {
      setError('Please enter a new password');
      return;
    }
    setLoading(true);
    try {
      const payload = { purpose, otp };
      if (purpose === 'change_password') payload.newPassword = extraValue;
      const res = await api.post('/auth/verify-otp', payload);
      setMessage(res.data.message);
      setStep('done');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-section">
      <h4>{title}</h4>
      <p className="muted small" style={{ marginTop: 0 }}>{description}</p>

      {step !== 'done' && purpose === 'change_email' && (
        <input
          className="input"
          type="email"
          placeholder={extraField.label}
          value={extraValue}
          onChange={(e) => setExtraValue(e.target.value)}
          disabled={step === 'sent'}
        />
      )}

      {step === 'idle' && (
        <button className="btn btn-outline" onClick={requestOtp} disabled={loading}>
          {loading ? 'Sending…' : 'Send OTP to my email'}
        </button>
      )}

      {step === 'sent' && (
        <>
          <input
            className="input"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          {purpose === 'change_password' && (
            <input
              className="input"
              type="password"
              placeholder="New Password"
              value={extraValue}
              onChange={(e) => setExtraValue(e.target.value)}
            />
          )}
          <button className="btn" onClick={verifyOtp} disabled={loading}>
            {loading ? 'Verifying…' : 'Confirm'}
          </button>
          <button className="btn btn-outline" onClick={requestOtp} disabled={loading}>
            Resend OTP
          </button>
        </>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
      {message && <p style={{ color: 'var(--accent)', fontSize: 13 }}>{message}</p>}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ maxWidth: 540 }}>
      <h2>Settings</h2>

      <div className="card">
        <p className="muted small" style={{ margin: 0 }}>ACCOUNT</p>
        <p style={{ fontWeight: 700, margin: '6px 0 2px' }}>{user?.name}</p>
        <p className="muted small" style={{ margin: 0 }}>{user?.email}</p>
      </div>

      <div className="card">
        <OtpChangeBlock
          title="Change Email"
          description="We'll send a code to your current email to confirm the change."
          purpose="change_email"
          extraField={{ label: 'New Email Address' }}
        />
        <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)', margin: '20px 0' }} />
        <OtpChangeBlock
          title="Change Password"
          description="We'll send a code to your email to confirm the change."
          purpose="change_password"
        />
      </div>
    </div>
  );
}
