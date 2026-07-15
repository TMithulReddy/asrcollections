"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Package, ShoppingBag } from "lucide-react";
import { searchAdminItems, SearchResult } from "@/app/admin/(dashboard)/search/actions";

export default function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await searchAdminItems(query);
          setResults(res);
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const products = results.filter((r) => r.type === "product");
  const orders = results.filter((r) => r.type === "order");

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-brand-plum/50" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search products or orders..."
          className="block w-full pl-10 pr-3 py-2 border border-brand-rose/40 rounded-md leading-5 bg-brand-white placeholder-brand-plum/50 focus:outline-none focus:ring-1 focus:ring-brand-plum focus:border-brand-plum sm:text-sm text-brand-plum transition-colors"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-4 w-4 border-2 border-brand-plum/20 border-t-brand-plum rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && (products.length > 0 || orders.length > 0) && (
        <div className="absolute mt-1 w-full bg-brand-white rounded-md shadow-lg border border-brand-rose/20 overflow-hidden z-50">
          <ul className="max-h-96 overflow-y-auto">
            {products.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-brand-blush/30 text-xs font-semibold text-brand-plum/70 flex items-center">
                  <Package className="w-3 h-3 mr-2" />
                  Products
                </div>
                {products.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={p.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 hover:bg-brand-blush/20 transition-colors"
                    >
                      <p className="text-sm font-medium text-brand-plum">{p.title}</p>
                      <p className="text-xs text-brand-plum/60">{p.subtitle}</p>
                    </Link>
                  </li>
                ))}
              </div>
            )}
            
            {orders.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-brand-blush/30 text-xs font-semibold text-brand-plum/70 flex items-center">
                  <ShoppingBag className="w-3 h-3 mr-2" />
                  Orders
                </div>
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={o.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 hover:bg-brand-blush/20 transition-colors"
                    >
                      <p className="text-sm font-medium text-brand-plum">{o.title}</p>
                      <p className="text-xs text-brand-plum/60">{o.subtitle}</p>
                    </Link>
                  </li>
                ))}
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
