export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12 w-full">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
        {/* Left: Image placeholder */}
        <div className="w-full rounded-lg bg-brand-blushDark animate-pulse" style={{ aspectRatio: "3/4" }} />

        {/* Right: Details placeholder */}
        <div className="flex flex-col pt-4">
          {/* Title */}
          <div className="h-8 w-3/4 rounded bg-brand-blushDark animate-pulse mb-4" />
          
          {/* Price */}
          <div className="h-6 w-1/4 rounded bg-brand-blushDark animate-pulse mb-2" />
          
          {/* Fabric Type */}
          <div className="h-5 w-1/3 rounded bg-brand-blushDark animate-pulse mb-8" />
          
          {/* Description block (multi-line) */}
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full rounded bg-brand-blushDark animate-pulse" />
            <div className="h-4 w-full rounded bg-brand-blushDark animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-brand-blushDark animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-brand-blushDark animate-pulse" />
          </div>

          {/* Button placeholders */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8">
            <div className="h-12 w-full rounded-lg bg-brand-blushDark animate-pulse" />
            <div className="h-12 w-full rounded-lg bg-brand-blushDark animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
