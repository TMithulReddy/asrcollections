import Link from "next/link";
import Image from "next/image";
import { Gem, Heart, Leaf, Sparkles, CheckCircle2, MessageCircle, HeartHandshake, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import RecentlyViewedSection from "@/components/ui/RecentlyViewedSection";
import BorderMotif from "@/components/ui/BorderMotif";
import BannerCarousel from "@/components/ui/BannerCarousel";
import PatternBackground from "@/components/ui/PatternBackground";
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
    is_featured: boolean;
    is_new_arrival: boolean;
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
  const activeBanners = (banners || []).filter((banner) => {
    if (banner.start_date && today < banner.start_date) return false;
    if (banner.end_date && today > banner.end_date) return false;
    return true;
  });

  const activePromotions: Promotion[] = (promotions || []) as Promotion[];

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
      isFeatured: product.is_featured,
    };
  }

  const featuredProducts = (products || [])
    .filter(p => p.is_featured)
    .map(mapToCardItem)
    .slice(0, 8);

  const newArrivals = (products || [])
    .filter(p => p.is_new_arrival)
    .map(mapToCardItem)
    .slice(0, 8);

  const saleProducts = (products || [])
    .map(mapToCardItem)
    .filter(p => p.discountPrice != null);

  return (
    <>
      {/* Hero — dynamic carousel or static fallback */}
      {activeBanners.length > 0 ? (
        <BannerCarousel banners={activeBanners} />
      ) : (
        /* Static fallback hero */
        <section className="w-full relative px-4 py-16 text-center sm:py-24 bg-brand-plum overflow-hidden aspect-[4/5] sm:aspect-[16/7] lg:aspect-[21/9] flex flex-col justify-center">
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
      <section className="relative w-full border-b border-brand-blushDark bg-brand-white py-6 sm:py-12">
        <PatternBackground />
        <div className="relative z-10 mx-auto max-w-6xl sm:px-4">
          <div 
            className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-4 sm:px-0 pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-full bg-brand-blush/50 border border-brand-rose/20 sm:flex-col sm:items-start sm:gap-0 sm:rounded-lg sm:border-brand-blushDark sm:bg-brand-white sm:px-4 sm:py-6 sm:transition-shadow sm:hover:shadow-md sm:text-left">
              <CheckCircle2 className="h-4 w-4 sm:h-7 sm:w-7 text-brand-mauve sm:mb-4 shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[13px] sm:text-base text-brand-plum font-medium sm:mb-1 whitespace-nowrap sm:whitespace-normal">One of a kind</h3>
                <p className="hidden sm:block text-sm text-brand-plum/70 leading-relaxed">Every piece is handpicked — once it's gone, it's gone.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-full bg-brand-blush/50 border border-brand-rose/20 sm:flex-col sm:items-start sm:gap-0 sm:rounded-lg sm:border-brand-blushDark sm:bg-brand-white sm:px-4 sm:py-6 sm:transition-shadow sm:hover:shadow-md sm:text-left">
              <MessageCircle className="h-4 w-4 sm:h-7 sm:w-7 text-brand-mauve sm:mb-4 shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[13px] sm:text-base text-brand-plum font-medium sm:mb-1 whitespace-nowrap sm:whitespace-normal">Order on WhatsApp</h3>
                <p className="hidden sm:block text-sm text-brand-plum/70 leading-relaxed">Talk directly with us, no middleman, no bots.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-full bg-brand-blush/50 border border-brand-rose/20 sm:flex-col sm:items-start sm:gap-0 sm:rounded-lg sm:border-brand-blushDark sm:bg-brand-white sm:px-4 sm:py-6 sm:transition-shadow sm:hover:shadow-md sm:text-left">
              <HeartHandshake className="h-4 w-4 sm:h-7 sm:w-7 text-brand-mauve sm:mb-4 shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[13px] sm:text-base text-brand-plum font-medium sm:mb-1 whitespace-nowrap sm:whitespace-normal">100+ happy customers</h3>
                <p className="hidden sm:block text-sm text-brand-plum/70 leading-relaxed">Real relationships, not just transactions.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-full bg-brand-blush/50 border border-brand-rose/20 sm:flex-col sm:items-start sm:gap-0 sm:rounded-lg sm:border-brand-blushDark sm:bg-brand-white sm:px-4 sm:py-6 sm:transition-shadow sm:hover:shadow-md sm:text-left">
              <ShieldCheck className="h-4 w-4 sm:h-7 sm:w-7 text-brand-mauve sm:mb-4 shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[13px] sm:text-base text-brand-plum font-medium sm:mb-1 whitespace-nowrap sm:whitespace-normal">Quality you can feel</h3>
                <p className="hidden sm:block text-sm text-brand-plum/70 leading-relaxed">Each saree checked by hand before it reaches you.</p>
              </div>
            </div>
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
                  className="group flex flex-col items-center px-2 py-4"
                >
                  <div className="bg-brand-blush rounded-full p-4 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-brand-mauve" strokeWidth={1.5} />
                  </div>
                  <span className="mt-3 text-center text-sm text-brand-plum transition-colors group-hover:text-brand-mauve">
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

      {featuredProducts.length > 0 && (
        <section className="relative w-full bg-brand-blush">
          <PatternBackground />
          <div className="relative z-10 mx-auto max-w-6xl px-4 py-12">
            <h2 className="font-heading text-2xl text-brand-plum">Handpicked for you</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Button variant="primary" href="/sarees">
                Shop All Sarees
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* New arrivals */}
      <section className={`relative w-full ${featuredProducts.length > 0 ? "bg-brand-white" : "bg-brand-blush"}`}>
        <PatternBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-heading text-2xl text-brand-plum">New arrivals</h2>
          {newArrivals.length === 0 ? (
            <p className="mt-6 text-brand-rose text-sm italic">
              Check back soon for new pieces
            </p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {newArrivals.map((product) => (
                  <ProductCard key={product.name} {...product} />
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <Button variant="primary" href="/sarees">
                  Shop All Sarees
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* On Sale */}
      {saleProducts.length > 0 && (
        <>
          <div className={`relative w-full h-8 ${featuredProducts.length > 0 ? "bg-brand-white" : "bg-brand-blush"}`}>
            <PatternBackground opacityClass="opacity-[0.03]" />
          </div>
          <section className={`w-full ${featuredProducts.length > 0 ? "bg-brand-blush" : "bg-brand-white"}`}>
            <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="font-heading text-2xl text-brand-plum">On Sale</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {saleProducts.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          </div>
        </section>
        </>
      )}

      <RecentlyViewedSection />
    </>
  );
}
