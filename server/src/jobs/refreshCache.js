const cron = require('node-cron');
const { fetchLeaderboardPage } = require('../services/leaderboardService');
const { deleteCache } = require('../services/cacheService');

const startCacheWarmingJob = () => {
  cron.schedule('0 * * * * *', async () => {
    try {
      await deleteCache('leaderboard:global:all:1:10');
      await fetchLeaderboardPage({ scope: 'global', college: null, page: 1, limit: 10 });
      console.log('[cache warm] global leaderboard refreshed');
    } catch (err) {
      console.error('[cache warm] failed:', err.message);
    }
  });
};

module.exports = startCacheWarmingJob;