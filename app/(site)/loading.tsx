import ProductGridSkeleton from "@/components/ui/ProductGridSkeleton";

export default function HomeLoading() {
  return (
    <>
      {/* Hero banner placeholder */}
      <section className="w-full">
        <div className="w-full bg-brand-blushDark animate-pulse" style={{ aspectRatio: "16/5" }} />
      </section>

      {/* Trust signals placeholder */}
      <section className="w-full border-b border-brand-blushDark bg-brand-white py-4">
        <div className="mx-auto max-w-6xl px-4 flex justify-center gap-12">
          <div className="h-5 w-48 rounded bg-brand-blushDark animate-pulse" />
          <div className="hidden sm:block h-5 w-48 rounded bg-brand-blushDark animate-pulse" />
          <div className="hidden sm:block h-5 w-48 rounded bg-brand-blushDark animate-pulse" />
        </div>
      </section>

      {/* Category tiles placeholder */}
      <section className="w-full bg-brand-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-lg border border-brand-blushDark bg-brand-white px-3 py-5"
              >
                <div className="h-7 w-7 rounded-full bg-brand-blushDark animate-pulse" />
                <div className="mt-3 h-4 w-16 rounded bg-brand-blushDark animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals placeholder */}
      <section className="w-full bg-brand-blush">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="h-8 w-40 rounded bg-brand-blushDark animate-pulse" />
          <div className="mt-6">
            <ProductGridSkeleton count={4} />
          </div>
        </div>
      </section>

      {/* On Sale placeholder */}
      <section className="w-full bg-brand-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="h-8 w-28 rounded bg-brand-blushDark animate-pulse" />
          <div className="mt-6">
            <ProductGridSkeleton count={4} />
          </div>
        </div>
      </section>
    </>
  );
}
