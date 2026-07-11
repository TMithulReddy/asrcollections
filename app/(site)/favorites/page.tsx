"use client";

import ProductCard from "@/components/ui/ProductCard";
import { useFavorites } from "@/lib/favorites-context";
import { Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";

export default function FavoritesPage() {
  const { items } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header>
          <h1 className="font-heading text-2xl text-brand-plum sm:text-3xl">
            My Favorites
          </h1>
          <p className="mt-1 text-sm text-brand-rose">
            Loading...
          </p>
        </header>
        <div className="mt-12 flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blush border-t-brand-plum"></div>
        </div>
      </div>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <h1 className="font-heading text-2xl text-brand-plum sm:text-3xl">
          My Favorites
        </h1>
        <p className="mt-1 text-sm text-brand-rose">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </header>

      {isEmpty ? (
        <div className="mt-12 flex flex-col items-center justify-center py-12 text-center border border-dashed border-brand-blushDark rounded-lg">
          <div className="rounded-full bg-brand-blush p-4">
            <Heart className="h-8 w-8 text-brand-mauve" strokeWidth={1.5} />
          </div>
          <h2 className="mt-4 font-heading text-xl text-brand-plum">
            Your wishlist is empty
          </h2>
          <p className="mt-2 max-w-sm text-sm text-brand-rose">
            Save your favorite sarees here to revisit them later.
          </p>
          <div className="mt-6">
            <Button variant="primary" href="/sarees">
              Explore Sarees
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item.slug} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
