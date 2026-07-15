import AddToCartButton from "@/components/ui/AddToCartButton";
import BuyNowButton from "@/components/ui/BuyNowButton";
import ProductCard from "@/components/ui/ProductCard";
import ProductGallery from "@/components/ui/ProductGallery";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getEffectivePrice, type Promotion } from "@/lib/get-effective-price";
import type { Metadata } from "next";
import { getImageUrl } from "@/lib/cloudinary";

type ProductStatus = "available" | "reserved" | "sold";

function formatPrice(amount: number | string): string {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function statusLabel(status: ProductStatus): string {
  if (status === "available") return "Available";
  if (status === "reserved") return "Reserved";
  return "Sold";
}

function statusBadgeClass(status: ProductStatus): string {
  if (status === "available") {
    return "bg-brand-blushDark text-brand-plum";
  }
  return "bg-brand-mauve text-brand-white";
}

function statusNote(status: ProductStatus): string | null {
  if (status === "reserved") {
    return "This saree is currently reserved and cannot be purchased right now.";
  }
  if (status === "sold") {
    return "This saree has been sold and is no longer available.";
  }
  return null;
}

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { data: product } = await supabase
    .from("products")
    .select(`
      name,
      description,
      product_images (
        image_url,
        display_order
      )
    `)
    .eq("slug", params.slug)
    .single();

  if (!product) {
    return { title: "Product Not Found | ASR Collections" };
  }

  const sortedImages = [...(product.product_images || [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  
  // Use a sensible default size for OG image (e.g., width 1200)
  const firstImage = sortedImages.length > 0 ? getImageUrl(sortedImages[0].image_url, 1200) : undefined;
  
  const description = product.description 
    ? (product.description.length > 150 ? product.description.substring(0, 147) + "..." : product.description)
    : "Shop premium sarees at ASR Collections.";

  return {
    title: `${product.name} | ASR Collections`,
    description: description,
    openGraph: {
      title: `${product.name} | ASR Collections`,
      description: description,
      images: firstImage ? [{ url: firstImage }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        name
      ),
      product_images (
        image_url,
        display_order
      )
    `)
    .eq("slug", params.slug)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch active promotions
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("active", true);

  const activePromotions: Promotion[] = (promotions || []) as Promotion[];

  // Get effective discount price for this product
  const effectiveDiscount = getEffectivePrice(
    {
      id: product.id,
      price: product.price,
      discount_price: product.discount_price,
      category_id: product.category_id,
    },
    activePromotions
  );

  const sortedImages = [...(product.product_images || [])]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((img) => img.image_url);

  const { data: relatedData } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        image_url,
        display_order
      )
    `)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  const relatedProducts = (relatedData || []).map((related) => {
    const rSorted = [...(related.product_images || [])].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );

    const relatedDiscount = getEffectivePrice(
      {
        id: related.id,
        price: related.price,
        discount_price: related.discount_price,
        category_id: related.category_id,
      },
      activePromotions
    );

    return {
      slug: related.slug,
      name: related.name,
      price: related.price,
      discountPrice: relatedDiscount,
      status: related.status as ProductStatus,
      image: rSorted.length > 0 ? rSorted[0].image_url : "",
    };
  });

  const isUnavailable = product.status !== "available";
  const note = statusNote(product.status as ProductStatus);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={sortedImages}
          alt={product.name}
          dimmed={product.status === "sold"}
        />

        <div>
          <span
            className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass(product.status as ProductStatus)}`}
          >
            {statusLabel(product.status as ProductStatus)}
          </span>

          <h1 className="mt-3 font-heading text-2xl text-brand-plum sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            {effectiveDiscount != null ? (
              <>
                <span className="text-lg text-brand-rose line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xl font-bold text-brand-plum">
                  {formatPrice(effectiveDiscount)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-brand-plum">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm text-brand-mauve">
            Fabric: <span className="text-brand-plum">{product.fabric_type}</span>
          </p>

          <p className="mt-4 text-sm leading-relaxed text-brand-rose">
            {product.description}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <BuyNowButton
              productSlug={params.slug}
              disabled={isUnavailable}
            />
            <AddToCartButton
              productId={params.slug}
              name={product.name}
              price={Number(product.price)}
              discountPrice={
                effectiveDiscount != null
                  ? Number(effectiveDiscount)
                  : undefined
              }
              image={sortedImages[0] || ""}
              disabled={isUnavailable}
            />
            {note && (
              <p className="text-sm text-brand-rose">{note}</p>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-2xl text-brand-plum">
            You may also like
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.name} {...item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
