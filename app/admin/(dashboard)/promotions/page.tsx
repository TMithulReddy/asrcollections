import { createClient } from "@/utils/supabase/server";
import PromotionManager from "@/components/admin/PromotionManager";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const supabase = createClient();

  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .order("name", { ascending: true });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("display_order", { ascending: true });

  return (
    <PromotionManager
      initialPromotions={promotions || []}
      categories={categories || []}
    />
  );
}
