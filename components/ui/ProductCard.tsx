import Image from "next/image";
import { getImageUrl } from "@/lib/cloudinary";

type ProductStatus = "available" | "reserved" | "sold";

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  discountPrice?: number;
  status: ProductStatus;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCard({
  image,
  name,
  price,
  discountPrice,
  status,
}: ProductCardProps) {
  const imageUrl = getImageUrl(image, 400);

  return (
    <article className="w-full">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-brand-blushDark">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover ${status === "sold" ? "opacity-60" : ""}`}
        />

        {status === "reserved" && (
          <span className="absolute right-2 top-2 rounded px-2 py-0.5 text-xs font-medium bg-brand-mauve text-brand-white">
            Reserved
          </span>
        )}

        {status === "sold" && (
          <span className="absolute right-2 top-2 rounded px-2 py-0.5 text-xs font-medium bg-brand-mauve text-brand-white">
            Sold
          </span>
        )}
      </div>

      <h3 className="mt-3 text-sm font-medium text-brand-plum line-clamp-2">
        {name}
      </h3>

      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        {discountPrice !== undefined ? (
          <>
            <span className="text-sm text-brand-rose line-through">
              {formatPrice(price)}
            </span>
            <span className="text-sm font-bold text-brand-plum">
              {formatPrice(discountPrice)}
            </span>
          </>
        ) : (
          <span className="text-sm font-bold text-brand-plum">
            {formatPrice(price)}
          </span>
        )}
      </div>
    </article>
  );
}
