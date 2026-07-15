import ProductGridSkeleton from "@/components/ui/ProductGridSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <div className="h-9 w-48 rounded bg-brand-blushDark animate-pulse mb-2" />
        <div className="h-5 w-24 rounded bg-brand-blushDark animate-pulse" />
      </header>
      <div className="mt-6 mb-6 h-12 w-full max-w-full rounded-lg bg-brand-blushDark animate-pulse" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
