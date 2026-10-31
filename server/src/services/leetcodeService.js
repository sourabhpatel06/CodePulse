const axios = require('axios');

const ENDPOINT = 'https://leetcode.com/graphql';

const QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { ranking reputation }
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      submissionCalendar
      tagProblemCounts {
        advanced { tagName problemsSolved }
        intermediate { tagName problemsSolved }
        fundamental { tagName problemsSolved }
      }
    }
  }
`;

const CONTEST_QUERY = `
  query userContestRankingHistory($username: String!) {
    userContestRankingHistory(username: $username) {
      attended
      rating
      ranking
      contest { title startTime }
    }
  }
`;

const HEADERS = (handle) => ({
  'Content-Type': 'application/json',
  Referer: `https://leetcode.com/${handle}/`,
  'User-Agent': 'Mozilla/5.0',
});

const buildHeatmap = (calendarJson) => {
  if (!calendarJson) return [];
  const parsed = JSON.parse(calendarJson);
  return Object.entries(parsed).map(([timestamp, count]) => ({
    date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
    count,
  }));
};

const buildDifficultyBreakdown = (acSubmissionNum = []) => {
  const buckets = { easy: 0, medium: 0, hard: 0 };
  acSubmissionNum.forEach((e) => {
    const key = e.difficulty.toLowerCase();
    if (buckets[key] !== undefined) buckets[key] = e.count;
  });
  return buckets;
};

const buildTopicBreakdown = (tagProblemCounts = {}) => {
  const all = [
    ...(tagProblemCounts.advanced || []),
    ...(tagProblemCounts.intermediate || []),
    ...(tagProblemCounts.fundamental || []),
  ];
  return all.filter((t) => t.problemsSolved > 0).map((t) => ({ tag: t.tagName, count: t.problemsSolved }));
};

const fetchContestHistory = async (handle) => {
  const { data } = await axios.post(
    ENDPOINT,
    { query: CONTEST_QUERY, variables: { username: handle } },
    { headers: HEADERS(handle) }
  );
  const history = data?.data?.userContestRankingHistory || [];
  return history
    .filter((c) => c.attended)
    .map((c) => ({
      date: new Date(c.contest.startTime * 1000),
      rating: Math.round(c.rating),
      contestName: c.contest.title,
    }))
    .sort((a, b) => a.date - b.date);
};

const getNormalizedStats = async (handle) => {
  const [profileRes, contestHistory] = await Promise.all([
    axios.post(ENDPOINT, { query: QUERY, variables: { username: handle } }, { headers: HEADERS(handle) }),
    fetchContestHistory(handle).catch(() => []), // contest history failing shouldn't fail the whole sync
  ]);

  const user = profileRes.data?.data?.matchedUser;
  if (!user) throw new Error('LeetCode user not found');

  const totalSolved =
    (user.submitStatsGlobal?.acSubmissionNum || []).find((e) => e.difficulty === 'All')?.count || 0;

  const latestRating = contestHistory.length ? contestHistory[contestHistory.length - 1].rating : 0;
  const maxRating = contestHistory.length ? Math.max(...contestHistory.map((c) => c.rating)) : 0;

  return {
    platform: 'leetcode',
    handle,
    rating: latestRating,
    maxRating,
    rank: user.profile?.ranking ? `#${user.profile.ranking}` : 'unranked',
    solvedCount: totalSolved,
    ratingHistory: contestHistory,
    difficultyBreakdown: buildDifficultyBreakdown(user.submitStatsGlobal?.acSubmissionNum),
    topicBreakdown: buildTopicBreakdown(user.tagProblemCounts),
    submissionHeatmap: buildHeatmap(user.submissionCalendar),
    syncStatus: 'ok',
    syncError: null,
  };
};

module.exports = { getNormalizedStats };