"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface OrdersSearchBoxProps {
  initialValue?: string;
}

export default function OrdersSearchBox({ initialValue = "" }: OrdersSearchBoxProps) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(searchTerm: string) {
    const params = new URLSearchParams();
    const status = searchParams.get("status");
    if (status) params.set("status", status);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    const qs = params.toString();
    router.push(`/admin/orders${qs ? `?${qs}` : ""}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(value);
  }

  function handleClear() {
    setValue("");
    navigate("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-brand-plum/50" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by order ref or SKU"
        className="block w-full pl-10 pr-8 py-2 border border-brand-rose/40 rounded-md leading-5 bg-brand-white placeholder-brand-plum/50 focus:outline-none focus:ring-1 focus:ring-brand-plum focus:border-brand-plum sm:text-sm text-brand-plum transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-plum/40 hover:text-brand-plum transition-colors"
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
