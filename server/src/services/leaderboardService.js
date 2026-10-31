const PlatformStats = require('../models/PlatformStats');
const { getCache, setCache } = require('./cacheService');

const LEADERBOARD_TTL = 60;

const buildPipeline = ({ college, page, limit }) => [
  {
    $addFields: {
      solvePoints: {
        $add: [
          { $multiply: ['$difficultyBreakdown.easy', 1] },
          { $multiply: ['$difficultyBreakdown.medium', 3] },
          { $multiply: ['$difficultyBreakdown.hard', 5] },
        ],
      },
    },
  },
  {
    $group: {
      _id: '$user',
      totalSolvePoints: { $sum: '$solvePoints' },
      totalSolved: { $sum: '$solvedCount' },
      ratingSum: { $sum: { $cond: [{ $gt: ['$rating', 0] }, '$rating', 0] } },
      ratedPlatformCount: { $sum: { $cond: [{ $gt: ['$rating', 0] }, 1, 0] } },
      platformsConnected: { $sum: 1 },
    },
  },
  {
    $addFields: {
      avgRating: {
        $cond: [{ $gt: ['$ratedPlatformCount', 0] }, { $divide: ['$ratingSum', '$ratedPlatformCount'] }, 0],
      },
    },
  },
  { $addFields: { compositeScore: { $add: ['$totalSolvePoints', { $divide: ['$avgRating', 10] }] } } },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
  { $unwind: '$userInfo' },
  ...(college ? [{ $match: { 'userInfo.college': college } }] : []),
  { $sort: { compositeScore: -1 } },
  {
    $facet: {
      data: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            name: '$userInfo.name',
            college: '$userInfo.college',
            compositeScore: { $round: ['$compositeScore', 1] },
            totalSolved: 1,
            avgRating: { $round: ['$avgRating', 0] },
            platformsConnected: 1,
          },
        },
      ],
      totalCount: [{ $count: 'count' }],
    },
  },
];

const getCacheKey = ({ scope, college, page, limit }) => `leaderboard:${scope}:${college || 'all'}:${page}:${limit}`;

const fetchLeaderboardPage = async ({ scope, college, page, limit }) => {
  const cacheKey = getCacheKey({ scope, college, page, limit });
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, cached: true };

  const [result] = await PlatformStats.aggregate(buildPipeline({ college, page, limit }));
  const rows = (result?.data || []).map((row, i) => ({ ...row, rank: (page - 1) * limit + i + 1 }));
  const total = result?.totalCount?.[0]?.count || 0;

  const payload = { rows, page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1), scope };
  await setCache(cacheKey, payload, LEADERBOARD_TTL);
  return { ...payload, cached: false };
};

module.exports = { fetchLeaderboardPage };