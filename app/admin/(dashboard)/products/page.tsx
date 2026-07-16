import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { X, Plus } from "lucide-react";
import AdminProductsTable from "@/components/admin/AdminProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = createClient();
  const categoryFilter = searchParams.category;

  let query = supabase
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

  if (categoryFilter) {
    query = query.eq("category_id", categoryFilter);
  }

  const { data: products, error } = await query;

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

  const activeCategory = categoryFilter 
    ? categories?.find((c) => c.id === categoryFilter)
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading text-brand-plum">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center bg-brand-plum text-brand-white px-4 py-2 rounded-md hover:bg-brand-plum/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      {activeCategory && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-brand-plum/70">Filtered by category:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-blush text-brand-plum border border-brand-rose/40 shadow-sm">
            {activeCategory.name}
            <Link
              href="/admin/products"
              className="ml-2 hover:bg-brand-rose/20 rounded-full p-0.5 transition-colors"
              title="Clear filter"
            >
              <X className="w-3 h-3" />
            </Link>
          </span>
        </div>
      )}

      <AdminProductsTable products={productsWithAvailability as any} categories={categories || []} />
    </div>
  );
}
