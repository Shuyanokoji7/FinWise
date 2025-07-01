import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { registerRequest, verifyRegistrationOtp } from '../api/userauth';
import './Register.css';
import axios from 'axios'; // <-- Add this import

const Register = () => {
    const [step, setStep] = useState('start'); // 'start', 'otp', 'done'
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Registration request (send OTP)
    const handleRegisterRequest = async (e) => {
        e.preventDefault();
        if (username === '' || email === '') {
            setError('Please fill in all fields');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email address');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await registerRequest(username, email);
            setSuccess('OTP sent! Please check your email.');
            setStep('otp');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: OTP verification and password set
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpError('');
        setOtpLoading(true);
        if (!password || !confirmPassword) {
            setOtpError('Please enter and confirm your password');
            setOtpLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setOtpError('Passwords do not match');
            setOtpLoading(false);
            return;
        }
        try {
            await verifyRegistrationOtp(email, otp, password, confirmPassword);
            setSuccess('Registration complete! You can now log in.');
            setStep('done');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setOtpError(err.response.data.error);
            } else {
                setOtpError('Invalid OTP or registration failed. Please try again.');
            }
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="bubbles">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div className="bubble" key={i}></div>
                ))}
            </div>
            <div className="register-container">
                <div className="welcome-section">
                    <img src="/Logo.png" alt="Watermark" className="watermark-img" />
                    <div className="welcome-content">
                        <h1>Create Your Account</h1>
                        <p>
                            Join FinWise today to start building and managing your investment portfolio with our smart tools and insights.
                        </p>
                    </div>
                </div>
                <div className="register-section">
                    <div className="register-form-container">
                        {step === 'start' && (
                            <>
                                <h2>Register</h2>
                                <form onSubmit={handleRegisterRequest}>
                                    <div className="input-group">
                                        <FaUser className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <FaEnvelope className="input-icon" />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {error && <p className="error-message">{error}</p>}
                                    {success && <p className="success-message">{success}</p>}
                                    <button type="submit" className="register-btn" disabled={loading}>
                                        {loading ? 'Sending OTP...' : 'Send OTP'}
                                    </button>
                                </form>
                            </>
                        )}

                        {step === 'otp' && (
                            <>
                                <h2>Verify OTP & Set Password</h2>
                                <form onSubmit={handleVerifyOtp}>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <FaLock className="input-icon" />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <FaLock className="input-icon" />
                                        <input
                                            type="password"
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {otpError && <p className="error-message">{otpError}</p>}
                                    {success && <p className="success-message">{success}</p>}
                                    <button type="submit" className="register-btn" disabled={otpLoading}>
                                        {otpLoading ? 'Verifying...' : 'Register'}
                                    </button>
                                </form>
                            </>
                        )}

                        {step === 'done' && (
                            <>
                                <h2>Registration Complete!</h2>
                                <p className="success-message">You can now log in.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;