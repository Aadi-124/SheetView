export function ShimmerTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-border shadow-card">
      <div className="bg-secondary/80 px-4 py-3">
        <div className="flex gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer h-3 w-20 rounded" />
          ))}
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-8 border-t border-border px-4 py-3"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {Array.from({ length: 5 }).map((_, j) => (
            <div
              key={j}
              className="shimmer h-3 rounded"
              style={{ width: `${60 + Math.random() * 60}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
