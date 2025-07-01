import React, { useState, useEffect, useRef } from 'react';
import { getUserProfile, updateUserProfile, uploadProfilePic, changePassword, forgotPassword } from '../api/userauth';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [picUploading, setPicUploading] = useState(false);
  const [picError, setPicError] = useState('');
  const [picSuccess, setPicSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [showChangePwCard, setShowChangePwCard] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUserProfile();
      setUser(response.data);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setSuccess('');
    setError('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData(user);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await updateUserProfile(formData);
      setUser(response.data);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePicClick = () => {
    if (editMode && fileInputRef.current) fileInputRef.current.click();
  };

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicUploading(true);
    setPicError('');
    setPicSuccess('');
    try {
      const response = await uploadProfilePic(file);
      setUser(prev => ({ ...prev, profile_pic: response.data.profile_pic }));
      setFormData(prev => ({ ...prev, profile_pic: response.data.profile_pic }));
      setPicSuccess('Profile picture updated!');
    } catch (err) {
      setPicError('Failed to upload profile picture');
    } finally {
      setPicUploading(false);
    }
  };

  // Password change logic
  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      setPwLoading(false);
      return;
    }
    try {
      await changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password changed successfully!');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  // Forgot password logic
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      await forgotPassword(forgotEmail);
      setForgotSuccess('Password reset link sent to your email.');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setForgotLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-pic-section">
            <div className={`profile-pic-wrapper${editMode ? ' editable' : ''}`} onClick={handlePicClick} title={editMode ? 'Click to change profile picture' : ''}>
              <img src={formData.profile_pic || '/default-avatar.png'} alt="Profile" className="profile-pic" />
              {picUploading && <div className="pic-uploading-spinner"></div>}
              {editMode && <div className="profile-pic-overlay">Change</div>}
            </div>
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handlePicChange} />
          </div>
          <h1>{formData.first_name} {formData.last_name}</h1>
          <p>@{formData.username}</p>
          <p className="profile-bio">{formData.bio}</p>
        </div>
        {picError && <div className="error-message">{picError}</div>}
        {picSuccess && <div className="success-message">{picSuccess}</div>}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-row">
            <label>Username</label>
            <input type="text" name="username" value={formData.username || ''} disabled />
          </div>
          <div className="profile-row">
            <label>Email</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} disabled={!editMode} />
          </div>
          <div className="profile-row">
            <label>First Name</label>
            <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} disabled={!editMode} />
          </div>
          <div className="profile-row">
            <label>Last Name</label>
            <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} disabled={!editMode} />
          </div>
          <div className="profile-row">
            <label>Bio</label>
            <textarea name="bio" value={formData.bio || ''} onChange={handleChange} disabled={!editMode} rows={3} />
          </div>
          <div className="profile-row">
            <label>Joined</label>
            <input type="text" value={formData && formData.date_joined ? new Date(formData.date_joined).toLocaleDateString() : ''} disabled />
          </div>
          <div className="profile-actions">
            {!editMode ? (
              <button type="button" className="edit-btn" onClick={handleEdit}>Edit Profile</button>
            ) : (
              <>
                <button type="submit" className="save-btn" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" className="cancel-btn" onClick={handleCancel} disabled={saving}>Cancel</button>
              </>
            )}
          </div>
        </form>
        <div className="profile-actions" style={{ marginTop: 24, marginBottom: 0, justifyContent: 'center' }}>
          <button type="button" className="change-password-btn" onClick={() => setShowChangePwCard(true)}>
            Change Password
          </button>
        </div>
      </div>
      {showChangePwCard && <div className="change-password-overlay"></div>}
      {showChangePwCard && (
        <div className="change-password-section">
          <div className="change-password-header">
            <h2>Change Password</h2>
            <button className="close-pw-card-btn" onClick={() => setShowChangePwCard(false)} title="Close">×</button>
          </div>
          {pwError && <div className="error-message">{pwError}</div>}
          {pwSuccess && <div className="success-message">{pwSuccess}</div>}
          <form className="change-password-form" onSubmit={handleChangePassword}>
            <div className="profile-row">
              <label>Current Password</label>
              <input type={showPassword ? 'text' : 'password'} name="oldPassword" value={pwForm.oldPassword} onChange={handlePwChange} autoComplete="current-password" required />
            </div>
            <div className="profile-row">
              <label>New Password</label>
              <input type={showPassword ? 'text' : 'password'} name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} autoComplete="new-password" required />
            </div>
            <div className="profile-row">
              <label>Confirm New Password</label>
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={pwForm.confirmPassword} onChange={handlePwChange} autoComplete="new-password" required />
            </div>
            <div className="profile-row">
              <label className="show-password-label">
                <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(v => !v)} /> Show Passwords
              </label>
            </div>
            <div className="profile-actions">
              <button type="submit" className="save-btn" disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Profile;
