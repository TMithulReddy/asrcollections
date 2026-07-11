import Link from "next/link";
import { Gem, Heart, Leaf, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import { supabase } from "@/lib/supabase";

const categoryIcons: Record<string, React.ElementType> = {
  kanjivaram: Sparkles,
  banarasi: Gem,
  cotton: Leaf,
  "wedding-edit": Heart,
};

export default async function HomePage() {
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

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

  const newArrivals = (products || []).map((product) => {
    // Sort images by display_order
    const sortedImages = [...(product.product_images || [])].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    const imageUrl = sortedImages.length > 0 ? sortedImages[0].image_url : "";

    return {
      slug: product.slug,
      name: product.name,
      price: product.price,
      discountPrice: product.discount_price !== null ? product.discount_price : undefined,
      status: product.status as "available" | "reserved" | "sold",
      image: imageUrl,
    };
  });

  return (
    <>
      {/* Hero */}
      <section className="w-full bg-brand-plumSoft px-4 py-16 text-center sm:py-20">
        <h1 className="font-heading text-3xl text-brand-blush sm:text-4xl">
          Woven with elegance
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-light text-brand-rose sm:text-base">
          Handpicked sarees crafted in silk, zari, and timeless tradition
        </p>
        <div className="mt-8">
          <Button variant="primary" href="/category">
            Explore new arrivals
          </Button>
        </div>
      </section>

      {/* Category tiles — white background */}
      <section className="w-full bg-brand-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
            {(categories || []).map(({ name, slug }) => {
              const Icon = categoryIcons[slug] || Sparkles;
              return (
                <Link
                  key={slug}
                  href={`/category/${slug}`}
                  className="flex flex-col items-center rounded-lg border border-brand-blushDark bg-brand-white px-3 py-5 transition-shadow hover:shadow-md"
                >
                  <Icon className="h-7 w-7 text-brand-mauve" strokeWidth={1.5} />
                  <span className="mt-3 text-center text-sm text-brand-plum">
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* New arrivals — blush background */}
      <section className="w-full bg-brand-blush">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-heading text-2xl text-brand-plum">New arrivals</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.name} {...product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
