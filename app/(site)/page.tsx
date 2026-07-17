import Link from "next/link";
import Image from "next/image";
import { Gem, Heart, Leaf, Sparkles, CheckCircle2, MessageCircle, HeartHandshake } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import RecentlyViewedSection from "@/components/ui/RecentlyViewedSection";
import BorderMotif from "@/components/ui/BorderMotif";
import { supabase } from "@/lib/supabase";
import { expireAllStaleReservations } from "@/lib/expire-reservations";
import { getEffectivePrice, type Promotion } from "@/lib/get-effective-price";
import { getImageUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, React.ElementType> = {
  kanjivaram: Sparkles,
  banarasi: Gem,
  cotton: Leaf,
  "wedding-edit": Heart,
};
export default async function HomePage() {
  interface PageProduct {
    id: string;
    slug: string;
    name: string;
    price: number;
    discount_price: number | null;
    category_id: string;
    status: string;
    created_at?: string;
    product_images: { image_url: string; display_order: number | null }[];
  }
  // Fire-and-forget: clean up expired reservations without blocking render
  expireAllStaleReservations();

  const today = new Date().toISOString().slice(0, 10);

  // Fetch all data in parallel for faster page loads
  const [
    { data: banners },
    { data: categories },
    { data: products },
    { data: promotions },
  ] = await Promise.all([
    supabase
      .from("banners")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true }),
    supabase
      .from("products")
      .select(`
        *,
        product_images (
          image_url,
          display_order
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("promotions")
      .select("*")
      .eq("active", true),
  ]);

  // Filter banners by date range in JS (Supabase doesn't easily handle
  // "null OR >= today" in a single .or())
  const activeBanner = (banners || []).find((banner) => {
    if (banner.start_date && today < banner.start_date) return false;
    if (banner.end_date && today > banner.end_date) return false;
    return true;
  });

  const activePromotions: Promotion[] = (promotions || []) as Promotion[];


  const fourteenDaysAgoDate = new Date();
  fourteenDaysAgoDate.setDate(fourteenDaysAgoDate.getDate() - 14);
  const fourteenDaysAgo = fourteenDaysAgoDate.toISOString();

  function mapToCardItem(product: PageProduct) {
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
      status: computedStatus as "available" | "reserved" | "sold",
      image: imageUrl,
    };
  }

  const newArrivals = (products || [])
    .filter(p => p.created_at && p.created_at >= fourteenDaysAgo)
    .map(mapToCardItem);

  const saleProducts = (products || [])
    .map(mapToCardItem)
    .filter(p => p.discountPrice != null);

  return (
    <>
      {/* Hero — dynamic banner or static fallback */}
      {activeBanner ? (
        <section className="w-full relative">
          <BorderMotif className="absolute top-0 left-0 right-0 z-10" />
          {activeBanner.link_url ? (
            <Link href={activeBanner.link_url} className="block w-full">
              <div className="relative w-full" style={{ aspectRatio: "16/5" }}>
                <Image
                  src={getImageUrl(activeBanner.image_url, 800)}
                  alt={activeBanner.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-6 py-8 sm:px-10 sm:py-12">
                  <h1 className="font-heading text-2xl text-white sm:text-4xl drop-shadow-lg">
                    {activeBanner.title}
                  </h1>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative w-full" style={{ aspectRatio: "16/5" }}>
              <Image
                src={getImageUrl(activeBanner.image_url, 800)}
                alt={activeBanner.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-6 py-8 sm:px-10 sm:py-12">
                <h1 className="font-heading text-2xl text-white sm:text-4xl drop-shadow-lg">
                  {activeBanner.title}
                </h1>
              </div>
            </div>
          )}
          <BorderMotif className="absolute bottom-0 left-0 right-0 z-10" />
        </section>
      ) : (
        /* Static fallback hero */
        <section className="w-full relative px-4 py-16 text-center sm:py-24 bg-brand-plum overflow-hidden">
          {newArrivals.length > 0 && newArrivals[0].image && (
            <div className="absolute inset-0 z-0">
              <Image
                src={getImageUrl(newArrivals[0].image, 800)}
                alt={newArrivals[0].name}
                fill
                className="object-cover object-center opacity-40 mix-blend-overlay"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-brand-plum/90 bg-gradient-to-t from-brand-plum to-brand-plum/80" />
            </div>
          )}
          
          <BorderMotif className="absolute top-0 left-0 right-0 z-10 text-brand-rose opacity-40" />
          
          <div className="relative z-10">
            <h1 className="font-heading text-3xl text-brand-blush sm:text-5xl drop-shadow-md">
              Woven with elegance
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm font-light text-brand-rose sm:text-lg drop-shadow">
              Handpicked sarees crafted in silk, zari, and timeless tradition
            </p>
            <div className="mt-10">
              <Button variant="primary" href="/category">
                Explore new arrivals
              </Button>
            </div>
          </div>

          <BorderMotif className="absolute bottom-0 left-0 right-0 z-10 text-brand-rose opacity-40" />
        </section>
      )}

      {/* Trust signals */}
      <section className="w-full border-b border-brand-blushDark bg-brand-white py-4">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-brand-mauve opacity-80" />
            <span className="text-sm font-medium text-brand-plum">Handpicked pieces, one of a kind</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-brand-blushDark" />
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-brand-mauve opacity-80" />
            <span className="text-sm font-medium text-brand-plum">Order directly on WhatsApp, no middleman</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-brand-blushDark" />
          <div className="flex items-center gap-3">
            <HeartHandshake className="h-5 w-5 text-brand-mauve opacity-80" />
            <span className="text-sm font-medium text-brand-plum">[X] happy customers</span>
          </div>
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

      <div className="w-full bg-brand-white">
        <BorderMotif />
      </div>

      {/* New arrivals — blush background */}
      <section className="w-full bg-brand-blush">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-heading text-2xl text-brand-plum">New arrivals</h2>
          {newArrivals.length === 0 ? (
            <p className="mt-6 text-brand-rose text-sm italic">
              Check back soon for new pieces
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* On Sale — white background */}
      {saleProducts.length > 0 && (
        <section className="w-full bg-brand-white">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="font-heading text-2xl text-brand-plum">On Sale</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {saleProducts.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewedSection />
    </>
  );
}
