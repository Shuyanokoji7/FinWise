import React, { useState, useEffect } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { login } from '../api/userauth';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const saveCookieData = () => {
        if (rememberMe) {
            // Set expiry to 1 month from now
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            const expiryString = expiryDate.toUTCString();
            
            document.cookie = `username=${username}; expires=${expiryString}; path=/`;
            document.cookie = `password=${password}; expires=${expiryString}; path=/`;
        }
    }

    const getCookieData = () => {
        const cookies = document.cookie.split(';');
        let savedUsername = '';
        let savedPassword = '';
        
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name === 'username') {
                savedUsername = value;
            } else if (name === 'password') {
                savedPassword = value;
            }
        });
        
        if (savedUsername) setUsername(savedUsername);
        if (savedPassword) setPassword(savedPassword);
    }

    useEffect(() => {
        getCookieData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username === '' || password === '') {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const response = await login(username, password);
            setSuccess(response.data.message);
            // Save credentials if remember me is checked
            saveCookieData();
            setTimeout(() => {
                navigate('/home');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.non_field_errors) {
                    setError(data.non_field_errors[0]);
                } else {
                    setError("Login failed. Please try again.");
                }
            } else {
                setError("Server error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRememberMeChange = (e) => {
        setRememberMe(e.target.checked);
    };

    return (
        <div className="login-page">
            <div className="bubbles">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div className="bubble" key={i}></div>
                ))}
            </div>
            <div className="login-container">
                <div className="welcome-section">
                    <img src="/Logo.png" alt="Watermark" className="watermark-img" />
                    <div className="welcome-content">
                        <h1>Welcome to FinWise</h1>
                        <p>
                        Build, analyze, and optimize your stock portfolio with FinWise: <br />
                        A personal investment assistant that uses smart insights and custom risk strategies to help you make informed financial decisions.
                        </p>
                    </div>
                </div>
                <div className="login-section">
                    <div className="login-form-container">
                        <h2>USER LOGIN</h2>
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
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="options">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={handleRememberMeChange}
                                    /> Remember me For 1 Month
                                </label>
                                <a href="/forgot-password">Forgot password?</a>
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            {success && <p className="success-message">{success}</p>}
                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? 'Logging In...' : 'Login'}
                            </button>
                        </form>
                        <div className="register-link">
                            <p>Don't have an account? <a href="/register">Register here</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
