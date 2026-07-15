import Button from "@/components/ui/Button";

export default function CategoryEmptyState() {
  return (
    <div
      className="mt-8 flex flex-col items-center justify-center rounded-lg border border-brand-blushDark bg-brand-blush px-4 py-16 text-center"
    >
      <p className="font-heading text-xl text-brand-plum">
        Nothing matches just yet
      </p>
      <p className="mt-3 max-w-sm text-sm text-brand-rose">
        We&apos;re constantly adding new pieces, but we don&apos;t have exactly what you&apos;re looking for right now. Try adjusting your fabric or price range.
      </p>
      <div className="mt-6">
        <Button variant="primary" href="/sarees">
          Clear filters
        </Button>
      </div>
    </div>
  );
}
