import ProductGridSkeleton from "@/components/ui/ProductGridSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 w-full">
      <header>
        <div className="h-8 w-48 rounded bg-brand-blushDark animate-pulse mb-2" />
        <div className="h-4 w-24 rounded bg-brand-blushDark animate-pulse" />
      </header>

      {/* Row of filter bar placeholders (3 rounded rectangles) */}
      <div className="mt-6 mb-6 flex items-center gap-2 overflow-hidden">
        <div className="h-10 w-24 rounded-full bg-brand-blushDark animate-pulse shrink-0" />
        <div className="h-10 w-24 rounded-full bg-brand-blushDark animate-pulse shrink-0" />
        <div className="h-10 w-24 rounded-full bg-brand-blushDark animate-pulse shrink-0" />
      </div>

      <ProductGridSkeleton count={8} />
    </div>
  );
}
