import { useState } from 'react';
import useLeaderboard from '../hooks/useLeaderboard';
import useAuthStore from '../store/authStore';
import Navbar from '../components/layout/Navbar';
import { SkeletonRows } from '../components/common/Skeleton';

export default function Leaderboard() {
  const user = useAuthStore((s) => s.user);
  const [scope, setScope] = useState('global');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, isFetching } = useLeaderboard({ scope, page });

  const switchScope = (s) => {
    setScope(s);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Navbar />

        <div className="mb-6">
          <h1 className="text-xl font-medium text-slate-900">Leaderboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Score = solved problems (weighted by difficulty) + a rating bonus where available. Refreshes every 30s.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => switchScope('global')}
            className={`text-sm font-medium rounded-lg px-3 py-1.5 ${scope === 'global' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            Global
          </button>
          <button
            onClick={() => switchScope('college')}
            disabled={!user?.college}
            title={!user?.college ? 'Set a college in your profile first' : ''}
            className={`text-sm font-medium rounded-lg px-3 py-1.5 disabled:opacity-40 ${scope === 'college' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            My college
          </button>
          {isFetching && !isLoading && <span className="text-xs text-slate-400 ml-2">Updating…</span>}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading && (
            <div>
              <div className="bg-slate-50 px-4 py-2.5 text-xs text-slate-400">Loading rankings…</div>
              <SkeletonRows count={6} />
            </div>
          )}
          {isError && <p className="p-6 text-sm text-red-600">{error?.response?.data?.message || 'Failed to load'}</p>}

          {!isLoading && data && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5">Rank</th>
                  <th className="text-left px-4 py-2.5">Name</th>
                  <th className="text-left px-4 py-2.5 hidden sm:table-cell">College</th>
                  <th className="text-right px-4 py-2.5">Score</th>
                  <th className="text-right px-4 py-2.5 hidden sm:table-cell">Solved</th>
                  <th className="text-right px-4 py-2.5 hidden sm:table-cell">Avg rating</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.userId} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 text-slate-500">#{row.rank}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-2.5 text-slate-500 hidden sm:table-cell">{row.college || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-indigo-600">{row.compositeScore}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600 hidden sm:table-cell">{row.totalSolved}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600 hidden sm:table-cell">{row.avgRating || '—'}</td>
                  </tr>
                ))}
                {data.rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No results yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1} className="text-sm text-slate-600 disabled:opacity-30">
              ← Prev
            </button>
            <span className="text-sm text-slate-500">Page {data.page} of {data.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(p + 1, data.totalPages))} disabled={page >= data.totalPages} className="text-sm text-slate-600 disabled:opacity-30">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}