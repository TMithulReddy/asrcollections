import AddToCartButton from "@/components/ui/AddToCartButton";
import BuyNowButton from "@/components/ui/BuyNowButton";
import ProductCard from "@/components/ui/ProductCard";
import ProductGallery from "@/components/ui/ProductGallery";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ProductStatus = "available" | "reserved" | "sold";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
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
    return {
      name: related.name,
      price: related.price,
      discountPrice: related.discount_price,
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
            {product.discount_price !== null && product.discount_price !== undefined ? (
              <>
                <span className="text-lg text-brand-rose line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xl font-bold text-brand-plum">
                  {formatPrice(product.discount_price)}
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
              price={product.price}
              discountPrice={product.discount_price}
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
