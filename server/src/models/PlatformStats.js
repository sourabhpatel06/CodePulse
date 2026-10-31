const mongoose = require('mongoose');

const platformStatsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    platform: { type: String, enum: ['codeforces', 'leetcode', 'codechef'], required: true },
    handle: { type: String, required: true },
    rating: { type: Number, default: 0 },
    maxRating: { type: Number, default: 0 },
    rank: { type: String, default: '' },
    solvedCount: { type: Number, default: 0 },
    ratingHistory: [{ date: Date, rating: Number, contestName: String }],
    difficultyBreakdown: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    topicBreakdown: [{ tag: String, count: Number }],
    submissionHeatmap: [{ date: String, count: Number }],
    syncStatus: { type: String, enum: ['ok', 'failed'], default: 'ok' },
    syncError: { type: String, default: null },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

platformStatsSchema.index({ user: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('PlatformStats', platformStatsSchema);