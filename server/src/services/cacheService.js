const redis = require('../config/redisClient');

const getCache = async (key) => {
  try {
    const raw = await redis.get(key);
    if (raw) {
      redis.incr('metrics:cache:hits').catch(() => {});
      return JSON.parse(raw);
    }
    redis.incr('metrics:cache:misses').catch(() => {});
    return null;
  } catch (err) {
    console.error('Cache get failed, falling back to DB:', err.message);
    return null; // fail open — a broken cache should never break a request
  }
};

const setCache = async (key, value, ttlSeconds) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Cache set failed:', err.message);
  }
};

const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Cache delete failed:', err.message);
  }
};

module.exports = { getCache, setCache, deleteCache };