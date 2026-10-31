const axios = require('axios');

const BASE = 'https://codeforces.com/api';

const fetchInfo = async (handle) => {
  const { data } = await axios.get(`${BASE}/user.info`, { params: { handles: handle } });
  if (data.status !== 'OK') throw new Error('Codeforces user not found');
  return data.result[0];
};

const fetchRatingHistory = async (handle) => {
  const { data } = await axios.get(`${BASE}/user.rating`, { params: { handle } });
  if (data.status !== 'OK') return [];
  return data.result.map((c) => ({
    date: new Date(c.ratingUpdateTimeSeconds * 1000),
    rating: c.newRating,
    contestName: c.contestName,
  }));
};

const fetchSubmissions = async (handle) => {
  const { data } = await axios.get(`${BASE}/user.status`, { params: { handle, from: 1, count: 10000 } });
  if (data.status !== 'OK') return [];
  return data.result;
};

const dedupedSolved = (submissions) => {
  const solved = new Map();
  submissions.forEach((s) => {
    if (s.verdict !== 'OK') return;
    const key = `${s.problem.contestId}-${s.problem.index}`;
    if (!solved.has(key)) solved.set(key, s.problem);
  });
  return solved;
};

const buildDifficultyBreakdown = (solvedProblems) => {
  const buckets = { easy: 0, medium: 0, hard: 0 };
  solvedProblems.forEach((p) => {
    if (!p.rating) return;
    if (p.rating <= 1200) buckets.easy++;
    else if (p.rating <= 1900) buckets.medium++;
    else buckets.hard++;
  });
  return buckets;
};

const buildTopicBreakdown = (solvedProblems) => {
  const counts = {};
  solvedProblems.forEach((p) => {
    (p.tags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return Object.entries(counts).map(([tag, count]) => ({ tag, count }));
};

const buildHeatmap = (submissions) => {
  const counts = {};
  submissions.forEach((s) => {
    if (s.verdict !== 'OK') return;
    const date = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    counts[date] = (counts[date] || 0) + 1;
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
};

const getNormalizedStats = async (handle) => {
  const [info, ratingHistory, submissions] = await Promise.all([
    fetchInfo(handle),
    fetchRatingHistory(handle),
    fetchSubmissions(handle),
  ]);

  const solved = dedupedSolved(submissions);
  const solvedProblems = Array.from(solved.values());

  return {
    platform: 'codeforces',
    handle,
    rating: info.rating || 0,
    maxRating: info.maxRating || 0,
    rank: info.rank || 'unrated',
    solvedCount: solved.size,
    ratingHistory,
    difficultyBreakdown: buildDifficultyBreakdown(solvedProblems),
    topicBreakdown: buildTopicBreakdown(solvedProblems),
    submissionHeatmap: buildHeatmap(submissions),
    syncStatus: 'ok',
    syncError: null,
  };
};

module.exports = { getNormalizedStats };