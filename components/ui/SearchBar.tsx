"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

interface SearchResult {
  name: string;
  slug: string;
  product_images: { image_url: string; display_order: number }[];
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Close search when navigating
  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, [pathname]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`name, slug, product_images(image_url, display_order)`)
        .ilike("name", `%${query}%`)
        .limit(5);

      if (!error && data) {
        setResults(data as unknown as SearchResult[]);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {!isOpen ? (
        <button
          type="button"
          aria-label="Search"
          className="p-1 text-brand-plum hover:opacity-80 transition-opacity"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 10);
          }}
        >
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </button>
      ) : (
        <div className="flex items-center bg-brand-blush rounded-full px-3 py-1.5 w-48 sm:w-64 transition-all border border-brand-blushDark">
          <Search className="h-4 w-4 text-brand-plum mr-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            className="bg-transparent border-none outline-none text-sm w-full text-brand-plum placeholder:text-brand-plum/60 focus:ring-0 p-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
            className="p-1 text-brand-plum hover:opacity-80 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-brand-white rounded-lg shadow-xl border border-brand-blushDark overflow-hidden z-[100]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-brand-plum animate-pulse">Searching...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((product) => {
                const sortedImages = [...(product.product_images || [])].sort(
                  (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
                );
                const imageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : "";

                return (
                  <li key={product.slug} className="border-b border-brand-blush/50 last:border-0">
                    <Link
                      href={`/product/${product.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-brand-blush transition-colors group"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded-md group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-brand-blushDark rounded-md" />
                      )}
                      <span className="text-sm font-medium text-brand-plum line-clamp-2">
                        {product.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-brand-plum">
              No products found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
