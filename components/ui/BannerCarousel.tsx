"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/cloudinary";
import BorderMotif from "@/components/ui/BorderMotif";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
}

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (banners.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }
    }, 5000);
  }, [banners.length, isHovered]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  };

  if (banners.length === 0) return null;

  return (
    <section 
      className="w-full relative bg-brand-plum overflow-hidden aspect-[4/5] sm:aspect-[16/7] lg:aspect-[21/9]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BorderMotif className="absolute top-0 left-0 right-0 z-20 pointer-events-none" />
      
      {banners.map((banner, index) => {
        const isActive = index === currentIndex;
        
        const Inner = () => (
          <>
            <Image
              src={getImageUrl(banner.image_url, 1200)}
              alt={banner.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 px-6 py-10 sm:px-10 sm:py-16">
              <h1 className="font-heading text-3xl text-white sm:text-5xl drop-shadow-lg max-w-4xl">
                {banner.title}
              </h1>
              {banner.link_url && (
                <div className="mt-4 sm:mt-6">
                  <span className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150 border border-white/40 bg-black/20 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/60">
                    Explore
                  </span>
                </div>
              )}
            </div>
          </>
        );

        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {banner.link_url ? (
              <Link href={banner.link_url} className="block w-full h-full group">
                <Inner />
              </Link>
            ) : (
              <div className="w-full h-full">
                <Inner />
              </div>
            )}
          </div>
        );
      })}

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all pointer-events-auto ${
                index === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <BorderMotif className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" />
    </section>
  );
}
