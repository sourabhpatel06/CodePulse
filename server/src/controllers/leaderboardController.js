const { fetchLeaderboardPage } = require('../services/leaderboardService');

const getLeaderboard = async (req, res, next) => {
  try {
    const scope = req.query.scope === 'college' ? 'college' : 'global';
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const college = scope === 'college' ? req.user.college : null;
    if (scope === 'college' && !college) {
      return res.status(400).json({ message: 'Set your college in your profile to use college-wise ranking' });
    }

    const data = await fetchLeaderboardPage({ scope, college, page, limit });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard };