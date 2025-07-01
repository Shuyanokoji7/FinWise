import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose, userEmail, startStep }) => {
  const [step, setStep] = useState(startStep || 'email'); // 'email', 'otp', 'reset', 'done'
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [resolvedEmail, setResolvedEmail] = useState(userEmail || '');

  // On open, if userEmail is provided, use it
  useEffect(() => {
    if (isOpen) {
      if (userEmail) {
        // If user is logged in, send OTP immediately and go to OTP step
        setResolvedEmail(userEmail);
        setStep('otp');
        setMessage(''); // Clear any previous message
        setIsSubmitting(true);
        axios.post('http://localhost:8000/api/userauth/forgot-password/send-otp/', { email_or_username: userEmail })
          .then(() => {
            setMessage('OTP sent! Please check your email.');
          })
          .catch(() => {
            setMessage('Failed to send OTP. Please try again.');
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      } else {
        setStep('email');
        setResolvedEmail('');
        setMessage('');
      }
    }
    // eslint-disable-next-line
  }, [isOpen, userEmail]);

  // For logged-in users, send OTP directly
  const handleSendOtpForLoggedIn = async (email) => {
    setIsSubmitting(true);
    setMessage('');
    try {
      await axios.post('http://localhost:8000/api/userauth/forgot-password/send-otp/', { email_or_username: email });
      setMessage('OTP sent! Please check your email.');
    } catch (error) {
      setMessage('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!emailOrUsername) {
      setMessage('Please enter your email or username');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post('http://localhost:8000/api/userauth/forgot-password/send-otp/', { email_or_username: emailOrUsername });
      setResolvedEmail(res.data.email); // Always use the backend's email!
      setStep('otp');
      setMessage('OTP sent! Please check your email.');
    } catch (error) {
      setMessage('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!otp) {
      setMessage('Please enter the OTP sent to your email.');
      return;
    }
    setIsSubmitting(true);
    try {
      // OTP verification
      await axios.post('http://localhost:8000/api/userauth/forgot-password/verify-otp/', { email: resolvedEmail, otp });
      setStep('reset');
      setMessage('OTP verified! Now set your new password.');
    } catch (error) {
      setMessage('Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!newPassword || !confirmPassword) {
      setMessage('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Password reset
      await axios.post('http://localhost:8000/api/userauth/forgot-password/reset/', { email: resolvedEmail, new_password: newPassword });
      setStep('done');
      setMessage('Password reset successful! You can now log in.');
      setTimeout(() => {
        onClose();
        setStep('email');
        setEmailOrUsername('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage('');
        setResolvedEmail('');
      }, 2500);
    } catch (error) {
      setMessage('Failed to reset password. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Forgot Password</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {step === 'email' && !userEmail && (
          <form onSubmit={handleSendOtp} className="forgot-password-form">
            <p className="form-description">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
            <div className="form-group">
              <label htmlFor="email">Email or Username</label>
              <input
                type="text"
                id="emailOrUsername"
                value={emailOrUsername}
                onChange={e => setEmailOrUsername(e.target.value)}
                placeholder="Enter your email or username"
                required
                disabled={isSubmitting}
              />
            </div>
            {message && <div className={`message ${message.includes('OTP sent') ? 'success' : 'error'}`}>{message}</div>}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="forgot-password-form">
            <p className="form-description">
              Enter the OTP sent to your email.
            </p>
            <div className="form-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
                disabled={isSubmitting}
              />
            </div>
            {message && <div className={`message ${message.includes('verified') ? 'success' : 'error'}`}>{message}</div>}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <p className="form-description">
              Enter your new password.
            </p>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isSubmitting}
              />
            </div>
            {message && <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</div>}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="forgot-password-form">
            <p className="success-message">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;