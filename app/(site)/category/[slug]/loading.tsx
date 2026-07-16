import ProductGridSkeleton from "@/components/ui/ProductGridSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 w-full">
      <header>
        <div className="h-8 w-48 rounded bg-brand-blushDark animate-pulse mb-2" />
        <div className="h-4 w-24 rounded bg-brand-blushDark animate-pulse" />
      </header>

      {/* Filter bar placeholder */}
      <div className="mt-6 mb-6">
        <div className="h-10 w-full rounded-md bg-brand-blushDark animate-pulse" />
      </div>

      <ProductGridSkeleton count={8} />
    </div>
  );
}
