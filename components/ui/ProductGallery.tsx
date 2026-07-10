"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/lib/cloudinary";

interface ProductGalleryProps {
  images: string[];
  alt: string;
  dimmed?: boolean;
}

const MAIN_WIDTH = 600;
const MAIN_HEIGHT = 800;
const THUMB_WIDTH = 96;
const THUMB_HEIGHT = 128;

export default function ProductGallery({
  images,
  alt,
  dimmed = false,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      <div className="overflow-hidden rounded-lg bg-brand-blushDark lg:flex-1">
        <Image
          src={getImageUrl(selectedImage, MAIN_WIDTH)}
          alt={alt}
          width={MAIN_WIDTH}
          height={MAIN_HEIGHT}
          priority
          className={`aspect-[3/4] h-auto w-full object-cover ${dimmed ? "opacity-60" : ""}`}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:w-24 lg:flex-col lg:overflow-visible lg:pb-0">
        {images.map((image, index) => {
          const isSelected = index === selectedIndex;

          return (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 bg-brand-blushDark ${
                isSelected ? "border-brand-mauve" : "border-transparent"
              }`}
              aria-label={`View image ${index + 1}`}
              aria-pressed={isSelected}
            >
              <Image
                src={getImageUrl(image, THUMB_WIDTH)}
                alt={`${alt} — view ${index + 1}`}
                width={THUMB_WIDTH}
                height={THUMB_HEIGHT}
                className="aspect-[3/4] h-auto w-20 object-cover lg:w-full"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
