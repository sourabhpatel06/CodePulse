const PLATFORM_LABELS = { codeforces: 'Codeforces', leetcode: 'LeetCode', codechef: 'CodeChef' };

export default function StatCards({ stats }) {
  const totalSolved = stats.reduce((sum, s) => sum + (s.solvedCount || 0), 0);
  const ratedPlatforms = stats.filter((s) => s.rating > 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs text-slate-500">Total solved</p>
        <p className="text-2xl font-medium text-slate-900 mt-1">{totalSolved}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs text-slate-500">Ratings</p>
        {ratedPlatforms.length === 0 ? (
          <p className="text-2xl font-medium text-slate-900 mt-1">—</p>
        ) : (
          <div className="mt-1.5 space-y-0.5">
            {ratedPlatforms.map((s) => (
              <p key={s.platform} className="text-sm text-slate-700">
                <span className="text-slate-400">{PLATFORM_LABELS[s.platform]}:</span>{' '}
                <span className="font-medium">{s.rating}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs text-slate-500">Platforms connected</p>
        <p className="text-2xl font-medium text-slate-900 mt-1">{stats.length} / 3</p>
      </div>
    </div>
  );
}