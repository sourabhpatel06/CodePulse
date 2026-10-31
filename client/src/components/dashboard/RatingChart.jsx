import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PLATFORM_COLORS = {
  codeforces: '#4f46e5',
  leetcode: '#d97706',
  codechef: '#dc2626',
};

const PLATFORM_LABELS = {
  codeforces: 'Codeforces',
  leetcode: 'LeetCode',
  codechef: 'CodeChef',
};

export default function RatingChart({ data }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-medium text-slate-900">Rating history</h3>
        <p className="text-sm text-slate-400 mt-8 text-center">
          No contest history yet — connect a handle with rated contests.
        </p>
      </div>
    );
  }

  const platformsPresent = Object.keys(PLATFORM_COLORS).filter((p) =>
    data.some((row) => row[p] !== undefined)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-sm font-medium text-slate-900">Rating history</h3>
      <p className="text-xs text-slate-500 mt-0.5">Contest rating over time, per platform</p>
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={['dataMin - 100', 'dataMax + 100']} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => PLATFORM_LABELS[value] || value} />
            {platformsPresent.map((platform) => (
              <Line
                key={platform}
                type="monotone"
                dataKey={platform}
                name={platform}
                stroke={PLATFORM_COLORS[platform]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}