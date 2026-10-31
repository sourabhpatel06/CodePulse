import axiosClient from './axiosClient';

export const getLeaderboard = (params) =>
  axiosClient.get('/leaderboard', { params }).then((res) => res.data);