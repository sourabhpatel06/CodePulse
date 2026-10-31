import axiosClient from './axiosClient';

export const getContests = () => axiosClient.get('/contests').then((res) => res.data);
export const getCalendarStatus = () => axiosClient.get('/contests/google/status').then((res) => res.data);
export const startGoogleAuth = () => axiosClient.get('/contests/google/start').then((res) => res.data);
export const addToCalendar = (contest) => axiosClient.post('/contests/add-to-calendar', contest).then((res) => res.data);