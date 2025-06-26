import axios from 'axios';

const API_URL = 'http://localhost:8000/api/userauth/';

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

// Mock user profile for frontend testing
const mockUser = {
    id: 1,
    username: 'johndoe',
    email: 'johndoe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    bio: 'Investor. Tech enthusiast. Coffee lover.',
    joined: '2023-01-15T10:30:00Z',
    profile_pic: 'https://randomuser.me/api/portraits/men/32.jpg',
};

export const getUserProfile = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data: mockUser }), 500);
    });
};

export const updateUserProfile = (profileData) => {
    Object.assign(mockUser, profileData);
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data: mockUser }), 500);
    });
};

export const uploadProfilePic = (file) => {
    // Simulate upload and return a new random image
    mockUser.profile_pic = 'https://randomuser.me/api/portraits/men/' + (Math.floor(Math.random() * 99) + 1) + '.jpg';
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data: { profile_pic: mockUser.profile_pic } }), 1000);
    });
};

export const changePassword = ({ oldPassword, newPassword }) => {
    // Simulate password change
    if (oldPassword === 'wrong') {
        return Promise.reject({ response: { data: { message: 'Incorrect current password.' } } });
    }
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data: { message: 'Password changed successfully.' } }), 1000);
    });
};

export const forgotPassword = (email) => {
    // Simulate forgot password
    if (email !== mockUser.email) {
        return Promise.reject({ response: { data: { message: 'Email not found.' } } });
    }
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data: { message: 'Password reset link sent to your email.' } }), 1000);
    });
};
