import axiosClient from './axiosClient';

export const getPosts = (params) => axiosClient.get('/community', { params }).then((res) => res.data);
export const createPost = (data) => axiosClient.post('/community', data).then((res) => res.data);
export const toggleLike = (id) => axiosClient.post(`/community/${id}/like`).then((res) => res.data);
export const deletePost = (id) => axiosClient.delete(`/community/${id}`).then((res) => res.data);