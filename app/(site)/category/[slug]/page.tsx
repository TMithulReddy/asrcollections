import CategoryEmptyState from "@/components/ui/CategoryEmptyState";
import CategoryFilterBar from "@/components/ui/CategoryFilterBar";
import ProductCard from "@/components/ui/ProductCard";
import { supabase } from "@/lib/supabase";

type ProductStatus = "available" | "reserved" | "sold";

interface ProductCardItem {
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
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = slugToTitle(params.slug);

  const { data: categoryData } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", params.slug)
    .single();

  let categoryProducts: ProductCardItem[] = [];
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

    categoryProducts = (products || []).map((product) => {
      const sortedImages = [...(product.product_images || [])].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      );
      const imageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : "";

      return {
        name: product.name,
        price: product.price,
        discountPrice: product.discount_price,
        status: product.status as "available" | "reserved" | "sold",
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
        <CategoryFilterBar />
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
