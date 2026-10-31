export const getCombinedDifficulty = (stats) => {
  const totals = { easy: 0, medium: 0, hard: 0 };
  stats.forEach((s) => {
    totals.easy += s.difficultyBreakdown?.easy || 0;
    totals.medium += s.difficultyBreakdown?.medium || 0;
    totals.hard += s.difficultyBreakdown?.hard || 0;
  });
  return [
    { name: 'Easy', value: totals.easy },
    { name: 'Medium', value: totals.medium },
    { name: 'Hard', value: totals.hard },
  ];
};

export const getMergedHeatmap = (stats) => {
  const counts = {};
  stats.forEach((s) => {
    (s.submissionHeatmap || []).forEach(({ date, count }) => {
      counts[date] = (counts[date] || 0) + count;
    });
  });
  return counts;
};

export const getMultiPlatformRatingHistory = (stats) => {
  const platforms = ['codeforces', 'leetcode', 'codechef'];
  const rowsByTimestamp = new Map();

  platforms.forEach((platform) => {
    const s = stats.find((s) => s.platform === platform);
    (s?.ratingHistory || []).forEach((r) => {
      const ts = new Date(r.date).getTime();
      if (isNaN(ts)) return;
      if (!rowsByTimestamp.has(ts)) {
        rowsByTimestamp.set(ts, {
          timestamp: ts,
          date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' }),
        });
      }
      rowsByTimestamp.get(ts)[platform] = r.rating;
    });
  });

  return Array.from(rowsByTimestamp.values()).sort((a, b) => a.timestamp - b.timestamp);
};