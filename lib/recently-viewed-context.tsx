"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";

interface RecentlyViewedContextType {
  viewedSlugs: string[];
  addViewedSlug: (slug: string) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [viewedSlugs, setViewedSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("asr-recently-viewed");
      if (stored) {
        setViewedSlugs(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recently viewed slugs", e);
    }
  }, []);

  const addViewedSlug = useCallback((slug: string) => {
    setViewedSlugs((prev) => {
      const filtered = prev.filter((s) => s !== slug);
      const next = [slug, ...filtered].slice(0, 8);
      try {
        localStorage.setItem("asr-recently-viewed", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save recently viewed slugs", e);
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ viewedSlugs, addViewedSlug }), [viewedSlugs, addViewedSlug]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}
