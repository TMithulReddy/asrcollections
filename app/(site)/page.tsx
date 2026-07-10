import Link from "next/link";
import { Gem, Heart, Leaf, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";

const categories = [
  { name: "Kanjivaram", slug: "kanjivaram", icon: Sparkles },
  { name: "Banarasi", slug: "banarasi", icon: Gem },
  { name: "Cotton", slug: "cotton", icon: Leaf },
  { name: "Wedding Edit", slug: "wedding-edit", icon: Heart },
];

const newArrivals = [
  {
    image: "samples/saree-1",
    name: "Kanjivaram Pure Silk — Temple Border Maroon",
    price: 18900,
    status: "available" as const,
  },
  {
    image: "samples/saree-2",
    name: "Banarasi Brocade — Crimson Gold Zari",
    price: 14500,
    status: "available" as const,
  },
  {
    image: "samples/saree-3",
    name: "Chanderi Cotton Silk — Ivory Floral Butti",
    price: 6800,
    status: "available" as const,
  },
  {
    image: "samples/saree-4",
    name: "Tussar Silk — Natural Gold Block Print",
    price: 9200,
    status: "available" as const,
  },
  {
    image: "samples/saree-5",
    name: "Paithani Silk — Peacock Pallu Green",
    price: 22400,
    status: "available" as const,
  },
  {
    image: "samples/saree-6",
    name: "Organza Embroidered — Blush Pink Bridal",
    price: 15800,
    status: "available" as const,
  },
];

export default function HomePage() {
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
            {categories.map(({ name, slug, icon: Icon }) => (
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
            ))}
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
