import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import AdminProductsTable from "@/components/admin/AdminProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      slug,
      name,
      price,
      category_id,
      updated_at,
      categories (name),
      product_images (image_url, display_order)
    `)
    .order("created_at", { ascending: false });

  let productsWithAvailability = products || [];
  
  if (products && products.length > 0) {
    const productIds = products.map((p) => p.id);
    const { data: availData } = await supabase
      .from("product_availability")
      .select("product_id, available_units, sold_units, total_units")
      .in("product_id", productIds);
      
    if (availData) {
      const availMap = new Map(availData.map((a) => [a.product_id, a]));
      productsWithAvailability = products.map((p) => ({
        ...p,
        availability: {
          available_units: availMap.get(p.id)?.available_units ?? 0,
          sold_units: availMap.get(p.id)?.sold_units ?? 0,
          total_units: availMap.get(p.id)?.total_units ?? 0,
        }
      }));
    } else {
      productsWithAvailability = products.map((p) => ({
        ...p,
        availability: { available_units: 0, sold_units: 0, total_units: 0 }
      }));
    }
  }

  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error || catError) {
    console.error("Error fetching data:", error || catError);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading text-brand-plum">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center bg-brand-plum text-brand-white px-4 py-2 rounded-md hover:bg-brand-plum/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      <AdminProductsTable products={productsWithAvailability as any} categories={categories || []} />
    </div>
  );
}
