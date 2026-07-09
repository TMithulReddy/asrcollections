export default function CategoryEmptyState() {
  return (
    <div
      className="hidden rounded-lg border border-brand-blushDark bg-brand-blush px-4 py-12 text-center"
      aria-hidden="true"
    >
      <p className="font-heading text-lg text-brand-plum">
        No sarees match your filters
      </p>
      <p className="mt-2 text-sm text-brand-rose">
        Try adjusting your fabric or price range selections.
      </p>
    </div>
  );
}
