import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";

const sampleProducts = [
  {
    image: "samples/saree-1",
    name: "Banarasi Silk Saree — Crimson Gold",
    price: 12500,
    discountPrice: 9999,
    status: "available" as const,
  },
  {
    image: "samples/saree-2",
    name: "Kanjivaram Pure Silk — Temple Border",
    price: 18900,
    status: "reserved" as const,
  },
  {
    image: "samples/saree-3",
    name: "Chanderi Cotton Silk — Ivory Floral",
    price: 6500,
    status: "sold" as const,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-10 flex flex-col gap-3 sm:flex-row">
        <Button variant="primary">Shop the collection</Button>
        <Button variant="whatsapp">Buy Now on WhatsApp</Button>
      </section>

      <section>
        <h2 className="mb-6 font-heading text-2xl text-brand-plum">
          Featured Sarees
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {sampleProducts.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}
