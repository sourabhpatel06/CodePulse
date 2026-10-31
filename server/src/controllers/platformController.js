const User = require('../models/User');
const PlatformStats = require('../models/PlatformStats');
const codeforcesService = require('../services/codeforcesService');
const leetcodeService = require('../services/leetcodeService');
const codechefService = require('../services/codechefService');
const { getCache, setCache, deleteCache } = require('../services/cacheService');

const SERVICES = { codeforces: codeforcesService, leetcode: leetcodeService, codechef: codechefService };
const STATS_TTL = 600;
const statsKey = (userId) => `stats:${userId}`;

const syncPlatform = async (userId, platform, handle) => {
  try {
    const stats = await SERVICES[platform].getNormalizedStats(handle);
    await PlatformStats.findOneAndUpdate(
      { user: userId, platform },
      { ...stats, user: userId, lastSyncedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return { platform, status: 'ok' };
  } catch (err) {
    await PlatformStats.findOneAndUpdate(
      { user: userId, platform },
      { user: userId, platform, handle, syncStatus: 'failed', syncError: err.message, lastSyncedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return { platform, status: 'failed', error: err.message };
  }
};

const connectHandles = async (req, res, next) => {
  try {
    const { codeforces, leetcode, codechef } = req.body;
    const updates = {};
    if (codeforces) updates['handles.codeforces'] = codeforces;
    if (leetcode) updates['handles.leetcode'] = leetcode;
    if (codechef) updates['handles.codechef'] = codechef;

    await User.findByIdAndUpdate(req.user._id, { $set: updates });

    const jobs = [];
    if (codeforces) jobs.push(syncPlatform(req.user._id, 'codeforces', codeforces));
    if (leetcode) jobs.push(syncPlatform(req.user._id, 'leetcode', leetcode));
    if (codechef) jobs.push(syncPlatform(req.user._id, 'codechef', codechef));

    const results = await Promise.all(jobs);
    await deleteCache(statsKey(req.user._id));

    res.json({ results });
  } catch (err) {
    next(err);
  }
};

const getMyStats = async (req, res, next) => {
  try {
    const key = statsKey(req.user._id);
    const cached = await getCache(key);
    if (cached) return res.json({ stats: cached, cached: true });

    const stats = await PlatformStats.find({ user: req.user._id });
    await setCache(key, stats, STATS_TTL);
    res.json({ stats, cached: false });
  } catch (err) {
    next(err);
  }
};

const resync = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const jobs = [];
    ['codeforces', 'leetcode', 'codechef'].forEach((p) => {
      if (user.handles[p]) jobs.push(syncPlatform(user._id, p, user.handles[p]));
    });
    const results = await Promise.all(jobs);
    await deleteCache(statsKey(req.user._id));

    res.json({ results });
  } catch (err) {
    next(err);
  }
};

module.exports = { connectHandles, getMyStats, resync };