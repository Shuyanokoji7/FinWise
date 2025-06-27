import React, { useState } from 'react';
import './Profile.css';
import ForgotPasswordModal from './ForgotPasswordModal';

const initialProfile = {
  username: 'johndoe',
  email: 'johndoe@example.com',
  phone: '+1 234 567 8901',
  profilePic: 'https://randomuser.me/api/portraits/men/75.jpg',
};

const recentActivity = [
  'Logged in from new device',
  'Updated portfolio',
  'Changed password',
];

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(profile);
  const [picPreview, setPicPreview] = useState(profile.profilePic);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [picExpanded, setPicExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicPreview(reader.result);
        setForm({ ...form, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePicClick = (e) => {
    // Don't expand if clicking on file input
    if (e.target.type === 'file') return;
    setPicExpanded(!picExpanded);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm(profile);
    setPicPreview(profile.profilePic);
  };

  const handleSave = () => {
    setProfile(form);
    setEditMode(false);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-pic-wrapper">
            <img 
              src={picPreview} 
              alt="Profile" 
              className={`profile-pic ${picExpanded ? 'expanded' : ''}`}
              onClick={handlePicClick}
            />
            {editMode && (
              <input type="file" accept="image/*" onChange={handlePicChange} />
            )}
          </div>
          <div className="profile-info">
            {editMode ? (
              <>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="profile-input"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="profile-input"
                />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="profile-input"
                />
              </>
            ) : (
              <>
                <h2>{profile.username}</h2>
                <p>{profile.email}</p>
                <p>{profile.phone}</p>
              </>
            )}
          </div>
        </div>
        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <>
              <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
              <button className="forgot-btn" onClick={handleForgotPassword}>Forgot Password?</button>
            </>
          )}
        </div>
        <div className="profile-extra">
          <h3>Recent Activity</h3>
          <ul>
            {recentActivity.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
};

export default Profile; 