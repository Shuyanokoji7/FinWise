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
