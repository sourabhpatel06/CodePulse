import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TopicBreakdown({ stats }) {
  const platformsWithTags = stats.filter((s) => s.topicBreakdown?.length);

  if (!platformsWithTags.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-medium text-slate-900">Topic breakdown</h3>
        <p className="text-sm text-slate-400 mt-8 text-center">No tag data yet — connect Codeforces or LeetCode.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-sm font-medium text-slate-900">Topic breakdown</h3>
      <p className="text-xs text-slate-500 mt-0.5">Shown per platform — tag names aren't standardized across sites</p>
      <div className="mt-4 space-y-6">
        {platformsWithTags.map((s) => {
          const top = [...s.topicBreakdown].sort((a, b) => b.count - a.count).slice(0, 8);
          return (
            <div key={s.platform}>
              <p className="text-xs font-medium text-slate-600 capitalize mb-2">{s.platform}</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                    <YAxis type="category" dataKey="tag" tick={{ fontSize: 11 }} stroke="#94a3b8" width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}