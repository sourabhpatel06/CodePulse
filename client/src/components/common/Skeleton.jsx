export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
      <SkeletonBlock className="h-4 w-1/3" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonStatCards({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <SkeletonBlock className="h-3 w-20 mb-3" />
          <SkeletonBlock className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <SkeletonBlock className="h-4 w-1/4 mb-4" />
      <SkeletonBlock className="h-64 w-full" />
    </div>
  );
}

export function SkeletonRows({ count = 5 }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex items-center gap-4">
          <SkeletonBlock className="h-3 w-8" />
          <SkeletonBlock className="h-3 flex-1" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}