import axios from 'axios';

const API_URL = 'http://localhost:8000/api/userauth/';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const register = (username, email, password) => {
    return axios.post(API_URL + 'register/', {
        username,
        email,
        password
    });
};

export const login = (username, password) => {
    return axios.post(API_URL + 'login/', {
        username,
        password
    });
};

export const getUserProfile = () =>
  axios.get(`${API_URL}profile/`, getAuthHeaders());

export const updateUserProfile = (data) => {
  const formData = new FormData();
  if (data.first_name !== undefined) formData.append('first_name', data.first_name);
  if (data.last_name !== undefined) formData.append('last_name', data.last_name);
  if (data.bio !== undefined) formData.append('bio', data.bio);
  if (data.profile_pic instanceof File) formData.append('profile_pic', data.profile_pic);

  return axios.put('/api/userauth/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadProfilePic = (file) => {
  const formData = new FormData();
  formData.append('profile_pic', file);
  return axios.post(`${API_URL}profile/pic/`, formData, {
    ...getAuthHeaders(),
    headers: {
      ...getAuthHeaders().headers,
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const changePassword = ({ oldPassword, newPassword }) =>
  axios.post(`${API_URL}change-password/`, { old_password: oldPassword, new_password: newPassword }, getAuthHeaders());

export const forgotPassword = (email) =>
  axios.post(`${API_URL}forgot-password/`, { email });

export const registerRequest = (username, email) =>
  axios.post(API_URL + 'register-request/', { username, email });

export const verifyRegistrationOtp = (email, otp, password, confirmPassword) =>
  axios.post(API_URL + 'verify-registration-otp/', { email, otp, password, confirmPassword });
