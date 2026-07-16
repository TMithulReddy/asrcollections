import ProductGridSkeleton from "@/components/ui/ProductGridSkeleton";

export default function Loading() {
  return (
    <div className="w-full">
      {/* Hero section solid block */}
      <div className="w-full bg-brand-blushDark animate-pulse" style={{ aspectRatio: "16/5", minHeight: "300px" }} />

      {/* Category tiles row of 4 */}
      <section className="w-full bg-brand-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center rounded-lg border border-brand-blushDark bg-brand-white px-3 py-5 h-[104px]">
                <div className="h-7 w-7 rounded-full bg-brand-blushDark animate-pulse" />
                <div className="mt-3 h-4 w-20 rounded bg-brand-blushDark animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative border block equivalent */}
      <div className="w-full h-8 bg-brand-white border-y border-brand-blushDark" />

      {/* Product card grid skeleton (2x4 / 8 items) */}
      <section className="w-full bg-brand-blush">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="h-8 w-48 rounded bg-brand-blushDark animate-pulse mb-6" />
          <ProductGridSkeleton count={8} />
        </div>
      </section>
    </div>
  );
}
