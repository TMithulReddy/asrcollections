import CategoryEmptyState from "@/components/ui/CategoryEmptyState";
import CategoryFilterBar from "@/components/ui/CategoryFilterBar";
import ProductCard from "@/components/ui/ProductCard";
import { supabase } from "@/lib/supabase";
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

  let filteredProducts = products || [];

  if (typeof searchParams.fabric === "string" && searchParams.fabric) {
    filteredProducts = filteredProducts.filter((p) =>
      p.fabric_type?.toLowerCase().includes((searchParams.fabric as string).toLowerCase())
    );
  }

  if (typeof searchParams.price === "string" && searchParams.price) {
    filteredProducts = filteredProducts.filter((p) => {
      const activePrice = p.discount_price !== null ? p.discount_price : p.price;
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
      const priceA = a.discount_price !== null ? a.discount_price : a.price;
      const priceB = b.discount_price !== null ? b.discount_price : b.price;
      return priceA - priceB;
    });
  } else if (sort === "price-desc") {
    filteredProducts.sort((a, b) => {
      const priceA = a.discount_price !== null ? a.discount_price : a.price;
      const priceB = b.discount_price !== null ? b.discount_price : b.price;
      return priceB - priceA;
    });
  }

  const allProducts: ProductCardItem[] = filteredProducts.map((product) => {
    const sortedImages = [...(product.product_images || [])].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    const imageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : "";

    return {
      slug: product.slug,
      name: product.name,
      price: product.price,
      discountPrice: product.discount_price !== null ? product.discount_price : undefined,
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
