import CategoryEmptyState from "@/components/ui/CategoryEmptyState";
import CategoryFilterBar from "@/components/ui/CategoryFilterBar";
import ProductCard from "@/components/ui/ProductCard";
import { supabase } from "@/lib/supabase";
import { expireAllStaleReservations } from "@/lib/expire-reservations";
import { getEffectivePrice, type Promotion } from "@/lib/get-effective-price";
import { Suspense } from "react";

type ProductStatus = "available" | "reserved" | "sold";

interface ProductCardItem {
  slug: string;
  name: string;
  price: number;
  discountPrice?: number;
  status: ProductStatus;
  image: string;
}

interface AllSareesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AllSareesPage({ searchParams }: AllSareesPageProps) {
  // Release any expired reservations before querying
  await expireAllStaleReservations();

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        image_url,
        display_order
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch active promotions
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("active", true);

  const activePromotions: Promotion[] = (promotions || []) as Promotion[];

  let filteredProducts = products || [];

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

  const allProducts: ProductCardItem[] = filteredProducts.map((product) => {
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

    return {
      slug: product.slug,
      name: product.name,
      price: product.price,
      discountPrice: effectiveDiscount,
      status: product.status as ProductStatus,
      image: imageUrl,
    };
  });

  const isEmpty = allProducts.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <h1 className="font-heading text-2xl text-brand-plum sm:text-3xl">
          All Sarees
        </h1>
        <p className="mt-1 text-sm text-brand-rose">
          {allProducts.length} {allProducts.length === 1 ? "saree" : "sarees"}
        </p>
      </header>

      <div className="mt-6">
        <Suspense fallback={<div className="h-10 bg-brand-blush animate-pulse rounded-lg" />}>
          <CategoryFilterBar />
        </Suspense>
      </div>

      {isEmpty ? (
        <CategoryEmptyState />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {allProducts.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
