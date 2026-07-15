"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/cloudinary";
import FavoriteButton from "./FavoriteButton";

type ProductStatus = "available" | "reserved" | "sold";

interface ProductCardProps {
  slug: string;
  image: string;
  name: string;
  price: number;
  discountPrice?: number;
  status: ProductStatus;
}

function formatPrice(amount: number | string): string {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

export default function ProductCard({
  slug,
  image,
  name,
  price,
  discountPrice,
  status,
}: ProductCardProps) {
  const imageWidth = 400;
  const imageHeight = 533;
  const imageUrl = getImageUrl(image, imageWidth);
  const [isLoaded, setIsLoaded] = useState(false);

  const favoriteItem = {
    slug,
    name,
    price,
    discountPrice,
    image,
    status,
  };

  return (
    <Link href={`/product/${slug}`} className="group block w-full outline-none ring-brand-plum focus-visible:ring-2 rounded-lg">
      <article className="w-full relative">
        <div className="relative overflow-hidden rounded-lg bg-brand-blushDark transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md">
          <Image
            src={imageUrl}
            alt={name}
            width={imageWidth}
            height={imageHeight}
            onLoad={() => setIsLoaded(true)}
            className={`h-auto w-full object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"} ${status === "sold" ? "!opacity-60" : ""}`}
          />

          <FavoriteButton item={favoriteItem} />

          {status === "reserved" && (
            <span className="absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-medium bg-brand-mauve text-brand-white pointer-events-none">
              Reserved
            </span>
          )}

          {status === "sold" && (
            <span className="absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-medium bg-brand-mauve text-brand-white pointer-events-none">
              Sold
            </span>
          )}
        </div>

        <h3 className="mt-3 text-sm font-medium text-brand-plum line-clamp-2 group-hover:underline">
          {name}
        </h3>

        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          {discountPrice != null ? (
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
    </Link>
  );
}
