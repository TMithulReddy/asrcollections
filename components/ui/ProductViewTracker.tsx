"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/lib/recently-viewed-context";

export default function ProductViewTracker({ slug }: { slug: string }) {
  const { addViewedSlug } = useRecentlyViewed();

  useEffect(() => {
    addViewedSlug(slug);
  }, [slug, addViewedSlug]);

  return null;
}
