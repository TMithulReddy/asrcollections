"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites-context";
import { useEffect, useState } from "react";

export default function FavoritesNavLink() {
  const { itemCount } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/favorites" className="relative p-1" aria-label="Favorites">
      <Heart className="h-5 w-5" strokeWidth={1.75} />
      {mounted && itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-rose text-[10px] font-bold text-brand-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
