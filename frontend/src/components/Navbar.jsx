import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaUser, FaChartLine, FaHistory, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    const closeNavbar = () => {
        setIsOpen(false);
        setIsHovered(false);
    };

    const navItems = [
        { path: '/home', name: 'Home', icon: <FaHome /> },
        { path: '/profile', name: 'Profile', icon: <FaUser /> },
        { path: '/portfolio', name: 'Portfolio Builder', icon: <FaChartLine /> },
        { path: '/explorer', name: 'Stock Explorer', icon: <FaSearch /> },
        { path: '/history', name: 'My Portfolios', icon: <FaHistory /> },
    ];

    return (
        <>
            {/* Hamburger Menu Button */}
            <div className="hamburger-container">
                <button 
                    className="hamburger-btn"
                    onClick={toggleNavbar}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Vertical Navbar */}
            <nav 
                className={`vertical-navbar ${isOpen || isHovered ? 'open' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="nav-header">
                    <img src="/Logo.png" alt="FinWise Logo" className="nav-logo" />
                    <h3 className="nav-title">FinWise</h3>
                </div>

                <ul className="nav-menu">
                    {navItems.map((item) => (
                        <li key={item.path} className="nav-item">
                            <Link
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={closeNavbar}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-text">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="nav-footer">
                    <button className="logout-btn" onClick={closeNavbar}>
                        <FaSignOutAlt className="nav-icon" />
                        <span className="nav-text">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Overlay for mobile */}
            {isOpen && <div className="nav-overlay" onClick={closeNavbar}></div>}
        </>
    );
};

export default Navbar;
