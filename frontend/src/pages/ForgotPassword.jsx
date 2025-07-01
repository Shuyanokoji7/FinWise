import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/userauth/forgot-password/send-otp/', { email });
      setStep('otp');
      setSuccess('OTP sent! Please check your email.');
    } catch (err) {
      setError('Failed to send OTP. Make sure the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/userauth/forgot-password/verify-otp/', { email, otp });
      setStep('reset');
      setSuccess('OTP verified! Now set your new password.');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/userauth/forgot-password/reset/', { email, new_password: newPassword });
      setSuccess('Password reset successful! You can now log in.');
      setStep('done');
    } catch (err) {
      setError('Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <h2>Forgot Password</h2>
      {step === 'email' && (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
      )}

      {step === 'done' && (
        <div>
          <p className="success-message">{success}</p>
          <a href="/login">Go to Login</a>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;