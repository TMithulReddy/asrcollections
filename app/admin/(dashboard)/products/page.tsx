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
      status,
      category_id,
      updated_at,
      categories (name),
      product_images (image_url, display_order)
    `)
    .order("created_at", { ascending: false });

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

      <AdminProductsTable products={products || []} categories={categories || []} />
    </div>
  );
}
