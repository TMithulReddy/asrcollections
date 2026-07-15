"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChangeEvent, useCallback } from "react";

const selectClassName =
  "shrink-0 rounded-lg border border-brand-blushDark bg-brand-white px-3 py-2 text-sm text-brand-plum";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterBarProps {
  categories?: Category[];
  fabrics?: string[];
  currentCategorySlug?: string | null;
}

export default function CategoryFilterBar({ 
  categories = [], 
  fabrics = [], 
  currentCategorySlug = null 
}: CategoryFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Direct navigation if we are inside /category/[slug]
    if (name === "category" && currentCategorySlug !== null) {
      if (value) {
        router.push(`/category/${value}`);
      } else {
        router.push(`/sarees`);
      }
      return;
    }

    const queryString = createQueryString(name, value);
    router.push(pathname + (queryString ? `?${queryString}` : ""));
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 lg:overflow-visible lg:pb-0">
      <label className="sr-only" htmlFor="category-filter">
        Saree Type
      </label>
      <select
        id="category-filter"
        name="category"
        className={selectClassName}
        onChange={handleFilterChange}
        value={currentCategorySlug !== null ? currentCategorySlug : (searchParams.get("category") || "")}
      >
        <option value="">All Sarees</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="fabric-filter">
        Fabric
      </label>
      <select
        id="fabric-filter"
        name="fabric"
        className={selectClassName}
        onChange={handleFilterChange}
        value={searchParams.get("fabric") || ""}
      >
        <option value="">All fabrics</option>
        {fabrics.map((f) => (
          <option key={f} value={f.toLowerCase()}>
            {f}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="price-filter">
        Price range
      </label>
      <select
        id="price-filter"
        name="price"
        className={selectClassName}
        onChange={handleFilterChange}
        value={searchParams.get("price") || ""}
      >
        <option value="">All prices</option>
        <option value="0-5000">Under ₹5,000</option>
        <option value="5000-10000">₹5,000 – ₹10,000</option>
        <option value="10000-20000">₹10,000 – ₹20,000</option>
        <option value="20000+">Above ₹20,000</option>
      </select>

      <label className="sr-only" htmlFor="sort">
        Sort by
      </label>
      <select
        id="sort"
        name="sort"
        className={selectClassName}
        onChange={handleFilterChange}
        value={searchParams.get("sort") || "newest"}
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </div>
  );
}
