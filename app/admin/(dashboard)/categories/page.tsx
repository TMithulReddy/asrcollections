import { createClient } from "@/utils/supabase/server";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = createClient();

  // Fetch categories with product count
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, display_order")
    .order("display_order", { ascending: true });

  // Count products per category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (cat) => {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", cat.id);

      return {
        ...cat,
        product_count: count ?? 0,
      };
    })
  );

  return <CategoryManager initialCategories={categoriesWithCounts} />;
}
