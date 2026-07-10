import AddToCartButton from "@/components/ui/AddToCartButton";
import BuyNowButton from "@/components/ui/BuyNowButton";
import ProductCard from "@/components/ui/ProductCard";
import ProductGallery from "@/components/ui/ProductGallery";
import Link from "next/link";

type ProductStatus = "available" | "reserved" | "sold";

interface Product {
  name: string;
  price: number;
  discountPrice?: number;
  fabric: string;
  description: string;
  status: ProductStatus;
  images: string[];
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const products: Record<string, Product> = {
  "padma-silk-saree": {
    name: "Padma Silk Saree — Temple Border Gold",
    price: 18500,
    discountPrice: 14900,
    fabric: "Pure Kanjivaram Silk",
    description:
      "A richly woven Kanjivaram silk saree featuring a traditional temple border in antique gold zari. The body carries a subtle checked texture in deep maroon, finished with a contrasting pallu woven in classic South Indian motifs. Lightweight enough for festive wear, yet substantial in drape and sheen.",
    status: "available",
    images: [
      "samples/padma-1",
      "samples/padma-2",
      "samples/padma-3",
      "samples/padma-4",
    ],
  },
  "banarasi-brocade-saree": {
    name: "Banarasi Brocade — Crimson Gold Zari",
    price: 14500,
    fabric: "Pure Banarasi Silk",
    description:
      "An opulent Banarasi brocade woven with dense crimson silk and antique gold zari florals across the body. The pallu features traditional jaal motifs with a rich, weighty drape suited for weddings and formal celebrations.",
    status: "available",
    images: [
      "samples/saree-2",
      "samples/saree-3",
      "samples/saree-4",
    ],
  },
};

const relatedProducts = [
  {
    image: "samples/saree-2",
    name: "Banarasi Brocade — Crimson Gold Zari",
    price: 14500,
    status: "available" as const,
  },
  {
    image: "samples/saree-5",
    name: "Paithani Silk — Peacock Pallu Green",
    price: 22400,
    status: "reserved" as const,
  },
  {
    image: "samples/saree-6",
    name: "Organza Embroidered — Blush Pink Bridal",
    price: 15800,
    discountPrice: 13200,
    status: "available" as const,
  },
  {
    image: "samples/saree-8",
    name: "Kota Doria — Lime Green Stripes",
    price: 4500,
    status: "available" as const,
  },
];

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

export default function ProductPage({ params }: ProductPageProps) {
  const product = products[params.slug];
  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl text-brand-plum">Product not found</h1>
        <Link
          href="/category"
          className="mt-4 inline-block text-sm text-brand-mauve hover:underline"
        >
          Browse sarees
        </Link>
      </div>
    );
  }
  const isUnavailable = product.status !== "available";
  const note = statusNote(product.status);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={product.images}
          alt={product.name}
          dimmed={product.status === "sold"}
        />

        <div>
          <span
            className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass(product.status)}`}
          >
            {statusLabel(product.status)}
          </span>

          <h1 className="mt-3 font-heading text-2xl text-brand-plum sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            {product.discountPrice !== undefined ? (
              <>
                <span className="text-lg text-brand-rose line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xl font-bold text-brand-plum">
                  {formatPrice(product.discountPrice)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-brand-plum">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm text-brand-mauve">
            Fabric: <span className="text-brand-plum">{product.fabric}</span>
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
              discountPrice={product.discountPrice}
              image={product.images[0]}
              disabled={isUnavailable}
            />
            {note && (
              <p className="text-sm text-brand-rose">{note}</p>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
