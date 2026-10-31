import axiosClient from './axiosClient';

export const connectHandles = (data) => axiosClient.post('/platforms/connect', data);
export const getMyStats = () => axiosClient.get('/platforms/me');
export const resyncStats = () => axiosClient.post('/platforms/resync');