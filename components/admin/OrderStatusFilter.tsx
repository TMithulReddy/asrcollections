"use client";

import { useRouter, useSearchParams } from "next/navigation";

const STATUSES = ["all", "pending", "confirmed", "rejected", "expired"] as const;

export default function OrderStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") || "all";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleChange(s)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            current === s
              ? "bg-brand-plum text-brand-white"
              : "bg-brand-white text-brand-plum/70 border border-brand-rose/20 hover:bg-brand-blush"
          }`}
        >
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  );
}
