"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/lib/recently-viewed-context";
import { createClient } from "@/utils/supabase/client";
import ProductCard from "@/components/ui/ProductCard";
import { getEffectivePrice, type Promotion } from "@/lib/get-effective-price";

interface ProductCardItem {
  slug: string;
  name: string;
  price: number;
  discountPrice?: number;
  status: "available" | "reserved" | "sold";
  image: string;
}

export default function RecentlyViewedSection() {
  const { viewedSlugs } = useRecentlyViewed();
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (viewedSlugs.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = createClient();

      const [
        { data: productData },
        { data: promos }
      ] = await Promise.all([
        supabase
          .from("products")
          .select(`
            id, slug, name, price, discount_price, category_id, status,
            product_images ( image_url, display_order )
          `)
          .in("slug", viewedSlugs),
        supabase
          .from("promotions")
          .select("*")
          .eq("active", true)
      ]);

      if (productData) {
        const activePromos = promos || [];
        const ordered = viewedSlugs
          .map((slug) => productData.find((p) => p.slug === slug))
          .filter((p): p is NonNullable<typeof p> => Boolean(p));

        const mapped = ordered.map(p => {
          const sortedImages = [...(p.product_images || [])].sort(
            (a: { display_order: number | null }, b: { display_order: number | null }) => 
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          
          const effectiveDiscount = getEffectivePrice(
            { id: p.id, price: p.price, discount_price: p.discount_price, category_id: p.category_id },
            activePromos as Promotion[]
          );

          return {
            slug: p.slug,
            name: p.name,
            price: p.price,
            discountPrice: effectiveDiscount,
            status: p.status,
            image: sortedImages.length > 0 ? sortedImages[0].image_url : "",
          };
        });

        setProducts(mapped);
      }
      setLoading(false);
    }
    
    fetchProducts();
  }, [viewedSlugs]);

  if (viewedSlugs.length === 0 || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-brand-white">
      <div className="mx-auto max-w-6xl px-4 py-12 border-t border-brand-rose/20">
        <h2 className="font-heading text-2xl text-brand-plum">Recently viewed</h2>
        {loading ? (
          <div className="mt-6 text-sm text-brand-mauve animate-pulse bg-brand-blush h-48 rounded-md" />
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
