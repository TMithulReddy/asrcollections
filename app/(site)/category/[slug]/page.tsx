import CategoryEmptyState from "@/components/ui/CategoryEmptyState";
import CategoryFilterBar from "@/components/ui/CategoryFilterBar";
import ProductCard from "@/components/ui/ProductCard";
import { supabase } from "@/lib/supabase";
import { expireAllStaleReservations } from "@/lib/expire-reservations";
import { getEffectivePrice, type Promotion } from "@/lib/get-effective-price";
import { Suspense } from "react";
import type { Metadata } from "next";

type ProductStatus = "available" | "reserved" | "sold";

interface ProductCardItem {
  slug: string;
  name: string;
  price: number;
  discountPrice?: number;
  status: ProductStatus;
  image: string;
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryName = slugToTitle(params.slug);
  return {
    title: `${categoryName} | ASR Collections Sarees`,
    description: `Browse our premium collection of ${categoryName} sarees at ASR Collections.`,
    openGraph: {
      title: `${categoryName} | ASR Collections Sarees`,
      description: `Browse our premium collection of ${categoryName} sarees at ASR Collections.`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categoryName = slugToTitle(params.slug);

  // Fire-and-forget: clean up expired reservations without blocking render
  expireAllStaleReservations();

  const [
    { data: categoryData },
    { data: promotions },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id")
      .eq("slug", params.slug)
      .single(),
    supabase
      .from("promotions")
      .select("*")
      .eq("active", true),
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("display_order", { ascending: true })
  ]);

  const activePromotions: Promotion[] = (promotions || []) as Promotion[];

  let categoryProducts: ProductCardItem[] = [];
  let fabrics: string[] = [];
  
  if (categoryData) {
    const { data: products } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          image_url,
          display_order
        )
      `)
      .eq("category_id", categoryData.id)
      .order("created_at", { ascending: false });

    let filteredProducts = products || [];

    const rawFabrics = filteredProducts
      .map(p => p.fabric_type)
      .filter((f): f is string => Boolean(f && f.trim() !== ""));
      
    fabrics = Array.from(new Set(
      rawFabrics.map(f => f.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '))
    )).sort();

    if (typeof searchParams.fabric === "string" && searchParams.fabric) {
      filteredProducts = filteredProducts.filter((p) =>
        p.fabric_type?.toLowerCase().includes((searchParams.fabric as string).toLowerCase())
      );
    }

    if (typeof searchParams.price === "string" && searchParams.price) {
      filteredProducts = filteredProducts.filter((p) => {
        const effectiveDiscount = getEffectivePrice(
          { id: p.id, price: p.price, discount_price: p.discount_price, category_id: p.category_id },
          activePromotions
        );
        const activePrice = effectiveDiscount ?? p.price;
        switch (searchParams.price) {
          case "0-5000": return activePrice < 5000;
          case "5000-10000": return activePrice >= 5000 && activePrice <= 10000;
          case "10000-20000": return activePrice > 10000 && activePrice <= 20000;
          case "20000+": return activePrice > 20000;
          default: return true;
        }
      });
    }

    const sort = typeof searchParams.sort === "string" ? searchParams.sort : "newest";
    if (sort === "price-asc") {
      filteredProducts.sort((a, b) => {
        const priceA = getEffectivePrice(
          { id: a.id, price: a.price, discount_price: a.discount_price, category_id: a.category_id },
          activePromotions
        ) ?? a.price;
        const priceB = getEffectivePrice(
          { id: b.id, price: b.price, discount_price: b.discount_price, category_id: b.category_id },
          activePromotions
        ) ?? b.price;
        return priceA - priceB;
      });
    } else if (sort === "price-desc") {
      filteredProducts.sort((a, b) => {
        const priceA = getEffectivePrice(
          { id: a.id, price: a.price, discount_price: a.discount_price, category_id: a.category_id },
          activePromotions
        ) ?? a.price;
        const priceB = getEffectivePrice(
          { id: b.id, price: b.price, discount_price: b.discount_price, category_id: b.category_id },
          activePromotions
        ) ?? b.price;
        return priceB - priceA;
      });
    }


    categoryProducts = filteredProducts.map((product) => {
      const sortedImages = [...(product.product_images || [])].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      );
      const imageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : "";

      const effectiveDiscount = getEffectivePrice(
        {
          id: product.id,
          price: product.price,
          discount_price: product.discount_price,
          category_id: product.category_id,
        },
        activePromotions
      );

      const computedStatus = product.status || "available";

      return {
        slug: product.slug,
        name: product.name,
        price: product.price,
        discountPrice: effectiveDiscount,
        status: computedStatus as ProductStatus,
        image: imageUrl,
      };
    });
  }

  const isEmpty = categoryProducts.length === 0;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <h1 className="font-heading text-2xl text-brand-plum sm:text-3xl">
          {categoryName}
        </h1>
        <p className="mt-1 text-sm text-brand-rose">
          {categoryProducts.length} {categoryProducts.length === 1 ? "saree" : "sarees"}
        </p>
      </header>

      <div className="mt-6">
        <Suspense fallback={<div className="h-10 bg-brand-blush animate-pulse rounded-lg" />}>
          <CategoryFilterBar 
            categories={categories || []} 
            fabrics={fabrics} 
            currentCategorySlug={params.slug}
          />
        </Suspense>
      </div>

      {isEmpty ? (
        <CategoryEmptyState />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categoryProducts.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
