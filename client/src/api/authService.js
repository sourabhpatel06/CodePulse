import axiosClient from './axiosClient';

export const registerUser = (data) => axiosClient.post('/auth/register', data);
export const loginUser = (data) => axiosClient.post('/auth/login', data);
export const getMe = () => axiosClient.get('/auth/me');
export const updateProfile = (data) => axiosClient.patch('/auth/me', data);