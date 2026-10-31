const axios = require('axios');

const getCodeforcesContests = async () => {
  try {
    const { data } = await axios.get('https://codeforces.com/api/contest.list');
    if (data.status !== 'OK') return [];
    return data.result
      .filter((c) => c.phase === 'BEFORE')
      .map((c) => ({
        platform: 'codeforces',
        name: c.name,
        startTime: new Date(c.startTimeSeconds * 1000),
        durationMinutes: Math.round(c.durationSeconds / 60),
        url: `https://codeforces.com/contests/${c.id}`,
      }));
  } catch (err) {
    console.error('Codeforces contest fetch failed:', err.message);
    return [];
  }
};

const LEETCODE_CONTEST_QUERY = `
  query upcomingContests {
    upcomingContests {
      title
      titleSlug
      startTime
      duration
    }
  }
`;

const getLeetcodeContests = async () => {
  try {
    const { data } = await axios.post(
      'https://leetcode.com/graphql',
      { query: LEETCODE_CONTEST_QUERY },
      {
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://leetcode.com/contest/',
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const contests = data?.data?.upcomingContests || [];
    return contests.map((c) => ({
      platform: 'leetcode',
      name: c.title,
      startTime: new Date(c.startTime * 1000),
      durationMinutes: Math.round(c.duration / 60),
      url: `https://leetcode.com/contest/${c.titleSlug}`,
    }));
  } catch (err) {
    console.error('LeetCode contest fetch failed:', err.message);
    return [];
  }
};

const getUpcomingContests = async () => {
  const [cf, lc] = await Promise.all([getCodeforcesContests(), getLeetcodeContests()]);
  return [...cf, ...lc].sort((a, b) => a.startTime - b.startTime);
};

module.exports = { getUpcomingContests };