import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './HorizontalNavbar.css';
import logo from '../logo.svg'; // Importing the logo from the src folder
import Profile from './Profile';

const HorizontalNavbar = () => {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // This is an example user. In a real app, this would come from your state management or an API call.
  const user = {
    username: 'JohnDoe',
    profilePic: 'https://randomuser.me/api/portraits/men/75.jpg',
    // To test the fallback, set profilePic to null:
    // profilePic: null
  };

  const toggleProfileVisibility = () => {
    setIsProfileVisible(!isProfileVisible);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const profilePic = user?.profilePic;
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

        {/* Profile Icon */}
        <div className="navbar-profile" onClick={toggleProfileVisibility}>
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="profile-icon-img" />
          ) : (
            <div className="profile-icon-initials">
              {getInitials(username)}
            </div>
          )}
        </div>
      </nav>
      {isProfileVisible && (
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