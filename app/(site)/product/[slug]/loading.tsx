export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12 w-full">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
        {/* Left: Image skeleton with thumbnails */}
        <div className="flex flex-col gap-4">
          <div className="w-full rounded-lg bg-brand-blushDark animate-pulse" style={{ aspectRatio: "3/4" }} />
          <div className="flex gap-4">
            <div className="w-20 rounded-md bg-brand-blushDark animate-pulse" style={{ aspectRatio: "3/4" }} />
            <div className="w-20 rounded-md bg-brand-blushDark animate-pulse" style={{ aspectRatio: "3/4" }} />
            <div className="w-20 rounded-md bg-brand-blushDark animate-pulse" style={{ aspectRatio: "3/4" }} />
            <div className="w-20 rounded-md bg-brand-blushDark animate-pulse" style={{ aspectRatio: "3/4" }} />
          </div>
        </div>

        {/* Right: Details skeleton */}
        <div className="flex flex-col pt-4">
          {/* Title - 3 stacked pulsing lines */}
          <div className="space-y-3 mb-6">
            <div className="h-6 w-3/4 rounded bg-brand-blushDark animate-pulse" />
            <div className="h-6 w-2/3 rounded bg-brand-blushDark animate-pulse" />
            <div className="h-6 w-1/2 rounded bg-brand-blushDark animate-pulse" />
          </div>
          
          {/* Price - 1 shorter line */}
          <div className="h-6 w-1/4 rounded bg-brand-blushDark animate-pulse mb-8" />
          
          {/* Description block - 4 lines */}
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full rounded bg-brand-blushDark animate-pulse" />
            <div className="h-4 w-full rounded bg-brand-blushDark animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-brand-blushDark animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-brand-blushDark animate-pulse" />
          </div>

          {/* Button placeholders - 2 full-width rectangles */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <div className="h-12 w-full rounded-lg bg-brand-blushDark animate-pulse" />
            <div className="h-12 w-full rounded-lg bg-brand-blushDark animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
