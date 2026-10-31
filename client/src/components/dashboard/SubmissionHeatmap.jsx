const getColor = (count) => {
  if (!count) return 'bg-slate-100';
  if (count <= 2) return 'bg-indigo-200';
  if (count <= 4) return 'bg-indigo-400';
  if (count <= 7) return 'bg-indigo-600';
  return 'bg-indigo-800';
};

const buildWeeks = (counts, weekCount = 20) => {
  const today = new Date();
  const days = [];
  for (let i = weekCount * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: counts[key] || 0 });
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
};

export default function SubmissionHeatmap({ counts }) {
  const weeks = buildWeeks(counts);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-sm font-medium text-slate-900">Submission activity</h3>
      <p className="text-xs text-slate-500 mt-0.5">Last 20 weeks, Codeforces + LeetCode combined</p>
      <div className="mt-4 flex gap-1 overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} submissions`}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-slate-100" />
        <div className="w-3 h-3 rounded-sm bg-indigo-200" />
        <div className="w-3 h-3 rounded-sm bg-indigo-400" />
        <div className="w-3 h-3 rounded-sm bg-indigo-600" />
        <div className="w-3 h-3 rounded-sm bg-indigo-800" />
        <span>More</span>
      </div>
    </div>
  );
}