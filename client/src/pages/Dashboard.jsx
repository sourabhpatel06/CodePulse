import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyStats, resyncStats } from '../api/platformService';
import useAuthStore from '../store/authStore';
import Navbar from '../components/layout/Navbar';
import StatCards from '../components/dashboard/StatCards';
import RatingChart from '../components/dashboard/RatingChart';
import DifficultyChart from '../components/dashboard/DifficultyChart';
import TopicBreakdown from '../components/dashboard/TopicBreakdown';
import SubmissionHeatmap from '../components/dashboard/SubmissionHeatmap';
import EmptyState from '../components/common/EmptyState';
import { SkeletonStatCards, SkeletonChart } from '../components/common/Skeleton';
import { getCombinedDifficulty, getMergedHeatmap, getMultiPlatformRatingHistory } from '../utils/statsHelpers';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  const loadStats = async () => {
    try {
      const { data } = await getMyStats();
      setStats(data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleResync = async () => {
    setSyncing(true);
    try {
      await resyncStats();
      await loadStats();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Navbar />

        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Welcome, {user?.name}</h1>
            <p className="text-sm text-slate-500">{user?.college || 'No college set'}</p>
          </div>
          {stats && stats.length > 0 && (
            <button
              onClick={handleResync}
              disabled={syncing}
              className="text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : 'Resync'}
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {!error && !stats && (
          <div className="space-y-6">
            <SkeletonStatCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonChart />
              <SkeletonChart />
            </div>
          </div>
        )}

        {stats && stats.length === 0 && (
          <EmptyState
            title="No platforms connected yet"
            description="Connect Codeforces, LeetCode, or CodeChef to see your stats here."
            action={
              <Link to="/connect" className="text-sm font-medium bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 inline-block">
                Connect your handles
              </Link>
            }
          />
        )}

        {stats && stats.length > 0 && (
          <>
            <StatCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <RatingChart data={getMultiPlatformRatingHistory(stats)} />
              <DifficultyChart data={getCombinedDifficulty(stats)} />
            </div>

            <div className="mt-6">
              <SubmissionHeatmap counts={getMergedHeatmap(stats)} />
            </div>

            <div className="mt-6">
              <TopicBreakdown stats={stats} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}