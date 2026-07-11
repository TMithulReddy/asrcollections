"use client";

import { Heart } from "lucide-react";
import { useFavorites, FavoriteItem } from "@/lib/favorites-context";
import { useEffect, useState } from "react";

interface FavoriteButtonProps {
  item: FavoriteItem;
}

export default function FavoriteButton({ item }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="absolute right-2 top-2 z-10 rounded-full bg-brand-white/80 p-1.5 text-brand-plum backdrop-blur-sm transition-colors hover:bg-brand-white">
        <Heart className="h-4 w-4" strokeWidth={2} />
      </button>
    );
  }

  const favorited = isFavorite(item.slug);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      removeFavorite(item.slug);
    } else {
      addFavorite(item);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className="absolute right-2 top-2 z-10 rounded-full bg-brand-white/80 p-1.5 text-brand-plum backdrop-blur-sm transition-colors hover:bg-brand-white"
    >
      <Heart
        className="h-4 w-4"
        strokeWidth={favorited ? 0 : 2}
        fill={favorited ? "currentColor" : "none"}
      />
    </button>
  );
}
