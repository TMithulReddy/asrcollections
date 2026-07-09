import CategoryEmptyState from "@/components/ui/CategoryEmptyState";
import CategoryFilterBar from "@/components/ui/CategoryFilterBar";
import ProductCard from "@/components/ui/ProductCard";

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const categoryProducts = [
  {
    image: "samples/saree-1",
    name: "Kanjivaram Pure Silk — Temple Border Maroon",
    price: 18900,
    discountPrice: 15900,
    status: "available" as const,
  },
  {
    image: "samples/saree-2",
    name: "Banarasi Brocade — Crimson Gold Zari",
    price: 14500,
    status: "reserved" as const,
  },
  {
    image: "samples/saree-3",
    name: "Chanderi Cotton Silk — Ivory Floral Butti",
    price: 6800,
    status: "sold" as const,
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
    status: "reserved" as const,
  },
  {
    image: "samples/saree-6",
    name: "Organza Embroidered — Blush Pink Bridal",
    price: 15800,
    status: "available" as const,
  },
  {
    image: "samples/saree-7",
    name: "Mysore Silk — Royal Purple Checks",
    price: 11200,
    status: "sold" as const,
  },
  {
    image: "samples/saree-8",
    name: "Kota Doria — Lime Green Stripes",
    price: 4500,
    status: "available" as const,
  },
  {
    image: "samples/saree-9",
    name: "Bandhani Georgette — Sunset Orange",
    price: 7800,
    discountPrice: 6500,
    status: "reserved" as const,
  },
  {
    image: "samples/saree-10",
    name: "Uppada Jamdani — Navy Blue Gold",
    price: 19600,
    status: "available" as const,
  },
  {
    image: "samples/saree-11",
    name: "Linen Saree — Earth Brown Minimal",
    price: 5200,
    status: "sold" as const,
  },
  {
    image: "samples/saree-12",
    name: "Gadwal Silk Cotton — Dual Tone Magenta",
    price: 13400,
    status: "available" as const,
  },
];

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = slugToTitle(params.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <h1 className="font-heading text-2xl text-brand-plum sm:text-3xl">
          {categoryName}
        </h1>
        <p className="mt-1 text-sm text-brand-rose">24 sarees</p>
      </header>

      <div className="mt-6">
        <CategoryFilterBar />
      </div>

      <CategoryEmptyState />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categoryProducts.map((product) => (
          <ProductCard key={product.name} {...product} />
        ))}
      </div>
    </div>
  );
}
