import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/userauth';
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username === '' || email === '' || password === '' || confirmPassword === '') {
            setError('Please fill in all fields');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email address');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const response = await register(username, email, password);
            setSuccess(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                if (errorData.username) {
                    setError(`Username: ${errorData.username[0]}`);
                } else if (errorData.email) {
                    setError(`Email: ${errorData.email[0]}`);
                } else if (errorData.password) {
                    setError(`Password: ${errorData.password[0]}`);
                } else {
                    setError('An unknown error occurred.');
                }
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
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
                        <h2>USER REGISTRATION</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            {success && <p className="success-message">{success}</p>}
                            <button type="submit" className="register-btn" disabled={loading}>
                                {loading ? 'Registering...' : 'REGISTER'}
                            </button>
                        </form>
                        <div className="login-link">
                            <p>Already have an account? <a href="/login">Login here</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 