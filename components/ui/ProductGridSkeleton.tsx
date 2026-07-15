export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="w-full rounded-lg bg-brand-blushDark animate-pulse" style={{ aspectRatio: "3/4" }} />
          <div className="h-4 w-3/4 rounded bg-brand-blushDark animate-pulse" />
          <div className="h-4 w-1/4 rounded bg-brand-blushDark animate-pulse" />
        </div>
      ))}
    </div>
  );
}
