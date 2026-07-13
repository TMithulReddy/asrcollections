"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface BannerData {
  title: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}

export async function createBanner(data: BannerData) {
  const supabase = createClient();

  const { error } = await supabase.from("banners").insert({
    title: data.title.trim(),
    image_url: data.image_url.trim(),
    link_url: data.link_url?.trim() || null,
    display_order: data.display_order,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    active: data.active,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/banners");
  return { success: true, error: null };
}

export async function updateBanner(id: string, data: BannerData) {
  const supabase = createClient();

  const { error } = await supabase
    .from("banners")
    .update({
      title: data.title.trim(),
      image_url: data.image_url.trim(),
      link_url: data.link_url?.trim() || null,
      display_order: data.display_order,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      active: data.active,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/banners");
  return { success: true, error: null };
}

export async function deleteBanner(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("banners").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/banners");
  return { success: true, error: null };
}
