import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectHandles } from '../api/platformService';
import useAuthStore from '../store/authStore';
import Navbar from '../components/layout/Navbar';

export default function ConnectHandles() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    codeforces: user?.handles?.codeforces || '',
    leetcode: user?.handles?.leetcode || '',
    codechef: user?.handles?.codechef || '',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await connectHandles(form);
      setResults(data.results);
    } catch (err) {
      setError(err.response?.data?.message || 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-md mx-auto">
        <Navbar />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-xl font-medium text-slate-900">Connect your handles</h1>
          <p className="text-sm text-slate-500 mt-1">Already-connected handles are prefilled — leave any field blank to skip that platform.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {['codeforces', 'leetcode', 'codechef'].map((platform) => (
              <div key={platform}>
                <label className="text-sm text-slate-700 capitalize">{platform}</label>
                <input
                  name={platform}
                  value={form[platform]}
                  onChange={handleChange}
                  placeholder={`your ${platform} handle`}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-600 text-white text-sm font-medium py-2 hover:bg-indigo-700 disabled:opacity-60">
              {loading ? 'Syncing…' : 'Sync handles'}
            </button>
          </form>

          {results && (
            <div className="mt-6 space-y-2">
              {results.map((r) => (
                <div key={r.platform} className={`text-sm rounded-lg px-3 py-2 ${r.status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <span className="capitalize font-medium">{r.platform}</span>: {r.status === 'ok' ? 'synced' : r.error}
                </div>
              ))}
              <button onClick={() => navigate('/dashboard')} className="text-sm text-indigo-600 font-medium mt-2">
                Go to dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}