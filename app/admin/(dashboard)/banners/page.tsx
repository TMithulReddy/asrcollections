import { createClient } from "@/utils/supabase/server";
import BannerManager from "@/components/admin/BannerManager";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const supabase = createClient();

  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("display_order", { ascending: true });

  return <BannerManager initialBanners={banners || []} />;
}
