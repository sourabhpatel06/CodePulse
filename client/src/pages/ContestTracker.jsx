import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { getContests, getCalendarStatus, startGoogleAuth, addToCalendar } from '../api/contestService';

const PLATFORM_STYLES = {
  codeforces: 'bg-indigo-50 text-indigo-700',
  leetcode: 'bg-amber-50 text-amber-700',
};

export default function ContestTracker() {
  const [searchParams] = useSearchParams();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [addingIndex, setAddingIndex] = useState(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [contestData, statusData] = await Promise.all([getContests(), getCalendarStatus()]);
      setContests(contestData.contests);
      setCalendarConnected(statusData.connected);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (searchParams.get('calendar') === 'connected') setMessage('Google Calendar connected!');
  }, []);

  const handleConnectCalendar = async () => {
    setConnecting(true);
    setError('');
    try {
      const { url } = await startGoogleAuth();
      if (!url) throw new Error('Server did not return an auth URL');
      window.location.href = url;
    } catch (err) {
      console.error('Google auth start failed:', err); // full error object, visible in DevTools console now
      setError(err.response?.data?.message || err.message || 'Could not start Google sign-in');
      setConnecting(false);
    }
  };

  const handleAddToCalendar = async (contest, index) => {
    setAddingIndex(index);
    setMessage('');
    setError('');
    try {
      await addToCalendar(contest);
      setMessage(`Added "${contest.name}" to your calendar`);
    } catch (err) {
      console.error('Add to calendar failed:', err);
      setError(err.response?.data?.message || 'Failed to add to calendar');
    } finally {
      setAddingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Navbar />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Upcoming contests</h1>
            <p className="text-xs text-slate-500 mt-0.5">Codeforces + LeetCode — live from each platform</p>
          </div>
          {calendarConnected ? (
            <span className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5">Calendar connected</span>
          ) : (
            <button
              onClick={handleConnectCalendar}
              disabled={connecting}
              className="text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 disabled:opacity-50"
            >
              {connecting ? 'Redirecting…' : 'Connect Google Calendar'}
            </button>
          )}
        </div>

        {message && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">{message}</p>}
        {error && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}
        {loading && <p className="text-sm text-slate-400">Loading contests…</p>}

        <div className="space-y-3">
          {contests.map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4">
              <div>
                <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${PLATFORM_STYLES[c.platform]}`}>
                  {c.platform}
                </span>
                <p className="text-sm font-medium text-slate-900 mt-1.5">{c.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(c.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {Math.round(c.durationMinutes / 60)}h
                </p>
              </div>
              <button
                onClick={() => handleAddToCalendar(c, i)}
                disabled={!calendarConnected || addingIndex === i}
                title={!calendarConnected ? 'Connect Google Calendar first' : ''}
                className="text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 disabled:opacity-40 shrink-0"
              >
                {addingIndex === i ? 'Adding…' : '+ Remind me'}
              </button>
            </div>
          ))}
          {!loading && contests.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No upcoming contests found right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}