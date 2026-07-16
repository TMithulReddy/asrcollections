import { createClient } from "@/utils/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createClient();

  // Fetch the product with its images and physical units
  const { data: product } = await supabase
    .from("products")
    .select(`
      id, name, slug, category_id, fabric_type, description,
      price, discount_price,
      product_images (image_url, display_order),
      product_units (id, sku, status)
    `)
    .eq("id", params.id)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch categories for the dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("display_order", { ascending: true });

  // Sort images by display_order and extract public_ids
  const sortedImages = [...(product.product_images || [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => img.image_url);

  // Map product_units to the shape the form expects
  const units = (product.product_units || []).map((u: { id: string; sku: string | null; status: string }) => ({
    id: u.id,
    sku: u.sku,
    status: u.status,
  }));

  // Fetch availability stats from the product_availability view
  const { data: availabilityRow } = await supabase
    .from("product_availability")
    .select("total_units, sold_units, available_units")
    .eq("product_id", params.id)
    .single();

  const availability = availabilityRow ?? undefined;

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category_id: product.category_id,
    fabric_type: product.fabric_type || "",
    description: product.description || "",
    price: product.price,
    discount_price: product.discount_price,
    units,
    images: sortedImages,
  };

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center text-sm text-brand-plum/60 hover:text-brand-plum transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Products
      </Link>
      <h1 className="text-3xl font-heading text-brand-plum mb-6">Edit Product</h1>
      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm p-6">
        <ProductForm categories={categories || []} initialData={initialData} availability={availability} />
      </div>
    </div>
  );
}
