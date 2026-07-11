"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "asr-favorites";

export interface FavoriteItem {
  slug: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  status: "available" | "reserved" | "sold";
}

interface FavoritesContextValue {
  items: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  itemCount: number;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored) as FavoriteItem[]);
      }
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addFavorite = useCallback((item: FavoriteItem) => {
    setItems((current) => {
      if (current.some((i) => i.slug === item.slug)) return current;
      return [...current, item];
    });
  }, []);

  const removeFavorite = useCallback((slug: string) => {
    setItems((current) => current.filter((i) => i.slug !== slug));
  }, []);

  const isFavorite = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

  const itemCount = useMemo(() => items.length, [items]);

  const value = useMemo(
    () => ({
      items,
      addFavorite,
      removeFavorite,
      isFavorite,
      itemCount,
    }),
    [items, addFavorite, removeFavorite, isFavorite, itemCount]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
