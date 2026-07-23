"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Inline back button for the admin header.
 * Shows only when there is navigation history to go back to.
 */
export default function AdminBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, [pathname]);

  if (!canGoBack) return null;

  return (
    <button
      onClick={() => router.back()}
      aria-label="Go back"
      className="
        flex items-center gap-1.5
        px-3 py-1.5
        rounded-full
        border border-brand-rose/30
        text-sm font-medium text-brand-plum
        bg-brand-blush/50
        transition-all duration-200
        hover:bg-brand-blush hover:border-brand-mauve/50 hover:shadow-sm hover:-translate-x-0.5
        active:scale-95
      "
    >
      <ArrowLeft className="h-4 w-4 flex-shrink-0" />
      Back
    </button>
  );
}
