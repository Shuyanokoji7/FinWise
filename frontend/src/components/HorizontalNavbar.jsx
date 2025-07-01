import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './HorizontalNavbar.css';
import logo from '../logo.svg';
import Profile from './Profile';

const HorizontalNavbar = () => {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    if (token) {
      try {
        // Decode JWT payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          username: payload.username || payload.user_name || payload.sub || '',
        });
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const toggleProfileVisibility = () => {
    setIsProfileVisible(!isProfileVisible);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const username = user?.username;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <nav className="navbar">
        {/* Toggle Button */}
        <div className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Logo and Brand Name */}
        <Link to="/home" className="navbar-brand">
          <img src={logo} alt="FinWise Logo" className="navbar-logo" />
          <span>FinWise</span>
        </Link>

        {/* Profile Icon - only show if logged in */}
        {isLoggedIn && user && (
          <div className="navbar-profile" onClick={toggleProfileVisibility}>
            <div className="profile-icon-initials">
              {getInitials(username)}
            </div>
          </div>
        )}
      </nav>
      {isProfileVisible && isLoggedIn && user && (
        <div className="profile-overlay" onClick={toggleProfileVisibility}>
          <div onClick={(e) => e.stopPropagation()}>
            <Profile />
          </div>
        </div>
      )}
    </>
  );
};

export default HorizontalNavbar;